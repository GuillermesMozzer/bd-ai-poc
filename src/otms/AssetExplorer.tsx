import {useEffect, useId, useMemo, useRef, useState} from 'react';
import {Autocomplete, Box, Button, Checkbox, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Divider, IconButton, InputAdornment, MenuItem, Paper, Tab, Tabs, TextField, Tooltip, Typography} from '@mui/material';
import {
  AccountTree as HierarchyIcon,
  Add as AddIcon,
  AutoAwesome as InsightIcon,
  CalendarMonth as CalendarIcon,
  ChevronRight as ChevronRightIcon,
  CompareArrows as BiDirectionalIcon,
  Close as CloseIcon,
  ClearAll as ClearFiltersIcon,
  ContentPasteSearch as ScanIcon,
  DescriptionOutlined as DocumentIcon,
  ErrorOutline as AlertIcon,
  Factory as FactoryIcon,
  HealthAndSafety as HealthIcon,
  GridOn as CavityMapIcon,
  Hub as StructureIcon,
  InfoOutlined as InfoIcon,
  Inventory2 as AssetIcon,
  Inventory2Outlined as SparePartsIcon,
  Input as InboundRelationIcon,
  KeyboardArrowDown as DownIcon,
  LinearScale as LineNodeIcon,
  LockOutlined as LockIcon,
  Output as OutboundRelationIcon,
  QueryStats as TrendIcon,
  RadioButtonUnchecked as TreeNodeIcon,
  Search as SearchIcon,
  Security as ShieldIcon,
  SettingsSuggest as MaintenanceIcon,
  ShowChart as PerformanceIcon,
  Speed as PredictiveIcon,
  TaskAlt as ActionIcon,
  History as HistoryIcon,
  Timeline as TimelineIcon,
  FileDownload as ExportIcon,
  FileUpload as ImportIcon,
  WarningAmber as WarningIcon,
} from '@mui/icons-material';
import {CreateWorkOrderDrawer, type WorkOrderDraft as FollowUpWorkOrderDraft, type WorkOrderTab} from '../Maintenance/pages/MaintenanceFollowUpBoardPage';
import type {AppScreen} from '../navigation/navigationConfig';

type LedgerTab = 'Ledger Timeline' | 'Performance' | 'Future Actions' | 'Structure' | 'Reliability';

type TabConfig = {
  label: LedgerTab;
  icon: typeof TimelineIcon;
};

const filters = ['All', 'PM', 'Predictive', 'WO', 'CIL', 'Centerline', 'Repair', 'Safety', 'Quality', 'Spare Parts', 'Cost'] as const;

const commonOtAssetTypes = ['PLC', 'HMI', 'SCADA Node', 'Industrial PC', 'VFD', 'RTU', 'Historian Gateway', 'Network Switch'];
const commonOtVendors = ['Rockwell', 'Siemens', 'Schneider Electric', 'ABB', 'Mitsubishi', 'Honeywell', 'Emerson', 'GE'];
const commonOtModels = ['ControlLogix', 'CompactLogix', 'S7-1200', 'S7-1500', 'PanelView Plus', 'WinCC Runtime', 'Modicon M580', 'ACS880'];

type LedgerFilter = (typeof filters)[number];

const defaultAssetName = 'Autoguard Shielded IV Catheter';
const defaultAssetImpactLevel = `Asset · ${defaultAssetName}`;

type EventItem = {
  type: string;
  id: string;
  date: string;
  time: string;
  impactLevel: string;
  impactHierarchyIds: string[];
  title: string;
  body: string;
  meta: string;
  keyFacts?: string[];
  note?: string;
  sparePartsUsed?: SparePartUsage[];
  lock: string;
};

type SparePartUsage = {
  name: string;
  code: string;
  qty: number;
  unit: string;
  bin: string;
  status: string;
};

type HierarchyItem = {
  id: string;
  code: string;
  label: string;
  level: number;
  icon?: typeof TimelineIcon;
  expanded?: boolean;
  active?: boolean;
  textTone?: 'healthy' | 'default' | 'muted';
  hasPending?: boolean;
};

type AssetListItem = {
  id: string;
  hierarchyId: string;
  name: string;
  assetType: string;
  sapId: string;
  vendor: string;
  model: string;
  firmware: string;
  os: string;
  ip: string;
  path: string;
  code: string;
  level: number;
  hasWarning: boolean;
};

type AssetEditDraft = {
  name: string;
  sapId: string;
  vendor: string;
  model: string;
  firmware: string;
  os: string;
  ip: string;
};

type AssetFieldSource = {
  source: 'Manual' | 'Nozomi' | 'SAP' | 'BlueMountain';
  updatedAt: string;
};

type AssetModalTab = 'info' | 'events' | 'actions';
type ItemDetailsTab = 'overview' | 'digital-relations';
type RelationshipDirection = 'inbound' | 'outbound' | 'bidirectional';

type AssetHistoryEvent = {
  id: string;
  dateTime: string;
  category: 'network' | 'maintenance' | 'status' | 'movement' | 'operation';
  title: string;
  details: string;
};

type AssetActionItem = {
  id: string;
  kind: 'Approval' | 'WO' | 'Maintenance' | 'Inspection';
  status: 'Open' | 'Pending Approval' | 'Scheduled' | 'In Progress';
  owner: string;
  due: string;
  title: string;
  details: string;
};

type DigitalRelationship = {
  id: string;
  sourceHierarchyId: string;
  targetHierarchyId: string;
  direction: RelationshipDirection;
};

type AddChildOption = {
  key: string;
  label: string;
  level: number;
  codePrefix: string;
  idPrefix: string;
  icon?: typeof TimelineIcon;
};

type PendingMoveConfirmation = {
  draggedId: string;
  destinationZoneId: string;
  fromPath: string;
  toPath: string;
  approverName: string;
};

type PendingMoveApproval = {
  fromPath: string;
  toPath: string;
  approverName: string;
  approved: boolean;
};

type AiRecommendation = {
  id: string;
  title: string;
  body: string;
  impact: string;
  status: 'Pending review' | 'Requires review';
  actions: string[];
  filter: LedgerFilter;
  impactHierarchyIds: string[];
};

type BomRow = {
  label: string;
  code: string;
  qty: string;
  level: number;
};

type CavityStatus = 'OK' | 'Watch' | 'NG' | 'Blocked';

type Cavity = {
  positionNumber: number;
  cavityNumber: number;
  status: CavityStatus;
};

type CavityHistoryEvent = {
  id: string;
  occurrenceId: string;
  dateTime: string;
  status: CavityStatus;
  defectType: string;
  actionTaken: string;
  observation: string;
  updatedBy: string;
  attachments?: string[];
};

type CavityDetailRow = {
  cavityNumber: number;
  positionNumber: number;
  issue: string;
  actionTaken: string;
  status: CavityStatus;
  attachments: string;
  notes: string;
};

type FirstCheckFormData = {
  dateTime: string;
  shift: string;
  inspector: string;
  machineNumber: string;
  moldNumber: string;
  workOrder: string;
  partNumber: string;
  material: string;
  lotBatch: string;
  firstPieceApproved: 'Yes' | 'No';
  overallStatus: CavityStatus;
  affectedCavities: number[];
  defectType: string;
  description: string;
  immediateAction: string;
  rootCause: string;
  disposition: string;
  attachments: string;
  cavityDetails: Record<number, CavityDetailRow>;
};

type MoldLogbookOccurrence = {
  occurrenceId: string;
  equipmentId: string;
  moldId: string;
  machineNumber: string;
  title: string;
  status: CavityStatus;
  affectedCavities: number[];
  updatedBy: string;
  dateTime: string;
  defectType: string;
  actionTaken: string;
  observation: string;
  partNumber: string;
  material: string;
  lotBatch: string;
  disposition: string;
  relatedMr?: string;
  attachedForms: string[];
  attachments: string[];
  formData: FirstCheckFormData;
};

type CavityResult = 'Not checked' | 'Pass' | 'Fail';

type CheckedCavityResult = {
  cavity: string;
  result: Exclude<CavityResult, 'Not checked'>;
};

type MoldingOccurrenceDraft = {
  equipmentId: string;
  moldId: string;
  productPartNumber: string;
  firstPieceInspectionResult: string;
  passFailOutcome: 'Pass' | 'Fail';
  cavityResults: Record<number, CavityResult>;
  responsibleUser: string;
  inspectionDateTime: string;
  commentsOrAttachments: string;
  relatedMr: string;
};

type MoldingLogbookEntry = MoldLogbookOccurrence & {
  productPartNumber: string;
  firstPieceInspectionResult: string;
  passFailOutcome: 'Pass' | 'Fail';
  checkedCavities: CheckedCavityResult[];
  responsibleUser: string;
  inspectionDateTime: string;
  commentsOrAttachments: string;
};

type SelectedMoldCavity = {
  occurrenceId: string;
  cavity: string;
};

type MoldingOccurrenceModalMode = 'create' | 'edit';

type MoldEquipmentHistoryEntry = {
  moldId: string;
  equipmentId: string;
  equipmentLabel: string;
  firstSeen: string;
  lastSeen: string;
  status: string;
  source: string;
};

const initialHierarchyItems: HierarchyItem[] = [
  {id: 'plant-sandy', code: 'PLT-SDY', label: 'Plant A', level: 0, icon: FactoryIcon, expanded: true, textTone: 'default'},
  {id: 'area-a', code: 'AREA-A', label: 'Area A', level: 1, icon: StructureIcon, expanded: true, textTone: 'default'},
  {id: 'unit-a', code: 'UNIT-A', label: 'Unit A', level: 2, icon: StructureIcon, expanded: true, textTone: 'default'},
  {id: 'line-10', code: 'LINE-10', label: 'Line 10', level: 3, icon: ChevronRightIcon, expanded: true, textTone: 'default'},
  {id: 'zone-1', code: 'ZONE-1', label: 'Zone 1', level: 4, icon: ShieldIcon, expanded: true, textTone: 'muted'},
  {id: 'asset-sa-204', code: 'SA-204', label: defaultAssetName, level: 5, icon: AssetIcon, active: true, textTone: 'healthy'},
  {id: 'system-filling', code: 'SYS-FILL', label: 'Filling System', level: 6, icon: MaintenanceIcon, expanded: true, textTone: 'default'},
  {id: 'assembly-filling-head', code: 'ASM-FH', label: 'Filling Head Assembly', level: 7, icon: MaintenanceIcon, expanded: true, textTone: 'default', hasPending: true},
  {id: 'component-servo-motor', code: 'SM-204', label: 'Servo Motor', level: 8, textTone: 'muted', hasPending: true},
  {id: 'component-nozzle-cluster', code: 'NC-12', label: 'Nozzle Cluster', level: 8, textTone: 'healthy'},
  {id: 'component-drive-bearing', code: 'BRG-6204', label: 'Drive Bearing', level: 8, textTone: 'default', hasPending: true},
  {id: 'module-dosing-pump', code: 'DPM-01', label: 'Dosing Pump Module', level: 7, icon: MaintenanceIcon, textTone: 'default'},
  {id: 'system-transport', code: 'SYS-TRN', label: 'Transport System', level: 6, icon: MaintenanceIcon, textTone: 'muted'},
  {id: 'asset-mm-301', code: 'MM-301', label: 'Molding Machine MM-301', level: 5, icon: AssetIcon, textTone: 'default', hasPending: true},
  {id: 'asset-cv-101', code: 'CV-101', label: 'Conveyor CV-101', level: 5, icon: AssetIcon, textTone: 'healthy'},
  {id: 'asset-vi-210', code: 'VI-210', label: 'Vision Inspection VI-210', level: 5, icon: AssetIcon, textTone: 'default'},
  {id: 'asset-lm-88', code: 'LM-88', label: 'Labeling Machine LM-88', level: 5, icon: AssetIcon, textTone: 'muted'},
  {id: 'asset-ct-32', code: 'CT-32', label: 'Cartoner CT-32', level: 5, icon: AssetIcon, textTone: 'default'},
  {id: 'line-12', code: 'LINE-12', label: 'Line 12', level: 3, icon: ChevronRightIcon, expanded: true, textTone: 'default'},
  {id: 'zone-12a', code: 'ZONE-12A', label: 'Zone 12A', level: 4, icon: ShieldIcon, expanded: true, textTone: 'muted'},
  {id: 'asset-wp-120', code: 'WP-120', label: 'Wrapping Unit WP-120', level: 5, icon: AssetIcon, textTone: 'default'},
  {id: 'asset-pl-450', code: 'PL-450', label: 'Palletizer PL-450', level: 5, icon: AssetIcon, textTone: 'healthy'},
  {id: 'line-14', code: 'LINE-14', label: 'Line 14', level: 3, icon: ChevronRightIcon, expanded: true, textTone: 'default'},
  {id: 'zone-14a', code: 'ZONE-14A', label: 'Zone 14A', level: 4, icon: ShieldIcon, expanded: true, textTone: 'muted'},
  {id: 'asset-ls-214', code: 'LS-214', label: 'Laser Sealer LS-214', level: 5, icon: AssetIcon, textTone: 'default', hasPending: true},

  {id: 'plant-riverton', code: 'PLT-RVT', label: 'Plant Riverton', level: 0, icon: FactoryIcon, expanded: true, textTone: 'default'},
  {id: 'area-packaging', code: 'AREA-PKG', label: 'Area Packaging', level: 1, icon: StructureIcon, expanded: true, textTone: 'default'},
  {id: 'unit-sterile-fill', code: 'UNIT-SF', label: 'Unit Sterile Fill', level: 2, icon: StructureIcon, expanded: true, textTone: 'muted'},
  {id: 'line-22', code: 'LINE-22', label: 'Line 22', level: 3, icon: ChevronRightIcon, expanded: true, textTone: 'default'},
  {id: 'zone-r1', code: 'ZONE-R1', label: 'Zone R1', level: 4, icon: ShieldIcon, expanded: true, textTone: 'muted'},
  {id: 'asset-rb-410', code: 'RB-410', label: 'Robot Cell RB-410', level: 5, icon: AssetIcon, textTone: 'healthy'},
  {id: 'system-gripper', code: 'SYS-GRP', label: 'Gripper System', level: 6, icon: MaintenanceIcon, expanded: true, textTone: 'default'},
  {id: 'component-clp1', code: 'CLP1', label: 'CLP1', level: 7, textTone: 'default', hasPending: true},
  {id: 'component-vision-sensor', code: 'VS-07', label: 'Vision Sensor', level: 7, textTone: 'healthy'},
  {id: 'asset-heat-sealer', code: 'HS-220', label: 'Heat Sealer HS-220', level: 5, icon: AssetIcon, textTone: 'muted'},
  {id: 'line-24', code: 'LINE-24', label: 'Line 24', level: 3, icon: ChevronRightIcon, expanded: true, textTone: 'default'},
  {id: 'zone-r2', code: 'ZONE-R2', label: 'Zone R2', level: 4, icon: ShieldIcon, expanded: true, textTone: 'muted'},
  {id: 'asset-cart-810', code: 'CT-810', label: 'Cartoner CT-810', level: 5, icon: AssetIcon, textTone: 'healthy'},
  {id: 'asset-label-702', code: 'LB-702', label: 'Labeler LB-702', level: 5, icon: AssetIcon, textTone: 'default'},

  {id: 'plant-atlas', code: 'PLT-ATL', label: 'Plant Atlas', level: 0, icon: FactoryIcon, expanded: true, textTone: 'default'},
  {id: 'area-mixing', code: 'AREA-MIX', label: 'Area Mixing', level: 1, icon: StructureIcon, expanded: true, textTone: 'default'},
  {id: 'unit-b', code: 'UNIT-B', label: 'Unit Beta', level: 2, icon: StructureIcon, expanded: true, textTone: 'muted'},
  {id: 'line-7', code: 'LINE-07', label: 'Line 7', level: 3, icon: ChevronRightIcon, expanded: true, textTone: 'default'},
  {id: 'zone-blue', code: 'ZONE-BL', label: 'Zone Blue', level: 4, icon: ShieldIcon, expanded: true, textTone: 'muted'},
  {id: 'asset-mx-500', code: 'MX-500', label: 'Mixer MX-500', level: 5, icon: AssetIcon, textTone: 'healthy'},
  {id: 'system-drive', code: 'SYS-DRV', label: 'Drive System', level: 6, icon: MaintenanceIcon, expanded: true, textTone: 'default'},
  {id: 'component-main-motor', code: 'MTR-500', label: 'Main Motor', level: 7, textTone: 'default'},
  {id: 'component-cooling-loop', code: 'CL-08', label: 'Cooling Loop', level: 7, textTone: 'muted', hasPending: true},
  {id: 'asset-filler-900', code: 'FL-900', label: 'Filler FL-900', level: 5, icon: AssetIcon, textTone: 'default'},
  {id: 'line-9', code: 'LINE-09', label: 'Line 9', level: 3, icon: ChevronRightIcon, expanded: true, textTone: 'default'},
  {id: 'zone-green', code: 'ZONE-GR', label: 'Zone Green', level: 4, icon: ShieldIcon, expanded: true, textTone: 'muted'},
  {id: 'asset-blend-33', code: 'BL-33', label: 'Blender BL-33', level: 5, icon: AssetIcon, textTone: 'default'},
  {id: 'asset-pump-208', code: 'PM-208', label: 'Pump PM-208', level: 5, icon: AssetIcon, textTone: 'healthy'},
];

const initialExpandedHierarchyIds = initialHierarchyItems.filter((item) => item.expanded).map((item) => item.id);

const baseHierarchyPath = ['plant-sandy', 'area-a', 'unit-a', 'line-10', 'zone-1', 'asset-sa-204'];

const ledgerTabs: TabConfig[] = [
  {label: 'Ledger Timeline', icon: TimelineIcon},
  {label: 'Performance', icon: PerformanceIcon},
  {label: 'Future Actions', icon: CalendarIcon},
  {label: 'Structure', icon: StructureIcon},
  {label: 'Reliability', icon: ShieldIcon},
];

const initialEvents: EventItem[] = [
  {
    type: 'Predictive Alert',
    id: 'ALERT-2210',
    date: 'May 14, 2026',
    time: '09:42',
    impactLevel: 'Component · Filling Head Assembly / Servo Motor',
    impactHierarchyIds: [...baseHierarchyPath, 'system-filling', 'assembly-filling-head', 'component-servo-motor'],
    title: 'Servo motor vibration trending above baseline (+18%)',
    body: 'ISO 10816 zone shifted from B to C over the last 72h. Recommend bearing inspection within 14 days.',
    meta: 'Edge AI - Vibration Sensor V-04',
    keyFacts: ['Alert: PdM', 'Parameter: Vibration RMS', 'Reading: 4.8 mm/s', 'Threshold: 4.5 mm/s'],
    note: 'Pattern matches 3 prior bearing wear events on similar Filling Head assemblies. Confidence 87%.',
    sparePartsUsed: [
      {name: 'Bearing 6204-ZZ', code: 'BRG-6204-ZZ', qty: 1, unit: 'ea', bin: 'B-12', status: 'Recommended'},
      {name: 'Servo coupling kit', code: 'CPL-SM-204', qty: 1, unit: 'kit', bin: 'F-03', status: 'Recommended'},
    ],
    lock: 'L-1042',
  },
  {
    type: 'Operator Abnormality',
    id: 'MR-4471',
    date: 'May 12, 2026',
    time: '14:08',
    impactLevel: 'Sub-system · Filling Head #2',
    impactHierarchyIds: [...baseHierarchyPath, 'system-filling', 'assembly-filling-head'],
    title: 'Unusual noise detected on Filling Head #2',
    body: 'Reported intermittent metallic noise during high-speed run. No quality impact observed.',
    meta: 'M. Rivera (Operator) - 2 photos',
    keyFacts: ['Who: M. Rivera', 'What: Metallic noise', 'When: High-speed run', 'Why: Abnormal condition report'],
    sparePartsUsed: [
      {name: 'Filling head seal kit', code: 'SEAL-FH-12', qty: 1, unit: 'kit', bin: 'E-08', status: 'Suggested'},
    ],
    lock: 'L-1041',
  },
  {
    type: 'Preventive Work Order',
    id: 'PM-8830',
    date: 'Apr 28, 2026',
    time: '07:20',
    impactLevel: defaultAssetImpactLevel,
    impactHierarchyIds: baseHierarchyPath,
    title: 'Monthly lubrication and torque verification completed',
    body: 'Drive bearing, servo motor coupling, and filling rail fasteners checked within tolerance.',
    meta: 'Maintenance Crew A - 42 min',
    keyFacts: ['Who: Maintenance Crew A', 'Duration: 42 min', 'Why: Monthly PM plan', 'Result: No corrective action'],
    note: 'No corrective work generated. Next PM auto-scheduled for May 24.',
    sparePartsUsed: [
      {name: 'Grease NLGI-2', code: 'LUB-NLGI-2', qty: 1, unit: 'cartridge', bin: 'C-04', status: 'Used'},
      {name: 'Torque seal marker', code: 'MARK-TS-01', qty: 2, unit: 'ea', bin: 'K-02', status: 'Used'},
    ],
    lock: 'L-1037',
  },
  {
    type: 'Corrective Work Order',
    id: 'WO-9821',
    date: 'May 10, 2026',
    time: '08:15',
    impactLevel: 'Component · Drive Bearing 6204-ZZ',
    impactHierarchyIds: [...baseHierarchyPath, 'system-filling', 'assembly-filling-head', 'component-drive-bearing'],
    title: 'Bearing inspection work order created and assigned',
    body: 'Inspection created after abnormal vibration trend on auxiliary drive. Assigned to J. Tanaka for next available maintenance window.',
    meta: 'Planner A - Priority High',
    keyFacts: ['What: Bearing inspection', 'Who: J. Tanaka', 'When: Due May 24', 'Why: Vibration exceeded baseline'],
    sparePartsUsed: [
      {name: 'Bearing 6204-ZZ', code: 'BRG-6204-ZZ', qty: 1, unit: 'ea', bin: 'B-12', status: 'Reserved'},
      {name: 'Retaining ring 20 mm', code: 'RING-020', qty: 2, unit: 'ea', bin: 'B-18', status: 'Reserved'},
    ],
    lock: 'L-1039',
  },
  {
    type: 'Failure Code',
    id: 'FC-204-18',
    date: 'Apr 14, 2026',
    time: '11:26',
    impactLevel: 'Component · Auxiliary Drive Bearing',
    impactHierarchyIds: [...baseHierarchyPath, 'system-filling', 'assembly-filling-head', 'component-drive-bearing'],
    title: 'Failure event recorded for auxiliary drive bearing wear-out',
    body: 'Unplanned stop triggered after bearing temperature spiked and audible roughness was confirmed during inspection.',
    meta: 'Downtime 3.2 h - Line stop approved',
    keyFacts: ['Problem: BRG-WEAR-OUT', 'Cause: Lubrication interval too long', 'Action: Replace bearing and reduce PM interval'],
    sparePartsUsed: [
      {name: 'Bearing 6204-2RS', code: 'BRG-6204-2RS', qty: 1, unit: 'ea', bin: 'B-12', status: 'Failed part'},
    ],
    lock: 'L-1034',
  },
  {
    type: 'Breakdown Work Order',
    id: 'BD-WO-20418',
    date: 'Apr 14, 2026',
    time: '11:44',
    impactLevel: 'Component · Auxiliary Drive Bearing',
    impactHierarchyIds: [...baseHierarchyPath, 'system-filling', 'assembly-filling-head', 'component-drive-bearing'],
    title: 'Breakdown work order opened for bearing wear-out recovery',
    body: 'Emergency maintenance order was opened after the line stop to replace the failed bearing, verify lubrication condition, and return the asset to service.',
    meta: 'Maintenance Planner - Priority Critical',
    keyFacts: ['What: Breakdown recovery', 'Priority: Critical', 'Downtime: 3.2 h', 'Linked failure: FC-204-18'],
    sparePartsUsed: [
      {name: 'Bearing 6204-2RS', code: 'BRG-6204-2RS', qty: 1, unit: 'ea', bin: 'B-12', status: 'Used'},
      {name: 'Grease NLGI-2', code: 'LUB-NLGI-2', qty: 1, unit: 'cartridge', bin: 'C-04', status: 'Used'},
    ],
    lock: 'L-1046',
  },
  {
    type: 'CIL',
    id: 'CIL-6209',
    date: 'May 13, 2026',
    time: '10:00',
    impactLevel: defaultAssetImpactLevel,
    impactHierarchyIds: baseHierarchyPath,
    title: 'CIL inspection completed for Zone 1 filling area',
    body: 'Operator completed clean, inspect, and lubricate tasks for the filling head guard, guide rails, and pneumatic air checks.',
    meta: 'Operator J. Smith - 18 min',
    keyFacts: ['Task: Clean / Inspect / Lubricate', 'Status: Completed', 'Area: Zone 1', 'Finding: No abnormality'],
    sparePartsUsed: [
      {name: 'Wiper cloth pack', code: 'CLEAN-WP-10', qty: 1, unit: 'pack', bin: 'C-11', status: 'Used'},
      {name: 'Food-grade lubricant', code: 'LUB-FG-01', qty: 1, unit: 'tube', bin: 'C-05', status: 'Used'},
    ],
    lock: 'L-1040',
  },
  {
    type: 'Centerline',
    id: 'CL-3184',
    date: 'May 13, 2026',
    time: '10:32',
    impactLevel: 'Sub-system · Filling Head Assembly',
    impactHierarchyIds: [...baseHierarchyPath, 'system-filling', 'assembly-filling-head'],
    title: 'Centerline verification completed after changeover',
    body: 'Critical settings for fill pressure, nozzle height, and servo speed were verified against the line standard.',
    meta: 'Operator A. Chen - Standard CL-Z1',
    keyFacts: ['Pressure: 6.2 bar', 'Nozzle height: 12.0 mm', 'Servo speed: 72 rpm', 'Result: In centerline'],
    sparePartsUsed: [
      {name: 'Nozzle shim set', code: 'SHIM-NC-12', qty: 1, unit: 'set', bin: 'N-06', status: 'Adjusted'},
    ],
    lock: 'L-1044',
  },
  {
    type: 'Safety',
    id: 'SAFE-771',
    date: 'Apr 28, 2026',
    time: '07:05',
    impactLevel: defaultAssetImpactLevel,
    impactHierarchyIds: baseHierarchyPath,
    title: 'LOTO and PTW completed before preventive maintenance',
    body: 'Energy isolation verified and permit-to-work approved before lubrication and torque verification activities began.',
    meta: 'Safety Officer R. Singh - Audit OK',
    keyFacts: ['LOTO: Applied', 'JSA: Reviewed', 'PTW: Approved', 'Area release: 07:58'],
    sparePartsUsed: [
      {name: 'Lockout hasp', code: 'LOTO-HASP-01', qty: 1, unit: 'ea', bin: 'S-02', status: 'Issued'},
      {name: 'Danger tag pack', code: 'TAG-DANGER-10', qty: 1, unit: 'pack', bin: 'S-01', status: 'Issued'},
    ],
    lock: 'L-1036',
  },
  {
    type: 'Quality Hold',
    id: 'QH-118',
    date: 'May 12, 2026',
    time: '14:32',
    impactLevel: 'Sub-system · Filling Head #2',
    impactHierarchyIds: [...baseHierarchyPath, 'system-filling', 'assembly-filling-head'],
    title: 'Temporary quality hold opened after abnormal noise report',
    body: 'Packaging output from cavity 4 was placed on hold pending engineering verification after the operator abnormality was reported.',
    meta: 'Quality Engineer L. Gomez - 12 trays isolated',
    keyFacts: ['Status: Hold', 'Reason: Noise investigation', 'Scope: Cavity 4 output', 'Disposition: Released after verification'],
    sparePartsUsed: [
      {name: 'Sample tray label roll', code: 'LBL-QA-TRAY', qty: 1, unit: 'roll', bin: 'Q-04', status: 'Used'},
    ],
    lock: 'L-1043',
  },
  {
    type: 'Calibration',
    id: 'CAL-553',
    date: 'Mar 18, 2026',
    time: '16:10',
    impactLevel: 'Component · Vision Sensor VS-12',
    impactHierarchyIds: ['plant-sandy', 'area-a', 'unit-a', 'line-10', 'zone-1', 'asset-vi-210'],
    title: 'Vision sensor calibration completed and certificate attached',
    body: 'Sensor alignment and detection tolerance were recalibrated after drift was observed during startup validation.',
    meta: 'Metrology Team - Certificate CAL-553-A',
    keyFacts: ['Instrument: Vision Sensor VS-12', 'As found: 0.9 mm drift', 'As left: 0.1 mm', 'Next due: Sep 18, 2026'],
    sparePartsUsed: [
      {name: 'Calibration target plate', code: 'CAL-PLATE-12', qty: 1, unit: 'ea', bin: 'M-01', status: 'Used'},
      {name: 'Lens cleaning swab', code: 'SWAB-OPT-25', qty: 2, unit: 'ea', bin: 'M-03', status: 'Used'},
    ],
    lock: 'L-1028',
  },
  {
    type: 'Parts Usage',
    id: 'MAT-210',
    date: 'Apr 14, 2026',
    time: '13:02',
    impactLevel: 'Component · Auxiliary Drive Bearing',
    impactHierarchyIds: [...baseHierarchyPath, 'system-filling', 'assembly-filling-head', 'component-drive-bearing'],
    title: 'Spare parts consumed during corrective repair',
    body: 'Maintenance consumed one sealed bearing and grease cartridge to restore the auxiliary drive after wear-out failure.',
    meta: 'Tool Crib issue - Reservation closed',
    keyFacts: ['Part: 6204-2RS x1', 'Part: Grease NLGI-2 x1', 'Reservation: RES-20418', 'Cost center: MNT-ASM-10'],
    sparePartsUsed: [
      {name: 'Bearing 6204-2RS', code: 'BRG-6204-2RS', qty: 1, unit: 'ea', bin: 'B-12', status: 'Used'},
      {name: 'Grease NLGI-2', code: 'LUB-NLGI-2', qty: 1, unit: 'cartridge', bin: 'C-04', status: 'Used'},
    ],
    lock: 'L-1035',
  },
  {
    type: 'Spare Part Reservation',
    id: 'RES-20418',
    date: 'Apr 14, 2026',
    time: '12:18',
    impactLevel: 'Component · Auxiliary Drive Bearing',
    impactHierarchyIds: [...baseHierarchyPath, 'system-filling', 'assembly-filling-head', 'component-drive-bearing'],
    title: 'Bearing and grease reserved for corrective repair',
    body: 'Tool crib reserved one sealed bearing and one grease cartridge against the breakdown recovery work order.',
    meta: 'Tool Crib - Reservation confirmed',
    keyFacts: ['Part: Bearing 6204-2RS x1', 'Part: Grease NLGI-2 x1', 'WO: BD-WO-20418', 'Bin: B-12 / C-04'],
    note: 'Reservation was created before work execution to prevent stock from being allocated to another order.',
    sparePartsUsed: [
      {name: 'Bearing 6204-2RS', code: 'BRG-6204-2RS', qty: 1, unit: 'ea', bin: 'B-12', status: 'Reserved'},
      {name: 'Grease NLGI-2', code: 'LUB-NLGI-2', qty: 1, unit: 'cartridge', bin: 'C-04', status: 'Reserved'},
    ],
    lock: 'L-1033',
  },
  {
    type: 'Spare Part Reorder',
    id: 'PO-7712',
    date: 'Apr 15, 2026',
    time: '09:24',
    impactLevel: 'Component · Auxiliary Drive Bearing',
    impactHierarchyIds: [...baseHierarchyPath, 'system-filling', 'assembly-filling-head', 'component-drive-bearing'],
    title: 'Bearing 6204-ZZ reorder triggered after stock dropped below minimum',
    body: 'Inventory rule generated a purchase request for six bearings after corrective maintenance consumption reduced on-hand stock to two units.',
    meta: 'Inventory Planning - Supplier ETA Apr 22',
    keyFacts: ['Part: Bearing 6204-ZZ', 'On hand: 2', 'Reorder point: 3', 'Requested qty: 6'],
    sparePartsUsed: [
      {name: 'Bearing 6204-ZZ', code: 'BRG-6204-ZZ', qty: 6, unit: 'ea', bin: 'B-12', status: 'Ordered'},
    ],
    lock: 'L-1032',
  },
  {
    type: 'Labor',
    id: 'LAB-902',
    date: 'Apr 14, 2026',
    time: '15:48',
    impactLevel: defaultAssetImpactLevel,
    impactHierarchyIds: baseHierarchyPath,
    title: 'Labor hours posted to corrective maintenance order',
    body: 'Technician and electrician hours were confirmed after repair closeout and attached to the corrective work order.',
    meta: 'Supervisor P. Costa - Approval posted',
    keyFacts: ['Mechanical: 2.5 h', 'Electrical: 0.7 h', 'Who: J. Tanaka / R. Singh', 'Order: WO-9744'],
    sparePartsUsed: [
      {name: 'Cable tie pack', code: 'TIE-100-BLK', qty: 1, unit: 'pack', bin: 'E-02', status: 'Used'},
    ],
    lock: 'L-1038',
  },
];

function getEventFilter(event: EventItem): LedgerFilter {
  if (event.type === 'Preventive Work Order' || event.type === 'Preventive Maintenance') return 'PM';
  if (event.type === 'Predictive Alert') return 'Predictive';
  if (event.type === 'Work Order' || event.type === 'Corrective Work Order' || event.type === 'Breakdown Work Order') return 'WO';
  if (event.type === 'CIL') return 'CIL';
  if (event.type === 'Centerline') return 'Centerline';
  if (event.type === 'Failure Code') return 'Repair';
  if (event.type === 'Safety') return 'Safety';
  if (event.type === 'Quality Hold') return 'Quality';
  if (event.type === 'Parts Usage' || event.type === 'Spare Part Reservation' || event.type === 'Spare Part Reorder') return 'Spare Parts';
  if (event.type === 'Labor') return 'Cost';
  return 'All';
}

