import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  IconButton,
  Button,
  Chip,
  Grid,
  FormControl,
  Select,
  MenuItem,
  Tooltip,
} from '@mui/material';
import {
  AccountTree as AccountTreeIcon,
  ApartmentOutlined as ApartmentOutlinedIcon,
  AssignmentTurnedInOutlined as AssignmentTurnedInOutlinedIcon,
  AttachFile as AttachFileIcon,
  Search as SearchIcon,
  Mic as MicIcon,
  Cancel as CancelIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  ChevronRight as ChevronRightIcon,
  DescriptionOutlined as DescriptionOutlinedIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  FolderOutlined as FolderOutlinedIcon,
  GridViewOutlined as GridViewOutlinedIcon,
  InsertDriveFileOutlined as InsertDriveFileOutlinedIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowRight as KeyboardArrowRightIcon,
  LocationOn as LocationOnIcon,
  NotificationsOutlined as NotificationsOutlinedIcon,
  AutoAwesome as AutoAwesomeIcon,
  Autorenew as AutorenewIcon,
  CalendarTodayOutlined as CalendarTodayOutlinedIcon,
  PersonOutline as PersonOutlineIcon,
  PlayArrowRounded as PlayArrowRoundedIcon,
  Inventory2Outlined as Inventory2OutlinedIcon,
  PrecisionManufacturing as PrecisionManufacturingIcon,
  PublicOutlined as PublicOutlinedIcon,
  SettingsSuggest as SettingsSuggestIcon,
  SchoolOutlined as SchoolOutlinedIcon,
  SendRounded as SendRoundedIcon,
  ShowChartOutlined as ShowChartOutlinedIcon,
  LockOutlined as LockOutlinedIcon,
  Tune as TuneIcon,
  ViewListOutlined as ViewListOutlinedIcon,
  ViewInArOutlined as ViewInArOutlinedIcon,
  ThumbUpOutlined as ThumbUpOutlinedIcon,
  ThumbDownOutlined as ThumbDownOutlinedIcon,
  TrendingUp as TrendingUpIcon,
  WarningAmberOutlined as WarningAmberOutlinedIcon,
  ArrowOutward as ArrowOutwardIcon,
} from '@mui/icons-material';
import { SmartSearchCategory } from '../types';
import {
  smartSearchSuggestedQueries,
  smartSearchCategories,
  getSmartSearchCatalogStats,
} from '../data';
import { buildSearchIndex, getRelatedItems, runSmartSearchEngine } from '../smartSearch/smartSearchEngine';
import { getGlobalSearchCatalog } from '../smartSearch/globalCatalog';
import {useWorkstationContext} from '../../workstation/contexts/WorkstationContext';
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
import {
  findHeaderHierarchyPath,
  getHeaderHierarchyExpandablePathIds,
  headerHierarchyTree,
} from '../../navigation/headerHierarchy';
import { EquipmentFocusScene } from '../../shiftManagement/components/ShiftLogbookScreen';
import { inventoryParts, type SparePartsInventoryPart } from '../../Maintenance/pages/SparePartsManagementPage';

interface SmartSearchScreenProps {
  activeTheme: any;
  currentUserName: string;
  setCurrentScreen: (screen: any) => void;
  openSmartSearchChat: (context: string) => void;
}

type SmartSearchExperienceMode = 'default' | 'columbus-west-site' | 'sandy-site';
type SmartSearchWorkspaceTab = SmartSearchCategory | 'Site Overview' | 'Maintenance Requests' | 'Work Orders' | 'Spare Parts';
type SmartSearchDocumentViewMode = 'list' | 'card';

type SmartSearchMaintenanceListItem = {
  id: string;
  title: string;
  equipment: string;
  location: string;
  owner: string;
  due: string;
  priority: 'High' | 'Medium' | 'Low';
  status: string;
  summary: string;
};

const smartSearchMaintenanceRequests: SmartSearchMaintenanceListItem[] = [
  { id: 'MR-1058', title: 'Investigate elevated conveyor vibration', equipment: 'Conveyor CV-101', location: 'Area A · Line 10 · Zone 1', owner: 'Reliability Team', due: 'Today · 14:30', priority: 'High', status: 'Needs review', summary: 'Repeated vibration and shift-entry signals require maintenance triage before the next handoff.' },
  { id: 'MR-1054', title: 'Inspect filling head drive bearing', equipment: 'Drive Bearing BR-10', location: 'Area A · Line 10 · Zone 1', owner: 'Maintenance', due: 'Today · 16:00', priority: 'High', status: 'Ready to plan', summary: 'Bearing noise was reported twice after restart and is linked to the active inspection window.' },
  { id: 'MR-1049', title: 'Validate intermittent vision-system stop', equipment: 'Vision Inspection VI-210', location: 'Area A · Line 10 · Zone 1', owner: 'Controls Team', due: 'Tomorrow · 09:00', priority: 'Medium', status: 'Under review', summary: 'Three short stops were logged during the current production window without quality impact.' },
  { id: 'MR-1043', title: 'Check labeler guard alignment', equipment: 'Labeling Machine LM-7', location: 'Area A · Line 10 · Zone 1', owner: 'Line Maintenance', due: 'Jul 05 · 08:00', priority: 'Low', status: 'New', summary: 'Operator observation indicates minor guard contact during format changeover.' },
];

const smartSearchWorkOrders: SmartSearchMaintenanceListItem[] = [
  { id: 'WO-2481', title: 'Conveyor bearing verification', equipment: 'Conveyor CV-101', location: 'Area A · Line 10 · Zone 1', owner: 'M. Rodriguez', due: 'Today · 14:30', priority: 'High', status: 'In progress', summary: 'Verify bearing condition, capture vibration evidence, and update the shift handoff.' },
  { id: 'WO-2476', title: 'Filling head inspection and lubrication', equipment: 'Drive Bearing BR-10', location: 'Area A · Line 10 · Zone 1', owner: 'J. Patel', due: 'Today · 17:00', priority: 'High', status: 'Scheduled', summary: 'Inspection was advanced after the latest maintenance and shift-entry correlation.' },
  { id: 'WO-2468', title: 'Vision sensor alignment check', equipment: 'Vision Inspection VI-210', location: 'Area A · Line 10 · Zone 1', owner: 'Controls Team', due: 'Tomorrow · 10:00', priority: 'Medium', status: 'Planned', summary: 'Confirm sensor alignment and review the three intermittent-stop events.' },
  { id: 'WO-2459', title: 'Labeler guard adjustment', equipment: 'Labeling Machine LM-7', location: 'Area A · Line 10 · Zone 1', owner: 'Line Maintenance', due: 'Jul 05 · 08:00', priority: 'Low', status: 'Backlog', summary: 'Correct minor guard contact during the next planned format-change window.' },
];

type SmartSearchHierarchyNode = {
  children?: SmartSearchHierarchyNode[];
  id: string;
  kind: 'global' | 'region' | 'plant' | 'site' | 'area' | 'unit' | 'line' | 'zone' | 'system' | 'asset';
  label: string;
  meta?: string;
};

type SmartSearch3DDrillLevel = 'site' | 'area' | 'unit' | 'line' | 'zone' | 'machine';
type SmartSearch3DAreaId = 'area-a';
type SmartSearch3DUnitId = 'unit-a';
type SmartSearch3DLineId = 'line-10';
type SmartSearch3DZoneId = 'zone-1' | 'zone-2' | 'zone-4' | 'zone-5';
type SmartSearch3DMachineId =
  | 'syringe-assembly-module'
  | 'conveyor-cv101'
  | 'vision-vi210'
  | 'labeling-lm7'
  | 'cooling-pack';

const columbusHierarchyRoot: SmartSearchHierarchyNode = {
  id: 'cw-global',
  kind: 'global',
  label: 'BD Global',
  meta: 'Enterprise hierarchy',
  children: [
    {
      id: 'cw-americas',
      kind: 'region',
      label: 'Americas',
      meta: 'Regional network',
      children: [
        {
          id: 'cw-site',
          kind: 'site',
          label: 'Columbus West',
          meta: 'Open Control Tower site',
          children: [
            {
              id: 'cw-area-a',
              kind: 'area',
              label: 'Area A',
              meta: 'Primary syringe assembly',
              children: [
                {
                  id: 'cw-line-10',
                  kind: 'line',
                  label: 'Line 10',
                  meta: 'Shift Entry network line',
                  children: [
                    {
                      id: 'cw-zone-1',
                      kind: 'zone',
                      label: 'Zone 1',
                      meta: 'Primary process zone',
                      children: [
                        {
                          id: 'cw-syringe-assembly-module',
                          kind: 'system',
                          label: 'Syringe Assembly Module',
                          meta: 'Selected zone module',
                          children: [
                            {
                              id: 'cw-filling-system',
                              kind: 'system',
                              label: 'Filling System',
                              meta: 'Core process',
                              children: [
                                {
                                  id: 'cw-filling-head-assembly',
                                  kind: 'system',
                                  label: 'Filling Head Assembly',
                                  meta: 'Nested assembly',
                                  children: [
                                    {id: 'cw-servo-motor', kind: 'asset', label: 'Servo Motor', meta: 'Drive'},
                                    {id: 'cw-nozzle-cluster', kind: 'asset', label: 'Nozzle Cluster', meta: 'Dispense set'},
                                    {id: 'cw-drive-bearing', kind: 'asset', label: 'Drive Bearing', meta: 'Highlighted asset'},
                                    {id: 'cw-dosing-pump-module', kind: 'asset', label: 'Dosing Pump Module', meta: 'Flow control'},
                                  ],
                                },
                              ],
                            },
                            {id: 'cw-transport-system', kind: 'system', label: 'Transport System', meta: 'Material feed'},
                            {id: 'cw-conveyor-cv101', kind: 'system', label: 'Conveyor CV-101', meta: 'Primary conveyor'},
                            {id: 'cw-vision-vi210', kind: 'system', label: 'Vision Inspection VI-210', meta: 'Quality gate'},
                            {id: 'cw-labeling-lm7', kind: 'system', label: 'Labeling Machine LM-7', meta: 'Label application'},
                            {id: 'cw-cartoner-ct32', kind: 'system', label: 'Cartoner CT-32', meta: 'Pack-out'},
                          ],
                        },
                        {
                          id: 'cw-zone-2',
                          kind: 'zone',
                          label: 'Zone 2',
                          meta: 'Needle torque and packing',
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

const defaultColumbusHierarchySelectionId = 'plant-columbus-west';
const defaultColumbusExpandedIds = Array.from(new Set([
  ...getHeaderHierarchyExpandablePathIds(defaultColumbusHierarchySelectionId),
  'plant-columbus-west-area-assembly',
  'plant-columbus-west-area-assembly-unit-a',
  'plant-columbus-west-area-assembly-unit-a-line-10',
  'zone-cw-assembly-a-10-final',
  'cw-syringe-assembly-module',
  'cw-filling-system',
]));
const defaultSandyHierarchySelectionId = 'plant-sandy';
const defaultSandyExpandedIds = getHeaderHierarchyExpandablePathIds(defaultSandyHierarchySelectionId);
const columbusSmartSearchHeroImage = '/images/columbus-site-photo-v1.png';
const columbusSmartSearchBrandMark = '/images/bd-symbol-rgb.png';
const columbusSmartSearchProductImages = {
  cannula: '/images/columbus-product-cannula-v2.png',
  hypodermic: '/images/columbus-product-hypodermic-v2.png',
  posiflush: '/images/columbus-product-posiflush-v2.png',
} as const;
const columbusWelcomeMessage = {
  title: 'Welcome to Columbus West',
  body: 'I pulled together this overview so you can quickly understand our site footprint, leadership, story, and product portfolio.',
};
const columbusHistoryHighlights = [
  'Established in 1949 as one of BD’s earliest major U.S. manufacturing expansions.',
  'Built from the ground up to support long-horizon production and innovation growth.',
  'Expanded into a broad manufacturing footprint serving multiple BD product families.',
  'Today the site designs, engineers, molds, and assembles devices used around the world.',
];
const columbusTypingNarratives = [
  'Preparing Columbus West site context from Global View...',
  'Layering Area A, Line 10, and Zone 1 into Smart Search...',
  'Connecting site story, hierarchy, and operational detail...',
];
const smartSearchHomeColumbusAutoQuery = 'Show me Columbus West site details with focus on Area A, Line 10, Zone 1.';
const smartSearchHomeSandyAutoQuery = 'Show me Sandy site details with focus on footprint, manufacturing areas, operations, and product portfolio.';
const headerHierarchyCountMap: Record<string, number> = {
  'header-hierarchy-bd-global': 128,
  'header-region-americas': 24,
  'plant-columbus-west': 6,
  'plant-sandy': 3,
  'plant-columbus-west-area-assembly': 4,
  'plant-columbus-west-area-assembly-unit-a': 2,
  'plant-columbus-west-area-assembly-unit-a-line-10': 12,
  'zone-cw-assembly-a-10-final': 6,
};
const columbusZone1DetailChildren = columbusHierarchyRoot.children?.[0]
  ?.children?.[0]
  ?.children?.[0]
  ?.children?.[0]
  ?.children?.[0]
  ?.children ?? [];
const documentThumbnailFallbacks: Record<string, string> = {
  'cw-doc-site-profile': '/images/site-view.png',
  'cw-doc-zone-1-architecture': '/images/Line1.png',
};
const columbusShiftLeadership = [
  { name: 'April D. Wallace', role: 'Site Leader / General Manager' },
  { name: 'Adriano Castello', role: 'Associate Site Leader, Engineering and Innovation' },
  { name: 'Jude Hill', role: 'Associate Site Leader, Quality and Regulatory' },
  { name: 'Tom Pick', role: 'Associate Site Leader, Finance' },
  { name: 'Jenny Bauer', role: 'Associate Site Leader, Manufacturing' },
  { name: 'Jennifer Fortune', role: 'Associate Site Leader, HR and Culture' },
];
const columbusTodayHighlights = [
  'Largest BD site with one of the broadest U.S. operating footprints.',
  '92% facility fill across the primary campus footprint.',
  '5 union locals supporting site operations and labor continuity.',
  'Solar array generating 4.7M+ kWh in fiscal 2024.',
  "Named one of America's Greatest Workplaces by Newsweek.",
  'Waste diversion rate at 99.9% across site operations.',
  '600+ employees and 2.6 million medical devices produced daily.',
  '47% to 92% GHG intensity reduction progress since 2009.',
];
const sandySmartSearchHeroImage = '/images/sandy-site-hero-v2.png';
const sandySmartSearchProductImages = {
  autoguard: '/images/sandy-product-autoguard.svg',
  nexiva: '/images/sandy-product-nexiva.svg',
  qSyteTexium: '/images/sandy-product-qsyte-texium.svg',
  scrub: '/images/sandy-product-scrub.svg',
} as const;
const sandyWelcomeMessage = {
  title: 'Welcome to Sandy',
  body: 'I pulled together this overview so you can quickly understand our plant footprint, manufacturing areas, and product portfolio.',
};
const sandyTypingNarratives = [
  'Scanning plant footprint, operations, and product portfolio for Sandy...',
  'Linking manufacturing areas, team coverage, and site metrics for Sandy...',
  'Preparing a guided Sandy site overview inside Smart Search...',
];
const sandyPlantProfileHighlights = [
  'Manufacturing equipment includes 3 Nexiva lines, 6 IAG BC lines, 6 IAG Classic lines, 5 Q-Syte lines, 2 Scrub lines, 87 molding presses, and 13 extruders.',
  'Operations run on 12-hour rotating shifts.',
  'The site supports both integrated packaging and stand-alone packaging in selected areas.',
  'Additional support functions include sterilization, internal machine shops, tool crib, quality lab, facilities, and warehouses.',
];
const sandyTodayHighlights = [
  'Autoguard is spread across 3 separate cleanrooms.',
  'Nexiva has eDHR fully implemented and is adopting AVEVA.',
  'Q-Syte / Texium currently uses MES dashboards daily.',
  'Scrub is the only drug product on site.',
  'Molding uses Plant Star for performance tracking.',
  'Several areas still rely on paper DHRs and manual Tier 1, creating clear digitalization opportunities.',
];
const sandySmartSearchProducts = [
  {
    accent: '#2563EB',
    description: 'High-volume BC and Classic product families produced at Sandy.',
    detail: 'We manufacture this product family at Sandy.',
    image: sandySmartSearchProductImages.autoguard,
    imageAlt: 'Autoguard product',
    imageScale: '86%',
    title: 'Autoguard',
  },
  {
    accent: '#2563EB',
    description: 'Integrated manufacturing and packaging for critical vascular access products.',
    detail: 'We manufacture this product family at Sandy.',
    image: sandySmartSearchProductImages.nexiva,
    imageAlt: 'Nexiva product',
    imageScale: '84%',
    title: 'Nexiva',
  },
  {
    accent: '#2563EB',
    description: 'Specialized product lines supported by daily MES visibility.',
    detail: 'We manufacture this product family at Sandy.',
    image: sandySmartSearchProductImages.qSyteTexium,
    imageAlt: 'Q-Syte and Texium products',
    imageScale: '87%',
    title: 'Q-Syte / Texium',
  },
  {
    accent: '#2563EB',
    description: 'Drug product manufactured on site with integrated packaging.',
    detail: 'We manufacture this product family at Sandy.',
    image: sandySmartSearchProductImages.scrub,
    imageAlt: 'Scrub product',
    imageScale: '88%',
    title: 'Scrub',
  },
] as const;
const columbusSmartSearchMapPins = [
  { label: 'Line 01', line: 'Line 1', zone: 'Zone 2', top: '74%', left: '29%', attention: false },
  { label: 'Line 03', line: 'Line 3', zone: 'Zone 1', top: '45%', left: '4%', attention: false },
  { label: 'Line 04', line: 'Line 4', zone: 'Zone 1', top: '61%', left: '63%', attention: false },
  { label: 'Line 05', line: 'Line 5', zone: 'Zone 3', top: '34%', left: '55%', attention: true },
  { label: 'Line 07', line: 'Line 3', zone: 'Zone 2', top: '9%', left: '20%', attention: false },
  { label: 'Line 10', line: 'Line 2', zone: 'Zone 1', top: '2%', left: '45%', attention: false, active: true },
];
const smartSearch3DSiteImage = '/images/smart-search-3d/site-wide-overview.png';
const smartSearch3DLevelOrder: Record<SmartSearch3DDrillLevel, number> = {
  site: 0,
  area: 1,
  unit: 2,
  line: 3,
  zone: 4,
  machine: 5,
};

const smartSearch3DAreaViews: Record<
  SmartSearch3DAreaId,
  {
    description: string;
    hierarchyId: string;
    highlight: { height: string; left: string; top: string; width: string };
    image: string;
    label: string;
    metrics: Array<{ label: string; tone: string; value: string }>;
    status: string;
    summary: string;
    unitId: SmartSearch3DUnitId;
  }
> = {
  'area-a': {
    label: 'Area A',
    status: 'Running',
    hierarchyId: 'plant-columbus-west-area-assembly',
    image: '/images/smart-search-3d/area-overview.png',
    summary: 'Area A narrows the site into the main assembly room, so the visual already starts separating the broad Columbus West footprint from the active production area.',
    description: 'This step is the bridge between the full-site view and the unit-level view. It keeps the context wide enough to understand the room, but tight enough to show where the selected production family lives.',
    highlight: { top: '16%', left: '12%', width: '76%', height: '68%' },
    unitId: 'unit-a',
    metrics: [
      { label: 'Active room', value: 'Assembly', tone: '#2563EB' },
      { label: 'Linked unit', value: 'Unit A', tone: '#0F766E' },
      { label: 'Visible zones', value: '2', tone: '#FF7A00' },
    ],
  },
};

const smartSearch3DUnitViews: Record<
  SmartSearch3DUnitId,
  {
    description: string;
    hierarchyId: string;
    highlight: { height: string; left: string; top: string; width: string };
    image: string;
    label: string;
    metrics: Array<{ label: string; tone: string; value: string }>;
    status: string;
    summary: string;
    zoneIds: SmartSearch3DZoneId[];
  }
> = {
  'unit-a': {
    label: 'Unit A',
    status: 'Running',
    hierarchyId: 'plant-columbus-west-area-assembly-unit-a',
    image: '/images/smart-search-3d/unit-overview.png',
    summary: 'Unit A is the right visual step before zone because it frames the full production cell and shows how the zones connect instead of jumping straight into a narrow slice.',
    description: 'At this level the user sees the whole unit footprint, with a clear sense of material flow and station boundaries before drilling into a zone-specific operating context.',
    highlight: { top: '18%', left: '10%', width: '78%', height: '70%' },
    zoneIds: ['zone-1', 'zone-2'],
    metrics: [
      { label: 'Production unit', value: 'Unit A', tone: '#2563EB' },
      { label: 'Line context', value: 'Line 10', tone: '#0F766E' },
      { label: 'Selectable zones', value: '2', tone: '#FF7A00' },
    ],
  },
};

const smartSearch3DLineViews: Record<
  SmartSearch3DLineId,
  {
    description: string;
    hierarchyId: string;
    highlight: { height: string; left: string; top: string; width: string };
    image: string;
    label: string;
    metrics: Array<{ label: string; tone: string; value: string }>;
    status: string;
    summary: string;
    unitId: SmartSearch3DUnitId;
    zoneIds: SmartSearch3DZoneId[];
  }
> = {
  'line-10': {
    label: 'Line 10',
    status: 'Running',
    hierarchyId: 'plant-columbus-west-area-assembly-unit-a-line-10',
    image: '/images/smart-search-3d/site-overview.png',
    summary: 'Line 10 brings the missing hierarchy step back into the 3D drill-down, so the jump from Unit A to Zone 1 feels operational instead of skipped.',
    description: 'This line-level view keeps the whole production lane visible before the zone cut, which helps anchor the conveyor, inspection, and pack-off flow to the actual line context.',
    highlight: { top: '18%', left: '18%', width: '64%', height: '66%' },
    unitId: 'unit-a',
    zoneIds: ['zone-1', 'zone-2'],
    metrics: [
      { label: 'Primary line', value: 'Line 10', tone: '#2563EB' },
      { label: 'Visible zones', value: '2', tone: '#0F766E' },
      { label: 'Flow state', value: 'Running', tone: '#FF7A00' },
    ],
  },
};

const smartSearch3DSiteHotspots: Array<{
  accent: string;
  activeMetric: string;
  hierarchyId: string;
  label: string;
  left: string;
  status: string;
  subtitle: string;
  top: string;
  zoneId: SmartSearch3DZoneId;
}> = [
  {
    zoneId: 'zone-1',
    label: 'Zone 1',
    subtitle: 'Assembly spine',
    status: 'Running',
    activeMetric: '98% target',
    hierarchyId: 'cw-zone-1',
    top: '52%',
    left: '44%',
    accent: '#16A34A',
  },
  {
    zoneId: 'zone-2',
    label: 'Zone 2',
    subtitle: 'Transport + inspection',
    status: 'Watch',
    activeMetric: '85% target',
    hierarchyId: 'cw-zone-2',
    top: '43%',
    left: '28%',
    accent: '#F59E0B',
  },
  {
    zoneId: 'zone-4',
    label: 'Zone 4',
    subtitle: 'Label + pack-out',
    status: 'Running',
    activeMetric: '95% target',
    hierarchyId: 'cw-line-10',
    top: '55%',
    left: '73%',
    accent: '#16A34A',
  },
  {
    zoneId: 'zone-5',
    label: 'Zone 5',
    subtitle: 'Cooling module',
    status: 'Running',
    activeMetric: '97% target',
    hierarchyId: 'cw-line-10',
    top: '64%',
    left: '59%',
    accent: '#0EA5E9',
  },
];

const smartSearch3DZoneViews: Record<
  SmartSearch3DZoneId,
  {
    description: string;
    highlight: { height: string; left: string; top: string; width: string };
    hierarchyId: string;
    image: string;
    label: string;
    machineIds: SmartSearch3DMachineId[];
    metrics: Array<{ label: string; tone: string; value: string }>;
    status: string;
    summary: string;
  }
> = {
  'zone-1': {
    label: 'Zone 1',
    status: 'Running',
    hierarchyId: 'cw-zone-1',
    image: '/images/smart-search-3d/zone-1-overview.png',
    summary: 'Primary drill-down path for Columbus West with the best Smart Search linkage into line context, documents, and maintenance follow-up.',
    description: 'Zone 1 is where the syringe assembly module, filling head path, and conveyor CV-101 concentrate the live operating signals for this query.',
    highlight: { top: '18%', left: '24%', width: '52%', height: '64%' },
    machineIds: ['syringe-assembly-module', 'conveyor-cv101', 'vision-vi210'],
    metrics: [
      { label: 'Systems in focus', value: '6', tone: '#2563EB' },
      { label: 'Open actions', value: '2', tone: '#E43B46' },
      { label: 'Linked docs', value: '4', tone: '#0F766E' },
    ],
  },
  'zone-2': {
    label: 'Zone 2',
    status: 'Watch',
    hierarchyId: 'cw-zone-2',
    image: '/images/smart-search-3d/zone-2-overview.png',
    summary: 'Transport and inspection corridor with tighter throughput headroom and a narrower diagnostic path than Zone 1.',
    description: 'Zone 2 gives a more linear view of transport and inspection dependencies, so the drill-down is centered on flow continuity and visual verification.',
    highlight: { top: '22%', left: '20%', width: '36%', height: '50%' },
    machineIds: ['vision-vi210', 'conveyor-cv101'],
    metrics: [
      { label: 'Target attainment', value: '85%', tone: '#F59E0B' },
      { label: 'Inspection cells', value: '2', tone: '#2563EB' },
      { label: 'Follow-ups', value: '1', tone: '#E43B46' },
    ],
  },
  'zone-4': {
    label: 'Zone 4',
    status: 'Running',
    hierarchyId: 'cw-line-10',
    image: '/images/smart-search-3d/zone-4-overview.png',
    summary: 'Pack-out side of the line with labeling, release, and carton flow all visible in one frame.',
    description: 'Zone 4 is where the end-of-line story becomes most useful for Smart Search because release readiness, label checks, and pack-off activity are tightly linked.',
    highlight: { top: '18%', left: '56%', width: '34%', height: '58%' },
    machineIds: ['labeling-lm7', 'conveyor-cv101'],
    metrics: [
      { label: 'Release readiness', value: '95%', tone: '#16A34A' },
      { label: 'Linked notifications', value: '2', tone: '#2563EB' },
      { label: 'Escalations', value: '0', tone: '#0F766E' },
    ],
  },
  'zone-5': {
    label: 'Zone 5',
    status: 'Running',
    hierarchyId: 'cw-line-10',
    image: '/images/smart-search-3d/zone-5-overview.png',
    summary: 'Cooling deck and discharge area with a very visual handoff into the machine-level view.',
    description: 'Zone 5 is a good machine-level bridge because the cooling and discharge equipment is physically distinct and easy to recognize during the zoom-in.',
    highlight: { top: '24%', left: '58%', width: '28%', height: '56%' },
    machineIds: ['cooling-pack', 'conveyor-cv101'],
    metrics: [
      { label: 'Cooling assets', value: '2', tone: '#0EA5E9' },
      { label: 'Breakdowns', value: '0', tone: '#16A34A' },
      { label: 'Recent incidents', value: '1', tone: '#E43B46' },
    ],
  },
};

const smartSearch3DMachineViews: Record<
  SmartSearch3DMachineId,
  {
    description: string;
    focusArea: string;
    focusBox: { height: string; left: string; top: string; width: string };
    hierarchyId: string;
    image: string;
    label: string;
    metric: string;
    subtitle: string;
    summary: string;
    tone: string;
    zoneId: SmartSearch3DZoneId;
  }
> = {
  'syringe-assembly-module': {
    zoneId: 'zone-1',
    hierarchyId: 'cw-syringe-assembly-module',
    label: 'Syringe Assembly Module',
    subtitle: 'Zone 1 machine focus',
    image: '/images/smart-search-3d/machine-closeup.png',
    focusArea: 'Assembly cell',
    metric: '98% vs target',
    tone: '#16A34A',
    summary: 'This machine-level view gives the strongest visual jump from the zone and matches the Smart Search asset path the user is already exploring.',
    description: 'Use this step when someone starts at the site, narrows into Zone 1, and then wants the exact module that bundles filling, transport, and conveyor context together.',
    focusBox: { top: '18%', left: '15%', width: '56%', height: '56%' },
  },
  'conveyor-cv101': {
    zoneId: 'zone-1',
    hierarchyId: 'cw-conveyor-cv101',
    label: 'Conveyor CV-101',
    subtitle: 'Transport detail',
    image: '/images/smart-search-3d/machine-wide-closeup.png',
    focusArea: 'Conveyor path',
    metric: 'Bearing watch',
    tone: '#E43B46',
    summary: 'CV-101 is the shortest path between the zone view and the time-series / work-order context already present in Smart Search.',
    description: 'The conveyor focus is where you can make the drill-down feel operational instead of decorative, because it ties straight into the bearing signal and work order.',
    focusBox: { top: '28%', left: '40%', width: '48%', height: '36%' },
  },
  'vision-vi210': {
    zoneId: 'zone-2',
    hierarchyId: 'cw-vision-vi210',
    label: 'Vision Inspection VI-210',
    subtitle: 'Inspection checkpoint',
    image: '/images/smart-search-3d/machine-wide-closeup.png',
    focusArea: 'Inspection gate',
    metric: '2 checks active',
    tone: '#2563EB',
    summary: 'Inspection is a clean machine stop for the drill-down because it keeps the story close to quality signals and release readiness.',
    description: 'This focus gives supervisors a tighter look at the inspection hardware without leaving the Smart Search experience or losing the line narrative.',
    focusBox: { top: '18%', left: '10%', width: '34%', height: '48%' },
  },
  'labeling-lm7': {
    zoneId: 'zone-4',
    hierarchyId: 'cw-labeling-lm7',
    label: 'Labeling Machine LM-7',
    subtitle: 'Pack-out checkpoint',
    image: '/images/smart-search-3d/machine-closeup.png',
    focusArea: 'Label application',
    metric: 'Release ready',
    tone: '#16A34A',
    summary: 'LM-7 is a practical machine stop when the user drills from site into the release side of the line and wants the last controllable checkpoint.',
    description: 'The pack-out drill-down is more about verifying the handoff story than inspecting a failure, so the machine view stays clean and operational.',
    focusBox: { top: '20%', left: '56%', width: '34%', height: '50%' },
  },
  'cooling-pack': {
    zoneId: 'zone-5',
    hierarchyId: 'cw-transport-system',
    label: 'Cooling Pack',
    subtitle: 'Thermal conditioning cell',
    image: '/images/smart-search-3d/zone-5-overview.png',
    focusArea: 'Cooling deck',
    metric: 'Stable',
    tone: '#0EA5E9',
    summary: 'The cooling pack gives you a visually distinct machine endpoint for the zoom-in and works well as a zone-to-machine moment.',
    description: 'This is the best machine stop for Zone 5 because the twin fans and deck layout make the jump in scale obvious to the user.',
    focusBox: { top: '34%', left: '2%', width: '40%', height: '44%' },
  },
};

function resolveSmartSearch3DNavigationState(hierarchyId: string): {
  areaId: SmartSearch3DAreaId;
  lineId: SmartSearch3DLineId;
  unitId: SmartSearch3DUnitId;
  level: SmartSearch3DDrillLevel;
  machineId: SmartSearch3DMachineId;
  zoneId: SmartSearch3DZoneId;
} {
  const matchedMachineEntry = Object.entries(smartSearch3DMachineViews).find(([, machine]) => machine.hierarchyId === hierarchyId);
  if (matchedMachineEntry) {
    const [machineId, machine] = matchedMachineEntry;
    return {
      areaId: 'area-a',
      lineId: 'line-10',
      unitId: 'unit-a',
      level: 'machine',
      machineId: machineId as SmartSearch3DMachineId,
      zoneId: machine.zoneId,
    };
  }

  const matchedZoneEntry = Object.entries(smartSearch3DZoneViews).find(([, zone]) => zone.hierarchyId === hierarchyId);
  if (matchedZoneEntry) {
    const [zoneId, zone] = matchedZoneEntry;
    return {
      areaId: 'area-a',
      lineId: 'line-10',
      unitId: 'unit-a',
      level: 'zone',
      zoneId: zoneId as SmartSearch3DZoneId,
      machineId: zone.machineIds[0],
    };
  }

  const matchedAreaEntry = Object.entries(smartSearch3DAreaViews).find(([, area]) => area.hierarchyId === hierarchyId);
  if (matchedAreaEntry) {
    const [areaId, area] = matchedAreaEntry;
    return {
      areaId: areaId as SmartSearch3DAreaId,
      lineId: 'line-10',
      unitId: area.unitId,
      level: 'area',
      zoneId: smartSearch3DUnitViews[area.unitId].zoneIds[0],
      machineId: smartSearch3DZoneViews[smartSearch3DUnitViews[area.unitId].zoneIds[0]].machineIds[0],
    };
  }

  const matchedUnitEntry = Object.entries(smartSearch3DUnitViews).find(([, unit]) => unit.hierarchyId === hierarchyId);
  if (matchedUnitEntry) {
    const [unitId, unit] = matchedUnitEntry;
    return {
      areaId: 'area-a',
      lineId: 'line-10',
      unitId: unitId as SmartSearch3DUnitId,
      level: 'unit',
      zoneId: unit.zoneIds[0],
      machineId: smartSearch3DZoneViews[unit.zoneIds[0]].machineIds[0],
    };
  }

  const matchedLineEntry = Object.entries(smartSearch3DLineViews).find(([, line]) => (
    line.hierarchyId === hierarchyId || hierarchyId === 'cw-line-10'
  ));
  if (matchedLineEntry) {
    const [lineId, line] = matchedLineEntry;
    return {
      areaId: 'area-a',
      lineId: lineId as SmartSearch3DLineId,
      unitId: line.unitId,
      level: 'line',
      zoneId: line.zoneIds[0],
      machineId: smartSearch3DZoneViews[line.zoneIds[0]].machineIds[0],
    };
  }

  if (
    hierarchyId === 'cw-zone-1'
    || hierarchyId === 'zone-cw-assembly-a-10-final'
  ) {
    return {
      areaId: 'area-a',
      lineId: 'line-10',
      unitId: 'unit-a',
      level: 'zone',
      zoneId: 'zone-1',
      machineId: smartSearch3DZoneViews['zone-1'].machineIds[0],
    };
  }

  if (hierarchyId === 'cw-zone-2') {
    return {
      areaId: 'area-a',
      lineId: 'line-10',
      unitId: 'unit-a',
      level: 'zone',
      zoneId: 'zone-2',
      machineId: smartSearch3DZoneViews['zone-2'].machineIds[0],
    };
  }

  if (hierarchyId === 'plant-columbus-west-area-assembly') {
    return {
      areaId: 'area-a',
      lineId: 'line-10',
      unitId: 'unit-a',
      level: 'area',
      zoneId: smartSearch3DUnitViews['unit-a'].zoneIds[0],
      machineId: smartSearch3DZoneViews[smartSearch3DUnitViews['unit-a'].zoneIds[0]].machineIds[0],
    };
  }

  if (
    hierarchyId === 'plant-columbus-west-area-assembly-unit-a'
  ) {
    return {
      areaId: 'area-a',
      lineId: 'line-10',
      unitId: 'unit-a',
      level: 'unit',
      zoneId: smartSearch3DUnitViews['unit-a'].zoneIds[0],
      machineId: smartSearch3DZoneViews['zone-1'].machineIds[0],
    };
  }

  if (hierarchyId === 'plant-columbus-west-area-assembly-unit-a-line-10') {
    return {
      areaId: 'area-a',
      lineId: 'line-10',
      unitId: 'unit-a',
      level: 'line',
      zoneId: smartSearch3DLineViews['line-10'].zoneIds[0],
      machineId: smartSearch3DZoneViews[smartSearch3DLineViews['line-10'].zoneIds[0]].machineIds[0],
    };
  }

  return {
    areaId: 'area-a',
    lineId: 'line-10',
    unitId: 'unit-a',
    level: 'site',
    zoneId: 'zone-1',
    machineId: smartSearch3DZoneViews['zone-1'].machineIds[0],
  };
}

const defaultTimeSeriesLabels = ['12:20 PM', '12:45 PM', '01:10 PM', '01:35 PM', '02:00 PM', '02:25 PM', '02:50 PM', '03:15 PM', '03:40 PM', '04:15 PM'];
const smartSearchCategoryDisplayLabels: Record<SmartSearchCategory, string> = {
  All: 'ALL',
  Documents: 'DOCUMENT',
  'Tasks & Work Orders': 'TASKS & WO',
  Notifications: 'NOTIFICATION',
  Trainings: 'TRAININGS',
  Assets: 'ASSETS',
  'Time Series': 'TIMESERIES DATA',
  '3D': '3D VIEW',
  'Action Tracking': 'ACTION TRACKING',
  ESO: 'ESO',
  'Shift Notes': 'SHIFT NOTES',
};

function getHierarchyNodeMeta(node: SmartSearchHierarchyNode) {
  switch (node.kind) {
    case 'global':
      return 'Enterprise hierarchy';
    case 'region':
      return 'Regional network';
    case 'plant':
    case 'site':
      return 'Manufacturing site';
    case 'area':
      return 'Operational area';
    case 'unit':
      return 'Production unit';
    case 'line':
      return 'Manufacturing line';
    case 'zone':
      return 'Line zone';
    default:
      return undefined;
  }
}

function cloneSmartSearchNode(node: SmartSearchHierarchyNode): SmartSearchHierarchyNode {
  return {
    ...node,
    children: node.children?.map((child) => cloneSmartSearchNode(child)),
  };
}

function mapHeaderHierarchyNode(node: {children?: any[]; id: string; kind: SmartSearchHierarchyNode['kind']; label: string}): SmartSearchHierarchyNode {
  const mappedChildren = node.children?.map((child) => mapHeaderHierarchyNode(child)) ?? [];
  const detailChildren = node.id === 'zone-cw-assembly-a-10-final'
    ? columbusZone1DetailChildren.map((child) => cloneSmartSearchNode(child))
    : [];
  const children = [...mappedChildren, ...detailChildren].filter((child, index, collection) => (
    collection.findIndex((candidate) => candidate.id === child.id) === index
  ));

  return {
    id: node.id,
    kind: node.kind,
    label: node.label,
    meta: getHierarchyNodeMeta(node as SmartSearchHierarchyNode),
    children,
  };
}

const columbusHierarchyNodeDetails: Record<string, { metrics: Array<{label: string; tone: string; value: string}>; summary: string; title: string }> = {
  'cw-global': {
    title: 'BD Global',
    summary: 'Global hierarchy entry point with Columbus West selected as the active site context for this Smart Search session.',
    metrics: [
      { label: 'Sites in view', value: '128', tone: '#00C2EC' },
      { label: 'Active region', value: 'Americas', tone: '#1D74FF' },
      { label: 'Focused site', value: 'Columbus West', tone: '#FF7A00' },
    ],
  },
  'cw-americas': {
    title: 'Americas Region',
    summary: 'Regional hierarchy narrowed to Columbus West, with Area A and Zone 1 expanded as the most relevant operating path.',
    metrics: [
      { label: 'Sites in region', value: '24', tone: '#00C2EC' },
      { label: 'Focused line', value: 'Line 10', tone: '#1D74FF' },
      { label: 'Escalation path', value: 'Zone 1', tone: '#FF7A00' },
    ],
  },
  'cw-site': {
    title: 'Columbus West Site',
    summary: 'Largest and longest established BD manufacturing site with a live focus on Area A recovery and line stability.',
    metrics: [
      { label: 'Facility Size', value: '580K sq ft', tone: '#00C2EC' },
      { label: 'Associates', value: '1,300+', tone: '#1D74FF' },
      { label: 'Site Since', value: '1949', tone: '#FF7A00' },
    ],
  },
  'cw-area-a': {
    title: 'Area A Overview',
    summary: 'Area A is carrying the most important syringe assembly throughput and is the primary source of todayâ€™s follow-up actions.',
    metrics: [
      { label: 'Open actions', value: '6', tone: '#E43B46' },
      { label: 'Live products', value: '21', tone: '#00C2EC' },
      { label: 'Shift coverage', value: 'Stable', tone: '#16A34A' },
    ],
  },
  'cw-line-10': {
    title: 'Line 10 Focus',
    summary: 'Line 10 is the active drill-down path from Columbus West with strong document, task, and asset coverage in Smart Search.',
    metrics: [
      { label: 'OEE', value: '72%', tone: '#E43B46' },
      { label: 'Linked docs', value: '18', tone: '#1D74FF' },
      { label: 'Open tasks', value: '4', tone: '#FF7A00' },
    ],
  },
  'cw-zone-1': {
    title: 'Zone 1 Detail',
    summary: 'Zone 1 contains the syringe assembly path, filling system, and the CV-101 conveyor chain that is driving todayâ€™s search context.',
    metrics: [
      { label: 'Systems in zone', value: '6', tone: '#00C2EC' },
      { label: 'Selected module', value: 'Syringe Assembly', tone: '#1D74FF' },
      { label: 'Work orders', value: '2 open', tone: '#FF7A00' },
    ],
  },
  'cw-syringe-assembly-module': {
    title: 'Syringe Assembly Module',
    summary: 'The selected module matches the zone hierarchy from the reference: filling, transport, conveyor, vision, labeling, and cartoning all roll up here.',
    metrics: [
      { label: 'Nested systems', value: '6', tone: '#00C2EC' },
      { label: 'At-risk asset', value: 'Drive Bearing', tone: '#E43B46' },
      { label: 'Work orders', value: '2 open', tone: '#FF7A00' },
    ],
  },
  'cw-filling-system': {
    title: 'Filling System',
    summary: 'Filling is the most detailed process branch inside the module and is where the drive-bearing context now lives.',
    metrics: [
      { label: 'Sub-assemblies', value: '1', tone: '#1D74FF' },
      { label: 'Tracked assets', value: '4', tone: '#00C2EC' },
      { label: 'Escalation', value: 'Watch', tone: '#E43B46' },
    ],
  },
  'cw-filling-head-assembly': {
    title: 'Filling Head Assembly',
    summary: 'This nested assembly contains the detailed asset tree shown in the reference, including Servo Motor, Nozzle Cluster, Drive Bearing, and Dosing Pump Module.',
    metrics: [
      { label: 'Assets', value: '4', tone: '#00C2EC' },
      { label: 'Selected issue', value: 'Drive Bearing', tone: '#E43B46' },
      { label: 'Trend', value: 'Watch', tone: '#FF7A00' },
    ],
  },
  'cw-drive-bearing': {
    title: 'Drive Bearing',
    summary: 'The selected asset is linked to vibration follow-up, work order activity, and a recovery note for the next leadership review.',
    metrics: [
      { label: 'Health', value: 'Watch', tone: '#E43B46' },
      { label: 'At-risk asset', value: 'Drive Bearing', tone: '#E43B46' },
      { label: 'Trend delta', value: '+6.8%', tone: '#FF7A00' },
      { label: 'Next step', value: 'Inspect today', tone: '#1D74FF' },
    ],
  },
};

const columbusHierarchyNodeCountMap: Record<string, number> = {
  'cw-global': 128,
  'cw-americas': 24,
  'cw-site': 6,
  'cw-area-a': 4,
  'cw-unit-a': 2,
  'cw-line-10': 12,
  'cw-zone-1': 6,
  'cw-syringe-assembly-module': 8,
  'cw-filling-system': 4,
  'cw-filling-head-assembly': 4,
  'cw-servo-motor': 2,
  'cw-nozzle-cluster': 3,
  'cw-drive-bearing': 5,
  'cw-dosing-pump-module': 2,
  'cw-transport-system': 3,
  'cw-conveyor-cv101': 5,
  'cw-vision-vi210': 2,
};
const smartSearchHierarchyCountMap: Record<string, number> = {
  ...headerHierarchyCountMap,
  ...columbusHierarchyNodeCountMap,
};

function findSmartSearchHierarchyNode(node: SmartSearchHierarchyNode, targetId: string): SmartSearchHierarchyNode | null {
  if (node.id === targetId) return node;
  for (const child of node.children ?? []) {
    const found = findSmartSearchHierarchyNode(child, targetId);
    if (found) return found;
  }
  return null;
}

function findSmartSearchHierarchyPath(node: SmartSearchHierarchyNode, targetId: string, trail: SmartSearchHierarchyNode[] = []): SmartSearchHierarchyNode[] | null {
  const nextTrail = [...trail, node];
  if (node.id === targetId) return nextTrail;
  for (const child of node.children ?? []) {
    const foundPath = findSmartSearchHierarchyPath(child, targetId, nextTrail);
    if (foundPath) return foundPath;
  }
  return null;
}

function getGenericHierarchyDetail(node: SmartSearchHierarchyNode, path: SmartSearchHierarchyNode[]) {
  const lineage = path.map((entry) => entry.label).join(' / ');
  const childCount = node.children?.length ?? 0;
  const isColumbusScope = path.some((entry) => entry.id === 'plant-columbus-west');
  const customColumbusDetail = columbusHierarchyNodeDetails[node.id];

  if (customColumbusDetail) {
    return customColumbusDetail;
  }

  if (node.id === 'plant-columbus-west') {
    return {
      title: 'Columbus West Site',
      summary: 'Largest and longest established BD manufacturing site with a live focus on Area A recovery and line stability.',
      metrics: [
        {label: 'Facility Size', value: '580K sq ft', tone: '#00C2EC'},
        {label: 'Associates', value: '1,300+', tone: '#1D74FF'},
        {label: 'Site Since', value: '1949', tone: '#FF7A00'},
      ],
    };
  }

  if (node.id === 'plant-columbus-west-area-assembly') {
    return {
      title: 'Area A Overview',
      summary: 'Area A is carrying the most important syringe assembly throughput and is the primary source of today\'s follow-up actions.',
      metrics: [
        {label: 'Open actions', value: '6', tone: '#E43B46'},
        {label: 'Live products', value: '21', tone: '#00C2EC'},
        {label: 'Shift coverage', value: 'Stable', tone: '#16A34A'},
      ],
    };
  }

  if (node.id === 'plant-columbus-west-area-assembly-unit-a-line-10') {
    return {
      title: 'Line 10 Focus',
      summary: 'Line 10 is the active drill-down path from Columbus West with strong document, task, and asset coverage in Smart Search.',
      metrics: [
        {label: 'OEE', value: '72%', tone: '#E43B46'},
        {label: 'Linked docs', value: '18', tone: '#1D74FF'},
        {label: 'Open tasks', value: '4', tone: '#FF7A00'},
      ],
    };
  }

  if (node.id === 'zone-cw-assembly-a-10-final') {
    return {
      title: 'Zone 1 Detail',
      summary: 'Zone 1 contains the syringe assembly path, filling sequence, and the operating context driving this Smart Search result set.',
      metrics: [
        {label: 'Zone assets', value: '6', tone: '#00C2EC'},
        {label: 'Focused module', value: 'Assembly', tone: '#1D74FF'},
        {label: 'Work orders', value: '2 open', tone: '#FF7A00'},
      ],
    };
  }

  return {
    title: node.kind === 'global' ? node.label : `${node.label}${node.kind === 'plant' ? ' Site' : ''}`,
    summary: isColumbusScope
      ? `${lineage} is active in Smart Search. Use the hierarchy to move across site, area, line, and zone context while keeping the current result set in view.`
      : `${lineage} is available in the shared BD hierarchy and can be used to pivot the current Smart Search context.`,
    metrics: [
      {label: 'Node type', value: node.kind[0].toUpperCase() + node.kind.slice(1), tone: '#1D74FF'},
      {label: 'Children', value: String(childCount), tone: '#00C2EC'},
      {label: 'Scope', value: path.find((entry) => entry.kind === 'plant')?.label ?? 'BD Global', tone: '#FF7A00'},
    ],
  };
}

function getColumbusResultsNarrative(nodeId: string) {
  switch (nodeId) {
    case 'plant-columbus-west':
      return 'Scanning site story, leadership coverage, and product footprint for Columbus West.';
    case 'plant-columbus-west-area-assembly':
    case 'plant-columbus-west-area-assembly-unit-a':
      return 'Narrowing BLU.AI context to Area A operating signals, recovery actions, and leadership handoff.';
    case 'plant-columbus-west-area-assembly-unit-a-line-10':
      return 'Linking Line 10 documents, active work orders, and live performance signals for this search.';
    case 'zone-cw-assembly-a-10-final':
      return 'Highlighting Zone 1 assets, timeseries, and task follow-up linked to the current search.';
    case 'cw-syringe-assembly-module':
      return 'Tracing the Syringe Assembly Module across filling, conveyor, inspection, and pack-out systems.';
    case 'cw-filling-system':
      return 'Connecting filling system anomalies, support documents, and response actions.';
    case 'cw-filling-head-assembly':
      return 'Surfacing the filling head assembly components most related to reliability and throughput.';
    case 'cw-drive-bearing':
      return 'BLU.AI is correlating vibration risk, related work orders, and maintenance guidance for Drive Bearing.';
    default:
      return 'Refreshing BLU.AI context for the selected hierarchy scope.';
  }
}

const columbusEnterpriseDocumentGroups = [
  {
    folderPath: ['BD Global', 'Americas', 'Columbus West', 'Area A', 'Line 10', 'Site Documents'],
    location: 'Columbus West',
    plant: 'Area A / Line 10',
    source: 'Global Operations',
    docs: [
      { fileType: 'PDF', title: 'Columbus West Site Profile & Operating Story', summary: 'Narrative summary of the site footprint, network role, leadership structure, and current operating profile across Area A and Line 10.' },
      { fileType: 'PPT', title: 'Line 10 Daily Leadership Brief Deck', summary: 'Leadership-ready presentation covering output, losses, staffing, and top actions for the current operating window.' },
      { fileType: 'XLS', title: 'Area A Weekly Operating Scorecard', summary: 'Weekly site-level scorecard with throughput, scrap, downtime, labor, and recovery trend measures for Area A.' },
      { fileType: 'PDF', title: 'Columbus West Network Role Overview', summary: 'High-level operating overview describing how Columbus West supports the broader BD manufacturing network.' },
    ],
  },
  {
    folderPath: ['BD Global', 'Americas', 'Columbus West', 'Area A', 'SOPs', 'Filling'],
    location: 'Area A',
    plant: 'Line 10 / Filling',
    source: 'Manufacturing Engineering',
    docs: [
      { fileType: 'PDF', title: 'SOP-100 Fill Needle Setup and Verification', summary: 'Standard procedure for preparing, verifying, and releasing the filling sequence for production startup.' },
      { fileType: 'DOC', title: 'SOP-104 Fill Weight Escalation Procedure', summary: 'Escalation workflow to follow when fill weight trends drift outside control plan limits.' },
      { fileType: 'XLS', title: 'Filling Centerline Audit Checklist', summary: 'Checklist used by line leaders and engineers to confirm centerline adherence at startup and changeover.' },
      { fileType: 'PDF', title: 'Product Contact Path Sanitation SOP', summary: 'Required sanitation and verification steps for product-contact components in the filling path.' },
      { fileType: 'PNG', title: 'Filling Nozzle Visual Inspection Standard', summary: 'Visual inspection board showing acceptable versus unacceptable nozzle conditions before run release.' },
    ],
  },
  {
    folderPath: ['BD Global', 'Americas', 'Columbus West', 'Area A', 'SOPs', 'Packaging'],
    location: 'Area A',
    plant: 'Line 10 / Packaging',
    source: 'Packaging Operations',
    docs: [
      { fileType: 'PDF', title: 'Packaging Line Clearance SOP', summary: 'Line clearance sequence for packaging operations, including label removal, visual checks, and release approvals.' },
      { fileType: 'DOC', title: 'Cartoner Reject Handling Procedure', summary: 'Instructions for handling reject streams and documenting exceptions at the cartoner and downstream pack-out.' },
      { fileType: 'XLS', title: 'Packaging Material Reconciliation Log', summary: 'Reconciliation template for cartons, inserts, labels, and serialized packaging components by batch.' },
      { fileType: 'PDF', title: 'Label Verification and Print Readiness SOP', summary: 'Process for verifying print templates, barcode quality, and label readiness before release.' },
    ],
  },
  {
    folderPath: ['BD Global', 'Americas', 'Columbus West', 'Area A', 'Work Instructions', 'Zone 1'],
    location: 'Area A',
    plant: 'Line 10 / Zone 1',
    source: 'Operations Excellence',
    docs: [
      { fileType: 'DOC', title: 'WI-210 Zone 1 Startup Sequence', summary: 'Operator work instruction describing the startup order for conveyor, filling, inspection, and pack-out systems.' },
      { fileType: 'PDF', title: 'WI-214 CV-101 Jam Recovery Guide', summary: 'Step-by-step work instruction for recovering from jams and blocked transfers at CV-101.' },
      { fileType: 'PNG', title: 'Zone 1 Escalation Andon Board Layout', summary: 'Visual artifact showing andon ownership, escalation tiers, and response expectations for Zone 1 issues.' },
      { fileType: 'DOC', title: 'WI-219 Vision Inspection Changeover Steps', summary: 'Detailed changeover steps for inspection recipe verification and camera alignment during product changeover.' },
      { fileType: 'TXT', title: 'Zone 1 Shift Handover Notes Template', summary: 'Template used by teams to record shift-critical notes, watch items, and follow-up actions for Zone 1.' },
    ],
  },
  {
    folderPath: ['BD Global', 'Americas', 'Columbus West', 'Area A', 'Equipment Manuals', 'Conveyors'],
    location: 'Area A',
    plant: 'Line 10 / Conveyor Systems',
    source: 'OEM Manuals',
    docs: [
      { fileType: 'PDF', title: 'CV-101 Conveyor OEM Maintenance Manual', summary: 'Original equipment manual with lubrication maps, exploded views, spare parts, and service procedures.' },
      { fileType: 'DWG', title: 'CV-101 Conveyor Assembly Drawing', summary: 'Mechanical assembly drawing for the CV-101 conveyor support frame, bearings, and tension system.' },
      { fileType: 'PDF', title: 'Drive Bearing Replacement Procedure', summary: 'Service instruction for replacing the conveyor drive bearing and verifying alignment after installation.' },
      { fileType: 'JPG', title: 'Conveyor Lubrication Point Identification Board', summary: 'Visual reference image showing all conveyor lubrication points and inspection zones.' },
    ],
  },
  {
    folderPath: ['BD Global', 'Americas', 'Columbus West', 'Area A', 'Equipment Manuals', 'Inspection', 'VI-210'],
    location: 'Area A',
    plant: 'Line 10 / Vision Inspection',
    source: 'Quality Engineering',
    docs: [
      { fileType: 'PDF', title: 'VI-210 Inspection System User Manual', summary: 'User manual for the vision inspection platform covering recipe setup, alarm handling, and verification checks.' },
      { fileType: 'DOC', title: 'Camera Calibration Work Instruction', summary: 'Instruction for camera alignment, focus checks, and reference image confirmation during calibration.' },
      { fileType: 'XLS', title: 'Inspection Defect Code Matrix', summary: 'Matrix of defect codes, severity, reject routing rules, and downstream quality responses.' },
      { fileType: 'PNG', title: 'Vision Fault Recovery Screen Guide', summary: 'Screen guide for operators to quickly interpret common vision system faults and next steps.' },
    ],
  },
  {
    folderPath: ['BD Global', 'Americas', 'Columbus West', 'Area A', 'Maintenance', 'Preventive', 'Zone 1'],
    location: 'Area A',
    plant: 'Line 10 / Zone 1',
    source: 'Reliability',
    docs: [
      { fileType: 'PDF', title: 'PM-310 Weekly Conveyor Inspection Route', summary: 'Preventive maintenance route covering conveyor wear points, chain condition, and support path checks.' },
      { fileType: 'XLS', title: 'Zone 1 PM Completion Tracker', summary: 'Completion tracker for weekly and monthly preventive maintenance tasks in Zone 1.' },
      { fileType: 'DOC', title: 'Lubrication Standard For Drive Bearing Assemblies', summary: 'Standard for lubricant type, interval, amount, and contamination controls for drive bearing assemblies.' },
      { fileType: 'PDF', title: 'Critical Spare Parts Storage Procedure', summary: 'Storage and handling standard for critical spares to prevent damage, mix-up, or premature degradation.' },
      { fileType: 'CSV', title: 'Zone 1 Condition Monitoring Export', summary: 'Condition monitoring export file used by reliability engineers to trend vibration and temperature signals.' },
    ],
  },
  {
    folderPath: ['BD Global', 'Americas', 'Columbus West', 'Area A', 'Quality', 'Deviation Reviews', '2026'],
    location: 'Area A',
    plant: 'Line 10 / Quality',
    source: 'Quality Systems',
    docs: [
      { fileType: 'PDF', title: 'Deviation Review - Fill Weight Drift April 2026', summary: 'Deviation review summarizing investigation findings, containment, and product impact from fill weight drift.' },
      { fileType: 'DOC', title: 'Deviation Review - Vision False Reject Cluster', summary: 'Review of repeated false rejects on VI-210, including evidence trail and corrective actions.' },
      { fileType: 'XLS', title: 'Open NCR Aging Report - Line 10', summary: 'Open nonconformance aging report filtered to the current Line 10 quality queue.' },
      { fileType: 'PDF', title: 'Product Hold Release Decision Memo', summary: 'Decision memo documenting quality rationale, required approvals, and release conditions for held product.' },
    ],
  },
  {
    folderPath: ['BD Global', 'Americas', 'Columbus West', 'Area A', 'Validation', 'IQ OQ PQ', 'Line 10'],
    location: 'Area A',
    plant: 'Line 10 / Validation',
    source: 'Validation',
    docs: [
      { fileType: 'PDF', title: 'Line 10 OQ Protocol - Conveyor and Filling Path', summary: 'Operational qualification protocol covering conveyor sequencing, fill path stability, and alarm verification.' },
      { fileType: 'DOC', title: 'PQ Sampling Plan For Zone 1', summary: 'Performance qualification sampling plan defining sample points, acceptance criteria, and review cadence.' },
      { fileType: 'XLS', title: 'Validation Traceability Matrix - Line 10', summary: 'Traceability matrix linking requirements, tests, evidence packages, and final sign-off items.' },
      { fileType: 'PDF', title: 'IQ Checklist For Vision And Cartoner Interlocks', summary: 'Installation qualification checklist for inspection and cartoner interlocks in the line-level control scope.' },
      { fileType: 'PPT', title: 'Validation Readiness Review Pack', summary: 'Review pack used to align validation, operations, and quality before formal execution.' },
    ],
  },
  {
    folderPath: ['BD Global', 'Americas', 'Columbus West', 'Area A', 'Training', 'Operator Qualification', 'Line 10'],
    location: 'Area A',
    plant: 'Line 10 / Training',
    source: 'Learning And Development',
    docs: [
      { fileType: 'PDF', title: 'Operator Qualification Matrix - Line 10', summary: 'Matrix showing qualified operators by role, station, product family, and recertification due date.' },
      { fileType: 'PPT', title: 'Zone 1 Operator Onboarding Module', summary: 'Training module used to onboard operators into the Zone 1 process flow and escalation expectations.' },
      { fileType: 'DOC', title: 'Trainer Guide - Filling Path Fundamentals', summary: 'Trainer-facing guide for delivering core training on filling path operation and abnormality response.' },
      { fileType: 'XLS', title: 'Recertification Due List - Area A', summary: 'Rolling recertification tracker for operators, technicians, and leads working in Area A.' },
    ],
  },
  {
    folderPath: ['BD Global', 'Americas', 'Columbus West', 'Area A', 'Engineering Drawings', 'Mechanical', 'Line 10'],
    location: 'Area A',
    plant: 'Line 10 / Engineering',
    source: 'Engineering',
    docs: [
      { fileType: 'DWG', title: 'Line 10 Mechanical Layout Revision F', summary: 'Mechanical layout drawing showing the current equipment arrangement, service zones, and support structures.' },
      { fileType: 'DWG', title: 'Zone 1 Conveyor Support Bracket Detail', summary: 'Detailed drawing for the support bracket geometry, tolerances, and material requirements.' },
      { fileType: 'PDF', title: 'Engineering Change Summary - Guarding Updates', summary: 'Engineering change summary for updated guarding, operator reach zones, and maintenance access improvements.' },
      { fileType: 'PNG', title: 'Annotated Zone 1 Mechanical Walkdown Snapshot', summary: 'Annotated image from the latest walkdown used to reference current as-built mechanical conditions.' },
      { fileType: 'CAD', title: 'Line 10 Pack-Out Cell 3D Model Index', summary: 'Index of available 3D engineering models for the pack-out cell and linked equipment families.' },
    ],
  },
  {
    folderPath: ['BD Global', 'Americas', 'Columbus West', 'Area A', 'Projects', 'Line 10 Expansion', 'Phase 2'],
    location: 'Area A',
    plant: 'Line 10 / Projects',
    source: 'Project Management Office',
    docs: [
      { fileType: 'PPT', title: 'Phase 2 Project Charter - Line 10 Expansion', summary: 'Project charter defining scope, stakeholders, timing, risks, and expected operating benefits.' },
      { fileType: 'XLS', title: 'Capital Spend Tracker - Expansion Phase 2', summary: 'Capital tracker covering purchase orders, received assets, accruals, and forecast variance.' },
      { fileType: 'PDF', title: 'URS For Additional Inspection Capacity', summary: 'User requirements specification for the added inspection capacity planned in the expansion.' },
      { fileType: 'DOC', title: 'Construction Readiness Checklist', summary: 'Checklist used to coordinate operations, engineering, EHS, and contractors before field execution.' },
    ],
  },
  {
    folderPath: ['BD Global', 'Americas', 'Columbus West', 'Area A', 'CAPA', 'Open', 'Line 10'],
    location: 'Area A',
    plant: 'Line 10 / CAPA',
    source: 'Quality Systems',
    docs: [
      { fileType: 'PDF', title: 'CAPA-2026-014 Conveyor Support Path Investigation', summary: 'Open CAPA documenting repeated support path instability and related containment actions.' },
      { fileType: 'DOC', title: 'CAPA-2026-021 Vision Recipe Governance Update', summary: 'Open CAPA package for strengthening recipe control, approval flow, and release verification.' },
      { fileType: 'XLS', title: 'CAPA Effectiveness Review Schedule', summary: 'Effectiveness review plan showing due dates, owners, and evidence requirements for open CAPAs.' },
    ],
  },
  {
    folderPath: ['BD Global', 'Americas', 'Columbus West', 'Area A', 'Audits', 'Internal', '2026'],
    location: 'Area A',
    plant: 'Line 10 / Audit',
    source: 'Compliance',
    docs: [
      { fileType: 'PDF', title: 'Internal Audit Report - Line 10 Documentation Control', summary: 'Internal audit report covering document control execution, training evidence, and approval records.' },
      { fileType: 'DOC', title: 'Audit Observation Response Plan - Zone 1', summary: 'Response plan for internal audit observations related to Zone 1 documentation and escalation evidence.' },
      { fileType: 'XLS', title: 'Audit Action Log - Area A', summary: 'Action log used to track audit findings, owners, milestones, and closure evidence across Area A.' },
    ],
  },
] as const;

function getColumbusDocumentHierarchyId(folderPath: readonly string[]) {
  const pathText = folderPath.join(' ').toLowerCase();
  if (pathText.includes('zone 1')) return 'zone-cw-assembly-a-10-final';
  if (pathText.includes('line 10')) return 'plant-columbus-west-area-assembly-unit-a-line-10';
  if (pathText.includes('area a')) return 'plant-columbus-west-area-assembly';
  return 'plant-columbus-west';
}

const columbusEnterpriseDocuments = columbusEnterpriseDocumentGroups.flatMap((group, groupIndex) =>
  group.docs.map((doc, docIndex) => {
    const statusCycle = ['Relevant', 'Recommended', 'Reference'];
    const toneCycle = ['#044ED7', '#0ea5e9', '#2563EB', '#0F766E'];
    const updateCycle = ['Updated today', 'Updated yesterday', 'Updated 3 days ago', 'Updated last week'];
    const folderLeaf = group.folderPath[group.folderPath.length - 1];
    return {
      id: `cw-doc-${groupIndex + 1}-${docIndex + 1}`,
      category: 'Documents',
      kind: 'document',
      fileType: doc.fileType,
      thumbnail: doc.fileType === 'DWG' || doc.fileType === 'CAD' ? '/images/Line1.png' : doc.fileType === 'PNG' || doc.fileType === 'JPG' ? '/images/site-view.png' : '/images/maquina-fabrica.png',
      title: doc.title,
      subtitle: `${doc.fileType} - ${group.source} - Columbus West`,
      summary: doc.summary,
      status: statusCycle[(groupIndex + docIndex) % statusCycle.length],
      tone: toneCycle[(groupIndex + docIndex) % toneCycle.length],
      metric: `${4 + ((groupIndex + docIndex) % 6)} indexed matches`,
      secondaryMetric: updateCycle[(groupIndex + docIndex) % updateCycle.length],
      location: group.location,
      plant: group.plant,
      updated: updateCycle[(groupIndex + docIndex) % updateCycle.length],
      keywords: [
        'columbus west',
        'area a',
        'line 10',
        folderLeaf.toLowerCase(),
        doc.fileType.toLowerCase(),
        ...doc.title.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean).slice(0, 6),
      ],
      detail: {
        summary: doc.summary,
        hierarchyId: getColumbusDocumentHierarchyId(group.folderPath),
        folderPath: [...group.folderPath],
        highlights: [
          `Repository folder: ${folderLeaf}.`,
          `Source system owner: ${group.source}.`,
          'Document is indexed for Smart Search folder browsing and content retrieval.',
        ],
      },
    };
  })
);

const columbusSiteSearchData = {
  /* Documents: [
    {
      id: 'cw-doc-site-profile',
      category: 'Documents',
      kind: 'document',
      fileType: 'PDF',
      thumbnail: '/images/site-view.png',
      title: 'Columbus West Site Profile & Operating Story',
      subtitle: 'PDF â€¢ Global Operations â€¢ Columbus West',
      summary: 'Narrative summary of the site footprint, network role, leadership structure, and current operating profile across Area A and Line 10.',
      status: 'Relevant',
      tone: '#044ED7',
      metric: '6 highlighted sections',
      secondaryMetric: 'Updated 3 days ago',
      location: 'Columbus West',
      plant: 'Area A / Line 10',
      updated: 'Updated 3 days ago',
      keywords: ['columbus west', 'site profile', 'area a', 'line 10', 'zone 1'],
      detail: {
        summary: 'The profile explains how Columbus West supports the wider BD network, the current recovery narrative, and the escalation path for Area A.',
        hierarchyId: 'plant-columbus-west-area-assembly-unit-a-line-10',
        folderPath: ['BD Global', 'Americas', 'Columbus West', 'Area A', 'Line 10', 'Site Documents'],
        highlights: [
          'Area A is the key syringe assembly footprint in the site recovery story.',
          'Line 10 is the preferred drill-down when leadership needs immediate operating context.',
          'Zone 1 carries the most actionable line-level search context today.',
        ],
      },
    },
    {
      id: 'cw-doc-zone-1-architecture',
      category: 'Documents',
      kind: 'document',
      fileType: 'DOC',
      thumbnail: '/images/Line1.png',
      title: 'Zone 1 Equipment Architecture - Line 10',
      subtitle: 'DOC â€¢ Manufacturing Engineering â€¢ Columbus West',
      summary: 'Structured breakdown of the filling system, conveyor, inspection, labeling, and cartoning flow inside Zone 1.',
      status: 'Recommended',
      tone: '#0ea5e9',
      metric: '5 subsystems',
      secondaryMetric: 'Updated yesterday',
      location: 'Area A',
      plant: 'Line 10 / Zone 1',
      updated: 'Updated yesterday',
      keywords: ['zone 1', 'line 10', 'equipment architecture', 'filling system', 'conveyor'],
      detail: {
        summary: 'This document maps how product moves through Zone 1 and identifies the systems that should be reviewed first when output or quality slips.',
        hierarchyId: 'zone-cw-assembly-a-10-final',
        folderPath: ['BD Global', 'Americas', 'Columbus West', 'Area A', 'Line 10', 'Site Documents'],
        highlights: [
          'CV-101 is the entry conveyor feeding the filling and assembly sequence.',
          'Vision Inspection VI-210 is the first downstream quality gate.',
          'Cartoner CT-32 is the final pack-out dependency before zone release.',
        ],
      },
    },
  ], */
  Documents: columbusEnterpriseDocuments,
  'Tasks & Work Orders': [
    {
      id: 'cw-task-wo-4172',
      category: 'Tasks & Work Orders',
      kind: 'task',
      taskType: 'Work Order',
      taskState: 'In Progress',
      priority: 'High',
      title: 'WO-4172 Review Zone 1 conveyor support path',
      subtitle: 'Maintenance â€¢ Columbus West',
      summary: 'Verify the conveyor support path and confirm whether the drive bearing watch condition is affecting flow stability in Zone 1.',
      status: 'Due this shift',
      tone: '#E43B46',
      metric: 'Today 16:00',
      secondaryMetric: 'Owner: Reliability',
      location: 'Line 10',
      plant: 'Zone 1',
      updated: 'Due this shift',
      keywords: ['columbus west', 'zone 1', 'drive bearing', 'conveyor', 'work order'],
      detail: {
        owner: 'Reliability',
        due: 'Today 16:00',
        equipment: 'CV-101 Conveyor Support Path',
        nextStep: 'Inspect CV-101 support path and confirm bearing action before the end-of-shift brief.',
      },
    },
    {
      id: 'cw-task-leadership-brief',
      category: 'Tasks & Work Orders',
      kind: 'task',
      taskType: 'Work Order',
      taskState: 'Open',
      priority: 'Medium',
      title: 'WO-4198 Refresh Columbus West leadership brief',
      subtitle: 'Ops Review â€¢ Ready',
      summary: 'Update the site brief with current Area A output, Zone 1 constraints, and support lane notes before the next network review.',
      status: 'Ready',
      tone: '#044ED7',
      metric: 'Before 17:30',
      secondaryMetric: 'Owner: Site lead',
      location: 'Columbus West',
      plant: 'Leadership review',
      updated: 'Before 17:30',
      keywords: ['columbus west', 'leadership brief', 'area a', 'zone 1', 'site review'],
      detail: {
        owner: 'Site lead',
        due: 'Before 17:30',
        equipment: 'Leadership Review Pack',
        nextStep: 'Use Smart Search to gather the zone narrative, linked docs, and live action list in one pass.',
      },
    },
    {
      id: 'cw-task-wo-4211',
      category: 'Tasks & Work Orders',
      kind: 'task',
      taskType: 'Work Order',
      taskState: 'Overdue',
      priority: 'Critical',
      title: 'WO-4211 Stabilize filling head bearing response path',
      subtitle: 'Maintenance â€¢ Area A',
      summary: 'Escalate the filling head response path and validate whether the bearing watch signal should drive a deeper intervention during this shift.',
      status: 'Escalated',
      tone: '#DC2626',
      metric: 'Overdue 42 min',
      secondaryMetric: 'Owner: Maintenance Planner',
      location: 'Area A',
      plant: 'Line 10 / Filling Head Assembly',
      updated: 'Overdue 42 min',
      keywords: ['columbus west', 'bearing', 'filling head', 'maintenance', 'work order'],
      detail: {
        owner: 'Maintenance Planner',
        due: 'Overdue 42 min',
        equipment: 'Filling Head Assembly',
        nextStep: 'Align operations and maintenance on the intervention window before the next shift leadership review.',
      },
    },
  ],
  Notifications: [
    {
      id: 'cw-notif-zone-risk',
      category: 'Notifications',
      kind: 'notification',
      title: 'Zone 1 output risk climbed in the last hour',
      subtitle: 'Operations Alert',
      summary: 'Throughput softened after repeated micro-stops across the syringe assembly path, with CV-101 now linked to the watch list.',
      status: 'Live alert',
      tone: '#E43B46',
      metric: '3 linked events',
      secondaryMetric: 'Triggered 14 min ago',
      location: 'Area A',
      plant: 'Line 10 / Zone 1',
      updated: '14 min ago',
      keywords: ['zone 1', 'output risk', 'columbus west', 'line 10', 'alert'],
      detail: {
        severity: 'High',
        action: 'Review Zone 1 systems, then validate whether maintenance follow-up is needed before next handoff.',
      },
    },
    {
      id: 'cw-notif-support-lane',
      category: 'Notifications',
      kind: 'notification',
      title: 'Support lane update for Columbus West recovery',
      subtitle: 'Network Notification',
      summary: 'Regional support remains stable, but the site brief now expects a deeper Zone 1 view when recovery progress is shared.',
      status: 'Suggested',
      tone: '#9199D8',
      metric: 'Leadership note',
      secondaryMetric: 'Updated 1 hour ago',
      location: 'Columbus West',
      plant: 'Network operations',
      updated: '1 hour ago',
      keywords: ['columbus west', 'support lane', 'recovery', 'network'],
      detail: {
        severity: 'Informational',
        action: 'Include Area A and Zone 1 context in the next recovery summary.',
      },
    },
  ],
  Trainings: [
    {
      id: 'cw-training-site-overview',
      category: 'Trainings',
      kind: 'training',
      thumbnail: '/images/site-view.png',
      trainingType: 'Video',
      title: 'Columbus West Site Overview',
      subtitle: '10 min â€¢ BD Site Orientation',
      summary: 'Fast orientation covering site scale, products, Area A flow, and where leaders should drill in when issues surface.',
      status: 'Recommended',
      tone: '#9199D8',
      metric: '10 min',
      secondaryMetric: 'Leadership ready',
      location: 'Columbus West',
      plant: 'Site orientation',
      updated: 'Available now',
      keywords: ['columbus west', 'site overview', 'orientation', 'area a'],
      detail: {
        objective: 'Help teams explain the site, the current focus areas, and the right drill-down path quickly.',
      },
    },
    {
      id: 'cw-training-cv101-reliability',
      category: 'Trainings',
      kind: 'training',
      thumbnail: '/images/Line.png',
      trainingType: 'Video',
      title: 'Reliability Engineering for Conveyor Systems',
      subtitle: '12 min â€¢ TechMaint',
      summary: 'Focused breakdown of conveyor stability, bearing watch indicators, and when to escalate line-level symptoms into a work order.',
      status: 'Recommended',
      tone: '#2563EB',
      metric: '12 min',
      secondaryMetric: '3 weeks ago',
      location: 'Zone 1',
      plant: 'CV-101 Reliability',
      updated: '3 weeks ago',
      keywords: ['conveyor', 'reliability', 'bearing', 'cv-101'],
      detail: {
        objective: 'Build a common language for conveyor bearing issues before they affect throughput.',
      },
    },
    {
      id: 'cw-training-ops-excellence',
      category: 'Trainings',
      kind: 'training',
      thumbnail: '/images/maquina-fabrica.png',
      trainingType: 'Video',
      title: 'Operational Excellence in Conveyor Maintenance',
      subtitle: '8 min â€¢ Industrial Solutions',
      summary: 'Short operating playbook covering inspection cadence, preventive checks, and how to prepare a concise handoff to leadership.',
      status: 'Suggested',
      tone: '#0EA5E9',
      metric: '8 min',
      secondaryMetric: '1 month ago',
      location: 'Columbus West',
      plant: 'Leadership handoff',
      updated: '1 month ago',
      keywords: ['conveyor', 'maintenance', 'leadership', 'handoff'],
      detail: {
        objective: 'Help supervisors convert line observations into a stronger site-level narrative.',
      },
    },
    {
      id: 'cw-training-zone-1-briefing',
      category: 'Trainings',
      kind: 'training',
      thumbnail: '/images/Line1.png',
      trainingType: 'Video',
      title: 'Zone 1 Recovery Briefing',
      subtitle: '9 min â€¢ Engineering Today',
      summary: 'Compact briefing on Zone 1 throughput, micro-stop pressure, and the operating details leadership expects to see in recovery reviews.',
      status: 'Leadership ready',
      tone: '#7C3AED',
      metric: '9 min',
      secondaryMetric: '2 weeks ago',
      location: 'Line 10',
      plant: 'Zone 1 review',
      updated: '2 weeks ago',
      keywords: ['zone 1', 'briefing', 'leadership', 'recovery'],
      detail: {
        objective: 'Prepare leads to summarize Zone 1 performance clearly during shift and site reviews.',
      },
    },
  ],
  Assets: [
    {
      id: 'cw-asset-zone-1-module',
      category: 'Assets',
      kind: 'asset',
      thumbnail: '/images/Line1.png',
      title: 'Zone 1 Syringe Assembly Module',
      subtitle: 'Asset Summary â€¢ Columbus West',
      summary: 'The primary Zone 1 module connects the filling system, conveyor feed, inspection, and pack-out flow for Line 10.',
      status: 'Watch',
      tone: '#FF7A00',
      metric: '5 linked systems',
      secondaryMetric: 'Updated 20 min ago',
      location: 'Area A',
      plant: 'Line 10 / Zone 1',
      updated: '20 min ago',
      keywords: ['columbus west', 'zone 1', 'assembly module', 'line 10'],
      detail: {
        assetId: 'ASM-Z1-L10',
        owner: 'Area A Operations',
        temperature: '61°C',
        vibration: '3.20 mm/s RMS',
        nextStep: 'Review CV-101 and filling sequence stability before raising the next leadership note.',
      },
    },
    {
      id: 'cw-asset-drive-bearing',
      category: 'Assets',
      kind: 'asset',
      thumbnail: '/images/maquina-fabrica.png',
      title: 'CV-101 Drive Bearing',
      subtitle: 'Reliability Asset â€¢ Zone 1',
      summary: 'Drive bearing connected to the current watch condition and referenced by the active work order and zone risk notification.',
      status: 'At risk',
      tone: '#E43B46',
      metric: 'Priority asset',
      secondaryMetric: 'Updated 8 min ago',
      location: 'Zone 1',
      plant: 'CV-101',
      updated: '8 min ago',
      keywords: ['drive bearing', 'cv-101', 'zone 1', 'columbus west'],
      detail: {
        assetId: 'BRG-CV101',
        owner: 'Reliability',
        temperature: '65°C',
        vibration: '6.80 mm/s RMS',
        nextStep: 'Complete the physical check and confirm whether the watch signal should become a work-order escalation.',
      },
    },
  ],
  'Time Series': [
    {
      id: 'cw-ts-zone-throughput',
      category: 'Time Series',
      kind: 'timeSeries',
      title: 'CV-101 Drive Bearing Vibration',
      subtitle: 'RMS velocity â€¢ Zone 1',
      summary: 'Vibration on the CV-101 drive bearing is holding above the warning band and is now the strongest time-series signal inside Zone 1.',
      status: 'Critical',
      tone: '#E43B46',
      metric: '6.80 mm/s',
      secondaryMetric: 'Updated 16:15:32',
      location: 'Production Line A3',
      plant: 'Primary Conveyor',
      updated: 'Updated 16:15:32',
      keywords: ['drive bearing', 'zone 1', 'columbus west', 'timeseries', 'line 10', 'vibration', 'mm/s'],
      detail: {
        warning: '2.80 mm/s',
        critical: '4.50 mm/s',
        points: [5.7, 5.2, 5.9, 5.4, 6.1, 6.2, 5.5, 5.7, 6.3, 6.1, 5.8, 6.4, 6.0, 6.7, 6.2, 6.8],
        anomalies: [9, 12, 14],
        xLabels: defaultTimeSeriesLabels,
        yLabel: 'MM/S',
      },
    },
    {
      id: 'cw-ts-fanoboilevel',
      category: 'Time Series',
      kind: 'timeSeries',
      title: '[Code]-FCC:fanoboilevel.mde',
      subtitle: 'Wet Gas Compressor • Level signal',
      summary: 'Level signal for the wet gas compressor trend set now linked to the Columbus West time-series collection view.',
      status: 'Watch',
      tone: '#F97316',
      metric: '3.22 mm/s',
      secondaryMetric: 'Updated 16:12:10',
      location: 'Area A / Line 10',
      plant: 'Zone 1',
      updated: 'Updated 16:12:10',
      keywords: ['zone 1', 'line 10', 'wet gas compressor', 'fanoboilevel', 'timeseries'],
      detail: {
        warning: '2.80 mm/s',
        critical: '4.50 mm/s',
        points: [2.2, 2.4, 2.5, 2.6, 2.9, 3.1, 2.8, 3.0, 3.2, 3.1, 3.0, 3.2, 3.15, 3.18, 3.2, 3.22],
        anomalies: [8, 15],
        xLabels: defaultTimeSeriesLabels,
        yLabel: 'MM/S',
      },
    },
    {
      id: 'cw-ts-fanoboitemp',
      category: 'Time Series',
      kind: 'timeSeries',
      title: 'Wet Gas Compressor-FCC:fanoboitemp.mde',
      subtitle: 'Wet Gas Compressor • Temperature signal',
      summary: 'Temperature trace related to the same compressor path, useful to compare with vibration excursions.',
      status: 'Normal',
      tone: '#2563EB',
      metric: '58.4 °C',
      secondaryMetric: 'Updated 16:11:48',
      location: 'Area A / Line 10',
      plant: 'Zone 1',
      updated: 'Updated 16:11:48',
      keywords: ['zone 1', 'line 10', 'wet gas compressor', 'fanoboitemp', 'timeseries'],
      detail: {
        warning: '62.0 °C',
        critical: '68.0 °C',
        points: [53.2, 54.0, 54.8, 55.2, 55.8, 56.1, 56.5, 56.8, 57.0, 57.2, 57.4, 57.6, 57.9, 58.0, 58.2, 58.4],
        anomalies: [],
        xLabels: defaultTimeSeriesLabels,
        yLabel: '°C',
      },
    },
    {
      id: 'cw-ts-mode-ph',
      category: 'Time Series',
      kind: 'timeSeries',
      title: 'Wet Gas Compressor.MODE.ph.mde',
      subtitle: 'Wet Gas Compressor • Mode / phase signal',
      summary: 'Mode and phase sequence trend associated with recent bearing stability checks.',
      status: 'Watch',
      tone: '#F97316',
      metric: '4.02 ph',
      secondaryMetric: 'Updated 16:09:02',
      location: 'Area A / Line 10',
      plant: 'Unit A',
      updated: 'Updated 16:09:02',
      keywords: ['mode', 'phase', 'unit a', 'wet gas compressor', 'timeseries'],
      detail: {
        warning: '4.20 ph',
        critical: '4.80 ph',
        points: [3.4, 3.45, 3.5, 3.55, 3.62, 3.7, 3.74, 3.78, 3.82, 3.86, 3.88, 3.92, 3.95, 3.98, 4.0, 4.02],
        anomalies: [15],
        xLabels: defaultTimeSeriesLabels,
        yLabel: 'PH',
      },
    },
    {
      id: 'cw-ts-silica',
      category: 'Time Series',
      kind: 'timeSeries',
      title: 'Wet Gas Compressor-FCC:silica.mde',
      subtitle: 'Wet Gas Compressor • Silica indicator',
      summary: 'Silica indicator trend used by the site team to check contamination risk in the same operating path.',
      status: 'Normal',
      tone: '#2563EB',
      metric: '1.14 ppm',
      secondaryMetric: 'Updated 16:08:30',
      location: 'Columbus West',
      plant: 'Area A',
      updated: 'Updated 16:08:30',
      keywords: ['silica', 'area a', 'columbus west', 'timeseries'],
      detail: {
        warning: '2.00 ppm',
        critical: '3.00 ppm',
        points: [0.88, 0.9, 0.92, 0.94, 0.96, 0.98, 1.0, 1.02, 1.04, 1.05, 1.06, 1.08, 1.1, 1.11, 1.12, 1.14],
        anomalies: [],
        xLabels: defaultTimeSeriesLabels,
        yLabel: 'PPM',
      },
    },
  ],
  '3D': [
    {
      id: 'cw-3d-area-a',
      category: '3D',
      kind: '3d',
      title: 'Columbus West Area A - Smart Search Spatial View',
      subtitle: '3D Asset View â€¢ Line 10 Context',
      summary: 'Spatial overview of Area A with linked access into Zone 1 systems, documents, and live actions from the search workflow.',
      status: '3D Ready',
      tone: '#2563eb',
      metric: 'Spatial model',
      secondaryMetric: 'Updated 25 min ago',
      location: 'Columbus West',
      plant: 'Area A / Line 10',
      updated: '25 min ago',
      keywords: ['3d', 'columbus west', 'area a', 'line 10', 'zone 1'],
      detail: {
        description: 'Interactive spatial map of Columbus West Area A with a highlighted Zone 1 path and linked systems for faster operational context.',
        hierarchy: ['BD Global', 'Americas', 'Columbus West', 'Area A', 'Line 10', 'Zone 1'],
        context: [
          { label: 'Asset scope', value: 'Area A / Line 10' },
          { label: 'Focus zone', value: 'Zone 1' },
          { label: 'Primary owner', value: 'Operations + Reliability' },
          { label: 'Linked systems', value: '5' },
        ],
        kpis: [
          { label: 'Tagged nodes', value: '19', tone: '#2563eb' },
          { label: 'Linked docs', value: '4', tone: '#0f766e' },
          { label: 'Open actions', value: '2', tone: '#ef4444' },
        ],
      },
    },
  ],
  'Action Tracking': [
    {
      id: 'cw-action-301',
      category: 'Action Tracking',
      kind: 'action',
      title: 'Complete Zone 1 conveyor support path review',
      subtitle: 'Action Tracking â€¢ Reliability',
      summary: 'Action item linked to the active support-path review and the leadership brief for Columbus West recovery tracking.',
      status: 'Open',
      priority: 'High',
      tone: '#E43B46',
      metric: 'Due this shift',
      secondaryMetric: 'Owner: Reliability',
      location: 'Columbus West',
      plant: 'Area A / Zone 1',
      updated: 'Due this shift',
      keywords: ['columbus west', 'action tracking', 'zone 1', 'support path', 'reliability'],
      detail: {
        actionId: 'ACT-CW-301',
        owner: 'Reliability',
        assignedTo: 'James Miller',
        dueDate: 'Today 16:00',
        source: 'Tier 1 Meeting',
        relatedShift: 'Day Shift',
        description: 'Close the conveyor support-path review and attach the validated outcome to the leadership recovery brief.',
      },
    },
    {
      id: 'cw-action-318',
      category: 'Action Tracking',
      kind: 'action',
      title: 'Refresh Area A startup checklist with bearing watch step',
      subtitle: 'Action Tracking â€¢ Operations',
      summary: 'Operations action created after the latest watch condition review to ensure the next startup verifies the bearing status explicitly.',
      status: 'In Progress',
      priority: 'Medium',
      tone: '#2563EB',
      metric: '2 approvals left',
      secondaryMetric: 'Owner: Area A Operations',
      location: 'Columbus West',
      plant: 'Area A / Line 10',
      updated: 'Updated 18 min ago',
      keywords: ['columbus west', 'action tracking', 'startup checklist', 'line 10'],
      detail: {
        actionId: 'ACT-CW-318',
        owner: 'Area A Operations',
        assignedTo: 'Maria Pinna',
        dueDate: 'Tomorrow 07:00',
        source: 'Shift Handover',
        relatedShift: 'Night Shift',
        description: 'Update the startup checklist so the next team validates the bearing watch condition before releasing Zone 1.',
      },
    },
  ],
  ESO: [
    {
      id: 'cw-eso-044',
      category: 'ESO',
      kind: 'eso',
      title: 'Service aisle barricade gap near CV-101',
      subtitle: 'ESO â€¢ Condition Report',
      summary: 'Safety observation opened after technicians found a barricade gap during a CV-101 support-path inspection.',
      status: 'Action In Progress',
      priority: 'Medium',
      tone: '#FF6E00',
      metric: 'Condition Report',
      secondaryMetric: 'Reported 42 min ago',
      location: 'Columbus West',
      plant: 'Area A / Zone 1',
      updated: 'Created today 13:18',
      keywords: ['columbus west', 'eso', 'cv-101', 'barricade', 'zone 1'],
      detail: {
        esoId: 'ESO-CW-044',
        esoType: 'Condition Report',
        severity: 'Medium',
        reportedBy: 'John Joshua',
        assignedTo: 'Safety Coordinator',
        createdDate: 'Jul 1, 2026 13:18',
        relatedIncident: 'NC-CW-219',
        description: 'A gap in the service-aisle barricade was found during inspection prep and requires corrective follow-up before the next maintenance window.',
      },
    },
  ],
  'Shift Notes': [
    {
      id: 'cw-shift-note-118',
      category: 'Shift Notes',
      kind: 'shiftNote',
      title: 'Zone 1 bearing watch carried into second shift',
      subtitle: 'Shift Notes â€¢ Handover',
      summary: 'Shift handover note preserving the watch condition, linked work order, and expected verification steps for the next crew.',
      status: 'Logged',
      tone: '#2563EB',
      metric: 'Day Shift',
      secondaryMetric: 'Created by Site Lead',
      location: 'Columbus West',
      plant: 'Area A / Line 10',
      updated: 'Created today 14:10',
      keywords: ['columbus west', 'shift notes', 'bearing watch', 'line 10', 'handover'],
      detail: {
        noteId: 'SN-CW-118',
        shift: 'Day Shift',
        crew: 'Crew B',
        createdBy: 'Site Lead',
        createdDate: 'Jul 1, 2026 14:10',
        relatedIssue: 'WO-4172',
        tags: ['handover', 'bearing', 'zone 1'],
        description: 'Second shift must validate the support-path inspection result and confirm the watch condition status before the leadership update.',
      },
    },
  ],
} as Record<Exclude<SmartSearchCategory, 'All'>, any[]>;

export const SmartSearchScreen: React.FC<SmartSearchScreenProps> = ({
  activeTheme,
  currentUserName,
  setCurrentScreen,
  openSmartSearchChat,
}) => {
  const {
    smartSearchLaunchState,
    clearSmartSearchLaunchState,
    selectedHeaderHierarchyId,
  } = useWorkstationContext();
  const [smartSearchInput, setSmartSearchInput] = useState('');
  const [smartSearchQuery, setSmartSearchQuery] = useState('');
  const [smartSearchView, setSmartSearchView] = useState<'home' | 'results'>('home');
  const [smartSearchActiveTab, setSmartSearchActiveTab] = useState<SmartSearchWorkspaceTab>('All');
  const [smartSearchCategory, setSmartSearchCategory] = useState<SmartSearchCategory>('All');
  const [smartSearchExperienceMode, setSmartSearchExperienceMode] = useState<SmartSearchExperienceMode>('default');
  const [smartSearchLoading, setSmartSearchLoading] = useState(false);
  const [smartSearchSelectedItem, setSmartSearchSelectedItem] = useState<any>(null);
  const [smartSearchTimeRange, setSmartSearchTimeRange] = useState<'1 Hour' | '6 Hours' | '24 Hours' | '7 Days' | '30 Days'>('24 Hours');
  const [smartSearchTimeSeriesAiTypedText, setSmartSearchTimeSeriesAiTypedText] = useState('');
  const [smartSearchTimeSeriesAiStage, setSmartSearchTimeSeriesAiStage] = useState(0);
  const [smartSearchDocumentAiTypedText, setSmartSearchDocumentAiTypedText] = useState('');
  const [smartSearchDocumentAiStage, setSmartSearchDocumentAiStage] = useState(0);
  const [smartSearchAssetAiTypedText, setSmartSearchAssetAiTypedText] = useState('');
  const [smartSearchAssetAiStage, setSmartSearchAssetAiStage] = useState(0);
  const [smartSearchHierarchyExpandedIds, setSmartSearchHierarchyExpandedIds] = useState<string[]>(defaultColumbusExpandedIds);
  const [smartSearchHierarchySelectedId, setSmartSearchHierarchySelectedId] = useState(defaultColumbusHierarchySelectionId);
  const [smartSearchHierarchyFilter, setSmartSearchHierarchyFilter] = useState('');
  const [smartSearch3DLevel, setSmartSearch3DLevel] = useState<SmartSearch3DDrillLevel>('site');
  const [smartSearch3DAreaId, setSmartSearch3DAreaId] = useState<SmartSearch3DAreaId>('area-a');
  const [smartSearch3DUnitId, setSmartSearch3DUnitId] = useState<SmartSearch3DUnitId>('unit-a');
  const [smartSearch3DLineId, setSmartSearch3DLineId] = useState<SmartSearch3DLineId>('line-10');
  const [smartSearch3DZoneId, setSmartSearch3DZoneId] = useState<SmartSearch3DZoneId>('zone-1');
  const [smartSearch3DMachineId, setSmartSearch3DMachineId] = useState<SmartSearch3DMachineId>('syringe-assembly-module');
  const [smartSearchAutoTypeTarget, setSmartSearchAutoTypeTarget] = useState('');
  const [smartSearchHomePresetQuery, setSmartSearchHomePresetQuery] = useState(smartSearchHomeColumbusAutoQuery);
  const [smartSearchHomeAssistantTypedBody, setSmartSearchHomeAssistantTypedBody] = useState('');
  const [smartSearchHomeHasInteracted, setSmartSearchHomeHasInteracted] = useState(false);
  const [smartSearchDocumentFolderPath, setSmartSearchDocumentFolderPath] = useState<string[] | null>(null);
  const [smartSearchDocumentViewMode, setSmartSearchDocumentViewMode] = useState<SmartSearchDocumentViewMode>('list');
  const [smartSearchNarrativeIndex, setSmartSearchNarrativeIndex] = useState(0);
  const [smartSearchNarrativeText, setSmartSearchNarrativeText] = useState('');
  const [smartSearchColumbusBubbleTypedBody, setSmartSearchColumbusBubbleTypedBody] = useState('');
  const [smartSearchColumbusHistoryVisibleCount, setSmartSearchColumbusHistoryVisibleCount] = useState(0);
  const [smartSearchColumbusTodayVisibleCount, setSmartSearchColumbusTodayVisibleCount] = useState(0);
  const [smartSearchSummaryFeedback, setSmartSearchSummaryFeedback] = useState<'up' | 'down' | null>(null);
  const [smartSearchSummaryTypedText, setSmartSearchSummaryTypedText] = useState('');
  const [smartSearchSummaryVisibleMetricCount, setSmartSearchSummaryVisibleMetricCount] = useState(0);
  const [smartSearchSummaryExpanded, setSmartSearchSummaryExpanded] = useState(true);
  const [smartSearchVoiceRecording, setSmartSearchVoiceRecording] = useState(false);
  const [smartSearchFilters, setSmartSearchFilters] = useState({
    type: 'All Types',
    location: 'All Locations',
    plant: 'All Plants/Cell/Line',
    date: 'Any time',
  });
  const handleSmartSearchTabChange = (nextTab: SmartSearchWorkspaceTab) => {
    setSmartSearchActiveTab(nextTab);
    if (nextTab !== 'Documents') {
      setSmartSearchDocumentFolderPath(null);
    }
    if (nextTab === 'Site Overview' || nextTab === 'Maintenance Requests' || nextTab === 'Work Orders' || nextTab === 'Spare Parts') {
      if (smartSearchSelectedItem?.kind === '3d') {
        setSmartSearchSelectedItem(null);
      }
      return;
    }
    setSmartSearchCategory(nextTab);
    if (nextTab === '3D' || (nextTab !== '3D' && smartSearchSelectedItem?.kind === '3d')) {
      setSmartSearchSelectedItem(null);
    }
  };
  const getSmartSearchPresetQuery = (mode: SmartSearchExperienceMode) => (
    mode === 'columbus-west-site'
      ? smartSearchHomeColumbusAutoQuery
      : mode === 'sandy-site'
        ? smartSearchHomeSandyAutoQuery
        : 'Potential impact of conveyor bearing vibration'
  );
  const getSmartSearchHierarchyDefaults = (mode: SmartSearchExperienceMode) => (
    mode === 'columbus-west-site'
      ? { expandedIds: defaultColumbusExpandedIds, selectedId: defaultColumbusHierarchySelectionId }
      : mode === 'sandy-site'
        ? { expandedIds: defaultSandyExpandedIds, selectedId: defaultSandyHierarchySelectionId }
        : { expandedIds: defaultColumbusExpandedIds, selectedId: defaultColumbusHierarchySelectionId }
  );
  const inferSmartSearchExperienceFromHierarchyId = (nodeId: string): SmartSearchExperienceMode => {
    const hierarchyPath = findHeaderHierarchyPath(nodeId) ?? [];
    if (hierarchyPath.some((node) => node.id === 'plant-columbus-west')) return 'columbus-west-site';
    if (hierarchyPath.some((node) => node.id === 'plant-sandy')) return 'sandy-site';
    return 'default';
  };
  const inferSmartSearchExperience = (
    query: string,
    explicitPreset?: Exclude<SmartSearchExperienceMode, 'default'> | null,
  ): SmartSearchExperienceMode => {
    if (explicitPreset === 'columbus-west-site' || explicitPreset === 'sandy-site') return explicitPreset;
    const normalizedQuery = query.toLowerCase();
    if (normalizedQuery.includes('columbus west')) return 'columbus-west-site';
    if (normalizedQuery.includes('sandy')) return 'sandy-site';
    return 'default';
  };
  const inferSmartSearchCategory = (query: string, fallback: SmartSearchCategory): SmartSearchCategory => {
    const normalizedQuery = query.toLowerCase();
    if (/\b(work\s*orders?|wo|tasks?)\b/.test(normalizedQuery)) return 'Tasks & Work Orders';
    return fallback;
  };

  const runSmartSearch = (
    query: string,
    nextCategory: SmartSearchCategory = 'All',
    selectedItem?: any,
    explicitPreset?: Exclude<SmartSearchExperienceMode, 'default'> | null,
  ) => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;
    const nextExperienceMode = inferSmartSearchExperience(trimmedQuery, explicitPreset);
    const inferredCategory = inferSmartSearchCategory(trimmedQuery, nextCategory);
    const hierarchyDefaults = getSmartSearchHierarchyDefaults(nextExperienceMode);

    setSmartSearchAutoTypeTarget('');
    setSmartSearchInput(trimmedQuery);
    setSmartSearchQuery(trimmedQuery);
    setSmartSearchDocumentFolderPath(null);
    setSmartSearchActiveTab(nextExperienceMode === 'default' || inferredCategory !== 'All' ? inferredCategory : 'Site Overview');
    setSmartSearchCategory(inferredCategory);
    setSmartSearchView('results');
    setSmartSearchExperienceMode(nextExperienceMode);
    setSmartSearchLoading(true);
    setSmartSearchSelectedItem(selectedItem ?? null);
    setSmartSearchSummaryExpanded(true);
    if (nextExperienceMode !== 'default') {
      setSmartSearchHierarchyExpandedIds(hierarchyDefaults.expandedIds);
      setSmartSearchHierarchySelectedId(hierarchyDefaults.selectedId);
    }

    window.setTimeout(() => {
      setSmartSearchLoading(false);
    }, 780);
  };

  const resetSmartSearch = () => {
    setSmartSearchInput('');
    setSmartSearchQuery('');
    setSmartSearchView('home');
    setSmartSearchDocumentFolderPath(null);
    setSmartSearchActiveTab('All');
    setSmartSearchCategory('All');
    setSmartSearchExperienceMode('default');
    setSmartSearchSelectedItem(null);
    setSmartSearchLoading(false);
    setSmartSearchTimeRange('24 Hours');
    setSmartSearchHierarchyExpandedIds(defaultColumbusExpandedIds);
    setSmartSearchHierarchySelectedId(defaultColumbusHierarchySelectionId);
    setSmartSearchHierarchyFilter('');
    setSmartSearchAutoTypeTarget('');
    setSmartSearchHomePresetQuery(smartSearchHomeColumbusAutoQuery);
    setSmartSearchHomeAssistantTypedBody('');
    setSmartSearchHomeHasInteracted(false);
    setSmartSearchColumbusBubbleTypedBody('');
    setSmartSearchColumbusHistoryVisibleCount(0);
    setSmartSearchColumbusTodayVisibleCount(0);
    setSmartSearchSummaryTypedText('');
    setSmartSearchSummaryVisibleMetricCount(0);
    setSmartSearchSummaryFeedback(null);
    setSmartSearchSummaryExpanded(true);
    setSmartSearchAssetAiTypedText('');
    setSmartSearchAssetAiStage(0);
    setSmartSearchVoiceRecording(false);
    setSmartSearchFilters({
      type: 'All Types',
      location: 'All Locations',
      plant: 'All Plants/Cell/Line',
      date: 'Any time',
    });
  };

  useEffect(() => {
    if (!smartSearchLaunchState) return;
    const seededQuery = smartSearchLaunchState.draftQuery.trim();
    const explicitPreset = smartSearchLaunchState.preset ?? null;
    const nextExperienceMode = inferSmartSearchExperience(seededQuery, explicitPreset);
    const hierarchyDefaults = getSmartSearchHierarchyDefaults(nextExperienceMode);

    setSmartSearchExperienceMode(nextExperienceMode);
    setSmartSearchHierarchyExpandedIds(hierarchyDefaults.expandedIds);
    setSmartSearchHierarchySelectedId(smartSearchLaunchState.hierarchySeedId ?? hierarchyDefaults.selectedId);
    setSmartSearchHierarchyFilter('');
    setSmartSearchHomePresetQuery(seededQuery || getSmartSearchPresetQuery(nextExperienceMode));
    setSmartSearchHomeAssistantTypedBody('');
    setSmartSearchHomeHasInteracted(false);
    setSmartSearchColumbusBubbleTypedBody('');
    setSmartSearchColumbusHistoryVisibleCount(0);
    setSmartSearchColumbusTodayVisibleCount(0);
    if (nextExperienceMode === 'columbus-west-site' && !smartSearchLaunchState.autoRun) {
      setSmartSearchInput('');
      setSmartSearchAutoTypeTarget('');
    } else {
      setSmartSearchInput(seededQuery);
      setSmartSearchAutoTypeTarget('');
    }
    setSmartSearchQuery('');
    setSmartSearchView('home');
    setSmartSearchDocumentFolderPath(null);
    setSmartSearchActiveTab('All');
    setSmartSearchCategory('All');
    setSmartSearchSelectedItem(null);
    setSmartSearchLoading(false);

    if (smartSearchLaunchState.autoRun && seededQuery) {
      runSmartSearch(seededQuery, 'All', undefined, explicitPreset);
    }

    clearSmartSearchLaunchState();
  }, [smartSearchLaunchState, clearSmartSearchLaunchState]);

  useEffect(() => {
    if (smartSearchLaunchState || smartSearchView !== 'home') return;

    const selectedHierarchyPath = findHeaderHierarchyPath(selectedHeaderHierarchyId) ?? [];
    const isColumbusHierarchy = selectedHierarchyPath.some((node) => node.id === 'plant-columbus-west');
    const isSandyHierarchy = selectedHierarchyPath.some((node) => node.id === 'plant-sandy');
    const nextExperienceMode: SmartSearchExperienceMode = isColumbusHierarchy ? 'columbus-west-site' : isSandyHierarchy ? 'sandy-site' : 'default';
    const hierarchyDefaults = getSmartSearchHierarchyDefaults(nextExperienceMode);

    setSmartSearchExperienceMode(nextExperienceMode);
    if (nextExperienceMode !== 'default') {
      setSmartSearchHomePresetQuery(getSmartSearchPresetQuery(nextExperienceMode));
      setSmartSearchHierarchyExpandedIds(hierarchyDefaults.expandedIds);
      setSmartSearchHierarchySelectedId(hierarchyDefaults.selectedId);
    }
  }, [selectedHeaderHierarchyId, smartSearchLaunchState, smartSearchView]);

  useEffect(() => {
    if (smartSearchView !== 'results') return;
    if (smartSearchExperienceMode === 'columbus-west-site' && smartSearchSelectedItem?.kind === '3d') return;
    setSmartSearchSelectedItem(null);
  }, [smartSearchExperienceMode, smartSearchHierarchySelectedId, smartSearchView]);

  useEffect(() => {
    if (smartSearchCategory !== '3D' && smartSearchSelectedItem?.kind === '3d') {
      setSmartSearchSelectedItem(null);
    }
  }, [smartSearchCategory, smartSearchSelectedItem]);

  useEffect(() => {
    if (smartSearchExperienceMode !== 'columbus-west-site') return;
    const next3DState = resolveSmartSearch3DNavigationState(smartSearchHierarchySelectedId);
    setSmartSearch3DAreaId(next3DState.areaId);
    setSmartSearch3DLineId(next3DState.lineId);
    setSmartSearch3DUnitId(next3DState.unitId);
    setSmartSearch3DLevel(next3DState.level);
    setSmartSearch3DZoneId(next3DState.zoneId);
    setSmartSearch3DMachineId(next3DState.machineId);
  }, [smartSearchExperienceMode, smartSearchHierarchySelectedId]);

  useEffect(() => {
    if (smartSearchSelectedItem?.kind !== 'timeSeries') {
      setSmartSearchTimeSeriesAiTypedText('');
      setSmartSearchTimeSeriesAiStage(0);
      return;
    }

    const item = smartSearchSelectedItem;
    const anomalyCount = item.detail?.anomalies?.length ?? 0;
    const points = item.detail?.points ?? [];
    const latest = points[points.length - 1] ?? 0;
    const prior = points[Math.max(0, points.length - 5)] ?? latest;
    const direction = latest >= prior ? 'upward' : 'downward';
    const analysis = anomalyCount
      ? `BD Atlas detected ${anomalyCount} anomalous excursions in the selected window. The signal is moving ${direction}, with the latest value at ${item.metric}. If the current slope continues, the forecast remains above the warning band and requires validation before the next shift.`
      : `BD Atlas found no threshold-breaking anomaly in the selected window. The signal is moving ${direction} and remains inside its expected operating range. Continue monitoring the forecast and compare it with related equipment signals before changing the maintenance plan.`;

    setSmartSearchTimeSeriesAiTypedText('');
    setSmartSearchTimeSeriesAiStage(1);
    let index = 0;
    const intervalId = window.setInterval(() => {
      index += 9;
      setSmartSearchTimeSeriesAiTypedText(analysis.slice(0, index));
      setSmartSearchTimeSeriesAiStage(Math.min(4, Math.max(1, Math.ceil((index / analysis.length) * 4))));
      if (index >= analysis.length) window.clearInterval(intervalId);
    }, 26);

    return () => window.clearInterval(intervalId);
  }, [smartSearchSelectedItem?.id]);

  useEffect(() => {
    if (smartSearchSelectedItem?.kind !== 'document') {
      setSmartSearchDocumentAiTypedText('');
      setSmartSearchDocumentAiStage(0);
      return;
    }

    const item = smartSearchSelectedItem;
    const sourceSummary = item.detail?.summary ?? item.summary ?? '';
    const highlights = Array.isArray(item.detail?.highlights) ? item.detail.highlights : [];
    const highlightText = highlights.length
      ? ` The sections most relevant to this search cover ${highlights.slice(0, 2).join(' and ').replace(/\.$/, '')}.`
      : '';
    const analysis = `${sourceSummary}${highlightText}`;

    setSmartSearchDocumentAiTypedText('');
    setSmartSearchDocumentAiStage(1);
    let intervalId: number | undefined;
    const startTypingId = window.setTimeout(() => {
      setSmartSearchDocumentAiStage(2);
      let index = 0;
      intervalId = window.setInterval(() => {
        index += 7;
        setSmartSearchDocumentAiTypedText(analysis.slice(0, index));
        if (index >= analysis.length) {
          if (intervalId) window.clearInterval(intervalId);
          setSmartSearchDocumentAiStage(3);
        }
      }, 24);
    }, 420);

    return () => {
      window.clearTimeout(startTypingId);
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [smartSearchSelectedItem?.id]);

  useEffect(() => {
    if (smartSearchSelectedItem?.kind !== 'asset') {
      setSmartSearchAssetAiTypedText('');
      setSmartSearchAssetAiStage(0);
      return;
    }

    const item = smartSearchSelectedItem;
    const assetName = item.title ?? 'this asset';
    const vibration = item.detail?.vibration ?? item.metric ?? 'the current vibration trend';
    const owner = item.detail?.owner ?? 'Area A Operations';
    const analysis = `BLU.AI is correlating ${assetName} with CV-101 Drive Bearing Vibration, active work orders WO-2481 and WO-2476, the Zone 1 shift note, and the Line 10 inspection plan. The strongest relationship is elevated vibration at ${vibration} appearing in the same operating window as the active bearing verification. Recommended next step: ${item.detail?.nextStep ?? `have ${owner} validate the correlated evidence before escalation.`}`;

    setSmartSearchAssetAiTypedText('');
    setSmartSearchAssetAiStage(1);
    let index = 0;
    const intervalId = window.setInterval(() => {
      index += 10;
      setSmartSearchAssetAiTypedText(analysis.slice(0, index));
      setSmartSearchAssetAiStage(Math.min(4, Math.max(1, Math.ceil((index / analysis.length) * 4))));
      if (index >= analysis.length) window.clearInterval(intervalId);
    }, 24);

    return () => window.clearInterval(intervalId);
  }, [smartSearchSelectedItem?.id]);

  useEffect(() => {
    if (!smartSearchAutoTypeTarget || smartSearchView !== 'home') return;
    if (smartSearchInput === smartSearchAutoTypeTarget) return;

    const intervalId = window.setInterval(() => {
      setSmartSearchInput((currentValue) => {
        if (currentValue === smartSearchAutoTypeTarget) {
          window.clearInterval(intervalId);
          return currentValue;
        }

        const nextValue = smartSearchAutoTypeTarget.slice(0, currentValue.length + 1);
        if (nextValue === smartSearchAutoTypeTarget) {
          window.clearInterval(intervalId);
        }
        return nextValue;
      });
    }, 18);

    return () => window.clearInterval(intervalId);
  }, [smartSearchAutoTypeTarget, smartSearchInput, smartSearchView]);

  useEffect(() => {
    if (smartSearchView !== 'home') return;

    if (smartSearchExperienceMode !== 'columbus-west-site' && smartSearchExperienceMode !== 'sandy-site') {
      setSmartSearchHomeAssistantTypedBody(smartSearchHomeAssistantMessage.body);
      return;
    }

    if (smartSearchHomeHasInteracted) {
      setSmartSearchHomeAssistantTypedBody(smartSearchHomeAssistantMessage.body);
      return;
    }

    setSmartSearchInput('');
    setSmartSearchAutoTypeTarget('');
    setSmartSearchHomeAssistantTypedBody('');

    let bodyIndex = 0;
    let queryTimeoutId = 0;
    const bodyIntervalId = window.setInterval(() => {
      bodyIndex += 1;
      const nextBody = smartSearchHomeAssistantMessage.body.slice(0, bodyIndex);
      setSmartSearchHomeAssistantTypedBody(nextBody);

      if (bodyIndex >= smartSearchHomeAssistantMessage.body.length) {
        window.clearInterval(bodyIntervalId);
        queryTimeoutId = window.setTimeout(() => {
          setSmartSearchAutoTypeTarget(smartSearchHomePresetQuery);
        }, 420);
      }
    }, 28);

    return () => {
      window.clearInterval(bodyIntervalId);
      window.clearTimeout(queryTimeoutId);
    };
  }, [smartSearchExperienceMode, smartSearchHomeHasInteracted, smartSearchHomePresetQuery, smartSearchView]);

  useEffect(() => {
    if (smartSearchExperienceMode !== 'columbus-west-site' && smartSearchExperienceMode !== 'sandy-site') {
      setSmartSearchNarrativeText('');
      return;
    }

    const homeNarratives = smartSearchExperienceMode === 'columbus-west-site' ? columbusTypingNarratives : sandyTypingNarratives;
    const targetText = smartSearchView === 'home'
      ? homeNarratives[smartSearchNarrativeIndex % homeNarratives.length]
      : smartSearchExperienceMode === 'columbus-west-site'
        ? getColumbusResultsNarrative(smartSearchHierarchySelectedId)
        : `Scanning Sandy site detail for ${smartSearchSelectedHierarchyNode.label}.`;
    let tick = 0;
    const typingIntervalId = window.setInterval(() => {
      tick += 3;
      setSmartSearchNarrativeText(targetText.slice(0, tick));
      if (tick >= targetText.length) {
        window.clearInterval(typingIntervalId);
        if (smartSearchView === 'home') {
          window.setTimeout(() => {
            setSmartSearchNarrativeIndex((current) => (current + 1) % homeNarratives.length);
          }, 1600);
        }
      }
    }, 8);

    return () => window.clearInterval(typingIntervalId);
  }, [smartSearchExperienceMode, smartSearchHierarchySelectedId, smartSearchNarrativeIndex, smartSearchView]);

  useEffect(() => {
    if ((smartSearchExperienceMode !== 'columbus-west-site' && smartSearchExperienceMode !== 'sandy-site') || smartSearchView !== 'results') {
      setSmartSearchColumbusBubbleTypedBody('');
      setSmartSearchColumbusHistoryVisibleCount(0);
      setSmartSearchColumbusTodayVisibleCount(0);
      return;
    }

    const activeWelcomeMessage = smartSearchExperienceMode === 'columbus-west-site' ? columbusWelcomeMessage : sandyWelcomeMessage;
    const primaryRevealItems = smartSearchExperienceMode === 'columbus-west-site' ? columbusHistoryHighlights : sandyPlantProfileHighlights;
    const secondaryRevealItems = smartSearchExperienceMode === 'columbus-west-site' ? columbusTodayHighlights : sandyTodayHighlights;

    setSmartSearchColumbusBubbleTypedBody('');
    setSmartSearchColumbusHistoryVisibleCount(0);
    setSmartSearchColumbusTodayVisibleCount(0);

    const timeoutIds: number[] = [];
    let bubbleIndex = 0;
    let historyIndex = 0;
    let todayIndex = 0;

    const bubbleIntervalId = window.setInterval(() => {
      bubbleIndex += 4;
      setSmartSearchColumbusBubbleTypedBody(activeWelcomeMessage.body.slice(0, bubbleIndex));
      if (bubbleIndex >= activeWelcomeMessage.body.length) {
        window.clearInterval(bubbleIntervalId);
        const historyStartId = window.setTimeout(() => {
          const historyIntervalId = window.setInterval(() => {
            historyIndex += 1;
            setSmartSearchColumbusHistoryVisibleCount(Math.min(historyIndex, primaryRevealItems.length));
            if (historyIndex >= primaryRevealItems.length) {
              window.clearInterval(historyIntervalId);
              const todayStartId = window.setTimeout(() => {
                const todayIntervalId = window.setInterval(() => {
                  todayIndex += 1;
                  setSmartSearchColumbusTodayVisibleCount(Math.min(todayIndex, secondaryRevealItems.length));
                  if (todayIndex >= secondaryRevealItems.length) {
                    window.clearInterval(todayIntervalId);
                  }
                }, 65);
                timeoutIds.push(todayIntervalId);
              }, 40);
              timeoutIds.push(todayStartId);
            }
          }, 70);
          timeoutIds.push(historyIntervalId);
        }, 40);
        timeoutIds.push(historyStartId);
      }
    }, 8);

    return () => {
      window.clearInterval(bubbleIntervalId);
      timeoutIds.forEach((id) => {
        window.clearTimeout(id);
        window.clearInterval(id);
      });
    };
  }, [smartSearchExperienceMode, smartSearchView]);

  const smartSearchTokens = smartSearchQuery
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
  const smartSearchIsSandyOverviewQuery = smartSearchExperienceMode === 'sandy-site'
    && smartSearchQuery.trim().toLowerCase().includes('show me sandy site details');

  const smartSearchHierarchyRoot = mapHeaderHierarchyNode(headerHierarchyTree as unknown as SmartSearchHierarchyNode);
  const smartSearchSelectedHierarchyNode = findSmartSearchHierarchyNode(smartSearchHierarchyRoot, smartSearchHierarchySelectedId) ?? smartSearchHierarchyRoot;
  const smartSearchSelectedHierarchyPath = findSmartSearchHierarchyPath(smartSearchHierarchyRoot, smartSearchHierarchySelectedId) ?? [smartSearchHierarchyRoot];
  const smartSearchSelectedHierarchyDetail = getGenericHierarchyDetail(smartSearchSelectedHierarchyNode, smartSearchSelectedHierarchyPath);
  const smartSearchSelectedHierarchyPathLabel = smartSearchSelectedHierarchyPath.map((node) => node.label).join(' / ');
  const smartSearchHierarchySearch = smartSearchHierarchyFilter.trim().toLowerCase();
  const smartSearchSelectedSiteName = smartSearchSelectedHierarchyPath.find((node) => node.kind === 'plant' || node.kind === 'site')?.label ?? 'BD Global';
  const smartSearchIsColumbusScope = smartSearchSelectedHierarchyPath.some((node) => node.id === 'plant-columbus-west');
  const smartSearchIsSandyScope = smartSearchSelectedHierarchyPath.some((node) => node.id === 'plant-sandy');
  const smartSearchHasSpecialSiteExperience = smartSearchExperienceMode === 'columbus-west-site' || smartSearchExperienceMode === 'sandy-site';
  const smartSearchMaintenanceScopeLimit = ['asset', 'system'].includes(smartSearchSelectedHierarchyNode.kind)
    ? 1
    : ['line', 'zone'].includes(smartSearchSelectedHierarchyNode.kind)
      ? 2
      : smartSearchSelectedHierarchyNode.kind === 'area' || smartSearchSelectedHierarchyNode.kind === 'unit'
        ? 3
        : 4;
  const getScopedMaintenanceItems = (items: SmartSearchMaintenanceListItem[]) => items
    .slice(0, smartSearchMaintenanceScopeLimit)
    .map((item, index) => ({
      ...item,
      equipment: ['asset', 'system'].includes(smartSearchSelectedHierarchyNode.kind) && index === 0
        ? smartSearchSelectedHierarchyNode.label
        : item.equipment,
      location: smartSearchSelectedHierarchyPath.slice(2).map((node) => node.label).join(' · ') || item.location,
    }));
  const smartSearchScopedMaintenanceRequests = getScopedMaintenanceItems(smartSearchMaintenanceRequests);
  const smartSearchScopedWorkOrders = getScopedMaintenanceItems(smartSearchWorkOrders);
  const smartSearchSparePartsScopeLimit = (() => {
    switch (smartSearchSelectedHierarchyNode.kind) {
      case 'asset':
      case 'system':
        return 4;
      case 'line':
      case 'zone':
        return 7;
      case 'area':
      case 'unit':
        return 12;
      case 'plant':
      case 'site':
        return 18;
      case 'region':
        return 28;
      default:
        return inventoryParts.length;
    }
  })();
  const smartSearchSparePartsRotationSeed = inventoryParts.length
    ? Array.from(smartSearchSelectedHierarchyNode.id).reduce((acc, char) => (acc + char.charCodeAt(0)) % inventoryParts.length, 0)
    : 0;
  const smartSearchSparePartsScoped = inventoryParts.length
    ? [...inventoryParts.slice(smartSearchSparePartsRotationSeed), ...inventoryParts.slice(0, smartSearchSparePartsRotationSeed)]
    : inventoryParts;
  const smartSearchSpareParts = smartSearchSparePartsScoped.slice(0, smartSearchSparePartsScopeLimit);
  const smartSearchWorkspaceTabs: SmartSearchWorkspaceTab[] = smartSearchExperienceMode === 'columbus-west-site'
    ? ['Site Overview', 'All', ...smartSearchCategories.filter((category) => category !== 'All' && category !== 'Tasks & Work Orders'), 'Maintenance Requests', 'Work Orders', 'Spare Parts']
    : smartSearchExperienceMode === 'sandy-site'
      ? ['Site Overview', ...smartSearchCategories, 'Spare Parts']
      : [...smartSearchCategories, 'Spare Parts'];
  const baseColumbusSearchData: Record<Exclude<SmartSearchCategory, 'All'>, any[]> = {
    ...columbusSiteSearchData,
    'Tasks & Work Orders': columbusSiteSearchData['Tasks & Work Orders'].map((item) => (
      item.id === 'cw-task-leadership-brief'
        ? {
            ...item,
            secondaryMetric: `Owner: ${currentUserName}`,
            detail: { ...item.detail, owner: currentUserName },
          }
        : item
    )),
  };
  const smartSearchScopeAliasSeeds = smartSearchExperienceMode !== 'columbus-west-site' || !smartSearchIsColumbusScope
    ? []
    : smartSearchSelectedHierarchyNode.id === 'plant-columbus-west' || smartSearchSelectedHierarchyNode.kind === 'global' || smartSearchSelectedHierarchyNode.kind === 'region'
      ? []
      : ({
          'plant-columbus-west-area-assembly': ['area a', 'line 10', 'zone 1', 'columbus west'],
          'plant-columbus-west-area-assembly-unit-a': ['area a', 'unit a', 'line 10', 'zone 1'],
          'plant-columbus-west-area-assembly-unit-a-line-10': ['line 10', 'zone 1', 'cv-101', 'filling'],
          'zone-cw-assembly-a-10-final': ['zone 1', 'cv-101', 'drive bearing', 'syringe assembly'],
          'cw-syringe-assembly-module': ['syringe assembly', 'zone 1', 'line 10'],
          'cw-filling-system': ['filling system', 'filling head', 'drive bearing', 'zone 1'],
          'cw-filling-head-assembly': ['filling head', 'servo motor', 'nozzle cluster', 'drive bearing', 'dosing pump'],
          'cw-servo-motor': ['servo motor', 'filling head'],
          'cw-nozzle-cluster': ['nozzle cluster', 'filling head'],
          'cw-drive-bearing': ['drive bearing', 'cv-101', 'bearing'],
          'cw-dosing-pump-module': ['dosing pump', 'filling head'],
          'cw-transport-system': ['transport system', 'conveyor', 'zone 1'],
          'cw-conveyor-cv101': ['cv-101', 'conveyor', 'drive bearing'],
          'cw-vision-vi210': ['vision', 'inspection', 'zone 1'],
          'cw-labeling-lm7': ['labeling', 'zone 1'],
          'cw-cartoner-ct32': ['cartoner', 'zone 1'],
        }[smartSearchSelectedHierarchyNode.id] ?? [smartSearchSelectedHierarchyNode.label.toLowerCase()]);
  const smartSearchScopeAliases = Array.from(new Set([
    ...smartSearchScopeAliasSeeds,
    ...smartSearchSelectedHierarchyPath
      .slice(2)
      .flatMap((node) => [node.label.toLowerCase(), (node.meta ?? '').toLowerCase()])
      .filter(Boolean),
  ]));
  const filterScopedItems = (items: any[]) => {
    if (!smartSearchScopeAliases.length) return items;
    return items.filter((item) => {
      const folderPathText = Array.isArray(item.detail?.folderPath) ? item.detail.folderPath.join(' ') : '';
      const haystack = `${item.title} ${item.subtitle} ${item.summary} ${item.location} ${item.plant} ${folderPathText} ${(item.keywords ?? []).join(' ')}`.toLowerCase();
      return smartSearchScopeAliases.some((alias) => haystack.includes(alias));
    });
  };
  const smartSearchDataMap: Record<Exclude<SmartSearchCategory, 'All'>, any[]> = smartSearchExperienceMode === 'columbus-west-site' && smartSearchIsColumbusScope
    ? {
        Documents: filterScopedItems(baseColumbusSearchData.Documents),
        'Tasks & Work Orders': filterScopedItems(baseColumbusSearchData['Tasks & Work Orders']),
        Notifications: filterScopedItems(baseColumbusSearchData.Notifications),
        Trainings: filterScopedItems(baseColumbusSearchData.Trainings),
        Assets: filterScopedItems(baseColumbusSearchData.Assets),
        'Time Series': filterScopedItems(baseColumbusSearchData['Time Series']),
        '3D': filterScopedItems(baseColumbusSearchData['3D']),
        'Action Tracking': filterScopedItems(baseColumbusSearchData['Action Tracking']),
        ESO: filterScopedItems(baseColumbusSearchData.ESO),
        'Shift Notes': filterScopedItems(baseColumbusSearchData['Shift Notes']),
      }
    : getGlobalSearchCatalog(currentUserName);

  const smartSearchIndex = useMemo(
    () => buildSearchIndex(
      smartSearchExperienceMode,
      currentUserName,
      smartSearchExperienceMode !== 'default' ? smartSearchDataMap : undefined,
    ),
    [smartSearchExperienceMode, currentUserName, smartSearchDataMap],
  );

  const smartSearchEngineResult = useMemo(
    () => runSmartSearchEngine(smartSearchQuery, smartSearchIndex, {
      filters: smartSearchFilters,
      scopeAliases: smartSearchScopeAliases,
      mode: smartSearchExperienceMode,
      showAllOnEmpty: smartSearchIsSandyOverviewQuery,
    }),
    [
      smartSearchQuery,
      smartSearchIndex,
      smartSearchFilters,
      smartSearchScopeAliases,
      smartSearchExperienceMode,
      smartSearchIsSandyOverviewQuery,
    ],
  );

  const smartSearchFilteredMap = useMemo(
    () => Object.fromEntries(
      Object.entries(smartSearchEngineResult.categoryBuckets).map(([key, items]) => [
        key,
        items.map(({ score: _score, matchedTerms: _matchedTerms, ...item }) => item),
      ]),
    ) as Record<Exclude<SmartSearchCategory, 'All'>, any[]>,
    [smartSearchEngineResult],
  );

  const smartSearchAllItems = Object.values(smartSearchDataMap).flat();
  const smartSearchLocationOptions = ['All Locations', ...Array.from(new Set(smartSearchAllItems.map((item) => item.location)))];
  const smartSearchPlantOptions = ['All Plants/Cell/Line', ...Array.from(new Set(smartSearchAllItems.map((item) => item.plant)))];
  const smartSearchDataCountMap: Record<SmartSearchCategory, number> = {
    All: Object.values(smartSearchDataMap).reduce((acc, items) => acc + items.length, 0),
    Documents: smartSearchDataMap.Documents.length,
    'Tasks & Work Orders': smartSearchDataMap['Tasks & Work Orders'].length,
    Notifications: smartSearchDataMap.Notifications.length,
    Trainings: smartSearchDataMap.Trainings.length,
    Assets: smartSearchDataMap.Assets.length,
    'Time Series': smartSearchDataMap['Time Series'].length,
    '3D': smartSearchDataMap['3D'].length,
    'Action Tracking': smartSearchDataMap['Action Tracking'].length,
    ESO: smartSearchDataMap.ESO.length,
    'Shift Notes': smartSearchDataMap['Shift Notes'].length,
  };

  const smartSearchResultCountMap: Record<SmartSearchCategory, number> = {
    All: Object.values(smartSearchFilteredMap).reduce((acc, items) => acc + items.length, 0),
    Documents: smartSearchFilteredMap.Documents.length,
    'Tasks & Work Orders': smartSearchFilteredMap['Tasks & Work Orders'].length,
    Notifications: smartSearchFilteredMap.Notifications.length,
    Trainings: smartSearchFilteredMap.Trainings.length,
    Assets: smartSearchFilteredMap.Assets.length,
    'Time Series': smartSearchFilteredMap['Time Series'].length,
    '3D': smartSearchFilteredMap['3D'].length,
    'Action Tracking': smartSearchFilteredMap['Action Tracking'].length,
    ESO: smartSearchFilteredMap.ESO.length,
    'Shift Notes': smartSearchFilteredMap['Shift Notes'].length,
  };

  const smartSearchResultGroups = smartSearchCategory === 'All'
    ? [
        { label: 'Documents', items: smartSearchFilteredMap.Documents.slice(0, smartSearchExperienceMode === 'columbus-west-site' ? 8 : 6) },
        { label: 'Tasks & Work Orders', items: smartSearchFilteredMap['Tasks & Work Orders'].slice(0, smartSearchExperienceMode === 'columbus-west-site' ? 8 : 6) },
        { label: 'Notifications', items: smartSearchFilteredMap.Notifications.slice(0, smartSearchExperienceMode === 'columbus-west-site' ? 6 : 4) },
        { label: 'Trainings', items: smartSearchFilteredMap.Trainings.slice(0, smartSearchExperienceMode === 'columbus-west-site' ? 6 : 5) },
        { label: 'Assets', items: smartSearchFilteredMap.Assets.slice(0, smartSearchExperienceMode === 'columbus-west-site' ? 5 : 4) },
        { label: 'Timeseries Data', items: smartSearchFilteredMap['Time Series'].slice(0, 3) },
        { label: '3D', items: smartSearchFilteredMap['3D'].slice(0, 2) },
        { label: 'Action Tracking', items: smartSearchFilteredMap['Action Tracking'].slice(0, smartSearchExperienceMode === 'columbus-west-site' ? 5 : 4) },
        { label: 'ESO', items: smartSearchFilteredMap.ESO.slice(0, smartSearchExperienceMode === 'columbus-west-site' ? 4 : 3) },
        { label: 'Shift Notes', items: smartSearchFilteredMap['Shift Notes'].slice(0, smartSearchExperienceMode === 'columbus-west-site' ? 5 : 4) },
      ].filter((group) => group.items.length > 0)
    : [{ label: smartSearchCategory, items: smartSearchFilteredMap[smartSearchCategory as Exclude<SmartSearchCategory, 'All'>] ?? [] }].filter((group) => group.items.length > 0);

  const renderSmartSearchSiteOverviewTab = () => {
    if (!smartSearchHasSpecialSiteExperience || !smartSearchInsight) return null;
    return smartSearchExperienceMode === 'columbus-west-site'
      ? renderColumbusSearchInsight()
      : renderSandySearchInsight();
  };
  const renderSmartSearchMaintenanceList = (mode: 'requests' | 'workOrders') => {
    const isRequests = mode === 'requests';
    const items = isRequests ? smartSearchScopedMaintenanceRequests : smartSearchScopedWorkOrders;
    const title = isRequests ? 'Maintenance Requests' : 'Work Orders';
    const subtitle = isRequests
      ? 'Requests connected to the current Columbus West hierarchy and operating signals.'
      : 'Planned and active work connected to Area A, Line 10, and Zone 1.';
    const kpis = isRequests
      ? [
          { label: 'Total requests', value: items.length, note: 'Current scope', tone: tokenBrand.main },
          { label: 'High priority', value: items.filter((item) => item.priority === 'High').length, note: 'Needs attention', tone: tokenError.main },
          { label: 'Ready to plan', value: items.filter((item) => item.status === 'Ready to plan').length, note: 'Planning queue', tone: tokenWarning.dark },
          { label: 'Due today', value: items.filter((item) => item.due.startsWith('Today')).length, note: 'Current shift', tone: tokenText.primary },
        ]
      : [
          { label: 'Total orders', value: items.length, note: 'Current scope', tone: tokenBrand.main },
          { label: 'High priority', value: items.filter((item) => item.priority === 'High').length, note: 'Execution risk', tone: tokenError.main },
          { label: 'In execution', value: items.filter((item) => item.status === 'In progress' || item.status === 'Scheduled').length, note: 'Active work', tone: tokenSuccess.darker },
          { label: 'Due today', value: items.filter((item) => item.due.startsWith('Today')).length, note: 'Current shift', tone: tokenText.primary },
        ];

    return (
      <Box sx={{ display: 'grid', gap: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: { xs: 'flex-start', md: 'center' }, justifyContent: 'space-between', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
          <Box>
            <Typography sx={{ color: tokenText.primary, fontSize: 20, lineHeight: 1.3, fontWeight: 700 }}>{title}</Typography>
            <Typography sx={{ color: tokenText.secondary, fontSize: 13, lineHeight: 1.45, mt: 0.35 }}>{subtitle}</Typography>
          </Box>
          <Button
            variant="text"
            startIcon={<AutoAwesomeIcon sx={{ fontSize: 16 }} />}
            onClick={() => openSmartSearchChat(`Summarize the ${title.toLowerCase()} for ${smartSearchSelectedHierarchyPathLabel}. Prioritize what needs attention today.`)}
            sx={{ minHeight: 32, px: 1, color: tokenBrand.main, textTransform: 'none', fontSize: 13, fontWeight: 600, borderRadius: '8px' }}
          >
            Ask Atlas about this list
          </Button>
        </Box>

        <Paper elevation={0} sx={{ p: 1.5, borderRadius: '12px', bgcolor: tokenNeutral.lightest, border: `1px solid ${tokenDivider}` }}>
          <Grid container spacing={0}>
            {kpis.map((metric, index) => (
              <Grid key={metric.label} size={{ xs: 6, md: 3 }}>
                <Box sx={{ px: 1.5, py: 0.5, borderRight: { md: index === kpis.length - 1 ? 'none' : `1px solid ${tokenDivider}` } }}>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.75 }}>
                    <Typography sx={{ color: metric.tone, fontSize: 24, lineHeight: 1, fontWeight: 600 }}>{metric.value}</Typography>
                    <Typography sx={{ color: tokenText.primary, fontSize: 12, lineHeight: 1.2, fontWeight: 600 }}>{metric.label}</Typography>
                  </Box>
                  <Typography sx={{ color: tokenText.secondary, fontSize: 10.5, mt: 0.55 }}>{metric.note}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
          <Typography sx={{ color: tokenText.primary, fontSize: 14, fontWeight: 600 }}>{isRequests ? 'Request queue' : 'Work-order queue'}</Typography>
          <Typography sx={{ color: tokenText.secondary, fontSize: 11.5 }}>{items.length} shown</Typography>
        </Box>

        <Box sx={{ display: 'grid', gap: 1 }}>
          {items.map((item) => {
            const priorityTone = item.priority === 'High' ? tokenError.main : item.priority === 'Medium' ? tokenWarning.dark : tokenSuccess.darker;
            const priorityBg = item.priority === 'High' ? tokenError.softBg : item.priority === 'Medium' ? tokenWarning.softBg : tokenSuccess.softBg;
            return (
              <Paper
                key={item.id}
                elevation={0}
                onClick={() => setCurrentScreen(isRequests ? 'maintenance_hub' : 'maintenance_followup')}
                sx={{ position: 'relative', overflow: 'hidden', p: 1.5, pl: 2, borderRadius: '8px', border: `1px solid ${tokenDivider}`, bgcolor: 'background.paper', cursor: 'pointer', transition: 'background-color 150ms ease, border-color 150ms ease', '&:hover': { bgcolor: tokenNeutral.lightest, borderColor: tokenNeutral.dark } }}
              >
                <Box sx={{ position: 'absolute', inset: '0 auto 0 0', width: 4, bgcolor: priorityTone }} />
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1.4fr) minmax(240px, 0.8fr) auto' }, alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.75 }}>
                      <Typography sx={{ color: tokenText.primary, fontSize: 13.5, lineHeight: 1.3, fontWeight: 600 }}>{item.title}</Typography>
                      <Chip label={item.id} size="small" sx={{ height: 22, borderRadius: '6px', bgcolor: tokenNeutral.lighter, color: tokenText.secondary, fontSize: 10.5, fontWeight: 600 }} />
                      <Chip label={item.priority} size="small" sx={{ height: 22, borderRadius: '6px', bgcolor: priorityBg, color: priorityTone, fontSize: 10.5, fontWeight: 600 }} />
                    </Box>
                    <Typography sx={{ color: tokenText.secondary, fontSize: 12, lineHeight: 1.45, mt: 0.65 }}>{item.summary}</Typography>
                  </Box>
                  <Box sx={{ display: 'grid', gap: 0.55 }}>
                    <Typography sx={{ color: tokenText.secondary, fontSize: 11.5 }}><Box component="span" sx={{ color: tokenText.primary, fontWeight: 600 }}>Equipment:</Box> {item.equipment}</Typography>
                    <Typography sx={{ color: tokenText.secondary, fontSize: 11.5 }}><Box component="span" sx={{ color: tokenText.primary, fontWeight: 600 }}>Location:</Box> {item.location}</Typography>
                    <Typography sx={{ color: tokenText.secondary, fontSize: 11.5 }}><Box component="span" sx={{ color: tokenText.primary, fontWeight: 600 }}>Owner:</Box> {item.owner} · {item.due}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'flex-start', lg: 'flex-end' }, gap: 0.5 }}>
                    <Chip label={item.status} size="small" sx={{ height: 26, borderRadius: '8px', bgcolor: tokenNeutral.lighter, color: tokenText.primary, fontSize: 10.5, fontWeight: 600 }} />
                    <Tooltip title={`Open ${item.id}`}>
                        <IconButton
                          aria-label={`Open ${item.id}`}
                          onClick={(event) => {
                            event.stopPropagation();
                            setCurrentScreen(isRequests ? 'maintenance_hub' : 'maintenance_followup');
                          }}
                        sx={{ width: 32, height: 32, borderRadius: '8px', color: tokenBrand.main, '&:hover': { bgcolor: tokenBrand.softBg } }}
                      >
                        <ArrowOutwardIcon sx={{ fontSize: 17 }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </Paper>
            );
          })}
        </Box>
      </Box>
    );
  };
  const renderSmartSearchSparePartsList = () => {
    const items = smartSearchSpareParts;
    const lowStockCount = items.filter((part) => part.currentStock > 0 && part.currentStock <= part.safetyStock).length;
    const outOfStockCount = items.filter((part) => part.currentStock === 0).length;
    const categoryCount = new Set(items.map((part) => part.category)).size;
    const getStockTone = (part: SparePartsInventoryPart) => {
      if (part.currentStock === 0) return { tone: tokenError.main, bg: tokenError.softBg, label: 'Out of stock' };
      if (part.currentStock <= part.safetyStock) return { tone: tokenWarning.dark, bg: tokenWarning.softBg, label: 'Low stock' };
      return { tone: tokenSuccess.darker, bg: tokenSuccess.softBg, label: 'In stock' };
    };
    const kpis = [
      { label: 'Total parts', value: items.length, note: 'Current search scope', tone: tokenBrand.main },
      { label: 'Low stock', value: lowStockCount, note: 'At or below safety stock', tone: tokenWarning.dark },
      { label: 'Out of stock', value: outOfStockCount, note: 'Needs replenishment', tone: tokenError.main },
      { label: 'Categories', value: categoryCount, note: 'Distinct part families', tone: tokenText.primary },
    ];

    return (
      <Box sx={{ display: 'grid', gap: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: { xs: 'flex-start', md: 'center' }, justifyContent: 'space-between', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
          <Box>
            <Typography sx={{ color: tokenText.primary, fontSize: 20, lineHeight: 1.3, fontWeight: 700 }}>Spare Parts</Typography>
            <Typography sx={{ color: tokenText.secondary, fontSize: 13, lineHeight: 1.45, mt: 0.35 }}>
              Inventory parts connected to the current search scope and maintenance operations.
            </Typography>
          </Box>
          <Button
            variant="text"
            startIcon={<AutoAwesomeIcon sx={{ fontSize: 16 }} />}
            onClick={() => openSmartSearchChat(`Summarize the spare parts inventory for ${smartSearchSelectedHierarchyPathLabel}. Highlight low-stock and out-of-stock items that may affect maintenance work.`)}
            sx={{ minHeight: 32, px: 1, color: tokenBrand.main, textTransform: 'none', fontSize: 13, fontWeight: 600, borderRadius: '8px' }}
          >
            Ask Atlas about this list
          </Button>
        </Box>

        <Paper elevation={0} sx={{ p: 1.5, borderRadius: '12px', bgcolor: tokenNeutral.lightest, border: `1px solid ${tokenDivider}` }}>
          <Grid container spacing={0}>
            {kpis.map((metric, index) => (
              <Grid key={metric.label} size={{ xs: 6, md: 3 }}>
                <Box sx={{ px: 1.5, py: 0.5, borderRight: { md: index === kpis.length - 1 ? 'none' : `1px solid ${tokenDivider}` } }}>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.75 }}>
                    <Typography sx={{ color: metric.tone, fontSize: 24, lineHeight: 1, fontWeight: 600 }}>{metric.value}</Typography>
                    <Typography sx={{ color: tokenText.primary, fontSize: 12, lineHeight: 1.2, fontWeight: 600 }}>{metric.label}</Typography>
                  </Box>
                  <Typography sx={{ color: tokenText.secondary, fontSize: 10.5, mt: 0.55 }}>{metric.note}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
          <Typography sx={{ color: tokenText.primary, fontSize: 14, fontWeight: 600 }}>Inventory queue</Typography>
          <Typography sx={{ color: tokenText.secondary, fontSize: 11.5 }}>{items.length} shown</Typography>
        </Box>

        <Box sx={{ display: 'grid', gap: 1 }}>
          {items.map((part) => {
            const stockState = getStockTone(part);
            return (
              <Paper
                key={part.id}
                elevation={0}
                onClick={() => setCurrentScreen('tool_crib')}
                sx={{ position: 'relative', overflow: 'hidden', p: 1.5, borderRadius: '8px', border: `1px solid ${tokenDivider}`, bgcolor: 'background.paper', cursor: 'pointer', transition: 'background-color 150ms ease, border-color 150ms ease', '&:hover': { bgcolor: tokenNeutral.lightest, borderColor: tokenNeutral.dark } }}
              >
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1.4fr) minmax(240px, 0.8fr) auto' }, alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ minWidth: 0, display: 'flex', alignItems: 'flex-start', gap: 1.25 }}>
                    {part.photoSrc ? (
                      <Box
                        component="img"
                        src={part.photoSrc}
                        alt={`${part.name} photo`}
                        sx={{ width: 48, height: 48, flexShrink: 0, objectFit: 'contain', borderRadius: '6px', border: `1px solid ${tokenDivider}`, bgcolor: 'background.default' }}
                      />
                    ) : null}
                    <Box sx={{ minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.75 }}>
                        <Typography sx={{ color: tokenText.primary, fontSize: 13.5, lineHeight: 1.3, fontWeight: 600 }}>{part.name}</Typography>
                        <Chip label={part.sapNumber} size="small" sx={{ height: 22, borderRadius: '6px', bgcolor: tokenNeutral.lighter, color: tokenText.secondary, fontSize: 10.5, fontWeight: 600 }} />
                        <Chip label={part.category} size="small" sx={{ height: 22, borderRadius: '6px', bgcolor: tokenNeutral.lighter, color: tokenText.primary, fontSize: 10.5, fontWeight: 600 }} />
                        <Chip label={stockState.label} size="small" sx={{ height: 22, borderRadius: '6px', bgcolor: stockState.bg, color: stockState.tone, fontSize: 10.5, fontWeight: 600 }} />
                      </Box>
                      <Typography sx={{ color: tokenText.secondary, fontSize: 12, lineHeight: 1.45, mt: 0.65 }}>
                        {part.manufacturer} · {part.machineFamily} · {part.condition}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'grid', gap: 0.55 }}>
                    <Typography sx={{ color: tokenText.secondary, fontSize: 11.5 }}><Box component="span" sx={{ color: tokenText.primary, fontWeight: 600 }}>Stock:</Box> {part.currentStock} current · {part.reservedStock} reserved · {part.safetyStock} safety</Typography>
                    <Typography sx={{ color: tokenText.secondary, fontSize: 11.5 }}><Box component="span" sx={{ color: tokenText.primary, fontWeight: 600 }}>Bin:</Box> {part.binLocation}</Typography>
                    <Typography sx={{ color: tokenText.secondary, fontSize: 11.5 }}><Box component="span" sx={{ color: tokenText.primary, fontWeight: 600 }}>Unit price:</Box> ${part.unitPrice.toFixed(2)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'flex-start', lg: 'flex-end' }, gap: 0.5 }}>
                    <Tooltip title={`Open ${part.sapNumber}`}>
                      <IconButton
                        aria-label={`Open ${part.sapNumber}`}
                        onClick={(event) => {
                          event.stopPropagation();
                          setCurrentScreen('tool_crib');
                        }}
                        sx={{ width: 32, height: 32, borderRadius: '8px', color: tokenBrand.main, '&:hover': { bgcolor: tokenBrand.softBg } }}
                      >
                        <ArrowOutwardIcon sx={{ fontSize: 17 }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </Paper>
            );
          })}
        </Box>
      </Box>
    );
  };
  const smartSearchShouldShowDetailRail = Boolean(smartSearchSelectedItem)
    && smartSearchActiveTab !== 'Site Overview'
    && smartSearchActiveTab !== 'Maintenance Requests'
    && smartSearchActiveTab !== 'Work Orders'
    && smartSearchActiveTab !== 'Spare Parts'
    && smartSearchActiveTab !== '3D';

  const renderSmartSearchLogbook3DView = () => {
    const zoneCatalogIds: SmartSearch3DZoneId[] = smartSearch3DLevel === 'line'
      ? ['zone-1', 'zone-2', 'zone-4', 'zone-5']
      : smartSearchCurrent3DLine.zoneIds;
    const siteCatalog = [
      { id: 'area-a', label: 'Area A Assembly', level: 'Area 3D', path: 'Columbus West / Area A', image: smartSearch3DAreaViews['area-a'].image, status: 'Running', action: () => focusSmartSearch3DArea('area-a') },
      { id: 'unit-a', label: 'Unit A Production Cell', level: 'Unit 3D', path: 'Area A / Unit A', image: smartSearch3DUnitViews['unit-a'].image, status: 'Running', action: () => focusSmartSearch3DUnit('unit-a') },
      { id: 'line-10', label: 'Line 10 Production Lane', level: 'Line 3D', path: 'Unit A / Line 10', image: smartSearch3DLineViews['line-10'].image, status: 'Running', action: () => focusSmartSearch3DLine('line-10') },
      { id: 'zone-1', label: 'Zone 1 Assembly', level: 'Zone 3D', path: 'Line 10 / Zone 1', image: smartSearch3DZoneViews['zone-1'].image, status: 'Running', action: () => focusSmartSearch3DZone('zone-1') },
      { id: 'zone-2', label: 'Zone 2 Inspection', level: 'Zone 3D', path: 'Line 10 / Zone 2', image: smartSearch3DZoneViews['zone-2'].image, status: 'Watch', action: () => focusSmartSearch3DZone('zone-2') },
    ];
    const zoneCatalog = zoneCatalogIds.map((zoneId) => {
      const zone = smartSearch3DZoneViews[zoneId];
      return { id: zoneId, label: zone.label, level: 'Zone 3D', path: `Line 10 / ${zone.label}`, image: zone.image, status: zone.status, action: () => focusSmartSearch3DZone(zoneId) };
    });
    const machineCatalog = smartSearchCurrent3DZone.machineIds.map((machineId) => {
      const machine = smartSearch3DMachineViews[machineId];
      return { id: machineId, label: machine.label, level: 'Equipment 3D', path: `${smartSearchCurrent3DZone.label} / ${machine.focusArea}`, image: machine.image, status: machine.metric, action: () => focusSmartSearch3DMachine(machineId) };
    });
    const availableViews = smartSearch3DLevel === 'site'
      ? siteCatalog
      : smartSearch3DLevel === 'area'
        ? siteCatalog.slice(1)
        : smartSearch3DLevel === 'unit'
          ? [siteCatalog[2], ...zoneCatalog]
          : smartSearch3DLevel === 'line'
            ? zoneCatalog
            : smartSearch3DLevel === 'zone'
              ? machineCatalog
              : [];
    const activePreview = smartSearch3DLevel === 'area'
      ? smartSearchCurrent3DArea
      : smartSearch3DLevel === 'unit'
        ? smartSearchCurrent3DUnit
        : smartSearch3DLevel === 'line'
          ? smartSearchCurrent3DLine
          : smartSearch3DLevel === 'zone'
            ? smartSearchCurrent3DZone
            : null;
    const catalogTitle = smartSearch3DLevel === 'site'
      ? 'Available 3D views at Columbus West'
      : smartSearch3DLevel === 'zone'
        ? `Equipment models in ${smartSearchCurrent3DZone.label}`
        : `Available 3D views below ${smartSearchSelectedHierarchyNode.label}`;

    return (
      <Box sx={{ display: 'grid', gap: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: { xs: 'flex-start', md: 'center' }, justifyContent: 'space-between', gap: 1.5, flexDirection: { xs: 'column', md: 'row' } }}>
          <Box>
            <Typography sx={{ color: tokenText.primary, fontSize: 20, lineHeight: 1.25, fontWeight: 700 }}>3D View</Typography>
            <Typography sx={{ color: tokenText.secondary, fontSize: 12.5, lineHeight: 1.5, mt: 0.35 }}>
              Browse the 3D models available for the selected hierarchy level, then open the equipment viewer from Shift Logbook.
            </Typography>
          </Box>
          <Chip icon={<ViewInArOutlinedIcon sx={{ fontSize: '16px !important' }} />} label={`${availableViews.length || 1} available`} size="small" sx={{ bgcolor: tokenBrand.softBg, color: tokenBrand.main, border: `1px solid ${tokenBrand.main}2E`, fontWeight: 700 }} />
        </Box>

        {smartSearch3DLevel !== 'site' ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, flexWrap: 'wrap' }}>
            {smartSearch3DPathNodes.filter((node) => node.enabled).map((node, index) => (
              <React.Fragment key={node.level}>
                {index > 0 ? <ChevronRightIcon sx={{ color: tokenNeutral.dark, fontSize: 16 }} /> : null}
                <Button onClick={() => focusSmartSearch3DLevel(node.level)} sx={{ minWidth: 0, p: 0.35, color: node.level === smartSearch3DLevel ? tokenText.primary : tokenBrand.main, textTransform: 'none', fontSize: 12, fontWeight: node.level === smartSearch3DLevel ? 700 : 500 }}>
                  {node.label}
                </Button>
              </React.Fragment>
            ))}
          </Box>
        ) : null}

        {smartSearch3DLevel === 'machine' ? (
          <>
            <Paper elevation={0} sx={{ p: 1.25, borderRadius: '10px', border: `1px solid ${tokenDivider}`, bgcolor: tokenNeutral.lightest, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, flexWrap: 'wrap' }}>
              <Box>
                <Typography sx={{ color: tokenText.primary, fontSize: 15, fontWeight: 700 }}>{smartSearchCurrent3DMachine.label}</Typography>
                <Typography sx={{ color: tokenText.secondary, fontSize: 11.5, mt: 0.2 }}>{smartSearchSelectedHierarchyPathLabel}</Typography>
              </Box>
              <Button variant="outlined" onClick={() => focusSmartSearch3DZone(smartSearchCurrent3DMachine.zoneId)} sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700 }}>
                Back to equipment list
              </Button>
            </Paper>
            <Box sx={{ position: 'relative', height: { xs: 620, md: 680 }, minWidth: 0, overflow: 'hidden', borderRadius: '12px', border: `1px solid ${tokenDivider}`, bgcolor: '#EEF4FF' }}>
              <EquipmentFocusScene onSelectPart={() => undefined} />
            </Box>
          </>
        ) : (
          <>
            {activePreview ? (
              <Paper elevation={0} sx={{ position: 'relative', minHeight: { xs: 260, md: 340 }, overflow: 'hidden', borderRadius: '12px', border: `1px solid ${tokenDivider}`, bgcolor: '#0F172A' }}>
                <Box component="img" src={activePreview.image} alt={`${activePreview.label} 3D view`} sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(7,17,34,0.88) 0%, rgba(7,17,34,0.32) 52%, rgba(7,17,34,0.08) 100%)' }} />
                <Box sx={{ position: 'relative', zIndex: 1, p: { xs: 2, md: 3 }, maxWidth: 470 }}>
                  <Chip label={`${smartSearch3DLevel.toUpperCase()} 3D`} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.16)', color: '#FFFFFF', fontWeight: 700 }} />
                  <Typography sx={{ color: '#FFFFFF', fontSize: { xs: 22, md: 28 }, fontWeight: 800, mt: 1.2 }}>{activePreview.label}</Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.82)', fontSize: 13, lineHeight: 1.55, mt: 0.8 }}>{activePreview.summary}</Typography>
                </Box>
              </Paper>
            ) : null}

            <Box>
              <Typography sx={{ color: tokenText.primary, fontSize: 15, fontWeight: 700, mb: 1 }}>{catalogTitle}</Typography>
              <Grid container spacing={1.25}>
                {availableViews.map((view) => (
                  <Grid key={view.id} size={{ xs: 12, sm: 6, lg: smartSearch3DLevel === 'site' ? 4 : 3 }}>
                    <Paper elevation={0} onClick={view.action} sx={{ height: '100%', overflow: 'hidden', borderRadius: '10px', border: `1px solid ${tokenDivider}`, bgcolor: 'background.paper', cursor: 'pointer', transition: 'transform 160ms ease, border-color 160ms ease, box-shadow 160ms ease', '&:hover': { transform: 'translateY(-2px)', borderColor: tokenBrand.main, boxShadow: '0 8px 22px rgba(15,23,42,0.10)' } }}>
                      <Box sx={{ position: 'relative', height: 145, bgcolor: tokenNeutral.lighter }}>
                        <Box component="img" src={view.image} alt={view.label} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <Chip label={view.level} size="small" sx={{ position: 'absolute', top: 8, left: 8, height: 22, bgcolor: 'rgba(7,17,34,0.88)', color: '#FFFFFF', fontSize: 10, fontWeight: 700 }} />
                      </Box>
                      <Box sx={{ p: 1.25 }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography sx={{ color: tokenText.primary, fontSize: 13.5, fontWeight: 700 }}>{view.label}</Typography>
                            <Typography sx={{ color: tokenText.secondary, fontSize: 10.5, mt: 0.25 }}>{view.path}</Typography>
                          </Box>
                          <ChevronRightIcon sx={{ color: tokenBrand.main, fontSize: 19, flex: '0 0 auto' }} />
                        </Box>
                        <Typography sx={{ color: view.status === 'Watch' ? tokenWarning.dark : tokenSuccess.darker, fontSize: 10.5, fontWeight: 700, mt: 0.8 }}>{view.status}</Typography>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </>
        )}
      </Box>
    );
  };

  const smartSearchPrimaryResult = smartSearchResultGroups[0]?.items[0] ?? null;
  const smartSearchContextCountCards = smartSearchIsColumbusScope
    ? [
        { label: 'Documents', value: smartSearchDataMap.Documents.length, tone: '#1D4ED8' },
        { label: 'Tasks & WO', value: smartSearchDataMap['Tasks & Work Orders'].length, tone: '#DC2626' },
        { label: 'Notifications', value: smartSearchDataMap.Notifications.length, tone: '#D97706' },
        { label: 'Trainings', value: smartSearchDataMap.Trainings.length, tone: '#6D28D9' },
        { label: 'Time Series', value: smartSearchDataMap['Time Series'].length, tone: '#0284C7' },
        { label: '3D Models', value: smartSearchDataMap['3D'].length, tone: '#0F766E' },
      ]
    : [
        { label: 'Documents', value: Math.min(smartSearchDataMap.Documents.length, 2), tone: '#1D4ED8' },
        { label: 'Tasks & WO', value: Math.min(smartSearchDataMap['Tasks & Work Orders'].length, 2), tone: '#DC2626' },
        { label: 'Notifications', value: Math.min(smartSearchDataMap.Notifications.length, 1), tone: '#D97706' },
        { label: 'Assets', value: smartSearchDataMap.Assets.length, tone: '#0891B2' },
        { label: 'Time Series', value: smartSearchDataMap['Time Series'].length, tone: '#0284C7' },
        { label: '3D Models', value: smartSearchDataMap['3D'].length, tone: '#0F766E' },
      ];
  const getVisibleHierarchyNode = (node: SmartSearchHierarchyNode): SmartSearchHierarchyNode | null => {
    if (!smartSearchHierarchySearch) return node;
    const matchesNode = `${node.label} ${node.meta ?? ''}`.toLowerCase().includes(smartSearchHierarchySearch);
    const visibleChildren = (node.children ?? [])
      .map((child) => getVisibleHierarchyNode(child))
      .filter((child): child is SmartSearchHierarchyNode => Boolean(child));

    if (matchesNode || visibleChildren.length) {
      return {
        ...node,
        children: visibleChildren,
      };
    }

    return null;
  };
  const smartSearchVisibleHierarchyRoot = getVisibleHierarchyNode(smartSearchHierarchyRoot) ?? smartSearchHierarchyRoot;

  const toggleSmartSearchHierarchyNode = (nodeId: string) => {
    setSmartSearchHierarchyExpandedIds((current) => (
      current.includes(nodeId) ? current.filter((id) => id !== nodeId) : [...current, nodeId]
    ));
  };
  const smartSearchCurrent3DArea = smartSearch3DAreaViews[smartSearch3DAreaId];
  const smartSearchCurrent3DUnit = smartSearch3DUnitViews[smartSearch3DUnitId];
  const smartSearchCurrent3DLine = smartSearch3DLineViews[smartSearch3DLineId];
  const smartSearchCurrent3DZone = smartSearch3DZoneViews[smartSearch3DZoneId];
  const smartSearchCurrent3DMachine = smartSearch3DMachineViews[smartSearch3DMachineId];
  const smartSearch3DPathNodes = [
    { level: 'site' as const, label: 'Site', enabled: true },
    { level: 'area' as const, label: smartSearchCurrent3DArea.label, enabled: smartSearch3DLevelOrder[smartSearch3DLevel] >= smartSearch3DLevelOrder.area },
    { level: 'unit' as const, label: smartSearchCurrent3DUnit.label, enabled: smartSearch3DLevelOrder[smartSearch3DLevel] >= smartSearch3DLevelOrder.unit },
    { level: 'line' as const, label: smartSearchCurrent3DLine.label, enabled: smartSearch3DLevelOrder[smartSearch3DLevel] >= smartSearch3DLevelOrder.line },
    { level: 'zone' as const, label: smartSearchCurrent3DZone.label, enabled: smartSearch3DLevelOrder[smartSearch3DLevel] >= smartSearch3DLevelOrder.zone },
    { level: 'machine' as const, label: smartSearchCurrent3DMachine.label, enabled: smartSearch3DLevelOrder[smartSearch3DLevel] >= smartSearch3DLevelOrder.machine },
  ];

  const focusSmartSearch3DSite = () => {
    setSmartSearch3DLevel('site');
    setSmartSearch3DAreaId('area-a');
    setSmartSearch3DUnitId('unit-a');
    setSmartSearch3DLineId('line-10');
    setSmartSearchHierarchyExpandedIds(defaultColumbusExpandedIds);
    setSmartSearchHierarchySelectedId('plant-columbus-west');
  };

  const focusSmartSearch3DArea = (areaId: SmartSearch3DAreaId) => {
    const areaView = smartSearch3DAreaViews[areaId];
    setSmartSearch3DLevel('area');
    setSmartSearch3DAreaId(areaId);
    setSmartSearch3DUnitId(areaView.unitId);
    setSmartSearch3DLineId('line-10');
    setSmartSearch3DZoneId(smartSearch3DUnitViews[areaView.unitId].zoneIds[0]);
    setSmartSearch3DMachineId(smartSearch3DZoneViews[smartSearch3DUnitViews[areaView.unitId].zoneIds[0]].machineIds[0]);
    setSmartSearchHierarchyExpandedIds((current) => Array.from(new Set([...current, ...defaultColumbusExpandedIds, areaView.hierarchyId])));
    setSmartSearchHierarchySelectedId(areaView.hierarchyId);
  };

  const focusSmartSearch3DUnit = (unitId: SmartSearch3DUnitId) => {
    const unitView = smartSearch3DUnitViews[unitId];
    setSmartSearch3DLevel('unit');
    setSmartSearch3DUnitId(unitId);
    setSmartSearch3DLineId('line-10');
    setSmartSearch3DZoneId(unitView.zoneIds[0]);
    setSmartSearch3DMachineId(smartSearch3DZoneViews[unitView.zoneIds[0]].machineIds[0]);
    setSmartSearchHierarchyExpandedIds((current) => Array.from(new Set([...current, ...defaultColumbusExpandedIds, smartSearchCurrent3DArea.hierarchyId, unitView.hierarchyId])));
    setSmartSearchHierarchySelectedId(unitView.hierarchyId);
  };

  const focusSmartSearch3DLine = (lineId: SmartSearch3DLineId) => {
    const lineView = smartSearch3DLineViews[lineId];
    setSmartSearch3DLevel('line');
    setSmartSearch3DLineId(lineId);
    setSmartSearch3DZoneId(lineView.zoneIds[0]);
    setSmartSearch3DMachineId(smartSearch3DZoneViews[lineView.zoneIds[0]].machineIds[0]);
    setSmartSearchHierarchyExpandedIds((current) => Array.from(new Set([
      ...current,
      ...defaultColumbusExpandedIds,
      smartSearchCurrent3DArea.hierarchyId,
      smartSearchCurrent3DUnit.hierarchyId,
      lineView.hierarchyId,
    ])));
    setSmartSearchHierarchySelectedId(lineView.hierarchyId);
  };

  const focusSmartSearch3DZone = (zoneId: SmartSearch3DZoneId) => {
    const zoneView = smartSearch3DZoneViews[zoneId];
    setSmartSearch3DLevel('zone');
    setSmartSearch3DLineId('line-10');
    setSmartSearch3DZoneId(zoneId);
    setSmartSearch3DMachineId(zoneView.machineIds[0]);
    setSmartSearchHierarchyExpandedIds((current) => Array.from(new Set([
      ...current,
      ...defaultColumbusExpandedIds,
      smartSearchCurrent3DArea.hierarchyId,
      smartSearchCurrent3DUnit.hierarchyId,
      smartSearchCurrent3DLine.hierarchyId,
      zoneView.hierarchyId,
    ])));
    setSmartSearchHierarchySelectedId(zoneView.hierarchyId);
  };

  const focusSmartSearch3DMachine = (machineId: SmartSearch3DMachineId) => {
    const machineView = smartSearch3DMachineViews[machineId];
    setSmartSearch3DLevel('machine');
    setSmartSearch3DLineId('line-10');
    setSmartSearch3DZoneId(machineView.zoneId);
    setSmartSearch3DMachineId(machineId);
    setSmartSearchHierarchyExpandedIds((current) => Array.from(new Set([
      ...current,
      ...defaultColumbusExpandedIds,
      smartSearchCurrent3DArea.hierarchyId,
      smartSearchCurrent3DUnit.hierarchyId,
      smartSearchCurrent3DLine.hierarchyId,
      smartSearch3DZoneViews[machineView.zoneId].hierarchyId,
      machineView.hierarchyId,
    ])));
    setSmartSearchHierarchySelectedId(machineView.hierarchyId);
  };

  const focusSmartSearch3DLevel = (level: SmartSearch3DDrillLevel) => {
    if (level === 'site') {
      focusSmartSearch3DSite();
      return;
    }

    if (level === 'area') {
      focusSmartSearch3DArea(smartSearch3DAreaId);
      return;
    }

    if (level === 'unit') {
      focusSmartSearch3DUnit(smartSearch3DUnitId);
      return;
    }

    if (level === 'line') {
      focusSmartSearch3DLine(smartSearch3DLineId);
      return;
    }

    if (level === 'zone') {
      focusSmartSearch3DZone(smartSearch3DZoneId);
      return;
    }

    focusSmartSearch3DMachine(smartSearch3DMachineId);
  };

  const resolveSmartSearchItemById = (itemId?: string) => {
    if (!itemId) return null;
    return smartSearchIndex.find((item) => item.id === itemId) ?? null;
  };

  const smartSearchInsight = smartSearchQuery.trim()
    ? {
        summary: smartSearchEngineResult.summary.text,
        findings: smartSearchEngineResult.summary.findings,
        actions: [
          ...smartSearchEngineResult.summary.actions.map((action) => ({
            label: action.label,
            accent: action.accent,
            action: () => {
              const item = resolveSmartSearchItemById(action.itemId);
              if (item) {
                setSmartSearchSelectedItem(item);
                return;
              }
              if (action.label.includes('BLU.AI')) {
                openSmartSearchChat(`Search context for ${smartSearchQuery}`);
              }
            },
          })),
          ...(smartSearchExperienceMode === 'columbus-west-site'
            ? [{
                label: 'Open current scope',
                accent: '#044ED7',
                action: () => {
                  setSmartSearchHierarchyExpandedIds([...getHeaderHierarchyExpandablePathIds(smartSearchHierarchySelectedId), smartSearchHierarchySelectedId]);
                  setSmartSearchHierarchySelectedId(smartSearchHierarchySelectedId);
                },
              }]
            : []),
        ],
        followUps: smartSearchEngineResult.summary.followUps,
      }
    : null;

  const smartSearchIsReliabilityQuery = /bearing|vibration|failure|maintenance/i.test(smartSearchQuery);
  const smartSearchIsTrainingQuery = /training|learning|course|certification/i.test(smartSearchQuery);
  const smartSearchUsesOperationalBrief = smartSearchIsReliabilityQuery || smartSearchExperienceMode !== 'default';
  const smartSearchScopeKind = smartSearchSelectedHierarchyNode.kind;
  const smartSearchIsDetailedScope = ['line', 'zone', 'system', 'asset'].includes(smartSearchScopeKind);
  const smartSearchAiProfile = smartSearchIsTrainingQuery
    ? {
        summary: `${smartSearchSelectedHierarchyNode.label} has an enablement gap: required training completion is at 84%, with four overdue certifications concentrated in the current operating scope. Prioritize the overdue assignments before the next scheduled sessions.`,
        subject: `${smartSearchSelectedHierarchyNode.label} training readiness`,
        availabilityLabel: 'Required Training Completion', availability: '84%', availabilityDelta: '-6.0%',
        workOrdersLabel: 'Assigned courses', workOrders: '12', workOrdersDelta: '+3',
        entriesLabel: 'Overdue certifications', entries: '4', entriesDelta: '+2',
        inspectionsLabel: 'Sessions scheduled', inspections: '6',
        actionLabels: ['REVIEW TRAINING READINESS', 'SHOW ASSIGNED COURSES', 'REVIEW OVERDUE ITEMS', 'SEE TRAINING CALENDAR'],
        followUps: ['Who is overdue on required training?', 'Which course should be completed first?', 'What sessions are available this month?'],
      }
    : smartSearchExperienceMode === 'sandy-site'
      ? {
          summary: 'Sandy has a short-term execution risk: line availability remains healthy, but active work orders and shift entries are rising together across the selected production scope. Review the highest-risk area before the next handoff.',
          subject: `${smartSearchSelectedHierarchyNode.label} production areas`,
          availabilityLabel: 'Line Availability', availability: '96.4%', availabilityDelta: '-1.8%',
          workOrdersLabel: 'Active Work Orders', workOrders: '8', workOrdersDelta: '+18%',
          entriesLabel: 'Shift Entries', entries: '14', entriesDelta: '+21%',
          inspectionsLabel: 'Inspections Scheduled', inspections: '9',
          actionLabels: ['VIEW LINE PERFORMANCE', 'REVIEW ACTIVE WORK ORDERS', 'SHOW SHIFT ENTRIES', 'SEE THE CALENDAR'],
          followUps: ['Which Sandy area carries the most risk?', 'Why are shift entries increasing?', 'What should the next handoff prioritize?'],
        }
      : smartSearchIsReliabilityQuery
        ? {
            summary: 'The concurrent spike in work orders and log entries within the last 2 hours indicates active failure progression. With only 6 inspections scheduled in the next 15 days, there may be a window of risk if vibration escalates before the next inspection.',
            subject: 'conveyor bearing vibration',
            availabilityLabel: 'Conveyor Availability', availability: '98.2%', availabilityDelta: '+2.1%',
            workOrdersLabel: 'Related Work Orders', workOrders: '13', workOrdersDelta: '+32%',
            entriesLabel: 'Related Entries', entries: '22', entriesDelta: '+32%',
            inspectionsLabel: 'Related Inspections', inspections: '6',
            actionLabels: ['VIEW LINE PERFORMANCE', 'SHOW WORK ORDERS IN MAINTENANCE', 'SHOW ENTRIES', 'SEE THE CALENDAR'],
            followUps: ['How do I check if a bearing is going bad?', 'When should I call maintenance vs. my supervisor?', 'What sounds mean the bearing is failing?'],
          }
        : smartSearchIsDetailedScope
          ? {
              summary: `${smartSearchSelectedHierarchyNode.label} is the most constrained scope in the current result set. Availability has softened to 88.4%, five work orders remain active, and nine recent entries point to repeated micro-stops. The next inspection plan covers only two checks.`,
              subject: smartSearchSelectedHierarchyNode.label,
              availabilityLabel: `${smartSearchSelectedHierarchyNode.label} Availability`, availability: '88.4%', availabilityDelta: '-4.6%',
              workOrdersLabel: 'Active Work Orders', workOrders: '5', workOrdersDelta: '+25%',
              entriesLabel: 'Recent Entries', entries: '9', entriesDelta: '+18%',
              inspectionsLabel: 'Planned Inspections', inspections: '2',
              actionLabels: ['VIEW SCOPE PERFORMANCE', 'REVIEW ACTIVE WORK ORDERS', 'SHOW RECENT ENTRIES', 'SEE INSPECTION PLAN'],
              followUps: [`What changed in ${smartSearchSelectedHierarchyNode.label}?`, 'Which asset is driving the losses?', 'What should the next shift verify?'],
            }
          : smartSearchScopeKind === 'area' || smartSearchScopeKind === 'unit'
            ? {
                summary: `${smartSearchSelectedHierarchyNode.label} is carrying most of the near-term execution risk in this search. Output remains recoverable, but eight active work orders and fourteen recent entries are concentrated around Line 10. Four inspections are planned for the next 15 days.`,
                subject: smartSearchSelectedHierarchyNode.label,
                availabilityLabel: `${smartSearchSelectedHierarchyNode.label} Performance`, availability: '94.6%', availabilityDelta: '-2.4%',
                workOrdersLabel: 'Active Work Orders', workOrders: '8', workOrdersDelta: '+20%',
                entriesLabel: 'Recent Entries', entries: '14', entriesDelta: '+24%',
                inspectionsLabel: 'Planned Inspections', inspections: '4',
                actionLabels: ['VIEW AREA PERFORMANCE', 'REVIEW ACTIVE WORK ORDERS', 'SHOW RECENT ENTRIES', 'SEE INSPECTION PLAN'],
                followUps: [`Where is ${smartSearchSelectedHierarchyNode.label} losing output?`, 'Which work order is most urgent?', 'What changed during the last shift?'],
              }
            : {
                summary: 'Columbus West is broadly stable, but the current evidence is not evenly distributed: thirteen work orders and twenty-two recent entries are concentrated in Area A, Line 10, and Zone 1. The site overview provides orientation; this briefing highlights where operational attention is needed now.',
                subject: 'Area A / Line 10 / Zone 1',
                availabilityLabel: 'Site Availability', availability: '98.2%', availabilityDelta: '+2.1%',
                workOrdersLabel: 'Open Work Orders', workOrders: '13', workOrdersDelta: '+32%',
                entriesLabel: 'Recent Shift Entries', entries: '22', entriesDelta: '+32%',
                inspectionsLabel: 'Planned Inspections', inspections: '6',
                actionLabels: ['VIEW SITE PERFORMANCE', 'REVIEW WORK ORDERS', 'SHOW SHIFT ENTRIES', 'SEE INSPECTION PLAN'],
                followUps: ['Why is Area A the current focus?', 'Which work order needs attention first?', 'What should leadership monitor today?'],
              };
  const smartSearchAiSummaryText = smartSearchEngineResult.stats.totalMatches > 0
    ? smartSearchEngineResult.summary.text
    : smartSearchUsesOperationalBrief
      ? smartSearchAiProfile.summary
      : smartSearchInsight?.summary ?? '';
  const smartSearchAiMetrics = smartSearchUsesOperationalBrief
    ? [
        {
          label: smartSearchAiProfile.availabilityLabel,
          value: smartSearchAiProfile.availability,
          detail: 'LAST 24 HOURS',
          delta: smartSearchAiProfile.availabilityDelta,
          tone: smartSearchAiProfile.availabilityDelta.startsWith('-') ? tokenError.main : tokenSuccess.darker,
          icon: <TrendingUpIcon sx={{ fontSize: 16 }} />,
          actionLabel: smartSearchAiProfile.actionLabels[0],
          action: () => openSmartSearchChat(`Analyze line performance for ${smartSearchSelectedHierarchyNode.label}. Use the Smart Search query "${smartSearchQuery}" and explain the availability trend, current risk, and recommended next check.`),
        },
        {
          label: `${smartSearchAiProfile.workOrdersLabel} · ${smartSearchAiProfile.subject}`,
          value: smartSearchAiProfile.workOrders,
          detail: 'WO OPENED · LAST 2 HOURS',
          delta: smartSearchAiProfile.workOrdersDelta,
          tone: tokenError.main,
          icon: <AssignmentTurnedInOutlinedIcon sx={{ fontSize: 16 }} />,
          actionLabel: smartSearchAiProfile.actionLabels[1],
          action: () => openSmartSearchChat(`Review the ${smartSearchAiProfile.workOrders} work items linked to "${smartSearchQuery}" in ${smartSearchSelectedHierarchyNode.label}. Summarize priority, ownership, overdue exposure, and what should happen next.`),
        },
        {
          label: `${smartSearchAiProfile.entriesLabel} · ${smartSearchAiProfile.subject}`,
          value: smartSearchAiProfile.entries,
          detail: 'ITEMS LOGGED · LAST 2 HOURS',
          delta: smartSearchAiProfile.entriesDelta,
          tone: tokenError.main,
          icon: <DescriptionOutlinedIcon sx={{ fontSize: 16 }} />,
          actionLabel: smartSearchAiProfile.actionLabels[2],
          action: () => openSmartSearchChat(`Open the Smart Search context for the ${smartSearchAiProfile.entries} recent entries related to "${smartSearchQuery}". Group the entries by signal, identify what changed, and call out the strongest evidence.`),
        },
        {
          label: `${smartSearchAiProfile.inspectionsLabel} · ${smartSearchAiProfile.subject}`,
          value: smartSearchAiProfile.inspections,
          detail: 'INSPECTIONS SCHEDULED · NEXT 15 DAYS',
          delta: '',
          tone: tokenBrand.main,
          icon: <CalendarTodayOutlinedIcon sx={{ fontSize: 16 }} />,
          actionLabel: smartSearchAiProfile.actionLabels[3],
          action: () => openSmartSearchChat(`Show the inspection calendar context for "${smartSearchQuery}" in ${smartSearchSelectedHierarchyNode.label}. Explain the timing gap, the next scheduled inspection, and whether an earlier inspection is warranted.`),
        },
      ]
    : (smartSearchInsight?.findings ?? []).map((finding, index) => ({
        label: finding.label,
        value: finding.value,
        detail: index === 0 ? 'Strongest matching evidence' : index === 1 ? 'Related operational records' : 'Current search scope',
        delta: index === 0 ? 'Top match' : index === 1 ? 'Connected' : 'Context',
        tone: finding.tone,
        icon: index === 0
          ? <DescriptionOutlinedIcon sx={{ fontSize: 16 }} />
          : index === 1
            ? <AssignmentTurnedInOutlinedIcon sx={{ fontSize: 16 }} />
            : <SearchIcon sx={{ fontSize: 16 }} />,
        actionLabel: index === 0 ? 'REVIEW TOP EVIDENCE' : index === 1 ? 'REVIEW RELATED WORK' : 'ASK ABOUT THIS CONTEXT',
        action: () => openSmartSearchChat(`Explain ${finding.label}: ${finding.value} in the context of the Smart Search query "${smartSearchQuery}". Use the connected sources and recommend the next useful action.`),
      }));
  const smartSearchSummaryFollowUps = smartSearchUsesOperationalBrief
    ? smartSearchAiProfile.followUps
    : smartSearchInsight?.followUps ?? [];
  useEffect(() => {
    if (smartSearchView !== 'results' || smartSearchLoading || !smartSearchAiSummaryText) {
      setSmartSearchSummaryTypedText('');
      setSmartSearchSummaryVisibleMetricCount(0);
      return;
    }

    setSmartSearchSummaryTypedText('');
    setSmartSearchSummaryVisibleMetricCount(0);
    setSmartSearchSummaryFeedback(null);
    let characterIndex = 0;
    const typingIntervalId = window.setInterval(() => {
      characterIndex += 12;
      setSmartSearchSummaryTypedText(smartSearchAiSummaryText.slice(0, characterIndex));
      setSmartSearchSummaryVisibleMetricCount(Math.min(
        smartSearchAiMetrics.length,
        Math.floor((characterIndex / smartSearchAiSummaryText.length) * (smartSearchAiMetrics.length + 1)),
      ));
      if (characterIndex >= smartSearchAiSummaryText.length) {
        window.clearInterval(typingIntervalId);
        setSmartSearchSummaryVisibleMetricCount(smartSearchAiMetrics.length);
      }
    }, 24);

    return () => window.clearInterval(typingIntervalId);
  }, [smartSearchAiMetrics.length, smartSearchAiSummaryText, smartSearchLoading, smartSearchQuery, smartSearchView]);

  const smartSearchSummaryIsTyping = smartSearchSummaryTypedText.length < smartSearchAiSummaryText.length;

  const renderSmartSearchAiSummary = () => {
    if (!smartSearchInsight) return null;

    return (
      <>
      <Paper
        elevation={0}
        sx={{
          mt: 1.5,
          p: { xs: 1.5, md: 2 },
          borderRadius: '12px',
          border: 'none',
          bgcolor: tokenNeutral.lightest,
          boxShadow: 'none',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.5, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
            <AutoAwesomeIcon sx={{ color: tokenWarning.dark, fontSize: 18 }} />
            <Typography sx={{ color: tokenBrand.main, fontWeight: 700, fontSize: '1rem', lineHeight: 1.2 }}>
              AI Summary
            </Typography>
            <Chip
              size="small"
              label="High confidence"
              sx={{ height: 24, borderRadius: '6px', bgcolor: tokenSuccess.softBg, color: tokenSuccess.darker, fontSize: 11, fontWeight: 700 }}
            />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Tooltip title="Helpful summary">
              <IconButton
                aria-label="Helpful summary"
                onClick={() => setSmartSearchSummaryFeedback('up')}
                sx={{ width: 30, height: 30, borderRadius: '6px', color: smartSearchSummaryFeedback === 'up' ? tokenBrand.main : tokenText.secondary, bgcolor: smartSearchSummaryFeedback === 'up' ? tokenBrand.softBg : 'transparent' }}
              >
                <ThumbUpOutlinedIcon sx={{ fontSize: 17 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Summary needs improvement">
              <IconButton
                aria-label="Summary needs improvement"
                onClick={() => setSmartSearchSummaryFeedback('down')}
                sx={{ width: 30, height: 30, borderRadius: '6px', color: smartSearchSummaryFeedback === 'down' ? tokenError.main : tokenText.secondary, bgcolor: smartSearchSummaryFeedback === 'down' ? tokenError.softBg : 'transparent' }}
              >
                <ThumbDownOutlinedIcon sx={{ fontSize: 17 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title={smartSearchSummaryExpanded ? 'Collapse AI Summary' : 'Expand AI Summary'}>
              <IconButton
                aria-label={smartSearchSummaryExpanded ? 'Collapse AI Summary' : 'Expand AI Summary'}
                onClick={() => setSmartSearchSummaryExpanded((current) => !current)}
                sx={{ width: 30, height: 30, borderRadius: '6px', color: tokenBrand.main }}
              >
                {smartSearchSummaryExpanded ? <ExpandLessIcon sx={{ fontSize: 19 }} /> : <ExpandMoreIcon sx={{ fontSize: 19 }} />}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {smartSearchSummaryExpanded ? (
        <>
        <Typography sx={{ mt: 1.5, minHeight: 44, color: tokenBrand.dark, fontSize: 14, lineHeight: 1.55, maxWidth: 1320 }}>
          {smartSearchSummaryTypedText}
          {smartSearchSummaryIsTyping ? (
            <Box
              component="span"
              aria-hidden="true"
              sx={{
                display: 'inline-block',
                width: 7,
                ml: 0.2,
                color: tokenBrand.main,
                animation: 'smart-search-atlas-caret 0.8s steps(1) infinite',
                '@keyframes smart-search-atlas-caret': { '50%': { opacity: 0 } },
              }}
            >
              |
            </Box>
          ) : null}
        </Typography>

        <Box
          sx={{
            mt: 1.5,
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, minmax(0, 1fr))',
              lg: `repeat(${Math.min(4, smartSearchAiMetrics.length)}, minmax(0, 1fr))`,
            },
            gap: 1,
          }}
        >
          {smartSearchAiMetrics.slice(0, smartSearchSummaryVisibleMetricCount).map((metric) => (
            <Box
              key={metric.label}
              sx={{
                minWidth: 0,
                animation: 'smart-search-atlas-card-in 180ms ease both',
                '@keyframes smart-search-atlas-card-in': {
                  from: { opacity: 0, transform: 'translateY(6px)' },
                  to: { opacity: 1, transform: 'translateY(0)' },
                },
              }}
            >
              <Paper
                elevation={0}
                sx={{ p: 1.5, minHeight: 112, borderRadius: '12px', border: `1px solid ${tokenDivider}`, bgcolor: 'background.paper', boxShadow: '0 2px 7px rgba(15,23,42,0.06)' }}
              >
                <Typography sx={{ color: tokenText.secondary, fontSize: 11.5, lineHeight: 1.3, fontWeight: 500, minHeight: 30 }}>
                  {metric.label}
                </Typography>
                <Box sx={{ mt: 0.6, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 0.75 }}>
                  <Typography sx={{ color: tokenText.primary, fontSize: 26, lineHeight: 1, fontWeight: 500 }}>
                    {metric.value}
                  </Typography>
                  {metric.delta ? (
                    <Chip
                      size="small"
                      icon={metric.icon}
                      label={metric.delta}
                      sx={{ height: 24, borderRadius: '999px', bgcolor: tokenNeutral.lightest, color: metric.tone, border: `1px solid ${tokenDivider}`, fontSize: 10.5, fontWeight: 700, '& .MuiChip-icon': { color: metric.tone } }}
                    />
                  ) : <Box sx={{ color: metric.tone }}>{metric.icon}</Box>}
                </Box>
                <Typography sx={{ mt: 0.85, color: tokenText.secondary, fontSize: 10.5, lineHeight: 1.25, fontWeight: 700 }}>
                  {metric.detail}
                </Typography>
              </Paper>
              <Button
                variant="text"
                size="small"
                onClick={metric.action}
                endIcon={<ArrowOutwardIcon sx={{ fontSize: 15 }} />}
                sx={{ display: 'flex', ml: 'auto', mt: 0.4, minHeight: 28, px: 0.5, borderRadius: '6px', color: tokenBrand.main, textTransform: 'none', fontSize: 11, fontWeight: 700, '& .MuiButton-endIcon': { ml: 0.45 }, '&:hover': { bgcolor: tokenBrand.softBg } }}
              >
                {metric.actionLabel}
              </Button>
            </Box>
          ))}
        </Box>

        <Box sx={{ mt: 1.5, pt: 1.25, borderTop: `1px solid ${tokenDivider}`, display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <Typography sx={{ color: tokenText.secondary, fontSize: 10.5 }}>
            Generated from connected operational sources · Updated just now
          </Typography>
        </Box>
        </>
        ) : null}

      </Paper>
      {!smartSearchSummaryIsTyping && smartSearchSummaryVisibleMetricCount >= smartSearchAiMetrics.length && smartSearchSummaryFollowUps.length ? (
        <Box sx={{ px: 1.15, pt: 1.35, pb: 0.85, display: 'flex', alignItems: 'center', gap: { xs: 1.4, md: 2.1 }, flexWrap: 'wrap' }}>
          {smartSearchSummaryFollowUps.map((followUp, index) => (
            <Button
              key={followUp}
              variant="text"
              size="small"
              onClick={() => openSmartSearchChat(`${followUp} Use the current Smart Search context for "${smartSearchQuery}" in ${smartSearchSelectedHierarchyNode.label}.`)}
              endIcon={<ArrowOutwardIcon sx={{ fontSize: 14 }} />}
              sx={{ minWidth: 0, p: 0, color: tokenText.secondary, textTransform: 'none', fontSize: 11.4, fontWeight: 400, lineHeight: 1.35, opacity: 0, animation: 'smart-search-follow-up-in 220ms ease forwards', animationDelay: `${index * 110}ms`, '@keyframes smart-search-follow-up-in': { from: { opacity: 0, transform: 'translateY(4px)' }, to: { opacity: 1, transform: 'translateY(0)' } }, '&:hover': { bgcolor: 'transparent', color: tokenBrand.main }, '& .MuiButton-endIcon': { ml: 0.4 } }}
            >
              {followUp}
            </Button>
          ))}
        </Box>
      ) : null}
      </>
    );
  };

  const renderSmartSearchDefaultBrief = () => {
    if (smartSearchExperienceMode !== 'default' || smartSearchActiveTab !== 'All' || smartSearchLoading) return null;
    if (smartSearchEngineResult.stats.totalMatches === 0) return null;

    const hotCategories = smartSearchEngineResult.stats.topCategories.slice(0, 4);

    return (
      <Paper
        elevation={0}
        sx={{
          mb: 1.5,
          p: 1.5,
          borderRadius: '12px',
          border: `1px solid ${tokenDivider}`,
          bgcolor: tokenNeutral.lightest,
        }}
      >
        <Typography sx={{ color: tokenText.primary, fontWeight: 700, fontSize: 14, mb: 1 }}>
          Operational brief
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 1 }}>
          {hotCategories.map((entry) => (
            <Box key={entry.category} sx={{ p: 1, borderRadius: '8px', bgcolor: 'background.paper', border: `1px solid ${tokenDivider}` }}>
              <Typography sx={{ color: tokenText.secondary, fontSize: 10.5, fontWeight: 600, textTransform: 'uppercase' }}>
                {entry.category}
              </Typography>
              <Typography sx={{ color: tokenBrand.main, fontSize: 22, fontWeight: 700, lineHeight: 1.1, mt: 0.35 }}>
                {entry.count}
              </Typography>
              <Typography sx={{ color: tokenText.secondary, fontSize: 10, mt: 0.25 }}>matches</Typography>
            </Box>
          ))}
        </Box>
      </Paper>
    );
  };

  const renderSmartSearchTrend = (
    points: number[],
    tone: string,
    anomalies: number[] = [],
    height = 140,
    options?: {
      critical?: number;
      warning?: number;
      xLabels?: string[];
      yLabel?: string;
    }
  ) => {
    const width = 760;
    const chartTop = 18;
    const chartBottom = height - 34;
    const chartLeft = 24;
    const chartRight = width - 10;
    const plottedMax = Math.max(...points, options?.critical ?? 0, options?.warning ?? 0, 8);
    const plottedMin = 0;
    const range = plottedMax - plottedMin || 1;
    const yForValue = (value: number) => chartBottom - (((value - plottedMin) / range) * (chartBottom - chartTop));
    const path = points
      .map((point, index) => {
        const x = chartLeft + (index / (points.length - 1 || 1)) * (chartRight - chartLeft);
        const y = yForValue(point);
        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
    const gridValues = [0, 2, 4, 6, 8];
    const xLabels = options?.xLabels ?? defaultTimeSeriesLabels;
    const warningY = yForValue(options?.warning ?? 3);
    const criticalY = yForValue(options?.critical ?? 4.5);

    return (
      <Box component="svg" viewBox={`0 0 ${width} ${height}`} sx={{ width: '100%', height }}>
        {gridValues.map((value) => {
          const y = yForValue(value);
          return (
            <React.Fragment key={`grid-${value}`}>
              <line x1={chartLeft} y1={y} x2={chartRight} y2={y} stroke="#E5E7EB" strokeDasharray="3 4" />
              <text x={chartLeft - 6} y={y + 4} textAnchor="end" fontSize="10" fill="#94A3B8">{value}</text>
            </React.Fragment>
          );
        })}
        <line x1={chartLeft} y1={warningY} x2={chartRight} y2={warningY} stroke="#F97316" strokeDasharray="4 4" />
        <line x1={chartLeft} y1={criticalY} x2={chartRight} y2={criticalY} stroke="#EF4444" strokeDasharray="4 4" />
        <path d={path} fill="none" stroke={tone} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((point, index) => {
          if (!anomalies.includes(index)) return null;
          const x = chartLeft + (index / (points.length - 1 || 1)) * (chartRight - chartLeft);
          const y = yForValue(point);
          return (
            <g key={`anomaly-${index}`}>
              <circle cx={x} cy={y} r="10" fill="none" stroke="#E43B46" strokeWidth="2" opacity="0.5">
                <animate attributeName="r" values="6;13;6" dur="1.2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.75;0.05;0.75" dur="1.2s" repeatCount="indefinite" />
              </circle>
              <circle cx={x} cy={y} r="5" fill="#E43B46" stroke="white" strokeWidth="2" />
            </g>
          );
        })}
        <line x1={chartLeft} y1={chartBottom} x2={chartRight} y2={chartBottom} stroke="#CBD5E1" />
        <line x1={chartLeft} y1={chartTop} x2={chartLeft} y2={chartBottom} stroke="#CBD5E1" />
        {xLabels.map((label, index) => {
          const x = chartLeft + (index / (xLabels.length - 1 || 1)) * (chartRight - chartLeft);
          return <text key={`label-${label}`} x={x} y={height - 10} textAnchor="middle" fontSize="10" fill="#94A3B8">{label}</text>;
        })}
        <text x={18} y={(chartTop + chartBottom) / 2} textAnchor="middle" fontSize="10" fill="#64748B" transform={`rotate(-90 18 ${(chartTop + chartBottom) / 2})`}>
          {options?.yLabel ?? 'MM/S'}
        </text>
        <text x={chartRight - 2} y={warningY - 4} textAnchor="end" fontSize="10" fill="#F97316">Warning</text>
      </Box>
    );
  };

  const smartSearchHighlightTerms = Array.from(
    new Set((((smartSearchQuery || smartSearchInput || '').toLowerCase().match(/[a-z0-9]+/g) ?? []) as string[]).filter((term) => term.length >= 5))
  );

  const normalizeSmartSearchText = (value?: string) => (value ?? '')
    .replace(/\u00e2\u20ac\u00a2/g, '\u2022')
    .replace(/\u00c3\u00a2\u00e2\u20ac\u0161\u00c2\u00ac\u00c3\u201a\u00c2\u00a2/g, '\u2022');

  const getSmartSearchResultType = (item: any) => {
    if (item.kind === 'task') return item.taskType ?? 'Work Order';
    if (item.kind === 'document') return item.fileType ? `${item.fileType} Document` : 'Document';
    if (item.kind === 'notification') return 'Notification';
    if (item.kind === 'asset') return 'Asset';
    if (item.kind === 'timeSeries') return 'Timeseries Data';
    if (item.kind === 'training') return 'Training';
    if (item.kind === 'action') return 'Action';
    if (item.kind === 'eso') return item.detail?.esoType ?? 'ESO';
    if (item.kind === 'shiftNote') return 'Shift Note';
    if (item.kind === '3d') return '3D';
    return 'Result';
  };

  const getSmartSearchSourceSystem = (item: any) => {
    if (item.kind === 'task') return 'Work Management';
    if (item.kind === 'document') return 'Document Management';
    if (item.kind === 'notification') return 'Control Tower';
    if (item.kind === 'asset' || item.kind === 'timeSeries') return 'Maintenance Hub';
    if (item.kind === 'training') return 'Training Library';
    if (item.kind === 'action') return 'Action Tracker';
    if (item.kind === 'eso') return 'ESO Hub';
    if (item.kind === 'shiftNote') return 'Shift Logbook';
    if (item.kind === '3d') return 'Spatial View';
    return 'Smart Search';
  };

  const openSmartSearchResult = (item: any) => {
    if (!item) return;
    if (item.kind === 'task') setCurrentScreen('maintenance_followup');
    else if (item.kind === 'action') setCurrentScreen('action_tracker');
    else if (item.kind === 'eso') setCurrentScreen('eso_hub');
    else if (item.kind === 'shiftNote') setCurrentScreen('shift_logbook');
    else if (item.kind === 'notification') setCurrentScreen('control_tower');
    else if (item.kind === 'asset' || item.kind === 'timeSeries') setCurrentScreen('maintenance_hub');
    else if (item.kind === 'document') setCurrentScreen('document_management');
    else setCurrentScreen('shift_logbook');
  };

  const copySmartSearchResultLink = async (item: any) => {
    if (!item || typeof navigator === 'undefined' || !navigator.clipboard?.writeText) return;
    await navigator.clipboard.writeText(`smart-search://result/${item.id}`);
  };

  const getSmartSearchDetailActions = (item: any) => {
    if (!item) return [];
    if (item.kind === 'document') {
      return [
        { label: 'Open Document', variant: 'contained' as const, action: () => openSmartSearchResult(item) },
        { label: 'Copy Link', variant: 'outlined' as const, action: () => { void copySmartSearchResultLink(item); } },
      ];
    }
    if (item.kind === 'task') {
      return [
        { label: 'Open Workflow', variant: 'contained' as const, action: () => openSmartSearchResult(item) },
        { label: 'Open Work Order', variant: 'outlined' as const, action: () => openSmartSearchResult(item) },
        { label: 'Copy Link', variant: 'outlined' as const, action: () => { void copySmartSearchResultLink(item); } },
      ];
    }
    if (item.kind === 'asset') {
      return [
        { label: 'Open Asset', variant: 'contained' as const, action: () => openSmartSearchResult(item) },
        { label: 'View Asset Details', variant: 'outlined' as const, action: () => openSmartSearchResult(item) },
        { label: 'Copy Link', variant: 'outlined' as const, action: () => { void copySmartSearchResultLink(item); } },
      ];
    }
    if (item.kind === 'timeSeries') {
      return [
        { label: 'Open Timeseries', variant: 'contained' as const, action: () => openSmartSearchResult(item) },
        { label: 'View Trend', variant: 'outlined' as const, action: () => openSmartSearchResult(item) },
        { label: 'Copy Link', variant: 'outlined' as const, action: () => { void copySmartSearchResultLink(item); } },
      ];
    }
    if (item.kind === 'notification') {
      return [
        { label: 'Open Related Workflow', variant: 'contained' as const, action: () => openSmartSearchResult(item) },
        { label: 'Copy Link', variant: 'outlined' as const, action: () => { void copySmartSearchResultLink(item); } },
      ];
    }
    if (item.kind === 'action') {
      return [
        { label: 'Open Action', variant: 'contained' as const, action: () => openSmartSearchResult(item) },
        { label: 'Copy Link', variant: 'outlined' as const, action: () => { void copySmartSearchResultLink(item); } },
      ];
    }
    if (item.kind === 'eso') {
      return [
        { label: 'Open ESO', variant: 'contained' as const, action: () => openSmartSearchResult(item) },
        { label: 'Copy Link', variant: 'outlined' as const, action: () => { void copySmartSearchResultLink(item); } },
      ];
    }
    if (item.kind === 'shiftNote') {
      return [
        { label: 'Open Shift Note', variant: 'contained' as const, action: () => openSmartSearchResult(item) },
        { label: 'Copy Link', variant: 'outlined' as const, action: () => { void copySmartSearchResultLink(item); } },
      ];
    }
    return [
      { label: 'Open Result', variant: 'contained' as const, action: () => openSmartSearchResult(item) },
      { label: 'Copy Link', variant: 'outlined' as const, action: () => { void copySmartSearchResultLink(item); } },
    ];
  };

  const getSmartSearchMetadataRows = (item: any) => {
    if (!item) return [];
    const tags = Array.from(new Set((item.keywords ?? []).slice(0, 6)));
    if (item.kind === 'action') {
      return [
        { label: 'Action title', value: item.title },
        { label: 'Action ID', value: item.detail?.actionId ?? item.id },
        { label: 'Owner', value: item.detail?.owner ?? null },
        { label: 'Assigned to', value: item.detail?.assignedTo ?? null },
        { label: 'Status', value: item.status ?? null },
        { label: 'Priority', value: item.priority ?? null },
        { label: 'Due date', value: item.detail?.dueDate ?? item.updated ?? null },
        { label: 'Source', value: item.detail?.source ?? getSmartSearchSourceSystem(item) },
        { label: 'Related line / area', value: item.plant ?? null },
        { label: 'Related shift or meeting', value: item.detail?.relatedShift ?? null },
        { label: 'Description', value: item.detail?.description ?? item.summary ?? null },
      ].filter((row) => row.value);
    }
    if (item.kind === 'eso') {
      return [
        { label: 'ESO title', value: item.title },
        { label: 'ESO ID', value: item.detail?.esoId ?? item.id },
        { label: 'Type', value: item.detail?.esoType ?? null },
        { label: 'Status', value: item.status ?? null },
        { label: 'Priority / severity', value: item.priority ?? item.detail?.severity ?? null },
        { label: 'Reported by', value: item.detail?.reportedBy ?? null },
        { label: 'Assigned to', value: item.detail?.assignedTo ?? null },
        { label: 'Location', value: item.location ?? null },
        { label: 'Line / area', value: item.plant ?? null },
        { label: 'Created date', value: item.detail?.createdDate ?? item.updated ?? null },
        { label: 'Related incident / non-conformance', value: item.detail?.relatedIncident ?? null },
        { label: 'Description', value: item.detail?.description ?? item.summary ?? null },
      ].filter((row) => row.value);
    }
    if (item.kind === 'shiftNote') {
      return [
        { label: 'Note title', value: item.title },
        { label: 'Note ID', value: item.detail?.noteId ?? item.id },
        { label: 'Shift', value: item.detail?.shift ?? null },
        { label: 'Crew', value: item.detail?.crew ?? null },
        { label: 'Line / area', value: item.plant ?? null },
        { label: 'Created by', value: item.detail?.createdBy ?? null },
        { label: 'Created date', value: item.detail?.createdDate ?? item.updated ?? null },
        { label: 'Related issue / action', value: item.detail?.relatedIssue ?? null },
        { label: 'Tags', value: Array.isArray(item.detail?.tags) ? item.detail.tags.join(' • ') : null },
        { label: 'Description', value: item.detail?.description ?? item.summary ?? null },
      ].filter((row) => row.value);
    }
    return [
      { label: 'Result title', value: item.title },
      { label: 'Type', value: getSmartSearchResultType(item) },
      { label: 'Source system', value: getSmartSearchSourceSystem(item) },
      { label: 'Folder hierarchy / path', value: item.detail?.folderPath?.join(' / ') ?? null },
      { label: 'Location / origin', value: item.location },
      { label: 'Plant / cell / line', value: item.plant },
      { label: 'Asset / equipment', value: item.detail?.equipment ?? item.detail?.asset ?? item.detail?.focusArea ?? item.detail?.machine ?? null },
      { label: 'Related work order / task ID', value: item.detail?.workOrderId ?? item.detail?.taskId ?? item.id },
      { label: 'Status', value: item.taskState ?? item.status ?? null },
      { label: 'Priority', value: item.priority ?? item.detail?.priority ?? null },
      { label: 'Date / last updated', value: item.updated ?? null },
      { label: 'Owner / assigned person', value: item.detail?.owner ?? null },
      { label: 'Related tags', value: tags.length ? tags.join(' • ') : null },
      { label: 'Short description', value: item.summary ?? item.detail?.summary ?? null },
    ].filter((row) => row.value);
  };

  const navigateSmartSearchDocumentFolder = (item: any) => {
    const hierarchyId = item.detail?.hierarchyId;
    if (hierarchyId) {
      const path = findHeaderHierarchyPath(hierarchyId) ?? [];
      if (path.length) {
        setSmartSearchHierarchyExpandedIds(getHeaderHierarchyExpandablePathIds(hierarchyId));
        setSmartSearchHierarchySelectedId(hierarchyId);
        setSmartSearchSelectedItem(item);
        return;
      }
    }
    setSmartSearchFilters((prev) => ({ ...prev, location: item.location || prev.location }));
  };

  const buildSmartSearchDocumentFolders = (items: any[]) => {
    const folderMap = new Map<string, { folderPath: string[]; hierarchyId?: string; location?: string; plant?: string; sourceSystem?: string; childCount: number; isLeaf: boolean }>();
    items.forEach((item) => {
      const folderPath = Array.isArray(item.detail?.folderPath) ? item.detail.folderPath : null;
      if (!folderPath?.length) return;
      folderPath.forEach((_, index) => {
        const partialPath = folderPath.slice(0, index + 1);
        const key = partialPath.join(' / ');
        const existing = folderMap.get(key);
        if (existing) {
          existing.childCount += 1;
          if (index === folderPath.length - 1) existing.isLeaf = true;
        } else {
          folderMap.set(key, {
            folderPath: partialPath,
            hierarchyId: item.detail?.hierarchyId,
            location: item.location,
            plant: item.plant,
            sourceSystem: getSmartSearchSourceSystem(item),
            childCount: 1,
            isLeaf: index === folderPath.length - 1,
          });
        }
      });
    });
    return Array.from(folderMap.values()).sort((a, b) => {
      const depthDiff = a.folderPath.length - b.folderPath.length;
      if (depthDiff !== 0) return depthDiff;
      return a.folderPath.join(' / ').localeCompare(b.folderPath.join(' / '));
    });
  };

  const matchesSmartSearchFolderPath = (candidatePath: string[], targetPath: string[]) => (
    targetPath.every((segment, index) => candidatePath[index] === segment)
  );

  const getSmartSearchVisibleDocumentFolders = (
    folders: Array<{ folderPath: string[]; childCount: number; isLeaf: boolean; hierarchyId?: string; location?: string; plant?: string; sourceSystem?: string }>,
    activePath: string[] | null,
  ) => {
    if (!activePath?.length) {
      return folders.filter((folder) => folder.isLeaf);
    }
    return folders.filter((folder) => folder.folderPath.length === activePath.length + 1 && matchesSmartSearchFolderPath(folder.folderPath, activePath));
  };

  const getSmartSearchVisibleDocuments = (items: any[], activePath: string[] | null) => {
    if (!activePath?.length) return items;
    return items.filter((item) => {
      const folderPath = Array.isArray(item.detail?.folderPath) ? item.detail.folderPath : [];
      return folderPath.join(' / ') === activePath.join(' / ');
    });
  };

  const openSmartSearchDocumentFolder = (folder: { folderPath: string[]; hierarchyId?: string; location?: string }) => {
    setSmartSearchDocumentFolderPath(folder.folderPath);
    if (folder.hierarchyId) {
      setSmartSearchHierarchyExpandedIds(getHeaderHierarchyExpandablePathIds(folder.hierarchyId));
      setSmartSearchHierarchySelectedId(folder.hierarchyId);
    } else if (folder.location) {
      setSmartSearchFilters((prev) => ({ ...prev, location: folder.location || prev.location }));
    }
    setSmartSearchSelectedItem(null);
  };

  const renderSmartSearchOpenTitle = (item: any, sx: any) => (
    <Box
      component="span"
      onClick={(event: React.MouseEvent) => {
        event.stopPropagation();
        openSmartSearchResult(item);
      }}
      sx={{
        cursor: 'pointer',
        textDecoration: 'none',
        '&:hover': { textDecoration: 'underline' },
        ...sx,
      }}
    >
      {item.title}
    </Box>
  );

  const renderHighlightedSmartSearchText = (value?: string) => {
    const normalized = normalizeSmartSearchText(value);
    if (!normalized) return null;
    if (!smartSearchHighlightTerms.length) return normalized;

    const escapedTerms = smartSearchHighlightTerms.map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const regex = new RegExp(`(${escapedTerms.join('|')})`, 'ig');

    return normalized.split(regex).map((part, index) => (
      smartSearchHighlightTerms.includes(part.toLowerCase()) ? (
        <Box
          key={`${part}-${index}`}
          component="mark"
          sx={{
            px: 0.18,
            py: 0,
            bgcolor: '#FFF29A',
            color: 'inherit',
            borderRadius: 0.5,
          }}
        >
          {part}
        </Box>
      ) : (
        <React.Fragment key={`${part}-${index}`}>{part}</React.Fragment>
      )
    ));
  };

  const getSmartSearchMetaParts = (item: any) => {
    const normalizedSubtitle = normalizeSmartSearchText(item.subtitle);
    const subtitleParts = normalizedSubtitle ? normalizedSubtitle.split('â€¢').map((part) => part.trim()).filter(Boolean) : [];
    const withoutFileType = subtitleParts.filter((part) => part.toUpperCase() !== (item.fileType ?? '').toUpperCase());
    return withoutFileType.length ? withoutFileType : subtitleParts;
  };

  const getSmartSearchDocumentTypeStyles = (fileType: string) => {
    const normalizedType = fileType.toUpperCase();
    if (normalizedType === 'PDF') return { bg: tokenError.lightest, fg: tokenError.dark };
    if (normalizedType === 'XLS' || normalizedType === 'CSV') return { bg: tokenSuccess.lightest, fg: tokenSuccess.dark };
    if (normalizedType === 'PNG' || normalizedType === 'JPG') return { bg: tokenWarning.lightest, fg: tokenWarning.dark };
    if (normalizedType === 'DWG' || normalizedType === 'CAD') return { bg: tokenInfo.lightest, fg: tokenInfo.dark };
    return { bg: tokenBrand.softBg, fg: tokenBrand.main };
  };

  const getSmartSearchDocumentPathText = (path: string[] | undefined) => (path ?? []).join(' / ');
  const getSmartSearchDocumentTags = (item: any) => (item.keywords ?? []).slice(0, 3);
  const getSmartSearchKindBadgeLabel = (item: any) => {
    if (item.kind === 'action') return 'ACTION';
    if (item.kind === 'eso') return 'ESO';
    if (item.kind === 'shiftNote') return 'NOTE';
    if (item.kind === 'asset') return 'ASSET';
    if (item.kind === '3d') return '3D';
    return 'ITEM';
  };

  const getSmartSearchStatusTone = (status?: string) => {
    const normalizedStatus = (status ?? '').toLowerCase();
    if (normalizedStatus.includes('overdue') || normalizedStatus.includes('risk') || normalizedStatus.includes('critical')) {
      return { bg: tokenError.lightest, fg: tokenError.dark, border: tokenError.light };
    }
    if (normalizedStatus.includes('warning') || normalizedStatus.includes('high') || normalizedStatus.includes('attention')) {
      return { bg: tokenWarning.lightest, fg: tokenWarning.dark, border: tokenWarning.light };
    }
    if (normalizedStatus.includes('completed') || normalizedStatus.includes('active') || normalizedStatus.includes('normal')) {
      return { bg: tokenSuccess.lightest, fg: tokenSuccess.dark, border: tokenSuccess.light };
    }
    return { bg: tokenBrand.softBg, fg: tokenBrand.main, border: tokenBrand.lightest };
  };

  const getSmartSearchPriorityTone = (priority?: string) => {
    const normalizedPriority = (priority ?? '').toLowerCase();
    if (normalizedPriority.includes('critical')) return { bg: tokenError.lightest, fg: tokenError.dark, border: tokenError.light };
    if (normalizedPriority.includes('high')) return { bg: tokenWarning.lightest, fg: tokenWarning.dark, border: tokenWarning.light };
    if (normalizedPriority.includes('low')) return { bg: tokenSuccess.lightest, fg: tokenSuccess.dark, border: tokenSuccess.light };
    return { bg: tokenNeutral.lightest, fg: tokenText.secondary, border: tokenDivider };
  };

  const getSmartSearchResultRowSx = (isSelected: boolean, gridTemplateColumns: any) => ({
    display: 'grid',
    gridTemplateColumns,
    gap: 1.5,
    py: 1.5,
    px: 1,
    cursor: 'pointer',
    borderBottom: `1px solid ${tokenDivider}`,
    borderRadius: '12px',
    bgcolor: isSelected ? tokenBrand.selectedBg : 'transparent',
    transition: 'background-color 160ms ease, border-color 160ms ease',
    '&:hover': { bgcolor: isSelected ? tokenBrand.selectedBg : tokenNeutral.lightest },
  });

  const getSmartSearchSelectionCardSx = (isSelected: boolean) => ({
    borderRadius: '16px',
    border: `1px solid ${isSelected ? tokenBrand.light : tokenDivider}`,
    bgcolor: 'background.paper',
    boxShadow: 'none',
    transition: 'transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease',
    '&:hover': {
      borderColor: tokenBrand.light,
      boxShadow: 'none',
    },
  });

  const getSmartSearchNeutralChipSx = () => ({
    height: 20,
    bgcolor: tokenNeutral.lightest,
    color: tokenText.secondary,
    border: `1px solid ${tokenDivider}`,
    '& .MuiChip-label': { px: 0.75, fontSize: 10.2, fontWeight: 700 },
  });

  const renderSmartSearchResultCard = (item: any) => {
    const isSelected = smartSearchSelectedItem?.id === item.id;
    const metaParts = getSmartSearchMetaParts(item);

    if (item.kind === 'task') {
      return (
        <Box
          key={item.id}
          onClick={() => setSmartSearchSelectedItem(item)}
          sx={{
            display: 'grid',
            gridTemplateColumns: '88px 1fr',
            gap: 1.2,
            py: 1.25,
            px: 0.6,
            cursor: 'pointer',
            borderBottom: '1px solid #F0F3F8',
            borderRadius: 2,
            bgcolor: isSelected ? '#F8FBFF' : 'transparent',
            '&:hover': { bgcolor: '#FAFCFF' },
          }}
        >
          <Box sx={{ position: 'relative', width: 88, minHeight: 88 }}>
            <Box
              sx={{
                width: 88,
                height: 88,
                borderRadius: 1.8,
                border: '1px solid #E6EDF8',
                bgcolor: '#FFFFFF',
                display: 'grid',
                placeItems: 'center',
                boxShadow: '0 10px 22px rgba(15,23,42,0.04)',
              }}
            >
              <Box sx={{ width: 56, height: 56, borderRadius: 1.4, bgcolor: '#EFF6FF', color: '#2563EB', display: 'grid', placeItems: 'center', border: '1px solid #BFDBFE' }}>
                <AssignmentTurnedInOutlinedIcon sx={{ fontSize: 30 }} />
              </Box>
            </Box>
            <Box sx={{ position: 'absolute', top: 8, right: 8, width: 18, height: 18, borderRadius: '50%', bgcolor: item.taskType === 'Task' ? '#F4E8FF' : '#E8F0FF', color: item.taskType === 'Task' ? '#A855F7' : '#60A5FA', display: 'grid', placeItems: 'center' }}>
              <AssignmentTurnedInOutlinedIcon sx={{ fontSize: 12 }} />
            </Box>
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.65, flexWrap: 'wrap' }}>
              <Chip label={item.taskType ?? 'Work Order'} size="small" sx={{ height: 18, bgcolor: '#F8FAFC', color: '#5B6472', fontWeight: 700, '& .MuiChip-label': { px: 0.65, fontSize: 10 } }} />
              <Chip label={(item.taskState ?? item.status ?? '').toUpperCase()} size="small" sx={{ height: 18, bgcolor: item.taskState === 'Overdue' ? '#FDECEC' : '#EEF4FF', color: item.taskState === 'Overdue' ? '#D9485F' : '#2563EB', fontWeight: 800, '& .MuiChip-label': { px: 0.65, fontSize: 10 } }} />
              <Chip label={(item.priority ?? 'Medium').toUpperCase()} size="small" sx={{ height: 18, bgcolor: item.priority === 'Critical' ? '#FDECEC' : item.priority === 'High' ? '#FFF3E3' : '#EEF8F0', color: item.priority === 'Critical' ? '#D9485F' : item.priority === 'High' ? '#C97A19' : '#2F9E5B', fontWeight: 800, '& .MuiChip-label': { px: 0.65, fontSize: 10 } }} />
            </Box>
            <Typography sx={{ fontSize: 18, color: '#2563EB', fontWeight: 500, lineHeight: 1.22, mt: 0.45 }}>
              {renderSmartSearchOpenTitle(item, { color: 'inherit' })}
            </Typography>
            <Typography sx={{ fontSize: 13.1, color: '#374151', lineHeight: 1.5, mt: 0.45 }}>
              {renderHighlightedSmartSearchText(item.summary)}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap', mt: 0.65 }}>
              <Typography variant="caption" sx={{ color: '#7B8798' }}>Assigned to: {item.detail.owner}</Typography>
              <Typography variant="caption" sx={{ color: '#B8C1CC' }}>•</Typography>
              <Typography variant="caption" sx={{ color: '#7B8798' }}>Equipment: {item.detail.equipment ?? item.plant}</Typography>
              <Typography variant="caption" sx={{ color: '#B8C1CC' }}>•</Typography>
              <Typography variant="caption" sx={{ color: '#7B8798' }}>{item.updated}</Typography>
            </Box>
            <Button size="small" variant="text" onClick={(event) => { event.stopPropagation(); setSmartSearchSelectedItem(item); }} sx={{ mt: 0.4, px: 0, minWidth: 0, color: '#6B7280', fontSize: 12, fontWeight: 500, textTransform: 'none' }}>
              More details
            </Button>
          </Box>
        </Box>
      );
    }

    if (item.kind === 'training') {
      const thumbnail = item.thumbnail ?? '/images/Line1.png';

      return (
        <Box
          key={item.id}
          onClick={() => setSmartSearchSelectedItem(item)}
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '220px 1fr' },
            gap: 1.15,
            py: 1.1,
            px: 0.45,
            cursor: 'pointer',
            borderBottom: '1px solid #F0F3F8',
            borderRadius: 2,
            bgcolor: isSelected ? '#F8FBFF' : 'transparent',
            '&:hover': {
              bgcolor: '#FAFCFF',
              '& .training-thumb': { transform: 'scale(1.03)' },
              '& .training-play': { transform: 'scale(1.04)', boxShadow: '0 16px 36px rgba(15,23,42,0.26)' },
            },
          }}
        >
          <Box sx={{ position: 'relative', overflow: 'hidden', borderRadius: 1.7 }}>
            <Box component="img" className="training-thumb" src={thumbnail} alt={item.title} sx={{ width: '100%', height: 124, objectFit: 'cover', borderRadius: 1.7, border: '1px solid #E5EAF3', transition: 'transform 220ms ease' }} />
            <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(15,23,42,0.04) 0%, rgba(15,23,42,0.18) 100%)' }} />
            <Box sx={{ position: 'absolute', top: 10, left: 10, px: 0.85, py: 0.35, borderRadius: 999, bgcolor: 'rgba(255,255,255,0.88)', color: '#0F172A', fontSize: 10.5, fontWeight: 800, letterSpacing: '0.02em', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.6)' }}>
              VIDEO TRAINING
            </Box>
            <Box sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
              <Box className="training-play" sx={{ width: 54, height: 54, borderRadius: '50%', background: 'linear-gradient(180deg, rgba(239,68,68,0.96) 0%, rgba(220,38,38,0.96) 100%)', color: '#FFFFFF', display: 'grid', placeItems: 'center', boxShadow: '0 14px 30px rgba(15,23,42,0.22)', border: '2px solid rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)', transition: 'transform 180ms ease, box-shadow 180ms ease' }}>
                <PlayArrowRoundedIcon sx={{ fontSize: 28, ml: 0.25 }} />
              </Box>
            </Box>
            <Box sx={{ position: 'absolute', right: 8, bottom: 8, px: 0.75, py: 0.2, borderRadius: 999, bgcolor: 'rgba(15,23,42,0.82)', color: '#FFFFFF', fontSize: 10.5, fontWeight: 700 }}>
              {item.metric}
            </Box>
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: 17, color: '#1F2937', fontWeight: 600, lineHeight: 1.35 }}>
              {renderSmartSearchOpenTitle(item, { color: 'inherit' })}
            </Typography>
            <Typography variant="caption" sx={{ color: '#7B8798', display: 'block', mt: 0.55 }}>
              {normalizeSmartSearchText(item.subtitle)}
            </Typography>
            <Typography sx={{ fontSize: 12.8, color: '#374151', lineHeight: 1.55, mt: 0.55 }}>
              {item.summary}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.1, flexWrap: 'wrap', mt: 0.8 }}>
              <Typography variant="caption" sx={{ color: '#7B8798' }}>{item.location}</Typography>
              <Typography variant="caption" sx={{ color: '#7B8798' }}>{item.plant}</Typography>
              <Typography variant="caption" sx={{ color: '#7B8798' }}>{item.updated}</Typography>
            </Box>
          </Box>
        </Box>
      );
    }

    if (item.kind === 'document') {
      const fileType = item.fileType ?? metaParts[0] ?? 'DOC';
      const thumbnail = item.thumbnail ?? documentThumbnailFallbacks[item.id] ?? '/images/maquina-fabrica.png';
      const typeStyles = getSmartSearchDocumentTypeStyles(fileType);
      const pathText = getSmartSearchDocumentPathText(item.detail?.folderPath);

      return (
        <Box
          key={item.id}
          onClick={() => setSmartSearchSelectedItem(item)}
          sx={{
            display: 'grid',
            gridTemplateColumns: '88px 1fr',
            gap: 1.3,
            py: 1.2,
            px: 0.6,
            cursor: 'pointer',
            borderBottom: '1px solid #F0F3F8',
            borderRadius: 2,
            bgcolor: isSelected ? '#F8FBFF' : 'transparent',
            '&:hover': { bgcolor: '#FAFCFF' },
          }}
        >
          <Box component="img" src={thumbnail} alt={item.title} sx={{ width: 88, height: 66, objectFit: 'cover', borderRadius: 1.1, border: '1px solid #E5EAF3', bgcolor: '#F8FAFC' }} />
          <Box sx={{ minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, flexWrap: 'wrap' }}>
              <DescriptionOutlinedIcon sx={{ fontSize: 13, color: '#94A3B8' }} />
              <Typography sx={{ fontSize: 19, color: '#2563EB', fontWeight: 500, lineHeight: 1.25 }}>
                {renderSmartSearchOpenTitle(item, { color: 'inherit' })}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, flexWrap: 'wrap', mt: 0.45 }}>
              <Chip label={fileType} size="small" sx={{ height: 18, bgcolor: typeStyles.bg, color: typeStyles.fg, fontWeight: 800, borderRadius: 1, '& .MuiChip-label': { px: 0.6, fontSize: 10 } }} />
              {metaParts.slice(0, 3).map((part) => (
                <Typography key={part} variant="caption" sx={{ color: '#7B8798', fontWeight: 500 }}>
                  {part}
                </Typography>
              ))}
            </Box>
            <Typography sx={{ fontSize: 13.1, color: '#374151', lineHeight: 1.5, mt: 0.55 }}>
              {item.summary}
            </Typography>
            <Typography sx={{ fontSize: 11.4, color: '#64748B', lineHeight: 1.45, mt: 0.5 }}>
              {pathText}
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap', mt: 0.7 }}>
              <Typography variant="caption" sx={{ color: '#7B8798' }}>{getSmartSearchSourceSystem(item)}</Typography>
              <Typography variant="caption" sx={{ color: '#7B8798' }}>{item.location}</Typography>
              <Typography variant="caption" sx={{ color: '#7B8798' }}>{item.plant}</Typography>
              <Typography variant="caption" sx={{ color: '#7B8798' }}>{item.updated}</Typography>
            </Box>
          </Box>
        </Box>
      );
    }

    if (item.kind === 'notification') {
      return (
        <Box
          key={item.id}
          onClick={() => setSmartSearchSelectedItem(item)}
          sx={{
            display: 'grid',
            gridTemplateColumns: '30px 1fr',
            gap: 1,
            py: 1.2,
            px: 0.4,
            cursor: 'pointer',
            borderBottom: '1px solid #F0F3F8',
            borderRadius: 2,
            bgcolor: isSelected ? '#F8FBFF' : 'transparent',
            '&:hover': { bgcolor: '#FAFCFF' },
          }}
        >
          <Box sx={{ width: 24, height: 24, borderRadius: '50%', mt: 0.1, bgcolor: '#EEF4FF', color: '#2563EB', display: 'grid', placeItems: 'center' }}>
            <NotificationsOutlinedIcon sx={{ fontSize: 15 }} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.55, flexWrap: 'wrap', mb: 0.35 }}>
              <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600 }}>Related to your search:</Typography>
              {smartSearchHighlightTerms.slice(0, 2).map((term) => (
                <Chip key={term} label={term} size="small" sx={{ height: 18, bgcolor: '#F3F4F6', color: '#64748B', '& .MuiChip-label': { px: 0.6, fontSize: 10 } }} />
              ))}
            </Box>
            <Typography sx={{ fontSize: 17, color: '#2563EB', fontWeight: 500, lineHeight: 1.22 }}>
              {renderSmartSearchOpenTitle(item, { color: 'inherit' })}
            </Typography>
            <Typography sx={{ fontSize: 13, color: '#374151', lineHeight: 1.55, mt: 0.35 }}>
              {renderHighlightedSmartSearchText(item.summary)}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap', mt: 0.65 }}>
              <Typography variant="caption" sx={{ color: '#7B8798' }}>{item.updated}</Typography>
              <Typography variant="caption" sx={{ color: '#B8C1CC' }}>•</Typography>
              <Typography variant="caption" sx={{ color: '#7B8798' }}>{normalizeSmartSearchText(item.subtitle)}</Typography>
            </Box>
          </Box>
        </Box>
      );
    }

    if (item.kind === 'asset') {
      const thumbnail = item.thumbnail ?? '/images/maquina-fabrica.png';

      return (
        <Box
          key={item.id}
          onClick={() => setSmartSearchSelectedItem(item)}
          sx={{
            display: 'grid',
            gridTemplateColumns: '146px 1fr',
            gap: 1.15,
            py: 1.2,
            px: 0.55,
            cursor: 'pointer',
            borderBottom: '1px solid #F0F3F8',
            borderRadius: 2,
            bgcolor: isSelected ? '#F8FBFF' : 'transparent',
            '&:hover': { bgcolor: '#FAFCFF' },
          }}
        >
          <Box component="img" src={thumbnail} alt={item.title} sx={{ width: 146, height: 110, objectFit: 'cover', borderRadius: 1.35, border: '1px solid #E5EAF3', bgcolor: '#F8FAFC' }} />
          <Box sx={{ minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.55, flexWrap: 'wrap' }}>
              <Chip label={item.status} size="small" sx={{ height: 20, bgcolor: item.status === 'At risk' ? '#FDECEC' : '#FFF3E3', color: item.status === 'At risk' ? '#D9485F' : '#C97A19', fontWeight: 800, '& .MuiChip-label': { px: 0.75, fontSize: 10 } }} />
              <Typography variant="caption" sx={{ color: '#7B8798', fontWeight: 600 }}>{normalizeSmartSearchText(item.subtitle)}</Typography>
            </Box>
            <Typography sx={{ fontSize: 18, color: '#2563EB', fontWeight: 500, lineHeight: 1.25, mt: 0.45 }}>
              {renderSmartSearchOpenTitle(item, { color: 'inherit' })}
            </Typography>
            <Typography sx={{ fontSize: 13, color: '#374151', lineHeight: 1.55, mt: 0.45 }}>
              {renderHighlightedSmartSearchText(item.summary)}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.65, flexWrap: 'wrap', mt: 0.75 }}>
              <Chip label={`Vibration: ${item.detail?.vibration ?? item.metric}`} size="small" sx={{ height: 20, bgcolor: '#FFF7ED', color: '#C2410C', '& .MuiChip-label': { px: 0.75, fontSize: 10.5, fontWeight: 700 } }} />
              <Chip label={`Temp: ${item.detail?.temperature ?? 'n/a'}`} size="small" sx={{ height: 20, bgcolor: '#F8FAFC', color: '#475569', '& .MuiChip-label': { px: 0.75, fontSize: 10.5, fontWeight: 700 } }} />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.55, flexWrap: 'wrap', mt: 0.75 }}>
              <LocationOnIcon sx={{ fontSize: 14, color: '#2563EB' }} />
              <Typography variant="caption" sx={{ color: '#2563EB', fontWeight: 700 }}>{item.location}</Typography>
              <Typography variant="caption" sx={{ color: '#94A3B8' }}>•</Typography>
              <Typography variant="caption" sx={{ color: '#64748B' }}>{item.plant}</Typography>
              <Typography variant="caption" sx={{ color: '#94A3B8' }}>•</Typography>
              <Typography variant="caption" sx={{ color: '#64748B' }}>{item.updated}</Typography>
            </Box>
          </Box>
        </Box>
      );
    }

    if (item.kind === 'timeSeries') {
      return (
        <Paper
          key={item.id}
          elevation={0}
          onClick={() => setSmartSearchSelectedItem(item)}
          sx={{
            p: 1.35,
            borderRadius: 2.2,
            cursor: 'pointer',
            border: '1px solid #E5EAF3',
            bgcolor: '#FFFFFF',
            boxShadow: 'none',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, mb: 0.75 }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, flexWrap: 'wrap' }}>
                <Chip label={item.status} size="small" sx={{ height: 18, bgcolor: '#FDECEC', color: '#D9485F', fontWeight: 800, '& .MuiChip-label': { px: 0.65, fontSize: 10 } }} />
                <Typography variant="caption" sx={{ color: '#7B8798' }}>•</Typography>
                <Typography variant="caption" sx={{ color: '#7B8798' }}>{item.location}</Typography>
              </Box>
              <Typography sx={{ fontSize: 16.5, color: '#1F2937', fontWeight: 500, mt: 0.45 }}>
                {renderSmartSearchOpenTitle(item, { color: 'inherit' })}
              </Typography>
              <Typography sx={{ fontSize: 11, color: '#64748B', mt: 0.35 }}>
                {normalizeSmartSearchText(item.subtitle)} {item.plant ? `• ${item.plant}` : ''}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography sx={{ fontSize: 20, lineHeight: 1, color: '#111827', fontWeight: 800 }}>{String(item.metric).split(' ')[0]}</Typography>
              <Typography sx={{ fontSize: 10.5, color: '#7B8798', mt: 0.15 }}>{String(item.metric).split(' ').slice(1).join(' ')}</Typography>
            </Box>
          </Box>
          <Typography sx={{ fontSize: 11, color: '#64748B', fontWeight: 700, mb: 0.55 }}>
            RMS Conveyor Velocity
          </Typography>
          <Box sx={{ p: 0.3, borderRadius: 1.8, bgcolor: '#FFFFFF' }}>
            {renderSmartSearchTrend(
              item.detail.points,
              '#FF2B2B',
              item.detail.anomalies,
              210,
              {
                warning: Number.parseFloat(String(item.detail.warning)),
                critical: Number.parseFloat(String(item.detail.critical)),
                xLabels: item.detail.xLabels,
                yLabel: item.detail.yLabel,
              }
            )}
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap', mt: 0.55 }}>
            <Typography variant="caption" sx={{ color: '#64748B' }}>Warning: {item.detail.warning} / Critical: {item.detail.critical}</Typography>
            <Typography variant="caption" sx={{ color: '#64748B' }}>{item.updated}</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 0.65, mt: 0.7, flexWrap: 'wrap' }}>
            {['1 Hour', '6 Hours', '24 Hours', '7 Days', '30 Days'].map((range) => (
              <Chip key={range} label={range} size="small" sx={{ height: 24, bgcolor: range === '24 Hours' ? '#2563EB' : '#FFFFFF', color: range === '24 Hours' ? '#FFFFFF' : '#6B7280', border: range === '24 Hours' ? '1px solid #2563EB' : '1px solid #E5EAF3', '& .MuiChip-label': { px: 0.8, fontSize: 10.5, fontWeight: 700 } }} />
            ))}
          </Box>
        </Paper>
      );
    }

    if (item.kind === '3d') {
      const hierarchy = item.detail?.hierarchy ?? [];
      const siteLabel = hierarchy.find((step: string) => step.toLowerCase().includes('columbus')) ?? item.location;
      const lineLabel = hierarchy.find((step: string) => step.toLowerCase().includes('line')) ?? item.plant;
      const zoneLabel = hierarchy.find((step: string) => step.toLowerCase().includes('zone')) ?? 'In scope';

      return (
        <Paper
          key={item.id}
          elevation={0}
          onClick={() => setSmartSearchSelectedItem(item)}
          sx={{
            p: 1.1,
            borderRadius: 2.8,
            cursor: 'pointer',
            border: '1px solid #E5EAF3',
            bgcolor: '#FFFFFF',
            boxShadow: isSelected ? '0 12px 26px rgba(37,99,235,0.08)' : '0 8px 20px rgba(15,23,42,0.03)',
          }}
        >
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '220px 1fr' }, gap: 1.1 }}>
            <Box sx={{ position: 'relative', borderRadius: 2.1, overflow: 'hidden', border: '1px solid #D8E6FA', bgcolor: '#E5E9F0', minHeight: 136 }}>
              <Box component="img" src="/images/site-view.png" alt={item.title} sx={{ display: 'block', width: '100%', height: 136, objectFit: 'cover' }} />
              <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(6,10,61,0.06) 0%, rgba(6,10,61,0.02) 100%)' }} />
              <Box sx={{ position: 'absolute', top: 8, left: 8, px: 0.9, py: 0.4, borderRadius: 999, bgcolor: '#081C43', color: '#FFFFFF', fontSize: 10.5, fontWeight: 800 }}>
                3D
              </Box>
              <Box sx={{ position: 'absolute', left: 8, bottom: 8, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {[siteLabel, lineLabel, zoneLabel].map((step) => (
                  <Chip key={step} label={step} size="small" sx={{ height: 20, bgcolor: 'rgba(255,255,255,0.92)', color: '#0F172A', border: '1px solid #D8E6FA', '& .MuiChip-label': { px: 0.65, fontSize: 10, fontWeight: 700 } }} />
                ))}
              </Box>
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.55, flexWrap: 'wrap' }}>
                <Chip label={item.status} size="small" sx={{ height: 18, bgcolor: '#EEF4FF', color: '#2563EB', fontWeight: 800, '& .MuiChip-label': { px: 0.65, fontSize: 10 } }} />
                <Typography variant="caption" sx={{ color: '#7B8798' }}>{normalizeSmartSearchText(item.subtitle)}</Typography>
              </Box>
              <Typography sx={{ fontSize: 17, color: '#2563EB', fontWeight: 600, lineHeight: 1.25, mt: 0.42 }}>
                {renderSmartSearchOpenTitle(item, { color: 'inherit' })}
              </Typography>
              <Typography sx={{ fontSize: 12.8, color: '#374151', lineHeight: 1.5, mt: 0.4 }}>
                {item.summary}
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.55, flexWrap: 'wrap', mt: 0.8 }}>
                <Chip label={`Site ${siteLabel}`} size="small" sx={{ height: 22, bgcolor: '#F8FAFC', color: '#475569', border: '1px solid #E5EAF3', '& .MuiChip-label': { px: 0.7, fontSize: 10.5, fontWeight: 700 } }} />
                <Chip label={`Line ${lineLabel}`} size="small" sx={{ height: 22, bgcolor: '#F8FAFC', color: '#475569', border: '1px solid #E5EAF3', '& .MuiChip-label': { px: 0.7, fontSize: 10.5, fontWeight: 700 } }} />
                <Chip label={`Zone ${zoneLabel}`} size="small" sx={{ height: 22, bgcolor: '#F8FAFC', color: '#475569', border: '1px solid #E5EAF3', '& .MuiChip-label': { px: 0.7, fontSize: 10.5, fontWeight: 700 } }} />
              </Box>
              <Typography sx={{ fontSize: 11.2, color: '#64748B', mt: 0.8 }}>
                Spatial scope preview is already tied to the hierarchy you selected.
              </Typography>
            </Box>
          </Box>
        </Paper>
      );
    }

    return (
      <Paper
        key={item.id}
        elevation={0}
        onClick={() => setSmartSearchSelectedItem(item)}
        sx={{
          p: 1.35,
          borderRadius: 2.4,
          cursor: 'pointer',
          border: '1px solid #E5EAF3',
          bgcolor: '#FFFFFF',
          boxShadow: isSelected ? '0 12px 26px rgba(37,99,235,0.08)' : 'none',
          '&:hover': { borderColor: '#D8E3F4' },
        }}
      >
        <Box sx={{ display: 'grid', gridTemplateColumns: '68px 1fr', gap: 1.15 }}>
          <Box sx={{ width: 68, height: 68, borderRadius: 1.8, bgcolor: item.kind === 'asset' ? '#FFF4E5' : '#EEF4FF', border: item.kind === 'asset' ? '1px solid #FED7AA' : '1px solid #DCE7F9', display: 'grid', placeItems: 'center', color: item.kind === 'asset' ? '#F97316' : '#2563EB', fontSize: 11, fontWeight: 900 }}>
            {getSmartSearchKindBadgeLabel(item)}
          </Box>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', gap: 0.55, alignItems: 'center', flexWrap: 'wrap' }}>
                <Chip label={item.status} size="small" sx={{ height: 18, bgcolor: `${item.tone}12`, color: item.tone, fontWeight: 800, '& .MuiChip-label': { px: 0.65, fontSize: 10 } }} />
                <Typography variant="caption" sx={{ color: '#7B8798' }}>{normalizeSmartSearchText(item.subtitle)}</Typography>
              </Box>
              {item.metric ? <Typography variant="caption" sx={{ color: item.tone, fontWeight: 800 }}>{item.metric}</Typography> : null}
            </Box>
            <Typography sx={{ fontSize: 17, color: '#2563EB', fontWeight: 500, lineHeight: 1.25, mt: 0.4 }}>
              {renderSmartSearchOpenTitle(item, { color: 'inherit' })}
            </Typography>
            <Typography sx={{ fontSize: 12.9, color: '#374151', lineHeight: 1.55, mt: 0.45 }}>
              {item.summary}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.05, flexWrap: 'wrap', mt: 0.7 }}>
              <Typography variant="caption" sx={{ color: '#7B8798' }}>{item.location}</Typography>
              <Typography variant="caption" sx={{ color: '#7B8798' }}>{item.plant}</Typography>
              <Typography variant="caption" sx={{ color: '#7B8798' }}>{item.updated}</Typography>
            </Box>
          </Box>
        </Box>
      </Paper>
    );
  };

  const renderSmartSearchWorkOrderCard = (item: any) => {
    const priority = item.priority ?? 'Medium';
    const priorityTone = priority === 'High' ? tokenError.main : priority === 'Medium' ? tokenWarning.dark : tokenSuccess.darker;
    const priorityBg = priority === 'High' ? tokenError.softBg : priority === 'Medium' ? tokenWarning.softBg : tokenSuccess.softBg;
    const equipment = item.detail?.equipment ?? item.equipment ?? item.plant;
    const location = item.location ?? item.detail?.location ?? item.plant;
    const owner = item.detail?.owner ?? item.owner ?? 'Maintenance';
    const due = item.due ?? item.updated;
    const status = item.taskState ?? item.status ?? '';
    return (
      <Paper
        key={item.id}
        elevation={0}
        onClick={() => openSmartSearchResult(item)}
        sx={{ position: 'relative', overflow: 'hidden', p: 1.5, pl: 2, borderRadius: '8px', border: `1px solid ${tokenDivider}`, bgcolor: 'background.paper', cursor: 'pointer', transition: 'background-color 150ms ease, border-color 150ms ease', '&:hover': { bgcolor: tokenNeutral.lightest, borderColor: tokenNeutral.dark } }}
      >
        <Box sx={{ position: 'absolute', inset: '0 auto 0 0', width: 4, bgcolor: priorityTone }} />
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1.4fr) minmax(240px, 0.8fr) auto' }, alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.75 }}>
              <Typography sx={{ color: tokenText.primary, fontSize: 13.5, lineHeight: 1.3, fontWeight: 600 }}>{item.title}</Typography>
              <Chip label={item.id} size="small" sx={{ height: 22, borderRadius: '6px', bgcolor: tokenNeutral.lighter, color: tokenText.secondary, fontSize: 10.5, fontWeight: 600 }} />
              <Chip label={priority} size="small" sx={{ height: 22, borderRadius: '6px', bgcolor: priorityBg, color: priorityTone, fontSize: 10.5, fontWeight: 600 }} />
            </Box>
            <Typography sx={{ color: tokenText.secondary, fontSize: 12, lineHeight: 1.45, mt: 0.65 }}>{item.summary}</Typography>
          </Box>
          <Box sx={{ display: 'grid', gap: 0.55 }}>
            <Typography sx={{ color: tokenText.secondary, fontSize: 11.5 }}><Box component="span" sx={{ color: tokenText.primary, fontWeight: 600 }}>Equipment:</Box> {equipment}</Typography>
            <Typography sx={{ color: tokenText.secondary, fontSize: 11.5 }}><Box component="span" sx={{ color: tokenText.primary, fontWeight: 600 }}>Location:</Box> {location}</Typography>
            <Typography sx={{ color: tokenText.secondary, fontSize: 11.5 }}><Box component="span" sx={{ color: tokenText.primary, fontWeight: 600 }}>Owner:</Box> {owner}{due ? ` · ${due}` : ''}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'flex-start', lg: 'flex-end' }, gap: 0.5 }}>
            {status ? <Chip label={status} size="small" sx={{ height: 26, borderRadius: '8px', bgcolor: tokenNeutral.lighter, color: tokenText.primary, fontSize: 10.5, fontWeight: 600 }} /> : null}
            <Tooltip title={`Open ${item.id}`}>
              <IconButton
                aria-label={`Open ${item.id}`}
                onClick={(event) => {
                  event.stopPropagation();
                  openSmartSearchResult(item);
                }}
                sx={{ width: 32, height: 32, borderRadius: '8px', color: tokenBrand.main, '&:hover': { bgcolor: tokenBrand.softBg } }}
              >
                <ArrowOutwardIcon sx={{ fontSize: 17 }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Paper>
    );
  };

  const renderSmartSearchResultGroup = (group: { items: any[]; label: string }) => {
    if (group.label === 'Tasks & Work Orders') {
      return (
        <Box sx={{ display: 'grid', gap: 1 }}>
          {group.items.map((item) => renderSmartSearchWorkOrderCard(item))}
        </Box>
      );
    }

    if (group.label === 'Documents') {
      const documentItems = group.items.filter((item) => item.kind === 'document');
      const folderItems = buildSmartSearchDocumentFolders(documentItems);
      const activeFolderPath = smartSearchDocumentFolderPath;
      const activeFolderKey = activeFolderPath?.join(' / ') ?? null;
      const visibleFolders = getSmartSearchVisibleDocumentFolders(folderItems, activeFolderPath);
      const visibleDocuments = getSmartSearchVisibleDocuments(documentItems, activeFolderPath);

      return (
        <Box sx={{ display: 'grid', gap: 1.1 }}>
          <Box sx={{ py: 0.2, borderBottom: `1px solid ${tokenDivider}` }}>
            <Box sx={{ display: 'flex', alignItems: { xs: 'flex-start', md: 'center' }, justifyContent: 'space-between', gap: 0.8, flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.45, flexWrap: 'wrap' }}>
                <Button
                  variant="text"
                  onClick={() => setSmartSearchDocumentFolderPath(null)}
                  sx={{ p: 0, minWidth: 0, textTransform: 'none', color: !activeFolderPath ? tokenText.primary : tokenBrand.main, fontSize: 11.8, fontWeight: 800, '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' } }}
                >
                  Documents
                </Button>
                {activeFolderPath?.map((segment, index) => {
                  const nextPath = activeFolderPath.slice(0, index + 1);
                  const folder = folderItems.find((entry) => entry.folderPath.join(' / ') === nextPath.join(' / '));
                  return (
                    <React.Fragment key={`breadcrumb-${segment}-${index}`}>
                      <Typography sx={{ color: tokenText.disabled, fontSize: 11.6 }}>/</Typography>
                      <Button
                        variant="text"
                        onClick={() => {
                          if (folder) openSmartSearchDocumentFolder(folder);
                        }}
                        sx={{ p: 0, minWidth: 0, textTransform: 'none', color: index === activeFolderPath.length - 1 ? tokenText.primary : tokenBrand.main, fontSize: 11.8, fontWeight: 800, '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' } }}
                      >
                        {segment}
                      </Button>
                    </React.Fragment>
                  );
                })}
              </Box>
              <Box sx={{ display: 'inline-flex', p: 0.25, gap: 0.25, borderRadius: 999, bgcolor: tokenNeutral.lightest, border: `1px solid ${tokenDivider}` }}>
                <Button
                  variant="text"
                  startIcon={<ViewListOutlinedIcon sx={{ fontSize: 15 }} />}
                  onClick={() => setSmartSearchDocumentViewMode('list')}
                  sx={{
                    minWidth: 0,
                    px: 0.9,
                    py: 0.45,
                    borderRadius: 999,
                    textTransform: 'none',
                    fontSize: 10.8,
                    fontWeight: 800,
                    color: smartSearchDocumentViewMode === 'list' ? tokenText.primary : tokenText.secondary,
                    bgcolor: smartSearchDocumentViewMode === 'list' ? 'background.paper' : 'transparent',
                    boxShadow: 'none',
                    '&:hover': { bgcolor: smartSearchDocumentViewMode === 'list' ? 'background.paper' : tokenNeutral.lightest },
                  }}
                >
                  List View
                </Button>
                <Button
                  variant="text"
                  startIcon={<GridViewOutlinedIcon sx={{ fontSize: 15 }} />}
                  onClick={() => setSmartSearchDocumentViewMode('card')}
                  sx={{
                    minWidth: 0,
                    px: 0.9,
                    py: 0.45,
                    borderRadius: 999,
                    textTransform: 'none',
                    fontSize: 10.8,
                    fontWeight: 800,
                    color: smartSearchDocumentViewMode === 'card' ? tokenText.primary : tokenText.secondary,
                    bgcolor: smartSearchDocumentViewMode === 'card' ? 'background.paper' : 'transparent',
                    boxShadow: 'none',
                    '&:hover': { bgcolor: smartSearchDocumentViewMode === 'card' ? 'background.paper' : tokenNeutral.lightest },
                  }}
                >
                  Card View
                </Button>
              </Box>
            </Box>
          </Box>

          {smartSearchDocumentViewMode === 'list' ? (
            <Box sx={{ display: 'grid', gap: 1.05 }}>
              {visibleFolders.map((folder) => {
                const folderKey = folder.folderPath.join(' / ');
                const parentPath = folder.folderPath.slice(0, -1).join(' / ');
                return (
                  <Paper
                    key={`folder-${folderKey}`}
                    elevation={0}
                    onClick={() => openSmartSearchDocumentFolder(folder)}
                    sx={{
                      p: 1.2,
                      borderRadius: '16px',
                      border: `1px solid ${activeFolderKey === folderKey ? tokenBrand.light : tokenDivider}`,
                      bgcolor: activeFolderKey === folderKey ? tokenBrand.selectedBg : 'background.paper',
                      cursor: 'pointer',
                      boxShadow: 'none',
                      '&:hover': { bgcolor: tokenNeutral.lightest, borderColor: tokenBrand.light },
                    }}
                  >
                    <Box sx={{ display: 'grid', gridTemplateColumns: '32px 1fr auto', gap: 0.9, alignItems: 'start' }}>
                      <Box sx={{ width: 28, height: 28, borderRadius: '10px', bgcolor: tokenBrand.softBg, color: tokenBrand.main, display: 'grid', placeItems: 'center' }}>
                        <FolderOutlinedIcon sx={{ fontSize: 18 }} />
                      </Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontSize: 14.6, color: tokenText.primary, fontWeight: 800, lineHeight: 1.3 }}>
                          {folder.folderPath[folder.folderPath.length - 1]}
                        </Typography>
                        <Typography sx={{ fontSize: 11.4, color: tokenText.secondary, mt: 0.3, lineHeight: 1.45 }}>
                          {parentPath}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap', mt: 0.55 }}>
                          <Typography variant="caption" sx={{ color: tokenText.secondary }}>{folder.sourceSystem}</Typography>
                          <Typography variant="caption" sx={{ color: tokenText.secondary }}>{folder.location}</Typography>
                          <Typography variant="caption" sx={{ color: tokenText.secondary }}>{folder.plant}</Typography>
                        </Box>
                      </Box>
                      <Chip label={`${folder.childCount} docs`} size="small" sx={getSmartSearchNeutralChipSx()} />
                    </Box>
                  </Paper>
                );
              })}

              {visibleDocuments.map((item) => (
                <Box key={item.id}>
                  {renderSmartSearchResultCard(item)}
                </Box>
              ))}
            </Box>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))', xl: smartSearchShouldShowDetailRail ? 'repeat(2, minmax(0, 1fr))' : 'repeat(3, minmax(0, 1fr))' }, gap: 1.2 }}>
              {visibleFolders.map((folder) => {
                const folderKey = folder.folderPath.join(' / ');
                return (
                  <Paper
                    key={`folder-card-${folderKey}`}
                    elevation={0}
                    onClick={() => openSmartSearchDocumentFolder(folder)}
                    sx={{
                      p: 1.35,
                      minHeight: 220,
                      borderRadius: '16px',
                      border: `1px solid ${activeFolderKey === folderKey ? tokenBrand.light : tokenDivider}`,
                      bgcolor: activeFolderKey === folderKey ? tokenBrand.selectedBg : 'background.paper',
                      cursor: 'pointer',
                      display: 'grid',
                      gridTemplateRows: 'auto 1fr auto',
                      gap: 1,
                      boxShadow: 'none',
                      '&:hover': { borderColor: tokenBrand.light, boxShadow: 'none' },
                      transition: 'border-color 180ms ease',
                    }}
                  >
                    <Box sx={{ height: 118, borderRadius: '12px', background: `linear-gradient(135deg, ${tokenBrand.softBg} 0%, ${tokenNeutral.lightest} 100%)`, border: `1px solid ${tokenDivider}`, p: 1.1, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <Box sx={{ width: 44, height: 44, borderRadius: '12px', bgcolor: 'background.paper', color: tokenBrand.main, display: 'grid', placeItems: 'center', border: `1px solid ${tokenDivider}` }}>
                        <FolderOutlinedIcon sx={{ fontSize: 24 }} />
                      </Box>
                      <Chip label={`${folder.childCount} docs`} size="small" sx={{ ...getSmartSearchNeutralChipSx(), height: 22, bgcolor: 'background.paper', '& .MuiChip-label': { px: 0.9, fontSize: 10.5, fontWeight: 800 } }} />
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontSize: 15.5, color: tokenText.primary, fontWeight: 800, lineHeight: 1.3 }}>
                        {folder.folderPath[folder.folderPath.length - 1]}
                      </Typography>
                      <Typography sx={{ fontSize: 11.5, color: tokenText.secondary, mt: 0.55, lineHeight: 1.5 }}>
                        {folder.folderPath.join(' / ')}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.7, flexWrap: 'wrap' }}>
                      <Chip label={folder.sourceSystem ?? 'Document repository'} size="small" sx={getSmartSearchNeutralChipSx()} />
                      <Chip label={folder.plant ?? folder.location ?? 'Current scope'} size="small" sx={getSmartSearchNeutralChipSx()} />
                    </Box>
                  </Paper>
                );
              })}

              {visibleDocuments.map((item) => {
                const fileType = item.fileType ?? 'DOC';
                const thumbnail = item.thumbnail ?? documentThumbnailFallbacks[item.id] ?? '/images/maquina-fabrica.png';
                const typeStyles = getSmartSearchDocumentTypeStyles(fileType);
                const tags = getSmartSearchDocumentTags(item);
                const pathText = getSmartSearchDocumentPathText(item.detail?.folderPath);
                const isSelected = smartSearchSelectedItem?.id === item.id;
                return (
                  <Paper
                    key={`document-card-${item.id}`}
                    elevation={0}
                    onClick={() => setSmartSearchSelectedItem(item)}
                    sx={{
                      p: 1.35,
                      minHeight: 320,
                      borderRadius: '16px',
                      border: `1px solid ${isSelected ? tokenBrand.light : tokenDivider}`,
                      bgcolor: isSelected ? tokenBrand.selectedBg : 'background.paper',
                      cursor: 'pointer',
                      display: 'grid',
                      gridTemplateRows: 'auto auto 1fr auto',
                      gap: 1,
                      boxShadow: 'none',
                      '&:hover': { borderColor: tokenBrand.light, boxShadow: 'none' },
                      transition: 'border-color 180ms ease',
                    }}
                  >
                    <Box sx={{ position: 'relative', height: 142, borderRadius: '12px', overflow: 'hidden', border: `1px solid ${tokenDivider}`, bgcolor: tokenNeutral.lightest }}>
                      <Box component="img" src={thumbnail} alt={item.title} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(15,23,42,0) 38%, rgba(15,23,42,0.24) 100%)' }} />
                      <Box sx={{ position: 'absolute', top: 10, left: 10, display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 0.8, py: 0.4, borderRadius: 999, bgcolor: 'rgba(255,255,255,0.96)', color: typeStyles.fg, fontSize: 10.5, fontWeight: 800, border: `1px solid ${tokenDivider}` }}>
                        <InsertDriveFileOutlinedIcon sx={{ fontSize: 14 }} />
                        {fileType}
                      </Box>
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontSize: 16.2, color: tokenText.primary, fontWeight: 800, lineHeight: 1.32 }}>
                        {renderSmartSearchOpenTitle(item, { color: 'inherit' })}
                      </Typography>
                      <Typography sx={{ fontSize: 11.5, color: tokenText.secondary, mt: 0.55, lineHeight: 1.5 }}>
                        {pathText}
                      </Typography>
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontSize: 12.8, color: tokenText.primary, lineHeight: 1.55 }}>
                        {item.summary}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.6, flexWrap: 'wrap', mt: 0.8 }}>
                        <Chip label={fileType} size="small" sx={{ height: 20, bgcolor: typeStyles.bg, color: typeStyles.fg, border: `1px solid ${typeStyles.fg}`, '& .MuiChip-label': { px: 0.75, fontSize: 10.2, fontWeight: 800 } }} />
                        <Chip label={getSmartSearchSourceSystem(item)} size="small" sx={getSmartSearchNeutralChipSx()} />
                        <Chip label={item.updated ?? 'Recently updated'} size="small" sx={getSmartSearchNeutralChipSx()} />
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 1 }}>
                      <Box sx={{ display: 'flex', gap: 0.55, flexWrap: 'wrap' }}>
                        {tags.map((tag: string) => (
                          <Chip key={`${item.id}-${tag}`} label={tag} size="small" sx={{ height: 20, bgcolor: tokenBrand.softBg, color: tokenBrand.main, border: `1px solid ${tokenBrand.lightest}`, '& .MuiChip-label': { px: 0.72, fontSize: 10.1, fontWeight: 700 } }} />
                        ))}
                      </Box>
                      <Typography sx={{ fontSize: 11.2, color: tokenText.secondary, textAlign: 'right' }}>
                        {item.location} {item.plant ? `• ${item.plant}` : ''}
                      </Typography>
                    </Box>
                  </Paper>
                );
              })}
            </Box>
          )}
        </Box>
      );
    }

    if (group.label === 'Time Series' || group.label === 'Timeseries Data') {
      return (
        <Box sx={{ display: 'grid', gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: { xs: 'flex-start', md: 'center' }, justifyContent: 'space-between', gap: 1.5, flexDirection: { xs: 'column', md: 'row' } }}>
            <Box>
              <Typography sx={{ fontSize: 20, color: tokenText.primary, fontWeight: 700 }}>Time Series Trend & Forecast</Typography>
              <Typography sx={{ fontSize: 12.5, color: tokenText.secondary, mt: 0.35 }}>
                {group.items.length} live signals in {smartSearchSelectedHierarchyNode.label}
              </Typography>
            </Box>
            <Chip label="Live operational data" size="small" sx={{ height: 26, borderRadius: '6px', bgcolor: tokenBrand.softBg, color: tokenBrand.main, fontSize: 11, fontWeight: 600 }} />
          </Box>

          <Paper elevation={0} sx={{ p: 1.5, borderRadius: '12px', bgcolor: tokenInfo.extraLight, border: 'none' }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <AutoAwesomeIcon sx={{ mt: 0.15, fontSize: 17, color: tokenBrand.main }} />
              <Box>
                <Typography sx={{ color: tokenBrand.main, fontSize: 12, fontWeight: 700 }}>AI-assisted analysis</Typography>
                <Typography sx={{ color: tokenText.secondary, fontSize: 12, lineHeight: 1.5, mt: 0.25 }}>
                  Atlas detects anomalies and trends, compares correlated signals, and generates a short-range forecast for human validation.
                </Typography>
              </Box>
            </Box>
          </Paper>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: 'repeat(2, minmax(0, 1fr))' }, gap: 1 }}>
            {group.items.map((series) => {
              const selected = smartSearchSelectedItem?.id === series.id;
              const anomalyCount = series.detail?.anomalies?.length ?? 0;
              const statusTone = series.status === 'Critical' ? tokenError.main : series.status === 'Watch' ? tokenWarning.dark : tokenBrand.main;
              const statusBg = series.status === 'Critical' ? tokenError.softBg : series.status === 'Watch' ? tokenWarning.softBg : tokenBrand.softBg;
              const points = series.detail?.points ?? [];
              const latest = points[points.length - 1] ?? 0;
              const previous = points[Math.max(0, points.length - 5)] ?? latest;
              const forecastDirection = latest >= previous ? 'Rising' : 'Falling';
              return (
                <Paper
                  key={series.id}
                  elevation={0}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSmartSearchSelectedItem(series)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') setSmartSearchSelectedItem(series);
                  }}
                  sx={{ p: 1.5, borderRadius: '12px', cursor: 'pointer', border: `1px solid ${selected ? tokenBrand.light : tokenDivider}`, bgcolor: selected ? tokenBrand.selectedBg : 'background.paper', transition: 'border-color 150ms ease, background-color 150ms ease', '&:hover': { borderColor: tokenBrand.light, bgcolor: tokenBrand.selectedBg } }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
                    <Box sx={{ minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.65, flexWrap: 'wrap' }}>
                        <ShowChartOutlinedIcon sx={{ fontSize: 17, color: tokenBrand.main }} />
                        <Chip label={series.status} size="small" sx={{ height: 22, borderRadius: '6px', bgcolor: statusBg, color: statusTone, fontSize: 10.5, fontWeight: 700 }} />
                        {anomalyCount ? <Chip label={`${anomalyCount} anomalies`} size="small" sx={{ height: 22, borderRadius: '6px', bgcolor: tokenError.softBg, color: tokenError.main, fontSize: 10.5, fontWeight: 700 }} /> : null}
                      </Box>
                      <Typography sx={{ mt: 0.8, color: tokenText.primary, fontSize: 14, lineHeight: 1.3, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis' }}>{series.title}</Typography>
                      <Typography sx={{ mt: 0.25, color: tokenText.secondary, fontSize: 11 }}>{normalizeSmartSearchText(series.subtitle)}</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                      <Typography sx={{ color: tokenText.primary, fontSize: 20, lineHeight: 1, fontWeight: 600 }}>{series.metric}</Typography>
                      <Typography sx={{ color: statusTone, fontSize: 10.5, mt: 0.4, fontWeight: 600 }}>{forecastDirection} forecast</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ mt: 1, height: 96, overflow: 'hidden' }}>
                    {renderSmartSearchTrend(points, statusTone, series.detail?.anomalies ?? [], 96, {
                      warning: Number.parseFloat(String(series.detail?.warning)),
                      critical: Number.parseFloat(String(series.detail?.critical)),
                      xLabels: series.detail?.xLabels,
                      yLabel: series.detail?.yLabel,
                    })}
                  </Box>
                  <Box sx={{ mt: 0.75, pt: 0.75, borderTop: `1px solid ${tokenDivider}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                    <Typography sx={{ color: tokenText.secondary, fontSize: 10.5 }}>Warning {series.detail?.warning} · Critical {series.detail?.critical}</Typography>
                    <Typography sx={{ color: tokenBrand.main, fontSize: 10.5, fontWeight: 600 }}>Open analysis →</Typography>
                  </Box>
                </Paper>
              );
            })}
          </Box>
        </Box>
      );
    }

    if (group.label === 'Trainings') {
      return (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(4, minmax(0, 1fr))' }, gap: 1.3 }}>
          {group.items.map((item) => {
            const thumbnail = item.thumbnail ?? '/images/Line1.png';
            const isSelected = smartSearchSelectedItem?.id === item.id;

            return (
              <Box
                key={item.id}
                onClick={() => setSmartSearchSelectedItem(item)}
                sx={{
                  cursor: 'pointer',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  border: isSelected ? `1px solid ${tokenBrand.light}` : `1px solid ${tokenDivider}`,
                  boxShadow: 'none',
                  bgcolor: isSelected ? tokenBrand.selectedBg : 'background.paper',
                  '&:hover .training-thumb': { transform: 'scale(1.03)' },
                  '&:hover .training-play': { transform: 'scale(1.05)', boxShadow: '0 16px 36px rgba(15,23,42,0.28)' },
                }}
              >
                <Box sx={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', border: `1px solid ${tokenDivider}` }}>
                  <Box component="img" className="training-thumb" src={thumbnail} alt={item.title} sx={{ width: '100%', height: 132, objectFit: 'cover', transition: 'transform 180ms ease' }} />
                  <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(15,23,42,0.03) 0%, rgba(15,23,42,0.18) 100%)' }} />
                  <Box sx={{ position: 'absolute', top: 9, left: 9, px: 0.8, py: 0.3, borderRadius: 999, bgcolor: 'rgba(255,255,255,0.88)', color: tokenText.primary, fontSize: 10.2, fontWeight: 800, letterSpacing: '0.02em', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.6)' }}>
                    VIDEO
                  </Box>
                  <Box sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
                    <Box className="training-play" sx={{ width: 50, height: 50, borderRadius: '50%', background: 'linear-gradient(180deg, rgba(239,68,68,0.96) 0%, rgba(220,38,38,0.96) 100%)', color: '#FFFFFF', display: 'grid', placeItems: 'center', boxShadow: '0 14px 30px rgba(15,23,42,0.22)', border: '2px solid rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)', transition: 'transform 180ms ease, box-shadow 180ms ease' }}>
                      <PlayArrowRoundedIcon sx={{ fontSize: 28, ml: 0.25 }} />
                    </Box>
                  </Box>
                  <Box sx={{ position: 'absolute', right: 8, bottom: 8, px: 0.75, py: 0.2, borderRadius: 999, bgcolor: 'rgba(15,23,42,0.82)', color: '#FFFFFF', fontSize: 10.5, fontWeight: 700 }}>
                    {item.metric}
                  </Box>
                </Box>
                <Typography sx={{ fontSize: 13.3, color: tokenText.primary, fontWeight: 700, lineHeight: 1.45, mt: 0.8 }}>
                  {renderSmartSearchOpenTitle(item, { color: 'inherit' })}
                </Typography>
                <Typography sx={{ fontSize: 11.4, color: tokenText.secondary, mt: 0.35 }}>
                  {item.location}
                </Typography>
                <Typography sx={{ fontSize: 11.4, color: tokenText.disabled, mt: 0.15 }}>
                  {item.updated}
                </Typography>
              </Box>
            );
          })}
        </Box>
      );
    }

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.15 }}>
        {group.items.map((item) => renderSmartSearchResultCard(item))}
      </Box>
    );
  };

  const renderSmartSearchDetail = (item: any) => {
    if (!item) return null;
    const closeSmartSearchDetail = () => setSmartSearchSelectedItem(null);

    const renderRelatedInSearchStrip = () => {
      const related = getRelatedItems(item, smartSearchIndex);
      if (!related.length) return null;
      return (
        <Paper elevation={0} sx={{ p: 1.5, borderRadius: '12px', bgcolor: tokenNeutral.lightest, border: `1px solid ${tokenDivider}`, mb: 1.5 }}>
          <Typography variant="caption" sx={{ color: tokenText.secondary, fontWeight: 700, letterSpacing: '0.4px', display: 'block', mb: 0.85 }}>
            RELATED IN THIS SEARCH
          </Typography>
          <Box sx={{ display: 'grid', gap: 0.65 }}>
            {related.slice(0, 4).map((relatedItem) => (
              <Box
                key={relatedItem.id}
                onClick={() => setSmartSearchSelectedItem(relatedItem)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 1,
                  p: 0.85,
                  borderRadius: '8px',
                  bgcolor: 'background.paper',
                  border: `1px solid ${tokenDivider}`,
                  cursor: 'pointer',
                  '&:hover': { borderColor: tokenBrand.light, bgcolor: tokenBrand.softBg },
                }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: tokenBrand.main, lineHeight: 1.3 }}>
                    {relatedItem.title}
                  </Typography>
                  <Typography sx={{ fontSize: 10.5, color: tokenText.secondary, mt: 0.2 }}>
                    {relatedItem.category}
                  </Typography>
                </Box>
                <ArrowOutwardIcon sx={{ fontSize: 16, color: tokenBrand.main, flexShrink: 0 }} />
              </Box>
            ))}
          </Box>
        </Paper>
      );
    };

    const metadataRows = getSmartSearchMetadataRows(item);
    const renderMetadataBlock = () => (
      <>
        {renderRelatedInSearchStrip()}
      <Paper elevation={0} sx={{ p: 2, borderRadius: '12px', bgcolor: tokenNeutral.lightest, border: `1px solid ${tokenDivider}` }}>
        <Typography variant="caption" sx={{ color: tokenText.secondary, fontWeight: 700, letterSpacing: '0.4px' }}>RESULT METADATA</Typography>
        <Box sx={{ mt: 1, display: 'grid', gap: 0.8 }}>
          {metadataRows.map((row) => (
            <Box key={row.label} sx={{ display: 'grid', gridTemplateColumns: 'minmax(0, 140px) minmax(0, 1fr)', gap: 0.9, alignItems: 'start' }}>
              <Typography sx={{ fontSize: 12, color: tokenText.secondary, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                {row.label}
              </Typography>
              <Typography sx={{ fontSize: 14, color: tokenText.primary, lineHeight: 1.45, fontWeight: 400 }}>
                {row.value}
              </Typography>
            </Box>
          ))}
        </Box>
      </Paper>
      </>
    );

    const renderActionBlock = () => {
      const actions = getSmartSearchDetailActions(item);
      return (
        <Box sx={{ display: 'grid', gap: 0.8 }}>
          {actions.map((action, index) => (
            <Button
              key={`${action.label}-${index}`}
              fullWidth
              variant={action.variant}
              onClick={action.action}
              sx={action.variant === 'contained'
                ? {
                    bgcolor: tokenBrand.main,
                    color: tokenCommon.white,
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontWeight: 500,
                    boxShadow: 'none',
                    '&:hover': { bgcolor: tokenBrand.dark, boxShadow: 'none' },
                  }
                : {
                    borderColor: tokenBrand.main,
                    color: tokenBrand.main,
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontWeight: 500,
                    '&:hover': { borderColor: tokenBrand.dark, bgcolor: tokenBrand.softBg },
                  }}
            >
              {action.label}
            </Button>
          ))}
        </Box>
      );
    };

    const railSurfaceSx = {
      p: { xs: 2, md: 2.5 },
      borderRadius: '12px',
      border: `1px solid ${tokenDivider}`,
      bgcolor: 'background.paper',
      maxHeight: { lg: `calc(100vh - ${smartSearchSidebarStickyTop + 20}px)` },
      overflowY: { lg: 'auto' },
      pr: { lg: 2 },
      scrollbarGutter: 'stable',
    };

    const renderDetailCloseButton = () => (
      <IconButton
        onClick={closeSmartSearchDetail}
        sx={{
          width: 34,
          height: 34,
          color: tokenText.secondary,
          border: `1px solid ${tokenDivider}`,
          bgcolor: 'background.paper',
          borderRadius: '8px',
          '&:hover': { bgcolor: tokenNeutral.lightest },
        }}
      >
        <CloseIcon sx={{ fontSize: 18 }} />
      </IconButton>
    );

    if (item.kind === '3d') {
      const activeArea = smartSearchCurrent3DArea;
      const activeUnit = smartSearchCurrent3DUnit;
      const activeLine = smartSearchCurrent3DLine;
      const activeZone = smartSearchCurrent3DZone;
      const activeMachine = smartSearchCurrent3DMachine;
      const activeImage = smartSearch3DLevel === 'site'
        ? smartSearch3DSiteImage
        : smartSearch3DLevel === 'area'
          ? activeArea.image
          : smartSearch3DLevel === 'unit'
            ? activeUnit.image
            : smartSearch3DLevel === 'line'
              ? activeLine.image
        : smartSearch3DLevel === 'zone'
          ? activeZone.image
          : activeMachine.image;
      const activeTitle = smartSearch3DLevel === 'site'
        ? 'Columbus West Spatial Drill-Down'
        : smartSearch3DLevel === 'area'
          ? `${activeArea.label} Spatial View`
          : smartSearch3DLevel === 'unit'
            ? `${activeUnit.label} Spatial View`
            : smartSearch3DLevel === 'line'
              ? `${activeLine.label} Spatial View`
        : smartSearch3DLevel === 'zone'
          ? `${activeZone.label} Spatial View`
          : activeMachine.label;
      const activeSubtitle = smartSearch3DLevel === 'site'
        ? 'Start from the full site and progressively approximate into the operational scope'
        : smartSearch3DLevel === 'area'
          ? `${activeArea.label} • Site-to-area transition`
          : smartSearch3DLevel === 'unit'
            ? `${activeUnit.label} • Area-to-unit transition`
            : smartSearch3DLevel === 'line'
              ? `${activeLine.label} • Unit-to-line transition`
        : smartSearch3DLevel === 'zone'
          ? `${activeZone.label} • Line-to-zone transition`
          : `${activeMachine.subtitle} • ${activeZone.label}`;
      const activeStatus = smartSearch3DLevel === 'machine'
        ? activeMachine.metric
        : smartSearch3DLevel === 'zone'
          ? activeZone.status
          : smartSearch3DLevel === 'line'
            ? activeLine.status
          : smartSearch3DLevel === 'unit'
            ? activeUnit.status
            : smartSearch3DLevel === 'area'
              ? activeArea.status
              : 'Site context';
      const activeTone = smartSearch3DLevel === 'machine' ? activeMachine.tone : '#2563EB';
      const activeSummary = smartSearch3DLevel === 'site'
        ? 'The drill-down now starts from the farthest site view, then steps through area, unit, line, and zone before landing on the exact machine context.'
        : smartSearch3DLevel === 'area'
          ? activeArea.summary
          : smartSearch3DLevel === 'unit'
            ? activeUnit.summary
            : smartSearch3DLevel === 'line'
              ? activeLine.summary
        : smartSearch3DLevel === 'zone'
          ? activeZone.summary
          : activeMachine.summary;
      const activeDescription = smartSearch3DLevel === 'site'
        ? 'Use the staged cards to move from the full site into the right area, then into the unit, line, zone, and machine. Each step keeps the Smart Search hierarchy aligned, so documents, work orders, and signals stay in context.'
        : smartSearch3DLevel === 'area'
          ? activeArea.description
          : smartSearch3DLevel === 'unit'
            ? activeUnit.description
            : smartSearch3DLevel === 'line'
              ? activeLine.description
        : smartSearch3DLevel === 'zone'
          ? activeZone.description
          : activeMachine.description;
      const activePathLabel = smartSearchSelectedHierarchyPath.slice(2).map((node) => node.label).join(' / ') || 'Columbus West';
      const activeMetrics = smartSearch3DLevel === 'site'
        ? [
            { label: 'View span', value: 'Whole site', tone: '#2563EB' },
            { label: 'Next scope', value: activeArea.label, tone: '#0F766E' },
            { label: 'Depth path', value: 'Site > Area > Unit > Line > Zone', tone: '#FF7A00' },
          ]
        : smartSearch3DLevel === 'area'
          ? activeArea.metrics
          : smartSearch3DLevel === 'unit'
            ? activeUnit.metrics
            : smartSearch3DLevel === 'line'
              ? activeLine.metrics
        : smartSearch3DLevel === 'zone'
          ? activeZone.metrics
          : [
              { label: 'Focus area', value: activeMachine.focusArea, tone: activeMachine.tone },
              { label: 'Primary signal', value: activeMachine.metric, tone: '#E43B46' },
              { label: 'Zone anchor', value: activeZone.label, tone: '#2563EB' },
            ];
      const activeFocusLabel = smartSearch3DLevel === 'site'
        ? 'Whole-site view'
        : smartSearch3DLevel === 'area'
          ? `${activeArea.label} focus`
          : smartSearch3DLevel === 'unit'
            ? `${activeUnit.label} focus`
            : smartSearch3DLevel === 'line'
              ? `${activeLine.label} focus`
            : smartSearch3DLevel === 'zone'
              ? `${activeZone.label} focus`
              : activeMachine.focusArea;
      const activeStepLabel = smartSearch3DLevel === 'site'
        ? 'SITE TO AREA'
        : smartSearch3DLevel === 'area'
          ? 'AREA TO UNIT'
          : smartSearch3DLevel === 'unit'
            ? 'UNIT TO LINE'
            : smartSearch3DLevel === 'line'
              ? 'LINE TO ZONE'
            : smartSearch3DLevel === 'zone'
              ? 'ZONE TO MACHINE'
              : 'MACHINE CONTEXT';
      const activeHeroTitle = smartSearch3DLevel === 'site'
        ? 'Start wide, then narrow the operational scope step by step.'
        : smartSearch3DLevel === 'area'
          ? `The visual is now focused on ${activeArea.label}.`
          : smartSearch3DLevel === 'unit'
            ? `${activeUnit.label} frames the full production cell before the line cut.`
            : smartSearch3DLevel === 'line'
              ? `${activeLine.label} keeps the production lane intact before the zone cut.`
            : smartSearch3DLevel === 'zone'
              ? `${activeZone.label} isolates the operating slice before machine detail.`
              : `Machine focus locked on ${activeMachine.label}.`;
      const activeHeroCopy = smartSearch3DLevel === 'site'
        ? 'The large visual now starts farther away and follows the hierarchy path through area, unit, line, zone, and then machine detail.'
        : smartSearch3DLevel === 'area'
          ? 'This is the first approximation step after the site. It shows the room context without losing the connection to the selected production family.'
          : smartSearch3DLevel === 'unit'
            ? 'This unit-level frame gives a full-cell view before you cut into a specific line, which makes the zoom progression feel natural instead of abrupt.'
            : smartSearch3DLevel === 'line'
              ? 'This line-level frame restores the missing hierarchy step, so the move into Zone 1 keeps the conveyor story tied to the actual production lane.'
            : smartSearch3DLevel === 'zone'
              ? 'Pick a machine to continue the drill-down without losing the Smart Search path, documents, or signals.'
              : 'This view stays synced with the hierarchy rail, so changing the selected node keeps the image, path, and focus aligned.';
      const activeHighlight = smartSearch3DLevel === 'area'
        ? activeArea.highlight
        : smartSearch3DLevel === 'unit'
          ? activeUnit.highlight
          : smartSearch3DLevel === 'line'
            ? activeLine.highlight
          : smartSearch3DLevel === 'zone'
            ? activeZone.highlight
            : activeMachine.focusBox;
      const shouldShowHighlight = smartSearch3DLevel !== 'site';

      return (
        <Paper elevation={0} sx={{ ...railSurfaceSx, p: { xs: 1.4, md: 2.2 }, boxShadow: '0 18px 38px rgba(15,23,42,0.08)', background: 'linear-gradient(180deg, #F8FBFF 0%, #FFFFFF 32%)' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, mb: 1.5, px: { xs: 0.6, md: 0.8 } }}>
            <Box>
              <Typography variant="subtitle2" sx={{ color: '#044ED7', fontWeight: 800 }}>SPATIAL DRILL-DOWN</Typography>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>{activeTitle}</Typography>
              <Typography variant="body2" sx={{ mt: 0.45, color: '#475569' }}>{activeSubtitle}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip label={activeStatus} sx={{ bgcolor: `${activeTone}14`, color: activeTone, fontWeight: 800, border: `1px solid ${activeTone}33` }} />
              {renderDetailCloseButton()}
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 0.85, flexWrap: 'wrap', mb: 1.6, px: { xs: 0.6, md: 0.8 } }}>
            {smartSearch3DPathNodes.map((node) => {
              const isActive = smartSearch3DLevel === node.level;
              return (
                <Button
                  key={node.level}
                  variant={isActive ? 'contained' : 'outlined'}
                  disabled={!node.enabled}
                  onClick={() => focusSmartSearch3DLevel(node.level)}
                  endIcon={node.level !== 'machine' ? <ChevronRightIcon sx={{ fontSize: 16 }} /> : undefined}
                  sx={{
                    borderRadius: 999,
                    textTransform: 'none',
                    fontWeight: 800,
                    px: 1.6,
                    py: 0.65,
                    color: isActive ? '#FFFFFF' : '#334155',
                    bgcolor: isActive ? '#044ED7' : 'rgba(255,255,255,0.9)',
                    borderColor: isActive ? '#044ED7' : '#D7E1EE',
                    '&:hover': { borderColor: isActive ? '#044ED7' : '#94A3B8', bgcolor: isActive ? '#0A43B8' : '#F8FAFC' },
                  }}
                >
                  {node.label}
                </Button>
              );
            })}
          </Box>

          <Box sx={{ position: 'relative', borderRadius: 4, overflow: 'hidden', minHeight: { xs: 400, md: 540 }, border: '1px solid #D9E4F2', bgcolor: '#0B1120' }}>
            <Box
              component="img"
              src={activeImage}
              alt={activeTitle}
              sx={{
                position: 'absolute',
                inset: 0,
                display: 'block',
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: smartSearch3DLevel === 'site' ? 'scale(1.02)' : smartSearch3DLevel === 'zone' ? 'scale(1.08)' : 'scale(1.14)',
                transformOrigin: smartSearch3DLevel === 'machine' ? 'center center' : 'center top',
                transition: 'transform 280ms ease',
              }}
            />
            <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(8,28,67,0.18) 0%, rgba(8,28,67,0.06) 26%, rgba(8,28,67,0.18) 56%, rgba(4,10,24,0.76) 100%)' }} />
            <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(8,28,67,0.58) 0%, rgba(8,28,67,0.12) 34%, rgba(8,28,67,0) 58%)' }} />

            <Box sx={{ position: 'absolute', top: { xs: 14, md: 20 }, left: { xs: 14, md: 20 }, zIndex: 2, maxWidth: { xs: 'calc(100% - 28px)', md: 380 } }}>
              <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.85, px: 1.1, py: 0.75, borderRadius: 999, bgcolor: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.24)', backdropFilter: 'blur(14px)' }}>
                <ViewInArOutlinedIcon sx={{ fontSize: 18, color: '#FFFFFF' }} />
                <Typography sx={{ color: '#FFFFFF', fontWeight: 800, fontSize: 12.5 }}>
                  {activeFocusLabel}
                </Typography>
              </Box>
              <Box sx={{ mt: 1.2, p: { xs: 1.35, md: 1.6 }, borderRadius: 3, bgcolor: 'rgba(8,28,67,0.56)', border: '1px solid rgba(191,219,254,0.28)', backdropFilter: 'blur(18px)', boxShadow: '0 18px 40px rgba(2,6,23,0.24)' }}>
                <Typography sx={{ color: '#DBEAFE', fontSize: 11.5, fontWeight: 800, letterSpacing: 0.3 }}>
                  {activeStepLabel}
                </Typography>
                <Typography sx={{ color: '#FFFFFF', fontSize: { xs: 21, md: 24 }, fontWeight: 800, mt: 0.55, lineHeight: 1.1 }}>
                  {activeHeroTitle}
                </Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.82)', fontSize: 12.7, mt: 0.85, lineHeight: 1.6 }}>
                  {activeHeroCopy}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ position: 'absolute', top: { xs: 14, md: 20 }, right: { xs: 14, md: 20 }, zIndex: 2, display: 'grid', gap: 0.9, width: { xs: 180, md: 240 } }}>
              <Box sx={{ p: 1.2, borderRadius: 2.5, bgcolor: 'rgba(255,255,255,0.9)', border: '1px solid rgba(255,255,255,0.7)', boxShadow: '0 12px 24px rgba(15,23,42,0.14)' }}>
                <Typography sx={{ fontSize: 10.5, color: '#64748B', fontWeight: 800 }}>Hierarchy sync</Typography>
                <Typography sx={{ fontSize: 13.2, color: '#0F172A', fontWeight: 800, mt: 0.25 }}>{activePathLabel}</Typography>
              </Box>
              {smartSearch3DLevel === 'machine' ? (
                <Box sx={{ p: 1.2, borderRadius: 2.5, bgcolor: 'rgba(255,255,255,0.9)', border: `1px solid ${activeMachine.tone}55`, boxShadow: '0 12px 24px rgba(15,23,42,0.14)' }}>
                  <Typography sx={{ fontSize: 10.5, color: '#64748B', fontWeight: 800 }}>Machine focus</Typography>
                  <Typography sx={{ fontSize: 14.2, color: '#0F172A', fontWeight: 800, mt: 0.3 }}>{activeMachine.label}</Typography>
                  <Typography sx={{ fontSize: 11.2, color: activeMachine.tone, fontWeight: 800, mt: 0.35 }}>{activeMachine.metric}</Typography>
                </Box>
              ) : null}
            </Box>

            {shouldShowHighlight ? (
              <Box
                sx={{
                  position: 'absolute',
                  top: activeHighlight.top,
                  left: activeHighlight.left,
                  width: activeHighlight.width,
                  height: activeHighlight.height,
                  borderRadius: 3,
                  border: smartSearch3DLevel === 'zone' ? '2px solid rgba(147,197,253,0.95)' : `2px solid ${activeMachine.tone}`,
                  boxShadow: smartSearch3DLevel === 'machine'
                    ? `0 0 0 14px ${activeMachine.tone}22, inset 0 0 0 1px rgba(255,255,255,0.3)`
                    : '0 0 0 14px rgba(59,130,246,0.12), inset 0 0 0 1px rgba(255,255,255,0.25)',
                  background: smartSearch3DLevel === 'machine'
                    ? `linear-gradient(180deg, ${activeMachine.tone}24 0%, rgba(255,255,255,0.02) 100%)`
                    : 'linear-gradient(180deg, rgba(59,130,246,0.14) 0%, rgba(59,130,246,0.05) 100%)',
                  transition: 'all 220ms ease',
                  pointerEvents: 'none',
                  zIndex: 1,
                }}
              />
            ) : null}

            {smartSearch3DLevel === 'site' ? (
              <Box sx={{ position: 'absolute', left: { xs: 14, md: 20 }, right: { xs: 14, md: 20 }, bottom: { xs: 14, md: 20 }, zIndex: 2 }}>
                <Typography sx={{ color: '#FFFFFF', fontSize: 12, fontWeight: 800, letterSpacing: 0.35, mb: 1 }}>
                  SELECT AN AREA TO APPROXIMATE
                </Typography>
                <Button
                  onClick={() => focusSmartSearch3DArea(smartSearch3DAreaId)}
                  sx={{
                    p: 1.35,
                    width: { xs: '100%', md: 360 },
                    borderRadius: 2.8,
                    textTransform: 'none',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    bgcolor: 'rgba(255,255,255,0.92)',
                    color: '#0F172A',
                    border: '1px solid rgba(255,255,255,0.76)',
                    boxShadow: '0 10px 22px rgba(2,6,23,0.16)',
                    '&:hover': { bgcolor: '#FFFFFF', borderColor: '#2563EB' },
                  }}
                >
                  <Box sx={{ textAlign: 'left' }}>
                    <Typography sx={{ fontSize: 13.7, fontWeight: 800 }}>{activeArea.label}</Typography>
                    <Typography sx={{ fontSize: 10.8, color: '#64748B', mt: 0.15 }}>Assembly room context</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography sx={{ fontSize: 10.6, color: '#2563EB', fontWeight: 800 }}>{activeArea.status}</Typography>
                    <Typography sx={{ fontSize: 10.2, color: '#475569', mt: 0.15 }}>Next: {activeUnit.label}</Typography>
                  </Box>
                </Button>
              </Box>
            ) : null}

            {smartSearch3DLevel === 'area' ? (
              <Box sx={{ position: 'absolute', left: { xs: 14, md: 20 }, right: { xs: 14, md: 20 }, bottom: { xs: 14, md: 20 }, zIndex: 2 }}>
                <Typography sx={{ color: '#FFFFFF', fontSize: 12, fontWeight: 800, letterSpacing: 0.35, mb: 1 }}>
                  SELECT A UNIT TO CONTINUE
                </Typography>
                <Button
                  onClick={() => focusSmartSearch3DUnit(activeArea.unitId)}
                  sx={{
                    p: 1.35,
                    width: { xs: '100%', md: 360 },
                    borderRadius: 2.8,
                    textTransform: 'none',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    bgcolor: 'rgba(255,255,255,0.92)',
                    color: '#0F172A',
                    border: '1px solid rgba(255,255,255,0.76)',
                    boxShadow: '0 10px 22px rgba(2,6,23,0.16)',
                    '&:hover': { bgcolor: '#FFFFFF', borderColor: '#2563EB' },
                  }}
                >
                  <Box sx={{ textAlign: 'left' }}>
                    <Typography sx={{ fontSize: 13.7, fontWeight: 800 }}>{activeUnit.label}</Typography>
                    <Typography sx={{ fontSize: 10.8, color: '#64748B', mt: 0.15 }}>Full production cell</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography sx={{ fontSize: 10.6, color: '#2563EB', fontWeight: 800 }}>{activeUnit.status}</Typography>
                    <Typography sx={{ fontSize: 10.2, color: '#475569', mt: 0.15 }}>Next: {activeLine.label}</Typography>
                  </Box>
                </Button>
              </Box>
            ) : null}

            {smartSearch3DLevel === 'unit' ? (
              <Box sx={{ position: 'absolute', left: { xs: 14, md: 20 }, right: { xs: 14, md: 20 }, bottom: { xs: 14, md: 20 }, zIndex: 2 }}>
                <Typography sx={{ color: '#FFFFFF', fontSize: 12, fontWeight: 800, letterSpacing: 0.35, mb: 1 }}>
                  SELECT A LINE TO CONTINUE
                </Typography>
                <Button
                  onClick={() => focusSmartSearch3DLine(smartSearch3DLineId)}
                  sx={{
                    p: 1.35,
                    width: { xs: '100%', md: 360 },
                    borderRadius: 2.8,
                    textTransform: 'none',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    bgcolor: 'rgba(255,255,255,0.92)',
                    color: '#0F172A',
                    border: '1px solid rgba(255,255,255,0.76)',
                    boxShadow: '0 10px 22px rgba(2,6,23,0.16)',
                    '&:hover': { bgcolor: '#FFFFFF', borderColor: '#2563EB' },
                  }}
                >
                  <Box sx={{ textAlign: 'left' }}>
                    <Typography sx={{ fontSize: 13.7, fontWeight: 800 }}>{activeLine.label}</Typography>
                    <Typography sx={{ fontSize: 10.8, color: '#64748B', mt: 0.15 }}>Full production lane</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography sx={{ fontSize: 10.6, color: '#2563EB', fontWeight: 800 }}>{activeLine.status}</Typography>
                    <Typography sx={{ fontSize: 10.2, color: '#475569', mt: 0.15 }}>Next: Zone selection</Typography>
                  </Box>
                </Button>
              </Box>
            ) : null}

            {smartSearch3DLevel === 'line' ? (
              <Box sx={{ position: 'absolute', right: { xs: 14, md: 20 }, bottom: { xs: 14, md: 20 }, zIndex: 2, display: 'grid', gap: 0.9, width: { xs: 'calc(100% - 28px)', md: 280 } }}>
                {activeLine.zoneIds.map((zoneId) => {
                  const zone = smartSearch3DZoneViews[zoneId];
                  return (
                    <Button
                      key={zoneId}
                      onClick={() => focusSmartSearch3DZone(zoneId)}
                      sx={{
                        p: 1.1,
                        borderRadius: 2.5,
                        textTransform: 'none',
                        bgcolor: 'rgba(255,255,255,0.92)',
                        border: '1px solid rgba(255,255,255,0.82)',
                        color: '#0F172A',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        boxShadow: '0 12px 22px rgba(2,6,23,0.14)',
                        '&:hover': { bgcolor: '#FFFFFF', borderColor: '#2563EB' },
                      }}
                    >
                      <Box sx={{ textAlign: 'left', minWidth: 0 }}>
                        <Typography sx={{ fontSize: 12.8, fontWeight: 800 }}>{zone.label}</Typography>
                        <Typography sx={{ fontSize: 10.6, color: '#64748B', mt: 0.2 }}>{zone.summary}</Typography>
                      </Box>
                    </Button>
                  );
                })}
              </Box>
            ) : null}

            {smartSearch3DLevel === 'zone' ? (
              <Box sx={{ position: 'absolute', right: { xs: 14, md: 20 }, bottom: { xs: 14, md: 20 }, zIndex: 2, display: 'grid', gap: 0.9, width: { xs: 'calc(100% - 28px)', md: 280 } }}>
                {activeZone.machineIds.map((machineId) => {
                  const machine = smartSearch3DMachineViews[machineId];
                  return (
                    <Button
                      key={machineId}
                      onClick={() => focusSmartSearch3DMachine(machineId)}
                      sx={{
                        p: 1.1,
                        borderRadius: 2.5,
                        textTransform: 'none',
                        bgcolor: 'rgba(255,255,255,0.92)',
                        border: '1px solid rgba(255,255,255,0.82)',
                        color: '#0F172A',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        boxShadow: '0 12px 22px rgba(2,6,23,0.14)',
                        '&:hover': { bgcolor: '#FFFFFF', borderColor: machine.tone },
                      }}
                    >
                      <Box sx={{ textAlign: 'left', minWidth: 0 }}>
                        <Typography sx={{ fontSize: 12.8, fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{machine.label}</Typography>
                        <Typography sx={{ fontSize: 10.6, color: '#64748B', mt: 0.2 }}>{machine.subtitle}</Typography>
                      </Box>
                      <Chip label={machine.metric} size="small" sx={{ height: 22, bgcolor: `${machine.tone}12`, color: machine.tone, '& .MuiChip-label': { px: 0.8, fontSize: 10.4, fontWeight: 800 } }} />
                    </Button>
                  );
                })}
              </Box>
            ) : null}

            {smartSearch3DLevel === 'machine' ? (
              <Box sx={{ position: 'absolute', left: { xs: 14, md: 20 }, right: { xs: 14, md: 20 }, bottom: { xs: 14, md: 20 }, zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 1.2, flexWrap: 'wrap' }}>
                <Box sx={{ p: 1.25, borderRadius: 2.8, bgcolor: 'rgba(255,255,255,0.9)', border: '1px solid rgba(255,255,255,0.74)', maxWidth: 310, boxShadow: '0 12px 24px rgba(2,6,23,0.14)' }}>
                  <Typography sx={{ fontSize: 10.6, color: '#64748B', fontWeight: 800 }}>Current detail</Typography>
                  <Typography sx={{ fontSize: 14.6, color: '#0F172A', fontWeight: 800, mt: 0.25 }}>{activeMachine.label}</Typography>
                  <Typography sx={{ fontSize: 11.1, color: '#475569', mt: 0.25 }}>{activeMachine.focusArea}</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap' }}>
                  <Button variant="contained" onClick={() => focusSmartSearch3DZone(activeMachine.zoneId)} sx={{ bgcolor: '#0F172A', borderRadius: 999, textTransform: 'none', fontWeight: 800 }}>
                    Back to {activeZone.label}
                  </Button>
                  {smartSearch3DZoneViews[activeMachine.zoneId].machineIds
                    .filter((machineId) => machineId !== smartSearch3DMachineId)
                    .map((machineId) => {
                      const machine = smartSearch3DMachineViews[machineId];
                      return (
                        <Button
                          key={machineId}
                          variant="outlined"
                          onClick={() => focusSmartSearch3DMachine(machineId)}
                          sx={{ borderColor: `${machine.tone}55`, color: '#FFFFFF', bgcolor: 'rgba(15,23,42,0.26)', backdropFilter: 'blur(10px)', textTransform: 'none', borderRadius: 999, '&:hover': { borderColor: machine.tone, bgcolor: 'rgba(15,23,42,0.42)' } }}
                        >
                          {machine.label}
                        </Button>
                      );
                    })}
                </Box>
              </Box>
            ) : null}
          </Box>

          <Grid container spacing={1.2} sx={{ mt: 1.6 }}>
            {activeMetrics.map((ctx) => (
              <Grid key={ctx.label} size={{ xs: 12, md: 4 }}>
                <Box sx={{ p: 1.5, borderRadius: 2.6, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                  <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>{ctx.label}</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, mt: 0.35, color: ctx.tone }}>{ctx.value}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={1.2} sx={{ mt: 0.2 }}>
            <Grid size={{ xs: 12, lg: 8 }}>
              <Paper elevation={0} sx={{ p: 1.65, borderRadius: 3, bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', height: '100%' }}>
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>DESCRIPTION</Typography>
                <Typography variant="body2" sx={{ color: activeTheme.textPrimary, mt: 0.55, lineHeight: 1.65 }}>
                  {activeSummary}
                </Typography>
                <Typography variant="body2" sx={{ color: '#475569', mt: 1.05, lineHeight: 1.65 }}>
                  {activeDescription}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, mt: 1.35, display: 'block' }}>HIERARCHY PATH</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7, flexWrap: 'wrap', mt: 0.7 }}>
                  {smartSearch3DPathNodes
                    .filter((node) => node.level !== 'machine' || smartSearch3DLevel === 'machine')
                    .map((node, index, nodes) => (
                      <React.Fragment key={node.level}>
                        <Chip size="small" label={node.label} sx={{ bgcolor: '#EEF6FF', color: '#1D4ED8', fontWeight: 700, border: '1px solid #BFDBFE' }} />
                        {index < nodes.length - 1 ? <Typography variant="caption" sx={{ color: '#94A3B8' }}>{'>'}</Typography> : null}
                      </React.Fragment>
                    ))}
                </Box>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, lg: 4 }}>
              <Paper elevation={0} sx={{ p: 1.65, borderRadius: 3, bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', height: '100%', display: 'flex', flexDirection: 'column', gap: 1.1 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>SYNC BEHAVIOR</Typography>
                  <Typography variant="body2" sx={{ mt: 0.5, color: '#475569', lineHeight: 1.6 }}>
                    Changing the hierarchy selection now updates this visual state directly, so the image approximates from site to unit, then through the line and zone, before landing on machine focus instead of staying static.
                  </Typography>
                </Box>
                {renderMetadataBlock()}
                <Box sx={{ display: 'grid', gap: 0.8, mt: 'auto' }}>
                  <Button fullWidth variant="contained" onClick={() => openSmartSearchResult(item)} sx={{ bgcolor: '#044ED7' }}>
                    Open Result
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => openSmartSearchChat(`3D drill-down for ${activeTitle} in ${smartSearchSelectedSiteName}`)}
                    sx={{ borderColor: '#DBDDDF' }}
                  >
                    Open Related Workflow
                  </Button>
                  <Button fullWidth variant="outlined" onClick={() => { void copySmartSearchResultLink(item); }} sx={{ borderColor: '#DBDDDF' }}>
                    Copy Link
                  </Button>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Paper>
      );
    }

    if (item.kind === 'timeSeries') {
      const anomalyCount = item.detail?.anomalies?.length ?? 0;
      const points = item.detail?.points ?? [];
      const latest = points[points.length - 1] ?? 0;
      const previous = points[Math.max(0, points.length - 5)] ?? latest;
      const forecastValue = latest + ((latest - previous) * 0.6);
      const unit = String(item.metric).split(' ').slice(1).join(' ');
      const forecastLabel = `${forecastValue.toFixed(2)}${unit ? ` ${unit}` : ''}`;
      const aiIsTyping = smartSearchTimeSeriesAiTypedText.length === 0 || smartSearchTimeSeriesAiStage < 4;
      const workflowSteps = ['Detect', 'Compare', 'Forecast', 'Validate'];
      const anomalyEvents = (item.detail?.anomalies ?? []).map((index: number) => ({
        label: item.detail?.xLabels?.[index] ?? `Point ${index + 1}`,
        value: item.detail?.points?.[index] ?? null,
      }));
      const askTimeSeriesQuestion = (question: string) => {
        openSmartSearchChat(`${question}\n\nUse ${item.title} as the selected Smart Search time series. Explain the blinking anomaly points, warning/critical thresholds, related asset CV-101 Drive Bearing, and whether a maintenance request should be opened.`);
      };
      return (
        <Paper elevation={0} sx={railSurfaceSx}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5, gap: 1.2 }}>
            <Box>
              <Typography sx={{ color: tokenText.secondary, fontSize: 11.5, fontWeight: 800, letterSpacing: '0.04em' }}>TREND & FORECAST</Typography>
              <Typography sx={{ color: tokenText.primary, fontSize: 18, lineHeight: 1.3, fontWeight: 700, mt: 0.35 }}>{item.title}</Typography>
              <Typography sx={{ color: tokenText.secondary, fontSize: 12, mt: 0.35 }}>{normalizeSmartSearchText(item.subtitle)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip label={item.status} size="small" sx={{ height: 26, borderRadius: '6px', bgcolor: item.status === 'Critical' ? tokenError.softBg : item.status === 'Watch' ? tokenWarning.softBg : tokenBrand.softBg, color: item.status === 'Critical' ? tokenError.main : item.status === 'Watch' ? tokenWarning.dark : tokenBrand.main, fontSize: 11, fontWeight: 700 }} />
              {renderDetailCloseButton()}
            </Box>
          </Box>

          <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: tokenNeutral.lightest, border: `1px solid ${tokenDivider}`, mb: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <AutoAwesomeIcon sx={{ color: tokenWarning.dark, fontSize: 17 }} />
              <Typography sx={{ color: tokenText.primary, fontSize: 13, fontWeight: 700 }}>BLU.AI signal analysis</Typography>
              {aiIsTyping ? <Chip label="Analyzing" size="small" sx={{ ml: 'auto', height: 22, borderRadius: '6px', bgcolor: tokenBrand.softBg, color: tokenBrand.main, fontSize: 10, fontWeight: 600 }} /> : <Chip label="Evidence ready" size="small" sx={{ ml: 'auto', height: 22, borderRadius: '6px', bgcolor: tokenNeutral.lighter, color: tokenText.secondary, fontSize: 10, fontWeight: 700 }} />}
            </Box>
            <Typography sx={{ minHeight: 66, color: tokenText.secondary, fontSize: 12, lineHeight: 1.5, mt: 0.85 }}>
              {smartSearchTimeSeriesAiTypedText}
              {aiIsTyping ? <Box component="span" sx={{ display: 'inline-block', width: 2, height: 12, ml: 0.35, bgcolor: tokenBrand.main, verticalAlign: 'text-bottom', animation: 'smart-search-ts-caret 0.8s ease-in-out infinite', '@keyframes smart-search-ts-caret': { '50%': { opacity: 0 } } }} /> : null}
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 0.5, mt: 1 }}>
              {workflowSteps.map((step, index) => {
                const complete = smartSearchTimeSeriesAiStage > index;
                const active = smartSearchTimeSeriesAiStage === index + 1 && aiIsTyping;
                return (
                  <Box key={step} sx={{ minWidth: 0 }}>
                    <Box sx={{ height: 3, borderRadius: '999px', bgcolor: complete ? tokenBrand.main : tokenNeutral.main }} />
                    <Typography sx={{ mt: 0.45, color: active || complete ? tokenText.primary : tokenText.disabled, fontSize: 9.5, fontWeight: active ? 700 : 500, textAlign: 'center' }}>{step}</Typography>
                  </Box>
                );
              })}
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1 }}>
            {(['1 Hour', '6 Hours', '24 Hours', '7 Days', '30 Days'] as const).map((range) => (
              <Button key={range} size="small" onClick={() => setSmartSearchTimeRange(range)} sx={{ minWidth: 0, minHeight: 28, px: 1, borderRadius: '999px', bgcolor: smartSearchTimeRange === range ? tokenBrand.main : tokenNeutral.lighter, color: smartSearchTimeRange === range ? tokenBrand.contrast : tokenText.secondary, textTransform: 'none', fontSize: 10.5, fontWeight: 600, '&:hover': { bgcolor: smartSearchTimeRange === range ? tokenBrand.dark : tokenNeutral.light } }}>
                {range}
              </Button>
            ))}
          </Box>

          <Paper elevation={0} sx={{ p: 1.5, borderRadius: '12px', bgcolor: 'background.paper', border: `1px solid ${tokenDivider}`, mb: 1.5, position: 'relative', overflow: 'hidden' }}>
             {renderSmartSearchTrend(item.detail.points, item.tone, item.detail.anomalies, 220, {
               warning: Number.parseFloat(String(item.detail.warning)),
               critical: Number.parseFloat(String(item.detail.critical)),
               xLabels: item.detail.xLabels,
               yLabel: item.detail.yLabel,
             })}
             <Box sx={{ position: 'absolute', top: 10, right: 10 }}>
               <Chip size="small" label="Live" sx={{ height: 22, borderRadius: '6px', bgcolor: tokenError.main, color: tokenCommon.white, fontWeight: 700, fontSize: 10 }} />
             </Box>
             {anomalyCount ? (
               <Box sx={{ position: 'absolute', left: 12, bottom: 10, display: 'flex', alignItems: 'center', gap: 0.55, px: 0.85, py: 0.45, borderRadius: '999px', bgcolor: 'rgba(255,255,255,0.94)', border: `1px solid ${tokenDivider}`, color: tokenError.main, fontSize: 10.5, fontWeight: 800 }}>
                 <WarningAmberOutlinedIcon sx={{ fontSize: 14 }} />
                 {anomalyCount} blinking anomalies
               </Box>
             ) : null}
          </Paper>

          <Grid container spacing={0.75} sx={{ mb: 1.5 }}>
            {[
              { label: 'Current', value: item.metric, tone: item.tone },
              { label: 'Warning', value: item.detail.warning, tone: tokenWarning.dark },
              { label: 'Critical', value: item.detail.critical, tone: tokenError.main },
              { label: 'Forecast', value: forecastLabel, tone: tokenBrand.main },
            ].map((metric) => (
              <Grid key={metric.label} size={{ xs: 6 }}>
                <Box sx={{ p: 1, borderRadius: '8px', bgcolor: tokenNeutral.lightest, border: `1px solid ${tokenDivider}` }}>
                  <Typography sx={{ color: tokenText.secondary, fontSize: 10, fontWeight: 600 }}>{metric.label}</Typography>
                  <Typography sx={{ color: metric.tone, fontSize: 15, lineHeight: 1.2, fontWeight: 700, mt: 0.35 }}>{metric.value}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ p: 1.25, borderRadius: '8px', bgcolor: anomalyCount ? tokenError.softBg : tokenBrand.softBg, mb: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.75 }}>
              {anomalyCount ? <WarningAmberOutlinedIcon sx={{ mt: 0.1, fontSize: 16, color: tokenError.main }} /> : <ShowChartOutlinedIcon sx={{ mt: 0.1, fontSize: 16, color: tokenBrand.main }} />}
              <Typography sx={{ color: tokenText.secondary, fontSize: 11.5, lineHeight: 1.45 }}>
                <Box component="span" sx={{ color: tokenText.primary, fontWeight: 700 }}>{anomalyCount ? 'Anomaly identified' : 'Expected range'}:</Box>{' '}
                {anomalyCount ? `Validate ${anomalyCount} excursions against temperature, mode, and the active work order before escalation.` : 'No out-of-range event detected; keep the correlated signal comparison active.'}
              </Typography>
            </Box>
          </Box>
          {anomalyCount ? (
            <Box sx={{ display: 'grid', gap: 0.75, mb: 1.5 }}>
              <Typography sx={{ color: tokenText.secondary, fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Anomaly points</Typography>
              <Grid container spacing={0.75}>
                {anomalyEvents.slice(0, smartSearchTimeSeriesAiStage).map((event: { label: string; value: number | null }, index: number) => (
                  <Grid key={`${event.label}-${index}`} size={{ xs: 12, md: 4 }}>
                    <Box sx={{ p: 1, borderRadius: '8px', bgcolor: 'background.paper', border: `1px solid ${tokenDivider}`, animation: 'smart-search-evidence-in 180ms ease both', '@keyframes smart-search-evidence-in': { from: { opacity: 0, transform: 'translateY(4px)' }, to: { opacity: 1, transform: 'translateY(0)' } } }}>
                      <Typography sx={{ color: tokenText.secondary, fontSize: 10.2, fontWeight: 700 }}>{event.label}</Typography>
                      <Typography sx={{ color: tokenError.main, fontSize: 14.5, fontWeight: 800, mt: 0.25 }}>{event.value ?? 'n/a'} {unit}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          ) : null}
          <Box sx={{ display: 'grid', gap: 0.65, mb: 1.5 }}>
            <Button
              fullWidth
              variant="text"
              onClick={() => askTimeSeriesQuestion('Explain these anomalies and the likely operating cause')}
              endIcon={<ChevronRightIcon sx={{ fontSize: '16px !important' }} />}
              sx={{ justifyContent: 'space-between', minHeight: 34, px: 1, py: 0.65, borderRadius: '8px', bgcolor: 'background.paper', border: `1px solid ${tokenDivider}`, color: tokenBrand.main, textAlign: 'left', textTransform: 'none', fontSize: 11.2, fontWeight: 600, lineHeight: 1.3, '&:hover': { bgcolor: tokenBrand.softBg, borderColor: tokenDivider } }}
            >
              Ask BLU.AI to explain the anomaly pattern
            </Button>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => setCurrentScreen('maintenance_request_log')}
              sx={{ minHeight: 36, borderRadius: '8px', borderColor: tokenBrand.main, color: tokenBrand.main, textTransform: 'none', fontSize: 11.5, fontWeight: 700, '&:hover': { borderColor: tokenBrand.dark, bgcolor: tokenBrand.softBg } }}
            >
              Create maintenance request from this signal
            </Button>
          </Box>
          {renderMetadataBlock()}
          <Box sx={{ mt: 1.2 }}>
            {renderActionBlock()}
          </Box>
        </Paper>
      );
    }

    if (item.kind === 'asset') {
      const assetAiIsTyping = smartSearchAssetAiTypedText.length === 0 || smartSearchAssetAiStage < 4;
      const evidenceCards = [
        {
          icon: <ShowChartOutlinedIcon sx={{ fontSize: 17 }} />,
          label: 'Timeseries X',
          title: 'CV-101 Drive Bearing Vibration',
          value: item.detail?.vibration ?? '6.80 mm/s RMS',
          detail: 'Above warning band; compare with fill-head load and conveyor speed.',
          tone: tokenError.main,
        },
        {
          icon: <ShowChartOutlinedIcon sx={{ fontSize: 17 }} />,
          label: 'Timeseries Y',
          title: 'Fill-head temperature',
          value: item.detail?.temperature ?? '65°C',
          detail: 'Stable but rising during the same operating window.',
          tone: tokenWarning.dark,
        },
        {
          icon: <AssignmentTurnedInOutlinedIcon sx={{ fontSize: 17 }} />,
          label: 'Work order Z',
          title: 'WO-2481 Conveyor bearing verification',
          value: 'In progress',
          detail: 'Primary corrective path tied to the asset watch condition.',
          tone: tokenBrand.main,
        },
        {
          icon: <DescriptionOutlinedIcon sx={{ fontSize: 17 }} />,
          label: 'Source context',
          title: 'Shift note + inspection plan',
          value: '2 records',
          detail: 'Handoff note and planned inspection support the next validation step.',
          tone: tokenSuccess.darker,
        },
      ];
      const workflowSteps = ['Open asset', 'AI correlates evidence', 'Human reviews', 'Approve next action'];
      const suggestedQuestions = [
        'What is the likely root cause?',
        'Compare Timeseries X/Y before escalation',
        'Draft a shift handoff from this evidence',
      ];
      const assetRecommendations = [
        { label: 'Recommended action', value: 'Open maintenance request', detail: 'Use the correlated vibration and work-order evidence as the initial request context.' },
        { label: 'Human review', value: 'Validate before escalation', detail: 'Confirm trend, inspection notes, and physical condition before calling root cause.' },
      ];
      const askAssetQuestion = (question: string) => {
        openSmartSearchChat(`${question}\n\nUse ${item.title} as the selected Smart Search asset. Include linked timeseries CV-101 vibration, active work orders WO-2481 and WO-2476, Zone 1 shift notes, and inspection plan evidence.`);
      };

      return (
        <Paper elevation={0} sx={railSurfaceSx}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5, gap: 1.2 }}>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ color: tokenText.secondary, fontSize: 11.5, fontWeight: 800, letterSpacing: '0.04em' }}>ASSET CORRELATION</Typography>
              <Typography sx={{ color: tokenText.primary, fontSize: 18, lineHeight: 1.3, fontWeight: 700, mt: 0.35 }}>{item.title}</Typography>
              <Typography sx={{ color: tokenText.secondary, fontSize: 12, mt: 0.35 }}>{normalizeSmartSearchText(item.subtitle)} · {item.location} / {item.plant}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip label={item.status} size="small" sx={{ height: 26, borderRadius: '6px', bgcolor: item.status === 'At risk' ? tokenError.softBg : tokenWarning.softBg, color: item.status === 'At risk' ? tokenError.main : tokenWarning.dark, fontSize: 11, fontWeight: 700 }} />
              {renderDetailCloseButton()}
            </Box>
          </Box>

          <Paper elevation={0} sx={{ p: 1.5, borderRadius: '12px', bgcolor: tokenNeutral.lightest, border: `1px solid ${tokenDivider}`, mb: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <AutoAwesomeIcon sx={{ color: tokenWarning.dark, fontSize: 17 }} />
              <Typography sx={{ color: tokenText.primary, fontSize: 13, fontWeight: 700 }}>BLU.AI cross-data summary</Typography>
              {assetAiIsTyping ? (
                <Chip label="Correlating" size="small" sx={{ ml: 'auto', height: 22, borderRadius: '6px', bgcolor: tokenBrand.softBg, color: tokenBrand.main, fontSize: 10, fontWeight: 600 }} />
              ) : (
                <Chip label="Evidence ready" size="small" sx={{ ml: 'auto', height: 22, borderRadius: '6px', bgcolor: tokenNeutral.lighter, color: tokenText.secondary, fontSize: 10, fontWeight: 700 }} />
              )}
            </Box>
            <Typography aria-live="polite" sx={{ minHeight: 92, color: tokenText.primary, fontSize: 12.4, lineHeight: 1.58, mt: 0.85 }}>
              {smartSearchAssetAiTypedText}
              {assetAiIsTyping ? <Box component="span" sx={{ display: 'inline-block', width: 2, height: 13, ml: 0.35, bgcolor: tokenBrand.main, verticalAlign: 'text-bottom', animation: 'smart-search-asset-caret 0.8s ease-in-out infinite', '@keyframes smart-search-asset-caret': { '50%': { opacity: 0 } } }} /> : null}
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 0.5, mt: 1 }}>
              {workflowSteps.map((step, index) => {
                const complete = smartSearchAssetAiStage > index;
                const active = smartSearchAssetAiStage === index + 1 && assetAiIsTyping;
                return (
                  <Box key={step} sx={{ minWidth: 0 }}>
                    <Box sx={{ height: 3, borderRadius: '999px', bgcolor: complete ? tokenBrand.main : tokenNeutral.main }} />
                    <Typography sx={{ mt: 0.45, color: active || complete ? tokenText.primary : tokenText.disabled, fontSize: 9.5, fontWeight: active ? 700 : 500, textAlign: 'center', lineHeight: 1.25 }}>{step}</Typography>
                  </Box>
                );
              })}
            </Box>
          </Paper>

          <Grid container spacing={0.85} sx={{ mb: 1.5 }}>
            {evidenceCards.slice(0, Math.min(evidenceCards.length, smartSearchAssetAiStage)).map((evidence, index) => (
              <Grid key={evidence.label} size={{ xs: 12, md: 6 }}>
                <Paper elevation={0} sx={{ p: 1.15, height: '100%', borderRadius: '12px', bgcolor: 'background.paper', border: `1px solid ${tokenDivider}`, animation: 'smart-search-evidence-in 180ms ease both', animationDelay: `${index * 60}ms`, '@keyframes smart-search-evidence-in': { from: { opacity: 0, transform: 'translateY(4px)' }, to: { opacity: 1, transform: 'translateY(0)' } } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7 }}>
                    <Box sx={{ width: 28, height: 28, borderRadius: '8px', bgcolor: `${evidence.tone}12`, color: evidence.tone, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                      {evidence.icon}
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ color: tokenText.secondary, fontSize: 10.2, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{evidence.label}</Typography>
                      <Typography sx={{ color: tokenText.primary, fontSize: 12.5, lineHeight: 1.3, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{evidence.title}</Typography>
                    </Box>
                  </Box>
                  <Typography sx={{ color: evidence.tone, fontSize: 15.5, lineHeight: 1.2, fontWeight: 800, mt: 0.9 }}>{evidence.value}</Typography>
                  <Typography sx={{ color: tokenText.secondary, fontSize: 11.3, lineHeight: 1.45, mt: 0.45 }}>{evidence.detail}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {!assetAiIsTyping ? (
            <Grid container spacing={0.75} sx={{ mb: 1.5 }}>
              {assetRecommendations.map((recommendation) => (
                <Grid key={recommendation.label} size={{ xs: 12 }}>
                  <Box sx={{ p: 1.15, borderRadius: '10px', bgcolor: tokenNeutral.lightest, border: `1px solid ${tokenDivider}` }}>
                    <Typography sx={{ color: tokenText.secondary, fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{recommendation.label}</Typography>
                    <Typography sx={{ color: tokenText.primary, fontSize: 13.3, fontWeight: 800, mt: 0.35 }}>{recommendation.value}</Typography>
                    <Typography sx={{ color: tokenText.secondary, fontSize: 11.5, lineHeight: 1.45, mt: 0.25 }}>{recommendation.detail}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          ) : null}

          <Paper elevation={0} sx={{ p: 1.35, borderRadius: '12px', bgcolor: tokenBrand.softBg, border: `1px solid ${tokenBrand.lightest}`, mb: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.75 }}>
              <WarningAmberOutlinedIcon sx={{ color: tokenBrand.main, fontSize: 17, mt: 0.15 }} />
              <Typography sx={{ color: tokenText.secondary, fontSize: 11.8, lineHeight: 1.5 }}>
                <Box component="span" sx={{ color: tokenText.primary, fontWeight: 700 }}>Suggested investigation:</Box>{' '}
                validate the correlation before drawing root-cause conclusions, then decide whether WO-2481 should be escalated or kept in watch status.
              </Typography>
            </Box>
          </Paper>

          <Box sx={{ display: 'grid', gap: 0.65, mb: 1.5 }}>
            <Typography sx={{ color: tokenText.secondary, fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Ask BLU.AI</Typography>
            {suggestedQuestions.map((question) => (
              <Button
                key={question}
                fullWidth
                variant="text"
                onClick={() => askAssetQuestion(question)}
                endIcon={<ChevronRightIcon sx={{ fontSize: '16px !important' }} />}
                sx={{ justifyContent: 'space-between', minHeight: 34, px: 1, py: 0.65, borderRadius: '8px', bgcolor: 'background.paper', border: `1px solid ${tokenDivider}`, color: tokenBrand.main, textAlign: 'left', textTransform: 'none', fontSize: 11.2, fontWeight: 600, lineHeight: 1.3, '&:hover': { bgcolor: tokenBrand.softBg, borderColor: tokenDivider } }}
              >
                {question}
              </Button>
            ))}
          </Box>

          <Button
            fullWidth
            variant="contained"
            startIcon={<AutoAwesomeIcon sx={{ fontSize: '17px !important' }} />}
            onClick={() => askAssetQuestion('Continue the root-cause investigation in chat')}
            sx={{ mb: 1.2, minHeight: 40, bgcolor: tokenBrand.main, color: tokenCommon.white, borderRadius: '8px', textTransform: 'none', fontSize: 12, fontWeight: 700, boxShadow: 'none', '&:hover': { bgcolor: tokenBrand.dark, boxShadow: 'none' } }}
          >
            Continue investigation with BLU.AI
          </Button>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => setCurrentScreen('maintenance_request_log')}
            sx={{ mb: 1.2, minHeight: 38, borderRadius: '8px', borderColor: tokenBrand.main, color: tokenBrand.main, textTransform: 'none', fontSize: 12, fontWeight: 700, '&:hover': { borderColor: tokenBrand.dark, bgcolor: tokenBrand.softBg } }}
          >
            Create maintenance request from correlations
          </Button>

          {renderMetadataBlock()}
          <Box sx={{ mt: 1.2 }}>
            {renderActionBlock()}
          </Box>
        </Paper>
      );
    }

    if (item.kind === 'document') {
      const thumbnail = item.thumbnail ?? documentThumbnailFallbacks[item.id] ?? '/images/maquina-fabrica.png';
      const documentAiIsReady = smartSearchDocumentAiStage === 3;
      const documentAiIsTyping = smartSearchDocumentAiStage > 0 && !documentAiIsReady;
      const documentTopic = item.title.replace(/\.(pdf|docx?|xlsx?|pptx?)$/i, '');
      const documentSuggestions = /manual|maintenance|procedure|inspection|work instruction|sop/i.test(documentTopic)
        ? [
            'What maintenance steps should be completed first?',
            'Which safety precautions and tools are required?',
            'Does this document relate to an open work order?',
          ]
        : [
            'What are the most important takeaways?',
            'Which section should I review first?',
            'How does this document affect the current operation?',
          ];
      const documentEvidence = [
        { label: 'Primary source', value: item.fileType ? `${item.fileType} document` : 'Document', detail: getSmartSearchSourceSystem(item) },
        { label: 'Operational scope', value: item.plant ?? item.location ?? 'Current scope', detail: item.detail?.folderPath?.slice(-2).join(' / ') ?? item.location },
        { label: 'Linked context', value: item.detail?.workOrderId ?? 'Related asset / WO', detail: 'Available for follow-up in chat' },
      ];
      const askDocumentQuestion = (question: string) => {
        openSmartSearchChat(`${question}\n\nUse ${item.title} as the primary source and keep the answer grounded in this document.`);
      };

      return (
        <Paper elevation={0} sx={railSurfaceSx}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5, gap: 1.2 }}>
            <Box>
              <Typography sx={{ color: tokenText.secondary, fontSize: 11.5, fontWeight: 800, letterSpacing: '0.04em' }}>DOCUMENT PREVIEW</Typography>
              <Typography sx={{ color: tokenText.primary, fontSize: 18, lineHeight: 1.3, fontWeight: 700, mt: 0.35 }}>{item.title}</Typography>
              <Typography sx={{ color: tokenText.secondary, fontSize: 12, mt: 0.35 }}>{normalizeSmartSearchText(item.subtitle)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip label={item.status} size="small" sx={{ height: 26, borderRadius: '6px', bgcolor: tokenNeutral.lighter, color: tokenText.secondary, fontSize: 11, fontWeight: 700 }} />
              {renderDetailCloseButton()}
            </Box>
          </Box>

          <Paper
            elevation={0}
            sx={{
              p: 1.6,
              borderRadius: '12px',
              bgcolor: tokenNeutral.lightest,
              border: `1px solid ${tokenDivider}`,
              mb: 1.5,
              overflow: 'hidden',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <Box sx={{ width: 30, height: 30, borderRadius: '9px', bgcolor: tokenBrand.softBg, color: tokenBrand.main, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <AutoAwesomeIcon sx={{ fontSize: 17 }} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ color: tokenText.primary, fontSize: 12, fontWeight: 800, letterSpacing: '0.03em' }}>BLU.AI document summary</Typography>
                <Typography sx={{ color: tokenText.secondary, fontSize: 10.5, mt: 0.1 }}>
                  {documentAiIsReady ? 'Summary ready · grounded in this document' : smartSearchDocumentAiStage === 1 ? 'Reading the document…' : 'Summarizing key sections…'}
                </Typography>
              </Box>
              {documentAiIsTyping ? (
                <AutorenewIcon sx={{ ml: 'auto', color: tokenBrand.main, fontSize: 18, animation: 'smart-search-document-spin 1s linear infinite', '@keyframes smart-search-document-spin': { to: { transform: 'rotate(360deg)' } } }} />
              ) : (
                <CheckCircleIcon sx={{ ml: 'auto', color: tokenSuccess.darker, fontSize: 18 }} />
              )}
            </Box>

            <Typography aria-live="polite" sx={{ minHeight: 74, color: tokenText.primary, fontSize: 12.3, lineHeight: 1.6, mt: 1.15 }}>
              {smartSearchDocumentAiTypedText}
              {documentAiIsTyping ? <Box component="span" sx={{ display: 'inline-block', width: 2, height: 13, ml: 0.35, bgcolor: tokenBrand.main, verticalAlign: 'text-bottom', animation: 'smart-search-document-caret 0.8s ease-in-out infinite', '@keyframes smart-search-document-caret': { '50%': { opacity: 0 } } }} /> : null}
            </Typography>

            <Box sx={{ display: 'grid', gap: 0.65, mt: 1.25, opacity: documentAiIsReady ? 1 : 0, transform: documentAiIsReady ? 'translateY(0)' : 'translateY(5px)', transition: 'opacity 180ms ease, transform 180ms ease', pointerEvents: documentAiIsReady ? 'auto' : 'none' }}>
              <Typography sx={{ color: tokenText.secondary, fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Suggested questions</Typography>
              {documentSuggestions.map((question) => (
                <Button
                  key={question}
                  fullWidth
                  variant="text"
                  onClick={() => askDocumentQuestion(question)}
                  endIcon={<ChevronRightIcon sx={{ fontSize: '16px !important' }} />}
                  sx={{ justifyContent: 'space-between', minHeight: 34, px: 1, py: 0.65, borderRadius: '8px', bgcolor: tokenCommon.white, border: `1px solid ${tokenDivider}`, color: tokenBrand.main, textAlign: 'left', textTransform: 'none', fontSize: 11.2, fontWeight: 600, lineHeight: 1.3, '&:hover': { bgcolor: tokenBrand.softBg, borderColor: tokenDivider } }}
                >
                  {question}
                </Button>
              ))}
            </Box>
          </Paper>

          <Grid container spacing={0.75} sx={{ mb: 1.5 }}>
            {documentEvidence.slice(0, Math.max(1, smartSearchDocumentAiStage)).map((evidence, index) => (
              <Grid key={evidence.label} size={{ xs: 12 }}>
                <Box sx={{ p: 1.1, borderRadius: '10px', bgcolor: 'background.paper', border: `1px solid ${tokenDivider}`, animation: 'smart-search-document-evidence-in 180ms ease both', animationDelay: `${index * 70}ms`, '@keyframes smart-search-document-evidence-in': { from: { opacity: 0, transform: 'translateY(4px)' }, to: { opacity: 1, transform: 'translateY(0)' } } }}>
                  <Typography sx={{ color: tokenText.secondary, fontSize: 10.3, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{evidence.label}</Typography>
                  <Typography sx={{ color: tokenText.primary, fontSize: 13, fontWeight: 800, mt: 0.25 }}>{evidence.value}</Typography>
                  <Typography sx={{ color: tokenText.secondary, fontSize: 11.3, lineHeight: 1.4, mt: 0.2 }}>{evidence.detail}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ mb: 1.5 }}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<AutoAwesomeIcon sx={{ fontSize: '17px !important' }} />}
              onClick={() => openSmartSearchChat(`Continue the conversation about ${item.title}. Start from the Smart Search document summary and use this document as the primary source.`)}
              disabled={!documentAiIsReady}
              sx={{ minHeight: 40, bgcolor: tokenBrand.main, color: tokenCommon.white, borderRadius: '8px', textTransform: 'none', fontSize: 12, fontWeight: 700, boxShadow: 'none', '&:hover': { bgcolor: tokenBrand.dark, boxShadow: 'none' } }}
            >
              Continue conversation with BLU.AI
            </Button>
          </Box>

          <Paper elevation={0} sx={{ p: 1.5, borderRadius: '12px', bgcolor: tokenNeutral.lightest, border: `1px solid ${tokenDivider}`, mb: 1.5 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '104px minmax(0, 1fr)', gap: 1.25, alignItems: 'start' }}>
              <Box component="img" src={thumbnail} alt={item.title} sx={{ width: '100%', height: 78, objectFit: 'cover', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ color: tokenText.secondary, fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em' }}>Source preview</Typography>
                <Typography sx={{ color: tokenText.primary, fontSize: 11.5, lineHeight: 1.5, mt: 0.35 }}>
                  {item.summary ?? item.detail?.summary}
                </Typography>
              </Box>
            </Box>
            {Array.isArray(item.detail?.highlights) && item.detail.highlights.length ? (
              <Box sx={{ mt: 1.2, display: 'flex', gap: 0.55, flexWrap: 'wrap' }}>
                {item.detail.highlights.slice(0, 3).map((highlight: string, index: number) => (
                  <Chip key={`${item.id}-highlight-${index}`} label={highlight.replace(/\.$/, '')} size="small" sx={{ maxWidth: '100%', height: 24, bgcolor: tokenCommon.white, color: tokenText.secondary, border: `1px solid ${tokenDivider}`, '& .MuiChip-label': { px: 0.8, overflow: 'hidden', textOverflow: 'ellipsis', fontSize: 10.2 } }} />
                ))}
              </Box>
            ) : null}
          </Paper>
          <Box sx={{ mt: 1.2 }}>
            {renderMetadataBlock()}
          </Box>
          <Box sx={{ mt: 1.2 }}>
            {renderActionBlock()}
          </Box>
        </Paper>
      );
    }

    return (
      <Paper elevation={0} sx={railSurfaceSx}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, gap: 1.2 }}>
          <Box>
            <Typography variant="subtitle2" sx={{ color: item.tone, fontWeight: 800 }}>RESULT DETAIL</Typography>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>{item.title}</Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>{item.subtitle}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip label={item.status} sx={{ bgcolor: `${item.tone}16`, color: item.tone, fontWeight: 800 }} />
            {renderDetailCloseButton()}
          </Box>
        </Box>
        <Paper elevation={0} sx={{ p: 2, borderRadius: 3, bgcolor: '#EBEDF0', border: '1px solid #DBDDDF', mb: 2 }}>
          <Typography variant="body2" sx={{ color: activeTheme.textPrimary, lineHeight: 1.6 }}>
            {item.summary}
          </Typography>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Box>
              <Typography variant="caption" sx={{ color: '#626465', fontWeight: 700 }}>OWNER / ASSIGNEE</Typography>
              <Typography variant="body2" sx={{ fontWeight: 800 }}>{item.detail.owner || item.plant}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: '#626465', fontWeight: 700 }}>NEXT STEP</Typography>
              <Typography variant="body2" sx={{ fontWeight: 800 }}>{item.detail.nextStep || item.detail.action || 'Review and take appropriate action in the linked workflow.'}</Typography>
            </Box>
          </Box>
        </Paper>
        {renderMetadataBlock()}
        <Box sx={{ mt: 1.2 }}>
          {renderActionBlock()}
        </Box>
      </Paper>
    );
  };

  const getSmartSearchHierarchyNodeCount = (node: SmartSearchHierarchyNode): number | undefined => {
    const baseCount = smartSearchHierarchyCountMap[node.id] ?? (node.children?.length ? node.children.length : undefined);
    if (baseCount === undefined) return undefined;
    const tab = smartSearchActiveTab;
    if (tab === 'All' || tab === 'Site Overview') return baseCount;
    let activeTotal: number;
    let denom: number;
    if (tab === 'Maintenance Requests') {
      activeTotal = smartSearchScopedMaintenanceRequests.length;
      denom = smartSearchResultCountMap.All || 1;
    } else if (tab === 'Work Orders') {
      activeTotal = smartSearchScopedWorkOrders.length;
      denom = smartSearchResultCountMap.All || 1;
    } else if (tab === 'Spare Parts') {
      activeTotal = smartSearchSpareParts.length;
      denom = inventoryParts.length || 1;
    } else {
      activeTotal = smartSearchResultCountMap[tab as Exclude<SmartSearchCategory, 'All'>] ?? 0;
      denom = smartSearchResultCountMap.All || 1;
    }
    if (activeTotal <= 0) return 0;
    const fraction = Math.min(activeTotal / denom, 1);
    return Math.max(1, Math.round(baseCount * fraction));
  };

  const renderSmartSearchHierarchyNode = (node: SmartSearchHierarchyNode, depth = 0): React.ReactNode => {
    const hasChildren = Boolean(node.children?.length);
    const isExpanded = Boolean(smartSearchHierarchySearch) || smartSearchHierarchyExpandedIds.includes(node.id);
    const isSelected = smartSearchHierarchySelectedId === node.id;
    const nodeCount = getSmartSearchHierarchyNodeCount(node);
    const nodeIcon = node.kind === 'global' || node.kind === 'region'
      ? <PublicOutlinedIcon sx={{ fontSize: 15 }} />
      : node.kind === 'plant' || node.kind === 'site'
        ? <ApartmentOutlinedIcon sx={{ fontSize: 15 }} />
        : node.kind === 'asset'
          ? <CheckCircleIcon sx={{ fontSize: 14 }} />
          : <FolderOutlinedIcon sx={{ fontSize: 15 }} />;

    return (
      <Box key={node.id}>
        <Button
          variant="text"
          fullWidth
          onClick={() => {
            const nextExperienceMode = inferSmartSearchExperienceFromHierarchyId(node.id);
            if (nextExperienceMode !== 'default' && nextExperienceMode !== smartSearchExperienceMode) {
              runSmartSearch(getSmartSearchPresetQuery(nextExperienceMode), 'All', undefined, nextExperienceMode);
              return;
            }
            setSmartSearchHierarchySelectedId(node.id);
            if (hasChildren) toggleSmartSearchHierarchyNode(node.id);
          }}
          sx={{
            justifyContent: 'space-between',
            px: 1.15,
            py: 0.72,
            pl: `${0.75 + Math.min(depth, 6) * 0.72}rem`,
            borderRadius: 0,
            textTransform: 'none',
            minHeight: 0,
            bgcolor: isSelected ? tokenBrand.selectedBg : 'transparent',
            color: tokenText.primary,
            borderLeft: isSelected ? `3px solid ${tokenBrand.main}` : '3px solid transparent',
            '&:hover': { bgcolor: isSelected ? tokenBrand.selectedBg : tokenNeutral.lightest },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.65, minWidth: 0, flexGrow: 1, textAlign: 'left' }}>
            <Box sx={{ width: 14, display: 'grid', placeItems: 'center', color: tokenText.secondary, flexShrink: 0 }}>
              {hasChildren ? (isExpanded ? <ExpandMoreIcon sx={{ fontSize: 16 }} /> : <ChevronRightIcon sx={{ fontSize: 16 }} />) : <ChevronRightIcon sx={{ fontSize: 14, opacity: 0.5 }} />}
            </Box>
            <Box sx={{ color: isSelected ? tokenBrand.main : tokenText.secondary, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              {nodeIcon}
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: 13, fontWeight: isSelected ? 700 : node.kind === 'site' ? 700 : 500, color: isSelected ? tokenBrand.main : tokenText.primary, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {node.label}
              </Typography>
              {node.meta && (depth <= 5 || isSelected) ? (
                <Typography sx={{ fontSize: 10.2, color: tokenText.disabled, lineHeight: 1.2, mt: 0.12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {node.meta}
                </Typography>
              ) : null}
            </Box>
          </Box>
          {typeof nodeCount === 'number' ? (
            <Chip size="small" label={nodeCount} sx={{ height: 22, ml: 0.6, flexShrink: 0, bgcolor: 'background.paper', color: tokenText.disabled, border: `1px solid ${tokenDivider}`, fontWeight: 800, borderRadius: 999, '& .MuiChip-label': { px: 0.68, fontSize: 10.4 } }} />
          ) : null}
        </Button>
        {hasChildren && isExpanded ? (
          <Box sx={{ mt: 0.1, display: 'grid', gap: 0.08 }}>
            {node.children?.map((child) => renderSmartSearchHierarchyNode(child, depth + 1))}
          </Box>
        ) : null}
      </Box>
    );
  };
  const renderColumbusSelectedContextCard = () => {
    const metricIcons = [
      <DescriptionOutlinedIcon sx={{ fontSize: 22 }} />,
      <AssignmentTurnedInOutlinedIcon sx={{ fontSize: 22 }} />,
      <NotificationsOutlinedIcon sx={{ fontSize: 22 }} />,
      <SchoolOutlinedIcon sx={{ fontSize: 22 }} />,
      <ShowChartOutlinedIcon sx={{ fontSize: 22 }} />,
      <ViewInArOutlinedIcon sx={{ fontSize: 22 }} />,
    ];

    return (
      <Paper
        elevation={0}
        sx={{
          p: 1.2,
          borderRadius: 3,
          bgcolor: '#FFFFFF',
          border: '1px solid #E5EAF3',
          boxShadow: '0 10px 20px rgba(15,23,42,0.035)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.2 }}>
          <Typography sx={{ fontSize: 11.2, color: '#64748B', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.14em' }}>
            Selected Context
          </Typography>
          <Chip
            label="Active"
            size="small"
            sx={{
              bgcolor: '#E8F8EC',
              color: '#15803D',
              fontWeight: 800,
              borderRadius: 999,
              '& .MuiChip-label': { px: 1.1 },
            }}
          />
        </Box>

        <Typography sx={{ fontSize: 16.8, color: '#0F172A', fontWeight: 900, mt: 0.8, lineHeight: 1.15 }}>
          {smartSearchSelectedHierarchyDetail.title}
        </Typography>
        <Typography sx={{ fontSize: 12.1, color: '#718096', lineHeight: 1.5, mt: 0.42 }}>
          {smartSearchSelectedHierarchyPathLabel}
        </Typography>
        <Typography sx={{ fontSize: 12.5, color: '#334155', lineHeight: 1.52, mt: 0.8, mb: 0.95 }}>
          {smartSearchSelectedHierarchyDetail.summary}
        </Typography>

        <Grid container spacing={0.85}>
          {smartSearchContextCountCards.map((metric, index) => (
            <Grid key={metric.label} size={{ xs: 6 }}>
              <Box
                sx={{
                  p: 0.95,
                  borderRadius: 2,
                  bgcolor: '#FFFFFF',
                  border: '1px solid #E5EAF3',
                  minHeight: 72,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.85,
                }}
              >
                <Box
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: '50%',
                    bgcolor: `${metric.tone}10`,
                    color: metric.tone,
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Box sx={{ transform: 'scale(0.85)', display: 'grid', placeItems: 'center' }}>{metricIcons[index]}</Box>
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontSize: 15.5, color: metric.tone, fontWeight: 900, lineHeight: 1 }}>
                    {metric.value}
                  </Typography>
                  <Typography sx={{ fontSize: 11.3, color: '#334155', fontWeight: 700, mt: 0.28, lineHeight: 1.24 }}>
                    {metric.label}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>
    );
  };

  const smartSearchWorkspaceHeaderStickyTop = 0;
  const smartSearchWorkspaceHeaderStickyHeight = 56;
  const smartSearchResultsNavStickyTop = smartSearchWorkspaceHeaderStickyTop + smartSearchWorkspaceHeaderStickyHeight + 12;
  const smartSearchSidebarStickyOffset = 20;
  const smartSearchSidebarStickyTop = smartSearchResultsNavStickyTop;
  const smartSearchDesktopSidebarWidth = 'clamp(344px, 23.75vw, 392px)';

  const renderColumbusHierarchySidebar = () => (
    <Paper
      elevation={0}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        p: 1.5,
        border: `1px solid ${tokenDivider}`,
        borderRadius: '12px',
        bgcolor: 'background.paper',
        boxShadow: '0 2px 7px rgba(15,23,42,0.06)',
        height: { lg: `calc(100vh - ${smartSearchSidebarStickyTop + smartSearchSidebarStickyOffset}px)` },
        minHeight: { lg: 660 },
        maxHeight: { lg: `calc(100vh - ${smartSearchSidebarStickyTop + smartSearchSidebarStickyOffset}px)` },
      }}
    >
      <Box sx={{ px: 0.2, pt: 0.2, pb: 0.8, borderBottom: `1px solid ${tokenDivider}` }}>
        <Typography sx={{ fontSize: 16, color: tokenText.primary, fontWeight: 800 }}>
          Hierarchy
        </Typography>
      </Box>
      <Box sx={{ pt: 0.8, minHeight: 0, flex: 1, overflowY: { lg: 'auto' }, overflowX: 'hidden' }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 0.7, mb: 0.8, position: 'sticky', top: 0, zIndex: 1, bgcolor: 'background.paper', pb: 0.55 }}>
          <TextField
            size="small"
            placeholder="Search hierarchy..."
            value={smartSearchHierarchyFilter}
            onChange={(event) => setSmartSearchHierarchyFilter(event.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: '#94A3B8', fontSize: 18, mr: 0.8 }} />,
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                bgcolor: 'background.paper',
                fontSize: 11.8,
                minHeight: 34,
                border: `1px solid ${tokenDivider}`,
                '& fieldset': { border: 'none' },
              },
            }}
          />
          <IconButton sx={{ width: 34, height: 34, borderRadius: 2, border: `1px solid ${tokenDivider}`, color: tokenText.secondary, bgcolor: 'background.paper' }}>
            <TuneIcon sx={{ fontSize: 15.5 }} />
          </IconButton>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.12 }}>
          {renderSmartSearchHierarchyNode(smartSearchVisibleHierarchyRoot)}
        </Box>
      </Box>
    </Paper>
  );

  const renderColumbusSearchInsight = () => {
    if (!smartSearchInsight) return null;

    const siteProducts = smartSearchIsColumbusScope
      ? [
          {
            accent: tokenBrand.main,
            description: 'Needle products offered in sizes for safe and accurate medication delivery.',
            detail: 'We manufacture this product family at Columbus West.',
            image: columbusSmartSearchProductImages.cannula,
            title: 'Cannula',
          },
          {
            accent: tokenBrand.main,
            description: 'Trusted syringes and needles used in hospitals, clinics, and homes around the world.',
            detail: 'We manufacture this site portfolio in Columbus.',
            image: columbusSmartSearchProductImages.hypodermic,
            title: 'Hypodermic + Syringe & Needles',
          },
          {
            accent: tokenBrand.main,
            description: 'IV therapy devices used to deliver treatments and ensure reliable patient outcomes.',
            detail: 'We manufacture this site portfolio in Columbus.',
            image: columbusSmartSearchProductImages.posiflush,
            title: 'Posiflush',
          },
        ]
      : [];
    const atAGlanceCards = [
      { icon: <ApartmentOutlinedIcon sx={{ fontSize: 18 }} />, label: 'Facility Size', value: '680K', detail: 'sq ft', tone: tokenBrand.main },
      { icon: <PersonOutlineIcon sx={{ fontSize: 18 }} />, label: 'Team Members', value: '1,300+', detail: '', tone: tokenBrand.main },
      { icon: <CalendarTodayOutlinedIcon sx={{ fontSize: 18 }} />, label: 'Year Established', value: '1949', detail: '', tone: tokenBrand.main },
      { icon: <PublicOutlinedIcon sx={{ fontSize: 18 }} />, label: 'Patents', value: '21', detail: 'U.S. patents', tone: tokenBrand.main },
      { icon: <Inventory2OutlinedIcon sx={{ fontSize: 18 }} />, label: 'R&D+', value: '600+', detail: '# of employees', tone: tokenBrand.main },
      { icon: <ShowChartOutlinedIcon sx={{ fontSize: 18 }} />, label: 'Fiscal 2024 Sales', value: '$1.7B', detail: 'U.S. dollars', tone: tokenBrand.main },
    ];
    const typedBubbleBody = smartSearchColumbusBubbleTypedBody || '';
    const overviewPanelSx = {
      p: 0,
      borderRadius: 2.4,
      border: `1px solid ${tokenDivider}`,
      bgcolor: 'background.paper',
      boxShadow: 'none',
      overflow: 'hidden',
    };
    const overviewPanelHeaderSx = {
      display: 'flex',
      alignItems: 'center',
      gap: 0.75,
      px: 1,
      py: 0.85,
      bgcolor: 'background.paper',
      borderBottom: `1px solid ${tokenDivider}`,
    };
    const overviewHeaderIconSx = {
      width: 22,
      height: 22,
      borderRadius: '7px',
      bgcolor: tokenBrand.softBg,
      color: tokenBrand.main,
      display: 'grid',
      placeItems: 'center',
      flexShrink: 0,
    };
    const overviewPanelBodySx = {
      p: 1,
      bgcolor: 'rgba(15, 23, 42, 0.012)',
    };
    const overviewInnerCardSx = {
      bgcolor: 'background.paper',
      border: `1px solid ${tokenDivider}`,
      boxShadow: 'none',
    };

    return (
      <Box sx={{ p: { xs: 0, md: 0.1 } }}>
        <Box sx={{ display: 'grid', gap: 1 }}>
          <Box
            sx={{
              position: 'relative',
              overflow: 'hidden',
              borderRadius: 3,
              border: `1px solid ${tokenDivider}`,
              bgcolor: 'background.paper',
            }}
          >
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '0.62fr 1.38fr' }, gap: { xs: 2, md: 2 }, p: { xs: 1.5, md: 2 } }}>
              <Box sx={{ minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', py: { xs: 1, md: 3 }, pl: { md: 1 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.55, mb: 1.25 }}>
                  <AutoAwesomeIcon sx={{ color: tokenWarning.dark, fontSize: 15 }} />
                  <Typography sx={{ color: tokenBrand.main, fontWeight: 700, fontSize: 11.5, letterSpacing: '0.02em' }}>
                    SMART REACH BD U.S.
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                  <Typography sx={{ fontSize: { xs: 28, md: 34 }, lineHeight: 1.08, color: tokenText.primary, fontWeight: 700 }}>
                    {smartSearchSelectedSiteName}
                  </Typography>
                  {smartSearchIsColumbusScope ? <Chip label="Site" size="small" sx={{ height: 26, borderRadius: '6px', bgcolor: tokenError.softBg, color: tokenError.main, fontSize: 11.5, fontWeight: 700 }} /> : null}
                </Box>
                <Typography sx={{ color: tokenText.secondary, fontSize: 14, lineHeight: 1.55, mt: 1.25, maxWidth: 450, minHeight: 66 }}>
                  {typedBubbleBody}
                  <Box
                    component="span"
                    sx={{
                      display: 'inline-block',
                      width: 7,
                      ml: 0.16,
                      color: tokenBrand.main,
                      fontFamily: '"Roboto Mono", monospace',
                      animation: 'smart-search-results-intro-caret 1s steps(1) infinite',
                      '@keyframes smart-search-results-intro-caret': {
                        '50%': { opacity: 0 },
                      },
                    }}
                  >
                    |
                  </Box>
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1.5, mt: 1 }}>
                  <Typography sx={{ color: tokenText.secondary, fontSize: 11.5 }}>Columbus, Nebraska</Typography>
                  <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: tokenNeutral.darkest }} />
                  <Typography sx={{ color: tokenText.secondary, fontSize: 11.5 }}>BD site since 1949</Typography>
                </Box>
              </Box>

              {smartSearchIsColumbusScope ? (
                <Box sx={{ position: 'relative', minHeight: { xs: 300, md: 380 }, borderRadius: '12px', overflow: 'hidden', bgcolor: tokenNeutral.lightest }}>
                  <Box
                    component="img"
                    src={columbusSmartSearchHeroImage}
                    alt="Columbus West site"
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: 'right center',
                    }}
                  />
                  <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.04) 32%, rgba(255,255,255,0) 58%)' }} />
                </Box>
              ) : null}
            </Box>
          </Box>

          <Grid container spacing={0.9}>
            {atAGlanceCards.map((metric) => (
              <Grid key={metric.label} size={{ xs: 12, sm: 6, md: 4, xl: 2 }}>
                <Paper elevation={0} sx={{ p: 1, borderRadius: 2.2, border: `1px solid ${tokenDivider}`, bgcolor: 'rgba(15, 23, 42, 0.012)', height: '100%', boxShadow: 'none' }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.8 }}>
                    <Box sx={{ ...overviewHeaderIconSx, width: 24, height: 24, borderRadius: '8px', mt: 0.05 }}>{metric.icon}</Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontSize: 10.8, color: tokenText.secondary, fontWeight: 700, lineHeight: 1.25 }}>{metric.label}</Typography>
                      <Typography sx={{ fontSize: 12.3, color: tokenText.primary, mt: 0.12, lineHeight: 1.2 }}>{metric.detail}</Typography>
                      <Typography sx={{ fontSize: 18, color: metric.tone, fontWeight: 900, mt: 0.45, lineHeight: 1 }}>{metric.value}</Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: '1.15fr 0.56fr 0.74fr 0.98fr' }, gap: 0.9, alignItems: 'stretch' }}>
            <Paper elevation={0} sx={overviewPanelSx}>
              <Box sx={overviewPanelHeaderSx}>
                <Box sx={overviewHeaderIconSx}>
                  <PersonOutlineIcon sx={{ fontSize: 15 }} />
                </Box>
                <Typography sx={{ fontSize: 13.6, color: tokenText.primary, fontWeight: 800 }}>
                  Leadership Team
                </Typography>
              </Box>
              <Box sx={overviewPanelBodySx}>
                <Grid container spacing={0.75}>
                  {columbusShiftLeadership.map((leader) => (
                    <Grid key={leader.name} size={{ xs: 12, md: 6 }}>
                      <Box sx={{ ...overviewInnerCardSx, p: 0.85, borderRadius: 1.9, minHeight: 64, display: 'grid', gridTemplateColumns: '24px 1fr', gap: 0.7, alignItems: 'start' }}>
                        <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: tokenBrand.softBg, color: tokenBrand.main, display: 'grid', placeItems: 'center', mt: 0.05 }}>
                          <PersonOutlineIcon sx={{ fontSize: 15 }} />
                        </Box>
                        <Box>
                          <Typography sx={{ fontSize: 12.1, color: tokenText.primary, fontWeight: 800, lineHeight: 1.18 }}>{leader.name}</Typography>
                          <Typography sx={{ fontSize: 10.2, color: tokenText.secondary, lineHeight: 1.28, mt: 0.22 }}>{leader.role}</Typography>
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Paper>

            <Paper elevation={0} sx={overviewPanelSx}>
              <Box sx={overviewPanelHeaderSx}>
                <Box sx={overviewHeaderIconSx}>
                  <ApartmentOutlinedIcon sx={{ fontSize: 15 }} />
                </Box>
                <Typography sx={{ fontSize: 13.4, color: tokenText.primary, fontWeight: 800 }}>Our History</Typography>
              </Box>
              <Box sx={overviewPanelBodySx}>
                <Box sx={{ display: 'grid', gap: 0.8, minHeight: 150 }}>
                  {columbusHistoryHighlights.map((item, index) => (
                    <Box
                      key={item}
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: '16px 1fr',
                        gap: 0.5,
                        alignItems: 'start',
                        opacity: index < smartSearchColumbusHistoryVisibleCount ? 1 : 0.12,
                        transform: index < smartSearchColumbusHistoryVisibleCount ? 'translateY(0)' : 'translateY(4px)',
                        transition: 'opacity 140ms ease, transform 140ms ease',
                      }}
                    >
                      <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: tokenBrand.softBg, color: tokenBrand.main, display: 'grid', placeItems: 'center', mt: 0.08 }}>
                        <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: tokenBrand.main }} />
                      </Box>
                      <Typography sx={{ fontSize: 11.2, color: tokenText.secondary, lineHeight: 1.44 }}>
                        {item}
                      </Typography>
                    </Box>
                  ))}
                </Box>
                <Button variant="text" sx={{ mt: 0.5, px: 0, color: tokenBrand.main, textTransform: 'none', fontWeight: 800, minWidth: 0 }}>
                  Read full story
                  <KeyboardArrowRightIcon sx={{ fontSize: 18, ml: 0.25 }} />
                </Button>
              </Box>
            </Paper>

            <Paper elevation={0} sx={overviewPanelSx}>
              <Box sx={overviewPanelHeaderSx}>
                <Box sx={overviewHeaderIconSx}>
                  <CalendarTodayOutlinedIcon sx={{ fontSize: 15 }} />
                </Box>
                <Typography sx={{ fontSize: 13.9, color: tokenText.primary, fontWeight: 800 }}>Today</Typography>
              </Box>
              <Box sx={overviewPanelBodySx}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 0.7 }}>
                  {columbusTodayHighlights.map((item, index) => (
                    <Box
                      key={item}
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: '16px 1fr',
                        gap: 0.45,
                        alignItems: 'start',
                        opacity: index < smartSearchColumbusTodayVisibleCount ? 1 : 0.16,
                        transform: index < smartSearchColumbusTodayVisibleCount ? 'translateY(0)' : 'translateY(4px)',
                        transition: 'opacity 180ms ease, transform 180ms ease',
                      }}
                    >
                      <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: tokenBrand.softBg, color: tokenBrand.main, display: 'grid', placeItems: 'center', mt: 0.03 }}>
                        {index % 4 === 0 ? <ApartmentOutlinedIcon sx={{ fontSize: 11 }} /> : index % 4 === 1 ? <CalendarTodayOutlinedIcon sx={{ fontSize: 10 }} /> : index % 4 === 2 ? <PersonOutlineIcon sx={{ fontSize: 11 }} /> : <Inventory2OutlinedIcon sx={{ fontSize: 11 }} />}
                      </Box>
                      <Typography sx={{ fontSize: 10.95, color: tokenText.secondary, lineHeight: 1.36 }}>
                        {item}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Paper>

            <Paper elevation={0} sx={overviewPanelSx}>
              <Box sx={overviewPanelHeaderSx}>
                <Box sx={overviewHeaderIconSx}>
                  <Inventory2OutlinedIcon sx={{ fontSize: 15 }} />
                </Box>
                <Typography sx={{ fontSize: 13.6, color: tokenText.primary, fontWeight: 800 }}>
                  Our Products
                </Typography>
              </Box>
              <Box sx={overviewPanelBodySx}>
                <Box sx={{ display: 'grid', gap: 0.7 }}>
                  {siteProducts.map((product) => (
                    <Box key={product.title} sx={{ ...overviewInnerCardSx, display: 'grid', gridTemplateColumns: '60px 1fr auto', gap: 0.85, alignItems: 'center', p: 0.88, minHeight: 88, borderRadius: 2.1 }}>
                      <Box component="img" src={product.image} alt={product.title} sx={{ width: 60, height: 60, borderRadius: '50%', display: 'block', flexShrink: 0 }} />
                      <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontSize: 12.8, color: product.accent, fontWeight: 900, lineHeight: 1.18 }}>{product.title}</Typography>
                        <Typography sx={{ fontSize: 10.75, color: tokenText.secondary, lineHeight: 1.38, mt: 0.16 }}>{product.description}</Typography>
                        <Typography sx={{ fontSize: 10.75, color: tokenText.primary, fontWeight: 800, mt: 0.32, lineHeight: 1.28 }}>{product.detail}</Typography>
                      </Box>
                      <ChevronRightIcon sx={{ color: tokenBrand.main, fontSize: 18 }} />
                    </Box>
                  ))}
                </Box>
              </Box>
            </Paper>
          </Box>
        </Box>
      </Box>
    );
  };

  const renderSandySearchInsight = () => {
    if (!smartSearchInsight) return null;

    const typedBubbleBody = smartSearchColumbusBubbleTypedBody || '';
    const atAGlanceCards = [
      { icon: <ApartmentOutlinedIcon sx={{ fontSize: 18 }} />, label: 'Facility Size', value: '650K', detail: 'sq ft', tone: '#2563EB' },
      { icon: <PersonOutlineIcon sx={{ fontSize: 18 }} />, label: 'Team Members', value: '~1,200', detail: '', tone: '#2563EB' },
      { icon: <CalendarTodayOutlinedIcon sx={{ fontSize: 18 }} />, label: 'FY25 COGS (VOP)', value: '$235M', detail: '', tone: '#2563EB' },
      { icon: <PublicOutlinedIcon sx={{ fontSize: 18 }} />, label: 'Operations', value: '24x7', detail: '', tone: '#2563EB' },
      { icon: <Inventory2OutlinedIcon sx={{ fontSize: 18 }} />, label: 'Land', value: '37', detail: 'acres', tone: '#2563EB' },
      { icon: <ShowChartOutlinedIcon sx={{ fontSize: 18 }} />, label: 'Molding Volume', value: '4.8B', detail: 'annually', tone: '#2563EB' },
    ];
    const manufacturingAreas = [
      { icon: <PrecisionManufacturingIcon sx={{ fontSize: 22 }} />, title: 'Autoguard', detail: '12 lines • FY25 volume 330M units' },
      { icon: <ViewInArOutlinedIcon sx={{ fontSize: 22 }} />, title: 'Nexiva', detail: '3 lines • FY26 volume ~60M units' },
      { icon: <SettingsSuggestIcon sx={{ fontSize: 22 }} />, title: 'Q-Syte / Texium', detail: '5 lines • FY26 volume ~120M units' },
      { icon: <Inventory2OutlinedIcon sx={{ fontSize: 22 }} />, title: 'Scrub', detail: '72-80M units • integrated packaging' },
      { icon: <ApartmentOutlinedIcon sx={{ fontSize: 22 }} />, title: 'Molding', detail: '87 presses • 200+ molds' },
      { icon: <AutorenewIcon sx={{ fontSize: 22 }} />, title: 'Extrusion', detail: 'Worldwide manufacturer of Vialon' },
    ];
    return (
      <Box sx={{ p: { xs: 0, md: 0.1 } }}>
        <Box sx={{ display: 'grid', gap: 1 }}>
          <Box
            sx={{
              position: 'relative',
              overflow: 'hidden',
              borderRadius: 3,
              border: '1px solid #E6EEF9',
              background: 'radial-gradient(circle at 18% 18%, rgba(37,99,235,0.08) 0%, rgba(255,255,255,0) 34%), linear-gradient(180deg, #FFFFFF 0%, #F8FBFF 100%)',
            }}
          >
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: '0.88fr 1.12fr' }, gap: { xs: 1.4, xl: 1 }, p: { xs: 1.3, md: 1.6 } }}>
              <Box sx={{ minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.55, mb: 0.8 }}>
                  <AutoAwesomeIcon sx={{ color: '#FF7A00', fontSize: 15 }} />
                  <Typography sx={{ color: '#1D63FF', fontWeight: 900, fontSize: 12.4 }}>
                    SMART REACH BD U.S.
                  </Typography>
                </Box>
                <Typography sx={{ fontSize: { xs: 28, md: 31 }, lineHeight: 1.02, color: '#0F172A', fontWeight: 900 }}>
                  Sandy
                  <Box component="span" sx={{ color: '#EF4444', fontSize: { xs: 20, md: 22 }, fontWeight: 800 }}> • Site</Box>
                </Typography>
                <Typography sx={{ color: '#475569', fontSize: 14.2, lineHeight: 1.58, mt: 1.1, maxWidth: 560, minHeight: 68 }}>
                  {typedBubbleBody}
                  <Box
                    component="span"
                    sx={{
                      display: 'inline-block',
                      width: 7,
                      ml: 0.16,
                      color: '#2563EB',
                      fontFamily: '"Roboto Mono", monospace',
                      animation: 'smart-search-results-intro-caret 1s steps(1) infinite',
                      '@keyframes smart-search-results-intro-caret': {
                        '50%': { opacity: 0 },
                      },
                    }}
                  >
                    |
                  </Box>
                </Typography>
              </Box>

              <Box sx={{ position: 'relative', minHeight: { xs: 290, md: 320 }, borderRadius: 2.8, overflow: 'hidden', bgcolor: '#EAF2FF' }}>
                <Box
                  component="img"
                  src={sandySmartSearchHeroImage}
                  alt="Sandy site"
                  sx={{
                    position: 'absolute',
                    right: 0,
                    bottom: 0,
                    width: { xs: '110%', md: '108%' },
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: { xs: '40% center', md: '32% center' },
                  }}
                />
                <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.9) 17%, rgba(255,255,255,0.18) 40%, rgba(255,255,255,0.03) 61%, rgba(255,255,255,0) 72%)' }} />
                <Paper
                  elevation={0}
                  sx={{
                    position: 'absolute',
                    top: { xs: 16, md: 18 },
                    right: { xs: 18, md: 24 },
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.9,
                    px: { xs: 1.2, md: 1.4 },
                    py: { xs: 0.9, md: 1.05 },
                    borderRadius: 2.2,
                    bgcolor: 'rgba(255,255,255,0.96)',
                    border: '1px solid rgba(219,234,254,0.95)',
                    boxShadow: '0 16px 30px rgba(15,23,42,0.1)',
                    zIndex: 3,
                  }}
                >
                  <Box component="img" src={columbusSmartSearchBrandMark} alt="BD logo" sx={{ width: 22, height: 22, objectFit: 'contain' }} />
                  <Typography sx={{ color: '#243B87', fontSize: { xs: 16, md: 19 }, fontWeight: 900, lineHeight: 1 }}>
                    BD
                  </Typography>
                </Paper>
              </Box>
            </Box>
          </Box>

          <Grid container spacing={0.9}>
            {atAGlanceCards.map((metric) => (
              <Grid key={metric.label} size={{ xs: 12, sm: 6, md: 4, xl: 2 }}>
                <Paper elevation={0} sx={{ p: 1.1, borderRadius: 2.2, border: '1px solid #E7EEF8', bgcolor: '#FFFFFF', height: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.8 }}>
                    <Box sx={{ color: '#2563EB', mt: 0.2 }}>{metric.icon}</Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontSize: 10.8, color: '#64748B', fontWeight: 700, lineHeight: 1.25 }}>{metric.label}</Typography>
                      <Typography sx={{ fontSize: 12.3, color: '#0F172A', mt: 0.12, lineHeight: 1.2 }}>{metric.detail}</Typography>
                      <Typography sx={{ fontSize: 18, color: metric.tone, fontWeight: 900, mt: 0.45, lineHeight: 1 }}>{metric.value}</Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: '1.1fr 0.86fr 0.86fr 1fr' }, gap: 0.9, alignItems: 'stretch' }}>
            <Paper elevation={0} sx={{ p: 1.05, borderRadius: 2.5, border: '1px solid #E7EEF8', bgcolor: '#FFFFFF' }}>
              <Typography sx={{ fontSize: 13.6, color: '#1E293B', fontWeight: 800, mb: 1 }}>
                Key Manufacturing Areas
              </Typography>
              <Grid container spacing={0.75}>
                {manufacturingAreas.map((area) => (
                  <Grid key={area.title} size={{ xs: 12, md: 6 }}>
                    <Box sx={{ p: 0.85, borderRadius: 1.9, bgcolor: '#F8FBFF', border: '1px solid #E7EEF8', minHeight: 78, display: 'grid', gridTemplateColumns: '40px 1fr', gap: 0.7, alignItems: 'start' }}>
                      <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: '#EDF4FF', color: '#2563EB', display: 'grid', placeItems: 'center', mt: 0.05 }}>
                        {area.icon}
                      </Box>
                      <Box>
                        <Typography sx={{ fontSize: 12.1, color: '#0F172A', fontWeight: 800, lineHeight: 1.18 }}>{area.title}</Typography>
                        <Typography sx={{ fontSize: 10.9, color: '#64748B', lineHeight: 1.4, mt: 0.28 }}>{area.detail}</Typography>
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Paper>

            <Paper elevation={0} sx={{ p: 1.05, borderRadius: 2.5, border: '1px solid #E7EEF8', bgcolor: '#FFFFFF' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7, color: '#2563EB' }}>
                <ApartmentOutlinedIcon sx={{ fontSize: 17 }} />
                <Typography sx={{ fontSize: 13.9, color: '#1E293B', fontWeight: 800 }}>Plant Profile</Typography>
              </Box>
              <Box sx={{ display: 'grid', gap: 0.8, mt: 1, minHeight: 150 }}>
                {sandyPlantProfileHighlights.map((item, index) => (
                  <Box
                    key={item}
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: '16px 1fr',
                      gap: 0.5,
                      alignItems: 'start',
                      opacity: index < smartSearchColumbusHistoryVisibleCount ? 1 : 0.12,
                      transform: index < smartSearchColumbusHistoryVisibleCount ? 'translateY(0)' : 'translateY(4px)',
                      transition: 'opacity 140ms ease, transform 140ms ease',
                    }}
                  >
                    <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: '#EEF4FF', color: '#2563EB', display: 'grid', placeItems: 'center', mt: 0.08 }}>
                      <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: '#2563EB' }} />
                    </Box>
                    <Typography sx={{ fontSize: 11.2, color: '#334155', lineHeight: 1.44 }}>
                      {item}
                    </Typography>
                  </Box>
                ))}
              </Box>
              <Button variant="text" sx={{ mt: 0.5, px: 0, color: '#1663FF', textTransform: 'none', fontWeight: 800, minWidth: 0 }}>
                Read full story
                <KeyboardArrowRightIcon sx={{ fontSize: 18, ml: 0.25 }} />
              </Button>
            </Paper>

            <Paper elevation={0} sx={{ p: 1.05, borderRadius: 2.5, border: '1px solid #E7EEF8', bgcolor: '#FFFFFF' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7, color: '#2563EB' }}>
                <CalendarTodayOutlinedIcon sx={{ fontSize: 17 }} />
                <Typography sx={{ fontSize: 13.9, color: '#1E293B', fontWeight: 800 }}>Today</Typography>
              </Box>
              <Box sx={{ display: 'grid', gap: 0.7, mt: 0.9 }}>
                {sandyTodayHighlights.map((item, index) => (
                  <Box
                    key={item}
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: '16px 1fr',
                      gap: 0.45,
                      alignItems: 'start',
                      opacity: index < smartSearchColumbusTodayVisibleCount ? 1 : 0.16,
                      transform: index < smartSearchColumbusTodayVisibleCount ? 'translateY(0)' : 'translateY(4px)',
                      transition: 'opacity 180ms ease, transform 180ms ease',
                    }}
                  >
                    <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: '#EEF4FF', color: '#2563EB', display: 'grid', placeItems: 'center', mt: 0.03 }}>
                      {index % 3 === 0 ? <ApartmentOutlinedIcon sx={{ fontSize: 11 }} /> : index % 3 === 1 ? <Inventory2OutlinedIcon sx={{ fontSize: 11 }} /> : <ShowChartOutlinedIcon sx={{ fontSize: 11 }} />}
                    </Box>
                    <Typography sx={{ fontSize: 10.95, color: '#475569', lineHeight: 1.36 }}>
                      {item}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                p: 1.05,
                borderRadius: 2.5,
                border: '1px solid #E7EEF8',
                bgcolor: '#FFFFFF',
              }}
            >
              <Typography sx={{ fontSize: 13.6, color: '#1E293B', fontWeight: 800, mb: 0.85 }}>
                Our Products
              </Typography>
              <Box sx={{ display: 'grid', gap: 0.7 }}>
                {sandySmartSearchProducts.map((product) => (
                  <Box
                    key={product.title}
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: '60px 1fr auto',
                      gap: 0.85,
                      alignItems: 'center',
                      p: 0.88,
                      minHeight: 88,
                      borderRadius: 2.1,
                      bgcolor: '#FFFFFF',
                      border: '1px solid #E7EEF8',
                      boxShadow: '0 1px 2px rgba(15,23,42,0.03)',
                    }}
                  >
                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        display: 'grid',
                        placeItems: 'center',
                        flexShrink: 0,
                        background: 'radial-gradient(circle at 30% 30%, #17355A 0%, #0E213B 100%)',
                      }}
                    >
                      <Box
                        component="img"
                        src={product.image}
                        alt={product.imageAlt}
                        sx={{
                          width: product.imageScale,
                          height: product.imageScale,
                          objectFit: 'contain',
                          display: 'block',
                        }}
                      />
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontSize: 12.8, color: product.accent, fontWeight: 900, lineHeight: 1.18 }}>
                        {product.title}
                      </Typography>
                      <Typography sx={{ fontSize: 10.75, color: '#475569', lineHeight: 1.38, mt: 0.16 }}>
                        {product.description}
                      </Typography>
                      <Typography sx={{ fontSize: 10.75, color: '#0F172A', fontWeight: 800, mt: 0.32, lineHeight: 1.28 }}>
                        {product.detail}
                      </Typography>
                    </Box>
                    <ChevronRightIcon sx={{ color: '#2563EB', fontSize: 18 }} />
                  </Box>
                ))}
              </Box>
            </Paper>
          </Box>
        </Box>
      </Box>
    );
  };

  const renderColumbusSearchHero = () => (
    <Paper
      elevation={0}
      sx={{
        p: 0,
        borderRadius: 4.5,
        overflow: 'hidden',
        border: '1px solid rgba(18, 42, 72, 0.16)',
        background: 'linear-gradient(135deg, #08192F 0%, #0D2746 56%, #102F56 100%)',
        boxShadow: '0 24px 50px rgba(8, 25, 47, 0.18)',
      }}
    >
      <Box sx={{display: 'grid', gridTemplateColumns: { xs: '1fr', xl: '1.45fr 0.88fr' }}}>
        <Box sx={{p: { xs: 2.2, md: 3 }}}>
          <Typography sx={{fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#7ED4FF', fontWeight: 800}}>
            Smart Search Context
          </Typography>
          <Typography sx={{fontSize: { xs: 28, md: 34 }, lineHeight: 1.02, color: '#F7FBFF', fontWeight: 900, mt: 1}}>
            Columbus West
          </Typography>
          <Typography sx={{fontSize: 14, color: '#FF6A57', fontWeight: 800, mt: 0.4}}>
            Site drill-down ready for Area A, Line 10, and Zone 1
          </Typography>
          <Typography sx={{fontSize: 14, lineHeight: 1.7, color: 'rgba(221, 236, 255, 0.84)', mt: 1.8, maxWidth: 640}}>
            The search was seeded from Global View and is now centered on Columbus West. Use the hierarchy rail to move between site, line, and zone context while keeping documents, tasks, and live operating signals in one place.
          </Typography>
          <Grid container spacing={1.3} sx={{mt: 2}}>
            {[
              { label: 'Facility Size', value: '580K sq ft' },
              { label: 'Associates', value: '1,300+' },
              { label: 'Year Established', value: '1949' },
              { label: 'Global Products', value: '600+' },
            ].map((card) => (
              <Grid key={card.label} size={{ xs: 6, md: 3 }}>
                <Paper elevation={0} sx={{p: 1.5, height: '100%', borderRadius: 3, bgcolor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(126, 212, 255, 0.12)'}}>
                  <Typography sx={{fontSize: 10.5, color: 'rgba(196, 220, 255, 0.72)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 800}}>
                    {card.label}
                  </Typography>
                  <Typography sx={{fontSize: 22, color: '#F7FBFF', fontWeight: 900, mt: 0.7}}>
                    {card.value}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
          <Paper elevation={0} sx={{mt: 2, p: 1.8, borderRadius: 3.2, bgcolor: 'rgba(7, 23, 40, 0.62)', border: '1px solid rgba(124, 146, 185, 0.18)'}}>
            <Typography sx={{fontSize: 12, color: '#8FCAF8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em'}}>
              Selected Zone
            </Typography>
            <Typography sx={{fontSize: 18, color: '#FFFFFF', fontWeight: 900, mt: 0.7}}>
              {smartSearchSelectedHierarchyDetail.title}
            </Typography>
            <Typography sx={{fontSize: 13.5, lineHeight: 1.65, color: 'rgba(214, 228, 247, 0.84)', mt: 0.75}}>
              {smartSearchSelectedHierarchyDetail.summary}
            </Typography>
            <Box sx={{display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1.5}}>
              {smartSearchSelectedHierarchyDetail.metrics.map((metric) => (
                <Chip
                  key={metric.label}
                  label={`${metric.label}: ${metric.value}`}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.06)',
                    color: '#E8F4FF',
                    border: `1px solid ${metric.tone}55`,
                    fontWeight: 800,
                  }}
                />
              ))}
            </Box>
          </Paper>
        </Box>
        <Box sx={{p: { xs: 2.2, md: 2.6 }, display: 'flex', flexDirection: 'column', gap: 1.5}}>
          <Paper elevation={0} sx={{p: 1.2, borderRadius: 3.2, bgcolor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(126, 212, 255, 0.14)'}}>
            <Box component="img" src="/images/site-view.png" alt="Columbus West" sx={{display: 'block', width: '100%', height: 208, objectFit: 'cover', borderRadius: 2.4}} />
            <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mt: 1.2}}>
              <Box>
                <Typography sx={{fontSize: 16, color: '#FFFFFF', fontWeight: 800}}>Columbus, Nebraska, USA</Typography>
                <Typography sx={{fontSize: 12.5, color: 'rgba(214, 228, 247, 0.78)', mt: 0.25}}>BD Site Since 1949</Typography>
              </Box>
              <Chip label="Global View origin" sx={{bgcolor: 'rgba(29, 116, 255, 0.16)', color: '#89C8FF', border: '1px solid rgba(73, 167, 255, 0.34)', fontWeight: 800}} />
            </Box>
          </Paper>
          <Grid container spacing={1.2}>
            {[
              { label: 'Site recovery narrative', value: 'Open Control Tower Site', tone: '#00C2EC' },
              { label: 'Live products', value: '21 active families', tone: '#16A34A' },
              { label: 'Annual revenue', value: '$1.7B', tone: '#FF7A00' },
            ].map((card) => (
              <Grid key={card.label} size={{ xs: 12 }}>
                <Paper elevation={0} sx={{p: 1.4, borderRadius: 2.8, bgcolor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(124, 146, 185, 0.16)'}}>
                  <Typography sx={{fontSize: 11, color: 'rgba(196, 220, 255, 0.72)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em'}}>
                    {card.label}
                  </Typography>
                  <Typography sx={{fontSize: 17, color: card.tone, fontWeight: 900, mt: 0.55}}>
                    {card.value}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
    </Paper>
  );

  const renderColumbusHierarchyRail = () => (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 4,
        border: '1px solid rgba(19, 43, 73, 0.18)',
        background: 'linear-gradient(180deg, #0A1628 0%, #0F1E34 100%)',
        boxShadow: '0 18px 36px rgba(8, 15, 31, 0.18)',
        position: { lg: 'sticky' },
        top: { lg: 24 },
      }}
    >
      <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1.5}}>
        <Box>
          <Typography sx={{fontSize: 12, color: '#8FCBFF', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.14em'}}>
            Hierarchy
          </Typography>
          <Typography sx={{fontSize: 17, color: '#FFFFFF', fontWeight: 900, mt: 0.35}}>
            Columbus West
          </Typography>
        </Box>
        <Chip label="Live context" sx={{bgcolor: 'rgba(29, 116, 255, 0.14)', color: '#B5DAFF', border: '1px solid rgba(73, 167, 255, 0.24)', fontWeight: 800}} />
      </Box>
      <Paper elevation={0} sx={{mb: 1.5, p: 1.3, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(124, 146, 185, 0.16)'}}>
        {renderSmartSearchHierarchyNode(columbusHierarchyRoot)}
      </Paper>
      <Paper elevation={0} sx={{p: 1.5, borderRadius: 3, bgcolor: 'rgba(5, 17, 31, 0.72)', border: '1px solid rgba(124, 146, 185, 0.16)'}}>
        <Typography sx={{fontSize: 11, color: '#8FCBFF', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em'}}>
          Selected Context
        </Typography>
        <Typography sx={{fontSize: 17, color: '#FFFFFF', fontWeight: 900, mt: 0.8}}>
          {smartSearchSelectedHierarchyNode.label}
        </Typography>
        <Typography sx={{fontSize: 13, color: 'rgba(214, 228, 247, 0.82)', lineHeight: 1.6, mt: 0.65}}>
          {smartSearchSelectedHierarchyDetail.summary}
        </Typography>
        <Grid container spacing={1} sx={{mt: 1.2}}>
          {smartSearchSelectedHierarchyDetail.metrics.map((metric) => (
            <Grid key={metric.label} size={{ xs: 12 }}>
              <Box sx={{p: 1.05, borderRadius: 2.4, bgcolor: 'rgba(255,255,255,0.04)', border: `1px solid ${metric.tone}33`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1}}>
                <Typography sx={{fontSize: 12, color: '#D7E7FB', fontWeight: 700}}>
                  {metric.label}
                </Typography>
                <Typography sx={{fontSize: 12, color: metric.tone, fontWeight: 900}}>
                  {metric.value}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Paper>
  );

  const renderSmartSearchWorkspaceHeader = () => (
    <Box sx={{ mb: 0.5 }}>
      <Typography
        variant="h5"
        sx={{
          color: tokenText.primary,
          fontWeight: 700,
          fontSize: { xs: '1.25rem', md: '1.5rem' },
          lineHeight: 1.334,
        }}
      >
        Smart Search
      </Typography>
    </Box>
  );

  const renderSmartSearchFilterSelect = ({
    label,
    value,
    options,
    defaultValue,
    onChange,
  }: {
    defaultValue: string;
    label: string;
    onChange: (nextValue: string) => void;
    options: string[];
    value: string;
  }) => (
    <Box>
      <Typography sx={{ fontSize: 11, lineHeight: '11px', color: tokenText.secondary, mb: 0.35, fontWeight: 500, letterSpacing: '0.12px' }}>
        {label}
      </Typography>
      <Box sx={{ position: 'relative' }}>
        <FormControl fullWidth size="small">
          <Select
            value={value}
            onChange={(event) => onChange(event.target.value as string)}
            IconComponent={() => null}
            sx={{
              height: 36,
              borderRadius: '8px',
              bgcolor: 'background.paper',
              color: tokenText.primary,
              fontSize: 13,
              '& .MuiSelect-select': {
                py: 0.65,
                pl: 1.2,
                pr: 5,
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: tokenDivider,
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: tokenText.secondary,
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: tokenBrand.main,
                borderWidth: '1px',
              },
            }}
          >
            {options.map((option) => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Box
          sx={{
            position: 'absolute',
            right: 8,
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: 0.35,
            color: tokenText.secondary,
          }}
        >
          {value !== defaultValue ? (
          <IconButton
            size="small"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onChange(defaultValue);
            }}
            sx={{
              width: 14,
              height: 14,
              color: tokenText.secondary,
              '&:hover': { bgcolor: 'transparent', color: tokenText.primary },
            }}
          >
            <CloseIcon sx={{ fontSize: 11.5 }} />
          </IconButton>
          ) : null}
          <KeyboardArrowDownIcon sx={{ fontSize: 16, color: tokenText.secondary, pointerEvents: 'none' }} />
        </Box>
      </Box>
    </Box>
  );

  const renderSmartSearchTrainingJourney = () => {
    const trainingLookup = new Map((smartSearchDataMap.Trainings ?? []).map((item) => [item.id, item]));
    const baseTraining = trainingLookup.get('cw-training-site-overview') ?? {
      id: 'cw-training-site-overview-fallback',
      kind: 'training',
      title: 'Columbus West Site Overview',
      summary: 'Site orientation, layout, and key locations.',
      thumbnail: '/images/site-view.png',
      metric: '10 min',
      subtitle: '10 min • BD Site Orientation',
      location: 'Columbus West',
      plant: 'Site orientation',
      updated: 'Available now',
      status: 'Recommended',
      tone: '#2563EB',
      detail: { objective: 'Build site orientation context quickly.' },
    };
    const trainingJourneySteps = [
      {
        id: 'step-1',
        label: 'STEP 1',
        title: 'Orientation & Overview',
        summary: 'Get familiar with the site, processes, and expectations.',
        state: 'recommended' as const,
        badge: 'Recommended next',
      },
      {
        id: 'step-2',
        label: 'STEP 2',
        title: 'Core Skills & Systems',
        summary: 'Learn key systems and operational fundamentals.',
        state: 'completed' as const,
        badge: 'Completed',
      },
      {
        id: 'step-3',
        label: 'STEP 3',
        title: 'Maintenance & Reliability',
        summary: 'Build knowledge on maintenance best practices and reliability.',
        state: 'in-progress' as const,
        badge: 'In progress',
      },
      {
        id: 'step-4',
        label: 'STEP 4',
        title: 'Assess & Certify',
        summary: 'Complete assessments and earn your certification.',
        state: 'locked' as const,
        badge: 'Locked',
      },
    ];
    const journeyVideos = [
      {
        id: baseTraining.id,
        title: 'Columbus West Site Overview',
        thumbnail: '/images/site-view.png',
        duration: '10 min',
        state: 'recommended' as const,
        metaPrimary: 'Columbus West',
        metaSecondary: 'Available now',
        item: { ...baseTraining, thumbnail: '/images/site-view.png' },
      },
      {
        id: 'cw-training-conveyor-fundamentals',
        title: 'Reliability Engineering for Conveyor Systems',
        thumbnail: '/images/Line.png',
        duration: '12 min',
        state: 'completed' as const,
        metaPrimary: 'Zone 1',
        metaSecondary: '3 weeks ago',
        item: {
          ...baseTraining,
          id: 'cw-training-conveyor-fundamentals',
          title: 'Reliability Engineering for Conveyor Systems',
          summary: 'Learn how to keep conveyor systems reliable, efficient, and running strong.',
          metric: '12 min',
          subtitle: '12 min • Reliability Systems',
          thumbnail: '/images/Line.png',
          plant: 'Zone 1',
          updated: '3 weeks ago',
        },
      },
      {
        id: 'cw-training-ops-excellence-journey',
        title: 'Operational Excellence in Conveyor Maintenance',
        thumbnail: '/images/maquina-fabrica.png',
        duration: '8 min',
        state: 'in-progress' as const,
        metaPrimary: 'Columbus West',
        metaSecondary: '1 month ago',
        item: {
          ...baseTraining,
          id: 'cw-training-ops-excellence-journey',
          title: 'Operational Excellence in Conveyor Maintenance',
          summary: 'Inspection routines and preventive maintenance.',
          metric: '8 min',
          subtitle: '8 min • Maintenance Excellence',
          thumbnail: '/images/maquina-fabrica.png',
          plant: 'Columbus West',
          updated: '1 month ago',
        },
      },
      {
        id: 'cw-training-zone-1-recovery-briefing',
        title: 'Zone 1 Recovery Briefing',
        thumbnail: '/images/smart-search-3d/zone-close-overview.png',
        duration: '9 min',
        state: 'locked' as const,
        metaPrimary: 'Line 10',
        metaSecondary: '2 weeks ago',
      },
    ];
    const supportingDocuments = (smartSearchDataMap.Documents ?? [])
      .filter((item) => item.title?.includes('Columbus West') || item.title?.includes('Zone 1'))
      .slice(0, 2);
    const completedCount = journeyVideos.filter((video) => video.state === 'completed').length;

    return (
      <Paper elevation={0} sx={{ p: { xs: 1.4, md: 1.8 }, borderRadius: 3, border: '1px solid #E5EAF3', bgcolor: '#FFFFFF', boxShadow: '0 12px 28px rgba(15,23,42,0.04)' }}>
        <Box
          sx={{
            position: 'relative',
            isolation: 'isolate',
            borderRadius: 3,
            overflow: 'hidden',
            border: '1px solid #E1EAF6',
            backgroundImage: 'radial-gradient(circle at 24% 26%, rgba(191,219,254,0.18) 0%, rgba(255,255,255,0) 30%), linear-gradient(90deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0.985) 34%, rgba(255,255,255,0.9) 56%, rgba(255,255,255,0.22) 80%)',
            backgroundColor: '#FFFFFF',
            backgroundRepeat: 'no-repeat, no-repeat',
            backgroundSize: 'cover, cover',
            backgroundPosition: 'left top, left top',
            minHeight: { xs: 520, md: 354 },
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '0.9fr 1.1fr' },
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 1, p: { xs: 2.2, md: 3.1 }, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Box sx={{ width: 60, height: 60, borderRadius: 2.2, border: '1px solid #B8D0FF', bgcolor: 'rgba(255,255,255,0.92)', color: '#2563EB', display: 'grid', placeItems: 'center', boxShadow: '0 10px 24px rgba(37,99,235,0.08)' }}>
              <SchoolOutlinedIcon sx={{ fontSize: 30 }} />
            </Box>
            <Typography sx={{ fontSize: { xs: 28, md: 32 }, lineHeight: 1.08, color: '#0F172A', fontWeight: 900, mt: 1.8 }}>
              Welcome to your training journey
            </Typography>
            <Typography sx={{ fontSize: 13.5, color: '#42526B', lineHeight: 1.6, mt: 1.25, maxWidth: 430 }}>
              Build skills, stay safe, and excel on the floor.
            </Typography>
            <Typography sx={{ fontSize: 13.5, color: '#42526B', lineHeight: 1.6, mt: 0.25, maxWidth: 430 }}>
              Follow the steps below to complete your learning path.
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexWrap: 'wrap', mt: 2.4 }}>
              <Button
                variant="contained"
                startIcon={<PlayArrowRoundedIcon sx={{ fontSize: 20 }} />}
                onClick={() => journeyVideos[0].item && setSmartSearchSelectedItem(journeyVideos[0].item)}
                sx={{
                  minWidth: 158,
                  height: 42,
                  borderRadius: 2.2,
                  bgcolor: '#2563EB',
                  textTransform: 'none',
                  fontWeight: 800,
                  boxShadow: '0 12px 24px rgba(37,99,235,0.24)',
                  '&:hover': { bgcolor: '#1D4ED8' },
                }}
              >
                Start here
              </Button>
              <Typography sx={{ fontSize: 13.4, color: '#42526B', fontWeight: 600 }}>
                Begin with Step 1
              </Typography>
            </Box>
          </Box>
          <Box sx={{ position: 'relative', zIndex: 1, minHeight: { xs: 220, md: 354 }, overflow: 'hidden' }}>
            <Box
              component="img"
              src="/images/training-journey-hero-operator-v2.png"
              alt="Operator completing a Columbus West training module"
              sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
            />
            <Box sx={{ position: 'absolute', inset: 0, background: { xs: 'linear-gradient(180deg, rgba(255,255,255,0.06), rgba(15,23,42,0.12))', md: 'linear-gradient(90deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.18) 24%, rgba(255,255,255,0) 52%)' } }} />
            <Paper
              elevation={0}
              sx={{ position: 'absolute', right: 16, bottom: 16, px: 1.25, py: 0.9, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.94)', border: `1px solid ${tokenDivider}`, backdropFilter: 'blur(8px)' }}
            >
              <Typography sx={{ color: tokenText.primary, fontSize: 12, fontWeight: 800 }}>Columbus West learning path</Typography>
              <Typography sx={{ color: tokenText.secondary, fontSize: 10.8, mt: 0.15 }}>4 guided steps • role-based progress</Typography>
            </Paper>
          </Box>
        </Box>

        <Box
          sx={{
            mt: 1.8,
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) 44px minmax(0, 1fr) 44px minmax(0, 1fr) 44px minmax(0, 1fr)' },
            gap: { xs: 1.15, md: 0 },
            alignItems: 'center',
          }}
        >
          {trainingJourneySteps.map((step, index) => {
            const isRecommended = step.state === 'recommended';
            const isCompleted = step.state === 'completed';
            const isInProgress = step.state === 'in-progress';
            const isLocked = step.state === 'locked';

            const card = (
              <Paper
                elevation={0}
                sx={{
                  p: 1.55,
                  minHeight: 150,
                  borderRadius: 2.6,
                  border: isRecommended ? '2px solid #2563EB' : isCompleted ? '1px solid #B7E7D0' : isInProgress ? '1px solid #9FC0FF' : '1px solid #E5E7EB',
                  bgcolor: '#FFFFFF',
                  boxShadow: isRecommended ? '0 16px 34px rgba(37,99,235,0.08)' : '0 8px 20px rgba(15,23,42,0.04)',
                }}
              >
                <Chip
                  label={step.label}
                  size="small"
                  sx={{
                    height: 24,
                    borderRadius: 1.4,
                    bgcolor: isRecommended || isInProgress ? '#EEF4FF' : isCompleted ? '#E8F7EF' : '#F3F4F6',
                    color: isRecommended || isInProgress ? '#2563EB' : isCompleted ? '#1F9D62' : '#6B7280',
                    fontWeight: 800,
                    '& .MuiChip-label': { px: 1, fontSize: 10.5 },
                  }}
                />
                <Typography sx={{ fontSize: 16, lineHeight: 1.25, color: '#0F172A', fontWeight: 800, mt: 1.2 }}>
                  {step.title}
                </Typography>
                <Typography sx={{ fontSize: 12.9, color: '#475569', lineHeight: 1.5, mt: 0.55 }}>
                  {step.summary}
                </Typography>
                <Chip
                  icon={
                    isCompleted ? <CheckCircleIcon sx={{ fontSize: '16px !important', color: '#1F9D62 !important' }} /> :
                    isInProgress ? <PlayArrowRoundedIcon sx={{ fontSize: '16px !important', color: '#2563EB !important' }} /> :
                    isLocked ? <LockOutlinedIcon sx={{ fontSize: '15px !important', color: '#6B7280 !important' }} /> :
                    <AutoAwesomeIcon sx={{ fontSize: '15px !important', color: '#2563EB !important' }} />
                  }
                  label={step.badge}
                  size="small"
                  sx={{
                    mt: 1.35,
                    borderRadius: 1.3,
                    bgcolor: isCompleted ? '#ECFDF3' : isInProgress || isRecommended ? '#EEF4FF' : '#F3F4F6',
                    color: isCompleted ? '#1F9D62' : isInProgress || isRecommended ? '#2563EB' : '#6B7280',
                    fontWeight: 700,
                    '& .MuiChip-label': { fontSize: 10.6 },
                  }}
                />
              </Paper>
            );

            if (index === trainingJourneySteps.length - 1) {
              return <Box key={step.id}>{card}</Box>;
            }

            const nextState = trainingJourneySteps[index + 1].state;
            const connectorColor = nextState === 'locked' ? '#D1D5DB' : nextState === 'completed' ? '#22A06B' : '#2563EB';

            return (
              <React.Fragment key={step.id}>
                <Box>{card}</Box>
                <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', justifyContent: 'center' }}>
                  <Box sx={{ flex: 1, height: 3, borderRadius: 999, bgcolor: connectorColor }} />
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      bgcolor: '#FFFFFF',
                      border: `2px solid ${connectorColor}`,
                      color: connectorColor,
                      display: 'grid',
                      placeItems: 'center',
                      mx: 0.3,
                      flexShrink: 0,
                    }}
                  >
                    {nextState === 'completed' ? <CheckCircleIcon sx={{ fontSize: 16 }} /> : nextState === 'locked' ? <LockOutlinedIcon sx={{ fontSize: 15 }} /> : <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#2563EB' }} />}
                  </Box>
                  <Box sx={{ flex: 1, height: 3, borderRadius: 999, bgcolor: nextState === 'locked' ? '#E5E7EB' : '#D8E6FF' }} />
                </Box>
              </React.Fragment>
            );
          })}
        </Box>

        <Box sx={{ display: 'flex', alignItems: { xs: 'flex-start', md: 'center' }, justifyContent: 'space-between', gap: 1.2, flexWrap: 'wrap', mt: 2.1, mb: 1.05 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, flexWrap: 'wrap' }}>
              <Typography sx={{ fontSize: 14.5, color: '#0F172A', fontWeight: 800 }}>
                Step 1: Orientation & Overview
              </Typography>
              <Chip
                label="Recommended next"
                size="small"
                sx={{
                  height: 24,
                  borderRadius: 1.3,
                  bgcolor: '#EEF4FF',
                  color: '#2563EB',
                  fontWeight: 700,
                  '& .MuiChip-label': { fontSize: 10.5 },
                }}
              />
            </Box>
            <Typography sx={{ fontSize: 12.8, color: '#64748B', mt: 0.55 }}>
              Start here. Complete all videos to unlock the next step.
            </Typography>
          </Box>
          <Box sx={{ minWidth: { xs: '100%', md: 210 } }}>
            <Typography sx={{ textAlign: { xs: 'left', md: 'right' }, fontSize: 12.8, color: '#334155', fontWeight: 700 }}>
              {completedCount} of {journeyVideos.length} videos completed
            </Typography>
            <Box sx={{ mt: 0.7, height: 6, borderRadius: 999, bgcolor: '#E6EDF7', overflow: 'hidden' }}>
              <Box sx={{ width: `${(completedCount / journeyVideos.length) * 100}%`, height: '100%', borderRadius: 999, bgcolor: '#2563EB' }} />
            </Box>
          </Box>
        </Box>

        <Grid container spacing={1.2}>
          {journeyVideos.map((video) => {
            const isLockedVideo = video.state === 'locked';
            const isSelectedVideo = Boolean(video.item && smartSearchSelectedItem?.id === video.item.id);
            return (
              <Grid key={video.id} size={{ xs: 12, md: 6, xl: 3 }}>
                <Paper
                  elevation={0}
                  onClick={() => {
                    if (isLockedVideo || !video.item) return;
                    setSmartSearchSelectedItem(video.item);
                  }}
                  sx={{
                    p: 1,
                    borderRadius: 2.5,
                    border: isSelectedVideo ? '1px solid #8DB4FF' : '1px solid #E5EAF3',
                    bgcolor: '#FFFFFF',
                    boxShadow: isSelectedVideo ? '0 14px 30px rgba(37,99,235,0.1)' : '0 8px 22px rgba(15,23,42,0.04)',
                    cursor: isLockedVideo ? 'default' : 'pointer',
                    opacity: isLockedVideo ? 0.88 : 1,
                    height: '100%',
                  }}
                >
                  <Box sx={{ position: 'relative', overflow: 'hidden', borderRadius: 2, height: 126 }}>
                    <Box component="img" src={video.thumbnail} alt={video.title} sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    <Box sx={{ position: 'absolute', top: 9, left: 9, px: 0.8, py: 0.35, borderRadius: 999, bgcolor: 'rgba(255,255,255,0.92)', color: '#334155', fontSize: 10.2, fontWeight: 800 }}>
                      VIDEO
                    </Box>
                    <Box sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
                      <Box sx={{ width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(180deg, #FF5757 0%, #EF4444 100%)', color: '#FFFFFF', display: 'grid', placeItems: 'center', border: '2px solid rgba(255,255,255,0.92)', boxShadow: '0 16px 26px rgba(15,23,42,0.18)' }}>
                        <PlayArrowRoundedIcon sx={{ fontSize: 26, ml: 0.2 }} />
                      </Box>
                    </Box>
                    <Box sx={{ position: 'absolute', right: 8, bottom: 8, px: 0.68, py: 0.2, borderRadius: 999, bgcolor: 'rgba(15,23,42,0.86)', color: '#FFFFFF', fontSize: 9.8, fontWeight: 800 }}>
                      {video.duration}
                    </Box>
                  </Box>
                  <Typography sx={{ fontSize: 13.4, color: '#0F172A', fontWeight: 800, lineHeight: 1.3, mt: 1 }}>
                    {video.title}
                  </Typography>
                  <Typography sx={{ fontSize: 12.2, color: '#64748B', mt: 0.7 }}>
                    {video.metaPrimary}
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: '#7C8AA5', mt: 0.2 }}>
                    {video.metaSecondary}
                  </Typography>
                </Paper>
              </Grid>
            );
          })}
        </Grid>

        {supportingDocuments.length ? (
          <Box sx={{ mt: 1.4 }}>
            <Typography sx={{ fontSize: 12.6, color: '#64748B', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', mb: 0.85 }}>
              Supporting Documents
            </Typography>
            <Grid container spacing={1}>
              {supportingDocuments.map((doc) => (
                <Grid key={doc.id} size={{ xs: 12, md: 6 }}>
                  <Paper
                    elevation={0}
                    onClick={() => setSmartSearchSelectedItem(doc)}
                    sx={{
                      p: 1.05,
                      borderRadius: 2.2,
                      border: '1px solid #E5EAF3',
                      bgcolor: '#FBFDFF',
                      display: 'grid',
                      gridTemplateColumns: '28px 1fr auto',
                      gap: 0.75,
                      alignItems: 'start',
                      cursor: 'pointer',
                      '&:hover': { borderColor: '#BFD4FF', bgcolor: '#FFFFFF' },
                    }}
                  >
                    <Box sx={{ width: 28, height: 28, borderRadius: 1.4, bgcolor: '#EEF4FF', color: '#2563EB', display: 'grid', placeItems: 'center' }}>
                      <DescriptionOutlinedIcon sx={{ fontSize: 17 }} />
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontSize: 12.6, color: '#0F172A', fontWeight: 800, lineHeight: 1.28 }}>
                        {doc.title}
                      </Typography>
                      <Typography sx={{ fontSize: 11.2, color: '#64748B', lineHeight: 1.38, mt: 0.22 }}>
                        {doc.subtitle}
                      </Typography>
                    </Box>
                    <ChevronRightIcon sx={{ color: '#2563EB', fontSize: 18, mt: 0.15 }} />
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        ) : null}
      </Paper>
    );
  };

  const smartSearchHomePromptChips = smartSearchExperienceMode === 'columbus-west-site'
    ? ['Zone 1 bearing risks', 'Columbus West Zone 1 risks', 'Area A work orders', 'SOP documents', 'Time series data']
    : smartSearchExperienceMode === 'sandy-site'
      ? ['Sandy product families', 'Autoguard footprint', 'Nexiva lines', 'Show operator training', 'Molding volume']
      : smartSearchSuggestedQueries.slice(0, 5);
  const smartSearchHomeCatalogStats = getSmartSearchCatalogStats(currentUserName);
  const smartSearchHomeAssistantMessage = smartSearchExperienceMode === 'sandy-site'
    ? {
        eyebrow: 'Hi, I am BD.AI.',
        body: "I can help you explore Sandy's footprint, operations, and product portfolio.",
        cta: 'What would you like to learn?',
      }
    : {
        eyebrow: 'Hi, I am BD.AI.',
        body: 'I can help you find information, insights, and resources across BD.',
        cta: 'How can I help?',
      };
  const smartSearchHomeSearchFallbackQuery = smartSearchHasSpecialSiteExperience
    ? smartSearchHomePresetQuery
    : 'Potential impact of conveyor bearing vibration';
  const smartSearchHomeAssistantBodyText = smartSearchHasSpecialSiteExperience && !smartSearchHomeHasInteracted
    ? smartSearchHomeAssistantTypedBody
    : smartSearchHomeAssistantMessage.body;
  const smartSearchHomeAssistantHasCompletedTyping = smartSearchHomeAssistantBodyText === smartSearchHomeAssistantMessage.body;
  const smartSearchHomeShowTypingCaret = smartSearchHasSpecialSiteExperience
    && !smartSearchHomeHasInteracted
    && !smartSearchHomeAssistantHasCompletedTyping;
  const smartSearchActivePreset: Exclude<SmartSearchExperienceMode, 'default'> | null = smartSearchExperienceMode === 'default' ? null : smartSearchExperienceMode;
  const smartSearchHomePreset = smartSearchActivePreset;
  const prefillSmartSearchHomeQuery = (query: string) => {
    setSmartSearchHomeHasInteracted(true);
    setSmartSearchHomeAssistantTypedBody(smartSearchHomeAssistantMessage.body);
    setSmartSearchHomePresetQuery(query);
    setSmartSearchAutoTypeTarget('');
    setSmartSearchInput(query);
  };
  const smartSearchVoiceSuggestion = smartSearchExperienceMode === 'columbus-west-site'
    ? 'Show me Area A, Line 10, Zone 1 risks with work orders, shift notes, and time series.'
    : smartSearchExperienceMode === 'sandy-site'
      ? 'Show me Sandy site footprint, active lines, products, and open operational risks.'
      : 'Find equipment risk across work orders, shift notes, documents, and time series.';
  const startSmartSearchVoiceCapture = () => {
    setSmartSearchVoiceRecording(true);
    setSmartSearchHomeHasInteracted(true);
    setSmartSearchHomeAssistantTypedBody(smartSearchHomeAssistantMessage.body);
    setSmartSearchAutoTypeTarget('');
  };
  const completeSmartSearchVoiceCapture = () => {
    if (!smartSearchVoiceRecording) return;
    setSmartSearchVoiceRecording(false);
    setSmartSearchInput(smartSearchVoiceSuggestion);
    setSmartSearchHomePresetQuery(smartSearchVoiceSuggestion);
  };
  const cancelSmartSearchVoiceCapture = () => {
    setSmartSearchVoiceRecording(false);
  };
  const smartSearchVoiceButtonSx = {
    color: smartSearchVoiceRecording ? '#DC2626' : '#1D63FF',
    bgcolor: smartSearchVoiceRecording ? 'rgba(220,38,38,0.1)' : 'transparent',
    boxShadow: smartSearchVoiceRecording ? '0 0 0 6px rgba(220,38,38,0.08)' : 'none',
    transition: 'background-color 160ms ease, box-shadow 160ms ease, color 160ms ease',
    '&:hover': {
      bgcolor: smartSearchVoiceRecording ? 'rgba(220,38,38,0.14)' : 'rgba(29,99,255,0.08)',
    },
  };
  const smartSearchVoiceButtonProps = {
    'aria-label': smartSearchVoiceRecording ? 'Recording voice search' : 'Start voice search',
    'aria-pressed': smartSearchVoiceRecording,
    onPointerDown: (event: React.PointerEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      startSmartSearchVoiceCapture();
    },
    onPointerUp: (event: React.PointerEvent<HTMLButtonElement>) => {
      event.preventDefault();
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      completeSmartSearchVoiceCapture();
    },
    onPointerCancel: cancelSmartSearchVoiceCapture,
    onKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if ((event.key === 'Enter' || event.key === ' ') && !event.repeat) {
        event.preventDefault();
        startSmartSearchVoiceCapture();
      }
    },
    onKeyUp: (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        completeSmartSearchVoiceCapture();
      }
    },
  };

  const smartSearchHomeExploreCards = [
    {
      title: 'Training & Learning',
      description: 'Find training and learning resources to build your skills.',
      icon: <SchoolOutlinedIcon sx={{ fontSize: 26 }} />,
      action: () => prefillSmartSearchHomeQuery('Show me training and learning resources relevant to my role.'),
    },
    {
      title: 'Products & Lines',
      description: 'Explore products, lines and assets information.',
      icon: <PrecisionManufacturingIcon sx={{ fontSize: 26 }} />,
      action: () => prefillSmartSearchHomeQuery(
        smartSearchExperienceMode === 'sandy-site'
          ? 'Show me Sandy products, manufacturing lines, and related assets information.'
          : 'Show me Columbus West products, lines, and related assets information.'
      ),
    },
    {
      title: 'Documents & SOPs',
      description: 'Access documents, SOPs and guidelines.',
      icon: <DescriptionOutlinedIcon sx={{ fontSize: 26 }} />,
      action: () => prefillSmartSearchHomeQuery(
        smartSearchExperienceMode === 'sandy-site'
          ? 'Show me SOP documents and guidelines for Sandy.'
          : 'Show me SOP documents and guidelines for Columbus West.'
      ),
    },
    {
      title: 'Tasks & Work Orders',
      description: 'Find tasks, work orders and maintenance information.',
      icon: <AssignmentTurnedInOutlinedIcon sx={{ fontSize: 26 }} />,
      action: () => prefillSmartSearchHomeQuery(
        smartSearchExperienceMode === 'sandy-site'
          ? 'Show me open work orders and maintenance tasks for Sandy manufacturing areas.'
          : 'Show me open work orders and maintenance tasks for Area A, Line 10.'
      ),
    },
    {
      title: 'Notifications',
      description: 'View alerts, updates and system notifications.',
      icon: <NotificationsOutlinedIcon sx={{ fontSize: 26 }} />,
      action: () => prefillSmartSearchHomeQuery(
        smartSearchExperienceMode === 'sandy-site'
          ? 'Show me the latest notifications and alerts for Sandy.'
          : 'Show me the latest notifications and alerts for Columbus West.'
      ),
    },
    {
      title: 'Assets',
      description: 'Search assets, equipment and related asset details.',
      icon: <Inventory2OutlinedIcon sx={{ fontSize: 26 }} />,
      action: () => prefillSmartSearchHomeQuery(
        smartSearchExperienceMode === 'sandy-site'
          ? 'Show me asset details for Sandy equipment and systems.'
          : 'Show me asset details for Columbus West equipment and systems.'
      ),
    },
    {
      title: 'Timeseries Data',
      description: 'Explore time series data and operational trends.',
      icon: <ShowChartOutlinedIcon sx={{ fontSize: 26 }} />,
      action: () => prefillSmartSearchHomeQuery(
        smartSearchExperienceMode === 'sandy-site'
          ? 'Show me time series data and operational trends for Sandy.'
          : 'Show me time series data and operational trends for Area A, Line 10.'
      ),
    },
    {
      title: 'Team & Leadership',
      description: 'View leadership team and org charts.',
      icon: <PersonOutlineIcon sx={{ fontSize: 26 }} />,
      action: () => prefillSmartSearchHomeQuery(
        smartSearchExperienceMode === 'sandy-site'
          ? 'Show me the Sandy leadership team and org chart.'
          : 'Show me the Columbus West leadership team and org chart.'
      ),
    },
  ];

  return (
    <Box sx={{ flexGrow: 1, minHeight: 0, overflow: 'visible', bgcolor: smartSearchView === 'home' ? '#ffffff' : tokenNeutral.lighter }}>
      <Box
        sx={{
          px: smartSearchView === 'home' ? 0 : { xs: 2, md: 3 },
          py: smartSearchView === 'home' ? 0 : { xs: 2, md: 3 },
          display: 'flex',
          flexDirection: 'column',
          gap: smartSearchView === 'home' ? 0 : 2,
        }}
      >
        {smartSearchView === 'home' ? (
          <Box
            sx={{
              minHeight: 'calc(100vh - 64px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'radial-gradient(circle at top, #F8FBFF 0%, #FFFFFF 48%)',
              px: { xs: 2, md: 4, lg: 5, xl: 6 },
              py: { xs: 3, md: 5 },
            }}
          >
            <Box sx={{ width: '100%', maxWidth: 1580 }}>
              <Box
                sx={{
                  minHeight: { xs: 'auto', md: 560 },
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  pb: { xs: 4, md: 2 },
                }}
              >
                <Box
                  sx={{
                    minWidth: 0,
                    width: '100%',
                    maxWidth: 920,
                    mx: 'auto',
                    position: 'relative',
                    zIndex: 2,
                    textAlign: 'center',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2.2 }}>
                    <Box sx={{ display: 'inline-flex', alignItems: 'flex-end', gap: 1.15 }}>
                      <AutoAwesomeIcon sx={{ color: '#FF7A00', fontSize: 28, mb: 0.55 }} />
                      <Typography
                        variant="h1"
                        sx={{
                          color: '#1D63FF',
                          fontWeight: 800,
                          fontSize: { xs: '2.55rem', md: '4.15rem' },
                          letterSpacing: '-0.055em',
                          lineHeight: 0.95,
                          fontFamily: '"Product Sans", "Roboto", "Helvetica", "Arial", sans-serif',
                        }}
                      >
                        Smart Search
                      </Typography>
                      <Typography sx={{ color: '#1D63FF', fontWeight: 500, fontSize: { xs: 14, md: 18 }, mb: 0.72 }}>
                        BD.AI
                      </Typography>
                    </Box>
                  </Box>
                  <Typography
                    sx={{
                      mx: 'auto',
                      mb: 2.15,
                      maxWidth: 660,
                      color: '#52627B',
                      fontSize: { xs: 15, md: 18 },
                      lineHeight: 1.6,
                      minHeight: { xs: 54, md: 58 },
                    }}
                  >
                    {smartSearchHomeAssistantBodyText}
                    {smartSearchHomeShowTypingCaret ? (
                      <Box
                        component="span"
                        sx={{
                          display: 'inline-block',
                          width: 7,
                          ml: 0.2,
                          color: '#2563EB',
                          fontFamily: '"Roboto Mono", monospace',
                          animation: 'smart-search-home-caret 1s steps(1) infinite',
                          '@keyframes smart-search-home-caret': {
                            '50%': { opacity: 0 },
                          },
                        }}
                      >
                        |
                      </Box>
                    ) : null}
                  </Typography>
                  {smartSearchHomeAssistantHasCompletedTyping ? (
                    <Typography sx={{ mb: 2.1, color: '#1D63FF', fontSize: { xs: 14.5, md: 16 }, fontWeight: 700, lineHeight: 1.3 }}>
                      {smartSearchHomeAssistantMessage.cta}
                    </Typography>
                  ) : null}

                  <Paper
                    elevation={0}
                    sx={{
                      p: '8px 12px 8px 20px',
                      borderRadius: 999,
                      bgcolor: '#FFFFFF',
                      border: '1px solid #DCE6F6',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.4,
                      mx: 'auto',
                      maxWidth: 900,
                      boxShadow: '0 18px 36px rgba(15,23,42,0.05)',
                    }}
                  >
                    <SearchIcon sx={{ color: '#94A3B8', fontSize: 28 }} />
                    <TextField
                      autoFocus
                      fullWidth
                      placeholder={smartSearchVoiceRecording ? 'Listening...' : 'Search across sites, documents, training materials, assets, tasks, time series data, and more...'}
                      value={smartSearchInput}
                      onChange={(event) => {
                        setSmartSearchHomeHasInteracted(true);
                        setSmartSearchHomeAssistantTypedBody(smartSearchHomeAssistantMessage.body);
                        setSmartSearchAutoTypeTarget('');
                        setSmartSearchInput(event.target.value);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault();
                          runSmartSearch((smartSearchInput || smartSearchAutoTypeTarget) || smartSearchHomeSearchFallbackQuery, 'All', undefined, smartSearchHomePreset);
                        }
                      }}
                      variant="standard"
                      InputProps={{
                        disableUnderline: true,
                        sx: {
                          color: '#334155',
                          fontSize: { xs: '0.98rem', md: '1.08rem' },
                          '& input::placeholder': {
                            color: '#94A3B8',
                            opacity: 1,
                          },
                        },
                      }}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.2 }}>
                      {smartSearchVoiceRecording ? (
                        <Typography sx={{ color: '#DC2626', fontSize: 12, fontWeight: 800, lineHeight: 1, whiteSpace: 'nowrap', display: { xs: 'none', sm: 'block' } }}>
                          Listening
                        </Typography>
                      ) : null}
                      <Tooltip title={smartSearchVoiceRecording ? 'Release to insert voice suggestion' : 'Hold to simulate voice input'} arrow>
                        <IconButton size="small" {...smartSearchVoiceButtonProps} sx={smartSearchVoiceButtonSx}>
                        <MicIcon fontSize="small" />
                      </IconButton>
                      </Tooltip>
                      <IconButton
                        size="small"
                        onClick={() => runSmartSearch((smartSearchInput || smartSearchAutoTypeTarget) || smartSearchHomeSearchFallbackQuery, 'All', undefined, smartSearchHomePreset)}
                        sx={{ color: '#1D63FF' }}
                      >
                        <SendRoundedIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Paper>

                  <Box sx={{ mt: 2.45, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.2 }}>
                    <Typography sx={{ fontSize: 13.5, color: '#64748B', fontWeight: 500 }}>
                      {smartSearchHomeCatalogStats.sources} connected sources · {smartSearchHomeCatalogStats.total}+ indexed records
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1.05, flexWrap: 'wrap', color: '#475569' }}>
                    <Typography sx={{ fontSize: 15.2, fontWeight: 500 }}>Try searching for:</Typography>
                    {smartSearchHomePromptChips.map((query) => (
                      <Chip
                        key={query}
                        label={query}
                        onClick={() => runSmartSearch(query, 'All', undefined, smartSearchHomePreset)}
                        sx={{
                          height: 38,
                          borderRadius: 999,
                          bgcolor: '#FFFFFF',
                          color: '#42526B',
                          border: '1px solid #E3EAF6',
                          fontWeight: 500,
                          boxShadow: '0 8px 20px rgba(15,23,42,0.025)',
                          '&:hover': {
                            bgcolor: '#F8FBFF',
                            borderColor: '#C7DBFF',
                          },
                        }}
                      />
                    ))}
                  </Box>
                </Box>
                </Box>
              </Box>

              <Box
                sx={{
                  mt: { xs: 3, md: 4 },
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, minmax(0, 1fr))',
                    lg: 'repeat(4, minmax(0, 1fr))',
                    xl: 'repeat(8, minmax(0, 1fr))',
                  },
                  gap: 1.5,
                }}
              >
                {smartSearchHomeExploreCards.map((card) => (
                  <Paper
                    key={card.title}
                    elevation={0}
                    onClick={card.action}
                    sx={{
                      p: '14px 16px 16px',
                      minHeight: 192,
                      borderRadius: '14px',
                      border: '1px solid #E4ECF8',
                      bgcolor: '#FFFFFF',
                      boxShadow: '0 10px 24px rgba(15,23,42,0.025)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 16px 30px rgba(15,23,42,0.06)',
                        borderColor: '#C7DBFF',
                      },
                    }}
                  >
                    <Box sx={{ width: 44, height: 44, borderRadius: '50%', bgcolor: '#EEF4FF', color: '#2563EB', display: 'grid', placeItems: 'center', boxShadow: 'inset 0 0 0 1px #D6E4FF' }}>
                      {card.icon}
                    </Box>
                    <Typography sx={{ mt: 1.9, color: '#1D63FF', fontSize: 15, fontWeight: 800, lineHeight: 1.24 }}>
                      {card.title}
                    </Typography>
                    <Typography sx={{ mt: 0.95, color: '#5E6C87', fontSize: 13.6, lineHeight: 1.5 }}>
                      {card.description}
                    </Typography>
                    <Box sx={{ mt: 'auto', pt: 1.15, color: '#2563EB', display: 'flex', alignItems: 'center' }}>
                      <ChevronRightIcon sx={{ fontSize: 21 }} />
                    </Box>
                  </Paper>
                ))}
              </Box>

              <Box sx={{ mt: 4.2, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, color: '#6B7A90' }}>
                <LockOutlinedIcon sx={{ fontSize: 18, color: '#8DA0BF' }} />
                <Typography sx={{ fontSize: 14, fontWeight: 500 }}>Secure. Private. Built for BD.</Typography>
              </Box>
            </Box>
          </Box>
        ) : (
          <>
            <Box
              sx={{
                position: { lg: 'sticky' },
                top: { lg: smartSearchWorkspaceHeaderStickyTop },
                zIndex: { lg: 18 },
                py: { lg: 0.5 },
                bgcolor: { lg: tokenNeutral.lighter },
              }}
            >
              {renderSmartSearchWorkspaceHeader()}
            </Box>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  lg: smartSearchHasSpecialSiteExperience
                    ? smartSearchShouldShowDetailRail
                      ? `${smartSearchDesktopSidebarWidth} minmax(0, 6fr) minmax(340px, 4fr)`
                      : `${smartSearchDesktopSidebarWidth} minmax(0, 1fr)`
                    : smartSearchShouldShowDetailRail
                      ? 'minmax(0, 7fr) minmax(0, 5fr)'
                      : '1fr',
                },
                gap: { xs: 1.5, lg: 2 },
                alignItems: 'start',
              }}
            >
              {smartSearchHasSpecialSiteExperience ? (
                <Box
                  sx={{
                    minWidth: 0,
                    position: { lg: 'sticky' },
                    top: { lg: smartSearchSidebarStickyTop },
                    alignSelf: 'start',
                  }}
                >
                  {renderColumbusHierarchySidebar()}
                </Box>
              ) : null}

              <Box sx={{ minWidth: 0 }}>
                <Box sx={{ px: 0, py: 1, bgcolor: tokenNeutral.lighter }}>
                  <Typography variant="caption" sx={{ color: tokenText.secondary, fontWeight: 700, mb: 0.75, display: 'block', letterSpacing: 0, textTransform: 'uppercase' }}>Showing results for</Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      px: 0.85,
                      py: 0.5,
                      borderRadius: '12px',
                      bgcolor: 'background.paper',
                      border: `1px solid ${tokenDivider}`,
                    }}
                  >
                    <TextField
                      fullWidth
                      placeholder={smartSearchVoiceRecording ? 'Listening...' : undefined}
                      value={smartSearchInput}
                      onChange={(event) => {
                        setSmartSearchAutoTypeTarget('');
                        setSmartSearchInput(event.target.value);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault();
                          runSmartSearch(smartSearchInput, 'All', undefined, smartSearchActivePreset);
                        }
                      }}
                      variant="standard"
                      InputProps={{
                        disableUnderline: true,
                        sx: {
                          minHeight: 32,
                          px: 0.55,
                          color: tokenText.primary,
                          fontSize: 14,
                          '& input::placeholder': {
                            color: tokenText.secondary,
                            opacity: 1,
                          },
                        },
                      }}
                    />
                    <IconButton onClick={resetSmartSearch} sx={{ width: 32, height: 32, color: tokenBrand.main, flexShrink: 0 }}>
                      <CancelIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                    <Tooltip title={smartSearchVoiceRecording ? 'Release to insert voice suggestion' : 'Hold to simulate voice input'} arrow>
                      <IconButton {...smartSearchVoiceButtonProps} sx={{ ...smartSearchVoiceButtonSx, width: 32, height: 32, flexShrink: 0 }}>
                        <MicIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Tooltip>
                    <IconButton onClick={() => runSmartSearch(smartSearchInput || smartSearchQuery, 'All', undefined, smartSearchActivePreset)} sx={{ width: 32, height: 32, color: tokenBrand.main, flexShrink: 0 }}>
                      <SendRoundedIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Box>
                </Box>

                {renderSmartSearchAiSummary()}

                <Box
                  sx={{
                    position: { lg: 'sticky' },
                    top: { lg: smartSearchResultsNavStickyTop },
                    zIndex: { lg: 20 },
                    mt: 1.5,
                    pb: 0,
                    pt: 0,
                    bgcolor: 'transparent',
                    borderBottom: 'none',
                    isolation: 'isolate',
                  }}
                >
                <Box sx={{ px: { xs: 1, md: 1.25 }, py: 1, bgcolor: 'background.paper', border: `1px solid ${tokenDivider}`, borderBottom: 'none', borderRadius: '12px 12px 0 0', boxShadow: 'none' }}>
                  <Box sx={{ display: 'flex', gap: { xs: 0.9, md: 1.2 }, flexWrap: 'nowrap', overflowX: 'auto', alignItems: 'flex-end', borderBottom: 'none', pb: smartSearchActiveTab === 'Site Overview' || smartSearchActiveTab === 'Maintenance Requests' || smartSearchActiveTab === 'Work Orders' || smartSearchActiveTab === 'Spare Parts' || smartSearchActiveTab === '3D' ? 0 : 1, mb: smartSearchActiveTab === 'Site Overview' || smartSearchActiveTab === 'Maintenance Requests' || smartSearchActiveTab === 'Work Orders' || smartSearchActiveTab === 'Spare Parts' || smartSearchActiveTab === '3D' ? 0 : 1, scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
                      {smartSearchWorkspaceTabs.map((tab) => {
                        const isActive = smartSearchActiveTab === tab;
                        const resultCount = tab === 'Site Overview'
                          ? null
                          : tab === 'Maintenance Requests'
                            ? smartSearchScopedMaintenanceRequests.length
                            : tab === 'Work Orders'
                              ? smartSearchScopedWorkOrders.length
                              : tab === 'Spare Parts'
                                ? smartSearchSpareParts.length
                                : smartSearchResultCountMap[tab];
                        const tabLabel = tab === 'Site Overview'
                          ? 'SITE OVERVIEW'
                          : tab === 'Maintenance Requests'
                            ? 'MAINT. REQUESTS'
                            : tab === 'Work Orders'
                              ? 'WORK ORDERS'
                              : tab === 'Spare Parts'
                                ? 'SPARE PARTS'
                                : smartSearchCategoryDisplayLabels[tab];
                        return (
                          <Button
                            key={tab}
                            variant="text"
                            onClick={() => handleSmartSearchTabChange(tab)}
                            sx={{
                              minWidth: 'auto',
                              flexShrink: 0,
                              px: 0,
                              pb: 1,
                              borderRadius: 0,
                              textTransform: 'uppercase',
                              minHeight: 28,
                              fontSize: 11.5,
                              fontWeight: isActive ? 700 : 500,
                              letterSpacing: '0.1px',
                              color: isActive ? tokenText.primary : tokenText.secondary,
                              borderBottom: isActive ? `2px solid ${tokenBrand.main}` : '2px solid transparent',
                              '&:hover': { bgcolor: 'transparent', borderBottomColor: isActive ? tokenBrand.main : tokenDivider, color: isActive ? tokenText.primary : tokenBrand.main },
                            }}
                          >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.45 }}>
                            <Box component="span">{tabLabel}</Box>
                            {resultCount !== null ? (
                              <Box component="span" sx={{ minWidth: 18, height: 18, px: 0.55, borderRadius: '999px', bgcolor: isActive ? tokenBrand.main : tokenNeutral.dark, color: tokenCommon.white, display: 'grid', placeItems: 'center', fontSize: 10.5, fontWeight: 600, lineHeight: 1 }}>
                                {resultCount}
                              </Box>
                            ) : null}
                          </Box>
                        </Button>
                      );
                    })}
                  </Box>
                  {smartSearchActiveTab === 'Site Overview' || smartSearchActiveTab === 'Maintenance Requests' || smartSearchActiveTab === 'Work Orders' || smartSearchActiveTab === 'Spare Parts' || smartSearchActiveTab === '3D' ? (
                    null
                  ) : (
                    <>
                      <Typography variant="caption" sx={{ color: tokenText.secondary, display: 'block', mb: 0.85, fontSize: 11 }}>
                        About {smartSearchResultCountMap[smartSearchCategory]} results
                      </Typography>
                      <Grid container spacing={1}>
                        <Grid size={{ xs: 12, md: 3 }}>
                          {renderSmartSearchFilterSelect({
                            label: 'Type',
                            value: smartSearchFilters.type,
                            defaultValue: 'All Types',
                            options: ['All Types', 'Documents', 'Tasks & Work Orders', 'Notifications', 'Trainings', 'Assets', 'Time Series', '3D'],
                            onChange: (nextValue) => setSmartSearchFilters((prev) => ({ ...prev, type: nextValue })),
                          })}
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                          {renderSmartSearchFilterSelect({
                            label: smartSearchHasSpecialSiteExperience ? 'Location (Origin)' : 'Location',
                            value: smartSearchFilters.location,
                            defaultValue: 'All Locations',
                            options: smartSearchLocationOptions,
                            onChange: (nextValue) => setSmartSearchFilters((prev) => ({ ...prev, location: nextValue })),
                          })}
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                          {renderSmartSearchFilterSelect({
                            label: 'Plant/Cell/Line',
                            value: smartSearchFilters.plant,
                            defaultValue: 'All Plants/Cell/Line',
                            options: smartSearchPlantOptions,
                            onChange: (nextValue) => setSmartSearchFilters((prev) => ({ ...prev, plant: nextValue })),
                          })}
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                          {renderSmartSearchFilterSelect({
                            label: 'Date',
                            value: smartSearchFilters.date,
                            defaultValue: 'Any time',
                            options: ['Any time', 'Last 24 hours', 'This shift', 'Last 7 days'],
                            onChange: (nextValue) => setSmartSearchFilters((prev) => ({ ...prev, date: nextValue })),
                          })}
                        </Grid>
                      </Grid>
                    </>
                  )}
                </Box>
                </Box>

                <Paper key={`${smartSearchActiveTab}-${smartSearchHierarchySelectedId}`} elevation={0} sx={{ mt: 0, p: { xs: 1.25, md: 2 }, position: 'relative', zIndex: 0, borderRadius: '0 0 12px 12px', border: `1px solid ${tokenDivider}`, borderTop: 'none', bgcolor: 'background.paper', boxShadow: 'none', animation: 'smart-search-scope-in 180ms ease both', '@keyframes smart-search-scope-in': { from: { opacity: 0.55, transform: 'translateY(3px)' }, to: { opacity: 1, transform: 'translateY(0)' } } }}>
                  {smartSearchLoading ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      {[1, 2, 3].map((index) => (
                        <Paper key={index} elevation={0} sx={{ p: 2.5, borderRadius: '12px', border: `1px solid ${tokenDivider}`, bgcolor: 'background.paper', animation: 'pulse 1.2s ease-in-out infinite', '@keyframes pulse': { '0%': { opacity: 0.55 }, '50%': { opacity: 1 }, '100%': { opacity: 0.55 } } }}>
                          <Box sx={{ height: 18, width: '35%', bgcolor: '#DBDDDF', borderRadius: 999, mb: 1.25 }} />
                          <Box sx={{ height: 14, width: '90%', bgcolor: '#EBEDF0', borderRadius: 999, mb: 0.8 }} />
                          <Box sx={{ height: 14, width: '70%', bgcolor: '#EBEDF0', borderRadius: 999 }} />
                        </Paper>
                      ))}
                    </Box>
                  ) : smartSearchActiveTab === 'Site Overview' ? (
                    <Box>
                      {renderSmartSearchSiteOverviewTab()}
                    </Box>
                  ) : smartSearchActiveTab === 'Maintenance Requests' ? (
                    renderSmartSearchMaintenanceList('requests')
                  ) : smartSearchActiveTab === 'Work Orders' ? (
                    renderSmartSearchMaintenanceList('workOrders')
                  ) : smartSearchActiveTab === 'Spare Parts' ? (
                    renderSmartSearchSparePartsList()
                  ) : smartSearchActiveTab === '3D' ? (
                    renderSmartSearchLogbook3DView()
                  ) : smartSearchResultGroups.length ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {renderSmartSearchDefaultBrief()}
                      {smartSearchExperienceMode === 'columbus-west-site' && smartSearchCategory === 'Trainings' ? (
                        renderSmartSearchTrainingJourney()
                      ) : smartSearchResultGroups.map((group) => (
                        <Box key={group.label}>
                          <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.2, fontSize: 17 }}>
                            {group.label} <Box component="span" sx={{ color: '#6B7280', fontSize: 14, fontWeight: 500 }}>{smartSearchHasSpecialSiteExperience ? `(${group.items.length} results)` : ''}</Box>
                          </Typography>
                          {renderSmartSearchResultGroup(group)}
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Paper elevation={0} sx={{ p: 3, borderRadius: '12px', border: `1px solid ${tokenDivider}`, bgcolor: 'background.paper', textAlign: 'center' }}>
                      <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>No results in this view</Typography>
                      <Typography variant="body2" sx={{ maxWidth: 560, mx: 'auto', mb: 2 }}>
                        Try a broader query, reset one of the filters, or search by asset, work order, document, or training title instead.
                      </Typography>
                    </Paper>
                  )}
                </Paper>
              </Box>

              {smartSearchShouldShowDetailRail ? (
                <Box sx={{ minWidth: 0, position: { lg: 'sticky' }, top: { lg: smartSearchSidebarStickyTop }, alignSelf: 'start' }}>
                  {renderSmartSearchDetail(smartSearchSelectedItem)}
                </Box>
              ) : null}
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
};



