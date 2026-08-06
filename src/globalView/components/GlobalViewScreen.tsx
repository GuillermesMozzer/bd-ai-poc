import type {ReactNode} from 'react';
import {useEffect, useRef, useState} from 'react';
import {
  Box,
  Button,
  Checkbox,
  Chip,
  IconButton,
  MenuItem,
  Paper,
  Portal,
  Select,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  AccessTime as TimeIcon,
  Analytics as AnalyticsIcon,
  Apartment as OfficeIcon,
  AcUnit as HvacIcon,
  AutoAwesome as SparkleIcon,
  InfoOutlined as InfoIcon,
  Bolt as EnergyIcon,
  Business as BusinessIcon,
  CalendarMonth as CalendarIcon,
  Close as CloseIcon,
  Factory as ManufacturingIcon,
  EmojiEvents as TrophyIcon,
  Groups as PeopleIcon,
  Inventory2 as InventoryIcon,
  LocalShipping as DeliveryIcon,
  CloseFullscreen as CloseFullscreenIcon,
  OpenInFull as OpenInFullIcon,
  Paid as CostIcon,
  PlayArrow as PlayArrowIcon,
  Public as GlobeIcon,
  Search as SearchIcon,
  SettingsSuggest as ActionIcon,
  ShieldOutlined as SafetyIcon,
  ViewInAr as ThreeDModelIcon,
  Warehouse as DistributionIcon,
  WorkspacePremium as QualityIcon,
} from '@mui/icons-material';
import {useWorkstationContext} from '../../workstation/contexts/WorkstationContext';

const globalMapSources = [
  '/images/Global%20Map.png',
  '/images/reference.png',
  '/images/world-map.png',
];
const columbusSiteDetailsImage = '/images/Site%20details@2x-sharp.png';
const columbusSiteDetailsImageWidth = 960;
const columbusSiteDetailsImageHeight = 720;
const globalMapReferenceWidth = 1672;
const globalMapReferenceHeight = 941;

type SiteTone = 'excellent' | 'good' | 'warning' | 'issue';
type SiteRegion = 'Americas' | 'Europe' | 'Asia Pacific' | 'Africa';
type RegionFilter = 'All Sites' | 'Americas' | 'Europe' | 'Asia Pacific';
type FacilityType = 'All Facilities' | 'Manufacturing Sites' | 'Distribution Centers' | 'Office Buildings';
type ProductFilter =
  | 'All Products'
  | 'Autoguard'
  | 'ChloraPrep'
  | 'Eclipse Needle'
  | 'Insyte'
  | 'Nexiva'
  | 'Plastipak Syringe'
  | 'PosiFlush'
  | 'Pyxis'
  | 'Q-Syte'
  | 'Saf-T-Intima'
  | 'Scrub'
  | 'Vacutainer';
type PrimaryMapViewMode = 'Markers' | 'Heatmap' | 'Flow';
type MapViewMode = PrimaryMapViewMode | 'Global KPI';
type KpiCategory = 'Safety' | 'Quality' | 'Cost' | 'People' | 'Delivery';
type MetricKey = 'OEE' | 'Safety' | 'Quality' | 'Delivery' | 'Cost' | 'People';
type ManufacturingKpiKey =
  | 'Global Incident Count'
  | 'TRIR Global'
  | 'Days Without Incident'
  | 'ESO Count'
  | 'Unsafe Conditions'
  | 'Safe Conditions'
  | 'Open Safety Actions'
  | 'High Risk Condition Reports'
  | 'Global Quality Issues'
  | 'Total Complaints'
  | 'Batches on Hold'
  | 'Product Qty on Hold'
  | 'Avg Batch Release LT'
  | 'Open NCs'
  | 'Field Actions'
  | 'Sites with Quality Issues'
  | 'Global Production Output'
  | 'Schedule Adherence'
  | 'Global OEE'
  | 'Sites Below OEE Target'
  | 'Lines Below Target'
  | 'Global Waste'
  | 'Delivery Risk Count'
  | 'Global Total Cost'
  | 'Budget vs Actual'
  | 'Cost Variance'
  | 'Critical Cost Sites'
  | 'Cost Trend'
  | 'Global Absences'
  | 'Absences & Leaves'
  | 'Overtime Hours'
  | 'Turnover'
  | 'Voluntary Turnover'
  | 'Involuntary Turnover'
  | 'Open Positions'
  | 'Operator Open Positions'
  | 'Line Leader Open Positions'
  | 'Operations Manager Open Positions'
  | 'Recognition Count'
  | 'Sites with People Risk';
type DistributionKpiKey = 'OTIF' | 'Shipments' | 'Inventory' | 'Labor productivity' | 'Quality / damage' | 'Alerts';
type OfficeKpiKey = 'Building Health' | 'Space Utilization' | 'People on Site' | 'Energy Usage' | 'Utility Health' | 'Active Alarms';
type GlobalKpiKey = ManufacturingKpiKey | DistributionKpiKey | OfficeKpiKey;
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
  products?: Exclude<ProductFilter, 'All Products'>[];
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

type GlobalOverviewInsight = {
  accent: string;
  eyebrow: string;
  headline: string;
  summary: string;
  timestampLabel: string;
};

type GlobalOverviewState = {
  cards: KpiCard[];
  insight: GlobalOverviewInsight | null;
  metric: GlobalKpiKey;
  metricLabel: string;
};

type GlobalViewScreenProps = {
  selectHeaderHierarchy?: (nodeId: string) => void;
  setCurrentScreen?: (screen: 'shift_logbook') => void;
  onOpenColumbusLogbook3D?: () => void;
};

type GlobalKpiContributionMode = 'metric' | 'gap';