function getSparePartsUsedCount(event: EventItem) {
  return event.sparePartsUsed?.reduce((total, part) => total + part.qty, 0) ?? 0;
}

function isWorkOrderEvent(event: EventItem) {
  return ['Work Order', 'Preventive Work Order', 'Corrective Work Order', 'Breakdown Work Order'].includes(event.type);
}

function getLedgerEventLabel(event: EventItem) {
  return event.id.startsWith('MR-') ? 'Maintenance Request' : event.type;
}

const aiRecommendations: AiRecommendation[] = [
  {
    id: 'AI-REC-301',
    title: 'Recurring failure mode detected',
    body: 'Bearing wear-out has occurred 7 times in the last 6 months and represents 62% of this asset\'s failures.',
    impact: 'MTBF decreased from 94 to 61 days.',
    status: 'Requires review',
    actions: ['Review evidence', 'Start RCA'],
    filter: 'Repair',
    impactHierarchyIds: [...baseHierarchyPath, 'system-filling', 'assembly-filling-head', 'component-drive-bearing'],
  },
  {
    id: 'AI-REC-302',
    title: 'PM interval optimization',
    body: 'Failures are recurring before the current 30-day lubrication PM interval is completed.',
    impact: 'Recommend reviewing interval from 30d to 21d for this asset.',
    status: 'Pending review',
    actions: ['Review evidence', 'Review PM strategy'],
    filter: 'PM',
    impactHierarchyIds: [...baseHierarchyPath, 'system-filling', 'assembly-filling-head', 'component-drive-bearing'],
  },
  {
    id: 'AI-REC-303',
    title: 'Missing RCA for repeated issue',
    body: 'Same failure mode has been recorded multiple times without a documented RCA.',
    impact: 'RCA recommended before the next planned intervention.',
    status: 'Requires review',
    actions: ['Review related WOs', 'Start RCA'],
    filter: 'WO',
    impactHierarchyIds: [...baseHierarchyPath, 'system-filling', 'assembly-filling-head', 'component-drive-bearing'],
  },
];

function eventMatchesHierarchy(event: EventItem, hierarchyId: string | null) {
  return !hierarchyId || event.impactHierarchyIds.includes(hierarchyId);
}

function isMoldingAsset(item?: HierarchyItem) {
  if (!item || item.level !== 5) return false;
  const assetText = `${item.code} ${item.label}`.toLowerCase();
  return assetText.includes('molding') || assetText.includes('mold');
}

function getLedgerTimestamp() {
  const now = new Date();

  return {
    date: now.toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'}),
    time: now.toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit', hour12: false}),
  };
}

const performanceCards = [
  {
    label: 'AVAILABILITY',
    value: '94.2%',
    color: '#52B36A',
    filter: 'Repair',
    target: 'Target 96%',
    trend: '+1.8 pp vs prior 30d',
    yLabel: '% available',
    description: 'Percentage of planned time that the equipment was available to run. Planned downtime is excluded.',
    formula: 'Availability = operating time / planned production time.',
  },
  {
    label: 'OEE',
    value: '81.6%',
    color: '#F59E0B',
    filter: 'All',
    target: 'Target 85%',
    trend: '-2.4 pp vs target',
    yLabel: '% OEE',
    description: 'Overall equipment effectiveness combining availability, performance, and quality into one operating health metric.',
    formula: 'OEE = availability x performance x quality.',
  },
  {
    label: 'MTBF',
    value: '412 h',
    color: '#2D3440',
    filter: 'Repair',
    target: 'Goal > 450 h',
    trend: '+36 h vs prior cycle',
    yLabel: 'hours',
    description: 'Average operating time between functional failures. Higher values indicate a more reliable asset.',
    formula: 'MTBF = operating hours / number of failures.',
  },
  {
    label: 'MTTR',
    value: '2.4 h',
    color: '#2D3440',
    filter: 'Repair',
    target: 'Goal < 2 h',
    trend: '+0.4 h above goal',
    yLabel: 'hours',
    description: 'Average time required to restore the equipment after a failure. Lower values mean faster recovery.',
    formula: 'MTTR = repair time / number of repairs.',
  },
  {
    label: 'MAINT. COST',
    value: '$2.9k',
    color: '#0F766E',
    filter: 'Cost',
    target: 'Budget $2.4k',
    trend: '+12% vs prior 30d',
    yLabel: '$ cost',
    description: 'Total maintenance cost posted to the asset, combining spare parts consumed and labor charged by skill rate.',
    formula: 'Cost = parts consumed + labor hours x skill rate.',
  },
];

const costPartRows = [
  {part: 'Bearing 6204-2RS', qty: '1 used', unitCost: '$420', total: '$420'},
  {part: 'Grease NLGI-2', qty: '1 used', unitCost: '$38', total: '$38'},
  {part: 'Filling head seal kit', qty: '2 used', unitCost: '$91', total: '$182'},
];

const laborCostRows = [
  {role: 'Mechanical technician', skill: 'Skill L3', hours: '2.5 h', rate: '$145/h', total: '$363', dot: '#52B36A'},
  {role: 'Senior electrician', skill: 'Skill L5', hours: '0.7 h', rate: '$285/h', total: '$200', dot: '#F59E0B'},
  {role: 'Reliability engineer', skill: 'Skill L6', hours: '2.4 h', rate: '$410/h', total: '$984', dot: '#EF4444'},
  {role: 'Controls specialist', skill: 'Skill L6', hours: '1.6 h', rate: '$440/h', total: '$704', dot: '#EF4444'},
];

const futureOpenWorkOrders = [
  {id: 'WO-9821', title: 'Bearing inspection', meta: 'Due May 24 · J. Tanaka', priority: 'High'},
  {id: 'WO-9833', title: 'Lubrication routine', meta: 'Due May 20 · P. Costa', priority: 'Medium'},
  {id: 'WO-9855', title: 'Vision sensor calibration', meta: 'Due May 28 · Unassigned', priority: 'Low'},
];

const maintenanceRequests = [
  {id: 'MR-4471', title: 'Noise investigation — Filling Head #2', meta: 'Due May 18 · —', priority: 'Operator'},
  {id: 'MR-4488', title: 'Air leak check pneumatic line', meta: 'Due May 22 · —', priority: 'Operator'},
];

const upcomingPms = [
  {date: 'May 24', title: 'Monthly Mechanical PM', owner: 'J. Tanaka'},
  {date: 'Jun 12', title: 'Quarterly Electrical Inspection', owner: 'R. Singh'},
  {date: 'Jul 15', title: 'Filling Head Calibration', owner: 'P. Costa'},
];

const initialBomRows: BomRow[] = [
  {label: 'Filling System', code: 'BOM-001', qty: 'Qty 1', level: 0},
  {label: 'Filling Head Assembly', code: 'BOM-002', qty: 'Qty 4', level: 1},
  {label: 'Servo Motor SM-204', code: 'BOM-003', qty: 'Qty 4', level: 2},
  {label: 'Bearing 6204-ZZ', code: 'BOM-004', qty: 'Qty 8', level: 2},
  {label: 'Nozzle Cluster NC-12', code: 'BOM-005', qty: 'Qty 4', level: 2},
  {label: 'Transport System', code: 'BOM-006', qty: 'Qty 1', level: 0},
  {label: 'Drive Belt DB-88', code: 'BOM-007', qty: 'Qty 2', level: 1},
];

const spareParts = [
  {name: 'Bearing 6204-ZZ', bin: 'Bin B-12', stock: '2 in stock', warn: true},
  {name: 'Grease NLGI-2', bin: 'Bin C-04', stock: '8 in stock'},
  {name: 'Filter F-302', bin: 'Bin A-21', stock: '5 in stock'},
  {name: 'Drive Belt DB-88', bin: 'Bin D-07', stock: '1 in stock', warn: true},
];

const techDocs = [
  {title: 'O&M Manual v3.2', type: 'PDF'},
  {title: 'Electrical Schematics', type: 'DWG'},
  {title: 'P&ID Diagram', type: 'PDF'},
  {title: 'Lubrication Chart', type: 'PDF'},
  {title: 'Calibration Certificate', type: 'PDF'},
];

const assetLayers = [
  {label: 'Safety enclosure', value: 'Active', color: '#2563EB'},
  {label: 'Servo drive cluster', value: 'Nominal', color: '#52B36A'},
  {label: 'Bearing node', value: 'Inspect', color: '#F59E0B'},
];

const assetHotspots = [
  {label: 'H1', title: 'Servo Motor SM-204', meta: 'Vibration +18%', x: '22%', y: '56%', tone: '#F59E0B'},
  {label: 'H2', title: 'Nozzle Cluster NC-12', meta: 'Aligned', x: '63%', y: '42%', tone: '#52B36A'},
  {label: 'H3', title: 'Drive Bearing 6204-ZZ', meta: 'Low stock', x: '74%', y: '68%', tone: '#FF5B4D'},
];

const failureHistory = [
  {date: 'Apr 14', code: 'BRG-WEAR-OUT', title: 'Bearing failure on auxiliary drive', hours: '3.2h'},
  {date: 'Mar 02', code: 'ALIGN-MISFILL', title: 'Filling head misalignment cavity 4', hours: '1.4h'},
  {date: 'Jan 28', code: 'BRG-WEAR-OUT', title: 'Bearing failure on auxiliary drive', hours: '2.8h'},
  {date: 'Dec 11', code: 'LUBR-LOW', title: 'Lubrication starvation warning', hours: '0.5h'},
  {date: 'Nov 04', code: 'ALIGN-MISFILL', title: 'Filling head misalignment', hours: '1.2h'},
];

const moldingCavityOptions = Array.from({length: 12}, (_, index) => index + 1);
const moldLogbookCavityStations = Array.from({length: 16}, (_, index) => index + 1);
const moldLogbookCavityPositions = Array.from({length: 6}, (_, index) => index + 1);
const moldLogbookTotalCavities = moldLogbookCavityStations.length * moldLogbookCavityPositions.length;
const moldLogbookCavities: Cavity[] = Array.from({length: moldLogbookTotalCavities}, (_, index) => ({
  positionNumber: index + 1,
  cavityNumber: index + 1,
  status: 'OK',
}));

const cavityStatusColors: Record<CavityStatus, {bg: string; border: string; text: string; solid: string}> = {
  OK: {bg: '#ECFDF3', border: '#BBF7D0', text: '#15803D', solid: '#16A34A'},
  NG: {bg: '#FFF2F1', border: '#FFCAC4', text: '#B42318', solid: '#DC2626'},
  Blocked: {bg: '#F1F5F9', border: '#CBD5E1', text: '#475569', solid: '#64748B'},
  Watch: {bg: '#FFFBEB', border: '#FDE68A', text: '#B45309', solid: '#F59E0B'},
};

const defectTypeOptions = ['Flash', 'Short shot', 'Burn mark', 'Sink mark', 'Warpage', 'Contamination', 'Dimensional issue', 'Other'];
const dispositionOptions = ['Continue production', 'Hold parts', 'Stop machine', 'Maintenance required', 'Quality review required'];

function createCavityDetails(cavities: number[], seed: Partial<CavityDetailRow> = {}): Record<number, CavityDetailRow> {
  return Object.fromEntries(
    cavities.map((cavityNumber) => [
      cavityNumber,
      {
        cavityNumber,
        positionNumber: cavityNumber,
        issue: seed.issue ?? '',
        actionTaken: seed.actionTaken ?? '',
        status: seed.status ?? 'Watch',
        attachments: seed.attachments ?? '',
        notes: seed.notes ?? '',
      },
    ])
  );
}

function createFirstCheckFormData(overrides: Partial<FirstCheckFormData> = {}): FirstCheckFormData {
  const affectedCavities = overrides.affectedCavities ?? [];

  return {
    dateTime: overrides.dateTime ?? getDefaultInspectionDateTime(),
    shift: overrides.shift ?? 'A Shift',
    inspector: overrides.inspector ?? '',
    machineNumber: overrides.machineNumber ?? 'MM-301',
    moldNumber: overrides.moldNumber ?? '',
    workOrder: overrides.workOrder ?? '',
    partNumber: overrides.partNumber ?? '',
    material: overrides.material ?? '',
    lotBatch: overrides.lotBatch ?? '',
    firstPieceApproved: overrides.firstPieceApproved ?? 'Yes',
    overallStatus: overrides.overallStatus ?? 'OK',
    affectedCavities,
    defectType: overrides.defectType ?? 'Flash',
    description: overrides.description ?? '',
    immediateAction: overrides.immediateAction ?? '',
    rootCause: overrides.rootCause ?? '',
    disposition: overrides.disposition ?? 'Continue production',
    attachments: overrides.attachments ?? '',
    cavityDetails: overrides.cavityDetails ?? createCavityDetails(affectedCavities),
  };
}

const initialMoldingLogbookEntries: MoldingLogbookEntry[] = [
  {
    occurrenceId: 'MO-2026-0142',
    equipmentId: 'MM-301',
    moldId: 'MOLD-FH-12',
    machineNumber: 'MM-301',
    productPartNumber: 'PN-SYR-10ML',
    firstPieceInspectionResult: 'Dimensional checks passed on most cavities; cavities 14, 51, and 67 flagged for visual review.',
    passFailOutcome: 'Fail',
    checkedCavities: [
      {cavity: 'C1', result: 'Pass'},
      {cavity: 'C2', result: 'Pass'},
      {cavity: 'C4', result: 'Pass'},
      {cavity: 'C8', result: 'Pass'},
      {cavity: 'C14', result: 'Fail'},
      {cavity: 'C22', result: 'Pass'},
      {cavity: 'C31', result: 'Pass'},
      {cavity: 'C37', result: 'Pass'},
      {cavity: 'C45', result: 'Pass'},
      {cavity: 'C51', result: 'Fail'},
      {cavity: 'C61', result: 'Pass'},
      {cavity: 'C67', result: 'Fail'},
      {cavity: 'C72', result: 'Pass'},
      {cavity: 'C86', result: 'Pass'},
    ],
    responsibleUser: 'L. Almeida',
    inspectionDateTime: 'May 14, 2026, 10:30 AM',
    commentsOrAttachments: 'first-piece-photo.jpg, new-cavity-check.pdf',
    title: 'Dimensional checks passed on most cavities; cavities 14, 51, and 67 flagged for visual review.',
    status: 'Watch',
    affectedCavities: [14, 51, 67],
    updatedBy: 'L. Almeida',
    dateTime: 'May 14, 2026, 10:30 AM',
    defectType: 'Dimensional issue',
    actionTaken: 'Held samples from affected cavities and requested quality review.',
    observation: 'Visual review required before next lot release.',
    partNumber: 'PN-SYR-10ML',
    material: 'PP medical grade',
    lotBatch: 'LOT-26-0514',
    disposition: 'Quality review required',
    relatedMr: 'MR-4471',
    attachedForms: ['First Piece', 'New Cavity Check'],
    attachments: ['first-piece-photo.jpg', 'new-cavity-check.pdf'],
    formData: createFirstCheckFormData({
      dateTime: '2026-05-14T10:30',
      shift: 'A Shift',
      inspector: 'L. Almeida',
      machineNumber: 'MM-301',
      moldNumber: 'MOLD-FH-12',
      workOrder: 'WO-2026-3814',
      partNumber: 'PN-SYR-10ML',
      material: 'PP medical grade',
      lotBatch: 'LOT-26-0514',
      firstPieceApproved: 'No',
      overallStatus: 'Watch',
      affectedCavities: [14, 51, 67],
      defectType: 'Dimensional issue',
      description: 'Dimensional checks passed on most cavities; cavities 14, 51, and 67 flagged for visual review.',
      immediateAction: 'Held samples from affected cavities and requested quality review.',
      rootCause: 'Tool temperature stabilization under review.',
      disposition: 'Quality review required',
      attachments: 'first-piece-photo.jpg, new-cavity-check.pdf',
      cavityDetails: createCavityDetails([14, 51, 67], {
        issue: 'Dimensional variation',
        actionTaken: 'Samples segregated',
        status: 'Watch',
        attachments: 'dimensional-report.pdf',
        notes: 'Awaiting QE sign-off.',
      }),
    }),
  },
  {
    occurrenceId: 'MO-2026-0138',
    equipmentId: 'MM-301',
    moldId: 'MOLD-FH-10',
    machineNumber: 'MM-301',
    productPartNumber: 'PN-SYR-5ML',
    firstPieceInspectionResult: 'Cavity 4 flash observed during first piece check.',
    passFailOutcome: 'Fail',
    checkedCavities: [
      {cavity: 'C1', result: 'Pass'},
      {cavity: 'C4', result: 'Fail'},
      {cavity: 'C6', result: 'Pass'},
      {cavity: 'C12', result: 'Pass'},
      {cavity: 'C19', result: 'Fail'},
      {cavity: 'C33', result: 'Pass'},
      {cavity: 'C48', result: 'Fail'},
      {cavity: 'C58', result: 'Pass'},
      {cavity: 'C75', result: 'Fail'},
      {cavity: 'C94', result: 'Pass'},
    ],
    responsibleUser: 'M. Rivera',
    inspectionDateTime: 'Mar 02, 2026, 07:48 AM',
    commentsOrAttachments: 'flash-photo-c4.png, inspection-form.pdf',
    title: 'Cavity 4 flash observed during first piece check.',
    status: 'NG',
    affectedCavities: [4, 19, 48, 75],
    updatedBy: 'M. Rivera',
    dateTime: 'Mar 02, 2026, 07:48 AM',
    defectType: 'Flash',
    actionTaken: 'Stopped machine for tool inspection and held parts.',
    observation: 'Flash visible near gate area after first piece check.',
    partNumber: 'PN-SYR-5ML',
    material: 'PP medical grade',
    lotBatch: 'LOT-26-0302',
    disposition: 'Stop machine',
    relatedMr: 'MR-4420',
    attachedForms: ['First Piece', 'New Cavity Check'],
    attachments: ['flash-photo-c4.png', 'inspection-form.pdf'],
    formData: createFirstCheckFormData({
      dateTime: '2026-03-02T07:48',
      shift: 'A Shift',
      inspector: 'M. Rivera',
      machineNumber: 'MM-301',
      moldNumber: 'MOLD-FH-10',
      workOrder: 'WO-2026-2190',
      partNumber: 'PN-SYR-5ML',
      material: 'PP medical grade',
      lotBatch: 'LOT-26-0302',
      firstPieceApproved: 'No',
      overallStatus: 'NG',
      affectedCavities: [4, 19, 48, 75],
      defectType: 'Flash',
      description: 'Cavity 4 flash observed during first piece check.',
      immediateAction: 'Stopped machine for tool inspection and held parts.',
      rootCause: 'Parting line wear suspected.',
      disposition: 'Stop machine',
      attachments: 'flash-photo-c4.png, inspection-form.pdf',
      cavityDetails: createCavityDetails([4, 19, 48, 75], {
        issue: 'Flash',
        actionTaken: 'Held output and requested maintenance',
        status: 'NG',
        attachments: 'flash-photo-c4.png',
        notes: 'Escalated through MR-4420.',
      }),
    }),
  },
];

const initialMoldEquipmentHistory: MoldEquipmentHistoryEntry[] = [
  {
    moldId: 'MOLD-FH-12',
    equipmentId: 'MM-301',
    equipmentLabel: 'Molding Machine MM-301',
    firstSeen: 'May 14, 2026',
    lastSeen: 'Current',
    status: 'Active production setup',
    source: 'MO-2026-0142',
  },
  {
    moldId: 'MOLD-FH-12',
    equipmentId: 'MM-118',
    equipmentLabel: 'Molding Machine MM-118',
    firstSeen: 'Feb 04, 2026',
    lastSeen: 'Apr 30, 2026',
    status: 'Transferred after cavity refurbishment',
    source: 'TRF-2026-022',
  },
  {
    moldId: 'MOLD-FH-12',
    equipmentId: 'MM-205',
    equipmentLabel: 'Molding Machine MM-205',
    firstSeen: 'Nov 18, 2025',
    lastSeen: 'Jan 26, 2026',
    status: 'Pilot run completed',
    source: 'TRF-2025-091',
  },
  {
    moldId: 'MOLD-FH-10',
    equipmentId: 'MM-301',
    equipmentLabel: 'Molding Machine MM-301',
    firstSeen: 'Mar 02, 2026',
    lastSeen: 'Mar 12, 2026',
    status: 'Held after cavity 4 flash',
    source: 'MO-2026-0138',
  },
  {
    moldId: 'MOLD-FH-10',
    equipmentId: 'MM-144',
    equipmentLabel: 'Molding Machine MM-144',
    firstSeen: 'Dec 09, 2025',
    lastSeen: 'Feb 22, 2026',
    status: 'Routine production run',
    source: 'TRF-2025-104',
  },
];

const pageText = '#2D3440';
const mutedText = '#5D6675';
const blue = '#2563EB';
const sparkValues = [22, 54, 68, 42, 78, 61, 84, 69, 55, 81, 88, 64, 79, 58, 72, 83, 66, 74, 59, 73, 85, 70, 56, 68, 77, 61, 72];

function getDefaultInspectionDateTime() {
  const now = new Date();
  const localNow = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return localNow.toISOString().slice(0, 16);
}

function formatInspectionDateTime(value: string) {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function createMoldingOccurrenceDraft(equipmentId = 'MM-301'): MoldingOccurrenceDraft {
  return {
    equipmentId,
    moldId: '',
    productPartNumber: '',
    firstPieceInspectionResult: '',
    passFailOutcome: 'Pass',
    cavityResults: Object.fromEntries(Array.from({length: 12}, (_, index) => [index + 1, 'Not checked' as CavityResult])) as Record<number, CavityResult>,
    responsibleUser: '',
    inspectionDateTime: getDefaultInspectionDateTime(),
    commentsOrAttachments: '',
    relatedMr: '',
  };
}

function getCheckedCavityResults(cavityResults: Record<number, CavityResult>): CheckedCavityResult[] {
  return Object.entries(cavityResults)
    .filter(([, result]) => result !== 'Not checked')
    .map(([cavity, result]) => ({cavity: `C${cavity}`, result: result as Exclude<CavityResult, 'Not checked'>}));
}

function getCavityNumber(cavity: string) {
  const cavityNumber = Number(cavity.replace(/[^0-9]/g, ''));
  return Number.isFinite(cavityNumber) ? cavityNumber : null;
}

function getDefaultSelectedCavity(entry: MoldingLogbookEntry) {
  return entry.checkedCavities.find((cavity) => cavity.result === 'Fail')?.cavity ?? entry.checkedCavities[0]?.cavity ?? 'C1';
}

function normalizeMoldId(value: string) {
  return value.trim().toUpperCase();
}

function getEquipmentLabel(equipmentId: string) {
  return initialHierarchyItems.find((item) => item.code === equipmentId)?.label ?? `Equipment ${equipmentId}`;
}

function getMoldEquipmentHistory(moldId: string, logbookEntries: MoldLogbookOccurrence[]) {
  const normalizedMoldId = normalizeMoldId(moldId);

  if (!normalizedMoldId) return [];

  const historyByEquipment = new Map<string, MoldEquipmentHistoryEntry>();

  initialMoldEquipmentHistory
    .filter((entry) => normalizeMoldId(entry.moldId) === normalizedMoldId)
    .forEach((entry) => {
      historyByEquipment.set(entry.equipmentId, entry);
    });

  logbookEntries
    .filter((entry) => normalizeMoldId(entry.moldId) === normalizedMoldId)
    .forEach((entry) => {
      if (historyByEquipment.has(entry.equipmentId)) return;

      historyByEquipment.set(entry.equipmentId, {
        moldId: entry.moldId,
        equipmentId: entry.equipmentId,
        equipmentLabel: getEquipmentLabel(entry.equipmentId),
        firstSeen: entry.dateTime,
        lastSeen: entry.dateTime,
        status: `${entry.status} first piece inspection`,
        source: entry.occurrenceId,
      });
    });

  return Array.from(historyByEquipment.values());
}

function getMoldCavityHistory(selectedEntry: MoldingLogbookEntry, selectedCavity: string, logbookEntries: MoldingLogbookEntry[]) {
  const normalizedMoldId = normalizeMoldId(selectedEntry.moldId);

  return logbookEntries
    .map((entry) => {
      const cavityResult = entry.checkedCavities.find((cavity) => cavity.cavity === selectedCavity);
      return cavityResult ? {entry, result: cavityResult.result} : null;
    })
    .filter((item): item is {entry: MoldingLogbookEntry; result: Exclude<CavityResult, 'Not checked'>} => Boolean(item))
    .filter(({entry}) => normalizeMoldId(entry.moldId) === normalizedMoldId);
}

function StatusDot({color}: {color: string}) {
  return <Box component="span" sx={{width: 8, height: 8, borderRadius: '50%', bgcolor: color, display: 'inline-block'}} />;
}

function getVisibleHierarchyItems(items: HierarchyItem[], expandedIds: string[]) {
  const expandedSet = new Set(expandedIds);
  const ancestorStack: HierarchyItem[] = [];

  return items.filter((item) => {
    while (ancestorStack.length && ancestorStack[ancestorStack.length - 1].level >= item.level) {
      ancestorStack.pop();
    }

    const isHidden = ancestorStack.some((ancestor) => !expandedSet.has(ancestor.id));
    ancestorStack.push(item);
    return !isHidden;
  });
}

function getSearchFilteredHierarchyItems(items: HierarchyItem[], searchTerm: string) {
  const normalizedSearch = searchTerm.trim().toLowerCase();
  if (!normalizedSearch) return items;

  const parentById = new Map<string, string | null>();
  const stack: {id: string; level: number}[] = [];

  items.forEach((item) => {
    while (stack.length && stack[stack.length - 1].level >= item.level) {
      stack.pop();
    }

    parentById.set(item.id, stack.length ? stack[stack.length - 1].id : null);
    stack.push({id: item.id, level: item.level});
  });

  const visibleIds = new Set<string>();

  items.forEach((item) => {
    const matches = [item.label, item.code, item.id].some((value) => value.toLowerCase().includes(normalizedSearch));
    if (!matches) return;

    let currentId: string | null = item.id;
    while (currentId) {
      visibleIds.add(currentId);
      currentId = parentById.get(currentId) ?? null;
    }
  });

  return items.filter((item) => visibleIds.has(item.id));
}

function getHierarchyDescendantIds(items: HierarchyItem[], parentId: string) {
  const parentIndex = items.findIndex((item) => item.id === parentId);
  if (parentIndex < 0) return new Set<string>();

  const parentLevel = items[parentIndex].level;
  const descendants = new Set<string>();

  for (let index = parentIndex + 1; index < items.length; index += 1) {
    const current = items[index];
    if (current.level <= parentLevel) break;
    descendants.add(current.id);
  }

  return descendants;
}

function getAssetTypeByLevel(level: number) {
  if (level <= 2) return 'Hierarchy Node';
  if (level === 3) return 'Line';
  if (level === 4) return 'Zone';
  if (level === 5) return 'Asset';
  if (level === 6) return 'System';
  if (level === 7) return 'Assembly';
  return 'Component';
}

function getAssetTypeIcon(level: number) {
  if (level === 3) return <LineNodeIcon sx={{fontSize: 16, color: '#475569'}} />;
  if (level === 4) return <ShieldIcon sx={{fontSize: 16, color: '#475569'}} />;
  if (level === 5) return <AssetIcon sx={{fontSize: 16, color: '#2563EB'}} />;
  if (level === 6) return <MaintenanceIcon sx={{fontSize: 16, color: '#0F766E'}} />;
  if (level === 7) return <StructureIcon sx={{fontSize: 16, color: '#7C3AED'}} />;
  return <TreeNodeIcon sx={{fontSize: 16, color: '#64748B'}} />;
}

function getRelationshipIcon(direction: RelationshipDirection) {
  if (direction === 'inbound') return <InboundRelationIcon sx={{fontSize: 15, color: '#0F766E'}} />;
  if (direction === 'outbound') return <OutboundRelationIcon sx={{fontSize: 15, color: '#1D4ED8'}} />;
  return <BiDirectionalIcon sx={{fontSize: 15, color: '#7C3AED'}} />;
}

function isOtPhysicalAssetId(itemId: string) {
  return itemId.startsWith('asset-');
}

function escapeCsvCell(value: string) {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}

function getSeedFromText(value: string) {
  return value.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
}

function getAddChildOptions(parent: HierarchyItem): AddChildOption[] {
  if (parent.level === 0) return [{key: 'area', label: 'Area', level: 1, codePrefix: 'AREA', idPrefix: 'area', icon: StructureIcon}];
  if (parent.level === 1) return [{key: 'unit', label: 'Unit', level: 2, codePrefix: 'UNIT', idPrefix: 'unit', icon: StructureIcon}];
  if (parent.level === 2) return [{key: 'line', label: 'Line', level: 3, codePrefix: 'LINE', idPrefix: 'line', icon: LineNodeIcon}];
  if (parent.level === 3) {
    return [
      {key: 'zone', label: 'Zone', level: 4, codePrefix: 'ZONE', idPrefix: 'zone', icon: ShieldIcon},
      {key: 'machine', label: 'Machine', level: 5, codePrefix: 'MC', idPrefix: 'asset', icon: AssetIcon},
    ];
  }
  if (parent.level === 4) return [{key: 'machine', label: 'Machine', level: 5, codePrefix: 'MC', idPrefix: 'asset', icon: AssetIcon}];
  if (parent.level === 5) return [{key: 'component', label: 'Component', level: 6, codePrefix: 'CMP', idPrefix: 'component', icon: MaintenanceIcon}];

  return [];
}

function getHierarchyParentMap(items: HierarchyItem[]) {
  const parentById = new Map<string, string | null>();
  const stack: HierarchyItem[] = [];

  items.forEach((item) => {
    while (stack.length && stack[stack.length - 1].level >= item.level) {
      stack.pop();
    }

    parentById.set(item.id, stack.length ? stack[stack.length - 1].id : null);
    stack.push(item);
  });

  return parentById;
}

function getSubtreeEndIndex(items: HierarchyItem[], startIndex: number) {
  const startLevel = items[startIndex]?.level ?? 0;
  let endIndex = startIndex + 1;

  while (endIndex < items.length && items[endIndex].level > startLevel) {
    endIndex += 1;
  }

  return endIndex;
}

function getAncestorByLevel(items: HierarchyItem[], nodeId: string, level: number) {
  const parentById = getHierarchyParentMap(items);
  const byId = new Map(items.map((item) => [item.id, item]));
  let currentId: string | null = nodeId;

  while (currentId) {
    const currentItem = byId.get(currentId);
    if (!currentItem) return null;
    if (currentItem.level === level) return currentItem;

    currentId = parentById.get(currentId) ?? null;
  }

  return null;
}

function getFirstDirectChildByLevel(items: HierarchyItem[], parentId: string, childLevel: number) {
  const parentIndex = items.findIndex((item) => item.id === parentId);
  if (parentIndex < 0) return null;

  const parentLevel = items[parentIndex].level;
  for (let index = parentIndex + 1; index < items.length; index += 1) {
    const candidate = items[index];
    if (candidate.level <= parentLevel) break;
    if (candidate.level === childLevel) return candidate;
  }

  return null;
}

function resolveEquipmentDropParent(items: HierarchyItem[], targetId: string) {
  const target = items.find((item) => item.id === targetId);
  if (!target) return null;

  return target;
}

function canDropEquipmentMove(items: HierarchyItem[], draggedId: string, targetId: string) {
  if (!draggedId || !targetId || draggedId === targetId) return false;
  if (!isOtPhysicalAssetId(draggedId)) return false;

  const indexById = new Map(items.map((item, index) => [item.id, index]));
  const draggedIndex = indexById.get(draggedId);
  if (draggedIndex === undefined) return false;

  const dragged = items[draggedIndex];

  const destinationParent = resolveEquipmentDropParent(items, targetId);
  if (!destinationParent) return false;

  const draggedEnd = getSubtreeEndIndex(items, draggedIndex);
  const draggedSubtreeIds = new Set(items.slice(draggedIndex, draggedEnd).map((item) => item.id));
  if (draggedSubtreeIds.has(destinationParent.id)) return false;

  return true;
}

function moveSubtreeToParent(items: HierarchyItem[], draggedId: string, newParentId: string) {
  const indexById = new Map(items.map((item, index) => [item.id, index]));
  const draggedIndex = indexById.get(draggedId);

  if (draggedIndex === undefined) return items;

  const draggedEnd = getSubtreeEndIndex(items, draggedIndex);
  const draggedSubtree = items.slice(draggedIndex, draggedEnd);
  const withoutSubtree = [...items.slice(0, draggedIndex), ...items.slice(draggedEnd)];

  const parentIndex = withoutSubtree.findIndex((item) => item.id === newParentId);
  if (parentIndex < 0) return items;

  const parentLevel = withoutSubtree[parentIndex].level;
  const draggedRootLevel = draggedSubtree[0]?.level ?? parentLevel + 1;
  const levelDelta = parentLevel + 1 - draggedRootLevel;
  const normalizedSubtree = draggedSubtree.map((item) => ({
    ...item,
    level: Math.max(1, Math.min(8, item.level + levelDelta)),
  }));

  const insertAt = getSubtreeEndIndex(withoutSubtree, parentIndex);
  return [...withoutSubtree.slice(0, insertAt), ...normalizedSubtree, ...withoutSubtree.slice(insertAt)];
}

function MiniSparkline({
  values,
  color = blue,
  fill = '#DCE8FF',
  height = 72,
  xStart = '30d',
  xEnd = 'Today',
  yLabel = 'Value',
}: {
  values: number[];
  color?: string;
  fill?: string;
  height?: number;
  xStart?: string;
  xEnd?: string;
  yLabel?: string;
}) {
  const gradientId = `sparkFill${useId().replace(/:/g, '')}`;
  const compact = height < 100;
  const width = compact ? 360 : 720;
  const viewHeight = compact ? 96 : height;
  const margin = compact ? {top: 18, right: 18, bottom: 22, left: 38} : {top: 24, right: 24, bottom: 26, left: 46};
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = viewHeight - margin.top - margin.bottom;
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  const padding = Math.max((rawMax - rawMin) * (compact ? 0.18 : 0.14), 1);
  const min = Math.max(0, Math.floor(rawMin - padding));
  const max = Math.ceil(rawMax + padding);
  const range = max - min || 1;
  const axisY = margin.top + plotHeight;
  const points = values.map((value, index) => {
    const x = margin.left + (index / Math.max(values.length - 1, 1)) * plotWidth;
    const y = margin.top + ((max - value) / range) * plotHeight;
    return {x, y, value};
  });
  const linePath = points.reduce((path, point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`;
    const previous = points[index - 1];
    const controlX = previous.x + (point.x - previous.x) * 0.5;
    return `${path} C ${controlX} ${previous.y}, ${controlX} ${point.y}, ${point.x} ${point.y}`;
  }, '');
  const areaPath = points.length ? `${linePath} L ${margin.left + plotWidth} ${axisY} L ${margin.left} ${axisY} Z` : '';
  const midValue = Math.round((min + max) / 2);

  const minPoint = points.reduce((lowest, point) => (point.value < lowest.value ? point : lowest), points[0]);
  const maxPoint = points.reduce((highest, point) => (point.value > highest.value ? point : highest), points[0]);
  const lastPoint = points[points.length - 1];

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${viewHeight}`} preserveAspectRatio="xMidYMid meet" display="block" overflow="visible">
      <defs>
        <linearGradient id={gradientId} x1="0%" x2="0%" y1="0%" y2="100%">
          <stop offset="0%" stopColor={fill} stopOpacity="0.68" />
          <stop offset="62%" stopColor={fill} stopOpacity="0.22" />
          <stop offset="100%" stopColor={fill} stopOpacity="0.03" />
        </linearGradient>
        <linearGradient id={`${gradientId}Backdrop`} x1="0%" x2="0%" y1="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.92" />
          <stop offset="100%" stopColor="#F6F9FE" stopOpacity="0.7" />
        </linearGradient>
        <filter id={`${gradientId}Shadow`} x="-8%" y="-28%" width="116%" height="156%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor={color} floodOpacity="0.18" />
        </filter>
      </defs>
      <rect x={margin.left} y={margin.top} width={plotWidth} height={plotHeight} rx={compact ? 14 : 16} fill={`url(#${gradientId}Backdrop)`} stroke="#E4EBF5" strokeWidth={1} vectorEffect="non-scaling-stroke" />
      {[0, 0.5, 1].map((ratio) => {
        const y = margin.top + ratio * plotHeight;
        return <line key={ratio} x1={margin.left + 8} x2={margin.left + plotWidth - 8} y1={y} y2={y} stroke="#E3EAF4" strokeWidth={1} strokeDasharray={ratio === 1 ? '0' : '6 9'} vectorEffect="non-scaling-stroke" />;
      })}
      <line x1={margin.left} x2={margin.left} y1={margin.top} y2={axisY} stroke="#CBD5E1" strokeWidth={1} vectorEffect="non-scaling-stroke" />
      <line x1={margin.left} x2={margin.left + plotWidth} y1={axisY} y2={axisY} stroke="#CBD5E1" strokeWidth={1} vectorEffect="non-scaling-stroke" />
      <text x={margin.left - (compact ? 6 : 10)} y={margin.top + 4} textAnchor="end" fill="#6B7280" fontSize={compact ? '8' : '10'} fontWeight="700">
        {max}
      </text>
      {!compact ? (
        <text x={margin.left - 10} y={margin.top + plotHeight / 2 + 4} textAnchor="end" fill="#6B7280" fontSize="10" fontWeight="700">
          {midValue}
        </text>
      ) : null}
      <text x={margin.left - (compact ? 6 : 10)} y={axisY + 3} textAnchor="end" fill="#6B7280" fontSize={compact ? '8' : '10'} fontWeight="700">
        {min}
      </text>
      <text x={margin.left} y={viewHeight - (compact ? 7 : 8)} textAnchor="start" fill="#6B7280" fontSize={compact ? '8' : '10'} fontWeight="700">
        {xStart}
      </text>
      <text x={margin.left + plotWidth} y={viewHeight - (compact ? 7 : 8)} textAnchor="end" fill="#6B7280" fontSize={compact ? '8' : '10'} fontWeight="700">
        {xEnd}
      </text>
      <text x={margin.left} y={compact ? 12 : 14} textAnchor="start" fill="#64748B" fontSize={compact ? '8' : '10'} fontWeight="800">
        {yLabel}
      </text>
      <path d={areaPath} fill={`url(#${gradientId})`} />
      <path d={linePath} fill="none" stroke={color} strokeWidth={compact ? 8 : 9} strokeLinecap="round" strokeLinejoin="round" opacity="0.1" vectorEffect="non-scaling-stroke" />
      <path d={linePath} fill="none" stroke={color} strokeWidth={compact ? 3 : 3.4} strokeLinecap="round" strokeLinejoin="round" filter={`url(#${gradientId}Shadow)`} vectorEffect="non-scaling-stroke" />
      {minPoint && maxPoint ? (
        <>
          <circle cx={maxPoint.x} cy={maxPoint.y} r={compact ? 3.4 : 4.2} fill="#FFFFFF" stroke={color} strokeWidth={1.8} vectorEffect="non-scaling-stroke" opacity="0.94" />
          <circle cx={minPoint.x} cy={minPoint.y} r={compact ? 3 : 3.6} fill="#FFFFFF" stroke="#94A3B8" strokeWidth={1.5} vectorEffect="non-scaling-stroke" opacity="0.76" />
        </>
      ) : null}
      {lastPoint ? (
        <>
          <circle cx={lastPoint.x} cy={lastPoint.y} r={compact ? 5 : 6} fill="#FFFFFF" stroke={color} strokeWidth={2.4} vectorEffect="non-scaling-stroke" />
          {!compact ? (
            <g>
              <rect x={Math.min(lastPoint.x + 10, margin.left + plotWidth - 74)} y={Math.max(lastPoint.y - 26, margin.top + 6)} width={64} height={22} rx={11} fill="#FFFFFF" stroke="#D8E0EB" strokeWidth={1} vectorEffect="non-scaling-stroke" />
              <text x={Math.min(lastPoint.x + 42, margin.left + plotWidth - 42)} y={Math.max(lastPoint.y - 11, margin.top + 21)} textAnchor="middle" fill={color} fontSize="10" fontWeight="900">
                {lastPoint.value}
              </text>
            </g>
          ) : null}
        </>
      ) : null}
    </svg>
  );
}

function SectionCard({
  title,
  icon: Icon,
  children,
  action,
  sx,
}: {
  title: string;
  icon?: typeof TimelineIcon;
  children: React.ReactNode;
  action?: React.ReactNode;
  sx?: object;
}) {
  return (
    <Paper elevation={0} sx={{border: '1px solid #DDE3EA', borderRadius: 2, p: 2, bgcolor: '#FFFFFF', ...sx}}>
      <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.2, mb: 1.4}}>
        <Typography variant="subtitle1" sx={{color: pageText, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 0.9}}>
          {Icon ? <Icon sx={{color: blue, fontSize: 20}} /> : null}
          {title}
        </Typography>
        {action}
      </Box>
      {children}
    </Paper>
  );
}

