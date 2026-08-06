import type {ReactNode} from 'react';
import {useEffect, useRef, useState} from 'react';
import {
  Box,
  Button,
  Checkbox,
  Chip,
  MenuItem,
  Paper,
  Select,
  Typography,
} from '@mui/material';
import {
  AccessTime as TimeIcon,
  Analytics as AnalyticsIcon,
  Apartment as OfficeIcon,
  AcUnit as HvacIcon,
  AutoAwesome as SparkleIcon,
  Bolt as EnergyIcon,
  Business as BusinessIcon,
  CalendarMonth as CalendarIcon,
  Close as CloseIcon,
  Factory as ManufacturingIcon,
  EmojiEvents as TrophyIcon,
  Groups as PeopleIcon,
  Inventory2 as InventoryIcon,
  LocalShipping as DeliveryIcon,
  Paid as CostIcon,
  PlayArrow as PlayArrowIcon,
  Public as GlobeIcon,
  SettingsSuggest as ActionIcon,
  ShieldOutlined as SafetyIcon,
  Warehouse as DistributionIcon,
  WorkspacePremium as QualityIcon,
} from '@mui/icons-material';

const globalMapSources = [
  '/images/Global%20Map.png',
  '/images/reference.png',
  '/images/world-map.png',
];
const globalMapReferenceWidth = 1672;
const globalMapReferenceHeight = 941;

type SiteTone = 'excellent' | 'good' | 'warning' | 'issue';
type SiteRegion = 'Americas' | 'Europe' | 'Asia Pacific' | 'Africa';
type RegionFilter = 'All Sites' | 'Americas' | 'Europe' | 'Asia Pacific';
type FacilityType = 'All Facilities' | 'Manufacturing Sites' | 'Distribution Centers' | 'Office Buildings';
type MapViewMode = 'Markers' | 'Heatmap' | 'Flow';
type MetricKey = 'OEE' | 'Safety' | 'Quality' | 'Delivery' | 'Cost' | 'People';
type DistributionKpiKey = 'OTIF' | 'Shipments' | 'Inventory' | 'Labor productivity' | 'Quality / damage' | 'Alerts';
type OfficeKpiKey = 'Building Health' | 'Space Utilization' | 'People on Site' | 'Energy Usage' | 'Utility Health' | 'Active Alarms';
type GlobalKpiKey = MetricKey | DistributionKpiKey | OfficeKpiKey;
type SiteMetrics = Record<MetricKey, number>;
type DistributionMetrics = Record<DistributionKpiKey, number>;
type OfficeMetrics = Record<OfficeKpiKey, number>;

type GlobalSite = {
  name: string;
  oee: number;
  metrics: SiteMetrics;
  left: string;
  top: string;
  tone: SiteTone;
  region: SiteRegion;
  facilityType?: Exclude<FacilityType, 'All Facilities'>;
  distributionMetrics?: DistributionMetrics;
  officeMetrics?: OfficeMetrics;
  labelOffsetX?: number;
  labelOffsetY?: number;
};

type MapCoverBounds = {
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
  containerWidth: number;
  containerHeight: number;
};

type TrendSite = {
  name: string;
  metricValue: number;
  metricText: string;
  color: string;
  region: SiteRegion;
  trend: number[];
};

type KpiCard = {
  label: ReactNode;
  value: string;
  delta: string;
  tone: string;
  trend: number[];
};

type BenchmarkMetricRow = {
  benchmarkValues: Array<{siteName: string; text: string; value: number}>;
  definition: ReturnType<typeof getMetricDefinition>;
  metric: GlobalKpiKey;
  primaryText: string;
  primaryValue: number;
  topSiteName: string;
  topText: string;
  topValue: number;
};

type BenchmarkResult = {
  bestBenchmarkSiteName: string;
  gapText: string;
  gapUnit: string;
  insightTexts: string[];
  primarySite: GlobalSite;
  recommendationTexts: string[];
  rows: BenchmarkMetricRow[];
};

const benchmarkTimePeriods = ['Last 24 Hours', 'Last 7 Days', 'Last 30 Days', 'Current Quarter'] as const;

type HoverSummaryMetricCard = {
  bars: number[] | null;
  details: Array<[string, string]>;
  icon: ReactNode;
  label: string;
  metric: string;
  target: string;
  trend: number[] | null;
  trendColor: string;
  value: string;
  valueColor: string;
};

type FlowRouteSeverity = 'normal' | 'constrained' | 'critical';

type FlowRoute = {
  id: string;
  from: string;
  to: string;
  severity: FlowRouteSeverity;
  curvature: number;
  detail: string;
  insight: string;
};

type FlowInsight = {
  title: string;
  detail: string;
  tone: string;
};

type AiTourStop = {
  siteName: string;
  badge: string;
  badgeTone: string;
  metricText: string;
  progressNote: string;
  insightLines: string[];
  closingLine: string;
  viewport?: {
    focusLeftPercent: number;
    focusTopPercent: number;
    zoomScale: number;
  };
};

const siteToneMap: Record<SiteTone, {color: string; glow: string; label: string}> = {
  excellent: {color: '#67E86B', glow: 'rgba(103, 232, 107, 0.30)', label: 'Excellent'},
  good: {color: '#FFB33B', glow: 'rgba(255, 179, 59, 0.30)', label: 'Good'},
  warning: {color: '#FF8A2B', glow: 'rgba(255, 138, 43, 0.28)', label: 'Warning'},
  issue: {color: '#FF4545', glow: 'rgba(255, 69, 69, 0.34)', label: 'Issue'},
};

const metricDefinitions: Record<MetricKey, {
  label: string;
  highIsBetter: boolean;
  formatValue: (value: number) => string;
  mapValueLabel: (value: number) => string;
}> = {
  OEE: {
    label: 'OEE',
    highIsBetter: true,
    formatValue: (value) => `${value}%`,
    mapValueLabel: (value) => `OEE ${value}%`,
  },
  Safety: {
    label: 'Incidents',
    highIsBetter: false,
    formatValue: (value) => `${value}`,
    mapValueLabel: (value) => `Incidents ${value}`,
  },
  Quality: {
    label: 'Non-conformities',
    highIsBetter: false,
    formatValue: (value) => `${value}`,
    mapValueLabel: (value) => `NC ${value}`,
  },
  Delivery: {
    label: 'Production vs Target',
    highIsBetter: true,
    formatValue: (value) => `${value}%`,
    mapValueLabel: (value) => `Target ${value}%`,
  },
  Cost: {
    label: 'Scrap Cost',
    highIsBetter: false,
    formatValue: (value) => `$${value}k`,
    mapValueLabel: (value) => `Scrap $${value}k`,
  },
  People: {
    label: 'Absenteeism',
    highIsBetter: false,
    formatValue: (value) => `${value.toFixed(1)}%`,
    mapValueLabel: (value) => `Absent ${value.toFixed(1)}%`,
  },
};

const distributionMetricDefinitions: Record<DistributionKpiKey, {
  label: string;
  highIsBetter: boolean;
  formatValue: (value: number) => string;
  mapValueLabel: (value: number) => string;
}> = {
  OTIF: {
    label: 'OTIF Performance',
    highIsBetter: true,
    formatValue: (value) => `${value.toFixed(1)}%`,
    mapValueLabel: (value) => `OTIF ${value.toFixed(1)}%`,
  },
  Shipments: {
    label: 'Cases Shipped',
    highIsBetter: true,
    formatValue: (value) => `${value.toLocaleString()} cases`,
    mapValueLabel: (value) => `${Math.round(value / 1000)}K cases`,
  },
  Inventory: {
    label: 'Inventory Accuracy',
    highIsBetter: true,
    formatValue: (value) => `${value.toFixed(1)}%`,
    mapValueLabel: (value) => `Inv ${value.toFixed(1)}%`,
  },
  'Labor productivity': {
    label: 'Cases per Paid Hour',
    highIsBetter: true,
    formatValue: (value) => `${value.toFixed(1)}`,
    mapValueLabel: (value) => `CPH ${value.toFixed(1)}`,
  },
  'Quality / damage': {
    label: 'Warehouse Damage',
    highIsBetter: false,
    formatValue: (value) => `${value.toFixed(1)}%`,
    mapValueLabel: (value) => `Damage ${value.toFixed(1)}%`,
  },
  Alerts: {
    label: 'Active Alerts',
    highIsBetter: false,
    formatValue: (value) => `${value}`,
    mapValueLabel: (value) => `Alerts ${value}`,
  },
};

const officeMetricDefinitions: Record<OfficeKpiKey, {
  label: string;
  highIsBetter: boolean;
  formatValue: (value: number) => string;
  mapValueLabel: (value: number) => string;
}> = {
  'Building Health': {
    label: 'Building Health',
    highIsBetter: true,
    formatValue: (value) => `${value}%`,
    mapValueLabel: (value) => `Health ${value}%`,
  },
  'Space Utilization': {
    label: 'Space Utilization',
    highIsBetter: true,
    formatValue: (value) => `${value}%`,
    mapValueLabel: (value) => `Space ${value}%`,
  },
  'People on Site': {
    label: 'People on Site',
    highIsBetter: true,
    formatValue: (value) => `${value.toLocaleString()} people`,
    mapValueLabel: (value) => `${value.toLocaleString()} people`,
  },
  'Energy Usage': {
    label: 'Energy Usage',
    highIsBetter: false,
    formatValue: (value) => `${value.toFixed(1)} MWh`,
    mapValueLabel: (value) => `${value.toFixed(1)} MWh`,
  },
  'Utility Health': {
    label: 'Utility Health',
    highIsBetter: true,
    formatValue: (value) => `${value}%`,
    mapValueLabel: (value) => `Utility ${value}%`,
  },
  'Active Alarms': {
    label: 'Active Alarms',
    highIsBetter: false,
    formatValue: (value) => `${value}`,
    mapValueLabel: (value) => `Alarms ${value}`,
  },
};

// Approved baseline positions from the reference layouts shared on 2026-05-05.
// Manufacturing coordinates are also reused by "All Facilities" for those same sites.
const defaultGlobalSites: GlobalSite[] = [
  {name: 'Sandy', oee: 89, metrics: {OEE: 89, Safety: 1, Quality: 3, Delivery: 98, Cost: 12, People: 1.8}, left: '12.6%', top: '36.4%', tone: 'excellent', region: 'Americas', labelOffsetX: 34, labelOffsetY: -20},
  {name: 'El Paso', oee: 86, metrics: {OEE: 86, Safety: 2, Quality: 4, Delivery: 96, Cost: 15, People: 2.1}, left: '15.4%', top: '42.7%', tone: 'excellent', region: 'Americas', labelOffsetX: 34, labelOffsetY: -18},
  {name: 'Tijuana', oee: 84, metrics: {OEE: 84, Safety: 3, Quality: 5, Delivery: 94, Cost: 18, People: 2.4}, left: '14.8%', top: '48.1%', tone: 'excellent', region: 'Americas', labelOffsetX: -92, labelOffsetY: -12},
  {name: 'Cuautitlan', oee: 83, metrics: {OEE: 83, Safety: 4, Quality: 6, Delivery: 92, Cost: 19, People: 2.7}, left: '16.9%', top: '51.1%', tone: 'excellent', region: 'Americas', labelOffsetX: -80, labelOffsetY: 18},
  {name: 'Humacao', oee: 88, metrics: {OEE: 88, Safety: 2, Quality: 3, Delivery: 97, Cost: 13, People: 1.9}, left: '24.9%', top: '53.0%', tone: 'excellent', region: 'Americas', labelOffsetX: 28, labelOffsetY: -16},
  {name: 'Columbus West', oee: 72, metrics: {OEE: 72, Safety: 9, Quality: 15, Delivery: 81, Cost: 42, People: 6.8}, left: '20.5%', top: '38.0%', tone: 'issue', region: 'Americas', labelOffsetX: 16, labelOffsetY: -18},
  {name: 'Columbus East', oee: 79, metrics: {OEE: 79, Safety: 5, Quality: 7, Delivery: 89, Cost: 24, People: 3.4}, left: '20.7%', top: '42.8%', tone: 'excellent', region: 'Americas', labelOffsetX: 18, labelOffsetY: -8},
  {name: 'Juiz de Fora', oee: 74, metrics: {OEE: 74, Safety: 8, Quality: 12, Delivery: 84, Cost: 36, People: 5.9}, left: '33.9%', top: '72.5%', tone: 'issue', region: 'Americas', labelOffsetX: 28, labelOffsetY: -16},
  {name: 'Plymouth', oee: 78, metrics: {OEE: 78, Safety: 5, Quality: 8, Delivery: 88, Cost: 26, People: 3.8}, left: '46.3%', top: '28.6%', tone: 'good', region: 'Europe', labelOffsetX: -98, labelOffsetY: -26},
  {name: 'Le Pont-de-Claix', oee: 77, metrics: {OEE: 77, Safety: 7, Quality: 10, Delivery: 86, Cost: 32, People: 4.7}, left: '48.0%', top: '33.0%', tone: 'good', region: 'Europe', labelOffsetX: -42, labelOffsetY: 20},
  {name: 'Fraga', oee: 75, metrics: {OEE: 75, Safety: 9, Quality: 11, Delivery: 85, Cost: 34, People: 5.1}, left: '45.6%', top: '38.9%', tone: 'issue', region: 'Europe', labelOffsetX: -92, labelOffsetY: -12},
  {name: 'Tatabanya', oee: 81, metrics: {OEE: 81, Safety: 4, Quality: 6, Delivery: 90, Cost: 21, People: 3.1}, left: '54.4%', top: '34.9%', tone: 'excellent', region: 'Europe', labelOffsetX: 20, labelOffsetY: -24},
  {name: 'Shanghai', oee: 82, metrics: {OEE: 82, Safety: 3, Quality: 5, Delivery: 93, Cost: 20, People: 2.6}, left: '82.3%', top: '43.1%', tone: 'excellent', region: 'Asia Pacific', labelOffsetX: 24, labelOffsetY: -14},
  {name: 'Tuas', oee: 87, metrics: {OEE: 87, Safety: 2, Quality: 4, Delivery: 97, Cost: 14, People: 2.0}, left: '76.8%', top: '65.0%', tone: 'excellent', region: 'Asia Pacific', labelOffsetX: 26, labelOffsetY: -14},
  {name: 'Kulim', oee: 85, metrics: {OEE: 85, Safety: 3, Quality: 5, Delivery: 95, Cost: 17, People: 2.3}, left: '75.7%', top: '59.2%', tone: 'excellent', region: 'Asia Pacific', labelOffsetX: 24, labelOffsetY: -16},
  {name: 'Four Oaks', oee: 77, metrics: {OEE: 77, Safety: 4, Quality: 9, Delivery: 90, Cost: 28, People: 4.4}, distributionMetrics: {OTIF: 96.8, Shipments: 48200, Inventory: 98.6, 'Labor productivity': 41.2, 'Quality / damage': 1.9, Alerts: 7}, left: '24.6%', top: '37.3%', tone: 'issue', region: 'Americas', facilityType: 'Distribution Centers', labelOffsetX: 34, labelOffsetY: -16},
  {name: 'Redlands', oee: 84, metrics: {OEE: 84, Safety: 2, Quality: 4, Delivery: 96, Cost: 17, People: 2.5}, distributionMetrics: {OTIF: 99.1, Shipments: 37600, Inventory: 99.4, 'Labor productivity': 47.6, 'Quality / damage': 0.7, Alerts: 2}, left: '13.1%', top: '41.5%', tone: 'excellent', region: 'Americas', facilityType: 'Distribution Centers', labelOffsetX: -100, labelOffsetY: -24},
  {name: 'Plainfield', oee: 81, metrics: {OEE: 81, Safety: 3, Quality: 6, Delivery: 93, Cost: 21, People: 3.1}, distributionMetrics: {OTIF: 97.9, Shipments: 42500, Inventory: 98.9, 'Labor productivity': 44.8, 'Quality / damage': 1.2, Alerts: 4}, left: '23.2%', top: '41.4%', tone: 'warning', region: 'Americas', facilityType: 'Distribution Centers', labelOffsetX: 32, labelOffsetY: -16},
  {name: 'Temse', oee: 83, metrics: {OEE: 83, Safety: 2, Quality: 5, Delivery: 95, Cost: 19, People: 2.8}, distributionMetrics: {OTIF: 98.8, Shipments: 31800, Inventory: 99.2, 'Labor productivity': 46.4, 'Quality / damage': 0.9, Alerts: 3}, left: '48.7%', top: '29.3%', tone: 'excellent', region: 'Europe', facilityType: 'Distribution Centers', labelOffsetX: -28, labelOffsetY: -66},
  {name: 'Franklin Lakes', oee: 76, metrics: {OEE: 76, Safety: 5, Quality: 8, Delivery: 88, Cost: 27, People: 4.8}, officeMetrics: {'Building Health': 78, 'Space Utilization': 80, 'People on Site': 1240, 'Energy Usage': 18.4, 'Utility Health': 94, 'Active Alarms': 7}, left: '25.9%', top: '36.8%', tone: 'issue', region: 'Americas', facilityType: 'Office Buildings', labelOffsetX: 18, labelOffsetY: -16},
  {name: 'Irvine', oee: 85, metrics: {OEE: 85, Safety: 2, Quality: 4, Delivery: 95, Cost: 16, People: 2.2}, officeMetrics: {'Building Health': 91, 'Space Utilization': 86, 'People on Site': 820, 'Energy Usage': 12.7, 'Utility Health': 97, 'Active Alarms': 2}, left: '13.3%', top: '44.8%', tone: 'excellent', region: 'Americas', facilityType: 'Office Buildings', labelOffsetX: -100, labelOffsetY: -10},
  {name: 'Eysins', oee: 82, metrics: {OEE: 82, Safety: 3, Quality: 5, Delivery: 92, Cost: 20, People: 2.9}, officeMetrics: {'Building Health': 88, 'Space Utilization': 83, 'People on Site': 640, 'Energy Usage': 9.8, 'Utility Health': 96, 'Active Alarms': 3}, left: '49.5%', top: '40.6%', tone: 'good', region: 'Europe', facilityType: 'Office Buildings', labelOffsetX: 24, labelOffsetY: -18},
];

const flowSeverityStyles: Record<FlowRouteSeverity, {
  color: string;
  dashArray: string;
  glow: string;
  legend: string;
  particleDuration: string;
}> = {
  normal: {
    color: '#2CE6FF',
    dashArray: '3 7',
    glow: 'rgba(44, 230, 255, 0.34)',
    legend: 'Normal Material Flow',
    particleDuration: '6.6s',
  },
  constrained: {
    color: '#FFB020',
    dashArray: '3 7',
    glow: 'rgba(255, 176, 32, 0.32)',
    legend: 'Constrained Dependency',
    particleDuration: '5.2s',
  },
  critical: {
    color: '#FF4242',
    dashArray: '3 7',
    glow: 'rgba(255, 66, 66, 0.38)',
    legend: 'Critical Dependency',
    particleDuration: '4.1s',
  },
};

const manufacturingFlowRoutes: FlowRoute[] = [
  {
    id: 'columbus-east-columbus-west',
    from: 'Columbus East',
    to: 'Columbus West',
    severity: 'normal',
    curvature: -10,
    detail: 'Local balancing lane',
    insight: 'Columbus East is covering short-cycle components with stable daily rhythm.',
  },
  {
    id: 'sandy-columbus-west',
    from: 'Sandy',
    to: 'Columbus West',
    severity: 'normal',
    curvature: -28,
    detail: 'Domestic support flow',
    insight: 'Sandy is feeding finished material with no current transport instability.',
  },
  {
    id: 'redlands-tijuana',
    from: 'Redlands',
    to: 'Tijuana',
    severity: 'normal',
    curvature: -18,
    detail: 'Cross-border replenishment',
    insight: 'Inventory buffer is healthy and cadence is stable.',
  },
  {
    id: 'tijuana-el-paso',
    from: 'Tijuana',
    to: 'El Paso',
    severity: 'normal',
    curvature: 18,
    detail: 'Packaging support lane',
    insight: 'Rebalancing keeps Texas demand covered without extra freight.',
  },
  {
    id: 'columbus-west-plymouth',
    from: 'Columbus West',
    to: 'Plymouth',
    severity: 'critical',
    curvature: -48,
    detail: 'Emergency resin allocation',
    insight: 'Plymouth is backfilling Columbus West after the Line 4 breakdown.',
  },
  {
    id: 'columbus-west-le-pont',
    from: 'Columbus West',
    to: 'Le Pont-de-Claix',
    severity: 'critical',
    curvature: -26,
    detail: 'Critical packaging dependency',
    insight: 'Packaging film is rerouted from France to sustain North America output.',
  },
  {
    id: 'columbus-west-tuas',
    from: 'Columbus West',
    to: 'Tuas',
    severity: 'critical',
    curvature: 72,
    detail: 'Intercontinental supply line',
    insight: 'The highest-risk lane is spanning APAC to protect customer orders.',
  },
  {
    id: 'columbus-west-juiz',
    from: 'Columbus West',
    to: 'Juiz de Fora',
    severity: 'critical',
    curvature: 42,
    detail: 'South America recovery support',
    insight: 'Brazil is carrying surge volume while Columbus West recovers.',
  },
  {
    id: 'tuas-temse',
    from: 'Tuas',
    to: 'Temse',
    severity: 'normal',
    curvature: -64,
    detail: 'Stable component supply',
    insight: 'Tuas keeps Temse supplied with no open delay signal.',
  },
  {
    id: 'fraga-le-pont',
    from: 'Fraga',
    to: 'Le Pont-de-Claix',
    severity: 'constrained',
    curvature: -18,
    detail: 'Component dependency',
    insight: 'The lane is flowing, but only with reduced flexibility.',
  },
  {
    id: 'kulim-shanghai',
    from: 'Kulim',
    to: 'Shanghai',
    severity: 'constrained',
    curvature: 20,
    detail: 'Lead-time risk on export lane',
    insight: 'Kulim is feeding Shanghai with a narrow lead-time buffer.',
  },
  {
    id: 'kulim-tatabanya',
    from: 'Kulim',
    to: 'Tatabanya',
    severity: 'normal',
    curvature: -36,
    detail: 'APAC to Europe support lane',
    insight: 'Kulim is also supporting Tatabanya through a stable long-haul replenishment cadence.',
  },
  {
    id: 'temse-plymouth',
    from: 'Temse',
    to: 'Plymouth',
    severity: 'normal',
    curvature: -14,
    detail: 'EU replenishment flow',
    insight: 'Temse continues to replenish Plymouth with stable component coverage.',
  },
  {
    id: 'el-paso-columbus-west',
    from: 'El Paso',
    to: 'Columbus West',
    severity: 'normal',
    curvature: 16,
    detail: 'Packaging transfer lane',
    insight: 'El Paso is helping absorb regional packaging demand while Columbus West recovers.',
  },
];

const flowDependencyRows = [
  {route: 'Temse -> Columbus West', detail: 'Critical packaging dependency', severity: 'critical' as const},
  {route: 'Columbus East -> Columbus West', detail: 'Local balancing flow stable', severity: 'normal' as const},
  {route: 'Sandy -> Columbus West', detail: 'Domestic support lane stable', severity: 'normal' as const},
  {route: 'Tuas -> Columbus West', detail: 'Intercontinental support lane', severity: 'critical' as const},
  {route: 'Juiz de Fora -> Columbus West', detail: 'Intercontinental support lane', severity: 'critical' as const},
];

const flowAiInsights: FlowInsight[] = [
  {
    title: 'Columbus West is still the pivot risk',
    detail: 'Most support lanes are protecting the same site, so another slip there will move global flow first.',
    tone: '#FF6B6B',
  },
  {
    title: 'Tuas is the cleanest relief lane',
    detail: 'It remains the healthiest connected site and is carrying the most stable long-haul support.',
    tone: '#FFB020',
  },
];

const aiTourStops: AiTourStop[] = [
  {
    siteName: 'Columbus West',
    badge: 'Critical',
    badgeTone: '#FF5F76',
    metricText: 'OEE 72%',
    progressNote: 'Most critical',
    viewport: {
      focusLeftPercent: 24.8,
      focusTopPercent: 38.5,
      zoomScale: 2.68,
    },
    insightLines: [
      '72% OEE\nLowest performance across manufacturing sites',
      '-12% vs Global Avg\nSignificant output gap',
      'High impact\nQuick wins available',
    ],
    closingLine: 'Let’s start here to drive the biggest impact.',
  },
  {
    siteName: 'Juiz de Fora',
    badge: 'Recovery',
    badgeTone: '#FF8E5A',
    metricText: 'OEE 74%',
    progressNote: 'Regional recovery',
    viewport: {
      focusLeftPercent: 32.4,
      focusTopPercent: 70.8,
      zoomScale: 2.44,
    },
    insightLines: [
      '74% OEE\nSouth America output is still below target',
      'Escalating quality losses\nScrap and rework keep dragging capacity',
      'Fast follow-up needed\nShared actions can unlock the next gain',
    ],
    closingLine: 'This is the next stop to stabilize regional output.',
  },
  {
    siteName: 'Fraga',
    badge: 'Opportunity',
    badgeTone: '#FFB53E',
    metricText: 'OEE 75%',
    progressNote: 'Best next opportunity',
    viewport: {
      focusLeftPercent: 46.4,
      focusTopPercent: 36.2,
      zoomScale: 2.48,
    },
    insightLines: [
      '75% OEE\nPerformance remains below the Europe baseline',
      'Labor and quality pressure\nThe site is running with reduced flexibility',
      'Strong leverage\nA focused intervention can lift the whole region',
    ],
    closingLine: 'Finishing here closes the tour with the next biggest win.',
  },
];

const aiTourTypingPauseUnits = 7;
const aiTourTypingTickMs = 26;
const aiTourViewportZoomScale = 2.18;
const aiTourViewportResetMs = 720;
const aiTourViewportFocusDelayMs = 210;
const aiTourViewportTravelScale = 1.52;
const aiTourViewportApproachScaleFactor = 0.82;
const aiTourViewportApproachProgress = 0.86;
const aiTourViewportBootApproachDelayMs = 110;
const aiTourTransferDurationMs = 1180;