type GlobalKpiDetailModel = {
  aiInsights: Array<{
    detail: string;
    title: string;
    tone: string;
  }>;
  contributionRows: Array<{
    color: string;
    deltaText: string;
    group: 'top' | 'under';
    name: string;
    rank: number;
    value: number;
    valueText: string;
  }>;
  groupAverageValue: number;
  groupAverageText: string;
  groupAverageVsTargetText: string | null;
  heroCard: KpiCard;
  metric: GlobalKpiKey;
  regionRows: Array<{
    color: string;
    deltaText: string;
    label: string;
    networkDeltaText: string;
    networkDeltaValue: number;
    siteCount: number;
    targetDeltaText: string | null;
    targetDeltaValue: number | null;
    value: number;
    valueText: string;
  }>;
  supportMetrics: GlobalKpiKey[];
  summaryCards: KpiCard[];
  tableRows: Array<{
    deviationText: string;
    deviationTone: string;
    name: string;
    primaryText: string;
    primaryTone: string;
    rank: number;
    statusLabel: string;
    statusTone: string;
    targetText: string;
  }>;
  trendLabels: string[];
  trendTarget: number | null;
  trendValues: number[];
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
  {name: 'Sandy', oee: 89, metrics: {OEE: 89, Safety: 1, Quality: 3, Delivery: 98, Cost: 12, People: 1.8}, left: '12.6%', top: '36.4%', tone: 'excellent', region: 'Americas', products: ['Autoguard', 'Nexiva', 'Q-Syte', 'Scrub'], labelOffsetX: 34, labelOffsetY: -20},
  {name: 'El Paso', oee: 86, metrics: {OEE: 86, Safety: 2, Quality: 4, Delivery: 96, Cost: 15, People: 2.1}, left: '15.4%', top: '42.7%', tone: 'excellent', region: 'Americas', labelOffsetX: 34, labelOffsetY: -18},
  {name: 'Tijuana', oee: 84, metrics: {OEE: 84, Safety: 3, Quality: 5, Delivery: 94, Cost: 18, People: 2.4}, left: '14.8%', top: '48.1%', tone: 'excellent', region: 'Americas', products: ['Nexiva'], labelOffsetX: -92, labelOffsetY: -12},
  {name: 'Cuautitlan', oee: 83, metrics: {OEE: 83, Safety: 4, Quality: 6, Delivery: 92, Cost: 19, People: 2.7}, left: '16.9%', top: '51.1%', tone: 'excellent', region: 'Americas', labelOffsetX: -80, labelOffsetY: 18},
  {name: 'Humacao', oee: 88, metrics: {OEE: 88, Safety: 2, Quality: 3, Delivery: 97, Cost: 13, People: 1.9}, left: '24.9%', top: '53.0%', tone: 'excellent', region: 'Americas', labelOffsetX: 28, labelOffsetY: -16},
  {name: 'Columbus West', oee: 72, metrics: {OEE: 72, Safety: 9, Quality: 15, Delivery: 81, Cost: 42, People: 6.8}, left: '20.5%', top: '38.0%', tone: 'issue', region: 'Americas', products: ['Autoguard', 'ChloraPrep', 'Eclipse Needle', 'Insyte', 'Nexiva', 'Plastipak Syringe', 'PosiFlush', 'Pyxis', 'Saf-T-Intima', 'Vacutainer'], labelOffsetX: 16, labelOffsetY: -18},
  {name: 'Columbus East', oee: 79, metrics: {OEE: 79, Safety: 5, Quality: 7, Delivery: 89, Cost: 24, People: 3.4}, left: '20.7%', top: '42.8%', tone: 'excellent', region: 'Americas', products: ['Insyte', 'Nexiva', 'PosiFlush'], labelOffsetX: 18, labelOffsetY: -8},
  {name: 'Juiz de Fora', oee: 74, metrics: {OEE: 74, Safety: 8, Quality: 12, Delivery: 84, Cost: 36, People: 5.9}, left: '33.9%', top: '72.5%', tone: 'issue', region: 'Americas', labelOffsetX: 28, labelOffsetY: -16},
  {name: 'Plymouth', oee: 78, metrics: {OEE: 78, Safety: 5, Quality: 8, Delivery: 88, Cost: 26, People: 3.8}, left: '46.3%', top: '28.6%', tone: 'good', region: 'Europe', labelOffsetX: -98, labelOffsetY: -26},
  {name: 'Le Pont-de-Claix', oee: 77, metrics: {OEE: 77, Safety: 7, Quality: 10, Delivery: 86, Cost: 32, People: 4.7}, left: '48.0%', top: '33.0%', tone: 'good', region: 'Europe', products: ['ChloraPrep'], labelOffsetX: -42, labelOffsetY: 20},
  {name: 'Fraga', oee: 75, metrics: {OEE: 75, Safety: 9, Quality: 11, Delivery: 85, Cost: 34, People: 5.1}, left: '45.6%', top: '38.9%', tone: 'issue', region: 'Europe', products: ['Autoguard', 'Nexiva'], labelOffsetX: -92, labelOffsetY: -12},
  {name: 'Tatabanya', oee: 81, metrics: {OEE: 81, Safety: 4, Quality: 6, Delivery: 90, Cost: 21, People: 3.1}, left: '54.4%', top: '34.9%', tone: 'excellent', region: 'Europe', labelOffsetX: 20, labelOffsetY: -24},
  {name: 'Shanghai', oee: 82, metrics: {OEE: 82, Safety: 3, Quality: 5, Delivery: 93, Cost: 20, People: 2.6}, left: '82.3%', top: '43.1%', tone: 'excellent', region: 'Asia Pacific', products: ['Nexiva'], labelOffsetX: 24, labelOffsetY: -14},
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

const aiTourTypingPauseUnits = 0;
const aiTourTypingStepUnits = 1;
const aiTourTypingTickMs = 28;
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

const kpiCategoryOptions = [
  {label: 'Safety', icon: <SafetyIcon sx={{fontSize: 16}} />},
  {label: 'Quality', icon: <QualityIcon sx={{fontSize: 16}} />},
  {label: 'Cost', icon: <CostIcon sx={{fontSize: 16}} />},
  {label: 'People', icon: <PeopleIcon sx={{fontSize: 16}} />},
  {label: 'Delivery', icon: <DeliveryIcon sx={{fontSize: 16}} />},
] satisfies Array<{
  icon: ReactNode;
  label: KpiCategory;
}>;

const manufacturingKpiOptions = [
  {label: 'Global Incident Count', category: 'Safety', icon: <SafetyIcon sx={{fontSize: 16}} />},
  {label: 'TRIR Global', category: 'Safety', icon: <SafetyIcon sx={{fontSize: 16}} />},
  {label: 'Days Without Incident', category: 'Safety', icon: <SafetyIcon sx={{fontSize: 16}} />},
  {label: 'ESO Count', category: 'Safety', icon: <SafetyIcon sx={{fontSize: 16}} />},
  {label: 'Unsafe Conditions', category: 'Safety', icon: <SafetyIcon sx={{fontSize: 16}} />},
  {label: 'Safe Conditions', category: 'Safety', icon: <SafetyIcon sx={{fontSize: 16}} />},
  {label: 'Open Safety Actions', category: 'Safety', icon: <SafetyIcon sx={{fontSize: 16}} />},
  {label: 'High Risk Condition Reports', category: 'Safety', icon: <SafetyIcon sx={{fontSize: 16}} />},
  {label: 'Global Quality Issues', category: 'Quality', icon: <QualityIcon sx={{fontSize: 16}} />},
  {label: 'Total Complaints', category: 'Quality', icon: <QualityIcon sx={{fontSize: 16}} />},
  {label: 'Batches on Hold', category: 'Quality', icon: <QualityIcon sx={{fontSize: 16}} />},
  {label: 'Product Qty on Hold', category: 'Quality', icon: <InventoryIcon sx={{fontSize: 16}} />},
  {label: 'Avg Batch Release LT', category: 'Quality', icon: <TimeIcon sx={{fontSize: 16}} />},
  {label: 'Open NCs', category: 'Quality', icon: <QualityIcon sx={{fontSize: 16}} />},
  {label: 'Field Actions', category: 'Quality', icon: <ActionIcon sx={{fontSize: 16}} />},
  {label: 'Sites with Quality Issues', category: 'Quality', icon: <QualityIcon sx={{fontSize: 16}} />},
  {label: 'Global Total Cost', category: 'Cost', icon: <CostIcon sx={{fontSize: 16}} />},
  {label: 'Budget vs Actual', category: 'Cost', icon: <CostIcon sx={{fontSize: 16}} />},
  {label: 'Cost Variance', category: 'Cost', icon: <CostIcon sx={{fontSize: 16}} />},
  {label: 'Critical Cost Sites', category: 'Cost', icon: <CostIcon sx={{fontSize: 16}} />},
  {label: 'Cost Trend', category: 'Cost', icon: <CostIcon sx={{fontSize: 16}} />},
  {label: 'Global Absences', category: 'People', icon: <PeopleIcon sx={{fontSize: 16}} />},
  {label: 'Absences & Leaves', category: 'People', icon: <PeopleIcon sx={{fontSize: 16}} />},
  {label: 'Overtime Hours', category: 'People', icon: <PeopleIcon sx={{fontSize: 16}} />},
  {label: 'Turnover', category: 'People', icon: <PeopleIcon sx={{fontSize: 16}} />},
  {label: 'Voluntary Turnover', category: 'People', icon: <PeopleIcon sx={{fontSize: 16}} />},
  {label: 'Involuntary Turnover', category: 'People', icon: <PeopleIcon sx={{fontSize: 16}} />},
  {label: 'Open Positions', category: 'People', icon: <PeopleIcon sx={{fontSize: 16}} />},
  {label: 'Operator Open Positions', category: 'People', icon: <PeopleIcon sx={{fontSize: 16}} />},
  {label: 'Line Leader Open Positions', category: 'People', icon: <PeopleIcon sx={{fontSize: 16}} />},
  {label: 'Operations Manager Open Positions', category: 'People', icon: <PeopleIcon sx={{fontSize: 16}} />},
  {label: 'Recognition Count', category: 'People', icon: <PeopleIcon sx={{fontSize: 16}} />},
  {label: 'Sites with People Risk', category: 'People', icon: <PeopleIcon sx={{fontSize: 16}} />},
  {label: 'Global Production Output', category: 'Delivery', icon: <DeliveryIcon sx={{fontSize: 16}} />},
  {label: 'Schedule Adherence', category: 'Delivery', icon: <DeliveryIcon sx={{fontSize: 16}} />},
  {label: 'Global OEE', category: 'Delivery', icon: <AnalyticsIcon sx={{fontSize: 16}} />},
  {label: 'Sites Below OEE Target', category: 'Delivery', icon: <AnalyticsIcon sx={{fontSize: 16}} />},
  {label: 'Lines Below Target', category: 'Delivery', icon: <DeliveryIcon sx={{fontSize: 16}} />},
  {label: 'Global Waste', category: 'Delivery', icon: <InventoryIcon sx={{fontSize: 16}} />},
  {label: 'Delivery Risk Count', category: 'Delivery', icon: <DeliveryIcon sx={{fontSize: 16}} />},
] satisfies Array<{
  icon: ReactNode;
  label: ManufacturingKpiKey;
  category: KpiCategory;
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

const productFilterOptions = [
  {label: 'All Products', icon: <InventoryIcon sx={{fontSize: 16}} />},
  {label: 'Autoguard', icon: <InventoryIcon sx={{fontSize: 16}} />},
  {label: 'ChloraPrep', icon: <InventoryIcon sx={{fontSize: 16}} />},
  {label: 'Eclipse Needle', icon: <InventoryIcon sx={{fontSize: 16}} />},
  {label: 'Insyte', icon: <InventoryIcon sx={{fontSize: 16}} />},
  {label: 'Nexiva', icon: <InventoryIcon sx={{fontSize: 16}} />},
  {label: 'Plastipak Syringe', icon: <InventoryIcon sx={{fontSize: 16}} />},
  {label: 'PosiFlush', icon: <InventoryIcon sx={{fontSize: 16}} />},
  {label: 'Pyxis', icon: <InventoryIcon sx={{fontSize: 16}} />},
  {label: 'Q-Syte', icon: <InventoryIcon sx={{fontSize: 16}} />},
  {label: 'Saf-T-Intima', icon: <InventoryIcon sx={{fontSize: 16}} />},
  {label: 'Scrub', icon: <InventoryIcon sx={{fontSize: 16}} />},
  {label: 'Vacutainer', icon: <InventoryIcon sx={{fontSize: 16}} />},
] satisfies Array<{
  icon: ReactNode;
  label: ProductFilter;
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

const manufacturingKpiKeySet = new Set<GlobalKpiKey>(manufacturingKpiOptions.map((option) => option.label));
const distributionKpiKeySet = new Set<GlobalKpiKey>(distributionKpiOptions.map((option) => option.label));
const officeKpiKeySet = new Set<GlobalKpiKey>(officeKpiOptions.map((option) => option.label));

function isManufacturingKpiKey(value: GlobalKpiKey): value is ManufacturingKpiKey {
  return manufacturingKpiKeySet.has(value);
}

function isDistributionKpiKey(value: GlobalKpiKey): value is DistributionKpiKey {
  return distributionKpiKeySet.has(value);
}

function isOfficeKpiKey(value: GlobalKpiKey): value is OfficeKpiKey {
  return officeKpiKeySet.has(value);
}

type KpiDefinition = {
  label: string;
  highIsBetter: boolean;
  formatValue: (value: number) => string;
  mapValueLabel: (value: number) => string;
};

type ManufacturingKpiDefinition = KpiDefinition & {
  category: KpiCategory;
  getValue: (site: GlobalSite) => number;
};

const distributionKpiCategoryMap: Record<KpiCategory, DistributionKpiKey[]> = {
  Safety: ['Alerts'],
  Quality: ['Quality / damage'],
  Cost: ['Inventory', 'Labor productivity'],
  People: ['Labor productivity'],
  Delivery: ['OTIF', 'Shipments', 'Inventory'],
};

const officeKpiCategoryMap: Record<KpiCategory, OfficeKpiKey[]> = {
  Safety: ['Active Alarms', 'Utility Health'],
  Quality: ['Building Health'],
  Cost: ['Energy Usage'],
  People: ['People on Site', 'Space Utilization'],
  Delivery: ['Space Utilization', 'Building Health'],
};

const manufacturingKpiDefinitions: Record<ManufacturingKpiKey, ManufacturingKpiDefinition> = {
  'Global Incident Count': {
    category: 'Safety',
    label: 'Global Incident Count',
    highIsBetter: false,
    formatValue: (value) => `${Math.round(value)}`,
    mapValueLabel: (value) => `Incidents ${Math.round(value)}`,
    getValue: (site) => site.metrics.Safety,
  },
  'TRIR Global': {
    category: 'Safety',
    label: 'TRIR Global',
    highIsBetter: false,
    formatValue: (value) => value.toFixed(2),
    mapValueLabel: (value) => `TRIR ${value.toFixed(2)}`,
    getValue: (site) => Number((site.metrics.Safety * 0.02).toFixed(2)),
  },
  'Days Without Incident': {
    category: 'Safety',
    label: 'Days Without Incident',
    highIsBetter: true,
    formatValue: (value) => `${Math.round(value)} days`,
    mapValueLabel: (value) => `${Math.round(value)} days`,
    getValue: (site) => Math.max(0, 45 - site.metrics.Safety * 4),
  },
  'ESO Count': {
    category: 'Safety',
    label: 'ESO Count',
    highIsBetter: true,
    formatValue: (value) => `${Math.round(value).toLocaleString()}`,
    mapValueLabel: (value) => `ESO ${Math.round(value).toLocaleString()}`,
    getValue: (site) => 2600 - site.metrics.Safety * 120,
  },
  'Unsafe Conditions': {
    category: 'Safety',
    label: 'Unsafe Conditions',
    highIsBetter: false,
    formatValue: (value) => `${Math.round(value)}`,
    mapValueLabel: (value) => `Unsafe ${Math.round(value)}`,
    getValue: (site) => site.metrics.Safety * 46 + 40,
  },
  'Safe Conditions': {
    category: 'Safety',
    label: 'Safe Conditions',
    highIsBetter: true,
    formatValue: (value) => `${Math.round(value).toLocaleString()}`,
    mapValueLabel: (value) => `Safe ${Math.round(value).toLocaleString()}`,
    getValue: (site) => 1700 - site.metrics.Safety * 70,
  },
  'Open Safety Actions': {
    category: 'Safety',
    label: 'Open Safety Actions',
    highIsBetter: false,
    formatValue: (value) => `${Math.round(value)}`,
    mapValueLabel: (value) => `Open ${Math.round(value)}`,
    getValue: (site) => site.metrics.Safety * 4 + 6,
  },
  'High Risk Condition Reports': {
    category: 'Safety',
    label: 'High Risk Condition Reports',
    highIsBetter: false,
    formatValue: (value) => `${Math.round(value)}`,
    mapValueLabel: (value) => `High Risk ${Math.round(value)}`,
    getValue: (site) => site.metrics.Safety + 3,
  },
  'Global Quality Issues': {
    category: 'Quality',
    label: 'Global Quality Issues',
    highIsBetter: false,
    formatValue: (value) => `${Math.round(value / 1000)}K`,
    mapValueLabel: (value) => `Issues ${Math.round(value / 1000)}K`,
    getValue: (site) => site.metrics.Quality * 4000 + 20000,
  },
  'Total Complaints': {
    category: 'Quality',
    label: 'Total Complaints',
    highIsBetter: false,
    formatValue: (value) => `${Math.round(value / 1000)}K`,
    mapValueLabel: (value) => `Complaints ${Math.round(value / 1000)}K`,
    getValue: (site) => site.metrics.Quality * 3800 + 15000,
  },
  'Batches on Hold': {
    category: 'Quality',
    label: 'Batches on Hold',
    highIsBetter: false,
    formatValue: (value) => `${Math.round(value)}`,
    mapValueLabel: (value) => `Hold ${Math.round(value)}`,
    getValue: (site) => site.metrics.Quality + 2,
  },
  'Product Qty on Hold': {
    category: 'Quality',
    label: 'Product Qty on Hold',
    highIsBetter: false,
    formatValue: (value) => `${Math.round(value).toLocaleString()}`,
    mapValueLabel: (value) => `Qty ${Math.round(value).toLocaleString()}`,
    getValue: (site) => site.metrics.Quality * 900 + 2500,
  },
  'Avg Batch Release LT': {
    category: 'Quality',
    label: 'Avg Batch Release LT',
    highIsBetter: false,
    formatValue: (value) => `${value.toFixed(1)} days`,
    mapValueLabel: (value) => `LT ${value.toFixed(1)}d`,
    getValue: (site) => Number((0.8 + site.metrics.Quality * 0.12).toFixed(1)),
  },
  'Open NCs': {
    category: 'Quality',
    label: 'Open NCs',
    highIsBetter: false,
    formatValue: (value) => `${Math.round(value)}`,
    mapValueLabel: (value) => `NCs ${Math.round(value)}`,
    getValue: (site) => site.metrics.Quality * 3.4 + 8,
  },
  'Field Actions': {
    category: 'Quality',
    label: 'Field Actions',
    highIsBetter: false,
    formatValue: (value) => `${Math.round(value)}`,
    mapValueLabel: (value) => `Actions ${Math.round(value)}`,
    getValue: (site) => site.metrics.Quality * 1.8 + 4,
  },
  'Sites with Quality Issues': {
    category: 'Quality',
    label: 'Sites with Quality Issues',
    highIsBetter: false,
    formatValue: (value) => `${Math.round(value)} sites`,
    mapValueLabel: (value) => `${Math.round(value)} sites`,
    getValue: (site) => Math.max(1, Math.round(site.metrics.Quality / 3)),
  },
  'Global Total Cost': {
    category: 'Cost',
    label: 'Global Total Cost',
    highIsBetter: false,
    formatValue: (value) => `$${Math.round(value)}K`,
    mapValueLabel: (value) => `$${Math.round(value)}K`,
    getValue: (site) => site.metrics.Cost * 16 + 80,
  },
  'Budget vs Actual': {
    category: 'Cost',
    label: 'Budget vs Actual',
    highIsBetter: false,
    formatValue: (value) => `Var $${Math.round(value)}K`,
    mapValueLabel: (value) => `Var $${Math.round(value)}K`,
    getValue: (site) => site.metrics.Cost * 1.8,
  },
  'Cost Variance': {
    category: 'Cost',
    label: 'Cost Variance',
    highIsBetter: false,
    formatValue: (value) => `${value.toFixed(1)}%`,
    mapValueLabel: (value) => `Var ${value.toFixed(1)}%`,
    getValue: (site) => Number((site.metrics.Cost / 2 - 12).toFixed(1)),
  },
  'Critical Cost Sites': {
    category: 'Cost',
    label: 'Critical Cost Sites',
    highIsBetter: false,
    formatValue: (value) => `${Math.round(value)}`,
    mapValueLabel: (value) => `Critical ${Math.round(value)}`,
    getValue: (site) => Math.max(1, Math.round(site.metrics.Cost / 12)),
  },
  'Cost Trend': {
    category: 'Cost',
    label: 'Cost Trend',
    highIsBetter: false,
    formatValue: (value) => `${value.toFixed(1)}%`,
    mapValueLabel: (value) => `Trend ${value.toFixed(1)}%`,
    getValue: (site) => Number((site.metrics.Cost / 3 - 4).toFixed(1)),
  },
  'Global Absences': {
    category: 'People',
    label: 'Global Absences',
    highIsBetter: false,
    formatValue: (value) => `${value.toFixed(1)}%`,
    mapValueLabel: (value) => `Abs ${value.toFixed(1)}%`,
    getValue: (site) => Number((site.metrics.People * 2.2).toFixed(1)),
  },
  'Absences & Leaves': {
    category: 'People',
    label: 'Absences & Leaves',
    highIsBetter: false,
    formatValue: (value) => `${value.toFixed(1)}%`,
    mapValueLabel: (value) => `Leaves ${value.toFixed(1)}%`,
    getValue: (site) => Number((site.metrics.People * 2 + 3).toFixed(1)),
  },
  'Overtime Hours': {
    category: 'People',
    label: 'Overtime Hours',
    highIsBetter: false,
    formatValue: (value) => `${Math.round(value).toLocaleString()}h`,
    mapValueLabel: (value) => `OT ${Math.round(value).toLocaleString()}h`,
    getValue: (site) => site.metrics.People * 480 + 700,
  },
  Turnover: {
    category: 'People',
    label: 'Turnover',
    highIsBetter: false,
    formatValue: (value) => `${value.toFixed(1)}%`,
    mapValueLabel: (value) => `Turnover ${value.toFixed(1)}%`,
    getValue: (site) => Number((site.metrics.People * 1.8 + 1).toFixed(1)),
  },
  'Voluntary Turnover': {
    category: 'People',
    label: 'Voluntary Turnover',
    highIsBetter: false,
    formatValue: (value) => `${value.toFixed(1)}%`,
    mapValueLabel: (value) => `Vol ${value.toFixed(1)}%`,
    getValue: (site) => Number((site.metrics.People * 0.9 + 0.5).toFixed(1)),
  },
  'Involuntary Turnover': {
    category: 'People',
    label: 'Involuntary Turnover',
    highIsBetter: false,
    formatValue: (value) => `${value.toFixed(1)}%`,
    mapValueLabel: (value) => `Inv ${value.toFixed(1)}%`,
    getValue: (site) => Number((site.metrics.People * 0.8 + 0.4).toFixed(1)),
  },
  'Open Positions': {
    category: 'People',
    label: 'Open Positions',
    highIsBetter: false,
    formatValue: (value) => `${Math.round(value)}`,
    mapValueLabel: (value) => `Open ${Math.round(value)}`,
    getValue: (site) => Math.round(site.metrics.People * 1.5 + 1),
  },
  'Operator Open Positions': {
    category: 'People',
    label: 'Operator Open Positions',
    highIsBetter: false,
    formatValue: (value) => `${Math.round(value)}`,
    mapValueLabel: (value) => `Ops ${Math.round(value)}`,
    getValue: (site) => Math.round(site.metrics.People * 0.7 + 1),
  },
  'Line Leader Open Positions': {
    category: 'People',
    label: 'Line Leader Open Positions',
    highIsBetter: false,
    formatValue: (value) => `${Math.round(value)}`,
    mapValueLabel: (value) => `Leads ${Math.round(value)}`,
    getValue: (site) => Math.round(site.metrics.People * 0.5 + 1),
  },
  'Operations Manager Open Positions': {
    category: 'People',
    label: 'Operations Manager Open Positions',
    highIsBetter: false,
    formatValue: (value) => `${Math.round(value)}`,
    mapValueLabel: (value) => `Mgr ${Math.round(value)}`,
    getValue: (site) => Math.max(1, Math.round(site.metrics.People * 0.25)),
  },
  'Recognition Count': {
    category: 'People',
    label: 'Recognition Count',
    highIsBetter: true,
    formatValue: (value) => `${Math.round(value)}`,
    mapValueLabel: (value) => `Recog ${Math.round(value)}`,
    getValue: (site) => Math.max(25, Math.round(180 - site.metrics.People * 12)),
  },
  'Sites with People Risk': {
    category: 'People',
    label: 'Sites with People Risk',
    highIsBetter: false,
    formatValue: (value) => `${Math.round(value)} sites`,
    mapValueLabel: (value) => `${Math.round(value)} sites`,
    getValue: (site) => Math.max(1, Math.round(site.metrics.People / 2)),
  },
  'Global Production Output': {
    category: 'Delivery',
    label: 'Global Production Output',
    highIsBetter: true,
    formatValue: (value) => `${Math.round(value)}M`,
    mapValueLabel: (value) => `${Math.round(value)}M`,
    getValue: (site) => site.metrics.Delivery * 8 + 140,
  },
  'Schedule Adherence': {
    category: 'Delivery',
    label: 'Schedule Adherence',
    highIsBetter: true,
    formatValue: (value) => `${Math.round(value)}%`,
    mapValueLabel: (value) => `Sched ${Math.round(value)}%`,
    getValue: (site) => site.metrics.Delivery,
  },
  'Global OEE': {
    category: 'Delivery',
    label: 'Global OEE',
    highIsBetter: true,
    formatValue: (value) => `${Math.round(value)}%`,
    mapValueLabel: (value) => `OEE ${Math.round(value)}%`,
    getValue: (site) => site.oee,
  },
  'Sites Below OEE Target': {
    category: 'Delivery',
    label: 'Sites Below OEE Target',
    highIsBetter: false,
    formatValue: (value) => `${Math.round(value)} sites`,
    mapValueLabel: (value) => `${Math.round(value)} sites`,
    getValue: (site) => Math.max(0, Math.ceil((82 - site.oee) / 4) + 1),
  },
  'Lines Below Target': {
    category: 'Delivery',
    label: 'Lines Below Target',
    highIsBetter: false,
    formatValue: (value) => `${Math.round(value)}`,
    mapValueLabel: (value) => `Lines ${Math.round(value)}`,
    getValue: (site) => Math.max(0, Math.round((95 - site.metrics.Delivery) / 2)),
  },
  'Global Waste': {
    category: 'Delivery',
    label: 'Global Waste',
    highIsBetter: false,
    formatValue: (value) => `${Math.round(value)}M`,
    mapValueLabel: (value) => `Waste ${Math.round(value)}M`,
    getValue: (site) => site.metrics.Cost * 4.5 + 50,
  },
  'Delivery Risk Count': {
    category: 'Delivery',
    label: 'Delivery Risk Count',
    highIsBetter: false,
    formatValue: (value) => `${Math.round(value)}`,
    mapValueLabel: (value) => `Risk ${Math.round(value)}`,
    getValue: (site) => Math.max(1, Math.round((100 - site.metrics.Delivery) / 2.5)),
  },
};

function getKpiOptionsForFacility(facilityType: FacilityType, category: KpiCategory): Array<{icon: ReactNode; label: GlobalKpiKey}> {
  if (facilityType === 'Distribution Centers') {
    const allowedLabels = new Set<DistributionKpiKey>(distributionKpiCategoryMap[category]);
    return distributionKpiOptions.filter((option) => allowedLabels.has(option.label));
  }

  if (facilityType === 'Office Buildings') {
    const allowedLabels = new Set<OfficeKpiKey>(officeKpiCategoryMap[category]);
    return officeKpiOptions.filter((option) => allowedLabels.has(option.label));
  }

  return manufacturingKpiOptions
    .filter((option) => option.category === category)
    .map(({icon, label}) => ({icon, label}));
}

function getCategoryForKpi(metric: GlobalKpiKey): KpiCategory {
  if (isManufacturingKpiKey(metric)) return manufacturingKpiDefinitions[metric].category;

  const distributionCategory = kpiCategoryOptions.find((option) => distributionKpiCategoryMap[option.label].includes(metric as DistributionKpiKey));
  if (distributionCategory) return distributionCategory.label;

  const officeCategory = kpiCategoryOptions.find((option) => officeKpiCategoryMap[option.label].includes(metric as OfficeKpiKey));
  if (officeCategory) return officeCategory.label;

  return 'Delivery';
}

function getDefaultKpiForFacility(facilityType: FacilityType, category: KpiCategory): GlobalKpiKey {
  const options = getKpiOptionsForFacility(facilityType, category);
  return options[0]?.label ?? 'Global OEE';
}

function isKpiAllowedForFacility(kpi: GlobalKpiKey, facilityType: FacilityType, category: KpiCategory) {
  return getKpiOptionsForFacility(facilityType, category).some((option) => option.label === kpi);
}

function getMetricDefinition(metric: GlobalKpiKey): KpiDefinition {
  if (isManufacturingKpiKey(metric)) return manufacturingKpiDefinitions[metric];
  if (isDistributionKpiKey(metric)) return distributionMetricDefinitions[metric];
  if (isOfficeKpiKey(metric)) return officeMetricDefinitions[metric];
  return metricDefinitions.OEE;
}

function getSiteMetricValue(site: GlobalSite, metric: GlobalKpiKey) {
  if (isManufacturingKpiKey(metric)) {
    return manufacturingKpiDefinitions[metric].getValue(site);
  }

  if (isDistributionKpiKey(metric)) {
    return site.distributionMetrics?.[metric] ?? 0;
  }

  if (isOfficeKpiKey(metric)) {
    return site.officeMetrics?.[metric] ?? 0;
  }

  return site.oee;
}

function getKpiUiLabel(label: string) {
  const overrides: Record<string, string> = {
    'TRIR Global': 'TRIR',
  };

  return overrides[label] ?? label.replace(/^Global\s+/, '').replace(/\s+Global$/, '');
}

function getOverviewMetricAggregate(metric: GlobalKpiKey, sites: GlobalSite[]) {
  if (!sites.length) return 0;
  return sites.reduce((sum, site) => sum + getSiteMetricValue(site, metric), 0) / sites.length;
}

function buildOverviewTrendFromSites(metric: GlobalKpiKey, sites: GlobalSite[]) {
  if (!sites.length) return Array.from({length: 12}, () => 0);

  const definition = getMetricDefinition(metric);
  const siteTrends = sites.map((site) => (
    buildTrendFromMetric(
      site.name,
      metric,
      getSiteMetricValue(site, metric),
      definition.highIsBetter,
    )
  ));

  return Array.from({length: siteTrends[0]?.length ?? 0}, (_, index) => {
    const average = siteTrends.reduce((sum, trend) => sum + (trend[index] ?? 0), 0) / siteTrends.length;
    return Number(average.toFixed(1));
  });
}

function getOverviewCardTone(metric: GlobalKpiKey, value: number) {
  const target = getOverviewTarget(getKpiUiLabel(metric));
  const definition = getMetricDefinition(metric);
  if (target === null) return '#8FBFFF';

  const delta = value - target;
  if (Math.abs(delta) < 0.05) return '#8FBFFF';

  const gapRatio = Math.abs(delta) / Math.max(Math.abs(target), 1);
  if (definition.highIsBetter) {
    if (delta >= 0) return '#67E86B';
    return gapRatio <= 0.05 ? '#FF9C3A' : '#FF5252';
  }

  if (delta <= 0) return '#67E86B';
  return gapRatio <= 0.05 ? '#FF9C3A' : '#FF5252';
}

function formatOverviewPeriodDelta(metric: GlobalKpiKey, trend: number[]) {
  const current = trend[trend.length - 1] ?? 0;
  const previous = trend[trend.length - 2] ?? current;
  const delta = Number((current - previous).toFixed(1));

  if (Math.abs(delta) < 0.05) return 'Flat vs previous period';
  return `${formatSignedMetricDelta(metric, delta)} vs previous period`;
}

function buildDynamicOverviewCard(metric: GlobalKpiKey, sites: GlobalSite[]): KpiCard {
  const definition = getMetricDefinition(metric);
  const value = getOverviewMetricAggregate(metric, sites);
  const trend = buildOverviewTrendFromSites(metric, sites);

  return {
    label: getKpiUiLabel(metric),
    value: definition.formatValue(value),
    delta: formatOverviewPeriodDelta(metric, trend),
    tone: getOverviewCardTone(metric, value),
    trend,
  };
}

function buildGlobalKpiHeaderCards(metric: GlobalKpiKey, facilityType: FacilityType, sites: GlobalSite[]) {
  return getKpiOptionsForFacility(facilityType, getCategoryForKpi(metric)).map(({label}) => ({
    card: buildDynamicOverviewCard(label, sites),
    metric: label,
  }));
}

function buildDynamicManufacturingOverviewCards(metric: ManufacturingKpiKey, sites: GlobalSite[]) {
  if (metric !== 'ESO Count' || !sites.length) return null;

  const overviewMetrics: GlobalKpiKey[] = [
    'ESO Count',
    'Safe Conditions',
    'Unsafe Conditions',
    'High Risk Condition Reports',
    'Open Safety Actions',
  ];

  return overviewMetrics.map((overviewMetric) => buildDynamicOverviewCard(overviewMetric, sites));
}

function getGlobalOverviewCards(metric: GlobalKpiKey, facilityType: FacilityType, cycleIndex: number, sites: GlobalSite[] = []) {
  if (facilityType === 'Distribution Centers') {
    return distributionKpiCardPresets[cycleIndex % distributionKpiCardPresets.length] ?? distributionKpiCards;
  }

  if (facilityType === 'Office Buildings') {
    return officeKpiCardPresets[cycleIndex % officeKpiCardPresets.length] ?? officeKpiCardPresets[0];
  }

  if (isManufacturingKpiKey(metric)) {
    const dynamicCards = buildDynamicManufacturingOverviewCards(metric, sites);
    if (dynamicCards?.length) return dynamicCards;

    const metricPreset = manufacturingOverviewCardPresets[metric];
    if (metricPreset?.length) {
      return metricPreset[cycleIndex % metricPreset.length] ?? metricPreset[0];
    }
  }

  const category = getCategoryForKpi(metric);
  const presetKey: MetricKey = category === 'Delivery'
    ? getKpiUiLabel(metric) === 'OEE' ? 'OEE' : 'Delivery'
    : category;

  return liveKpiPresets[presetKey][cycleIndex % liveKpiPresets[presetKey].length] ?? liveKpiPresets[presetKey][0];
}

function getOverviewTarget(metricLabel: string) {
  const targetMap: Record<string, number> = {
    OEE: 80,
    'Global OEE': 80,
    OTIF: 98,
    'Schedule Adherence': 90,
    Inventory: 99,
    'Global Production Output': 850,
    'Sites Below OEE Target': 0,
    'Lines Below Target': 0,
    'Global Waste': 12,
    'Delivery Risk Count': 3,
    'Global Incident Count': 4,
    'TRIR Global': 0.25,
    'Days Without Incident': 30,
    'ESO Count': 2200,
    'Unsafe Conditions': 180,
    'Safe Conditions': 1200,
    'Open Safety Actions': 20,
    'High Risk Condition Reports': 5,
    'Global Quality Issues': 24000,
    'Total Complaints': 18000,
    'Batches on Hold': 8,
    'Product Qty on Hold': 6000,
    'Avg Batch Release LT': 1.6,
    'Open NCs': 20,
    'Field Actions': 9,
    'Sites with Quality Issues': 2,
    'Global Total Cost': 280,
    'Budget vs Actual': 18,
    'Cost Variance': 4,
    'Critical Cost Sites': 2,
    'Cost Trend': 3,
    'Global Absences': 5,
    'Absences & Leaves': 6.5,
    'Overtime Hours': 2200,
    Turnover: 4,
    'Voluntary Turnover': 2.5,
    'Involuntary Turnover': 1.5,
    'Open Positions': 6,
    'Operator Open Positions': 3,
    'Line Leader Open Positions': 1,
    'Operations Manager Open Positions': 1,
    'Recognition Count': 120,
    'Sites with People Risk': 2,
    Shipments: 42000,
    'Labor productivity': 45,
    'Quality / damage': 1,
    Alerts: 3,
    'Building Health': 85,
    'Space Utilization': 82,
    'People on Site': 900,
    'Energy Usage': 14,
    'Utility Health': 96,
    'Active Alarms': 3,
  };

  return targetMap[metricLabel] ?? null;
}

function buildGlobalOverviewInsight(
  metric: GlobalKpiKey,
  cards: KpiCard[],
  topPerforming: TrendSite[],
  sitesWithIssues: TrendSite[],
): GlobalOverviewInsight | null {
  const metricLabel = getKpiUiLabel(metric);
  const definition = getMetricDefinition(metric);
  const leadCard = cards[0];
  if (!leadCard) return null;

  const leadValue = Number.parseFloat(leadCard.value.replace(/[^\d.-]/g, '')) || 0;
  const target = getOverviewTarget(metricLabel);
  const topNames = topPerforming.slice(0, 2).map((site) => site.name).join(' and ') || 'the leading sites';
  const offenderNames = sitesWithIssues.slice(0, 2).map((site) => site.name).join(' and ') || 'the lowest-performing sites';

  if (metricLabel === 'OEE') {
    const gap = target === null ? 0 : Math.max(0, Math.round((target - leadValue) * 10) / 10);
    return gap > 0
      ? {
          accent: leadCard.tone,
          eyebrow: 'Global OEE Gap',
          headline: `Global OEE is ${gap} pts below the ${target}% target.`,
          summary: `${offenderNames} are the main offenders holding recovery back, while ${topNames} continue to define the global benchmark for this KPI.`,
          timestampLabel: 'Global now',
        }
      : {
          accent: leadCard.tone,
          eyebrow: 'Global OEE Status',
          headline: `Global OEE is holding above the ${target}% target.`,
          summary: `${topNames} are sustaining the pace, and the remaining sites are keeping enough stability to protect the global target.`,
          timestampLabel: 'Global now',
        };
  }

  if (metric === 'ESO Count') {
    const safeConditions = cards.find((card) => getKpiUiLabel(String(card.label)) === 'Safe Conditions')?.value ?? 'n/a';
    const unsafeConditions = cards.find((card) => getKpiUiLabel(String(card.label)) === 'Unsafe Conditions')?.value ?? 'n/a';
    return {
      accent: leadCard.tone,
      eyebrow: 'Global ESO',
      headline: `Network ESO average is ${leadCard.value}, with safe conditions averaging ${safeConditions}.`,
      summary: `${unsafeConditions} unsafe conditions remain open on average, and ${offenderNames} are pulling the network away from the ${target === null ? metricLabel : definition.formatValue(target)} target.`,
      timestampLabel: 'Global now',
    };
  }

  if (getCategoryForKpi(metric) === 'Safety') {
    return {
      accent: leadCard.tone,
      eyebrow: 'Global Safety',
      headline: `${metricLabel} remains the main global safety watchpoint.`,
      summary: `${offenderNames} need the closest follow-up right now, while ${topNames} are setting the strongest safety baseline for the rest of the sites.`,
      timestampLabel: 'Global now',
    };
  }

  if (target !== null) {
    const gap = Math.round((leadValue - target) * 10) / 10;
    return {
      accent: leadCard.tone,
      eyebrow: `Global ${metricLabel}`,
      headline: gap >= 0
        ? `${metricLabel} is ${Math.abs(gap)} pts above the global target.`
        : `${metricLabel} is ${Math.abs(gap)} pts below the global target.`,
      summary: `${topNames} are leading the benchmark, while ${offenderNames} are driving most of the remaining gap globally for this KPI.`,
      timestampLabel: 'Global now',
    };
  }

  return {
    accent: leadCard.tone,
    eyebrow: `Global ${metricLabel}`,
    headline: `${metricLabel} is the main global watchpoint for this view.`,
    summary: `${topNames} are holding the strongest performance, while ${offenderNames} are contributing the biggest downside pressure for this KPI right now.`,
    timestampLabel: 'Global now',
  };
}

function parseNumericCardValue(value: string) {
  return Number.parseFloat(value.replace(/[^\d.-]/g, '')) || 0;
}

function formatSignedMetricDelta(metric: GlobalKpiKey, value: number) {
  const absValue = Math.abs(value);
  const prefix = value > 0 ? '+' : value < 0 ? '-' : '';

  if ([
    'Global OEE',
    'Schedule Adherence',
    'Global Absences',
    'Absences & Leaves',
    'Turnover',
    'Voluntary Turnover',
    'Involuntary Turnover',
    'OTIF',
    'Inventory',
    'Quality / damage',
    'Building Health',
    'Space Utilization',
    'Utility Health',
  ].includes(metric)) {
    return `${prefix}${absValue.toFixed(absValue % 1 ? 1 : 0)} pts`;
  }

  if (metric === 'TRIR Global') return `${prefix}${absValue.toFixed(2)}`;
  if (metric === 'Overtime Hours') return `${prefix}${Math.round(absValue)}h`;
  if (['Global Total Cost', 'Budget vs Actual'].includes(metric)) return `${prefix}$${Math.round(absValue)}K`;
  if (['Global Production Output', 'Global Waste'].includes(metric)) return `${prefix}${Math.round(absValue)}M`;

  return `${prefix}${absValue.toFixed(absValue % 1 ? 1 : 0)}`;
}

function aggregateTrendValues(values: number[], buckets = 5) {
  if (!values.length) return Array.from({length: buckets}, () => 0);
  const chunkSize = Math.max(1, Math.floor(values.length / buckets));

  return Array.from({length: buckets}, (_, bucketIndex) => {
    const start = bucketIndex * chunkSize;
    const end = bucketIndex === buckets - 1 ? values.length : start + chunkSize;
    const slice = values.slice(start, end);
    const average = slice.reduce((sum, entry) => sum + entry, 0) / Math.max(slice.length, 1);
    return Number(average.toFixed(1));
  });
}

function ensureTrendCrossesTarget(values: number[], target: number | null, highIsBetter: boolean) {
  if (!values.length || target === null) return values;

  const hasTargetCross = values.some((value) => (
    highIsBetter ? value >= target : value <= target
  ));

  if (hasTargetCross) return values;

  const nextValues = [...values];
  const pivotIndex = Math.max(1, nextValues.length - 2);
  const crossedValue = highIsBetter ? target + 18 : Math.max(0, target - 1.2);
  nextValues[pivotIndex] = Number(crossedValue.toFixed(1));
  return nextValues;
}

function getSoftStatusTone(tone: SiteTone) {
  if (tone === 'excellent') return '#55DD74';
  if (tone === 'good') return '#E5B257';
  if (tone === 'warning') return '#F2A15A';
  return '#FF717A';
}

function getTargetDeltaTone({
  highIsBetter,
  value,
}: {
  highIsBetter: boolean;
  value: number;
}) {
  if (Math.abs(value) < 0.05) return '#8FBFFF';
  if (highIsBetter) return value >= 0 ? '#55DD74' : '#FF717A';
  return value <= 0 ? '#55DD74' : '#FF717A';
}

function getGlobalKpiAccentTone(tone: string) {
  const normalizedTone = tone.toUpperCase();
  if (normalizedTone.startsWith('#FF45') || normalizedTone.startsWith('#FF5') || normalizedTone.startsWith('#FF6')) return '#FF717A';
  if (normalizedTone.startsWith('#67E8') || normalizedTone.startsWith('#55D') || normalizedTone.startsWith('#4CE')) return '#61DB80';
  if (normalizedTone.startsWith('#FFB3') || normalizedTone.startsWith('#F2A1') || normalizedTone.startsWith('#FF8A')) return '#E7B565';
  if (normalizedTone.startsWith('#8FBF') || normalizedTone.startsWith('#58A3') || normalizedTone.startsWith('#4EA4')) return '#8FBFFF';
  return tone;
}

function getKpiPerformanceTone(card: KpiCard) {
  const summary = getOverviewTargetSummary(card);
  const summaryTone = summary?.deltaTone;

  if (summaryTone === '#55DD74') return '#61DB80';
  if (summaryTone === '#FF717A') return '#FF717A';
  if (summaryTone === '#8FBFFF') return '#61DB80';

  const accentTone = getGlobalKpiAccentTone(card.tone);
  if (accentTone === '#61DB80') return accentTone;
  if (accentTone === '#FF717A') return accentTone;
  if (accentTone === '#E7B565') return '#FF717A';
  if (accentTone === '#8FBFFF') {
    const normalizedDelta = card.delta.trim().toLowerCase();
    if (normalizedDelta.startsWith('-')) return '#FF717A';
    return '#61DB80';
  }

  return accentTone;
}

function hexToRgba(hex: string, alpha: number) {
  const normalized = hex.replace('#', '');
  if (normalized.length !== 6) return `rgba(97, 219, 128, ${alpha})`;

  const red = Number.parseInt(normalized.slice(0, 2), 16);
  const green = Number.parseInt(normalized.slice(2, 4), 16);
  const blue = Number.parseInt(normalized.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function buildSmoothSvgPath(points: Array<{x: number; y: number}>) {
  if (!points.length) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let path = `M ${points[0].x} ${points[0].y}`;

  for (let index = 0; index < points.length - 1; index += 1) {
    const previousPoint = points[index - 1] ?? points[index];
    const currentPoint = points[index];
    const nextPoint = points[index + 1];
    const followingPoint = points[index + 2] ?? nextPoint;

    const controlPointOneX = currentPoint.x + (nextPoint.x - previousPoint.x) / 6;
    const controlPointOneY = currentPoint.y + (nextPoint.y - previousPoint.y) / 6;
    const controlPointTwoX = nextPoint.x - (followingPoint.x - currentPoint.x) / 6;
    const controlPointTwoY = nextPoint.y - (followingPoint.y - currentPoint.y) / 6;

    path += ` C ${controlPointOneX} ${controlPointOneY}, ${controlPointTwoX} ${controlPointTwoY}, ${nextPoint.x} ${nextPoint.y}`;
  }

  return path;
}

function buildThresholdLineSegments(
  points: Array<{x: number; y: number; value: number}>,
  threshold: number,
  getTone: (value: number) => string,
) {
  if (points.length < 2) return [];

  const segments: Array<{path: string; tone: string}> = [];

  for (let index = 0; index < points.length - 1; index += 1) {
    const startPoint = points[index];
    const endPoint = points[index + 1];
    const startTone = getTone(startPoint.value);
    const endTone = getTone(endPoint.value);

    if (startTone === endTone || startPoint.value === endPoint.value) {
      segments.push({
        path: `M ${startPoint.x} ${startPoint.y} L ${endPoint.x} ${endPoint.y}`,
        tone: startTone,
      });
      continue;
    }

    const ratio = (threshold - startPoint.value) / (endPoint.value - startPoint.value);
    const clampedRatio = Math.min(1, Math.max(0, ratio));
    const intersectionX = startPoint.x + (endPoint.x - startPoint.x) * clampedRatio;
    const intersectionY = startPoint.y + (endPoint.y - startPoint.y) * clampedRatio;

    segments.push({
      path: `M ${startPoint.x} ${startPoint.y} L ${intersectionX} ${intersectionY}`,
      tone: startTone,
    });
    segments.push({
      path: `M ${intersectionX} ${intersectionY} L ${endPoint.x} ${endPoint.y}`,
      tone: endTone,
    });
  }

  return segments;
}

function getGlobalKpiToneSurface(tone: string, emphasis = false) {
  const accentTone = getGlobalKpiAccentTone(tone);
  return [
    emphasis
      ? 'linear-gradient(180deg, rgba(11, 23, 39, 0.98), rgba(8, 18, 31, 0.98))'
      : 'linear-gradient(180deg, rgba(10, 22, 38, 0.96), rgba(8, 18, 31, 0.96))',
    `radial-gradient(circle at 16% 18%, ${hexToRgba(accentTone, emphasis ? 0.10 : 0.07)} 0%, transparent 32%)`,
    `radial-gradient(circle at 88% 82%, ${hexToRgba(accentTone, emphasis ? 0.05 : 0.035)} 0%, transparent 24%)`,
    subtlePanelFill,
  ].join(', ');
}

function getMetricDriverNarrative(metric: GlobalKpiKey, supportMetrics: GlobalKpiKey[]) {
  if (metric === 'Global OEE' || metric === 'Schedule Adherence' || metric === 'Global Production Output') {
    return 'availability losses, output cadence, and schedule adherence';
  }
  if (metric === 'ESO Count') {
    return 'safe observations captured, unsafe conditions still open, and high-risk follow-up discipline';
  }
  if (metric === 'Unsafe Conditions' || metric === 'High Risk Condition Reports' || metric === 'Open Safety Actions') {
    return 'unsafe-condition closure, escalation quality, and action ownership';
  }

  const category = getCategoryForKpi(metric);
  if (category === 'Safety') return 'reporting quality, exposure reduction, and closure discipline';
  if (category === 'Quality') return 'containment, release stability, and non-conformance closure';
  if (category === 'Delivery') return 'plan adherence, throughput reliability, and backlog or shipment flow';
  if (category === 'Cost') return 'scrap, rework, and spending control';
  if (category === 'People') return 'attendance stability, staffing coverage, and overtime pressure';

  if (supportMetrics.length) {
    return supportMetrics.slice(0, 2).map((supportMetric) => getKpiUiLabel(supportMetric).toLowerCase()).join(' and ');
  }

  return `${getKpiUiLabel(metric).toLowerCase()} performance drivers`;
}

function getMetricContributionNarrative(metric: GlobalKpiKey, metricLabel: string) {
  if (metric === 'Global OEE') return `Largest site contribution to ${metricLabel} recovery`;
  if (metric === 'ESO Count') return `Strongest site contribution to ${metricLabel} coverage`;
  if (metric === 'Unsafe Conditions') return `Greatest concentration of open ${metricLabel.toLowerCase()}`;
  if (metric === 'High Risk Condition Reports') return `Sites driving critical ${metricLabel.toLowerCase()}`;

  const category = getCategoryForKpi(metric);
  if (category === 'Delivery') return `Sites shaping ${metricLabel.toLowerCase()} reliability`;
  if (category === 'Quality') return `Sites concentrating ${metricLabel.toLowerCase()} pressure`;
  if (category === 'Cost') return `Sites driving ${metricLabel.toLowerCase()} variance`;
  if (category === 'People') return `Sites shaping ${metricLabel.toLowerCase()} stability`;
  if (category === 'Safety') return `Sites shaping ${metricLabel.toLowerCase()} exposure`;

  return `Largest site contribution to ${metricLabel}`;
}

function getMetricRegionNarrative(metric: GlobalKpiKey, metricLabel: string) {
  if (metric === 'Global OEE') return `${metricLabel} benchmark by region, showing where asset effectiveness is being sustained and where downtime drag remains concentrated.`;
  if (metric === 'ESO Count') return `${metricLabel} benchmark by region, showing where proactive reporting is strongest and where observation coverage still needs reinforcement.`;
  if (metric === 'Unsafe Conditions') return `Regional comparison of ${metricLabel.toLowerCase()}, highlighting where exposure remains elevated and closure pace is lagging.`;
  if (metric === 'High Risk Condition Reports') return `Regional comparison of ${metricLabel.toLowerCase()}, highlighting where escalation risk is clustering.`;

  const category = getCategoryForKpi(metric);
  if (category === 'Delivery') return `Regional comparison of ${metricLabel.toLowerCase()}, showing where operational flow is protecting service and where it is slipping.`;
  if (category === 'Quality') return `Regional comparison of ${metricLabel.toLowerCase()}, showing where containment is strongest and where quality loss is still concentrated.`;
  if (category === 'Cost') return `Regional comparison of ${metricLabel.toLowerCase()}, showing where cost pressure is controlled and where it is accumulating.`;
  if (category === 'People') return `Regional comparison of ${metricLabel.toLowerCase()}, showing where staffing stability is strongest and where pressure is building.`;
  if (category === 'Safety') return `Regional comparison of ${metricLabel.toLowerCase()}, showing where exposure is under control and where follow-up is still needed.`;

  return `Regional comparison of ${metricLabel.toLowerCase()} across the active network footprint.`;
}

function getMetricSelectedSiteNarrative(metric: GlobalKpiKey, metricLabel: string) {
  if (metric === 'Global OEE') return `The next review should stay on asset effectiveness, line loss concentration, and how schedule discipline is affecting this site's OEE.`;
  if (metric === 'ESO Count') return `The next review should stay on reporting culture, safe-vs-unsafe mix, and whether this site is converting observations into action quickly enough.`;

  const category = getCategoryForKpi(metric);
  if (category === 'Quality') return `The next review should stay on containment speed, release stability, and which local losses are driving this quality signal.`;
  if (category === 'Delivery') return `The next review should stay on throughput reliability, missed plan sources, and whether this site is causing downstream service risk.`;
  if (category === 'Cost') return `The next review should stay on scrap, rework, and whether this site's current loss pattern is recurring or episodic.`;
  if (category === 'People') return `The next review should stay on staffing coverage, attendance pressure, and whether overtime is masking a structural gap.`;

  return `The next review should stay tightly centered on this site's operating rhythm and how it is shaping ${metricLabel.toLowerCase()}.`;
}

function getMetricRegionActionNarrative(metric: GlobalKpiKey, metricLabel: string) {
  if (metric === 'Global OEE') return `Stay filtered on the region while comparing plant-level OEE versus target, because that shows whether the gap is isolated to one plant or systemic across the region.`;
  if (metric === 'ESO Count') return `Stay filtered on the region while comparing safe observations, unsafe conditions, and high-risk reports, because that reveals whether reporting maturity is broad or concentrated.`;

  const category = getCategoryForKpi(metric);
  if (category === 'Quality') return `Stay filtered on the region while comparing plant-level gaps, because that makes it easier to separate one-site containment failures from broader process instability.`;
  if (category === 'Delivery') return `Stay filtered on the region while comparing plan adherence and throughput, because that shows whether service risk is local or structural.`;
  if (category === 'Cost') return `Stay filtered on the region while comparing site-level loss pockets, because that shows whether cost pressure is concentrated or repeating across multiple plants.`;
  if (category === 'People') return `Stay filtered on the region while comparing staffing and overtime patterns, because that shows whether people risk is isolated or shared.`;

  return `Stay filtered on the region while comparing plant-level gaps, because that makes it easier to see whether the issue is concentrated or spread across the regional pattern.`;
}

function formatOverviewNumber(value: number) {
  return Number.isInteger(value) ? `${Math.round(value)}` : value.toFixed(1);
}

function formatOverviewValueLike(template: string, value: number) {
  const numericText = formatOverviewNumber(value);

  if (template.includes('$')) {
    if (template.includes('M')) return `$${numericText}M`;
    if (template.includes('K') || template.includes('k')) return `$${numericText}K`;
    return `$${numericText}`;
  }
  if (template.includes('%')) return `${numericText}%`;
  if (template.includes('MWh')) return `${numericText} MWh`;
  if (template.includes('K') || template.includes('k')) return `${numericText}K`;
  if (template.includes('M')) return `${numericText}M`;
  if (template.includes('h')) return `${numericText}h`;
  return numericText;
}

function formatOverviewDeltaLike(template: string, value: number) {
  const absValue = Math.abs(value);
  const prefix = value > 0 ? '+' : value < 0 ? '-' : '';
  return `${prefix}${formatOverviewValueLike(template, absValue)}`;
}

function formatTrendAxisLabel(template: string, value: number) {
  if (template.includes('%')) return `${Math.round(value)}%`;
  if (template.includes('$')) return `${Math.round(value)}`;
  if (template.includes('MWh')) return value >= 100 ? `${Math.round(value)}` : value.toFixed(1);
  if (Math.abs(value) >= 100 || Number.isInteger(value)) return `${Math.round(value)}`;
  return value.toFixed(1);
}

function getTrendChartRange(values: number[], target: number | null) {
  const allValues = target !== null ? [...values, target] : values;
  const rawMax = Math.max(...allValues);
  const rawMin = Math.min(...allValues);
  const rawRange = Math.max(rawMax - rawMin, 1);
  const padding = Math.max(rawRange * 0.12, Math.max(Math.abs(rawMax), Math.abs(rawMin), 1) * 0.02);

  return {
    maxValue: rawMax + padding,
    minValue: Math.max(0, rawMin - padding),
  };
}

function isHigherBetterOverviewMetric(metricLabel: string) {
  return !new Set([
    'Safety Incidents',
    'Open Investigations',
    'Critical Risks',
    'Non-conformities',
    'Open CAPAs',
    'Defect Rate',
    'Escaped Defects',
    'Missed Plan',
    'Expedites',
    'Scrap Cost',
    'Rework Cost',
    'Material Loss',
    'Waste Rate',
    'Absenteeism',
    'Overtime Hours',
    'Open Shifts',
    'Turnover Risk',
    'Unsafe Conditions',
    'High Risk Condition Reports',
    'Open Safety Actions',
    'Sites Below OEE Target',
    'Lines Below Target',
    'Delivery Risk Count',
    'Warehouse Damage',
    'Energy Usage',
    'Facility Alarms',
    'Active Alerts',
    'Active Alarms',
  ]).has(metricLabel);
}

function getOverviewTargetSummary(card: KpiCard) {
  const metricLabel = getKpiUiLabel(String(card.label));
  const targetValue = getOverviewTarget(metricLabel);

  if (targetValue === null) return null;

  const currentValue = parseNumericCardValue(card.value);
  const deltaValue = Number((currentValue - targetValue).toFixed(1));
  const highIsBetter = isHigherBetterOverviewMetric(metricLabel);

  return {
    deltaText: Math.abs(deltaValue) < 0.05
      ? 'On target'
      : `${formatOverviewDeltaLike(card.value, deltaValue)} vs target`,
    deltaTone: getTargetDeltaTone({highIsBetter, value: deltaValue}),
    targetText: formatOverviewValueLike(card.value, targetValue),
  };
}

function getGlobalDetailSupportMetrics(metric: GlobalKpiKey, facilityType: FacilityType): GlobalKpiKey[] {
  if (facilityType === 'Distribution Centers') return ['Shipments', 'Inventory'];
  if (facilityType === 'Office Buildings') return ['People on Site', 'Utility Health'];

  switch (metric) {
    case 'Global OEE':
    case 'Schedule Adherence':
    case 'Global Production Output':
    case 'Sites Below OEE Target':
      return ['Global Production Output', 'Schedule Adherence'];
    case 'ESO Count':
    case 'Global Incident Count':
    case 'TRIR Global':
      return ['Safe Conditions', 'Unsafe Conditions'];
    case 'Global Quality Issues':
    case 'Total Complaints':
      return ['Batches on Hold', 'Product Qty on Hold'];
    case 'Global Total Cost':
    case 'Cost Variance':
      return ['Budget vs Actual', 'Cost Trend'];
    case 'Global Absences':
    case 'Turnover':
      return ['Open Positions', 'Overtime Hours'];
    default: {
      const category = getCategoryForKpi(metric);
      if (category === 'Safety') return ['Open Safety Actions', 'High Risk Condition Reports'];
      if (category === 'Quality') return ['Batches on Hold', 'Open NCs'];
      if (category === 'Cost') return ['Budget vs Actual', 'Cost Trend'];
      if (category === 'People') return ['Open Positions', 'Overtime Hours'];
      return ['Global Production Output', 'Schedule Adherence'];
    }
  }
}

function buildGlobalKpiDetailModel({
  cards,
  contributionMode,
  facilityType,
  metric,
  sites,
  toneByName,
}: {
  cards: KpiCard[];
  contributionMode: GlobalKpiContributionMode;
  facilityType: FacilityType;
  metric: GlobalKpiKey;
  sites: GlobalSite[];
  toneByName: Map<string, SiteTone>;
}): GlobalKpiDetailModel {
  const definition = getMetricDefinition(metric);
  const sortedSites = [...sites].sort((siteA, siteB) => (
    definition.highIsBetter
      ? getSiteMetricValue(siteB, metric) - getSiteMetricValue(siteA, metric)
      : getSiteMetricValue(siteA, metric) - getSiteMetricValue(siteB, metric)
  ));
  const heroCard = cards[0] ?? {label: getKpiUiLabel(metric), value: definition.formatValue(0), delta: 'No change', tone: '#8FBFFF', trend: [0, 0, 0, 0, 0]};
  const summaryCards = cards.slice(1, 4);
  const trendLabels = ['Apr 14-20', 'Apr 21-27', 'Apr 28-May 4', 'May 5-May 11', 'May 12-May 18'];
  const trendTarget = getOverviewTarget(getKpiUiLabel(metric));
  const trendValues = metric === 'ESO Count'
    ? ensureTrendCrossesTarget(
        aggregateTrendValues(heroCard.trend, trendLabels.length),
        trendTarget,
        definition.highIsBetter,
      )
    : aggregateTrendValues(heroCard.trend, trendLabels.length);
  const supportMetrics = getGlobalDetailSupportMetrics(metric, facilityType);
  const globalAverage = sortedSites.reduce((sum, site) => sum + getSiteMetricValue(site, metric), 0) / Math.max(sortedSites.length, 1);
  const referenceValue = trendTarget ?? globalAverage;
  const topRows = sortedSites.slice(0, 3);
  const underRows = sortedSites.slice(-3).reverse();
  const contributionRows = [...topRows.map((site, index) => {
    const metricValue = getSiteMetricValue(site, metric);
    const gap = metricValue - referenceValue;
    return {
      color: '#55DD74',
      deltaText: formatSignedMetricDelta(metric, gap),
      group: 'top' as const,
      name: site.name,
      rank: index + 1,
      value: contributionMode === 'gap' ? Math.abs(gap) : metricValue,
      valueText: definition.formatValue(metricValue),
    };
  }), ...underRows.map((site, index) => {
    const metricValue = getSiteMetricValue(site, metric);
    const gap = metricValue - referenceValue;
    return {
      color: '#FF717A',
      deltaText: formatSignedMetricDelta(metric, gap),
      group: 'under' as const,
      name: site.name,
      rank: topRows.length + index + 1,
      value: contributionMode === 'gap' ? Math.abs(gap) : metricValue,
      valueText: definition.formatValue(metricValue),
    };
  })];
  const orderedTableSites = definition.highIsBetter ? [...sortedSites].reverse() : [...sortedSites];
  const tableRows = orderedTableSites.slice(0, 10).map((site, index) => {
    const tone = toneByName.get(site.name) ?? 'good';
    const primaryTone = getSoftStatusTone(tone);
    const primaryValue = getSiteMetricValue(site, metric);
    const targetValue = trendTarget ?? referenceValue;
    const deviationValue = Number((primaryValue - targetValue).toFixed(1));
    return {
      deviationText: formatSignedMetricDelta(metric, deviationValue),
      deviationTone: getTargetDeltaTone({highIsBetter: definition.highIsBetter, value: deviationValue}),
      name: site.name,
      primaryText: definition.formatValue(primaryValue),
      primaryTone,
      rank: index + 1,
      statusLabel: siteToneMap[tone].label,
      statusTone: primaryTone,
      targetText: definition.formatValue(targetValue),
    };
  });
  const regionOrder: SiteRegion[] = ['Americas', 'Europe', 'Asia Pacific', 'Africa'];
  const regionColors: Record<SiteRegion, string> = {
    Americas: '#FF717A',
    Europe: '#E5B257',
    'Asia Pacific': '#55DD74',
    Africa: '#72A8FF',
  };
  const regionRows = regionOrder
    .map((region) => {
      const regionSites = sortedSites.filter((site) => site.region === region);
      if (!regionSites.length) return null;
      const average = regionSites.reduce((sum, site) => sum + getSiteMetricValue(site, metric), 0) / regionSites.length;
      const targetDeltaValue = trendTarget === null ? null : Number((average - trendTarget).toFixed(1));
      const networkDeltaValue = Number((average - globalAverage).toFixed(1));
      return {
        color: regionColors[region],
        deltaText: formatSignedMetricDelta(metric, average - referenceValue),
        label: region,
        networkDeltaText: formatSignedMetricDelta(metric, networkDeltaValue),
        networkDeltaValue,
        siteCount: regionSites.length,
        targetDeltaText: targetDeltaValue === null ? null : formatSignedMetricDelta(metric, targetDeltaValue),
        targetDeltaValue,
        value: average,
        valueText: definition.formatValue(Number(average.toFixed(1))),
      };
    })
    .filter((row): row is NonNullable<typeof row> => Boolean(row))
    .sort((rowA, rowB) => (
      definition.highIsBetter
        ? rowB.value - rowA.value
        : rowA.value - rowB.value
    ));
  const leadingSite = topRows[0] ?? null;
  const recoverySite = topRows[1] ?? null;
  const laggingSite = underRows[0] ?? null;
  const gapAmount = trendTarget === null ? null : Number(Math.abs(referenceValue - globalAverage).toFixed(1));
  const driverNarrative = getMetricDriverNarrative(metric, supportMetrics);
  const aiInsights = [
    {
      title: `${getKpiUiLabel(metric)} outlook`,
      detail: gapAmount === null
        ? `Global ${getKpiUiLabel(metric)} is stable overall, with ${leadingSite?.name ?? 'the leading sites'} setting the current network pace and ${driverNarrative} explaining most of the movement.`
        : `Global ${getKpiUiLabel(metric)} is ${gapAmount} pts ${globalAverage < referenceValue ? 'below' : 'above'} target, with ${laggingSite?.name ?? 'the weakest site'} driving most of the variance through ${driverNarrative}.`,
      tone: '#8FBFFF',
    },
    {
      title: 'Primary offender',
      detail: laggingSite
        ? `${laggingSite.name} is the main offender right now, while ${recoverySite?.name ?? leadingSite?.name ?? 'the next best site'} is helping protect the KPI from slipping further. This is the first place to validate whether local operating losses match the global pattern for ${getKpiUiLabel(metric)}.`
        : `No single offender is standing out in the current selection.`,
      tone: '#F2A15A',
    },
    {
      title: 'Best benchmark',
      detail: leadingSite
        ? `${leadingSite.name} remains the strongest benchmark to replicate globally for ${getKpiUiLabel(metric)}, especially around ${driverNarrative}.`
        : `Use the strongest sites as the benchmark reference for the next action cycle.`,
      tone: '#55DD74',
    },
  ];

  return {
    aiInsights,
    contributionRows,
    groupAverageValue: Number(globalAverage.toFixed(1)),
    groupAverageText: definition.formatValue(Number(globalAverage.toFixed(1))),
    groupAverageVsTargetText: trendTarget === null ? null : `vs Target ${definition.formatValue(trendTarget)}`,
    heroCard,
    metric,
    regionRows,
    supportMetrics,
    summaryCards,
    tableRows,
    trendLabels,
    trendTarget,
    trendValues,
  };
}

function getSiteFacilityType(site: GlobalSite): Exclude<FacilityType, 'All Facilities'> {
  return site.facilityType ?? 'Manufacturing Sites';
}

function siteMatchesProductFilter(site: GlobalSite, productFilter: ProductFilter) {
  if (productFilter === 'All Products') return true;
  return site.products?.includes(productFilter) ?? false;
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
  const fallbackMetrics = getKpiOptionsForFacility(facilityType, getCategoryForKpi(primaryMetric))
    .map((option) => option.label);

  return [primaryMetric, ...fallbackMetrics]
    .filter((metric, index, metrics) => metrics.indexOf(metric) === index)
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

  if ([
    'Global OEE',
    'Schedule Adherence',
    'Cost Variance',
    'Global Absences',
    'Absences & Leaves',
    'Turnover',
    'Voluntary Turnover',
    'Involuntary Turnover',
    'OTIF',
    'Inventory',
    'Quality / damage',
    'Building Health',
    'Space Utilization',
    'Utility Health',
  ].includes(metric)) {
    return `${Number(absGap.toFixed(absGap % 1 ? 1 : 0))} pts`;
  }

  if (metric === 'TRIR Global') return absGap.toFixed(2);
  if (['Days Without Incident', 'Avg Batch Release LT'].includes(metric)) return `${absGap.toFixed(1)} days`;
  if (['Global Total Cost', 'Budget vs Actual'].includes(metric)) return `$${Math.round(absGap)}K`;
  if (['Global Production Output', 'Global Waste'].includes(metric)) return `${Math.round(absGap)}M`;
  if (metric === 'Overtime Hours') return `${Math.round(absGap)}h`;
  if (metric === 'Shipments') return `${Math.round(absGap).toLocaleString()} cases`;
  if (metric === 'Energy Usage') return `${absGap.toFixed(1)} MWh`;
  if (metric === 'People on Site') return `${Math.round(absGap).toLocaleString()} people`;
  if (metric === 'Labor productivity') return `${absGap.toFixed(1)} CPH`;

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
      {label: 'Global Production Output', value: '128K', delta: '- 4% vs Yesterday', tone: '#FF5252', trend: [56, 55, 54, 52, 51, 50, 49, 48, 47, 45, 44, 42]},
      {label: 'Schedule Adherence', value: '89%', delta: '- 3% vs Yesterday', tone: '#FF5252', trend: [58, 57, 56, 55, 53, 52, 51, 50, 48, 47, 46, 45]},
      {label: 'Sites Below OEE Target', value: '4', delta: '+ 1 vs Yesterday', tone: '#FF9C3A', trend: [42, 43, 44, 45, 46, 47, 48, 49, 50, 52, 53, 54]},
      {label: 'Active Alerts', value: '12', delta: '+ 2 vs Yesterday', tone: '#FF5252', trend: [51, 53, 52, 55, 53, 54, 56, 52, 54, 50, 51, 49]},
    ],
    [
      {label: 'Global OEE', value: '77%', delta: '+ 1% vs Yesterday', tone: '#67E86B', trend: [61, 63, 65, 67, 66, 69, 70, 72, 71, 73, 74, 76]},
      {label: 'Global Production Output', value: '131K', delta: '+ 2% vs Yesterday', tone: '#67E86B', trend: [41, 44, 46, 48, 47, 50, 52, 54, 53, 56, 57, 59]},
      {label: 'Schedule Adherence', value: '94%', delta: '+ 2% vs Yesterday', tone: '#67E86B', trend: [45, 46, 48, 50, 52, 53, 55, 56, 57, 58, 60, 61]},
      {label: 'Sites Below OEE Target', value: '3', delta: '- 1 vs Yesterday', tone: '#67E86B', trend: [54, 53, 52, 50, 49, 47, 46, 44, 43, 42, 40, 39]},
      {label: 'Active Alerts', value: '9', delta: '- 3 vs Yesterday', tone: '#67E86B', trend: [56, 54, 53, 51, 50, 48, 46, 45, 43, 42, 41, 40]},
    ],
    [
      {label: 'Global OEE', value: '75%', delta: '- 1% vs Yesterday', tone: '#FF5252', trend: [66, 65, 64, 63, 62, 61, 60, 61, 59, 58, 57, 56]},
      {label: 'Global Production Output', value: '124K', delta: '- 4% vs Yesterday', tone: '#FF5252', trend: [56, 55, 54, 52, 51, 50, 49, 48, 47, 45, 44, 42]},
      {label: 'Schedule Adherence', value: '88%', delta: '- 2% vs Yesterday', tone: '#FF5252', trend: [57, 56, 55, 54, 53, 52, 50, 49, 48, 47, 46, 44]},
      {label: 'Sites Below OEE Target', value: '5', delta: '+ 2 vs Yesterday', tone: '#FF5252', trend: [39, 40, 42, 43, 45, 47, 48, 50, 52, 53, 55, 56]},
      {label: 'Active Alerts', value: '14', delta: '+ 2 vs Yesterday', tone: '#FF5252', trend: [43, 44, 45, 47, 49, 50, 52, 53, 55, 56, 57, 59]},
    ],
  ],
  Safety: [
    [
      {label: 'Safety Incidents', value: '23', delta: '+ 3 vs Yesterday', tone: '#FF5252', trend: [44, 46, 45, 48, 47, 50, 49, 51, 53, 52, 55, 57]},
      {label: 'ESO Count', value: '2,410', delta: '+ 120 vs Yesterday', tone: '#67E86B', trend: [44, 45, 46, 47, 48, 49, 50, 52, 53, 54, 56, 58]},
      {label: 'Open Investigations', value: '8', delta: '+ 2 vs Yesterday', tone: '#FF5252', trend: [42, 43, 45, 46, 47, 49, 50, 52, 54, 55, 57, 58]},
      {label: 'Critical Risks', value: '6', delta: '+ 1 vs Yesterday', tone: '#FF5252', trend: [40, 42, 43, 45, 47, 48, 49, 51, 53, 54, 56, 57]},
      {label: 'Action Closure', value: '78%', delta: '- 4% vs Yesterday', tone: '#FF5252', trend: [60, 58, 57, 56, 55, 54, 52, 51, 50, 48, 47, 46]},
    ],
    [
      {label: 'Safety Incidents', value: '18', delta: '- 5 vs Yesterday', tone: '#67E86B', trend: [57, 55, 54, 52, 50, 49, 47, 46, 44, 43, 42, 40]},
      {label: 'ESO Count', value: '2,560', delta: '+ 96 vs Yesterday', tone: '#67E86B', trend: [48, 49, 50, 51, 52, 53, 54, 55, 57, 58, 59, 61]},
      {label: 'Open Investigations', value: '5', delta: '- 3 vs Yesterday', tone: '#67E86B', trend: [58, 56, 54, 53, 51, 49, 47, 46, 44, 43, 41, 40]},
      {label: 'Critical Risks', value: '4', delta: '- 2 vs Yesterday', tone: '#67E86B', trend: [56, 55, 53, 51, 50, 48, 47, 45, 44, 42, 41, 39]},
      {label: 'Action Closure', value: '84%', delta: '+ 6% vs Yesterday', tone: '#67E86B', trend: [46, 47, 49, 50, 52, 53, 55, 56, 58, 60, 61, 63]},
    ],
    [
      {label: 'Safety Incidents', value: '20', delta: '+ 2 vs Yesterday', tone: '#FF9C3A', trend: [46, 47, 49, 50, 51, 53, 52, 54, 55, 56, 58, 59]},
      {label: 'ESO Count', value: '2,488', delta: '+ 42 vs Yesterday', tone: '#67E86B', trend: [46, 47, 48, 49, 50, 51, 53, 54, 55, 56, 57, 58]},
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

const manufacturingOverviewCardPresets: Partial<Record<ManufacturingKpiKey, KpiCard[][]>> = {
  'Global OEE': liveKpiPresets.OEE,
  'ESO Count': [
    [
      {label: 'ESO Count', value: '2,410', delta: '+ 120 vs Yesterday', tone: '#67E86B', trend: [44, 45, 46, 47, 48, 49, 50, 52, 53, 54, 56, 58]},
      {label: 'Safe Conditions', value: '1,640', delta: '+ 84 vs Yesterday', tone: '#67E86B', trend: [46, 47, 49, 50, 52, 53, 54, 56, 57, 59, 60, 61]},
      {label: 'Unsafe Conditions', value: '420', delta: '- 18 vs Yesterday', tone: '#67E86B', trend: [58, 57, 56, 54, 53, 52, 50, 49, 48, 46, 45, 44]},
      {label: 'High Risk Condition Reports', value: '12', delta: '- 2 vs Yesterday', tone: '#67E86B', trend: [56, 55, 53, 52, 50, 49, 47, 46, 45, 43, 42, 41]},
      {label: 'Open Safety Actions', value: '38', delta: '- 4 vs Yesterday', tone: '#67E86B', trend: [55, 54, 53, 51, 50, 49, 47, 46, 45, 44, 42, 41]},
    ],
    [
      {label: 'ESO Count', value: '2,560', delta: '+ 96 vs Yesterday', tone: '#67E86B', trend: [48, 49, 50, 51, 52, 53, 54, 55, 57, 58, 59, 61]},
      {label: 'Safe Conditions', value: '1,702', delta: '+ 62 vs Yesterday', tone: '#67E86B', trend: [47, 48, 50, 52, 53, 54, 56, 57, 58, 60, 61, 63]},
      {label: 'Unsafe Conditions', value: '396', delta: '- 24 vs Yesterday', tone: '#67E86B', trend: [60, 58, 57, 56, 54, 53, 52, 50, 49, 47, 46, 44]},
      {label: 'High Risk Condition Reports', value: '10', delta: '- 2 vs Yesterday', tone: '#67E86B', trend: [59, 57, 56, 54, 53, 51, 50, 48, 47, 45, 44, 42]},
      {label: 'Open Safety Actions', value: '31', delta: '- 7 vs Yesterday', tone: '#67E86B', trend: [58, 57, 55, 54, 52, 51, 49, 48, 46, 45, 43, 42]},
    ],
    [
      {label: 'ESO Count', value: '2,488', delta: '+ 42 vs Yesterday', tone: '#67E86B', trend: [46, 47, 48, 49, 50, 51, 53, 54, 55, 56, 57, 58]},
      {label: 'Safe Conditions', value: '1,676', delta: '+ 31 vs Yesterday', tone: '#67E86B', trend: [45, 46, 47, 49, 50, 52, 53, 54, 55, 57, 58, 59]},
      {label: 'Unsafe Conditions', value: '408', delta: '- 9 vs Yesterday', tone: '#67E86B', trend: [57, 56, 55, 54, 52, 51, 50, 49, 47, 46, 45, 44]},
      {label: 'High Risk Condition Reports', value: '11', delta: '- 1 vs Yesterday', tone: '#67E86B', trend: [56, 55, 54, 53, 51, 50, 49, 47, 46, 45, 44, 43]},
      {label: 'Open Safety Actions', value: '34', delta: '- 3 vs Yesterday', tone: '#67E86B', trend: [54, 53, 52, 51, 50, 49, 47, 46, 45, 44, 43, 42]},
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

function getGlobalKpiTrendSeries(model: GlobalKpiDetailModel, focusSite: GlobalSite | null) {
  const definition = getMetricDefinition(model.metric);
  return focusSite
    ? aggregateTrendValues(
        buildTrendFromMetric(
          focusSite.name,
          model.metric,
          getSiteMetricValue(focusSite, model.metric),
          definition.highIsBetter,
        ),
        model.trendLabels.length,
      )
    : model.trendValues;
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
  onOpenColumbusLogbook,
  onOpenColumbusLogbook3D,
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
  onOpenColumbusLogbook?: () => void;
  onOpenColumbusLogbook3D?: () => void;
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
  const markerAnchorX = mapBounds
    ? mapBounds.offsetX + (parseFloat(site.left) / 100) * mapBounds.width
    : null;
  const markerAnchorY = mapBounds
    ? mapBounds.offsetY + (parseFloat(site.top) / 100) * mapBounds.height
    : null;
  const markerLeft = markerAnchorX === null ? site.left : `${Math.round(markerAnchorX)}px`;
  const markerTop = markerAnchorY === null ? site.top : `${Math.round(markerAnchorY)}px`;
  const markerSubpixelOffsetX = markerAnchorX === null ? 0 : Number((markerAnchorX - Math.round(markerAnchorX)).toFixed(3));
  const markerSubpixelOffsetY = markerAnchorY === null ? 0 : Number((markerAnchorY - Math.round(markerAnchorY)).toFixed(3));
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
          transform: 'none',
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
          left: markerSubpixelOffsetX,
          top: markerSubpixelOffsetY,
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
                    {getKpiUiLabel(metricDefinition.label)}
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
      </Box>
      {hasColumbusHover ? <ColumbusWestHoverCard onOpenLogbook={onOpenColumbusLogbook} onOpen3DModel={onOpenColumbusLogbook3D} /> : null}
      {hasFourOaksHover ? <FourOaksHoverCard /> : null}
      {hasFranklinLakesHover ? <FranklinLakesHoverCard /> : null}
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

function ColumbusWestHoverCard({onOpenLogbook, onOpen3DModel}: {onOpenLogbook?: () => void; onOpen3DModel?: () => void}) {
  const {launchSmartSearch} = useWorkstationContext();
  const [siteDetailsOpen, setSiteDetailsOpen] = useState(false);
  const [siteDetailsViewportPosition, setSiteDetailsViewportPosition] = useState<{left: number; top: number} | null>(null);
  const hoverCardRef = useRef<HTMLDivElement | null>(null);

  return (
    <>
    <Paper
      ref={hoverCardRef}
      className="global-site-hover columbus-west-hover"
      elevation={0}
      onPointerDown={(event) => event.stopPropagation()}
      onMouseLeave={() => {
        if (!siteDetailsOpen) {
          setSiteDetailsOpen(false);
        }
      }}
      sx={{
        position: 'absolute',
        left: 18,
        top: -36,
        width: 760,
        height: 640,
        p: 0,
        borderRadius: 1.6,
        color: '#EAF2FF',
        bgcolor: 'rgba(3, 12, 22, 0.98)',
        border: '1px solid rgba(90, 111, 138, 0.54)',
        boxShadow: '0 28px 80px rgba(0,0,0,0.56), inset 0 0 0 1px rgba(255,255,255,0.03)',
        overflow: 'hidden',
        display: siteDetailsOpen ? 'none' : 'block',
        opacity: 0,
        visibility: 'hidden',
        transform: 'none',
        transformOrigin: 'top left',
        transition: 'opacity 120ms ease, visibility 120ms ease',
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
      {siteDetailsOpen ? (
        null
      ) : (
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
            <Box sx={{display: 'flex', alignItems: 'center', gap: 0.8, mt: 0.9, flexWrap: 'wrap'}}>
              <Button
                onClick={(event) => {
                  event.stopPropagation();
                  const hoverCardBounds = hoverCardRef.current?.getBoundingClientRect();
                  if (hoverCardBounds) {
                    setSiteDetailsViewportPosition({
                      left: hoverCardBounds.left,
                      top: hoverCardBounds.top - 68,
                    });
                  }
                  setSiteDetailsOpen(true);
                }}
                startIcon={<InfoIcon sx={{fontSize: 14}} />}
                sx={{
                  minWidth: 'auto',
                  px: 1.1,
                  py: 0.45,
                  borderRadius: 999,
                  textTransform: 'none',
                  color: '#CFE5FF',
                  bgcolor: 'rgba(7, 53, 95, 0.58)',
                  border: '1px solid rgba(60, 151, 255, 0.32)',
                  fontSize: 11,
                  fontWeight: 800,
                  lineHeight: 1.1,
                  '&:hover': {bgcolor: 'rgba(11, 82, 146, 0.72)'},
                }}
              >
                Site details
              </Button>
              <Button
                onClick={(event) => {
                  event.stopPropagation();
                  (onOpen3DModel ?? onOpenLogbook)?.();
                }}
                startIcon={<ThreeDModelIcon sx={{fontSize: 14}} />}
                sx={{
                  minWidth: 'auto',
                  px: 1.1,
                  py: 0.45,
                  borderRadius: 999,
                  textTransform: 'none',
                  color: '#CFE5FF',
                  bgcolor: 'rgba(7, 53, 95, 0.58)',
                  border: '1px solid rgba(60, 151, 255, 0.32)',
                  fontSize: 11,
                  fontWeight: 800,
                  lineHeight: 1.1,
                  '&:hover': {bgcolor: 'rgba(11, 82, 146, 0.72)'},
                }}
              >
                3D Model
              </Button>
            </Box>
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
      )}
    </Paper>
    {siteDetailsOpen ? (
      <Portal>
        <Paper
          elevation={0}
          onPointerDown={(event) => event.stopPropagation()}
          sx={{
            position: 'fixed',
            left: siteDetailsViewportPosition?.left ?? 0,
            top: siteDetailsViewportPosition?.top ?? 0,
            width: columbusSiteDetailsImageWidth,
            height: columbusSiteDetailsImageHeight,
            p: 0,
            borderRadius: 1.6,
            overflow: 'hidden',
            border: '1px solid rgba(90, 111, 138, 0.54)',
            boxShadow: '0 28px 80px rgba(0,0,0,0.56), inset 0 0 0 1px rgba(255,255,255,0.03)',
            bgcolor: 'rgba(3, 12, 22, 0.98)',
            zIndex: 1600,
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
          <Box sx={{position: 'relative', width: '100%', height: '100%', overflow: 'hidden'}}>
            <Box
              component="img"
              src={columbusSiteDetailsImage}
              alt="Columbus West site details"
              sx={{
                display: 'block',
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'top left',
                imageRendering: 'auto',
                backfaceVisibility: 'hidden',
                transform: 'translateZ(0)',
                userSelect: 'none',
              }}
            />
            <Button
              onClick={(event) => {
                event.stopPropagation();
                setSiteDetailsOpen(false);
              }}
              startIcon={<ArrowBackIcon sx={{fontSize: 15}} />}
              sx={{
                position: 'absolute',
                top: 14,
                right: 14,
                minWidth: 'auto',
                px: 1.2,
                py: 0.55,
                borderRadius: 999,
                textTransform: 'none',
                color: '#D7E7FF',
                bgcolor: 'rgba(6, 28, 54, 0.74)',
                border: '1px solid rgba(74, 148, 255, 0.24)',
                backdropFilter: 'blur(10px)',
                fontSize: 11.5,
                fontWeight: 800,
                boxShadow: '0 8px 18px rgba(0,0,0,0.22)',
                '&:hover': {bgcolor: 'rgba(10, 38, 68, 0.86)'},
              }}
            >
              Back to summary
            </Button>
            <Tooltip title="Open Smart Search for Columbus West, Area A, Line 10, Zone 1" placement="left">
              <IconButton
                aria-label="Open Smart Search for Columbus West"
                onClick={(event) => {
                  event.stopPropagation();
                  setSiteDetailsOpen(false);
                  launchSmartSearch({
                    draftQuery: 'Show me Columbus West site details with focus on Area A, Line 10, Zone 1.',
                    focusHierarchyId: 'plant-columbus-west',
                    hierarchySeedId: 'plant-columbus-west',
                    preset: 'columbus-west-site',
                  });
                }}
                sx={{
                  position: 'absolute',
                  right: 24,
                  bottom: 26,
                  width: 36,
                  height: 36,
                  color: '#EEF6FF',
                  bgcolor: 'rgba(9, 25, 48, 0.80)',
                  border: '1px solid rgba(126, 212, 255, 0.45)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 0 0 0 rgba(14, 165, 233, 0.40)',
                  animation: 'smart-search-pulse 2.1s ease-in-out infinite',
                  '&:hover': {
                    bgcolor: 'rgba(18, 37, 74, 0.95)',
                    borderColor: 'rgba(125, 211, 252, 0.85)',
                  },
                  '@keyframes smart-search-pulse': {
                    '0%': { boxShadow: '0 0 0 0 rgba(14, 165, 233, 0.34)' },
                    '70%': { boxShadow: '0 0 0 11px rgba(14, 165, 233, 0)' },
                    '100%': { boxShadow: '0 0 0 0 rgba(14, 165, 233, 0)' },
                  },
                }}
              >
                <SearchIcon sx={{fontSize: 17}} />
              </IconButton>
            </Tooltip>
          </Box>
        </Paper>
      </Portal>
    ) : null}
    </>
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
        textRendering: 'optimizeLegibility',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
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
        textRendering: 'optimizeLegibility',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
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
  const rawRange = Math.max(max - min, 1);
  const paddedMin = min - rawRange * 0.22;
  const paddedMax = max + rawRange * 0.22;
  const range = Math.max(paddedMax - paddedMin, 1);
  const chartPaddingX = Math.max(5, Math.round(width * 0.08));
  const chartPaddingY = Math.max(4, Math.round(height * 0.16));
  const points = values
    .map((value, index) => {
      const x = chartPaddingX + (index / Math.max(values.length - 1, 1)) * Math.max(width - chartPaddingX * 2, 1);
      const normalized = (value - paddedMin) / range;
      const y = height - chartPaddingY - normalized * Math.max(height - chartPaddingY * 2, 1);
      return `${x},${y}`;
    })
    .join(' ');
  const fillPoints = `${chartPaddingX},${height - chartPaddingY + 1} ${points} ${width - chartPaddingX},${height - chartPaddingY + 1}`;

  return (
    <Box sx={{width, height, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{overflow: 'visible'}}>
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

const subtlePanelFill = 'radial-gradient(circle at top left, rgba(88,163,255,0.055), transparent 58%), linear-gradient(180deg, rgba(255,255,255,0.022), rgba(255,255,255,0.008))';
const subtleCardFill = 'radial-gradient(circle at top left, rgba(88,163,255,0.04), transparent 62%), linear-gradient(180deg, rgba(255,255,255,0.024), rgba(255,255,255,0.012))';

function GlobalOverviewPanel({
  activeMetric,
  onViewDetails,
  overviewStates,
}: {
  activeMetric: GlobalKpiKey;
  onViewDetails?: () => void;
  overviewStates: GlobalOverviewState[];
}) {
  const activeMetricIndex = Math.max(0, overviewStates.findIndex((state) => state.metric === activeMetric));
  const visibleState = overviewStates[activeMetricIndex] ?? overviewStates[0] ?? null;
  const cards = visibleState?.cards ?? [];
  const insight = visibleState?.insight ?? null;
  const metricLabel = visibleState?.metricLabel ?? getKpiUiLabel(activeMetric);
  const leadCard = cards[0];
  const detailCards = cards.slice(1, 4);
  const leadSummary = leadCard ? getOverviewTargetSummary(leadCard) : null;
  const leadTone = leadCard ? getKpiPerformanceTone(leadCard) : '#8FBFFF';

  return (
    <Paper
      elevation={0}
      sx={{
        p: 0.82,
        background: `linear-gradient(180deg, rgba(15, 27, 45, 0.95), rgba(12, 24, 40, 0.95)), ${subtlePanelFill}`,
        border: '1px solid rgba(119,151,190,0.24)',
        borderRadius: 2,
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)',
        overflow: 'visible',
        animation: 'rightRailMetricSwap 360ms cubic-bezier(0.22, 1, 0.36, 1)',
        '@keyframes rightRailMetricSwap': {
          '0%': {opacity: 0, transform: 'translateY(8px)'},
          '100%': {opacity: 1, transform: 'translateY(0)'},
        },
      }}
    >
      <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, mb: 0.5}}>
        <Box sx={{minWidth: 0}}>
          <Typography sx={{fontSize: 14, color: '#FFFFFF', fontWeight: 900, lineHeight: 1}}>Global Overview</Typography>
          <Box sx={{display: 'flex', alignItems: 'center', gap: 0.55, mt: 0.42, flexWrap: 'wrap'}}>
            <Typography sx={{fontSize: 16.2, color: leadTone, fontWeight: 950, lineHeight: 1}}>
              {metricLabel}
            </Typography>
          </Box>
        </Box>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 0.6}}>
          <Chip label="Active KPI" size="small" sx={{height: 22, bgcolor: `${hexToRgba(leadTone, 0.14)}`, color: leadTone, border: `1px solid ${hexToRgba(leadTone, 0.3)}`, fontSize: 9.5, fontWeight: 900}} />
          {onViewDetails ? (
            <Button
              onClick={onViewDetails}
              variant="text"
              sx={{
                minWidth: 0,
                px: 0.5,
                py: 0.15,
                color: '#8FC5FF',
                textTransform: 'none',
                fontSize: 10,
                fontWeight: 900,
                lineHeight: 1,
              }}
            >
              View Details
            </Button>
          ) : null}
        </Box>
      </Box>

      {overviewStates.length > 1 ? (
        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.45, mb: 0.65}}>
          {overviewStates.map((state, index) => {
            const isVisible = index === activeMetricIndex;
            return (
              <Box
                key={state.metric}
                sx={{
                  width: isVisible ? 16 : 6,
                  height: 6,
                  borderRadius: 999,
                  bgcolor: isVisible ? leadTone : 'rgba(143,191,255,0.22)',
                  boxShadow: isVisible ? `0 0 10px ${hexToRgba(leadTone, 0.34)}` : 'none',
                  transition: 'all 220ms ease',
                }}
              />
            );
          })}
        </Box>
      ) : null}

      <Box
        key={visibleState?.metric ?? metricLabel}
        sx={{
          animation: 'globalOverviewCycleFade 320ms cubic-bezier(0.22, 1, 0.36, 1)',
          '@keyframes globalOverviewCycleFade': {
            '0%': {opacity: 0, transform: 'translateY(6px)'},
            '100%': {opacity: 1, transform: 'translateY(0)'},
          },
        }}
      >
      {leadCard ? (
        <Paper elevation={0} sx={{p: 0.68, background: `linear-gradient(180deg, rgba(20,38,63,0.95), rgba(12,24,40,0.97)), ${subtleCardFill}`, border: `1px solid ${hexToRgba(leadTone, 0.2)}`, borderRadius: 1.5, boxShadow: `inset 0 1px 0 rgba(255,255,255,0.025), 0 0 0 1px ${hexToRgba(leadTone, 0.06)}`}}>
          <Typography sx={{fontSize: 10.5, color: '#9FB8D8', fontWeight: 800, mb: 0.45}}>{getKpiUiLabel(String(leadCard.label))}</Typography>
          <Box sx={{display: 'flex', alignItems: 'end', justifyContent: 'space-between', gap: 1}}>
            <Box>
              <Typography sx={{fontSize: 26, color: '#FFFFFF', fontWeight: 900, lineHeight: 1}}>{leadCard.value}</Typography>
              {leadSummary ? (
                <Typography sx={{fontSize: 10.1, color: '#8FBFFF', fontWeight: 800, mt: 0.22}}>Target: {leadSummary.targetText}</Typography>
              ) : null}
              <Typography sx={{fontSize: 10.2, color: leadSummary?.deltaTone ?? leadCard.tone, fontWeight: 800, mt: 0.3}}>
                {leadSummary?.deltaText ?? leadCard.delta}
              </Typography>
            </Box>
            <TrendLine values={leadCard.trend} tone={leadCard.tone} width={92} height={34} />
          </Box>
        </Paper>
      ) : null}

      <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 0.48, mt: 0.48}}>
        {detailCards.map((card) => {
          const cardSummary = getOverviewTargetSummary(card);
          return (
          <Paper key={String(card.label)} elevation={0} sx={{p: 0.62, minHeight: 68, background: subtleCardFill, border: '1px solid rgba(119,151,190,0.12)', borderRadius: 1.35, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.02)'}}>
            <Typography sx={{fontSize: 8.9, color: '#9FB8D8', fontWeight: 800, lineHeight: 1.05}}>{getKpiUiLabel(String(card.label))}</Typography>
            <Typography sx={{fontSize: 14.6, color: '#FFFFFF', fontWeight: 900, mt: 0.54, lineHeight: 1}}>{card.value}</Typography>
            {cardSummary ? (
              <Typography sx={{fontSize: 8.5, color: '#8FBFFF', fontWeight: 800, mt: 0.18, lineHeight: 1.02}}>Target: {cardSummary.targetText}</Typography>
            ) : null}
            <Typography sx={{fontSize: 8.8, color: cardSummary?.deltaTone ?? card.tone, fontWeight: 800, mt: 0.26, lineHeight: 1.05}}>
              {cardSummary?.deltaText ?? card.delta}
            </Typography>
          </Paper>
          );
        })}
      </Box>

      {insight ? (
        <Box sx={{mt: 0.48, p: 0.64, borderRadius: 1.35, background: subtleCardFill, border: '1px solid rgba(119,151,190,0.10)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.02)'}}>
          <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1}}>
            <Typography sx={{fontSize: 10.5, color: insight.accent, fontWeight: 900}}>{insight.eyebrow}</Typography>
            <Typography sx={{fontSize: 10, color: '#8EA5C2', fontWeight: 700}}>{insight.timestampLabel}</Typography>
          </Box>
          <Typography sx={{fontSize: 10.8, color: '#FFFFFF', fontWeight: 850, lineHeight: 1.28, mt: 0.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'}}>{insight.headline}</Typography>
          <Typography sx={{fontSize: 10.1, color: '#B7C9DD', lineHeight: 1.3, mt: 0.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'}}>{insight.summary}</Typography>
        </Box>
      ) : null}
      </Box>
    </Paper>
  );
}

function GlobalKpiStatCard({
  card,
  onClick,
  selected = false,
}: {
  card: KpiCard;
  onClick?: () => void;
  selected?: boolean;
}) {
  const accentTone = getKpiPerformanceTone(card);
  const cardSummary = getOverviewTargetSummary(card);
  const statusTone = cardSummary?.deltaTone ?? accentTone;
  const cardLabel = getKpiUiLabel(String(card.label));
  const statusLabel = selected ? 'Active KPI' : statusTone === '#7BCB94' ? 'Stable' : statusTone === '#E08A91' ? 'Watch' : 'Monitor';

  return (
    <Paper
      elevation={0}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-pressed={onClick ? selected : undefined}
      onKeyDown={onClick ? (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick();
        }
      } : undefined}
      sx={{
        p: 1.15,
        minHeight: 96,
        minWidth: 0,
        background: getGlobalKpiToneSurface(card.tone, selected),
        border: selected ? `1px solid ${accentTone}88` : '1px solid rgba(119,151,190,0.18)',
        borderRadius: 1.8,
        boxShadow: selected
          ? `0 0 0 1px ${accentTone}1F inset, 0 18px 34px ${hexToRgba(accentTone, 0.16)}, inset 0 1px 0 rgba(255,255,255,0.03)`
          : '0 10px 28px rgba(2, 10, 20, 0.18), inset 0 1px 0 rgba(255,255,255,0.025)',
        cursor: onClick ? 'pointer' : 'default',
        outline: 'none',
        transition: 'border-color 180ms ease, box-shadow 180ms ease, background 180ms ease',
        '&:hover': onClick ? {
          borderColor: selected ? `${accentTone}66` : 'rgba(143,191,255,0.28)',
          boxShadow: selected
            ? `0 0 0 1px ${accentTone}18 inset, 0 18px 34px ${hexToRgba(accentTone, 0.16)}, inset 0 1px 0 rgba(255,255,255,0.03)`
            : '0 14px 32px rgba(2, 10, 20, 0.24), inset 0 1px 0 rgba(255,255,255,0.03)',
        } : undefined,
        '&:focus-visible': onClick ? {
          borderColor: accentTone,
          boxShadow: `0 0 0 3px ${hexToRgba(accentTone, 0.22)}, 0 16px 34px rgba(2, 10, 20, 0.26)`,
        } : undefined,
      }}
    >
      {selected ? (
        <Box
          sx={{
            height: 4,
            mx: -1.15,
            mt: -1.15,
            mb: 0.9,
            borderRadius: '10px 10px 0 0',
            background: `linear-gradient(90deg, ${hexToRgba(accentTone, 0)} 0%, ${accentTone} 18%, ${accentTone} 82%, ${hexToRgba(accentTone, 0)} 100%)`,
            boxShadow: `0 0 18px ${hexToRgba(accentTone, 0.34)}`,
          }}
        />
      ) : null}
      <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1}}>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 0.65, minWidth: 0}}>
          <Typography sx={{fontSize: 11.5, color: selected ? accentTone : '#FFFFFF', fontWeight: 900, letterSpacing: 0.28, textTransform: 'uppercase'}} noWrap>
            {cardLabel}
          </Typography>
          <InfoIcon sx={{fontSize: 14, color: 'rgba(159,184,216,0.65)'}} />
        </Box>
        <TrendLine values={card.trend} tone={`${accentTone}CC`} width={76} height={22} fill={selected} />
      </Box>

      <Box sx={{mt: 1.18}}>
        <Typography sx={{fontSize: 23, color: `${accentTone}DB`, fontWeight: 950, lineHeight: 0.98, letterSpacing: -0.25}}>
          {card.value}
        </Typography>
        {cardSummary ? (
          <Typography sx={{fontSize: 10.1, color: '#8FBFFF', fontWeight: 800, mt: 0.28, opacity: 0.92}}>
            Target: {cardSummary.targetText}
          </Typography>
        ) : null}
      </Box>

      <Box sx={{mt: 0.82, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 0.75}}>
        <Box sx={{display: 'grid', gap: 0.22}}>
          <Typography sx={{fontSize: 10.8, color: cardSummary?.deltaTone ?? `${accentTone}D6`, fontWeight: 900}}>
            {cardSummary?.deltaText ?? card.delta}
          </Typography>
          {cardSummary ? (
            <Typography sx={{fontSize: 9.1, color: '#8DA3BF', fontWeight: 800, lineHeight: 1.08}}>
              {card.delta}
            </Typography>
          ) : null}
        </Box>
        <Box
          sx={{
            px: selected ? 0.7 : 0.55,
            py: selected ? 0.28 : 0.24,
            borderRadius: 999,
            bgcolor: selected ? hexToRgba(accentTone, 0.18) : hexToRgba(statusTone, 0.12),
            border: `1px solid ${selected ? `${accentTone}55` : `${statusTone}2E`}`,
            boxShadow: selected ? `0 0 14px ${hexToRgba(accentTone, 0.16)}` : 'none',
          }}
        >
          <Typography sx={{fontSize: 9.4, color: statusTone, fontWeight: 900, lineHeight: 1}}>
            {statusLabel}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}

function GlobalKpiTrendPanel({
  focusSite,
  model,
  metricLabel,
  onSelectPoint,
  selectedPointIndex,
}: {
  focusSite: GlobalSite | null;
  model: GlobalKpiDetailModel;
  metricLabel: string;
  onSelectPoint: (index: number) => void;
  selectedPointIndex: number | null;
}) {
  const accentTone = getGlobalKpiAccentTone(model.heroCard.tone);
  const definition = getMetricDefinition(model.metric);
  const sourceTrendValues = getGlobalKpiTrendSeries(model, focusSite);
  const width = 640;
  const height = 210;
  const trendTargetText = model.trendTarget === null ? null : formatOverviewValueLike(model.heroCard.value, model.trendTarget);
  const {maxValue, minValue} = getTrendChartRange(sourceTrendValues, model.trendTarget);
  const chartRange = Math.max(maxValue - minValue, 1);
  const plotTop = 18;
  const plotBottom = height - 34;
  const plotLeft = 18;
  const plotRight = width - 18;
  const toY = (value: number) => plotBottom - ((value - minValue) / chartRange) * (plotBottom - plotTop);
  const plotPoints = sourceTrendValues.map((value, index) => {
    const x = plotLeft + (index / Math.max(sourceTrendValues.length - 1, 1)) * Math.max(plotRight - plotLeft, 1);
    return {x, y: toY(value)};
  });
  const trendPoints = sourceTrendValues.map((value, index) => ({
    ...(plotPoints[index] ?? {x: plotLeft, y: plotBottom}),
    value,
  }));
  const linePath = buildSmoothSvgPath(plotPoints);
  const areaPath = `${linePath} L ${plotRight} ${plotBottom} L ${plotLeft} ${plotBottom} Z`;
  const targetY = model.trendTarget === null ? null : toY(model.trendTarget);
  const ticks = 5;
  const lastTrendValue = sourceTrendValues[sourceTrendValues.length - 1] ?? 0;
  const getTrendPerformanceTone = (value: number) => {
    if (model.trendTarget === null) return accentTone;
    const delta = Number((value - model.trendTarget).toFixed(1));
    if (Math.abs(delta) < 0.05) return '#61DB80';
    const tone = getTargetDeltaTone({
      highIsBetter: definition.highIsBetter,
      value: delta,
    });
    return tone === '#55DD74' ? '#61DB80' : tone;
  };
  const selectedPoint = selectedPointIndex === null
    ? null
    : {
        label: model.trendLabels[selectedPointIndex] ?? '',
        value: sourceTrendValues[selectedPointIndex] ?? 0,
      };
  const baseTrendTone = getTrendPerformanceTone(selectedPoint?.value ?? lastTrendValue);
  const trendLineSegments = model.trendTarget === null
    ? [{path: linePath, tone: baseTrendTone}]
    : buildThresholdLineSegments(trendPoints, model.trendTarget, getTrendPerformanceTone);
  const selectedPointY = selectedPoint ? toY(selectedPoint.value) : null;
  const selectedPointX = selectedPointIndex === null
    ? null
    : plotPoints[selectedPointIndex]?.x ?? null;

  return (
    <Paper elevation={0} sx={{p: 1.2, minHeight: 238, height: '100%', display: 'flex', flexDirection: 'column', background: `linear-gradient(180deg, rgba(10, 24, 42, 0.98), rgba(6, 17, 31, 0.98)), ${subtlePanelFill}`, border: '1px solid rgba(111,164,224,0.26)', borderRadius: 1.8, boxShadow: '0 12px 28px rgba(2,10,20,0.20), inset 0 1px 0 rgba(255,255,255,0.035)'}}>
      <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, mb: 0.95}}>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 0.65, pl: 0.8, borderLeft: `3px solid ${accentTone}`}}>
          <Typography sx={{fontSize: 11.3, color: '#FFFFFF', fontWeight: 900, letterSpacing: 0.22, textTransform: 'uppercase'}}>
            {focusSite ? `${focusSite.name} ${metricLabel} Trend` : `${metricLabel} Trend`}
          </Typography>
          <InfoIcon sx={{fontSize: 14, color: 'rgba(159,184,216,0.65)'}} />
        </Box>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 0.55}}>
          {selectedPoint ? <Chip label={`Selected: ${selectedPoint.label}`} size="small" sx={{height: 21, bgcolor: 'rgba(82,141,255,0.14)', color: '#9FD0FF', border: '1px solid rgba(82,141,255,0.26)', fontSize: 10, fontWeight: 800}} /> : null}
          {focusSite ? <Chip label="Filtered site" size="small" sx={{height: 21, bgcolor: 'rgba(82,141,255,0.10)', color: '#A8D0FF', border: '1px solid rgba(82,141,255,0.18)', fontSize: 10, fontWeight: 800}} /> : null}
          <Chip label="5 Weeks" size="small" sx={{height: 21, bgcolor: 'rgba(255,255,255,0.04)', color: '#D5E3F7', border: '1px solid rgba(119,151,190,0.22)', fontSize: 10, fontWeight: 800}} />
        </Box>
      </Box>

      <Box sx={{display: 'flex', alignItems: 'center', gap: 0.9, mb: 0.55}}>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 0.45}}>
          <Box sx={{width: 10, height: 10, borderRadius: '50%', bgcolor: baseTrendTone}} />
          <Typography sx={{fontSize: 10.4, color: '#9FB8D8', fontWeight: 700}}>{focusSite ? focusSite.name : metricLabel}</Typography>
        </Box>
        {model.trendTarget !== null && trendTargetText ? (
          <Box sx={{display: 'flex', alignItems: 'center', gap: 0.45}}>
            <Box sx={{width: 16, height: 0, borderTop: '2px dashed #4EA4FF'}} />
            <Typography sx={{fontSize: 10.2, color: '#9FB8D8', fontWeight: 700}}>Target ({trendTargetText})</Typography>
          </Box>
        ) : null}
        {model.trendTarget !== null ? (
          <Typography sx={{fontSize: 9.8, color: '#8DA3BF', fontWeight: 700}}>
            Click any point for AI context
          </Typography>
        ) : null}
      </Box>

      <Box sx={{display: 'grid', gridTemplateColumns: '46px minmax(0, 1fr)', gap: 1, alignItems: 'stretch', flex: 1, minHeight: 0}}>
        <Box sx={{display: 'grid', alignContent: 'space-between', py: 0.25}}>
          {Array.from({length: ticks}).map((_, index) => {
            const ratio = 1 - index / Math.max(ticks - 1, 1);
            const value = minValue + chartRange * ratio;
            return (
              <Typography key={index} sx={{fontSize: 10.4, color: '#8DA3BF', fontWeight: 700}}>
                {formatTrendAxisLabel(model.heroCard.value, value)}
              </Typography>
            );
          })}
        </Box>
        <Box sx={{position: 'relative', display: 'grid', gridTemplateRows: 'minmax(0, 1fr) auto', minHeight: 0, px: 0.7, pt: 0.45, pb: 0.2, borderRadius: 1.35, bgcolor: 'rgba(2,10,20,0.28)', border: '1px solid rgba(119,151,190,0.10)'}}>
          <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{overflow: 'visible'}}>
            <defs>
              <linearGradient id="global-kpi-trend-area" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={hexToRgba(baseTrendTone, 0.24)} />
                <stop offset="72%" stopColor={hexToRgba(baseTrendTone, 0.07)} />
                <stop offset="100%" stopColor={hexToRgba(baseTrendTone, 0)} />
              </linearGradient>
              <filter id="global-kpi-trend-glow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {Array.from({length: ticks}).map((_, index) => {
              const y = plotTop + (index / Math.max(ticks - 1, 1)) * (plotBottom - plotTop);
              return <line key={index} x1={plotLeft} x2={plotRight} y1={y} y2={y} stroke="rgba(119,151,190,0.12)" strokeWidth="1" />;
            })}
            <line x1={plotLeft} x2={plotRight} y1={plotBottom} y2={plotBottom} stroke="rgba(119,151,190,0.18)" strokeWidth="1.2" />
            {targetY !== null ? (
              <line x1={plotLeft} x2={plotRight} y1={targetY} y2={targetY} stroke="#4EA4FF" strokeDasharray="8 6" strokeWidth="2" opacity="0.58" />
            ) : null}
            {selectedPointX !== null ? (
              <rect x={Math.max(plotLeft, selectedPointX - 34)} y={plotTop - 8} width={68} height={plotBottom - plotTop + 16} rx={16} fill={hexToRgba(getTrendPerformanceTone(selectedPoint?.value ?? lastTrendValue), 0.08)} />
            ) : null}
            <path d={areaPath} fill="url(#global-kpi-trend-area)" />
            {trendLineSegments.map((segment, index) => (
              <path key={`trend-segment-glow-${index}`} d={segment.path} fill="none" stroke={hexToRgba(segment.tone, 0.18)} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" filter="url(#global-kpi-trend-glow)" />
            ))}
            {trendLineSegments.map((segment, index) => (
              <path key={`trend-segment-${index}`} d={segment.path} fill="none" stroke={`${segment.tone}E3`} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
            ))}
            {plotPoints.map(({x, y}, index) => {
              const value = sourceTrendValues[index] ?? 0;
              const isLast = index === sourceTrendValues.length - 1;
              const isSelected = selectedPointIndex === index;
              const dataLabel = formatOverviewValueLike(model.heroCard.value, value);
              const pointTone = getTrendPerformanceTone(value);
              return (
                <g key={`${value}-${index}`} onClick={() => onSelectPoint(index)} style={{cursor: 'pointer'}}>
                  <line
                    x1={x}
                    x2={x}
                    y1={y + 10}
                    y2={plotBottom}
                    stroke={hexToRgba(pointTone, isSelected || isLast ? 0.22 : 0.08)}
                    strokeDasharray="4 6"
                    strokeWidth="1"
                  />
                  <text
                    x={x}
                    y={Math.max(18, y - 11)}
                    textAnchor="middle"
                    fill={isSelected || isLast ? '#FFFFFF' : '#9FB8D8'}
                    fontSize={isSelected || isLast ? 11.5 : 10.5}
                    fontWeight={isSelected || isLast ? 900 : 800}
                    paintOrder="stroke"
                    stroke="rgba(8,21,35,0.92)"
                    strokeWidth="3"
                  >
                    {dataLabel}
                  </text>
                  <circle cx={x} cy={y} r={10} fill="transparent" />
                  {isSelected ? <circle cx={x} cy={y} r={9.2} fill={hexToRgba(pointTone, 0.14)} stroke="none" /> : null}
                  <circle cx={x} cy={y} r={isSelected ? 6.2 : isLast ? 5.2 : 3.4} fill="#081523" stroke={pointTone} strokeWidth={isSelected ? 3 : isLast ? 2.6 : 1.8} />
                </g>
              );
            })}
          </svg>

          <Box sx={{position: 'absolute', right: 10, top: 92, px: 0.75, py: 0.32, borderRadius: 999, bgcolor: 'rgba(7,19,35,0.86)', border: `1px solid ${baseTrendTone}36`, color: baseTrendTone, fontSize: 12, fontWeight: 900, lineHeight: 1}}>
            {Math.round(lastTrendValue)}{model.heroCard.value.includes('%') ? '%' : ''}
          </Box>

          {selectedPoint && selectedPointX !== null && selectedPointY !== null ? (
            <Box
              sx={{
                position: 'absolute',
                left: `calc(${(selectedPointX / width) * 100}% - 48px)`,
                top: Math.max(14, selectedPointY - 34),
                px: 0.75,
                py: 0.38,
                borderRadius: 1,
                bgcolor: 'rgba(7,19,35,0.94)',
                border: `1px solid ${getTrendPerformanceTone(selectedPoint.value)}3D`,
                color: '#DDEBFF',
                minWidth: 96,
                textAlign: 'center',
                boxShadow: `0 8px 20px ${hexToRgba(getTrendPerformanceTone(selectedPoint.value), 0.14)}`,
                pointerEvents: 'none',
              }}
            >
              <Typography sx={{fontSize: 10, color: '#8FBFFF', fontWeight: 800, lineHeight: 1.1}}>{selectedPoint.label}</Typography>
              <Typography sx={{fontSize: 11.5, color: getTrendPerformanceTone(selectedPoint.value), fontWeight: 900, lineHeight: 1.15, mt: 0.18}}>
                {formatOverviewValueLike(model.heroCard.value, selectedPoint.value)}
              </Typography>
            </Box>
          ) : null}

          <Box sx={{display: 'grid', gridTemplateColumns: `repeat(${model.trendLabels.length}, minmax(0, 1fr))`, gap: 0.6, mt: 0.2, pt: 0.7, px: 0.2, borderTop: '1px solid rgba(119,151,190,0.12)'}}>
            {model.trendLabels.map((label, index) => (
              <Typography key={label} sx={{fontSize: 11, color: selectedPointIndex === index || index === model.trendLabels.length - 1 ? '#FFFFFF' : '#8DA3BF', fontWeight: selectedPointIndex === index || index === model.trendLabels.length - 1 ? 900 : 700, textAlign: index === 0 ? 'left' : index === model.trendLabels.length - 1 ? 'right' : 'center'}}>
                {label}
              </Typography>
            ))}
          </Box>
        </Box>
      </Box>
    </Paper>
  );
}