function RowBadge({label}: {label: string}) {
  return <Chip label={label} size="small" sx={{height: 24, bgcolor: '#FFFFFF', border: '1px solid #D7DDE6', color: pageText, fontWeight: 900}} />;
}

function Asset3DVisualization() {
  return (
    <Paper
      elevation={0}
      sx={{
        minHeight: 320,
        borderRadius: 2,
        border: '1px solid #E3E8F1',
        background: 'radial-gradient(circle at 20% 18%, #F8FBFF 0%, #EDF4FF 30%, #F7FAFD 52%, #EEF3FA 72%, #FFFFFF 100%)',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <Box sx={{position: 'absolute', top: 14, left: 14, display: 'flex', flexWrap: 'wrap', gap: 0.8}}>
        <Chip label="Digital Twin" size="small" sx={{height: 26, bgcolor: '#FFFFFFCC', border: '1px solid #C9D8F5', color: blue, fontWeight: 900}} />
        <Chip label="SA-204" size="small" sx={{height: 26, bgcolor: '#0F172A', color: '#FFFFFF', fontWeight: 900}} />
      </Box>

      <Box sx={{position: 'absolute', top: 14, right: 14, display: 'grid', gap: 0.6}}>
        {assetLayers.map((layer) => (
          <Paper key={layer.label} elevation={0} sx={{px: 1, py: 0.75, borderRadius: 1.5, bgcolor: '#FFFFFFD9', border: '1px solid #D9E3F2'}}>
            <Typography variant="caption" sx={{display: 'flex', alignItems: 'center', gap: 0.7, color: mutedText, fontWeight: 800}}>
              <StatusDot color={layer.color} />
              {layer.label}
            </Typography>
            <Typography sx={{color: pageText, fontWeight: 800, fontSize: '0.84rem', mt: 0.25}}>{layer.value}</Typography>
          </Paper>
        ))}
      </Box>

      <Box sx={{position: 'relative', minHeight: 320, px: {xs: 2, md: 3}, py: 2}}>
        <Box
          sx={{
            position: 'absolute',
            inset: 'auto 7% 26px 7%',
            height: 54,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(37,99,235,0.18) 0%, rgba(37,99,235,0.08) 38%, rgba(37,99,235,0.02) 70%, rgba(37,99,235,0) 100%)',
            filter: 'blur(4px)',
          }}
        />

        <Box sx={{position: 'relative', width: '100%', maxWidth: 660, mx: 'auto', pt: 5}}>
          <svg viewBox="0 0 760 360" width="100%" height="100%" display="block">
            <defs>
              <linearGradient id="floorGrid" x1="0%" x2="100%" y1="0%" y2="100%">
                <stop offset="0%" stopColor="#E7EEF9" />
                <stop offset="100%" stopColor="#F8FBFF" />
              </linearGradient>
              <linearGradient id="panelTop" x1="0%" x2="100%" y1="0%" y2="100%">
                <stop offset="0%" stopColor="#F8FBFF" />
                <stop offset="100%" stopColor="#D9E7FF" />
              </linearGradient>
              <linearGradient id="panelSide" x1="0%" x2="100%" y1="0%" y2="100%">
                <stop offset="0%" stopColor="#B9D0F8" />
                <stop offset="100%" stopColor="#7FA7EB" />
              </linearGradient>
              <linearGradient id="panelFront" x1="0%" x2="0%" y1="0%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="100%" stopColor="#DDE9FB" />
              </linearGradient>
              <linearGradient id="accentOrange" x1="0%" x2="100%">
                <stop offset="0%" stopColor="#FBBF24" />
                <stop offset="100%" stopColor="#F97316" />
              </linearGradient>
              <linearGradient id="accentGreen" x1="0%" x2="100%">
                <stop offset="0%" stopColor="#86EFAC" />
                <stop offset="100%" stopColor="#22C55E" />
              </linearGradient>
            </defs>

            <polygon points="122,278 352,170 632,258 404,344" fill="url(#floorGrid)" stroke="#D8E2F2" strokeWidth="2" />
            <polyline points="190,246 408,142 564,228" fill="none" stroke="#D5E2F5" strokeWidth="2" strokeDasharray="6 6" />
            <polyline points="234,266 454,162 610,248" fill="none" stroke="#E2EBF8" strokeWidth="2" strokeDasharray="6 6" />

            <polygon points="202,224 370,146 496,206 330,284" fill="url(#panelTop)" stroke="#7DA4E9" strokeWidth="2.5" />
            <polygon points="330,284 496,206 496,260 330,338" fill="url(#panelSide)" stroke="#6B95DD" strokeWidth="2.5" />
            <polygon points="202,224 330,284 330,338 202,278" fill="url(#panelFront)" stroke="#8DAFE8" strokeWidth="2.5" />

            <polygon points="350,155 436,115 500,147 414,188" fill="#F5F9FF" stroke="#9BB7EA" strokeWidth="2" />
            <polygon points="414,188 500,147 500,201 414,241" fill="#8DB1EE" stroke="#7DA0DE" strokeWidth="2" />
            <polygon points="350,155 414,188 414,241 350,208" fill="#E3EEFF" stroke="#9BB7EA" strokeWidth="2" />

            <polygon points="268,196 322,171 322,245 268,270" fill="url(#accentOrange)" opacity="0.92" />
            <polygon points="386,212 446,184 446,258 386,286" fill="url(#accentGreen)" opacity="0.92" />

            <rect x="230" y="248" width="58" height="13" rx="6.5" fill="#0F172A" opacity="0.9" />
            <rect x="345" y="193" width="44" height="10" rx="5" fill="#2563EB" opacity="0.78" />
            <rect x="425" y="228" width="38" height="10" rx="5" fill="#FF5B4D" opacity="0.84" />

            <circle cx="287" cy="187" r="8" fill="#F59E0B" />
            <circle cx="430" cy="170" r="8" fill="#52B36A" />
            <circle cx="444" cy="238" r="8" fill="#FF5B4D" />
            <line x1="287" y1="187" x2="174" y2="110" stroke="#F59E0B" strokeWidth="2.5" />
            <line x1="430" y1="170" x2="578" y2="110" stroke="#52B36A" strokeWidth="2.5" />
            <line x1="444" y1="238" x2="598" y2="268" stroke="#FF5B4D" strokeWidth="2.5" />

            <rect x="88" y="86" width="142" height="44" rx="12" fill="#FFFFFF" stroke="#F4C56B" strokeWidth="2" />
            <text x="106" y="104" fill="#946200" fontSize="12" fontWeight="700">H1 Servo Motor SM-204</text>
            <text x="106" y="120" fill="#B07A12" fontSize="12">Vibration trending above baseline</text>

            <rect x="528" y="84" width="154" height="44" rx="12" fill="#FFFFFF" stroke="#8ED9A9" strokeWidth="2" />
            <text x="546" y="102" fill="#147A38" fontSize="12" fontWeight="700">H2 Nozzle Cluster NC-12</text>
            <text x="546" y="118" fill="#31965A" fontSize="12">Alignment within tolerance</text>

            <rect x="548" y="248" width="152" height="44" rx="12" fill="#FFFFFF" stroke="#FFB6AE" strokeWidth="2" />
            <text x="566" y="266" fill="#C0392B" fontSize="12" fontWeight="700">H3 Drive Bearing 6204-ZZ</text>
            <text x="566" y="282" fill="#E05647" fontSize="12">Stock below reorder point</text>
          </svg>

          {assetHotspots.map((spot) => (
            <Box
              key={spot.label}
              sx={{
                position: 'absolute',
                left: spot.x,
                top: spot.y,
                transform: 'translate(-50%, -50%)',
                width: 22,
                height: 22,
                borderRadius: '50%',
                bgcolor: '#FFFFFF',
                border: `2px solid ${spot.tone}`,
                boxShadow: `0 0 0 6px ${spot.tone}22`,
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <Typography sx={{fontSize: '0.58rem', color: spot.tone, fontWeight: 900}}>{spot.label}</Typography>
            </Box>
          ))}
        </Box>

        <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', md: 'repeat(3, minmax(0, 1fr))'}, gap: 1, mt: 1.2}}>
          {assetHotspots.map((spot) => (
            <Paper key={spot.label} elevation={0} sx={{border: '1px solid #DDE6F2', borderRadius: 1.5, px: 1.2, py: 1, bgcolor: '#FFFFFFCC'}}>
              <Typography variant="caption" sx={{color: mutedText, fontWeight: 800}}>
                {spot.label}
              </Typography>
              <Typography sx={{color: pageText, fontWeight: 800, fontSize: '0.92rem', mt: 0.2}}>{spot.title}</Typography>
              <Typography variant="caption" sx={{color: mutedText}}>
                {spot.meta}
              </Typography>
            </Paper>
          ))}
        </Box>
      </Box>
    </Paper>
  );
}

function PerformanceTab() {
  return (
    <Box sx={{display: 'grid', gap: 1.6}}>
      <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', md: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(5, minmax(0, 1fr))'}, gap: 1.4}}>
        {performanceCards.map((card) => (
          <Paper
            key={card.label}
            elevation={0}
            sx={{
              border: '1px solid #DDE3EA',
              borderRadius: 2,
              p: 1.7,
              bgcolor: '#FFFFFF',
              position: 'relative',
              overflow: 'hidden',
              transition: 'border-color 150ms ease, box-shadow 150ms ease, background 150ms ease',
              '&:before': {
                content: '""',
                position: 'absolute',
                inset: '0 0 auto 0',
                height: 4,
                bgcolor: card.color,
              },
              '&:hover': {borderColor: '#C8D2DF', boxShadow: '0 10px 22px rgba(15,23,42,0.08)', bgcolor: '#FBFDFF'},
            }}
          >
            <Box sx={{display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1}}>
              <Box sx={{minWidth: 0}}>
                <Typography sx={{color: mutedText, fontWeight: 900, fontSize: '0.86rem'}}>{card.label}</Typography>
                <Typography sx={{color: card.color, fontWeight: 900, fontSize: '2.15rem', lineHeight: 1, mt: 0.75}}>{card.value}</Typography>
              </Box>
              <Tooltip
                arrow
                placement="top"
                title={
                  <Box sx={{display: 'grid', gap: 0.55, maxWidth: 260}}>
                    <Typography sx={{fontWeight: 900, fontSize: '0.8rem'}}>{card.label}</Typography>
                    <Typography sx={{fontSize: '0.76rem', lineHeight: 1.35}}>{card.description}</Typography>
                    <Typography sx={{fontSize: '0.74rem', lineHeight: 1.35, opacity: 0.88}}>{card.formula}</Typography>
                  </Box>
                }
              >
                <IconButton
                  aria-label={`Explain ${card.label}`}
                  size="small"
                  sx={{
                    width: 30,
                    height: 30,
                    border: '1px solid #D8E0EB',
                    bgcolor: '#F8FAFC',
                    color: '#64748B',
                    '&:hover': {bgcolor: '#EFF6FF', color: blue, borderColor: '#BFD4FF'},
                  }}
                >
                  <InfoIcon sx={{fontSize: 17}} />
                </IconButton>
              </Tooltip>
            </Box>
            <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mt: 1}}>
              <Typography variant="caption" sx={{color: mutedText, fontWeight: 800}}>
                {card.target}
              </Typography>
              <Typography variant="caption" sx={{color: card.color, fontWeight: 900}}>
                {card.trend}
              </Typography>
            </Box>
            <Box sx={{mt: 1.15, borderRadius: 1.6, bgcolor: 'linear-gradient(180deg, #F8FBFF 0%, #FFFFFF 100%)', border: '1px solid #E2EAF5', px: 0.75, py: 0.65}}>
              <MiniSparkline
                values={sparkValues.slice(0, 16)}
                color={card.color === '#2D3440' ? blue : card.color}
                fill={card.color === '#F59E0B' ? '#FFE7B8' : card.color === '#52B36A' ? '#DCFCE7' : '#DCE8FF'}
                height={68}
                yLabel={card.yLabel}
              />
            </Box>
          </Paper>
        ))}
      </Box>

      <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', xl: 'repeat(2, minmax(0, 1fr))'}, gap: 1.6}}>
        <SectionCard title="Unplanned Downtime (30d)" icon={AlertIcon}>
          <Box sx={{borderRadius: 2, bgcolor: 'linear-gradient(180deg, #F8FBFF 0%, #FFFFFF 100%)', border: '1px solid #E2EAF5', px: 1.1, py: 0.9}}>
            <MiniSparkline values={sparkValues} height={132} yLabel="minutes" />
          </Box>
          <Typography sx={{color: mutedText, fontSize: '0.95rem', mt: 1}}>3.2 hours total · 4 events</Typography>
        </SectionCard>
        <SectionCard title="Failure Trend (90d)" icon={TrendIcon}>
          <Box sx={{borderRadius: 2, bgcolor: 'linear-gradient(180deg, #F8FBFF 0%, #FFFFFF 100%)', border: '1px solid #E2EAF5', px: 1.1, py: 0.9}}>
            <MiniSparkline values={[18, 52, 67, 40, 79, 59, 92, 71, 49, 28, 62, 81, 93, 71, 50, 84, 100, 79, 60, 69, 90, 68, 46, 70, 82, 91, 70, 48, 69, 69]} height={132} xStart="90d" yLabel="failures" />
          </Box>
          <Typography sx={{color: mutedText, fontSize: '0.95rem', mt: 1}}>Decreasing · 2 failures last 30d (vs 5 prior)</Typography>
        </SectionCard>
      </Box>

      <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', xl: 'repeat(2, minmax(0, 1fr))'}, gap: 1.6}}>
        <SectionCard
          title="Cost by Parts Used"
          icon={SparePartsIcon}
          action={<Chip label="$640 parts" size="small" sx={{height: 26, bgcolor: '#ECFDF5', color: '#0F766E', border: '1px solid #A7F3D0', fontWeight: 900}} />}
        >
          <Box sx={{display: 'grid', gap: 1}}>
            {costPartRows.map((item) => (
              <Paper key={item.part} elevation={0} sx={{border: '1px solid #E2E8F0', borderRadius: 1.5, bgcolor: '#F8FAFC', px: 1.15, py: 1}}>
                <Box sx={{display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.2}}>
                  <Box sx={{minWidth: 0}}>
                    <Typography sx={{color: pageText, fontWeight: 850, lineHeight: 1.25}}>{item.part}</Typography>
                    <Typography variant="caption" sx={{color: mutedText, fontWeight: 750}}>
                      {item.qty} · Unit cost {item.unitCost}
                    </Typography>
                  </Box>
                  <Typography sx={{color: '#0F766E', fontWeight: 950, whiteSpace: 'nowrap'}}>{item.total}</Typography>
                </Box>
              </Paper>
            ))}
          </Box>
        </SectionCard>
        <SectionCard
          title="Cost by Labor Used"
          icon={MaintenanceIcon}
          action={<Chip label="$2,250 labor" size="small" sx={{height: 26, bgcolor: '#FEF6ED', color: '#B45309', border: '1px solid #FED7AA', fontWeight: 900}} />}
        >
          <Box sx={{display: 'grid', gap: 1}}>
            {laborCostRows.map((item) => (
              <Paper key={`${item.role}-${item.skill}`} elevation={0} sx={{border: '1px solid #E2E8F0', borderRadius: 1.5, bgcolor: '#F8FAFC', px: 1.15, py: 1}}>
                <Box sx={{display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.2}}>
                  <Box sx={{minWidth: 0}}>
                    <Typography component="div" sx={{color: pageText, fontWeight: 850, lineHeight: 1.25, display: 'flex', alignItems: 'center', gap: 0.8, flexWrap: 'wrap'}}>
                      <StatusDot color={item.dot} />
                      {item.role}
                      <Chip label={item.skill} size="small" sx={{height: 22, bgcolor: '#FFFFFF', border: '1px solid #D7DDE6', color: pageText, fontWeight: 900}} />
                    </Typography>
                    <Typography variant="caption" sx={{color: mutedText, fontWeight: 750}}>
                      {item.hours} · Rate {item.rate}
                    </Typography>
                  </Box>
                  <Typography sx={{color: item.dot, fontWeight: 950, whiteSpace: 'nowrap'}}>{item.total}</Typography>
                </Box>
              </Paper>
            ))}
          </Box>
        </SectionCard>
      </Box>

      <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', xl: 'repeat(2, minmax(0, 1fr))'}, gap: 1.6}}>
        <SectionCard title="Repeat Failures" icon={PerformanceIcon}>
          <Box sx={{display: 'grid', gap: 1.2}}>
            {[
              {code: 'BRG-WEAR-OUT', count: 'x3', ago: '14 days ago'},
              {code: 'ALIGN-MISFILL', count: 'x2', ago: '23 days ago'},
              {code: 'LUBR-LOW', count: 'x2', ago: '46 days ago'},
            ].map((item) => (
              <Box key={item.code} sx={{display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto auto', alignItems: 'center', gap: 1}}>
                <Typography sx={{color: pageText, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontWeight: 700}}>{item.code}</Typography>
                <Chip label={item.count} size="small" sx={{height: 28, bgcolor: '#FFFFFF', border: '1px solid #D7DDE6', fontWeight: 800}} />
                <Typography sx={{color: mutedText}}>{item.ago}</Typography>
              </Box>
            ))}
          </Box>
        </SectionCard>
        <SectionCard title="Condition Monitoring" icon={PerformanceIcon}>
          <Box sx={{display: 'grid', gap: 1.15}}>
            {[
              {label: 'Vibration RMS', value: '4.8 mm/s', dot: '#F59E0B', trend: '↑'},
              {label: 'Bearing Temp', value: '58°C', dot: '#52B36A', trend: '→'},
              {label: 'Motor Current', value: '9.2 A', dot: '#52B36A', trend: '→'},
              {label: 'Oil Quality', value: 'ISO 18/16/13', dot: '#52B36A', trend: '→'},
            ].map((item) => (
              <Box key={item.label} sx={{display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto auto', gap: 1, alignItems: 'center'}}>
                <Typography sx={{color: mutedText, display: 'flex', alignItems: 'center', gap: 1}}>
                  <StatusDot color={item.dot} />
                  {item.label}
                </Typography>
                <Typography sx={{color: pageText, fontWeight: 800}}>{item.value}</Typography>
                <Typography sx={{color: mutedText, fontWeight: 800}}>{item.trend}</Typography>
              </Box>
            ))}
          </Box>
        </SectionCard>
      </Box>
    </Box>
  );
}

function FutureActionsTab() {
  return (
    <Box sx={{display: 'grid', gap: 1.6}}>
      <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', xl: 'repeat(2, minmax(0, 1fr))'}, gap: 1.6}}>
        <SectionCard title="Open Work Orders" icon={MaintenanceIcon}>
          <Box sx={{display: 'grid'}}>
            {futureOpenWorkOrders.map((order, index) => (
              <Box key={order.id}>
                <Box sx={{display: 'grid', gridTemplateColumns: 'auto minmax(0, 1fr) auto', gap: 1.1, alignItems: 'center', py: 1}}>
                  <RowBadge label={order.id} />
                  <Box>
                    <Typography sx={{fontWeight: 700, color: pageText}}>{order.title}</Typography>
                    <Typography variant="caption" sx={{color: mutedText}}>
                      {order.meta}
                    </Typography>
                  </Box>
                  <Typography sx={{color: blue, fontWeight: 800}}>{order.priority}</Typography>
                </Box>
                {index < futureOpenWorkOrders.length - 1 ? <Divider /> : null}
              </Box>
            ))}
          </Box>
        </SectionCard>

        <SectionCard title="Open Maintenance Requests" icon={AlertIcon}>
          <Box sx={{display: 'grid'}}>
            {maintenanceRequests.map((request, index) => (
              <Box key={request.id}>
                <Box sx={{display: 'grid', gridTemplateColumns: 'auto minmax(0, 1fr) auto', gap: 1.1, alignItems: 'center', py: 1}}>
                  <RowBadge label={request.id} />
                  <Box>
                    <Typography sx={{fontWeight: 700, color: pageText}}>{request.title}</Typography>
                    <Typography variant="caption" sx={{color: mutedText}}>
                      {request.meta}
                    </Typography>
                  </Box>
                  <Typography sx={{color: blue, fontWeight: 800}}>{request.priority}</Typography>
                </Box>
                {index < maintenanceRequests.length - 1 ? <Divider /> : null}
              </Box>
            ))}
          </Box>
        </SectionCard>
      </Box>

      <SectionCard title="Upcoming PMs (90 days)" icon={CalendarIcon}>
        <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', lg: 'repeat(3, minmax(0, 1fr))'}, gap: 1.4}}>
          {upcomingPms.map((pm) => (
            <Paper key={pm.title} elevation={0} sx={{border: '1px solid #E3E8F1', borderRadius: 2, px: 1.4, py: 1.25}}>
              <Typography sx={{color: blue, fontWeight: 800}}>{pm.date}</Typography>
              <Typography sx={{color: pageText, fontWeight: 800, fontSize: '1rem', mt: 0.45}}>{pm.title}</Typography>
              <Typography sx={{color: mutedText, mt: 0.55}}>{pm.owner}</Typography>
            </Paper>
          ))}
        </Box>
      </SectionCard>

      <SectionCard title="Planned Shutdown Activities" icon={TimelineIcon}>
        <Paper elevation={0} sx={{border: '1px solid #E3E8F1', borderRadius: 2, px: 1.5, py: 1.4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.2, flexWrap: 'wrap'}}>
          <Box>
            <Typography sx={{color: pageText, fontWeight: 800, fontSize: '1.05rem'}}>Q2 Planned Shutdown · Jun 8–10, 2026</Typography>
            <Typography sx={{color: mutedText, mt: 0.4}}>5 activities scheduled · 22h total estimated</Typography>
          </Box>
          <Chip label="Scheduled" sx={{height: 32, bgcolor: '#FFFFFF', color: blue, border: '1px solid #8EB4FF', fontWeight: 900}} />
        </Paper>
      </SectionCard>
    </Box>
  );
}

type BomTreeRow = BomRow & {
  id: string;
  children: BomTreeRow[];
};

function buildBomTree(rows: BomRow[]): BomTreeRow[] {
  const roots: BomTreeRow[] = [];
  const stack: BomTreeRow[] = [];

  rows.forEach((row, index) => {
    const node: BomTreeRow = {...row, id: `${row.code}-${index}`, children: []};

    while (stack.length > 0 && stack[stack.length - 1].level >= row.level) {
      stack.pop();
    }

    const parent = stack[stack.length - 1];
    if (parent) {
      parent.children.push(node);
    } else {
      roots.push(node);
    }

    stack.push(node);
  });

  return roots;
}

function flattenVisibleBomRows(nodes: BomTreeRow[], expandedIds: string[], searchTerm: string): BomTreeRow[] {
  const expandedSet = new Set(expandedIds);
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const visibleRows: BomTreeRow[] = [];

  const matchesSearch = (node: BomTreeRow): boolean =>
    !normalizedSearch || `${node.label} ${node.code} ${node.qty}`.toLowerCase().includes(normalizedSearch);

  const appendVisible = (node: BomTreeRow): boolean => {
    const isMatch = matchesSearch(node);
    const matchingChildren = node.children.filter((child) => appendPreview(child));
    const shouldShow = !normalizedSearch || isMatch || matchingChildren.length > 0;

    if (!shouldShow) return false;

    visibleRows.push(node);

    if (normalizedSearch || expandedSet.has(node.id)) {
      node.children.forEach((child) => appendVisible(child));
    }

    return true;
  };

  const appendPreview = (node: BomTreeRow): boolean => matchesSearch(node) || node.children.some(appendPreview);

  visibleRows.length = 0;
  nodes.forEach(appendVisible);

  return visibleRows;
}

function StructureTab({bomRows}: {bomRows: BomRow[]}) {
  const [expandedBomIds, setExpandedBomIds] = useState<string[] | null>(null);
  const [bomSearch, setBomSearch] = useState('');
  const bomTree = useMemo(() => buildBomTree(bomRows), [bomRows]);
  const rootBomIds = useMemo(() => bomTree.map((row) => row.id), [bomTree]);
  const effectiveExpandedBomIds = expandedBomIds ?? rootBomIds;
  const visibleBomRows = useMemo(() => flattenVisibleBomRows(bomTree, effectiveExpandedBomIds, bomSearch), [bomTree, effectiveExpandedBomIds, bomSearch]);

  const handleToggleBomRow = (id: string) => {
    setExpandedBomIds((prev) => {
      const currentIds = prev ?? rootBomIds;
      return currentIds.includes(id) ? currentIds.filter((rowId) => rowId !== id) : [...currentIds, id];
    });
  };

  return (
    <Box sx={{display: 'grid', gap: 1.6}}>
      <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', xl: 'minmax(0, 2fr) minmax(320px, 1fr)'}, gap: 1.6}}>
        <SectionCard
          title="Bill of Materials"
          icon={StructureIcon}
        >
          <TextField
            fullWidth
            size="small"
            placeholder="Search BOM..."
            value={bomSearch}
            onChange={(event) => setBomSearch(event.target.value)}
            sx={{mb: 1.1, '& .MuiOutlinedInput-root': {height: 34, borderRadius: 1.2, bgcolor: '#F8FAFC'}}}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{color: '#64748B', fontSize: 18}} />
                </InputAdornment>
              ),
            }}
          />
          <Box sx={{display: 'grid', gap: 0.25}}>
            {visibleBomRows.map((row) => {
              const isAssembly = row.children.length > 0;
              const isExpanded = effectiveExpandedBomIds.includes(row.id);
              const ItemIcon = isAssembly ? StructureIcon : TreeNodeIcon;

              return (
                <Box
                  key={row.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    if (isAssembly) handleToggleBomRow(row.id);
                  }}
                  onKeyDown={(event) => {
                    if (isAssembly && (event.key === 'Enter' || event.key === ' ')) {
                      event.preventDefault();
                      handleToggleBomRow(row.id);
                    }
                  }}
                  sx={{
                    minHeight: 38,
                    display: 'grid',
                    gridTemplateColumns: '24px 18px minmax(0, 1fr)',
                    alignItems: 'center',
                    gap: 0.75,
                    pl: `${0.25 + row.level * 1.45}rem`,
                    pr: 1,
                    py: 0.55,
                    borderRadius: 1.1,
                    cursor: isAssembly ? 'pointer' : 'default',
                    border: '1px solid transparent',
                    bgcolor: isAssembly ? '#FBFCFF' : 'transparent',
                    '&:hover': {bgcolor: '#F4F7FB', borderColor: '#E3E8F1'},
                    '&:focus-visible': {outline: `2px solid ${blue}`, outlineOffset: 1},
                  }}
                >
                  {isAssembly ? (
                    <IconButton
                      aria-label={isExpanded ? `Collapse ${row.label}` : `Expand ${row.label}`}
                      size="small"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleToggleBomRow(row.id);
                      }}
                      sx={{
                        width: 24,
                        height: 24,
                        color: isExpanded ? blue : '#64748B',
                        bgcolor: '#FFFFFF',
                        border: '1px solid #D7DDE6',
                        '&:hover': {bgcolor: '#EEF4FF', borderColor: '#B8CAFF'},
                      }}
                    >
                      {isExpanded ? <DownIcon sx={{fontSize: 16}} /> : <ChevronRightIcon sx={{fontSize: 16}} />}
                    </IconButton>
                  ) : (
                    <Box sx={{width: 24, display: 'flex', justifyContent: 'center'}}>
                      <Box sx={{width: 6, height: 6, borderRadius: 99, bgcolor: '#CBD5E1'}} />
                    </Box>
                  )}
                  <ItemIcon sx={{fontSize: isAssembly ? 17 : 14, color: isAssembly ? blue : '#7A8596', flexShrink: 0}} />
                  <Box sx={{display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0, flexWrap: 'wrap'}}>
                    <Typography
                      sx={{
                        color: pageText,
                        minWidth: 0,
                        fontWeight: isAssembly ? 850 : 650,
                        fontSize: isAssembly ? '0.94rem' : '0.9rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {row.label} <Box component="span" sx={{color: mutedText, fontWeight: 700}}>• {row.qty}</Box>
                    </Typography>
                  </Box>
                </Box>
              );
            })}
            {visibleBomRows.length === 0 ? (
              <Typography sx={{color: mutedText, fontWeight: 700, py: 1.2, textAlign: 'center'}}>No BOM items found.</Typography>
            ) : null}
          </Box>
        </SectionCard>

        <SectionCard title="Spare Parts" icon={SparePartsIcon}>
          <Box sx={{display: 'grid', gap: 1.1}}>
            {spareParts.map((part) => (
              <Box key={part.name} sx={{display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: 1, alignItems: 'center'}}>
                <Box>
                  <Typography sx={{color: pageText, fontWeight: 700}}>{part.name}</Typography>
                  <Typography variant="caption" sx={{color: mutedText}}>
                    {part.bin}
                  </Typography>
                </Box>
                <Chip
                  label={part.stock}
                  size="small"
                  sx={{
                    height: 28,
                    bgcolor: '#FFFFFF',
                    color: part.warn ? '#F59E0B' : pageText,
                    border: `1px solid ${part.warn ? '#F5B35C' : '#D7DDE6'}`,
                    fontWeight: 900,
                  }}
                />
              </Box>
            ))}
          </Box>
        </SectionCard>
      </Box>

      <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', xl: 'minmax(0, 2fr) minmax(320px, 1fr)'}, gap: 1.6}}>
        <SectionCard title="3D Asset Visualization" icon={AssetIcon}>
          <Asset3DVisualization />
        </SectionCard>

        <SectionCard title="Technical Documentation" icon={DocumentIcon}>
          <Box sx={{display: 'grid', gap: 0.35}}>
            {techDocs.map((doc) => (
              <Box key={doc.title} sx={{display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: 1, alignItems: 'center', py: 0.65}}>
                <Typography sx={{color: pageText, display: 'flex', alignItems: 'center', gap: 0.8}}>
                  <DocumentIcon sx={{fontSize: 16, color: '#6B7280'}} />
                  {doc.title}
                </Typography>
                <Chip label={doc.type} size="small" sx={{height: 24, bgcolor: '#FFFFFF', border: '1px solid #D7DDE6', fontWeight: 800}} />
              </Box>
            ))}
          </Box>
        </SectionCard>
      </Box>
    </Box>
  );
}