function clampNumber(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

const overlayOptions = [
  {label: 'OEE', icon: <AnalyticsIcon sx={{fontSize: 16}} />},
  {label: 'Safety', icon: <SafetyIcon sx={{fontSize: 16}} />},
  {label: 'Quality', icon: <QualityIcon sx={{fontSize: 16}} />},
  {label: 'Delivery', icon: <DeliveryIcon sx={{fontSize: 16}} />},
  {label: 'Cost', icon: <CostIcon sx={{fontSize: 16}} />},
  {label: 'People', icon: <PeopleIcon sx={{fontSize: 16}} />},
] satisfies Array<{
  icon: ReactNode;
  label: MetricKey;
}>;

const facilityTypeOptions = [
  {
    label: 'All Facilities',
    icon: <BusinessIcon sx={{fontSize: 16}} />,
    markerIcon: null,
  },
  {
    label: 'Manufacturing Sites',
    icon: <ManufacturingIcon sx={{fontSize: 16}} />,
    markerIcon: <ManufacturingIcon sx={{fontSize: 16}} />,
  },
  {
    label: 'Distribution Centers',
    icon: <DistributionIcon sx={{fontSize: 16}} />,
    markerIcon: <DistributionIcon sx={{fontSize: 16}} />,
  },
  {
    label: 'Office Buildings',
    icon: <OfficeIcon sx={{fontSize: 16}} />,
    markerIcon: <OfficeIcon sx={{fontSize: 16}} />,
  },
] satisfies Array<{
  icon: ReactNode;
  label: FacilityType;
  markerIcon: ReactNode | null;
}>;

const distributionKpiOptions = [
  {label: 'OTIF', icon: <SafetyIcon sx={{fontSize: 16}} />},
  {label: 'Shipments', icon: <DeliveryIcon sx={{fontSize: 16}} />},
  {label: 'Inventory', icon: <InventoryIcon sx={{fontSize: 16}} />},
  {label: 'Labor productivity', icon: <PeopleIcon sx={{fontSize: 16}} />},
  {label: 'Quality / damage', icon: <QualityIcon sx={{fontSize: 16}} />},
  {label: 'Alerts', icon: <AnalyticsIcon sx={{fontSize: 16}} />},
] satisfies Array<{
  icon: ReactNode;
  label: DistributionKpiKey;
}>;

const officeKpiOptions = [
  {label: 'Building Health', icon: <OfficeIcon sx={{fontSize: 16}} />},
  {label: 'Space Utilization', icon: <BusinessIcon sx={{fontSize: 16}} />},
  {label: 'People on Site', icon: <PeopleIcon sx={{fontSize: 16}} />},
  {label: 'Energy Usage', icon: <CostIcon sx={{fontSize: 16}} />},
  {label: 'Utility Health', icon: <AnalyticsIcon sx={{fontSize: 16}} />},
  {label: 'Active Alarms', icon: <SafetyIcon sx={{fontSize: 16}} />},
] satisfies Array<{
  icon: ReactNode;
  label: OfficeKpiKey;
}>;

const metricKeySet = new Set<GlobalKpiKey>(overlayOptions.map((option) => option.label as MetricKey));
const distributionKpiKeySet = new Set<GlobalKpiKey>(distributionKpiOptions.map((option) => option.label));
const officeKpiKeySet = new Set<GlobalKpiKey>(officeKpiOptions.map((option) => option.label));

function isMetricKey(value: GlobalKpiKey): value is MetricKey {
  return metricKeySet.has(value);
}

function isDistributionKpiKey(value: GlobalKpiKey): value is DistributionKpiKey {
  return distributionKpiKeySet.has(value);
}

function isOfficeKpiKey(value: GlobalKpiKey): value is OfficeKpiKey {
  return officeKpiKeySet.has(value);
}

function getDefaultKpiForFacility(facilityType: FacilityType): GlobalKpiKey {
  if (facilityType === 'Distribution Centers') return 'OTIF';
  if (facilityType === 'Office Buildings') return 'Building Health';
  return 'OEE';
}

function isKpiAllowedForFacility(kpi: GlobalKpiKey, facilityType: FacilityType) {
  if (facilityType === 'Distribution Centers') return isDistributionKpiKey(kpi);
  if (facilityType === 'Office Buildings') return isOfficeKpiKey(kpi);
  return isMetricKey(kpi);
}

function getMetricDefinition(metric: GlobalKpiKey) {
  if (isDistributionKpiKey(metric)) return distributionMetricDefinitions[metric];
  if (isOfficeKpiKey(metric)) return officeMetricDefinitions[metric];
  return metricDefinitions[metric];
}

function getSiteMetricValue(site: GlobalSite, metric: GlobalKpiKey) {
  if (isDistributionKpiKey(metric)) {
    return site.distributionMetrics?.[metric] ?? 0;
  }

  if (isOfficeKpiKey(metric)) {
    return site.officeMetrics?.[metric] ?? 0;
  }

  return site.metrics[metric];
}

function getSiteFacilityType(site: GlobalSite): Exclude<FacilityType, 'All Facilities'> {
  return site.facilityType ?? 'Manufacturing Sites';
}

function getMapCoverBounds(containerElement: HTMLDivElement | null) {
  if (!containerElement) return null;

  const bounds = containerElement.getBoundingClientRect();
  const scale = Math.max(
    bounds.width / globalMapReferenceWidth,
    bounds.height / globalMapReferenceHeight,
  );
  const imageWidth = globalMapReferenceWidth * scale;
  const imageHeight = globalMapReferenceHeight * scale;

  return {
    offsetX: (bounds.width - imageWidth) / 2,
    offsetY: (bounds.height - imageHeight) / 2,
    width: imageWidth,
    height: imageHeight,
    containerWidth: bounds.width,
    containerHeight: bounds.height,
  };
}

function getSiteMapPoint(
  site: GlobalSite,
  mapBounds: {offsetX: number; offsetY: number; width: number; height: number} | null,
) {
  if (!mapBounds) return null;

  return {
    x: mapBounds.offsetX + (parseFloat(site.left) / 100) * mapBounds.width,
    y: mapBounds.offsetY + (parseFloat(site.top) / 100) * mapBounds.height,
  };
}

function getAiTourViewportFocusPercent(stop: AiTourStop | null, fallbackSite: GlobalSite | null) {
  if (stop?.viewport) {
    return {
      leftPercent: stop.viewport.focusLeftPercent,
      topPercent: stop.viewport.focusTopPercent,
      zoomScale: stop.viewport.zoomScale,
    };
  }

  if (fallbackSite) {
    return {
      leftPercent: parseFloat(fallbackSite.left),
      topPercent: parseFloat(fallbackSite.top),
      zoomScale: aiTourViewportZoomScale,
    };
  }

  return {
    leftPercent: 50,
    topPercent: 50,
    zoomScale: 1,
  };
}

function getAiTourCameraBounds(
  focus: {leftPercent: number; topPercent: number; zoomScale: number},
  mapBounds: MapCoverBounds | null,
) {
  if (!mapBounds) return null;
  if (focus.zoomScale <= 1) return mapBounds;

  const width = mapBounds.width * focus.zoomScale;
  const height = mapBounds.height * focus.zoomScale;
  const unclampedOffsetX = mapBounds.containerWidth * 0.5 - (focus.leftPercent / 100) * width;
  const unclampedOffsetY = mapBounds.containerHeight * 0.5 - (focus.topPercent / 100) * height;

  return {
    ...mapBounds,
    offsetX: clampNumber(unclampedOffsetX, mapBounds.containerWidth - width, 0),
    offsetY: clampNumber(unclampedOffsetY, mapBounds.containerHeight - height, 0),
    width,
    height,
  };
}

function interpolateNumber(fromValue: number, toValue: number, progress: number) {
  return fromValue + (toValue - fromValue) * progress;
}

function interpolateViewportFocus(
  fromFocus: {leftPercent: number; topPercent: number; zoomScale: number},
  toFocus: {leftPercent: number; topPercent: number; zoomScale: number},
  progress: number,
) {
  return {
    leftPercent: interpolateNumber(fromFocus.leftPercent, toFocus.leftPercent, progress),
    topPercent: interpolateNumber(fromFocus.topPercent, toFocus.topPercent, progress),
    zoomScale: interpolateNumber(fromFocus.zoomScale, toFocus.zoomScale, progress),
  };
}

function buildQuadraticFlowPath(start: {x: number; y: number}, end: {x: number; y: number}, curvature: number) {
  const deltaX = end.x - start.x;
  const deltaY = end.y - start.y;
  const distance = Math.max(Math.hypot(deltaX, deltaY), 1);
  const midX = (start.x + end.x) / 2;
  const midY = (start.y + end.y) / 2;
  const normalX = -deltaY / distance;
  const normalY = deltaX / distance;
  const controlX = midX + normalX * curvature;
  const controlY = midY + normalY * curvature;

  return {
    controlX,
    controlY,
    path: `M ${start.x} ${start.y} Q ${controlX} ${controlY} ${end.x} ${end.y}`,
  };
}

function buildAiTourTypingSegments(stop: AiTourStop) {
  return [`Why ${stop.siteName}?`, ...stop.insightLines, stop.closingLine];
}

function getAiTourTypedText(segments: string[], segmentIndex: number, typedUnits: number) {
  let segmentStart = 0;
  for (let index = 0; index < segmentIndex; index += 1) {
    segmentStart += (segments[index] ?? '').length + aiTourTypingPauseUnits;
  }

  const segment = segments[segmentIndex] ?? '';
  const visibleLength = Math.max(0, Math.min(segment.length, typedUnits - segmentStart));
  return segment.slice(0, visibleLength);
}

function getAiTourTypingLength(segments: string[]) {
  return segments.reduce((total, segment) => total + segment.length + aiTourTypingPauseUnits, 0);
}

function getBenchmarkMetricsForFacility(facilityType: FacilityType, primaryMetric: GlobalKpiKey) {
  const fallbackMetrics: GlobalKpiKey[] = facilityType === 'Distribution Centers'
    ? ['OTIF', 'Shipments', 'Inventory', 'Quality / damage', 'Alerts']
    : facilityType === 'Office Buildings'
      ? ['Building Health', 'Space Utilization', 'Energy Usage', 'Utility Health', 'Active Alarms']
      : ['OEE', 'Delivery', 'Quality', 'Safety', 'Cost'];

  return [primaryMetric, ...fallbackMetrics]
    .filter((metric, index, metrics) => isKpiAllowedForFacility(metric, facilityType) && metrics.indexOf(metric) === index)
    .slice(0, 5);
}

function getTopBenchmarkSite(sites: GlobalSite[], metric: GlobalKpiKey) {
  const definition = getMetricDefinition(metric);

  return [...sites].sort((siteA, siteB) => (
    definition.highIsBetter
      ? getSiteMetricValue(siteB, metric) - getSiteMetricValue(siteA, metric)
      : getSiteMetricValue(siteA, metric) - getSiteMetricValue(siteB, metric)
  ))[0];
}

function formatBenchmarkGap(gap: number, metric: GlobalKpiKey) {
  const absGap = Math.abs(gap);

  if (['OEE', 'Delivery', 'OTIF', 'Inventory', 'Quality / damage', 'Building Health', 'Space Utilization', 'Utility Health'].includes(metric)) {
    return `${Number(absGap.toFixed(absGap % 1 ? 1 : 0))} pts`;
  }

  if (metric === 'Shipments') return `${Math.round(absGap).toLocaleString()} cases`;
  if (metric === 'Energy Usage') return `${absGap.toFixed(1)} MWh`;
  if (metric === 'People on Site') return `${Math.round(absGap).toLocaleString()} people`;
  if (metric === 'Cost') return `$${absGap.toFixed(absGap % 1 ? 1 : 0)}k`;
  if (metric === 'Labor productivity') return `${absGap.toFixed(1)} CPH`;
  if (metric === 'People') return `${absGap.toFixed(1)} pts`;

  return `${Number(absGap.toFixed(absGap % 1 ? 1 : 0))}`;
}

function buildBenchmarkResult({
  benchmarkSites,
  facilityType,
  metric,
  primarySite,
  timePeriod,
}: {
  benchmarkSites: GlobalSite[];
  facilityType: FacilityType;
  metric: GlobalKpiKey;
  primarySite: GlobalSite;
  timePeriod: string;
}): BenchmarkResult {
  const comparedSites = [primarySite, ...benchmarkSites];
  const rows = getBenchmarkMetricsForFacility(facilityType, metric).map((rowMetric) => {
    const definition = getMetricDefinition(rowMetric);
    const topSite = getTopBenchmarkSite(comparedSites, rowMetric) ?? primarySite;
    const primaryValue = getSiteMetricValue(primarySite, rowMetric);

    return {
      benchmarkValues: benchmarkSites.map((site) => ({
        siteName: site.name,
        text: definition.formatValue(getSiteMetricValue(site, rowMetric)),
        value: getSiteMetricValue(site, rowMetric),
      })),
      definition,
      metric: rowMetric,
      primaryText: definition.formatValue(primaryValue),
      primaryValue,
      topSiteName: topSite.name,
      topText: definition.formatValue(getSiteMetricValue(topSite, rowMetric)),
      topValue: getSiteMetricValue(topSite, rowMetric),
    };
  });
  const primaryMetricDefinition = getMetricDefinition(metric);
  const bestBenchmarkSite = getTopBenchmarkSite(benchmarkSites, metric) ?? benchmarkSites[0] ?? primarySite;
  const primaryMetricValue = getSiteMetricValue(primarySite, metric);
  const bestBenchmarkValue = getSiteMetricValue(bestBenchmarkSite, metric);
  const rawGap = primaryMetricDefinition.highIsBetter
    ? bestBenchmarkValue - primaryMetricValue
    : primaryMetricValue - bestBenchmarkValue;
  const gapText = rawGap > 0 ? formatBenchmarkGap(rawGap, metric) : 'On benchmark';
  const biggestGapRow = rows
    .map((row) => {
      const rowGap = row.definition.highIsBetter
        ? row.topValue - row.primaryValue
        : row.primaryValue - row.topValue;
      return {...row, rowGap};
    })
    .sort((rowA, rowB) => rowB.rowGap - rowA.rowGap)[0] ?? rows[0];
  const bestBenchmarkWins = rows.reduce<Record<string, number>>((wins, row) => ({
    ...wins,
    [row.topSiteName]: (wins[row.topSiteName] ?? 0) + 1,
  }), {});
  const bestBenchmarkSiteName = benchmarkSites
    .map((site) => site.name)
    .sort((siteA, siteB) => (bestBenchmarkWins[siteB] ?? 0) - (bestBenchmarkWins[siteA] ?? 0))[0] ?? bestBenchmarkSite.name;

  return {
    bestBenchmarkSiteName,
    gapText,
    gapUnit: `${primarySite.name} vs ${bestBenchmarkSite.name}`,
    insightTexts: [
      `${bestBenchmarkSite.name} leads ${primarySite.name} on ${primaryMetricDefinition.label} over ${timePeriod.toLowerCase()}, creating a ${gapText} improvement target.`,
      `${biggestGapRow.topSiteName} is strongest on ${biggestGapRow.definition.label}, which points to a focused operating-practice comparison.`,
      `${primarySite.name} should review recurring losses and daily controls against the benchmark sites before the next performance review.`,
    ],
    primarySite,
    recommendationTexts: [
      `Review ${biggestGapRow.definition.label.toLowerCase()} patterns against ${biggestGapRow.topSiteName} routines.`,
      `Replicate ${bestBenchmarkSiteName} shift-control practices for the selected KPI.`,
      `Open a control tower view for ${primarySite.name} to inspect detailed losses and ownership.`,
    ],
    rows,
  };
}

const liveKpiPresets: Record<MetricKey, KpiCard[][]> = {
  OEE: [
    [
      {label: 'Global OEE', value: '76%', delta: '- 3% vs Yesterday', tone: '#FF5252', trend: [62, 66, 64, 68, 67, 66, 72, 69, 64, 66, 70, 63]},
      {label: 'Global Production', value: '128K', delta: '+ 6% vs Yesterday', tone: '#67E86B', trend: [42, 40, 47, 49, 43, 44, 51, 43, 45, 56, 44, 48]},
      {label: 'Global Scrap Rate', value: '2.6%', delta: '- 0.4% vs Yesterday', tone: '#FF5252', trend: [52, 53, 54, 50, 57, 51, 49, 56, 53, 47, 49, 45]},
      {label: 'Safety Incidents (24h)', value: '23', delta: '+ 15% vs Yesterday', tone: '#67E86B', trend: [44, 41, 45, 43, 47, 42, 44, 46, 43, 49, 41, 44]},
      {label: 'Active Alerts', value: '12', delta: '+ 2 vs Yesterday', tone: '#FF5252', trend: [51, 53, 52, 55, 53, 54, 56, 52, 54, 50, 51, 49]},
    ],
    [
      {label: 'Global OEE', value: '77%', delta: '+ 1% vs Yesterday', tone: '#67E86B', trend: [61, 63, 65, 67, 66, 69, 70, 72, 71, 73, 74, 76]},
      {label: 'Global Production', value: '131K', delta: '+ 2% vs Yesterday', tone: '#67E86B', trend: [41, 44, 46, 48, 47, 50, 52, 54, 53, 56, 57, 59]},
      {label: 'Global Scrap Rate', value: '2.4%', delta: '- 0.2% vs Yesterday', tone: '#67E86B', trend: [54, 53, 51, 50, 49, 47, 46, 45, 44, 43, 42, 41]},
      {label: 'Safety Incidents (24h)', value: '19', delta: '- 4 vs Yesterday', tone: '#67E86B', trend: [48, 47, 46, 45, 43, 42, 40, 39, 38, 37, 36, 35]},
      {label: 'Active Alerts', value: '9', delta: '- 3 vs Yesterday', tone: '#67E86B', trend: [56, 54, 53, 51, 50, 48, 46, 45, 43, 42, 41, 40]},
    ],
    [
      {label: 'Global OEE', value: '75%', delta: '- 1% vs Yesterday', tone: '#FF5252', trend: [66, 65, 64, 63, 62, 61, 60, 61, 59, 58, 57, 56]},
      {label: 'Global Production', value: '124K', delta: '- 4% vs Yesterday', tone: '#FF5252', trend: [56, 55, 54, 52, 51, 50, 49, 48, 47, 45, 44, 42]},
      {label: 'Global Scrap Rate', value: '2.9%', delta: '+ 0.3% vs Yesterday', tone: '#FF5252', trend: [44, 45, 46, 48, 50, 52, 53, 55, 57, 58, 60, 61]},
      {label: 'Safety Incidents (24h)', value: '26', delta: '+ 3 vs Yesterday', tone: '#FF5252', trend: [39, 40, 42, 43, 45, 47, 48, 50, 52, 53, 55, 56]},
      {label: 'Active Alerts', value: '14', delta: '+ 2 vs Yesterday', tone: '#FF5252', trend: [43, 44, 45, 47, 49, 50, 52, 53, 55, 56, 57, 59]},
    ],
  ],
  Safety: [
    [
      {label: 'Safety Incidents', value: '23', delta: '+ 3 vs Yesterday', tone: '#FF5252', trend: [44, 46, 45, 48, 47, 50, 49, 51, 53, 52, 55, 57]},
      {label: 'Near Misses', value: '41', delta: '+ 5 vs Yesterday', tone: '#FF9C3A', trend: [48, 50, 51, 49, 52, 54, 55, 57, 58, 56, 59, 61]},
      {label: 'Open Investigations', value: '8', delta: '+ 2 vs Yesterday', tone: '#FF5252', trend: [42, 43, 45, 46, 47, 49, 50, 52, 54, 55, 57, 58]},
      {label: 'Critical Risks', value: '6', delta: '+ 1 vs Yesterday', tone: '#FF5252', trend: [40, 42, 43, 45, 47, 48, 49, 51, 53, 54, 56, 57]},
      {label: 'Action Closure', value: '78%', delta: '- 4% vs Yesterday', tone: '#FF5252', trend: [60, 58, 57, 56, 55, 54, 52, 51, 50, 48, 47, 46]},
    ],
    [
      {label: 'Safety Incidents', value: '18', delta: '- 5 vs Yesterday', tone: '#67E86B', trend: [57, 55, 54, 52, 50, 49, 47, 46, 44, 43, 42, 40]},
      {label: 'Near Misses', value: '34', delta: '- 7 vs Yesterday', tone: '#67E86B', trend: [61, 59, 58, 56, 55, 53, 52, 50, 48, 47, 45, 44]},
      {label: 'Open Investigations', value: '5', delta: '- 3 vs Yesterday', tone: '#67E86B', trend: [58, 56, 54, 53, 51, 49, 47, 46, 44, 43, 41, 40]},
      {label: 'Critical Risks', value: '4', delta: '- 2 vs Yesterday', tone: '#67E86B', trend: [56, 55, 53, 51, 50, 48, 47, 45, 44, 42, 41, 39]},
      {label: 'Action Closure', value: '84%', delta: '+ 6% vs Yesterday', tone: '#67E86B', trend: [46, 47, 49, 50, 52, 53, 55, 56, 58, 60, 61, 63]},
    ],
    [
      {label: 'Safety Incidents', value: '20', delta: '+ 2 vs Yesterday', tone: '#FF9C3A', trend: [46, 47, 49, 50, 51, 53, 52, 54, 55, 56, 58, 59]},
      {label: 'Near Misses', value: '38', delta: '+ 4 vs Yesterday', tone: '#FF9C3A', trend: [50, 51, 52, 54, 55, 57, 56, 58, 59, 60, 62, 63]},
      {label: 'Open Investigations', value: '6', delta: '+ 1 vs Yesterday', tone: '#FF9C3A', trend: [44, 45, 47, 48, 49, 50, 52, 53, 54, 56, 57, 58]},
      {label: 'Critical Risks', value: '5', delta: 'No change', tone: '#FF9C3A', trend: [43, 44, 46, 47, 48, 49, 50, 52, 53, 54, 55, 56]},
      {label: 'Action Closure', value: '81%', delta: '- 3% vs Yesterday', tone: '#FF9C3A', trend: [58, 57, 56, 55, 54, 53, 51, 50, 49, 48, 47, 46]},
    ],
  ],
  Quality: [
    [
      {label: 'Non-conformities', value: '31', delta: '+ 4 vs Yesterday', tone: '#FF5252', trend: [42, 44, 45, 47, 49, 50, 52, 53, 55, 56, 58, 59]},
      {label: 'FPY', value: '94.1%', delta: '- 1.1% vs Yesterday', tone: '#FF5252', trend: [59, 58, 57, 56, 55, 54, 53, 52, 51, 50, 49, 48]},
      {label: 'Open CAPAs', value: '14', delta: '+ 3 vs Yesterday', tone: '#FF5252', trend: [44, 45, 47, 48, 50, 52, 53, 55, 56, 58, 59, 60]},
      {label: 'Defect Rate', value: '2.8%', delta: '+ 0.4% vs Yesterday', tone: '#FF5252', trend: [41, 43, 45, 46, 48, 49, 51, 53, 54, 56, 57, 59]},
      {label: 'Escaped Defects', value: '7', delta: '+ 2 vs Yesterday', tone: '#FF5252', trend: [43, 44, 46, 47, 48, 50, 52, 53, 54, 56, 57, 58]},
    ],
    [
      {label: 'Non-conformities', value: '24', delta: '- 7 vs Yesterday', tone: '#67E86B', trend: [59, 57, 56, 54, 53, 51, 50, 48, 47, 45, 44, 42]},
      {label: 'FPY', value: '95.6%', delta: '+ 1.5% vs Yesterday', tone: '#67E86B', trend: [48, 49, 50, 52, 53, 54, 56, 57, 58, 59, 61, 62]},
      {label: 'Open CAPAs', value: '9', delta: '- 5 vs Yesterday', tone: '#67E86B', trend: [57, 55, 54, 52, 51, 49, 48, 46, 45, 43, 42, 41]},
      {label: 'Defect Rate', value: '2.1%', delta: '- 0.7% vs Yesterday', tone: '#67E86B', trend: [58, 56, 55, 53, 52, 50, 49, 47, 46, 44, 43, 42]},
      {label: 'Escaped Defects', value: '4', delta: '- 3 vs Yesterday', tone: '#67E86B', trend: [56, 54, 53, 51, 50, 48, 47, 45, 44, 42, 41, 39]},
    ],
    [
      {label: 'Non-conformities', value: '27', delta: '- 4 vs Yesterday', tone: '#FF9C3A', trend: [53, 52, 51, 50, 49, 48, 47, 46, 45, 44, 43, 42]},
      {label: 'FPY', value: '95.0%', delta: '+ 0.9% vs Yesterday', tone: '#67E86B', trend: [46, 47, 49, 50, 51, 53, 54, 55, 57, 58, 59, 60]},
      {label: 'Open CAPAs', value: '11', delta: '- 3 vs Yesterday', tone: '#67E86B', trend: [54, 53, 52, 50, 49, 47, 46, 45, 43, 42, 41, 40]},
      {label: 'Defect Rate', value: '2.4%', delta: '- 0.4% vs Yesterday', tone: '#67E86B', trend: [55, 54, 53, 51, 50, 49, 47, 46, 45, 43, 42, 41]},
      {label: 'Escaped Defects', value: '5', delta: '- 2 vs Yesterday', tone: '#67E86B', trend: [53, 52, 51, 49, 48, 47, 45, 44, 43, 41, 40, 39]},
    ],
  ],
  Delivery: [
    [
      {label: 'Production vs Target', value: '93%', delta: '- 2% vs Yesterday', tone: '#FF5252', trend: [60, 58, 57, 56, 54, 53, 52, 50, 49, 48, 47, 46]},
      {label: 'On-Time Orders', value: '91%', delta: '- 3% vs Yesterday', tone: '#FF5252', trend: [58, 57, 56, 55, 54, 52, 51, 50, 49, 48, 47, 45]},
      {label: 'Schedule Adherence', value: '88%', delta: '- 4% vs Yesterday', tone: '#FF5252', trend: [57, 56, 55, 54, 53, 51, 50, 49, 48, 47, 45, 44]},
      {label: 'Missed Plan', value: '12', delta: '+ 3 vs Yesterday', tone: '#FF5252', trend: [42, 43, 45, 46, 48, 50, 51, 53, 54, 56, 57, 58]},
      {label: 'Expedites', value: '9', delta: '+ 2 vs Yesterday', tone: '#FF5252', trend: [41, 42, 44, 46, 47, 49, 50, 52, 53, 55, 56, 57]},
    ],
    [
      {label: 'Production vs Target', value: '96%', delta: '+ 3% vs Yesterday', tone: '#67E86B', trend: [46, 47, 49, 50, 52, 53, 54, 56, 57, 58, 60, 61]},
      {label: 'On-Time Orders', value: '95%', delta: '+ 4% vs Yesterday', tone: '#67E86B', trend: [45, 46, 48, 49, 51, 52, 53, 55, 56, 58, 59, 60]},
      {label: 'Schedule Adherence', value: '92%', delta: '+ 4% vs Yesterday', tone: '#67E86B', trend: [44, 45, 47, 48, 50, 51, 53, 54, 55, 57, 58, 59]},
      {label: 'Missed Plan', value: '7', delta: '- 5 vs Yesterday', tone: '#67E86B', trend: [58, 56, 55, 54, 52, 51, 49, 48, 47, 45, 44, 42]},
      {label: 'Expedites', value: '5', delta: '- 4 vs Yesterday', tone: '#67E86B', trend: [57, 55, 54, 52, 51, 49, 48, 46, 45, 43, 42, 40]},
    ],
    [
      {label: 'Production vs Target', value: '94%', delta: '+ 1% vs Yesterday', tone: '#67E86B', trend: [48, 49, 50, 52, 53, 54, 55, 57, 58, 59, 60, 61]},
      {label: 'On-Time Orders', value: '93%', delta: '+ 2% vs Yesterday', tone: '#67E86B', trend: [47, 48, 49, 51, 52, 53, 54, 56, 57, 58, 59, 60]},
      {label: 'Schedule Adherence', value: '90%', delta: '+ 2% vs Yesterday', tone: '#67E86B', trend: [46, 47, 48, 50, 51, 52, 54, 55, 56, 57, 58, 59]},
      {label: 'Missed Plan', value: '9', delta: '- 3 vs Yesterday', tone: '#67E86B', trend: [55, 54, 53, 52, 50, 49, 48, 47, 45, 44, 43, 42]},
      {label: 'Expedites', value: '6', delta: '- 3 vs Yesterday', tone: '#67E86B', trend: [54, 53, 52, 51, 49, 48, 47, 46, 44, 43, 42, 41]},
    ],
  ],
  Cost: [
    [
      {label: 'Scrap Cost', value: '$318k', delta: '+ $22k vs Yesterday', tone: '#FF5252', trend: [43, 45, 46, 48, 49, 51, 53, 54, 56, 57, 59, 60]},
      {label: 'Rework Cost', value: '$129k', delta: '+ $11k vs Yesterday', tone: '#FF5252', trend: [42, 43, 45, 46, 48, 49, 51, 52, 54, 55, 57, 58]},
      {label: 'Material Loss', value: '$92k', delta: '+ $8k vs Yesterday', tone: '#FF5252', trend: [41, 42, 44, 45, 47, 48, 50, 51, 53, 54, 56, 57]},
      {label: 'Waste Rate', value: '4.8%', delta: '+ 0.6% vs Yesterday', tone: '#FF5252', trend: [40, 42, 43, 45, 46, 48, 49, 51, 52, 54, 55, 57]},
      {label: 'Cost Recovery', value: '71%', delta: '- 5% vs Yesterday', tone: '#FF5252', trend: [58, 57, 56, 55, 54, 52, 51, 50, 49, 47, 46, 45]},
    ],
    [
      {label: 'Scrap Cost', value: '$274k', delta: '- $44k vs Yesterday', tone: '#67E86B', trend: [60, 58, 57, 55, 54, 52, 51, 49, 48, 46, 45, 43]},
      {label: 'Rework Cost', value: '$103k', delta: '- $26k vs Yesterday', tone: '#67E86B', trend: [58, 57, 55, 54, 52, 51, 49, 48, 46, 45, 43, 42]},
      {label: 'Material Loss', value: '$74k', delta: '- $18k vs Yesterday', tone: '#67E86B', trend: [57, 55, 54, 52, 51, 49, 48, 46, 45, 43, 42, 40]},
      {label: 'Waste Rate', value: '4.1%', delta: '- 0.7% vs Yesterday', tone: '#67E86B', trend: [56, 55, 53, 52, 50, 49, 47, 46, 45, 43, 42, 41]},
      {label: 'Cost Recovery', value: '77%', delta: '+ 6% vs Yesterday', tone: '#67E86B', trend: [45, 46, 48, 49, 50, 52, 53, 55, 56, 57, 59, 60]},
    ],
    [
      {label: 'Scrap Cost', value: '$291k', delta: '- $27k vs Yesterday', tone: '#67E86B', trend: [57, 56, 54, 53, 51, 50, 49, 47, 46, 44, 43, 42]},
      {label: 'Rework Cost', value: '$111k', delta: '- $18k vs Yesterday', tone: '#67E86B', trend: [55, 54, 52, 51, 49, 48, 46, 45, 44, 42, 41, 40]},
      {label: 'Material Loss', value: '$81k', delta: '- $11k vs Yesterday', tone: '#67E86B', trend: [54, 53, 51, 50, 48, 47, 45, 44, 43, 41, 40, 39]},
      {label: 'Waste Rate', value: '4.4%', delta: '- 0.4% vs Yesterday', tone: '#67E86B', trend: [53, 52, 50, 49, 47, 46, 45, 43, 42, 41, 40, 39]},
      {label: 'Cost Recovery', value: '74%', delta: '+ 3% vs Yesterday', tone: '#67E86B', trend: [47, 48, 49, 50, 52, 53, 54, 55, 57, 58, 59, 60]},
    ],
  ],
  People: [
    [
      {label: 'Absenteeism', value: '4.8%', delta: '+ 0.9% vs Yesterday', tone: '#FF5252', trend: [42, 43, 45, 46, 47, 49, 50, 52, 53, 55, 56, 58]},
      {label: 'Overtime Hours', value: '186h', delta: '+ 18h vs Yesterday', tone: '#FF9C3A', trend: [45, 46, 48, 49, 50, 52, 53, 55, 56, 58, 59, 60]},
      {label: 'Open Shifts', value: '14', delta: '+ 3 vs Yesterday', tone: '#FF5252', trend: [43, 44, 46, 47, 49, 50, 52, 53, 55, 56, 57, 59]},
      {label: 'Training Compliance', value: '82%', delta: '- 4% vs Yesterday', tone: '#FF5252', trend: [58, 57, 56, 55, 54, 53, 51, 50, 49, 48, 46, 45]},
      {label: 'Turnover Risk', value: '9', delta: '+ 2 vs Yesterday', tone: '#FF5252', trend: [41, 42, 44, 45, 46, 48, 49, 51, 52, 54, 55, 57]},
    ],
    [
      {label: 'Absenteeism', value: '3.7%', delta: '- 1.1% vs Yesterday', tone: '#67E86B', trend: [58, 56, 55, 53, 52, 50, 49, 47, 46, 44, 43, 41]},
      {label: 'Overtime Hours', value: '151h', delta: '- 35h vs Yesterday', tone: '#67E86B', trend: [60, 58, 57, 55, 54, 52, 51, 49, 48, 46, 45, 43]},
      {label: 'Open Shifts', value: '9', delta: '- 5 vs Yesterday', tone: '#67E86B', trend: [57, 56, 54, 53, 51, 50, 48, 47, 45, 44, 42, 41]},
      {label: 'Training Compliance', value: '88%', delta: '+ 6% vs Yesterday', tone: '#67E86B', trend: [45, 46, 48, 49, 50, 52, 53, 55, 56, 58, 59, 60]},
      {label: 'Turnover Risk', value: '6', delta: '- 3 vs Yesterday', tone: '#67E86B', trend: [55, 54, 52, 51, 49, 48, 46, 45, 43, 42, 41, 39]},
    ],
    [
      {label: 'Absenteeism', value: '4.1%', delta: '- 0.7% vs Yesterday', tone: '#67E86B', trend: [55, 54, 53, 51, 50, 49, 47, 46, 45, 43, 42, 41]},
      {label: 'Overtime Hours', value: '163h', delta: '- 23h vs Yesterday', tone: '#67E86B', trend: [57, 56, 55, 53, 52, 51, 49, 48, 47, 45, 44, 43]},
      {label: 'Open Shifts', value: '11', delta: '- 3 vs Yesterday', tone: '#67E86B', trend: [54, 53, 52, 50, 49, 48, 46, 45, 44, 42, 41, 40]},
      {label: 'Training Compliance', value: '85%', delta: '+ 3% vs Yesterday', tone: '#67E86B', trend: [47, 48, 49, 50, 52, 53, 54, 55, 57, 58, 59, 60]},
      {label: 'Turnover Risk', value: '7', delta: '- 2 vs Yesterday', tone: '#67E86B', trend: [52, 51, 50, 49, 47, 46, 45, 43, 42, 41, 40, 39]},
    ],
  ],
};

const distributionKpiCards: KpiCard[] = [
  {label: 'OTIF Performance', value: '96.8%', delta: '- 1.4pp vs Yesterday', tone: '#FF5252', trend: [62, 65, 64, 67, 66, 68, 67, 64, 65, 63, 62, 64]},
  {label: 'Cases Shipped', value: '48.2K', delta: '- 1.8K vs Plan', tone: '#FF5252', trend: [42, 45, 47, 44, 46, 49, 48, 50, 47, 46, 45, 48]},
  {label: 'Inventory Accuracy', value: '98.6%', delta: '- 0.9pp vs Target', tone: '#FF9C3A', trend: [54, 55, 53, 56, 58, 57, 55, 56, 54, 53, 55, 57]},
  {label: 'Cases per Paid Hour', value: '41.2', delta: '- 3.8 vs Target', tone: '#FF5252', trend: [45, 44, 46, 47, 45, 44, 43, 45, 44, 42, 43, 45]},
  {label: 'Warehouse Damage', value: '1.9%', delta: '+ 0.9pp vs Target', tone: '#FF5252', trend: [38, 39, 41, 40, 42, 43, 45, 44, 46, 47, 45, 48]},
  {label: 'Active Alerts', value: '7', delta: '+ 3 vs Yesterday', tone: '#FF5252', trend: [34, 36, 35, 38, 40, 39, 42, 41, 43, 45, 44, 46]},
];

const distributionKpiCardPresets: KpiCard[][] = [
  distributionKpiCards,
  [
    {label: 'OTIF Performance', value: '97.4%', delta: '+ 0.6pp vs Yesterday', tone: '#67E86B', trend: [62, 63, 65, 64, 66, 67, 68, 67, 69, 70, 69, 71]},
    {label: 'Cases Shipped', value: '49.6K', delta: '- 0.4K vs Plan', tone: '#FF9C3A', trend: [44, 46, 48, 49, 47, 50, 52, 51, 53, 54, 52, 55]},
    {label: 'Inventory Accuracy', value: '99.1%', delta: '- 0.4pp vs Target', tone: '#FF9C3A', trend: [55, 56, 58, 57, 59, 60, 58, 61, 62, 61, 63, 64]},
    {label: 'Cases per Paid Hour', value: '43.5', delta: '- 1.5 vs Target', tone: '#FF9C3A', trend: [43, 44, 45, 46, 45, 47, 48, 47, 49, 50, 49, 51]},
    {label: 'Warehouse Damage', value: '1.4%', delta: '+ 0.4pp vs Target', tone: '#FF9C3A', trend: [45, 44, 43, 42, 41, 40, 39, 41, 40, 38, 37, 36]},
    {label: 'Active Alerts', value: '5', delta: '- 2 vs Yesterday', tone: '#67E86B', trend: [46, 45, 43, 42, 41, 39, 40, 38, 37, 36, 35, 34]},
  ],
  [
    {label: 'OTIF Performance', value: '96.1%', delta: '- 0.7pp vs Yesterday', tone: '#FF5252', trend: [70, 68, 67, 65, 66, 64, 63, 62, 61, 60, 59, 58]},
    {label: 'Cases Shipped', value: '47.8K', delta: '- 2.2K vs Plan', tone: '#FF5252', trend: [52, 51, 50, 48, 49, 47, 46, 45, 44, 43, 42, 41]},
    {label: 'Inventory Accuracy', value: '98.3%', delta: '- 1.2pp vs Target', tone: '#FF5252', trend: [63, 61, 60, 59, 57, 58, 56, 55, 54, 52, 51, 50]},
    {label: 'Cases per Paid Hour', value: '40.6', delta: '- 4.4 vs Target', tone: '#FF5252', trend: [49, 48, 46, 45, 44, 42, 43, 41, 40, 39, 38, 37]},
    {label: 'Warehouse Damage', value: '2.2%', delta: '+ 1.2pp vs Target', tone: '#FF5252', trend: [36, 38, 39, 41, 42, 44, 43, 45, 47, 48, 50, 52]},
    {label: 'Active Alerts', value: '9', delta: '+ 2 vs Yesterday', tone: '#FF5252', trend: [34, 36, 38, 37, 40, 42, 41, 44, 46, 45, 48, 50]},
  ],
];

const officeKpiCardPresets: KpiCard[][] = [
  [
    {label: 'Space Utilization', value: '80%', delta: '- 5pp vs Target', tone: '#FF5252', trend: [54, 55, 56, 58, 57, 55, 54, 56, 57, 55, 56, 58]},
    {label: 'People on Site', value: '1,240', delta: '+ 60 vs Expected', tone: '#FF9C3A', trend: [42, 44, 47, 46, 49, 51, 48, 50, 52, 53, 54, 56]},
    {label: 'Energy Usage', value: '18.4 MWh', delta: '+ 9% vs Baseline', tone: '#FF5252', trend: [38, 39, 41, 42, 44, 46, 45, 43, 44, 42, 41, 40]},
    {label: 'Utility Health', value: '94%', delta: '- 3pp vs Target', tone: '#FF9C3A', trend: [59, 58, 57, 55, 56, 54, 53, 52, 51, 50, 49, 48]},
    {label: 'Facility Alarms', value: '7', delta: '+ 3 vs Yesterday', tone: '#FF5252', trend: [32, 34, 35, 37, 36, 39, 41, 40, 43, 44, 42, 45]},
    {label: 'Building Health', value: '78%', delta: 'Poor - action needed', tone: '#FF5252', trend: [58, 57, 55, 54, 52, 50, 49, 48, 47, 45, 44, 43]},
  ],
  [
    {label: 'Space Utilization', value: '83%', delta: '+ 3pp vs Yesterday', tone: '#67E86B', trend: [50, 51, 53, 52, 54, 55, 57, 56, 58, 59, 60, 61]},
    {label: 'People on Site', value: '1,188', delta: '+ 8 vs Expected', tone: '#67E86B', trend: [43, 44, 46, 47, 48, 49, 50, 49, 51, 52, 53, 54]},
    {label: 'Energy Usage', value: '17.2 MWh', delta: '+ 1% vs Baseline', tone: '#FF9C3A', trend: [45, 44, 43, 42, 41, 40, 39, 38, 39, 37, 36, 35]},
    {label: 'Utility Health', value: '96%', delta: '+ 2pp vs Yesterday', tone: '#67E86B', trend: [52, 53, 54, 55, 57, 56, 58, 59, 60, 61, 62, 63]},
    {label: 'Facility Alarms', value: '4', delta: '- 3 vs Yesterday', tone: '#67E86B', trend: [45, 44, 42, 41, 40, 38, 39, 37, 36, 35, 34, 33]},
    {label: 'Building Health', value: '86%', delta: '+ 8pp vs Yesterday', tone: '#67E86B', trend: [43, 44, 46, 47, 49, 50, 52, 53, 55, 57, 58, 60]},
  ],
  [
    {label: 'Space Utilization', value: '78%', delta: '- 7pp vs Target', tone: '#FF5252', trend: [61, 60, 58, 57, 56, 54, 55, 53, 52, 51, 50, 49]},
    {label: 'People on Site', value: '1,304', delta: '+ 124 vs Expected', tone: '#FF5252', trend: [45, 46, 48, 50, 52, 53, 55, 54, 56, 58, 59, 61]},
    {label: 'Energy Usage', value: '19.1 MWh', delta: '+ 13% vs Baseline', tone: '#FF5252', trend: [36, 38, 39, 41, 43, 42, 44, 46, 48, 47, 49, 51]},
    {label: 'Utility Health', value: '92%', delta: '- 5pp vs Target', tone: '#FF5252', trend: [61, 60, 59, 57, 56, 55, 54, 52, 51, 50, 48, 47]},
    {label: 'Facility Alarms', value: '9', delta: '+ 2 vs Yesterday', tone: '#FF5252', trend: [34, 36, 37, 39, 41, 40, 43, 45, 44, 47, 48, 50]},
    {label: 'Building Health', value: '76%', delta: '- 2pp vs Yesterday', tone: '#FF5252', trend: [52, 51, 49, 48, 47, 45, 44, 43, 41, 40, 39, 38]},
  ],
];

function FilterBox({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        minWidth: {xs: '100%', sm: 190},
        height: 46,
        px: 1.35,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        bgcolor: 'rgba(15, 27, 45, 0.88)',
        border: '1px solid rgba(119, 151, 190, 0.24)',
        borderRadius: 1.4,
        color: '#DDEBFF',
      }}
    >
      <Box sx={{color: '#8BA4C4', display: 'grid', placeItems: 'center'}}>{icon}</Box>
      <Box sx={{minWidth: 0}}>
        <Typography sx={{fontSize: 10, color: '#8BA4C4', lineHeight: 1.1}}>{label}</Typography>
        <Typography sx={{fontSize: 12, color: '#FFFFFF', fontWeight: 800, lineHeight: 1.2}} noWrap>{value}</Typography>
      </Box>
    </Paper>
  );
}