function GlobalKpiContributionPanel({
  contributionMode,
  metricLabel,
  model,
  onModeChange,
}: {
  contributionMode: GlobalKpiContributionMode;
  metricLabel: string;
  model: GlobalKpiDetailModel;
  onModeChange: (mode: GlobalKpiContributionMode) => void;
}) {
  const maxValue = Math.max(...model.contributionRows.map((row) => row.value), 1);
  const topRows = model.contributionRows.filter((row) => row.group === 'top');
  const underRows = model.contributionRows.filter((row) => row.group === 'under');
  const contributionNarrative = getMetricContributionNarrative(model.metric, metricLabel);

  return (
    <Paper elevation={0} sx={{p: 1.15, minHeight: 216, height: '100%', background: `linear-gradient(180deg, rgba(10, 24, 42, 0.98), rgba(6, 17, 31, 0.98)), ${subtlePanelFill}`, border: '1px solid rgba(111,164,224,0.26)', borderRadius: 1.8, boxShadow: '0 12px 28px rgba(2,10,20,0.20), inset 0 1px 0 rgba(255,255,255,0.035)'}}>
      <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, mb: 0.9}}>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 0.65, pl: 0.8, borderLeft: '3px solid #58A3FF'}}>
          <Typography sx={{fontSize: 12, color: '#FFFFFF', fontWeight: 900, letterSpacing: 0.25, textTransform: 'uppercase'}}>
            Site Contribution to {metricLabel} {contributionMode === 'gap' ? 'Gap' : ''}
          </Typography>
          <InfoIcon sx={{fontSize: 14, color: 'rgba(159,184,216,0.65)'}} />
        </Box>
        <Box sx={{display: 'flex', gap: 0.55, p: 0.35, borderRadius: 1.15, border: '1px solid rgba(119,151,190,0.18)', bgcolor: 'rgba(255,255,255,0.03)'}}>
          {[
            {label: `By ${metricLabel}`, value: 'metric' as const},
            {label: 'By Gap', value: 'gap' as const},
          ].map((option) => {
            const active = contributionMode === option.value;
            return (
              <Button
                key={option.value}
                onClick={() => onModeChange(option.value)}
                sx={{
                  minWidth: 0,
                  px: 1.05,
                  py: 0.55,
                  color: active ? '#8FC5FF' : '#A8BCD6',
                  bgcolor: active ? 'rgba(52,141,255,0.12)' : 'transparent',
                  border: active ? '1px solid rgba(82,141,255,0.26)' : '1px solid transparent',
                  borderRadius: 1,
                  textTransform: 'none',
                  fontSize: 11,
                  fontWeight: 900,
                }}
              >
                {option.label}
              </Button>
            );
          })}
        </Box>
      </Box>

      <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', md: '1.1fr 0.9fr'}, gap: 0.65, mb: 0.85}}>
        <Box sx={{p: 0.9, borderRadius: 1.25, bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(119,151,190,0.14)'}}>
          <Typography sx={{fontSize: 10.5, color: '#8FBFFF', fontWeight: 900, letterSpacing: 0.28, textTransform: 'uppercase'}}>Contribution Lens</Typography>
          <Typography sx={{fontSize: 15, color: '#FFFFFF', fontWeight: 900, lineHeight: 1.15, mt: 0.35}}>
            {contributionMode === 'gap' ? `Biggest ${metricLabel} gap concentrations` : contributionNarrative}
          </Typography>
        </Box>
        <Box sx={{p: 0.9, borderRadius: 1.25, bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(119,151,190,0.14)', display: 'grid', alignContent: 'center'}}>
          <Typography sx={{fontSize: 10.5, color: '#8FBFFF', fontWeight: 900, letterSpacing: 0.28, textTransform: 'uppercase'}}>Network Read</Typography>
          <Typography sx={{fontSize: 18, color: '#FFFFFF', fontWeight: 900, lineHeight: 1.05, mt: 0.35}}>{model.groupAverageText}</Typography>
          <Typography sx={{fontSize: 10.8, color: '#9FB8D8', fontWeight: 700, mt: 0.28}}>
            {model.groupAverageVsTargetText ? `${model.groupAverageVsTargetText}` : `Current global reference for ${metricLabel}`}
          </Typography>
        </Box>
      </Box>

      <Box sx={{display: 'grid', gap: 0.72}}>
        <Typography sx={{fontSize: 10.8, color: '#7BCB94', fontWeight: 900, textTransform: 'uppercase'}}>Top Performers</Typography>
        {topRows.map((row) => (
          <Box key={`${row.group}-${row.name}`} sx={{display: 'grid', gridTemplateColumns: '16px 1fr minmax(128px, 1.45fr) 48px 56px', gap: 0.72, alignItems: 'center'}}>
            <Typography sx={{fontSize: 12, color: '#FFFFFF', fontWeight: 900}}>{row.rank}</Typography>
            <Typography sx={{fontSize: 12, color: '#FFFFFF', fontWeight: 800}}>{row.name}</Typography>
            <Box sx={{height: 10, borderRadius: 999, bgcolor: 'rgba(255,255,255,0.05)', overflow: 'hidden', position: 'relative'}}>
              <Box sx={{width: `${Math.max(18, (row.value / maxValue) * 100)}%`, height: '100%', bgcolor: row.color, boxShadow: `0 0 12px ${row.color}22`}} />
            </Box>
            <Typography sx={{fontSize: 12, color: '#FFFFFF', fontWeight: 900, textAlign: 'right'}}>{row.valueText}</Typography>
            <Typography sx={{fontSize: 12, color: row.color, fontWeight: 900, textAlign: 'right'}}>{row.deltaText}</Typography>
          </Box>
        ))}

        <Typography sx={{fontSize: 10.8, color: '#E08A91', fontWeight: 900, textTransform: 'uppercase', mt: 0.25}}>Underperformers</Typography>
        {underRows.map((row) => (
          <Box key={`${row.group}-${row.name}`} sx={{display: 'grid', gridTemplateColumns: '16px 1fr minmax(128px, 1.45fr) 48px 56px', gap: 0.72, alignItems: 'center'}}>
            <Typography sx={{fontSize: 12, color: '#FFFFFF', fontWeight: 900}}>{row.rank}</Typography>
            <Typography sx={{fontSize: 12, color: '#FFFFFF', fontWeight: 800}}>{row.name}</Typography>
            <Box sx={{height: 10, borderRadius: 999, bgcolor: 'rgba(255,255,255,0.05)', overflow: 'hidden'}}>
              <Box sx={{width: `${Math.max(18, (row.value / maxValue) * 100)}%`, height: '100%', bgcolor: row.color, boxShadow: `0 0 12px ${row.color}22`}} />
            </Box>
            <Typography sx={{fontSize: 12, color: '#FFFFFF', fontWeight: 900, textAlign: 'right'}}>{row.valueText}</Typography>
            <Typography sx={{fontSize: 12, color: row.color, fontWeight: 900, textAlign: 'right'}}>{row.deltaText}</Typography>
          </Box>
        ))}
      </Box>

      <Typography sx={{fontSize: 11, color: '#58A3FF', fontWeight: 900, textAlign: 'center', mt: 0.8}}>
        Global Average {metricLabel}: {model.groupAverageText}{model.groupAverageVsTargetText ? ` (${model.groupAverageVsTargetText})` : ''}
      </Typography>
    </Paper>
  );
}

function GlobalKpiPlantTable({
  metricLabel,
  model,
  onSelectSite,
  selectedSiteName,
}: {
  metricLabel: string;
  model: GlobalKpiDetailModel;
  onSelectSite: (siteName: string) => void;
  selectedSiteName: string | null;
}) {
  return (
    <Paper elevation={0} sx={{p: 1.12, minHeight: 238, height: '100%', background: `linear-gradient(180deg, rgba(10, 22, 38, 0.96), rgba(8, 18, 31, 0.96)), ${subtlePanelFill}`, border: '1px solid rgba(119,151,190,0.18)', borderRadius: 1.8, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.025)'}}>
      <Box sx={{display: 'flex', alignItems: 'center', gap: 0.65, mb: 0.8}}>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 0.65}}>
        <Typography sx={{fontSize: 12, color: '#FFFFFF', fontWeight: 900, letterSpacing: 0.25, textTransform: 'uppercase'}}>
          Global by Plant
        </Typography>
        <InfoIcon sx={{fontSize: 14, color: 'rgba(159,184,216,0.65)'}} />
        </Box>
      </Box>

      <Box sx={{display: 'grid', gridTemplateColumns: '28px minmax(148px, 1.7fr) repeat(4, minmax(0, 1fr))', gap: 0.95, px: 0.25, pb: 0.58, borderBottom: '1px solid rgba(119,151,190,0.16)'}}>
        <Typography sx={{fontSize: 9.8, color: '#8DA3BF', fontWeight: 800}}>#</Typography>
        <Typography sx={{fontSize: 9.8, color: '#8DA3BF', fontWeight: 800}}>Site</Typography>
        <Typography sx={{fontSize: 9.8, color: '#8DA3BF', fontWeight: 800}}>{metricLabel}</Typography>
        <Typography sx={{fontSize: 9.8, color: '#8DA3BF', fontWeight: 800}}>Target</Typography>
        <Typography sx={{fontSize: 9.8, color: '#8DA3BF', fontWeight: 800}}>Vs Target</Typography>
        <Typography sx={{fontSize: 9.8, color: '#8DA3BF', fontWeight: 800}}>Overall Status</Typography>
      </Box>

      <Box sx={{display: 'grid', gap: 0.22, mt: 0.32}}>
        {model.tableRows.map((row, index) => (
          <Box
            key={row.name}
            onClick={() => onSelectSite(row.name)}
            sx={{
              display: 'grid',
              gridTemplateColumns: '28px minmax(148px, 1.7fr) repeat(4, minmax(0, 1fr))',
              gap: 0.95,
              alignItems: 'center',
              px: 0.25,
              py: 0.6,
              borderRadius: 1,
              cursor: 'pointer',
              borderBottom: index === model.tableRows.length - 1 ? 'none' : '1px solid rgba(119,151,190,0.08)',
              bgcolor: selectedSiteName === row.name ? 'rgba(82,141,255,0.08)' : 'transparent',
              outline: selectedSiteName === row.name ? '1px solid rgba(82,141,255,0.18)' : '1px solid transparent',
              outlineOffset: '-1px',
              '&:hover': {bgcolor: selectedSiteName === row.name ? 'rgba(82,141,255,0.10)' : 'rgba(255,255,255,0.02)'},
            }}
          >
            <Typography sx={{fontSize: 11.5, color: '#FFFFFF', fontWeight: 900}}>{row.rank}</Typography>
            <Box sx={{display: 'flex', alignItems: 'center', gap: 0.55}}>
              <Box sx={{width: 7, height: 7, borderRadius: '50%', bgcolor: row.primaryTone, boxShadow: `0 0 10px ${row.primaryTone}44`}} />
              <Typography sx={{fontSize: 11.5, color: '#FFFFFF', fontWeight: 800}}>{row.name}</Typography>
            </Box>
            <Typography sx={{fontSize: 11.5, color: row.primaryTone, fontWeight: 900}}>{row.primaryText}</Typography>
            <Typography sx={{fontSize: 11.5, color: '#D5E3F7', fontWeight: 800}}>{row.targetText}</Typography>
            <Typography sx={{fontSize: 11.5, color: row.deviationTone, fontWeight: 900}}>{row.deviationText}</Typography>
            <Box sx={{display: 'flex', alignItems: 'center', gap: 0.55}}>
              <Box sx={{width: 8, height: 8, borderRadius: '50%', bgcolor: row.statusTone, boxShadow: `0 0 10px ${row.statusTone}55`}} />
              <Typography sx={{fontSize: 11.5, color: row.statusTone, fontWeight: 900}}>{row.statusLabel}</Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Paper>
  );
}

function GlobalKpiRegionPanel({
  activeRegion,
  metricLabel,
  model,
  onSelectRegion,
}: {
  activeRegion: RegionFilter;
  metricLabel: string;
  model: GlobalKpiDetailModel;
  onSelectRegion: (region: RegionFilter) => void;
}) {
  const definition = getMetricDefinition(model.metric);
  const bestRegion = model.regionRows[0] ?? null;
  const trailingRegion = model.regionRows[model.regionRows.length - 1] ?? null;
  const bestReferenceValue = bestRegion?.value ?? 1;
  const spreadValue = bestRegion && trailingRegion ? Math.abs(bestRegion.value - trailingRegion.value) : 0;
  const totalSites = model.regionRows.reduce((sum, row) => sum + row.siteCount, 0) || 1;
  const regionNarrative = getMetricRegionNarrative(model.metric, metricLabel);
  const targetText = model.trendTarget === null ? null : definition.formatValue(model.trendTarget);

  return (
    <Paper elevation={0} sx={{p: 1.15, minHeight: 216, height: '100%', background: `linear-gradient(180deg, rgba(10, 22, 38, 0.96), rgba(8, 18, 31, 0.96)), ${subtlePanelFill}`, border: '1px solid rgba(119,151,190,0.18)', borderRadius: 1.8, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.025)'}}>
      <Box sx={{display: 'flex', alignItems: 'center', gap: 0.65, mb: 0.8}}>
        <Typography sx={{fontSize: 12, color: '#FFFFFF', fontWeight: 900, letterSpacing: 0.25, textTransform: 'uppercase'}}>
          {metricLabel} by Region
        </Typography>
        <InfoIcon sx={{fontSize: 14, color: 'rgba(159,184,216,0.65)'}} />
      </Box>

      <Box sx={{display: 'grid', gap: 1}}>
        <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', md: '1.15fr 0.85fr'}, gap: 0.65}}>
          <Box sx={{p: 0.9, borderRadius: 1.25, background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))', border: '1px solid rgba(119,151,190,0.14)'}}>
            <Typography sx={{fontSize: 9.4, color: '#8FBFFF', fontWeight: 900, letterSpacing: 0.24, textTransform: 'uppercase'}}>Regional Benchmark</Typography>
            <Typography sx={{fontSize: 10.6, color: '#DCE9F8', fontWeight: 900, lineHeight: 1.18, mt: 0.3}}>
              {bestRegion && trailingRegion
                ? `${bestRegion.valueText} in ${bestRegion.label} vs ${trailingRegion.valueText} in ${trailingRegion.label}, a spread of ${formatSignedMetricDelta(model.metric, spreadValue).replace('+', '')}${targetText ? ` around the ${targetText} target.` : '.'}`
                : `Use this view to compare the strongest and weakest regions for ${metricLabel}.`}
            </Typography>
            <Typography sx={{fontSize: 8.7, color: '#7FA2C6', fontWeight: 800, lineHeight: 1.08, mt: 0.32, textTransform: 'uppercase', letterSpacing: 0.2}}>
              {bestRegion ? `${bestRegion.label} leads ${metricLabel}` : `Regional ${metricLabel}`}
            </Typography>
            <Typography sx={{fontSize: 8.8, color: '#8DA3BF', lineHeight: 1.18, mt: 0.2}}>
              {regionNarrative}
            </Typography>
          </Box>
          <Box sx={{p: 0.9, borderRadius: 1.25, background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))', border: '1px solid rgba(119,151,190,0.14)', display: 'grid', gap: 0.5}}>
            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1}}>
              <Typography sx={{fontSize: 10.5, color: '#8FBFFF', fontWeight: 900, letterSpacing: 0.3, textTransform: 'uppercase'}}>Network Average</Typography>
              <Chip label={activeRegion === 'All Sites' ? 'All Regions' : activeRegion} size="small" sx={{height: 20, bgcolor: 'rgba(82,141,255,0.10)', color: '#9FD0FF', border: '1px solid rgba(82,141,255,0.22)', fontSize: 10, fontWeight: 900}} />
            </Box>
            <Typography sx={{fontSize: 19, color: '#FFFFFF', fontWeight: 900, lineHeight: 1}}>{model.groupAverageText}</Typography>
            <Typography sx={{fontSize: 10.1, color: '#9FB8D8', fontWeight: 800, lineHeight: 1.22}}>
              {model.groupAverageVsTargetText ?? `${totalSites} sites represented in this regional comparison.`}
            </Typography>
          </Box>
        </Box>

        <Box sx={{display: 'grid', gap: 0.48}}>
          {model.regionRows.map((row, index) => {
            const isActive = activeRegion === row.label;
            const performanceRatio = definition.highIsBetter
              ? row.value / Math.max(bestReferenceValue, 0.0001)
              : bestReferenceValue / Math.max(row.value, 0.0001);
            const performanceWidth = Math.max(18, Math.min(100, performanceRatio * 100));
            const regionFootprint = Math.round((row.siteCount / totalSites) * 100);
            const targetDeltaTone = row.targetDeltaValue === null ? '#8FBFFF' : getTargetDeltaTone({highIsBetter: definition.highIsBetter, value: row.targetDeltaValue});
            const networkDeltaTone = row.networkDeltaValue === 0 ? '#8FBFFF' : getTargetDeltaTone({highIsBetter: definition.highIsBetter, value: row.networkDeltaValue});

            return (
              <Box
                key={row.label}
                onClick={() => onSelectRegion(activeRegion === row.label ? 'All Sites' : row.label as RegionFilter)}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '20px minmax(0, 1.7fr) minmax(110px, 0.9fr) 92px',
                  alignItems: 'center',
                  gap: 0.62,
                  p: 0.78,
                  borderRadius: 1.25,
                  border: isActive ? '1px solid rgba(82,141,255,0.30)' : '1px solid rgba(119,151,190,0.14)',
                  bgcolor: isActive ? 'rgba(82,141,255,0.08)' : 'rgba(255,255,255,0.025)',
                  cursor: 'pointer',
                  transition: 'background-color 160ms ease, border-color 160ms ease',
                  '&:hover': {
                    bgcolor: isActive ? 'rgba(82,141,255,0.11)' : 'rgba(255,255,255,0.04)',
                  },
                }}
              >
                <Typography sx={{fontSize: 13, color: '#FFFFFF', fontWeight: 900}}>{index + 1}</Typography>

                <Box sx={{display: 'grid', gap: 0.28}}>
                  <Box sx={{display: 'flex', alignItems: 'center', gap: 0.65, minWidth: 0}}>
                    <Box sx={{width: 8, height: 8, borderRadius: '50%', bgcolor: row.color, boxShadow: `0 0 10px ${row.color}55`}} />
                    <Typography sx={{fontSize: 11.8, color: '#FFFFFF', fontWeight: 800}}>{row.label}</Typography>
                    <Chip label={`${row.siteCount} sites`} size="small" sx={{height: 17, bgcolor: 'rgba(255,255,255,0.04)', color: '#AFC6E2', border: '1px solid rgba(119,151,190,0.18)', fontSize: 8.8, fontWeight: 800}} />
                  </Box>
                  <Typography sx={{fontSize: 9.6, color: '#8DA3BF', fontWeight: 700}}>
                    {regionFootprint}% of active footprint
                  </Typography>
                </Box>

                <Box sx={{display: 'grid', gap: 0.42}}>
                  <Box sx={{height: 8, borderRadius: 999, bgcolor: 'rgba(255,255,255,0.05)', overflow: 'hidden'}}>
                    <Box sx={{width: `${performanceWidth}%`, height: '100%', borderRadius: 999, bgcolor: row.color, boxShadow: `0 0 16px ${row.color}22`}} />
                  </Box>
                  <Typography sx={{fontSize: 9.4, color: '#9FB8D8', fontWeight: 700}}>
                    {index === 0 ? 'Regional benchmark' : definition.highIsBetter ? 'Distance to top region' : 'Distance to best low region'}
                  </Typography>
                </Box>

                <Box sx={{display: 'grid', justifyItems: 'end', gap: 0.25}}>
                  <Typography sx={{fontSize: 12, color: '#FFFFFF', fontWeight: 900, textAlign: 'right'}}>{row.valueText}</Typography>
                  <Typography sx={{fontSize: 9.9, color: networkDeltaTone, fontWeight: 900, textAlign: 'right'}}>
                    {`vs net ${row.networkDeltaText}`}
                  </Typography>
                  <Typography sx={{fontSize: 9.9, color: targetDeltaTone, fontWeight: 900, textAlign: 'right'}}>
                    {row.targetDeltaText ? `vs tgt ${row.targetDeltaText}` : row.deltaText}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Paper>
  );
}

function buildFocusedGlobalKpiInsights({
  metric,
  metricLabel,
  model,
  regionFilter,
  selectedTrendPoint,
  selectedSite,
}: {
  metric: GlobalKpiKey;
  metricLabel: string;
  model: GlobalKpiDetailModel;
  regionFilter: RegionFilter;
  selectedTrendPoint: {
    deltaFromPreviousText: string | null;
    deltaToTargetText: string | null;
    driverLabels: string[];
    label: string;
    scopeLabel: string;
    valueText: string;
  } | null;
  selectedSite: GlobalSite | null;
}) {
  const definition = getMetricDefinition(metric);
  const targetValue = getOverviewTarget(metricLabel);
  const driverNarrative = getMetricDriverNarrative(metric, model.supportMetrics);

  if (selectedTrendPoint) {
    return [
      {
        title: `${selectedTrendPoint.label} selected`,
        detail: `${selectedTrendPoint.label} is now the active checkpoint for ${metricLabel}, with ${selectedTrendPoint.scopeLabel} reading at ${selectedTrendPoint.valueText}${selectedTrendPoint.deltaToTargetText ? ` and ${selectedTrendPoint.deltaToTargetText} versus target` : ''}. Read this week as the cleanest point to explain whether the KPI drift came from recovery, deterioration, or simple volatility.`,
        tone: '#8FBFFF',
      },
      {
        title: `${metricLabel} driver lens`,
        detail: `Use ${driverNarrative} as the main explanation path for this point, because those are the levers most likely to explain why ${metricLabel} moved away from its expected range in the selected week.`,
        tone: '#F2A15A',
      },
      {
        title: 'Momentum from prior week',
        detail: selectedTrendPoint.deltaFromPreviousText
          ? `${selectedTrendPoint.scopeLabel} moved ${selectedTrendPoint.deltaFromPreviousText} versus the previous week, so the signal is not only the absolute gap to target but also how quickly the KPI is recovering or deteriorating.`
          : `This is the first point in the visible window, so use its target gap as the anchor before reading later weeks for momentum.`,
        tone: '#7BCB94',
      },
    ];
  }

  if (selectedSite) {
    const metricValue = getSiteMetricValue(selectedSite, metric);
    const gapValue = targetValue === null ? null : Number((metricValue - targetValue).toFixed(1));
    const gapText = gapValue === null
      ? 'without a configured target baseline'
      : `${Math.abs(gapValue)} pts ${gapValue >= 0 ? (definition.highIsBetter ? 'above' : 'over') : (definition.highIsBetter ? 'below' : 'under')} target`;

    return [
      {
        title: `${selectedSite.name} focus`,
        detail: `${selectedSite.name} is now the active lens for ${metricLabel}. The site is running at ${definition.formatValue(metricValue)}, ${gapText}, so this location should explain the KPI locally before any broader network conclusion is made.`,
        tone: selectedSite.tone === 'issue' ? '#FF717A' : '#8FBFFF',
      },
      {
        title: 'Immediate readout',
        detail: `${selectedSite.name} should be read through ${driverNarrative}, because those operating levers are the most likely explanation for why this site is either pulling the KPI down or protecting it from further erosion.`,
        tone: '#F2A15A',
      },
      {
        title: 'Recommended follow-up',
        detail: getMetricSelectedSiteNarrative(metric, metricLabel),
        tone: '#7BCB94',
      },
    ];
  }

  if (regionFilter !== 'All Sites') {
    const regionRow = model.regionRows.find((row) => row.label === regionFilter);
    return [
      {
        title: `${regionFilter} focus`,
        detail: `${regionFilter} is now the active region filter for ${metricLabel}. The regional average is ${regionRow?.valueText ?? model.groupAverageText}${regionRow?.targetDeltaText ? `, running ${regionRow.targetDeltaText} versus target` : ''}, so the story is now anchored on this footprint instead of the full network.`,
        tone: '#8FBFFF',
      },
      {
        title: 'Regional pressure',
        detail: regionRow
          ? `${regionFilter} is currently ${regionRow.networkDeltaText} versus the network average, which means the regional mix is ${definition.highIsBetter ? (regionRow.networkDeltaValue >= 0 ? 'supporting' : 'dragging') : (regionRow.networkDeltaValue <= 0 ? 'supporting' : 'dragging')} the global result. Use the plant ranking inside this region to see whether the pressure is concentrated or broad-based.`
          : `Use the plant ranking inside this region to see whether the pressure is concentrated or broad-based.`,
        tone: '#F2A15A',
      },
      {
        title: 'Next move',
        detail: getMetricRegionActionNarrative(metric, metricLabel),
        tone: '#7BCB94',
      },
    ];
  }

  return model.aiInsights.map((insight) => ({
    ...insight,
    detail: `${insight.detail} Keep using the target line, regional spread, and site ranking together so the network story for ${metricLabel} stays causally consistent before drilling into a narrower slice.`,
  }));
}

function GlobalKpiAiInsightsPanel({
  animationKey,
  insights,
}: {
  animationKey: string;
  insights: GlobalKpiDetailModel['aiInsights'];
}) {
  return (
    <Paper elevation={0} sx={{p: 1.25, minHeight: 268, height: '100%', display: 'flex', flexDirection: 'column', background: `linear-gradient(180deg, rgba(10, 22, 38, 0.96), rgba(8, 18, 31, 0.96)), ${subtlePanelFill}`, border: '1px solid rgba(119,151,190,0.18)', borderRadius: 1.8, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.025)'}}>
      <Box sx={{display: 'flex', alignItems: 'center', gap: 0.65, mb: 0.95}}>
        <SparkleIcon sx={{fontSize: 15, color: '#8FBFFF'}} />
        <Typography sx={{fontSize: 12, color: '#FFFFFF', fontWeight: 900, letterSpacing: 0.25, textTransform: 'uppercase'}}>
          AI Insights
        </Typography>
      </Box>
      <Box sx={{display: 'grid', gap: 0.72, flex: 1, alignContent: 'start'}}>
        {insights.map((insight, index) => (
          <Box key={`${animationKey}-${insight.title}`} sx={{p: 0.75, borderRadius: 1.15, border: '1px solid rgba(119,151,190,0.12)', background: subtleCardFill, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.02)'}}>
            <Typography sx={{fontSize: 10.5, color: insight.tone, fontWeight: 900}}>{insight.title}</Typography>
            <Box sx={{mt: 0.28}}>
              <TypewrittenText charsPerStep={1} delay={index * 700} intervalMs={28} text={insight.detail} />
            </Box>
          </Box>
        ))}
      </Box>
    </Paper>
  );
}

function GlobalKpiDetailView({
  activeRegion,
  contributionMode,
  facilityType,
  headerCards,
  metric,
  model,
  onBack,
  onContributionModeChange,
  onMetricChange,
  onSelectRegion,
  onSelectSite,
  selectedSite,
}: {
  activeRegion: RegionFilter;
  contributionMode: GlobalKpiContributionMode;
  facilityType: FacilityType;
  headerCards: Array<{card: KpiCard; metric: GlobalKpiKey}>;
  metric: GlobalKpiKey;
  model: GlobalKpiDetailModel;
  onBack: () => void;
  onContributionModeChange: (mode: GlobalKpiContributionMode) => void;
  onMetricChange: (metric: GlobalKpiKey) => void;
  onSelectRegion: (region: RegionFilter) => void;
  onSelectSite: (siteName: string) => void;
  selectedSite: GlobalSite | null;
}) {
  const metricLabel = getKpiUiLabel(metric);
  const definition = getMetricDefinition(metric);
  const topCardWidth = headerCards.length <= 4 ? 'minmax(0, 1fr)' : headerCards.length <= 6 ? 'minmax(188px, 1fr)' : 'minmax(170px, 1fr)';
  const categoryLabel = getCategoryForKpi(metric);
  const sourceTrendValues = getGlobalKpiTrendSeries(model, selectedSite);
  const [selectedTrendPointIndex, setSelectedTrendPointIndex] = useState<number | null>(null);
  useEffect(() => {
    setSelectedTrendPointIndex(null);
  }, [activeRegion, metricLabel, selectedSite?.name]);
  const selectedTrendPoint = selectedTrendPointIndex === null
    ? null
    : {
        deltaFromPreviousText: selectedTrendPointIndex > 0
          ? formatSignedMetricDelta(metric, Number((sourceTrendValues[selectedTrendPointIndex] - sourceTrendValues[selectedTrendPointIndex - 1]).toFixed(1)))
          : null,
        deltaToTargetText: model.trendTarget === null
          ? null
          : formatSignedMetricDelta(metric, Number((sourceTrendValues[selectedTrendPointIndex] - model.trendTarget).toFixed(1))),
        driverLabels: model.supportMetrics.slice(0, 2).map((supportMetric) => getKpiUiLabel(supportMetric)),
        label: model.trendLabels[selectedTrendPointIndex] ?? '',
        scopeLabel: selectedSite?.name ?? (activeRegion !== 'All Sites' ? activeRegion : 'the network'),
        valueText: definition.formatValue(sourceTrendValues[selectedTrendPointIndex] ?? 0),
      };
  const focusedInsights = buildFocusedGlobalKpiInsights({
    metric,
    metricLabel,
    model,
    regionFilter: activeRegion,
    selectedTrendPoint,
    selectedSite,
  });
  const aiInsightsAnimationKey = `${metricLabel}-${activeRegion}-${selectedSite?.name ?? 'global'}-${selectedTrendPoint?.label ?? 'no-point'}`;

  return (
    <Box
      sx={{
        position: 'relative',
        zIndex: 1,
        height: '100%',
        minHeight: 0,
        overflow: 'hidden',
        px: {xs: 1.2, md: 1.6},
        pt: {xs: 8.5, md: 9.4},
        pb: 1.4,
        display: 'grid',
        gridTemplateRows: 'auto minmax(0, 1fr)',
        gap: 1.15,
        background: 'radial-gradient(circle at 18% 8%, rgba(36,136,255,0.10), transparent 34%), linear-gradient(180deg, rgba(4,14,27,0.94) 0%, rgba(2,10,20,0.98) 100%)',
        boxShadow: 'inset 0 1px 0 rgba(143,191,255,0.08)',
        animation: 'globalKpiFlipIn 560ms cubic-bezier(0.22, 1, 0.36, 1)',
        transformOrigin: 'center center',
        '@keyframes globalKpiFlipIn': {
          '0%': {opacity: 0, transform: 'perspective(1500px) rotateY(-16deg) scale(0.985)'},
          '100%': {opacity: 1, transform: 'perspective(1500px) rotateY(0deg) scale(1)'},
        },
        '@media (prefers-reduced-motion: reduce)': {
          animation: 'none',
        },
      }}
    >
      <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap'}}>
        <Button
          onClick={onBack}
          startIcon={<ArrowBackIcon sx={{fontSize: 16}} />}
          sx={{
            alignSelf: 'flex-start',
            minWidth: 0,
            px: 1.1,
            height: 32,
            color: '#CFE3FF',
            borderRadius: 1.2,
            border: '1px solid rgba(119,151,190,0.22)',
            bgcolor: 'rgba(8,18,31,0.82)',
            textTransform: 'none',
            fontWeight: 900,
          }}
        >
          Back to Map
        </Button>
        <Chip label={`Active KPI: ${metricLabel}`} sx={{height: 24, bgcolor: 'rgba(82,141,255,0.14)', color: '#9FD0FF', border: '1px solid rgba(82,141,255,0.26)', fontSize: 10.5, fontWeight: 900}} />
      </Box>

      <Box sx={{display: 'grid', gridTemplateRows: 'auto auto auto', gap: 1.15, minHeight: 0, overflowY: 'auto', overflowX: 'hidden', pr: 0.45, pb: 0.2, scrollbarWidth: 'thin', scrollbarColor: 'rgba(120,151,190,0.42) transparent', '&::-webkit-scrollbar': {width: 7}, '&::-webkit-scrollbar-thumb': {background: 'rgba(120,151,190,0.36)', borderRadius: 999}, '&::-webkit-scrollbar-track': {background: 'transparent'}}}>
        <Box sx={{display: 'grid', gap: 0.55}}>
          <Typography sx={{fontSize: 10.2, color: '#8DA3BF', fontWeight: 800, letterSpacing: 0.22, textTransform: 'uppercase'}}>
            {categoryLabel} KPIs for {facilityType === 'All Facilities' ? 'the active network' : facilityType.toLowerCase()}
          </Typography>
          <Typography sx={{fontSize: 10, color: '#8FBFFF', fontWeight: 800, lineHeight: 1}}>
            Click a KPI card to filter this Global KPI view
          </Typography>
          <Box sx={{display: 'grid', gridAutoFlow: 'column', gridAutoColumns: {xs: 'minmax(230px, 1fr)', lg: topCardWidth}, gap: 1.15, overflowX: 'auto', pb: 0.2}}>
            {headerCards.map(({card, metric: cardMetric}) => (
              <GlobalKpiStatCard
                key={cardMetric}
                card={card}
                onClick={() => onMetricChange(cardMetric)}
                selected={cardMetric === metric}
              />
            ))}
          </Box>
        </Box>

        <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', xl: 'minmax(0, 1.08fr) minmax(360px, 0.96fr)'}, gap: 1.15, alignItems: 'stretch'}}>
          <GlobalKpiTrendPanel
            focusSite={selectedSite}
            metricLabel={metricLabel}
            model={model}
            onSelectPoint={(index) => setSelectedTrendPointIndex((currentIndex) => currentIndex === index ? null : index)}
            selectedPointIndex={selectedTrendPointIndex}
          />
          <GlobalKpiContributionPanel contributionMode={contributionMode} metricLabel={metricLabel} model={model} onModeChange={onContributionModeChange} />
        </Box>

        <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', xl: 'minmax(0, 1.08fr) minmax(360px, 0.96fr)'}, gap: 1.15, alignItems: 'stretch'}}>
          <GlobalKpiPlantTable metricLabel={metricLabel} model={model} onSelectSite={onSelectSite} selectedSiteName={selectedSite?.name ?? null} />
          <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', md: 'minmax(0, 1fr) minmax(245px, 0.92fr)'}, gap: 1.15, alignItems: 'stretch'}}>
            <GlobalKpiRegionPanel activeRegion={activeRegion} metricLabel={metricLabel} model={model} onSelectRegion={onSelectRegion} />
            <GlobalKpiAiInsightsPanel animationKey={aiInsightsAnimationKey} insights={focusedInsights} />
          </Box>
        </Box>
      </Box>
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
                    <Typography sx={{fontSize: 12, color: '#FFFFFF', fontWeight: 950}} noWrap>{getKpiUiLabel(selected as string)}</Typography>
                  )}
                  sx={selectSx}
                  MenuProps={{PaperProps: {sx: selectMenuSx}}}
                >
                  {kpiOptions.map((option) => (
                    <MenuItem key={option.label} value={option.label}>
                      <Box sx={{display: 'flex', alignItems: 'center', gap: 0.8}}>
                        <Box sx={{color: option.label === benchmarkKpi ? '#58A3FF' : '#A9BED6', display: 'grid', placeItems: 'center'}}>{option.icon}</Box>
                        {getKpiUiLabel(option.label)}
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

function TypewrittenText({
  charsPerStep = 20,
  delay = 0,
  intervalMs = 4,
  strong = false,
  text,
}: {
  charsPerStep?: number;
  delay?: number;
  intervalMs?: number;
  strong?: boolean;
  text: string;
}) {
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

          return currentChars + charsPerStep;
        });
      }, intervalMs);
    }, delay);

    return () => {
      window.clearTimeout(startId);
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [charsPerStep, delay, intervalMs, text]);

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

type SiteNewsMetric = {
  label: string;
  value: string;
  delta: string;
  tone: string;
};

type SiteNewsItem = {
  siteName: string;
  timestampLabel: string;
  headline: string;
  teaser: string;
  summary: string;
  accent: string;
  kpis: SiteNewsMetric[];
};

const siteNewsClosedDelayMs = 3000;
const siteNewsOpeningDurationMs = 1080;
const siteNewsExpandedDelayMs = 5000;
const siteNewsClosingDurationMs = 980;
const siteNewsPostClosePauseMs = 700;
const siteNewsSlideDurationMs = 3550;
const siteNewsCardWidth = 186;
const siteNewsCardGap = 12;
const siteNewsShiftDistance = siteNewsCardWidth + siteNewsCardGap;
const siteNewsRailHeight = {xs: 128, md: 96} as const;
type SiteNewsPhase = 'idle' | 'opening' | 'open' | 'closing' | 'pause' | 'sliding';

const prioritizedSiteNewsOrder = [
  'Columbus West',
  'Juiz de Fora',
  'Fraga',
  'Sandy',
  'Temse',
  'Franklin Lakes',
  'Humacao',
  'Four Oaks',
  'Plymouth',
  'Kulim',
] as const;

const siteNewsOverrides: Partial<Record<string, {
  headline: string;
  teaser?: string;
  summary: string;
  timestampLabel: string;
  kpis?: SiteNewsMetric[];
}>> = {
  'Columbus West': {
    headline: 'OEE dropped to 72% due to downtime on Packaging Line 3.',
    teaser: 'OEE dropped to 72% due to downtime on Packaging Line 3.',
    summary: 'AI detected a recurring pattern of unplanned stops between 14:00 and 16:00, impacting overall equipment effectiveness across the shift.',
    timestampLabel: '2m ago',
    kpis: [
      {label: 'OEE', value: '72%', delta: '-8% vs yesterday', tone: '#FF5F76'},
      {label: 'Downtime', value: '2h 14m', delta: '+24% vs yesterday', tone: '#FF8A5B'},
    ],
  },
  'Juiz de Fora': {
    headline: 'Safety incidents increased in final assembly during the last shift.',
    teaser: 'Safety incidents increased in final assembly during the last shift.',
    summary: 'Quality losses and rework are still pressuring recovery, so the local team is tracking the next 8 hours with tighter escalation routines.',
    timestampLabel: '4m ago',
    kpis: [
      {label: 'OEE', value: '74%', delta: '-3% vs yesterday', tone: '#FF8A5B'},
      {label: 'Quality', value: '12 NCs', delta: '+2 vs yesterday', tone: '#FF5F76'},
    ],
  },
  Fraga: {
    headline: 'Quality trend remains below target for the third shift in a row.',
    teaser: 'Quality trend remains below target for the third shift in a row.',
    summary: 'The plant is holding deliveries, but yield variability is reducing flexibility and creating extra checks on the next release window.',
    timestampLabel: '7m ago',
    kpis: [
      {label: 'OEE', value: '75%', delta: '-2% vs yesterday', tone: '#FFB33B'},
      {label: 'Delivery', value: '85%', delta: '-1% vs yesterday', tone: '#FF8A5B'},
    ],
  },
  Sandy: {
    headline: 'Top performer today with OEE recovering across all key lines.',
    teaser: 'Top performer today with OEE recovering across all key lines.',
    summary: 'Sandy is holding the cleanest execution rhythm in the network, helping absorb regional support without adding new delivery risk.',
    timestampLabel: '9m ago',
    kpis: [
      {label: 'OEE', value: '89%', delta: '+4% vs yesterday', tone: '#67E86B'},
      {label: 'Safety', value: '1 incident', delta: '-1 vs yesterday', tone: '#67E86B'},
    ],
  },
  Temse: {
    headline: 'OTIF is stable and above target while export lanes stay on plan.',
    teaser: 'OTIF is stable and above target while export lanes stay on plan.',
    summary: 'The DC remains one of the healthiest logistics nodes, with strong inventory accuracy and no current signal of transport disruption.',
    timestampLabel: '11m ago',
    kpis: [
      {label: 'OTIF', value: '98.8%', delta: '+0.6 pts vs yesterday', tone: '#67E86B'},
      {label: 'Alerts', value: '3 open', delta: '-1 vs yesterday', tone: '#67E86B'},
    ],
  },
  'Franklin Lakes': {
    headline: 'Building health is improving after HVAC stabilization in the west wing.',
    teaser: 'Building health is improving after HVAC stabilization in the west wing.',
    summary: 'Facilities cleared the main comfort issue, but a small alarm backlog remains open while the team validates utility performance.',
    timestampLabel: '14m ago',
    kpis: [
      {label: 'Building Health', value: '78%', delta: '+3 pts vs yesterday', tone: '#FFB33B'},
      {label: 'Active Alarms', value: '7', delta: '-2 vs yesterday', tone: '#67E86B'},
    ],
  },
};

function getSiteNewsPriority(siteName: string) {
  const priorityIndex = prioritizedSiteNewsOrder.indexOf(siteName as (typeof prioritizedSiteNewsOrder)[number]);
  return priorityIndex === -1 ? prioritizedSiteNewsOrder.length : priorityIndex;
}

function formatSignedPointDelta(value: number, unit = '%') {
  const prefix = value > 0 ? '+' : '';
  return `${prefix}${value}${unit} vs yesterday`;
}

function buildDefaultSiteNewsKpis(site: GlobalSite): SiteNewsMetric[] {
  const facility = getSiteFacilityType(site);

  if (facility === 'Distribution Centers') {
    const otif = site.distributionMetrics?.OTIF ?? 0;
    const alerts = site.distributionMetrics?.Alerts ?? 0;
    return [
      {label: 'OTIF', value: `${otif.toFixed(1)}%`, delta: formatSignedPointDelta(otif >= 98 ? 1 : -1, ' pts'), tone: otif >= 98 ? '#67E86B' : '#FFB33B'},
      {label: 'Alerts', value: `${alerts}`, delta: alerts <= 3 ? '-1 vs yesterday' : '+1 vs yesterday', tone: alerts <= 3 ? '#67E86B' : '#FF8A5B'},
    ];
  }

  if (facility === 'Office Buildings') {
    const health = site.officeMetrics?.['Building Health'] ?? 0;
    const alarms = site.officeMetrics?.['Active Alarms'] ?? 0;
    return [
      {label: 'Building Health', value: `${health}%`, delta: formatSignedPointDelta(health >= 85 ? 2 : -2, ' pts'), tone: health >= 85 ? '#67E86B' : '#FFB33B'},
      {label: 'Active Alarms', value: `${alarms}`, delta: alarms <= 3 ? '-1 vs yesterday' : '+1 vs yesterday', tone: alarms <= 3 ? '#67E86B' : '#FF8A5B'},
    ];
  }

  return [
    {label: 'OEE', value: `${site.oee}%`, delta: formatSignedPointDelta(site.oee >= 82 ? 2 : -3), tone: site.oee >= 82 ? '#67E86B' : site.oee >= 78 ? '#FFB33B' : '#FF5F76'},
    {label: 'Safety', value: `${site.metrics.Safety}`, delta: site.metrics.Safety <= 3 ? '-1 vs yesterday' : '+1 vs yesterday', tone: site.metrics.Safety <= 3 ? '#67E86B' : '#FF8A5B'},
  ];
}

function buildFallbackSiteNews(site: GlobalSite): Pick<SiteNewsItem, 'headline' | 'teaser' | 'summary' | 'timestampLabel' | 'kpis'> {
  const facility = getSiteFacilityType(site);

  if (facility === 'Distribution Centers') {
    const otif = site.distributionMetrics?.OTIF ?? 0;
    const inventory = site.distributionMetrics?.Inventory ?? 0;
    return {
      headline: otif >= 98
        ? `OTIF remains above target while ${site.name} keeps outbound flow stable.`
        : `OTIF slipped below the preferred threshold at ${site.name}.`,
      teaser: otif >= 98
        ? `OTIF remains above target while ${site.name} keeps outbound flow stable.`
        : `OTIF slipped below the preferred threshold at ${site.name}.`,
      summary: otif >= 98
        ? `Inventory accuracy is holding at ${inventory.toFixed(1)}%, so the team is protecting service with no major alert escalation.`
        : `The logistics team is adjusting release pacing and inventory checks to recover service reliability on the next dispatch cycle.`,
      timestampLabel: `${6 + getSiteNewsPriority(site.name) * 2}m ago`,
      kpis: buildDefaultSiteNewsKpis(site),
    };
  }

  if (facility === 'Office Buildings') {
    const health = site.officeMetrics?.['Building Health'] ?? 0;
    const utilization = site.officeMetrics?.['Space Utilization'] ?? 0;
    return {
      headline: health >= 85
        ? `${site.name} is holding a healthy building baseline today.`
        : `${site.name} is running below the desired building health threshold.`,
      teaser: health >= 85
        ? `${site.name} is holding a healthy building baseline today.`
        : `${site.name} is running below the desired building health threshold.`,
      summary: `Space utilization is at ${utilization}%, and the facilities team is balancing comfort, alarms, and utility health across the active zones.`,
      timestampLabel: `${6 + getSiteNewsPriority(site.name) * 2}m ago`,
      kpis: buildDefaultSiteNewsKpis(site),
    };
  }

  const quality = site.metrics.Quality;
  const delivery = site.metrics.Delivery;
  const safety = site.metrics.Safety;
  const dominantLoss = quality >= safety && quality >= 10
    ? 'quality losses'
    : safety >= quality && safety >= 6
      ? 'safety pressure'
      : 'delivery instability';

  return {
    headline: site.oee >= 82
      ? `${site.name} is sustaining a healthy production rhythm this shift.`
      : `${site.name} is still under target as ${dominantLoss} continue to constrain output.`,
    teaser: site.oee >= 82
      ? `${site.name} is sustaining a healthy production rhythm this shift.`
      : `${site.name} is still under target as ${dominantLoss} continue to constrain output.`,
    summary: `Current performance is tracking ${site.oee}% OEE with delivery at ${delivery}%, and the site team is managing the next recovery actions inside the same operating window.`,
    timestampLabel: `${6 + getSiteNewsPriority(site.name) * 2}m ago`,
    kpis: buildDefaultSiteNewsKpis(site),
  };
}

function buildSiteNewsItems(sites: GlobalSite[]) {
  return [...sites]
    .sort((siteA, siteB) => {
      const priorityDelta = getSiteNewsPriority(siteA.name) - getSiteNewsPriority(siteB.name);
      if (priorityDelta !== 0) return priorityDelta;
      if (siteA.tone !== siteB.tone) {
        const toneRank = {issue: 0, warning: 1, good: 2, excellent: 3} as const;
        return toneRank[siteA.tone] - toneRank[siteB.tone];
      }
      return siteA.name.localeCompare(siteB.name);
    })
    .map((site) => {
      const override = siteNewsOverrides[site.name];
      const fallback = buildFallbackSiteNews(site);

      return {
        accent: siteToneMap[site.tone].color,
        headline: override?.headline ?? fallback.headline,
        kpis: override?.kpis ?? fallback.kpis,
        siteName: site.name,
        summary: override?.summary ?? fallback.summary,
        teaser: override?.teaser ?? fallback.teaser,
        timestampLabel: override?.timestampLabel ?? fallback.timestampLabel,
      } satisfies SiteNewsItem;
    });
}

function SiteNewsTicker({
  phase,
  items,
  onCloseExpanded,
  onExpandLead,
  timeLabel,
}: {
  phase: SiteNewsPhase;
  items: SiteNewsItem[];
  onCloseExpanded: () => void;
  onExpandLead: () => void;
  timeLabel: string;
}) {
  const leadItem = items[0] ?? null;
  const loopedItems = items.length > 1
    ? [...items, ...items.slice(0, Math.min(items.length, 4))]
    : items;
  const isSliding = phase === 'sliding';
  const isExpandedVisible = phase === 'opening' || phase === 'open' || phase === 'closing';
  const isExpandedSettled = phase === 'opening' || phase === 'open';
  const isExpandedClosing = phase === 'closing';

  return (
    <Paper
      elevation={0}
      sx={{
        position: 'relative',
        overflow: 'hidden',
        bgcolor: 'rgba(15,27,45,0.94)',
        border: '1px solid rgba(119,151,190,0.24)',
        borderRadius: 1.6,
        height: siteNewsRailHeight,
        boxSizing: 'border-box',
      }}
    >
      <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', md: '112px minmax(0, 1fr)'}, height: '100%'}}>
        <Box
          sx={{
            px: 1.4,
            py: 1,
            borderRight: {xs: 'none', md: '1px solid rgba(119,151,190,0.16)'},
            borderBottom: {xs: '1px solid rgba(119,151,190,0.16)', md: 'none'},
            bgcolor: 'rgba(7, 16, 30, 0.64)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 0.55,
          }}
        >
          <Box sx={{display: 'flex', alignItems: 'center', gap: 0.8}}>
            <Box sx={{width: 7, height: 7, borderRadius: '50%', bgcolor: '#7D5BFF', boxShadow: '0 0 12px rgba(125,91,255,0.55)'}} />
            <Typography sx={{fontSize: 13, color: '#D9E5FF', fontWeight: 900, letterSpacing: 0.4}}>SITE NEWS</Typography>
          </Box>
          <Typography sx={{fontSize: 12, color: '#8DA3BF', fontWeight: 600}}>{timeLabel}</Typography>
        </Box>

        <Box sx={{position: 'relative', minWidth: 0}}>
          <Box
            sx={{
              height: '100%',
              overflow: 'hidden',
              opacity: phase === 'opening' || phase === 'open'
                ? 0.08
                : phase === 'closing'
                  ? 0.55
                  : 1,
              transition: `opacity ${phase === 'closing' ? siteNewsClosingDurationMs : siteNewsOpeningDurationMs}ms ease`,
              pointerEvents: isExpandedVisible ? 'none' : 'auto',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'stretch',
                gap: `${siteNewsCardGap}px`,
                px: 1.15,
                py: 0.85,
                height: '100%',
                boxSizing: 'border-box',
                transform: `translateX(${isSliding ? -siteNewsShiftDistance : 0}px)`,
                transition: isSliding ? `transform ${siteNewsSlideDurationMs}ms linear` : 'none',
                willChange: 'transform',
              }}
            >
              {loopedItems.map((item, index) => {
                const isLead = index === 0;
                return (
                  <Box
                    key={`${item.siteName}-${index}`}
                    onClick={isLead ? onExpandLead : undefined}
                    sx={{
                      flex: `0 0 ${siteNewsCardWidth}px`,
                      width: siteNewsCardWidth,
                      minWidth: siteNewsCardWidth,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      boxSizing: 'border-box',
                      px: 1.25,
                      py: 0.8,
                      borderRadius: 1.35,
                      border: `1px solid ${isLead ? 'rgba(119,151,190,0.30)' : 'rgba(119,151,190,0.18)'}`,
                      bgcolor: isLead ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.03)',
                      boxShadow: isLead ? '0 12px 28px rgba(3, 12, 24, 0.20)' : 'none',
                      opacity: isSliding && isLead ? 0.78 : 1,
                      transition: isSliding && isLead ? `opacity ${siteNewsSlideDurationMs}ms linear` : 'none',
                      cursor: isLead ? 'pointer' : 'default',
                    }}
                  >
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.55}}>
                      <Box sx={{width: 8, height: 8, borderRadius: '50%', bgcolor: item.accent, boxShadow: `0 0 12px ${item.accent}66`}} />
                      <Typography sx={{fontSize: 12.5, color: '#FFFFFF', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                        {item.siteName}
                      </Typography>
                    </Box>
                    <Typography
                      sx={{
                        fontSize: 11,
                        color: '#A8BCD6',
                        lineHeight: 1.3,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {item.teaser}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Box>

          {leadItem ? (
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                px: 1.2,
                py: 0.8,
                opacity: isExpandedVisible ? 1 : 0,
                transform: isExpandedSettled
                  ? 'translateX(0) scaleX(1) scaleY(1)'
                  : isExpandedClosing
                    ? 'translateX(14px) scaleX(0.988) scaleY(0.99)'
                    : 'translateX(24px) scaleX(0.978) scaleY(0.99)',
                transformOrigin: 'left center',
                transition: `opacity ${isExpandedClosing ? siteNewsClosingDurationMs : siteNewsOpeningDurationMs}ms ease, transform ${isExpandedClosing ? siteNewsClosingDurationMs : siteNewsOpeningDurationMs}ms cubic-bezier(0.22, 1, 0.36, 1)`,
                pointerEvents: isExpandedVisible ? 'auto' : 'none',
              }}
            >
              <Box
                sx={{
                  position: 'relative',
                  display: 'grid',
                  gridTemplateColumns: {xs: '1fr', md: 'minmax(0, 1.28fr) 128px 128px 40px'},
                  alignItems: 'center',
                  gap: 1.1,
                  height: '100%',
                  boxSizing: 'border-box',
                  px: 1.5,
                  py: 1,
                  borderRadius: 1.45,
                  border: '1px solid rgba(119,151,190,0.20)',
                  bgcolor: 'rgba(7, 16, 30, 0.88)',
                  boxShadow: '0 16px 32px rgba(3, 11, 22, 0.34)',
                  overflow: 'hidden',
                }}
              >
                <Box sx={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 2, bgcolor: leadItem.accent, boxShadow: `0 0 16px ${leadItem.accent}88`}} />

                <Box sx={{minWidth: 0}}>
                  <Box sx={{display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.45}}>
                    <Box sx={{width: 8, height: 8, borderRadius: '50%', bgcolor: leadItem.accent, boxShadow: `0 0 12px ${leadItem.accent}66`}} />
                    <Typography sx={{fontSize: 14, color: leadItem.accent, fontWeight: 900, whiteSpace: 'nowrap'}}>{leadItem.siteName}</Typography>
                    <Typography sx={{fontSize: 11.5, color: '#8DA3BF', fontWeight: 700}}>{leadItem.timestampLabel}</Typography>
                  </Box>
                  <Typography sx={{fontSize: 14.5, color: '#FFFFFF', fontWeight: 900, lineHeight: 1.2}}>
                    {leadItem.headline}
                  </Typography>
                  <Typography sx={{fontSize: 12.25, color: '#AFC2D9', mt: 0.55, lineHeight: 1.35}}>
                    {leadItem.summary}
                  </Typography>
                </Box>

                {leadItem.kpis.map((kpi) => (
                  <Box
                    key={kpi.label}
                    sx={{
                      px: 1.1,
                      py: 0.9,
                      minHeight: 58,
                      borderRadius: 1.15,
                      border: '1px solid rgba(119,151,190,0.14)',
                      bgcolor: 'rgba(255,255,255,0.03)',
                    }}
                  >
                    <Typography sx={{fontSize: 10.5, color: '#8DA3BF', fontWeight: 800, letterSpacing: 0.3}}>{kpi.label}</Typography>
                    <Typography sx={{fontSize: 20, color: kpi.tone, fontWeight: 950, mt: 0.2, lineHeight: 1}}>{kpi.value}</Typography>
                    <Typography sx={{fontSize: 10.5, color: kpi.tone, fontWeight: 700, mt: 0.35}}>{kpi.delta}</Typography>
                  </Box>
                ))}

                <Box sx={{display: 'grid', placeItems: 'center'}}>
                  <Button
                    onClick={onCloseExpanded}
                    sx={{
                      minWidth: 0,
                      width: 30,
                      height: 30,
                      p: 0,
                      borderRadius: '50%',
                      color: '#D5E2F1',
                      border: '1px solid rgba(119,151,190,0.18)',
                      bgcolor: 'rgba(255,255,255,0.03)',
                    }}
                  >
                    <CloseIcon sx={{fontSize: 16}} />
                  </Button>
                </Box>
              </Box>
            </Box>
          ) : null}

          <Box
            sx={{
              pointerEvents: 'none',
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              width: 44,
              background: 'linear-gradient(270deg, rgba(15,27,45,0.96) 18%, rgba(15,27,45,0) 100%)',
              opacity: isExpandedVisible ? 0 : 1,
              transition: `opacity ${siteNewsOpeningDurationMs}ms ease`,
            }}
          />
        </Box>
      </Box>
    </Paper>
  );
}

export default function GlobalViewScreen({selectHeaderHierarchy, setCurrentScreen, onOpenColumbusLogbook3D}: GlobalViewScreenProps) {
  const [mapViewMode, setMapViewMode] = useState<MapViewMode>('Markers');
  const [isMapFocusMode, setIsMapFocusMode] = useState(false);
  const [activeCategory, setActiveCategory] = useState<KpiCategory>('Delivery');
  const [overlayKpi, setOverlayKpi] = useState<GlobalKpiKey>('Global OEE');
  const [selectedOverlayKpis, setSelectedOverlayKpis] = useState<GlobalKpiKey[]>(['Global OEE']);
  const [overlayKpiRotationIndex, setOverlayKpiRotationIndex] = useState(0);
  const [overlayKpiAutoRotate, setOverlayKpiAutoRotate] = useState(true);
  const [globalKpiContributionMode, setGlobalKpiContributionMode] = useState<GlobalKpiContributionMode>('metric');
  const [globalKpiSelectedSiteName, setGlobalKpiSelectedSiteName] = useState<string | null>(null);
  const [activeRegion, setActiveRegion] = useState<RegionFilter>('All Sites');
  const [facilityType, setFacilityType] = useState<FacilityType>('All Facilities');
  const [productFilter, setProductFilter] = useState<ProductFilter>('All Products');
  const [activeToneFilter, setActiveToneFilter] = useState<SiteTone | null>(null);
  const [benchmarkPanelOpen, setBenchmarkPanelOpen] = useState(false);
  const [benchmarkPrimarySiteName, setBenchmarkPrimarySiteName] = useState('Columbus West');
  const [benchmarkSiteNames, setBenchmarkSiteNames] = useState<string[]>(['Sandy', 'Humacao']);
  const [benchmarkKpi, setBenchmarkKpi] = useState<GlobalKpiKey>('Global OEE');
  const [benchmarkTimePeriod, setBenchmarkTimePeriod] = useState<(typeof benchmarkTimePeriods)[number]>('Last 24 Hours');
  const [benchmarkResult, setBenchmarkResult] = useState<BenchmarkResult | null>(null);
  const [benchmarkInsightsVisible, setBenchmarkInsightsVisible] = useState(false);
  const [globalSites, setGlobalSites] = useState<GlobalSite[]>(() => defaultGlobalSites);
  const [siteNewsLeadIndex, setSiteNewsLeadIndex] = useState(0);
  const [siteNewsPhase, setSiteNewsPhase] = useState<SiteNewsPhase>('idle');
  const [siteNewsNow, setSiteNewsNow] = useState(() => Date.now());
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
  const lastPrimaryMapViewRef = useRef<PrimaryMapViewMode>('Markers');
  const [mapCoverBounds, setMapCoverBounds] = useState<MapCoverBounds | null>(null);

  const openColumbusWestLogbook = () => {
    selectHeaderHierarchy?.('plant-columbus-west');
    setCurrentScreen?.('shift_logbook');
  };

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
      setSiteNewsNow(Date.now());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const defaultKpi = getDefaultKpiForFacility(facilityType, activeCategory);

    setOverlayKpi((currentKpi) => {
      return isKpiAllowedForFacility(currentKpi, facilityType, activeCategory) ? currentKpi : defaultKpi;
    });
    setSelectedOverlayKpis((currentKpis) => {
      const allowedKpis = currentKpis.filter((kpi) => isKpiAllowedForFacility(kpi, facilityType, activeCategory));
      return allowedKpis.length ? allowedKpis : [defaultKpi];
    });
    setBenchmarkKpi((currentKpi) => (
      isKpiAllowedForFacility(currentKpi, facilityType, activeCategory) ? currentKpi : defaultKpi
    ));
    setOverlayKpiAutoRotate(true);
  }, [activeCategory, facilityType]);

  useEffect(() => {
    setActiveRegion('All Sites');
  }, [facilityType]);

  useEffect(() => {
    if (facilityType === 'Distribution Centers' || facilityType === 'Office Buildings') {
      setProductFilter('All Products');
    }
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
    const matchesProduct = siteMatchesProductFilter(site, productFilter);
    return matchesRegion && matchesFacility && matchesProduct;
  });
  const selectedFacilityOption = facilityTypeOptions.find((option) => option.label === facilityType) ?? facilityTypeOptions[0];
  const selectedProductOption = productFilterOptions.find((option) => option.label === productFilter) ?? productFilterOptions[0];
  const selectedCategoryOption = kpiCategoryOptions.find((option) => option.label === activeCategory) ?? kpiCategoryOptions[kpiCategoryOptions.length - 1];
  const activeKpiOptions = getKpiOptionsForFacility(facilityType, activeCategory);
  const activeKpiOptionOrder = activeKpiOptions.map((option) => option.label);
  const activeOverlayKpi: GlobalKpiKey = isKpiAllowedForFacility(overlayKpi, facilityType, activeCategory)
    ? overlayKpi
    : getDefaultKpiForFacility(facilityType, activeCategory);
  const benchmarkSiteOptions = globalSites.filter((site) => (
    (facilityType === 'All Facilities' || getSiteFacilityType(site) === facilityType)
    && siteMatchesProductFilter(site, productFilter)
  ));
  const activeKpiOptionLabels = new Set<GlobalKpiKey>(activeKpiOptions.map((option) => option.label));
  const selectedActiveOverlayKpis = selectedOverlayKpis.filter((kpi) => activeKpiOptionLabels.has(kpi));
  const autoRotateKpis = activeKpiOptionOrder.length ? activeKpiOptionOrder : [activeOverlayKpi];
  const manualKpis = selectedActiveOverlayKpis.length ? selectedActiveOverlayKpis : [activeOverlayKpi];
  const mapOverlayKpis = overlayKpiAutoRotate ? [activeOverlayKpi] : manualKpis;
  const rightRailKpis = overlayKpiAutoRotate ? autoRotateKpis : manualKpis;
  const rightRailKpisSignature = rightRailKpis.join('|');
  const applyOverlayKpiSelection = (
    nextKpis: GlobalKpiKey[],
    nextActiveKpi: GlobalKpiKey,
    options?: {
      manual?: boolean;
      resetSelectedSite?: boolean;
    },
  ) => {
    const uniqueKpis = nextKpis.filter((kpi, index) => nextKpis.indexOf(kpi) === index);
    const orderedSelection = activeKpiOptionOrder.filter((kpi) => uniqueKpis.includes(kpi));
    const fallbackKpi = isKpiAllowedForFacility(nextActiveKpi, facilityType, activeCategory)
      ? nextActiveKpi
      : getDefaultKpiForFacility(facilityType, activeCategory);
    const resolvedSelection = orderedSelection.length ? orderedSelection : [fallbackKpi];
    const resolvedActiveKpi = resolvedSelection.includes(nextActiveKpi) ? nextActiveKpi : resolvedSelection[0];

    setSelectedOverlayKpis(resolvedSelection);
    setOverlayKpiRotationIndex(Math.max(0, resolvedSelection.indexOf(resolvedActiveKpi)));
    setOverlayKpi(resolvedActiveKpi);

    if (options?.manual) {
      setOverlayKpiAutoRotate(false);
    }

    if (options?.resetSelectedSite) {
      setGlobalKpiSelectedSiteName(null);
    }
  };
  const benchmarkPrimarySite = benchmarkSiteOptions.find((site) => site.name === benchmarkPrimarySiteName) ?? benchmarkSiteOptions[0];
  const selectedBenchmarkSites = benchmarkSiteOptions.filter((site) => (
    site.name !== benchmarkPrimarySite?.name && benchmarkSiteNames.includes(site.name)
  ));
  const activeBenchmarkKpi = isKpiAllowedForFacility(benchmarkKpi, facilityType, activeCategory)
    ? benchmarkKpi
    : getDefaultKpiForFacility(facilityType, activeCategory);
  const activeMetricDisplayLabel = getKpiUiLabel(activeOverlayKpi);
  const showGlobalKpiView = mapViewMode === 'Global KPI' && !aiTourActive;
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
      (facilityType === 'All Facilities' || getSiteFacilityType(site) === facilityType)
      && siteMatchesProductFilter(site, productFilter)
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
    const defaultKpi = getDefaultKpiForFacility(facilityType, activeCategory);

    if (nextPrimarySiteName !== benchmarkPrimarySiteName) {
      setBenchmarkPrimarySiteName(nextPrimarySiteName);
    }

    if (normalizedBenchmarkSiteNames.join('|') !== benchmarkSiteNames.join('|')) {
      setBenchmarkSiteNames(normalizedBenchmarkSiteNames);
    }

    if (!isKpiAllowedForFacility(benchmarkKpi, facilityType, activeCategory)) {
      setBenchmarkKpi(defaultKpi);
    }

    setBenchmarkResult(null);
    setBenchmarkInsightsVisible(false);
  }, [activeCategory, benchmarkKpi, benchmarkPrimarySiteName, benchmarkSiteNames, facilityType, globalSites, productFilter]);

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
          : Math.min(aiTourTypingLength, currentUnits + aiTourTypingStepUnits)
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
  const siteNewsItems = buildSiteNewsItems(filteredSites);
  const siteNewsSignature = siteNewsItems.map((item) => item.siteName).join('|');
  const orderedSiteNewsItems = siteNewsItems.length
    ? Array.from({length: siteNewsItems.length}, (_, index) => siteNewsItems[(siteNewsLeadIndex + index) % siteNewsItems.length]!)
    : [];
  const filteredTopPerformingSites = metricRankings.topPerforming;
  const filteredSitesWithIssues = metricRankings.sitesWithIssues;
  const globalOverviewCards = getGlobalOverviewCards(activeOverlayKpi, facilityType, 0, baseFilteredSites);
  const globalKpiHeaderCards = buildGlobalKpiHeaderCards(activeOverlayKpi, facilityType, baseFilteredSites);
  const globalOverviewStates = rightRailKpis.map((metric) => {
    const cards = getGlobalOverviewCards(metric, facilityType, 0, baseFilteredSites);
    const rankings = buildMetricRankings(baseFilteredSites, metric);
    return {
      metric,
      metricLabel: getKpiUiLabel(metric),
      cards,
      insight: buildGlobalOverviewInsight(metric, cards, rankings.topPerforming, rankings.sitesWithIssues),
    } satisfies GlobalOverviewState;
  });
  const globalOverviewInsight = buildGlobalOverviewInsight(
    activeOverlayKpi,
    globalOverviewCards,
    filteredTopPerformingSites,
    filteredSitesWithIssues,
  );
  const globalKpiDetailModel = buildGlobalKpiDetailModel({
    cards: globalOverviewCards,
    contributionMode: globalKpiContributionMode,
    facilityType,
    metric: activeOverlayKpi,
    sites: baseFilteredSites,
    toneByName: metricRankings.toneByName,
  });
  const globalKpiSelectedSite = globalKpiSelectedSiteName
    ? baseFilteredSites.find((site) => site.name === globalKpiSelectedSiteName) ?? null
    : null;
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

  useEffect(() => {
    if (mapViewMode === 'Global KPI') return;
    lastPrimaryMapViewRef.current = mapViewMode;
  }, [mapViewMode]);

  useEffect(() => {
    setOverlayKpiRotationIndex(0);
  }, [rightRailKpisSignature]);

  useEffect(() => {
    if (!globalKpiSelectedSiteName) return;
    if (baseFilteredSites.some((site) => site.name === globalKpiSelectedSiteName)) return;
    setGlobalKpiSelectedSiteName(null);
  }, [baseFilteredSites, globalKpiSelectedSiteName]);

  useEffect(() => {
    if (!overlayKpiAutoRotate || rightRailKpis.length <= 1 || showFlow || showGlobalKpiView) return;

    const intervalId = window.setInterval(() => {
      setOverlayKpiRotationIndex((currentIndex) => (currentIndex + 1) % rightRailKpis.length);
    }, 5200);

    return () => window.clearInterval(intervalId);
  }, [overlayKpiAutoRotate, rightRailKpis.length, rightRailKpisSignature, showFlow, showGlobalKpiView]);

  useEffect(() => {
    const nextKpi = rightRailKpis[Math.min(overlayKpiRotationIndex, rightRailKpis.length - 1)] ?? rightRailKpis[0];
    if (!nextKpi || nextKpi === overlayKpi) return;
    setOverlayKpi(nextKpi);
    if (overlayKpiAutoRotate) {
      setSelectedOverlayKpis([nextKpi]);
    }
  }, [overlayKpi, overlayKpiAutoRotate, overlayKpiRotationIndex, rightRailKpis, rightRailKpisSignature]);

  useEffect(() => {
    setSiteNewsLeadIndex(0);
    setSiteNewsPhase(siteNewsItems.length === 1 ? 'open' : 'idle');
  }, [siteNewsSignature, siteNewsItems.length]);

  useEffect(() => {
    if (siteNewsItems.length <= 1) return;

    const timeoutId = window.setTimeout(() => {
      if (siteNewsPhase === 'idle') {
        setSiteNewsPhase('opening');
        return;
      }

      if (siteNewsPhase === 'opening') {
        setSiteNewsPhase('open');
        return;
      }

      if (siteNewsPhase === 'open') {
        setSiteNewsPhase('closing');
        return;
      }

      if (siteNewsPhase === 'closing') {
        setSiteNewsPhase('pause');
        return;
      }

      if (siteNewsPhase === 'pause') {
        setSiteNewsPhase('sliding');
        return;
      }

      setSiteNewsLeadIndex((currentIndex) => (currentIndex + 1) % siteNewsItems.length);
      setSiteNewsPhase('idle');
    }, siteNewsPhase === 'opening'
      ? siteNewsOpeningDurationMs
      : siteNewsPhase === 'open'
        ? siteNewsExpandedDelayMs
        : siteNewsPhase === 'closing'
          ? siteNewsClosingDurationMs
          : siteNewsPhase === 'pause'
            ? siteNewsPostClosePauseMs
          : siteNewsPhase === 'sliding'
            ? siteNewsSlideDurationMs
            : siteNewsClosedDelayMs);

    return () => window.clearTimeout(timeoutId);
  }, [siteNewsItems.length, siteNewsPhase]);

  const siteNewsTimeLabel = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(siteNewsNow);
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
        height: 'calc(100dvh - 52px)',
        bgcolor: '#020A14',
        color: '#E7F1FF',
        p: {xs: 1.5, md: 2},
        overflow: 'hidden',
        display: 'grid',
        gridTemplateRows: isMapFocusMode ? 'minmax(0, 1fr) auto' : 'auto minmax(0, 1fr) auto',
        gap: isMapFocusMode ? 0.85 : 1.25,
      }}
    >
      {!isMapFocusMode ? <Box sx={{position: 'relative', minHeight: {xs: 82, md: 64}, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap'}}>
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

        </Box>
      </Box> : null}

      <Box sx={{display: 'grid', gridTemplateColumns: isMapFocusMode ? 'minmax(0, 1fr)' : {xs: '1fr', xl: 'minmax(0, 1fr) 280px'}, gap: 1.25, minHeight: 0}}>
        <Paper
          elevation={0}
          ref={mapRef}
          sx={{
            position: 'relative',
            height: '100%',
            minHeight: 0,
            overflow: showGlobalKpiView ? 'hidden' : 'visible',
            bgcolor: '#061120',
            border: '1px solid rgba(119, 151, 190, 0.24)',
            borderRadius: 2,
          }}
        >
          <Tooltip title={isMapFocusMode ? 'Exit focus mode' : 'Focus map'}>
            <IconButton
              aria-label={isMapFocusMode ? 'Exit map focus mode' : 'Enter map focus mode'}
              aria-pressed={isMapFocusMode}
              onClick={() => setIsMapFocusMode((current) => !current)}
              sx={{
                position: 'absolute',
                top: 18,
                right: 18,
                zIndex: 8,
                width: 34,
                height: 34,
                color: isMapFocusMode ? '#B9D8FF' : '#8196B0',
                bgcolor: 'transparent',
                border: 0,
                borderRadius: 1,
                boxShadow: 'none',
                transition: 'color 180ms ease, background-color 180ms ease, opacity 180ms ease',
                opacity: isMapFocusMode ? 1 : 0.82,
                '&:hover': {color: '#D5E8FF', bgcolor: 'rgba(82,141,255,0.08)', opacity: 1},
                '&:focus-visible': {outline: '2px solid #58A3FF', outlineOffset: 2},
              }}
            >
              {isMapFocusMode ? <CloseFullscreenIcon sx={{fontSize: 17}} /> : <OpenInFullIcon sx={{fontSize: 17}} />}
            </IconButton>
          </Tooltip>
          <Box sx={{position: 'absolute', top: 12, left: 12, right: 66, zIndex: 6, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.2, pointerEvents: 'none'}}>
            <Box sx={{display: 'flex', gap: 0.8, bgcolor: 'rgba(6, 16, 29, 0.76)', border: '1px solid rgba(119,151,190,0.24)', borderRadius: 1.4, p: 0.45, pointerEvents: 'auto'}}>
              <MapModeButton active={mapViewMode === 'Markers'} label="Markers" onClick={() => setMapViewMode('Markers')} tint="#58A3FF" />
              <MapModeButton active={mapViewMode === 'Heatmap'} label="Heatmap" onClick={() => setMapViewMode('Heatmap')} tint="#8A93FF" />
              <MapModeButton active={showFlow} label="Flow" onClick={() => setMapViewMode('Flow')} tint="#2CE6FF" />
              <MapModeButton active={showGlobalKpiView} label="Global KPI" onClick={() => setMapViewMode('Global KPI')} tint="#FF6B6B" />
            </Box>
            <Box sx={{display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'flex-end', pointerEvents: 'auto'}}>
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
                  minWidth: {xs: 170, sm: 205},
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
                  {selectedProductOption.icon}
                </Box>
                <Box sx={{minWidth: 0, flex: 1}}>
                  <Typography sx={{fontSize: 10, color: '#8BA4C4', lineHeight: 1.1}}>Product</Typography>
                  <Select
                    value={productFilter}
                    onChange={(event) => setProductFilter(event.target.value as ProductFilter)}
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
                    {productFilterOptions.map((option) => (
                      <MenuItem key={option.label} value={option.label}>
                        <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                          <Box sx={{color: option.label === productFilter ? '#58A3FF' : '#A9BED6', display: 'grid', placeItems: 'center'}}>
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
                <Box sx={{color: '#8BA4C4', display: 'grid', placeItems: 'center'}}>
                  {selectedCategoryOption.icon}
                </Box>
                <Box sx={{minWidth: 0, flex: 1}}>
                  <Typography sx={{fontSize: 10, color: '#8BA4C4', lineHeight: 1.1}}>Category</Typography>
                  <Select
                    value={activeCategory}
                    onChange={(event) => setActiveCategory(event.target.value as KpiCategory)}
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
                    {kpiCategoryOptions.map((option) => (
                      <MenuItem key={option.label} value={option.label}>
                        <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                          <Box sx={{color: option.label === activeCategory ? '#58A3FF' : '#A9BED6', display: 'grid', placeItems: 'center'}}>
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
                      const normalizedKpis = uniqueKpis.length ? uniqueKpis : [getDefaultKpiForFacility(facilityType, activeCategory)];
                      const nextActiveKpi = normalizedKpis.includes(activeOverlayKpi) ? activeOverlayKpi : normalizedKpis[0];
                      applyOverlayKpiSelection(normalizedKpis, nextActiveKpi, {manual: true});
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
                            ? `${getKpiUiLabel((selected as GlobalKpiKey[])[0])} +${(selected as GlobalKpiKey[]).length - 1}`
                            : (selected as GlobalKpiKey[]).map((label) => getKpiUiLabel(label)).join(', ')}
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
                          <Typography sx={{fontSize: 13, fontWeight: 700}}>{getKpiUiLabel(option.label)}</Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </Box>
              </Paper>
            </Box>
          </Box>

          {showGlobalKpiView ? (
            <GlobalKpiDetailView
              activeRegion={activeRegion}
              contributionMode={globalKpiContributionMode}
              facilityType={facilityType}
              headerCards={globalKpiHeaderCards}
              metric={activeOverlayKpi}
              model={globalKpiDetailModel}
              onBack={() => setMapViewMode(lastPrimaryMapViewRef.current)}
              onContributionModeChange={setGlobalKpiContributionMode}
              onMetricChange={(nextMetric) => {
                const nextSelectionSet = new Set(selectedOverlayKpis.filter((kpi) => activeKpiOptionLabels.has(kpi)));
                nextSelectionSet.add(nextMetric);
                applyOverlayKpiSelection(Array.from(nextSelectionSet), nextMetric, {
                  manual: true,
                  resetSelectedSite: true,
                });
              }}
              onSelectRegion={(region) => {
                setGlobalKpiSelectedSiteName(null);
                setActiveRegion(region);
              }}
              onSelectSite={(siteName) => setGlobalKpiSelectedSiteName((currentName) => currentName === siteName ? null : siteName)}
              selectedSite={globalKpiSelectedSite}
            />
          ) : (
          <>
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
                transform: aiTourActive || aiTourBooting
                  ? `translate3d(${aiTourSceneOffsetX}px, ${aiTourSceneOffsetY}px, 0) scale(${aiTourCameraScale})`
                  : 'none',
                transformOrigin: 'top left',
                transition: 'transform 1180ms cubic-bezier(0.22, 1, 0.36, 1)',
                willChange: aiTourActive || aiTourBooting ? 'transform' : 'auto',
                backfaceVisibility: aiTourActive || aiTourBooting ? 'hidden' : 'visible',
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
                  onOpenColumbusLogbook={openColumbusWestLogbook}
                  onOpenColumbusLogbook3D={onOpenColumbusLogbook3D}
                />
              ))}
            </Box>
          </Box>

          <Paper elevation={0} sx={{position: 'absolute', left: {xs: 10, md: 18}, bottom: {xs: 84, md: 112}, zIndex: 5, display: 'grid', gap: 0.55, bgcolor: 'rgba(7,19,35,0.80)', border: '1px solid rgba(119,151,190,0.24)', borderRadius: 1.2, p: 0.65}}>
            {[<GlobeIcon key="globe" />, '+', '-'].map((item, index) => (
              <Box key={index} sx={{width: 32, height: 32, display: 'grid', placeItems: 'center', color: '#A6B4C5', fontSize: 22, borderBottom: index === 2 ? 'none' : '1px solid rgba(119,151,190,0.18)'}}>{item}</Box>
            ))}
          </Paper>

          <Paper
            elevation={0}
            sx={{
              position: 'absolute',
              right: {xs: 12, md: 14},
              bottom: {xs: 14, md: 14},
              zIndex: 5,
              width: {xs: 182, md: 194},
              p: 1,
              bgcolor: 'rgba(7, 16, 28, 0.58)',
              border: '1px solid rgba(119,151,190,0.14)',
              borderRadius: 1.6,
              boxShadow: '0 8px 24px rgba(0,0,0,0.16)',
              backdropFilter: 'blur(5px)',
            }}
          >
            <Typography sx={{fontSize: 12, color: '#D8E6F8', fontWeight: 850, mb: 0.75, letterSpacing: 0.2}}>Quick Filters</Typography>
            <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.55}}>
              {['Americas', 'Europe', 'Asia Pacific', 'All Sites'].map((filter) => (
                <Button
                  key={filter}
                  startIcon={<GlobeIcon sx={{fontSize: 15}} />}
                  onClick={() => setActiveRegion(filter as RegionFilter)}
                  sx={{
                    minWidth: 0,
                    height: 34,
                    px: 0.9,
                    color: activeRegion === filter ? '#9BCBFF' : '#A9BED6',
                    border: `1px solid ${activeRegion === filter ? 'rgba(82,141,255,0.34)' : 'rgba(119,151,190,0.10)'}`,
                    bgcolor: activeRegion === filter ? 'rgba(52,141,255,0.08)' : 'rgba(255,255,255,0.015)',
                    borderRadius: 1.05,
                    textTransform: 'none',
                    fontSize: 11.5,
                    fontWeight: 800,
                    '&:hover': {
                      bgcolor: activeRegion === filter ? 'rgba(52,141,255,0.12)' : 'rgba(255,255,255,0.03)',
                    },
                  }}
                >
                  {filter}
                </Button>
              ))}
            </Box>
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
          </>
          )}
        </Paper>

        <Box
          sx={{
            display: isMapFocusMode ? 'none' : showGlobalKpiView ? {xs: 'none', xl: 'block'} : 'grid',
            gap: 0.85,
            alignContent: 'start',
            minHeight: 0,
            overflowY: 'auto',
            overflowX: 'hidden',
            pr: 0.2,
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(120, 151, 190, 0.45) transparent',
            '&::-webkit-scrollbar': {
              width: 8,
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(120, 151, 190, 0.38)',
              borderRadius: 999,
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
            },
          }}
        >
          {!showFlow && !aiTourActive ? (
            <>
              <Paper elevation={0} sx={{p: 1.35, bgcolor: 'rgba(22, 23, 61, 0.78)', border: '1px solid rgba(119,151,190,0.24)', borderRadius: 2}}>
                <Box sx={{display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.85}}>
                  <SparkleIcon sx={{fontSize: 18, color: '#A78BFA'}} />
                  <Typography sx={{fontSize: 14, color: '#FFFFFF', fontWeight: 900}}>AI Tour</Typography>
                  <Chip label="Beta" size="small" sx={{height: 18, bgcolor: 'rgba(82,141,255,0.18)', color: '#8FC5FF', fontSize: 9, fontWeight: 900}} />
                </Box>
                <Typography sx={{fontSize: 17, color: '#FFFFFF', fontWeight: 900, lineHeight: 1.05}}>Hi Ibrahim!</Typography>
                <Typography sx={{fontSize: 10.8, color: '#DDEBFF', lineHeight: 1.32, mt: 0.45}}>
                  {aiTourBooting
                    ? `Scanning the network and locking onto ${aiTourBootTargetName}...`
                    : `I found ${aiTourStops.length} sites needing attention. Start a guided tour?`}
                </Typography>
                <Box sx={{display: 'grid', gap: 0.35, mt: 0.7}}>
                  {[
                    'Focus on what matters most',
                    'Get AI-powered insights',
                    'Recommendations to improve',
                  ].map((line) => (
                    <Box key={line} sx={{display: 'flex', alignItems: 'center', gap: 0.55}}>
                      <Box sx={{width: 6, height: 6, borderRadius: '50%', bgcolor: '#9C87FF'}} />
                      <Typography sx={{fontSize: 10.35, color: '#C7D4E5', lineHeight: 1.2}}>{line}</Typography>
                    </Box>
                  ))}
                </Box>
                <Button
                  onClick={handleStartAiTour}
                  disabled={aiTourBooting}
                  startIcon={<SparkleIcon sx={{fontSize: 16}} />}
                  sx={{
                    mt: 0.9,
                    width: '100%',
                    height: 36,
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

              <GlobalOverviewPanel
                key={`overview-${activeMetricDisplayLabel}`}
                activeMetric={activeOverlayKpi}
                onViewDetails={() => setMapViewMode('Global KPI')}
                overviewStates={globalOverviewStates}
              />
            </>
          ) : null}

          <Paper
            key={`top-sites-${activeMetricDisplayLabel}`}
            elevation={0}
            sx={{
              p: 1.45,
              bgcolor: 'rgba(15, 27, 45, 0.92)',
              border: '1px solid rgba(119,151,190,0.24)',
              borderRadius: 2,
              animation: 'rightRailMetricSwap 360ms cubic-bezier(0.22, 1, 0.36, 1)',
              '@keyframes rightRailMetricSwap': {
                '0%': {opacity: 0, transform: 'translateY(8px)'},
                '100%': {opacity: 1, transform: 'translateY(0)'},
              },
            }}
          >
            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1}}>
              <Box>
                <Typography sx={{fontSize: 14, color: '#FFFFFF', fontWeight: 900, lineHeight: 1}}>{performanceListLabel}</Typography>
                <Typography sx={{fontSize: 10, color: '#8FBFFF', fontWeight: 700, mt: 0.28}}>Ranked by {activeMetricDisplayLabel}</Typography>
              </Box>
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

          <Paper
            key={`issue-sites-${activeMetricDisplayLabel}`}
            elevation={0}
            sx={{
              p: 1.45,
              bgcolor: 'rgba(15, 27, 45, 0.92)',
              border: '1px solid rgba(119,151,190,0.24)',
              borderRadius: 2,
              animation: 'rightRailMetricSwap 360ms cubic-bezier(0.22, 1, 0.36, 1)',
              '@keyframes rightRailMetricSwap': {
                '0%': {opacity: 0, transform: 'translateY(8px)'},
                '100%': {opacity: 1, transform: 'translateY(0)'},
              },
            }}
          >
            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1}}>
              <Box>
                <Typography sx={{fontSize: 14, color: '#FFFFFF', fontWeight: 900, lineHeight: 1}}>{issueListLabel}</Typography>
                <Typography sx={{fontSize: 10, color: '#8FBFFF', fontWeight: 700, mt: 0.28}}>Ranked by {activeMetricDisplayLabel}</Typography>
              </Box>
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
          ) : null}

        </Box>
      </Box>

      <SiteNewsTicker
        phase={siteNewsPhase}
        items={orderedSiteNewsItems}
        onCloseExpanded={() => {
          if (orderedSiteNewsItems.length > 1) {
            setSiteNewsPhase('closing');
            return;
          }

          setSiteNewsPhase('idle');
        }}
        onExpandLead={() => {
          if (!orderedSiteNewsItems.length) return;
          if (siteNewsPhase === 'sliding') return;
          setSiteNewsPhase('opening');
        }}
        timeLabel={siteNewsTimeLabel}
      />

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