function ReliabilityTab({
  selectedHierarchyId,
  onReviewAiEvidence,
}: {
  selectedHierarchyId: string | null;
  onReviewAiEvidence: (recommendation: AiRecommendation) => void;
}) {
  const selectedHierarchy = initialHierarchyItems.find((item) => item.id === selectedHierarchyId);
  const shouldShowMoldingLogbook = isMoldingAsset(selectedHierarchy);

  return (
    <Box sx={{display: 'grid', gap: 1.6}}>
      <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', xl: 'minmax(0, 2fr) minmax(360px, 1fr)'}, gap: 1.6}}>
        <SectionCard title="Failure History (12 months)" icon={TimelineIcon}>
          <Box sx={{display: 'grid'}}>
            {failureHistory.map((item, index) => (
              <Box key={`${item.date}-${item.code}`}>
                <Box sx={{display: 'grid', gridTemplateColumns: '56px auto minmax(0, 1fr) auto', gap: 1, alignItems: 'center', py: 1}}>
                  <Typography sx={{color: mutedText}}>{item.date}</Typography>
                  <Chip label={item.code} size="small" sx={{height: 24, justifySelf: 'start', bgcolor: '#F8FAFC', border: '1px solid #D7DDE6', fontWeight: 900}} />
                  <Typography sx={{color: pageText, fontWeight: 700}}>{item.title}</Typography>
                  <Chip label={item.hours} size="small" sx={{height: 24, bgcolor: '#FFF5F5', color: '#FF5B4D', border: '1px solid #FFB6AE', fontWeight: 900}} />
                </Box>
                {index < failureHistory.length - 1 ? <Divider /> : null}
              </Box>
            ))}
          </Box>
        </SectionCard>

        <SectionCard title="Bad Actor Detection" icon={AlertIcon}>
          <Paper elevation={0} sx={{border: '1px solid #FFCAC4', borderRadius: 1.8, bgcolor: '#FFF2F1', px: 1.3, py: 1.2}}>
            <Typography sx={{color: '#FF5B4D', fontWeight: 900, fontSize: '1.05rem'}}>Filling Head Assembly</Typography>
            <Typography sx={{color: pageText, mt: 0.55}}>
              Top contributor to downtime on SA-204. 5 failures in 12 months · 9.1h total downtime · est. $4,820 cost.
            </Typography>
          </Paper>
          <Typography sx={{color: mutedText, fontWeight: 700, mt: 1.4, mb: 0.8}}>Other monitored components:</Typography>
          <Box sx={{display: 'grid', gap: 0.9}}>
            {[
              {name: 'Servo Motor SM-204', rank: '#2'},
              {name: 'Drive Belt DB-88', rank: '#3'},
            ].map((row) => (
              <Box key={row.name} sx={{display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: 1, alignItems: 'center'}}>
                <Typography sx={{color: pageText, fontWeight: 700}}>{row.name}</Typography>
                <Chip label={row.rank} size="small" sx={{height: 24, bgcolor: '#FFFFFF', border: '1px solid #D7DDE6', fontWeight: 900}} />
              </Box>
            ))}
          </Box>
        </SectionCard>
      </Box>

      {shouldShowMoldingLogbook && selectedHierarchy ? <MoldLogbookSection asset={selectedHierarchy} /> : null}

      <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', xl: 'repeat(2, minmax(0, 1fr))'}, gap: 1.6}}>
        <SectionCard title="PM Effectiveness" icon={ShieldIcon}>
          <Box sx={{display: 'grid', gap: 1.4}}>
            {[
              {label: 'PM Compliance', value: '96%', color: '#52B36A', sub: ''},
              {label: 'PM Yield', value: '82%', color: '#F59E0B', sub: 'Findings per PM'},
              {label: 'Reactive Ratio', value: '18%', color: '#F59E0B', sub: 'Target < 15%'},
            ].map((row) => (
              <Box key={row.label} sx={{display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', alignItems: 'center', gap: 1}}>
                <Box>
                  <Typography sx={{color: mutedText, fontWeight: 700}}>{row.label}</Typography>
                  {row.sub ? <Typography variant="caption" sx={{color: mutedText}}>{row.sub}</Typography> : null}
                </Box>
                <Typography sx={{color: row.color, fontWeight: 900, fontSize: '2rem', lineHeight: 1}}>{row.value}</Typography>
              </Box>
            ))}
          </Box>
        </SectionCard>

        <SectionCard title="RCA History" icon={TimelineIcon}>
          <Box sx={{display: 'grid', gap: 1.15}}>
            {[
              {id: 'RCA-204-12', title: 'Recurring bearing wear', status: 'In progress', tone: '#F59E0B'},
              {id: 'RCA-204-11', title: 'Filling head misalignment', status: 'Closed', tone: blue},
              {id: 'RCA-204-10', title: 'Lubrication starvation', status: 'Closed', tone: blue},
            ].map((row) => (
              <Box key={row.id} sx={{display: 'grid', gridTemplateColumns: 'auto minmax(0, 1fr) auto', gap: 1, alignItems: 'center'}}>
                <Chip label={row.id} size="small" sx={{height: 24, bgcolor: '#F8FAFC', border: '1px solid #D7DDE6', fontWeight: 900}} />
                <Typography sx={{color: pageText, fontWeight: 700}}>{row.title}</Typography>
                <Typography sx={{color: row.tone, fontWeight: 800}}>{row.status}</Typography>
              </Box>
            ))}
          </Box>
        </SectionCard>
      </Box>

      <SectionCard title="BLU.AI Insights" icon={InsightIcon}>
        <Box sx={{display: 'grid', gap: 1.2}}>
          {aiRecommendations.map((recommendation) => (
              <Paper key={recommendation.id} elevation={0} sx={{border: '1px solid #E3E8F1', borderRadius: 1.8, px: 1.3, py: 1.2}}>
                <Box sx={{display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap'}}>
                  <Box sx={{minWidth: 0}}>
                    <Typography sx={{color: pageText, fontWeight: 900}}>{recommendation.title}</Typography>
                    <Typography variant="caption" sx={{color: mutedText, fontWeight: 800, display: 'block', mt: 0.2}}>
                      Historical pattern insight - maintenance review required
                    </Typography>
                  </Box>
                  <Chip
                    label={recommendation.status}
                    size="small"
                    sx={{
                      height: 24,
                      bgcolor: '#FFF7ED',
                      color: '#C2410C',
                      border: '1px solid #FED7AA',
                      fontWeight: 900,
                    }}
                  />
                </Box>
                <Typography sx={{color: mutedText, mt: 0.45}}>{recommendation.body}</Typography>
                <Typography sx={{color: '#52B36A', fontWeight: 800, mt: 0.65}}>{recommendation.impact}</Typography>
                <Box sx={{display: 'flex', gap: 0.8, flexWrap: 'wrap', mt: 1}}>
                  {recommendation.actions.map((action, index) => (
                    <Button
                      key={action}
                      variant={index === 0 ? 'outlined' : 'contained'}
                      size="small"
                      onClick={() => onReviewAiEvidence(recommendation)}
                      sx={
                        index === 0
                          ? {height: 30, borderColor: '#CBD5E1', color: pageText, textTransform: 'none', fontWeight: 900}
                          : {height: 30, bgcolor: blue, boxShadow: 'none', textTransform: 'none', fontWeight: 900, '&:hover': {bgcolor: '#1D4ED8', boxShadow: 'none'}}
                      }
                    >
                      {action}
                    </Button>
                  ))}
                </Box>
              </Paper>
          ))}
        </Box>
      </SectionCard>
    </Box>
  );
}

function MoldingMachineLogbookCard({asset}: {asset: HierarchyItem}) {
  const [moldingLogbookEntries, setMoldingLogbookEntries] = useState<MoldingLogbookEntry[]>(initialMoldingLogbookEntries);
  const [isMoldingDialogOpen, setIsMoldingDialogOpen] = useState(false);
  const [isCavityMapDialogOpen, setIsCavityMapDialogOpen] = useState(false);
  const [moldingDraft, setMoldingDraft] = useState<MoldingOccurrenceDraft>(() => createMoldingOccurrenceDraft(asset.code));
  const [selectedMoldCavity, setSelectedMoldCavity] = useState<SelectedMoldCavity | null>(null);
  const checkedCavityResults = getCheckedCavityResults(moldingDraft.cavityResults);
  const moldEquipmentHistory = getMoldEquipmentHistory(moldingDraft.moldId, moldingLogbookEntries);
  const selectedCavityEntry = selectedMoldCavity ? moldingLogbookEntries.find((entry) => entry.occurrenceId === selectedMoldCavity.occurrenceId) ?? null : null;
  const selectedCavityResult = selectedCavityEntry && selectedMoldCavity ? selectedCavityEntry.checkedCavities.find((cavity) => cavity.cavity === selectedMoldCavity.cavity) ?? null : null;
  const selectedCavityHistory =
    selectedCavityEntry && selectedMoldCavity ? getMoldCavityHistory(selectedCavityEntry, selectedMoldCavity.cavity, moldingLogbookEntries) : [];
  const isMoldingDraftComplete =
    Boolean(moldingDraft.equipmentId.trim()) &&
    Boolean(moldingDraft.moldId.trim()) &&
    Boolean(moldingDraft.productPartNumber.trim()) &&
    Boolean(moldingDraft.firstPieceInspectionResult.trim()) &&
    Boolean(moldingDraft.responsibleUser.trim()) &&
    Boolean(moldingDraft.inspectionDateTime) &&
    Boolean(moldingDraft.commentsOrAttachments.trim()) &&
    checkedCavityResults.length > 0;

  const handleMoldingDraftChange = <Field extends keyof Omit<MoldingOccurrenceDraft, 'cavityResults'>>(field: Field, value: MoldingOccurrenceDraft[Field]) => {
    setMoldingDraft((current) => ({...current, [field]: value}));
  };

  const handleCavityResultChange = (cavity: number, result: CavityResult) => {
    setMoldingDraft((current) => ({
      ...current,
      cavityResults: {
        ...current.cavityResults,
        [cavity]: result,
      },
    }));
  };

  const handleOpenMoldingDialog = () => {
    setMoldingDraft(createMoldingOccurrenceDraft(asset.code));
    setIsMoldingDialogOpen(true);
  };

  const handleOpenCavityMap = (entry: MoldingLogbookEntry, cavity = getDefaultSelectedCavity(entry)) => {
    setSelectedMoldCavity({occurrenceId: entry.occurrenceId, cavity});
    setIsCavityMapDialogOpen(true);
  };

  const handleAddMoldingOccurrence = () => {
    if (!isMoldingDraftComplete) return;

    const nextEntry: MoldingLogbookEntry = {
      occurrenceId: `MO-2026-${String(moldingLogbookEntries.length + 143).padStart(4, '0')}`,
      equipmentId: moldingDraft.equipmentId.trim(),
      moldId: moldingDraft.moldId.trim(),
      machineNumber: moldingDraft.equipmentId.trim(),
      title: moldingDraft.firstPieceInspectionResult.trim(),
      status: moldingDraft.passFailOutcome === 'Pass' ? 'OK' : 'NG',
      affectedCavities: checkedCavityResults.map((item) => Number(item.cavity.replace(/[^0-9]/g, ''))).filter((item) => Number.isFinite(item)),
      updatedBy: moldingDraft.responsibleUser.trim(),
      dateTime: formatInspectionDateTime(moldingDraft.inspectionDateTime),
      defectType: 'Other',
      actionTaken: moldingDraft.commentsOrAttachments.trim(),
      observation: moldingDraft.firstPieceInspectionResult.trim(),
      partNumber: moldingDraft.productPartNumber.trim(),
      material: '',
      lotBatch: '',
      disposition: moldingDraft.passFailOutcome === 'Pass' ? 'Continue production' : 'Quality review required',
      productPartNumber: moldingDraft.productPartNumber.trim(),
      firstPieceInspectionResult: moldingDraft.firstPieceInspectionResult.trim(),
      passFailOutcome: moldingDraft.passFailOutcome,
      checkedCavities: checkedCavityResults,
      responsibleUser: moldingDraft.responsibleUser.trim(),
      inspectionDateTime: formatInspectionDateTime(moldingDraft.inspectionDateTime),
      commentsOrAttachments: moldingDraft.commentsOrAttachments.trim(),
      relatedMr: moldingDraft.relatedMr.trim() || undefined,
      attachedForms: ['First Piece', 'New Cavity Check'],
      attachments: moldingDraft.commentsOrAttachments.split(',').map((item) => item.trim()).filter(Boolean),
      formData: createFirstCheckFormData({
        dateTime: moldingDraft.inspectionDateTime,
        inspector: moldingDraft.responsibleUser.trim(),
        machineNumber: moldingDraft.equipmentId.trim(),
        moldNumber: moldingDraft.moldId.trim(),
        partNumber: moldingDraft.productPartNumber.trim(),
        firstPieceApproved: moldingDraft.passFailOutcome === 'Pass' ? 'Yes' : 'No',
        overallStatus: moldingDraft.passFailOutcome === 'Pass' ? 'OK' : 'NG',
        affectedCavities: checkedCavityResults.map((item) => Number(item.cavity.replace(/[^0-9]/g, ''))).filter((item) => Number.isFinite(item)),
        description: moldingDraft.firstPieceInspectionResult.trim(),
        immediateAction: moldingDraft.commentsOrAttachments.trim(),
        disposition: moldingDraft.passFailOutcome === 'Pass' ? 'Continue production' : 'Quality review required',
        attachments: moldingDraft.commentsOrAttachments.trim(),
      }),
    };

    setMoldingLogbookEntries((current) => [nextEntry, ...current]);
    setSelectedMoldCavity({occurrenceId: nextEntry.occurrenceId, cavity: getDefaultSelectedCavity(nextEntry)});
    setIsMoldingDialogOpen(false);
    setMoldingDraft(createMoldingOccurrenceDraft(asset.code));
  };

  return (
    <>
      <SectionCard
        title="Mold Logbook"
        icon={DocumentIcon}
        action={
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={handleOpenMoldingDialog}
            sx={{height: 32, bgcolor: blue, boxShadow: 'none', textTransform: 'none', fontWeight: 900, '&:hover': {bgcolor: '#1D4ED8', boxShadow: 'none'}}}
          >
            Add Molding Occurrence
          </Button>
        }
      >
        <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', lg: '280px minmax(0, 1fr)'}, gap: 1.4}}>
          <Paper elevation={0} sx={{border: '1px solid #DDE3EA', borderRadius: 1.8, bgcolor: '#F8FAFC', p: 1.4}}>
            <Typography sx={{color: mutedText, fontWeight: 800, fontSize: '0.76rem', textTransform: 'uppercase'}}>Logbook scope</Typography>
            <Typography sx={{color: pageText, fontWeight: 900, fontSize: '1.35rem', mt: 0.6}}>{asset.code}</Typography>
            <Typography sx={{color: mutedText, fontWeight: 700, mt: 0.25}}>{asset.label}</Typography>
            <Divider sx={{my: 1.25}} />
            <Box sx={{display: 'grid', gap: 0.75}}>
              <Box sx={{display: 'flex', justifyContent: 'space-between', gap: 1}}>
                <Typography sx={{color: mutedText, fontWeight: 700}}>Occurrences</Typography>
                <Typography sx={{color: pageText, fontWeight: 900}}>{moldingLogbookEntries.length}</Typography>
              </Box>
              <Box sx={{display: 'flex', justifyContent: 'space-between', gap: 1}}>
                <Typography sx={{color: mutedText, fontWeight: 700}}>Attached forms</Typography>
                <Typography sx={{color: pageText, fontWeight: 900}}>{moldingLogbookEntries.reduce((total, entry) => total + entry.attachedForms.length, 0)}</Typography>
              </Box>
              <Box sx={{display: 'flex', justifyContent: 'space-between', gap: 1}}>
                <Typography sx={{color: mutedText, fontWeight: 700}}>Linked MRs</Typography>
                <Typography sx={{color: pageText, fontWeight: 900}}>{moldingLogbookEntries.filter((entry) => entry.relatedMr).length}</Typography>
              </Box>
            </Box>
          </Paper>

          <Box sx={{display: 'grid', gap: 1}}>
            <Box sx={{display: 'grid', gap: 1}}>
              {moldingLogbookEntries.map((entry) => {
                const isEntrySelected = selectedMoldCavity?.occurrenceId === entry.occurrenceId;

                return (
                <Paper
                  key={entry.occurrenceId}
                  elevation={0}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleOpenCavityMap(entry)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      handleOpenCavityMap(entry);
                    }
                  }}
                  sx={{
                    border: `1px solid ${isEntrySelected ? '#B8CAFF' : '#E3E8F1'}`,
                    borderRadius: 1.8,
                    px: 1.3,
                    py: 1.15,
                    bgcolor: isEntrySelected ? '#F8FAFF' : '#FFFFFF',
                    cursor: 'pointer',
                    boxShadow: isEntrySelected ? '0 0 0 2px rgba(37,99,235,0.08)' : 'none',
                    '&:hover': {borderColor: '#B8CAFF', bgcolor: '#F8FAFF'},
                    '&:focus-visible': {outline: `2px solid ${blue}`, outlineOffset: 2},
                  }}
                >
                  <Typography sx={{color: mutedText, fontWeight: 800, lineHeight: 1.45}}>
                    {entry.firstPieceInspectionResult}
                  </Typography>
                </Paper>
                );
              })}
            </Box>
          </Box>
        </Box>
      </SectionCard>

      <Dialog open={isCavityMapDialogOpen} onClose={() => setIsCavityMapDialogOpen(false)} fullWidth maxWidth="lg">
        <DialogTitle sx={{display: 'flex', alignItems: 'center', gap: 0.75, color: pageText, fontWeight: 900}}>
          <CavityMapIcon sx={{fontSize: 20, color: blue}} />
          Molding occurrence details
        </DialogTitle>
        <DialogContent sx={{display: 'grid', gap: 1.2, pt: '4px !important', pb: 2}}>
          {selectedCavityEntry ? (
            <Paper elevation={0} sx={{border: '1px solid #DDE3EA', borderRadius: 1.8, bgcolor: '#FFFFFF', p: 1.25}}>
              <Box sx={{display: 'flex', justifyContent: 'space-between', gap: 1.2, flexWrap: 'wrap'}}>
                <Box sx={{minWidth: 0}}>
                  <Box sx={{display: 'flex', alignItems: 'center', gap: 0.65, flexWrap: 'wrap'}}>
                    <Chip label={selectedCavityEntry.occurrenceId} size="small" sx={{height: 24, bgcolor: '#F8FAFC', border: '1px solid #D7DDE6', color: pageText, fontWeight: 900}} />
                    <Chip
                      label={selectedCavityEntry.passFailOutcome}
                      size="small"
                      sx={{
                        height: 24,
                        bgcolor: selectedCavityEntry.passFailOutcome === 'Pass' ? '#ECFDF3' : '#FFF2F1',
                        color: selectedCavityEntry.passFailOutcome === 'Pass' ? '#15803D' : '#B42318',
                        border: `1px solid ${selectedCavityEntry.passFailOutcome === 'Pass' ? '#BBF7D0' : '#FFCAC4'}`,
                        fontWeight: 900,
                      }}
                    />
                  </Box>
                  <Typography sx={{color: pageText, fontWeight: 900, mt: 0.85}}>
                    {selectedCavityEntry.moldId} - {selectedCavityEntry.productPartNumber}
                  </Typography>
                  <Typography sx={{color: mutedText, fontWeight: 700, mt: 0.3}}>{selectedCavityEntry.firstPieceInspectionResult}</Typography>
                </Box>
                <Box sx={{textAlign: {xs: 'left', sm: 'right'}, minWidth: 160}}>
                  <Typography sx={{color: pageText, fontWeight: 900}}>{selectedCavityEntry.responsibleUser}</Typography>
                  <Typography variant="caption" sx={{color: mutedText, fontWeight: 800}}>{selectedCavityEntry.inspectionDateTime}</Typography>
                </Box>
              </Box>

              <Box sx={{display: 'flex', gap: 0.55, flexWrap: 'wrap', mt: 1}}>
                <Chip label={`Equipment ${selectedCavityEntry.equipmentId}`} size="small" sx={{height: 24, bgcolor: '#EEF4FF', color: blue, border: '1px solid #C7D7FE', fontWeight: 900}} />
                <Chip label={`Mold ${selectedCavityEntry.moldId}`} size="small" sx={{height: 24, bgcolor: '#F8FAFC', color: pageText, border: '1px solid #D7DDE6', fontWeight: 900}} />
                {selectedCavityEntry.relatedMr ? <Chip label={selectedCavityEntry.relatedMr} size="small" sx={{height: 24, bgcolor: '#FFF7ED', color: '#C2410C', border: '1px solid #FED7AA', fontWeight: 900}} /> : null}
                {selectedCavityEntry.attachedForms.map((form) => (
                  <Chip key={`${selectedCavityEntry.occurrenceId}-${form}`} icon={<DocumentIcon sx={{fontSize: '14px !important'}} />} label={form} size="small" sx={{height: 24, bgcolor: '#ECFDF3', color: '#15803D', border: '1px solid #BBF7D0', fontWeight: 900}} />
                ))}
              </Box>

              <Box sx={{display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.85}}>
                {selectedCavityEntry.checkedCavities.map((cavity) => {
                  const isSelected = selectedMoldCavity?.cavity === cavity.cavity;
                  const resultColor = cavity.result === 'Pass' ? '#15803D' : '#B42318';
                  const resultBg = cavity.result === 'Pass' ? '#F0FDF4' : '#FEF2F2';
                  const resultBorder = cavity.result === 'Pass' ? '#BBF7D0' : '#FECACA';

                  return (
                    <Chip
                      key={`${selectedCavityEntry.occurrenceId}-${cavity.cavity}`}
                      label={`${cavity.cavity}: ${cavity.result}`}
                      size="small"
                      clickable
                      onClick={() => setSelectedMoldCavity({occurrenceId: selectedCavityEntry.occurrenceId, cavity: cavity.cavity})}
                      sx={{
                        height: 23,
                        bgcolor: isSelected ? resultColor : resultBg,
                        color: isSelected ? '#FFFFFF' : resultColor,
                        border: `1px solid ${isSelected ? resultColor : resultBorder}`,
                        fontWeight: 800,
                        boxShadow: isSelected ? '0 0 0 2px rgba(37,99,235,0.14)' : 'none',
                        '&:hover': {bgcolor: isSelected ? resultColor : '#FFFFFF'},
                      }}
                    />
                  );
                })}
              </Box>

              <Typography variant="caption" sx={{color: mutedText, display: 'block', mt: 0.9, fontWeight: 700}}>
                Comments / attachments: {selectedCavityEntry.commentsOrAttachments}
              </Typography>
            </Paper>
          ) : null}
          <MoldCavityCheckMapPanel
            entry={selectedCavityEntry}
            selectedCavity={selectedMoldCavity?.cavity ?? null}
            selectedResult={selectedCavityResult?.result ?? null}
            history={selectedCavityHistory}
            onSelectCavity={(cavity) => {
              if (!selectedCavityEntry) return;
              setSelectedMoldCavity({occurrenceId: selectedCavityEntry.occurrenceId, cavity});
            }}
            inDialog
          />
        </DialogContent>
        <DialogActions sx={{px: 3, pb: 2}}>
          <Button onClick={() => setIsCavityMapDialogOpen(false)} sx={{textTransform: 'none', fontWeight: 900, color: mutedText}}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isMoldingDialogOpen} onClose={() => setIsMoldingDialogOpen(false)} fullWidth maxWidth="md">
        <DialogTitle sx={{fontWeight: 900, color: pageText}}>Add Molding Occurrence</DialogTitle>
        <DialogContent sx={{display: 'grid', gap: 1.4, pt: '12px !important'}}>
          <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', md: 'repeat(2, minmax(0, 1fr))'}, gap: 1.2}}>
            <TextField label="Equipment ID" value={moldingDraft.equipmentId} onChange={(event) => handleMoldingDraftChange('equipmentId', event.target.value)} fullWidth />
            <TextField label="Mold ID" value={moldingDraft.moldId} onChange={(event) => handleMoldingDraftChange('moldId', event.target.value)} fullWidth />
            <TextField label="Product or part number" value={moldingDraft.productPartNumber} onChange={(event) => handleMoldingDraftChange('productPartNumber', event.target.value)} fullWidth />
            <TextField label="Related MR" value={moldingDraft.relatedMr} onChange={(event) => handleMoldingDraftChange('relatedMr', event.target.value)} placeholder="Optional" fullWidth />
            <TextField
              label="Pass/fail outcome"
              select
              value={moldingDraft.passFailOutcome}
              onChange={(event) => handleMoldingDraftChange('passFailOutcome', event.target.value as MoldingOccurrenceDraft['passFailOutcome'])}
              fullWidth
            >
              <MenuItem value="Pass">Pass</MenuItem>
              <MenuItem value="Fail">Fail</MenuItem>
            </TextField>
            <TextField label="Responsible user" value={moldingDraft.responsibleUser} onChange={(event) => handleMoldingDraftChange('responsibleUser', event.target.value)} fullWidth />
            <TextField
              label="Inspection date and time"
              type="datetime-local"
              value={moldingDraft.inspectionDateTime}
              onChange={(event) => handleMoldingDraftChange('inspectionDateTime', event.target.value)}
              InputLabelProps={{shrink: true}}
              fullWidth
            />
          </Box>

          <Paper elevation={0} sx={{border: '1px solid #DDE3EA', borderRadius: 1.8, bgcolor: '#F8FAFC', p: 1.2}}>
            <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap', mb: 1}}>
              <Typography sx={{color: pageText, fontWeight: 900}}>Mold Equipment History</Typography>
              <Chip
                label={`${moldEquipmentHistory.length} equipment`}
                size="small"
                sx={{height: 24, bgcolor: '#FFFFFF', border: '1px solid #D7DDE6', color: pageText, fontWeight: 900}}
              />
            </Box>
            {normalizeMoldId(moldingDraft.moldId) ? (
              moldEquipmentHistory.length ? (
                <Box sx={{display: 'grid', gap: 0.8}}>
                  {moldEquipmentHistory.map((historyEntry) => (
                    <Box
                      key={`${historyEntry.moldId}-${historyEntry.equipmentId}`}
                      sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', sm: 'minmax(0, 1fr) auto'}, gap: 0.8, alignItems: 'center', border: '1px solid #E3E8F1', borderRadius: 1.4, bgcolor: '#FFFFFF', px: 1, py: 0.85}}
                    >
                      <Box sx={{minWidth: 0}}>
                        <Box sx={{display: 'flex', alignItems: 'center', gap: 0.6, flexWrap: 'wrap'}}>
                          <Chip label={historyEntry.equipmentId} size="small" sx={{height: 23, bgcolor: '#EEF4FF', color: blue, border: '1px solid #C7D7FE', fontWeight: 900}} />
                          <Typography sx={{color: pageText, fontWeight: 900}}>{historyEntry.equipmentLabel}</Typography>
                        </Box>
                        <Typography variant="caption" sx={{display: 'block', color: mutedText, fontWeight: 700, mt: 0.25}}>
                          {historyEntry.firstSeen} - {historyEntry.lastSeen} · {historyEntry.status}
                        </Typography>
                      </Box>
                      <Chip label={historyEntry.source} size="small" sx={{height: 24, justifySelf: {xs: 'start', sm: 'end'}, bgcolor: '#FFFFFF', border: '1px solid #D7DDE6', color: mutedText, fontWeight: 900}} />
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography sx={{color: mutedText, fontWeight: 700}}>No equipment history found for {normalizeMoldId(moldingDraft.moldId)}.</Typography>
              )
            ) : (
              <Typography sx={{color: mutedText, fontWeight: 700}}>Enter a Mold ID to view equipment history.</Typography>
            )}
          </Paper>

          <TextField
            label="First piece inspection result"
            value={moldingDraft.firstPieceInspectionResult}
            onChange={(event) => handleMoldingDraftChange('firstPieceInspectionResult', event.target.value)}
            multiline
            minRows={2}
            fullWidth
          />

          <Paper elevation={0} sx={{border: '1px solid #DDE3EA', borderRadius: 1.8, bgcolor: '#F8FAFC', p: 1.2}}>
            <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap', mb: 1}}>
              <Typography sx={{color: pageText, fontWeight: 900}}>New Cavity Check</Typography>
              <Chip label={`${checkedCavityResults.length} checked`} size="small" sx={{height: 24, bgcolor: '#FFFFFF', border: '1px solid #D7DDE6', color: pageText, fontWeight: 900}} />
            </Box>
            <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(3, minmax(0, 1fr))'}, gap: 0.85}}>
              {moldingCavityOptions.map((cavity) => {
                const currentResult = moldingDraft.cavityResults[cavity] ?? 'Not checked';

                return (
                  <Box key={cavity} sx={{display: 'grid', gridTemplateColumns: '52px minmax(0, 1fr)', gap: 0.6, alignItems: 'center', px: 0.8, py: 0.7, border: '1px solid #E3E8F1', borderRadius: 1.4, bgcolor: '#FFFFFF'}}>
                    <Typography sx={{color: pageText, fontWeight: 900}}>C{cavity}</Typography>
                    <Box sx={{display: 'flex', gap: 0.45, flexWrap: 'wrap'}}>
                      {(['Not checked', 'Pass', 'Fail'] as CavityResult[]).map((result) => (
                        <Chip
                          key={`${cavity}-${result}`}
                          label={result === 'Not checked' ? 'N/A' : result}
                          size="small"
                          clickable
                          onClick={() => handleCavityResultChange(cavity, result)}
                          sx={{
                            height: 23,
                            bgcolor: currentResult === result ? (result === 'Pass' ? '#16A34A' : result === 'Fail' ? '#DC2626' : '#64748B') : '#F8FAFC',
                            color: currentResult === result ? '#FFFFFF' : pageText,
                            border: '1px solid #D7DDE6',
                            fontWeight: 900,
                            '& .MuiChip-label': {px: 0.85},
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Paper>

          <TextField
            label="Comments or attachments"
            value={moldingDraft.commentsOrAttachments}
            onChange={(event) => handleMoldingDraftChange('commentsOrAttachments', event.target.value)}
            multiline
            minRows={2}
            fullWidth
          />
        </DialogContent>
        <DialogActions sx={{px: 3, pb: 2}}>
          <Button onClick={() => setIsMoldingDialogOpen(false)} sx={{textTransform: 'none', fontWeight: 800, color: mutedText}}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAddMoldingOccurrence}
            disabled={!isMoldingDraftComplete}
            sx={{textTransform: 'none', fontWeight: 900, bgcolor: blue, boxShadow: 'none', '&:hover': {bgcolor: '#1D4ED8', boxShadow: 'none'}}}
          >
            Attach to Logbook
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

function MoldCavityCheckMapPanel({
  entry,
  selectedCavity,
  selectedResult,
  history,
  onSelectCavity,
  inDialog = false,
}: {
  entry: MoldingLogbookEntry | null;
  selectedCavity: string | null;
  selectedResult: Exclude<CavityResult, 'Not checked'> | null;
  history: Array<{entry: MoldingLogbookEntry; result: Exclude<CavityResult, 'Not checked'>}>;
  onSelectCavity: (cavity: string) => void;
  inDialog?: boolean;
}) {
  if (!entry) {
    return (
      <Paper elevation={0} sx={{border: '1px dashed #CBD5E1', borderRadius: 1.8, bgcolor: '#F8FAFC', p: 1.4, minHeight: inDialog ? 320 : 210}}>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.75}}>
          <CavityMapIcon sx={{fontSize: 18, color: blue}} />
          <Typography sx={{color: pageText, fontWeight: 900}}>Cavity check map</Typography>
        </Box>
        <Typography sx={{color: mutedText, fontWeight: 700, lineHeight: 1.45}}>
          Select a Mold Logbook occurrence to view its cavity map. Green cavities passed, red cavities failed, and gray cavities were not checked in that occurrence.
        </Typography>
      </Paper>
    );
  }

  const selectedCavityNumber = selectedCavity ? getCavityNumber(selectedCavity) : null;
  const resultByCavity = new Map(entry.checkedCavities.map((cavity) => [cavity.cavity, cavity.result]));
  const failCount = history.filter((item) => item.result === 'Fail').length;
  const passCount = history.filter((item) => item.result === 'Pass').length;
  const latestRelatedMrs = history.map((item) => item.entry.relatedMr).filter((mr): mr is string => Boolean(mr));

  return (
    <Paper elevation={0} sx={{border: '1px solid #DDE3EA', borderRadius: 1.8, bgcolor: '#F8FAFC', p: 1.25, alignSelf: 'start'}}>
      <Box sx={{display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1, mb: 1}}>
        <Box sx={{minWidth: 0}}>
          <Typography sx={{color: pageText, fontWeight: 900, fontSize: '1.02rem', display: 'flex', alignItems: 'center', gap: 0.65}}>
            <CavityMapIcon sx={{fontSize: 18, color: blue}} />
            Cavity check map
          </Typography>
          <Typography variant="caption" sx={{display: 'block', color: mutedText, fontWeight: 800, mt: 0.15}}>
            {entry.occurrenceId} · {entry.moldId} - {entry.productPartNumber}
          </Typography>
        </Box>
        <Chip label={`${entry.checkedCavities.length} checked`} size="small" sx={{height: 24, bgcolor: '#FFFFFF', border: '1px solid #D7DDE6', color: pageText, fontWeight: 900}} />
      </Box>

      <Box sx={{display: 'flex', alignItems: 'center', gap: 0.65, flexWrap: 'wrap', mb: 1}}>
        <Chip label={`${entry.checkedCavities.filter((cavity) => cavity.result === 'Pass').length} pass`} size="small" sx={{height: 22, bgcolor: '#ECFDF3', color: '#15803D', border: '1px solid #BBF7D0', fontWeight: 900}} />
        <Chip label={`${entry.checkedCavities.filter((cavity) => cavity.result === 'Fail').length} fail`} size="small" sx={{height: 22, bgcolor: '#FFF2F1', color: '#B42318', border: '1px solid #FFCAC4', fontWeight: 900}} />
        <Chip label={`${moldLogbookTotalCavities - entry.checkedCavities.length} not checked`} size="small" sx={{height: 22, bgcolor: '#F1F5F9', color: '#64748B', border: '1px solid #CBD5E1', fontWeight: 900}} />
      </Box>

      <Box
        sx={{
          border: '1px solid #E5E7EB',
          borderRadius: 1.2,
          bgcolor: '#FFFFFF',
          display: 'grid',
          gridTemplateColumns: inDialog ? {xs: '1fr', sm: 'repeat(2, minmax(170px, 1fr))', md: 'repeat(4, minmax(170px, 1fr))'} : {xs: '1fr', sm: 'repeat(2, minmax(150px, 1fr))'},
          gap: 0.75,
          p: 0.85,
          maxHeight: inDialog ? '58vh' : 410,
          overflowY: 'auto',
        }}
      >
        {moldLogbookCavityStations.map((station) => (
          <MoldLogbookCavityCluster
            key={station}
            station={station}
            selectedCavityNumber={selectedCavityNumber}
            resultByCavity={resultByCavity}
            onSelectCavity={onSelectCavity}
          />
        ))}
      </Box>

      <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mt: 1.2, mb: 0.8}}>
        <Box sx={{minWidth: 0}}>
          <Typography sx={{color: pageText, fontWeight: 900}}>
            {selectedCavity ?? 'Cavity'} history
          </Typography>
          <Typography variant="caption" sx={{display: 'block', color: mutedText, fontWeight: 700}}>
            {selectedResult ? `Selected result: ${selectedResult}` : 'No inspection result recorded for this cavity in the selected occurrence.'}
          </Typography>
        </Box>
        <Box sx={{display: 'flex', gap: 0.45, flexWrap: 'wrap', justifyContent: 'flex-end'}}>
          <Chip label={`${passCount} pass`} size="small" sx={{height: 22, bgcolor: '#ECFDF3', color: '#15803D', border: '1px solid #BBF7D0', fontWeight: 900}} />
          <Chip label={`${failCount} fail`} size="small" sx={{height: 22, bgcolor: '#FFF2F1', color: '#B42318', border: '1px solid #FFCAC4', fontWeight: 900}} />
        </Box>
      </Box>

      {history.length ? (
        <Box sx={{display: 'grid', gap: 0.75}}>
          {history.map((item) => (
            <Box key={`${item.entry.occurrenceId}-${selectedCavity}`} sx={{display: 'grid', gridTemplateColumns: 'auto minmax(0, 1fr)', gap: 0.8, alignItems: 'start'}}>
              <StatusDot color={item.result === 'Pass' ? '#16A34A' : '#DC2626'} />
              <Box sx={{minWidth: 0, borderBottom: '1px solid #E3E8F1', pb: 0.75}}>
                <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 0.7}}>
                  <Typography sx={{color: pageText, fontWeight: 900}}>{item.entry.occurrenceId}</Typography>
                  <Typography variant="caption" sx={{color: item.result === 'Pass' ? '#15803D' : '#B42318', fontWeight: 900}}>
                    {item.result}
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{display: 'block', color: mutedText, fontWeight: 700}}>
                  {item.entry.inspectionDateTime} · {item.entry.responsibleUser}
                </Typography>
                <Typography variant="caption" sx={{display: 'block', color: mutedText, fontWeight: 700}}>
                  {item.entry.firstPieceInspectionResult}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      ) : (
        <Typography sx={{color: mutedText, fontWeight: 700, border: '1px dashed #CBD5E1', borderRadius: 1.3, bgcolor: '#FFFFFF', px: 1, py: 0.85}}>
          No historical checks found for {selectedCavity}.
        </Typography>
      )}

      {latestRelatedMrs.length ? (
        <Box sx={{display: 'flex', gap: 0.45, flexWrap: 'wrap', mt: 1}}>
          {latestRelatedMrs.map((mr) => (
            <Chip key={mr} label={mr} size="small" sx={{height: 23, bgcolor: '#FFF7ED', color: '#C2410C', border: '1px solid #FED7AA', fontWeight: 900}} />
          ))}
        </Box>
      ) : null}
    </Paper>
  );
}

function MoldLogbookCavityCluster({
  station,
  selectedCavityNumber,
  resultByCavity,
  onSelectCavity,
}: {
  station: number;
  selectedCavityNumber: number | null;
  resultByCavity: Map<string, Exclude<CavityResult, 'Not checked'>>;
  onSelectCavity: (cavity: string) => void;
}) {
  const positionAreas: Record<number, string> = {
    1: 'top',
    2: 'upperRight',
    3: 'lowerRight',
    4: 'bottom',
    5: 'lowerLeft',
    6: 'upperLeft',
  };

  return (
    <Box sx={{border: '1px solid #DDE5EF', borderRadius: 1.2, bgcolor: '#F8FAFC', p: 0.5, display: 'grid', placeItems: 'center', minHeight: 118}}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '34px 42px 34px',
          gridTemplateRows: '32px 36px 32px',
          gridTemplateAreas: `
            ". top ."
            "upperLeft center upperRight"
            "lowerLeft bottom lowerRight"
          `,
          gap: 0.45,
          alignItems: 'center',
          justifyItems: 'center',
        }}
      >
        {moldLogbookCavityPositions.map((position) => {
          const cavityNumber = (station - 1) * moldLogbookCavityPositions.length + position;
          const cavity = `C${cavityNumber}`;
          const result = resultByCavity.get(cavity);
          const isActive = selectedCavityNumber === cavityNumber;
          const tone =
            result === 'Pass'
              ? {bg: '#DCFCE7', border: '#86EFAC', text: '#15803D', solid: '#16A34A'}
              : result === 'Fail'
                ? {bg: '#FEE2E2', border: '#FCA5A5', text: '#B42318', solid: '#DC2626'}
                : {bg: '#F1F5F9', border: '#CBD5E1', text: '#64748B', solid: '#64748B'};

          return (
            <Tooltip key={`${station}-${position}`} title={`${cavity}: ${result ?? 'Not checked'}`} arrow>
              <Button
                onClick={() => onSelectCavity(cavity)}
                aria-label={`Position P${cavityNumber}, cavity ${cavityNumber}, status ${result ?? 'Not checked'}`}
                sx={{
                  minWidth: 0,
                  width: 34,
                  height: 32,
                  gridArea: positionAreas[position],
                  borderRadius: '50%',
                  bgcolor: isActive ? tone.solid : tone.bg,
                  border: `2px solid ${isActive ? '#1D4ED8' : tone.border}`,
                  color: isActive ? '#FFFFFF' : tone.text,
                  display: 'grid',
                  placeItems: 'center',
                  textAlign: 'center',
                  lineHeight: 1,
                  fontSize: 8,
                  fontWeight: 950,
                  p: 0,
                  boxShadow: isActive ? '0 0 0 3px rgba(37, 99, 235, 0.2)' : 'none',
                  textTransform: 'none',
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: isActive ? tone.solid : result === 'Pass' ? '#BBF7D0' : result === 'Fail' ? '#FECACA' : '#FFFFFF',
                    borderColor: '#1D4ED8',
                    boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.16)',
                  },
                  '&:focus-visible': {boxShadow: '0 0 0 4px rgba(37, 99, 235, 0.28)', borderColor: '#1D4ED8'},
                  '& .MuiTouchRipple-root': {borderRadius: '50%'},
                }}
              >
                <Box>
                  <Box>P{cavityNumber}</Box>
                  <Box>[{cavityNumber}]</Box>
                </Box>
              </Button>
            </Tooltip>
          );
        })}
        <Box sx={{gridArea: 'center', width: 40, height: 40, borderRadius: 1, bgcolor: '#FFFFFF', border: '1px solid #CBD5E1', color: '#0F172A', fontSize: 15, fontWeight: 950, display: 'grid', placeItems: 'center'}}>
          {station}
        </Box>
      </Box>
    </Box>
  );
}

function MoldLogbookSection({asset}: {asset: HierarchyItem}) {
  const [occurrences, setOccurrences] = useState<MoldLogbookOccurrence[]>(initialMoldingLogbookEntries);
  const [activeOccurrence, setActiveOccurrence] = useState<MoldLogbookOccurrence | null>(null);
  const [modalMode, setModalMode] = useState<MoldingOccurrenceModalMode>('create');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const linkedMrs = occurrences.filter((entry) => entry.relatedMr).length;
  const attachedForms = occurrences.reduce((total, entry) => total + entry.attachedForms.length, 0);

  const handleOpenCreate = () => {
    setModalMode('create');
    setActiveOccurrence(null);
    setIsModalOpen(true);
  };

  const handleOpenExisting = (occurrence: MoldLogbookOccurrence) => {
    setModalMode('edit');
    setActiveOccurrence(occurrence);
    setIsModalOpen(true);
  };

  const handleSaveOccurrence = (formData: FirstCheckFormData) => {
    const savedOccurrence = buildOccurrenceFromForm(formData, activeOccurrence, asset);

    setOccurrences((current) => {
      if (modalMode === 'edit' && activeOccurrence) {
        return current.map((entry) => (entry.occurrenceId === activeOccurrence.occurrenceId ? savedOccurrence : entry));
      }

      return [savedOccurrence, ...current];
    });

    setActiveOccurrence(null);
    setIsModalOpen(false);
  };

  return (
    <>
      <SectionCard
        title="Mold Logbook"
        icon={DocumentIcon}
        action={
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={handleOpenCreate}
            sx={{height: 32, bgcolor: blue, boxShadow: 'none', textTransform: 'none', fontWeight: 900, '&:hover': {bgcolor: '#1D4ED8', boxShadow: 'none'}}}
          >
            Add Molding Occurrence
          </Button>
        }
      >
        <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', lg: '280px minmax(0, 1fr)'}, gap: 1.4}}>
          <Paper elevation={0} sx={{border: '1px solid #DDE3EA', borderRadius: 1.8, bgcolor: '#F8FAFC', p: 1.4}}>
            <Typography sx={{color: mutedText, fontWeight: 800, fontSize: '0.76rem', textTransform: 'uppercase'}}>Logbook scope</Typography>
            <Typography sx={{color: pageText, fontWeight: 900, fontSize: '1.35rem', mt: 0.6}}>{asset.code}</Typography>
            <Typography sx={{color: mutedText, fontWeight: 700, mt: 0.25}}>{asset.label}</Typography>
            <Divider sx={{my: 1.25}} />
            {[
              ['Equipment', asset.label],
              ['Machine #', asset.code],
              ['Mold #', occurrences[0]?.moldId ?? '-'],
              ['Total occurrences', String(occurrences.length)],
              ['Attached forms', String(attachedForms)],
              ['Linked MRs', String(linkedMrs)],
            ].map(([label, value]) => (
              <Box key={label} sx={{display: 'flex', justifyContent: 'space-between', gap: 1, py: 0.35}}>
                <Typography sx={{color: mutedText, fontWeight: 750}}>{label}</Typography>
                <Typography sx={{color: pageText, fontWeight: 900, textAlign: 'right'}}>{value}</Typography>
              </Box>
            ))}
          </Paper>

          <Box sx={{display: 'grid', gap: 0.9}}>
            {occurrences.map((entry) => (
              <MoldLogbookOccurrenceCard key={entry.occurrenceId} occurrence={entry} onOpen={() => handleOpenExisting(entry)} />
            ))}
          </Box>
        </Box>
      </SectionCard>

      <MoldingOccurrenceModal
        open={isModalOpen}
        mode={modalMode}
        asset={asset}
        occurrence={activeOccurrence}
        occurrences={occurrences}
        onClose={() => {
          setActiveOccurrence(null);
          setIsModalOpen(false);
        }}
        onSave={handleSaveOccurrence}
      />
    </>
  );
}

function MoldLogbookOccurrenceCard({occurrence, onOpen}: {occurrence: MoldLogbookOccurrence; onOpen: () => void}) {
  const statusTone = cavityStatusColors[occurrence.status];

  return (
    <Paper
      elevation={0}
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onOpen();
        }
      }}
      sx={{
        border: '1px solid #E3E8F1',
        borderRadius: 1.8,
        px: 1.25,
        py: 1.1,
        bgcolor: '#FFFFFF',
        cursor: 'pointer',
        '&:hover': {borderColor: '#B8CAFF', bgcolor: '#F8FAFF'},
        '&:focus-visible': {outline: `2px solid ${blue}`, outlineOffset: 2},
      }}
    >
      <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', md: 'minmax(0, 1fr) auto'}, gap: 1, alignItems: 'start'}}>
        <Box sx={{minWidth: 0}}>
          <Box sx={{display: 'flex', alignItems: 'center', gap: 0.6, flexWrap: 'wrap', mb: 0.55}}>
            <Chip label={occurrence.occurrenceId} size="small" sx={{height: 22, bgcolor: '#F8FAFC', border: '1px solid #D7DDE6', color: pageText, fontWeight: 900}} />
            <Chip label={occurrence.status} size="small" sx={{height: 22, bgcolor: statusTone.bg, color: statusTone.text, border: `1px solid ${statusTone.border}`, fontWeight: 900}} />
            <Typography variant="caption" sx={{color: mutedText, fontWeight: 850}}>{occurrence.dateTime}</Typography>
          </Box>
          <Typography sx={{color: pageText, fontWeight: 900, lineHeight: 1.25}}>{occurrence.title}</Typography>
          <Typography variant="caption" sx={{display: 'block', color: mutedText, fontWeight: 750, mt: 0.35}}>
            {occurrence.machineNumber} · {occurrence.moldId} · Updated by {occurrence.updatedBy}
          </Typography>
        </Box>
        <Box sx={{display: 'flex', gap: 0.5, flexWrap: 'wrap', justifyContent: {xs: 'flex-start', md: 'flex-end'}, maxWidth: 420}}>
          <Chip label={`Cavities ${formatCavityList(occurrence.affectedCavities)}`} size="small" sx={{height: 24, bgcolor: '#EEF4FF', color: blue, border: '1px solid #C7D7FE', fontWeight: 900}} />
          <Chip label={`${occurrence.attachments.length} attachments`} size="small" sx={{height: 24, bgcolor: '#F8FAFC', color: pageText, border: '1px solid #D7DDE6', fontWeight: 900}} />
          {occurrence.relatedMr ? <Chip label={occurrence.relatedMr} size="small" sx={{height: 24, bgcolor: '#FFF7ED', color: '#C2410C', border: '1px solid #FED7AA', fontWeight: 900}} /> : null}
        </Box>
      </Box>
    </Paper>
  );
}

function MoldingOccurrenceModal({
  open,
  mode,
  asset,
  occurrence,
  occurrences,
  onClose,
  onSave,
}: {
  open: boolean;
  mode: MoldingOccurrenceModalMode;
  asset: HierarchyItem;
  occurrence: MoldLogbookOccurrence | null;
  occurrences: MoldLogbookOccurrence[];
  onClose: () => void;
  onSave: (formData: FirstCheckFormData) => void;
}) {
  const [formData, setFormData] = useState<FirstCheckFormData>(() => occurrence?.formData ?? createFirstCheckFormData({machineNumber: asset.code, moldNumber: occurrence?.moldId ?? 'MOLD-FH-12'}));
  const [activeCavity, setActiveCavity] = useState<number | null>(occurrence?.affectedCavities[0] ?? null);
  const [dirty, setDirty] = useState(false);
  const validation = validateFirstCheck(formData);
  const statusTone = cavityStatusColors[formData.overallStatus];

  useEffect(() => {
    if (!open) return;
    setDirty(false);
    setFormData(occurrence?.formData ?? createFirstCheckFormData({machineNumber: asset.code, moldNumber: occurrence?.moldId ?? 'MOLD-FH-12'}));
    setActiveCavity(occurrence?.affectedCavities[0] ?? null);
  }, [asset.code, occurrence, open]);

  const updateForm = (updates: Partial<FirstCheckFormData>) => {
    setDirty(true);
    setFormData((current) => syncCavityDetails({...current, ...updates}));
  };

  const handleToggleCavity = (cavityNumber: number) => {
    setActiveCavity(cavityNumber);
    updateForm({
      affectedCavities: formData.affectedCavities.includes(cavityNumber)
        ? formData.affectedCavities.filter((item) => item !== cavityNumber)
        : [...formData.affectedCavities, cavityNumber].sort((a, b) => a - b),
    });
  };

  const handleClose = () => {
    if (dirty && !window.confirm('Discard unsaved molding occurrence changes?')) return;
    onClose();
  };

  const handleSave = () => {
    onSave(syncCavityDetails(formData));
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="xl"
      PaperProps={{sx: {height: {xs: 'calc(100dvh - 16px)', md: '88vh'}, m: {xs: 1, md: 2}, borderRadius: 2, overflow: 'hidden', display: 'flex'}}}
    >
      <DialogTitle sx={{px: 2, py: 1.4, borderBottom: '1px solid #E5EAF2'}}>
        <Box sx={{display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.5}}>
          <Box sx={{minWidth: 0}}>
            <Box sx={{display: 'flex', alignItems: 'center', gap: 0.65, flexWrap: 'wrap'}}>
              <Typography sx={{color: pageText, fontWeight: 950, fontSize: '1.1rem'}}>Molding Occurrence</Typography>
              <Chip label={formData.overallStatus} size="small" sx={{height: 24, bgcolor: statusTone.bg, color: statusTone.text, border: `1px solid ${statusTone.border}`, fontWeight: 900}} />
              <Chip label={mode === 'create' ? 'New' : occurrence?.occurrenceId ?? 'Edit'} size="small" sx={{height: 24, bgcolor: '#F8FAFC', color: pageText, border: '1px solid #D7DDE6', fontWeight: 900}} />
            </Box>
            <Typography variant="caption" sx={{display: 'block', color: mutedText, fontWeight: 800, mt: 0.35}}>
              Equipment {asset.code} · Machine {formData.machineNumber || '-'} · Mold {formData.moldNumber || '-'}
            </Typography>
          </Box>
          <IconButton aria-label="Close molding occurrence" onClick={handleClose} size="small" sx={{color: '#64748B'}}>
            <CloseIcon sx={{fontSize: 20}} />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{p: 0, bgcolor: '#F8FAFC', flex: 1, minHeight: 0, overflow: 'auto'}}>
        <CavityMapStep
          formData={formData}
          occurrences={occurrences}
          activeCavity={activeCavity}
          onActiveCavityChange={setActiveCavity}
          onToggleCavity={handleToggleCavity}
          onClearSelection={() => updateForm({affectedCavities: []})}
          onUpdateCavityDetail={(cavityNumber, updates) =>
            updateForm({
              cavityDetails: {
                ...formData.cavityDetails,
                [cavityNumber]: {...formData.cavityDetails[cavityNumber], ...updates},
              },
            })
          }
        />
      </DialogContent>

      <DialogActions sx={{px: 2, py: 1.3, borderTop: '1px solid #E5EAF2', bgcolor: '#FFFFFF', gap: 0.75, flexWrap: 'wrap'}}>
        <Button onClick={handleClose} sx={{textTransform: 'none', fontWeight: 900, color: mutedText}}>Cancel</Button>
        <Button variant="outlined" onClick={handleSave} sx={{textTransform: 'none', fontWeight: 900, borderColor: '#CBD5E1', color: pageText}}>Save Draft</Button>
        <Button variant="contained" disabled={!validation.isValid} onClick={handleSave} sx={{textTransform: 'none', fontWeight: 900, bgcolor: blue, boxShadow: 'none', '&:hover': {bgcolor: '#1D4ED8', boxShadow: 'none'}}}>Save Occurrence</Button>
      </DialogActions>
    </Dialog>
  );
}

function CavityMapStep({
  formData,
  occurrences,
  activeCavity,
  onActiveCavityChange,
  onToggleCavity,
  onClearSelection,
  onUpdateCavityDetail,
}: {
  formData: FirstCheckFormData;
  occurrences: MoldLogbookOccurrence[];
  activeCavity: number | null;
  onActiveCavityChange: (cavity: number) => void;
  onToggleCavity: (cavity: number) => void;
  onClearSelection: () => void;
  onUpdateCavityDetail: (cavityNumber: number, updates: Partial<CavityDetailRow>) => void;
}) {
  const cavityStatuses = getCavityStatuses(formData);
  const counts = getCavityStatusCounts(cavityStatuses);

  return (
    <Box sx={{p: 2, display: 'grid', gridTemplateColumns: {xs: '1fr', lg: 'minmax(0, 1fr) 360px'}, gap: 1.4, alignItems: 'start'}}>
      <Paper elevation={0} sx={{border: '1px solid #DDE3EA', borderRadius: 1.6, bgcolor: '#FFFFFF', p: 1.2, minWidth: 0}}>
        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap', mb: 1}}>
          <Box>
            <Typography sx={{fontWeight: 950, color: pageText, display: 'flex', alignItems: 'center', gap: 0.65}}>
              <CavityMapIcon sx={{fontSize: 18, color: blue}} />
              Cavity Map
            </Typography>
            <Typography variant="caption" sx={{color: mutedText, fontWeight: 800}}>Pxx = Position Number · [ ] = Current Cavity Number</Typography>
          </Box>
          <Button variant="outlined" size="small" disabled={!formData.affectedCavities.length} onClick={onClearSelection} sx={{height: 30, textTransform: 'none', fontWeight: 900, borderColor: '#CBD5E1', color: pageText}}>Clear Selection</Button>
        </Box>
        <CavityStatusSummaryV2 counts={counts} />
        <Box sx={{mt: 1.1, border: '1px solid #E5E7EB', borderRadius: 1.2, bgcolor: '#F8FAFC', display: 'grid', gridTemplateColumns: {xs: '1fr', sm: 'repeat(2, minmax(216px, 1fr))', xl: 'repeat(4, minmax(216px, 1fr))'}, gap: 1, p: 1, maxHeight: {xs: 'none', lg: '58vh'}, overflowY: 'auto'}}>
          {moldLogbookCavityStations.map((station) => (
            <CavityMapCluster
              key={station}
              station={station}
              selectedCavities={formData.affectedCavities}
              activeCavity={activeCavity}
              cavityStatuses={cavityStatuses}
              onActivate={onActiveCavityChange}
              onToggle={onToggleCavity}
            />
          ))}
        </Box>
      </Paper>
      <CavityHistoryPanel
        cavityNumber={activeCavity}
        formData={formData}
        occurrences={occurrences}
        onUpdateCavityDetail={onUpdateCavityDetail}
      />
    </Box>
  );
}

function CavityMapCluster({
  station,
  selectedCavities,
  activeCavity,
  cavityStatuses,
  onActivate,
  onToggle,
}: {
  station: number;
  selectedCavities: number[];
  activeCavity: number | null;
  cavityStatuses: Record<number, CavityStatus>;
  onActivate: (cavity: number) => void;
  onToggle: (cavity: number) => void;
}) {
  const positionAreas: Record<number, string> = {1: 'top', 2: 'upperRight', 3: 'lowerRight', 4: 'bottom', 5: 'lowerLeft', 6: 'upperLeft'};

  return (
    <Box sx={{border: '1px solid #DDE5EF', borderRadius: 1.2, bgcolor: '#FFFFFF', p: 0.55, display: 'grid', placeItems: 'center', minHeight: 142}}>
      <Box sx={{display: 'grid', gridTemplateColumns: '44px 52px 44px', gridTemplateRows: '40px 42px 40px', gridTemplateAreas: `". top ." "upperLeft center upperRight" "lowerLeft bottom lowerRight"`, gap: 0.7, alignItems: 'center', justifyItems: 'center'}}>
        {moldLogbookCavityPositions.map((position) => {
          const cavityNumber = (station - 1) * moldLogbookCavityPositions.length + position;
          const isSelected = selectedCavities.includes(cavityNumber);
          const isActive = activeCavity === cavityNumber;
          const status = cavityStatuses[cavityNumber] ?? 'OK';
          const statusColor = cavityStatusColors[status];

          return (
            <Tooltip key={`${station}-${position}`} title={`P${cavityNumber} · C${cavityNumber} · ${status}${isSelected ? ' · selected' : ''}`} arrow>
              <Button
                onClick={() => {
                  onActivate(cavityNumber);
                  onToggle(cavityNumber);
                }}
                aria-label={`Position P${cavityNumber}, current cavity ${cavityNumber}, status ${status}${isSelected ? ', selected as affected' : ''}`}
                aria-pressed={isSelected}
                sx={{
                  minWidth: 0,
                  width: 44,
                  height: 40,
                  gridArea: positionAreas[position],
                  borderRadius: '50%',
                  bgcolor: isActive ? statusColor.solid : statusColor.bg,
                  border: `2px solid ${isActive ? '#1D4ED8' : isSelected ? statusColor.solid : statusColor.border}`,
                  color: isActive ? '#FFFFFF' : statusColor.text,
                  display: 'grid',
                  placeItems: 'center',
                  textAlign: 'center',
                  lineHeight: 1,
                  fontSize: 9.5,
                  fontWeight: 900,
                  p: 0,
                  boxShadow: isActive || isSelected ? '0 0 0 3px rgba(37, 99, 235, 0.18)' : 'none',
                  textTransform: 'none',
                  '&:hover': {bgcolor: isActive ? statusColor.solid : statusColor.bg, borderColor: '#1D4ED8'},
                  '&:focus-visible': {boxShadow: '0 0 0 4px rgba(37, 99, 235, 0.28)', borderColor: '#1D4ED8'},
                  '& .MuiTouchRipple-root': {borderRadius: '50%'},
                }}
              >
                <Box>
                  <Box>P{cavityNumber}</Box>
                  <Box>[{cavityNumber}]</Box>
                </Box>
              </Button>
            </Tooltip>
          );
        })}
        <Box sx={{gridArea: 'center', width: 50, height: 50, borderRadius: 1.1, bgcolor: '#F1F5F9', border: '1px solid #CBD5E1', color: '#0F172A', fontSize: 18, fontWeight: 950, display: 'grid', placeItems: 'center'}}>{station}</Box>
      </Box>
    </Box>
  );
}

function CavityHistoryPanel({cavityNumber, formData, occurrences, onUpdateCavityDetail}: {cavityNumber: number | null; formData: FirstCheckFormData; occurrences: MoldLogbookOccurrence[]; onUpdateCavityDetail: (cavityNumber: number, updates: Partial<CavityDetailRow>) => void}) {
  if (!cavityNumber) {
    return (
      <Paper elevation={0} sx={{border: '1px dashed #CBD5E1', borderRadius: 1.6, bgcolor: '#FFFFFF', p: 1.4}}>
        <Typography sx={{color: pageText, fontWeight: 900}}>Cavity history</Typography>
        <Typography sx={{color: mutedText, fontWeight: 750, mt: 0.4}}>Select a cavity to view its status and event timeline.</Typography>
      </Paper>
    );
  }

  const detail = formData.cavityDetails[cavityNumber] ?? {cavityNumber, positionNumber: cavityNumber, issue: '', actionTaken: '', status: 'OK' as CavityStatus, attachments: '', notes: ''};
  const history = buildCavityHistory(cavityNumber, occurrences);
  const tone = cavityStatusColors[detail.status];

  return (
    <Paper elevation={0} sx={{border: '1px solid #DDE3EA', borderRadius: 1.6, bgcolor: '#FFFFFF', p: 1.2, display: 'grid', gap: 1}}>
      <Box>
        <Typography sx={{fontWeight: 950, color: pageText}}>Cavity C{cavityNumber}</Typography>
        <Typography variant="caption" sx={{color: mutedText, fontWeight: 800}}>Position P{cavityNumber} · Last update {history[0]?.dateTime ?? 'Current draft'}</Typography>
      </Box>
      <Chip label={`Current status: ${detail.status}`} sx={{justifySelf: 'start', height: 26, bgcolor: tone.bg, color: tone.text, border: `1px solid ${tone.border}`, fontWeight: 900}} />
      <Box sx={{display: 'grid', gap: 0.8}}>
        <TextField size="small" label="Issue / Defect" value={detail.issue} onChange={(event) => onUpdateCavityDetail(cavityNumber, {issue: event.target.value})} />
        <TextField size="small" label="Action taken" value={detail.actionTaken} onChange={(event) => onUpdateCavityDetail(cavityNumber, {actionTaken: event.target.value})} />
        <TextField size="small" label="Status" select value={detail.status} onChange={(event) => onUpdateCavityDetail(cavityNumber, {status: event.target.value as CavityStatus})}>
          {(['OK', 'Watch', 'NG', 'Blocked'] as CavityStatus[]).map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
        </TextField>
        <TextField size="small" label="Attachments" value={detail.attachments} onChange={(event) => onUpdateCavityDetail(cavityNumber, {attachments: event.target.value})} placeholder="File names or upload references" />
        <TextField size="small" label="Notes" multiline minRows={2} value={detail.notes} onChange={(event) => onUpdateCavityDetail(cavityNumber, {notes: event.target.value})} />
      </Box>
      <Divider />
      <Typography sx={{fontWeight: 900, color: pageText}}>Previous events</Typography>
      <Box sx={{display: 'grid', gap: 0.75, maxHeight: 360, overflowY: 'auto', pr: 0.5}}>
        {history.length ? history.map((event) => {
          const eventTone = cavityStatusColors[event.status];
          return (
            <Box key={event.id} sx={{border: '1px solid #E3E8F1', borderRadius: 1.2, bgcolor: '#F8FAFC', p: 0.9}}>
              <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 0.7}}>
                <Typography sx={{fontWeight: 900, color: pageText}}>{event.occurrenceId}</Typography>
                <Chip label={event.status} size="small" sx={{height: 22, bgcolor: eventTone.bg, color: eventTone.text, border: `1px solid ${eventTone.border}`, fontWeight: 900}} />
              </Box>
              <Typography variant="caption" sx={{display: 'block', color: mutedText, fontWeight: 800}}>{event.dateTime} · {event.updatedBy}</Typography>
              <Typography variant="caption" sx={{display: 'block', color: pageText, fontWeight: 850, mt: 0.45}}>{event.defectType} · {event.actionTaken}</Typography>
              <Typography variant="caption" sx={{display: 'block', color: mutedText, mt: 0.2}}>{event.observation}</Typography>
              {event.attachments?.length ? <Typography variant="caption" sx={{display: 'block', color: blue, fontWeight: 850, mt: 0.35}}>{event.attachments.length} attachments</Typography> : null}
            </Box>
          );
        }) : (
          <Typography sx={{color: mutedText, fontWeight: 750, border: '1px dashed #CBD5E1', borderRadius: 1.2, p: 1}}>No prior events found for C{cavityNumber}.</Typography>
        )}
      </Box>
    </Paper>
  );
}