function buildTrendFromMetric(siteName: string, metric: GlobalKpiKey, value: number, highIsBetter: boolean) {
  const seed = `${siteName}-${metric}`.split('').reduce((total, char) => total + char.charCodeAt(0), 0);
  const amplitude = metric === 'People' || metric === 'Quality / damage'
    ? 0.45
    : metric === 'Safety' || metric === 'Quality' || metric === 'Alerts'
      ? 1.4
      : metric === 'Cost'
        ? 2.6
        : 3.5;

  return Array.from({length: 12}, (_, index) => {
    const wave = Math.sin((index + seed) * 0.75) * amplitude;
    const drift = Math.cos((index + seed) * 0.38) * amplitude * 0.6;
    const direction = highIsBetter ? index * amplitude * 0.03 : -index * amplitude * 0.03;
    const nextValue = value + wave + drift + direction;
    return Number(Math.max(0.2, nextValue).toFixed(2));
  });
}

function buildMetricRankings(sites: GlobalSite[], metric: GlobalKpiKey) {
  const definition = getMetricDefinition(metric);
  const sortedSites = [...sites].sort((siteA, siteB) => (
    definition.highIsBetter
      ? getSiteMetricValue(siteB, metric) - getSiteMetricValue(siteA, metric)
      : getSiteMetricValue(siteA, metric) - getSiteMetricValue(siteB, metric)
  ));
  const topCount = sortedSites.length ? Math.min(4, Math.max(1, Math.floor(sortedSites.length * 0.25))) : 0;
  const issueCount = sortedSites.length ? Math.min(3, Math.max(1, Math.floor(sortedSites.length * 0.18))) : 0;
  const topSiteNames = new Set(sortedSites.slice(0, topCount).map((site) => site.name));
  const issueSiteNames = new Set(sortedSites.slice(-issueCount).map((site) => site.name));
  const warningThreshold = Math.max(4, Math.floor(sortedSites.length * 0.7));

  const toneByName = new Map(sortedSites.map((site, index) => {
    let tone: SiteTone = 'good';
    if (issueSiteNames.has(site.name)) tone = 'issue';
    else if (topSiteNames.has(site.name)) tone = 'excellent';
    else if (index >= warningThreshold) tone = 'warning';
    return [site.name, tone];
  }));

  const topPerforming = sortedSites.slice(0, 3).map((site) => ({
    name: site.name,
    metricValue: getSiteMetricValue(site, metric),
    metricText: definition.mapValueLabel(getSiteMetricValue(site, metric)),
    color: '#67E86B',
    region: site.region,
    trend: buildTrendFromMetric(site.name, metric, getSiteMetricValue(site, metric), definition.highIsBetter),
  }));

  const sitesWithIssues = sortedSites.slice(-3).map((site) => ({
    name: site.name,
    metricValue: getSiteMetricValue(site, metric),
    metricText: definition.mapValueLabel(getSiteMetricValue(site, metric)),
    color: '#FF5252',
    region: site.region,
    trend: buildTrendFromMetric(site.name, metric, getSiteMetricValue(site, metric), definition.highIsBetter),
  }));

  return {toneByName, topPerforming, sitesWithIssues};
}

function SiteMarker({
  mapBounds,
  markerIcon,
  site,
  metrics,
  tone,
  viewportScale,
  isDimmed,
  isTourHighlighted,
  tourAccentColor,
  onPointerDown,
  onSelect,
}: {
  mapBounds: {offsetX: number; offsetY: number; width: number; height: number} | null;
  markerIcon: ReactNode | null;
  site: GlobalSite;
  metrics: GlobalKpiKey[];
  tone: SiteTone;
  viewportScale: number;
  isDimmed: boolean;
  isTourHighlighted: boolean;
  tourAccentColor: string | null;
  onPointerDown: (event: React.PointerEvent<HTMLDivElement>, siteName: string) => void;
  onSelect: (siteName: string) => void;
}) {
  const toneStyles = siteToneMap[tone];
  const isIssue = tone === 'issue';
  const visibleMetrics = metrics.slice(0, 3);
  const hiddenMetricCount = Math.max(0, metrics.length - visibleMetrics.length);
  const hasColumbusHover = site.name === 'Columbus West';
  const hasFourOaksHover = site.name === 'Four Oaks';
  const hasFranklinLakesHover = site.name === 'Franklin Lakes';
  const hasIssueHoverCard = hasColumbusHover || hasFourOaksHover || hasFranklinLakesHover;
  const labelOffsetX = Math.round((site.labelOffsetX ?? 36) * 0.86);
  const labelOffsetY = Math.round((site.labelOffsetY ?? -18) * 0.86);
  const markerLeft = mapBounds
    ? `${mapBounds.offsetX + (parseFloat(site.left) / 100) * mapBounds.width}px`
    : site.left;
  const markerTop = mapBounds
    ? `${mapBounds.offsetY + (parseFloat(site.top) / 100) * mapBounds.height}px`
    : site.top;
  const dimmedMarkerFilter = 'saturate(0.18) brightness(1.62) blur(0.45px)';
  const dimmedLabelFilter = 'saturate(0.15) brightness(1.5) blur(0.35px)';
  const estimatedLabelWidth = Math.max(124, site.name.length * 8.2 + 74);
  const focusShellLeft = Math.min(-28, labelOffsetX - 18);
  const focusShellRight = Math.max(30, labelOffsetX + estimatedLabelWidth);
  const focusShellTop = Math.min(-38, labelOffsetY - 16);
  const focusShellBottom = Math.max(34, labelOffsetY + 60);
  const focusShellWidth = focusShellRight - focusShellLeft;
  const focusShellHeight = focusShellBottom - focusShellTop;
  const markerUiScale = clampNumber(0.99 / viewportScale, 0.4, 1);
  const siteNameFontSize = isTourHighlighted ? 14.1 : 13;

  return (
    <Box
      sx={{
        position: 'absolute',
        left: markerLeft,
        top: markerTop,
        transform: 'translate(-50%, -50%)',
        zIndex: isIssue ? 4 : 3,
        width: 0,
        height: 0,
        touchAction: 'none',
        transition: 'left 720ms cubic-bezier(0.22, 1, 0.36, 1), top 720ms cubic-bezier(0.22, 1, 0.36, 1), opacity 180ms ease',
        '&:hover': {
          zIndex: 20,
        },
        '&:hover .global-site-hover': {
          opacity: 1,
          transform: 'translate(18px, -28px)',
          visibility: 'visible',
        },
        '&:hover .four-oaks-hover': {
          opacity: 1,
          transform: 'translate(18px, -192px) scale(0.86)',
          visibility: 'visible',
        },
        '&:hover .franklin-lakes-hover': {
          opacity: 1,
          transform: 'translate(18px, -192px) scale(0.52)',
          visibility: 'visible',
        },
        '&:hover .global-site-label': hasIssueHoverCard ? {
          opacity: 0,
        } : undefined,
      }}
      onPointerDown={(event) => onPointerDown(event, site.name)}
      onClick={() => onSelect(site.name)}
    >
      <Box
        sx={{
          position: 'absolute',
          left: 0,
          top: 0,
          transform: `translate(-50%, -50%) scale(${markerUiScale})`,
          transformOrigin: 'center center',
          width: 0,
          height: 0,
          willChange: 'transform',
        }}
      >
        {isTourHighlighted ? (
          <Box
            sx={{
              position: 'absolute',
              left: focusShellLeft,
              top: focusShellTop,
              width: focusShellWidth,
              height: focusShellHeight,
              borderRadius: 2.2,
              border: `1px solid ${(tourAccentColor ?? toneStyles.color)}88`,
              background: `radial-gradient(circle at 18% 32%, ${(tourAccentColor ?? toneStyles.color)}2B, transparent 54%), linear-gradient(135deg, ${(tourAccentColor ?? toneStyles.color)}20, transparent 48%)`,
              boxShadow: `0 0 0 1px ${(tourAccentColor ?? toneStyles.color)}26, 0 0 28px ${(tourAccentColor ?? toneStyles.color)}32`,
              pointerEvents: 'none',
              animation: 'aiTourFocusShellPulse 1.9s ease-in-out infinite',
              '&::after': {
                content: '""',
                position: 'absolute',
                inset: -8,
                borderRadius: 2.8,
                border: `1px solid ${(tourAccentColor ?? toneStyles.color)}4A`,
                animation: 'aiTourFocusShellRipple 1.9s ease-out infinite',
              },
              '@keyframes aiTourFocusShellPulse': {
                '0%, 100%': {
                  transform: 'scale(1)',
                  opacity: 0.72,
                },
                '50%': {
                  transform: 'scale(1.03)',
                  opacity: 1,
                },
              },
              '@keyframes aiTourFocusShellRipple': {
                '0%': {
                  opacity: 0.82,
                  transform: 'scale(0.94)',
                },
                '100%': {
                  opacity: 0,
                  transform: 'scale(1.08)',
                },
              },
            }}
          />
        ) : null}
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            top: 0,
            transform: 'translate(-50%, -50%)',
            width: markerIcon ? 30 : 26,
            height: markerIcon ? 30 : 26,
            borderRadius: markerIcon ? 1.2 : '50%',
            bgcolor: toneStyles.color,
            border: '2.5px solid rgba(6, 20, 37, 0.92)',
            color: '#061425',
            display: 'grid',
            placeItems: 'center',
            boxShadow: isTourHighlighted
              ? `0 0 0 8px ${(tourAccentColor ?? toneStyles.color)}32, 0 0 28px ${(tourAccentColor ?? toneStyles.color)}70`
              : `0 0 0 7px ${toneStyles.glow}, 0 0 22px ${toneStyles.glow}`,
            animation: isTourHighlighted ? 'aiTourMarkerPulse 1.6s ease-in-out infinite' : hasIssueHoverCard ? 'columbusIssueMarkerPulse 1.45s ease-in-out infinite' : undefined,
            opacity: isDimmed ? 0.28 : 1,
            filter: isDimmed ? dimmedMarkerFilter : 'none',
            transition: 'opacity 180ms ease, filter 180ms ease, box-shadow 180ms ease',
            '&::after': isTourHighlighted ? {
              content: '""',
              position: 'absolute',
              inset: -12,
              borderRadius: '50%',
              border: `2px solid ${(tourAccentColor ?? toneStyles.color)}AA`,
              animation: 'aiTourMarkerRipple 1.6s ease-out infinite',
            } : hasIssueHoverCard ? {
              content: '""',
              position: 'absolute',
              inset: -10,
              borderRadius: '50%',
              border: '2px solid rgba(255, 69, 69, 0.72)',
              animation: 'columbusIssueMarkerRipple 1.45s ease-out infinite',
            } : undefined,
            '@keyframes columbusIssueMarkerPulse': {
              '0%, 100%': {
                boxShadow: `0 0 0 7px ${toneStyles.glow}, 0 0 22px ${toneStyles.glow}`,
                transform: 'translate(-50%, -50%) scale(1)',
              },
              '50%': {
                boxShadow: '0 0 0 10px rgba(255, 69, 69, 0.18), 0 0 30px rgba(255, 69, 69, 0.56)',
                transform: 'translate(-50%, -50%) scale(1.07)',
              },
            },
            '@keyframes aiTourMarkerPulse': {
              '0%, 100%': {
                boxShadow: `0 0 0 8px ${(tourAccentColor ?? toneStyles.color)}32, 0 0 28px ${(tourAccentColor ?? toneStyles.color)}70`,
                transform: 'translate(-50%, -50%) scale(1)',
              },
              '50%': {
                boxShadow: `0 0 0 12px ${(tourAccentColor ?? toneStyles.color)}28, 0 0 36px ${(tourAccentColor ?? toneStyles.color)}88`,
                transform: 'translate(-50%, -50%) scale(1.08)',
              },
            },
            '@keyframes aiTourMarkerRipple': {
              '0%': {
                opacity: 0.76,
                transform: 'scale(0.8)',
              },
              '100%': {
                opacity: 0,
                transform: 'scale(1.38)',
              },
            },
            '@keyframes columbusIssueMarkerRipple': {
              '0%': {
                opacity: 0.72,
                transform: 'scale(0.72)',
              },
              '100%': {
                opacity: 0,
                transform: 'scale(1.34)',
              },
            },
          }}
        >
          {markerIcon}
        </Box>
        <Paper
          className="global-site-label"
          elevation={0}
          sx={{
            position: 'absolute',
            left: labelOffsetX,
            top: labelOffsetY,
            px: 1,
            py: 0.65,
            borderRadius: 1.2,
            bgcolor: 'rgba(7, 19, 35, 0.86)',
            border: '1px solid rgba(119, 151, 190, 0.25)',
            color: '#FFFFFF',
            whiteSpace: 'nowrap',
            boxShadow: '0 14px 32px rgba(0,0,0,0.24)',
            opacity: isDimmed ? 0.24 : 1,
            filter: isDimmed ? dimmedLabelFilter : 'none',
            transition: 'opacity 180ms ease, filter 180ms ease, border-color 180ms ease',
            borderColor: isDimmed ? 'rgba(194, 212, 235, 0.1)' : 'rgba(119, 151, 190, 0.25)',
          }}
        >
          <Typography sx={{fontSize: siteNameFontSize, fontWeight: 900, lineHeight: 1.1}}>{site.name}</Typography>
          <Box sx={{display: 'grid', gap: 0.2, mt: 0.35}}>
            {visibleMetrics.map((metric) => {
              const metricDefinition = getMetricDefinition(metric);
              const metricValue = getSiteMetricValue(site, metric);

              return (
                <Box key={metric} sx={{display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 1}}>
                  <Typography sx={{fontSize: 10, color: '#9EB2C8', fontWeight: 850, lineHeight: 1.25}}>
                    {metricDefinition.label}
                  </Typography>
                  <Typography sx={{fontSize: 11, color: toneStyles.color, fontWeight: 900, lineHeight: 1.25}}>
                    {metricDefinition.formatValue(metricValue)}
                  </Typography>
                </Box>
              );
            })}
            {hiddenMetricCount ? (
              <Typography sx={{fontSize: 10, color: '#B5C6DA', fontWeight: 850, lineHeight: 1.25}}>
                +{hiddenMetricCount} more
              </Typography>
            ) : null}
          </Box>
        </Paper>
        {hasColumbusHover ? <ColumbusWestHoverCard /> : null}
        {hasFourOaksHover ? <FourOaksHoverCard /> : null}
        {hasFranklinLakesHover ? <FranklinLakesHoverCard /> : null}
      </Box>
    </Box>
  );
}

