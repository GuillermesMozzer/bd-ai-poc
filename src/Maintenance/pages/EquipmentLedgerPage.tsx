import {useEffect, useId, useMemo, useState} from 'react';
import {Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Divider, IconButton, InputAdornment, MenuItem, Paper, TextField, Tooltip, Typography} from '@mui/material';
import {Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip as ChartTooltip, XAxis, YAxis} from 'recharts';
import {
  AccountTree as HierarchyIcon,
  Add as AddIcon,
  AutoAwesome as InsightIcon,
  CalendarMonth as CalendarIcon,
  ChevronRight as ChevronRightIcon,
  Close as CloseIcon,
  ContentPasteSearch as ScanIcon,
  DescriptionOutlined as DocumentIcon,
  ErrorOutline as AlertIcon,
  Biotech as BiotechIcon,
  Business as SiteIcon,
  Factory as FactoryIcon,
  GridOn as CavityMapIcon,
  Hub as StructureIcon,
  InfoOutlined as InfoIcon,
  Inventory2 as AssetIcon,
  Inventory2Outlined as SparePartsIcon,
  KeyboardArrowDown as DownIcon,
  LocalHospital as FacilityIcon,
  LockOutlined as LockIcon,
  MedicalServices as DeviceComponentIcon,
  PrecisionManufacturing as EquipmentIcon,
  QueryStats as TrendIcon,
  RadioButtonUnchecked as TreeNodeIcon,
  Search as SearchIcon,
  Security as ShieldIcon,
  SettingsSuggest as MaintenanceIcon,
  ShowChart as PerformanceIcon,
  Speed as PredictiveIcon,
  Timeline as TimelineIcon,
  WarningAmber as WarningIcon,
} from '@mui/icons-material';
import {
  tokenBrand,
  tokenError,
  tokenWarning,
  tokenSuccess,
  tokenInfo,
  tokenNeutral,
  tokenText,
  tokenDivider,
  tokenCommon,
} from '../../workstation/theme';
import {CreateWorkOrderDrawer, type WorkOrderDraft as FollowUpWorkOrderDraft, type WorkOrderTab} from './MaintenanceFollowUpBoardPage';

type LedgerTab = 'Ledger Timeline' | 'Performance' | 'Future Actions' | 'Structure' | 'Reliability' | 'Mold Logbook';

type TabConfig = {
  label: LedgerTab;
  icon: typeof TimelineIcon;
};

const filters = ['Preventive', 'Corrective', 'Breakdown', 'Changeover', 'CIL', 'Centerline', 'Spare Parts'] as const;

type LedgerFilter = (typeof filters)[number];
type ActiveLedgerFilter = LedgerFilter | null;

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
  moldingOccurrenceId?: string;
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

type CavityStatus = 'OK' | 'Watch' | 'NG' | 'Under Review' | 'Maintenance' | 'Disabled' | 'Blocked';

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
  checkedCavities?: CheckedCavityResult[];
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

type MoldEquipmentHistoryEntry = {
  moldId: string;
  equipmentId: string;
  equipmentLabel: string;
  firstSeen: string;
  lastSeen: string;
  status: string;
  source: string;
};

type CavityInventoryItem = {
  cavityNumber: number;
  positionNumber: number;
  status: CavityStatus;
  lastIssueDate: string;
  lastInspectionResult: CavityResult;
  relatedMr?: string;
  lastEvent?: MoldLogbookOccurrence;
};

type MoldHistoryRecord = {
  id: string;
  eventType: 'Mold Event' | 'Cavity Event';
  dateTime: string;
  summary: string;
  updatedBy: string;
  attachmentsCount: number;
  relatedMr?: string;
  linkedCavities?: number[];
};

const hierarchyItems: HierarchyItem[] = [
  {id: 'plant-sandy', code: 'PLT-SDY', label: 'Plant A', level: 0, icon: SiteIcon, expanded: true},
  {id: 'area-a', code: 'AREA-A', label: 'Area A', level: 1, icon: FacilityIcon, expanded: true},
  {id: 'unit-a', code: 'UNIT-A', label: 'Unit A', level: 2, icon: BiotechIcon, expanded: true},
  {id: 'line-10', code: 'LINE-10', label: 'Line 10', level: 3, icon: EquipmentIcon, expanded: true},
  {id: 'zone-1', code: 'ZONE-1', label: 'Zone 1', level: 4, icon: ShieldIcon, expanded: true},
  {id: 'asset-sa-204', code: 'SA-204', label: defaultAssetName, level: 5, icon: DeviceComponentIcon, active: true},
  {id: 'system-filling', code: 'SYS-FILL', label: 'Filling System', level: 6, icon: BiotechIcon, expanded: true},
  {id: 'assembly-filling-head', code: 'ASM-FH', label: 'Filling Head Assembly', level: 7, icon: EquipmentIcon, expanded: true},
  {id: 'component-servo-motor', code: 'SM-204', label: 'Servo Motor', level: 8, icon: DeviceComponentIcon},
  {id: 'component-nozzle-cluster', code: 'NC-12', label: 'Nozzle Cluster', level: 8, icon: DeviceComponentIcon},
  {id: 'component-drive-bearing', code: 'BRG-6204', label: 'Drive Bearing', level: 8, icon: DeviceComponentIcon},
  {id: 'module-dosing-pump', code: 'DPM-01', label: 'Dosing Pump Module', level: 7, icon: BiotechIcon},
  {id: 'system-transport', code: 'SYS-TRN', label: 'Transport System', level: 6, icon: EquipmentIcon},
  {id: 'asset-mm-301', code: 'MM-301', label: 'Molding Machine MM-301', level: 5, icon: EquipmentIcon},
  {id: 'asset-m-004', code: 'M-004', label: 'Mold M-004', level: 5, icon: EquipmentIcon},
  {id: 'asset-mm-302', code: 'MM-302', label: 'Molding Machine MM-302', level: 5, icon: EquipmentIcon},
  {id: 'asset-cv-101', code: 'CV-101', label: 'Conveyor CV-101', level: 5, icon: EquipmentIcon},
  {id: 'asset-vi-210', code: 'VI-210', label: 'Vision Inspection VI-210', level: 5, icon: DeviceComponentIcon},
  {id: 'asset-lm-88', code: 'LM-88', label: 'Labeling Machine LM-88', level: 5, icon: EquipmentIcon},
  {id: 'asset-ct-32', code: 'CT-32', label: 'Cartoner CT-32', level: 5, icon: EquipmentIcon},
];

const initialExpandedHierarchyIds = hierarchyItems.filter((item) => item.expanded).map((item) => item.id);

const baseHierarchyPath = ['plant-sandy', 'area-a', 'unit-a', 'line-10', 'zone-1', 'asset-sa-204'];
const defaultSelectedHierarchyId = 'asset-sa-204';

const ledgerTabs: TabConfig[] = [
  {label: 'Ledger Timeline', icon: TimelineIcon},
  {label: 'Performance', icon: PerformanceIcon},
  {label: 'Future Actions', icon: CalendarIcon},
  {label: 'Structure', icon: StructureIcon},
  {label: 'Reliability', icon: ShieldIcon},
  {label: 'Mold Logbook', icon: DocumentIcon},
];

