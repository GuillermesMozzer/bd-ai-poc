import { tokenBrand, tokenError, tokenWarning, tokenSuccess, tokenInfo, tokenNeutral, tokenText, tokenCommon, workstationVisuals, workstationChartSemantic, workstationPriorityTone, workstationSqdcpTone } from '../theme';
export type LossFocusedMetricId =
  | 'breakdown'
  | 'changeover'
  | 'scrap'
  | 'program-adherence'
  | 'micro-stops'
  | 'speed-loss';
export type LossFocusedPeriod = 'day' | 'shift' | 'week';
export type LossFocusedShiftFilter = 'All Shifts' | 'Shift A' | 'Shift B' | 'Shift C';
export type LossFocusedDateFilter = 'Today' | 'Yesterday' | '1 Week' | '1 Month';
export type LossActionStatus = 'Open' | 'In Progress' | 'Review';

export type LossFocusedAction = {
  id: string;
  metricId: LossFocusedMetricId;
  shortLabel: string;
  title: string;
  owner: string;
  dueLabel: string;
  status: LossActionStatus;
  tone: string;
};

export type LossFocusedPeriodData = {
  average: number;
  target: number;
  summaryMinutes: number;
  trendPoints: number[];
  detailLabels: string[];
  detailValues: number[];
  lineLabels: string[];
  linePoints: number[];
  lineMarkerTones: Array<'good' | 'bad'>;
};

export type LossFocusedMetricDefinition = {
  id: LossFocusedMetricId;
  title: string;
  subtitle: string;
  accent: string;
  targetAccent: string;
  periods: Record<LossFocusedPeriod, LossFocusedPeriodData>;
};

export const lossFocusedPeriods: Array<{id: LossFocusedPeriod; label: string}> = [
  {id: 'day', label: 'DAY'},
  {id: 'shift', label: 'SHIFT'},
  {id: 'week', label: 'WEEK'},
];

export const lossFocusedShiftFilters: LossFocusedShiftFilter[] = [
  'All Shifts',
  'Shift A',
  'Shift B',
  'Shift C',
];

export const lossFocusedDateFilters: LossFocusedDateFilter[] = [
  'Today',
  'Yesterday',
  '1 Week',
  '1 Month',
];

export const lossFocusedDefaultMetricIds: LossFocusedMetricId[] = ['breakdown', 'changeover', 'scrap'];

export const lossFocusedSuggestedMetricIds: LossFocusedMetricId[] = [
  'scrap',
  'program-adherence',
  'micro-stops',
  'speed-loss',
];

export const lossFocusedMetricCatalogOrder: LossFocusedMetricId[] = [
  ...lossFocusedDefaultMetricIds,
  ...lossFocusedSuggestedMetricIds,
];

export const lossFocusedMetricOptions = [
  {id: 'breakdown', label: 'Breakdown'},
  {id: 'changeover', label: 'Changeover'},
  {id: 'scrap', label: 'Scrap'},
  {id: 'program-adherence', label: 'Program Adherence'},
  {id: 'micro-stops', label: 'Micro Stops'},
  {id: 'speed-loss', label: 'Speed Loss'},
] as const satisfies ReadonlyArray<{id: LossFocusedMetricId; label: string}>;

export const suggestedLossFocusedKpis = [
  ...lossFocusedMetricOptions,
] as const satisfies ReadonlyArray<{id: LossFocusedMetricId; label: string}>;

export const lossFocusedActions: LossFocusedAction[] = [
  {
    id: 'loss-action-1',
    metricId: 'breakdown',
    shortLabel: 'B',
    title: 'Inspect filler jam root cause',
    owner: 'John R.',
    dueLabel: 'Due Today',
    status: 'Open',
    tone: tokenError.light,
  },
  {
    id: 'loss-action-2',
    metricId: 'changeover',
    shortLabel: 'C/O',
    title: 'Reduce changeover prep delay',
    owner: 'Sarah K.',
    dueLabel: 'Due May 28',
    status: 'In Progress',
    tone: tokenWarning.dark,
  },
  {
    id: 'loss-action-3',
    metricId: 'scrap',
    shortLabel: 'S',
    title: 'Review scrap spikes on Line 2',
    owner: 'Miguel A.',
    dueLabel: 'Due May 30',
    status: 'Open',
    tone: tokenError.darker,
  },
  {
    id: 'loss-action-4',
    metricId: 'changeover',
    shortLabel: 'C/O',
    title: 'Standardize cart staging before startup',
    owner: 'Elena P.',
    dueLabel: 'Due Jun 01',
    status: 'Open',
    tone: tokenWarning.dark,
  },
  {
    id: 'loss-action-5',
    metricId: 'speed-loss',
    shortLabel: 'SL',
    title: 'Tune filler speed after warmup window',
    owner: 'Priya N.',
    dueLabel: 'Due Jun 03',
    status: 'Review',
    tone: tokenBrand.lighter,
  },
];