const columbusHoverCards = [
  {
    icon: <SafetyIcon sx={{fontSize: 22}} />,
    label: 'Safety',
    metric: 'TRIR',
    value: '0.02',
    valueColor: '#67D05B',
    target: 'Target ≤ 0.00',
    trendColor: '#67D05B',
    trend: [24, 22, 25, 26, 30, 27, 32, 28, 30, 26, 33, 32],
    bars: null,
    details: [
      ['Incidents (YTD)', '2'],
      ['Days w/o incidents', '2'],
    ],
  },
  {
    icon: <QualityIcon sx={{fontSize: 22}} />,
    label: 'Quality',
    metric: 'Scrap Rate',
    value: '5.2%',
    valueColor: '#FF453D',
    target: 'Target ≤ 2.5%',
    trendColor: '#FF453D',
    trend: [20, 22, 24, 28, 29, 26, 22, 20, 17, 19, 18, 21],
    bars: null,
    details: [
      ['Scrap (units)', '63'],
      ['Top Issue', 'Dimension Out'],
    ],
  },
  {
    icon: <DeliveryIcon sx={{fontSize: 22}} />,
    label: 'Delivery',
    metric: 'Prod. vs Target',
    value: '72%',
    valueColor: '#FF453D',
    target: 'Target 100%',
    trendColor: '#FF453D',
    trend: null,
    bars: [18, 22, 19, 28, 34, 24, 38, 31, 36, 24],
    details: [
      ['Production', '1,200 / 1,660'],
      ['Plan Adherence', '72%'],
    ],
  },
  {
    icon: <CostIcon sx={{fontSize: 22}} />,
    label: 'Cost',
    metric: 'Cost vs Budget',
    value: '+12%',
    valueColor: '#FF453D',
    target: 'Target 0%',
    trendColor: '#FF453D',
    trend: [18, 18, 22, 21, 27, 24, 22, 19, 21, 24, 25, 23],
    bars: null,
    details: [
      ['Total Cost', '$ 696K'],
      ['Top Driver', 'Quality Issues'],
    ],
  },
  {
    icon: <PeopleIcon sx={{fontSize: 22}} />,
    label: 'People',
    metric: 'Absenteeism',
    value: '15%',
    valueColor: '#FF453D',
    target: 'Target ≤ 5%',
    trendColor: '#FF453D',
    trend: null,
    bars: [24, 25, 39, 28, 22, 48, 28, 18, 56, 20],
    details: [
      ['Overtime (hrs)', '420'],
      ['Turnover (YTD)', '10%'],
    ],
  },
] satisfies HoverSummaryMetricCard[];

const fourOaksHoverCards = [
  {
    icon: <SafetyIcon sx={{fontSize: 22}} />,
    label: 'Service',
    metric: 'OTIF Performance',
    value: '96.8%',
    valueColor: '#FF453D',
    target: 'Target >= 98.0%',
    trendColor: '#FF453D',
    trend: [22, 24, 23, 26, 25, 28, 30, 27, 25, 23, 26, 29],
    bars: null,
    details: [
      ['Late Orders', '42'],
      ['Claims Line Failure', '6'],
    ],
  },
  {
    icon: <DeliveryIcon sx={{fontSize: 22}} />,
    label: 'Flow',
    metric: 'Cases Shipped',
    value: '48,200',
    valueColor: '#FFFFFF',
    target: 'Target 50,000',
    trendColor: '#FF453D',
    trend: null,
    bars: [25, 19, 31, 35, 24, 20, 33, 30, 38, 45],
    details: [
      ['Wave Completion', '91%'],
      ['PLOD', '18'],
    ],
  },
  {
    icon: <PeopleIcon sx={{fontSize: 22}} />,
    label: 'Productivity',
    metric: 'Cases per Paid Hour',
    value: '41.2',
    valueColor: '#FF453D',
    target: 'Target >= 45',
    trendColor: '#FF453D',
    trend: [26, 31, 28, 34, 32, 37, 42, 36, 33, 35, 31, 38],
    bars: null,
    details: [
      ['Paid Hours', '1,170'],
      ['Utilization', '84%'],
    ],
  },
  {
    icon: <InventoryIcon sx={{fontSize: 22}} />,
    label: 'Inventory',
    metric: 'Inventory Accuracy',
    value: '98.6%',
    valueColor: '#67D05B',
    target: 'Target >= 99.5%',
    trendColor: '#67D05B',
    trend: [38, 40, 37, 42, 39, 44, 48, 41, 45, 43, 39, 46],
    bars: null,
    details: [
      ['Location Errors', '29'],
      ['Cycle Count Variance', '0.8%'],
    ],
  },
  {
    icon: <QualityIcon sx={{fontSize: 22}} />,
    label: 'Quality',
    metric: 'Warehouse Damage Scrap',
    value: '1.9%',
    valueColor: '#FF453D',
    target: 'Target <= 1.0%',
    trendColor: '#FF453D',
    trend: null,
    bars: [14, 21, 25, 15, 22, 13, 24, 35, 15, 26, 30],
    details: [
      ['Damaged Cases', '112'],
      ['Claims', '6'],
    ],
  },
] satisfies HoverSummaryMetricCard[];

const franklinLakesHoverCards = [
  {
    icon: <OfficeIcon sx={{fontSize: 22}} />,
    label: 'Building Health',
    metric: 'Composite Score',
    value: '78%',
    valueColor: '#FF453D',
    target: 'Target ≥ 85%',
    trendColor: '#FF453D',
    trend: [24, 26, 25, 29, 31, 35, 32, 28, 26, 30, 32, 31],
    bars: null,
    details: [
      ['Space', '80%'],
      ['People', '90%'],
      ['Energy', '72%'],
      ['Utilities/Alarms', '70%'],
    ],
  },
  {
    icon: <PeopleIcon sx={{fontSize: 22}} />,
    label: 'People',
    metric: 'People on Site',
    value: '1,240',
    valueColor: '#FFFFFF',
    target: 'Expected 1,180',
    trendColor: '#FF453D',
    trend: null,
    bars: [28, 20, 34, 42, 26, 33, 45, 26, 44, 18, 45, 56],
    details: [
      ['Access Events', '2,486'],
      ['Visitors', '74'],
    ],
  },
  {
    icon: <EnergyIcon sx={{fontSize: 22}} />,
    label: 'Energy',
    metric: 'Energy Usage',
    value: '18.4 MWh',
    valueColor: '#FFFFFF',
    target: 'Target ≤ 17.0 MWh',
    trendColor: '#FF453D',
    trend: [22, 24, 23, 27, 31, 30, 25, 24, 22, 20, 24, 29],
    bars: null,
    details: [
      ['Peak Demand', '2.8 MW'],
      ['Carbon Impact', '6.2 tCO2e'],
    ],
  },
  {
    icon: <HvacIcon sx={{fontSize: 22}} />,
    label: 'HVAC',
    metric: 'HVAC Performance',
    value: '91%',
    valueColor: '#FF453D',
    target: 'Target ≥ 95%',
    trendColor: '#FF453D',
    trend: [34, 35, 33, 36, 35, 32, 31, 28, 29, 30, 28, 27],
    bars: null,
    details: [
      ['Utility Health', '94%'],
      ['Critical Assets Online', '38/41'],
    ],
  },
  {
    icon: <SafetyIcon sx={{fontSize: 22}} />,
    label: 'Safety',
    metric: 'Safety & Alarm Events',
    value: '7',
    valueColor: '#FF453D',
    target: 'Target 0 critical',
    trendColor: '#FF453D',
    trend: null,
    bars: [16, 28, 42, 22, 33, 27, 54, 18, 29, 44],
    details: [
      ['Fire Panel Events', '2'],
      ['Access Exceptions', '5'],
    ],
  },
] satisfies HoverSummaryMetricCard[];

function ColumbusWestHoverCard() {
  return (
    <Paper
      className="global-site-hover columbus-west-hover"
      elevation={0}
      onPointerDown={(event) => event.stopPropagation()}
      sx={{
        position: 'absolute',
        left: 18,
        top: -28,
        width: 760,
        height: 640,
        p: 0,
        borderRadius: 1.6,
        color: '#EAF2FF',
        bgcolor: 'rgba(3, 12, 22, 0.98)',
        border: '1px solid rgba(90, 111, 138, 0.54)',
        boxShadow: '0 28px 80px rgba(0,0,0,0.56), inset 0 0 0 1px rgba(255,255,255,0.03)',
        overflow: 'hidden',
        opacity: 0,
        visibility: 'hidden',
        transform: 'translate(12px, -20px)',
        transformOrigin: 'top left',
        transition: 'opacity 120ms ease, transform 120ms ease, visibility 120ms ease',
        pointerEvents: 'auto',
        '&::before': {
          content: '""',
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: '72%',
          width: 5,
          bgcolor: '#FF342D',
          boxShadow: '0 0 20px rgba(255, 52, 45, 0.75)',
        },
      }}
    >
      <Box sx={{height: '100%', display: 'grid', gridTemplateRows: '78px 68px 332px 108px 54px'}}>
        <Box sx={{display: 'grid', gridTemplateColumns: 'minmax(0, 1.22fr) 112px 118px 132px 24px', alignItems: 'center', gap: 0, px: 2.2, borderBottom: '1px solid rgba(111, 132, 160, 0.16)'}}>
          <Box sx={{minWidth: 0}}>
            <Box sx={{display: 'flex', alignItems: 'center', gap: 0.8}}>
              <Typography sx={{fontSize: 20, color: '#FFFFFF', fontWeight: 900, lineHeight: 1}}>Columbus West</Typography>
              <Box sx={{width: 8, height: 8, borderRadius: '50%', bgcolor: '#FF332C'}} />
              <Typography sx={{fontSize: 13, color: '#FF453D', fontWeight: 900}}>Issue</Typography>
            </Box>
            <Typography sx={{fontSize: 13, color: '#0BA7FF', fontWeight: 850, mt: 1.05}}>
              Open Control Tower Site <Box component="span" sx={{ml: 0.5}}>→</Box>
            </Typography>
          </Box>
          <HoverTopMetric label="OEE" value="72%" tone="#FF453D" large />
          <HoverTopMetric label="Production" value="1,200 units" />
          <HoverTopMetric label="Time Period" value="Last 24 Hours" />
          <Typography sx={{fontSize: 29, color: '#78879A', lineHeight: 1, mb: 2.6}}>×</Typography>
        </Box>

        <Box sx={{display: 'grid', gridTemplateColumns: 'minmax(0, 1.22fr) 112px minmax(0, 1fr)', alignItems: 'center', px: 2.2, borderBottom: '1px solid rgba(111, 132, 160, 0.13)'}}>
          <Box>
            <Typography sx={{fontSize: 12, color: '#B5C2D2', lineHeight: 1}}>Top Loss</Typography>
            <Typography sx={{fontSize: 15, color: '#FF453D', fontWeight: 900, mt: 0.55}}>Breakdown (Line 4)</Typography>
          </Box>
          <Box sx={{height: '100%', borderLeft: '1px solid rgba(111,132,160,0.18)', pl: 2.2, display: 'grid', alignContent: 'center'}}>
            <Typography sx={{fontSize: 12, color: '#B5C2D2', lineHeight: 1}}>vs Yesterday</Typography>
            <Typography sx={{fontSize: 15, color: '#FF453D', fontWeight: 900, mt: 0.55}}>↓ -6pp</Typography>
          </Box>
          <Box sx={{pl: 2.2}}>
            <HoverTrendLine values={[24, 30, 33, 38, 35, 37, 31, 33, 29, 32, 28, 34, 31, 36, 39, 44, 41, 39, 36, 37, 34, 31, 35, 30, 28, 33]} tone="#FF453D" width={150} height={30} />
          </Box>
        </Box>

        <Box sx={{px: 2.2, py: 1.35, borderBottom: '1px solid rgba(111,132,160,0.13)'}}>
          <Typography sx={{fontSize: 14, color: '#FFFFFF', fontWeight: 850, mb: 1.35}}>SQDCP Summary</Typography>
          <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: 1.15}}>
            {columbusHoverCards.map((card) => <HoverSummaryCard key={card.label} card={card} />)}
          </Box>
        </Box>

        <Box sx={{px: 1.55, py: 1.05}}>
          <Typography sx={{fontSize: 14, color: '#FFFFFF', mb: 1}}>Key Alerts</Typography>
          <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 1.15}}>
            <HoverAlert title="Breakdown on Line 4" detail="Downtime impact: 2.3 hrs" />
            <HoverAlert title="High Scrap Rate" detail="Above target for 3 days" />
            <HoverAlert title="Overtime Above Normal" detail="+18% vs. weekly avg" />
          </Box>
        </Box>

        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, borderTop: '1px solid rgba(111,132,160,0.13)', color: '#9BABBF'}}>
          <Typography sx={{fontSize: 12}}>↻ Last Update: 10:24 AM</Typography>
          <Typography sx={{fontSize: 12}}>All times in local time ⓘ</Typography>
        </Box>
      </Box>
    </Paper>
  );
}

function FourOaksHoverCard() {
  return (
    <Paper
      className="global-site-hover four-oaks-hover"
      elevation={0}
      onPointerDown={(event) => event.stopPropagation()}
      sx={{
        position: 'absolute',
        left: 18,
        top: -28,
        width: 760,
        height: 640,
        p: 0,
        borderRadius: 1.6,
        color: '#EAF2FF',
        bgcolor: 'rgba(3, 12, 22, 0.98)',
        border: '1px solid rgba(90, 111, 138, 0.54)',
        boxShadow: '0 28px 80px rgba(0,0,0,0.56), inset 0 0 0 1px rgba(255,255,255,0.03)',
        overflow: 'hidden',
        opacity: 0,
        visibility: 'hidden',
        transform: 'translate(12px, -20px)',
        transformOrigin: 'top left',
        transition: 'opacity 120ms ease, transform 120ms ease, visibility 120ms ease',
        pointerEvents: 'auto',
        '&::before': {
          content: '""',
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: '72%',
          width: 5,
          bgcolor: '#FF342D',
          boxShadow: '0 0 20px rgba(255, 52, 45, 0.75)',
        },
      }}
    >
      <Box sx={{height: '100%', display: 'grid', gridTemplateRows: '78px 68px 332px 108px 54px'}}>
        <Box sx={{display: 'grid', gridTemplateColumns: 'minmax(0, 1.25fr) 132px 132px 132px 24px', alignItems: 'center', gap: 0, px: 2.2, borderBottom: '1px solid rgba(111, 132, 160, 0.16)'}}>
          <Box sx={{minWidth: 0}}>
            <Box sx={{display: 'flex', alignItems: 'center', gap: 0.8}}>
              <Typography sx={{fontSize: 30, color: '#FFFFFF', fontWeight: 500, lineHeight: 1}}>Four Oaks</Typography>
              <Box sx={{width: 8, height: 8, borderRadius: '50%', bgcolor: '#FF332C'}} />
              <Typography sx={{fontSize: 14, color: '#FF453D', fontWeight: 900}}>Issue</Typography>
            </Box>
            <Typography sx={{fontSize: 14, color: '#0BA7FF', fontWeight: 850, mt: 1.05}}>
              Open Distribution Center Site <Box component="span" sx={{ml: 0.5}}>→</Box>
            </Typography>
          </Box>
          <HoverTopMetric label="OTIF Performance" value="96.8%" tone="#FF453D" large />
          <HoverTopMetric label="Cases Shipped" value="48,200 cases" />
          <HoverTopMetric label="Time Period" value="Last 24 Hours" />
          <Typography sx={{fontSize: 29, color: '#78879A', lineHeight: 1, mb: 2.6}}>×</Typography>
        </Box>

        <Box sx={{display: 'grid', gridTemplateColumns: 'minmax(0, 1.25fr) 132px minmax(0, 1fr)', alignItems: 'center', px: 2.2, borderBottom: '1px solid rgba(111, 132, 160, 0.13)'}}>
          <Box>
            <Typography sx={{fontSize: 12, color: '#B5C2D2', lineHeight: 1}}>Top Loss</Typography>
            <Typography sx={{fontSize: 15, color: '#FF453D', fontWeight: 900, mt: 0.55}}>Pallets Left Off Dock (Dock 4)</Typography>
          </Box>
          <Box sx={{height: '100%', borderLeft: '1px solid rgba(111,132,160,0.18)', pl: 2.2, display: 'grid', alignContent: 'center'}}>
            <Typography sx={{fontSize: 12, color: '#B5C2D2', lineHeight: 1}}>vs Yesterday</Typography>
            <Typography sx={{fontSize: 15, color: '#FF453D', fontWeight: 900, mt: 0.55}}>↓ -1.4pp</Typography>
          </Box>
          <Box sx={{pl: 2.2}}>
            <HoverTrendLine values={[24, 30, 29, 36, 34, 39, 37, 42, 40, 35, 36, 31, 34, 38, 36, 33, 37, 42, 45, 43, 40, 38, 36, 37, 34, 38]} tone="#FF453D" width={150} height={30} />
          </Box>
        </Box>

        <Box sx={{px: 2.2, py: 1.35, borderBottom: '1px solid rgba(111,132,160,0.13)'}}>
          <Typography sx={{fontSize: 15, color: '#FFFFFF', fontWeight: 850, mb: 1.35}}>Distribution Center Summary</Typography>
          <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: 1.15}}>
            {fourOaksHoverCards.map((card) => <HoverSummaryCard key={card.label} card={card} />)}
          </Box>
        </Box>

        <Box sx={{px: 1.55, py: 1.05}}>
          <Typography sx={{fontSize: 14, color: '#FFFFFF', mb: 1}}>Key Alerts</Typography>
          <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 1.15}}>
            <HoverAlert title="Location Errors Spike" detail="29 open in Aisle B" />
            <HoverAlert title="PLOD Above Threshold" detail="18 pallets left off dock" />
            <HoverAlert title="Claims Line Failure" detail="+6 cases today" />
          </Box>
        </Box>

        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, borderTop: '1px solid rgba(111,132,160,0.13)', color: '#9BABBF'}}>
          <Typography sx={{fontSize: 12}}>↻ Last Update: 10:24 AM</Typography>
          <Typography sx={{fontSize: 12}}>All times in local time ⓘ</Typography>
        </Box>
      </Box>
    </Paper>
  );
}

function FranklinLakesHoverCard() {
  return (
    <Paper
      className="global-site-hover franklin-lakes-hover"
      elevation={0}
      onPointerDown={(event) => event.stopPropagation()}
      sx={{
        position: 'absolute',
        left: 18,
        top: -28,
        width: 1240,
        height: 1224,
        p: 0,
        borderRadius: 1.6,
        color: '#EAF2FF',
        bgcolor: 'rgba(3, 12, 22, 0.98)',
        border: '1px solid rgba(90, 111, 138, 0.54)',
        boxShadow: '0 28px 80px rgba(0,0,0,0.56), inset 0 0 0 1px rgba(255,255,255,0.03)',
        overflow: 'hidden',
        opacity: 0,
        visibility: 'hidden',
        transform: 'translate(12px, -20px)',
        transformOrigin: 'top left',
        transition: 'opacity 120ms ease, transform 120ms ease, visibility 120ms ease',
        pointerEvents: 'auto',
        '&::before': {
          content: '""',
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: '72%',
          width: 5,
          bgcolor: '#FF342D',
          boxShadow: '0 0 20px rgba(255, 52, 45, 0.75)',
        },
      }}
    >
      <Box sx={{height: '100%', display: 'grid', gridTemplateRows: '174px 114px 650px 208px 78px'}}>
        <Box sx={{display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 240px 180px 156px 174px 42px', alignItems: 'center', gap: 0, px: 5, borderBottom: '1px solid rgba(111, 132, 160, 0.22)'}}>
          <Box sx={{minWidth: 0}}>
            <Box sx={{display: 'flex', alignItems: 'center', gap: 1.6}}>
              <Typography sx={{fontSize: 42, color: '#FFFFFF', fontWeight: 500, lineHeight: 1}}>Franklin Lakes</Typography>
              <Box sx={{width: 14, height: 14, borderRadius: '50%', bgcolor: '#FF332C'}} />
              <Typography sx={{fontSize: 24, color: '#FF453D', fontWeight: 700}}>Issue</Typography>
            </Box>
            <Typography sx={{fontSize: 24, color: '#0BA7FF', fontWeight: 500, mt: 2.3}}>
              Open Office Building Site <Box component="span" sx={{ml: 0.5}}>→</Box>
            </Typography>
          </Box>
          <OfficeTopMetric
            label={(
              <Box component="span" sx={{display: 'inline-flex', alignItems: 'center', gap: 1.1}}>
                Building Health
                <Box component="span" sx={{width: 18, height: 18, borderRadius: '50%', border: '2px solid currentColor', display: 'inline-grid', placeItems: 'center', fontSize: 13, fontWeight: 700, lineHeight: 1}}>i</Box>
              </Box>
            )}
            value="78%"
            subValue="Poor"
            tone="#FF453D"
            large
          />
          <OfficeTopMetric label="People on Site" value="1,240" subValue="people" />
          <OfficeTopMetric label="Energy Usage" value="18.4" subValue="MWh" />
          <OfficeTopMetric label="Time Period" value="Last 24 Hours" />
          <Typography sx={{fontSize: 52, color: '#8E9AAA', lineHeight: 1, mb: 7}}>×</Typography>
        </Box>

        <Box sx={{display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 220px minmax(0, 1fr)', alignItems: 'center', px: 5, borderBottom: '1px solid rgba(111, 132, 160, 0.18)'}}>
          <Box>
            <Typography sx={{fontSize: 24, color: '#B5C2D2', lineHeight: 1}}>Top Issue</Typography>
            <Typography sx={{fontSize: 30, color: '#FF453D', fontWeight: 500, mt: 1.8}}>HVAC Performance Drop (East Wing)</Typography>
          </Box>
          <Box sx={{height: '100%', borderLeft: '1px solid rgba(111,132,160,0.24)', pl: 3.2, display: 'grid', alignContent: 'center'}}>
            <Typography sx={{fontSize: 24, color: '#B5C2D2', lineHeight: 1}}>vs Yesterday</Typography>
            <Typography sx={{fontSize: 26, color: '#FF453D', fontWeight: 600, mt: 1.8}}>↓ -4.2pp</Typography>
          </Box>
          <Box sx={{pl: 3.5}}>
            <HoverTrendLine values={[24, 27, 29, 34, 32, 38, 36, 42, 40, 46, 43, 39, 36, 34, 30, 32, 35, 39, 42, 40, 37, 33, 31, 34, 36, 39]} tone="#FF453D" width={330} height={52} />
          </Box>
        </Box>

        <Box sx={{px: 3.5, py: 2.8, borderBottom: '1px solid rgba(111,132,160,0.16)'}}>
          <Typography sx={{fontSize: 30, color: '#FFFFFF', fontWeight: 600, mb: 2.2}}>Office Building Summary</Typography>
          <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: 1.5, height: 550}}>
            {franklinLakesHoverCards.map((card) => <OfficeHoverSummaryCard key={card.label} card={card} />)}
          </Box>
        </Box>

        <Box sx={{mx: 3.5, my: 2, px: 2, py: 2, border: '1px solid rgba(111,132,160,0.20)', borderRadius: 1.6}}>
          <Typography sx={{fontSize: 28, color: '#FFFFFF', mb: 1.8}}>Active Alerts</Typography>
          <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 1.7}}>
            <OfficeAlert title="HVAC Efficiency Low" detail="East Wing below target for 3 hours" />
            <OfficeAlert title="High After-Hours Access" detail="North entrance above weekly avg" />
            <OfficeAlert title="Energy Usage Spike" detail="+9% vs. baseline today" />
          </Box>
        </Box>

        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 4.8, borderTop: '1px solid rgba(111,132,160,0.13)', color: '#9BABBF'}}>
          <Typography sx={{fontSize: 22}}>↻ Last Update: 10:24 AM</Typography>
          <Typography sx={{fontSize: 22}}>All times in local time ⓘ</Typography>
        </Box>
      </Box>
    </Paper>
  );
}