const initialEvents: EventItem[] = [
  {
    type: 'Preventive Work Order',
    id: 'PDM-MOLD-0142',
    date: 'May 14, 2026',
    time: '10:36',
    impactLevel: 'Mold · Mold M-004 / Cavity C14',
    impactHierarchyIds: ['plant-sandy', 'area-a', 'unit-a', 'line-10', 'zone-1', 'asset-m-004'],
    title: 'Cavity dimensional variation trend detected on Mold M-004',
    body: 'Vision and first-piece data indicate cavity C14 is drifting toward upper tolerance after the latest mold run.',
    meta: 'Edge AI - Cavity quality model',
    keyFacts: ['What: Preventive work order', 'Cavity: C14', 'Signal: Dimensional drift', 'Confidence: 89%'],
    note: 'Open the cavity map to review the linked molding occurrence and prior cavity history.',
    lock: 'L-1051',
    moldingOccurrenceId: 'MO-2026-0142',
  },
  {
    type: 'Corrective Work Order',
    id: 'WO-MOLD-3814',
    date: 'May 14, 2026',
    time: '11:05',
    impactLevel: 'Mold · Mold M-004 / Cavities C14, C51, C67',
    impactHierarchyIds: ['plant-sandy', 'area-a', 'unit-a', 'line-10', 'zone-1', 'asset-m-004'],
    title: 'Corrective inspection opened for Mold M-004 cavity drift',
    body: 'Tooling maintenance requested cavity insert inspection and sample quarantine after the first-piece review flagged multiple cavities.',
    meta: 'Planner A - Tooling maintenance',
    keyFacts: ['What: Cavity insert inspection', 'Who: Tooling maintenance', 'When: Due May 15', 'Why: Linked first-piece finding'],
    sparePartsUsed: [
      {name: 'Cavity insert shim kit', code: 'MOLD-SHIM-004', qty: 1, unit: 'kit', bin: 'M-14', status: 'Reserved'},
    ],
    lock: 'L-1052',
    moldingOccurrenceId: 'MO-2026-0142',
  },
  {
    type: 'Preventive Work Order',
    id: 'PDM-MOLD-0138',
    date: 'Mar 02, 2026',
    time: '08:03',
    impactLevel: 'Mold · Mold M-004 / Cavity C4',
    impactHierarchyIds: ['plant-sandy', 'area-a', 'unit-a', 'line-10', 'zone-1', 'asset-m-004'],
    title: 'Flash risk pattern detected after first-piece failure',
    body: 'Cavity C4 flash signature matches prior parting-line wear events. Recommend cavity map review before next lot release.',
    meta: 'Edge AI - Visual inspection model',
    keyFacts: ['What: Preventive work order', 'Cavity: C4', 'Defect: Flash', 'Confidence: 84%'],
    note: 'Cavity map includes related first-piece evidence and affected positions.',
    lock: 'L-1053',
    moldingOccurrenceId: 'MO-2026-0138',
  },
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

function getEventFilter(event: EventItem): LedgerFilter | null {
  if (event.type === 'Preventive Work Order' || event.type === 'Preventive Maintenance') return 'Preventive';
  if (event.type === 'Work Order' || event.type === 'Corrective Work Order') return 'Corrective';
  if (event.type === 'Breakdown Work Order') return 'Breakdown';
  if (event.type === 'Changeover') return 'Changeover';
  if (event.type === 'CIL') return 'CIL';
  if (event.type === 'Centerline') return 'Centerline';
  if (event.type === 'Parts Usage' || event.type === 'Spare Part Reservation' || event.type === 'Spare Part Reorder') return 'Spare Parts';
  return null;
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

function getLedgerEventTone(event: EventItem) {
  const filter = getEventFilter(event);

  if (event.type === 'Predictive Alert' || event.type === 'Quality Hold') return tokenWarning.main;
  if (filter === 'Breakdown' || event.type === 'Failure Code') return tokenError.main;
  return tokenBrand.main;
}

const aiRecommendations: AiRecommendation[] = [
  {
    id: 'AI-REC-301',
    title: 'Recurring failure mode detected',
    body: 'Bearing wear-out has occurred 7 times in the last 6 months and represents 62% of this asset\'s failures.',
    impact: 'MTBF decreased from 94 to 61 days.',
    status: 'Requires review',
    actions: ['Review evidence', 'Start RCA'],
    filter: 'Breakdown',
    impactHierarchyIds: [...baseHierarchyPath, 'system-filling', 'assembly-filling-head', 'component-drive-bearing'],
  },
  {
    id: 'AI-REC-302',
    title: 'PM interval optimization',
    body: 'Failures are recurring before the current 30-day lubrication PM interval is completed.',
    impact: 'Recommend reviewing interval from 30d to 21d for this asset.',
    status: 'Pending review',
    actions: ['Review evidence', 'Review PM strategy'],
    filter: 'Preventive',
    impactHierarchyIds: [...baseHierarchyPath, 'system-filling', 'assembly-filling-head', 'component-drive-bearing'],
  },
  {
    id: 'AI-REC-303',
    title: 'Missing RCA for repeated issue',
    body: 'Same failure mode has been recorded multiple times without a documented RCA.',
    impact: 'RCA recommended before the next planned intervention.',
    status: 'Requires review',
    actions: ['Review related WOs', 'Start RCA'],
    filter: 'Corrective',
    impactHierarchyIds: [...baseHierarchyPath, 'system-filling', 'assembly-filling-head', 'component-drive-bearing'],
  },
];

function eventMatchesHierarchy(event: EventItem, hierarchyId: string | null) {
  return !hierarchyId || event.impactHierarchyIds.includes(hierarchyId);
}

function isMoldM004Asset(item?: HierarchyItem | null) {
  return item?.id === 'asset-m-004';
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
    filter: 'Breakdown',
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
    filter: 'Preventive',
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
    filter: 'Breakdown',
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
    filter: 'Breakdown',
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
    filter: 'Spare Parts',
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

type AssetStructureHotspot = {
  id: string;
  label: string;
  title: string;
  meta: string;
  status: string;
  tone: string;
  x: string;
  y: string;
  availabilityPercent: number;
  availableParts: string[];
  missingParts: string[];
  openWorkOrders: {id: string; title: string; meta: string; status: string}[];
  openMaintenanceRequests: {id: string; title: string; meta: string; priority: string}[];
};

const assetHotspots: AssetStructureHotspot[] = [
  {
    id: 'servo-motor',
    label: 'H1',
    title: 'Servo Motor SM-204',
    meta: 'Vibration +18%',
    status: 'Warning',
    x: '55%',
    y: '74%',
    tone: '#F59E0B',
    availabilityPercent: 78,
    availableParts: ['Servo coupling kit CPL-SM-204', 'Grease NLGI-2', 'M8 mounting hardware'],
    missingParts: ['Servo motor encoder cable'],
    openWorkOrders: [{id: 'WO-9833', title: 'Lubrication routine', meta: 'Due May 20 - P. Costa', status: 'Scheduled'}],
    openMaintenanceRequests: [{id: 'MR-4492', title: 'Vibration trend verification', meta: 'Created from PdM alert', priority: 'High'}],
  },
  {
    id: 'nozzle-cluster',
    label: 'H2',
    title: 'Nozzle Cluster NC-12',
    meta: 'Aligned',
    status: 'Nominal',
    x: '59%',
    y: '39%',
    tone: '#52B36A',
    availabilityPercent: 94,
    availableParts: ['Nozzle shim set SHIM-NC-12', 'Filling head seal kit', 'Food-grade lubricant'],
    missingParts: [],
    openWorkOrders: [],
    openMaintenanceRequests: [{id: 'MR-4471', title: 'Noise investigation - Filling Head #2', meta: 'Due May 18 - Operator report', priority: 'Operator'}],
  },
  {
    id: 'drive-bearing',
    label: 'H3',
    title: 'Drive Bearing 6204-ZZ',
    meta: 'Low stock',
    status: 'Inspect',
    x: '46%',
    y: '51%',
    tone: '#FF5B4D',
    availabilityPercent: 62,
    availableParts: ['Bearing 6204-ZZ - 2 in stock', 'Retaining ring 20 mm', 'Grease NLGI-2'],
    missingParts: ['Bearing 6204-2RS reserve stock', 'OEM puller adapter'],
    openWorkOrders: [{id: 'WO-9821', title: 'Bearing inspection', meta: 'Due May 24 - J. Tanaka', status: 'High'}],
    openMaintenanceRequests: [{id: 'MR-4488', title: 'Air leak check pneumatic line', meta: 'Due May 22 - Operator report', priority: 'Medium'}],
  },
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
  'Under Review': {bg: '#EEF4FF', border: '#C7D7FE', text: '#1D4ED8', solid: '#2563EB'},
  Maintenance: {bg: '#F5F3FF', border: '#DDD6FE', text: '#6D28D9', solid: '#7C3AED'},
  Disabled: {bg: '#F1F5F9', border: '#CBD5E1', text: '#475569', solid: '#64748B'},
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
    moldId: 'MOLD-FH-12',
    machineNumber: 'MM-301',
    productPartNumber: 'PN-SYR-5ML',
    firstPieceInspectionResult: 'Cavity 4 flash observed during first piece check.',
    passFailOutcome: 'Fail',
    checkedCavities: [
      {cavity: 'C1', result: 'Pass'},
      {cavity: 'C4', result: 'Fail'},
      {cavity: 'C6', result: 'Pass'},
      {cavity: 'C12', result: 'Pass'},
      {cavity: 'C19', result: 'Pass'},
      {cavity: 'C33', result: 'Pass'},
      {cavity: 'C48', result: 'Pass'},
      {cavity: 'C58', result: 'Pass'},
      {cavity: 'C75', result: 'Pass'},
      {cavity: 'C94', result: 'Pass'},
    ],
    responsibleUser: 'M. Rivera',
    inspectionDateTime: 'Mar 02, 2026, 07:48 AM',
    commentsOrAttachments: 'flash-photo-c4.png, inspection-form.pdf',
    title: 'Cavity 4 flash observed during first piece check.',
    status: 'NG',
    affectedCavities: [4],
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
      moldNumber: 'MOLD-FH-12',
      workOrder: 'WO-2026-2190',
      partNumber: 'PN-SYR-5ML',
      material: 'PP medical grade',
      lotBatch: 'LOT-26-0302',
      firstPieceApproved: 'No',
      overallStatus: 'NG',
      affectedCavities: [4],
      defectType: 'Flash',
      description: 'Cavity 4 flash observed during first piece check.',
      immediateAction: 'Stopped machine for tool inspection and held parts.',
      rootCause: 'Parting line wear suspected.',
      disposition: 'Stop machine',
      attachments: 'flash-photo-c4.png, inspection-form.pdf',
      cavityDetails: createCavityDetails([4], {
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

const pageText = tokenText.primary;
const mutedText = tokenText.secondary;
const blue = tokenBrand.main;
const sparkValues = [8, 34, 42, 47, 53, 54, 61, 67, 67, 86];

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
  return hierarchyItems.find((item) => item.code === equipmentId)?.label ?? `Equipment ${equipmentId}`;
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

function getHierarchyPathLabels(hierarchyId: string) {
  const targetIndex = hierarchyItems.findIndex((item) => item.id === hierarchyId);
  if (targetIndex < 0) return [];

  const target = hierarchyItems[targetIndex];
  const path: HierarchyItem[] = [target];
  let nextLevel = target.level - 1;

  for (let index = targetIndex - 1; index >= 0 && nextLevel >= 0; index -= 1) {
    const candidate = hierarchyItems[index];
    if (candidate.level === nextLevel) {
      path.unshift(candidate);
      nextLevel -= 1;
    }
  }

  return path.map((item) => item.label);
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
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${viewHeight}`} preserveAspectRatio="xMidYMid meet" style={{display: 'block', overflow: 'visible'}}>
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

function PerformanceAreaChart({
  values,
  color,
  xStart,
  xEnd = 'Today',
  yLabel,
}: {
  values: number[];
  color: string;
  xStart: string;
  xEnd?: string;
  yLabel: string;
}) {
  const chartId = `performanceArea${useId().replace(/:/g, '')}`;
  const maxValue = Math.max(...values, 1);
  const yMax = Math.ceil(maxValue / 10) * 10;
  const midValue = Math.round(yMax / 2);
  const chartData = values.map((value, index) => ({
    label: index === 0 ? xStart : index === values.length - 1 ? xEnd : '',
    value,
  }));

  return (
    <Box sx={{height: 104, minWidth: 0}}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{top: 6, right: 2, left: -18, bottom: 0}}>
          <defs>
            <linearGradient id={chartId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.32} />
              <stop offset="95%" stopColor={color} stopOpacity={0.08} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="#E7EDF5" strokeDasharray="0" />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            interval={0}
            minTickGap={0}
            tick={{fill: tokenText.secondary, fontSize: 9, fontWeight: 700}}
            height={18}
          />
          <YAxis
            domain={[0, yMax]}
            ticks={[0, midValue, yMax]}
            axisLine={false}
            tickLine={false}
            tick={{fill: tokenText.secondary, fontSize: 9, fontWeight: 700}}
            width={34}
            label={{value: yLabel, position: 'insideTopLeft', offset: -4, fill: tokenText.secondary, fontSize: 9, fontWeight: 700}}
          />
          <ChartTooltip
            cursor={{stroke: '#C7D2E4', strokeWidth: 1}}
            contentStyle={{border: '1px solid #D8E0EB', borderRadius: 8, boxShadow: '0 8px 20px rgba(15,23,42,0.08)', fontSize: 11, fontWeight: 700}}
            labelStyle={{display: 'none'}}
            formatter={(value: number) => [value, yLabel]}
          />
          <Area
            type="linear"
            dataKey="value"
            stroke={color}
            strokeWidth={1.8}
            fill={`url(#${chartId})`}
            dot={false}
            activeDot={{r: 3.5, stroke: color, strokeWidth: 1.5, fill: '#FFFFFF'}}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Box>
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
    <Paper elevation={0} sx={{border: `1px solid ${tokenDivider}`, borderRadius: '12px', p: 2, bgcolor: 'background.paper', ...sx}}>
      <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.2, mb: 1.4}}>
        <Typography variant="subtitle2" sx={{color: tokenText.primary, fontWeight: 500, lineHeight: 1.57, letterSpacing: '0.1px', display: 'flex', alignItems: 'center', gap: 1}}>
          {Icon ? <Icon sx={{color: tokenBrand.main, fontSize: 20}} /> : null}
          {title}
        </Typography>
        {action}
      </Box>
      {children}
    </Paper>
  );
}

function RowBadge({label}: {label: string}) {
  return <Chip label={label} size="small" sx={{height: 26, bgcolor: tokenNeutral.lighter, border: 'none', borderRadius: '999px', color: tokenText.primary, fontSize: '0.8125rem', fontWeight: 400, '& .MuiChip-label': {px: 1}}} />;
}

function Asset3DVisualization() {
  const [selectedHotspot, setSelectedHotspot] = useState<AssetStructureHotspot | null>(null);
  const availabilityTone = selectedHotspot
    ? selectedHotspot.availabilityPercent >= 85
      ? '#22C55E'
      : selectedHotspot.availabilityPercent >= 70
        ? '#F59E0B'
        : '#FF5B4D'
    : '#64748B';

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          minHeight: {xs: 320, md: 520},
          borderRadius: 2,
          border: '1px solid #E3E8F1',
          bgcolor: '#EDF4FA',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <Box sx={{position: 'absolute', top: 14, left: 14, zIndex: 3, display: 'flex', flexWrap: 'wrap', gap: 0.8}}>
          <Chip label="SA-204" size="small" sx={{height: 26, bgcolor: '#0F172A', color: '#FFFFFF', fontWeight: 900}} />
        </Box>

        <Box
          component="img"
          src="/images/OEE Equipament.png"
          alt="SA-204 production line equipment"
          sx={{
            display: 'block',
            width: '100%',
            height: {xs: 320, sm: 420, md: 560},
            objectFit: 'contain',
            objectPosition: 'center',
            userSelect: 'none',
            pointerEvents: 'none',
          }}
        />

        {assetHotspots.map((spot) => (
            <Button
              key={spot.id}
              aria-label={`Open component details for ${spot.title}`}
              onClick={() => setSelectedHotspot(spot)}
              sx={{
                position: 'absolute',
                left: spot.x,
                top: spot.y,
                transform: 'translate(-50%, -50%)',
                minWidth: 0,
                width: 34,
                height: 34,
                borderRadius: '50%',
                bgcolor: '#FFFFFF',
                border: `2px solid ${spot.tone}`,
                boxShadow: `0 0 0 7px ${spot.tone}26, 0 10px 20px rgba(15,23,42,0.14)`,
                display: 'grid',
                placeItems: 'center',
                p: 0,
                zIndex: 4,
                transition: 'transform 150ms ease, box-shadow 150ms ease',
                '&:hover': {bgcolor: '#FFFFFF', transform: 'translate(-50%, -50%) scale(1.08)', boxShadow: `0 0 0 9px ${spot.tone}32, 0 14px 24px rgba(15,23,42,0.18)`},
                '&:focus-visible': {outline: `3px solid ${spot.tone}`, outlineOffset: 3},
              }}
            >
              <Typography sx={{fontSize: '0.58rem', color: spot.tone, fontWeight: 900}}>{spot.label}</Typography>
            </Button>
        ))}

        {selectedHotspot ? (
          <Paper
            elevation={0}
            sx={{
              position: 'absolute',
              zIndex: 6,
              top: {xs: 'auto', md: 72},
              right: {xs: 12, md: 18},
              bottom: {xs: 12, md: 'auto'},
              left: {xs: 12, md: 'auto'},
              width: {xs: 'auto', md: 360},
              maxHeight: {xs: 300, md: 420},
              overflowY: 'auto',
              border: '1px solid #D8E3F2',
              borderRadius: 1.5,
              bgcolor: '#FFFFFFF2',
              backdropFilter: 'blur(6px)',
              boxShadow: '0 18px 44px rgba(15,23,42,0.16)',
            }}
          >
            <Box sx={{display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.2, px: 1.2, py: 1, borderBottom: '1px solid #E7EDF6'}}>
              <Box sx={{minWidth: 0}}>
                <Typography sx={{color: pageText, fontWeight: 900, fontSize: '0.95rem', lineHeight: 1.15}}>
                  {selectedHotspot.title}
                </Typography>
                <Typography variant="caption" sx={{color: mutedText, fontWeight: 800}}>
                  {selectedHotspot.label} - {selectedHotspot.meta}
                </Typography>
              </Box>
              <Box sx={{display: 'flex', alignItems: 'center', gap: 0.6}}>
                <Chip label={selectedHotspot.status} size="small" sx={{height: 22, bgcolor: `${selectedHotspot.tone}16`, color: selectedHotspot.tone, border: `1px solid ${selectedHotspot.tone}55`, fontSize: '0.66rem', fontWeight: 900}} />
                <IconButton
                  aria-label="Close component details"
                  size="small"
                  onClick={() => setSelectedHotspot(null)}
                  sx={{width: 26, height: 26, bgcolor: '#EEF2F7', color: '#64748B', '&:hover': {bgcolor: '#E2E8F0', color: pageText}}}
                >
                  <DownIcon sx={{fontSize: 16, transform: 'rotate(180deg)'}} />
                </IconButton>
              </Box>
            </Box>

            <Box sx={{display: 'grid'}}>
              <Box sx={{px: 1.2, py: 1, borderBottom: '1px solid #E7EDF6'}}>
                <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1}}>
                  <Typography variant="caption" sx={{color: mutedText, fontWeight: 900}}>Spare parts availability</Typography>
                  <Typography sx={{color: availabilityTone, fontWeight: 900, fontSize: '1.25rem', lineHeight: 1}}>
                    {selectedHotspot.availabilityPercent}%
                  </Typography>
                </Box>
                <Box sx={{mt: 0.75, height: 7, borderRadius: 99, bgcolor: '#E2E8F0', overflow: 'hidden'}}>
                  <Box sx={{width: `${selectedHotspot.availabilityPercent}%`, height: '100%', bgcolor: availabilityTone, borderRadius: 99}} />
                </Box>
              </Box>

              <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))'}, gap: 0.8, px: 1.2, py: 1, borderBottom: '1px solid #E7EDF6'}}>
                <Paper elevation={0} sx={{border: '1px solid #DCFCE7', borderRadius: 1.1, bgcolor: '#F0FDF4', p: 0.9}}>
                  <Typography variant="caption" sx={{color: '#15803D', fontWeight: 900}}>Available</Typography>
                  <Box sx={{display: 'grid', gap: 0.35, mt: 0.55}}>
                    {selectedHotspot.availableParts.slice(0, 3).map((part) => (
                      <Typography key={part} variant="caption" sx={{color: pageText, fontWeight: 700}}>- {part}</Typography>
                    ))}
                  </Box>
                </Paper>
                <Paper elevation={0} sx={{border: `1px solid ${selectedHotspot.missingParts.length ? '#FECACA' : '#DCFCE7'}`, borderRadius: 1.1, bgcolor: selectedHotspot.missingParts.length ? '#FEF2F2' : '#F0FDF4', p: 0.9}}>
                  <Typography variant="caption" sx={{color: selectedHotspot.missingParts.length ? '#B91C1C' : '#15803D', fontWeight: 900}}>Missing</Typography>
                  <Box sx={{display: 'grid', gap: 0.35, mt: 0.55}}>
                    {(selectedHotspot.missingParts.length ? selectedHotspot.missingParts : ['No shortage risk']).map((part) => (
                      <Typography key={part} variant="caption" sx={{color: pageText, fontWeight: 700}}>- {part}</Typography>
                    ))}
                  </Box>
                </Paper>
              </Box>

              <Box sx={{px: 1.2, py: 1, borderBottom: '1px solid #E7EDF6'}}>
                <Typography variant="caption" sx={{color: mutedText, fontWeight: 900}}>Open work orders</Typography>
                <Box sx={{display: 'grid', gap: 0.6, mt: 0.65}}>
                  {(selectedHotspot.openWorkOrders.length ? selectedHotspot.openWorkOrders : [{id: 'None', title: 'No open work order', meta: 'No active execution demand', status: 'Clear'}]).map((order) => (
                    <Box key={order.id} sx={{display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: 0.7, alignItems: 'center', border: '1px solid #E2EAF5', borderRadius: 1, px: 0.9, py: 0.65}}>
                      <Box sx={{minWidth: 0}}>
                        <Typography variant="caption" sx={{color: pageText, fontWeight: 900}}>{order.id} - {order.title}</Typography>
                        <Typography variant="caption" sx={{color: mutedText, display: 'block'}}>{order.meta}</Typography>
                      </Box>
                      <Chip label={order.status} size="small" sx={{height: 21, bgcolor: '#F8FAFC', border: '1px solid #D7DDE6', color: pageText, fontSize: '0.65rem', fontWeight: 900}} />
                    </Box>
                  ))}
                </Box>
              </Box>

              <Box sx={{px: 1.2, py: 1}}>
                <Typography variant="caption" sx={{color: mutedText, fontWeight: 900}}>Open maintenance requests</Typography>
                <Box sx={{display: 'grid', gap: 0.6, mt: 0.65}}>
                  {(selectedHotspot.openMaintenanceRequests.length ? selectedHotspot.openMaintenanceRequests : [{id: 'None', title: 'No open maintenance request', meta: 'No operator abnormality linked', priority: 'Clear'}]).map((request) => (
                    <Box key={request.id} sx={{display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: 0.7, alignItems: 'center', border: '1px solid #E2EAF5', borderRadius: 1, px: 0.9, py: 0.65}}>
                      <Box sx={{minWidth: 0}}>
                        <Typography variant="caption" sx={{color: pageText, fontWeight: 900}}>{request.id} - {request.title}</Typography>
                        <Typography variant="caption" sx={{color: mutedText, display: 'block'}}>{request.meta}</Typography>
                      </Box>
                      <Chip label={request.priority} size="small" sx={{height: 21, bgcolor: '#FFF7ED', border: '1px solid #FED7AA', color: '#C2410C', fontSize: '0.65rem', fontWeight: 900}} />
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          </Paper>
        ) : null}
      </Paper>
    </>
  );
}

function PerformanceTab() {
  const kpiTone = (label: string) => {
    if (label === 'AVAILABILITY' || label === 'MAINT. COST') return tokenSuccess.main;
    if (label === 'OEE') return tokenWarning.main;
    return tokenText.secondary;
  };

  const chartPanelSx = {
    border: `1px solid ${tokenDivider}`,
    borderRadius: '12px',
    bgcolor: 'background.paper',
    overflow: 'hidden',
  };

  const microChipSx = {
    height: 26,
    bgcolor: tokenNeutral.lighter,
    color: tokenText.primary,
    border: 'none',
    borderRadius: '999px',
    fontSize: '0.8125rem',
    fontWeight: 400,
    '& .MuiChip-label': {px: 0.8},
  };

  const compactRows = [
    {
      title: 'Repeat Failures',
      items: [
        {label: 'BRG-WEAR-OUT', chips: ['X3', '14 DAYS AGO'], tone: tokenText.secondary},
        {label: 'ALIGN-MISFILL', chips: ['X2', '23 DAYS AGO'], tone: tokenText.secondary},
        {label: 'LUBR-LOW', chips: ['X2', '46 DAYS AGO'], tone: tokenText.secondary},
      ],
    },
    {
      title: 'Condition Monitoring',
      items: [
        {label: 'Grease NLGI-2', chips: ['4.8 MM/S'], tone: tokenWarning.main},
        {label: 'Bearing Temp', chips: ['58 C'], tone: tokenSuccess.main},
        {label: 'Motor Current', chips: ['9.2 A'], tone: tokenSuccess.main},
      ],
    },
  ];

  return (
    <Box sx={{display: 'grid', alignContent: 'start', gap: 1.5, minHeight: '100%', px: 2, py: 2, fontFamily: 'Roboto, Inter, Segoe UI, sans-serif'}}>
      <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(5, minmax(0, 1fr))'}, gap: 1}}>
        {performanceCards.map((card) => {
          const valueMatch = card.value.match(/^(.+?)([%a-zA-Z]*)$/);
          const value = valueMatch?.[1]?.trim() ?? card.value;
          const unit = valueMatch?.[2] ?? '';
          const tone = kpiTone(card.label);

          return (
            <Paper
              key={card.label}
              elevation={0}
              sx={{
                minHeight: 62,
                border: `1px solid ${tokenDivider}`,
                borderRadius: '8px',
                bgcolor: tokenNeutral.lightest,
                position: 'relative',
                overflow: 'hidden',
                px: 1.15,
                py: 0.9,
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1fr) auto',
                alignItems: 'start',
                gap: 1,
                '&:before': {
                  content: '""',
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: 5,
                  bgcolor: tone,
                },
              }}
            >
              <Box sx={{minWidth: 0, pl: 0.45}}>
                <Box sx={{display: 'flex', alignItems: 'baseline', gap: 0.45, minWidth: 0}}>
                  <Typography sx={{color: tokenText.primary, fontSize: '1.5rem', lineHeight: 1, fontWeight: 400, letterSpacing: 0}}>
                    {value}
                  </Typography>
                  {unit ? (
                    <Typography sx={{color: tokenText.secondary, fontSize: '0.875rem', lineHeight: 1, fontWeight: 500}}>
                      {unit}
                    </Typography>
                  ) : null}
                </Box>
                <Typography sx={{mt: 0.25, color: tokenText.primary, fontSize: '0.75rem', lineHeight: 1.1, fontWeight: 500, letterSpacing: 0}}>
                  {card.label === 'MAINT. COST' ? 'Maint. Cost' : card.label}
                </Typography>
              </Box>
              <Box sx={{display: 'grid', justifyItems: 'end', gap: 0.55, pt: 0.05}}>
                <Typography sx={{color: tokenText.secondary, fontSize: '0.625rem', lineHeight: 1, fontWeight: 700, textTransform: 'uppercase', whiteSpace: 'nowrap'}}>
                  {card.target}
                </Typography>
                <Chip label={card.trend} size="small" sx={{...microChipSx, maxWidth: 130, '& .MuiChip-label': {...microChipSx['& .MuiChip-label'], overflow: 'hidden', textOverflow: 'ellipsis'}}} />
              </Box>
            </Paper>
          );
        })}
      </Box>

      <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', xl: 'repeat(2, minmax(0, 1fr))'}, gap: 1.5}}>
        {[
          {title: 'Unplanned Downtime (30d)', yLabel: 'Minutes', chips: ['3.2 hours total', '4 events'], values: sparkValues, xStart: '30d'},
          {title: 'Failure Trend (90d)', yLabel: 'Failure', chips: ['Decreasing', '2 failures last 30d (vs 5 prior)'], values: [9, 38, 47, 53, 59, 60, 67, 74, 74, 101], xStart: '90d'},
        ].map((panel) => (
          <Paper key={panel.title} elevation={0} sx={chartPanelSx}>
            <Box sx={{px: 1.5, pt: 1.25, pb: 0.4, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.5}}>
              <Typography variant="subtitle2" sx={{color: tokenText.primary, fontWeight: 500, lineHeight: 1.57}}>{panel.title}</Typography>
              <Box sx={{display: 'flex', alignItems: 'center', gap: 0.6, flexWrap: 'wrap', justifyContent: 'flex-end'}}>
                {panel.chips.map((chip) => <Chip key={chip} label={chip} size="small" sx={microChipSx} />)}
                <InsightIcon sx={{fontSize: 19, color: tokenBrand.light}} />
              </Box>
            </Box>
            <Box sx={{px: 1.5, pb: 1.1}}>
              <PerformanceAreaChart values={panel.values} color={tokenBrand.main} xStart={panel.xStart} yLabel={panel.yLabel} />
            </Box>
          </Paper>
        ))}
      </Box>

      <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', md: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(4, minmax(0, 1fr))'}, gap: 1.5}}>
        <PerformanceCompactPanel title="Cost by parts used" action="$640 parts">
          {costPartRows.map((item, index) => (
            <PerformanceDataRow
              key={`${item.part}-${index}`}
              label={item.part}
              chips={[item.qty.toUpperCase(), `UNIT COST ${item.unitCost}`, item.total]}
              tone={index === 1 ? tokenText.secondary : tokenText.disabled}
              accentChip={item.total}
            />
          ))}
        </PerformanceCompactPanel>

        <PerformanceCompactPanel title="Cost by Labor Used" action="$2,250 labor">
          {laborCostRows.slice(0, 3).map((item) => (
            <PerformanceDataRow
              key={`${item.role}-${item.skill}`}
              label={item.role}
              chips={[item.skill.toUpperCase(), item.hours.toUpperCase(), `RATE ${item.rate}`, item.total]}
              tone={item.dot === '#F59E0B' ? tokenWarning.main : item.dot === '#EF4444' ? tokenError.main : tokenSuccess.main}
              accentChip={item.total}
            />
          ))}
        </PerformanceCompactPanel>

        {compactRows.map((panel) => (
          <PerformanceCompactPanel key={panel.title} title={panel.title}>
            {panel.items.map((item) => (
              <PerformanceDataRow key={item.label} label={item.label} chips={item.chips} tone={item.tone} />
            ))}
          </PerformanceCompactPanel>
        ))}
      </Box>
    </Box>
  );
}