function CavityStatusSummaryV2({counts}: {counts: Record<CavityStatus, number>}) {
  return (
    <Box sx={{display: 'flex', alignItems: 'center', gap: 0.7, flexWrap: 'wrap'}}>
      {(['OK', 'NG', 'Blocked', 'Watch'] as CavityStatus[]).map((status) => {
        const tone = cavityStatusColors[status];
        return (
          <Box key={status} sx={{display: 'flex', alignItems: 'center', gap: 0.5, px: 0.8, py: 0.35, borderRadius: 1, bgcolor: tone.bg, border: `1px solid ${tone.border}`}}>
            <StatusDot color={tone.solid} />
            <Typography sx={{fontSize: 11.5, fontWeight: 900, color: tone.text}}>{status}: {counts[status]}</Typography>
          </Box>
        );
      })}
    </Box>
  );
}

function buildOccurrenceFromForm(formData: FirstCheckFormData, existing: MoldLogbookOccurrence | null, asset: HierarchyItem): MoldLogbookOccurrence {
  const syncedForm = syncCavityDetails(formData);
  const attachments = syncedForm.attachments.split(',').map((item) => item.trim()).filter(Boolean);
  const title = syncedForm.description.trim() || `${syncedForm.defectType} recorded on ${syncedForm.moldNumber || 'mold'}`;

  return {
    occurrenceId: existing?.occurrenceId ?? `MO-2026-${String(Date.now()).slice(-4)}`,
    equipmentId: asset.code,
    moldId: syncedForm.moldNumber || 'MOLD-FH-12',
    machineNumber: syncedForm.machineNumber || asset.code,
    title,
    status: syncedForm.overallStatus,
    affectedCavities: syncedForm.affectedCavities,
    updatedBy: syncedForm.inspector || 'Unknown inspector',
    dateTime: formatInspectionDateTime(syncedForm.dateTime),
    defectType: syncedForm.defectType,
    actionTaken: syncedForm.immediateAction,
    observation: syncedForm.description,
    partNumber: syncedForm.partNumber,
    material: syncedForm.material,
    lotBatch: syncedForm.lotBatch,
    disposition: syncedForm.disposition,
    relatedMr: syncedForm.workOrder.startsWith('MR-') ? syncedForm.workOrder : existing?.relatedMr,
    attachedForms: existing?.attachedForms ?? ['First Piece', 'New Cavity Check'],
    attachments,
    formData: syncedForm,
  };
}