function HoverTopMetric({
  label,
  large = false,
  tone = '#FFFFFF',
  value,
}: {
  label: string;
  large?: boolean;
  tone?: string;
  value: string;
}) {
  return (
    <Box sx={{height: 46, borderLeft: '1px solid rgba(111,132,160,0.18)', pl: 2}}>
      <Typography sx={{fontSize: 12, color: '#C8D3E1', lineHeight: 1.1}}>{label}</Typography>
      <Typography sx={{fontSize: large ? 28 : 18, color: tone, fontWeight: large ? 500 : 850, lineHeight: 1.05, mt: large ? 0.4 : 0.75}}>{value}</Typography>
    </Box>
  );
}

function OfficeTopMetric({
  label,
  large = false,
  subValue,
  tone = '#FFFFFF',
  value,
}: {
  label: ReactNode;
  large?: boolean;
  subValue?: string;
  tone?: string;
  value: string;
}) {
  return (
    <Box sx={{height: 108, borderLeft: '1px solid rgba(111,132,160,0.30)', pl: 4.2, display: 'grid', alignContent: 'center'}}>
      <Typography component="div" sx={{fontSize: 22, color: '#C8D3E1', lineHeight: 1.1, whiteSpace: 'nowrap'}}>{label}</Typography>
      <Box sx={{display: 'flex', alignItems: 'baseline', gap: 1.2, mt: 1}}>
        <Typography sx={{fontSize: large ? 68 : 30, color: tone, fontWeight: 500, lineHeight: 0.95, whiteSpace: 'nowrap'}}>{value}</Typography>
        {subValue && !large ? <Typography sx={{fontSize: 18, color: '#FFFFFF'}}>{subValue}</Typography> : null}
      </Box>
      {subValue && large ? <Typography sx={{fontSize: 22, color: tone, mt: 0.8}}>{subValue}</Typography> : null}
    </Box>
  );
}

function HoverSummaryCard({
  card,
}: {
  card: HoverSummaryMetricCard;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        height: 282,
        p: 1.05,
        borderRadius: 1.2,
        bgcolor: 'rgba(10, 23, 38, 0.86)',
        border: '1px solid rgba(111,132,160,0.20)',
        overflow: 'hidden',
      }}
    >
      <Box sx={{display: 'flex', alignItems: 'center', gap: 0.75, color: '#C6D3E3'}}>
        <Box sx={{width: 27, height: 27, display: 'grid', placeItems: 'center', borderRadius: '50%', border: '1px solid rgba(178,194,213,0.55)'}}>
          {card.icon}
        </Box>
        <Typography sx={{fontSize: 13, color: '#FFFFFF', fontWeight: 850}}>{card.label}</Typography>
      </Box>
      <Typography sx={{fontSize: 12, color: '#C9D5E4', mt: 1.25}}>{card.metric}</Typography>
      <Typography sx={{fontSize: 29, color: card.valueColor, fontWeight: 500, lineHeight: 1.05, mt: 0.25}}>{card.value}</Typography>
      <Typography sx={{fontSize: 12, color: '#9DCBFF', mt: 0.55}}>{card.target}</Typography>
      <Box sx={{height: 42, mt: 0.45, borderTop: '1px dashed rgba(52,141,255,0.72)', display: 'grid', alignItems: 'end'}}>
        {card.trend ? (
          <HoverTrendLine values={card.trend} tone={card.trendColor} width={82} height={30} />
        ) : (
          <HoverMiniBars values={card.bars ?? []} max={60} />
        )}
      </Box>
      <Box sx={{mt: 1, pt: 1, borderTop: '1px solid rgba(111,132,160,0.14)', display: 'grid', gap: 1}}>
        {card.details.map(([label, value]) => (
          <Box key={label}>
            <Typography sx={{fontSize: 11, color: '#94A5B8'}}>• {label}</Typography>
            <Typography sx={{fontSize: 13, color: '#FFFFFF', mt: 0.3}}>{value}</Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  );
}

function OfficeHoverSummaryCard({
  card,
}: {
  card: HoverSummaryMetricCard;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        height: '100%',
        p: 2,
        borderRadius: 1.2,
        bgcolor: 'rgba(10, 23, 38, 0.86)',
        border: '1px solid rgba(111,132,160,0.25)',
        overflow: 'hidden',
        display: 'grid',
        gridTemplateRows: '94px 162px 98px minmax(0, 1fr)',
      }}
    >
      <Box sx={{display: 'flex', alignItems: 'flex-start', gap: 1.15, color: '#E9F2FF', minWidth: 0}}>
        <Box sx={{width: 48, height: 54, display: 'grid', placeItems: 'center', flex: '0 0 auto', '& .MuiSvgIcon-root': {fontSize: 46}}}>
          {card.icon}
        </Box>
        <Box sx={{minWidth: 0, flex: 1}}>
          <Typography sx={{fontSize: card.label === 'Building Health' ? 23 : 24, color: '#FFFFFF', fontWeight: 500, lineHeight: 1.12, whiteSpace: 'nowrap'}}>{card.label}</Typography>
          <Typography sx={{fontSize: 18, color: '#C9D5E4', lineHeight: 1.2, mt: 0.65, whiteSpace: 'nowrap'}}>{card.metric}</Typography>
        </Box>
      </Box>
      <Box>
        <Typography sx={{fontSize: card.value.length > 8 ? 50 : 62, color: card.valueColor, fontWeight: 500, lineHeight: 1}}>{card.value}</Typography>
        {card.label === 'Building Health' ? (
          <Typography sx={{fontSize: 24, color: '#FF453D', lineHeight: 1.1, mt: 0.6}}>Poor</Typography>
        ) : null}
        <Typography sx={{fontSize: 22, color: '#0BA7FF', mt: 1.6, whiteSpace: 'nowrap'}}>{card.target}</Typography>
      </Box>
      <Box sx={{height: 94, borderTop: '2px dashed rgba(52,141,255,0.72)', display: 'grid', alignItems: 'end'}}>
        {card.trend ? (
          <HoverTrendLine values={card.trend} tone={card.trendColor} width={205} height={60} />
        ) : (
          <OfficeMiniBars values={card.bars ?? []} max={60} />
        )}
      </Box>
      <Box sx={{pt: 1.8, borderTop: '1px solid rgba(111,132,160,0.18)', display: 'grid', gap: 1.2, alignContent: 'start', minHeight: 0}}>
        {card.label === 'Building Health' ? (
          <Typography sx={{fontSize: 20, color: '#FFFFFF'}}>Score Breakdown</Typography>
        ) : null}
        {card.details.map(([label, value]) => (
          <Box key={label} sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.2}}>
            <Typography sx={{fontSize: 20, color: '#C4CEDB', whiteSpace: 'nowrap'}}>• {label}</Typography>
            <Typography sx={{fontSize: 24, color: '#FFFFFF', whiteSpace: 'nowrap'}}>{value}</Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  );
}

function OfficeMiniBars({max, values}: {max: number; values: number[]}) {
  return (
    <Box sx={{height: 60, display: 'flex', alignItems: 'end', gap: 9}}>
      {values.map((value, index) => (
        <Box key={`${value}-${index}`} sx={{width: 11, height: `${Math.max(10, (value / max) * 60)}px`, bgcolor: index % 3 === 1 ? '#2BA3FF' : '#FF453D'}} />
      ))}
    </Box>
  );
}