function PerformanceCompactPanel({title, action, children}: {title: string; action?: string; children: React.ReactNode}) {
  return (
    <Paper elevation={0} sx={{border: `1px solid ${tokenDivider}`, borderRadius: '12px', bgcolor: 'background.paper', px: 1.5, py: 1.25, minWidth: 0}}>
      <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1.1}}>
        <Typography variant="subtitle2" sx={{color: tokenText.primary, fontWeight: 500, lineHeight: 1.57}}>{title}</Typography>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 0.55}}>
          {action ? <Chip label={action} size="small" sx={{height: 26, bgcolor: tokenNeutral.lighter, color: tokenText.primary, border: 'none', borderRadius: '999px', fontSize: '0.8125rem', fontWeight: 400}} /> : null}
          <InsightIcon sx={{fontSize: 18, color: tokenBrand.light}} />
        </Box>
      </Box>
      <Box sx={{display: 'grid', gap: 0.75}}>{children}</Box>
    </Paper>
  );
}

function PerformanceDataRow({label, chips, tone, accentChip}: {label: string; chips: string[]; tone: string; accentChip?: string}) {
  return (
    <Paper
      elevation={0}
      sx={{
        border: `1px solid ${tokenDivider}`,
        borderRadius: '8px',
        bgcolor: 'background.paper',
        minHeight: 48,
        position: 'relative',
        overflow: 'hidden',
        px: 1.15,
        py: 0.9,
        '&:before': {content: '""', position: 'absolute', left: 0, top: 0, bottom: 0, width: 5, bgcolor: tone},
      }}
    >
      <Typography sx={{color: tokenText.primary, fontSize: '0.875rem', lineHeight: 1.2, fontWeight: 500, pl: 0.45, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
        {label}
      </Typography>
      <Box sx={{mt: 0.65, pl: 0.45, display: 'flex', alignItems: 'center', gap: 0.45, flexWrap: 'wrap'}}>
        {chips.map((chip) => {
          const isAccent = accentChip === chip;
          return (
            <Chip
              key={chip}
              label={chip}
              size="small"
              sx={{
                height: 24,
                bgcolor: isAccent ? tokenBrand.main : tokenNeutral.lighter,
                color: isAccent ? tokenBrand.contrast : tokenText.primary,
                border: 'none',
                borderRadius: '999px',
                fontSize: '0.8125rem',
                fontWeight: 400,
                '& .MuiChip-label': {px: 0.65},
              }}
            />
          );
        })}
      </Box>
    </Paper>
  );
}
function FutureActionsTab() {
  const listRowSx = {
    display: 'grid',
    gridTemplateColumns: 'auto minmax(0, 1fr) auto',
    gap: 1.5,
    alignItems: 'center',
    py: 1,
  };

  return (
    <Box sx={{display: 'grid', alignContent: 'start', gap: 2, minHeight: '100%'}}>
      <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', xl: 'repeat(2, minmax(0, 1fr))'}, gap: 2}}>
        <SectionCard title="Open Work Orders" icon={MaintenanceIcon}>
          <Box sx={{display: 'grid'}}>
            {futureOpenWorkOrders.map((order, index) => (
              <Box key={order.id}>
                <Box sx={listRowSx}>
                  <RowBadge label={order.id} />
                  <Box sx={{minWidth: 0}}>
                    <Typography variant="body2" sx={{fontWeight: 400, color: tokenText.primary, lineHeight: 1.43}}>{order.title}</Typography>
                    <Typography variant="caption" sx={{color: tokenText.secondary, display: 'block', mt: 0.25}}>
                      {order.meta}
                    </Typography>
                  </Box>
                  <Chip label={order.priority} size="small" sx={{height: 26, bgcolor: tokenBrand.softBg, color: tokenBrand.main, borderRadius: '999px', fontSize: '0.8125rem', fontWeight: 400}} />
                </Box>
                {index < futureOpenWorkOrders.length - 1 ? <Divider sx={{borderColor: tokenDivider}} /> : null}
              </Box>
            ))}
          </Box>
        </SectionCard>

        <SectionCard title="Open Maintenance Requests" icon={AlertIcon}>
          <Box sx={{display: 'grid'}}>
            {maintenanceRequests.map((request, index) => (
              <Box key={request.id}>
                <Box sx={listRowSx}>
                  <RowBadge label={request.id} />
                  <Box sx={{minWidth: 0}}>
                    <Typography variant="body2" sx={{fontWeight: 400, color: tokenText.primary, lineHeight: 1.43}}>{request.title}</Typography>
                    <Typography variant="caption" sx={{color: tokenText.secondary, display: 'block', mt: 0.25}}>
                      {request.meta}
                    </Typography>
                  </Box>
                  <Chip label={request.priority} size="small" sx={{height: 26, bgcolor: tokenBrand.softBg, color: tokenBrand.main, borderRadius: '999px', fontSize: '0.8125rem', fontWeight: 400}} />
                </Box>
                {index < maintenanceRequests.length - 1 ? <Divider sx={{borderColor: tokenDivider}} /> : null}
              </Box>
            ))}
          </Box>
        </SectionCard>
      </Box>

      <SectionCard title="Upcoming PMs (90 days)" icon={CalendarIcon}>
        <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', lg: 'repeat(3, minmax(0, 1fr))'}, gap: 1.5}}>
          {upcomingPms.map((pm) => (
            <Paper key={pm.title} elevation={0} sx={{border: `1px solid ${tokenDivider}`, borderRadius: '12px', px: 1.5, py: 1.5, bgcolor: 'background.paper'}}>
              <Typography variant="caption" sx={{color: tokenBrand.main, fontWeight: 700, display: 'block'}}>{pm.date}</Typography>
              <Typography variant="subtitle2" sx={{color: tokenText.primary, fontWeight: 500, lineHeight: 1.57, mt: 0.5}}>{pm.title}</Typography>
              <Typography variant="body2" sx={{color: tokenText.secondary, mt: 0.5}}>{pm.owner}</Typography>
            </Paper>
          ))}
        </Box>
      </SectionCard>

      <SectionCard title="Planned Shutdown Activities" icon={TimelineIcon}>
        <Paper elevation={0} sx={{border: `1px solid ${tokenDivider}`, borderRadius: '12px', px: 2, py: 1.5, bgcolor: 'background.paper', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, flexWrap: 'wrap'}}>
          <Box sx={{minWidth: 0}}>
            <Typography variant="subtitle2" sx={{color: tokenText.primary, fontWeight: 500, lineHeight: 1.57}}>Q2 Planned Shutdown - Jun 8-10, 2026</Typography>
            <Typography variant="body2" sx={{color: tokenText.secondary, mt: 0.5}}>5 activities scheduled - 22h total estimated</Typography>
          </Box>
          <Chip label="Scheduled" size="small" sx={{height: 26, bgcolor: tokenBrand.softBg, color: tokenBrand.main, borderRadius: '999px', fontSize: '0.8125rem', fontWeight: 400}} />
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
            sx={{
              mb: 1.1,
              '& .MuiOutlinedInput-root': {height: 32, borderRadius: '8px', bgcolor: 'background.paper'},
              '& .MuiOutlinedInput-notchedOutline': {borderColor: tokenDivider},
              '&:hover .MuiOutlinedInput-notchedOutline': {borderColor: tokenBrand.main},
              '& .MuiInputBase-input': {fontSize: '0.875rem'},
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{color: tokenText.secondary, fontSize: 18}} />
                </InputAdornment>
              ),
            }}
          />
          <Box sx={{display: 'grid', gap: 0.1}}>
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
                    minHeight: 44,
                    display: 'grid',
                    gridTemplateColumns: '18px 18px minmax(0, 1fr) auto',
                    alignItems: 'center',
                    columnGap: 0.75,
                    mx: 1,
                    pl: `${0.35 + row.level * 0.42}rem`,
                    pr: 1,
                    py: 0.7,
                    borderRadius: '8px',
                    cursor: isAssembly ? 'pointer' : 'default',
                    border: '1px solid transparent',
                    color: pageText,
                    fontWeight: isAssembly ? 700 : 500,
                    overflow: 'hidden',
                    '&:hover': {bgcolor: tokenNeutral.lightest},
                    '&:focus-visible': {outline: `2px solid ${tokenBrand.main}`, outlineOffset: 1},
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
                      onKeyDown={(event) => event.stopPropagation()}
                      sx={{
                        width: 20,
                        height: 20,
                        color: '#94A3B8',
                        '&:hover': {bgcolor: tokenBrand.softBg, color: tokenBrand.main},
                      }}
                    >
                      {isExpanded ? <DownIcon sx={{fontSize: 15}} /> : <ChevronRightIcon sx={{fontSize: 15}} />}
                    </IconButton>
                  ) : (
                    <Box sx={{width: 20, height: 20}} />
                  )}
                  <ItemIcon sx={{fontSize: isAssembly ? 17 : 16, color: isAssembly ? tokenBrand.main : tokenText.secondary, flexShrink: 0}} />
                  <Typography
                    variant="body2"
                    title={`${row.label} - ${row.qty}`}
                    sx={{
                      minWidth: 0,
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitBoxOrient: 'vertical',
                      WebkitLineClamp: 2,
                      color: 'inherit',
                      fontSize: '0.8125rem',
                      lineHeight: 1.25,
                      fontWeight: 'inherit',
                      letterSpacing: 0,
                    }}
                  >
                    {row.label} <Box component="span" sx={{color: tokenText.secondary, fontWeight: 500}}>{'\u2022'} {row.qty}</Box>
                  </Typography>
                  <Chip
                    label={row.code}
                    size="small"
                    sx={{
                      height: 20,
                      maxWidth: 76,
                      justifySelf: 'end',
                      bgcolor: tokenCommon.white,
                      border: `1px solid ${tokenDivider}`,
                      color: tokenText.secondary,
                      borderRadius: '999px',
                      fontSize: '0.625rem',
                      fontWeight: 700,
                      '& .MuiChip-label': {px: 0.75, overflow: 'hidden', textOverflow: 'ellipsis'},
                    }}
                  />
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
                    height: 26,
                    bgcolor: part.warn ? tokenWarning.lightest : tokenNeutral.lighter,
                    color: part.warn ? tokenWarning.dark : tokenText.primary,
                    border: 'none',
                    borderRadius: '999px',
                    fontSize: '0.8125rem',
                    fontWeight: 400,
                    '& .MuiChip-label': {px: 1},
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
                  <DocumentIcon sx={{fontSize: 16, color: tokenText.secondary}} />
                  {doc.title}
                </Typography>
                <Chip label={doc.type} size="small" sx={{height: 26, bgcolor: tokenNeutral.lighter, border: 'none', borderRadius: '999px', color: tokenText.primary, fontSize: '0.8125rem', fontWeight: 400}} />
              </Box>
            ))}
          </Box>
        </SectionCard>
      </Box>
    </Box>
  );
}