function syncCavityDetails(formData: FirstCheckFormData): FirstCheckFormData {
  const nextDetails = {...formData.cavityDetails};
  formData.affectedCavities.forEach((cavityNumber) => {
    if (!nextDetails[cavityNumber]) {
      nextDetails[cavityNumber] = {
        cavityNumber,
        positionNumber: cavityNumber,
        issue: formData.defectType,
        actionTaken: formData.immediateAction,
        status: formData.overallStatus === 'OK' ? 'Watch' : formData.overallStatus,
        attachments: '',
        notes: '',
      };
    }
  });

  Object.keys(nextDetails).forEach((key) => {
    if (!formData.affectedCavities.includes(Number(key))) {
      delete nextDetails[Number(key)];
    }
  });

  return {...formData, cavityDetails: nextDetails};
}

function validateFirstCheck(formData: FirstCheckFormData) {
  const errors: string[] = [];

  if (!formData.dateTime) errors.push('Date/time is required.');
  if (!formData.inspector.trim()) errors.push('Inspector is required.');
  if (!formData.overallStatus) errors.push('Overall status is required.');
  if (formData.overallStatus !== 'OK' && formData.affectedCavities.length === 0 && !formData.description.trim()) {
    errors.push('Watch, NG, or Blocked status requires at least one affected cavity or a justification.');
  }
  if (formData.affectedCavities.length > 0 && !formData.description.trim() && !formData.immediateAction.trim()) {
    errors.push('Selected affected cavities require a description or action taken.');
  }

  return {isValid: errors.length === 0, errors};
}

function getCavityStatuses(formData: FirstCheckFormData): Record<number, CavityStatus> {
  return Object.fromEntries(
    moldLogbookCavities.map((cavity) => {
      const detailStatus = formData.cavityDetails[cavity.cavityNumber]?.status;
      return [cavity.cavityNumber, detailStatus ?? cavity.status];
    })
  );
}

function getCavityStatusCounts(statuses: Record<number, CavityStatus>) {
  return Object.values(statuses).reduce<Record<CavityStatus, number>>(
    (counts, status) => {
      counts[status] += 1;
      return counts;
    },
    {OK: 0, NG: 0, Blocked: 0, Watch: 0}
  );
}

function buildCavityHistory(cavityNumber: number, occurrences: MoldLogbookOccurrence[]): CavityHistoryEvent[] {
  return occurrences
    .filter((entry) => entry.affectedCavities.includes(cavityNumber))
    .map((entry) => {
      const cavityDetail = entry.formData.cavityDetails[cavityNumber];
      const cavityAttachments = cavityDetail?.attachments.split(',').map((item) => item.trim()).filter(Boolean) ?? [];

      return {
        id: `${entry.occurrenceId}-C${cavityNumber}`,
        occurrenceId: entry.occurrenceId,
        dateTime: entry.dateTime,
        status: cavityDetail?.status ?? entry.status,
        defectType: cavityDetail?.issue || entry.defectType,
        actionTaken: cavityDetail?.actionTaken || entry.actionTaken,
        observation: cavityDetail?.notes || entry.observation,
        updatedBy: entry.updatedBy,
        attachments: cavityAttachments.length ? cavityAttachments : entry.attachments,
      };
    });
}

function formatCavityList(cavities: number[]) {
  if (!cavities.length) return 'None';
  if (cavities.length <= 6) return cavities.map((cavity) => `C${cavity}`).join(', ');
  return `${cavities.slice(0, 5).map((cavity) => `C${cavity}`).join(', ')} +${cavities.length - 5}`;
}