export const lossFocusedKpiDefinitions: Record<LossFocusedMetricId, LossFocusedMetricDefinition> = {
  breakdown: {
    id: 'breakdown',
    title: 'BREAKDOWN',
    subtitle: '% of time lost',
    accent: tokenError.main,
    targetAccent: tokenBrand.main,
    periods: {
      day: {
        average: 18.6,
        target: 10,
        summaryMinutes: 328,
        trendPoints: [20.4, 19.6, 18.9, 19.5, 18.1, 17.3, 16.9, 18.6],
        detailLabels: ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11'],
        detailValues: [21, 18, 16, 12, 15, 22, 31, 8, 7, 6, 6, 7],
        lineLabels: ['00', '03', '06', '09', '12', '15', '18', '21', '00'],
        linePoints: [242, 278, 266, 254, 210, 188, 224, 286, 264],
        lineMarkerTones: ['good', 'bad', 'bad', 'good', 'good', 'good', 'bad', 'bad', 'good'],
      },
      shift: {
        average: 14.2,
        target: 10,
        summaryMinutes: 184,
        trendPoints: [16.6, 15.8, 15.1, 14.7, 13.9, 13.4, 13.8, 14.2],
        detailLabels: ['06', '07', '08', '09', '10', '11', '12', '13'],
        detailValues: [17, 15, 14, 12, 10, 11, 16, 18],
        lineLabels: ['06', '07', '08', '09', '10', '11', '12', '13', '14'],
        linePoints: [164, 176, 188, 172, 149, 158, 170, 181, 184],
        lineMarkerTones: ['good', 'bad', 'bad', 'good', 'good', 'good', 'bad', 'bad', 'good'],
      },
      week: {
        average: 16.1,
        target: 10,
        summaryMinutes: 1208,
        trendPoints: [15.2, 14.8, 15.6, 16.7, 17.8, 16.9, 15.7, 16.1],
        detailLabels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        detailValues: [14, 15, 17, 21, 18, 12, 16],
        lineLabels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        linePoints: [1098, 1126, 1180, 1244, 1212, 1140, 1208],
        lineMarkerTones: ['good', 'good', 'bad', 'bad', 'bad', 'good', 'good'],
      },
    },
  },
  changeover: {
    id: 'changeover',
    title: 'CHANGEOVER',
    subtitle: '% of time lost',
    accent: tokenError.light,
    targetAccent: tokenBrand.main,
    periods: {
      day: {
        average: 9.3,
        target: 8,
        summaryMinutes: 244,
        trendPoints: [11.8, 11.1, 10.6, 10.4, 9.9, 9.5, 9.2, 9.3],
        detailLabels: ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11'],
        detailValues: [12, 11, 13, 10, 9, 11, 9, 6, 5, 4, 4, 5],
        lineLabels: ['00', '03', '06', '09', '12', '15', '18', '21', '00'],
        linePoints: [184, 244, 238, 232, 226, 188, 204, 246, 244],
        lineMarkerTones: ['good', 'bad', 'bad', 'good', 'good', 'good', 'good', 'bad', 'good'],
      },
      shift: {
        average: 7.8,
        target: 8,
        summaryMinutes: 132,
        trendPoints: [8.6, 8.4, 8.1, 7.8, 7.4, 7.1, 7.5, 7.8],
        detailLabels: ['06', '07', '08', '09', '10', '11', '12', '13'],
        detailValues: [9, 8, 7, 7, 6, 6, 8, 9],
        lineLabels: ['06', '07', '08', '09', '10', '11', '12', '13', '14'],
        linePoints: [126, 134, 139, 128, 119, 114, 122, 130, 132],
        lineMarkerTones: ['good', 'bad', 'bad', 'good', 'good', 'good', 'good', 'bad', 'good'],
      },
      week: {
        average: 8.7,
        target: 8,
        summaryMinutes: 918,
        trendPoints: [8.1, 8.4, 8.8, 9.2, 9.5, 8.9, 8.5, 8.7],
        detailLabels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        detailValues: [8, 9, 10, 11, 9, 7, 8],
        lineLabels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        linePoints: [842, 874, 901, 952, 938, 887, 918],
        lineMarkerTones: ['good', 'good', 'bad', 'bad', 'bad', 'good', 'good'],
      },
    },
  },
  scrap: {
    id: 'scrap',
    title: 'SCRAP',
    subtitle: '% of scrapped parts',
    accent: tokenError.darker,
    targetAccent: tokenBrand.main,
    periods: {
      day: {
        average: 4.2,
        target: 3,
        summaryMinutes: 96,
        trendPoints: [5.1, 4.9, 4.7, 4.5, 4.4, 4.3, 4.1, 4.2],
        detailLabels: ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11'],
        detailValues: [6.2, 6.8, 7.1, 6.5, 5.9, 4.8, 3.9, 2.6, 2.2, 1.7, 1.3, 1.6],
        lineLabels: ['00', '03', '06', '09', '12', '15', '18', '21', '00'],
        linePoints: [98, 104, 112, 109, 96, 82, 74, 88, 96],
        lineMarkerTones: ['bad', 'bad', 'bad', 'bad', 'good', 'good', 'good', 'good', 'good'],
      },
      shift: {
        average: 3.4,
        target: 3,
        summaryMinutes: 64,
        trendPoints: [3.9, 3.8, 3.6, 3.4, 3.2, 3.1, 3.3, 3.4],
        detailLabels: ['06', '07', '08', '09', '10', '11', '12', '13'],
        detailValues: [4.8, 4.3, 4.1, 3.7, 3.2, 2.8, 2.6, 3.0],
        lineLabels: ['06', '07', '08', '09', '10', '11', '12', '13', '14'],
        linePoints: [72, 74, 76, 68, 62, 58, 54, 59, 64],
        lineMarkerTones: ['bad', 'bad', 'bad', 'good', 'good', 'good', 'good', 'good', 'good'],
      },
      week: {
        average: 3.9,
        target: 3,
        summaryMinutes: 412,
        trendPoints: [4.6, 4.4, 4.3, 4.1, 3.8, 3.6, 3.7, 3.9],
        detailLabels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        detailValues: [5.2, 5.4, 5.1, 4.7, 3.9, 3.3, 3.6],
        lineLabels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        linePoints: [436, 428, 421, 414, 398, 372, 412],
        lineMarkerTones: ['bad', 'bad', 'bad', 'bad', 'good', 'good', 'good'],
      },
    },
  },
  'program-adherence': {
    id: 'program-adherence',
    title: 'PROGRAM ADHERENCE',
    subtitle: '% of plan missed',
    accent: tokenBrand.main,
    targetAccent: tokenBrand.main,
    periods: {
      day: {
        average: 6.8,
        target: 4,
        summaryMinutes: 118,
        trendPoints: [8.4, 7.9, 7.4, 7.2, 6.9, 6.5, 6.6, 6.8],
        detailLabels: ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11'],
        detailValues: [8.2, 7.9, 7.4, 7.2, 6.6, 6.3, 5.8, 4.9, 4.2, 3.8, 4.1, 4.6],
        lineLabels: ['00', '03', '06', '09', '12', '15', '18', '21', '00'],
        linePoints: [126, 132, 128, 121, 110, 104, 99, 112, 118],
        lineMarkerTones: ['bad', 'bad', 'bad', 'bad', 'good', 'good', 'good', 'good', 'good'],
      },
      shift: {
        average: 5.1,
        target: 4,
        summaryMinutes: 84,
        trendPoints: [6.1, 5.8, 5.5, 5.2, 5.0, 4.8, 4.9, 5.1],
        detailLabels: ['06', '07', '08', '09', '10', '11', '12', '13'],
        detailValues: [6.3, 5.9, 5.4, 5.1, 4.7, 4.5, 4.6, 5.0],
        lineLabels: ['06', '07', '08', '09', '10', '11', '12', '13', '14'],
        linePoints: [82, 87, 84, 79, 73, 68, 71, 77, 84],
        lineMarkerTones: ['bad', 'bad', 'bad', 'good', 'good', 'good', 'good', 'good', 'good'],
      },
      week: {
        average: 5.6,
        target: 4,
        summaryMinutes: 508,
        trendPoints: [6.2, 6.0, 5.9, 5.7, 5.5, 5.2, 5.4, 5.6],
        detailLabels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        detailValues: [6.4, 6.1, 5.8, 5.4, 5.1, 4.8, 5.6],
        lineLabels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        linePoints: [534, 528, 516, 508, 496, 472, 508],
        lineMarkerTones: ['bad', 'bad', 'bad', 'bad', 'good', 'good', 'good'],
      },
    },
  },
  'micro-stops': {
    id: 'micro-stops',
    title: 'MICRO STOPS',
    subtitle: '% of time lost',
    accent: tokenSuccess.darker,
    targetAccent: tokenBrand.main,
    periods: {
      day: {
        average: 3.7,
        target: 5,
        summaryMinutes: 84,
        trendPoints: [5.3, 4.9, 4.5, 3.8, 3.6, 4.1, 4.2, 3.7],
        detailLabels: ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11'],
        detailValues: [5.3, 4.9, 4.5, 3.8, 3.6, 4.1, 4.2, 2.4, 2.0, 1.6, 1.5, 1.3],
        lineLabels: ['00', '03', '06', '09', '12', '15', '18', '21', '00'],
        linePoints: [92, 88, 84, 76, 68, 72, 74, 79, 84],
        lineMarkerTones: ['bad', 'good', 'good', 'good', 'good', 'good', 'good', 'good', 'good'],
      },
      shift: {
        average: 3.1,
        target: 5,
        summaryMinutes: 58,
        trendPoints: [4.1, 3.9, 3.5, 3.2, 2.9, 2.8, 3.0, 3.1],
        detailLabels: ['06', '07', '08', '09', '10', '11', '12', '13'],
        detailValues: [4.2, 3.8, 3.5, 3.1, 2.8, 2.6, 2.7, 3.1],
        lineLabels: ['06', '07', '08', '09', '10', '11', '12', '13', '14'],
        linePoints: [61, 64, 62, 57, 51, 49, 53, 56, 58],
        lineMarkerTones: ['good', 'good', 'good', 'good', 'good', 'good', 'good', 'good', 'good'],
      },
      week: {
        average: 3.4,
        target: 5,
        summaryMinutes: 368,
        trendPoints: [4.0, 3.8, 3.6, 3.4, 3.2, 3.0, 3.1, 3.4],
        detailLabels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        detailValues: [4.3, 3.9, 3.7, 3.2, 3.0, 2.8, 3.4],
        lineLabels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        linePoints: [381, 374, 368, 356, 348, 336, 368],
        lineMarkerTones: ['good', 'good', 'good', 'good', 'good', 'good', 'good'],
      },
    },
  },
  'speed-loss': {
    id: 'speed-loss',
    title: 'SPEED LOSS',
    subtitle: '% of time lost',
    accent: tokenBrand.lighter,
    targetAccent: tokenBrand.main,
    periods: {
      day: {
        average: 6.1,
        target: 5,
        summaryMinutes: 154,
        trendPoints: [8.1, 7.6, 7.4, 6.1, 5.5, 6.3, 6.8, 6.1],
        detailLabels: ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11'],
        detailValues: [8.1, 7.6, 7.4, 6.1, 5.5, 6.3, 6.8, 4.3, 3.9, 3.2, 2.8, 2.5],
        lineLabels: ['00', '03', '06', '09', '12', '15', '18', '21', '00'],
        linePoints: [168, 161, 158, 149, 138, 142, 151, 157, 154],
        lineMarkerTones: ['bad', 'bad', 'bad', 'bad', 'good', 'good', 'good', 'bad', 'bad'],
      },
      shift: {
        average: 5.4,
        target: 5,
        summaryMinutes: 110,
        trendPoints: [6.4, 6.1, 5.9, 5.6, 5.3, 5.1, 5.2, 5.4],
        detailLabels: ['06', '07', '08', '09', '10', '11', '12', '13'],
        detailValues: [6.6, 6.2, 5.8, 5.4, 5.1, 4.7, 4.9, 5.4],
        lineLabels: ['06', '07', '08', '09', '10', '11', '12', '13', '14'],
        linePoints: [118, 122, 120, 114, 108, 102, 104, 109, 110],
        lineMarkerTones: ['bad', 'bad', 'bad', 'bad', 'good', 'good', 'good', 'bad', 'bad'],
      },
      week: {
        average: 5.8,
        target: 5,
        summaryMinutes: 644,
        trendPoints: [6.6, 6.3, 6.1, 5.8, 5.5, 5.2, 5.4, 5.8],
        detailLabels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        detailValues: [6.8, 6.4, 6.2, 5.9, 5.6, 5.1, 5.8],
        lineLabels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        linePoints: [682, 671, 658, 641, 624, 602, 644],
        lineMarkerTones: ['bad', 'bad', 'bad', 'bad', 'good', 'good', 'bad'],
      },
    },
  },
};

export function formatLossPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

export function formatLossMinutes(value: number) {
  return `${value} Mins`;
}