function ReliabilityTab({
  onReviewAiEvidence,
}: {
  onReviewAiEvidence: (recommendation: AiRecommendation) => void;
}) {
  const metricRows = [
    {label: 'PM Compliance', value: '96%', color: tokenSuccess.main, sub: ''},
    {label: 'PM Yield', value: '82%', color: tokenWarning.main, sub: 'Findings per PM'},
    {label: 'Reactive Ratio', value: '18%', color: tokenWarning.main, sub: 'Target < 15%'},
  ];
  const rcaRows = [
    {id: 'RCA-204-12', title: 'Recurring bearing wear', status: 'In progress', tone: tokenWarning.main},
    {id: 'RCA-204-11', title: 'Filling head misalignment', status: 'Closed', tone: tokenBrand.main},
    {id: 'RCA-204-10', title: 'Lubrication starvation', status: 'Closed', tone: tokenBrand.main},
  ];

  return (
    <Box sx={{display: 'grid', gap: 2}}>
      <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', xl: 'minmax(0, 2fr) minmax(360px, 1fr)'}, gap: 2}}>
        <SectionCard title="Failure History (12 months)" icon={TimelineIcon}>
          <Box sx={{display: 'grid'}}>
            {failureHistory.map((item, index) => (
              <Box key={`${item.date}-${item.code}`}>
                <Box sx={{display: 'grid', gridTemplateColumns: '56px auto minmax(0, 1fr) auto', gap: 1.5, alignItems: 'center', py: 1}}>
                  <Typography variant="body2" sx={{color: tokenText.secondary}}>{item.date}</Typography>
                  <RowBadge label={item.code} />
                  <Typography variant="body2" sx={{color: tokenText.primary}}>{item.title}</Typography>
                  <Chip label={item.hours} size="small" sx={{height: 26, bgcolor: tokenError.lightest, color: tokenError.dark, borderRadius: '999px', fontSize: '0.8125rem', fontWeight: 400}} />
                </Box>
                {index < failureHistory.length - 1 ? <Divider sx={{borderColor: tokenDivider}} /> : null}
              </Box>
            ))}
          </Box>
        </SectionCard>

        <SectionCard title="Bad Actor Detection" icon={AlertIcon}>
          <Paper elevation={0} sx={{border: `1px solid ${tokenDivider}`, borderRadius: '12px', bgcolor: 'rgba(0,0,0,0.03)', px: 2, py: 1.5}}>
            <Typography variant="subtitle2" sx={{color: tokenError.main, fontWeight: 500, lineHeight: 1.57}}>Filling Head Assembly</Typography>
            <Typography variant="body2" sx={{color: tokenText.primary, mt: 0.5}}>
              Top contributor to downtime on SA-204. 5 failures in 12 months - 9.1h total downtime - est. $4,820 cost.
            </Typography>
          </Paper>
          <Typography variant="caption" sx={{color: tokenText.secondary, fontWeight: 700, display: 'block', mt: 1.5, mb: 1}}>Other monitored components:</Typography>
          <Box sx={{display: 'grid', gap: 1}}>
            {[
              {name: 'Servo Motor SM-204', rank: '#2'},
              {name: 'Drive Belt DB-88', rank: '#3'},
            ].map((row) => (
              <Box key={row.name} sx={{display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: 1, alignItems: 'center'}}>
                <Typography variant="body2" sx={{color: tokenText.primary}}>{row.name}</Typography>
                <RowBadge label={row.rank} />
              </Box>
            ))}
          </Box>
        </SectionCard>
      </Box>

      <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', xl: 'repeat(2, minmax(0, 1fr))'}, gap: 2}}>
        <SectionCard title="PM Effectiveness" icon={ShieldIcon}>
          <Box sx={{display: 'grid', gap: 1.5}}>
            {metricRows.map((row) => (
              <Box key={row.label} sx={{display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', alignItems: 'center', gap: 1}}>
                <Box sx={{minWidth: 0}}>
                  <Typography variant="body2" sx={{color: tokenText.secondary}}>{row.label}</Typography>
                  {row.sub ? <Typography variant="caption" sx={{color: tokenText.secondary}}>{row.sub}</Typography> : null}
                </Box>
                <Typography sx={{color: row.color, fontSize: '1.5rem', lineHeight: 1, fontWeight: 400, letterSpacing: 0}}>{row.value}</Typography>
              </Box>
            ))}
          </Box>
        </SectionCard>

        <SectionCard title="RCA History" icon={TimelineIcon}>
          <Box sx={{display: 'grid', gap: 1.25}}>
            {rcaRows.map((row) => (
              <Box key={row.id} sx={{display: 'grid', gridTemplateColumns: 'auto minmax(0, 1fr) auto', gap: 1, alignItems: 'center'}}>
                <RowBadge label={row.id} />
                <Typography variant="body2" sx={{color: tokenText.primary}}>{row.title}</Typography>
                <Typography variant="body2" sx={{color: row.tone, fontWeight: 500}}>{row.status}</Typography>
              </Box>
            ))}
          </Box>
        </SectionCard>
      </Box>

      <SectionCard title="BLU.AI Insights" icon={InsightIcon} sx={{bgcolor: tokenNeutral.lightest, border: 'none'}}>
        <Box sx={{display: 'grid', gap: 1}}>
          {aiRecommendations.map((recommendation, index) => (
            <Paper key={recommendation.id} elevation={0} sx={{border: index === 0 ? `1px solid ${tokenDivider}` : '1px solid transparent', borderRadius: '6px', bgcolor: index === 0 ? 'rgba(0,0,0,0.03)' : 'transparent', px: 2, py: 1.5}}>
              <Box sx={{display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap'}}>
                <Box sx={{minWidth: 0}}>
                  <Typography variant="body2" sx={{color: tokenText.primary, fontWeight: 700}}>{recommendation.title}</Typography>
                  <Typography variant="caption" sx={{color: tokenText.secondary, display: 'block', mt: 0.25}}>
                    Historical pattern insight - maintenance review required
                  </Typography>
                </Box>
                <Chip label={recommendation.status} size="small" sx={{height: 26, bgcolor: tokenWarning.lightest, color: tokenWarning.dark, borderRadius: '999px', fontSize: '0.8125rem', fontWeight: 400}} />
              </Box>
              <Typography variant="body2" sx={{color: tokenText.secondary, mt: 0.75}}>{recommendation.body}</Typography>
              <Typography variant="body2" sx={{color: tokenBrand.main, fontWeight: 500, mt: 0.75}}>{recommendation.impact}</Typography>
              <Box sx={{display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1.25}}>
                {recommendation.actions.map((action, actionIndex) => (
                  <Button
                    key={action}
                    variant={actionIndex === 0 ? 'outlined' : 'contained'}
                    size="small"
                    onClick={() => onReviewAiEvidence(recommendation)}
                    sx={
                      actionIndex === 0
                        ? {height: 30, borderColor: tokenBrand.main, color: tokenBrand.main, textTransform: 'none', fontWeight: 500, borderRadius: '8px', '&:hover': {borderColor: tokenBrand.dark, bgcolor: tokenBrand.softBg}}
                        : {height: 30, bgcolor: tokenBrand.main, color: tokenBrand.contrast, boxShadow: 'none', textTransform: 'none', fontWeight: 500, borderRadius: '8px', '&:hover': {bgcolor: tokenBrand.dark, boxShadow: 'none'}}
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

function MoldLogbookTab({
  selectedHierarchyId,
  moldingOccurrences,
  onOpenMoldingOccurrence,
}: {
  selectedHierarchyId: string | null;
  moldingOccurrences: MoldLogbookOccurrence[];
  onOpenMoldingOccurrence: (occurrence: MoldLogbookOccurrence) => void;
}) {
  const selectedHierarchy = hierarchyItems.find((item) => item.id === selectedHierarchyId) ?? null;

  if (!isMoldM004Asset(selectedHierarchy)) {
    return (
      <SectionCard title="Mold Logbook" icon={DocumentIcon}>
        <Paper elevation={0} sx={{border: '1px dashed #CBD5E1', borderRadius: 1.6, bgcolor: '#FFFFFF', p: 1.4}}>
          <Typography sx={{color: pageText, fontWeight: 900}}>Select a mold to view its logbook.</Typography>
          <Typography sx={{color: mutedText, fontWeight: 750, mt: 0.35}}>
            Choose Mold M-004 in the asset hierarchy to inspect cavity status, map, history, attachments, and linked MRs.
          </Typography>
        </Paper>
      </SectionCard>
    );
  }

  return (
    <MoldLogbookSection
      asset={selectedHierarchy}
      occurrences={moldingOccurrences}
      onOpenOccurrence={onOpenMoldingOccurrence}
    />
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

function MoldLogbookSection({
  asset,
  occurrences,
  onOpenOccurrence,
}: {
  asset: HierarchyItem;
  occurrences: MoldLogbookOccurrence[];
  onOpenOccurrence: (occurrence: MoldLogbookOccurrence) => void;
}) {
  const moldOccurrences = useMemo(() => getSelectedMoldOccurrences(occurrences), [occurrences]);
  const cavityInventory = useMemo(() => buildCavityInventory(moldOccurrences), [moldOccurrences]);
  const moldHistory = useMemo(() => buildMoldHistoryRecords(moldOccurrences), [moldOccurrences]);
  const attentionCavity = cavityInventory.find((cavity) => cavity.status !== 'OK') ?? cavityInventory[0];
  const [selectedCavityNumber, setSelectedCavityNumber] = useState<number>(attentionCavity?.cavityNumber ?? 1);
  const [cavityQuery, setCavityQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | CavityStatus>('All');
  const [eventTypeFilter, setEventTypeFilter] = useState<'All' | 'Mold Event' | 'Cavity Event'>('All');
  const [mrFilter, setMrFilter] = useState('');
  const [dateFilter, setDateFilter] = useState<'All' | 'May 2026' | 'Mar 2026'>('All');
  const [updatedByFilter, setUpdatedByFilter] = useState('');
  const [attachmentsFilter, setAttachmentsFilter] = useState<'All' | 'With attachments'>('All');
  const [isMoreFiltersOpen, setIsMoreFiltersOpen] = useState(false);
  const [isAllCavitiesOpen, setIsAllCavitiesOpen] = useState(false);
  const [selectedCavityTab, setSelectedCavityTab] = useState<'Details' | 'History' | 'Attachments / MRs'>('Details');
  const [isMoldHistoryOpen, setIsMoldHistoryOpen] = useState(false);
  const [selectedMoldHistoryId, setSelectedMoldHistoryId] = useState(moldHistory[0]?.id ?? '');
  const selectedCavity = cavityInventory.find((cavity) => cavity.cavityNumber === selectedCavityNumber) ?? cavityInventory[0];
  const selectedCavityHistory = selectedCavity ? buildCavityHistory(selectedCavity.cavityNumber, moldOccurrences) : [];
  const selectedMoldHistory = moldHistory.find((record) => record.id === selectedMoldHistoryId) ?? moldHistory[0];
  const cavityStatusMap = useMemo(() => getCavityStatusMap(cavityInventory), [cavityInventory]);
  const overallStatus = getMoldOverallStatus(cavityInventory);
  const overallTone = cavityStatusColors[overallStatus];
  const linkedMrs = moldOccurrences.filter((entry) => entry.relatedMr).length;
  const attachedForms = moldOccurrences.reduce((total, entry) => total + entry.attachedForms.length, 0);
  const attachedFiles = moldOccurrences.reduce((total, entry) => total + entry.attachments.length, 0);
  const selectedMoldNumber = moldOccurrences[0]?.moldId ?? 'MOLD-FH-12';
  const filteredCavities = cavityInventory.filter((cavity) => {
    const matchesCavity = !cavityQuery.trim() || `c${cavity.cavityNumber}`.includes(cavityQuery.trim().toLowerCase()) || String(cavity.cavityNumber).includes(cavityQuery.trim());
    const matchesStatus = statusFilter === 'All' || cavity.status === statusFilter;
    const matchesMr = !mrFilter.trim() || cavity.relatedMr?.toLowerCase().includes(mrFilter.trim().toLowerCase());
    const matchesAttachments = attachmentsFilter === 'All' || Boolean(cavity.lastEvent?.attachments.length);
    const matchesUpdatedBy = !updatedByFilter.trim() || cavity.lastEvent?.updatedBy.toLowerCase().includes(updatedByFilter.trim().toLowerCase());
    return matchesCavity && matchesStatus && matchesMr && matchesAttachments && matchesUpdatedBy;
  });
  const filteredAttentionCavities = filteredCavities.filter((cavity) => cavity.status !== 'OK');
  const hasActiveCavityFilters = Boolean(cavityQuery.trim()) || statusFilter !== 'All' || Boolean(mrFilter.trim()) || attachmentsFilter !== 'All' || Boolean(updatedByFilter.trim());
  const allCavityList = isAllCavitiesOpen || hasActiveCavityFilters ? filteredCavities : [];
  const filteredMoldHistory = moldHistory.filter((record) => {
    const matchesType = eventTypeFilter === 'All' || record.eventType === eventTypeFilter;
    const matchesDate = dateFilter === 'All' || record.dateTime.includes(dateFilter.replace(' ', ', ')) || record.dateTime.includes(dateFilter.split(' ')[0]);
    const matchesMr = !mrFilter.trim() || record.relatedMr?.toLowerCase().includes(mrFilter.trim().toLowerCase());
    const matchesCavity = !cavityQuery.trim() || record.linkedCavities?.some((cavity) => `c${cavity}`.includes(cavityQuery.trim().toLowerCase()) || String(cavity).includes(cavityQuery.trim()));
    const matchesAttachments = attachmentsFilter === 'All' || record.attachmentsCount > 0;
    const matchesUpdatedBy = !updatedByFilter.trim() || record.updatedBy.toLowerCase().includes(updatedByFilter.trim().toLowerCase());
    return matchesType && matchesDate && matchesMr && matchesCavity && matchesAttachments && matchesUpdatedBy;
  });
  const statusCounts = getCavityStatusCounts(cavityStatusMap);

  useEffect(() => {
    if (!cavityInventory.some((cavity) => cavity.cavityNumber === selectedCavityNumber)) {
      setSelectedCavityNumber(attentionCavity?.cavityNumber ?? 1);
    }
  }, [attentionCavity?.cavityNumber, cavityInventory, selectedCavityNumber]);

  return (
    <SectionCard title="Mold Logbook" icon={DocumentIcon}>
      <Box sx={{display: 'grid', gap: 1.1}}>
        <Paper elevation={0} sx={{border: '1px solid #DDE3EA', borderRadius: 1.8, bgcolor: '#FFFFFF', p: 1.15}}>
          <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.2, flexWrap: 'wrap'}}>
            <Box sx={{minWidth: 0}}>
              <Typography sx={{color: pageText, fontWeight: 950, fontSize: '1rem', lineHeight: 1.35}}>
                {asset.code} · {selectedMoldNumber} · {moldOccurrences[0]?.machineNumber ?? asset.code} · {moldLogbookTotalCavities} cavities
              </Typography>
              <Box sx={{display: 'flex', alignItems: 'center', gap: 0.45, flexWrap: 'wrap', mt: 0.65}}>
                <Chip label={`Overall status: ${overallStatus}`} size="small" sx={{height: 22, bgcolor: overallTone.bg, color: overallTone.text, border: `1px solid ${overallTone.border}`, fontWeight: 850}} />
                {(['OK', 'Watch', 'NG', 'Under Review', 'Maintenance', 'Disabled'] as CavityStatus[]).map((status) => {
                  const tone = cavityStatusColors[status];
                  return <Chip key={status} label={`${status}: ${statusCounts[status]}`} size="small" sx={{height: 22, bgcolor: status === 'OK' ? '#F8FAFC' : tone.bg, color: status === 'OK' ? mutedText : tone.text, border: `1px solid ${status === 'OK' ? '#E3E8F1' : tone.border}`, fontWeight: 800}} />;
                })}
                <Chip label={`Linked MRs: ${linkedMrs}`} size="small" sx={{height: 22, bgcolor: '#FFF7ED', color: '#C2410C', border: '1px solid #FED7AA', fontWeight: 800}} />
                <Chip label={`Forms: ${attachedForms}`} size="small" sx={{height: 22, bgcolor: '#F8FAFC', color: pageText, border: '1px solid #D7DDE6', fontWeight: 800}} />
              </Box>
            </Box>
            <Box sx={{display: 'flex', gap: 0.6, flexWrap: 'wrap', justifyContent: 'flex-end'}}>
              {[
                ['Add log', AddIcon],
                ['Attach file', DocumentIcon],
                ['Link MR', ScanIcon],
                ['Export history', TimelineIcon],
              ].map(([label, Icon]) => (
                <Button
                  key={label as string}
                  size="small"
                  variant={label === 'Add log' ? 'contained' : 'outlined'}
                  startIcon={<Icon sx={{fontSize: '15px !important'}} />}
                  sx={{
                    height: 28,
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontWeight: 800,
                    bgcolor: label === 'Add log' ? blue : '#FFFFFF',
                    color: label === 'Add log' ? '#FFFFFF' : pageText,
                    borderColor: '#D7DDE6',
                    boxShadow: 'none',
                    '&:hover': {bgcolor: label === 'Add log' ? '#1D4ED8' : '#F8FAFC', boxShadow: 'none', borderColor: '#B8CAFF'},
                  }}
                >
                  {label as string}
                </Button>
              ))}
            </Box>
          </Box>
        </Paper>

        <Paper elevation={0} sx={{border: '1px solid #E3E8F1', borderRadius: 1.6, bgcolor: '#FFFFFF', p: 0.9}}>
          <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', md: 'minmax(180px, 1fr) 210px auto'}, gap: 0.85, alignItems: 'center'}}>
            <TextField
              size="small"
              label="Search cavity"
              value={cavityQuery}
              onChange={(event) => setCavityQuery(event.target.value)}
              InputProps={{startAdornment: <InputAdornment position="start"><SearchIcon sx={{fontSize: 18, color: mutedText}} /></InputAdornment>}}
            />
            <TextField size="small" select label="Status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as 'All' | CavityStatus)}>
              {(['All', 'OK', 'Watch', 'NG', 'Under Review', 'Maintenance', 'Disabled'] as Array<'All' | CavityStatus>).map((status) => <MenuItem key={status} value={status}>{status}</MenuItem>)}
            </TextField>
            <Button
              size="small"
              onClick={() => setIsMoreFiltersOpen((current) => !current)}
              sx={{height: 38, justifySelf: {xs: 'stretch', md: 'end'}, border: '1px solid #D7DDE6', borderRadius: '8px', textTransform: 'none', color: pageText, fontWeight: 850}}
            >
              {isMoreFiltersOpen ? 'Hide filters' : 'More filters'}
            </Button>
          </Box>
          {isMoreFiltersOpen ? (
            <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', md: 'repeat(5, minmax(140px, 1fr))'}, gap: 0.85, mt: 0.9}}>
              <TextField size="small" select label="Event type" value={eventTypeFilter} onChange={(event) => setEventTypeFilter(event.target.value as 'All' | 'Mold Event' | 'Cavity Event')}>
                {(['All', 'Mold Event', 'Cavity Event'] as const).map((type) => <MenuItem key={type} value={type}>{type}</MenuItem>)}
              </TextField>
              <TextField size="small" select label="Date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value as 'All' | 'May 2026' | 'Mar 2026')}>
                {(['All', 'May 2026', 'Mar 2026'] as const).map((date) => <MenuItem key={date} value={date}>{date}</MenuItem>)}
              </TextField>
              <TextField size="small" label="MR" value={mrFilter} onChange={(event) => setMrFilter(event.target.value)} />
              <TextField size="small" select label="Attachments" value={attachmentsFilter} onChange={(event) => setAttachmentsFilter(event.target.value as 'All' | 'With attachments')}>
                {(['All', 'With attachments'] as const).map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </TextField>
              <TextField size="small" label="Updated by" value={updatedByFilter} onChange={(event) => setUpdatedByFilter(event.target.value)} />
            </Box>
          ) : null}
        </Paper>

        <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', lg: '240px minmax(340px, 1fr) minmax(280px, 0.8fr)'}, gap: 1.2, alignItems: 'start'}}>
          <Paper elevation={0} sx={{border: '1px solid #DDE3EA', borderRadius: 1.8, bgcolor: '#FFFFFF', p: 1}}>
            <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1}}>
              <Typography sx={{color: pageText, fontWeight: 950}}>Needs Attention</Typography>
              <Chip label={String(filteredAttentionCavities.length)} size="small" sx={{height: 22, bgcolor: '#FFF7ED', border: '1px solid #FED7AA', color: '#C2410C', fontWeight: 900}} />
            </Box>
            <Box sx={{display: 'grid', gap: 0.65}}>
              {filteredAttentionCavities.length ? filteredAttentionCavities.map((cavity) => {
                const tone = cavityStatusColors[cavity.status];
                const isSelected = cavity.cavityNumber === selectedCavityNumber;

                return (
                  <Button
                    key={cavity.cavityNumber}
                    onClick={() => setSelectedCavityNumber(cavity.cavityNumber)}
                    sx={{
                      justifyContent: 'stretch',
                      textAlign: 'left',
                      textTransform: 'none',
                      border: `1px solid ${isSelected ? blue : '#E3E8F1'}`,
                      borderRadius: 1.2,
                      bgcolor: isSelected ? '#F8FAFF' : '#FFFFFF',
                      color: pageText,
                      p: 0.9,
                      boxShadow: isSelected ? '0 0 0 3px rgba(37,99,235,0.12)' : 'none',
                      '&:hover': {bgcolor: '#F8FAFF', borderColor: '#B8CAFF'},
                    }}
                  >
                    <Box sx={{display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: 0.8, width: '100%', alignItems: 'start'}}>
                      <Box sx={{minWidth: 0}}>
                        <Typography sx={{fontWeight: 950, color: pageText}}>Cavity C{cavity.cavityNumber}</Typography>
                        <Typography variant="caption" sx={{display: 'block', color: mutedText, fontWeight: 750}}>Last issue: {cavity.lastIssueDate}</Typography>
                        <Typography variant="caption" sx={{display: 'block', color: mutedText, fontWeight: 750}}>{cavity.relatedMr ?? 'No linked MR'}</Typography>
                      </Box>
                      <Chip label={cavity.status} size="small" sx={{height: 23, bgcolor: tone.bg, color: tone.text, border: `1px solid ${tone.border}`, fontWeight: 900}} />
                    </Box>
                  </Button>
                );
              }) : (
                <Typography sx={{color: mutedText, fontWeight: 750, border: '1px dashed #CBD5E1', borderRadius: 1.2, p: 1}}>
                  No cavities match the attention filters.
                </Typography>
              )}
            </Box>

            <Divider sx={{my: 1.1}} />
            <Button
              fullWidth
              size="small"
              onClick={() => setIsAllCavitiesOpen((current) => !current)}
              sx={{height: 30, justifyContent: 'space-between', textTransform: 'none', color: pageText, fontWeight: 900, px: 0.5}}
            >
              <span>{isAllCavitiesOpen || hasActiveCavityFilters ? `All cavities (${filteredCavities.length})` : `View all ${moldLogbookTotalCavities} cavities`}</span>
              <span>{isAllCavitiesOpen ? 'Hide' : 'Show'}</span>
            </Button>
            {allCavityList.length ? (
              <Box sx={{display: 'grid', gap: 0.45, maxHeight: 300, overflowY: 'auto', pr: 0.35, mt: 0.8}}>
                {allCavityList.map((cavity) => {
                  const tone = cavityStatusColors[cavity.status];
                  const isSelected = cavity.cavityNumber === selectedCavityNumber;

                  return (
                    <Button
                      key={`all-${cavity.cavityNumber}`}
                      onClick={() => setSelectedCavityNumber(cavity.cavityNumber)}
                      sx={{
                        minHeight: 34,
                        justifyContent: 'space-between',
                        textAlign: 'left',
                        textTransform: 'none',
                        border: `1px solid ${isSelected ? blue : '#EEF2F7'}`,
                        borderRadius: 1,
                        bgcolor: isSelected ? '#F8FAFF' : cavity.status === 'OK' ? '#FFFFFF' : tone.bg,
                        color: pageText,
                        px: 0.8,
                        py: 0.45,
                        '&:hover': {bgcolor: '#F8FAFF', borderColor: '#B8CAFF'},
                      }}
                    >
                      <Typography sx={{fontWeight: 850, fontSize: 12.5}}>C{cavity.cavityNumber}</Typography>
                      <Typography sx={{fontWeight: 850, fontSize: 11.5, color: cavity.status === 'OK' ? mutedText : tone.text}}>{cavity.status}</Typography>
                    </Button>
                  );
                })}
              </Box>
            ) : null}
          </Paper>

          <Paper elevation={0} sx={{border: '1px solid #DDE3EA', borderRadius: 1.8, bgcolor: '#F8FAFC', p: 1, boxShadow: '0 12px 28px rgba(15,23,42,0.05)'}}>
            <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1}}>
              <Box>
                <Typography sx={{fontWeight: 950, color: pageText, display: 'flex', alignItems: 'center', gap: 0.65}}>
                  <CavityMapIcon sx={{fontSize: 18, color: blue}} />
                  Cavity Map
                </Typography>
                <Typography variant="caption" sx={{color: mutedText, fontWeight: 750}}>Select a cavity to inspect status and history.</Typography>
              </Box>
              <CavityStatusSummaryV2 counts={getCavityStatusCounts(cavityStatusMap)} />
            </Box>
            <Box sx={{border: '1px solid #E5E7EB', borderRadius: 1.2, bgcolor: '#FFFFFF', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(136px, 1fr))', gap: 0.7, p: 0.75, maxHeight: 620, overflowY: 'auto'}}>
              {moldLogbookCavityStations.map((station) => (
                <CavityMapCluster
                  key={station}
                  station={station}
                  selectedCavities={[selectedCavityNumber]}
                  activeCavity={selectedCavityNumber}
                  cavityStatuses={cavityStatusMap}
                  onActivate={setSelectedCavityNumber}
                  onSelect={setSelectedCavityNumber}
                />
              ))}
            </Box>
          </Paper>

          <Paper elevation={0} sx={{border: '1px solid #DDE3EA', borderRadius: 1.8, bgcolor: '#FFFFFF', p: 1, display: 'grid', gap: 1}}>
            {selectedCavity ? (
              <>
                <Box sx={{display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1}}>
                  <Box>
                    <Typography sx={{fontWeight: 950, color: pageText}}>Cavity C{selectedCavity.cavityNumber}</Typography>
                    <Typography variant="caption" sx={{color: mutedText, fontWeight: 800}}>Position P{selectedCavity.positionNumber} · Mold {selectedMoldNumber}</Typography>
                  </Box>
                  <Chip label={selectedCavity.status} size="small" sx={{height: 24, bgcolor: cavityStatusColors[selectedCavity.status].bg, color: cavityStatusColors[selectedCavity.status].text, border: `1px solid ${cavityStatusColors[selectedCavity.status].border}`, fontWeight: 900}} />
                </Box>
                <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 0.4, borderBottom: '1px solid #E3E8F1', pb: 0.7}}>
                  {(['Details', 'History', 'Attachments / MRs'] as const).map((tabLabel) => (
                    <Button
                      key={tabLabel}
                      size="small"
                      onClick={() => setSelectedCavityTab(tabLabel)}
                      sx={{
                        minHeight: 28,
                        borderRadius: '8px',
                        textTransform: 'none',
                        color: selectedCavityTab === tabLabel ? '#FFFFFF' : pageText,
                        bgcolor: selectedCavityTab === tabLabel ? blue : '#F8FAFC',
                        border: `1px solid ${selectedCavityTab === tabLabel ? blue : '#E3E8F1'}`,
                        fontWeight: 850,
                        fontSize: 11.5,
                        '&:hover': {bgcolor: selectedCavityTab === tabLabel ? '#1D4ED8' : '#FFFFFF'},
                      }}
                    >
                      {tabLabel}
                    </Button>
                  ))}
                </Box>

                {selectedCavityTab === 'Details' ? (
                  <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 0.65}}>
                    {[
                      ['Position', `P${selectedCavity.positionNumber}`],
                      ['Last issue', selectedCavity.lastIssueDate],
                      ['Last inspection', selectedCavity.lastInspectionResult],
                      ['Related MR', selectedCavity.relatedMr ?? '-'],
                      ['Last log', selectedCavity.lastEvent?.occurrenceId ?? '-'],
                    ].map(([label, value]) => (
                      <Box key={label} sx={{border: '1px solid #E3E8F1', borderRadius: 1.1, p: 0.75, bgcolor: '#F8FAFC'}}>
                        <Typography sx={{color: mutedText, fontWeight: 800, fontSize: '0.68rem', textTransform: 'uppercase'}}>{label}</Typography>
                        <Typography sx={{color: pageText, fontWeight: 900, mt: 0.2, overflowWrap: 'anywhere'}}>{value}</Typography>
                      </Box>
                    ))}
                  </Box>
                ) : null}

                {selectedCavityTab === 'History' ? (
                  <Box sx={{display: 'grid', gap: 0.75, maxHeight: 430, overflowY: 'auto', pr: 0.4}}>
                    {selectedCavityHistory.length ? selectedCavityHistory.map((event) => {
                      const tone = cavityStatusColors[event.status];

                      return (
                        <Box key={event.id} sx={{border: '1px solid #E3E8F1', borderRadius: 1.2, bgcolor: '#F8FAFC', p: 0.9}}>
                          <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap'}}>
                            <Chip label={event.occurrenceId} size="small" sx={{height: 21, bgcolor: '#FFFFFF', color: pageText, border: '1px solid #D7DDE6', fontWeight: 900}} />
                            <Chip label={event.status} size="small" sx={{height: 21, bgcolor: tone.bg, color: tone.text, border: `1px solid ${tone.border}`, fontWeight: 900}} />
                          </Box>
                          <Typography variant="caption" sx={{display: 'block', color: mutedText, fontWeight: 800, mt: 0.45}}>{event.dateTime} · {event.updatedBy}</Typography>
                          <Typography sx={{color: pageText, fontWeight: 850, mt: 0.35, lineHeight: 1.35}}>{event.defectType}</Typography>
                          <Typography variant="caption" sx={{display: 'block', color: mutedText, mt: 0.2}}>{event.observation}</Typography>
                        </Box>
                      );
                    }) : (
                      <Typography sx={{color: mutedText, fontWeight: 750, border: '1px dashed #CBD5E1', borderRadius: 1.2, p: 1}}>No cavity events recorded for C{selectedCavity.cavityNumber}.</Typography>
                    )}
                  </Box>
                ) : null}

                {selectedCavityTab === 'Attachments / MRs' ? (
                  <Box sx={{display: 'grid', gap: 0.7}}>
                    <Box sx={{border: '1px solid #E3E8F1', borderRadius: 1.1, bgcolor: '#F8FAFC', p: 0.85}}>
                      <Typography sx={{color: mutedText, fontWeight: 800, fontSize: '0.68rem', textTransform: 'uppercase'}}>Related MR</Typography>
                      <Typography sx={{color: pageText, fontWeight: 900, mt: 0.25}}>{selectedCavity.relatedMr ?? 'No MR linked to this cavity'}</Typography>
                    </Box>
                    <Box sx={{border: '1px solid #E3E8F1', borderRadius: 1.1, bgcolor: '#F8FAFC', p: 0.85}}>
                      <Typography sx={{color: mutedText, fontWeight: 800, fontSize: '0.68rem', textTransform: 'uppercase'}}>Attachments</Typography>
                      {(selectedCavity.lastEvent?.attachments.length ?? 0) ? (
                        <Box sx={{display: 'flex', gap: 0.45, flexWrap: 'wrap', mt: 0.5}}>
                          {selectedCavity.lastEvent?.attachments.map((attachment) => (
                            <Chip key={attachment} label={attachment} size="small" sx={{height: 23, bgcolor: '#FFFFFF', border: '1px solid #D7DDE6', color: pageText, fontWeight: 800}} />
                          ))}
                        </Box>
                      ) : (
                        <Typography sx={{color: mutedText, fontWeight: 750, mt: 0.25}}>No attachments linked to this cavity.</Typography>
                      )}
                    </Box>
                  </Box>
                ) : null}
              </>
            ) : null}
          </Paper>
        </Box>

        <Paper elevation={0} sx={{border: '1px solid #DDE3EA', borderRadius: 1.8, bgcolor: '#FFFFFF', p: 1}}>
          <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap'}}>
            <Box sx={{display: 'flex', alignItems: 'center', gap: 0.7, flexWrap: 'wrap'}}>
              <Typography sx={{color: pageText, fontWeight: 950}}>Mold History</Typography>
              <Chip label={`${filteredMoldHistory.length} records`} size="small" sx={{height: 22, bgcolor: '#F8FAFC', color: pageText, border: '1px solid #D7DDE6', fontWeight: 850}} />
              <Chip label={`${attachedFiles} files`} size="small" sx={{height: 22, bgcolor: '#F8FAFC', color: mutedText, border: '1px solid #E3E8F1', fontWeight: 800}} />
              <Chip label={`${linkedMrs} linked MRs`} size="small" sx={{height: 22, bgcolor: '#FFF7ED', color: '#C2410C', border: '1px solid #FED7AA', fontWeight: 800}} />
            </Box>
            <Button size="small" onClick={() => setIsMoldHistoryOpen((current) => !current)} sx={{height: 28, textTransform: 'none', color: blue, fontWeight: 900}}>
              {isMoldHistoryOpen ? 'Collapse' : 'Expand'}
            </Button>
          </Box>
          {isMoldHistoryOpen ? (
            <Box sx={{display: 'grid', gap: 0.85}}>
              {filteredMoldHistory.map((record) => (
                <MoldHistoryRecordCard
                  key={record.id}
                  record={record}
                  selected={record.id === selectedMoldHistory?.id}
                  onSelect={() => setSelectedMoldHistoryId(record.id)}
                  onOpenOccurrence={() => {
                    const occurrence = moldOccurrences.find((entry) => entry.occurrenceId === record.id);
                    if (occurrence) onOpenOccurrence(occurrence);
                  }}
                />
              ))}
            </Box>
          ) : null}
        </Paper>
      </Box>
    </SectionCard>
  );
}

function MoldHistoryRecordCard({
  record,
  selected,
  onSelect,
  onOpenOccurrence,
}: {
  record: MoldHistoryRecord;
  selected: boolean;
  onSelect: () => void;
  onOpenOccurrence: () => void;
}) {
  const isCavityEvent = record.eventType === 'Cavity Event';
  return (
    <Paper
      elevation={0}
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelect();
        }
      }}
      sx={{
        border: `1px solid ${selected ? blue : '#E3E8F1'}`,
        borderLeft: `5px solid ${isCavityEvent ? blue : '#16A34A'}`,
        borderRadius: 1.3,
        px: 1.25,
        py: 1.1,
        bgcolor: selected ? '#F8FAFF' : '#FFFFFF',
        cursor: 'pointer',
        boxShadow: selected ? '0 0 0 3px rgba(37,99,235,0.1)' : 'none',
        '&:hover': {borderColor: '#B8CAFF', bgcolor: '#F8FAFF'},
        '&:focus-visible': {outline: `2px solid ${blue}`, outlineOffset: 2},
      }}
    >
      <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', md: 'minmax(0, 1fr) auto'}, gap: 1, alignItems: 'start'}}>
        <Box sx={{minWidth: 0}}>
          <Box sx={{display: 'flex', alignItems: 'center', gap: 0.6, flexWrap: 'wrap', mb: 0.55}}>
            <Chip label={record.eventType} size="small" sx={{height: 22, bgcolor: isCavityEvent ? '#EEF4FF' : '#ECFDF3', border: `1px solid ${isCavityEvent ? '#C7D7FE' : '#BBF7D0'}`, color: isCavityEvent ? blue : '#15803D', fontWeight: 900}} />
            <Chip label={record.id} size="small" sx={{height: 22, bgcolor: '#F8FAFC', border: '1px solid #D7DDE6', color: pageText, fontWeight: 900}} />
            <Typography variant="caption" sx={{color: mutedText, fontWeight: 850}}>{record.dateTime}</Typography>
          </Box>
          <Typography sx={{color: pageText, fontWeight: 900, lineHeight: 1.25}}>{record.summary}</Typography>
          <Typography variant="caption" sx={{display: 'block', color: mutedText, fontWeight: 750, mt: 0.35}}>
            Updated by {record.updatedBy}
          </Typography>
        </Box>
        <Box sx={{display: 'flex', gap: 0.5, flexWrap: 'wrap', justifyContent: {xs: 'flex-start', md: 'flex-end'}, maxWidth: 420}}>
          {record.linkedCavities?.length ? <Chip label={`Cavities ${formatCavityList(record.linkedCavities)}`} size="small" sx={{height: 24, bgcolor: '#EEF4FF', color: blue, border: '1px solid #C7D7FE', fontWeight: 900}} /> : null}
          <Chip label={`${record.attachmentsCount} attachments`} size="small" sx={{height: 24, bgcolor: '#F8FAFC', color: pageText, border: '1px solid #D7DDE6', fontWeight: 900}} />
          {record.relatedMr ? <Chip label={record.relatedMr} size="small" sx={{height: 24, bgcolor: '#FFF7ED', color: '#C2410C', border: '1px solid #FED7AA', fontWeight: 900}} /> : null}
          {isCavityEvent ? (
            <Button
              size="small"
              onClick={(event) => {
                event.stopPropagation();
                onOpenOccurrence();
              }}
              sx={{height: 24, minHeight: 24, textTransform: 'none', fontWeight: 900, color: blue, px: 0.8}}
            >
              Open map
            </Button>
          ) : null}
        </Box>
      </Box>
    </Paper>
  );
}

function MoldingOccurrenceModal({
  open,
  asset,
  occurrence,
  occurrences,
  onClose,
}: {
  open: boolean;
  asset: HierarchyItem;
  occurrence: MoldLogbookOccurrence | null;
  occurrences: MoldLogbookOccurrence[];
  onClose: () => void;
}) {
  const [formData, setFormData] = useState<FirstCheckFormData>(() => occurrence?.formData ?? createFirstCheckFormData({machineNumber: asset.code, moldNumber: occurrence?.moldId ?? 'MOLD-FH-12'}));
  const [activeCavity, setActiveCavity] = useState<number | null>(occurrence?.affectedCavities[0] ?? null);
  const statusTone = cavityStatusColors[formData.overallStatus];

  useEffect(() => {
    if (!open) return;
    setFormData(occurrence?.formData ?? createFirstCheckFormData({machineNumber: asset.code, moldNumber: occurrence?.moldId ?? 'MOLD-FH-12'}));
    setActiveCavity(occurrence?.affectedCavities[0] ?? null);
  }, [asset.code, occurrence, open]);

  const handleSelectCavity = (cavityNumber: number) => {
    setActiveCavity(cavityNumber);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
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
              <Chip label={occurrence?.occurrenceId ?? 'View'} size="small" sx={{height: 24, bgcolor: '#F8FAFC', color: pageText, border: '1px solid #D7DDE6', fontWeight: 900}} />
            </Box>
            <Typography variant="caption" sx={{display: 'block', color: mutedText, fontWeight: 800, mt: 0.35}}>
              Equipment {asset.code} · Machine {formData.machineNumber || '-'} · Mold {formData.moldNumber || '-'}
            </Typography>
          </Box>
          <IconButton aria-label="Close molding occurrence" onClick={onClose} size="small" sx={{color: '#64748B'}}>
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
          onSelectCavity={handleSelectCavity}
        />
      </DialogContent>
    </Dialog>
  );
}

function CavityMapStep({
  formData,
  occurrences,
  activeCavity,
  onActiveCavityChange,
  onSelectCavity,
}: {
  formData: FirstCheckFormData;
  occurrences: MoldLogbookOccurrence[];
  activeCavity: number | null;
  onActiveCavityChange: (cavity: number) => void;
  onSelectCavity: (cavity: number) => void;
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
              onSelect={onSelectCavity}
            />
        ))}
      </Box>
      </Paper>
      <CavityHistoryPanel
        cavityNumber={activeCavity}
        formData={formData}
        occurrences={occurrences}
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
  onSelect,
}: {
  station: number;
  selectedCavities: number[];
  activeCavity: number | null;
  cavityStatuses: Record<number, CavityStatus>;
  onActivate: (cavity: number) => void;
  onSelect: (cavity: number) => void;
}) {
  const positionAreas: Record<number, string> = {1: 'top', 2: 'upperRight', 3: 'lowerRight', 4: 'bottom', 5: 'lowerLeft', 6: 'upperLeft'};

  return (
    <Box sx={{border: '1px solid #E5EAF2', borderRadius: 1.1, bgcolor: '#FFFFFF', p: 0.45, display: 'grid', placeItems: 'center', minHeight: 128}}>
      <Box sx={{display: 'grid', gridTemplateColumns: '40px 48px 40px', gridTemplateRows: '36px 38px 36px', gridTemplateAreas: `". top ." "upperLeft center upperRight" "lowerLeft bottom lowerRight"`, gap: 0.58, alignItems: 'center', justifyItems: 'center'}}>
        {moldLogbookCavityPositions.map((position) => {
          const cavityNumber = (station - 1) * moldLogbookCavityPositions.length + position;
          const isSelected = selectedCavities.includes(cavityNumber);
          const isActive = activeCavity === cavityNumber;
          const status = cavityStatuses[cavityNumber] ?? 'OK';
          const statusColor = cavityStatusColors[status];
          const isAttention = status !== 'OK';
          const quietOk = !isActive && !isAttention;

          return (
            <Tooltip key={`${station}-${position}`} title={`Position P${cavityNumber} · Cavity C${cavityNumber} · ${status}${isSelected ? ' · selected' : ''}`} arrow>
              <Button
                onClick={() => {
                  onActivate(cavityNumber);
                  onSelect(cavityNumber);
                }}
                aria-label={`Position P${cavityNumber}, current cavity ${cavityNumber}, status ${status}${isSelected ? ', selected as affected' : ''}`}
                aria-pressed={isSelected}
                sx={{
                  minWidth: 0,
                  width: isAttention || isActive ? 40 : 34,
                  height: isAttention || isActive ? 36 : 32,
                  gridArea: positionAreas[position],
                  borderRadius: '50%',
                  bgcolor: isActive ? statusColor.solid : quietOk ? '#F8FAFC' : statusColor.bg,
                  border: `${isAttention || isActive ? 2 : 1}px solid ${isActive ? '#1D4ED8' : isSelected ? statusColor.solid : quietOk ? '#E2E8F0' : statusColor.border}`,
                  color: isActive ? '#FFFFFF' : quietOk ? '#64748B' : statusColor.text,
                  display: 'grid',
                  placeItems: 'center',
                  textAlign: 'center',
                  lineHeight: 1,
                  fontSize: quietOk ? 9 : 9.5,
                  fontWeight: quietOk ? 800 : 950,
                  p: 0,
                  opacity: quietOk ? 0.72 : 1,
                  boxShadow: isActive ? '0 0 0 4px rgba(37, 99, 235, 0.22)' : isAttention ? `0 0 0 2px ${statusColor.bg}` : 'none',
                  textTransform: 'none',
                  '&:hover': {bgcolor: isActive ? statusColor.solid : statusColor.bg, borderColor: '#1D4ED8', opacity: 1},
                  '&:focus-visible': {boxShadow: '0 0 0 4px rgba(37, 99, 235, 0.28)', borderColor: '#1D4ED8'},
                  '& .MuiTouchRipple-root': {borderRadius: '50%'},
                }}
              >
                C{cavityNumber}
              </Button>
            </Tooltip>
          );
        })}
        <Box sx={{gridArea: 'center', width: 46, height: 46, borderRadius: 1, bgcolor: '#F1F5F9', border: '1px solid #CBD5E1', color: '#0F172A', fontSize: 17, fontWeight: 950, display: 'grid', placeItems: 'center'}}>{station}</Box>
      </Box>
    </Box>
  );
}

function CavityHistoryPanel({cavityNumber, formData, occurrences}: {cavityNumber: number | null; formData: FirstCheckFormData; occurrences: MoldLogbookOccurrence[]}) {
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
        <TextField size="small" label="Issue / Defect" value={detail.issue} InputProps={{readOnly: true}} />
        <TextField size="small" label="Action taken" value={detail.actionTaken} InputProps={{readOnly: true}} />
        <TextField size="small" label="Status" select value={detail.status} SelectProps={{readOnly: true}}>
          {(['OK', 'Watch', 'NG', 'Under Review', 'Maintenance', 'Disabled', 'Blocked'] as CavityStatus[]).map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
        </TextField>
        <TextField size="small" label="Attachments" value={detail.attachments} InputProps={{readOnly: true}} placeholder="File names or upload references" />
        <TextField size="small" label="Notes" multiline minRows={2} value={detail.notes} InputProps={{readOnly: true}} />
      </Box>
      <Divider sx={{borderColor: tokenDivider}} />
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
      {(['OK', 'NG', 'Watch', 'Under Review', 'Maintenance', 'Disabled'] as CavityStatus[]).map((status) => {
        const tone = cavityStatusColors[status];
        return (
          <Box key={status} sx={{display: 'flex', alignItems: 'center', gap: 0.45, px: 0.65, py: 0.3, borderRadius: 1, bgcolor: status === 'OK' ? '#F8FAFC' : tone.bg, border: `1px solid ${status === 'OK' ? '#E3E8F1' : tone.border}`}}>
            <StatusDot color={tone.solid} />
            <Typography sx={{fontSize: 11, fontWeight: 850, color: status === 'OK' ? mutedText : tone.text}}>{status}: {counts[status]}</Typography>
          </Box>
        );
      })}
    </Box>
  );
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
    {OK: 0, NG: 0, Watch: 0, 'Under Review': 0, Maintenance: 0, Disabled: 0, Blocked: 0}
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

function getSelectedMoldOccurrences(occurrences: MoldLogbookOccurrence[]) {
  const selectedMoldNumber = occurrences[0]?.moldId ?? 'MOLD-FH-12';
  const normalizedMoldNumber = normalizeMoldId(selectedMoldNumber);

  return occurrences.filter((entry) => normalizeMoldId(entry.moldId) === normalizedMoldNumber);
}

function getMoldOverallStatus(cavities: CavityInventoryItem[]): CavityStatus {
  if (cavities.some((cavity) => cavity.status === 'NG' || cavity.status === 'Disabled')) return 'NG';
  if (cavities.some((cavity) => cavity.status === 'Maintenance')) return 'Maintenance';
  if (cavities.some((cavity) => cavity.status === 'Under Review')) return 'Under Review';
  if (cavities.some((cavity) => cavity.status === 'Watch')) return 'Watch';
  return 'OK';
}

function buildCavityInventory(occurrences: MoldLogbookOccurrence[]): CavityInventoryItem[] {
  const latestIssueByCavity = new Map<number, MoldLogbookOccurrence>();
  const latestInspectionByCavity = new Map<number, {entry: MoldLogbookOccurrence; result: CavityResult}>();

  occurrences.forEach((entry) => {
    entry.affectedCavities.forEach((cavityNumber) => {
      if (!latestIssueByCavity.has(cavityNumber)) {
        latestIssueByCavity.set(cavityNumber, entry);
      }
    });

    entry.checkedCavities?.forEach((result) => {
      const cavityNumber = getCavityNumber(result.cavity);
      if (cavityNumber && !latestInspectionByCavity.has(cavityNumber)) {
        latestInspectionByCavity.set(cavityNumber, {entry, result: result.result});
      }
    });
  });

  return moldLogbookCavities.map((cavity) => {
    const issueEntry = latestIssueByCavity.get(cavity.cavityNumber);
    const inspection = latestInspectionByCavity.get(cavity.cavityNumber);
    const cavityDetail = issueEntry?.formData.cavityDetails[cavity.cavityNumber];

    return {
      cavityNumber: cavity.cavityNumber,
      positionNumber: cavity.positionNumber,
      status: cavityDetail?.status ?? issueEntry?.status ?? 'OK',
      lastIssueDate: issueEntry?.dateTime ?? '-',
      lastInspectionResult: inspection?.result ?? 'Not checked',
      relatedMr: issueEntry?.relatedMr,
      lastEvent: issueEntry,
    };
  });
}

function buildMoldHistoryRecords(occurrences: MoldLogbookOccurrence[]): MoldHistoryRecord[] {
  const selectedMoldNumber = occurrences[0]?.moldId ?? 'MOLD-FH-12';

  return [
    {
      id: 'MOLD-MNT-052',
      eventType: 'Mold Event',
      dateTime: 'May 15, 2026, 08:10 AM',
      summary: `Tooling maintenance cleaned and inspected ${selectedMoldNumber} after dimensional review.`,
      updatedBy: 'Tooling maintenance',
      attachmentsCount: 2,
      relatedMr: 'MR-4471',
      linkedCavities: [14, 51, 67],
    },
    {
      id: 'MOLD-CHK-044',
      eventType: 'Mold Event',
      dateTime: 'May 14, 2026, 09:50 AM',
      summary: `Full mold first-piece check completed before production release.`,
      updatedBy: 'Quality engineering',
      attachmentsCount: 1,
    },
    ...occurrences.map((entry) => ({
      id: entry.occurrenceId,
      eventType: 'Cavity Event' as const,
      dateTime: entry.dateTime,
      summary: entry.title,
      updatedBy: entry.updatedBy,
      attachmentsCount: entry.attachments.length,
      relatedMr: entry.relatedMr,
      linkedCavities: entry.affectedCavities,
    })),
  ];
}

function getCavityStatusMap(cavities: CavityInventoryItem[]) {
  return Object.fromEntries(cavities.map((cavity) => [cavity.cavityNumber, cavity.status])) as Record<number, CavityStatus>;
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
  moldingOccurrences,
  selectedHierarchyId,
  selectedEventId,
  onFilterChange,
  onOpenMoldingOccurrence,
  onSelectEvent,
}: {
  activeFilter: ActiveLedgerFilter;
  events: EventItem[];
  moldingOccurrences: MoldLogbookOccurrence[];
  selectedHierarchyId: string | null;
  selectedEventId: string | null;
  onFilterChange: (filter: ActiveLedgerFilter) => void;
  onOpenMoldingOccurrence: (occurrence: MoldLogbookOccurrence) => void;
  onSelectEvent: (event: EventItem) => void;
}) {
  const [detailEvent, setDetailEvent] = useState<EventItem | null>(null);
  const [expandedSparePartEventIds, setExpandedSparePartEventIds] = useState<string[]>([]);
  const visibleEvents = events.filter((event) => {
    const matchesEventType = !activeFilter || getEventFilter(event) === activeFilter;
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
    <Box sx={{px: 2, py: 2}}>
      <Box sx={{display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2}}>
        {filters.map((filter) => (
          <Chip
            key={filter}
            label={filter}
            size="small"
            clickable
            onClick={() => onFilterChange(filter === activeFilter ? null : filter)}
            sx={{
              height: 28,
              bgcolor: filter === activeFilter ? tokenBrand.main : tokenNeutral.lighter,
              color: filter === activeFilter ? tokenBrand.contrast : tokenText.primary,
              border: 'none',
              borderRadius: '999px',
              fontSize: '0.8125rem',
              fontWeight: 400,
              cursor: 'pointer',
              '& .MuiChip-label': {px: 1.25},
              '&:hover': {bgcolor: filter === activeFilter ? tokenBrand.dark : tokenNeutral.main},
            }}
          />
        ))}
      </Box>

      <Box sx={{display: 'grid', gap: 1.5}}>
        {visibleEvents.map((event) => {
          const isSelected = event.id === selectedEventId;
          const sparePartsUsed = event.sparePartsUsed ?? [];
          const sparePartsCount = getSparePartsUsedCount(event);
          const isSparePartsExpanded = expandedSparePartEventIds.includes(event.id);
          const eventTone = getLedgerEventTone(event);
          const linkedMoldingOccurrence = event.moldingOccurrenceId
            ? moldingOccurrences.find((occurrence) => occurrence.occurrenceId === event.moldingOccurrenceId) ?? null
            : null;

          return (
            <Paper
              key={event.id}
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
                position: 'relative',
                overflow: 'hidden',
                border: `1px solid ${isSelected ? tokenBrand.main : tokenDivider}`,
                borderRadius: '12px',
                borderLeft: `6px solid ${eventTone}`,
                bgcolor: 'background.paper',
                px: 2,
                py: 1.5,
                cursor: 'pointer',
                boxShadow: 'none',
                '&:focus-visible': {outline: `2px solid ${tokenBrand.main}`, outlineOffset: 2},
              }}
            >
              <Box sx={{display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1, mb: 1}}>
                <Box sx={{display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap'}}>
                  <Typography variant="caption" sx={{color: eventTone, fontWeight: 700, lineHeight: 1.3}}>
                    {getLedgerEventLabel(event)}
                  </Typography>
                  <RowBadge label={event.id} />
                </Box>
                <Box sx={{display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap', justifyContent: 'flex-end'}}>
                  <Typography variant="caption" sx={{color: tokenText.secondary, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', whiteSpace: 'nowrap'}}>
                    {event.date} - {event.time}
                  </Typography>
                  {linkedMoldingOccurrence ? (
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<CavityMapIcon sx={{fontSize: '15px !important'}} />}
                      onClick={(mouseEvent) => {
                        mouseEvent.stopPropagation();
                        onOpenMoldingOccurrence(linkedMoldingOccurrence);
                      }}
                      onKeyDown={(keyboardEvent) => keyboardEvent.stopPropagation()}
                      sx={{
                        height: 28,
                        borderRadius: '8px',
                        borderColor: tokenBrand.main,
                        color: tokenBrand.main,
                        textTransform: 'none',
                        fontWeight: 800,
                        fontSize: '0.75rem',
                        '&:hover': {borderColor: tokenBrand.dark, bgcolor: tokenBrand.softBg},
                      }}
                    >
                      Cavity Map
                    </Button>
                  ) : null}
                </Box>
              </Box>
              <Typography variant="subtitle2" sx={{color: tokenText.primary, fontWeight: 500, lineHeight: 1.57}}>
                {event.title}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: tokenText.secondary,
                  mt: 0.5,
                  display: '-webkit-box',
                  WebkitBoxOrient: 'vertical',
                  WebkitLineClamp: 1,
                  overflow: 'hidden',
                }}
              >
                {event.body}
              </Typography>
              <Typography variant="caption" sx={{color: tokenBrand.main, fontWeight: 700, display: 'block', mt: 1}}>
                {event.impactLevel}
              </Typography>

              {sparePartsCount ? (
                <Box
                  onClick={(mouseEvent) => mouseEvent.stopPropagation()}
                  onKeyDown={(keyboardEvent) => keyboardEvent.stopPropagation()}
                  sx={{mt: 1, border: `1px solid ${tokenDivider}`, borderRadius: '8px', bgcolor: tokenNeutral.lightest, overflow: 'hidden'}}
                >
                  <Box sx={{display: 'grid', gridTemplateColumns: 'auto minmax(0, 1fr) auto auto', gap: 1, alignItems: 'center', px: 1, py: 0.75}}>
                    <SparePartsIcon sx={{fontSize: 17, color: tokenBrand.main}} />
                    <Typography variant="caption" sx={{color: tokenText.primary, fontWeight: 700}}>Spare parts used</Typography>
                    <RowBadge label={String(sparePartsCount)} />
                    <Tooltip title={isSparePartsExpanded ? 'Hide spare parts' : 'Show spare parts'}>
                      <IconButton
                        aria-label={isSparePartsExpanded ? `Hide spare parts for ${event.id}` : `Show spare parts for ${event.id}`}
                        size="small"
                        onClick={() => handleToggleSpareParts(event.id)}
                        sx={{width: 24, height: 24, color: tokenBrand.main, '&:hover': {bgcolor: tokenBrand.softBg}}}
                      >
                        {isSparePartsExpanded ? <DownIcon sx={{fontSize: 17}} /> : <ChevronRightIcon sx={{fontSize: 17}} />}
                      </IconButton>
                    </Tooltip>
                  </Box>
                  {isSparePartsExpanded ? (
                    <Box sx={{display: 'grid', gap: 0.75, px: 1, pb: 1}}>
                      {sparePartsUsed.map((part) => (
                        <Box key={`${event.id}-${part.code}`} sx={{display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: 1, alignItems: 'center', px: 1, py: 0.75, border: `1px solid ${tokenDivider}`, borderRadius: '8px', bgcolor: 'background.paper'}}>
                          <Box sx={{minWidth: 0}}>
                            <Typography variant="caption" sx={{color: tokenText.primary, fontWeight: 700, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                              {part.name}
                            </Typography>
                            <Typography variant="caption" sx={{color: tokenText.secondary}}>
                              {part.code} - Bin {part.bin}
                            </Typography>
                          </Box>
                          <RowBadge label={`${part.qty} ${part.unit}`} />
                        </Box>
                      ))}
                    </Box>
                  ) : null}
                </Box>
              ) : (
                <Box
                  onClick={(mouseEvent) => mouseEvent.stopPropagation()}
                  onKeyDown={(keyboardEvent) => keyboardEvent.stopPropagation()}
                  sx={{mt: 1, display: 'grid', gridTemplateColumns: 'auto minmax(0, 1fr) auto', gap: 1, alignItems: 'center', px: 1, py: 0.75, border: `1px solid ${tokenDivider}`, borderRadius: '8px', bgcolor: tokenNeutral.lightest}}
                >
                  <SparePartsIcon sx={{fontSize: 17, color: tokenText.secondary}} />
                  <Typography variant="caption" sx={{color: tokenText.secondary, fontWeight: 700}}>Spare parts used</Typography>
                  <RowBadge label="0" />
                </Box>
              )}
            </Paper>
          );
        })}
        {!visibleEvents.length ? (
          <Paper elevation={0} sx={{border: `1px dashed ${tokenDivider}`, borderRadius: '12px', px: 2, py: 2, bgcolor: 'background.paper'}}>
            <Typography variant="subtitle2" sx={{color: tokenText.primary, fontWeight: 500}}>No events found{activeFilter ? ` for ${activeFilter}` : ''}</Typography>
            <Typography variant="body2" sx={{color: tokenText.secondary, mt: 0.5}}>
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
  moldingOccurrences,
  selectedHierarchyId,
  selectedEventId,
  bomRows,
  onFilterChange,
  onOpenMoldingOccurrence,
  onSelectEvent,
  onReviewAiEvidence,
}: {
  activeTab: LedgerTab;
  activeFilter: ActiveLedgerFilter;
  events: EventItem[];
  moldingOccurrences: MoldLogbookOccurrence[];
  selectedHierarchyId: string | null;
  selectedEventId: string | null;
  bomRows: BomRow[];
  onFilterChange: (filter: ActiveLedgerFilter) => void;
  onOpenMoldingOccurrence: (occurrence: MoldLogbookOccurrence) => void;
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
          onReviewAiEvidence={onReviewAiEvidence}
        />
      );
    case 'Mold Logbook':
      return (
        <MoldLogbookTab
          selectedHierarchyId={selectedHierarchyId}
          moldingOccurrences={moldingOccurrences}
          onOpenMoldingOccurrence={onOpenMoldingOccurrence}
        />
      );
    case 'Ledger Timeline':
    default:
      return (
        <TimelineTab
          activeFilter={activeFilter}
          events={events}
          moldingOccurrences={moldingOccurrences}
          selectedHierarchyId={selectedHierarchyId}
          selectedEventId={selectedEventId}
          onFilterChange={onFilterChange}
          onOpenMoldingOccurrence={onOpenMoldingOccurrence}
          onSelectEvent={onSelectEvent}
        />
      );
  }
}

export default function EquipmentLedgerPage() {
  const [activeTab, setActiveTab] = useState<LedgerTab>('Ledger Timeline');
  const [activeFilter, setActiveFilter] = useState<ActiveLedgerFilter>(null);
  const [ledgerEvents, setLedgerEvents] = useState<EventItem[]>(initialEvents);
  const [moldingOccurrences] = useState<MoldLogbookOccurrence[]>(initialMoldingLogbookEntries);
  const [activeMoldingOccurrence, setActiveMoldingOccurrence] = useState<MoldLogbookOccurrence | null>(null);
  const [isMoldingOccurrenceModalOpen, setIsMoldingOccurrenceModalOpen] = useState(false);
  const [selectedHierarchyId, setSelectedHierarchyId] = useState<string | null>(defaultSelectedHierarchyId);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [expandedHierarchyIds, setExpandedHierarchyIds] = useState<string[]>(initialExpandedHierarchyIds);
  const [isWorkOrderDrawerOpen, setIsWorkOrderDrawerOpen] = useState(false);
  const [workOrderDrawerTab, setWorkOrderDrawerTab] = useState<WorkOrderTab>('attachments');
  const bomRows = initialBomRows;

  const handleHierarchyClick = (hierarchyId: string) => {
    const nextHierarchyItem = hierarchyItems.find((item) => item.id === hierarchyId) ?? null;
    setSelectedHierarchyId(hierarchyId);
    setSelectedEventId(null);
    if (activeTab === 'Mold Logbook' && !isMoldM004Asset(nextHierarchyItem)) {
      setActiveTab('Ledger Timeline');
    } else if (activeTab !== 'Reliability' && activeTab !== 'Mold Logbook') {
      setActiveTab('Ledger Timeline');
    }
    setActiveFilter(null);
  };

  const handleToggleHierarchyNode = (hierarchyId: string) => {
    setExpandedHierarchyIds((prev) => (prev.includes(hierarchyId) ? prev.filter((id) => id !== hierarchyId) : [...prev, hierarchyId]));
  };

  const handleSelectEvent = (event: EventItem) => {
    setSelectedEventId(event.id);
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

  const handleOpenOeeDetails = () => {
    setActiveTab('Performance');
  };

  const moldHierarchyItem = hierarchyItems.find((item) => item.id === 'asset-m-004') ?? hierarchyItems.find((item) => item.id === 'asset-mm-301') ?? hierarchyItems[0];

  const handleOpenMoldingOccurrence = (occurrence: MoldLogbookOccurrence) => {
    setActiveMoldingOccurrence(occurrence);
    setIsMoldingOccurrenceModalOpen(true);
  };

  const handleCloseMoldingOccurrence = () => {
    setActiveMoldingOccurrence(null);
    setIsMoldingOccurrenceModalOpen(false);
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
    setActiveFilter('Corrective');
  };

  const selectedEvent = ledgerEvents.find((event) => event.id === selectedEventId);
  const selectedHierarchyItem = hierarchyItems.find((item) => item.id === selectedHierarchyId) ?? hierarchyItems.find((item) => item.id === 'asset-sa-204') ?? hierarchyItems[0];
  const visibleLedgerTabs = isMoldM004Asset(selectedHierarchyItem)
    ? ledgerTabs
    : ledgerTabs.filter((tab) => tab.label !== 'Mold Logbook');
  const headerHierarchyPath = getHierarchyPathLabels(selectedHierarchyItem.id).join(' / ');
  const highlightedHierarchyId = selectedEvent?.impactHierarchyIds[selectedEvent.impactHierarchyIds.length - 1] ?? selectedHierarchyId;
  const expandableHierarchyIds = new Set(hierarchyItems.filter((item, index) => hierarchyItems[index + 1]?.level > item.level).map((item) => item.id));
  const visibleHierarchyItems = getVisibleHierarchyItems(hierarchyItems, expandedHierarchyIds);

  return (
    <Box sx={{flexGrow: 1, height: {lg: 'calc(100vh - 24px)'}, minHeight: {xs: 'calc(100vh - 112px)', lg: 'calc(100vh - 24px)'}, boxSizing: 'border-box', bgcolor: 'background.default', overflowY: {xs: 'auto', lg: 'hidden'}, p: {xs: 1.4, md: 2}, display: 'flex', flexDirection: 'column', fontFamily: 'Roboto, Inter, Segoe UI, sans-serif'}}>
      <Paper elevation={0} sx={{border: 'none', borderRadius: 0, overflow: 'visible', bgcolor: 'transparent', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column'}}>
        <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1.5, mb: 1.6, flexWrap: 'wrap', flexShrink: 0}}>
          <Box>
            <Typography variant="h5" sx={{color: tokenText.primary, fontWeight: 700, lineHeight: 1.1}}>
              Equipment Ledger
            </Typography>
          </Box>
        </Box>
        <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', lg: '360px minmax(0, 1fr)', xl: '380px minmax(0, 1fr)'}, gap: 1.4, alignItems: 'stretch', flex: 1, minHeight: 0}}>
          <Paper elevation={0} sx={{border: `1px solid ${tokenDivider}`, borderRadius: '16px', overflow: 'hidden', minHeight: {lg: 0}, bgcolor: 'background.paper', display: 'flex', flexDirection: 'column'}}>
            <Box sx={{px: 1.5, py: 1.5}}>
              <Typography variant="subtitle1" sx={{color: tokenText.primary, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.8}}>
                <HierarchyIcon sx={{color: tokenBrand.main, fontSize: 19}} />
                Asset Hierarchy
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="Search asset..."
                sx={{mt: 1.1, '& .MuiOutlinedInput-root': {height: 32, borderRadius: '8px', bgcolor: 'background.paper'}, '& .MuiOutlinedInput-notchedOutline': {borderColor: tokenDivider}, '&:hover .MuiOutlinedInput-notchedOutline': {borderColor: tokenBrand.main}, '& .MuiInputBase-input': {fontSize: '0.875rem'}}}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{color: tokenText.secondary, fontSize: 18}} />
                    </InputAdornment>
                  ),
                }}
              />
              <Box sx={{display: 'flex', alignItems: 'center', gap: 1.2, mt: 1.1}}>
                <Typography variant="caption" sx={{color: mutedText, display: 'flex', alignItems: 'center', gap: 0.45}}>
                  <StatusDot color={tokenSuccess.main} /> Healthy
                </Typography>
                <Typography variant="caption" sx={{color: mutedText, display: 'flex', alignItems: 'center', gap: 0.45}}>
                  <StatusDot color={tokenWarning.main} /> Warning
                </Typography>
                <Typography variant="caption" sx={{color: mutedText, display: 'flex', alignItems: 'center', gap: 0.45}}>
                  <StatusDot color={tokenError.main} /> Critical
                </Typography>
              </Box>
            </Box>
            <Divider sx={{borderColor: tokenDivider}} />
            <Box sx={{maxHeight: {xs: 360, lg: 'none'}, flex: {lg: 1}, minHeight: 0, overflowY: 'auto', py: 1, pr: 1}}>
              {visibleHierarchyItems.map(({id, code, label, level, icon: Icon, active}) => {
                const isSelected = selectedHierarchyId === id;
                const isImpacted = highlightedHierarchyId === id;
                const isActiveNode = (!selectedHierarchyId && active) || isSelected || isImpacted;
                const hasChildren = expandableHierarchyIds.has(id);
                const isExpanded = expandedHierarchyIds.includes(id);

                return (
                  <Box
                    key={id}
                    role="button"
                    tabIndex={0}
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
                      pl: `${0.35 + level * 0.42}rem`,
                      pr: 1,
                      py: 0.7,
                      borderRadius: '8px',
                      display: 'grid',
                      gridTemplateColumns: '18px 18px minmax(0, 1fr) auto',
                      alignItems: 'center',
                      columnGap: 0.75,
                      color: isActiveNode ? tokenBrand.main : pageText,
                      bgcolor: isSelected ? tokenBrand.selectedBg : isImpacted ? tokenBrand.softBg : 'transparent',
                      border: isImpacted ? `1px solid ${tokenBrand.main}` : '1px solid transparent',
                      fontWeight: isActiveNode ? 700 : 500,
                      cursor: 'pointer',
                      overflow: 'hidden',
                      '&:hover': {bgcolor: isActiveNode ? tokenBrand.selectedBg : tokenNeutral.lightest},
                      '&:focus-visible': {outline: `2px solid ${tokenBrand.main}`, outlineOffset: 1},
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
                          '&:hover': {bgcolor: tokenBrand.softBg, color: tokenBrand.main},
                        }}
                      >
                        {isExpanded ? <DownIcon sx={{fontSize: 15}} /> : <ChevronRightIcon sx={{fontSize: 15}} />}
                      </IconButton>
                    ) : (
                      <Box sx={{width: 20, height: 20}} />
                    )}
                    {Icon ? <Icon sx={{fontSize: 17, color: isActiveNode ? tokenBrand.main : tokenText.secondary, flexShrink: 0}} /> : <DeviceComponentIcon sx={{fontSize: 17, color: tokenText.secondary, flexShrink: 0}} />}
                    <Typography
                      variant="body2"
                      title={label}
                      sx={{
                        minWidth: 0,
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitBoxOrient: 'vertical',
                        WebkitLineClamp: 2,
                        fontSize: '0.8125rem',
                        lineHeight: 1.25,
                        fontWeight: 'inherit',
                        letterSpacing: 0,
                      }}
                    >
                      {label}
                    </Typography>
                    <Chip
                      label={code}
                      size="small"
                      sx={{
                        height: 20,
                        maxWidth: 76,
                        justifySelf: 'end',
                        bgcolor: tokenCommon.white,
                        border: `1px solid ${tokenDivider}`,
                        color: tokenText.secondary,
                        borderRadius: '999px',
                        fontSize: '0.625rem',
                        fontWeight: 700,
                        '& .MuiChip-label': {px: 0.75, overflow: 'hidden', textOverflow: 'ellipsis'},
                      }}
                    />
                  </Box>
                );
              })}
            </Box>
          </Paper>

          <Paper elevation={0} sx={{border: `1px solid ${tokenDivider}`, borderRadius: '16px', overflow: 'hidden', bgcolor: 'background.paper', minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column'}}>
            <Box
              sx={{
                px: 2,
                pt: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
                width: '100%',
                flexWrap: 'wrap',
              }}
            >
              <Box role="tablist" sx={{display: 'flex', gap: 3, overflowX: 'auto'}}>
                {visibleLedgerTabs.map(({label}) => {
                  const isActive = label === activeTab;
                  return (
                    <Box
                      key={label}
                      role="tab"
                      aria-selected={isActive}
                      tabIndex={0}
                      onClick={() => setActiveTab(label)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          setActiveTab(label);
                        }
                      }}
                      sx={{
                        pb: 1.5,
                        cursor: 'pointer',
                        borderBottom: isActive ? `2px solid ${tokenBrand.main}` : '2px solid transparent',
                        color: isActive ? tokenText.primary : tokenText.secondary,
                        fontWeight: isActive ? 700 : 500,
                        fontSize: '0.875rem',
                        lineHeight: 1.57,
                        letterSpacing: '0.1px',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.2s ease',
                        '&:hover': {color: tokenBrand.main},
                        '&:focus-visible': {outline: `2px solid ${tokenBrand.main}`, outlineOffset: 2, borderRadius: '6px'},
                      }}
                    >
                      {label.toUpperCase()}
                    </Box>
                  );
                })}
              </Box>
              <Box sx={{display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 1.25}}>
                <Button
                  variant="outlined"
                  size="medium"
                  startIcon={<PerformanceIcon sx={{fontSize: 18}} />}
                  onClick={handleOpenOeeDetails}
                  sx={{
                    minWidth: 156,
                    height: 40,
                    px: 2,
                    borderRadius: '8px',
                    borderColor: tokenDivider,
                    color: tokenBrand.main,
                    bgcolor: tokenCommon.white,
                    fontSize: '0.875rem',
                    lineHeight: '24px',
                    fontWeight: 500,
                    letterSpacing: '0.4px',
                    textTransform: 'none',
                    boxShadow: 'none',
                    '&:hover': {borderColor: tokenBrand.main, bgcolor: tokenBrand.softBg, boxShadow: 'none'},
                  }}
                >
                  See OEE details
                </Button>
                <Button
                  variant="contained"
                  size="medium"
                  onClick={handleOpenWorkOrderDrawer}
                  sx={{
                    minWidth: 164,
                    height: 40,
                    px: 2.25,
                    borderRadius: '8px',
                    bgcolor: tokenBrand.main,
                    color: tokenBrand.contrast,
                    fontSize: '0.875rem',
                    lineHeight: '24px',
                    fontWeight: 500,
                    letterSpacing: '0.4px',
                    textTransform: 'none',
                    boxShadow: 'none',
                    '&:hover': {bgcolor: tokenBrand.dark, boxShadow: 'none'},
                  }}
                >
                  Create Work Order
                </Button>
              </Box>
            </Box>

            <Box sx={{px: 2, py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, flexWrap: 'wrap'}}>
              <Box sx={{minWidth: 0}}>
                <Typography variant="subtitle2" sx={{color: tokenText.primary, fontWeight: 700, lineHeight: 1.57}}>
                  {selectedHierarchyItem.label}
                </Typography>
                <Typography variant="caption" sx={{color: tokenText.secondary, display: 'flex', alignItems: 'center', gap: 0.45, mt: 0.2, fontWeight: 400}}>
                  <ShieldIcon sx={{fontSize: 14, color: tokenText.secondary}} /> {headerHierarchyPath}
                </Typography>
              </Box>
              <Box sx={{display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap'}}>
                <Chip label={selectedHierarchyItem.code} size="small" sx={{height: 24, bgcolor: tokenNeutral.lightest, color: tokenText.primary, border: `1px solid ${tokenDivider}`, borderRadius: '999px', fontWeight: 500}} />
                <Chip label="Criticality A" size="small" sx={{height: 24, bgcolor: tokenError.lightest, color: tokenError.dark, borderRadius: '999px', fontWeight: 500}} />
                <Chip icon={<WarningIcon sx={{fontSize: '14px !important'}} />} label="Warning" size="small" sx={{height: 24, bgcolor: tokenWarning.lightest, color: tokenWarning.dark, borderRadius: '999px', fontWeight: 500}} />
                <Chip label="In Operation" size="small" sx={{height: 24, bgcolor: tokenBrand.softBg, color: tokenBrand.main, borderRadius: '999px', fontWeight: 500}} />
              </Box>
            </Box>

            <Box
              sx={{
                px: activeTab === 'Ledger Timeline' || activeTab === 'Performance' ? 0 : 2,
                py: activeTab === 'Ledger Timeline' || activeTab === 'Performance' ? 0 : 2,
                flex: 1,
                minHeight: 0,
                overflowY: 'auto',
                display: activeTab === 'Performance' || activeTab === 'Future Actions' ? 'flex' : 'block',
                flexDirection: 'column',
                '& > *': activeTab === 'Performance' || activeTab === 'Future Actions' ? {flex: 1} : undefined,
              }}
            >
              {renderTabContent({
                activeTab,
                activeFilter,
                events: ledgerEvents,
                moldingOccurrences,
                selectedHierarchyId,
                selectedEventId,
                bomRows,
                onFilterChange: setActiveFilter,
                onOpenMoldingOccurrence: handleOpenMoldingOccurrence,
                onSelectEvent: handleSelectEvent,
                onReviewAiEvidence: handleReviewAiEvidence,
              })}
            </Box>
          </Paper>
        </Box>
      </Paper>

      <CreateWorkOrderDrawer
        open={isWorkOrderDrawerOpen}
        activeTab={workOrderDrawerTab}
        initialDraft={null}
        onTabChange={setWorkOrderDrawerTab}
        onClose={handleCloseWorkOrderDrawer}
        onSubmit={handleCreateWorkOrder}
      />

      <MoldingOccurrenceModal
        open={isMoldingOccurrenceModalOpen}
        asset={moldHierarchyItem}
        occurrence={activeMoldingOccurrence}
        occurrences={moldingOccurrences}
        onClose={handleCloseMoldingOccurrence}
      />

    </Box>
  );
}