function LedgerEventDetailsDialog({event, onClose}: {event: EventItem | null; onClose: () => void}) {
  const sparePartsUsed = event?.sparePartsUsed ?? [];

  return (
    <Dialog open={Boolean(event)} onClose={onClose} fullWidth maxWidth="md">
      {event ? (
        <>
          <DialogTitle sx={{px: 2.4, pt: 2.1, pb: 1.2}}>
            <Box sx={{display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.5}}>
              <Box sx={{minWidth: 0}}>
                <Box sx={{display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap', mb: 0.8}}>
                  <Chip label={event.id} size="small" sx={{height: 23, bgcolor: '#F8FAFC', border: '1px solid #D7DDE6', color: pageText, fontWeight: 900}} />
                  <Chip icon={<PredictiveIcon sx={{fontSize: '13px !important'}} />} label={event.type} size="small" sx={{height: 23, bgcolor: '#F8FAFC', border: '1px solid #D7DDE6', color: pageText, fontWeight: 900}} />
                  <Typography variant="caption" sx={{color: mutedText, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontWeight: 800}}>
                    {event.date} - {event.time}
                  </Typography>
                </Box>
                <Typography variant="h6" sx={{color: pageText, fontWeight: 900, lineHeight: 1.22}}>
                  {event.title}
                </Typography>
              </Box>
              <Typography variant="caption" sx={{color: mutedText, display: 'flex', alignItems: 'center', gap: 0.3, fontWeight: 800, flexShrink: 0, pt: 0.2}}>
                <LockIcon sx={{fontSize: 13}} /> {event.lock}
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent sx={{px: 2.4, py: 1.4, bgcolor: '#F8FAFC', display: 'grid', gap: 1.2}}>
            <Paper elevation={0} sx={{border: '1px solid #DDE3EA', borderRadius: 1.4, p: 1.35, bgcolor: '#FFFFFF'}}>
              <Typography sx={{color: '#4B5563', fontWeight: 700, lineHeight: 1.45}}>{event.body}</Typography>
              <Typography variant="caption" sx={{color: blue, display: 'block', mt: 1, fontWeight: 900}}>
                Impacted level: {event.impactLevel}
              </Typography>
            </Paper>

            {event.keyFacts?.length ? (
              <Paper elevation={0} sx={{border: '1px solid #DDE3EA', borderRadius: 1.4, p: 1.35, bgcolor: '#FFFFFF'}}>
                <Typography variant="subtitle2" sx={{color: pageText, fontWeight: 900, mb: 0.9}}>
                  Key facts
                </Typography>
                <Box sx={{display: 'flex', gap: 0.7, flexWrap: 'wrap'}}>
                  {event.keyFacts.map((fact) => (
                    <Chip key={fact} label={fact} size="small" sx={{height: 25, bgcolor: '#F8FAFC', border: '1px solid #D7DDE6', color: pageText, fontWeight: 800}} />
                  ))}
                </Box>
              </Paper>
            ) : null}

            {sparePartsUsed.length ? (
              <Paper elevation={0} sx={{border: '1px solid #DDE3EA', borderRadius: 1.4, p: 1.35, bgcolor: '#FFFFFF'}}>
                <Typography variant="subtitle2" sx={{color: pageText, fontWeight: 900, mb: 0.9, display: 'flex', alignItems: 'center', gap: 0.7}}>
                  <SparePartsIcon sx={{fontSize: 18, color: blue}} />
                  Spare parts used ({getSparePartsUsedCount(event)})
                </Typography>
                <Box sx={{display: 'grid', gap: 0.75}}>
                  {sparePartsUsed.map((part) => (
                    <Box key={`${part.code}-${part.bin}`} sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', sm: 'minmax(0, 1fr) auto auto'}, gap: 0.8, alignItems: 'center', px: 1, py: 0.8, border: '1px solid #E5EAF2', borderRadius: 1.1, bgcolor: '#FBFCFE'}}>
                      <Box sx={{minWidth: 0}}>
                        <Typography sx={{color: pageText, fontWeight: 900, fontSize: '0.9rem'}}>{part.name}</Typography>
                        <Typography variant="caption" sx={{color: mutedText, fontWeight: 700}}>
                          {part.code} - Bin {part.bin}
                        </Typography>
                      </Box>
                      <Chip label={`${part.qty} ${part.unit}`} size="small" sx={{height: 24, bgcolor: '#EAF0FF', color: blue, border: '1px solid #B8CAFF', fontWeight: 900}} />
                      <Typography variant="caption" sx={{color: '#22A352', fontWeight: 900}}>
                        {part.status}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Paper>
            ) : null}

            <Paper elevation={0} sx={{border: '1px solid #DDE3EA', borderRadius: 1.4, p: 1.35, bgcolor: '#FFFFFF'}}>
              <Typography variant="caption" sx={{color: mutedText, display: 'block', fontWeight: 800}}>
                {event.meta} <Box component="span" sx={{mx: 1, color: '#CBD5E1'}}>-</Box> <Box component="span" sx={{color: '#22A352'}}>Audit OK</Box>
              </Typography>
              {event.note ? (
                <Typography variant="body2" sx={{color: pageText, fontWeight: 700, mt: 1, display: 'flex', alignItems: 'flex-start', gap: 0.7}}>
                  <PredictiveIcon sx={{fontSize: 16, mt: 0.15, color: blue}} /> {event.note}
                </Typography>
              ) : null}
            </Paper>
          </DialogContent>
          <DialogActions sx={{px: 2.4, py: 1.4, borderTop: '1px solid #E5EAF2'}}>
            <Button onClick={onClose} sx={{textTransform: 'none', fontWeight: 900, color: blue}}>
              Close
            </Button>
          </DialogActions>
        </>
      ) : null}
    </Dialog>
  );
}

function TimelineTab({
  activeFilter,
  events,
  selectedHierarchyId,
  selectedEventId,
  onFilterChange,
  onClearHierarchyFilter,
  onSelectEvent,
}: {
  activeFilter: LedgerFilter;
  events: EventItem[];
  selectedHierarchyId: string | null;
  selectedEventId: string | null;
  onFilterChange: (filter: LedgerFilter) => void;
  onClearHierarchyFilter: () => void;
  onSelectEvent: (event: EventItem) => void;
}) {
  const [detailEvent, setDetailEvent] = useState<EventItem | null>(null);
  const [expandedSparePartEventIds, setExpandedSparePartEventIds] = useState<string[]>([]);
  const selectedHierarchy = initialHierarchyItems.find((item) => item.id === selectedHierarchyId);
  const visibleEvents = events.filter((event) => {
    const matchesEventType = activeFilter === 'All' || getEventFilter(event) === activeFilter;
    return matchesEventType && eventMatchesHierarchy(event, selectedHierarchyId);
  });

  const handleOpenEventDetails = (event: EventItem) => {
    onSelectEvent(event);
    setDetailEvent(event);
  };

  const handleToggleSpareParts = (eventId: string) => {
    setExpandedSparePartEventIds((prev) => (prev.includes(eventId) ? prev.filter((id) => id !== eventId) : [...prev, eventId]));
  };

  return (
    <Box sx={{borderTop: '1px solid #EEF2F7', px: 2, py: 1.6}}>
      <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, flexWrap: 'wrap', mb: 1.5}}>
        <Typography variant="body2" sx={{color: mutedText, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.8}}>
          <LockIcon sx={{fontSize: 17}} />
          Immutable digital memory - {visibleEvents.length} events - cryptographically signed
        </Typography>
        <Box sx={{display: 'flex', gap: 0.65, flexWrap: 'wrap'}}>
          {selectedHierarchy ? (
            <Chip
              label={`Hierarchy: ${selectedHierarchy.code}`}
              onDelete={onClearHierarchyFilter}
              size="small"
              sx={{height: 23, bgcolor: '#E9EEFF', color: '#0F58FF', border: '1px solid #B8CAFF', fontWeight: 900}}
            />
          ) : null}
          {filters.map((filter) => (
            <Chip
              key={filter}
              label={filter}
              size="small"
              clickable
              onClick={() => onFilterChange(filter)}
              sx={{
                height: 23,
                bgcolor: filter === activeFilter ? blue : '#FFFFFF',
                color: filter === activeFilter ? '#FFFFFF' : pageText,
                border: filter === activeFilter ? 'none' : '1px solid #D7DDE6',
                fontWeight: 900,
                cursor: 'pointer',
                '& .MuiChip-label': {px: 1.1, fontSize: '0.68rem'},
                '&:hover': {
                  bgcolor: filter === activeFilter ? '#1D4ED8' : '#F8FAFC',
                },
              }}
            />
          ))}
        </Box>
      </Box>

      <Box sx={{position: 'relative', pl: {xs: 1.4, md: 3}, '&:before': {content: '""', position: 'absolute', left: {xs: 8, md: 15}, top: 8, bottom: 0, width: 2, bgcolor: '#DBE2EC'}}}>
        {visibleEvents.map((event, index) => {
          const isSelected = event.id === selectedEventId;
          const sparePartsUsed = event.sparePartsUsed ?? [];
          const sparePartsCount = getSparePartsUsedCount(event);
          const isSparePartsExpanded = expandedSparePartEventIds.includes(event.id);

          return (
          <Box key={event.id} sx={{position: 'relative', pb: index === visibleEvents.length - 1 ? 0 : 2.1}}>
            <Box sx={{position: 'absolute', left: {xs: -11, md: -21}, top: 12, width: 9, height: 9, borderRadius: '50%', bgcolor: index === 2 ? blue : '#64748B', border: '2px solid #FFFFFF', boxShadow: '0 0 0 1px #CBD5E1'}} />
            <Paper
              elevation={0}
              role="button"
              tabIndex={0}
              onClick={() => handleOpenEventDetails(event)}
              onKeyDown={(keyboardEvent) => {
                if (keyboardEvent.key === 'Enter' || keyboardEvent.key === ' ') {
                  keyboardEvent.preventDefault();
                  handleOpenEventDetails(event);
                }
              }}
              sx={{
                border: `1px solid ${isSelected ? blue : '#DDE3EA'}`,
                borderRadius: 1.5,
                px: 1.5,
                py: 1.25,
                cursor: 'pointer',
                boxShadow: isSelected ? '0 8px 22px rgba(37,99,235,0.15)' : '0 1px 3px rgba(15,23,42,0.05)',
                '&:focus-visible': {outline: `2px solid ${blue}`, outlineOffset: 2},
              }}
            >
              <Box sx={{display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1, mb: 0.65}}>
                <Box sx={{display: 'flex', alignItems: 'center', gap: 0.65, flexWrap: 'wrap'}}>
                  <Typography variant="caption" sx={{color: blue, fontWeight: 900, fontSize: '0.72rem', lineHeight: 1.2}}>
                    {getLedgerEventLabel(event)}
                  </Typography>
                  <Chip
                    label={event.id}
                    size="small"
                    sx={{
                      height: 20,
                      bgcolor: '#E9EEFF',
                      border: '1px solid #B8CAFF',
                      color: blue,
                      fontWeight: 900,
                      '& .MuiChip-label': {px: 0.8, fontSize: '0.62rem'},
                    }}
                  />
                  <Typography variant="caption" sx={{color: mutedText, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontWeight: 700}}>
                    {event.date} - {event.time}
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{color: mutedText, display: 'flex', alignItems: 'center', gap: 0.25, fontWeight: 700}}>
                  <LockIcon sx={{fontSize: 12}} /> {event.lock}
                </Typography>
              </Box>
              <Typography variant="subtitle2" sx={{color: pageText, fontWeight: 900, lineHeight: 1.25}}>
                {event.title}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: '#4B5563',
                  fontSize: '0.78rem',
                  mt: 0.55,
                  fontWeight: 600,
                  display: '-webkit-box',
                  WebkitBoxOrient: 'vertical',
                  WebkitLineClamp: 1,
                  overflow: 'hidden',
                }}
              >
                {event.body}
              </Typography>
              <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap', mt: 0.85}}>
                <Typography variant="caption" sx={{color: blue, fontWeight: 800}}>
                  {event.impactLevel}
                </Typography>
              </Box>
              {sparePartsCount ? (
                <Box
                  onClick={(mouseEvent) => mouseEvent.stopPropagation()}
                  onKeyDown={(keyboardEvent) => keyboardEvent.stopPropagation()}
                  sx={{mt: 0.9, border: '1px solid #DDE3EA', borderRadius: 1, bgcolor: '#F8FAFC', overflow: 'hidden'}}
                >
                  <Box sx={{display: 'grid', gridTemplateColumns: 'auto minmax(0, 1fr) auto auto', gap: 0.75, alignItems: 'center', px: 1, py: 0.65}}>
                    <SparePartsIcon sx={{fontSize: 17, color: '#0F766E'}} />
                    <Typography variant="caption" sx={{color: pageText, fontWeight: 900}}>
                      Spare parts used
                    </Typography>
                    <Chip label={sparePartsCount} size="small" sx={{height: 22, minWidth: 28, bgcolor: '#FFFFFF', border: '1px solid #C9D8F5', color: blue, fontWeight: 900}} />
                    <Tooltip title={isSparePartsExpanded ? 'Hide spare parts' : 'Show spare parts'}>
                      <IconButton
                        aria-label={isSparePartsExpanded ? `Hide spare parts for ${event.id}` : `Show spare parts for ${event.id}`}
                        size="small"
                        onClick={() => handleToggleSpareParts(event.id)}
                        sx={{width: 24, height: 24, color: blue, '&:hover': {bgcolor: '#EAF0FF'}}}
                      >
                        {isSparePartsExpanded ? <DownIcon sx={{fontSize: 17}} /> : <ChevronRightIcon sx={{fontSize: 17}} />}
                      </IconButton>
                    </Tooltip>
                  </Box>
                  {isSparePartsExpanded ? (
                    <Box sx={{display: 'grid', gap: 0.65, px: 1, pb: 0.85}}>
                      {sparePartsUsed.map((part) => (
                        <Box key={`${event.id}-${part.code}`} sx={{display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: 0.8, alignItems: 'center', px: 1, py: 0.7, border: '1px solid #E5EAF2', borderRadius: 1, bgcolor: '#FFFFFF'}}>
                          <Box sx={{minWidth: 0}}>
                            <Typography variant="caption" sx={{color: pageText, fontWeight: 900, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                              {part.name}
                            </Typography>
                            <Typography variant="caption" sx={{color: mutedText, fontWeight: 700}}>
                              {part.code} - Bin {part.bin}
                            </Typography>
                          </Box>
                          <Chip label={`${part.qty} ${part.unit}`} size="small" sx={{height: 23, bgcolor: '#F8FAFC', border: '1px solid #C9D8F5', color: blue, fontWeight: 900}} />
                        </Box>
                      ))}
                    </Box>
                  ) : null}
                </Box>
              ) : (
                <Box
                  onClick={(mouseEvent) => mouseEvent.stopPropagation()}
                  onKeyDown={(keyboardEvent) => keyboardEvent.stopPropagation()}
                  sx={{mt: 0.9, display: 'grid', gridTemplateColumns: 'auto minmax(0, 1fr) auto', gap: 0.75, alignItems: 'center', px: 1, py: 0.65, border: '1px solid #E5EAF2', borderRadius: 1, bgcolor: '#F8FAFC'}}
                >
                  <SparePartsIcon sx={{fontSize: 17, color: '#94A3B8'}} />
                  <Typography variant="caption" sx={{color: mutedText, fontWeight: 900}}>
                    Spare parts used
                  </Typography>
                  <Chip label="0" size="small" sx={{height: 22, minWidth: 28, bgcolor: '#FFFFFF', border: '1px solid #D7DDE6', color: mutedText, fontWeight: 900}} />
                </Box>
              )}
            </Paper>
          </Box>
          );
        })}
        {!visibleEvents.length ? (
          <Paper elevation={0} sx={{border: '1px dashed #CBD5E1', borderRadius: 1.5, px: 1.5, py: 2, bgcolor: '#FFFFFF'}}>
            <Typography sx={{color: pageText, fontWeight: 800}}>No events found for {activeFilter}</Typography>
            <Typography variant="body2" sx={{color: mutedText, mt: 0.45}}>
              Try another filter to review the asset ledger history.
            </Typography>
          </Paper>
        ) : null}
      </Box>
      <LedgerEventDetailsDialog event={detailEvent} onClose={() => setDetailEvent(null)} />
    </Box>
  );
}

function renderTabContent({
  activeTab,
  activeFilter,
  events,
  selectedHierarchyId,
  selectedEventId,
  bomRows,
  onFilterChange,
  onClearHierarchyFilter,
  onSelectEvent,
  onReviewAiEvidence,
}: {
  activeTab: LedgerTab;
  activeFilter: LedgerFilter;
  events: EventItem[];
  selectedHierarchyId: string | null;
  selectedEventId: string | null;
  bomRows: BomRow[];
  onFilterChange: (filter: LedgerFilter) => void;
  onClearHierarchyFilter: () => void;
  onSelectEvent: (event: EventItem) => void;
  onReviewAiEvidence: (recommendation: AiRecommendation) => void;
}) {
  switch (activeTab) {
    case 'Performance':
      return <PerformanceTab />;
    case 'Future Actions':
      return <FutureActionsTab />;
    case 'Structure':
      return <StructureTab bomRows={bomRows} />;
    case 'Reliability':
      return (
        <ReliabilityTab
          selectedHierarchyId={selectedHierarchyId}
          onReviewAiEvidence={onReviewAiEvidence}
        />
      );
    case 'Ledger Timeline':
    default:
      return (
        <TimelineTab
          activeFilter={activeFilter}
          events={events}
          selectedHierarchyId={selectedHierarchyId}
          selectedEventId={selectedEventId}
          onFilterChange={onFilterChange}
          onClearHierarchyFilter={onClearHierarchyFilter}
          onSelectEvent={onSelectEvent}
        />
      );
  }
}

interface AssetExplorerPageProps {
  setCurrentScreen?: (screen: AppScreen) => void;
}

export default function AssetExplorerPage({setCurrentScreen}: AssetExplorerPageProps) {
  const [activeTab, setActiveTab] = useState<LedgerTab>('Ledger Timeline');
  const [activeFilter, setActiveFilter] = useState<LedgerFilter>('All');
  const [ledgerEvents, setLedgerEvents] = useState<EventItem[]>(initialEvents);
  const [treeHierarchyItems, setTreeHierarchyItems] = useState<HierarchyItem[]>(initialHierarchyItems);
  const [selectedHierarchyId, setSelectedHierarchyId] = useState<string | null>('plant-sandy');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [expandedHierarchyIds, setExpandedHierarchyIds] = useState<string[]>(initialExpandedHierarchyIds);
  const [draggedHierarchyId, setDraggedHierarchyId] = useState<string | null>(null);
  const [dropTargetHierarchyId, setDropTargetHierarchyId] = useState<string | null>(null);
  const [pendingMoveConfirmation, setPendingMoveConfirmation] = useState<PendingMoveConfirmation | null>(null);
  const [pendingMoveApprovalsById, setPendingMoveApprovalsById] = useState<Record<string, PendingMoveApproval>>({});
  const [hierarchySearch, setHierarchySearch] = useState('');
  const [listNameFilter, setListNameFilter] = useState('');
  const [listTypeFilter, setListTypeFilter] = useState('');
  const [listVendorFilter, setListVendorFilter] = useState('');
  const [listModelFilter, setListModelFilter] = useState('');
  const [listFirmwareFilter, setListFirmwareFilter] = useState('');
  const [listOsFilter, setListOsFilter] = useState('');
  const [listIpFilter, setListIpFilter] = useState('');
  const [customAssetTypes] = useState<string[]>([]);
  const [selectedListItemIds, setSelectedListItemIds] = useState<string[]>([]);
  const [activeListItemId, setActiveListItemId] = useState<string | null>(null);
  const [itemDetailsTab, setItemDetailsTab] = useState<ItemDetailsTab>('overview');
  const [digitalRelationships, setDigitalRelationships] = useState<DigitalRelationship[]>([]);
  const [newRelationshipTargetId, setNewRelationshipTargetId] = useState<string>('');
  const [newRelationshipDirection, setNewRelationshipDirection] = useState<RelationshipDirection>('outbound');
  const [openModalHierarchyId, setOpenModalHierarchyId] = useState<string | null>(null);
  const [activeAssetModalTab, setActiveAssetModalTab] = useState<AssetModalTab>('info');
  const [isAssetModalEditing, setIsAssetModalEditing] = useState(false);
  const [assetModalDraft, setAssetModalDraft] = useState<AssetEditDraft | null>(null);
  const [assetPropertyOverridesByHierarchyId, setAssetPropertyOverridesByHierarchyId] = useState<Record<string, Partial<AssetEditDraft>>>({});
  const [addChildParentId, setAddChildParentId] = useState<string | null>(null);
  const [addChildOptionKey, setAddChildOptionKey] = useState('');
  const [newChildAssetType, setNewChildAssetType] = useState('');
  const [isNewAssetTypeRedirectDialogOpen, setIsNewAssetTypeRedirectDialogOpen] = useState(false);
  const [addChildName, setAddChildName] = useState('');
  const [addChildCode, setAddChildCode] = useState('');
  const [isWorkOrderDrawerOpen, setIsWorkOrderDrawerOpen] = useState(false);
  const [workOrderDrawerTab, setWorkOrderDrawerTab] = useState<WorkOrderTab>('attachments');
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const bomRows = initialBomRows;
  const hierarchyParentById = useMemo(() => getHierarchyParentMap(treeHierarchyItems), [treeHierarchyItems]);
  const hierarchyById = useMemo(() => new Map(treeHierarchyItems.map((item) => [item.id, item])), [treeHierarchyItems]);
  const hierarchyPathById = useMemo(() => {
    const pathById = new Map<string, string>();

    treeHierarchyItems.forEach((item) => {
      const pathParts: string[] = [];
      let currentId: string | null = item.id;

      while (currentId) {
        const currentItem = hierarchyById.get(currentId);
        if (!currentItem) break;

        pathParts.unshift(currentItem.label);
        currentId = hierarchyParentById.get(currentId) ?? null;
      }

      pathById.set(item.id, pathParts.join('.'));
    });

    return pathById;
  }, [treeHierarchyItems, hierarchyById, hierarchyParentById]);
  const warningEventTypes = useMemo(() => new Set(['Predictive Alert', 'Operator Abnormality', 'Failure Code', 'Breakdown Work Order', 'Quality Hold']), []);
  const warningHierarchyIds = useMemo(() => {
    const ids = new Set<string>();

    ledgerEvents.forEach((event) => {
      if (!warningEventTypes.has(event.type)) return;
      event.impactHierarchyIds.forEach((hierarchyId) => ids.add(hierarchyId));
    });

    return ids;
  }, [ledgerEvents, warningEventTypes]);
  const assetMetaById = useMemo(
    () => ({
      'asset-sa-204': {sapId: 'SAP-100204', vendor: 'Rockwell', model: 'ControlLogix', firmware: 'FW-4.5.2', os: 'RTOS 11', ip: '10.12.4.21'},
      'asset-mm-301': {sapId: 'SAP-100301', vendor: 'Siemens', model: 'S7-1500', firmware: 'FW-3.2.8', os: 'Linux RT', ip: '10.12.6.31'},
      'asset-rb-410': {sapId: 'SAP-100410', vendor: 'ABB', model: 'IRC5', firmware: 'FW-2.8.0', os: 'VxWorks', ip: '10.14.8.52'},
      'asset-heat-sealer': {sapId: 'SAP-100611', vendor: 'PackEdge', model: 'HS-220', firmware: 'FW-1.5.7', os: 'Linux Embedded', ip: '10.14.8.67'},
      'asset-mx-500': {sapId: 'SAP-100500', vendor: 'Mitsubishi', model: 'MELSEC iQ-R', firmware: 'FW-7.0.1', os: 'RTOS 9', ip: '10.15.3.15'},
      'asset-filler-900': {sapId: 'SAP-100900', vendor: 'Schneider Electric', model: 'Modicon M580', firmware: 'FW-6.3.4', os: 'Linux RT', ip: '10.15.3.41'},
      'asset-wp-120': {sapId: 'SAP-100120', vendor: 'Rockwell', model: 'PanelView Plus', firmware: 'FW-3.1.9', os: 'Linux Embedded', ip: '10.12.12.21'},
      'asset-pl-450': {sapId: 'SAP-100450', vendor: 'Siemens', model: 'WinCC Runtime', firmware: 'FW-2.2.3', os: 'RTOS 10', ip: '10.12.12.24'},
      'asset-ls-214': {sapId: 'SAP-100214', vendor: 'Honeywell', model: 'Experion Edge', firmware: 'FW-5.4.1', os: 'Linux RT', ip: '10.12.14.18'},
      'asset-cart-810': {sapId: 'SAP-100810', vendor: 'PackEdge', model: 'CT-810', firmware: 'FW-6.1.2', os: 'Linux Embedded', ip: '10.14.24.15'},
      'asset-label-702': {sapId: 'SAP-100702', vendor: 'Emerson', model: 'DeltaV PK', firmware: 'FW-4.0.6', os: 'Embedded OS', ip: '10.14.24.28'},
      'asset-blend-33': {sapId: 'SAP-100033', vendor: 'GE', model: 'RX3i', firmware: 'FW-1.7.0', os: 'RTOS 8', ip: '10.15.9.11'},
      'asset-pump-208': {sapId: 'SAP-100208', vendor: 'Schneider Electric', model: 'Altivar Process', firmware: 'FW-2.5.4', os: 'Embedded OS', ip: '10.15.9.31'},
    }),
    []
  );
  const assetListItems = useMemo<AssetListItem[]>(() => {
    return treeHierarchyItems
      .filter((item) => item.level >= 3)
      .map((item, index) => {
        const meta = assetMetaById[item.id as keyof typeof assetMetaById];
        const override = assetPropertyOverridesByHierarchyId[item.id] ?? {};
        const defaultIp = `10.${20 + item.level}.${Math.max(1, (index % 20) + 1)}.${80 + (index % 120)}`;

        return {
          id: `${item.id}-inventory`,
          hierarchyId: item.id,
          name: override.name ?? item.label,
          assetType: getAssetTypeByLevel(item.level),
          sapId: override.sapId ?? meta?.sapId ?? `SAP-${item.code.replace(/[^A-Z0-9]/gi, '').toUpperCase()}`,
          vendor: override.vendor ?? meta?.vendor ?? 'Internal Standard',
          model: override.model ?? meta?.model ?? item.code,
          firmware: override.firmware ?? meta?.firmware ?? 'FW-1.0.0',
          os: override.os ?? meta?.os ?? 'Embedded OS',
          ip: override.ip ?? meta?.ip ?? defaultIp,
          path: hierarchyPathById.get(item.id) ?? item.label,
          code: item.code,
          level: item.level,
          hasWarning: Boolean(item.hasPending || warningHierarchyIds.has(item.id)),
        };
      });
  }, [assetMetaById, assetPropertyOverridesByHierarchyId, hierarchyPathById, treeHierarchyItems, warningHierarchyIds]);
  const listItemsInScope = useMemo(() => {
    if (!selectedHierarchyId) return assetListItems;

    const descendantIds = getHierarchyDescendantIds(treeHierarchyItems, selectedHierarchyId);
    return assetListItems.filter((item) => descendantIds.has(item.hierarchyId));
  }, [assetListItems, selectedHierarchyId, treeHierarchyItems]);
  const filteredListItems = useMemo(() => {
    const includesFilter = (value: string, filter: string) => value.toLowerCase().includes(filter.trim().toLowerCase());

    return listItemsInScope.filter(
      (item) =>
        includesFilter(item.name, listNameFilter) &&
        includesFilter(item.assetType, listTypeFilter) &&
        includesFilter(item.vendor, listVendorFilter) &&
        includesFilter(item.model, listModelFilter) &&
        includesFilter(item.firmware, listFirmwareFilter) &&
        includesFilter(item.os, listOsFilter) &&
        includesFilter(item.ip, listIpFilter)
    );
  }, [listFirmwareFilter, listIpFilter, listItemsInScope, listModelFilter, listNameFilter, listOsFilter, listTypeFilter, listVendorFilter]);
  const hasActiveListFilters = Boolean(listNameFilter || listTypeFilter || listVendorFilter || listModelFilter || listFirmwareFilter || listOsFilter || listIpFilter);
  const filterHighlightSx = {bgcolor: '#FFF7D6', '& .MuiOutlinedInput-notchedOutline': {borderColor: '#F59E0B'}};
  const assetTypeFilterOptions = useMemo(
    () => Array.from(new Set([...commonOtAssetTypes, ...customAssetTypes, ...assetListItems.map((item) => item.assetType)])).sort(),
    [assetListItems, customAssetTypes]
  );
  const vendorFilterOptions = useMemo(() => Array.from(new Set([...commonOtVendors, ...assetListItems.map((item) => item.vendor)])).sort(), [assetListItems]);
  const modelFilterOptions = useMemo(() => Array.from(new Set([...commonOtModels, ...assetListItems.map((item) => item.model)])).sort(), [assetListItems]);
  const activeListItem = useMemo(() => filteredListItems.find((item) => item.id === activeListItemId) ?? filteredListItems[0] ?? null, [activeListItemId, filteredListItems]);
  const activeItemRelationships = useMemo(() => {
    if (!activeListItem) return [];
    return digitalRelationships.filter((relation) => relation.sourceHierarchyId === activeListItem.hierarchyId || relation.targetHierarchyId === activeListItem.hierarchyId);
  }, [activeListItem, digitalRelationships]);
  const relationshipTargetOptions = useMemo(() => {
    if (!activeListItem) return [];
    return assetListItems.filter((item) => item.hierarchyId !== activeListItem.hierarchyId);
  }, [activeListItem, assetListItems]);
  const relationshipDirectionByHierarchyId = useMemo(() => {
    const directionSetById = new Map<string, Set<'inbound' | 'outbound'>>();

    digitalRelationships.forEach((rel) => {
      const sourceSet = directionSetById.get(rel.sourceHierarchyId) ?? new Set<'inbound' | 'outbound'>();
      const targetSet = directionSetById.get(rel.targetHierarchyId) ?? new Set<'inbound' | 'outbound'>();

      if (rel.direction === 'outbound') {
        sourceSet.add('outbound');
        targetSet.add('inbound');
      } else if (rel.direction === 'inbound') {
        sourceSet.add('inbound');
        targetSet.add('outbound');
      } else {
        sourceSet.add('inbound');
        sourceSet.add('outbound');
        targetSet.add('inbound');
        targetSet.add('outbound');
      }

      directionSetById.set(rel.sourceHierarchyId, sourceSet);
      directionSetById.set(rel.targetHierarchyId, targetSet);
    });

    const resolved = new Map<string, RelationshipDirection>();
    directionSetById.forEach((directions, hierarchyId) => {
      if (directions.has('inbound') && directions.has('outbound')) {
        resolved.set(hierarchyId, 'bidirectional');
      } else if (directions.has('inbound')) {
        resolved.set(hierarchyId, 'inbound');
      } else if (directions.has('outbound')) {
        resolved.set(hierarchyId, 'outbound');
      }
    });

    return resolved;
  }, [digitalRelationships]);
  const allFilteredSelected = filteredListItems.length > 0 && filteredListItems.every((item) => selectedListItemIds.includes(item.id));
  const modalItem = useMemo(() => {
    if (!openModalHierarchyId) return null;

    const itemFromList = assetListItems.find((item) => item.hierarchyId === openModalHierarchyId);
    if (itemFromList) return itemFromList;

    const hierarchyNode = hierarchyById.get(openModalHierarchyId);
    if (!hierarchyNode) return null;

    return {
      id: `${hierarchyNode.id}-modal`,
      hierarchyId: hierarchyNode.id,
      name: hierarchyNode.label,
      assetType: getAssetTypeByLevel(hierarchyNode.level),
      sapId: `SAP-${hierarchyNode.code.replace(/[^A-Z0-9]/gi, '').toUpperCase()}`,
      vendor: 'Internal Standard',
      model: hierarchyNode.code,
      firmware: 'FW-1.0.0',
      os: 'Embedded OS',
      ip: '-',
      path: hierarchyPathById.get(hierarchyNode.id) ?? hierarchyNode.label,
      code: hierarchyNode.code,
      level: hierarchyNode.level,
      hasWarning: Boolean(hierarchyNode.hasPending || warningHierarchyIds.has(hierarchyNode.id)),
    } as AssetListItem;
  }, [assetListItems, hierarchyById, hierarchyPathById, openModalHierarchyId, warningHierarchyIds]);
  const modalPathIds = useMemo(() => {
    if (!openModalHierarchyId) return [];

    const pathIds: string[] = [];
    let currentId: string | null = openModalHierarchyId;

    while (currentId) {
      pathIds.unshift(currentId);
      currentId = hierarchyParentById.get(currentId) ?? null;
    }

    return pathIds;
  }, [hierarchyParentById, openModalHierarchyId]);
  const modalInfoKpis = useMemo(() => {
    if (!modalItem) return null;

    const seed = getSeedFromText(modalItem.hierarchyId);
    const baselineHealth = 62 + (seed % 30);
    const health = Math.max(18, Math.min(98, baselineHealth - (modalItem.hasWarning ? 17 : 0)));
    const baselineRisk = 100 - health + (seed % 8);
    const risk = Math.max(6, Math.min(94, baselineRisk + (modalItem.hasWarning ? 10 : 0)));
    const eolStatus = risk >= 72 ? 'Near EOL (<= 12 months)' : risk >= 50 ? 'Monitor (12-24 months)' : 'Supported (> 24 months)';

    return {health, risk, eolStatus};
  }, [modalItem]);
  const modalFieldSources = useMemo<Record<string, AssetFieldSource>>(() => {
    if (!modalItem) return {} as Record<string, AssetFieldSource>;

    const seed = getSeedFromText(modalItem.hierarchyId);
    const fromHoursAgo = (hoursAgo: number) => {
      const dt = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);
      return dt.toISOString().replace('T', ' ').slice(0, 16);
    };

    return {
      name: {source: 'Manual', updatedAt: fromHoursAgo((seed % 12) + 2)},
      sapId: {source: 'SAP', updatedAt: fromHoursAgo((seed % 36) + 8)},
      assetType: {source: 'BlueMountain', updatedAt: fromHoursAgo((seed % 30) + 6)},
      vendor: {source: 'SAP', updatedAt: fromHoursAgo((seed % 48) + 10)},
      model: {source: 'SAP', updatedAt: fromHoursAgo((seed % 42) + 9)},
      firmware: {source: 'Nozomi', updatedAt: fromHoursAgo((seed % 16) + 1)},
      os: {source: 'Nozomi', updatedAt: fromHoursAgo((seed % 18) + 2)},
      ip: {source: 'Nozomi', updatedAt: fromHoursAgo((seed % 8) + 1)},
      path: {source: 'Manual', updatedAt: fromHoursAgo((seed % 22) + 3)},
      health: {source: 'Nozomi', updatedAt: fromHoursAgo((seed % 6) + 1)},
      risk: {source: 'Nozomi', updatedAt: fromHoursAgo((seed % 7) + 1)},
      eolStatus: {source: 'BlueMountain', updatedAt: fromHoursAgo((seed % 72) + 12)},
    };
  }, [modalItem]);
  const getFieldSourceHint = (fieldKey: string) => {
    const meta = modalFieldSources[fieldKey];
    return meta ? `Source: ${meta.source} - Updated: ${meta.updatedAt}` : 'Source: Manual - Updated: -';
  };
  const modalHistoryEvents = useMemo<AssetHistoryEvent[]>(() => {
    if (!modalItem) return [];

    const relatedLedgerEvents = ledgerEvents
      .filter((event) => event.impactHierarchyIds.includes(modalItem.hierarchyId))
      .slice(0, 6)
      .map((event) => {
        const category: AssetHistoryEvent['category'] = event.type.includes('Work Order') ? 'maintenance' : 'operation';

        return {
          id: `ledger-${event.id}`,
          dateTime: `${event.date} ${event.time}`,
          category,
          title: event.type,
          details: `${event.title} - ${event.meta}`,
        };
      });

    const syntheticEvents: AssetHistoryEvent[] = [
      {
        id: `${modalItem.hierarchyId}-ip-change`,
        dateTime: '2026-06-21 08:42',
        category: 'network',
        title: 'IP updated',
        details: `Network address changed to ${modalItem.ip} after segmentation update.`,
      },
      {
        id: `${modalItem.hierarchyId}-status-change`,
        dateTime: '2026-06-12 13:18',
        category: 'status',
        title: 'Status changed to monitored',
        details: 'Asset moved from stable to monitored due to vibration trend drift.',
      },
      {
        id: `${modalItem.hierarchyId}-maintenance`,
        dateTime: '2026-06-04 10:05',
        category: 'maintenance',
        title: 'Preventive maintenance executed',
        details: 'Lubrication, parameter review, and firmware consistency check completed.',
      },
      {
        id: `${modalItem.hierarchyId}-movement`,
        dateTime: '2026-05-29 15:40',
        category: 'movement',
        title: 'Asset position updated in hierarchy',
        details: 'Equipment was reassigned to a new zone after balancing of production load.',
      },
    ];

    return [...relatedLedgerEvents, ...syntheticEvents];
  }, [ledgerEvents, modalItem]);
  const modalActionItems = useMemo<AssetActionItem[]>(() => {
    if (!modalItem) return [];

    const actions: AssetActionItem[] = [];
    const pendingApproval = pendingMoveApprovalsById[modalItem.hierarchyId];

    if (pendingApproval && !pendingApproval.approved) {
      actions.push({
        id: `${modalItem.hierarchyId}-approval`,
        kind: 'Approval',
        status: 'Pending Approval',
        owner: pendingApproval.approverName,
        due: 'Today',
        title: 'Approve position change',
        details: `Validate move from ${pendingApproval.fromPath} to ${pendingApproval.toPath}.`,
      });
    }

    ledgerEvents
      .filter((event) => isWorkOrderEvent(event) && event.impactHierarchyIds.includes(modalItem.hierarchyId))
      .slice(0, 3)
      .forEach((event, index) => {
        actions.push({
          id: `${modalItem.hierarchyId}-wo-${event.id}`,
          kind: 'WO',
          status: index === 0 ? 'In Progress' : 'Open',
          owner: 'Maintenance Planner',
          due: index === 0 ? 'Today 18:00' : 'This week',
          title: `${event.id} - ${event.title}`,
          details: event.body,
        });
      });

    actions.push({
      id: `${modalItem.hierarchyId}-scheduled-maintenance`,
      kind: 'Maintenance',
      status: 'Scheduled',
      owner: 'Reliability Team',
      due: '2026-07-03 09:00',
      title: 'Predictive maintenance window',
      details: 'Planned replacement of wear components and health recalibration cycle.',
    });

    if (modalItem.hasWarning) {
      actions.push({
        id: `${modalItem.hierarchyId}-inspection`,
        kind: 'Inspection',
        status: 'Open',
        owner: 'Shift Supervisor',
        due: 'Next shift',
        title: 'Focused anomaly inspection',
        details: 'Validate warning causes and confirm containment actions in production.',
      });
    }

    return actions;
  }, [ledgerEvents, modalItem, pendingMoveApprovalsById]);

  const addChildParentItem = useMemo(() => (addChildParentId ? treeHierarchyItems.find((item) => item.id === addChildParentId) ?? null : null), [addChildParentId, treeHierarchyItems]);
  const otAssetTypeOptions = useMemo(() => assetTypeFilterOptions, [assetTypeFilterOptions]);
  const addChildOptions = useMemo(() => {
    if (!addChildParentItem) return [];

    const baseOptions = getAddChildOptions(addChildParentItem);
    const otOptions: AddChildOption[] = otAssetTypeOptions.map((typeName) => ({
      key: `ot-${typeName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      label: typeName,
      level: Math.min(addChildParentItem.level + 1, 8),
      codePrefix: typeName.toUpperCase().replace(/[^A-Z0-9]+/g, '').slice(0, 6) || 'ASSET',
      idPrefix: 'asset',
      icon: AssetIcon,
    }));

    return [...baseOptions, ...otOptions];
  }, [addChildParentItem, otAssetTypeOptions]);

  useEffect(() => {
    setSelectedListItemIds((current) => current.filter((id) => filteredListItems.some((item) => item.id === id)));
    setActiveListItemId((current) => {
      if (current && filteredListItems.some((item) => item.id === current)) return current;
      return filteredListItems[0]?.id ?? null;
    });
  }, [filteredListItems]);

  useEffect(() => {
    setItemDetailsTab('overview');
    setNewRelationshipTargetId('');
    setNewRelationshipDirection('outbound');
  }, [activeListItem?.id]);

  useEffect(() => {
    if (!modalItem) {
      setActiveAssetModalTab('info');
      setIsAssetModalEditing(false);
      setAssetModalDraft(null);
      return;
    }

    setAssetModalDraft({
      name: modalItem.name,
      sapId: modalItem.sapId,
      vendor: modalItem.vendor,
      model: modalItem.model,
      firmware: modalItem.firmware,
      os: modalItem.os,
      ip: modalItem.ip,
    });
    setActiveAssetModalTab('info');
    setIsAssetModalEditing(false);
  }, [modalItem]);

  useEffect(() => {
    if (!addChildOptions.length) {
      setAddChildOptionKey('');
      setAddChildName('');
      setAddChildCode('');
      return;
    }

    const firstOption = addChildOptions[0];
    setAddChildOptionKey(firstOption.key);
    setAddChildName(`New ${firstOption.label}`);
    setAddChildCode(`${firstOption.codePrefix}-${Math.floor(100 + Math.random() * 900)}`);
  }, [addChildOptions]);

  const handleOpenNewAssetTypeWizardWarning = () => {
    setIsNewAssetTypeRedirectDialogOpen(true);
  };

  const handleConfirmRedirectToNewAssetTypeWizard = () => {
    setIsNewAssetTypeRedirectDialogOpen(false);
    setAddChildParentId(null);
    setNewChildAssetType('');
    setCurrentScreen?.('ot_asset_type_wizard');
  };

  const handleHierarchyClick = (hierarchyId: string) => {
    setSelectedHierarchyId(hierarchyId);
    setSelectedEventId(null);
    if (activeTab !== 'Reliability') {
      setActiveTab('Ledger Timeline');
    }
    setActiveFilter('All');
  };

  const handleToggleHierarchyNode = (hierarchyId: string) => {
    setExpandedHierarchyIds((prev) => (prev.includes(hierarchyId) ? prev.filter((id) => id !== hierarchyId) : [...prev, hierarchyId]));
  };

  const handleHierarchyDrop = (targetId: string) => {
    if (!draggedHierarchyId) return;

    const destinationZone = resolveEquipmentDropParent(treeHierarchyItems, targetId);
    if (!destinationZone || !canDropEquipmentMove(treeHierarchyItems, draggedHierarchyId, targetId)) {
      setDropTargetHierarchyId(null);
      setDraggedHierarchyId(null);
      return;
    }

    const approverName = 'Julia Costa';
    const draggedPath = hierarchyPathById.get(draggedHierarchyId) ?? draggedHierarchyId;
    const draggedLabel = treeHierarchyItems.find((item) => item.id === draggedHierarchyId)?.label ?? draggedHierarchyId;
    const destinationPath = `${hierarchyPathById.get(destinationZone.id) ?? destinationZone.label}.${draggedLabel}`;

    setPendingMoveConfirmation({
      draggedId: draggedHierarchyId,
      destinationZoneId: destinationZone.id,
      fromPath: draggedPath,
      toPath: destinationPath,
      approverName,
    });
    setDropTargetHierarchyId(null);
    setDraggedHierarchyId(null);
  };

  const handleConfirmEquipmentMove = () => {
    if (!pendingMoveConfirmation) return;

    const {draggedId, destinationZoneId, fromPath, toPath, approverName} = pendingMoveConfirmation;

    setTreeHierarchyItems((prev) => moveSubtreeToParent(prev, draggedId, destinationZoneId));
    setPendingMoveApprovalsById((current) => ({
      ...current,
      [draggedId]: {
        fromPath,
        toPath,
        approverName,
        approved: false,
      },
    }));
    setPendingMoveConfirmation(null);
    setSelectedHierarchyId(draggedId);
  };

  const handleApproveEquipmentMove = (hierarchyId: string) => {
    setPendingMoveApprovalsById((current) => {
      if (!current[hierarchyId]) return current;

      return {
        ...current,
        [hierarchyId]: {
          ...current[hierarchyId],
          approved: true,
        },
      };
    });
  };

  const handleAddChild = () => {
    if (!addChildParentItem) return;

    const selectedOption = addChildOptions.find((option) => option.key === addChildOptionKey);
    if (!selectedOption) return;

    const childName = addChildName.trim();
    const childCode = addChildCode.trim();
    if (!childName || !childCode) return;

    setTreeHierarchyItems((prev) => {
      const parentIndex = prev.findIndex((item) => item.id === addChildParentItem.id);
      if (parentIndex < 0) return prev;

      const insertionIndex = getSubtreeEndIndex(prev, parentIndex);
      const baseId = `${selectedOption.idPrefix}-${childName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`.replace(/(^-|-$)/g, '') || `${selectedOption.idPrefix}-new`;
      let nextId = baseId;
      let suffix = 1;
      while (prev.some((item) => item.id === nextId)) {
        nextId = `${baseId}-${suffix}`;
        suffix += 1;
      }

      const newItem: HierarchyItem = {
        id: nextId,
        code: childCode,
        label: childName,
        level: selectedOption.level,
        icon: selectedOption.icon,
        textTone: 'default',
      };

      return [...prev.slice(0, insertionIndex), newItem, ...prev.slice(insertionIndex)];
    });

    setExpandedHierarchyIds((current) => (current.includes(addChildParentItem.id) ? current : [...current, addChildParentItem.id]));
    setAddChildParentId(null);
  };

  const handleExportSelectedAssets = () => {
    const selectedAssets = assetListItems.filter((item) => selectedListItemIds.includes(item.id));
    if (!selectedAssets.length) return;

    const headers = ['Name', 'SAP Id', 'Asset Type', 'Vendor', 'Model', 'Firmware', 'OS', 'IP', 'Code', 'Path'];
    const rows = selectedAssets.map((item) => [item.name, item.sapId, item.assetType, item.vendor, item.model, item.firmware, item.os, item.ip, item.code, item.path]);

    const csvContent = [headers, ...rows].map((row) => row.map((cell) => escapeCsvCell(String(cell))).join(',')).join('\n');
    const blob = new Blob([csvContent], {type: 'text/csv;charset=utf-8;'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `asset-export-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportAssetsFromCsv = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const csvText = await file.text();
    const lines = csvText.split(/\r?\n/).filter((line) => line.trim().length > 0);
    if (lines.length < 2) return;

    const headers = lines[0].split(',').map((header) => header.trim().toLowerCase());
    const getIndex = (name: string) => headers.findIndex((header) => header === name.toLowerCase());
    const codeIndex = getIndex('Code');
    const nameIndex = getIndex('Name');
    const sapIdIndex = getIndex('SAP Id');
    const vendorIndex = getIndex('Vendor');
    const modelIndex = getIndex('Model');
    const firmwareIndex = getIndex('Firmware');
    const osIndex = getIndex('OS');
    const ipIndex = getIndex('IP');

    const byCode = new Map(assetListItems.map((item) => [item.code.toLowerCase(), item]));
    const byName = new Map(assetListItems.map((item) => [item.name.toLowerCase(), item]));
    const importedOverrides: Record<string, Partial<AssetEditDraft>> = {};

    lines.slice(1).forEach((line) => {
      const cells = line.split(',').map((cell) => cell.trim().replace(/^"|"$/g, ''));
      const codeValue = codeIndex >= 0 ? cells[codeIndex]?.toLowerCase() : '';
      const nameValue = nameIndex >= 0 ? cells[nameIndex]?.toLowerCase() : '';
      const target = (codeValue && byCode.get(codeValue)) || (nameValue && byName.get(nameValue));
      if (!target) return;

      importedOverrides[target.hierarchyId] = {
        name: nameIndex >= 0 ? cells[nameIndex] || target.name : target.name,
        sapId: sapIdIndex >= 0 ? cells[sapIdIndex] || target.sapId : target.sapId,
        vendor: vendorIndex >= 0 ? cells[vendorIndex] || target.vendor : target.vendor,
        model: modelIndex >= 0 ? cells[modelIndex] || target.model : target.model,
        firmware: firmwareIndex >= 0 ? cells[firmwareIndex] || target.firmware : target.firmware,
        os: osIndex >= 0 ? cells[osIndex] || target.os : target.os,
        ip: ipIndex >= 0 ? cells[ipIndex] || target.ip : target.ip,
      };
    });

    setAssetPropertyOverridesByHierarchyId((current) => ({...current, ...importedOverrides}));
    event.target.value = '';
  };

  const handleClearListFilters = () => {
    setListNameFilter('');
    setListTypeFilter('');
    setListVendorFilter('');
    setListModelFilter('');
    setListFirmwareFilter('');
    setListOsFilter('');
    setListIpFilter('');
  };

  const handleCreateDigitalRelationship = () => {
    if (!activeListItem || !newRelationshipTargetId) return;
    if (newRelationshipTargetId === activeListItem.hierarchyId) return;

    const alreadyExists = digitalRelationships.some(
      (relation) =>
        relation.sourceHierarchyId === activeListItem.hierarchyId &&
        relation.targetHierarchyId === newRelationshipTargetId &&
        relation.direction === newRelationshipDirection
    );
    if (alreadyExists) return;

    setDigitalRelationships((current) => [
      ...current,
      {
        id: `rel-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        sourceHierarchyId: activeListItem.hierarchyId,
        targetHierarchyId: newRelationshipTargetId,
        direction: newRelationshipDirection,
      },
    ]);
    setNewRelationshipTargetId('');
  };

  const handleRemoveDigitalRelationship = (relationshipId: string) => {
    setDigitalRelationships((current) => current.filter((relation) => relation.id !== relationshipId));
  };

  const handleSelectEvent = (event: EventItem) => {
    setSelectedEventId(event.id);
  };

  const handleClearHierarchyFilter = () => {
    setSelectedHierarchyId(null);
  };

  const handleReviewAiEvidence = (recommendation: AiRecommendation) => {
    setSelectedHierarchyId(recommendation.impactHierarchyIds[recommendation.impactHierarchyIds.length - 1]);
    setSelectedEventId(null);
    setActiveTab('Ledger Timeline');
    setActiveFilter(recommendation.filter);
  };

  const handleOpenWorkOrderDrawer = () => {
    setWorkOrderDrawerTab('attachments');
    setIsWorkOrderDrawerOpen(true);
  };

  const handleCloseWorkOrderDrawer = () => {
    setIsWorkOrderDrawerOpen(false);
    setWorkOrderDrawerTab('attachments');
  };

  const handleCreateWorkOrder = (workOrderDraft: FollowUpWorkOrderDraft) => {
    const assignee = workOrderDraft.responsibleAssignee?.name ?? 'Unassigned';
    const dueLabel = workOrderDraft.scheduledExecutionDay?.fullLabel ?? 'Unscheduled';
    const title = workOrderDraft.problemDescription.trim() || `${workOrderDraft.maintenanceType || 'Maintenance'} work order`;
    const equipment = workOrderDraft.equipment.trim() || defaultAssetName;
    const reason = workOrderDraft.activityType || workOrderDraft.maintenanceType || 'Maintenance work';
    const {date, time} = getLedgerTimestamp();
    const newEvent: EventItem = {
      type: 'Work Order',
      id: `WO-${9800 + ledgerEvents.filter(isWorkOrderEvent).length + 1}`,
      date,
      time,
      impactLevel: defaultAssetImpactLevel,
      impactHierarchyIds: baseHierarchyPath,
      title,
      body: `${title} created for ${equipment} and routed to the maintenance queue for execution.`,
      meta: `Planner A - ${assignee}`,
      keyFacts: ['What: Work order created', `Who: ${assignee}`, `When: Due ${dueLabel}`, `Why: ${reason}`],
      note: 'Created from Equipment Ledger quick action.',
      lock: `L-${1045 + ledgerEvents.length}`,
    };

    setLedgerEvents((prev) => [newEvent, ...prev]);
    handleCloseWorkOrderDrawer();
    setSelectedEventId(newEvent.id);
    setActiveTab('Ledger Timeline');
    setActiveFilter('WO');
  };

  const selectedEvent = ledgerEvents.find((event) => event.id === selectedEventId);
  const highlightedHierarchyId = selectedEvent?.impactHierarchyIds[selectedEvent.impactHierarchyIds.length - 1] ?? selectedHierarchyId;
  const expandableHierarchyIds = new Set(treeHierarchyItems.filter((item, index) => treeHierarchyItems[index + 1]?.level > item.level).map((item) => item.id));
  const visibleHierarchyItems = useMemo(() => {
    if (hierarchySearch.trim()) {
      return getSearchFilteredHierarchyItems(treeHierarchyItems, hierarchySearch);
    }

    return getVisibleHierarchyItems(treeHierarchyItems, expandedHierarchyIds);
  }, [expandedHierarchyIds, hierarchySearch, treeHierarchyItems]);

  return (
    <Box sx={{flexGrow: 1, minHeight: 'calc(100vh - 112px)', bgcolor: '#F6F7F9', overflowY: 'auto', p: {xs: 1.5, md: 2}}}>
      <Paper elevation={0} sx={{border: '1px solid #E1E5EB', borderRadius: 2, overflow: 'hidden', bgcolor: '#FFFFFF'}}>
        <Box
          sx={{
            px: {xs: 2, md: 2.5},
            py: 2,
            minHeight: 78,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            flexWrap: 'wrap',
            borderBottom: '1px solid #E6E9EF',
          }}
        >
          <Box>
            <Typography variant="h5" sx={{color: pageText, fontSize: {xs: '1.15rem', md: '1.35rem'}, fontWeight: 900, lineHeight: 1.15}}>
              OT Asset Explorer
            </Typography>
            <Typography variant="body2" sx={{color: '#4B5563', fontWeight: 500, mt: 0.45}}>
              Asset history, maintenance events, reliability KPIs, and equipment context
            </Typography>
          </Box>
        </Box>

        <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', xl: '432px minmax(0, 1fr) 380px'}, gap: 1.5, p: 1.5}}>
          <Paper elevation={0} sx={{border: '1px solid #DDE3EA', borderRadius: 2, overflow: 'hidden', minHeight: {lg: 'calc(100vh - 210px)'}, bgcolor: '#FFFFFF'}}>
            <Box sx={{px: 1.5, py: 1.5}}>
              <Typography variant="subtitle1" sx={{color: pageText, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 0.8}}>
                <HierarchyIcon sx={{color: blue, fontSize: 19}} />
                Asset Hierarchy
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="Search asset..."
                value={hierarchySearch}
                onChange={(event) => setHierarchySearch(event.target.value)}
                sx={{mt: 1.1, '& .MuiOutlinedInput-root': {height: 32, borderRadius: 1.2, bgcolor: '#F8FAFC'}}}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{color: '#64748B', fontSize: 18}} />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
            <Divider />
            <Box sx={{maxHeight: {xs: 380, lg: 'calc(100vh - 300px)'}, overflowY: 'auto', py: 1, pr: 0.5}}>
              {visibleHierarchyItems.map(({id, code, label, level, icon: Icon, active, textTone, hasPending}) => {
                const isSelected = selectedHierarchyId === id;
                const isImpacted = highlightedHierarchyId === id;
                const isActiveNode = active || isSelected || isImpacted;
                const isEquipment = id.startsWith('asset-');
                const hasChildren = expandableHierarchyIds.has(id);
                const isExpanded = expandedHierarchyIds.includes(id);
                const isDropTarget =
                  dropTargetHierarchyId === id &&
                  draggedHierarchyId !== null &&
                  canDropEquipmentMove(treeHierarchyItems, draggedHierarchyId, id);
                const hasWarning = hasPending || warningHierarchyIds.has(id);
                const textColor = textTone === 'healthy' ? '#15803D' : textTone === 'muted' ? '#98A2B3' : '#111827';
                const hierarchyPath = hierarchyPathById.get(id) ?? label;
                const hasPendingApproval = Boolean(pendingMoveApprovalsById[id] && !pendingMoveApprovalsById[id].approved);
                const canAddChild = level >= 0 && level <= 5;
                const relationshipDirection = relationshipDirectionByHierarchyId.get(id);
                const DisplayIcon = Icon === ChevronRightIcon ? LineNodeIcon : Icon;

                return (
                  <Tooltip key={id} title={hierarchyPath} placement="right" arrow>
                    <Box
                      role="button"
                      tabIndex={0}
                      draggable={isEquipment}
                      onDragStart={(event) => {
                        if (!isEquipment) return;
                        event.dataTransfer.effectAllowed = 'move';
                        event.dataTransfer.setData('text/plain', id);
                        setDraggedHierarchyId(id);
                      }}
                      onDragEnd={() => {
                        setDraggedHierarchyId(null);
                        setDropTargetHierarchyId(null);
                      }}
                      onDragOver={(event) => {
                        if (!draggedHierarchyId || !canDropEquipmentMove(treeHierarchyItems, draggedHierarchyId, id)) return;
                        event.preventDefault();
                        event.dataTransfer.dropEffect = 'move';
                        if (dropTargetHierarchyId !== id) {
                          setDropTargetHierarchyId(id);
                        }
                      }}
                      onDragLeave={() => {
                        if (dropTargetHierarchyId === id) {
                          setDropTargetHierarchyId(null);
                        }
                      }}
                      onDrop={(event) => {
                        event.preventDefault();
                        handleHierarchyDrop(id);
                      }}
                      onClick={() => handleHierarchyClick(id)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          handleHierarchyClick(id);
                        }
                      }}
                      sx={{
                        mx: 1,
                        minHeight: 44,
                        pl: `${0.45 + level * 0.72}rem`,
                        pr: 0.8,
                        py: 0.55,
                        borderRadius: 1.2,
                        display: 'grid',
                        gridTemplateColumns: '20px auto minmax(0, 1fr)',
                        alignItems: 'center',
                        gap: 0.55,
                        color: textColor,
                        bgcolor: isSelected ? '#E9EEFF' : isImpacted ? '#F0F7FF' : 'transparent',
                        border: isDropTarget ? '1px dashed #1D74FF' : isImpacted ? '1px solid #B8CAFF' : '1px solid transparent',
                        fontWeight: isActiveNode ? 900 : 600,
                        cursor: isEquipment ? (draggedHierarchyId === id ? 'grabbing' : 'grab') : 'pointer',
                        overflow: 'hidden',
                        '&:hover': {bgcolor: isActiveNode ? '#E9EEFF' : '#F8FAFC'},
                        '&:focus-visible': {outline: `2px solid ${blue}`, outlineOffset: 1},
                        ...(hasPendingApproval
                          ? {
                              animation: 'pendingMovePulse 1s ease-in-out infinite',
                              '@keyframes pendingMovePulse': {
                                '0%, 100%': {backgroundColor: '#FFF7ED'},
                                '50%': {backgroundColor: '#FFEDD5'},
                              },
                            }
                          : {}),
                      }}
                    >
                    {hasChildren ? (
                      <IconButton
                        aria-label={isExpanded ? `Collapse ${label}` : `Expand ${label}`}
                        size="small"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleToggleHierarchyNode(id);
                        }}
                        onKeyDown={(event) => event.stopPropagation()}
                        sx={{
                          width: 20,
                          height: 20,
                          color: '#94A3B8',
                          '&:hover': {bgcolor: '#EEF2F7', color: blue},
                        }}
                      >
                        {isExpanded ? <DownIcon sx={{fontSize: 15}} /> : <ChevronRightIcon sx={{fontSize: 15}} />}
                      </IconButton>
                    ) : (
                      <Box sx={{width: 20, height: 20}} />
                    )}
                    {DisplayIcon ? <DisplayIcon sx={{fontSize: 16, color: textColor, flexShrink: 0}} /> : <Typography sx={{color: textColor, fontWeight: 900, lineHeight: 1}}>*</Typography>}
                    <Box sx={{minWidth: 0}}>
                      <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0}}>
                        <Typography variant="body2" sx={{minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.82rem', fontWeight: 'inherit'}}>
                          {label}
                        </Typography>
                        {hasWarning ? <WarningIcon sx={{fontSize: 15, color: '#F59E0B', flexShrink: 0}} /> : null}
                        {relationshipDirection ? <Tooltip title={`Digital relationship: ${relationshipDirection}`} arrow>{getRelationshipIcon(relationshipDirection)}</Tooltip> : null}
                        <Chip label={code} size="small" sx={{height: 18, bgcolor: '#FFFFFF', border: '1px solid #D7DDE6', color: mutedText, fontSize: '0.62rem', fontWeight: 900}} />
                        {canAddChild ? (
                          <IconButton
                            size="small"
                            onClick={(event) => {
                              event.stopPropagation();
                              setAddChildParentId(id);
                            }}
                            sx={{width: 18, height: 18, border: '1px solid #CBD5E1', bgcolor: '#FFFFFF', color: '#475569'}}
                          >
                            <AddIcon sx={{fontSize: 14}} />
                          </IconButton>
                        ) : null}
                      </Box>
                    </Box>
                    </Box>
                  </Tooltip>
                );
              })}
            </Box>
          </Paper>

          <Paper elevation={0} sx={{border: '1px solid #DDE3EA', borderRadius: 2, overflow: 'hidden', bgcolor: '#FFFFFF', minWidth: 0, minHeight: {lg: 'calc(100vh - 210px)'}, display: 'flex', flexDirection: 'column'}}>
            <Box sx={{px: 2, py: 1.4, borderBottom: '1px solid #EEF2F7'}}>
              <Typography variant="subtitle1" sx={{color: pageText, fontWeight: 900}}>
                Scoped Assets List
              </Typography>
              <Typography variant="caption" sx={{color: mutedText, mt: 0.3, display: 'block'}}>
                Showing descendants for: {selectedHierarchyId ? hierarchyPathById.get(selectedHierarchyId) : 'Entire hierarchy'}
              </Typography>
            </Box>

            <Box sx={{p: 1.5, display: 'grid', gridTemplateColumns: {xs: '1fr', md: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(4, minmax(0, 1fr))'}, gap: 1}}>
              <TextField size="small" label="Name" value={listNameFilter} onChange={(event) => setListNameFilter(event.target.value)} sx={listNameFilter ? filterHighlightSx : undefined} />
              <Autocomplete
                size="small"
                options={assetTypeFilterOptions}
                value={listTypeFilter || null}
                onChange={(_event, value) => setListTypeFilter(value ?? '')}
                renderInput={(params) => <TextField {...params} label="Asset Type" placeholder="PLC, HMI, SCADA..." sx={listTypeFilter ? filterHighlightSx : undefined} />}
              />
              <Autocomplete
                size="small"
                options={vendorFilterOptions}
                value={listVendorFilter || null}
                onChange={(_event, value) => setListVendorFilter(value ?? '')}
                renderInput={(params) => <TextField {...params} label="Vendor" placeholder="Rockwell, Siemens..." sx={listVendorFilter ? filterHighlightSx : undefined} />}
              />
              <Autocomplete
                size="small"
                options={modelFilterOptions}
                value={listModelFilter || null}
                onChange={(_event, value) => setListModelFilter(value ?? '')}
                renderInput={(params) => <TextField {...params} label="Model" placeholder="ControlLogix, S7-1500..." sx={listModelFilter ? filterHighlightSx : undefined} />}
              />
              <TextField size="small" label="Firmware" value={listFirmwareFilter} onChange={(event) => setListFirmwareFilter(event.target.value)} sx={listFirmwareFilter ? filterHighlightSx : undefined} />
              <TextField size="small" label="OS" value={listOsFilter} onChange={(event) => setListOsFilter(event.target.value)} sx={listOsFilter ? filterHighlightSx : undefined} />
              <TextField size="small" label="IP" value={listIpFilter} onChange={(event) => setListIpFilter(event.target.value)} sx={listIpFilter ? filterHighlightSx : undefined} />
              <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'flex-end'}}>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<ClearFiltersIcon sx={{fontSize: 16}} />}
                  onClick={handleClearListFilters}
                  disabled={!hasActiveListFilters}
                  sx={{textTransform: 'none', fontWeight: 800}}
                >
                  Limpar filtros
                </Button>
              </Box>
            </Box>
            <Divider />

            <Box sx={{px: 1.5, py: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, flexWrap: 'wrap'}}>
              <Box sx={{display: 'flex', alignItems: 'center', gap: 0.8, flexWrap: 'wrap'}}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    if (allFilteredSelected) {
                      setSelectedListItemIds((current) => current.filter((id) => !filteredListItems.some((item) => item.id === id)));
                    } else {
                      const filteredIds = filteredListItems.map((item) => item.id);
                      setSelectedListItemIds((current) => Array.from(new Set([...current, ...filteredIds])));
                    }
                  }}
                  sx={{textTransform: 'none', fontWeight: 800}}
                >
                  {allFilteredSelected ? 'Deselect All' : 'Select All'}
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<ImportIcon sx={{fontSize: 16}} />}
                  onClick={() => importInputRef.current?.click()}
                  sx={{textTransform: 'none', fontWeight: 800}}
                >
                  Import
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<ExportIcon sx={{fontSize: 16}} />}
                  onClick={handleExportSelectedAssets}
                  disabled={!selectedListItemIds.length}
                  sx={{textTransform: 'none', fontWeight: 800}}
                >
                  Export
                </Button>
                <input
                  ref={importInputRef}
                  id="asset-import-input"
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleImportAssetsFromCsv}
                  hidden
                  aria-label="Import asset CSV file"
                  title="Import asset CSV file"
                />
              </Box>
              <Typography variant="caption" sx={{color: mutedText, fontWeight: 700}}>
                Filtered Items: {filteredListItems.length}
              </Typography>
            </Box>

            <Box sx={{flexGrow: 1, minHeight: 0, overflowY: 'auto', px: 1.25, pb: 0.5}}>
              {filteredListItems.map((item) => {
                const isSelected = selectedListItemIds.includes(item.id);
                const isActiveRow = activeListItem?.id === item.id;
                const typeIcon = getAssetTypeIcon(item.level);
                const relationshipDirection = relationshipDirectionByHierarchyId.get(item.hierarchyId);

                return (
                  <Box
                    key={item.id}
                    sx={{
                      mb: 0.7,
                      px: 1,
                      py: 0.8,
                      border: isActiveRow ? '1px solid #93C5FD' : '1px solid #E5EAF2',
                      borderRadius: 1.2,
                      bgcolor: isActiveRow ? '#F0F7FF' : '#FFFFFF',
                      display: 'grid',
                      gridTemplateColumns: {xs: 'auto minmax(0, 1fr) auto', lg: 'auto minmax(0, 1.4fr) minmax(0, 0.8fr) minmax(0, 0.9fr) auto'},
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <Checkbox
                      size="small"
                      checked={isSelected}
                      onChange={() => {
                        setSelectedListItemIds((current) =>
                          current.includes(item.id) ? current.filter((id) => id !== item.id) : [...current, item.id]
                        );
                      }}
                    />
                    <Box sx={{minWidth: 0, cursor: 'pointer'}} onClick={() => setActiveListItemId(item.id)}>
                      <Box sx={{display: 'flex', alignItems: 'center', gap: 0.6, minWidth: 0}}>
                        {typeIcon}
                        <Typography sx={{fontSize: '0.85rem', fontWeight: 800, color: pageText, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                          {item.name}
                        </Typography>
                        {item.hasWarning ? <WarningIcon sx={{fontSize: 16, color: '#F59E0B', flexShrink: 0}} /> : null}
                        {relationshipDirection ? <Tooltip title={`Digital relationship: ${relationshipDirection}`} arrow>{getRelationshipIcon(relationshipDirection)}</Tooltip> : null}
                      </Box>
                      <Typography sx={{fontSize: '0.72rem', color: mutedText, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                        {item.assetType} · {item.vendor} · {item.model}
                      </Typography>
                    </Box>
                    <Box sx={{display: {xs: 'none', lg: 'block'}, minWidth: 0}}>
                      <Typography sx={{fontSize: '0.72rem', color: mutedText, fontWeight: 700}}>Vendor</Typography>
                      <Typography sx={{fontSize: '0.78rem', color: pageText, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{item.vendor}</Typography>
                    </Box>
                    <Box sx={{display: {xs: 'none', lg: 'block'}, minWidth: 0}}>
                      <Typography sx={{fontSize: '0.72rem', color: mutedText, fontWeight: 700}}>Model · Firmware · IP</Typography>
                      <Typography sx={{fontSize: '0.78rem', color: pageText, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                        {item.model} · {item.firmware} · {item.ip}
                      </Typography>
                    </Box>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        setActiveListItemId(item.id);
                        setOpenModalHierarchyId(item.hierarchyId);
                      }}
                      sx={{textTransform: 'none', minWidth: 64, fontWeight: 700}}
                    >
                      Open
                    </Button>
                  </Box>
                );
              })}
            </Box>

            <Box sx={{px: 1.5, py: 1.1, borderTop: '1px solid #EEF2F7', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, flexWrap: 'wrap'}}>
              <Typography variant="caption" sx={{color: mutedText, fontWeight: 700}}>
                Selected Items: {selectedListItemIds.length}
              </Typography>
              <Typography variant="caption" sx={{color: mutedText, fontWeight: 700}}>
                Total Items in Current Filter: {filteredListItems.length}
              </Typography>
            </Box>
          </Paper>

          <Paper elevation={0} sx={{border: '1px solid #DDE3EA', borderRadius: 2, overflow: 'hidden', bgcolor: '#FFFFFF', minWidth: 0}}>
            <Box sx={{px: 2, py: 1.4, borderBottom: '1px solid #EEF2F7'}}>
              <Typography variant="subtitle1" sx={{color: pageText, fontWeight: 900}}>
                Item Details
              </Typography>
            </Box>
            <Box sx={{p: 2, display: 'grid', gap: 1.1}}>
              {activeListItem ? (
                <>
                  <Tabs value={itemDetailsTab} onChange={(_event, value: ItemDetailsTab) => setItemDetailsTab(value)} variant="fullWidth" sx={{mb: 0.5}}>
                    <Tab value="overview" label="Overview" sx={{textTransform: 'none', fontWeight: 800}} />
                    <Tab value="digital-relations" label="Digital Relationships" sx={{textTransform: 'none', fontWeight: 800}} />
                  </Tabs>

                  {itemDetailsTab === 'overview' ? (
                    <>
                      {pendingMoveApprovalsById[activeListItem.hierarchyId] && !pendingMoveApprovalsById[activeListItem.hierarchyId].approved ? (
                        <Paper elevation={0} sx={{p: 1.1, borderRadius: 1.2, border: '1px solid #FDBA74', bgcolor: '#FFF7ED'}}>
                          <Typography sx={{fontSize: '0.76rem', fontWeight: 800, color: '#9A3412'}}>
                            Position change pending approval from {pendingMoveApprovalsById[activeListItem.hierarchyId].approverName}
                          </Typography>
                          <Typography sx={{fontSize: '0.74rem', color: '#9A3412', mt: 0.35}}>
                            Item stays blinking in the tree until approved.
                          </Typography>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleApproveEquipmentMove(activeListItem.hierarchyId)}
                            sx={{mt: 0.8, textTransform: 'none', fontWeight: 800}}
                          >
                            Approve as {pendingMoveApprovalsById[activeListItem.hierarchyId].approverName}
                          </Button>
                        </Paper>
                      ) : null}
                      <Typography sx={{fontWeight: 900, color: pageText, fontSize: '1rem'}}>{activeListItem.name}</Typography>
                      <Chip label={activeListItem.code} size="small" sx={{justifySelf: 'start', fontWeight: 800}} />
                      <Typography sx={{fontSize: '0.82rem', color: mutedText}}><strong>Type:</strong> {activeListItem.assetType}</Typography>
                      <Typography sx={{fontSize: '0.82rem', color: mutedText}}><strong>SAP Id:</strong> {activeListItem.sapId}</Typography>
                      <Typography sx={{fontSize: '0.82rem', color: mutedText}}><strong>Vendor:</strong> {activeListItem.vendor}</Typography>
                      <Typography sx={{fontSize: '0.82rem', color: mutedText}}><strong>Model:</strong> {activeListItem.model}</Typography>
                      <Typography sx={{fontSize: '0.82rem', color: mutedText}}><strong>Firmware:</strong> {activeListItem.firmware}</Typography>
                      <Typography sx={{fontSize: '0.82rem', color: mutedText}}><strong>OS:</strong> {activeListItem.os}</Typography>
                      <Typography sx={{fontSize: '0.82rem', color: mutedText}}><strong>IP:</strong> {activeListItem.ip}</Typography>
                      <Typography sx={{fontSize: '0.78rem', color: '#475569', mt: 0.5}}>{activeListItem.path}</Typography>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => setOpenModalHierarchyId(activeListItem.hierarchyId)}
                        sx={{justifySelf: 'start', mt: 0.6, textTransform: 'none', fontWeight: 800}}
                      >
                        Open Asset Modal
                      </Button>
                    </>
                  ) : null}

                  {itemDetailsTab === 'digital-relations' ? (
                    <Box sx={{display: 'grid', gap: 0.9}}>
                      <Autocomplete
                        size="small"
                        options={relationshipTargetOptions}
                        getOptionLabel={(option) => `${option.name} (${option.code})`}
                        value={relationshipTargetOptions.find((item) => item.hierarchyId === newRelationshipTargetId) ?? null}
                        onChange={(_event, value) => setNewRelationshipTargetId(value?.hierarchyId ?? '')}
                        renderInput={(params) => <TextField {...params} label="Target Asset" placeholder="Select target asset" />}
                      />
                      <TextField
                        select
                        size="small"
                        label="Direction"
                        value={newRelationshipDirection}
                        onChange={(event) => setNewRelationshipDirection(event.target.value as RelationshipDirection)}
                      >
                        <MenuItem value="outbound">Outbound</MenuItem>
                        <MenuItem value="inbound">Inbound</MenuItem>
                        <MenuItem value="bidirectional">Bidirectional</MenuItem>
                      </TextField>
                      <Button variant="contained" size="small" onClick={handleCreateDigitalRelationship} sx={{textTransform: 'none', fontWeight: 800}}>
                        Create Relationship
                      </Button>

                      <Divider />
                      {activeItemRelationships.length ? (
                        activeItemRelationships.map((relation) => {
                          const isSource = relation.sourceHierarchyId === activeListItem.hierarchyId;
                          const otherId = isSource ? relation.targetHierarchyId : relation.sourceHierarchyId;
                          const other = assetListItems.find((item) => item.hierarchyId === otherId);

                          return (
                            <Paper key={relation.id} elevation={0} sx={{p: 0.95, border: '1px solid #E2E8F0', borderRadius: 1.2}}>
                              <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1}}>
                                <Box sx={{display: 'flex', alignItems: 'center', gap: 0.7, minWidth: 0}}>
                                  {getRelationshipIcon(relation.direction)}
                                  <Typography sx={{fontSize: '0.78rem', fontWeight: 800, color: pageText, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                                    {other ? `${other.name} (${other.code})` : otherId}
                                  </Typography>
                                </Box>
                                <Button size="small" variant="outlined" onClick={() => handleRemoveDigitalRelationship(relation.id)} sx={{textTransform: 'none', fontWeight: 700}}>
                                  Remove
                                </Button>
                              </Box>
                              <Typography sx={{fontSize: '0.72rem', color: mutedText, mt: 0.25}}>
                                {isSource ? 'Source' : 'Target'} · {relation.direction}
                              </Typography>
                            </Paper>
                          );
                        })
                      ) : (
                        <Typography sx={{fontSize: '0.8rem', color: mutedText}}>No digital relationships configured for this asset.</Typography>
                      )}
                    </Box>
                  ) : null}
                </>
              ) : (
                <Typography sx={{fontSize: '0.82rem', color: mutedText}}>No item available for the current selection/filter.</Typography>
              )}
            </Box>
          </Paper>
        </Box>
      </Paper>

      <Dialog open={Boolean(pendingMoveConfirmation)} onClose={() => setPendingMoveConfirmation(null)} fullWidth maxWidth="md">
        <DialogTitle sx={{fontWeight: 900}}>Confirm Equipment Move</DialogTitle>
        <DialogContent dividers>
          {pendingMoveConfirmation ? (
            <Box sx={{display: 'grid', gap: 1.1}}>
              <Typography sx={{fontSize: '0.88rem', color: pageText}}>
                Please confirm moving this OT physical asset to a new hierarchy location.
              </Typography>
              <Typography sx={{fontSize: '0.82rem', color: mutedText}}><strong>Current path:</strong> {pendingMoveConfirmation.fromPath}</Typography>
              <Typography sx={{fontSize: '0.82rem', color: mutedText}}><strong>New path:</strong> {pendingMoveConfirmation.toPath}</Typography>
              <Paper elevation={0} sx={{p: 1.1, borderRadius: 1.2, border: '1px solid #CBD5E1', bgcolor: '#F8FAFC'}}>
                <Typography sx={{fontSize: '0.8rem', color: '#334155', fontWeight: 700}}>
                  After your confirmation, {pendingMoveConfirmation.approverName} must approve this move.
                </Typography>
              </Paper>
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPendingMoveConfirmation(null)} sx={{textTransform: 'none', fontWeight: 800}}>Cancel</Button>
          <Button variant="contained" onClick={handleConfirmEquipmentMove} sx={{textTransform: 'none', fontWeight: 800}}>Confirm Move</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(openModalHierarchyId)}
        onClose={() => setOpenModalHierarchyId(null)}
        fullWidth
        maxWidth="xl"
        PaperProps={{sx: {width: 'min(1240px, 96vw)', maxHeight: '92vh'}}}
      >
        <DialogTitle sx={{fontWeight: 900, pb: 1}}>
          <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap'}}>
            <Box sx={{display: 'flex', alignItems: 'center', gap: 0.7}}>
              <HealthIcon sx={{color: '#0F766E', fontSize: 20}} />
              <Typography sx={{fontWeight: 900, color: pageText}}>Asset Intelligence</Typography>
            </Box>
            {modalItem ? <Chip label={modalItem.code} size="small" sx={{fontWeight: 800}} /> : null}
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {modalPathIds.length ? (
            <Box sx={{display: 'flex', alignItems: 'center', gap: 0.35, flexWrap: 'wrap', mb: 1.2}}>
              {modalPathIds.map((pathId, index) => {
                const pathItem = hierarchyById.get(pathId);
                if (!pathItem) return null;

                return (
                  <Box key={pathId} sx={{display: 'flex', alignItems: 'center', gap: 0.35}}>
                    <Button
                      size="small"
                      onClick={() => {
                        setSelectedHierarchyId(pathId);
                        const listMatch = assetListItems.find((item) => item.hierarchyId === pathId);
                        setActiveListItemId(listMatch?.id ?? null);
                        setOpenModalHierarchyId(pathId);
                      }}
                      sx={{minWidth: 'auto', px: 0.7, py: 0.2, textTransform: 'none', fontSize: '0.72rem', fontWeight: 700}}
                    >
                      {pathItem.label}
                    </Button>
                    {index < modalPathIds.length - 1 ? <Typography sx={{fontSize: '0.72rem', color: '#94A3B8'}}>.</Typography> : null}
                  </Box>
                );
              })}
            </Box>
          ) : null}

          <Tabs
            value={activeAssetModalTab}
            onChange={(_event: unknown, value: AssetModalTab) => {
              setActiveAssetModalTab(value);
              if (value !== 'info') {
                setIsAssetModalEditing(false);
              }
            }}
            variant="fullWidth"
            sx={{mb: 1.25}}
          >
            <Tab value="info" icon={<InfoIcon sx={{fontSize: 16}} />} iconPosition="start" label="Info" sx={{textTransform: 'none', fontWeight: 800}} />
            <Tab value="events" icon={<HistoryIcon sx={{fontSize: 16}} />} iconPosition="start" label="Events" sx={{textTransform: 'none', fontWeight: 800}} />
            <Tab value="actions" icon={<ActionIcon sx={{fontSize: 16}} />} iconPosition="start" label="Actions" sx={{textTransform: 'none', fontWeight: 800}} />
          </Tabs>

          {!modalItem ? (
            <Typography>No asset selected.</Typography>
          ) : (
            <>
              {activeAssetModalTab === 'info' ? (
                <Box sx={{display: 'grid', gap: 1.1}}>
                  <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', md: 'repeat(3, minmax(0, 1fr))'}, gap: 1}}>
                    <Tooltip title={getFieldSourceHint('health')} arrow placement="top">
                      <Paper elevation={0} sx={{p: 1.15, border: '1px solid #DDE3EA', borderRadius: 1.2, bgcolor: '#F8FAFC'}}>
                        <Typography sx={{fontSize: '0.72rem', color: mutedText, fontWeight: 700}}>Health</Typography>
                        <Typography sx={{fontSize: '1.08rem', color: '#0F766E', fontWeight: 900}}>{modalInfoKpis?.health ?? '-'}%</Typography>
                      </Paper>
                    </Tooltip>
                    <Tooltip title={getFieldSourceHint('risk')} arrow placement="top">
                      <Paper elevation={0} sx={{p: 1.15, border: '1px solid #DDE3EA', borderRadius: 1.2, bgcolor: '#FFF7ED'}}>
                        <Typography sx={{fontSize: '0.72rem', color: mutedText, fontWeight: 700}}>Risk</Typography>
                        <Typography sx={{fontSize: '1.08rem', color: '#9A3412', fontWeight: 900}}>{modalInfoKpis?.risk ?? '-'}%</Typography>
                      </Paper>
                    </Tooltip>
                    <Tooltip title={getFieldSourceHint('eolStatus')} arrow placement="top">
                      <Paper elevation={0} sx={{p: 1.15, border: '1px solid #DDE3EA', borderRadius: 1.2, bgcolor: '#F8FAFC'}}>
                        <Typography sx={{fontSize: '0.72rem', color: mutedText, fontWeight: 700}}>EOL Status</Typography>
                        <Typography sx={{fontSize: '0.82rem', color: pageText, fontWeight: 800}}>{modalInfoKpis?.eolStatus ?? '-'}</Typography>
                      </Paper>
                    </Tooltip>
                  </Box>

                  {isAssetModalEditing && assetModalDraft ? (
                    <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', md: 'repeat(2, minmax(0, 1fr))'}, gap: 1}}>
                      <TextField size="small" label="Name" value={assetModalDraft.name} onChange={(event) => setAssetModalDraft((current) => (current ? {...current, name: event.target.value} : current))} />
                      <TextField size="small" label="SAP Id" value={assetModalDraft.sapId} onChange={(event) => setAssetModalDraft((current) => (current ? {...current, sapId: event.target.value} : current))} />
                      <TextField size="small" label="Vendor" value={assetModalDraft.vendor} onChange={(event) => setAssetModalDraft((current) => (current ? {...current, vendor: event.target.value} : current))} />
                      <TextField size="small" label="Model" value={assetModalDraft.model} onChange={(event) => setAssetModalDraft((current) => (current ? {...current, model: event.target.value} : current))} />
                      <TextField size="small" label="Firmware" value={assetModalDraft.firmware} onChange={(event) => setAssetModalDraft((current) => (current ? {...current, firmware: event.target.value} : current))} />
                      <TextField size="small" label="OS" value={assetModalDraft.os} onChange={(event) => setAssetModalDraft((current) => (current ? {...current, os: event.target.value} : current))} />
                      <TextField size="small" label="IP" value={assetModalDraft.ip} onChange={(event) => setAssetModalDraft((current) => (current ? {...current, ip: event.target.value} : current))} />
                      <Tooltip title={getFieldSourceHint('path')} arrow placement="top">
                        <Paper elevation={0} sx={{px: 1, py: 0.8, border: '1px solid #E2E8F0', borderRadius: 1.1, display: 'flex', alignItems: 'center'}}>
                          <Typography sx={{fontSize: '0.82rem', color: mutedText, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}><strong>Path:</strong> {modalItem.path}</Typography>
                        </Paper>
                      </Tooltip>
                    </Box>
                  ) : (
                    <Box sx={{display: 'grid', gap: 1.05}}>
                      <Box sx={{display: 'flex', alignItems: 'center', gap: 0.65}}>
                        {getAssetTypeIcon(modalItem.level)}
                        <Typography sx={{fontWeight: 900, color: pageText}}>{modalItem.name}</Typography>
                        {modalItem.hasWarning ? <WarningIcon sx={{fontSize: 16, color: '#F59E0B'}} /> : null}
                      </Box>
                      <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', md: 'repeat(2, minmax(0, 1fr))'}, gap: 1}}>
                        {[
                          {key: 'name', label: 'Name', value: modalItem.name},
                          {key: 'sapId', label: 'SAP Id', value: modalItem.sapId},
                          {key: 'assetType', label: 'Asset Type', value: modalItem.assetType},
                          {key: 'vendor', label: 'Vendor', value: modalItem.vendor},
                          {key: 'model', label: 'Model', value: modalItem.model},
                          {key: 'firmware', label: 'Firmware', value: modalItem.firmware},
                          {key: 'os', label: 'OS', value: modalItem.os},
                          {key: 'ip', label: 'IP', value: modalItem.ip},
                          {key: 'path', label: 'Path', value: modalItem.path},
                        ].map((field) => (
                          <Tooltip key={field.key} title={getFieldSourceHint(field.key)} arrow placement="top">
                            <Paper elevation={0} sx={{p: 0.95, border: '1px solid #E2E8F0', borderRadius: 1.1, bgcolor: '#FFFFFF'}}>
                              <Typography sx={{fontSize: '0.72rem', color: mutedText, fontWeight: 700}}>{field.label}</Typography>
                              <Typography sx={{fontSize: '0.84rem', color: pageText, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{field.value}</Typography>
                            </Paper>
                          </Tooltip>
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
              ) : null}

              {activeAssetModalTab === 'events' ? (
                <Box sx={{display: 'grid', gap: 0.9}}>
                  {modalHistoryEvents.length ? (
                    modalHistoryEvents.map((event) => (
                      <Paper key={event.id} elevation={0} sx={{p: 1.05, border: '1px solid #E2E8F0', borderRadius: 1.2}}>
                        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap'}}>
                          <Typography sx={{fontSize: '0.82rem', color: pageText, fontWeight: 800}}>{event.title}</Typography>
                          <Chip
                            size="small"
                            label={event.category}
                            sx={{
                              height: 20,
                              textTransform: 'capitalize',
                              fontWeight: 700,
                              bgcolor: event.category === 'maintenance' ? '#EEF2FF' : event.category === 'network' ? '#ECFEFF' : '#F8FAFC',
                            }}
                          />
                        </Box>
                        <Typography sx={{fontSize: '0.74rem', color: mutedText, mt: 0.2}}>{event.dateTime}</Typography>
                        <Typography sx={{fontSize: '0.78rem', color: '#334155', mt: 0.55}}>{event.details}</Typography>
                      </Paper>
                    ))
                  ) : (
                    <Typography sx={{fontSize: '0.82rem', color: mutedText}}>No events found for this asset.</Typography>
                  )}
                </Box>
              ) : null}

              {activeAssetModalTab === 'actions' ? (
                <Box sx={{display: 'grid', gap: 0.9}}>
                  {modalActionItems.length ? (
                    modalActionItems.map((action) => (
                      <Paper key={action.id} elevation={0} sx={{p: 1.05, border: '1px solid #E2E8F0', borderRadius: 1.2}}>
                        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap'}}>
                          <Typography sx={{fontSize: '0.82rem', color: pageText, fontWeight: 800}}>{action.title}</Typography>
                          <Chip
                            size="small"
                            label={action.status}
                            sx={{
                              height: 20,
                              fontWeight: 700,
                              bgcolor:
                                action.status === 'Pending Approval'
                                  ? '#FFEDD5'
                                  : action.status === 'In Progress'
                                    ? '#DBEAFE'
                                    : action.status === 'Scheduled'
                                      ? '#E0F2FE'
                                      : '#F1F5F9',
                            }}
                          />
                        </Box>
                        <Typography sx={{fontSize: '0.74rem', color: mutedText, mt: 0.2}}>{action.kind} · Owner: {action.owner} · Due: {action.due}</Typography>
                        <Typography sx={{fontSize: '0.78rem', color: '#334155', mt: 0.55}}>{action.details}</Typography>
                      </Paper>
                    ))
                  ) : (
                    <Typography sx={{fontSize: '0.82rem', color: mutedText}}>No pending actions for this asset.</Typography>
                  )}

                  <Box sx={{display: 'flex', alignItems: 'center', gap: 0.8, flexWrap: 'wrap'}}>
                    <Button size="small" variant="outlined" onClick={handleOpenWorkOrderDrawer} sx={{textTransform: 'none', fontWeight: 800}}>
                      Open Work Order Drawer
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        setSelectedHierarchyId(modalItem.hierarchyId);
                        setActiveTab('Ledger Timeline');
                        setActiveFilter('WO');
                      }}
                      sx={{textTransform: 'none', fontWeight: 800}}
                    >
                      Go to WO Timeline
                    </Button>
                  </Box>
                </Box>
              ) : null}
            </>
          )}
        </DialogContent>
        <DialogActions>
          {modalItem && activeAssetModalTab === 'info' ? (
            isAssetModalEditing ? (
              <>
                <Button
                  onClick={() => {
                    setIsAssetModalEditing(false);
                    setAssetModalDraft({
                      name: modalItem.name,
                      sapId: modalItem.sapId,
                      vendor: modalItem.vendor,
                      model: modalItem.model,
                      firmware: modalItem.firmware,
                      os: modalItem.os,
                      ip: modalItem.ip,
                    });
                  }}
                  sx={{textTransform: 'none', fontWeight: 800}}
                >
                  Cancel Edit
                </Button>
                <Button
                  variant="contained"
                  onClick={() => {
                    if (!assetModalDraft) return;

                    setAssetPropertyOverridesByHierarchyId((current) => ({
                      ...current,
                      [modalItem.hierarchyId]: {
                        name: assetModalDraft.name,
                        sapId: assetModalDraft.sapId,
                        vendor: assetModalDraft.vendor,
                        model: assetModalDraft.model,
                        firmware: assetModalDraft.firmware,
                        os: assetModalDraft.os,
                        ip: assetModalDraft.ip,
                      },
                    }));
                    setIsAssetModalEditing(false);
                  }}
                  sx={{textTransform: 'none', fontWeight: 800}}
                >
                  Save
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsAssetModalEditing(true)} sx={{textTransform: 'none', fontWeight: 800}}>
                Edit
              </Button>
            )
          ) : null}
          <Button onClick={() => setOpenModalHierarchyId(null)} sx={{textTransform: 'none', fontWeight: 800}}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(addChildParentId)} onClose={() => setAddChildParentId(null)} fullWidth maxWidth="xs">
        <DialogTitle sx={{fontWeight: 900}}>Add Child Item</DialogTitle>
        <DialogContent dividers>
          <Box sx={{display: 'grid', gap: 1}}>
            <Typography sx={{fontSize: '0.82rem', color: mutedText}}>
              Parent: {addChildParentItem?.label}
            </Typography>
            <Box sx={{display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: 0.75, alignItems: 'end'}}>
              <TextField
                select
                size="small"
                label="Child Type"
                value={addChildOptionKey}
                onChange={(event) => setAddChildOptionKey(event.target.value)}
              >
                {addChildOptions.map((option) => (
                  <MenuItem key={option.key} value={option.key}>{option.label}</MenuItem>
                ))}
              </TextField>
              <IconButton
                size="small"
                onClick={handleOpenNewAssetTypeWizardWarning}
                sx={{width: 34, height: 34, border: '1px solid #CBD5E1', borderRadius: 1.2}}
                title="Create new asset type"
              >
                <AddIcon sx={{fontSize: 17}} />
              </IconButton>
            </Box>
            <TextField
              size="small"
              label="New Asset Type"
              placeholder="Create in wizard (approval flow)"
              value={newChildAssetType}
              onChange={(event) => setNewChildAssetType(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  handleOpenNewAssetTypeWizardWarning();
                }
              }}
            />
            <TextField size="small" label="Name" value={addChildName} onChange={(event) => setAddChildName(event.target.value)} />
            <TextField size="small" label="Code" value={addChildCode} onChange={(event) => setAddChildCode(event.target.value)} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddChildParentId(null)} sx={{textTransform: 'none', fontWeight: 800}}>Cancel</Button>
          <Button variant="contained" onClick={handleAddChild} sx={{textTransform: 'none', fontWeight: 800}}>Add</Button>
        </DialogActions>
      </Dialog>

      <CreateWorkOrderDrawer
        open={isWorkOrderDrawerOpen}
        activeTab={workOrderDrawerTab}
        initialDraft={null}
        onTabChange={setWorkOrderDrawerTab}
        onClose={handleCloseWorkOrderDrawer}
        onSubmit={handleCreateWorkOrder}
      />

      <Dialog
        open={isNewAssetTypeRedirectDialogOpen}
        onClose={() => setIsNewAssetTypeRedirectDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{fontWeight: 900}}>Redirect to New Asset Type Wizard</DialogTitle>
        <DialogContent dividers>
          <Typography sx={{fontSize: '0.9rem', color: '#0F172A', fontWeight: 700}}>
            You are leaving the current add-child flow.
          </Typography>
          <Typography sx={{fontSize: '0.82rem', color: '#475569', mt: 0.8}}>
            Creating a new asset type opens a dedicated wizard screen, and the data currently entered in this modal will be lost.
          </Typography>
          <Typography sx={{fontSize: '0.82rem', color: '#475569', mt: 0.8}}>
            Continue to wizard?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsNewAssetTypeRedirectDialogOpen(false)} sx={{textTransform: 'none', fontWeight: 800}}>
            Stay Here
          </Button>
          <Button variant="contained" onClick={handleConfirmRedirectToNewAssetTypeWizard} sx={{textTransform: 'none', fontWeight: 800}}>
            Go to Wizard
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}