function OfficeAlert({detail, title}: {detail: string; title: string}) {
  return (
    <Paper elevation={0} sx={{height: 112, px: 2.6, display: 'flex', alignItems: 'center', gap: 2, borderRadius: 1.2, bgcolor: 'rgba(9, 23, 39, 0.84)', border: '2px solid rgba(255,69,61,0.86)'}}>
      <Typography sx={{fontSize: 38, color: '#FF453D'}}>⚠</Typography>
      <Box sx={{minWidth: 0}}>
        <Typography sx={{fontSize: 26, color: '#FF453D', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{title}</Typography>
        <Typography sx={{fontSize: 22, color: '#FFFFFF', mt: 0.75, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{detail}</Typography>
      </Box>
    </Paper>
  );
}

function HoverAlert({
  detail,
  title,
}: {
  detail: string;
  title: string;
}) {
  return (
    <Paper elevation={0} sx={{height: 58, px: 1, display: 'flex', alignItems: 'center', gap: 0.85, borderRadius: 1, bgcolor: 'rgba(9, 23, 39, 0.84)', border: '1px solid rgba(255,69,61,0.36)'}}>
      <Typography sx={{fontSize: 17, color: '#FF453D'}}>⚠</Typography>
      <Box sx={{minWidth: 0}}>
        <Typography sx={{fontSize: 12, color: '#FF453D', fontWeight: 900, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{title}</Typography>
        <Typography sx={{fontSize: 12, color: '#FFFFFF', mt: 0.35, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{detail}</Typography>
      </Box>
    </Paper>
  );
}

function HoverTrendLine({
  height,
  tone,
  values,
  width,
}: {
  height: number;
  tone: string;
  values: number[];
  width: number;
}) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(max - min, 1);
  const points = values.map((value, index) => {
    const x = (index / Math.max(values.length - 1, 1)) * width;
    const y = height - ((value - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(' ');

  return (
    <Box sx={{width, height, display: 'flex', alignItems: 'center'}}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-hidden="true">
        <polyline points={points} fill="none" stroke={tone} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Box>
  );
}

function HoverMiniBars({max, values}: {max: number; values: number[]}) {
  return (
    <Box sx={{height: 30, display: 'flex', alignItems: 'end', gap: 0.55}}>
      {values.map((value, index) => (
        <Box key={`${value}-${index}`} sx={{width: 6, height: `${Math.max(4, (value / max) * 30)}px`, bgcolor: '#FF453D'}} />
      ))}
    </Box>
  );
}

function TrendLine({
  values,
  tone,
  width = 70,
  height = 24,
  fill = false,
}: {
  values: number[];
  tone: string;
  width?: number;
  height?: number;
  fill?: boolean;
}) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(max - min, 1);
  const points = values
    .map((value, index) => {
      const x = (index / Math.max(values.length - 1, 1)) * width;
      const normalized = (value - min) / range;
      const y = height - normalized * (height - 4) - 2;
      return `${x},${y}`;
    })
    .join(' ');
  const fillPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <Box sx={{width, height, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        {fill ? <polygon points={fillPoints} fill={tone} opacity="0.14" /> : null}
        <polyline
          points={points}
          fill="none"
          stroke={tone}
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Box>
  );
}

function MapModeButton({
  active,
  disabled = false,
  label,
  onClick,
  tint,
}: {
  active: boolean;
  disabled?: boolean;
  label: string;
  onClick: () => void;
  tint: string;
}) {
  return (
    <Button
      startIcon={<Box sx={{width: 12, height: 12, borderRadius: '50%', bgcolor: active ? tint : '#6B7D94', boxShadow: active ? `0 0 12px ${tint}66` : 'none'}} />}
      disabled={disabled}
      onClick={onClick}
      sx={{
        height: 34,
        px: 1.4,
        color: active ? tint : '#A6B4C5',
        bgcolor: active ? `${tint}20` : 'transparent',
        border: active ? `1px solid ${tint}73` : '1px solid transparent',
        textTransform: 'none',
        fontWeight: active ? 900 : 800,
        opacity: disabled ? 0.38 : 1,
      }}
    >
      {label}
    </Button>
  );
}

function HeatmapOverlay({
  mapBounds,
  sites,
  toneByName,
}: {
  mapBounds: {offsetX: number; offsetY: number; width: number; height: number} | null;
  sites: GlobalSite[];
  toneByName: Map<string, SiteTone>;
}) {
  if (!mapBounds) return null;

  return (
    <Box sx={{position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none'}}>
      {sites.map((site) => {
        const point = getSiteMapPoint(site, mapBounds);
        if (!point) return null;

        const tone = siteToneMap[toneByName.get(site.name) ?? site.tone];
        const size = 120 + (site.oee % 12) * 8;

        return (
          <Box
            key={site.name}
            sx={{
              position: 'absolute',
              left: point.x,
              top: point.y,
              width: size,
              height: size,
              transform: 'translate(-50%, -50%)',
              borderRadius: '50%',
              background: `radial-gradient(circle, ${tone.color}55 0%, ${tone.color}20 36%, transparent 75%)`,
              filter: 'blur(18px)',
              opacity: toneByName.get(site.name) === 'issue' ? 0.95 : 0.72,
              mixBlendMode: 'screen',
            }}
          />
        );
      })}
    </Box>
  );
}

function FlowRoutesOverlay({
  mapBounds,
  routes,
  sites,
  highlightedRouteIds,
}: {
  mapBounds: {offsetX: number; offsetY: number; width: number; height: number} | null;
  routes: FlowRoute[];
  sites: GlobalSite[];
  highlightedRouteIds: Set<string> | null;
}) {
  if (!mapBounds || !routes.length) return null;

  const siteByName = new Map(sites.map((site) => [site.name, site]));

  return (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        zIndex: 2,
        pointerEvents: 'none',
        '& .flow-travel': {
          animation: 'flowDashShift 3.6s linear infinite',
        },
        '@keyframes flowDashShift': {
          from: {strokeDashoffset: 0},
          to: {strokeDashoffset: -64},
        },
      }}
    >
      <svg width="100%" height="100%" aria-hidden="true">
        <defs>
          {(['normal', 'constrained', 'critical'] as FlowRouteSeverity[]).map((severity) => (
            <marker
              key={severity}
              id={`flow-arrow-${severity}`}
              markerWidth="10"
              markerHeight="10"
              refX="8.4"
              refY="4"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path d="M 0 0 L 8 4 L 0 8 z" fill={flowSeverityStyles[severity].color} opacity="0.9" />
            </marker>
          ))}
        </defs>
        {routes.map((route, index) => {
          const startSite = siteByName.get(route.from);
          const endSite = siteByName.get(route.to);
          if (!startSite || !endSite) return null;

          const start = getSiteMapPoint(startSite, mapBounds);
          const end = getSiteMapPoint(endSite, mapBounds);
          if (!start || !end) return null;

          const style = flowSeverityStyles[route.severity];
          const {path} = buildQuadraticFlowPath(start, end, route.curvature);
          const isDimmed = Boolean(highlightedRouteIds && !highlightedRouteIds.has(route.id));

          return (
            <g
              key={route.id}
              style={{
                opacity: isDimmed ? 0.15 : 1,
                filter: isDimmed ? 'saturate(0.2) brightness(1.45)' : 'none',
                transition: 'opacity 180ms ease, filter 180ms ease',
              }}
            >
              <path
                d={path}
                fill="none"
                stroke={style.color}
                strokeWidth="5.5"
                opacity="0.06"
                strokeLinecap="round"
              />
              <path
                d={path}
                fill="none"
                stroke={style.color}
                strokeWidth="1.9"
                opacity="0.18"
                strokeLinecap="round"
              />
              <path
                d={path}
                fill="none"
                stroke={style.color}
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeDasharray={style.dashArray}
                markerEnd={`url(#flow-arrow-${route.severity})`}
              />
              <path
                className="flow-travel"
                d={path}
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="0.8"
                opacity="0.72"
                strokeLinecap="round"
                strokeDasharray="2 18"
              />
              {[0, 1, 2].map((particleIndex) => (
                <circle
                  key={`${route.id}-particle-${particleIndex}`}
                  r={particleIndex === 1 ? 2.1 : 1.6}
                  fill={particleIndex === 1 ? '#FFFFFF' : style.color}
                  opacity={particleIndex === 1 ? 0.82 : 0.66}
                >
                  <animateMotion
                    dur={style.particleDuration}
                    begin={`${index * 0.18 + particleIndex * 1.15}s`}
                    repeatCount="indefinite"
                    path={path}
                  />
                </circle>
              ))}
            </g>
          );
        })}
      </svg>
    </Box>
  );
}

function AiTourTransferOverlay({
  accentColor,
  fromSiteName,
  mapBounds,
  sites,
  toSiteName,
  transitionKey,
}: {
  accentColor: string;
  fromSiteName: string | null;
  mapBounds: {offsetX: number; offsetY: number; width: number; height: number} | null;
  sites: GlobalSite[];
  toSiteName: string | null;
  transitionKey: number;
}) {
  if (!mapBounds || !fromSiteName || !toSiteName || fromSiteName === toSiteName) return null;

  const siteByName = new Map(sites.map((site) => [site.name, site]));
  const fromSite = siteByName.get(fromSiteName);
  const toSite = siteByName.get(toSiteName);
  if (!fromSite || !toSite) return null;

  const start = getSiteMapPoint(fromSite, mapBounds);
  const end = getSiteMapPoint(toSite, mapBounds);
  if (!start || !end) return null;

  const baseCurvature = Math.max(42, Math.min(110, Math.hypot(end.x - start.x, end.y - start.y) * 0.16));
  const signedCurvature = start.x <= end.x ? -baseCurvature : baseCurvature;
  const {path} = buildQuadraticFlowPath(start, end, signedCurvature);

  return (
    <Box
      key={`${transitionKey}-${fromSiteName}-${toSiteName}`}
      sx={{
        position: 'absolute',
        inset: 0,
        zIndex: 2,
        pointerEvents: 'none',
        opacity: 0,
        animation: `aiTourTransferFade ${aiTourTransferDurationMs}ms ease-out forwards`,
        '@keyframes aiTourTransferFade': {
          '0%': {opacity: 0},
          '12%': {opacity: 1},
          '78%': {opacity: 1},
          '100%': {opacity: 0},
        },
      }}
    >
      <svg width="100%" height="100%" aria-hidden="true">
        <path
          d={path}
          fill="none"
          stroke={accentColor}
          strokeWidth="10"
          strokeLinecap="round"
          opacity="0.08"
        />
        <path
          d={path}
          fill="none"
          stroke={accentColor}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeDasharray="10 12"
          opacity="0.58"
        >
          <animate attributeName="stroke-dashoffset" from="0" to="-44" dur="1.2s" repeatCount="1" fill="freeze" />
        </path>
        <path
          d={path}
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="1.05"
          strokeLinecap="round"
          strokeDasharray="2 18"
          opacity="0.88"
        >
          <animate attributeName="stroke-dashoffset" from="0" to="-84" dur="1.2s" repeatCount="1" fill="freeze" />
        </path>
        <circle r="3.4" fill="#FFFFFF" opacity="0.96">
          <animateMotion dur="1.15s" repeatCount="1" fill="freeze" path={path} />
        </circle>
        <circle r="6.8" fill={accentColor} opacity="0.22">
          <animateMotion dur="1.15s" repeatCount="1" fill="freeze" path={path} />
        </circle>
      </svg>
    </Box>
  );
}

function AiTourBootOverlay({
  accentColor,
  mapBounds,
  sites,
  targetSiteName,
}: {
  accentColor: string;
  mapBounds: {offsetX: number; offsetY: number; width: number; height: number} | null;
  sites: GlobalSite[];
  targetSiteName: string | null;
}) {
  if (!mapBounds || !targetSiteName) return null;

  const targetSite = sites.find((site) => site.name === targetSiteName);
  if (!targetSite) return null;

  const point = getSiteMapPoint(targetSite, mapBounds);
  if (!point) return null;

  return (
    <Box sx={{position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none'}}>
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle at ${point.x}px ${point.y}px, rgba(2,10,20,0.04) 0px, rgba(2,10,20,0.08) 84px, rgba(2,10,20,0.34) 168px, rgba(2,10,20,0.72) 360px, rgba(2,10,20,0.88) 100%)`,
          opacity: 0,
          animation: 'aiTourBootDim 1.45s ease-out forwards',
          '@keyframes aiTourBootDim': {
            '0%': {opacity: 0},
            '35%': {opacity: 0.44},
            '100%': {opacity: 1},
          },
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          left: point.x,
          top: point.y,
          width: 210,
          height: 210,
          transform: 'translate(-50%, -50%) scale(2.9)',
          borderRadius: '50%',
          border: `1px solid ${accentColor}5A`,
          boxShadow: `0 0 0 1px ${accentColor}18 inset, 0 0 48px ${accentColor}18`,
          opacity: 0,
          animation: 'aiTourBootFocus 1.45s cubic-bezier(0.22, 1, 0.36, 1) forwards',
          '@keyframes aiTourBootFocus': {
            '0%': {
              transform: 'translate(-50%, -50%) scale(2.9)',
              opacity: 0,
            },
            '18%': {
              opacity: 0.4,
            },
            '72%': {
              transform: 'translate(-50%, -50%) scale(1.15)',
              opacity: 0.88,
            },
            '100%': {
              transform: 'translate(-50%, -50%) scale(1)',
              opacity: 0.96,
            },
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            inset: 16,
            borderRadius: '50%',
            border: `1px solid ${accentColor}76`,
            opacity: 0,
            animation: 'aiTourBootInnerPulse 1.45s ease-out forwards',
          },
          '@keyframes aiTourBootInnerPulse': {
            '0%': {
              transform: 'scale(1.45)',
              opacity: 0,
            },
            '45%': {
              opacity: 0.82,
            },
            '100%': {
              transform: 'scale(1)',
              opacity: 0.22,
            },
          },
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          left: point.x,
          top: point.y,
          width: 12,
          height: 12,
          borderRadius: '50%',
          bgcolor: '#FFFFFF',
          boxShadow: `0 0 16px ${accentColor}AA, 0 0 34px ${accentColor}66`,
          transform: 'translate(-50%, -50%)',
          opacity: 0,
          animation: 'aiTourBootBeacon 1.45s ease-out forwards',
          '@keyframes aiTourBootBeacon': {
            '0%, 30%': {
              opacity: 0,
              transform: 'translate(-50%, -50%) scale(0.5)',
            },
            '60%': {
              opacity: 1,
              transform: 'translate(-50%, -50%) scale(1.18)',
            },
            '100%': {
              opacity: 0.92,
              transform: 'translate(-50%, -50%) scale(1)',
            },
          },
        }}
      />
    </Box>
  );
}

function BenchmarkDrawer({
  benchmarkKpi,
  benchmarkResult,
  benchmarkSiteNames,
  insightsVisible,
  kpiOptions,
  onClose,
  onGenerateInsights,
  onKpiChange,
  onPrimarySiteChange,
  onRun,
  onBenchmarkSitesChange,
  onTimePeriodChange,
  open,
  primarySiteName,
  siteOptions,
  timePeriod,
}: {
  benchmarkKpi: GlobalKpiKey;
  benchmarkResult: BenchmarkResult | null;
  benchmarkSiteNames: string[];
  insightsVisible: boolean;
  kpiOptions: Array<{icon: ReactNode; label: GlobalKpiKey}>;
  onClose: () => void;
  onGenerateInsights: () => void;
  onKpiChange: (kpi: GlobalKpiKey) => void;
  onPrimarySiteChange: (siteName: string) => void;
  onRun: () => void;
  onBenchmarkSitesChange: (siteNames: string[]) => void;
  onTimePeriodChange: (period: (typeof benchmarkTimePeriods)[number]) => void;
  open: boolean;
  primarySiteName: string;
  siteOptions: GlobalSite[];
  timePeriod: (typeof benchmarkTimePeriods)[number];
}) {
  if (!open) return null;

  const selectMenuSx = {
    mt: 0.8,
    bgcolor: '#0E1B30',
    border: '1px solid rgba(82,141,255,0.30)',
    borderRadius: 1.4,
    boxShadow: '0 18px 36px rgba(0,0,0,0.34)',
    '& .MuiMenuItem-root': {
      minHeight: 34,
      mx: 0.6,
      my: 0.35,
      borderRadius: 1,
      color: '#DDEBFF',
      fontSize: 13,
      fontWeight: 700,
    },
    '& .MuiMenuItem-root.Mui-selected': {
      bgcolor: 'rgba(52,141,255,0.18)',
    },
    '& .MuiMenuItem-root.Mui-selected:hover': {
      bgcolor: 'rgba(52,141,255,0.24)',
    },
  };
  const selectSx = {
    width: '100%',
    height: 40,
    px: 1.05,
    color: '#FFFFFF',
    bgcolor: 'rgba(9, 23, 39, 0.92)',
    border: '1px solid rgba(103, 131, 170, 0.42)',
    borderRadius: 1,
    fontSize: 12,
    fontWeight: 850,
    '& .MuiSelect-select': {
      display: 'flex',
      alignItems: 'center',
      minHeight: '0 !important',
      py: '0 !important',
      px: '0 !important',
    },
    '& .MuiSvgIcon-root': {color: '#8BA4C4'},
  };
  const selectedPrimarySite = siteOptions.find((site) => site.name === primarySiteName);
  const benchmarkSites = siteOptions.filter((site) => site.name !== primarySiteName);
  const primaryColor = '#FF5252';

  return (
    <Box sx={{position: 'fixed', inset: 0, zIndex: 60, pointerEvents: 'none'}}>
      <Box sx={{position: 'absolute', inset: 0, bgcolor: 'rgba(1,7,14,0.34)', pointerEvents: 'auto'}} onClick={onClose} />
      <Paper
        elevation={0}
        sx={{
          position: 'absolute',
          top: {xs: 54, sm: 52},
          right: 10,
          bottom: 10,
          width: {xs: 'calc(100vw - 20px)', sm: 600},
          overflow: 'hidden',
          pointerEvents: 'auto',
          display: 'grid',
          gridTemplateRows: 'auto minmax(0, 1fr)',
          color: '#EAF2FF',
          bgcolor: 'rgba(4, 14, 26, 0.98)',
          border: '1px solid rgba(82,141,255,0.28)',
          borderRadius: 1.4,
          boxShadow: '0 30px 80px rgba(0,0,0,0.58)',
        }}
      >
        <Box sx={{px: 2, py: 1.45, borderBottom: '1px solid rgba(119,151,190,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5}}>
          <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
            <SparkleIcon sx={{fontSize: 24, color: '#A78BFA'}} />
            <Box>
              <Typography sx={{fontSize: 20, color: '#FFFFFF', fontWeight: 950, lineHeight: 1}}>AI Benchmarking</Typography>
              <Typography sx={{fontSize: 11, color: '#9EB2C8', mt: 0.25}}>Compare site performance and uncover improvement opportunities.</Typography>
            </Box>
          </Box>
          <Button onClick={onClose} sx={{minWidth: 34, width: 34, height: 34, color: '#8BA4C4', borderRadius: 1}}>
            <CloseIcon sx={{fontSize: 18}} />
          </Button>
        </Box>

        <Box sx={{minHeight: 0, overflow: 'auto', display: 'flex', flexDirection: 'column'}}>
          <Box sx={{p: 1.6, borderBottom: '1px solid rgba(119,151,190,0.18)', bgcolor: 'rgba(6, 18, 32, 0.76)'}}>
            <BenchmarkSectionTitle index={1} title="Configure Benchmark" />
            <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 1.6, rowGap: 1.2, mt: 1.25}}>
              <Box>
                <Typography sx={{fontSize: 11, color: '#9EB2C8', fontWeight: 850, mb: 0.55}}>Primary Site</Typography>
                <Select
                  variant="standard"
                  disableUnderline
                  value={primarySiteName}
                  onChange={(event) => onPrimarySiteChange(event.target.value)}
                  renderValue={(selected) => {
                    const selectedSite = siteOptions.find((site) => site.name === selected);

                    return (
                      <Box sx={{display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0, width: '100%'}}>
                        <Box sx={{width: 11, height: 11, borderRadius: '50%', border: `2px solid ${selectedSite ? siteToneMap[selectedSite.tone].color : '#FF5252'}`, boxShadow: '0 0 10px rgba(255,82,82,0.45)', flex: '0 0 auto'}} />
                        <Typography sx={{fontSize: 12, color: '#FFFFFF', fontWeight: 950, minWidth: 0, flex: 1}} noWrap>{selected as string}</Typography>
                        <Typography sx={{fontSize: 13, color: '#8BA4C4', flex: '0 0 auto'}}>x</Typography>
                      </Box>
                    );
                  }}
                  sx={selectSx}
                  MenuProps={{PaperProps: {sx: selectMenuSx}}}
                >
                  {siteOptions.map((site) => (
                    <MenuItem key={site.name} value={site.name}>
                      <Box sx={{display: 'flex', alignItems: 'center', gap: 0.8}}>
                        <Box sx={{width: 9, height: 9, borderRadius: '50%', bgcolor: siteToneMap[site.tone].color}} />
                        {site.name}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </Box>
              <Box>
                <Typography sx={{fontSize: 11, color: '#9EB2C8', fontWeight: 850, mb: 0.55}}>Time Period</Typography>
                <Select
                  variant="standard"
                  disableUnderline
                  value={timePeriod}
                  onChange={(event) => onTimePeriodChange(event.target.value as (typeof benchmarkTimePeriods)[number])}
                  renderValue={(selected) => (
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0}}>
                      <CalendarIcon sx={{fontSize: 15, color: '#8BA4C4', flex: '0 0 auto'}} />
                      <Typography sx={{fontSize: 12, color: '#FFFFFF', fontWeight: 950}} noWrap>{selected as string}</Typography>
                    </Box>
                  )}
                  sx={selectSx}
                  MenuProps={{PaperProps: {sx: selectMenuSx}}}
                >
                  {benchmarkTimePeriods.map((period) => <MenuItem key={period} value={period}>{period}</MenuItem>)}
                </Select>
              </Box>
              <Box>
                <Typography sx={{fontSize: 11, color: '#9EB2C8', fontWeight: 850, mb: 0.55}}>Benchmark Sites</Typography>
                <Select
                  multiple
                  variant="standard"
                  disableUnderline
                  value={benchmarkSiteNames}
                  onChange={(event) => {
                    const value = event.target.value;
                    onBenchmarkSitesChange(typeof value === 'string' ? value.split(',') : value);
                  }}
                  renderValue={(selected) => (
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 0.45, overflow: 'hidden'}}>
                      {(selected as string[]).slice(0, 2).map((siteName) => (
                        <Chip key={siteName} label={siteName} size="small" sx={{height: 21, bgcolor: 'rgba(103,232,107,0.18)', color: '#67E86B', fontSize: 10, fontWeight: 900}} />
                      ))}
                      <Typography sx={{ml: 'auto', fontSize: 13, color: '#8BA4C4', flex: '0 0 auto'}}>x</Typography>
                      {(selected as string[]).length > 2 ? <Typography sx={{fontSize: 11, color: '#B5C6DA', flex: '0 0 auto'}}>+{(selected as string[]).length - 2}</Typography> : null}
                    </Box>
                  )}
                  sx={selectSx}
                  MenuProps={{PaperProps: {sx: selectMenuSx}}}
                >
                  {benchmarkSites.map((site) => (
                    <MenuItem key={site.name} value={site.name}>
                      <Checkbox size="small" checked={benchmarkSiteNames.includes(site.name)} sx={{p: 0, mr: 1, color: '#6D86A8', '&.Mui-checked': {color: '#58A3FF'}, '& .MuiSvgIcon-root': {fontSize: 16}}} />
                      {site.name}
                    </MenuItem>
                  ))}
                </Select>
              </Box>
              <Box>
                <Typography sx={{fontSize: 11, color: '#9EB2C8', fontWeight: 850, mb: 0.55}}>KPI</Typography>
                <Select
                  variant="standard"
                  disableUnderline
                  value={benchmarkKpi}
                  onChange={(event) => onKpiChange(event.target.value as GlobalKpiKey)}
                  renderValue={(selected) => (
                    <Typography sx={{fontSize: 12, color: '#FFFFFF', fontWeight: 950}} noWrap>{selected as string}</Typography>
                  )}
                  sx={selectSx}
                  MenuProps={{PaperProps: {sx: selectMenuSx}}}
                >
                  {kpiOptions.map((option) => (
                    <MenuItem key={option.label} value={option.label}>
                      <Box sx={{display: 'flex', alignItems: 'center', gap: 0.8}}>
                        <Box sx={{color: option.label === benchmarkKpi ? '#58A3FF' : '#A9BED6', display: 'grid', placeItems: 'center'}}>{option.icon}</Box>
                        {option.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </Box>
              <Button
                onClick={onRun}
                startIcon={<PlayArrowIcon sx={{fontSize: 18}} />}
                sx={{
                  gridColumn: '2',
                  height: 40,
                  mt: 0.05,
                  color: '#FFFFFF',
                  bgcolor: '#2488FF',
                  borderRadius: 1,
                  textTransform: 'none',
                  fontWeight: 950,
                  '&:hover': {bgcolor: '#0B73ED'},
                }}
              >
                Run Benchmark
              </Button>
            </Box>
          </Box>

          {benchmarkResult ? (
            <>
              <Box sx={{p: 1.6, borderBottom: '1px solid rgba(119,151,190,0.18)'}}>
                <BenchmarkSectionTitle index={2} title="Benchmark Results" />
                <Box sx={{mt: 1.15, border: '1px solid rgba(119,151,190,0.18)', borderRadius: 1, overflow: 'hidden'}}>
                  <Box sx={{display: 'grid', gridTemplateColumns: `1.15fr repeat(${(benchmarkResult.rows[0]?.benchmarkValues.length ?? 1) + 1}, minmax(0, 1fr)) 0.9fr`, minHeight: 42, alignItems: 'center', bgcolor: 'rgba(12, 28, 48, 0.92)', borderBottom: '1px solid rgba(119,151,190,0.16)'}}>
                    <BenchmarkHeaderCell>Metric</BenchmarkHeaderCell>
                    <BenchmarkHeaderCell>{benchmarkResult.primarySite.name}<Box component="span" sx={{display: 'block', color: primaryColor, fontSize: 9}}>(Primary)</Box></BenchmarkHeaderCell>
                    {benchmarkResult.rows[0]?.benchmarkValues.map((site) => (
                      <BenchmarkHeaderCell key={site.siteName} accent="#67E86B">{site.siteName}</BenchmarkHeaderCell>
                    ))}
                    <BenchmarkHeaderCell>Top Performer</BenchmarkHeaderCell>
                  </Box>
                  {benchmarkResult.rows.map((row) => {
                    const allValues = [row.primaryValue, ...row.benchmarkValues.map((item) => item.value)];
                    const maxValue = Math.max(...allValues, 1);
                    const minValue = Math.min(...allValues.filter((value) => value > 0), 1);
                    const getWidth = (value: number) => row.definition.highIsBetter
                      ? Math.max(8, (value / maxValue) * 100)
                      : Math.max(8, (minValue / Math.max(value, 0.01)) * 100);

                    return (
                      <Box key={row.metric} sx={{display: 'grid', gridTemplateColumns: `1.15fr repeat(${row.benchmarkValues.length + 1}, minmax(0, 1fr)) 0.9fr`, minHeight: 45, borderTop: '1px solid rgba(119,151,190,0.12)', alignItems: 'center'}}>
                        <BenchmarkBodyCell strong>{row.definition.label}</BenchmarkBodyCell>
                        <BenchmarkValueCell value={row.primaryText} color={row.topSiteName === benchmarkResult.primarySite.name ? '#67E86B' : primaryColor} width={getWidth(row.primaryValue)} />
                        {row.benchmarkValues.map((site) => (
                          <BenchmarkValueCell key={site.siteName} value={site.text} color={row.topSiteName === site.siteName ? '#67E86B' : '#6EE282'} width={getWidth(site.value)} />
                        ))}
                        <BenchmarkBodyCell accent="#67E86B">{row.topText} {row.topSiteName}</BenchmarkBodyCell>
                      </Box>
                    );
                  })}
                </Box>
              </Box>

              <Box sx={{p: 1.6, borderBottom: '1px solid rgba(119,151,190,0.18)'}}>
                <BenchmarkSectionTitle index={3} title="Benchmark Summary" />
                <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 1.1, mt: 1.15}}>
                  <BenchmarkSummaryCard icon={<QualityIcon sx={{fontSize: 21}} />} label="Gap to top performer" value={benchmarkResult.gapText} detail={benchmarkResult.gapUnit} tone="#FFB33B" />
                  <BenchmarkSummaryCard icon={<AnalyticsIcon sx={{fontSize: 21}} />} label="Largest gap driver" value={benchmarkResult.rows[0]?.definition.label ?? 'KPI'} detail="Primary vs best practice" tone="#FF5252" />
                  <BenchmarkSummaryCard icon={<TrophyIcon sx={{fontSize: 21}} />} label="Best benchmark" value={benchmarkResult.bestBenchmarkSiteName} detail="Most top results" tone="#67E86B" />
                </Box>
              </Box>

              {!insightsVisible ? (
                <Box sx={{p: 1.6, flex: 1, display: 'grid', alignItems: 'start'}}>
                  <Button
                    onClick={onGenerateInsights}
                    startIcon={<SparkleIcon sx={{fontSize: 17}} />}
                    sx={{
                      width: '100%',
                      height: 42,
                      color: '#FFFFFF',
                      bgcolor: 'rgba(124, 92, 255, 0.30)',
                      border: '1px solid rgba(167, 139, 250, 0.52)',
                      borderRadius: 1,
                      textTransform: 'none',
                      fontWeight: 950,
                      '&:hover': {bgcolor: 'rgba(124, 92, 255, 0.42)'},
                    }}
                  >
                    Generate AI Insights
                  </Button>
                </Box>
              ) : (
              <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1.18fr', gap: 1.25, p: 1.6, flex: 1, minHeight: 260}}>
                <Paper elevation={0} sx={{p: 1.25, minHeight: 240, bgcolor: 'rgba(10, 24, 42, 0.86)', border: '1px solid rgba(119,151,190,0.18)', borderRadius: 1}}>
                  <BenchmarkSectionTitle index={4} title="AI Insights" />
                  <Box sx={{display: 'grid', gap: 1, mt: 1}}>
                    {benchmarkResult.insightTexts.map((text, index) => (
                      <Box key={text} sx={{display: 'grid', gridTemplateColumns: '16px 1fr', gap: 0.75}}>
                        <SparkleIcon sx={{fontSize: 15, color: '#A78BFA', mt: 0.15}} />
                        <TypewrittenText text={text} delay={index * 520} />
                      </Box>
                    ))}
                  </Box>
                </Paper>
                <Paper elevation={0} sx={{p: 1.25, minHeight: 240, bgcolor: 'rgba(10, 24, 42, 0.86)', border: '1px solid rgba(119,151,190,0.18)', borderRadius: 1}}>
                  <BenchmarkSectionTitle index={5} title="Recommended Actions" />
                  <Box sx={{display: 'grid', gap: 0.65, mt: 1}}>
                    {benchmarkResult.recommendationTexts.map((text, index) => (
                      <Box key={text} sx={{display: 'grid', gridTemplateColumns: '26px 1fr 16px', gap: 0.75, alignItems: 'center', minHeight: 56, px: 0.95, py: 0.75, borderRadius: 1, bgcolor: 'rgba(7,19,35,0.68)', border: '1px solid rgba(119,151,190,0.16)'}}>
                        <ActionIcon sx={{fontSize: 18, color: '#58A3FF'}} />
                        <TypewrittenText text={text} delay={1750 + index * 520} strong />
                        <Typography sx={{fontSize: 18, color: '#8BA4C4', lineHeight: 1}}>{'>'}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Paper>
              </Box>
              )}
            </>
          ) : (
            <Box sx={{height: 340, display: 'grid', placeItems: 'center', px: 4, textAlign: 'center'}}>
              <Box>
                <SparkleIcon sx={{fontSize: 34, color: '#A78BFA'}} />
                <Typography sx={{fontSize: 17, color: '#FFFFFF', fontWeight: 900, mt: 1}}>Ready to benchmark</Typography>
                <Typography sx={{fontSize: 12, color: '#9EB2C8', mt: 0.65, lineHeight: 1.45}}>
                  Select a primary site, benchmark peers, time period, and KPI, then run the comparison.
                  {selectedPrimarySite ? ` Current primary: ${selectedPrimarySite.name}.` : ''}
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      </Paper>

    </Box>
  );
}

function BenchmarkSectionTitle({index, title}: {index: number; title: string}) {
  return (
    <Box sx={{display: 'flex', alignItems: 'center', gap: 0.7}}>
      <Box sx={{width: 21, height: 21, borderRadius: '50%', display: 'grid', placeItems: 'center', bgcolor: '#2488FF', color: '#FFFFFF', fontSize: 12, fontWeight: 950}}>{index}</Box>
      <Typography sx={{fontSize: 14, color: '#FFFFFF', fontWeight: 950}}>{title}</Typography>
    </Box>
  );
}

function TypewrittenText({delay = 0, strong = false, text}: {delay?: number; strong?: boolean; text: string}) {
  const [visibleChars, setVisibleChars] = useState(0);

  useEffect(() => {
    setVisibleChars(0);

    let intervalId: number | undefined;
    const startId = window.setTimeout(() => {
      intervalId = window.setInterval(() => {
        setVisibleChars((currentChars) => {
          if (currentChars >= text.length) {
            if (intervalId) window.clearInterval(intervalId);
            return currentChars;
          }

          return currentChars + 1;
        });
      }, 12);
    }, delay);

    return () => {
      window.clearTimeout(startId);
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [delay, text]);

  const isDone = visibleChars >= text.length;

  return (
    <Typography sx={{fontSize: 11.5, color: strong ? '#FFFFFF' : '#DDEBFF', lineHeight: 1.42, fontWeight: strong ? 800 : 500}}>
      {text.slice(0, visibleChars)}
      {!isDone ? (
        <Box
          component="span"
          sx={{
            display: 'inline-block',
            width: 6,
            ml: 0.25,
            color: '#A78BFA',
            animation: 'benchmarkCursorBlink 900ms steps(2, start) infinite',
            '@keyframes benchmarkCursorBlink': {
              '0%, 45%': {opacity: 1},
              '46%, 100%': {opacity: 0},
            },
          }}
        >
          |
        </Box>
      ) : null}
    </Typography>
  );
}

function BenchmarkHeaderCell({accent = '#C8D3E1', children}: {accent?: string; children: ReactNode}) {
  return <Typography component="div" sx={{p: 1, fontSize: 10.5, color: accent, fontWeight: 950, lineHeight: 1.2}}>{children}</Typography>;
}

function BenchmarkBodyCell({accent = '#DDEBFF', children, strong = false}: {accent?: string; children: ReactNode; strong?: boolean}) {
  return <Typography component="div" sx={{p: 1, fontSize: 11.25, color: accent, fontWeight: strong ? 950 : 850, lineHeight: 1.25}}>{children}</Typography>;
}

function BenchmarkValueCell({color, value, width}: {color: string; value: string; width: number}) {
  return (
    <Box sx={{p: 1}}>
      <Typography sx={{fontSize: 11.25, color: '#FFFFFF', fontWeight: 950, lineHeight: 1}}>{value}</Typography>
      <Box sx={{height: 7, mt: 0.75, borderRadius: 999, bgcolor: 'rgba(119,151,190,0.18)', overflow: 'hidden'}}>
        <Box sx={{height: '100%', width: `${Math.min(100, width)}%`, bgcolor: color, boxShadow: `0 0 12px ${color}66`}} />
      </Box>
    </Box>
  );
}

function BenchmarkSummaryCard({detail, icon, label, tone, value}: {detail: string; icon: ReactNode; label: string; tone: string; value: string}) {
  return (
    <Paper elevation={0} sx={{p: 1.15, minHeight: 96, bgcolor: 'rgba(10, 24, 42, 0.86)', border: '1px solid rgba(119,151,190,0.18)', borderRadius: 1}}>
      <Box sx={{display: 'flex', alignItems: 'center', gap: 0.7, color: tone}}>
        {icon}
        <Typography sx={{fontSize: 10.5, color: '#B5C6DA', fontWeight: 850}}>{label}</Typography>
      </Box>
      <Typography sx={{fontSize: 17, color: tone, fontWeight: 950, mt: 0.75, lineHeight: 1.1}}>{value}</Typography>
      <Typography sx={{fontSize: 10.5, color: '#DDEBFF', mt: 0.55, lineHeight: 1.25}}>{detail}</Typography>
    </Paper>
  );
}

export default function GlobalViewScreen() {
  const [mapViewMode, setMapViewMode] = useState<MapViewMode>('Markers');
  const [overlayKpi, setOverlayKpi] = useState<GlobalKpiKey>('OEE');
  const [selectedOverlayKpis, setSelectedOverlayKpis] = useState<GlobalKpiKey[]>(['OEE']);
  const [activeRegion, setActiveRegion] = useState<RegionFilter>('All Sites');
  const [facilityType, setFacilityType] = useState<FacilityType>('All Facilities');
  const [activeToneFilter, setActiveToneFilter] = useState<SiteTone | null>(null);
  const [benchmarkPanelOpen, setBenchmarkPanelOpen] = useState(false);
  const [benchmarkPrimarySiteName, setBenchmarkPrimarySiteName] = useState('Columbus West');
  const [benchmarkSiteNames, setBenchmarkSiteNames] = useState<string[]>(['Sandy', 'Humacao']);
  const [benchmarkKpi, setBenchmarkKpi] = useState<GlobalKpiKey>('OEE');
  const [benchmarkTimePeriod, setBenchmarkTimePeriod] = useState<(typeof benchmarkTimePeriods)[number]>('Last 24 Hours');
  const [benchmarkResult, setBenchmarkResult] = useState<BenchmarkResult | null>(null);
  const [benchmarkInsightsVisible, setBenchmarkInsightsVisible] = useState(false);
  const [globalSites, setGlobalSites] = useState<GlobalSite[]>(() => defaultGlobalSites);
  const [liveKpiTick, setLiveKpiTick] = useState(0);
  const [mapImageIndex, setMapImageIndex] = useState(0);
  const [aiTourBooting, setAiTourBooting] = useState(false);
  const [aiTourActive, setAiTourActive] = useState(false);
  const [aiTourStepIndex, setAiTourStepIndex] = useState(0);
  const [aiTourTypedUnits, setAiTourTypedUnits] = useState(0);
  const [aiTourTransferFromSite, setAiTourTransferFromSite] = useState<string | null>(null);
  const [aiTourTravelTargetName, setAiTourTravelTargetName] = useState<string | null>(null);
  const [aiTourTransferToken, setAiTourTransferToken] = useState(0);
  const [aiTourViewportPhase, setAiTourViewportPhase] = useState<'reset' | 'approach' | 'travel' | 'focus'>('reset');
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [selectedFlowFocusSite, setSelectedFlowFocusSite] = useState<string | null>(null);
  const dragStateRef = useRef<{name: string; offsetX: number; offsetY: number; startX: number; startY: number; moved: boolean} | null>(null);
  const suppressMarkerClickRef = useRef(false);
  const [mapCoverBounds, setMapCoverBounds] = useState<MapCoverBounds | null>(null);

  useEffect(() => {
    setGlobalSites((currentSites) => {
      const currentByName = new Map(currentSites.map((site) => [site.name, site]));
      const mergedSites = defaultGlobalSites.map((site) => {
        const currentSite = currentByName.get(site.name);
        return currentSite
          ? {
              ...site,
              left: currentSite.left,
              top: currentSite.top,
              labelOffsetX: currentSite.labelOffsetX,
              labelOffsetY: currentSite.labelOffsetY,
            }
          : site;
      });

      return mergedSites;
    });
  }, []);

  useEffect(() => {
    const mapElement = mapRef.current;
    if (!mapElement) return;

    const updateBounds = () => {
      setMapCoverBounds(getMapCoverBounds(mapElement));
    };

    updateBounds();

    const resizeObserver = new ResizeObserver(() => {
      updateBounds();
    });
    resizeObserver.observe(mapElement);
    window.addEventListener('resize', updateBounds);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateBounds);
    };
  }, []);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      const dragState = dragStateRef.current;
      const mapElement = mapRef.current;
      const coverBounds = mapCoverBounds ?? getMapCoverBounds(mapElement);
      if (!dragState || !mapElement || !coverBounds) return;

      const containerBounds = mapElement.getBoundingClientRect();
      const relativeX = event.clientX - containerBounds.left - dragState.offsetX;
      const relativeY = event.clientY - containerBounds.top - dragState.offsetY;
      const nextLeft = Math.min(97, Math.max(3, ((relativeX - coverBounds.offsetX) / coverBounds.width) * 100));
      const nextTop = Math.min(97, Math.max(3, ((relativeY - coverBounds.offsetY) / coverBounds.height) * 100));
      if (!dragState.moved && (Math.abs(event.clientX - dragState.startX) > 4 || Math.abs(event.clientY - dragState.startY) > 4)) {
        dragState.moved = true;
      }

      setGlobalSites((currentSites) => currentSites.map((site) => (
        site.name === dragState.name
          ? {...site, left: `${nextLeft.toFixed(1)}%`, top: `${nextTop.toFixed(1)}%`}
          : site
      )));
    };

    const handlePointerUp = () => {
      suppressMarkerClickRef.current = dragStateRef.current?.moved ?? false;
      dragStateRef.current = null;
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setLiveKpiTick((currentTick) => (currentTick + 1) % 3);
    }, 4200);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const defaultKpi = getDefaultKpiForFacility(facilityType);

    setOverlayKpi((currentKpi) => {
      return isKpiAllowedForFacility(currentKpi, facilityType) ? currentKpi : defaultKpi;
    });
    setSelectedOverlayKpis((currentKpis) => {
      const allowedKpis = currentKpis.filter((kpi) => isKpiAllowedForFacility(kpi, facilityType));
      return allowedKpis.length ? allowedKpis : [defaultKpi];
    });
    setActiveRegion('All Sites');
  }, [facilityType]);

  const handleMarkerPointerDown = (event: React.PointerEvent<HTMLDivElement>, siteName: string) => {
    const mapElement = mapRef.current;
    const targetSite = globalSites.find((site) => site.name === siteName);
    const coverBounds = mapCoverBounds ?? getMapCoverBounds(mapElement);
    if (!mapElement || !coverBounds || !targetSite) return;

    const containerBounds = mapElement.getBoundingClientRect();
    const currentLeft = coverBounds.offsetX + (parseFloat(targetSite.left) / 100) * coverBounds.width;
    const currentTop = coverBounds.offsetY + (parseFloat(targetSite.top) / 100) * coverBounds.height;

    dragStateRef.current = {
      name: siteName,
      offsetX: event.clientX - containerBounds.left - currentLeft,
      offsetY: event.clientY - containerBounds.top - currentTop,
      startX: event.clientX,
      startY: event.clientY,
      moved: false,
    };
  };
  const handleMarkerSelect = (siteName: string) => {
    if (suppressMarkerClickRef.current) {
      suppressMarkerClickRef.current = false;
      return;
    }
    if (aiTourActive) return;

    setSelectedFlowFocusSite((currentSite) => currentSite === siteName ? null : siteName);
  };

  const baseFilteredSites = globalSites.filter((site) => {
    const matchesRegion = activeRegion === 'All Sites' || site.region === activeRegion;
    const matchesFacility = facilityType === 'All Facilities' || (site.facilityType ?? 'Manufacturing Sites') === facilityType;
    return matchesRegion && matchesFacility;
  });
  const selectedFacilityOption = facilityTypeOptions.find((option) => option.label === facilityType) ?? facilityTypeOptions[0];
  const activeOverlayKpi: GlobalKpiKey = facilityType === 'Distribution Centers'
    ? (isDistributionKpiKey(overlayKpi) ? overlayKpi : 'OTIF')
    : facilityType === 'Office Buildings'
      ? (isOfficeKpiKey(overlayKpi) ? overlayKpi : 'Building Health')
      : (isMetricKey(overlayKpi) ? overlayKpi : 'OEE');
  const activeKpiOptions: Array<{icon: ReactNode; label: GlobalKpiKey}> = facilityType === 'Distribution Centers'
    ? distributionKpiOptions
    : facilityType === 'Office Buildings'
      ? officeKpiOptions
      : overlayOptions;
  const benchmarkSiteOptions = globalSites.filter((site) => (
    facilityType === 'All Facilities' || getSiteFacilityType(site) === facilityType
  ));
  const activeKpiOptionLabels = new Set<GlobalKpiKey>(activeKpiOptions.map((option) => option.label));
  const selectedActiveOverlayKpis = selectedOverlayKpis.filter((kpi) => activeKpiOptionLabels.has(kpi));
  const mapOverlayKpis = selectedActiveOverlayKpis.length ? selectedActiveOverlayKpis : [activeOverlayKpi];
  const benchmarkPrimarySite = benchmarkSiteOptions.find((site) => site.name === benchmarkPrimarySiteName) ?? benchmarkSiteOptions[0] ?? globalSites[0];
  const selectedBenchmarkSites = benchmarkSiteOptions.filter((site) => (
    site.name !== benchmarkPrimarySite?.name && benchmarkSiteNames.includes(site.name)
  ));
  const activeBenchmarkKpi = isKpiAllowedForFacility(benchmarkKpi, facilityType)
    ? benchmarkKpi
    : getDefaultKpiForFacility(facilityType);
  const showFlow = mapViewMode === 'Flow' && !aiTourActive;
  const activeAiTourStop = aiTourStops[aiTourStepIndex] ?? aiTourStops[0];
  const aiTourTypingSegments = buildAiTourTypingSegments(activeAiTourStop);
  const aiTourTypingLength = getAiTourTypingLength(aiTourTypingSegments);
  const aiTourBootTargetName = aiTourStops[0]?.siteName ?? null;
  const aiTourTravelFromSiteName = aiTourTransferFromSite ?? activeAiTourStop?.siteName ?? null;
  const mapFocusSiteName = aiTourActive
    ? activeAiTourStop?.siteName ?? null
    : selectedFlowFocusSite;
  const aiTourViewportSiteName = aiTourBooting
    ? aiTourBootTargetName
    : aiTourActive
      ? mapFocusSiteName
      : null;
  const aiTourLastStep = aiTourStepIndex === aiTourStops.length - 1;

  useEffect(() => {
    const availableSites = globalSites.filter((site) => (
      facilityType === 'All Facilities' || getSiteFacilityType(site) === facilityType
    ));
    if (!availableSites.length) return;

    const nextPrimarySiteName = availableSites.some((site) => site.name === benchmarkPrimarySiteName)
      ? benchmarkPrimarySiteName
      : availableSites[0].name;
    const availableBenchmarkNames = availableSites
      .filter((site) => site.name !== nextPrimarySiteName)
      .map((site) => site.name);
    const nextBenchmarkSiteNames = benchmarkSiteNames.filter((siteName) => availableBenchmarkNames.includes(siteName));
    const normalizedBenchmarkSiteNames = nextBenchmarkSiteNames.length
      ? nextBenchmarkSiteNames
      : availableBenchmarkNames.slice(0, 2);
    const defaultKpi = getDefaultKpiForFacility(facilityType);

    if (nextPrimarySiteName !== benchmarkPrimarySiteName) {
      setBenchmarkPrimarySiteName(nextPrimarySiteName);
    }

    if (normalizedBenchmarkSiteNames.join('|') !== benchmarkSiteNames.join('|')) {
      setBenchmarkSiteNames(normalizedBenchmarkSiteNames);
    }

    if (!isKpiAllowedForFacility(benchmarkKpi, facilityType)) {
      setBenchmarkKpi(defaultKpi);
    }

    setBenchmarkResult(null);
    setBenchmarkInsightsVisible(false);
  }, [benchmarkKpi, benchmarkPrimarySiteName, benchmarkSiteNames, facilityType, globalSites]);

  useEffect(() => {
    if (!aiTourBooting) return;

    setAiTourViewportPhase('reset');
    setAiTourTravelTargetName(null);
    const approachTimeoutId = window.setTimeout(() => {
      setAiTourViewportPhase('approach');
    }, aiTourViewportBootApproachDelayMs);

    const timeoutId = window.setTimeout(() => {
      setAiTourBooting(false);
      setAiTourActive(true);
      setAiTourStepIndex(0);
      setSelectedFlowFocusSite(aiTourBootTargetName);
    }, 1450);

    return () => {
      window.clearTimeout(approachTimeoutId);
      window.clearTimeout(timeoutId);
    };
  }, [aiTourBootTargetName, aiTourBooting]);

  useEffect(() => {
    if (!aiTourActive || !activeAiTourStop) return;

    setSelectedFlowFocusSite(activeAiTourStop.siteName);
    setAiTourTypedUnits(0);
    setAiTourViewportPhase('approach');

    const timeoutId = window.setTimeout(() => {
      setAiTourViewportPhase('focus');
    }, aiTourViewportFocusDelayMs);

    return () => window.clearTimeout(timeoutId);
  }, [activeAiTourStop, aiTourActive]);

  useEffect(() => {
    if (!aiTourActive) {
      setAiTourTransferFromSite(null);
      setAiTourTravelTargetName(null);
      return;
    }

    return undefined;
  }, [aiTourActive]);

  useEffect(() => {
    if (!aiTourActive) return;

    const intervalId = window.setInterval(() => {
      setAiTourTypedUnits((currentUnits) => (
        currentUnits >= aiTourTypingLength
          ? currentUnits
          : Math.min(aiTourTypingLength, currentUnits + 1)
      ));
    }, aiTourTypingTickMs);

    return () => window.clearInterval(intervalId);
  }, [aiTourActive, aiTourTypingLength]);

  const handleRunBenchmark = () => {
    if (!benchmarkPrimarySite) return;

    const normalizedBenchmarkSites = selectedBenchmarkSites.length
      ? selectedBenchmarkSites
      : benchmarkSiteOptions.filter((site) => site.name !== benchmarkPrimarySite.name).slice(0, 2);

    setBenchmarkResult(buildBenchmarkResult({
      benchmarkSites: normalizedBenchmarkSites,
      facilityType,
      metric: activeBenchmarkKpi,
      primarySite: benchmarkPrimarySite,
      timePeriod: benchmarkTimePeriod,
    }));
    setBenchmarkInsightsVisible(false);
  };

  const metricRankings = buildMetricRankings(baseFilteredSites, activeOverlayKpi);
  const filteredSites = activeToneFilter
    ? baseFilteredSites.filter((site) => metricRankings.toneByName.get(site.name) === activeToneFilter)
    : baseFilteredSites;
  const filteredTopPerformingSites = metricRankings.topPerforming;
  const filteredSitesWithIssues = metricRankings.sitesWithIssues;
  const visibleSiteNames = new Set(filteredSites.map((site) => site.name));
  const visibleFlowRoutes = manufacturingFlowRoutes.filter((route) => (
    visibleSiteNames.has(route.from) && visibleSiteNames.has(route.to)
  ));
  const connectedFlowSiteNames = aiTourActive && mapFocusSiteName
    ? new Set<string>([mapFocusSiteName])
    : showFlow && mapFocusSiteName
    ? visibleFlowRoutes.reduce((connectedSites, route) => {
        if (route.from === mapFocusSiteName || route.to === mapFocusSiteName) {
          connectedSites.add(route.from);
          connectedSites.add(route.to);
        }
        return connectedSites;
      }, new Set<string>([mapFocusSiteName]))
    : null;
  const highlightedFlowRouteIds = showFlow && mapFocusSiteName
    ? new Set(visibleFlowRoutes
      .filter((route) => route.from === mapFocusSiteName || route.to === mapFocusSiteName)
      .map((route) => route.id))
    : null;
  const performanceListLabel = facilityType === 'Office Buildings'
    ? 'Top Performing Offices'
    : facilityType === 'Distribution Centers'
      ? 'Top Performing DCs'
      : 'Top Performing Sites';
  const issueListLabel = facilityType === 'Office Buildings'
    ? 'Offices with Issues'
    : facilityType === 'Distribution Centers'
      ? 'DCs with Issues'
      : 'Sites with Issues';
  const liveKpiCards = facilityType === 'Distribution Centers'
    ? distributionKpiCardPresets[liveKpiTick]
    : facilityType === 'Office Buildings'
      ? officeKpiCardPresets[liveKpiTick]
      : liveKpiPresets[activeOverlayKpi as MetricKey][liveKpiTick];
  const todayLabel = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());
  const activeMapSource = globalMapSources[Math.min(mapImageIndex, globalMapSources.length - 1)];
  const localMapBounds = mapCoverBounds
    ? {
        ...mapCoverBounds,
        offsetX: 0,
        offsetY: 0,
      }
    : null;
  const aiTourViewportStop = aiTourBooting
    ? aiTourStops[0] ?? null
    : aiTourActive
      ? activeAiTourStop
      : null;
  const aiTourTravelTargetSite = aiTourTravelTargetName
    ? filteredSites.find((site) => site.name === aiTourTravelTargetName)
      ?? globalSites.find((site) => site.name === aiTourTravelTargetName)
      ?? null
    : null;
  const aiTourTravelFromSite = aiTourTravelFromSiteName
    ? filteredSites.find((site) => site.name === aiTourTravelFromSiteName)
      ?? globalSites.find((site) => site.name === aiTourTravelFromSiteName)
      ?? null
    : null;
  const aiTourViewportSite = aiTourViewportSiteName
    ? filteredSites.find((site) => site.name === aiTourViewportSiteName)
      ?? globalSites.find((site) => site.name === aiTourViewportSiteName)
      ?? null
    : null;
  const aiTourViewportFocus = getAiTourViewportFocusPercent(aiTourViewportStop, aiTourViewportSite);
  const aiTourTravelFromStop = aiTourStops.find((stop) => stop.siteName === aiTourTravelFromSiteName) ?? null;
  const aiTourTravelTargetStop = aiTourStops.find((stop) => stop.siteName === aiTourTravelTargetName) ?? null;
  const aiTourTravelFromFocus = getAiTourViewportFocusPercent(aiTourTravelFromStop, aiTourTravelFromSite);
  const aiTourTravelTargetFocus = getAiTourViewportFocusPercent(aiTourTravelTargetStop, aiTourTravelTargetSite);
  const aiTourTravelViewportFocus = {
    ...interpolateViewportFocus(aiTourTravelFromFocus, aiTourTravelTargetFocus, 0.54),
    zoomScale: aiTourViewportTravelScale,
  };
  const aiTourResetViewportFocus = {leftPercent: 50, topPercent: 50, zoomScale: 1};
  const aiTourApproachViewportFocus = interpolateViewportFocus(
    aiTourResetViewportFocus,
    {
      ...aiTourViewportFocus,
      zoomScale: Math.max(1.22, aiTourViewportFocus.zoomScale * aiTourViewportApproachScaleFactor),
    },
    aiTourViewportApproachProgress,
  );
  const aiTourViewportFocusState = aiTourViewportPhase === 'focus'
    ? aiTourViewportFocus
    : aiTourViewportPhase === 'approach'
      ? aiTourApproachViewportFocus
    : aiTourViewportPhase === 'travel'
      ? aiTourTravelViewportFocus
      : aiTourResetViewportFocus;
  const aiTourViewportMotionScale = aiTourViewportPhase === 'focus'
    ? 1.018
    : aiTourViewportPhase === 'approach'
      ? 1.006
      : 1;
  const aiTourCameraScale = aiTourViewportFocusState.zoomScale * aiTourViewportMotionScale;
  const aiTourCameraFocusState = {
    ...aiTourViewportFocusState,
    zoomScale: aiTourCameraScale,
  };
  const aiTourCameraBounds = getAiTourCameraBounds(aiTourCameraFocusState, mapCoverBounds);
  const aiTourSceneOffsetX = aiTourActive || aiTourBooting
    ? aiTourCameraBounds?.offsetX ?? 0
    : mapCoverBounds?.offsetX ?? 0;
  const aiTourSceneOffsetY = aiTourActive || aiTourBooting
    ? aiTourCameraBounds?.offsetY ?? 0
    : mapCoverBounds?.offsetY ?? 0;
  const aiTourViewportOverlayGradient = `radial-gradient(circle at ${aiTourViewportFocusState.leftPercent}% ${aiTourViewportFocusState.topPercent}%, rgba(73, 151, 255, ${aiTourViewportPhase === 'focus' ? 0.16 : 0.11}), transparent 20%), linear-gradient(180deg, rgba(2,10,20,0.03), rgba(2,10,20,0.14))`;
  const aiTourReasonIcons = [
    <AnalyticsIcon key="tour-oee" sx={{fontSize: 16}} />,
    <GlobeIcon key="tour-gap" sx={{fontSize: 16}} />,
    <ActionIcon key="tour-impact" sx={{fontSize: 16}} />,
  ];

  const handleStartAiTour = () => {
    if (aiTourActive || aiTourBooting) return;

    setAiTourBooting(true);
    setAiTourActive(false);
    setAiTourStepIndex(0);
    setAiTourTypedUnits(0);
    setAiTourViewportPhase('reset');
    setAiTourTravelTargetName(null);
    setMapViewMode('Markers');
    setFacilityType('All Facilities');
    setActiveRegion('All Sites');
    setActiveToneFilter(null);
    setSelectedFlowFocusSite(null);
    setAiTourTransferFromSite(null);
    setAiTourTransferToken(0);
  };

  const handleAdvanceAiTour = () => {
    if (aiTourLastStep) {
      setAiTourActive(false);
      setAiTourViewportPhase('reset');
      setSelectedFlowFocusSite(null);
      setAiTourTravelTargetName(null);
      return;
    }

    const nextStepIndex = Math.min(aiTourStepIndex + 1, aiTourStops.length - 1);
    const nextStop = aiTourStops[nextStepIndex];
    setAiTourTransferFromSite(activeAiTourStop.siteName);
    setAiTourTravelTargetName(nextStop.siteName);
    setAiTourTransferToken((currentToken) => currentToken + 1);
    setAiTourViewportPhase('travel');

    window.setTimeout(() => {
      setAiTourStepIndex(nextStepIndex);
      setAiTourTravelTargetName(null);
      window.setTimeout(() => {
        setAiTourTransferFromSite(null);
      }, aiTourTransferDurationMs);
    }, aiTourViewportResetMs);
  };

  useEffect(() => {
    if (mapFocusSiteName && !visibleSiteNames.has(mapFocusSiteName)) {
      setSelectedFlowFocusSite(null);
      setAiTourActive(false);
      setAiTourBooting(false);
      setAiTourViewportPhase('reset');
    }
  }, [mapFocusSiteName, visibleSiteNames]);

  return (
    <Box
      sx={{
        height: '100vh',
        bgcolor: '#020A14',
        color: '#E7F1FF',
        p: {xs: 1.5, md: 2},
        overflow: 'hidden',
        display: 'grid',
        gridTemplateRows: 'auto minmax(0, 1fr) auto',
        gap: 1.25,
      }}
    >
      <Box sx={{position: 'relative', minHeight: {xs: 82, md: 64}, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap'}}>
        <Box sx={{minWidth: {xs: '100%', sm: 360}}}>
          <Box sx={{display: 'flex', alignItems: 'center', gap: 1.25}}>
            <Box sx={{width: 58, height: 58, display: 'grid', placeItems: 'center', color: '#52A3FF'}}>
              <GlobeIcon sx={{fontSize: 38, strokeWidth: 1.4}} />
            </Box>
            <Box sx={{minWidth: 0}}>
              <Typography sx={{fontSize: 13, fontWeight: 800, color: '#9FB8E8', lineHeight: 1.1}}>Good evening, Ibrahim Al-Syed</Typography>
              <Typography sx={{fontSize: 24, color: '#FFFFFF', fontWeight: 900, lineHeight: 1.05, mt: 0.45}}>Global View</Typography>
              <Typography sx={{fontSize: 13, color: '#8BA4C4', mt: 0.35}}>Global overview of manufacturing sites</Typography>
            </Box>
          </Box>
        </Box>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap'}}>
          <Button
            variant="outlined"
            startIcon={<SparkleIcon sx={{fontSize: 17}} />}
            onClick={() => setBenchmarkPanelOpen(true)}
            sx={{
              height: 38,
              borderRadius: 1.3,
              color: '#A9C6FF',
              borderColor: 'rgba(103, 112, 255, 0.52)',
              bgcolor: 'rgba(82, 62, 185, 0.20)',
              textTransform: 'none',
              fontWeight: 900,
            }}
          >
            AI Benchmarking
          </Button>
          <Box
            component="img"
            src="/images/Ibrahim.png"
            alt="Ibrahim profile"
            sx={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              objectFit: 'cover',
              border: '1px solid rgba(119,151,190,0.30)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.18)',
              bgcolor: 'rgba(255,255,255,0.08)',
              flexShrink: 0,
            }}
          />
        </Box>
      </Box>

      <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', xl: 'minmax(0, 1fr) 280px'}, gap: 1.25, minHeight: 0}}>
        <Paper
          elevation={0}
          ref={mapRef}
          sx={{
            position: 'relative',
            height: '100%',
            minHeight: 0,
            overflow: 'visible',
            bgcolor: '#061120',
            border: '1px solid rgba(119, 151, 190, 0.24)',
            borderRadius: 2,
          }}
        >
          <Box sx={{position: 'absolute', top: 12, left: 12, right: 12, zIndex: 6, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.2, pointerEvents: 'none'}}>
            <Box sx={{display: 'flex', gap: 0.8, bgcolor: 'rgba(6, 16, 29, 0.76)', border: '1px solid rgba(119,151,190,0.24)', borderRadius: 1.4, p: 0.45, pointerEvents: 'auto'}}>
              <MapModeButton active={mapViewMode === 'Markers'} label="Markers" onClick={() => setMapViewMode('Markers')} tint="#58A3FF" />
              <MapModeButton active={mapViewMode === 'Heatmap'} label="Heatmap" onClick={() => setMapViewMode('Heatmap')} tint="#8A93FF" />
              <MapModeButton active={showFlow} label="Flow" onClick={() => setMapViewMode('Flow')} tint="#2CE6FF" />
            </Box>
            <Box sx={{display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'flex-end', pointerEvents: 'auto'}}>
              <FilterBox icon={<CalendarIcon sx={{fontSize: 18}} />} label="Date" value={`Today (${todayLabel})`} />
              <FilterBox icon={<TimeIcon sx={{fontSize: 18}} />} label="Time Period" value="Last 24 Hours" />
              <FilterBox icon={<BusinessIcon sx={{fontSize: 18}} />} label="Business Unit" value="All" />
              <Paper
                elevation={0}
                sx={{
                  minWidth: {xs: 180, sm: 210},
                  height: 46,
                  px: 1.35,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  bgcolor: 'rgba(15, 27, 45, 0.88)',
                  border: '1px solid rgba(119, 151, 190, 0.24)',
                  borderRadius: 1.4,
                }}
              >
                <Box sx={{color: '#8BA4C4', display: 'grid', placeItems: 'center'}}>
                  {selectedFacilityOption.icon}
                </Box>
                <Box sx={{minWidth: 0, flex: 1}}>
                  <Typography sx={{fontSize: 10, color: '#8BA4C4', lineHeight: 1.1}}>Facility Type</Typography>
                  <Select
                    value={facilityType}
                    onChange={(event) => setFacilityType(event.target.value as FacilityType)}
                    variant="standard"
                    disableUnderline
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          mt: 0.8,
                          bgcolor: '#0E1B30',
                          border: '1px solid rgba(82,141,255,0.30)',
                          borderRadius: 1.4,
                          boxShadow: '0 18px 36px rgba(0,0,0,0.28)',
                          '& .MuiMenuItem-root': {
                            minHeight: 34,
                            mx: 0.6,
                            my: 0.35,
                            borderRadius: 1,
                            color: '#DDEBFF',
                            fontSize: 13,
                            fontWeight: 700,
                          },
                          '& .MuiMenuItem-root.Mui-selected': {
                            bgcolor: 'rgba(52,141,255,0.18)',
                          },
                          '& .MuiMenuItem-root.Mui-selected:hover': {
                            bgcolor: 'rgba(52,141,255,0.24)',
                          },
                        },
                      },
                    }}
                    renderValue={(selected) => (
                      <Box sx={{display: 'flex', alignItems: 'center', minWidth: 0}}>
                        <Typography sx={{fontSize: 12, color: '#FFFFFF', fontWeight: 850}} noWrap>{selected}</Typography>
                      </Box>
                    )}
                    sx={{
                      width: '100%',
                      color: '#FFFFFF',
                      fontSize: 12,
                      fontWeight: 850,
                      '& .MuiSvgIcon-root': {color: '#8BA4C4'},
                    }}
                  >
                    {facilityTypeOptions.map((option) => (
                      <MenuItem key={option.label} value={option.label}>
                        <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                          <Box sx={{color: option.label === facilityType ? '#58A3FF' : '#A9BED6', display: 'grid', placeItems: 'center'}}>
                            {option.icon}
                          </Box>
                          <Typography sx={{fontSize: 13, fontWeight: 700}}>{option.label}</Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </Box>
              </Paper>
              <Paper
                elevation={0}
                sx={{
                  minWidth: {xs: 160, sm: 190},
                  height: 46,
                  px: 1.35,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  bgcolor: 'rgba(15, 27, 45, 0.88)',
                  border: '1px solid rgba(119, 151, 190, 0.24)',
                  borderRadius: 1.4,
                }}
              >
                <AnalyticsIcon sx={{fontSize: 18, color: '#8BA4C4'}} />
                <Box sx={{minWidth: 0, flex: 1}}>
                  <Typography sx={{fontSize: 10, color: '#8BA4C4', lineHeight: 1.1}}>KPI</Typography>
                  <Select
                    multiple
                    value={mapOverlayKpis}
                    onChange={(event) => {
                      const value = event.target.value;
                      const nextKpis = typeof value === 'string'
                        ? value.split(',') as GlobalKpiKey[]
                        : value as GlobalKpiKey[];
                      const uniqueKpis = nextKpis.filter((kpi, index) => nextKpis.indexOf(kpi) === index);
                      const normalizedKpis = uniqueKpis.length ? uniqueKpis : [getDefaultKpiForFacility(facilityType)];

                      setSelectedOverlayKpis(normalizedKpis);
                      setOverlayKpi(normalizedKpis[0]);
                    }}
                    variant="standard"
                    disableUnderline
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          mt: 0.8,
                          bgcolor: '#0E1B30',
                          border: '1px solid rgba(82,141,255,0.30)',
                          borderRadius: 1.4,
                          boxShadow: '0 18px 36px rgba(0,0,0,0.28)',
                          '& .MuiMenuItem-root': {
                            minHeight: 34,
                            mx: 0.6,
                            my: 0.35,
                            borderRadius: 1,
                            color: '#DDEBFF',
                            fontSize: 13,
                            fontWeight: 700,
                          },
                          '& .MuiMenuItem-root.Mui-selected': {
                            bgcolor: 'rgba(52,141,255,0.18)',
                          },
                          '& .MuiMenuItem-root.Mui-selected:hover': {
                            bgcolor: 'rgba(52,141,255,0.24)',
                          },
                        },
                      },
                    }}
                    renderValue={(selected) => (
                      <Box sx={{display: 'flex', alignItems: 'center', minWidth: 0}}>
                        <Typography sx={{fontSize: 12, color: '#FFFFFF', fontWeight: 850}} noWrap>
                          {(selected as GlobalKpiKey[]).length > 2
                            ? `${(selected as GlobalKpiKey[])[0]} +${(selected as GlobalKpiKey[]).length - 1}`
                            : (selected as GlobalKpiKey[]).join(', ')}
                        </Typography>
                      </Box>
                    )}
                    sx={{
                      width: '100%',
                      color: '#FFFFFF',
                      fontSize: 12,
                      fontWeight: 850,
                      '& .MuiSvgIcon-root': {color: '#8BA4C4'},
                    }}
                  >
                    {activeKpiOptions.map((option) => (
                      <MenuItem key={option.label} value={option.label}>
                        <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                          <Checkbox
                            size="small"
                            checked={mapOverlayKpis.includes(option.label)}
                            sx={{
                              p: 0,
                              color: '#6D86A8',
                              '&.Mui-checked': {color: '#58A3FF'},
                              '& .MuiSvgIcon-root': {fontSize: 16},
                            }}
                          />
                          <Box sx={{color: mapOverlayKpis.includes(option.label) ? '#58A3FF' : '#A9BED6', display: 'grid', placeItems: 'center'}}>
                            {option.icon}
                          </Box>
                          <Typography sx={{fontSize: 13, fontWeight: 700}}>{option.label}</Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </Box>
              </Paper>
            </Box>
          </Box>

          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              overflow: 'hidden',
              borderRadius: 'inherit',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: mapCoverBounds ? `${mapCoverBounds.width}px` : '100%',
                height: mapCoverBounds ? `${mapCoverBounds.height}px` : '100%',
                transform: `translate3d(${aiTourSceneOffsetX}px, ${aiTourSceneOffsetY}px, 0) scale(${aiTourActive || aiTourBooting ? aiTourCameraScale : 1})`,
                transformOrigin: 'top left',
                transition: 'transform 1180ms cubic-bezier(0.22, 1, 0.36, 1)',
                willChange: 'transform',
                backfaceVisibility: 'hidden',
              }}
            >
              <Box
                component="img"
                src={activeMapSource}
                alt="Global manufacturing map"
                onError={() => {
                  setMapImageIndex((currentIndex) => (
                    currentIndex < globalMapSources.length - 1 ? currentIndex + 1 : currentIndex
                  ));
                }}
                sx={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center center',
                  opacity: 0.9,
                  filter: 'saturate(1.02) contrast(1.08) brightness(0.9)',
                }}
              />
              <Box sx={{position: 'absolute', inset: 0, background: aiTourActive || aiTourBooting ? aiTourViewportOverlayGradient : 'radial-gradient(circle at 52% 42%, rgba(30, 92, 159, 0.08), transparent 35%), linear-gradient(180deg, rgba(2,10,20,0.04), rgba(2,10,20,0.24))'}} />
              {mapViewMode === 'Heatmap' ? (
                <HeatmapOverlay
                  mapBounds={localMapBounds}
                  sites={filteredSites}
                  toneByName={metricRankings.toneByName}
                />
              ) : null}
              {showFlow ? (
                <FlowRoutesOverlay
                  mapBounds={localMapBounds}
                  routes={visibleFlowRoutes}
                  sites={filteredSites}
                  highlightedRouteIds={highlightedFlowRouteIds}
                />
              ) : null}
              {aiTourBooting ? (
                <AiTourBootOverlay
                  accentColor={activeAiTourStop.badgeTone}
                  mapBounds={localMapBounds}
                  sites={filteredSites}
                  targetSiteName={aiTourBootTargetName}
                />
              ) : null}
              {aiTourActive ? (
                <AiTourTransferOverlay
                  accentColor={activeAiTourStop.badgeTone}
                  fromSiteName={aiTourTransferFromSite}
                  mapBounds={localMapBounds}
                  sites={filteredSites}
                  toSiteName={aiTourTravelTargetName ?? mapFocusSiteName}
                  transitionKey={aiTourTransferToken}
                />
              ) : null}

              {filteredSites.map((site) => (
                <SiteMarker
                  key={site.name}
                  mapBounds={localMapBounds}
                  site={site}
                  metrics={mapOverlayKpis}
                  markerIcon={selectedFacilityOption.markerIcon}
                  viewportScale={aiTourActive || aiTourBooting ? aiTourCameraScale : 1}
                  isDimmed={aiTourActive
                    ? site.name !== mapFocusSiteName
                    : Boolean(connectedFlowSiteNames && !connectedFlowSiteNames.has(site.name))}
                  isTourHighlighted={Boolean(aiTourActive && site.name === mapFocusSiteName)}
                  tourAccentColor={aiTourActive && site.name === mapFocusSiteName ? activeAiTourStop.badgeTone : null}
                  tone={metricRankings.toneByName.get(site.name) ?? 'good'}
                  onPointerDown={handleMarkerPointerDown}
                  onSelect={handleMarkerSelect}
                />
              ))}
            </Box>
          </Box>

          <Paper elevation={0} sx={{position: 'absolute', left: {xs: 10, md: 18}, bottom: {xs: 84, md: 112}, zIndex: 5, display: 'grid', gap: 0.55, bgcolor: 'rgba(7,19,35,0.80)', border: '1px solid rgba(119,151,190,0.24)', borderRadius: 1.2, p: 0.65}}>
            {[<GlobeIcon key="globe" />, '+', '-'].map((item, index) => (
              <Box key={index} sx={{width: 32, height: 32, display: 'grid', placeItems: 'center', color: '#A6B4C5', fontSize: 22, borderBottom: index === 2 ? 'none' : '1px solid rgba(119,151,190,0.18)'}}>{item}</Box>
            ))}
          </Paper>

          {showFlow ? (
            <Paper
              elevation={0}
              sx={{
                position: 'absolute',
                left: '50%',
                bottom: 18,
                transform: 'translateX(-50%)',
                zIndex: 5,
                px: 1.4,
                py: 0.8,
                display: 'flex',
                gap: 1.2,
                flexWrap: 'wrap',
                justifyContent: 'center',
                bgcolor: 'rgba(7,19,35,0.78)',
                border: '1px solid rgba(119,151,190,0.24)',
                borderRadius: 1.5,
              }}
            >
              {(['normal', 'constrained', 'critical'] as FlowRouteSeverity[]).map((severity) => {
                const style = flowSeverityStyles[severity];

                return (
                  <Box key={severity} sx={{display: 'flex', alignItems: 'center', gap: 0.65}}>
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 0.4}}>
                      <Box sx={{width: 22, height: 1.5, bgcolor: style.color, borderRadius: 999, position: 'relative', opacity: 0.9}}>
                        <Box sx={{position: 'absolute', right: -1, top: -2.5, width: 0, height: 0, borderTop: '3px solid transparent', borderBottom: '3px solid transparent', borderLeft: `5px solid ${style.color}`}} />
                      </Box>
                    </Box>
                    <Typography sx={{fontSize: 11, color: '#C7D4E5', fontWeight: 700}}>{style.legend}</Typography>
                  </Box>
                );
              })}
            </Paper>
          ) : (
            <Paper
              elevation={0}
              sx={{
                position: 'absolute',
                left: '50%',
                bottom: 18,
                transform: 'translateX(-50%)',
                zIndex: 5,
                px: 1.4,
                py: 0.8,
                display: 'flex',
                gap: 1.2,
                flexWrap: 'wrap',
                justifyContent: 'center',
                bgcolor: 'rgba(7,19,35,0.78)',
                border: '1px solid rgba(119,151,190,0.24)',
                borderRadius: 1.5,
              }}
            >
              {Object.entries(siteToneMap).map(([key, tone]) => {
                const toneKey = key as SiteTone;
                const isActive = activeToneFilter === toneKey;

                return (
                  <Box
                    key={key}
                    role="button"
                    tabIndex={0}
                    aria-pressed={isActive}
                    onClick={() => setActiveToneFilter((currentFilter) => currentFilter === toneKey ? null : toneKey)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        setActiveToneFilter((currentFilter) => currentFilter === toneKey ? null : toneKey);
                      }
                    }}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.55,
                      px: 0.75,
                      py: 0.45,
                      borderRadius: 1,
                      cursor: 'pointer',
                      border: `1px solid ${isActive ? tone.color : 'transparent'}`,
                      bgcolor: isActive ? `${tone.color}22` : 'transparent',
                      opacity: activeToneFilter && !isActive ? 0.45 : 1,
                      transition: 'background-color 120ms ease, border-color 120ms ease, opacity 120ms ease',
                      '&:hover': {
                        bgcolor: `${tone.color}18`,
                      },
                    }}
                  >
                    <Box sx={{width: 9, height: 9, borderRadius: '50%', bgcolor: tone.color}} />
                    <Typography sx={{fontSize: 11, color: isActive ? '#FFFFFF' : '#B5C6DA', fontWeight: isActive ? 850 : 500}}>{tone.label}</Typography>
                  </Box>
                );
              })}
            </Paper>
          )}
        </Paper>

        <Box sx={{display: 'grid', gap: 1, alignContent: 'start', minHeight: 0, overflowY: 'auto', overflowX: 'hidden', pr: 0.2}}>
          <Paper elevation={0} sx={{p: 1.45, bgcolor: 'rgba(15, 27, 45, 0.92)', border: '1px solid rgba(119,151,190,0.24)', borderRadius: 2}}>
            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1}}>
              <Typography sx={{fontSize: 14, color: '#FFFFFF', fontWeight: 900}}>{performanceListLabel}</Typography>
              <Typography sx={{fontSize: 11, color: '#58A3FF', fontWeight: 850}}>View all</Typography>
            </Box>
            {filteredTopPerformingSites.map((site, index) => (
              <Box key={site.name} sx={{display: 'grid', gridTemplateColumns: '18px 20px 1fr auto', gap: 1, alignItems: 'center', py: 0.8, borderTop: index ? '1px solid rgba(119,151,190,0.16)' : 'none'}}>
                <Typography sx={{fontSize: 13, color: '#FFFFFF', fontWeight: 900}}>{index + 1}</Typography>
                <Box sx={{width: 18, height: 18, borderRadius: '50%', border: `2px solid ${site.color}`, boxShadow: `inset 0 0 0 3px rgba(7,19,35,0.92), 0 0 10px ${site.color}33`, position: 'relative'}}>
                  <Box sx={{position: 'absolute', width: 5, height: 5, borderRadius: '50%', bgcolor: site.color, top: 1, left: 1}} />
                </Box>
                <Box>
                  <Typography sx={{fontSize: 13, color: '#FFFFFF', fontWeight: 900, lineHeight: 1.1}}>{site.name}</Typography>
                  <Typography sx={{fontSize: 11, color: site.color, fontWeight: 850, mt: 0.2}}>{site.metricText}</Typography>
                </Box>
                <TrendLine values={site.trend} tone={site.color} width={58} height={22} />
              </Box>
            ))}
          </Paper>

          <Paper elevation={0} sx={{p: 1.45, bgcolor: 'rgba(15, 27, 45, 0.92)', border: '1px solid rgba(119,151,190,0.24)', borderRadius: 2}}>
            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1}}>
              <Typography sx={{fontSize: 14, color: '#FFFFFF', fontWeight: 900}}>{issueListLabel}</Typography>
              <Typography sx={{fontSize: 11, color: '#58A3FF', fontWeight: 850}}>View all</Typography>
            </Box>
            {filteredSitesWithIssues.map((site, index) => (
              <Box key={site.name} sx={{display: 'grid', gridTemplateColumns: '18px 20px 1fr auto', gap: 1, alignItems: 'center', py: 0.8, borderTop: index ? '1px solid rgba(119,151,190,0.16)' : 'none'}}>
                <Typography sx={{fontSize: 13, color: '#FFFFFF', fontWeight: 900}}>{index + 1}</Typography>
                <Box sx={{width: 18, height: 18, borderRadius: '50%', border: `2px solid ${site.color}`, boxShadow: `inset 0 0 0 3px rgba(7,19,35,0.92), 0 0 10px ${site.color}33`, position: 'relative'}}>
                  <Box sx={{position: 'absolute', width: 5, height: 5, borderRadius: '50%', bgcolor: site.color, top: 1, left: 1}} />
                </Box>
                <Box>
                  <Typography sx={{fontSize: 13, color: '#FFFFFF', fontWeight: 900, lineHeight: 1.1}}>{site.name}</Typography>
                  <Typography sx={{fontSize: 11, color: site.color, fontWeight: 850, mt: 0.2}}>{site.metricText}</Typography>
                </Box>
                <TrendLine values={site.trend} tone={site.color} width={58} height={22} fill />
              </Box>
            ))}
          </Paper>

          {showFlow ? (
            <>
              <Paper elevation={0} sx={{p: 1.1, bgcolor: 'rgba(8, 24, 42, 0.94)', border: '1px solid rgba(83,157,255,0.22)', borderRadius: 2}}>
                <Box sx={{display: 'flex', alignItems: 'center', gap: 0.7, mb: 0.75}}>
                  <SparkleIcon sx={{fontSize: 18, color: '#7DD3FC'}} />
                  <Typography sx={{fontSize: 14, color: '#FFFFFF', fontWeight: 900}}>AI Flow Insights</Typography>
                </Box>
                <Box sx={{display: 'grid', gap: 0.65}}>
                  {flowAiInsights.map((insight) => (
                    <Box key={insight.title} sx={{p: 0.8, borderRadius: 1.1, bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(119,151,190,0.14)'}}>
                      <Typography sx={{fontSize: 10.5, color: insight.tone, fontWeight: 900, lineHeight: 1.25}}>{insight.title}</Typography>
                      <Typography sx={{fontSize: 10.5, color: '#D5E3F7', lineHeight: 1.35, mt: 0.3}}>{insight.detail}</Typography>
                    </Box>
                  ))}
                </Box>
              </Paper>

              <Paper elevation={0} sx={{p: 1.15, bgcolor: 'rgba(15, 27, 45, 0.92)', border: '1px solid rgba(119,151,190,0.24)', borderRadius: 2}}>
                <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1}}>
                  <Typography sx={{fontSize: 14, color: '#FFFFFF', fontWeight: 900}}>Material Flow & Dependencies</Typography>
                  <Typography sx={{fontSize: 11, color: '#58A3FF', fontWeight: 850}}>View all</Typography>
                </Box>
                {flowDependencyRows.map((row, index) => {
                  const style = flowSeverityStyles[row.severity];

                  return (
                    <Box key={row.route} sx={{display: 'grid', gridTemplateColumns: '16px 1fr auto', gap: 0.8, alignItems: 'center', py: 0.65, borderTop: index ? '1px solid rgba(119,151,190,0.16)' : 'none'}}>
                      <Typography sx={{fontSize: 13, color: '#FFFFFF', fontWeight: 900}}>{index + 1}</Typography>
                      <Box>
                        <Typography sx={{fontSize: 11.5, color: '#FFFFFF', fontWeight: 850, lineHeight: 1.15}}>{row.route}</Typography>
                        <Typography sx={{fontSize: 10, color: '#9EB2C8', mt: 0.18, lineHeight: 1.25}}>{row.detail}</Typography>
                      </Box>
                      <Box sx={{width: 10, height: 10, borderRadius: '50%', bgcolor: style.color, boxShadow: `0 0 8px ${style.glow}`}} />
                    </Box>
                  );
                })}
              </Paper>
            </>
          ) : aiTourActive ? (
            <>
              <Paper elevation={0} sx={{p: 1.2, bgcolor: 'rgba(15, 27, 45, 0.92)', border: '1px solid rgba(119,151,190,0.24)', borderRadius: 2}}>
                <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1}}>
                  <Typography sx={{fontSize: 13, color: '#FFFFFF', fontWeight: 900}}>Tour Progress</Typography>
                  <Typography sx={{fontSize: 11, color: '#9EB2C8', fontWeight: 850}}>{aiTourStepIndex + 1} of {aiTourStops.length}</Typography>
                </Box>
                <Box sx={{display: 'grid', gridTemplateColumns: `repeat(${aiTourStops.length}, minmax(0, 1fr))`, gap: 0.45, mt: 1}}>
                  {aiTourStops.map((stop, index) => {
                    const isActive = index === aiTourStepIndex;
                    const isComplete = index < aiTourStepIndex;

                    return (
                      <Box key={stop.siteName} sx={{display: 'grid', justifyItems: 'center', gap: 0.35}}>
                        <Box sx={{width: '100%', height: 4, borderRadius: 999, bgcolor: isActive || isComplete ? stop.badgeTone : 'rgba(119,151,190,0.20)', boxShadow: isActive ? `0 0 12px ${stop.badgeTone}66` : 'none'}} />
                        <Box sx={{width: 10, height: 10, borderRadius: '50%', bgcolor: isActive || isComplete ? stop.badgeTone : '#334155', boxShadow: isActive ? `0 0 12px ${stop.badgeTone}88` : 'none'}} />
                      </Box>
                    );
                  })}
                </Box>
                <Box sx={{display: 'grid', gap: 0.55, mt: 0.95}}>
                  {aiTourStops.map((stop, index) => {
                    const isActive = index === aiTourStepIndex;

                    return (
                      <Box
                        key={stop.siteName}
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: '20px 1fr',
                          gap: 0.8,
                          alignItems: 'start',
                          p: 0.7,
                          borderRadius: 1.2,
                          border: `1px solid ${isActive ? `${stop.badgeTone}66` : 'rgba(119,151,190,0.14)'}`,
                          bgcolor: isActive ? 'rgba(255,255,255,0.04)' : 'transparent',
                        }}
                      >
                        <Box sx={{width: 18, height: 18, borderRadius: '50%', border: `1px solid ${isActive ? stop.badgeTone : '#49617E'}`, color: isActive ? stop.badgeTone : '#9FB1C8', display: 'grid', placeItems: 'center', fontSize: 10, fontWeight: 900}}>
                          {index + 1}
                        </Box>
                        <Box>
                          <Typography sx={{fontSize: 11.5, color: '#FFFFFF', fontWeight: 850, lineHeight: 1.2}}>{stop.siteName}</Typography>
                          <Typography sx={{fontSize: 10, color: isActive ? stop.badgeTone : '#8EA5C2', fontWeight: 800, mt: 0.22}}>{isActive ? stop.progressNote : stop.metricText}</Typography>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              </Paper>

              <Paper elevation={0} sx={{p: 1.2, bgcolor: 'rgba(8, 24, 42, 0.94)', border: `1px solid ${activeAiTourStop.badgeTone}33`, borderRadius: 2, boxShadow: `0 0 0 1px ${activeAiTourStop.badgeTone}14 inset`}}>
                <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, mb: 0.9}}>
                  <Typography sx={{fontSize: 14, color: '#FFFFFF', fontWeight: 900}}>
                    {getAiTourTypedText(aiTourTypingSegments, 0, aiTourTypedUnits)}
                    {aiTourTypedUnits < aiTourTypingSegments[0].length ? <Box component="span" sx={{ml: 0.2, color: activeAiTourStop.badgeTone}}>|</Box> : null}
                  </Typography>
                  <Chip label={activeAiTourStop.badge} size="small" sx={{height: 21, bgcolor: `${activeAiTourStop.badgeTone}24`, color: activeAiTourStop.badgeTone, border: `1px solid ${activeAiTourStop.badgeTone}55`, fontSize: 10, fontWeight: 900}} />
                </Box>
                <Box sx={{display: 'grid', gap: 0.75}}>
                  {activeAiTourStop.insightLines.map((_, index) => {
                    const typedLine = getAiTourTypedText(aiTourTypingSegments, index + 1, aiTourTypedUnits);
                    if (!typedLine.length) return null;

                    return (
                      <Box key={`${activeAiTourStop.siteName}-${index}`} sx={{display: 'grid', gridTemplateColumns: '16px 1fr', gap: 0.7, alignItems: 'start'}}>
                        <Box sx={{color: activeAiTourStop.badgeTone, display: 'grid', placeItems: 'center', mt: 0.1}}>
                          {aiTourReasonIcons[index] ?? <SparkleIcon sx={{fontSize: 15}} />}
                        </Box>
                        <Typography sx={{fontSize: 11.5, color: '#E4EEFF', lineHeight: 1.35, fontWeight: 700, whiteSpace: 'pre-line'}}>
                          {typedLine}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
                {getAiTourTypedText(aiTourTypingSegments, aiTourTypingSegments.length - 1, aiTourTypedUnits) ? (
                  <Typography sx={{fontSize: 11.5, color: '#D5E3F7', lineHeight: 1.45, mt: 1.1}}>
                    {getAiTourTypedText(aiTourTypingSegments, aiTourTypingSegments.length - 1, aiTourTypedUnits)}
                  </Typography>
                ) : null}
                <Button
                  onClick={handleAdvanceAiTour}
                  disabled={aiTourTypedUnits < aiTourTypingLength}
                  sx={{
                    mt: 1.2,
                    width: '100%',
                    height: 38,
                    color: '#FFFFFF',
                    bgcolor: activeAiTourStop.badgeTone,
                    borderRadius: 1.15,
                    textTransform: 'none',
                    fontWeight: 900,
                    '&:hover': {
                      bgcolor: activeAiTourStop.badgeTone,
                      filter: 'brightness(1.06)',
                    },
                    '&.Mui-disabled': {
                      color: 'rgba(255,255,255,0.55)',
                      bgcolor: `${activeAiTourStop.badgeTone}55`,
                    },
                  }}
                >
                  {aiTourLastStep ? 'End AI Tour' : `Next Site: ${aiTourStops[aiTourStepIndex + 1]?.siteName ?? 'Finish'}`}
                </Button>
              </Paper>
            </>
          ) : (
            <Paper elevation={0} sx={{p: 1.35, bgcolor: 'rgba(22, 23, 61, 0.78)', border: '1px solid rgba(119,151,190,0.24)', borderRadius: 2}}>
              <Box sx={{display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.85}}>
                <SparkleIcon sx={{fontSize: 18, color: '#A78BFA'}} />
                <Typography sx={{fontSize: 14, color: '#FFFFFF', fontWeight: 900}}>AI Tour</Typography>
                <Chip label="Beta" size="small" sx={{height: 18, bgcolor: 'rgba(82,141,255,0.18)', color: '#8FC5FF', fontSize: 9, fontWeight: 900}} />
              </Box>
              <Typography sx={{fontSize: 18, color: '#FFFFFF', fontWeight: 900, lineHeight: 1.1}}>Hi Ibrahim!</Typography>
              <Typography sx={{fontSize: 11.5, color: '#DDEBFF', lineHeight: 1.45, mt: 0.6}}>
                {aiTourBooting
                  ? `Scanning the network and locking onto ${aiTourBootTargetName}...`
                  : `I found ${aiTourStops.length} sites that need your immediate attention. Would you like to start a guided tour?`}
              </Typography>
              <Box sx={{display: 'grid', gap: 0.45, mt: 0.9}}>
                {[
                  'Focus on what matters most',
                  'Get AI-powered insights',
                  'Recommendations to improve',
                ].map((line) => (
                  <Box key={line} sx={{display: 'flex', alignItems: 'center', gap: 0.55}}>
                    <Box sx={{width: 6, height: 6, borderRadius: '50%', bgcolor: '#9C87FF'}} />
                    <Typography sx={{fontSize: 11, color: '#C7D4E5', lineHeight: 1.3}}>{line}</Typography>
                  </Box>
                ))}
              </Box>
              <Button
                onClick={handleStartAiTour}
                disabled={aiTourBooting}
                startIcon={<SparkleIcon sx={{fontSize: 16}} />}
                sx={{
                  mt: 1.1,
                  width: '100%',
                  height: 38,
                  color: '#FFFFFF',
                  backgroundImage: 'linear-gradient(90deg, #5A64FF 0%, #7D4BFF 100%)',
                  borderRadius: 1.15,
                  textTransform: 'none',
                  fontWeight: 900,
                  boxShadow: '0 10px 24px rgba(90,100,255,0.28)',
                  animation: 'aiTourStartPulse 2.2s ease-in-out infinite',
                  '@keyframes aiTourStartPulse': {
                    '0%, 100%': {
                      transform: 'scale(1)',
                      boxShadow: '0 10px 24px rgba(90,100,255,0.28)',
                    },
                    '50%': {
                      transform: 'scale(1.025)',
                      boxShadow: '0 14px 30px rgba(125,75,255,0.36)',
                    },
                  },
                  '&:hover': {
                    filter: 'brightness(1.05)',
                  },
                  '&.Mui-disabled': {
                    color: 'rgba(255,255,255,0.86)',
                    backgroundImage: 'linear-gradient(90deg, rgba(90,100,255,0.78) 0%, rgba(125,75,255,0.78) 100%)',
                  },
                }}
              >
                {aiTourBooting ? 'AI Focusing...' : 'Start AI Tour'}
              </Button>
            </Paper>
          )}

          <Paper elevation={0} sx={{p: 1.45, bgcolor: 'rgba(15, 27, 45, 0.92)', border: '1px solid rgba(119,151,190,0.24)', borderRadius: 2}}>
            <Typography sx={{fontSize: 14, color: '#FFFFFF', fontWeight: 900, mb: 1}}>Quick Filters</Typography>
            <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.8}}>
              {['Americas', 'Europe', 'Asia Pacific', 'All Sites'].map((filter) => (
                <Button
                  key={filter}
                  startIcon={<GlobeIcon sx={{fontSize: 16}} />}
                  onClick={() => setActiveRegion(filter as RegionFilter)}
                  sx={{
                    height: 40,
                    color: activeRegion === filter ? '#58A3FF' : '#B5C6DA',
                    border: `1px solid ${activeRegion === filter ? 'rgba(52,141,255,0.70)' : 'rgba(119,151,190,0.22)'}`,
                    bgcolor: activeRegion === filter ? 'rgba(52,141,255,0.12)' : 'rgba(255,255,255,0.02)',
                    borderRadius: 1.2,
                    textTransform: 'none',
                    fontWeight: 850,
                  }}
                >
                  {filter}
                </Button>
              ))}
            </Box>
          </Paper>
        </Box>
      </Box>

      <Paper elevation={0} sx={{overflow: 'hidden', bgcolor: 'rgba(15,27,45,0.94)', border: '1px solid rgba(119,151,190,0.24)', borderRadius: 1.6}}>
        <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', md: 'repeat(6, minmax(0, 1fr))'}}}>
          {liveKpiCards.map((card, index) => (
            <Box key={`${index}-${card.value}`} sx={{p: 1.1, minHeight: 86, borderRight: {xs: 'none', md: '1px solid rgba(119,151,190,0.18)'}, borderBottom: {xs: '1px solid rgba(119,151,190,0.18)', md: 'none'}}}>
              <Typography sx={{fontSize: 11, color: '#C6D3E3', fontWeight: 500}}>{card.label}</Typography>
              <Typography sx={{fontSize: 17, color: '#FFFFFF', fontWeight: 700, mt: 0.75, lineHeight: 1}}>{card.value}</Typography>
              <Typography sx={{fontSize: 11, color: card.tone, fontWeight: 500, mt: 0.8}}>{card.delta}</Typography>
              <Box sx={{mt: 0.55}}>
                <TrendLine values={card.trend} tone={card.tone} width={74} height={22} fill />
              </Box>
            </Box>
          ))}
          {facilityType !== 'Distribution Centers' && facilityType !== 'Office Buildings' ? (
            <Box sx={{p: 1.1, minHeight: 86}}>
              <Typography sx={{fontSize: 11, color: '#C6D3E3', fontWeight: 500}}>Total Sites</Typography>
              <Typography sx={{fontSize: 17, color: '#FFFFFF', fontWeight: 700, mt: 0.75, lineHeight: 1}}>{filteredSites.length}</Typography>
              <Typography sx={{fontSize: 11, color: '#9EB2C8', fontWeight: 500, mt: 0.8}}>Across 4 Regions</Typography>
              <Box sx={{mt: 0.75, color: '#7F95AD'}}>
                <GlobeIcon sx={{fontSize: 18}} />
              </Box>
            </Box>
          ) : null}
        </Box>
      </Paper>

      <BenchmarkDrawer
        benchmarkKpi={activeBenchmarkKpi}
        benchmarkResult={benchmarkResult}
        benchmarkSiteNames={benchmarkSiteNames}
        insightsVisible={benchmarkInsightsVisible}
        kpiOptions={activeKpiOptions}
        onClose={() => setBenchmarkPanelOpen(false)}
        onGenerateInsights={() => setBenchmarkInsightsVisible(true)}
        onKpiChange={(kpi) => {
          setBenchmarkKpi(kpi);
          setBenchmarkResult(null);
          setBenchmarkInsightsVisible(false);
        }}
        onPrimarySiteChange={(siteName) => {
          setBenchmarkPrimarySiteName(siteName);
          setBenchmarkSiteNames((currentSiteNames) => currentSiteNames.filter((currentSiteName) => currentSiteName !== siteName));
          setBenchmarkResult(null);
          setBenchmarkInsightsVisible(false);
        }}
        onRun={handleRunBenchmark}
        onBenchmarkSitesChange={(siteNames) => {
          setBenchmarkSiteNames(siteNames.filter((siteName) => siteName !== benchmarkPrimarySiteName));
          setBenchmarkResult(null);
          setBenchmarkInsightsVisible(false);
        }}
        onTimePeriodChange={(period) => {
          setBenchmarkTimePeriod(period);
          setBenchmarkResult(null);
          setBenchmarkInsightsVisible(false);
        }}
        open={benchmarkPanelOpen}
        primarySiteName={benchmarkPrimarySite?.name ?? benchmarkPrimarySiteName}
        siteOptions={benchmarkSiteOptions}
        timePeriod={benchmarkTimePeriod}
      />
    </Box>
  );
}
