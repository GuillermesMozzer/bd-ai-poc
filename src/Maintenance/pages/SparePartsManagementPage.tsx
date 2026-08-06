import React from 'react';
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  Drawer,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  Menu,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  TextField,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import {
  Add as AddIcon,
  AutoAwesome as SparkleIcon,
  CalendarTodayOutlined as CalendarIcon,
  CategoryOutlined as CategoryIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
  Inventory2Outlined as InventoryIcon,
  Inventory2Outlined as InventoryDrawerIcon,
  InfoOutlined as InfoIcon,
  PrecisionManufacturing as CouplingIcon,
  PersonOutline as PersonIcon,
  Remove as RemoveIcon,
  Search as SearchIcon,
  SettingsInputComponent as SensorIcon,
  LocalShippingOutlined as ReceivingIcon,
  SyncAlt as PackageBoardIcon,
  WarningAmberRounded as WarningIcon,
  Opacity as HoseIcon,
  Rotate90DegreesCw as SealIcon,
  Settings as ValveIcon,
  ElectricBolt as ElectricalIcon,
  Waves as LubricantIcon,
  Tune as FilterIcon,
  Autorenew as ChainIcon,
  DonutLarge as GasketIcon,
  KeyboardArrowDown as ChevronDownIcon,
  KeyboardArrowUp as ChevronUpIcon,
  QrCodeScanner as BarcodeIcon,
  AccessTime as ClockIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  LocalShipping as ShippingIcon,
  ViewColumn as WorkOrderBoardIcon,
  FormatListBulleted as WorkOrderListIcon,
} from '@mui/icons-material';
import {
  Upload as PickUpIcon,
  Download as ReceiptIcon,
  RotateLeft as ReturnIcon,
} from '@mui/icons-material';
import { activeTheme } from '../../theme';
import StandardDrawer from '../../common/components/StandardDrawer';
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
import { maintenanceLaneData } from '../data';
import EquipmentSelector, { findEquipmentSelectionByName, EquipmentSelection } from '../components/EquipmentSelector';
import type { MaintenanceCard } from '../types';
import {
  CreateWorkOrderDrawer as FollowUpWorkOrderDrawer,
  type ExecutionDrawerSectionKey,
  type WorkOrderDraft,
  type WorkOrderTab,
} from './MaintenanceFollowUpBoardPage';

type SparePartsView = 'inventory' | 'work-orders' | 'purchase-orders' | 'history-consumption';
type WorkOrderViewMode = 'board' | 'list';
type ConsumptionTrendView = 'all' | 'equipment' | 'part';
type StockState = 'in-stock' | 'low-stock' | 'out-of-stock';
type InventoryCondition = 'New' | 'Refurbished';

type InventorySupplier = {
  name: string;
  supplier: string;
};

type InventorySiteAvailability = {
  name: string;
  city: string;
  quantity: number;
};

type LocalSparePartsSite = {
  name: string;
  city: string;
  region: string;
  facilityType: string;
};

type InventoryPart = {
  id: string;
  sapNumber: string;
  category: string;
  condition: InventoryCondition;
  name: string;
  machineFamily: string;
  usedIn: EquipmentSelection[];
  binLocation: string;
  manufacturer: string;
  unitPrice: number;
  currentStock: number;
  reservedStock: number;
  safetyStock: number;
  notes: string;
  photoSrc: string;
  drawingSrc: string;
  suppliers: InventorySupplier[];
  siteAvailability: InventorySiteAvailability[];
  icon: React.ReactNode;
};

export type SparePartsInventoryPart = InventoryPart;

type InventorySeed = {
  category: string;
  name: string;
  code: string;
  machineFamily: string;
  binLocation: string;
  manufacturer: string;
  unitPrice: number;
  currentStock: number;
  reservedStock: number;
  safetyStock: number;
  notes: string;
  spec: string;
};

type WorkOrderMaintenanceType = 'preventive' | 'corrective' | 'breakdown';
type WorkOrderShift = 'Morning' | 'Afternoon' | 'Night';
type WorkOrderStatus = 'planning' | 'scheduled' | 'in progress' | 'done';

type SparePartCatalogItem = {
  id: string;
  code: string;
  description: string;
  location: string;
  availableQuantity: number;
  defaultRequestedQuantity: number;
};

type WorkOrderSparePart = SparePartCatalogItem & {
  delivered: boolean;
  reserved: boolean;
  requestedQuantity: number;
};

type WorkOrderCardData = {
  id: string;
  equipment: string;
  detail: string;
  assignee: string;
  maintenanceType: WorkOrderMaintenanceType;
  status: WorkOrderStatus;
  shift: WorkOrderShift | null;
  scheduledDate: string;
  scheduledTime: string;
  scheduledSort: number;
  priorityLabel: string;
  spareParts: WorkOrderSparePart[];
};

type WorkOrderPackageStatus = {
  kind: 'no-parts-requested' | 'required' | 'reserved' | 'awaiting-pick-up' | 'partial-picked-up' | 'picked-up';
  label: string;
  totalUnits: number;
  pickedUnits: number;
  tone: string;
  bg: string;
  border: string;
};

type WorkOrderPackageStage = 'upcoming' | 'reserved' | 'ready-for-pick-up' | 'partial-pick-up' | 'pick-up-completed';
type WorkOrderPackageFilter = 'all' | 'no-parts-requested' | 'required' | 'reserved' | 'ready-for-pick-up' | 'partial-pick-up' | 'pick-up-completed' | 'missing-parts';
type WorkOrderLaneExpandedState = Record<WorkOrderPackageStage, boolean>;

type WorkOrderPartStockSnapshot = {
  requiredQuantity: number;
  availableQuantity: number;
  totalQuantity: number;
  otherReservedQuantity: number;
  hasShortage: boolean;
};

type MissingPartRequestAlert = {
  id: string;
  workOrderId: string;
  equipment: string;
  scope: string;
  requestedBy: string;
  requiredBy: string;
  partId: string;
  code: string;
  description: string;
  location: string;
  requestedQuantity: number;
  availableQuantity: number;
  shortageQuantity: number;
  onHandQuantity: number;
  otherReservedQuantity: number;
  priorityLabel: string;
  suggestedAction: string;
  reservedSourceWorkOrderId?: string;
  incomingPo?: {
    id: string;
    vendor: string;
    expectedDate?: string;
    quantity: number;
  };
  alternativeBins: string[];
  otherSites: InventorySiteAvailability[];
};

type InventoryAdjustment = {
  currentStockDelta: number;
  reservedStockDelta: number;
};

type InventoryConsumptionLevel = 'high' | 'dead-stock' | 'normal';

type InventoryConsumptionBreakdown = {
  label: string;
  helper: string;
  tone: string;
  bg: string;
  border: string;
  skus: number;
  units: number;
  value: number;
};

const boardTabs = [
  { key: 'inventory' as SparePartsView, label: 'Inventory', icon: <InventoryIcon sx={{ fontSize: 18 }} /> },
  { key: 'work-orders' as SparePartsView, label: 'Work Orders', icon: <PackageBoardIcon sx={{ fontSize: 18 }} /> },
  { key: 'purchase-orders' as SparePartsView, label: 'Purchase Orders', icon: <ReceivingIcon sx={{ fontSize: 18 }} /> },
  { key: 'history-consumption' as SparePartsView, label: 'Consumption', icon: <CategoryIcon sx={{ fontSize: 18 }} /> },
];

function SettingsIconShim({ sx }: { sx?: object }) {
  return <CategoryIcon sx={sx} />;
}

const localSparePartsSites: LocalSparePartsSite[] = [
  { name: 'Sandy', city: 'Sandy', region: 'Americas', facilityType: 'Manufacturing Sites' },
  { name: 'El Paso', city: 'El Paso', region: 'Americas', facilityType: 'Manufacturing Sites' },
  { name: 'Tijuana', city: 'Tijuana', region: 'Americas', facilityType: 'Manufacturing Sites' },
  { name: 'Cuautitlan', city: 'Cuautitlan', region: 'Americas', facilityType: 'Manufacturing Sites' },
  { name: 'Humacao', city: 'Humacao', region: 'Americas', facilityType: 'Manufacturing Sites' },
  { name: 'Columbus West', city: 'Columbus', region: 'Americas', facilityType: 'Manufacturing Sites' },
  { name: 'Columbus East', city: 'Columbus', region: 'Americas', facilityType: 'Manufacturing Sites' },
  { name: 'Juiz de Fora', city: 'Juiz de Fora', region: 'Americas', facilityType: 'Manufacturing Sites' },
  { name: 'Plymouth', city: 'Plymouth', region: 'Europe', facilityType: 'Manufacturing Sites' },
  { name: 'Le Pont-de-Claix', city: 'Le Pont-de-Claix', region: 'Europe', facilityType: 'Manufacturing Sites' },
  { name: 'Fraga', city: 'Fraga', region: 'Europe', facilityType: 'Manufacturing Sites' },
  { name: 'Tatabanya', city: 'Tatabanya', region: 'Europe', facilityType: 'Manufacturing Sites' },
  { name: 'Shanghai', city: 'Shanghai', region: 'Asia Pacific', facilityType: 'Manufacturing Sites' },
  { name: 'Tuas', city: 'Tuas', region: 'Asia Pacific', facilityType: 'Manufacturing Sites' },
  { name: 'Kulim', city: 'Kulim', region: 'Asia Pacific', facilityType: 'Manufacturing Sites' },
  { name: 'Four Oaks', city: 'Four Oaks', region: 'Americas', facilityType: 'Distribution Centers' },
  { name: 'Redlands', city: 'Redlands', region: 'Americas', facilityType: 'Distribution Centers' },
  { name: 'Plainfield', city: 'Plainfield', region: 'Americas', facilityType: 'Distribution Centers' },
  { name: 'Temse', city: 'Temse', region: 'Europe', facilityType: 'Distribution Centers' },
  { name: 'Franklin Lakes', city: 'Franklin Lakes', region: 'Americas', facilityType: 'Office Buildings' },
  { name: 'Irvine', city: 'Irvine', region: 'Americas', facilityType: 'Office Buildings' },
  { name: 'Eysins', city: 'Eysins', region: 'Europe', facilityType: 'Office Buildings' },
];

function buildInventoryPhotoReference(
  title: string,
  subtitle: string,
  accent: string,
  category?: string
) {
  const baseFrame = `
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#FFFFFF" />
        <stop offset="100%" stop-color="#EDF3FB" />
      </linearGradient>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="16" stdDeviation="12" flood-color="#0F172A" flood-opacity="0.14"/>
      </filter>
      <linearGradient id="metal" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#5B616B" />
        <stop offset="28%" stop-color="#D6D9DE" />
        <stop offset="55%" stop-color="#717883" />
        <stop offset="100%" stop-color="#30353D" />
      </linearGradient>
      <linearGradient id="rubber" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#2F343C" />
        <stop offset="100%" stop-color="#111827" />
      </linearGradient>
      <linearGradient id="paperBlue" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#93C5FD" />
        <stop offset="100%" stop-color="#2563EB" />
      </linearGradient>
    </defs>
    <rect width="640" height="420" rx="28" fill="url(#bg)" />
    <rect x="34" y="34" width="572" height="352" rx="24" fill="#FFFFFF" stroke="#D7E3F1" stroke-width="2" />
  `;

  let partMarkup = `
    <rect x="78" y="92" width="484" height="196" rx="20" fill="${accent}" fill-opacity="0.12" stroke="${accent}" stroke-width="3" />
    <circle cx="152" cy="188" r="42" fill="${accent}" fill-opacity="0.28" />
    <rect x="210" y="146" width="250" height="84" rx="18" fill="${accent}" fill-opacity="0.2" />
    <rect x="470" y="130" width="58" height="120" rx="18" fill="${accent}" fill-opacity="0.34" />
  `;

  if (category === 'Bearing') {
    partMarkup = `
      <g filter="url(#shadow)">
        <circle cx="320" cy="190" r="126" fill="url(#metal)" />
        <circle cx="320" cy="190" r="92" fill="#111827" />
        <circle cx="320" cy="190" r="66" fill="url(#metal)" />
        <circle cx="320" cy="190" r="50" fill="#F8FAFC" />
        ${Array.from({ length: 14 }, (_, index) => {
      const angle = (Math.PI * 2 * index) / 14;
      const x = 320 + Math.cos(angle) * 79;
      const y = 190 + Math.sin(angle) * 79;
      return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="12" fill="#BFC6CF" stroke="#5B616B" stroke-width="2" />`;
    }).join('')}
      </g>
    `;
  }

  if (category === 'Belt') {
    partMarkup = `
      <path d="M190 118 C128 170, 134 270, 222 306 C332 350, 510 280, 500 178 C492 96, 330 90, 250 138 C224 154, 220 172, 228 190"
        fill="none" stroke="url(#rubber)" stroke-width="24" stroke-linecap="round" filter="url(#shadow)" />
      ${Array.from({ length: 38 }, (_, index) => {
      const x = 188 + index * 9;
      const y = index < 19 ? 118 + index * 6.2 : 236 - (index - 19) * 5.1;
      return `<rect x="${x}" y="${y}" width="6" height="18" rx="2" fill="#1F2937" opacity="0.8" transform="rotate(35 ${x} ${y})" />`;
    }).join('')}
    `;
  }

  if (category === 'Gasket') {
    partMarkup = `
      <g filter="url(#shadow)">
        <rect x="188" y="108" width="264" height="164" rx="26" fill="none" stroke="#20252E" stroke-width="16" />
        <circle cx="208" cy="128" r="10" fill="#FFFFFF" />
        <circle cx="432" cy="128" r="10" fill="#FFFFFF" />
        <circle cx="208" cy="252" r="10" fill="#FFFFFF" />
        <circle cx="432" cy="252" r="10" fill="#FFFFFF" />
        <circle cx="238" cy="144" r="5" fill="#FFFFFF" />
        <circle cx="402" cy="144" r="5" fill="#FFFFFF" />
        <circle cx="238" cy="236" r="5" fill="#FFFFFF" />
        <circle cx="402" cy="236" r="5" fill="#FFFFFF" />
      </g>
    `;
  }

  if (category === 'Filter') {
    partMarkup = title.toLowerCase().includes('cartridge')
      ? `
        <g filter="url(#shadow)">
          <ellipse cx="395" cy="174" rx="78" ry="92" fill="url(#paperBlue)" />
          ${Array.from({ length: 18 }, (_, index) => {
        const x = 334 + index * 7;
        return `<rect x="${x}" y="92" width="4" height="164" rx="2" fill="#5FA6FF" opacity="0.8" />`;
      }).join('')}
          <circle cx="282" cy="186" r="84" fill="#FAFAF8" />
          <circle cx="282" cy="186" r="34" fill="#E7E5E4" />
        </g>
      `
      : `
        <g filter="url(#shadow)">
          <rect x="190" y="88" width="260" height="212" rx="10" fill="#FFFFFF" stroke="#D4DCE7" stroke-width="8" />
          ${Array.from({ length: 12 }, (_, row) => {
        const y = 106 + row * 14;
        return `<path d="M208 ${y} L432 ${y}" stroke="#DCE5EF" stroke-width="10" stroke-linecap="round" />`;
      }).join('')}
          ${Array.from({ length: 16 }, (_, col) => {
        const x = 214 + col * 14;
        return `<path d="M${x} 102 L${x} 286" stroke="#EEF3F8" stroke-width="3" />`;
      }).join('')}
        </g>
      `;
  }

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 420">
      ${baseFrame}
      ${partMarkup}
      <text x="78" y="332" font-family="Arial, sans-serif" font-size="26" font-weight="700" fill="#0F172A">${title}</text>
      <text x="78" y="365" font-family="Arial, sans-serif" font-size="18" fill="#475569">${subtitle}</text>
    </svg>
  `)}`;
}

function buildInventoryImage(
  title: string,
  subtitle: string,
  accent: string,
  variant: 'photo' | 'drawing',
  category?: string
) {
  if (variant === 'photo') {
    return buildInventoryPhotoReference(title, subtitle, accent, category);
  }

  const svg =
    `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 420">
        <rect width="640" height="420" rx="28" fill="#F8FAFC" />
        <rect x="30" y="30" width="580" height="360" rx="24" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="2" />
        <rect x="150" y="120" width="250" height="92" rx="10" fill="none" stroke="${accent}" stroke-width="4" />
        <rect x="410" y="102" width="70" height="128" rx="10" fill="none" stroke="${accent}" stroke-width="4" />
        <circle cx="150" cy="166" r="34" fill="none" stroke="${accent}" stroke-width="4" />
        <line x1="110" y1="84" x2="510" y2="84" stroke="#64748B" stroke-width="2" stroke-dasharray="8 6" />
        <line x1="110" y1="256" x2="510" y2="256" stroke="#64748B" stroke-width="2" stroke-dasharray="8 6" />
        <line x1="106" y1="84" x2="106" y2="256" stroke="#64748B" stroke-width="2" />
        <line x1="514" y1="84" x2="514" y2="256" stroke="#64748B" stroke-width="2" />
        <line x1="132" y1="286" x2="496" y2="286" stroke="#64748B" stroke-width="2" />
        <line x1="132" y1="278" x2="132" y2="294" stroke="#64748B" stroke-width="2" />
        <line x1="496" y1="278" x2="496" y2="294" stroke="#64748B" stroke-width="2" />
        <text x="255" y="74" font-family="Arial, sans-serif" font-size="20" font-weight="700" fill="#334155">Technical drawing</text>
        <text x="250" y="318" font-family="Arial, sans-serif" font-size="18" fill="#475569">${subtitle}</text>
        <text x="246" y="345" font-family="Arial, sans-serif" font-size="22" font-weight="700" fill="#0F172A">${title}</text>
      </svg>
    `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function getAvailableStock(part: Pick<InventoryPart, 'currentStock' | 'reservedStock'>) {
  return Math.max(part.currentStock - part.reservedStock, 0);
}

function getInventoryStockState(part: Pick<InventoryPart, 'currentStock' | 'reservedStock' | 'safetyStock'>): StockState {
  const availableStock = getAvailableStock(part);

  if (part.currentStock <= 0 || availableStock <= 0) return 'out-of-stock';
  if (availableStock <= part.safetyStock || part.currentStock <= part.safetyStock) return 'low-stock';
  return 'in-stock';
}

function matchesEquipmentSelection(equipment: EquipmentSelection, selection: EquipmentSelection | null) {
  if (!selection) return true;

  return (
    equipment.id === selection.id ||
    equipment.path.includes(selection.name) ||
    selection.path.includes(equipment.name)
  );
}

const inventoryCurrencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
});

const sparePartsSelectMenuProps = {
  variant: 'menu' as const,
  anchorOrigin: {
    vertical: 'bottom' as const,
    horizontal: 'left' as const,
  },
  transformOrigin: {
    vertical: 'top' as const,
    horizontal: 'left' as const,
  },
  PaperProps: {
    sx: {
      mt: 0.5,
      borderRadius: '8px',
      border: `1px solid ${tokenDivider}`,
      boxShadow: 'var(--shadow-elevation-medium)',
    },
  },
};
const inventorySupplierPool: Record<string, InventorySupplier[]> = {
  Bearing: [
    { name: 'SKF Industrial Brasil', supplier: 'SUP-BRG-201' },
    { name: 'NSK Motion Supply', supplier: 'SUP-BRG-202' },
    { name: 'Timken Channel Partner', supplier: 'SUP-BRG-203' },
  ],
  Seal: [
    { name: 'Parker Sealing Systems', supplier: 'SUP-SEA-211' },
    { name: 'Freudenberg Industrial', supplier: 'SUP-SEA-212' },
  ],
  Belt: [
    { name: 'Gates Power Transmission', supplier: 'SUP-BEL-221' },
    { name: 'Continental Industrial Belt', supplier: 'SUP-BEL-222' },
    { name: 'Habasit Service Network', supplier: 'SUP-BEL-223' },
  ],
  Filter: [
    { name: 'Hydac Filtration Channel', supplier: 'SUP-FIL-231' },
    { name: 'Donaldson Process Supply', supplier: 'SUP-FIL-232' },
    { name: 'SMC Air Prep Distributor', supplier: 'SUP-FIL-233' },
  ],
  Valve: [
    { name: 'Festo Motion Center', supplier: 'SUP-VAL-241' },
    { name: 'Swagelok Industrial', supplier: 'SUP-VAL-242' },
    { name: 'Bosch Rexroth Service', supplier: 'SUP-VAL-243' },
  ],
  Sensor: [
    { name: 'Pepperl+Fuchs Automation', supplier: 'SUP-SEN-251' },
    { name: 'SICK Integration Supply', supplier: 'SUP-SEN-252' },
  ],
  Motor: [
    { name: 'SEW-Eurodrive Channel', supplier: 'SUP-MOT-261' },
    { name: 'Siemens Motion Parts', supplier: 'SUP-MOT-262' },
    { name: 'WEG Service Partner', supplier: 'SUP-MOT-263' },
  ],
  Coupling: [
    { name: 'Lovejoy Motion Distributor', supplier: 'SUP-CPL-271' },
    { name: 'Rexnord Drive Systems', supplier: 'SUP-CPL-272' },
  ],
  Gasket: [
    { name: 'Flexitallic Process Seals', supplier: 'SUP-GSK-281' },
    { name: 'Alfa Laval Service Supply', supplier: 'SUP-GSK-282' },
  ],
  Chain: [
    { name: 'Tsubaki Conveyor Supply', supplier: 'SUP-CHN-291' },
    { name: 'Renold Industrial Chain', supplier: 'SUP-CHN-292' },
  ],
  Connector: [
    { name: 'Turck Connectivity Brasil', supplier: 'SUP-CON-301' },
    { name: 'Phoenix Contact Stocking', supplier: 'SUP-CON-302' },
    { name: 'Harting Modular Systems', supplier: 'SUP-CON-303' },
  ],
  Switch: [
    { name: 'Omron Control Components', supplier: 'SUP-SWI-311' },
    { name: 'Schmersal Safety Partner', supplier: 'SUP-SWI-312' },
  ],
  Harness: [
    { name: 'Lapp Industrial Cabling', supplier: 'SUP-HAR-321' },
    { name: 'ABB Robotics Service', supplier: 'SUP-HAR-322' },
    { name: 'Murrelektronik Assemblies', supplier: 'SUP-HAR-323' },
  ],
  Lubricant: [
    { name: 'Mobil Plant Lubricants', supplier: 'SUP-LUB-331' },
    { name: 'Shell Omala Industrial', supplier: 'SUP-LUB-332' },
  ],
  Pump: [
    { name: 'Grundfos Process Solutions', supplier: 'SUP-PMP-341' },
    { name: 'Graco Fluid Handling', supplier: 'SUP-PMP-342' },
    { name: 'Lincoln Lubrication Group', supplier: 'SUP-PMP-343' },
  ],
  Fuse: [
    { name: 'Bussmann Electrical Supply', supplier: 'SUP-FUS-351' },
    { name: 'Mersen Power Protection', supplier: 'SUP-FUS-352' },
  ],
  Hose: [
    { name: 'Parker Hose Division', supplier: 'SUP-HOS-361' },
    { name: 'Continental Fluid Transfer', supplier: 'SUP-HOS-362' },
  ],
};

function buildPartSuppliers(seed: InventorySeed, index: number) {
  const supplierPool = inventorySupplierPool[seed.category] ?? [
    { name: seed.manufacturer, supplier: `SUP-${seed.code.slice(-4)}` },
  ];
  const desiredCount = index % 9 === 0 ? 1 : index % 5 === 0 ? 3 : 2;
  const orderedSuppliers = [
    { name: seed.manufacturer, supplier: `${seed.code.replace('SP-', 'SUP-')}` },
    ...supplierPool.filter((entry) => entry.name !== seed.manufacturer),
  ];

  return orderedSuppliers.slice(0, Math.min(desiredCount, orderedSuppliers.length));
}

function buildSiteAvailability(seed: InventorySeed, index: number): InventorySiteAvailability[] {
  const siteCount = index % 4 === 0 ? 3 : 2;

  return Array.from({ length: siteCount }, (_, siteIndex) => {
    const site = localSparePartsSites[(index + siteIndex) % localSparePartsSites.length];
    const quantityBase = Math.max(seed.currentStock - seed.reservedStock - siteIndex * 2, 1);
    const quantity = seed.unitPrice >= 1000
      ? Math.max(1, Math.min(3, quantityBase))
      : seed.unitPrice >= 250
        ? Math.max(2, Math.min(8, quantityBase))
        : Math.max(4, Math.min(22, quantityBase + 3));

    return {
      name: site.name,
      city: site.city,
      quantity,
    };
  });
}

const legacyInventoryParts = [
  {
    id: 'inv-01',
    sapNumber: 'SAP-440012',
    category: 'Consumable',
    name: 'Sterile syringe transfer seal kit',
    machineFamily: 'Syringe filling module SF-220',
    binLocation: 'A1-04',
    manufacturer: 'MedAxis Components',
    currentStock: 124,
    reservedStock: 40,
    safetyStock: 60,
    notes: 'Seal set used on the transfer head that positions sterile syringes before filling.',
    photoSrc: buildInventoryImage('Transfer seal kit', 'Photo reference', '#2563EB', 'photo'),
    drawingSrc: buildInventoryImage('Seal kit', 'OD 32 mm · ID 18 mm', '#2563EB', 'drawing'),
    icon: <SealIcon sx={{ fontSize: 34 }} />,
  },
  {
    id: 'inv-02',
    sapNumber: 'SAP-440105',
    category: 'Sensor & Vision',
    name: 'Nozzle alignment sensor M8',
    machineFamily: 'Needle placement station NP-18',
    binLocation: 'B2-09',
    manufacturer: 'SensoTrack',
    currentStock: 9,
    reservedStock: 3,
    safetyStock: 4,
    notes: 'Detects syringe nozzle position before automatic insertion and crimping.',
    photoSrc: buildInventoryImage('Alignment sensor', 'Photo reference', '#0F766E', 'photo'),
    drawingSrc: buildInventoryImage('Sensor M8', 'Body 52 mm · Thread M8', '#0F766E', 'drawing'),
    icon: <SensorIcon sx={{ fontSize: 34 }} />,
  },
  {
    id: 'inv-03',
    sapNumber: 'SAP-440208',
    category: 'Pneumatic',
    name: 'Gripper jaw pad set',
    machineFamily: 'Cartoning robot CR-90',
    binLocation: 'C3-11',
    manufacturer: 'AirMotion Medical',
    currentStock: 18,
    reservedStock: 6,
    safetyStock: 8,
    notes: 'Soft-contact jaw pads for handling blister packs and sterile tray assemblies.',
    photoSrc: buildInventoryImage('Jaw pad set', 'Photo reference', '#7C3AED', 'photo'),
    drawingSrc: buildInventoryImage('Jaw pad', 'Pad 48 x 22 mm', '#7C3AED', 'drawing'),
    icon: <ValveIcon sx={{ fontSize: 34 }} />,
  },
  {
    id: 'inv-04',
    sapNumber: 'SAP-440319',
    category: 'Mechanical',
    name: 'Servo feed belt 12 mm FDA',
    machineFamily: 'Tube feeding conveyor TF-140',
    binLocation: 'D1-02',
    manufacturer: 'LineDrive',
    currentStock: 5,
    reservedStock: 2,
    safetyStock: 4,
    notes: 'Drive belt for synchronized feeding of syringe barrels into the assembly cell.',
    photoSrc: buildInventoryImage('Servo feed belt', 'Photo reference', '#EA580C', 'photo'),
    drawingSrc: buildInventoryImage('Belt profile', 'Length 1840 mm', '#EA580C', 'drawing'),
    icon: <PackageBoardIcon sx={{ fontSize: 34 }} />,
  },
  {
    id: 'inv-05',
    sapNumber: 'SAP-440411',
    category: 'Mechanical',
    name: 'Syringe nesting guide rail',
    machineFamily: 'Tray loading station TL-55',
    binLocation: 'D4-06',
    manufacturer: 'PreciseMed Fabrication',
    currentStock: 3,
    reservedStock: 1,
    safetyStock: 2,
    notes: 'Machined guide rail that keeps syringe nests aligned before sealing.',
    photoSrc: buildInventoryImage('Guide rail', 'Photo reference', '#475569', 'photo'),
    drawingSrc: buildInventoryImage('Guide rail', 'Length 410 mm', '#475569', 'drawing'),
    icon: <CouplingIcon sx={{ fontSize: 34 }} />,
  },
  {
    id: 'inv-06',
    sapNumber: 'SAP-440522',
    category: 'Lubrication',
    name: 'Peristaltic pump lubrication cartridge',
    machineFamily: 'Dosing skid DS-48',
    binLocation: 'E2-08',
    manufacturer: 'FlowPrime',
    currentStock: 22,
    reservedStock: 8,
    safetyStock: 10,
    notes: 'Food-grade lubricant cartridge for peristaltic pump bearings in clean areas.',
    photoSrc: buildInventoryImage('Lubrication cartridge', 'Photo reference', '#16A34A', 'photo'),
    drawingSrc: buildInventoryImage('Cartridge', 'Volume 250 ml', '#16A34A', 'drawing'),
    icon: <LubricantIcon sx={{ fontSize: 34 }} />,
  },
  {
    id: 'inv-07',
    sapNumber: 'SAP-440603',
    category: 'Pneumatic',
    name: '24V sterile air manifold valve',
    machineFamily: 'Needle capper NC-30',
    binLocation: 'F1-10',
    manufacturer: 'PneuCore',
    currentStock: 4,
    reservedStock: 1,
    safetyStock: 3,
    notes: 'Solenoid valve used to actuate the manifold that drives capping cylinders.',
    photoSrc: buildInventoryImage('Manifold valve', 'Photo reference', '#0891B2', 'photo'),
    drawingSrc: buildInventoryImage('Valve body', 'Port 1/8 in', '#0891B2', 'drawing'),
    icon: <ValveIcon sx={{ fontSize: 34 }} />,
  },
  {
    id: 'inv-08',
    sapNumber: 'SAP-440744',
    category: 'Filtration',
    name: 'HEPA vacuum filter cartridge',
    machineFamily: 'Packaging cell PK-12',
    binLocation: 'G2-03',
    manufacturer: 'CleanFlow',
    currentStock: 7,
    reservedStock: 1,
    safetyStock: 3,
    notes: 'Replacement filter cartridge for particulate extraction in sterile packaging.',
    photoSrc: buildInventoryImage('HEPA cartridge', 'Photo reference', '#1D4ED8', 'photo'),
    drawingSrc: buildInventoryImage('Filter cartridge', 'Dia 86 mm · H 192 mm', '#1D4ED8', 'drawing'),
    icon: <FilterIcon sx={{ fontSize: 34 }} />,
  },
  {
    id: 'inv-09',
    sapNumber: 'SAP-440856',
    category: 'Hydraulic',
    name: 'Damping cylinder seal pack',
    machineFamily: 'Carton press CP-70',
    binLocation: 'H3-12',
    manufacturer: 'HydraSafe',
    currentStock: 2,
    reservedStock: 1,
    safetyStock: 3,
    notes: 'Seal pack for the damping cylinder that controls carton compression force.',
    photoSrc: buildInventoryImage('Seal pack', 'Photo reference', '#DC2626', 'photo'),
    drawingSrc: buildInventoryImage('Seal stack', 'Rod 25 mm', '#DC2626', 'drawing'),
    icon: <HoseIcon sx={{ fontSize: 34 }} />,
  },
  {
    id: 'inv-10',
    sapNumber: 'SAP-440918',
    category: 'Safety',
    name: 'Safety door interlock switch',
    machineFamily: 'Sterile enclosure SE-10',
    binLocation: 'J1-05',
    manufacturer: 'SafeGate',
    currentStock: 0,
    reservedStock: 0,
    safetyStock: 2,
    notes: 'Interlock switch installed on the sterile chamber access door.',
    photoSrc: buildInventoryImage('Interlock switch', 'Photo reference', '#B91C1C', 'photo'),
    drawingSrc: buildInventoryImage('Interlock', 'Body 88 x 25 mm', '#B91C1C', 'drawing'),
    icon: <ElectricalIcon sx={{ fontSize: 34 }} />,
  },
  {
    id: 'inv-11',
    sapNumber: 'SAP-441024',
    category: 'Electrical',
    name: 'UV curing lamp driver board',
    machineFamily: 'Label curing tunnel LC-40',
    binLocation: 'K2-07',
    manufacturer: 'VoltSure Medical',
    currentStock: 4,
    reservedStock: 1,
    safetyStock: 2,
    notes: 'Driver board that controls UV lamp intensity for adhesive curing.',
    photoSrc: buildInventoryImage('Driver board', 'Photo reference', '#4F46E5', 'photo'),
    drawingSrc: buildInventoryImage('PCB layout', 'Board 120 x 80 mm', '#4F46E5', 'drawing'),
    icon: <ElectricalIcon sx={{ fontSize: 34 }} />,
  },
  {
    id: 'inv-12',
    sapNumber: 'SAP-441133',
    category: 'Consumable',
    name: 'Vision camera lens protector',
    machineFamily: 'Inspection station IV-22',
    binLocation: 'L4-01',
    manufacturer: 'OptiMed',
    currentStock: 15,
    reservedStock: 4,
    safetyStock: 6,
    notes: 'Transparent protective disk that shields the lens from aerosolized residues.',
    photoSrc: buildInventoryImage('Lens protector', 'Photo reference', '#9333EA', 'photo'),
    drawingSrc: buildInventoryImage('Lens protector', 'Dia 42 mm', '#9333EA', 'drawing'),
    icon: <GasketIcon sx={{ fontSize: 34 }} />,
  },
];

void legacyInventoryParts;

const inventoryCategoryMeta: Record<string, { accent: string; icon: React.ReactNode }> = {
  Bearing: { accent: '#2156C9', icon: <CouplingIcon sx={{ fontSize: 34 }} /> },
  Seal: { accent: '#0F766E', icon: <SealIcon sx={{ fontSize: 34 }} /> },
  Belt: { accent: '#D97706', icon: <PackageBoardIcon sx={{ fontSize: 34 }} /> },
  Filter: { accent: '#2563EB', icon: <FilterIcon sx={{ fontSize: 34 }} /> },
  Valve: { accent: '#0F766E', icon: <ValveIcon sx={{ fontSize: 34 }} /> },
  Sensor: { accent: '#7C3AED', icon: <SensorIcon sx={{ fontSize: 34 }} /> },
  Motor: { accent: '#DC2626', icon: <ElectricalIcon sx={{ fontSize: 34 }} /> },
  Coupling: { accent: '#475569', icon: <CouplingIcon sx={{ fontSize: 34 }} /> },
  Gasket: { accent: '#9333EA', icon: <GasketIcon sx={{ fontSize: 34 }} /> },
  Chain: { accent: '#1D4ED8', icon: <ChainIcon sx={{ fontSize: 34 }} /> },
  Connector: { accent: '#0891B2', icon: <ElectricalIcon sx={{ fontSize: 34 }} /> },
  Switch: { accent: '#B45309', icon: <ElectricalIcon sx={{ fontSize: 34 }} /> },
  Harness: { accent: '#4F46E5', icon: <ElectricalIcon sx={{ fontSize: 34 }} /> },
  Lubricant: { accent: '#16A34A', icon: <LubricantIcon sx={{ fontSize: 34 }} /> },
  Pump: { accent: '#EF4444', icon: <HoseIcon sx={{ fontSize: 34 }} /> },
  Fuse: { accent: '#EA580C', icon: <ElectricalIcon sx={{ fontSize: 34 }} /> },
  Hose: { accent: '#0284C7', icon: <HoseIcon sx={{ fontSize: 34 }} /> },
};

const inventoryEquipmentCatalog: Record<string, EquipmentSelection> = {
  'SA-204': {
    id: 'SA-204',
    name: 'Syringe Assembly Machine SA-204',
    type: 'equipment',
    path: 'Plant A > Unit B > Line 10 > Syringe Assembly Machine SA-204',
    tags: ['SA-204', 'syringe', 'assembly', 'critical'],
    barcode: 'BC-SA-204',
  },
  'SA-204-FILL': {
    id: 'SA-204-FILL',
    name: 'Filling System',
    type: 'subsystem',
    path: 'Plant A > Unit B > Line 10 > Syringe Assembly Machine SA-204 > Filling System',
    tags: ['filling', 'dosing', 'liquid path'],
    barcode: 'BC-SA-204-FILL',
  },
  'SA-204-FHA': {
    id: 'SA-204-FHA',
    name: 'Filling Head Assembly',
    type: 'component',
    path: 'Plant A > Unit B > Line 10 > Syringe Assembly Machine SA-204 > Filling System > Filling Head Assembly',
    tags: ['head', 'subassembly', 'filling'],
    barcode: 'BC-SA-204-FHA',
  },
  'SA-204-SERVO': {
    id: 'SA-204-SERVO',
    name: 'Servo Motor',
    type: 'component',
    path: 'Plant A > Unit B > Line 10 > Syringe Assembly Machine SA-204 > Filling System > Servo Motor',
    tags: ['motor', 'drive', 'servo'],
    barcode: 'BC-SA-204-SERVO',
  },
  'SA-204-NOZZLE': {
    id: 'SA-204-NOZZLE',
    name: 'Nozzle Cluster',
    type: 'component',
    path: 'Plant A > Unit B > Line 10 > Syringe Assembly Machine SA-204 > Filling System > Nozzle Cluster',
    tags: ['nozzle', 'cluster', 'filling'],
    barcode: 'BC-SA-204-NOZZLE',
  },
  'SA-204-BEARING': {
    id: 'SA-204-BEARING',
    name: 'Drive Bearing',
    type: 'component',
    path: 'Plant A > Unit B > Line 10 > Syringe Assembly Machine SA-204 > Filling System > Drive Bearing',
    tags: ['bearing', 'drive', 'rotating'],
    barcode: 'BC-SA-204-BEARING',
  },
  'SA-204-TRANSPORT': {
    id: 'SA-204-TRANSPORT',
    name: 'Transport System',
    type: 'subsystem',
    path: 'Plant A > Unit B > Line 10 > Syringe Assembly Machine SA-204 > Transport System',
    tags: ['transport', 'conveyor', 'indexing'],
    barcode: 'BC-SA-204-TRANSPORT',
  },
  'VI-210': {
    id: 'VI-210',
    name: 'Vision Inspection VI-210',
    type: 'equipment',
    path: 'Plant A > Unit B > Line 10 > Vision Inspection VI-210',
    tags: ['VI-210', 'camera', 'inspection', 'vision'],
    barcode: 'BC-VI-210',
  },
  'VI-210-CAMERA': {
    id: 'VI-210-CAMERA',
    name: 'Camera Array',
    type: 'subsystem',
    path: 'Plant A > Unit B > Line 10 > Vision Inspection VI-210 > Camera Array',
    tags: ['camera', 'inspection'],
    barcode: 'BC-VI-210-CAMERA',
  },
  'VI-210-LIGHT': {
    id: 'VI-210-LIGHT',
    name: 'Lighting Module',
    type: 'component',
    path: 'Plant A > Unit B > Line 10 > Vision Inspection VI-210 > Lighting Module',
    tags: ['lighting', 'illumination'],
    barcode: 'BC-VI-210-LIGHT',
  },
  'LM-88': {
    id: 'LM-88',
    name: 'Labeling Machine LM-88',
    type: 'equipment',
    path: 'Plant A > Unit B > Line 10 > Labeling Machine LM-88',
    tags: ['LM-88', 'labeler', 'labeling'],
    barcode: 'BC-LM-88',
  },
  'LM-88-APPLICATOR': {
    id: 'LM-88-APPLICATOR',
    name: 'Label Applicator',
    type: 'subsystem',
    path: 'Plant A > Unit B > Line 10 > Labeling Machine LM-88 > Label Applicator',
    tags: ['applicator', 'label'],
    barcode: 'BC-LM-88-APPLICATOR',
  },
  'CT-32': {
    id: 'CT-32',
    name: 'Cartoner CT-32',
    type: 'equipment',
    path: 'Plant A > Unit B > Line 20 > Cartoner CT-32',
    tags: ['CT-32', 'cartoner', 'carton'],
    barcode: 'BC-CT-32',
  },
  'CT-32-FEED': {
    id: 'CT-32-FEED',
    name: 'Carton Feed Magazine',
    type: 'subsystem',
    path: 'Plant A > Unit B > Line 20 > Cartoner CT-32 > Carton Feed Magazine',
    tags: ['feed', 'magazine'],
    barcode: 'BC-CT-32-FEED',
  },
  'CT-32-TUCKER': {
    id: 'CT-32-TUCKER',
    name: 'Flap Tuck Assembly',
    type: 'component',
    path: 'Plant A > Unit B > Line 20 > Cartoner CT-32 > Flap Tuck Assembly',
    tags: ['flap', 'tuck', 'subassembly'],
    barcode: 'BC-CT-32-TUCKER',
  },
  'RJ-11': {
    id: 'RJ-11',
    name: 'Reject Station RJ-11',
    type: 'equipment',
    path: 'Plant A > Unit B > Line 20 > Reject Station RJ-11',
    tags: ['RJ-11', 'reject', 'diverter'],
    barcode: 'BC-RJ-11',
  },
  'RJ-11-DIVERTER': {
    id: 'RJ-11-DIVERTER',
    name: 'Pneumatic Diverter',
    type: 'component',
    path: 'Plant A > Unit B > Line 20 > Reject Station RJ-11 > Pneumatic Diverter',
    tags: ['pneumatic', 'reject'],
    barcode: 'BC-RJ-11-DIVERTER',
  },
  'PC-09': {
    id: 'PC-09',
    name: 'Packaging Conveyor PC-09',
    type: 'equipment',
    path: 'Plant A > Unit B > Line 20 > Packaging Conveyor PC-09',
    tags: ['PC-09', 'packaging', 'conveyor'],
    barcode: 'BC-PC-09',
  },
  'PC-09-BELT': {
    id: 'PC-09-BELT',
    name: 'Belt Drive',
    type: 'subsystem',
    path: 'Plant A > Unit B > Line 20 > Packaging Conveyor PC-09 > Belt Drive',
    tags: ['belt', 'drive'],
    barcode: 'BC-PC-09-BELT',
  },
  'PC-09-SENSOR': {
    id: 'PC-09-SENSOR',
    name: 'Jam Detection Sensor',
    type: 'component',
    path: 'Plant A > Unit B > Line 20 > Packaging Conveyor PC-09 > Jam Detection Sensor',
    tags: ['sensor', 'jam', 'photoeye'],
    barcode: 'BC-PC-09-SENSOR',
  },
};

function getInventoryUsedIn(seed: InventorySeed, index: number): EquipmentSelection[] {
  const groups: Record<string, string[]> = {
    Bearing: ['SA-204-BEARING', 'SA-204-TRANSPORT', 'PC-09-BELT'],
    Seal: ['SA-204-FHA', 'SA-204-NOZZLE', 'SA-204-FILL'],
    Belt: ['PC-09-BELT', 'SA-204-TRANSPORT', 'CT-32-FEED'],
    Filter: ['SA-204-FILL', 'VI-210-CAMERA', 'CT-32'],
    Valve: ['SA-204-FILL', 'RJ-11-DIVERTER', 'SA-204-NOZZLE'],
    Sensor: ['VI-210-CAMERA', 'PC-09-SENSOR', 'RJ-11'],
    Motor: ['SA-204-SERVO', 'PC-09-BELT', 'CT-32'],
    Coupling: ['SA-204-SERVO', 'PC-09-BELT', 'CT-32-FEED'],
    Gasket: ['SA-204-FILL', 'SA-204-FHA', 'CT-32-TUCKER'],
    Chain: ['PC-09', 'CT-32-FEED', 'SA-204-TRANSPORT'],
    Connector: ['VI-210-CAMERA', 'VI-210-LIGHT', 'PC-09-SENSOR'],
    Switch: ['RJ-11-DIVERTER', 'CT-32-TUCKER', 'LM-88-APPLICATOR'],
    Harness: ['SA-204-SERVO', 'VI-210-CAMERA', 'LM-88'],
    Lubricant: ['SA-204-BEARING', 'PC-09-BELT', 'CT-32'],
    Pump: ['SA-204-FILL', 'SA-204-NOZZLE', 'SA-204'],
    Fuse: ['SA-204', 'VI-210', 'LM-88'],
    Hose: ['SA-204-FILL', 'SA-204-NOZZLE', 'CT-32'],
  };
  const ids = groups[seed.category] ?? ['SA-204'];
  const count = index % 4 === 0 ? 3 : 2;
  const selectedIds = Array.from({ length: count }, (_, offset) => ids[(index + offset) % ids.length]);

  return Array.from(new Set(selectedIds))
    .map((id) => inventoryEquipmentCatalog[id])
    .filter(Boolean);
}

const inventorySeeds: InventorySeed[] = [
  { category: 'Bearing', name: 'Pillow Block Bearing UCP207', code: 'SP-BRG-1001', machineFamily: 'Bucket elevator drive BE-110', binLocation: 'A1-01', manufacturer: 'SKF Industrial', unitPrice: 128, currentStock: 18, reservedStock: 4, safetyStock: 10, notes: 'Supports the main elevator drive shaft on aggregate handling conveyors.', spec: 'Bore 35 mm' },
  { category: 'Bearing', name: 'Spherical Roller Bearing 22212', code: 'SP-BRG-1002', machineFamily: 'Crusher feed screen FS-420', binLocation: 'A1-02', manufacturer: 'NSK Motion', unitPrice: 246, currentStock: 12, reservedStock: 3, safetyStock: 5, notes: 'Handles shock loading on vibrating screens and heavy rotating assemblies.', spec: 'OD 110 mm' },
  { category: 'Bearing', name: 'Flange Bearing UCFL205', code: 'SP-BRG-1003', machineFamily: 'Bagging conveyor BC-208', binLocation: 'A1-03', manufacturer: 'Timken Works', unitPrice: 92, currentStock: 24, reservedStock: 5, safetyStock: 12, notes: 'Used on transfer rollers in packaging and material take-away lines.', spec: '2-bolt flange' },
  { category: 'Seal', name: 'Hydraulic Rod Seal 45x60x9', code: 'SP-SEA-1001', machineFamily: 'Hydraulic press HP-300', binLocation: 'A2-01', manufacturer: 'Parker Sealing', unitPrice: 38, currentStock: 30, reservedStock: 6, safetyStock: 15, notes: 'Rod seal for press cylinders operating with mineral hydraulic oil.', spec: '45 x 60 x 9 mm' },
  { category: 'Seal', name: 'Mechanical Pump Seal 1.5 in', code: 'SP-SEA-1002', machineFamily: 'Coolant circulation skid CS-84', binLocation: 'A2-02', manufacturer: 'John Crane', unitPrice: 214, currentStock: 10, reservedStock: 3, safetyStock: 4, notes: 'Primary seal for the coolant pump on closed-loop machining systems.', spec: '1.5 in shaft' },
  { category: 'Seal', name: 'Rotary Shaft Seal 70x90x10', code: 'SP-SEA-1003', machineFamily: 'Granulator gearbox GR-160', binLocation: 'A2-03', manufacturer: 'Freudenberg', unitPrice: 46, currentStock: 22, reservedStock: 4, safetyStock: 11, notes: 'Prevents lubricant leakage on reducer output shafts.', spec: '70 x 90 x 10 mm' },
  { category: 'Belt', name: 'Timing Belt HTD 8M-640', code: 'SP-BEL-1001', machineFamily: 'Cartoner infeed CI-90', binLocation: 'A3-01', manufacturer: 'Gates Power', unitPrice: 118, currentStock: 16, reservedStock: 3, safetyStock: 9, notes: 'Synchronizes carton pitch between infeed lugs and transfer starwheel.', spec: '640 mm length' },
  { category: 'Belt', name: 'V-Belt SPA 1257', code: 'SP-BEL-1002', machineFamily: 'Dust collector fan DF-200', binLocation: 'A3-02', manufacturer: 'Continental Drive', unitPrice: 24, currentStock: 42, reservedStock: 7, safetyStock: 20, notes: 'Standard drive belt for radial fans and low-complexity auxiliaries.', spec: 'SPA section' },
  { category: 'Belt', name: 'Polyurethane Conveyor Belt 80x1800', code: 'SP-BEL-1003', machineFamily: 'Label transfer conveyor LT-55', binLocation: 'A3-03', manufacturer: 'Habasit Motion', unitPrice: 186, currentStock: 11, reservedStock: 2, safetyStock: 7, notes: 'Food-safe flat belt used on light industrial transfer conveyors.', spec: '80 x 1800 mm' },
  { category: 'Filter', name: 'Hydraulic Return Filter 10 Micron', code: 'SP-FIL-1001', machineFamily: 'Press hydraulic unit HU-220', binLocation: 'B1-01', manufacturer: 'Hydac Systems', unitPrice: 84, currentStock: 20, reservedStock: 5, safetyStock: 10, notes: 'Return-line filter element for hydraulic power packs on forming presses.', spec: '10 micron' },
  { category: 'Filter', name: 'Compressed Air Coalescing Filter', code: 'SP-FIL-1002', machineFamily: 'Air preparation skid APS-14', binLocation: 'B1-02', manufacturer: 'SMC Pneumatics', unitPrice: 64, currentStock: 18, reservedStock: 3, safetyStock: 9, notes: 'Removes oil mist and fine moisture from compressed air distribution.', spec: '1/2 in port' },
  { category: 'Filter', name: 'Dust Collector Cartridge MERV 15', code: 'SP-FIL-1003', machineFamily: 'Powder handling extractor PE-510', binLocation: 'B1-03', manufacturer: 'Donaldson Industrial', unitPrice: 312, currentStock: 8, reservedStock: 2, safetyStock: 4, notes: 'High-capacity cartridge for fine particulate extraction systems.', spec: 'MERV 15' },
  { category: 'Valve', name: 'Solenoid Valve 24VDC 5/2', code: 'SP-VAL-1001', machineFamily: 'Pneumatic pick-and-place PP-72', binLocation: 'B2-01', manufacturer: 'Festo Motion', unitPrice: 146, currentStock: 14, reservedStock: 4, safetyStock: 6, notes: 'Controls double-acting cylinders on material handling grippers.', spec: '24 VDC 5/2' },
  { category: 'Valve', name: 'Stainless Ball Valve 1 in', code: 'SP-VAL-1002', machineFamily: 'Process water manifold PWM-40', binLocation: 'B2-02', manufacturer: 'Swagelok', unitPrice: 168, currentStock: 12, reservedStock: 2, safetyStock: 5, notes: 'Isolation valve for washdown and utility water loops.', spec: '1 in NPT' },
  { category: 'Valve', name: 'Proportional Pressure Valve NG6', code: 'SP-VAL-1003', machineFamily: 'Servo hydraulic station SH-180', binLocation: 'B2-03', manufacturer: 'Bosch Rexroth', unitPrice: 1480, currentStock: 3, reservedStock: 1, safetyStock: 2, notes: 'High-value control valve for closed-loop hydraulic pressure regulation.', spec: 'NG6 manifold' },
  { category: 'Sensor', name: 'Inductive Proximity Sensor M12', code: 'SP-SEN-1001', machineFamily: 'Pallet transfer PT-66', binLocation: 'B3-01', manufacturer: 'Pepperl+Fuchs', unitPrice: 62, currentStock: 26, reservedStock: 5, safetyStock: 10, notes: 'Detects pallet presence at stopper and transfer positions.', spec: 'M12 flush' },
  { category: 'Sensor', name: 'Photoelectric Sensor Retroreflective', code: 'SP-SEN-1002', machineFamily: 'Case erector CE-140', binLocation: 'B3-02', manufacturer: 'SICK Controls', unitPrice: 188, currentStock: 13, reservedStock: 3, safetyStock: 5, notes: 'Verifies carton edge and product flow at infeed and discharge zones.', spec: '4 m range' },
  { category: 'Sensor', name: 'Vibration Sensor 4-20mA', code: 'SP-SEN-1003', machineFamily: 'Centrifugal blower CB-330', binLocation: 'B3-03', manufacturer: 'IFM Monitoring', unitPrice: 624, currentStock: 5, reservedStock: 1, safetyStock: 2, notes: 'Monitors bearing health on critical rotating equipment.', spec: '4-20 mA output' },
  { category: 'Motor', name: 'Gearmotor 0.75 kW 20:1', code: 'SP-MOT-1001', machineFamily: 'Accumulation conveyor AC-58', binLocation: 'C1-01', manufacturer: 'SEW-Eurodrive', unitPrice: 1320, currentStock: 4, reservedStock: 1, safetyStock: 2, notes: 'Compact gearmotor for conveyor accumulation sections and pack-off lanes.', spec: '0.75 kW 20:1' },
  { category: 'Motor', name: 'Servo Motor 2.0 kW Absolute', code: 'SP-MOT-1002', machineFamily: 'Pick module PM-210', binLocation: 'C1-02', manufacturer: 'Siemens Motion', unitPrice: 2860, currentStock: 2, reservedStock: 0, safetyStock: 1, notes: 'High-precision servo motor for synchronized indexing and robotic axis control.', spec: '2.0 kW absolute encoder' },
  { category: 'Motor', name: 'Cooling Fan Motor 0.18 kW', code: 'SP-MOT-1003', machineFamily: 'Electrical cabinet ventilation CV-12', binLocation: 'C1-03', manufacturer: 'WEG Industrial', unitPrice: 218, currentStock: 10, reservedStock: 2, safetyStock: 4, notes: 'Drives cabinet ventilation fans for motor starters and PLC panels.', spec: '0.18 kW TEFC' },
  { category: 'Coupling', name: 'Jaw Coupling 38 mm Bore', code: 'SP-CPL-1001', machineFamily: 'Slurry pump drive SP-75', binLocation: 'C2-01', manufacturer: 'Lovejoy Motion', unitPrice: 96, currentStock: 20, reservedStock: 4, safetyStock: 8, notes: 'Flexible coupling between motor and pump shafts on utility skids.', spec: '38 mm bore' },
  { category: 'Coupling', name: 'Grid Coupling 65 mm Bore', code: 'SP-CPL-1002', machineFamily: 'Granulator drive GD-250', binLocation: 'C2-02', manufacturer: 'Falk Drive', unitPrice: 448, currentStock: 7, reservedStock: 2, safetyStock: 3, notes: 'Absorbs shock loads on high-torque reduction drives.', spec: '65 mm bore' },
  { category: 'Coupling', name: 'Disc Coupling Spacer Assembly', code: 'SP-CPL-1003', machineFamily: 'High-speed blower HB-480', binLocation: 'C2-03', manufacturer: 'Rexnord Power', unitPrice: 1180, currentStock: 3, reservedStock: 1, safetyStock: 2, notes: 'Precision spacer coupling for alignment-sensitive high-speed drives.', spec: 'Spacer 180 mm' },
  { category: 'Gasket', name: 'Spiral Wound Gasket 3 in 150#', code: 'SP-GSK-1001', machineFamily: 'Steam line manifold SM-25', binLocation: 'C3-01', manufacturer: 'Flexitallic', unitPrice: 26, currentStock: 36, reservedStock: 8, safetyStock: 18, notes: 'Used on steam and condensate flanges during planned line interventions.', spec: '3 in Class 150' },
  { category: 'Gasket', name: 'Plate Heat Exchanger Gasket Set', code: 'SP-GSK-1002', machineFamily: 'Cooling skid HX-60', binLocation: 'C3-02', manufacturer: 'Alfa Laval', unitPrice: 342, currentStock: 9, reservedStock: 2, safetyStock: 4, notes: 'Set of molded gaskets for exchanger plate maintenance kits.', spec: '24-plate set' },
  { category: 'Gasket', name: 'Compressor Cover Gasket', code: 'SP-GSK-1003', machineFamily: 'Screw compressor SC-190', binLocation: 'C3-03', manufacturer: 'Atlas Copco Parts', unitPrice: 44, currentStock: 28, reservedStock: 5, safetyStock: 10, notes: 'Replacement gasket for compressor cover service intervals.', spec: 'Cover profile SC-190' },
  { category: 'Chain', name: 'Roller Chain ANSI 60 - 10 ft', code: 'SP-CHN-1001', machineFamily: 'Pallet elevator PE-90', binLocation: 'D1-01', manufacturer: 'Tsubaki', unitPrice: 132, currentStock: 17, reservedStock: 3, safetyStock: 7, notes: 'Drive chain for vertical pallet lifts and transfer elevators.', spec: 'ANSI 60' },
  { category: 'Chain', name: 'Leaf Chain BL634', code: 'SP-CHN-1002', machineFamily: 'Mast lift ML-40', binLocation: 'D1-02', manufacturer: 'Renold Industrial', unitPrice: 286, currentStock: 8, reservedStock: 2, safetyStock: 3, notes: 'Lift chain used on guided mast assemblies and tool changers.', spec: 'BL634' },
  { category: 'Chain', name: 'Tabletop Conveyor Chain 82.5 mm', code: 'SP-CHN-1003', machineFamily: 'Bottle transport BT-310', binLocation: 'D1-03', manufacturer: 'Regal Rexnord', unitPrice: 418, currentStock: 7, reservedStock: 1, safetyStock: 3, notes: 'Low-friction chain for side-flexing tabletop conveyors.', spec: '82.5 mm width' },
  { category: 'Connector', name: 'M12 4-Pin Straight Connector', code: 'SP-CON-1001', machineFamily: 'General sensor network GN-01', binLocation: 'D2-01', manufacturer: 'Turck Connectivity', unitPrice: 18, currentStock: 58, reservedStock: 10, safetyStock: 24, notes: 'Standard field connector used across photoelectric and inductive sensor circuits.', spec: 'M12 4-pin' },
  { category: 'Connector', name: 'Harting Heavy Duty Connector 16B', code: 'SP-CON-1002', machineFamily: 'Modular process skid MPS-22', binLocation: 'D2-02', manufacturer: 'Harting', unitPrice: 148, currentStock: 15, reservedStock: 4, safetyStock: 6, notes: 'Quick-disconnect power and signal connector for removable machine modules.', spec: '16B housing' },
  { category: 'Connector', name: 'Ethernet Industrial RJ45 Shielded', code: 'SP-CON-1003', machineFamily: 'Control network CN-17', binLocation: 'D2-03', manufacturer: 'Phoenix Contact', unitPrice: 22, currentStock: 44, reservedStock: 8, safetyStock: 18, notes: 'Shielded connector for industrial network cabling inside control cabinets.', spec: 'Cat6A shielded' },
  { category: 'Switch', name: 'Limit Switch Roller Lever', code: 'SP-SWI-1001', machineFamily: 'Pallet stacker PS-88', binLocation: 'D3-01', manufacturer: 'Omron Controls', unitPrice: 42, currentStock: 24, reservedStock: 5, safetyStock: 9, notes: 'End-of-travel switch for guided stops, gates, and diverter arms.', spec: 'Roller lever' },
  { category: 'Switch', name: 'Safety Interlock Switch RFID', code: 'SP-SWI-1002', machineFamily: 'Guarded cell GC-120', binLocation: 'D3-02', manufacturer: 'Schmersal', unitPrice: 268, currentStock: 9, reservedStock: 2, safetyStock: 4, notes: 'RFID-coded door switch for guarded stations and robotic enclosures.', spec: 'RFID coded' },
  { category: 'Switch', name: 'Pressure Switch 0-10 bar', code: 'SP-SWI-1003', machineFamily: 'Pneumatic header PH-33', binLocation: 'D3-03', manufacturer: 'Danfoss', unitPrice: 116, currentStock: 14, reservedStock: 3, safetyStock: 5, notes: 'Pressure verification switch for compressed air and service gas headers.', spec: '0-10 bar' },
  { category: 'Harness', name: 'Servo Feedback Harness 5 m', code: 'SP-HAR-1001', machineFamily: 'Servo axis SA-10', binLocation: 'E1-01', manufacturer: 'Lapp Industrial', unitPrice: 286, currentStock: 11, reservedStock: 2, safetyStock: 4, notes: 'Feedback cable assembly for servo motor encoder loops.', spec: '5 m shielded' },
  { category: 'Harness', name: 'Robot Dress Pack Harness', code: 'SP-HAR-1002', machineFamily: 'Robotic palletizer RP-260', binLocation: 'E1-02', manufacturer: 'ABB Robotics', unitPrice: 1380, currentStock: 3, reservedStock: 1, safetyStock: 2, notes: 'Integrated harness bundle for robot arm routing and end-effector services.', spec: '6-axis dress pack' },
  { category: 'Harness', name: 'Control Cabinet I/O Harness 24 pt', code: 'SP-HAR-1003', machineFamily: 'Panel assembly standard PAS-24', binLocation: 'E1-03', manufacturer: 'Murrelektronik', unitPrice: 154, currentStock: 16, reservedStock: 4, safetyStock: 6, notes: 'Pre-terminated cabinet harness for distributed I/O modules.', spec: '24 point I/O' },
  { category: 'Lubricant', name: 'EP2 Bearing Grease Cartridge', code: 'SP-LUB-1001', machineFamily: 'General rotating equipment', binLocation: 'E2-01', manufacturer: 'Mobil Industrial', unitPrice: 14, currentStock: 72, reservedStock: 12, safetyStock: 30, notes: 'Multi-purpose grease cartridge for pillow blocks, fans, and conveyor rollers.', spec: '400 g EP2' },
  { category: 'Lubricant', name: 'Synthetic Gear Oil ISO VG 220', code: 'SP-LUB-1002', machineFamily: 'Reducer fleet RF-01', binLocation: 'E2-02', manufacturer: 'Shell Omala', unitPrice: 168, currentStock: 14, reservedStock: 3, safetyStock: 6, notes: 'Synthetic oil for enclosed gears on heavily loaded speed reducers.', spec: '20 L pail' },
  { category: 'Lubricant', name: 'Compressor Oil ISO VG 46', code: 'SP-LUB-1003', machineFamily: 'Air compressor bank ACB-3', binLocation: 'E2-03', manufacturer: 'Atlas Copco Fluids', unitPrice: 124, currentStock: 12, reservedStock: 2, safetyStock: 5, notes: 'Rotary screw compressor oil for annual service kits.', spec: '20 L pail' },
  { category: 'Pump', name: 'Centrifugal Coolant Pump 3 HP', code: 'SP-PMP-1001', machineFamily: 'Machining center coolant MC-12', binLocation: 'E3-01', manufacturer: 'Grundfos', unitPrice: 1840, currentStock: 3, reservedStock: 1, safetyStock: 2, notes: 'Primary coolant recirculation pump for machining and washing systems.', spec: '3 HP 380 V' },
  { category: 'Pump', name: 'Diaphragm Pump 1 in AODD', code: 'SP-PMP-1002', machineFamily: 'Chemical dosing skid CDS-18', binLocation: 'E3-02', manufacturer: 'Graco Process', unitPrice: 1260, currentStock: 4, reservedStock: 1, safetyStock: 2, notes: 'Air-operated diaphragm pump for chemical transfer and washdown dosing.', spec: '1 in AODD' },
  { category: 'Pump', name: 'Lubrication Gear Pump 12 L/min', code: 'SP-PMP-1003', machineFamily: 'Central lube unit CL-44', binLocation: 'E3-03', manufacturer: 'Lincoln Lubrication', unitPrice: 768, currentStock: 5, reservedStock: 1, safetyStock: 2, notes: 'Gear pump supplying centralized lubrication manifolds.', spec: '12 L/min' },
  { category: 'Fuse', name: 'Class CC Fuse 2 A', code: 'SP-FUS-1001', machineFamily: 'PLC control circuits', binLocation: 'F1-01', manufacturer: 'Bussmann', unitPrice: 6, currentStock: 84, reservedStock: 12, safetyStock: 36, notes: 'Protection fuse for low-current PLC and instrumentation circuits.', spec: '2 A Class CC' },
  { category: 'Fuse', name: 'Semiconductor Fuse 40 A', code: 'SP-FUS-1002', machineFamily: 'Servo drive cabinet SDC-8', binLocation: 'F1-02', manufacturer: 'Mersen', unitPrice: 54, currentStock: 18, reservedStock: 3, safetyStock: 7, notes: 'Fast-acting fuse protecting sensitive power electronics and servo drives.', spec: '40 A ultra-fast' },
  { category: 'Fuse', name: 'NH Fuse Link 125 A', code: 'SP-FUS-1003', machineFamily: 'Main switchboard MSB-02', binLocation: 'F1-03', manufacturer: 'Siemens Protection', unitPrice: 38, currentStock: 22, reservedStock: 4, safetyStock: 8, notes: 'High-current protection device for motor feeders and plant subpanels.', spec: '125 A NH00' },
  { category: 'Hose', name: 'Hydraulic Hose SAE 100R2 1/2 in', code: 'SP-HOS-1001', machineFamily: 'Hydraulic power units', binLocation: 'F2-01', manufacturer: 'Parker Hose', unitPrice: 72, currentStock: 24, reservedStock: 5, safetyStock: 9, notes: 'Pre-crimped hydraulic hose assembly for medium-pressure service circuits.', spec: '1/2 in x 1.5 m' },
  { category: 'Hose', name: 'Chemical Transfer Hose EPDM 1 in', code: 'SP-HOS-1002', machineFamily: 'CIP and chemical transfer lines', binLocation: 'F2-02', manufacturer: 'Continental Hose', unitPrice: 148, currentStock: 12, reservedStock: 2, safetyStock: 5, notes: 'EPDM hose used for chemical dosing and wash solutions.', spec: '1 in x 3 m' },
  { category: 'Hose', name: 'Coolant Hose Kit Modular Nozzle', code: 'SP-HOS-1003', machineFamily: 'Machining coolant stations', binLocation: 'F2-03', manufacturer: 'Loc-Line', unitPrice: 28, currentStock: 34, reservedStock: 6, safetyStock: 14, notes: 'Segmented nozzle hose kit for machine coolant aiming and adjustments.', spec: '3/4 in modular kit' },
];

function getSparePartImage(name: string, category: string): string {
  const images = [
    "Butterfly Valve.jpg",
    "Centrifugal Coolant Pump.jpg",
    "Compressor Oil ISO.jpg",
    "Contactor AC 40A.jpg",
    "Control Cabinet.jpg",
    "Cooling Fan Motor.jpg",
    "Copper Gasket.jpg",
    "Diaphragm Pump.jpg",
    "EP2 Grease Cartridge.jpg",
    "Ethernet Industrial RJ45 Shielded.jpg",
    "FUSE-10A-CC.jpg",
    "Flange Bearing.jpg",
    "Flex Hose.jpg",
    "Flexible Coupling.jpg",
    "Gear Pump.jpg",
    "Gearmotor.jpg",
    "Harting Heavy Duty.jpg",
    "Hydraulic Return Filter 10 Micron.jpg",
    "Hydraulic Rod Seal.jpg",
    "Limit Switch Roller Lever.jpg",
    "M12 4-Pin Straight Connector.jpg",
    "Mechanical Pump Seal.jpg",
    "Photoelectric Sensor Retroreflective.jpg",
    "Polyurethane Conveyor.jpg",
    "Pressure Switch 0-10 bar.jpg",
    "Proportional Pressure Valve.jpg",
    "Robot Dress Pack Harness.jpg",
    "Roller Chain.jpg",
    "Rotary Shaft Seal.jpg",
    "SENS-PROX-M12.jpg",
    "Safety Interlock Switch RFID.jpg",
    "Servo Feedback Harness.jpg",
    "Servo Motor 750W .jpg",
    "Stainless Ball Valve.jpg",
    "Synthetic Gear Oil ISO.png",
    "Timing Belt.jpg",
    "V-Belt SPA.jpg",
    "Valve sol.jpg",
    "Vibration Sensor.jpg",
    "bearing.jpg",
    "belt.jpg",
    "filter.jpg",
    "seal.jpg"
  ];

  const lowerName = name.toLowerCase();
  const lowerCategory = category.toLowerCase();

  // Try exact/contains matches on specific image filenames (excluding generic ones: bearing, belt, filter, seal)
  const specificImages = images.filter(img => !["bearing.jpg", "belt.jpg", "filter.jpg", "seal.jpg"].includes(img));

  // 1. Check for specific matches first
  for (const img of specificImages) {
    const baseName = img.replace(/\.[^/.]+$/, "").trim().toLowerCase(); // e.g. "butterfly valve"

    // Check if the part name contains the base filename
    if (lowerName.includes(baseName)) {
      return `/images/spear_parts/${img}`;
    }
  }

  // 2. Extra custom matching rules for specific images that don't match by simple substring
  if (lowerName.includes("solenoid valve")) {
    return "/images/spear_parts/Valve sol.jpg";
  }
  if (lowerName.includes("proximity sensor") || lowerName.includes("prox-m12")) {
    return "/images/spear_parts/SENS-PROX-M12.jpg";
  }
  if (lowerName.includes("grease")) {
    return "/images/spear_parts/EP2 Grease Cartridge.jpg";
  }
  if (lowerName.includes("servo motor")) {
    return "/images/spear_parts/Servo Motor 750W .jpg";
  }
  if (lowerName.includes("fuse")) {
    return "/images/spear_parts/FUSE-10A-CC.jpg";
  }
  if (lowerName.includes("hose")) {
    return "/images/spear_parts/Flex Hose.jpg";
  }
  if (lowerName.includes("coupling")) {
    return "/images/spear_parts/Flexible Coupling.jpg";
  }
  if (lowerName.includes("chain")) {
    return "/images/spear_parts/Roller Chain.jpg";
  }
  if (lowerName.includes("gasket")) {
    return "/images/spear_parts/Copper Gasket.jpg";
  }

  // 3. Check for generic category-based fallbacks
  if (lowerCategory === "bearing" || lowerName.includes("bearing")) {
    return "/images/spear_parts/bearing.jpg";
  }
  if (lowerCategory === "belt" || lowerName.includes("belt")) {
    return "/images/spear_parts/belt.jpg";
  }
  if (lowerCategory === "filter" || lowerName.includes("filter")) {
    return "/images/spear_parts/filter.jpg";
  }
  if (lowerCategory === "seal" || lowerName.includes("seal")) {
    return "/images/spear_parts/seal.jpg";
  }

  // No image found, leave empty
  return "";
}

export const inventoryParts: InventoryPart[] = inventorySeeds.map((seed, index) => {
  const meta = inventoryCategoryMeta[seed.category];
  const usedIn = getInventoryUsedIn(seed, index);

  return {
    id: `inv-${String(index + 1).padStart(2, '0')}`,
    sapNumber: seed.code,
    category: seed.category,
    condition: seed.category === 'Pump' ? 'Refurbished' : 'New',
    name: seed.name,
    machineFamily: usedIn[0]?.name ?? seed.machineFamily,
    usedIn,
    binLocation: seed.binLocation,
    manufacturer: seed.manufacturer,
    unitPrice: seed.unitPrice,
    currentStock: seed.currentStock,
    reservedStock: seed.reservedStock,
    safetyStock: seed.safetyStock,
    notes: seed.notes,
    photoSrc: getSparePartImage(seed.name, seed.category),
    drawingSrc: buildInventoryImage(seed.code, seed.spec, meta.accent, 'drawing', seed.category),
    suppliers: buildPartSuppliers(seed, index),
    siteAvailability: buildSiteAvailability(seed, index),
    icon: meta.icon,
  };
});

function normalizeSparePartsInventoryCode(value: string) {
  return value.trim().toLowerCase().replace(/^sp-/, '').replace(/[^a-z0-9]/g, '');
}

export function findSparePartsInventoryPartByCode(value?: string | null): SparePartsInventoryPart | null {
  if (!value) return null;

  const normalizedValue = normalizeSparePartsInventoryCode(value);
  return inventoryParts.find((part) => (
    normalizeSparePartsInventoryCode(part.sapNumber) === normalizedValue ||
    normalizeSparePartsInventoryCode(part.id) === normalizedValue
  )) ?? null;
}

export type PurchaseOrderItem = {
  partNumber: string;
  partName: string;
  quantity: number;
  receivedQuantity: number;
};

export type PurchaseOrderStatus = 'Pending' | 'Completed';

export type PurchaseOrder = {
  id: string;
  status: PurchaseOrderStatus;
  vendor: string;
  expectedDate?: string;
  receivedDate?: string;
  receivedBy?: string;
  items: PurchaseOrderItem[];
};

const initialPurchaseOrders: PurchaseOrder[] = [
  {
    id: 'PO-2024-0892',
    status: 'Pending',
    vendor: 'Parker Hannifin',
    expectedDate: 'Dec 17, 2024',
    items: [
      { partNumber: 'SP-SEA-1001', partName: 'Hydraulic Rod Seal 45x60x9', quantity: 10, receivedQuantity: 0 },
      { partNumber: 'SP-HOS-1001', partName: 'Hydraulic Hose SAE 100R2 1/2 in', quantity: 5, receivedQuantity: 0 },
    ],
  },
  {
    id: 'PO-2024-0885',
    status: 'Pending',
    vendor: 'SKF Bearings',
    expectedDate: 'Dec 18, 2024',
    items: [
      { partNumber: 'SP-BRG-1001', partName: 'Pillow Block Bearing UCP207', quantity: 4, receivedQuantity: 0 },
      { partNumber: 'SP-BRG-1002', partName: 'Spherical Roller Bearing 22212', quantity: 2, receivedQuantity: 0 },
    ],
  },
  {
    id: 'PO-2024-0901',
    status: 'Pending',
    vendor: 'Festo Motion',
    expectedDate: 'Dec 20, 2024',
    items: [
      { partNumber: 'SP-VAL-1001', partName: 'Solenoid Valve 24VDC 5/2', quantity: 6, receivedQuantity: 0 },
    ],
  },
  {
    id: 'PO-2024-0878',
    status: 'Completed',
    vendor: 'Gates Corporation',
    receivedDate: 'Dec 15, 2024 21:00',
    receivedBy: 'John Smith',
    items: [
      { partNumber: 'BELT-V-A68', partName: 'V-Belt A68', quantity: 15, receivedQuantity: 15 },
    ],
  },
];

export type HistoryType = 'Pick-up' | 'Receipt' | 'Return';

export type HistoryRecord = {
  id: string;
  date: string;
  type: HistoryType;
  itemText: string;
  quantityChange: number;
  reference: string;
  operator: string;
  reason: string;
};

export type PartModelCost = {
  id: string;
  name: string;
  unitCost: number;
  consumed: number;
};

type ConsumptionAnalyticsPart = PartModelCost & {
  stock: number;
  usedIn: EquipmentSelection[];
};

const initialHistoryRecords: HistoryRecord[] = [
  { id: 'hist-1', date: '2024-12-17', type: 'Pick-up', itemText: '2 parts', quantityChange: -3, reference: 'WO-2024-8156', operator: 'Mike Johnson', reason: 'Scheduled PM' },
  { id: 'hist-2', date: '2024-12-17', type: 'Receipt', itemText: '3 parts', quantityChange: 38, reference: 'PO-2024-0889', operator: 'David Lee', reason: 'Vendor delivery' },
  { id: 'hist-3', date: '2024-12-16', type: 'Pick-up', itemText: '1 part', quantityChange: -1, reference: 'WO-2024-0142', operator: 'Sarah Chen', reason: 'Breakdown repair' },
  { id: 'hist-4', date: '2024-12-16', type: 'Return', itemText: '1 part', quantityChange: 1, reference: 'WO-2024-8158', operator: 'Carlos Rodriguez', reason: 'Unused — wrong size' },
  { id: 'hist-5', date: '2024-12-15', type: 'Pick-up', itemText: '2 parts', quantityChange: -5, reference: 'WO-2024-0130', operator: 'Carlos Rodriguez', reason: 'Preventive replacement' },
  { id: 'hist-6', date: '2024-12-15', type: 'Receipt', itemText: '2 parts', quantityChange: 21, reference: 'PO-2024-0885', operator: 'David Lee', reason: 'Restock order' },
  { id: 'hist-7', date: '2024-12-14', type: 'Pick-up', itemText: '1 part', quantityChange: -3, reference: 'WO-2024-8155', operator: 'Mike Johnson', reason: 'Lubrication PM' },
  { id: 'hist-8', date: '2024-12-13', type: 'Pick-up', itemText: '1 part', quantityChange: -2, reference: 'WO-2024-0125', operator: 'Sarah Chen', reason: 'Calibration PM' },
  { id: 'hist-9', date: '2024-12-12', type: 'Receipt', itemText: '5 parts', quantityChange: 50, reference: 'PO-2024-0870', operator: 'David Lee', reason: 'Bulk restock' },
  { id: 'hist-10', date: '2024-12-11', type: 'Return', itemText: '2 parts', quantityChange: 2, reference: 'WO-2024-8110', operator: 'Mike Johnson', reason: 'Excess parts return' },
];

const initialPartModelCosts: PartModelCost[] = [
  { id: 'BRG-6205-2RS', name: 'BRG-6205-2RS - Ball Bearing 6205-2RS', unitCost: 45.0, consumed: 11 },
  { id: 'SEAL-HYD-25', name: 'SEAL-HYD-25 - Hydraulic Seal 25mm', unitCost: 18.5, consumed: 4 },
  { id: 'BELT-V-A68', name: 'BELT-V-A68 - V-Belt A68', unitCost: 25.0, consumed: 3 },
  { id: 'FLT-HYD-10', name: 'FLT-HYD-10 - Hydraulic Oil Filter', unitCost: 62.0, consumed: 2 },
  { id: 'VALVE-SOL-24V', name: 'VALVE-SOL-24V - Solenoid Valve 24VDC', unitCost: 146.0, consumed: 1 },
];

const consumptionPartCategoryById: Record<string, InventoryPart['category']> = {
  'BRG-6205-2RS': 'Bearing',
  'SEAL-HYD-25': 'Seal',
  'BELT-V-A68': 'Belt',
  'FLT-HYD-10': 'Filter',
  'VALVE-SOL-24V': 'Valve',
};

const inventoryConsumptionLevelOrder: InventoryConsumptionLevel[] = ['high', 'dead-stock', 'normal'];

const inventoryConsumptionLevelBase: Record<InventoryConsumptionLevel, Omit<InventoryConsumptionBreakdown, 'skus' | 'units' | 'value'>> = {
  high: {
    label: 'High',
    helper: 'Recent consumption above long-term average',
    tone: tokenWarning.dark,
    bg: tokenWarning.softBg,
    border: tokenWarning.light,
  },
  'dead-stock': {
    label: 'Low / Dead stock',
    helper: 'No consumption in the last 12 months',
    tone: tokenText.secondary,
    bg: tokenNeutral.lighter,
    border: tokenDivider,
  },
  normal: {
    label: 'Normal',
    helper: 'Consumption within baseline',
    tone: tokenBrand.main,
    bg: tokenBrand.softBg,
    border: tokenDivider,
  },
};

function createEmptyInventoryConsumptionBreakdown(): Record<InventoryConsumptionLevel, InventoryConsumptionBreakdown> {
  return inventoryConsumptionLevelOrder.reduce<Record<InventoryConsumptionLevel, InventoryConsumptionBreakdown>>((breakdown, level) => {
    breakdown[level] = {
      ...inventoryConsumptionLevelBase[level],
      skus: 0,
      units: 0,
      value: 0,
    };
    return breakdown;
  }, {} as Record<InventoryConsumptionLevel, InventoryConsumptionBreakdown>);
}

function getHistoryRecordDate(record: HistoryRecord) {
  const parsedDate = new Date(`${record.date}T00:00:00`);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}

const stateStyles: Record<StockState, { tone: string; border: string; bg: string; accent: string; label: string }> = {
  'in-stock': { tone: tokenSuccess.dark, border: tokenSuccess.light, bg: tokenSuccess.softBg, accent: tokenSuccess.main, label: 'In Stock' },
  'low-stock': { tone: tokenWarning.dark, border: tokenWarning.light, bg: tokenWarning.softBg, accent: tokenWarning.main, label: 'Low Stock' },
  'out-of-stock': { tone: tokenError.dark, border: tokenError.light, bg: tokenError.softBg, accent: tokenError.main, label: 'Out of Stock' },
};

const inventoryPanelBorder = tokenDivider;
const inventorySoftBorder = tokenDivider;
const inventoryPanelBackground = 'background.paper';
const inventorySectionChipSx = {
  height: 23,
  borderRadius: 999,
  bgcolor: tokenBrand.softBg,
  color: tokenBrand.main,
  border: `1px solid ${tokenDivider}`,
  fontWeight: 900,
} as const;

const workOrderTypeStyles: Record<WorkOrderMaintenanceType, { label: string; tone: string; bg: string; border: string; accent: string }> = {
  preventive: { label: 'Preventive', tone: tokenBrand.main, bg: tokenBrand.softBg, border: tokenDivider, accent: tokenBrand.light },
  corrective: { label: 'Corrective', tone: tokenWarning.dark, bg: tokenWarning.softBg, border: tokenDivider, accent: tokenWarning.main },
  breakdown: { label: 'Breakdown', tone: tokenError.main, bg: tokenError.softBg, border: tokenDivider, accent: tokenError.light },
};

const workOrderStateStyles: Record<WorkOrderStatus, { tone: string; bg: string; border: string }> = {
  planning: { tone: tokenBrand.main, bg: tokenBrand.softBg, border: tokenDivider },
  scheduled: { tone: tokenBrand.main, bg: tokenBrand.softBg, border: tokenDivider },
  'in progress': { tone: tokenSuccess.dark, bg: tokenSuccess.softBg, border: tokenDivider },
  done: { tone: tokenText.secondary, bg: tokenNeutral.lighter, border: tokenDivider },
};

const workOrderStatuses: WorkOrderStatus[] = ['planning', 'scheduled', 'in progress', 'done'];
const workOrderMaintenanceTypes: WorkOrderMaintenanceType[] = ['corrective', 'preventive', 'breakdown'];
const workOrderPackageFilters: Array<{ value: WorkOrderPackageFilter; label: string }> = [
  { value: 'all', label: 'All packages' },
  { value: 'required', label: 'Parts required' },
  { value: 'reserved', label: 'Parts reserved' },
  { value: 'ready-for-pick-up', label: 'Ready for pick-up' },
  { value: 'partial-pick-up', label: 'Partial pick-up' },
  { value: 'pick-up-completed', label: 'Pick-up completed' },
  { value: 'missing-parts', label: 'Missing parts' },
];
const workOrderBoardColumns: Array<{ key: WorkOrderPackageStage; title: string; helper: string }> = [
  {
    key: 'upcoming',
    title: 'Upcoming Work Orders',
    helper: 'Upcoming demand to review before parts are reserved',
  },
  {
    key: 'reserved',
    title: 'Parts Reserved',
    helper: 'Stock confirmed, not yet ready for pick-up',
  },
  {
    key: 'ready-for-pick-up',
    title: 'Ready for Pick-Up',
    helper: 'Separated or kitted parts waiting for collection',
  },
  {
    key: 'partial-pick-up',
    title: 'Partial Pick-Up',
    helper: 'Some required parts have already been picked up',
  },
  {
    key: 'pick-up-completed',
    title: 'Pick-Up Completed',
    helper: 'All listed parts have been picked up',
  },
];
const initialWorkOrderLaneExpanded: WorkOrderLaneExpandedState = {
  upcoming: true,
  reserved: true,
  'ready-for-pick-up': true,
  'partial-pick-up': true,
  'pick-up-completed': true,
};
const sparePartsFocusedExecutionSections: Partial<Record<ExecutionDrawerSectionKey, boolean>> = {
  assignment: false,
  spareParts: true,
  safety: false,
  quality: false,
  linkedWorkOrders: false,
  attachments: false,
  tasklist: false,
  logHistory: false,
};
const workOrderToday = new Date(2026, 5, 2);
const unscheduledSortValue = Number.MAX_SAFE_INTEGER;

function formatPartCount(quantity: number) {
  return `${quantity} ${quantity === 1 ? 'part' : 'parts'}`;
}

function getWorkOrderPackageStatus(workOrder: Pick<WorkOrderCardData, 'spareParts' | 'status'>): WorkOrderPackageStatus {
  const totalUnits = workOrder.spareParts.reduce((sum, part) => sum + part.requestedQuantity, 0);
  const pickedUnits = workOrder.spareParts
    .filter((part) => part.delivered)
    .reduce((sum, part) => sum + part.requestedQuantity, 0);
  const reservedUnits = workOrder.spareParts
    .filter((part) => part.reserved && !part.delivered)
    .reduce((sum, part) => sum + part.requestedQuantity, 0);

  if (totalUnits === 0) {
    return {
      kind: 'no-parts-requested',
      label: 'No parts requested',
      totalUnits,
      pickedUnits,
      tone: tokenText.secondary,
      bg: tokenNeutral.lightest,
      border: tokenDivider,
    };
  }

  if (workOrder.spareParts.some((part) => !part.reserved && !part.delivered)) {
    return {
      kind: 'required',
      label: `${formatPartCount(totalUnits)} required`,
      totalUnits,
      pickedUnits,
      tone: tokenWarning.darker,
      bg: tokenWarning.softBg,
      border: tokenWarning.light,
    };
  }

  if (pickedUnits > 0 && pickedUnits < totalUnits) {
    return {
      kind: 'partial-picked-up',
      label: `${pickedUnits} of ${formatPartCount(totalUnits)} picked-up`,
      totalUnits,
      pickedUnits,
      tone: tokenBrand.main,
      bg: tokenBrand.softBg,
      border: tokenBrand.light,
    };
  }

  if (pickedUnits === totalUnits) {
    return {
      kind: 'picked-up',
      label: `${formatPartCount(totalUnits)} picked-up`,
      totalUnits,
      pickedUnits,
      tone: tokenSuccess.darker,
      bg: tokenSuccess.softBg,
      border: tokenSuccess.light,
    };
  }

  if (reservedUnits === totalUnits && (workOrder.status === 'scheduled' || workOrder.status === 'in progress')) {
    return {
      kind: 'awaiting-pick-up',
      label: `${formatPartCount(totalUnits)} awaiting pick-up`,
      totalUnits,
      pickedUnits,
      tone: tokenInfo.main,
      bg: tokenInfo.softBg,
      border: tokenInfo.light,
    };
  }

  return {
    kind: 'reserved',
    label: `${formatPartCount(totalUnits)} reserved`,
    totalUnits,
    pickedUnits,
    tone: tokenBrand.main,
    bg: tokenBrand.softBg,
    border: tokenBrand.light,
  };
}

function getWorkOrderPackageStage(workOrder: WorkOrderCardData): WorkOrderPackageStage {
  const packageStatus = getWorkOrderPackageStatus(workOrder);

  if (packageStatus.kind === 'picked-up') return 'pick-up-completed';
  if (packageStatus.kind === 'partial-picked-up') return 'partial-pick-up';
  if (packageStatus.kind === 'awaiting-pick-up') return 'ready-for-pick-up';
  if (packageStatus.kind === 'reserved') return 'reserved';
  return 'upcoming';
}

function buildWorkOrderStockSnapshots(
  workOrder: WorkOrderCardData,
  inventoryRows: Array<InventoryPart & { availableStock: number }>
): Record<string, WorkOrderPartStockSnapshot> {
  const inventoryByCatalogPartId = new Map(
    inventoryRows.map((part) => [`sp-${part.id}`, part])
  );

  return workOrder.spareParts.reduce<Record<string, WorkOrderPartStockSnapshot>>((snapshots, part) => {
    const inventoryPart = inventoryByCatalogPartId.get(part.id);
    const selectedReservedQuantity = workOrder.spareParts
      .filter((selectedPart) => selectedPart.id === part.id && selectedPart.reserved && !selectedPart.delivered)
      .reduce((sum, selectedPart) => sum + selectedPart.requestedQuantity, 0);
    const totalQuantity = inventoryPart?.currentStock ?? part.availableQuantity;
    const totalReservedQuantity = inventoryPart?.reservedStock ?? 0;
    const otherReservedQuantity = Math.max(totalReservedQuantity - selectedReservedQuantity, 0);
    const availableQuantity = Math.max(totalQuantity - otherReservedQuantity, 0);

    snapshots[part.id] = {
      requiredQuantity: part.requestedQuantity,
      availableQuantity,
      totalQuantity,
      otherReservedQuantity,
      hasShortage: part.requestedQuantity > availableQuantity,
    };

    return snapshots;
  }, {});
}

function getWorkOrderMissingPartsSummary(stockSnapshots: Record<string, WorkOrderPartStockSnapshot>) {
  const snapshots = Object.values(stockSnapshots);
  const requiredUnits = snapshots.reduce((sum, snapshot) => sum + snapshot.requiredQuantity, 0);
  const availableUnits = snapshots.reduce((sum, snapshot) => sum + Math.min(snapshot.requiredQuantity, snapshot.availableQuantity), 0);
  const missingUnits = snapshots.reduce((sum, snapshot) => sum + Math.max(snapshot.requiredQuantity - snapshot.availableQuantity, 0), 0);

  return {
    hasMissingParts: missingUnits > 0,
    label: `${availableUnits} of ${formatPartCount(requiredUnits)} available`,
    missingUnits,
  };
}

const shiftOrder: Record<WorkOrderShift, number> = {
  Morning: 0,
  Afternoon: 1,
  Night: 2,
};

const monthLookup: Record<string, number> = {
  Jan: 0,
  Feb: 1,
  Mar: 2,
  Apr: 3,
  May: 4,
  Jun: 5,
  Jul: 6,
  Aug: 7,
  Sep: 8,
  Oct: 9,
  Nov: 10,
  Dec: 11,
};

const sparePartCatalog: SparePartCatalogItem[] = inventoryParts.map((part) => ({
  id: `sp-${part.id}`,
  code: part.sapNumber,
  description: part.name,
  location: part.binLocation,
  availableQuantity: Math.max(getAvailableStock(part), 1),
  defaultRequestedQuantity: part.unitPrice <= 30 ? 2 : 1,
}));

function buildMissingPartReservation(partCode: string, requestedQuantity: number): WorkOrderSparePart | null {
  const part = sparePartCatalog.find((catalogPart) => catalogPart.code === partCode);
  if (!part) return null;

  return {
    ...part,
    delivered: false,
    reserved: true,
    requestedQuantity,
  };
}

function getWorkOrderMaintenanceType(card: MaintenanceCard): WorkOrderMaintenanceType {
  if (card.priority === 'Emergency') return 'breakdown';
  if (card.priority === 'Medium') return 'preventive';
  return 'corrective';
}

function parseDueDate(due: string) {
  const match = due.match(/^([A-Za-z]{3})\s+(\d{1,2}),\s+(\d{1,2}):(\d{2})(AM|PM)$/);

  if (!match) {
    return {
      scheduledDate: 'Jan 13, 2026',
      scheduledTime: '08:00',
      shift: 'Morning' as WorkOrderShift,
      scheduledSort: new Date(2026, 0, 13, 8, 0).getTime(),
    };
  }

  const [, monthLabel, dayRaw, hourRaw, minuteRaw, meridiem] = match;
  const day = Number(dayRaw);
  const minute = Number(minuteRaw);
  const originalHour = Number(hourRaw);
  let hour = originalHour;

  if (hour <= 12) {
    if (meridiem === 'AM') {
      hour = hour === 12 ? 0 : hour;
    } else {
      hour = hour === 12 ? 12 : hour + 12;
    }
  }

  const shift: WorkOrderShift = hour < 12 ? 'Morning' : hour < 18 ? 'Afternoon' : 'Night';

  return {
    scheduledDate: `${monthLabel} ${day}, 2026`,
    scheduledTime: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
    shift,
    scheduledSort: new Date(2026, monthLookup[monthLabel] ?? 0, day, hour, minute).getTime(),
  };
}

function addDays(date: Date, days: number) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

function formatWorkOrderScheduleDate(date: Date) {
  const month = date.toLocaleString('en-US', { month: 'short' });
  return `${month} ${date.getDate()}, ${date.getFullYear()}`;
}

function buildWorkOrderSchedule(
  status: WorkOrderStatus,
  maintenanceType: WorkOrderMaintenanceType,
  dueMeta: ReturnType<typeof parseDueDate>,
  index: number
) {
  if (maintenanceType === 'breakdown') {
    return {
      shift: null,
      scheduledDate: 'ASAP',
      scheduledTime: '',
      scheduledSort: -1,
    };
  }

  if (status === 'planning') {
    return {
      shift: null,
      scheduledDate: '',
      scheduledTime: '',
      scheduledSort: unscheduledSortValue,
    };
  }

  const hour = Number(dueMeta.scheduledTime.slice(0, 2)) || 8;
  const minute = Number(dueMeta.scheduledTime.slice(3, 5)) || 0;
  const scheduledDate =
    status === 'in progress'
      ? workOrderToday
      : status === 'done'
        ? addDays(workOrderToday, -1 - ((index * 2) % 12))
        : addDays(workOrderToday, 1 + ((index * 2) % 16));

  return {
    shift: dueMeta.shift,
    scheduledDate: formatWorkOrderScheduleDate(scheduledDate),
    scheduledTime: dueMeta.scheduledTime,
    scheduledSort: new Date(scheduledDate.getFullYear(), scheduledDate.getMonth(), scheduledDate.getDate(), hour, minute).getTime(),
  };
}

function buildSparePartSelection(index: number, requestedQuantity: number): WorkOrderSparePart {
  const part = sparePartCatalog[index % sparePartCatalog.length];

  return {
    ...part,
    delivered: false,
    reserved: true,
    requestedQuantity: Math.min(requestedQuantity, part.availableQuantity),
  };
}

function buildSparePartSelections(startIndex: number, requestedQuantities: number[]): WorkOrderSparePart[] {
  return requestedQuantities.map((requestedQuantity, partIndex) =>
    buildSparePartSelection(startIndex + partIndex * 3, requestedQuantity)
  );
}

function buildInitialSpareParts(type: WorkOrderMaintenanceType, index: number): WorkOrderSparePart[] {
  if (type === 'breakdown') return [];

  if (type === 'corrective') {
    return index % 2 === 0 ? [buildSparePartSelection(index + 2, 1)] : [];
  }

  const totalParts = 3 + (index % 3);

  return Array.from({ length: totalParts }, (_, partIndex) => buildSparePartSelection(index + partIndex * 3, 1 + (partIndex % 3)));
}

function applyDeliveredPattern(
  parts: WorkOrderSparePart[],
  pattern: 'pending' | 'partial' | 'complete' | 'empty' | 'unreserved'
): WorkOrderSparePart[] {
  if (pattern === 'empty') return [];
  if (pattern === 'unreserved') return parts.map((part) => ({ ...part, delivered: false, reserved: false }));
  if (pattern === 'pending') return parts.map((part) => ({ ...part, delivered: false, reserved: true }));
  if (pattern === 'complete') return parts.map((part) => ({ ...part, delivered: true, reserved: false }));

  return parts.map((part, index) => ({
    ...part,
    delivered: index === 0,
    reserved: index !== 0,
  }));
}

function buildWorkOrders(): WorkOrderCardData[] {
  const sources: Array<{ status: WorkOrderStatus; cards: MaintenanceCard[] }> = [
    { status: 'planning', cards: maintenanceLaneData.autonomous },
    { status: 'planning', cards: maintenanceLaneData.team.scheduling },
    { status: 'scheduled', cards: maintenanceLaneData.team.scheduled },
    { status: 'in progress', cards: maintenanceLaneData.team.progress },
  ];
  const extraSources: Array<{
    status: WorkOrderStatus;
    card: MaintenanceCard;
    deliveredPattern: 'pending' | 'partial' | 'complete' | 'empty' | 'unreserved';
    sparePartQuantities?: number[];
  }> = [
      {
        status: 'planning',
        deliveredPattern: 'unreserved',
        sparePartQuantities: [2, 1, 4, 3],
        card: {
          id: 'extra-00a',
          title: 'Preventive service on packaging line conveyor',
          detail: 'Stage the belt, bearings, connectors, and grease for the planned conveyor PM before the weekend stop.',
          assignee: 'Marina Alves',
          due: 'Jan 13, 10:30 AM',
          priority: 'Medium',
        },
      },
      {
        status: 'scheduled',
        deliveredPattern: 'unreserved',
        sparePartQuantities: [1, 6, 2, 3, 1],
        card: {
          id: 'extra-00b',
          title: 'Preventive overhaul for case erector sensors',
          detail: 'Prepare sensor, connector, filter, fuse, and hose items for the scheduled case erector PM.',
          assignee: 'Paulo Mendes',
          due: 'Jan 14, 01:20 PM',
          priority: 'Medium',
        },
      },
      {
        status: 'planning',
        deliveredPattern: 'unreserved',
        sparePartQuantities: [3, 2, 1, 5],
        card: {
          id: 'extra-00c',
          title: 'Preventive lubrication skid service kit',
          detail: 'List the seals, filters, gaskets, and lubricant consumables needed for the lubrication skid inspection.',
          assignee: 'Sofia Nunes',
          due: 'Jan 16, 08:45 AM',
          priority: 'Medium',
        },
      },
      {
        status: 'planning',
        deliveredPattern: 'pending',
        card: {
          id: 'extra-01',
          title: 'Capper torque station clutch inspection',
          detail: 'Prepare replacement clutch inserts and confirm setup tooling before the torque verification window.',
          assignee: 'Mateus Rocha',
          due: 'Jan 14, 09:30 AM',
          priority: 'High',
        },
      },
      {
        status: 'scheduled',
        deliveredPattern: 'pending',
        card: {
          id: 'extra-02',
          title: 'Cartoner infeed guide changeover kit',
          detail: 'Separate the guide kit and replace worn rails before the next parts changeover.',
          assignee: 'Ana Pereira',
          due: 'Jan 15, 02:15 PM',
          priority: 'Medium',
        },
      },
      {
        status: 'in progress',
        deliveredPattern: 'partial',
        card: {
          id: 'extra-03',
          title: 'Vision reject lane air leak correction',
          detail: 'One valve kit has already been withdrawn, but the remaining fittings and seals are still pending.',
          assignee: 'Bruno Lima',
          due: 'Jan 13, 07:45 PM',
          priority: 'High',
        },
      },
      {
        status: 'scheduled',
        deliveredPattern: 'partial',
        card: {
          id: 'extra-04',
          title: 'Wrapper film dancer sensor bracket alignment',
          detail: 'Mechanical bracket is on hand, but the sensor spacer set still needs to be withdrawn from stock.',
          assignee: 'Juliana Costa',
          due: 'Jan 16, 10:00 AM',
          priority: 'Low',
        },
      },
      {
        status: 'done',
        deliveredPattern: 'complete',
        card: {
          id: 'extra-05',
          title: 'Filling pump coupling replacement',
          detail: 'All spare parts have been separated and are ready for the planned intervention on the dosing skid.',
          assignee: 'Rafael Gomes',
          due: 'Jan 17, 11:30 AM',
          priority: 'Emergency',
        },
      },
      {
        status: 'done',
        deliveredPattern: 'complete',
        card: {
          id: 'extra-06',
          title: 'Autoclave transfer chain overhaul',
          detail: 'Chain links, tensioner kit, and locking hardware have already been fully withdrawn for the overhaul.',
          assignee: 'Camila Santos',
          due: 'Jan 18, 04:10 PM',
          priority: 'High',
        },
      },
    ];

  let sequence = 1;

  const baseWorkOrders = sources.flatMap(({ status, cards }) =>
    cards.map((card, index) => {
      const maintenanceType = getWorkOrderMaintenanceType(card);
      const dueMeta = parseDueDate(card.due);
      const currentSequence = sequence++;
      const schedule = buildWorkOrderSchedule(status, maintenanceType, dueMeta, currentSequence);

      return {
        id: `WO-6060347${String(currentSequence).padStart(2, '0')}`,
        equipment: card.title,
        detail: card.detail,
        assignee: card.assignee,
        maintenanceType,
        status,
        shift: schedule.shift,
        scheduledDate: schedule.scheduledDate,
        scheduledTime: schedule.scheduledTime,
        scheduledSort: schedule.scheduledSort,
        priorityLabel: card.priority,
        spareParts: buildInitialSpareParts(maintenanceType, currentSequence),
      };
    })
  );

  const extraWorkOrders = extraSources.map(({ status, card, deliveredPattern, sparePartQuantities }, index) => {
    const maintenanceType = getWorkOrderMaintenanceType(card);
    const dueMeta = parseDueDate(card.due);
    const currentSequence = sequence++;
    const schedule = buildWorkOrderSchedule(status, maintenanceType, dueMeta, currentSequence + index);
    const baseParts = sparePartQuantities
      ? buildSparePartSelections(currentSequence + index + 3, sparePartQuantities)
      : buildInitialSpareParts(maintenanceType, currentSequence + index + 3);

    return {
      id: `WO-6060347${String(currentSequence).padStart(2, '0')}`,
      equipment: card.title,
      detail: card.detail,
      assignee: card.assignee,
      maintenanceType,
      status,
      shift: schedule.shift,
      scheduledDate: schedule.scheduledDate,
      scheduledTime: schedule.scheduledTime,
      scheduledSort: schedule.scheduledSort,
      priorityLabel: card.priority,
      spareParts: applyDeliveredPattern(baseParts, deliveredPattern),
    };
  });

  const missingPartExamples = [
    { workOrderIndex: 3, partCode: 'SAP-440918', requestedQuantity: 3 },
    { workOrderIndex: 5, partCode: 'SP-MOT-1002', requestedQuantity: 4 },
    { workOrderIndex: 6, partCode: 'SP-CPL-1003', requestedQuantity: 5 },
  ];

  const extraWorkOrdersWithMissingParts = extraWorkOrders.map((workOrder, workOrderIndex) => {
    const missingPart = missingPartExamples.find((example) => example.workOrderIndex === workOrderIndex);
    const reservedPart = missingPart
      ? buildMissingPartReservation(missingPart.partCode, missingPart.requestedQuantity)
      : null;

    return reservedPart
      ? {
        ...workOrder,
        spareParts: [...workOrder.spareParts, reservedPart],
      }
      : workOrder;
  });

  return [...baseWorkOrders, ...extraWorkOrdersWithMissingParts];
}

function compareWorkOrders(a: WorkOrderCardData, b: WorkOrderCardData) {
  const groupA = a.maintenanceType === 'breakdown' ? 0 : a.status === 'planning' ? 2 : 1;
  const groupB = b.maintenanceType === 'breakdown' ? 0 : b.status === 'planning' ? 2 : 1;

  if (groupA !== groupB) return groupA - groupB;
  if (a.scheduledSort !== b.scheduledSort) return a.scheduledSort - b.scheduledSort;
  if (a.shift && b.shift && a.shift !== b.shift) return shiftOrder[a.shift] - shiftOrder[b.shift];
  return a.id.localeCompare(b.id);
}

function compareUpcomingWorkOrders(a: WorkOrderCardData, b: WorkOrderCardData) {
  const groupA = a.maintenanceType === 'breakdown' || a.priorityLabel === 'Emergency'
    ? 0
    : a.maintenanceType === 'preventive' && a.status === 'planning'
      ? 1
      : 2;
  const groupB = b.maintenanceType === 'breakdown' || b.priorityLabel === 'Emergency'
    ? 0
    : b.maintenanceType === 'preventive' && b.status === 'planning'
      ? 1
      : 2;

  if (groupA !== groupB) return groupA - groupB;
  return compareWorkOrders(a, b);
}

function getWorkOrderDateShiftLabel(workOrder: WorkOrderCardData) {
  if (workOrder.status === 'planning') return '';
  if (workOrder.maintenanceType === 'breakdown') return 'ASAP';
  return [workOrder.scheduledDate, workOrder.shift].filter(Boolean).join(' / ');
}

function buildFollowUpAssignmentDay(workOrder: WorkOrderCardData): NonNullable<WorkOrderDraft['scheduledExecutionDay']> | undefined {
  if (!workOrder.scheduledDate || workOrder.scheduledDate === 'ASAP') return undefined;

  const parsedDate = new Date(workOrder.scheduledDate);
  if (Number.isNaN(parsedDate.getTime())) return undefined;

  const dayKeys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;
  const weekdayShort = parsedDate.toLocaleDateString('en-US', { weekday: 'short' });
  const monthShort = parsedDate.toLocaleDateString('en-US', { month: 'short' });
  const dayNumber = String(parsedDate.getDate()).padStart(2, '0');
  const isoDate = [
    parsedDate.getFullYear(),
    String(parsedDate.getMonth() + 1).padStart(2, '0'),
    dayNumber,
  ].join('-');

  return {
    key: dayKeys[parsedDate.getDay()],
    shortLabel: `${weekdayShort} ${dayNumber}`,
    dayNumber,
    fullLabel: `${weekdayShort}, ${monthShort} ${dayNumber}, ${parsedDate.getFullYear()}`,
    ctaLabel: `${weekdayShort} ${dayNumber}`,
    isoDate,
  };
}

function buildFollowUpAssignee(workOrder: WorkOrderCardData): NonNullable<WorkOrderDraft['responsibleAssignee']> | undefined {
  if (!workOrder.assignee || workOrder.assignee === 'Unassigned') return undefined;

  const dayKeys = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
  const weeklyWorkload = dayKeys.reduce<NonNullable<WorkOrderDraft['responsibleAssignee']>['weeklyWorkload']>((workload, dayKey) => ({
    ...workload,
    [dayKey]: {
      level: 'Medium',
      summary: `${workOrder.assignee} has capacity for this scheduled work.`,
      workOrders: [{ id: workOrder.id, type: workOrderTypeStyles[workOrder.maintenanceType].label }],
    },
  }), {} as NonNullable<WorkOrderDraft['responsibleAssignee']>['weeklyWorkload']);

  return {
    id: workOrder.assignee.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    name: workOrder.assignee,
    role: 'Technician',
    context: workOrder.equipment,
    workload: 'Scheduled WO',
    weeklyLoad: 'Medium',
    priorityMix: workOrder.priorityLabel,
    shift: workOrder.shift ?? undefined,
    recommended: false,
    weeklyWorkload,
  };
}

function buildFollowUpWorkOrderDraft(workOrder: WorkOrderCardData): WorkOrderDraft {
  const maintenanceType = workOrderTypeStyles[workOrder.maintenanceType].label;
  const packageStage = getWorkOrderPackageStage(workOrder);
  const scheduledExecutionDay = buildFollowUpAssignmentDay(workOrder);
  const responsibleAssignee = buildFollowUpAssignee(workOrder);
  const selectedSpareParts: NonNullable<WorkOrderDraft['selectedSpareParts']> = workOrder.spareParts.map((part) => ({
    id: part.id,
    code: part.code,
    description: part.description,
    location: part.location,
    availableQuantity: part.availableQuantity,
    defaultRequestedQuantity: part.defaultRequestedQuantity,
    requestedQuantity: part.requestedQuantity,
    sparePartActionStatus: part.delivered ? 'picked' : part.reserved ? 'reserved' : 'requested',
  }));

  return {
    sourceCardId: `spare-parts-${workOrder.id}`,
    sourceRequestId: workOrder.id,
    drawerTitle: 'Work Order',
    statusLabel: workOrder.status === 'planning' ? 'Planning' : workOrder.status,
    drawerMode: workOrder.status === 'planning' ? 'planning' : 'scheduledExecution',
    isMaintenanceTypeLocked: true,
    maintenanceType,
    equipment: workOrder.equipment,
    problemDescription: workOrder.detail,
    activityType: 'Mechanical',
    downtime: workOrder.priorityLabel === 'Emergency' || workOrder.priorityLabel === 'Immediate' ? 'High' : 'Medium',
    quality: 'Medium',
    ehs: 'Low',
    priority: workOrder.priorityLabel,
    responsibleName: workOrder.assignee,
    responsibleAssignee,
    scheduledExecutionDay,
    selectedSpareParts,
    isReadyForPickUp: packageStage === 'ready-for-pick-up',
    linkedWorkOrders: [],
    safetyRequirementPlan: {
      equipmentCondition: '',
      lotoRequired: false,
      lockoutPoint: '',
      procedure: '',
      selectedRequirementIds: [],
      safetyNotes: '',
    },
    qualityRequirementPlan: {
      qualityImpacting: false,
      selectedRequirementIds: [],
      qualityNotes: '',
    },
  };
}

function WorkOrderInfoField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <Box
      sx={{
        minHeight: 72,
        p: 1.2,
        borderRadius: '8px',
        border: `1px solid ${tokenDivider}`,
        bgcolor: 'background.default',
      }}
    >
      <Typography variant="caption" sx={{ color: tokenText.secondary, fontWeight: 500, textTransform: 'uppercase', display: 'block', mb: 0.45 }}>
        {label}
      </Typography>
      <Typography sx={{ color: tokenText.primary, fontWeight: 700, lineHeight: 1.3 }}>
        {value}
      </Typography>
    </Box>
  );
}

function MissingPartRequestDrawer({
  request,
  open,
  onClose,
  onSaveResolution,
  onMarkResolved,
}: {
  request: MissingPartRequestAlert | null;
  open: boolean;
  onClose: () => void;
  onSaveResolution: (requestId: string, resolution: string, notes: string) => void;
  onMarkResolved: (requestId: string) => void;
}) {
  const [resolution, setResolution] = React.useState('Create purchase request');
  const [notes, setNotes] = React.useState('');

  React.useEffect(() => {
    if (open) {
      setResolution(request?.suggestedAction.includes('Reallocate') ? 'Reallocate from another reserved WO' : 'Create purchase request');
      setNotes('');
    }
  }, [open, request?.suggestedAction]);

  if (!request) return null;

  const summaryItems = [
    ['Part name', request.description],
    ['Material code', request.code],
    ['Requested quantity', `${request.requestedQuantity} units`],
    ['Available quantity', `${request.availableQuantity} units`],
    ['Missing quantity', `${request.shortageQuantity} units`],
    ['WO number', request.workOrderId],
    ['WO scope / equipment', `${request.equipment} - ${request.scope}`],
    ['WO priority', request.priorityLabel],
    ['Required by', request.requiredBy || 'Not scheduled'],
    ['Requested by', request.requestedBy],
  ];
  const availabilityItems = [
    ['On-hand stock', `${request.onHandQuantity} units`],
    ['Reserved stock', `${request.otherReservedQuantity + Math.max(request.requestedQuantity - request.shortageQuantity, 0)} units`],
    ['Reserved in other WOs', request.otherReservedQuantity ? `${request.otherReservedQuantity} units${request.reservedSourceWorkOrderId ? ` - ${request.reservedSourceWorkOrderId}` : ''}` : 'None'],
    ['Incoming PO / expected delivery', request.incomingPo ? `${request.incomingPo.id} - ${request.incomingPo.quantity} units from ${request.incomingPo.vendor}${request.incomingPo.expectedDate ? ` by ${request.incomingPo.expectedDate}` : ''}` : 'No matching open PO'],
    ['Alternative bins or locations', request.alternativeBins.length ? request.alternativeBins.join(', ') : 'No alternate local bin found'],
    ['Other sites availability', request.otherSites.length ? request.otherSites.map((site) => `${site.name}: ${site.quantity}`).join(', ') : 'No site stock mocked'],
  ];
  const resolutionOptions = [
    'Create purchase request',
    'Reallocate from another reserved WO',
    'Request from another site',
    'Wait for incoming PO',
    'Mark as resolved / now available',
    'Cancel request',
  ];

  return (
    <StandardDrawer
      open={open}
      onClose={onClose}
      title="Missing Part Request"
      subtitle={request.description}
      headerVariant="light"
      width={520}
      footer={
        <>
          <Button variant="outlined" onClick={onClose} sx={{ borderRadius: '8px', fontWeight: 700 }}>
            Cancel
          </Button>
          <Button
            variant="outlined"
            startIcon={<CheckCircleIcon sx={{ fontSize: 17 }} />}
            onClick={() => onMarkResolved(request.id)}
            sx={{
              borderRadius: '8px',
              color: tokenBrand.main,
              borderColor: tokenDivider,
              fontWeight: 700,
              '&:hover': { borderColor: tokenBrand.light, bgcolor: tokenBrand.softBg },
            }}
          >
            Mark as resolved
          </Button>
          <Button
            variant="contained"
            onClick={() => onSaveResolution(request.id, resolution, notes)}
            sx={{
              borderRadius: '8px',
              boxShadow: 'none',
              fontWeight: 700,
              '&:hover': { boxShadow: 'none' },
            }}
          >
            Save resolution
          </Button>
        </>
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.4 }}>
        <Paper elevation={0} sx={{ p: 1.5, borderRadius: '8px', border: `1px solid ${tokenDivider}`, bgcolor: 'background.paper' }}>
          <Typography sx={{ color: tokenText.primary, fontWeight: 700, mb: 1 }}>
            Request Summary
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 0.8 }}>
            {summaryItems.map(([label, value]) => (
              <Box key={label} sx={{ minWidth: 0 }}>
                <Typography variant="caption" sx={{ color: tokenText.secondary, fontWeight: 500, textTransform: 'uppercase' }}>
                  {label}
                </Typography>
                <Typography sx={{ color: label === 'Missing quantity' ? tokenError.main : tokenText.primary, fontSize: 13.5, fontWeight: 700, lineHeight: 1.25, overflowWrap: 'anywhere' }}>
                  {value}
                </Typography>
              </Box>
            ))}
          </Box>
        </Paper>

        <Paper elevation={0} sx={{ p: 1.5, borderRadius: '8px', border: `1px solid ${tokenDivider}`, bgcolor: 'background.paper' }}>
          <Typography sx={{ color: tokenText.primary, fontWeight: 700, mb: 1 }}>
            Availability Check
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
            {availabilityItems.map(([label, value]) => (
              <Box key={label} sx={{ display: 'grid', gridTemplateColumns: '150px minmax(0, 1fr)', gap: 1 }}>
                <Typography sx={{ color: tokenText.secondary, fontSize: 12.5, fontWeight: 500 }}>
                  {label}
                </Typography>
                <Typography sx={{ color: tokenText.primary, fontSize: 13, fontWeight: 700, lineHeight: 1.25 }}>
                  {value}
                </Typography>
              </Box>
            ))}
          </Box>
        </Paper>

        <Paper elevation={0} sx={{ p: 1.5, borderRadius: '8px', border: `1px solid ${tokenDivider}`, bgcolor: 'background.paper' }}>
          <Typography sx={{ color: tokenText.primary, fontWeight: 700, mb: 0.8 }}>
            Resolution Options
          </Typography>
          <RadioGroup value={resolution} onChange={(event) => setResolution(event.target.value)}>
            {resolutionOptions.map((option) => (
              <FormControlLabel
                key={option}
                value={option}
                control={<Radio size="small" sx={{ color: tokenText.secondary, '&.Mui-checked': { color: tokenBrand.main } }} />}
                label={<Typography sx={{ color: tokenText.primary, fontSize: 13.5, fontWeight: 500 }}>{option}</Typography>}
                sx={{ my: -0.2 }}
              />
            ))}
          </RadioGroup>
        </Paper>

        <Paper elevation={0} sx={{ p: 1.5, borderRadius: '8px', border: `1px solid ${tokenDivider}`, bgcolor: 'background.paper' }}>
          <Typography sx={{ color: tokenText.primary, fontWeight: 700, mb: 0.9 }}>
            Notes
          </Typography>
          <TextField
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Add supplier, transfer, PO, or reservation notes"
            multiline
            minRows={3}
            fullWidth
            size="small"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', bgcolor: 'background.default' } }}
          />
        </Paper>
      </Box>
    </StandardDrawer>
  );
}

function WorkOrderSparePartsEditor({
  selectedParts,
  onSelectedPartsChange,
  catalog = sparePartCatalog,
  stockSnapshots = {},
  selectedPickupPartIds = [],
  pickupSelectionEnabled = false,
  pickupSelectionDisabled = false,
  onPickupSelectionToggle,
}: {
  selectedParts: WorkOrderSparePart[];
  onSelectedPartsChange: (parts: WorkOrderSparePart[]) => void;
  catalog?: SparePartCatalogItem[];
  stockSnapshots?: Record<string, WorkOrderPartStockSnapshot>;
  selectedPickupPartIds?: string[];
  pickupSelectionEnabled?: boolean;
  pickupSelectionDisabled?: boolean;
  onPickupSelectionToggle?: (partId: string) => void;
}) {
  const [search, setSearch] = React.useState('');
  const [isPickerOpen, setIsPickerOpen] = React.useState(false);
  const normalizedSearch = search.trim().toLowerCase();
  const selectedIds = new Set(selectedParts.map((part) => part.id));
  const filteredCatalog = catalog.filter((part) => {
    const matchesSearch = normalizedSearch
      ? `${part.code} ${part.description} ${part.location}`.toLowerCase().includes(normalizedSearch)
      : true;

    return matchesSearch;
  });

  const addPart = (part: SparePartCatalogItem) => {
    if (selectedIds.has(part.id)) return;

    onSelectedPartsChange([
      ...selectedParts,
      {
        ...part,
        delivered: false,
        reserved: false,
        requestedQuantity: Math.max(1, part.defaultRequestedQuantity),
      },
    ]);
    setSearch('');
    setIsPickerOpen(false);
  };

  const removePart = (partId: string) => {
    onSelectedPartsChange(selectedParts.filter((part) => part.id !== partId));
  };

  const changeRequestedQuantity = (partId: string, direction: 1 | -1) => {
    onSelectedPartsChange(
      selectedParts.map((part) =>
        part.id === partId
          ? {
            ...part,
            requestedQuantity: Math.max(1, part.requestedQuantity + direction),
          }
          : part
      )
    );
  };

  const renderPartRow = (
    part: SparePartCatalogItem | WorkOrderSparePart
  ) => {
    const editableQuantity = 'requestedQuantity' in part;
    const requestedQuantity = editableQuantity ? part.requestedQuantity : 0;
    const isDelivered = editableQuantity ? part.delivered : false;
    const isReserved = editableQuantity ? part.reserved : false;
    const canSelectForPickup = editableQuantity && pickupSelectionEnabled && isReserved && !isDelivered;
    const stockSnapshot = editableQuantity ? stockSnapshots[part.id] : null;
    const hasShortage = Boolean(editableQuantity && isReserved && !isDelivered && stockSnapshot?.hasShortage);

    return (
      <Paper
        key={part.id}
        elevation={0}
        sx={{
          p: 0.85,
          borderRadius: '8px',
          border: `1px solid ${hasShortage ? tokenError.light : editableQuantity && isDelivered ? tokenDivider : tokenDivider}`,
          bgcolor: hasShortage ? tokenError.softBg : editableQuantity && isDelivered ? tokenBrand.softBg : 'background.paper',
          display: 'grid',
          gridTemplateColumns: editableQuantity
            ? `${pickupSelectionEnabled ? '32px ' : ''}120px minmax(0, 1fr) 96px 86px auto`
            : '120px minmax(0, 1fr) auto',
          gap: 0.7,
          alignItems: 'center',
        }}
      >
        {editableQuantity && pickupSelectionEnabled ? (
          canSelectForPickup ? (
            <Tooltip title={pickupSelectionDisabled ? 'Save changes before selecting parts for pick-up' : 'Select for pick-up'}>
              <span>
                <Checkbox
                  size="small"
                  checked={selectedPickupPartIds.includes(part.id)}
                  onChange={() => onPickupSelectionToggle?.(part.id)}
                  disabled={pickupSelectionDisabled}
                  sx={{ p: 0.2, color: tokenText.secondary, '&.Mui-checked': { color: tokenBrand.main } }}
                />
              </span>
            </Tooltip>
          ) : (
            <Box sx={{ width: 24, height: 24 }} />
          )
        ) : null}

        <Box
          sx={{
            px: 1,
            py: 0.75,
            borderRadius: '8px',
            border: `1px solid ${hasShortage ? tokenError.light : tokenDivider}`,
            bgcolor: hasShortage ? tokenError.softBg : 'background.paper',
            minWidth: 0,
          }}
        >
          <Typography sx={{ color: tokenText.primary, fontSize: 12.8, fontWeight: 700, lineHeight: 1.2 }} noWrap>
            {part.code}
          </Typography>
          {editableQuantity ? (
            <Typography variant="caption" sx={{ color: isDelivered ? tokenBrand.main : isReserved ? tokenBrand.main : tokenText.secondary, fontSize: 10.5, fontWeight: 700, lineHeight: 1.2 }} noWrap>
              {isDelivered ? 'Picked up' : isReserved ? 'Reserved' : 'Not reserved'}
            </Typography>
          ) : null}
        </Box>

        <Box
          sx={{
            px: 1,
            py: 0.75,
            borderRadius: '8px',
            border: `1px solid ${hasShortage ? tokenError.light : tokenDivider}`,
            bgcolor: hasShortage ? tokenError.softBg : 'background.paper',
            minWidth: 0,
          }}
        >
          <Typography sx={{ color: tokenText.primary, fontSize: 12.8, fontWeight: 700, lineHeight: 1.2 }} noWrap>
            {part.description}
          </Typography>
          {hasShortage ? (
            <Typography variant="caption" sx={{ color: tokenError.main, fontSize: 10.8, fontWeight: 500, lineHeight: 1.15, display: 'block' }}>
              Reserved quantity is higher than available stock after other WO reservations.
            </Typography>
          ) : null}
        </Box>

        {editableQuantity ? (
          <Box
            sx={{
              px: 0.8,
              py: 0.68,
              borderRadius: '8px',
              border: `1px solid ${hasShortage ? tokenError.light : tokenDivider}`,
              bgcolor: hasShortage ? 'background.paper' : 'background.default',
              textAlign: 'center',
            }}
          >
            <Typography variant="caption" sx={{ color: tokenText.secondary, fontSize: 10.2, fontWeight: 500, textTransform: 'uppercase', lineHeight: 1, display: 'block' }}>
              Req/Avail/Total
            </Typography>
            <Typography sx={{ color: hasShortage ? tokenError.main : tokenText.primary, fontSize: 13, fontWeight: 700, lineHeight: 1.25 }}>
              {requestedQuantity}/{stockSnapshot?.availableQuantity ?? part.availableQuantity}/{stockSnapshot?.totalQuantity ?? part.availableQuantity}
            </Typography>
          </Box>
        ) : null}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
          {editableQuantity ? (
            <>
              <Box
                sx={{
                  minWidth: 70,
                  px: 0.75,
                  py: 0.72,
                  borderRadius: '8px',
                  border: `1px solid ${tokenDivider}`,
                  bgcolor: 'background.paper',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 0.2,
                }}
              >
                <Tooltip title="Decrease quantity">
                  <span>
                    <IconButton
                      size="small"
                      onClick={() => changeRequestedQuantity(part.id, -1)}
                      disabled={requestedQuantity <= 1}
                      sx={{ color: tokenBrand.main, p: 0.15, '&.Mui-disabled': { color: tokenText.disabled } }}
                    >
                      <RemoveIcon sx={{ fontSize: 15 }} />
                    </IconButton>
                  </span>
                </Tooltip>
                <Typography sx={{ color: tokenText.primary, fontSize: 13, fontWeight: 700, minWidth: 12, textAlign: 'center' }}>
                  {requestedQuantity}
                </Typography>
                <Tooltip title="Increase quantity">
                  <span>
                    <IconButton
                      size="small"
                      onClick={() => changeRequestedQuantity(part.id, 1)}
                      sx={{ color: tokenBrand.main, p: 0.15, '&.Mui-disabled': { color: tokenText.disabled } }}
                    >
                      <AddIcon sx={{ fontSize: 15 }} />
                    </IconButton>
                  </span>
                </Tooltip>
              </Box>
              <Tooltip title="Remove part">
                <IconButton size="small" onClick={() => removePart(part.id)} sx={{ color: tokenText.secondary, p: 0.25 }}>
                  <CloseIcon sx={{ fontSize: 17 }} />
                </IconButton>
              </Tooltip>
            </>
          ) : (
            <Tooltip title={selectedIds.has(part.id) ? 'Already added' : 'Add part'}>
              <span>
                <IconButton
                  size="small"
                  onClick={() => addPart(part)}
                  disabled={selectedIds.has(part.id)}
                  sx={{ color: tokenBrand.main, p: 0.2, '&.Mui-disabled': { color: tokenText.disabled } }}
                >
                  <AddIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </span>
            </Tooltip>
          )}
        </Box>
      </Paper>
    );
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
          <Typography sx={{ color: tokenText.primary, fontSize: 13, fontWeight: 700 }}>
            Package Contents
          </Typography>
          <Button
            id="btn-add-part"
            variant="outlined"
            startIcon={<AddIcon sx={{ fontSize: 18 }} />}
            onClick={() => setIsPickerOpen((current) => !current)}
            sx={{
              minWidth: 0,
              borderRadius: '8px',
              color: tokenBrand.main,
              borderColor: tokenDivider,
              bgcolor: 'background.paper',
              fontWeight: 700,
              textTransform: 'none',
              '&:hover': { borderColor: tokenBrand.light, bgcolor: tokenBrand.softBg },
            }}
          >
            Add part
          </Button>
        </Box>

        {isPickerOpen ? (
          <Paper
            elevation={0}
            sx={{
              p: 1,
              borderRadius: '8px',
              border: `1px solid ${tokenDivider}`,
              bgcolor: 'background.paper',
            }}
          >
            <TextField
              id="input-catalog-search"
              size="small"
              label="Search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              autoFocus
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <SearchIcon sx={{ fontSize: 18, color: tokenText.secondary }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  bgcolor: 'background.default',
                },
              }}
            />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.6, maxHeight: 240, overflowY: 'auto' }}>
              {filteredCatalog.length ? (
                filteredCatalog.map((part) => renderPartRow(part))
              ) : (
                <Paper elevation={0} sx={{ p: 1.5, borderRadius: '8px', border: `1px dashed ${tokenDivider}`, bgcolor: 'background.paper' }}>
                  <Typography sx={{ color: tokenText.secondary, fontWeight: 500 }}>
                    No spare parts found.
                  </Typography>
                </Paper>
              )}
            </Box>
          </Paper>
        ) : null}

        {selectedParts.length ? (
          selectedParts.map((part) => renderPartRow(part))
        ) : (
          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              borderRadius: '8px',
              border: `1px dashed ${tokenDivider}`,
              bgcolor: 'background.paper',
            }}
          >
            <Typography sx={{ color: tokenText.secondary, fontWeight: 500 }}>
              No spare parts listed yet for this work order.
            </Typography>
          </Paper>
        )}
      </Box>
    </Box>
  );
}

function WorkOrderDrawer({
  workOrder,
  catalog,
  stockSnapshots,
  open,
  onClose,
  onSaveSpareParts,
  onReserveParts,
  onPickupSelected,
  onRequestMissingParts,
}: {
  workOrder: WorkOrderCardData | null;
  catalog: SparePartCatalogItem[];
  stockSnapshots: Record<string, WorkOrderPartStockSnapshot>;
  open: boolean;
  onClose: () => void;
  onSaveSpareParts: (parts: WorkOrderSparePart[]) => void;
  onReserveParts: () => void;
  onPickupSelected: (partIds: string[]) => void;
  onRequestMissingParts: () => void;
}) {
  const [draftParts, setDraftParts] = React.useState<WorkOrderSparePart[]>([]);
  const [selectedPickupPartIds, setSelectedPickupPartIds] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (open && workOrder) {
      setDraftParts(workOrder.spareParts);
      setSelectedPickupPartIds([]);
    }
  }, [open, workOrder]);

  if (!workOrder) return null;

  const typeStyle = workOrderTypeStyles[workOrder.maintenanceType];
  const totalRequestedUnits = draftParts.reduce((sum, part) => sum + part.requestedQuantity, 0);
  const isPlanning = workOrder.status === 'planning';
  const hasPendingChanges = JSON.stringify(draftParts) !== JSON.stringify(workOrder.spareParts);
  const packageStatus = getWorkOrderPackageStatus(workOrder);
  const hasReservableParts = draftParts.some((part) => !part.reserved && !part.delivered);
  const canReserveParts = hasReservableParts && draftParts.length > 0 && !hasPendingChanges;
  const pickupSelectionEnabled = draftParts.some((part) => part.reserved && !part.delivered);
  const canPickupSelected = pickupSelectionEnabled && selectedPickupPartIds.length > 0 && !hasPendingChanges;
  const missingReservedParts = draftParts.filter((part) => {
    const snapshot = stockSnapshots[part.id];
    return part.reserved && !part.delivered && Boolean(snapshot?.hasShortage);
  });
  const dateShiftLabel = getWorkOrderDateShiftLabel(workOrder);

  const handleSave = () => {
    onSaveSpareParts(draftParts);
  };

  const togglePickupSelection = (partId: string) => {
    setSelectedPickupPartIds((current) =>
      current.includes(partId) ? current.filter((id) => id !== partId) : [...current, partId]
    );
  };

  const handlePickupSelected = () => {
    onPickupSelected(selectedPickupPartIds);
    setSelectedPickupPartIds([]);
  };

  return (
    <StandardDrawer
      open={open}
      onClose={onClose}
      title="Work Order"
      subtitle={workOrder.equipment}
      headerVariant="light"
      width={520}
      headerChip={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7, flexWrap: 'wrap' }}>
          <Chip
            label={workOrder.id}
            size="small"
            sx={{ bgcolor: tokenBrand.softBg, color: tokenBrand.main, border: `1px solid ${tokenDivider}`, fontWeight: 700 }}
          />
          <Chip
            label={typeStyle.label}
            size="small"
            sx={{ bgcolor: typeStyle.bg, color: typeStyle.tone, border: `1px solid ${typeStyle.border}`, fontWeight: 700 }}
          />
          <Chip
            label={workOrder.status}
            size="small"
            sx={{ bgcolor: 'background.default', color: tokenText.secondary, border: `1px solid ${tokenDivider}`, fontWeight: 700 }}
          />
        </Box>
      }
      footer={
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 1, flexWrap: 'wrap' }}>
          <Typography variant="caption" sx={{ color: tokenText.secondary, fontWeight: 500 }}>
            Changes are only saved after pressing Save.
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', flexWrap: 'wrap', gap: 1 }}>
            {missingReservedParts.length ? (
              <Button
                variant="outlined"
                onClick={onRequestMissingParts}
                disabled={hasPendingChanges}
                sx={{
                  borderRadius: '8px',
                  color: tokenError.main,
                  borderColor: tokenError.light,
                  bgcolor: tokenError.softBg,
                  fontWeight: 700,
                  '&:hover': { bgcolor: tokenError.softBg, borderColor: tokenError.main },
                }}
              >
                Request missing parts
              </Button>
            ) : null}
            {hasReservableParts ? (
              <Button
                variant="outlined"
                onClick={onReserveParts}
                disabled={!canReserveParts}
                sx={{
                  borderRadius: '8px',
                  color: tokenBrand.main,
                  borderColor: tokenDivider,
                  bgcolor: tokenBrand.softBg,
                  fontWeight: 700,
                  '&:hover': { bgcolor: tokenBrand.selectedBg },
                }}
              >
                Reserve Parts
              </Button>
            ) : null}
            {pickupSelectionEnabled ? (
              <Button
                variant="outlined"
                onClick={handlePickupSelected}
                disabled={!canPickupSelected}
                sx={{
                  borderRadius: '8px',
                  color: tokenBrand.main,
                  borderColor: tokenDivider,
                  bgcolor: tokenBrand.softBg,
                  fontWeight: 700,
                  '&:hover': { bgcolor: tokenBrand.selectedBg },
                }}
              >
                Pick-up selected
              </Button>
            ) : null}
            <Button variant="text" onClick={onClose} sx={{ color: tokenBrand.main, fontWeight: 700 }}>
              Close
            </Button>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={!hasPendingChanges}
              sx={{
                minWidth: 92,
                height: 38,
                borderRadius: '8px',
                boxShadow: 'none',
                fontWeight: 700,
                '&:hover': { boxShadow: 'none' },
                '&.Mui-disabled': { bgcolor: tokenBrand.softBg, color: tokenText.disabled },
              }}
            >
              Save
            </Button>
          </Box>
        </Box>
      }
    >
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 1, mb: 1.4 }}>
        <WorkOrderInfoField label="Equipment" value={workOrder.equipment} />
        <WorkOrderInfoField label="Assignee" value={isPlanning ? '' : workOrder.assignee} />
        <WorkOrderInfoField label="Type" value={typeStyle.label} />
        <WorkOrderInfoField label="State" value={workOrder.status} />
        <WorkOrderInfoField label="Date / Shift" value={dateShiftLabel} />
        <WorkOrderInfoField label="Priority" value={workOrder.priorityLabel} />
        <WorkOrderInfoField label="Spare Parts" value={`${draftParts.length} items / ${totalRequestedUnits} units`} />
        <WorkOrderInfoField label="Package Status" value={packageStatus.label} />
      </Box>

      <TextField
        label="Scope"
        value={workOrder.detail}
        multiline
        minRows={3}
        fullWidth
        InputProps={{ readOnly: true }}
        sx={{
          mb: 1.5,
          '& .MuiInputLabel-root': { color: tokenText.secondary, fontWeight: 500 },
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
            bgcolor: 'background.default',
          },
          '& .MuiInputBase-input': { color: tokenText.primary, fontWeight: 700 },
        }}
      />

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 1.2 }}>
        <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: tokenBrand.softBg, color: tokenBrand.main, display: 'grid', placeItems: 'center' }}>
          <InventoryDrawerIcon sx={{ fontSize: 18 }} />
        </Box>
        <Box>
          <Typography sx={{ color: tokenText.primary, fontWeight: 700 }}>
            Spare Parts
          </Typography>
          <Typography variant="caption" sx={{ color: tokenText.secondary, fontWeight: 500 }}>
            Edit quantities, add new parts or remove unnecessary items.
          </Typography>
        </Box>
      </Box>

      <WorkOrderSparePartsEditor
        selectedParts={draftParts}
        onSelectedPartsChange={setDraftParts}
        catalog={catalog}
        stockSnapshots={stockSnapshots}
        pickupSelectionEnabled={pickupSelectionEnabled}
        pickupSelectionDisabled={hasPendingChanges}
        selectedPickupPartIds={selectedPickupPartIds}
        onPickupSelectionToggle={togglePickupSelection}
      />

      {missingReservedParts.length ? (
        <Paper
          elevation={0}
          sx={{
            mt: 1.4,
            p: 1.2,
            borderRadius: '8px',
            border: `1px solid ${tokenError.light}`,
            bgcolor: tokenError.softBg,
          }}
        >
          <Typography sx={{ color: tokenError.main, fontSize: 13, fontWeight: 700, mb: 0.4 }}>
            Reserved package has missing stock
          </Typography>
          <Typography variant="body2" sx={{ color: tokenError.dark, fontWeight: 500, lineHeight: 1.35 }}>
            One or more reserved parts exceed available inventory after reservations for other open Work Orders. Increase stock or reduce the required quantity to clear this automatically.
          </Typography>
        </Paper>
      ) : null}
    </StandardDrawer>
  );
}

function WorkOrderBoardCard({
  workOrder,
  stockSnapshots,
  selected,
  onOpen,
}: {
  workOrder: WorkOrderCardData;
  stockSnapshots: Record<string, WorkOrderPartStockSnapshot>;
  selected: boolean;
  onOpen: (workOrderId: string) => void;
}) {
  const typeStyle = workOrderTypeStyles[workOrder.maintenanceType];
  const stateStyle = workOrderStateStyles[workOrder.status];
  const packageStatus = getWorkOrderPackageStatus(workOrder);
  const missingSummary = getWorkOrderMissingPartsSummary(stockSnapshots);
  const dateShiftLabel = getWorkOrderDateShiftLabel(workOrder);
  const isPriorityWork = workOrder.priorityLabel === 'Emergency' || workOrder.maintenanceType === 'breakdown';
  const totalParts = workOrder.spareParts.length;

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onOpen(workOrder.id);
    }
  };

  return (
    <Paper
      elevation={0}
      onClick={() => onOpen(workOrder.id)}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      sx={{
        p: 1.5,
        borderRadius: '8px',
        border: selected ? `1px solid ${tokenBrand.main}` : `1px solid ${tokenDivider}`,
        borderLeft: `4px solid ${isPriorityWork ? tokenError.main : typeStyle.accent}`,
        bgcolor: selected ? tokenBrand.selectedBg : 'background.paper',
        cursor: 'pointer',
        transition: 'border-color 0.16s ease, background-color 0.16s ease',
        '&:hover': {
          borderColor: tokenBrand.light,
          bgcolor: tokenBrand.softBg,
        },
        '&:focus-visible': { outline: `2px solid ${tokenBrand.main}`, outlineOffset: 2 },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, alignItems: 'flex-start', mb: 0.9 }}>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography sx={{ color: tokenText.primary, fontSize: 13.5, fontWeight: 700, lineHeight: 1.15 }} noWrap>
            {workOrder.id}
          </Typography>
          <Typography sx={{ color: tokenText.secondary, fontSize: 12.5, fontWeight: 500, lineHeight: 1.25, mt: 0.25 }} noWrap>
            {workOrder.equipment}
          </Typography>
        </Box>
        {isPriorityWork ? (
          <Tooltip title="Emergency or breakdown priority">
            <WarningIcon sx={{ color: tokenError.main, fontSize: 18, flexShrink: 0 }} />
          </Tooltip>
        ) : null}
      </Box>

      <Box sx={{ display: 'flex', gap: 0.55, flexWrap: 'wrap', mb: 0.85 }}>
        <Chip label={typeStyle.label} size="small" sx={{ height: 22, bgcolor: typeStyle.bg, color: typeStyle.tone, border: `1px solid ${typeStyle.border}`, fontWeight: 700, '& .MuiChip-label': { px: 0.75, fontSize: 11 } }} />
        <Chip label={workOrder.status} size="small" sx={{ height: 22, color: stateStyle.tone, bgcolor: stateStyle.bg, border: `1px solid ${stateStyle.border}`, fontWeight: 700, '& .MuiChip-label': { px: 0.75, fontSize: 11 } }} />
        <Chip label={workOrder.priorityLabel} size="small" sx={{ height: 22, color: isPriorityWork ? tokenError.dark : tokenText.secondary, bgcolor: isPriorityWork ? tokenError.softBg : tokenNeutral.lighter, border: `1px solid ${isPriorityWork ? tokenError.light : tokenDivider}`, fontWeight: 700, '& .MuiChip-label': { px: 0.75, fontSize: 11 } }} />
      </Box>

      <Typography sx={{ color: tokenText.secondary, fontSize: 12.5, fontWeight: 500, lineHeight: 1.35, mb: 0.9, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {workOrder.detail}
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 0.45, mb: 0.9 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0 }}>
          <PersonIcon sx={{ fontSize: 14, color: tokenText.secondary, flexShrink: 0 }} />
          <Typography sx={{ color: tokenText.primary, fontSize: 12.2, fontWeight: 500 }} noWrap>
            {workOrder.status === 'planning' ? 'Unassigned pickup owner' : workOrder.assignee}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0 }}>
          <ClockIcon sx={{ fontSize: 14, color: tokenText.secondary, flexShrink: 0 }} />
          <Typography sx={{ color: workOrder.maintenanceType === 'breakdown' ? tokenError.main : tokenText.primary, fontSize: 12.2, fontWeight: 700 }} noWrap>
            {dateShiftLabel || 'Planning window pending'}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 0.55, flexWrap: 'wrap' }}>
        <Chip
          icon={<InventoryDrawerIcon sx={{ fontSize: 15 }} />}
          label={packageStatus.label}
          size="small"
          sx={{
            height: 24,
            maxWidth: '100%',
            color: packageStatus.tone,
            bgcolor: packageStatus.bg,
            border: `1px solid ${packageStatus.border}`,
            fontWeight: 700,
            '& .MuiChip-icon': { color: packageStatus.tone },
            '& .MuiChip-label': { px: 0.75, fontSize: 11.3, overflow: 'hidden', textOverflow: 'ellipsis' },
          }}
        />
        <Chip
          label={`${totalParts} Part${totalParts === 1 ? '' : 's'}`}
          size="small"
          sx={{ height: 24, color: tokenText.secondary, bgcolor: tokenNeutral.lighter, border: `1px solid ${tokenDivider}`, fontWeight: 500, '& .MuiChip-label': { px: 0.75, fontSize: 11.3 } }}
        />
        {missingSummary.hasMissingParts ? (
          <Chip
            icon={<WarningIcon sx={{ fontSize: 15 }} />}
            label={`Missing Parts - ${missingSummary.label}`}
            size="small"
            sx={{
              height: 24,
              maxWidth: '100%',
              color: tokenWarning.dark,
              bgcolor: tokenWarning.softBg,
              border: `1px solid ${tokenWarning.light}`,
              fontWeight: 700,
              '& .MuiChip-icon': { color: tokenWarning.main },
              '& .MuiChip-label': { px: 0.75, fontSize: 11.3, overflow: 'hidden', textOverflow: 'ellipsis' },
            }}
          />
        ) : null}
      </Box>
    </Paper>
  );
}

function WorkOrderBoardColumn({
  title,
  helper,
  workOrders,
  selectedWorkOrderId,
  stockSnapshotsById,
  onOpenWorkOrder,
  onCollapse,
}: {
  title: string;
  helper: string;
  workOrders: WorkOrderCardData[];
  selectedWorkOrderId: string | null;
  stockSnapshotsById: Record<string, Record<string, WorkOrderPartStockSnapshot>>;
  onOpenWorkOrder: (workOrderId: string) => void;
  onCollapse: () => void;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        flex: '1 1 0',
        minWidth: { xs: 248, xl: 0 },
        borderRadius: '12px',
        border: `1px solid ${tokenDivider}`,
        bgcolor: 'background.default',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ px: 1.5, py: 1.25, minHeight: 74, borderBottom: `1px solid ${tokenDivider}`, bgcolor: 'background.paper', display: 'flex', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 0.8, width: '100%', minWidth: 0 }}>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography sx={{ color: tokenText.primary, fontSize: 13.2, fontWeight: 700, lineHeight: 1.2 }}>
              {title}
            </Typography>
            <Typography sx={{ color: tokenText.secondary, fontSize: 11.2, fontWeight: 500, lineHeight: 1.18, mt: 0.25, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {helper}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.45, flexShrink: 0 }}>
            <Chip label={workOrders.length} size="small" sx={{ height: 22, color: tokenBrand.main, bgcolor: tokenBrand.softBg, border: `1px solid ${tokenDivider}`, fontWeight: 700, '& .MuiChip-label': { px: 0.7, fontSize: 11 } }} />
            <Tooltip title="Collapse column">
              <IconButton size="small" onClick={onCollapse} aria-label={`Collapse ${title}`} sx={{ width: 24, height: 24, color: tokenText.secondary }}>
                <ChevronLeftIcon sx={{ fontSize: 17 }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>
      <Box sx={{ p: 1, display: 'flex', flexDirection: 'column', gap: 1, minHeight: 360 }}>
        {workOrders.length ? (
          workOrders.map((workOrder) => (
            <WorkOrderBoardCard
              key={workOrder.id}
              workOrder={workOrder}
              selected={selectedWorkOrderId === workOrder.id}
              stockSnapshots={stockSnapshotsById[workOrder.id] ?? {}}
              onOpen={onOpenWorkOrder}
            />
          ))
        ) : (
          <Paper elevation={0} sx={{ p: 1.5, borderRadius: '8px', border: `1px dashed ${tokenDivider}`, bgcolor: 'background.paper', textAlign: 'center' }}>
            <Typography sx={{ color: tokenText.secondary, fontSize: 12.5, fontWeight: 500 }}>
              No Work Orders in this stage
            </Typography>
          </Paper>
        )}
      </Box>
    </Paper>
  );
}

function CollapsedWorkOrderBoardColumn({
  title,
  count,
  onExpand,
}: {
  title: string;
  count: number;
  onExpand: () => void;
}) {
  return (
    <Paper
      elevation={0}
      onClick={onExpand}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onExpand();
        }
      }}
      role="button"
      tabIndex={0}
      sx={{
        width: 46,
        minWidth: 46,
        minHeight: 360,
        borderRadius: '12px',
        border: `1px solid ${tokenDivider}`,
        bgcolor: 'background.paper',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 0.8,
        py: 1.5,
        cursor: 'pointer',
        transition: 'border-color 0.16s ease, background-color 0.16s ease',
        '&:hover': { borderColor: tokenBrand.light, bgcolor: tokenBrand.softBg },
        '&:focus-visible': { outline: `2px solid ${tokenBrand.main}`, outlineOffset: 2 },
      }}
    >
      <ChevronRightIcon sx={{ fontSize: 18, color: tokenBrand.main }} />
      <Chip label={count} size="small" sx={{ width: 26, height: 22, color: tokenBrand.main, bgcolor: tokenBrand.softBg, border: `1px solid ${tokenDivider}`, fontWeight: 700, '& .MuiChip-label': { px: 0, fontSize: 11 } }} />
      <Typography sx={{ color: tokenText.primary, fontSize: 11.2, fontWeight: 700, writingMode: 'vertical-rl', transform: 'rotate(180deg)', lineHeight: 1.1 }}>
        {title}
      </Typography>
    </Paper>
  );
}

export function InventoryPartDrawer({
  part,
  open,
  onClose,
  purchaseRequested,
  onRequestPurchase,
}: {
  part: SparePartsInventoryPart | null;
  open: boolean;
  onClose: () => void;
  purchaseRequested: boolean;
  onRequestPurchase: (partId: string) => void;
}) {
  if (!part) return null;

  const stockState = getInventoryStockState(part);
  const style = stateStyles[stockState];
  const availableStock = getAvailableStock(part);
  const shouldReplenishStock = stockState === 'low-stock' || stockState === 'out-of-stock';
  const suggestedReorderQuantity = Math.max(part.safetyStock * 2 - availableStock, part.safetyStock);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 540 },
          maxWidth: '100vw',
          bgcolor: 'background.paper',
          borderLeft: `1px solid ${tokenDivider}`,
          boxShadow: '-18px 0 42px rgba(0, 0, 0, 0.08)',
        },
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Box sx={{ px: 2.5, py: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, borderBottom: `1px solid ${tokenDivider}` }}>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ color: tokenBrand.main, fontSize: 16, fontWeight: 700 }}>
              Inventory Item
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7, flexWrap: 'wrap', mt: 0.5 }}>
              <Chip
                label={part.sapNumber}
                size="small"
                sx={{
                  bgcolor: tokenBrand.softBg,
                  color: tokenBrand.main,
                  border: `1px solid ${tokenDivider}`,
                  fontWeight: 700,
                }}
              />
              <Chip
                label={part.category}
                size="small"
                sx={{
                  bgcolor: tokenNeutral.lightest,
                  color: tokenText.primary,
                  border: `1px solid ${tokenDivider}`,
                  fontWeight: 700,
                }}
              />
              <Chip
                label={style.label}
                size="small"
                sx={{
                  bgcolor: style.bg,
                  color: style.tone,
                  border: `1px solid ${style.border}`,
                  fontWeight: 700,
                }}
              />
            </Box>
          </Box>

          <IconButton onClick={onClose} size="small" sx={{ color: tokenBrand.main }} aria-label="Close inventory drawer">
            <CloseIcon sx={{ fontSize: 19 }} />
          </IconButton>
        </Box>

        <Box sx={{ flex: 1, overflowY: 'auto', px: 2.5, py: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: '8px',
                bgcolor: tokenBrand.softBg,
                color: tokenBrand.main,
                display: 'grid',
                placeItems: 'center',
                border: `1px solid ${tokenDivider}`,
                flexShrink: 0,
              }}
            >
              {part.icon}
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ color: tokenText.primary, fontSize: 19, fontWeight: 700, lineHeight: 1.15 }}>
                {part.name}
              </Typography>
              <Typography sx={{ color: tokenText.secondary, fontWeight: 500, mt: 0.3, fontSize: '0.875rem' }}>
                {part.category}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' }, gap: 1.5, mb: 2 }}>
            {part.photoSrc ? (
              <Box
                component="img"
                src={part.photoSrc}
                alt={`${part.name} photo`}
                sx={{
                  width: '100%',
                  height: 200,
                  objectFit: 'contain',
                  borderRadius: '12px',
                  border: `1px solid ${tokenDivider}`,
                  bgcolor: 'background.default',
                }}
              />
            ) : (
              <Box
                sx={{
                  width: '100%',
                  height: 200,
                  borderRadius: '12px',
                  border: `1px dashed ${tokenDivider}`,
                  bgcolor: 'background.default',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography variant="body2" sx={{ color: tokenText.disabled, fontWeight: 500 }}>
                  No Image Available
                </Typography>
              </Box>
            )}
            <Box
              component="img"
              src={part.drawingSrc}
              alt={`${part.name} technical drawing`}
              sx={{
                width: '100%',
                height: 200,
                objectFit: 'contain',
                borderRadius: '12px',
                border: `1px solid ${tokenDivider}`,
                bgcolor: 'background.default',
              }}
            />
          </Box>

          <Paper
            elevation={0}
            sx={{
              mb: 2,
              p: 2,
              borderRadius: '12px',
              border: `1px solid ${tokenDivider}`,
              bgcolor: 'background.paper',
            }}
          >
            <Typography sx={{ color: tokenText.primary, fontSize: 14, fontWeight: 700, mb: 1.5 }}>
              Part Information
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 1.5 }}>
              <WorkOrderInfoField label="Part Number" value={part.sapNumber} />
              <WorkOrderInfoField label="Location" value={`Bin ${part.binLocation}`} />
              <WorkOrderInfoField label="Unit Value" value={inventoryCurrencyFormatter.format(part.unitPrice)} />
              <WorkOrderInfoField label="Condition" value={part.condition} />
            </Box>
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" sx={{ color: tokenText.secondary, fontWeight: 700, textTransform: 'uppercase', display: 'block', mb: 1 }}>
                Equipment Using This Part
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.45 }}>
                {part.usedIn.map((equipment) => (
                  <Box
                    key={equipment.id}
                    sx={{
                      px: 1.5,
                      py: 1.2,
                      borderRadius: '8px',
                      border: `1px solid ${tokenDivider}`,
                      bgcolor: 'background.paper',
                    }}
                  >
                    <Typography sx={{ color: tokenText.primary, fontWeight: 700, fontSize: '0.875rem' }}>
                      {equipment.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: tokenText.secondary, fontWeight: 500 }}>
                      {equipment.path}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              mb: 2,
              p: 2,
              borderRadius: '12px',
              border: `1px solid ${tokenDivider}`,
              bgcolor: 'background.paper',
            }}
          >
            <Typography sx={{ color: tokenText.primary, fontSize: 14, fontWeight: 700, mb: 1.5 }}>
              Stock Level
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(4, minmax(0, 1fr))' }, gap: 1.5 }}>
              <WorkOrderInfoField label="Current" value={String(part.currentStock)} />
              <WorkOrderInfoField label="Reserved" value={String(part.reservedStock)} />
              <WorkOrderInfoField label="Future" value={String(availableStock)} />
              <WorkOrderInfoField label="Safety" value={String(part.safetyStock)} />
            </Box>
            {shouldReplenishStock ? (
              <Box
                sx={{
                  mt: 2,
                  p: 1.5,
                  borderRadius: '8px',
                  border: `1px solid ${stockState === 'out-of-stock' ? tokenError.light : tokenWarning.light}`,
                  bgcolor: stockState === 'out-of-stock' ? tokenError.softBg : tokenWarning.softBg,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 1.5,
                  flexWrap: 'wrap',
                }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ color: tokenText.primary, fontWeight: 700, fontSize: '0.875rem' }}>
                    Replenishment needed
                  </Typography>
                  <Typography variant="caption" sx={{ color: tokenText.secondary, fontWeight: 500, display: 'block' }}>
                    Suggested purchase quantity: {suggestedReorderQuantity} units
                  </Typography>
                </Box>
                <Button
                  variant={purchaseRequested ? 'outlined' : 'contained'}
                  startIcon={<ReceivingIcon sx={{ fontSize: 18 }} />}
                  onClick={() => onRequestPurchase(part.id)}
                  disabled={purchaseRequested}
                  sx={{
                    borderRadius: '8px',
                    boxShadow: 'none',
                    fontWeight: 700,
                    textTransform: 'none',
                    whiteSpace: 'normal',
                    lineHeight: 1.2,
                    bgcolor: purchaseRequested ? 'transparent' : tokenBrand.main,
                    color: purchaseRequested ? tokenBrand.main : '#FFFFFF',
                    borderColor: purchaseRequested ? tokenBrand.main : 'transparent',
                    '&:hover': {
                      boxShadow: 'none',
                      bgcolor: purchaseRequested ? tokenBrand.softBg : tokenBrand.dark,
                    },
                  }}
                >
                  {purchaseRequested ? 'Purchase requested' : 'Request purchase'}
                </Button>
              </Box>
            ) : null}
          </Paper>

          <Paper
            elevation={0}
            sx={{
              mb: 2,
              p: 2,
              borderRadius: '12px',
              border: `1px solid ${tokenDivider}`,
              bgcolor: 'background.paper',
            }}
          >
            <Typography sx={{ color: tokenText.primary, fontSize: 14, fontWeight: 700, mb: 1.5 }}>
              Availability
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" sx={{ color: tokenText.secondary, fontWeight: 700, textTransform: 'uppercase', display: 'block', mb: 1 }}>
                Suppliers
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.45 }}>
                {part.suppliers.map((supplier) => (
                  <Box
                    key={`${supplier.name}-${supplier.supplier}`}
                    sx={{
                      px: 1.5,
                      py: 1.2,
                      borderRadius: '8px',
                      border: `1px solid ${tokenDivider}`,
                      bgcolor: 'background.paper',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 1.5,
                      flexWrap: 'wrap',
                    }}
                  >
                    <Typography sx={{ color: tokenText.primary, fontWeight: 700, fontSize: '0.875rem' }}>
                      {supplier.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: tokenText.secondary, fontWeight: 500 }}>
                      {supplier.supplier}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>

            <Box>
              <Typography variant="caption" sx={{ color: tokenText.secondary, fontWeight: 700, textTransform: 'uppercase', display: 'block', mb: 1 }}>
                Other Sites With Stock
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.45 }}>
                {part.siteAvailability.map((site) => (
                  <Box
                    key={`${site.name}-${site.city}`}
                    sx={{
                      px: 1.5,
                      py: 1.2,
                      borderRadius: '8px',
                      border: `1px solid ${tokenDivider}`,
                      bgcolor: 'background.paper',
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', sm: 'minmax(0, 1.4fr) minmax(0, 0.9fr) auto' },
                      gap: 1,
                      alignItems: 'center',
                    }}
                  >
                    <Typography sx={{ color: tokenText.primary, fontWeight: 700, fontSize: '0.875rem' }}>
                      {site.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: tokenText.secondary, fontWeight: 500 }}>
                      {site.city}
                    </Typography>
                    <Chip
                      size="small"
                      label={`${site.quantity} in stock`}
                      sx={{ bgcolor: tokenBrand.softBg, color: tokenBrand.main, border: `1px solid ${tokenDivider}`, fontWeight: 700, width: 'fit-content' }}
                    />
                  </Box>
                ))}
              </Box>
            </Box>
          </Paper>
        </Box>

        <Box sx={{ px: 2.5, py: 2, borderTop: `1px solid ${tokenDivider}`, bgcolor: 'background.paper', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <Typography variant="caption" sx={{ color: tokenText.secondary, fontWeight: 500 }}>
            Inventory details stay in context without leaving the list.
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1.5, flexWrap: 'wrap' }}>
            {shouldReplenishStock ? (
              <Button
                variant={purchaseRequested ? 'outlined' : 'contained'}
                startIcon={<ReceivingIcon sx={{ fontSize: 18 }} />}
                onClick={() => onRequestPurchase(part.id)}
                disabled={purchaseRequested}
                sx={{
                  borderRadius: '8px',
                  boxShadow: 'none',
                  fontWeight: 700,
                  textTransform: 'none',
                  bgcolor: purchaseRequested ? 'transparent' : tokenBrand.main,
                  color: purchaseRequested ? tokenBrand.main : '#FFFFFF',
                  borderColor: purchaseRequested ? tokenBrand.main : 'transparent',
                  '&:hover': {
                    boxShadow: 'none',
                    bgcolor: purchaseRequested ? tokenBrand.softBg : tokenBrand.dark,
                  },
                }}
              >
                {purchaseRequested ? 'Purchase requested' : 'Request purchase'}
              </Button>
            ) : null}
            <Button
              variant="outlined"
              onClick={onClose}
              sx={{
                borderRadius: '8px',
                borderColor: tokenDivider,
                color: tokenText.secondary,
                fontWeight: 700,
                textTransform: 'none',
                '&:hover': {
                  bgcolor: tokenNeutral.lighter,
                  borderColor: tokenText.secondary,
                },
              }}
            >
              Close
            </Button>
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
}

function BlankWorkspace({ title, description }: { title: string; description: string }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 3, md: 4 },
        borderRadius: '12px', // borderRadius/Medium
        border: `1px solid ${tokenDivider}`,
        bgcolor: 'background.paper',
        minHeight: 420,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box sx={{ textAlign: 'center', maxWidth: 520 }}>
        <Box
          sx={{
            width: 58,
            height: 58,
            borderRadius: '50%',
            mx: 'auto',
            mb: 1.5,
            display: 'grid',
            placeItems: 'center',
            bgcolor: tokenBrand.softBg,
            color: tokenBrand.main,
          }}
        >
          <CategoryIcon sx={{ fontSize: 28 }} />
        </Box>
        <Typography variant="h5" sx={{ color: tokenText.primary, fontWeight: 700, mb: 0.8 }}>
          {title}
        </Typography>
        <Typography variant="body2" sx={{ color: tokenText.secondary, fontWeight: 400 }}>
          {description}
        </Typography>
      </Box>
    </Paper>
  );
}

function CreateWorkOrderDrawer({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (newWO: {
    equipment: string;
    detail: string;
    assignee: string;
    maintenanceType: WorkOrderMaintenanceType;
    priorityLabel: string;
    shift: WorkOrderShift | null;
    scheduledDate: string;
    scheduledTime: string;
  }) => void;
}) {
  const [maintenanceType, setMaintenanceType] = React.useState<WorkOrderMaintenanceType>('corrective');
  const [equipment, setEquipment] = React.useState('');
  const [detail, setDetail] = React.useState('');
  const [assignee, setAssignee] = React.useState('');
  const [priorityLabel, setPriorityLabel] = React.useState('High');
  const [shift, setShift] = React.useState<WorkOrderShift>('Morning');
  const [scheduledDate, setScheduledDate] = React.useState('Jan 13, 2026');
  const [scheduledTime, setScheduledTime] = React.useState('08:00');

  React.useEffect(() => {
    if (open) {
      setMaintenanceType('corrective');
      setEquipment('');
      setDetail('');
      setAssignee('');
      setPriorityLabel('High');
      setShift('Morning');
      setScheduledDate('Jan 13, 2026');
      setScheduledTime('08:00');
    }
  }, [open]);

  const handleSubmit = () => {
    onSubmit({
      equipment,
      detail,
      assignee,
      maintenanceType,
      priorityLabel,
      shift: maintenanceType === 'breakdown' ? null : shift,
      scheduledDate: maintenanceType === 'breakdown' ? 'ASAP' : scheduledDate,
      scheduledTime: maintenanceType === 'breakdown' ? '' : scheduledTime,
    });
  };

  const isBreakdown = maintenanceType === 'breakdown';
  const canSubmit = equipment.trim() !== '' && detail.trim() !== '' && assignee.trim() !== '';

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 520 },
          maxWidth: '100vw',
          bgcolor: 'background.paper',
          borderLeft: `1px solid ${tokenDivider}`,
          boxShadow: '-18px 0 42px rgba(15, 23, 42, 0.18)',
        },
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Box sx={{ px: 2, py: 1.6, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${tokenDivider}`, bgcolor: 'background.paper' }}>
          <Typography variant="h6" sx={{ color: tokenBrand.main, fontWeight: 700 }}>
            Create Work Order
          </Typography>
          <IconButton onClick={onClose} size="small" sx={{ color: tokenBrand.main }} aria-label="Close create work order drawer">
            <CloseIcon sx={{ fontSize: 19 }} />
          </IconButton>
        </Box>

        <Box sx={{ flex: 1, overflowY: 'auto', px: 2, py: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box>
            <Typography sx={{ color: tokenText.primary, fontSize: '0.8125rem', fontWeight: 700, mb: 1 }}>
              Maintenance Type *
            </Typography>
            <RadioGroup
              row
              value={maintenanceType}
              onChange={(e) => setMaintenanceType(e.target.value as WorkOrderMaintenanceType)}
              sx={{ gap: 1.2 }}
            >
              <FormControlLabel value="corrective" control={<Radio size="small" sx={{ color: tokenText.secondary, '&.Mui-checked': { color: tokenBrand.main } }} />} label="Corrective" sx={{ m: 0, '& .MuiFormControlLabel-label': { color: tokenText.primary, fontSize: '0.875rem', fontWeight: 500 } }} />
              <FormControlLabel value="preventive" control={<Radio size="small" sx={{ color: tokenText.secondary, '&.Mui-checked': { color: tokenBrand.main } }} />} label="Preventive" sx={{ m: 0, '& .MuiFormControlLabel-label': { color: tokenText.primary, fontSize: '0.875rem', fontWeight: 500 } }} />
              <FormControlLabel value="breakdown" control={<Radio size="small" sx={{ color: tokenText.secondary, '&.Mui-checked': { color: tokenBrand.main } }} />} label="Breakdown" sx={{ m: 0, '& .MuiFormControlLabel-label': { color: tokenText.primary, fontSize: '0.875rem', fontWeight: 500 } }} />
            </RadioGroup>
          </Box>

          <TextField
            size="small"
            label="Equipment / Asset Name *"
            value={equipment}
            onChange={(e) => setEquipment(e.target.value)}
            fullWidth
            placeholder="e.g. Extrusion Machine"
            sx={{
              '& .MuiInputLabel-root': { color: tokenText.secondary, fontSize: '0.75rem', fontWeight: 500 },
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                bgcolor: 'background.paper',
              },
            }}
          />

          <TextField
            size="small"
            label="Problem Description / Scope *"
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            multiline
            minRows={3}
            fullWidth
            placeholder="Describe the issue or required work..."
            sx={{
              '& .MuiInputLabel-root': { color: tokenText.secondary, fontSize: '0.75rem', fontWeight: 500 },
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                bgcolor: 'background.paper',
              },
            }}
          />

          <TextField
            size="small"
            label="Assignee *"
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
            fullWidth
            placeholder="e.g. Mateus Rocha"
            sx={{
              '& .MuiInputLabel-root': { color: tokenText.secondary, fontSize: '0.75rem', fontWeight: 500 },
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                bgcolor: 'background.paper',
              },
            }}
          />

          <FormControl size="small" fullWidth>
            <InputLabel sx={{ color: tokenText.secondary, fontSize: '0.75rem', fontWeight: 500 }}>Priority *</InputLabel>
            <Select
              label="Priority *"
              value={priorityLabel}
              onChange={(e) => setPriorityLabel(e.target.value)}
              sx={{ borderRadius: '12px' }}
              MenuProps={sparePartsSelectMenuProps}
            >
              <MenuItem value="Emergency">Emergency</MenuItem>
              <MenuItem value="High">High</MenuItem>
              <MenuItem value="Medium">Medium</MenuItem>
              <MenuItem value="Low">Low</MenuItem>
            </Select>
          </FormControl>

          <Paper elevation={0} sx={{ p: 1.2, borderRadius: '8px', border: `1px solid ${tokenDivider}`, bgcolor: 'background.default' }}>
            <Typography sx={{ color: tokenText.primary, fontSize: '0.8125rem', fontWeight: 700 }}>
              Initial state: planning
            </Typography>
            <Typography variant="caption" sx={{ color: tokenText.secondary, fontWeight: 500 }}>
              Work Orders are scheduled later by the planning flow.
            </Typography>
          </Paper>
        </Box>

        <Box sx={{ px: 2, py: 1.4, borderTop: `1px solid ${tokenDivider}`, bgcolor: 'background.paper', display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button
            variant="outlined"
            onClick={onClose}
            sx={{
              borderRadius: '8px',
              color: tokenBrand.main,
              borderColor: tokenBrand.main,
              fontWeight: 500,
              textTransform: 'none',
              '&:hover': {
                borderColor: tokenBrand.dark,
                bgcolor: tokenBrand.softBg,
              },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!canSubmit}
            sx={{
              borderRadius: '8px',
              bgcolor: tokenBrand.main,
              color: '#FFFFFF',
              boxShadow: 'none',
              fontWeight: 500,
              textTransform: 'none',
              '&:hover': {
                bgcolor: tokenBrand.dark,
                boxShadow: 'none',
              },
            }}
          >
            Submit
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
}

export default function SparePartsManagementPage({
  initialEquipmentFilterName,
  initialEquipmentFilterNonce,
  onInitialEquipmentFilterApplied,
}: {
  initialEquipmentFilterName?: string | null;
  initialEquipmentFilterNonce?: number;
  onInitialEquipmentFilterApplied?: () => void;
}) {
  const [activeView, setActiveView] = React.useState<SparePartsView>('inventory');
  const [workOrders, setWorkOrders] = React.useState<WorkOrderCardData[]>(() => buildWorkOrders());
  const [inventoryAdjustments, setInventoryAdjustments] = React.useState<Record<string, InventoryAdjustment>>({});
  const [selectedWorkOrderId, setSelectedWorkOrderId] = React.useState<string | null>(null);
  const [inventorySearch, setInventorySearch] = React.useState('');
  const [inventoryCategory, setInventoryCategory] = React.useState('all');
  const [inventoryUsedIn, setInventoryUsedIn] = React.useState<EquipmentSelection | null>(null);
  const [inventoryStockLevel, setInventoryStockLevel] = React.useState<'all' | StockState>('all');
  const [inventorySummaryExpanded, setInventorySummaryExpanded] = React.useState(false);
  const [selectedInventoryPartId, setSelectedInventoryPartId] = React.useState<string | null>(null);
  const [requestedPurchasePartIds, setRequestedPurchasePartIds] = React.useState<string[]>([]);
  const [requestedMissingPartIds, setRequestedMissingPartIds] = React.useState<string[]>([]);
  const [activeMissingPartRequestId, setActiveMissingPartRequestId] = React.useState<string | null>(null);
  const [isAiInsightsExpanded, setIsAiInsightsExpanded] = React.useState(true);

  // Purchase Orders state
  const [purchaseOrders, setPurchaseOrders] = React.useState<PurchaseOrder[]>(() => initialPurchaseOrders);
  const [poSearch, setPoSearch] = React.useState('');
  const [expandedPoIds, setExpandedPoIds] = React.useState<Record<string, boolean>>({});
  const [pendingColumnCollapsed, setPendingColumnCollapsed] = React.useState(false);
  const [receivedColumnCollapsed, setReceivedColumnCollapsed] = React.useState(false);
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = React.useState(false);
  const [scannedBarcodeText, setScannedBarcodeText] = React.useState('');
  const [barcodeAlert, setBarcodeAlert] = React.useState<{ message: string; severity: 'success' | 'warning' | 'error' } | null>(null);
  const [selectMenuAnchorEl, setSelectMenuAnchorEl] = React.useState<HTMLElement | null>(null);

  const handleSelectMenuMouseDown = React.useCallback((event: React.MouseEvent<HTMLElement>) => {
    setSelectMenuAnchorEl(event.currentTarget);
  }, []);

  const handleSelectMenuClose = React.useCallback(() => {
    setSelectMenuAnchorEl(null);
  }, []);

  const selectMenuProps = React.useMemo(() => ({
    ...sparePartsSelectMenuProps,
    anchorEl: selectMenuAnchorEl ?? undefined,
    PaperProps: {
      ...sparePartsSelectMenuProps.PaperProps,
      sx: {
        ...sparePartsSelectMenuProps.PaperProps.sx,
        minWidth: selectMenuAnchorEl?.getBoundingClientRect().width,
      },
    },
  }), [selectMenuAnchorEl]);

  React.useEffect(() => {
    if (!initialEquipmentFilterName) return;

    const selection = findEquipmentSelectionByName(initialEquipmentFilterName);
    if (!selection) return;

    setActiveView('inventory');
    setInventoryUsedIn(selection);
    setInventorySearch('');
    setInventoryStockLevel('all');
    setInventoryCategory('all');
    onInitialEquipmentFilterApplied?.();
  }, [initialEquipmentFilterName, initialEquipmentFilterNonce, onInitialEquipmentFilterApplied]);

  const handleBarcodeSubmit = React.useCallback((barcode: string) => {
    const cleanBarcode = barcode.trim().toUpperCase();
    if (!cleanBarcode) return;

    // Check if cleanBarcode matches a PO ID
    const matchedPo = purchaseOrders.find(
      (po) => po.id.toUpperCase() === cleanBarcode
    );

    if (matchedPo) {
      setExpandedPoIds((prev) => ({ ...prev, [matchedPo.id]: true }));
      setBarcodeAlert({
        message: `Successfully identified Purchase Order: ${matchedPo.id} from ${matchedPo.vendor}.`,
        severity: 'success',
      });
      return;
    }

    // Check if cleanBarcode matches a Part Number in the PO items
    let matchedPart = false;
    purchaseOrders.forEach((po) => {
      po.items.forEach((item) => {
        if (item.partNumber.toUpperCase() === cleanBarcode) {
          matchedPart = true;
          setExpandedPoIds((prev) => ({ ...prev, [po.id]: true }));
        }
      });
    });

    if (matchedPart) {
      setBarcodeAlert({
        message: `Material label scanned: Part number ${cleanBarcode} found in active Purchase Order items.`,
        severity: 'success',
      });
    } else {
      setBarcodeAlert({
        message: `Barcode "${cleanBarcode}" did not match any active Purchase Order or Part Number.`,
        severity: 'warning',
      });
    }
  }, [purchaseOrders]);

  const handleReceivePo = React.useCallback((poId: string) => {
    setPurchaseOrders((prevOrders) =>
      prevOrders.map((po) => {
        if (po.id === poId) {
          const now = new Date();
          const formatOptions: Intl.DateTimeFormatOptions = {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          };
          const formattedDate = now.toLocaleDateString('en-US', formatOptions).replace(',', '');
          return {
            ...po,
            status: 'Completed' as PurchaseOrderStatus,
            receivedDate: formattedDate,
            receivedBy: 'John Smith',
            items: po.items.map((item) => ({
              ...item,
              receivedQuantity: item.quantity,
            })),
          };
        }
        return po;
      })
    );
    setBarcodeAlert({
      message: `Purchase Order ${poId} marked as completed and received.`,
      severity: 'success',
    });
  }, []);

  const filteredPurchaseOrders = React.useMemo(() => {
    const query = poSearch.trim().toLowerCase();
    if (!query) return purchaseOrders;

    return purchaseOrders.filter((po) => {
      const matchesPoId = po.id.toLowerCase().includes(query);
      const matchesVendor = po.vendor.toLowerCase().includes(query);
      const matchesItem = po.items.some(
        (item) =>
          item.partNumber.toLowerCase().includes(query) ||
          item.partName.toLowerCase().includes(query)
      );
      return matchesPoId || matchesVendor || matchesItem;
    });
  }, [purchaseOrders, poSearch]);

  const pendingPos = React.useMemo(() => {
    return filteredPurchaseOrders.filter((po) => po.status === 'Pending');
  }, [filteredPurchaseOrders]);

  const completedPos = React.useMemo(() => {
    return filteredPurchaseOrders.filter((po) => po.status === 'Completed');
  }, [filteredPurchaseOrders]);

  const renderPoCard = React.useCallback((po: PurchaseOrder) => {
    const isCompleted = po.status === 'Completed';
    const isExpanded = Boolean(expandedPoIds[po.id]);
    const borderAccent = isCompleted ? tokenBrand.main : tokenWarning.main;
    const badgeColor = isCompleted ? tokenBrand.main : tokenWarning.dark;
    const badgeBg = isCompleted ? tokenBrand.softBg : tokenWarning.softBg;
    const badgeBorder = isCompleted ? tokenDivider : tokenWarning.light;

    return (
      <Paper
        key={po.id}
        elevation={0}
        sx={{
          p: 1.6,
          borderRadius: '8px',
          border: `1px solid ${isExpanded ? tokenBrand.main : (isCompleted ? tokenDivider : tokenWarning.light)}`,
          borderLeft: `5px solid ${borderAccent}`,
          bgcolor: isExpanded ? tokenBrand.selectedBg : 'background.paper',
          display: 'flex',
          flexDirection: 'column',
          gap: 1.1,
          transition: 'border-color 0.16s ease, background-color 0.16s ease',
          '&:hover': {
            borderColor: tokenBrand.light,
            bgcolor: isExpanded ? tokenBrand.selectedBg : tokenBrand.softBg,
          },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
          <Box sx={{ minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap', mb: 0.45 }}>
              <Chip
                label={po.status === 'Completed' ? 'Completed' : 'Pending'}
                size="small"
                sx={{
                  bgcolor: badgeBg,
                  color: badgeColor,
                  borderColor: badgeBorder,
                  fontWeight: 700,
                  height: 20,
                  fontSize: 11,
                }}
              />
            </Box>
            <Typography sx={{ color: tokenText.primary, fontWeight: 700, lineHeight: 1.2, fontSize: 15 }}>
              {po.id}
            </Typography>
          </Box>
          <IconButton
            size="small"
            onClick={() => setExpandedPoIds((prev) => ({ ...prev, [po.id]: !prev[po.id] }))}
            sx={{ color: tokenBrand.main, p: 0.5 }}
            aria-label={isExpanded ? "Collapse PO card" : "Expand PO card"}
          >
            {isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
          </IconButton>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 1.5 }}>
          <Box sx={{ minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.55, mb: 0.35 }}>
              <InventoryIcon sx={{ fontSize: 15, color: tokenText.secondary }} />
              <Typography variant="caption" sx={{ color: tokenText.secondary, fontWeight: 500, textTransform: 'uppercase', fontSize: 10.5 }}>
                Vendor
              </Typography>
            </Box>
            <Typography sx={{ color: tokenText.primary, fontWeight: 700, fontSize: 13.5 }} noWrap>
              {po.vendor}
            </Typography>
            {isCompleted && po.receivedBy && (
              <Typography variant="caption" sx={{ color: tokenText.secondary, fontWeight: 500, display: 'block', mt: 0.25 }}>
                By: {po.receivedBy}
              </Typography>
            )}
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.55, mb: 0.35 }}>
              {isCompleted ? (
                <CheckCircleIcon sx={{ fontSize: 15, color: tokenBrand.main }} />
              ) : (
                <ClockIcon sx={{ fontSize: 15, color: tokenWarning.main }} />
              )}
              <Typography variant="caption" sx={{ color: tokenText.secondary, fontWeight: 500, textTransform: 'uppercase', fontSize: 10.5 }}>
                {isCompleted ? 'Received' : 'Expected'}
              </Typography>
            </Box>
            <Typography sx={{ color: tokenText.primary, fontWeight: 700, fontSize: 13.5 }} noWrap>
              {isCompleted ? po.receivedDate : po.expectedDate}
            </Typography>
          </Box>
        </Box>

        {isExpanded && (
          <Box sx={{ mt: 1.2, pt: 1.2, borderTop: `1px solid ${tokenDivider}`, display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="caption" sx={{ color: tokenText.secondary, fontWeight: 700, textTransform: 'uppercase', mb: 0.5 }}>
              Items
            </Typography>

            {po.items.map((item, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  py: 0.75,
                  px: 1,
                  borderRadius: '8px',
                  bgcolor: 'background.default',
                  border: `1px solid ${tokenDivider}`,
                  gap: 1,
                }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ color: tokenText.primary, fontWeight: 700, fontSize: 12.5 }} noWrap>
                    {item.partNumber} - {item.partName}
                  </Typography>
                </Box>
                <Chip
                  label={isCompleted ? `Received: ${item.quantity}` : `Qty: ${item.quantity}`}
                  size="small"
                  sx={{
                    bgcolor: isCompleted ? tokenBrand.softBg : tokenBrand.selectedBg,
                    color: isCompleted ? tokenBrand.main : tokenBrand.dark,
                    borderColor: tokenDivider,
                    fontWeight: 700,
                    height: 22,
                    fontSize: 11,
                  }}
                />
              </Box>
            ))}

            {!isCompleted && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => handleReceivePo(po.id)}
                  startIcon={<CheckCircleIcon sx={{ fontSize: 15 }} />}
                  sx={{
                    borderRadius: '8px',
                    boxShadow: 'none',
                    fontWeight: 700,
                    textTransform: 'none',
                    bgcolor: tokenBrand.main,
                    color: '#FFFFFF',
                    px: 2,
                    py: 0.5,
                    fontSize: 12,
                    '&:hover': { bgcolor: tokenBrand.dark, boxShadow: 'none' },
                  }}
                >
                  Receive Items
                </Button>
              </Box>
            )}
          </Box>
        )}
      </Paper>
    );
  }, [expandedPoIds, handleReceivePo]);

  // History & Consumption state
  const [historyRecords, setHistoryRecords] = React.useState<HistoryRecord[]>(() => initialHistoryRecords);
  const [historySearch, setHistorySearch] = React.useState('');
  const [historyTypeFilter, setHistoryTypeFilter] = React.useState<'all' | HistoryType>('all');
  const [consumptionEquipment, setConsumptionEquipment] = React.useState<EquipmentSelection | null>(null);
  const [isConsumptionTrendOpen, setIsConsumptionTrendOpen] = React.useState(false);
  const [consumptionTrendView, setConsumptionTrendView] = React.useState<ConsumptionTrendView>('all');
  const [partModelCosts] = React.useState<PartModelCost[]>(() => initialPartModelCosts);

  // Work order specific states
  const [workOrderSearch, setWorkOrderSearch] = React.useState('');
  const [workOrderTypeFilter, setWorkOrderTypeFilter] = React.useState<'all' | WorkOrderMaintenanceType>('all');
  const [workOrderStateFilter, setWorkOrderStateFilter] = React.useState<'all' | WorkOrderStatus>('all');
  const [workOrderPackageFilter, setWorkOrderPackageFilter] = React.useState<WorkOrderPackageFilter>('all');
  const [workOrderViewMode, setWorkOrderViewMode] = React.useState<WorkOrderViewMode>('board');
  const [workOrderLaneExpanded, setWorkOrderLaneExpanded] = React.useState<WorkOrderLaneExpandedState>(initialWorkOrderLaneExpanded);
  const [isCreateWorkOrderOpen, setIsCreateWorkOrderOpen] = React.useState(false);
  const [followUpWorkOrderDraft, setFollowUpWorkOrderDraft] = React.useState<WorkOrderDraft | null>(null);
  const [followUpWorkOrderTab, setFollowUpWorkOrderTab] = React.useState<WorkOrderTab>('spareParts');

  React.useEffect(() => {
    if (activeView !== 'work-orders') {
      setSelectedWorkOrderId(null);
      setFollowUpWorkOrderDraft(null);
    }

    if (activeView !== 'inventory') {
      setSelectedInventoryPartId(null);
    }
  }, [activeView]);

  const filteredWorkOrders = React.useMemo(() => {
    const query = workOrderSearch.trim().toLowerCase();
    return workOrders
      .filter((workOrder) => {
        if (workOrderTypeFilter !== 'all' && workOrder.maintenanceType !== workOrderTypeFilter) return false;
        if (workOrderStateFilter !== 'all' && workOrder.status !== workOrderStateFilter) return false;

        if (!query) return true;

        const matchesMain =
          workOrder.id.toLowerCase().includes(query) ||
          workOrder.equipment.toLowerCase().includes(query) ||
          workOrder.assignee.toLowerCase().includes(query) ||
          workOrder.detail.toLowerCase().includes(query);

        if (matchesMain) return true;

        return workOrder.spareParts.some((part) =>
          part.code.toLowerCase().includes(query) ||
          part.description.toLowerCase().includes(query)
        );
      })
      .sort(compareWorkOrders);
  }, [workOrders, workOrderSearch, workOrderStateFilter, workOrderTypeFilter]);

  const selectedWorkOrder = workOrders.find((workOrder) => workOrder.id === selectedWorkOrderId) ?? null;
  const openFollowUpWorkOrderDrawer = React.useCallback((workOrderId: string) => {
    const workOrder = workOrders.find((currentWorkOrder) => currentWorkOrder.id === workOrderId);
    if (!workOrder) return;

    setSelectedWorkOrderId(workOrderId);
    setFollowUpWorkOrderTab('spareParts');
    setFollowUpWorkOrderDraft(buildFollowUpWorkOrderDraft(workOrder));
  }, [workOrders]);
  const closeFollowUpWorkOrderDrawer = React.useCallback(() => {
    setFollowUpWorkOrderDraft(null);
    setSelectedWorkOrderId(null);
    setFollowUpWorkOrderTab('spareParts');
  }, []);
  const inventoryCategories = React.useMemo(
    () => Array.from(new Set(inventoryParts.map((part) => part.category))).sort((a, b) => a.localeCompare(b)),
    []
  );
  const inventoryRows = React.useMemo(
    () =>
      inventoryParts.map((part) => {
        const adjustment = inventoryAdjustments[part.id];
        const adjustedPart = {
          ...part,
          currentStock: Math.max(0, part.currentStock + (adjustment?.currentStockDelta ?? 0)),
          reservedStock: Math.max(0, part.reservedStock + (adjustment?.reservedStockDelta ?? 0)),
        };
        const state = getInventoryStockState(adjustedPart);

        return {
          ...adjustedPart,
          state,
          availableStock: getAvailableStock(adjustedPart),
          style: stateStyles[state],
        };
      }),
    [inventoryAdjustments]
  );
  const consumptionAnalyticsParts = React.useMemo<ConsumptionAnalyticsPart[]>(() => {
    return partModelCosts.map((part) => {
      const category = consumptionPartCategoryById[part.id];
      const relatedInventoryParts = inventoryRows.filter((inventoryPart) => inventoryPart.category === category);
      const usedIn = Array.from(
        new Map(
          relatedInventoryParts
            .flatMap((inventoryPart) => inventoryPart.usedIn)
            .map((equipment) => [equipment.id, equipment])
        ).values()
      );
      const stock = relatedInventoryParts.reduce((sum, inventoryPart) => sum + getAvailableStock(inventoryPart), 0);

      return {
        ...part,
        stock,
        usedIn,
      };
    });
  }, [inventoryRows, partModelCosts]);
  const filteredConsumptionParts = React.useMemo(() => {
    return consumptionAnalyticsParts.filter((part) =>
      part.usedIn.some((equipment) => matchesEquipmentSelection(equipment, consumptionEquipment))
    );
  }, [consumptionAnalyticsParts, consumptionEquipment]);
  const consumptionAnalyticsSummary = React.useMemo(() => {
    const totalConsumed = filteredConsumptionParts.reduce((sum, part) => sum + part.consumed, 0);
    const totalCost = filteredConsumptionParts.reduce((sum, part) => sum + part.consumed * part.unitCost, 0);
    const reorderAlerts = filteredConsumptionParts.filter((part) => part.stock <= part.consumed).length;
    const maxConsumed = Math.max(...filteredConsumptionParts.map((part) => part.consumed), 1);
    const topParts = filteredConsumptionParts
      .slice()
      .sort((a, b) => b.consumed - a.consumed)
      .map((part, index) => ({
        ...part,
        index: index + 1,
        maxConsumed,
      }));

    return {
      totalConsumed,
      costPerUnit: totalConsumed > 0 ? totalCost / totalConsumed : 0,
      reorderAlerts,
      topParts,
    };
  }, [filteredConsumptionParts]);
  const consumptionTrendDetails = React.useMemo(() => {
    const trendMap = new Map<string, number>();
    const trendBreakdownMap = new Map<string, Map<string, number>>();
    const equipmentMap = new Map<string, number>();
    const partMap = new Map<string, number>();
    const scopedPartIds = new Set(filteredConsumptionParts.map((part) => part.id));

    historyRecords.forEach((record, index) => {
      if (record.type !== 'Pick-up') return;

      const fallbackPart = consumptionAnalyticsParts[index % Math.max(consumptionAnalyticsParts.length, 1)];
      const linkedWorkOrder = workOrders.find((workOrder) => workOrder.id === record.reference);
      const consumedUnits = Math.abs(Math.min(record.quantityChange, 0));
      if (!consumedUnits || (fallbackPart && scopedPartIds.size && !scopedPartIds.has(fallbackPart.id))) return;

      const equipmentLabel = linkedWorkOrder?.equipment ?? fallbackPart?.usedIn[0]?.name ?? 'Unassigned equipment';
      const partLabel = fallbackPart?.name ?? record.itemText;
      const trendKey =
        consumptionTrendView === 'equipment'
          ? equipmentLabel
          : consumptionTrendView === 'part'
            ? partLabel.split(' - ')[0]
            : 'All consumed parts';

      trendMap.set(record.date, (trendMap.get(record.date) ?? 0) + consumedUnits);
      const dateBreakdown = trendBreakdownMap.get(record.date) ?? new Map<string, number>();
      dateBreakdown.set(trendKey, (dateBreakdown.get(trendKey) ?? 0) + consumedUnits);
      trendBreakdownMap.set(record.date, dateBreakdown);
      equipmentMap.set(equipmentLabel, (equipmentMap.get(equipmentLabel) ?? 0) + consumedUnits);
      partMap.set(partLabel, (partMap.get(partLabel) ?? 0) + consumedUnits);
    });

    const trend = Array.from(trendMap.entries())
      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
      .map(([date, value]) => {
        const topContributor = Array.from(trendBreakdownMap.get(date)?.entries() ?? [])
          .sort(([, a], [, b]) => b - a)[0]?.[0] ?? 'All consumed parts';

        return { date: date.slice(5), value, topContributor };
      });
    const maxTrendValue = Math.max(...trend.map((point) => point.value), 1);
    const topEquipment = Array.from(equipmentMap.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([label, value]) => ({ label, value }));
    const topParts = Array.from(partMap.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([label, value]) => ({ label, value }));

    return { trend, maxTrendValue, topEquipment, topParts };
  }, [consumptionAnalyticsParts, consumptionTrendView, filteredConsumptionParts, historyRecords, workOrders]);
  const filteredHistoryRecords = React.useMemo(() => {
    const query = historySearch.trim().toLowerCase();

    return historyRecords.filter((record, index) => {
      const matchesType = historyTypeFilter === 'all' || record.type === historyTypeFilter;
      if (!matchesType) return false;

      const linkedWorkOrder = workOrders.find((workOrder) => workOrder.id === record.reference);
      const fallbackConsumptionPart = consumptionAnalyticsParts[index % Math.max(consumptionAnalyticsParts.length, 1)];
      const matchesEquipment = consumptionEquipment
        ? Boolean(
          linkedWorkOrder
            ? `${linkedWorkOrder.equipment} ${linkedWorkOrder.detail}`.toLowerCase().includes(consumptionEquipment.name.toLowerCase()) ||
            consumptionEquipment.path.toLowerCase().includes(linkedWorkOrder.equipment.toLowerCase())
            : fallbackConsumptionPart?.usedIn.some((equipment) => matchesEquipmentSelection(equipment, consumptionEquipment))
        )
        : true;
      if (!matchesEquipment) return false;

      if (!query) return true;

      const equipmentSearchText = linkedWorkOrder
        ? `${linkedWorkOrder.equipment} ${linkedWorkOrder.detail} ${linkedWorkOrder.assignee}`
        : fallbackConsumptionPart?.usedIn.map((equipment) => `${equipment.name} ${equipment.id} ${equipment.path}`).join(' ') ?? '';

      return (
        record.reference.toLowerCase().includes(query) ||
        record.operator.toLowerCase().includes(query) ||
        record.reason.toLowerCase().includes(query) ||
        record.type.toLowerCase().includes(query) ||
        record.itemText.toLowerCase().includes(query) ||
        equipmentSearchText.toLowerCase().includes(query)
      );
    });
  }, [consumptionAnalyticsParts, consumptionEquipment, historyRecords, historySearch, historyTypeFilter, workOrders]);
  const hasConsumptionFilters = Boolean(historySearch.trim() || historyTypeFilter !== 'all' || consumptionEquipment);
  const liveSparePartCatalog = React.useMemo(
    () =>
      inventoryRows.map((part) => ({
        id: `sp-${part.id}`,
        code: part.sapNumber,
        description: part.name,
        location: part.binLocation,
        availableQuantity: part.availableStock,
        defaultRequestedQuantity: part.unitPrice <= 30 ? 2 : 1,
      })),
    [inventoryRows]
  );
  const selectedWorkOrderStockSnapshots = React.useMemo<Record<string, WorkOrderPartStockSnapshot>>(() => {
    if (!selectedWorkOrder) return {};

    return buildWorkOrderStockSnapshots(selectedWorkOrder, inventoryRows);
  }, [inventoryRows, selectedWorkOrder]);
  const workOrderStockSnapshotsById = React.useMemo<Record<string, Record<string, WorkOrderPartStockSnapshot>>>(() => {
    return workOrders.reduce<Record<string, Record<string, WorkOrderPartStockSnapshot>>>((snapshotsById, workOrder) => {
      snapshotsById[workOrder.id] = buildWorkOrderStockSnapshots(workOrder, inventoryRows);
      return snapshotsById;
    }, {});
  }, [inventoryRows, workOrders]);
  const visibleWorkOrders = React.useMemo(() => {
    return filteredWorkOrders.filter((workOrder) => {
      if (workOrderPackageFilter === 'all') return true;

      const missingSummary = getWorkOrderMissingPartsSummary(workOrderStockSnapshotsById[workOrder.id] ?? {});
      if (workOrderPackageFilter === 'missing-parts') return missingSummary.hasMissingParts;

      const packageStatus = getWorkOrderPackageStatus(workOrder);
      if (workOrderPackageFilter === 'no-parts-requested') return packageStatus.kind === 'no-parts-requested';
      if (workOrderPackageFilter === 'required') return packageStatus.kind === 'required';
      return getWorkOrderPackageStage(workOrder) === workOrderPackageFilter;
    });
  }, [filteredWorkOrders, workOrderPackageFilter, workOrderStockSnapshotsById]);
  const workOrderBoardColumnsData = React.useMemo(() => {
    return workOrderBoardColumns.map((column) => ({
      ...column,
      workOrders: visibleWorkOrders
        .filter((workOrder) =>
          getWorkOrderPackageStage(workOrder) === column.key &&
          (column.key !== 'upcoming' || workOrder.maintenanceType !== 'breakdown')
        )
        .sort(column.key === 'upcoming' ? compareUpcomingWorkOrders : compareWorkOrders),
    }));
  }, [visibleWorkOrders]);
  const filteredInventoryParts = React.useMemo(() => {
    const normalizedSearch = inventorySearch.trim().toLowerCase();

    return inventoryRows.filter((part) => {
      const matchesCategory = inventoryCategory === 'all' ? true : part.category === inventoryCategory;
      const usedInSearchText = part.usedIn
        .map((equipment) => `${equipment.name} ${equipment.id} ${equipment.barcode ?? ''} ${equipment.path} ${equipment.tags.join(' ')}`)
        .join(' ');
      const matchesUsedIn = inventoryUsedIn
        ? part.usedIn.some((equipment) => matchesEquipmentSelection(equipment, inventoryUsedIn))
        : true;
      const matchesStockLevel = inventoryStockLevel === 'all' ? true : part.state === inventoryStockLevel;
      const matchesSearch = normalizedSearch
        ? `${part.name} ${part.sapNumber} ${usedInSearchText} ${part.category} ${part.binLocation}`.toLowerCase().includes(normalizedSearch)
        : true;

      return matchesCategory && matchesUsedIn && matchesStockLevel && matchesSearch;
    });
  }, [inventoryCategory, inventoryRows, inventorySearch, inventoryStockLevel, inventoryUsedIn]);
  const selectedInventoryPart = inventoryRows.find((part) => part.id === selectedInventoryPartId) ?? null;
  const inventoryConsumptionLevelByCategory = React.useMemo(() => {
    type CategoryConsumptionStats = {
      recent12MonthUnits: number;
      recent90DayUnits: number;
      longTermMonthlyAverage: number;
    };

    const categoryStats = new Map<string, CategoryConsumptionStats>();

    partModelCosts.forEach((part) => {
      const category = consumptionPartCategoryById[part.id];
      if (!category) return;

      categoryStats.set(category, {
        recent12MonthUnits: 0,
        recent90DayUnits: 0,
        longTermMonthlyAverage: part.consumed / 12,
      });
    });

    const historyDates = historyRecords
      .map(getHistoryRecordDate)
      .filter((date): date is Date => Boolean(date));
    const anchorDate = historyDates.length
      ? new Date(Math.max(...historyDates.map((date) => date.getTime())))
      : new Date();
    const twelveMonthsAgo = new Date(anchorDate);
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    const ninetyDaysAgo = new Date(anchorDate);
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    historyRecords.forEach((record, index) => {
      if (record.type !== 'Pick-up') return;

      const recordDate = getHistoryRecordDate(record);
      if (!recordDate || recordDate < twelveMonthsAgo) return;

      const modelPart = partModelCosts[index % Math.max(partModelCosts.length, 1)];
      const category = modelPart ? consumptionPartCategoryById[modelPart.id] : null;
      if (!category) return;

      const existingStats = categoryStats.get(category) ?? {
        recent12MonthUnits: 0,
        recent90DayUnits: 0,
        longTermMonthlyAverage: 0,
      };
      const consumedUnits = Math.abs(record.quantityChange);

      existingStats.recent12MonthUnits += consumedUnits;
      if (recordDate >= ninetyDaysAgo) {
        existingStats.recent90DayUnits += consumedUnits;
      }
      categoryStats.set(category, existingStats);
    });

    return inventoryCategories.reduce<Record<string, InventoryConsumptionLevel>>((levels, category) => {
      const stats = categoryStats.get(category);
      if (!stats || stats.recent12MonthUnits === 0) {
        levels[category] = 'dead-stock';
        return levels;
      }

      const recentMonthlyRate = stats.recent90DayUnits / 3;
      const highConsumptionThreshold = Math.max(stats.longTermMonthlyAverage * 1.5, stats.longTermMonthlyAverage + 0.5);
      levels[category] = recentMonthlyRate > highConsumptionThreshold ? 'high' : 'normal';
      return levels;
    }, {});
  }, [historyRecords, inventoryCategories, partModelCosts]);
  const inventorySummary = React.useMemo(() => {
    const units = filteredInventoryParts.reduce((sum, part) => sum + part.currentStock, 0);
    const reservedUnits = filteredInventoryParts.reduce((sum, part) => sum + part.reservedStock, 0);
    const totalValue = filteredInventoryParts.reduce((sum, part) => sum + part.currentStock * part.unitPrice, 0);
    const consumptionBreakdown = createEmptyInventoryConsumptionBreakdown();

    filteredInventoryParts.forEach((part) => {
      const consumptionLevel = inventoryConsumptionLevelByCategory[part.category] ?? 'dead-stock';
      const breakdownItem = consumptionBreakdown[consumptionLevel];

      breakdownItem.skus += 1;
      breakdownItem.units += part.currentStock;
      breakdownItem.value += part.currentStock * part.unitPrice;
    });

    return {
      skus: filteredInventoryParts.length,
      units,
      reservedUnits,
      totalValue,
      consumptionBreakdown: inventoryConsumptionLevelOrder.map((level) => consumptionBreakdown[level]),
    };
  }, [filteredInventoryParts, inventoryConsumptionLevelByCategory]);
  const hasInventoryFilters = Boolean(
    inventorySearch.trim() ||
    inventoryUsedIn ||
    inventoryStockLevel !== 'all' ||
    inventoryCategory !== 'all'
  );
  const inventoryAlerts = React.useMemo(
    () =>
      inventoryRows
        .filter((part) => part.state === 'low-stock' || part.state === 'out-of-stock')
        .sort((a, b) => {
          if (a.availableStock === 0 && b.availableStock !== 0) return -1;
          if (a.availableStock !== 0 && b.availableStock === 0) return 1;
          return a.availableStock - b.availableStock;
        }),
    [inventoryRows]
  );
  const inventoryDisplayAlerts = React.useMemo(() => {
    const hasStockOut = inventoryAlerts.some((part) => part.state === 'out-of-stock');

    return inventoryAlerts.map((part, index) => {
      const alertState = !hasStockOut && index === 0 ? 'out-of-stock' : part.state;

      return {
        ...part,
        alertState,
        alertStyle: stateStyles[alertState],
        alertLabel: alertState === 'out-of-stock' ? 'Stockout' : stateStyles[alertState].label,
      };
    });
  }, [inventoryAlerts]);
  const inventoryAlertCounts = React.useMemo(
    () => ({
      lowStock: inventoryDisplayAlerts.filter((part) => part.alertState === 'low-stock').length,
      stockOut: inventoryDisplayAlerts.filter((part) => part.alertState === 'out-of-stock').length,
    }),
    [inventoryDisplayAlerts]
  );
  const missingPartRequestAlerts = React.useMemo<MissingPartRequestAlert[]>(() => {
    const inventoryByCatalogPartId = new Map(
      inventoryRows.map((part) => [`sp-${part.id}`, part])
    );

    return workOrders
      .flatMap((workOrder) =>
        workOrder.spareParts
          .filter((part) => part.reserved && !part.delivered)
          .map((part) => {
            const inventoryPart = inventoryByCatalogPartId.get(part.id);
            const selectedReservedQuantity = workOrder.spareParts
              .filter((selectedPart) => selectedPart.id === part.id && selectedPart.reserved && !selectedPart.delivered)
              .reduce((sum, selectedPart) => sum + selectedPart.requestedQuantity, 0);
            const totalQuantity = inventoryPart?.currentStock ?? part.availableQuantity;
            const otherReservedQuantity = Math.max((inventoryPart?.reservedStock ?? 0) - selectedReservedQuantity, 0);
            const availableQuantity = Math.max(totalQuantity - otherReservedQuantity, 0);
            const shortageQuantity = Math.max(part.requestedQuantity - availableQuantity, 0);
            const reservedSourceWorkOrder = otherReservedQuantity > 0
              ? workOrders.find((candidate) =>
                candidate.id !== workOrder.id &&
                candidate.spareParts.some((candidatePart) => candidatePart.id === part.id && candidatePart.reserved && !candidatePart.delivered)
              )
              : undefined;
            const incomingPo = purchaseOrders
              .filter((po) => po.status === 'Pending')
              .flatMap((po) =>
                po.items.map((item) => ({
                  po,
                  item,
                  matches: item.partNumber === part.code || item.partName.toLowerCase().includes(part.description.toLowerCase()) || part.description.toLowerCase().includes(item.partName.toLowerCase()),
                }))
              )
              .find((row) => row.matches);
            const otherSites = (inventoryPart?.siteAvailability ?? []).filter((site) => site.quantity > 0).slice(0, 3);
            const alternativeBins = inventoryRows
              .filter((candidate) => candidate.id !== inventoryPart?.id && candidate.category === inventoryPart?.category && candidate.availableStock > 0)
              .slice(0, 2)
              .map((candidate) => `${candidate.binLocation} (${candidate.availableStock})`);
            const suggestedAction = otherReservedQuantity > 0
              ? `Reallocate from ${reservedSourceWorkOrder?.id ?? 'another reserved WO'}`
              : incomingPo
                ? `Wait for ${incomingPo.po.id} or expedite delivery`
                : otherSites.length
                  ? `Request from ${otherSites[0].name}`
                  : 'Create purchase request';

            return {
              id: `${workOrder.id}-${part.id}`,
              workOrderId: workOrder.id,
              equipment: workOrder.equipment,
              scope: workOrder.detail,
              requestedBy: workOrder.assignee,
              requiredBy: getWorkOrderDateShiftLabel(workOrder),
              partId: part.id,
              code: part.code,
              description: part.description,
              location: part.location,
              requestedQuantity: part.requestedQuantity,
              availableQuantity,
              shortageQuantity,
              onHandQuantity: totalQuantity,
              otherReservedQuantity,
              priorityLabel: workOrder.priorityLabel,
              suggestedAction,
              reservedSourceWorkOrderId: reservedSourceWorkOrder?.id,
              incomingPo: incomingPo
                ? {
                  id: incomingPo.po.id,
                  vendor: incomingPo.po.vendor,
                  expectedDate: incomingPo.po.expectedDate,
                  quantity: incomingPo.item.quantity - incomingPo.item.receivedQuantity,
                }
                : undefined,
              alternativeBins,
              otherSites,
            };
          })
      )
      .filter((alert) => alert.shortageQuantity > 0 && !requestedMissingPartIds.includes(alert.id))
      .sort((a, b) => b.shortageQuantity - a.shortageQuantity || a.workOrderId.localeCompare(b.workOrderId));
  }, [inventoryRows, purchaseOrders, requestedMissingPartIds, workOrders]);
  const activeMissingPartRequest = missingPartRequestAlerts.find((alert) => alert.id === activeMissingPartRequestId) ?? null;
  const missingPartRequestSummary = React.useMemo(
    () => ({
      requests: missingPartRequestAlerts.length,
      units: missingPartRequestAlerts.reduce((sum, alert) => sum + alert.shortageQuantity, 0),
    }),
    [missingPartRequestAlerts]
  );
  const workOrderPackageStatusSummary = React.useMemo(() => {
    const initialSummary: Record<WorkOrderPackageStatus['kind'], { label: string; value: number; filter: WorkOrderPackageFilter }> = {
      'no-parts-requested': { label: 'No parts', value: 0, filter: 'no-parts-requested' },
      required: { label: 'Required', value: 0, filter: 'required' },
      reserved: { label: 'Reserved', value: 0, filter: 'reserved' },
      'awaiting-pick-up': { label: 'Awaiting pick-up', value: 0, filter: 'ready-for-pick-up' },
      'partial-picked-up': { label: 'Partial picked-up', value: 0, filter: 'partial-pick-up' },
      'picked-up': { label: 'Picked-up', value: 0, filter: 'pick-up-completed' },
    };

    filteredWorkOrders.forEach((workOrder) => {
      const packageStatus = getWorkOrderPackageStatus(workOrder);
      initialSummary[packageStatus.kind].value += 1;
    });

    return Object.values(initialSummary).filter((item) => item.filter !== 'no-parts-requested');
  }, [filteredWorkOrders]);
  const sparePartsPlanningInsights = React.useMemo(
    () => [
      {
        id: 'pm-stockout-risk',
        severity: 'Risk',
        category: 'Inventory Risk',
        title: 'Stockout risk for upcoming PMs',
        detail: 'Transfer seal kits cover 2 of 5 units reserved for PM-1048 next week, and the same kit stocked out twice in the last 60 days. Expedite PO-4581 or transfer 3 units from El Paso before kitting.',
        tone: tokenError.main,
        bg: tokenError.softBg,
        border: tokenError.light,
      },
      {
        id: 'safety-stock-breach',
        severity: 'Warning',
        category: 'Inventory Risk',
        title: 'Safety stock breach on critical spares',
        detail: 'Servo feed belts are at 3 available against 6 safety stock after open reservations. Consumption is running 35% above the prior quarter, so the next two planned replacements would leave no buffer.',
        tone: tokenWarning.dark,
        bg: tokenWarning.softBg,
        border: tokenWarning.light,
      },
      {
        id: 'consumption-anomaly',
        severity: 'Warning',
        category: 'Consumption Anomalies',
        title: 'Lubrication cartridges trending above average',
        detail: 'Line 2 used 14 cartridges this month versus an 8-unit historical average. Check lubrication intervals and reserve 6 extra units for recurring PMs until the usage driver is confirmed.',
        tone: tokenWarning.dark,
        bg: tokenWarning.softBg,
        border: tokenWarning.light,
      },
      {
        id: 'pm-readiness-missing-parts',
        severity: 'Readiness',
        category: 'PM Readiness',
        title: 'Upcoming PM kit missing electrical spares',
        detail: 'PM-1056 is scheduled in 4 days and still needs 2 interlock switches. Sandy has 1 available locally and Tijuana has 4, so reserve the local unit now and request a site transfer for the balance.',
        tone: tokenBrand.main,
        bg: tokenBrand.softBg,
        border: tokenBrand.light,
      },
      {
        id: 'early-reservation',
        severity: 'Readiness',
        category: 'PM Readiness',
        title: 'Early reservation window for recurrent demand',
        detail: 'Three preventive work orders in the next 10 days require the same HEPA cartridge. Reserving 9 units now protects the PM schedule because average receipt lead time is 12 days.',
        tone: tokenBrand.main,
        bg: tokenBrand.softBg,
        border: tokenBrand.light,
      },
      {
        id: 'inventory-redistribution',
        severity: 'Opportunity',
        category: 'Optimization Opportunities',
        title: 'Redistribute excess guide rail stock',
        detail: 'Sandy holds 18 guide rails with no consumption in 90 days, while Cuautitlan has two open work orders and 1 unit available. Move 4 units instead of buying new stock for the same demand.',
        tone: tokenBrand.main,
        bg: tokenBrand.softBg,
        border: tokenBrand.light,
      },
    ],
    []
  );

  const adjustInventoryStock = React.useCallback((catalogPartId: string, currentStockDelta: number, reservedStockDelta: number) => {
    const inventoryPartId = catalogPartId.replace(/^sp-/, '');

    setInventoryAdjustments((current) => {
      const previous = current[inventoryPartId] ?? { currentStockDelta: 0, reservedStockDelta: 0 };

      return {
        ...current,
        [inventoryPartId]: {
          currentStockDelta: previous.currentStockDelta + currentStockDelta,
          reservedStockDelta: previous.reservedStockDelta + reservedStockDelta,
        },
      };
    });
  }, []);

  const reconcileSavedPartStock = React.useCallback((previousParts: WorkOrderSparePart[], nextParts: WorkOrderSparePart[]) => {
    const partIds = Array.from(new Set([...previousParts.map((part) => part.id), ...nextParts.map((part) => part.id)]));

    partIds.forEach((partId) => {
      const previousDelivered = previousParts
        .filter((part) => part.id === partId && part.delivered)
        .reduce((sum, part) => sum + part.requestedQuantity, 0);
      const nextDelivered = nextParts
        .filter((part) => part.id === partId && part.delivered)
        .reduce((sum, part) => sum + part.requestedQuantity, 0);
      const previousReserved = previousParts
        .filter((part) => part.id === partId && part.reserved && !part.delivered)
        .reduce((sum, part) => sum + part.requestedQuantity, 0);
      const nextReserved = nextParts
        .filter((part) => part.id === partId && part.reserved && !part.delivered)
        .reduce((sum, part) => sum + part.requestedQuantity, 0);

      adjustInventoryStock(partId, previousDelivered - nextDelivered, nextReserved - previousReserved);
    });
  }, [adjustInventoryStock]);

  const handleWorkOrderPartsChange = React.useCallback((woId: string, parts: WorkOrderSparePart[]) => {
    const previousWorkOrder = workOrders.find((workOrder) => workOrder.id === woId);
    if (previousWorkOrder) {
      reconcileSavedPartStock(previousWorkOrder.spareParts, parts);
    }

    setWorkOrders((currentWorkOrders) =>
      currentWorkOrders.map((workOrder) =>
        workOrder.id === woId
          ? {
            ...workOrder,
            spareParts: parts,
          }
          : workOrder
      )
    );
  }, [reconcileSavedPartStock, workOrders]);

  const handleReserveWorkOrderParts = React.useCallback((woId: string) => {
    const workOrder = workOrders.find((currentWorkOrder) => currentWorkOrder.id === woId);
    if (!workOrder) return;

    workOrder.spareParts
      .filter((part) => !part.reserved && !part.delivered)
      .forEach((part) => adjustInventoryStock(part.id, 0, part.requestedQuantity));

    setWorkOrders((currentWorkOrders) =>
      currentWorkOrders.map((currentWorkOrder) =>
        currentWorkOrder.id === woId
          ? {
            ...currentWorkOrder,
            spareParts: currentWorkOrder.spareParts.map((part) =>
              part.delivered ? part : { ...part, reserved: true }
            ),
          }
          : currentWorkOrder
      )
    );
  }, [adjustInventoryStock, workOrders]);

  const handlePickupSelectedParts = React.useCallback((woId: string, partIds: string[]) => {
    const workOrder = workOrders.find((currentWorkOrder) => currentWorkOrder.id === woId);
    if (!workOrder) return;

    workOrder.spareParts
      .filter((part) => partIds.includes(part.id) && part.reserved && !part.delivered)
      .forEach((part) => adjustInventoryStock(part.id, -part.requestedQuantity, -part.requestedQuantity));

    setWorkOrders((currentWorkOrders) =>
      currentWorkOrders.map((currentWorkOrder) =>
        currentWorkOrder.id === woId
          ? {
            ...currentWorkOrder,
            spareParts: currentWorkOrder.spareParts.map((part) =>
              partIds.includes(part.id) ? { ...part, delivered: true, reserved: false } : part
            ),
          }
          : currentWorkOrder
      )
    );
  }, [adjustInventoryStock, workOrders]);

  const handleFollowUpSparePartsChange = React.useCallback((parts: NonNullable<WorkOrderDraft['selectedSpareParts']>, draft: WorkOrderDraft) => {
    const workOrderId = draft.sourceRequestId;
    if (!workOrderId) return;

    const currentWorkOrder = workOrders.find((workOrder) => workOrder.id === workOrderId);
    if (!currentWorkOrder || !draft.isReadyForPickUp) return;

    const nextParts = currentWorkOrder.spareParts.map((part) => {
      const updatedPart = parts.find((selectedPart) => selectedPart.id === part.id);
      if (!updatedPart) return part;

      return {
        ...part,
        requestedQuantity: updatedPart.requestedQuantity,
        reserved: updatedPart.sparePartActionStatus === 'reserved',
        delivered: updatedPart.sparePartActionStatus === 'picked',
      };
    });

    handleWorkOrderPartsChange(workOrderId, nextParts);
    setFollowUpWorkOrderDraft((currentDraft) =>
      currentDraft?.sourceRequestId === workOrderId
        ? { ...currentDraft, selectedSpareParts: parts, isReadyForPickUp: currentDraft.isReadyForPickUp }
        : currentDraft
    );
  }, [handleWorkOrderPartsChange, workOrders]);

  const handleCreateWorkOrder = React.useCallback((newWO: {
    equipment: string;
    detail: string;
    assignee: string;
    maintenanceType: WorkOrderMaintenanceType;
    priorityLabel: string;
    shift: WorkOrderShift | null;
    scheduledDate: string;
    scheduledTime: string;
  }) => {
    const nextSeq = workOrders.length + 1;
    const newId = `WO-6060347${String(nextSeq).padStart(2, '0')}`;
    const newCard: WorkOrderCardData = {
      id: newId,
      equipment: newWO.equipment,
      detail: newWO.detail,
      assignee: newWO.assignee,
      maintenanceType: newWO.maintenanceType,
      status: 'planning',
      shift: null,
      scheduledDate: newWO.maintenanceType === 'breakdown' ? 'ASAP' : '',
      scheduledTime: '',
      scheduledSort: newWO.maintenanceType === 'breakdown' ? -1 : unscheduledSortValue,
      priorityLabel: newWO.priorityLabel,
      spareParts: [],
    };
    setWorkOrders((prev) => [...prev, newCard]);
    setIsCreateWorkOrderOpen(false);
  }, [workOrders]);

  const handleInventoryPartSelect = React.useCallback((partId: string) => {
    setSelectedInventoryPartId(partId);
  }, []);

  const handlePurchaseRequest = React.useCallback((partId: string) => {
    setRequestedPurchasePartIds((currentIds) => (
      currentIds.includes(partId) ? currentIds : [...currentIds, partId]
    ));
  }, []);

  const handleMissingPartAlertOpen = React.useCallback((alertId: string) => {
    setActiveMissingPartRequestId(alertId);
  }, []);

  const handleMissingPartRequested = React.useCallback((alertId: string) => {
    setRequestedMissingPartIds((currentIds) => (
      currentIds.includes(alertId) ? currentIds : [...currentIds, alertId]
    ));
    setActiveMissingPartRequestId(null);
  }, []);

  return (
    <Box sx={{ flexGrow: 1, overflowY: 'auto', bgcolor: 'background.default', p: { xs: 2, md: 3 } }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h5" sx={{ color: tokenText.primary, fontWeight: 700, fontSize: '1.5rem', lineHeight: 1.334 }}>
          Spare Parts Management
        </Typography>
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: '16px',
          border: `1px solid ${tokenDivider}`,
          bgcolor: 'background.paper',
        }}
      >
        <Box sx={{ pb: 0, px: 0 }}>
          {/* BLU.AI Insights Panel */}
          <Box
            sx={{
              mb: 3,
              p: 2,
              borderRadius: '12px',
              bgcolor: tokenNeutral.lightest,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: isAiInsightsExpanded ? 2 : 0, px: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SparkleIcon sx={{ fontSize: 16, color: '#F97316' }} />
                <Typography sx={{ color: tokenBrand.main, fontSize: '0.875rem', fontWeight: 700, lineHeight: 1.1 }}>
                  BLU.AI analysis
                </Typography>
              </Box>
              <Button
                size="small"
                onClick={() => setIsAiInsightsExpanded((c) => !c)}
                sx={{ color: tokenText.secondary, fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', minWidth: 0, px: 0.5, py: 0 }}
              >
                {isAiInsightsExpanded ? 'Collapse' : 'Expand'}
              </Button>
            </Box>

            {isAiInsightsExpanded && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.45 }}>
                {sparePartsPlanningInsights.map((insight, idx) => {
                  const isHighlighted = idx === 0;
                  return (
                    <Box
                      key={insight.id}
                      sx={{
                        px: isHighlighted ? 2 : 1,
                        py: isHighlighted ? 1.5 : 0.5,
                        borderRadius: '6px',
                        border: isHighlighted ? `1px solid ${tokenDivider}` : '1px solid transparent',
                        bgcolor: isHighlighted ? 'rgba(0,0,0,0.03)' : 'transparent',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 1,
                        minWidth: 0,
                      }}
                    >
                      {insight.severity === 'Risk' || insight.severity === 'Warning' ? (
                        <WarningIcon sx={{ fontSize: 16, color: tokenError.main, mt: 0.15, flexShrink: 0 }} />
                      ) : (
                        <InfoIcon sx={{ fontSize: 16, color: tokenBrand.main, mt: 0.15, flexShrink: 0 }} />
                      )}
                      <Typography sx={{ color: tokenText.secondary, fontSize: '0.75rem', fontWeight: 400, flex: 1, lineHeight: 1.32, minWidth: 0 }}>
                        <Box component="span" sx={{ color: tokenText.primary, fontWeight: 700 }}>{insight.title}</Box>
                        {' '} - {insight.detail}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            )}
          </Box>

          <Box sx={{ display: 'flex', gap: 3.5, borderBottom: `1px solid ${tokenDivider}`, mb: 3 }}>
            {boardTabs.map((tab) => {
              const isActive = activeView === tab.key;
              return (
                <Box
                  id={`tab-view-${tab.key}`}
                  key={tab.key}
                  onClick={() => setActiveView(tab.key)}
                  sx={{
                    pb: 1.5,
                    cursor: 'pointer',
                    borderBottom: isActive ? `2px solid ${tokenBrand.main}` : '2px solid transparent',
                    color: isActive ? tokenText.primary : tokenText.secondary,
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '0.875rem',
                    letterSpacing: '0.1px',
                    textTransform: 'uppercase',
                    transition: 'all 0.2s ease',
                    '&:hover': { color: tokenBrand.main },
                  }}
                >
                  {tab.label}
                </Box>
              );
            })}
          </Box>
        </Box>

        {activeView === 'inventory' ? (
          <>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: '12px',
                border: `1px solid ${tokenDivider}`,
                bgcolor: 'background.paper',
                mb: 2,
              }}
            >
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(260px, 1.2fr) minmax(260px, 1fr) minmax(190px, 0.72fr) minmax(220px, 0.8fr) auto' }, gap: 1.5, alignItems: 'center' }}>
                <TextField
                  id="input-inventory-search"
                  size="small"
                  label="Search"
                  value={inventorySearch}
                  onChange={(event) => setInventorySearch(event.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      bgcolor: 'background.paper',
                    },
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <SearchIcon sx={{ fontSize: 20, color: tokenText.secondary }} />
                      </InputAdornment>
                    ),
                  }}
                />
                <Box
                  sx={{
                    minWidth: 0,
                    display: 'flex',
                    alignItems: 'center',
                    '& > .MuiBox-root': { flex: 1, minWidth: 0, mb: 0, mt: 0 },
                  }}
                >
                  <EquipmentSelector
                    value={inventoryUsedIn}
                    onChange={(selection) => setInventoryUsedIn(selection)}
                    label="Equipment"
                    placeholder="Equipment ID or Scan barcode"
                  />
                </Box>
                <Select
                  size="small"
                  value={inventoryStockLevel}
                  onChange={(event) => setInventoryStockLevel(event.target.value as 'all' | StockState)}
                  displayEmpty
                  sx={{
                    borderRadius: '12px',
                    bgcolor: 'background.paper',
                  }}
                  onMouseDown={handleSelectMenuMouseDown}
                  onClose={handleSelectMenuClose}
                  MenuProps={selectMenuProps}
                >
                  <MenuItem value="all">All stock levels</MenuItem>
                  <MenuItem value="in-stock">In Stock</MenuItem>
                  <MenuItem value="low-stock">Low Stock</MenuItem>
                  <MenuItem value="out-of-stock">Out of Stock</MenuItem>
                </Select>
                <Select
                  size="small"
                  value={inventoryCategory}
                  onChange={(event) => setInventoryCategory(event.target.value)}
                  sx={{
                    borderRadius: '12px',
                    bgcolor: 'background.paper',
                  }}
                  onMouseDown={handleSelectMenuMouseDown}
                  onClose={handleSelectMenuClose}
                  MenuProps={selectMenuProps}
                >
                  <MenuItem value="all">All categories</MenuItem>
                  {inventoryCategories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
                <Button
                  variant="text"
                  size="small"
                  disabled={!hasInventoryFilters}
                  onClick={() => {
                    setInventorySearch('');
                    setInventoryUsedIn(null);
                    setInventoryStockLevel('all');
                    setInventoryCategory('all');
                  }}
                  sx={{
                    justifySelf: { xs: 'flex-start', lg: 'end' },
                    color: tokenBrand.main,
                    fontWeight: 500,
                    textTransform: 'none',
                    whiteSpace: 'nowrap',
                    '&:hover': {
                      color: tokenBrand.dark,
                    },
                  }}
                >
                  Clear filters
                </Button>
              </Box>
            </Paper>

            <Grid container spacing={1.3} sx={{ mb: 1.6 }}>
              <Grid size={{ xs: 12, md: inventorySummaryExpanded ? 12 : 6 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: '12px',
                    border: `1px solid ${tokenDivider}`,
                    bgcolor: 'background.paper',
                    minHeight: 192,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'all 180ms ease',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.4, mb: 1.8 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.4, minWidth: 0 }}>
                      <Box
                        sx={{
                          width: 42,
                          height: 42,
                          borderRadius: '8px',
                          display: 'grid',
                          placeItems: 'center',
                          bgcolor: tokenBrand.softBg,
                          color: tokenBrand.main,
                          flex: '0 0 auto',
                        }}
                      >
                        <InventoryIcon sx={{ fontSize: 21 }} />
                      </Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ color: tokenBrand.main, fontSize: '1rem', fontWeight: 700, lineHeight: 1.05 }}>
                          Inventory Summary
                        </Typography>
                        <Typography sx={{ color: tokenText.secondary, fontSize: '0.75rem', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase', mt: 0.25, display: 'block' }}>
                          Stock & Valuation
                        </Typography>
                      </Box>
                    </Box>
                    <Tooltip title={inventorySummaryExpanded ? 'Collapse summary' : 'Expand summary'}>
                      <IconButton
                        size="small"
                        onClick={() => setInventorySummaryExpanded((expanded) => !expanded)}
                        sx={{
                          width: 34,
                          height: 34,
                          border: `1px solid ${tokenDivider}`,
                          bgcolor: 'transparent',
                          color: tokenBrand.main,
                          '&:hover': { bgcolor: tokenBrand.softBg },
                        }}
                      >
                        {inventorySummaryExpanded ? <ChevronUpIcon sx={{ fontSize: 20 }} /> : <ChevronDownIcon sx={{ fontSize: 20 }} />}
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: inventorySummaryExpanded ? 'repeat(auto-fit, minmax(190px, 1fr))' : 'repeat(auto-fit, minmax(104px, 1fr))',
                      gap: 1.2,
                      my: 1.8,
                      minWidth: 0,
                    }}
                  >
                    {[
                      { label: 'Parts', value: inventorySummary.skus, breakdownKey: 'skus' as const },
                      { label: 'Units', value: inventorySummary.units, breakdownKey: 'units' as const },
                      { label: 'Reserved', value: inventorySummary.reservedUnits },
                      { label: 'Total Value', value: inventoryCurrencyFormatter.format(inventorySummary.totalValue), breakdownKey: 'value' as const },
                    ].map((item) => {
                      const breakdownKey = item.breakdownKey;
                      const showBreakdown = inventorySummaryExpanded && Boolean(breakdownKey);

                      return (
                        <Box
                          key={item.label}
                          sx={{
                            minWidth: 0,
                            textAlign: 'left',
                            border: `1px solid ${tokenDivider}`,
                            borderRadius: '8px',
                            bgcolor: 'background.default',
                            px: 1.2,
                            py: 1,
                          }}
                        >
                          <Typography
                            sx={{
                              color: tokenText.primary,
                              fontSize: item.label === 'Total Value' ? '1.05rem' : 'clamp(1.25rem, 2.2vw, 1.75rem)',
                              fontWeight: 700,
                              lineHeight: 1.12,
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {item.value}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              color: tokenText.secondary,
                              fontWeight: 500,
                              textTransform: 'uppercase',
                              display: 'block',
                              mt: 0.5,
                              lineHeight: 1.2,
                              overflowWrap: 'anywhere',
                            }}
                          >
                            {item.label}
                          </Typography>
                          {showBreakdown && breakdownKey ? (
                            <Box sx={{ display: 'grid', gap: 0.55, mt: 1.15 }}>
                              {inventorySummary.consumptionBreakdown.map((breakdownItem) => {
                                const breakdownValue =
                                  breakdownKey === 'value'
                                    ? inventoryCurrencyFormatter.format(breakdownItem.value)
                                    : breakdownItem[breakdownKey];

                                return (
                                  <Box
                                    key={`${item.label}-${breakdownItem.label}`}
                                    sx={{
                                      display: 'grid',
                                      gridTemplateColumns: 'minmax(0, 1fr) auto',
                                      alignItems: 'center',
                                      gap: 0.8,
                                      px: 0.75,
                                      py: 0.6,
                                      borderRadius: '6px',
                                      border: `1px solid ${breakdownItem.border}`,
                                      bgcolor: breakdownItem.bg,
                                      minWidth: 0,
                                    }}
                                  >
                                    <Box sx={{ minWidth: 0 }}>
                                      <Typography sx={{ color: breakdownItem.tone, fontSize: '0.76rem', fontWeight: 700, lineHeight: 1.15, overflowWrap: 'anywhere' }}>
                                        {breakdownItem.label}
                                      </Typography>
                                      <Typography sx={{ color: tokenText.secondary, fontSize: '0.68rem', fontWeight: 500, lineHeight: 1.15, overflowWrap: 'anywhere' }}>
                                        {breakdownItem.helper}
                                      </Typography>
                                    </Box>
                                    <Typography sx={{ color: tokenText.primary, fontSize: '0.82rem', fontWeight: 700, lineHeight: 1.15, textAlign: 'right', overflowWrap: 'anywhere' }}>
                                      {breakdownValue}
                                    </Typography>
                                  </Box>
                                );
                              })}
                            </Box>
                          ) : null}
                        </Box>
                      );
                    })}
                  </Box>
                  <Typography variant="caption" sx={{ color: tokenText.secondary, fontWeight: 500, textAlign: 'right', display: 'block', overflowWrap: 'anywhere' }}>
                    {hasInventoryFilters ? 'Matching current filters' : 'Full inventory'}
                  </Typography>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: '12px',
                    border: `1px solid ${tokenDivider}`,
                    bgcolor: 'background.paper',
                    minHeight: 192,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.4 }}>
                      <Box
                        sx={{
                          width: 42,
                          height: 42,
                          borderRadius: '8px',
                          display: 'grid',
                          placeItems: 'center',
                          bgcolor: tokenWarning.softBg,
                          color: tokenWarning.main,
                        }}
                      >
                        <WarningIcon sx={{ fontSize: 20 }} />
                      </Box>
                      <Box>
                        <Typography sx={{ color: tokenWarning.main, fontSize: '1rem', fontWeight: 700, lineHeight: 1.05 }}>
                          Stock Alerts
                        </Typography>
                        <Typography sx={{ color: tokenText.secondary, fontSize: '0.75rem', fontWeight: 500, letterSpacing: '0.05em', mt: 0.25, display: 'block', textTransform: 'uppercase' }}>
                          Out of stock & low stock
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7 }}>
                      <Chip
                        label={`${inventoryAlertCounts.lowStock} Low`}
                        size="small"
                        sx={{ color: tokenWarning.dark, bgcolor: tokenWarning.softBg, border: `1px solid ${tokenWarning.light}`, fontWeight: 700 }}
                      />
                      <Chip
                        label={`${inventoryAlertCounts.stockOut} Out`}
                        size="small"
                        sx={{ color: tokenError.dark, bgcolor: tokenError.softBg, border: `1px solid ${tokenError.light}`, fontWeight: 700 }}
                      />
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.45, pr: 0.35, overflowY: 'auto', maxHeight: 124 }}>
                    {inventoryDisplayAlerts.map((part) => (
                      <Paper
                        key={part.id}
                        elevation={0}
                        onClick={() => handleInventoryPartSelect(part.id)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            handleInventoryPartSelect(part.id);
                          }
                        }}
                        role="button"
                        tabIndex={0}
                        sx={{
                          px: 1.2,
                          py: 1,
                          borderRadius: '8px',
                          border: `1px solid ${part.alertState === 'out-of-stock' ? tokenError.light : tokenWarning.light}`,
                          display: 'grid',
                          gridTemplateColumns: { xs: 'minmax(0, 1fr) auto', md: 'minmax(0, 1.4fr) auto auto' },
                          alignItems: 'center',
                          gap: 1,
                          bgcolor: part.alertState === 'out-of-stock' ? tokenError.softBg : tokenWarning.softBg,
                          cursor: 'pointer',
                          transition: 'border-color 0.16s ease, background-color 0.16s ease',
                          '&:hover': {
                            borderColor: part.alertState === 'out-of-stock' ? tokenError.main : tokenWarning.main,
                            bgcolor: part.alertState === 'out-of-stock' ? tokenError.selectedBg : tokenWarning.selectedBg,
                          },
                          '&:focus-visible': {
                            outline: `2px solid ${tokenBrand.main}`,
                            outlineOffset: 2,
                          },
                        }}
                      >
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="body2" sx={{ color: tokenText.primary, fontWeight: 700, lineHeight: 1.15 }}>
                            {part.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: tokenText.secondary, fontWeight: 500, lineHeight: 1.15, display: 'block' }}>
                            {part.sapNumber} · Bin {part.binLocation}
                          </Typography>
                        </Box>
                        <Chip
                          size="small"
                          label={part.alertLabel}
                          sx={{
                            color: part.alertStyle.tone,
                            bgcolor: part.alertStyle.bg,
                            border: `1px solid ${part.alertStyle.border}`,
                            fontWeight: 700,
                            height: 22,
                            '& .MuiChip-label': { px: 0.75, fontSize: 11 },
                          }}
                        />
                        <Box sx={{ px: 0.7, py: 0.18, borderRadius: '4px', bgcolor: part.alertState === 'out-of-stock' ? tokenError.main : tokenWarning.main, color: '#FFFFFF', fontSize: '0.75rem', fontWeight: 700, lineHeight: 1.35 }}>
                          {part.availableStock} / {part.safetyStock}
                        </Box>
                      </Paper>
                    ))}
                  </Box>
                </Paper>
              </Grid>
            </Grid>

            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: '12px',
                border: `1px solid ${tokenDivider}`,
                bgcolor: 'background.paper',
              }}
            >
              <Box sx={{ overflowX: 'auto' }}>
                <Box sx={{ minWidth: 1060, display: 'flex', flexDirection: 'column' }}>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: 'minmax(220px, 1.3fr) 150px minmax(240px, 1.35fr) 150px minmax(210px, 1fr) 130px',
                      gap: 1.2,
                      px: 1.35,
                      py: 1,
                      borderBottom: `1px solid ${tokenDivider}`,
                      color: tokenText.secondary,
                    }}
                  >
                    {['Name', 'Part number', 'Equipment', 'Category', 'Stock levels', 'Location'].map((column) => (
                      <Typography key={column} sx={{ fontSize: 13, fontWeight: 500 }}>
                        {column}
                      </Typography>
                    ))}
                  </Box>
                  {filteredInventoryParts.map((part) => {
                    const isSelected = selectedInventoryPartId === part.id;

                    return (
                      <Box
                        key={part.id}
                        onClick={() => handleInventoryPartSelect(part.id)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            handleInventoryPartSelect(part.id);
                          }
                        }}
                        role="button"
                        tabIndex={0}
                        sx={{
                          px: 1.35,
                          py: 1.05,
                          borderBottom: `1px solid ${tokenDivider}`,
                          borderLeft: `5px solid ${part.style.accent}`,
                          bgcolor: isSelected ? tokenBrand.selectedBg : 'transparent',
                          display: 'grid',
                          gridTemplateColumns: 'minmax(220px, 1.3fr) 150px minmax(240px, 1.35fr) 150px minmax(210px, 1fr) 130px',
                          gap: 1.2,
                          alignItems: 'center',
                          cursor: 'pointer',
                          transition: 'background-color 0.16s ease, box-shadow 0.16s ease',
                          '&:hover': {
                            bgcolor: tokenBrand.softBg,
                          },
                          '&:focus-visible': {
                            outline: `2px solid ${tokenBrand.main}`,
                            outlineOffset: -2,
                          },
                        }}
                      >
                        <Box sx={{ minWidth: 0, display: 'flex', alignItems: 'center', gap: 0.9 }}>
                          {part.photoSrc ? (
                            <Box
                              component="img"
                              src={part.photoSrc}
                              alt={`${part.name} photo`}
                              sx={{
                                width: 38,
                                height: 38,
                                flexShrink: 0,
                                objectFit: 'contain',
                                borderRadius: '4px',
                                border: `1px solid ${tokenDivider}`,
                                bgcolor: 'background.default',
                              }}
                            />
                          ) : null}
                          <Box sx={{ minWidth: 0 }}>
                            <Typography sx={{ color: tokenText.primary, fontWeight: 700, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {part.name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: tokenText.secondary, fontWeight: 500 }}>
                              {part.condition}
                            </Typography>
                          </Box>
                        </Box>
                        <Typography sx={{ color: tokenText.primary, fontSize: 13.5, fontWeight: 700 }}>
                          {part.sapNumber}
                        </Typography>
                        <Typography sx={{ color: tokenText.secondary, fontSize: 13.5, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {part.usedIn.map((equipment) => equipment.name).join(', ')}
                        </Typography>
                        <Chip
                          label={part.category}
                          size="small"
                          sx={{ justifySelf: 'flex-start', color: tokenBrand.main, bgcolor: tokenBrand.softBg, borderColor: tokenDivider, fontWeight: 700 }}
                        />
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7, minWidth: 0, flexWrap: 'wrap' }}>
                          <Chip
                            label={part.style.label}
                            size="small"
                            sx={{
                              color: part.style.tone,
                              bgcolor: part.style.bg,
                              border: `1px solid ${part.style.border}`,
                              fontWeight: 700,
                              height: 24,
                            }}
                          />
                          <Typography sx={{ color: tokenText.primary, fontSize: 13, fontWeight: 700 }}>
                            {part.availableStock} available
                          </Typography>
                          <Typography sx={{ color: tokenText.secondary, fontSize: 12.5, fontWeight: 500 }}>
                            {part.currentStock} stock / {part.safetyStock} safety
                          </Typography>
                        </Box>
                        <Typography sx={{ color: tokenText.primary, fontSize: 13.5, fontWeight: 700 }}>
                          {part.binLocation}
                        </Typography>
                      </Box>
                    );
                  })}

                </Box>

                {!filteredInventoryParts.length ? (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2.2,
                      borderRadius: '8px',
                      border: `1px dashed ${tokenDivider}`,
                      bgcolor: 'background.paper',
                      textAlign: 'center',
                    }}
                  >
                    <Typography sx={{ color: tokenText.primary, fontWeight: 700, mb: 0.4 }}>
                      No parts match the current filters
                    </Typography>
                    <Typography sx={{ color: tokenText.secondary, fontWeight: 500 }}>
                      Try another category, equipment, stock level, or clear the search field to see the full inventory list.
                    </Typography>
                  </Paper>
                ) : null}
              </Box>
            </Paper>

            <InventoryPartDrawer
              part={selectedInventoryPart}
              open={Boolean(selectedInventoryPart)}
              onClose={() => setSelectedInventoryPartId(null)}
              purchaseRequested={selectedInventoryPart ? requestedPurchasePartIds.includes(selectedInventoryPart.id) : false}
              onRequestPurchase={handlePurchaseRequest}
            />
          </>
        ) : null}

        {activeView === 'work-orders' ? (
          <>

            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: '12px',
                border: `1px solid ${tokenDivider}`,
                bgcolor: 'background.paper',
                mb: 2,
              }}
            >
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(280px, 1.15fr) minmax(160px, 0.55fr) minmax(160px, 0.55fr) minmax(210px, 0.75fr) auto' }, gap: 1.2, alignItems: 'center' }}>
                <TextField
                  id="input-work-orders-search"
                  size="small"
                  label="Search"
                  value={workOrderSearch}
                  onChange={(event) => setWorkOrderSearch(event.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      bgcolor: 'background.paper',
                    },
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <SearchIcon sx={{ fontSize: 20, color: tokenText.secondary }} />
                      </InputAdornment>
                    ),
                  }}
                />
                <FormControl size="small">
                  <InputLabel sx={{ color: tokenText.secondary, fontWeight: 500 }}>Type</InputLabel>
                  <Select
                    label="Type"
                    value={workOrderTypeFilter}
                    onChange={(event) => setWorkOrderTypeFilter(event.target.value as 'all' | WorkOrderMaintenanceType)}
                    sx={{ borderRadius: '12px', bgcolor: 'background.default', fontWeight: 500 }}
                    onMouseDown={handleSelectMenuMouseDown}
                    onClose={handleSelectMenuClose}
                    MenuProps={selectMenuProps}
                  >
                    <MenuItem value="all">All types</MenuItem>
                    {workOrderMaintenanceTypes.map((type) => (
                      <MenuItem key={type} value={type}>{workOrderTypeStyles[type].label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small">
                  <InputLabel sx={{ color: tokenText.secondary, fontWeight: 500 }}>State</InputLabel>
                  <Select
                    label="State"
                    value={workOrderStateFilter}
                    onChange={(event) => setWorkOrderStateFilter(event.target.value as 'all' | WorkOrderStatus)}
                    sx={{ borderRadius: '12px', bgcolor: 'background.default', fontWeight: 500 }}
                    onMouseDown={handleSelectMenuMouseDown}
                    onClose={handleSelectMenuClose}
                    MenuProps={selectMenuProps}
                  >
                    <MenuItem value="all">All states</MenuItem>
                    {workOrderStatuses.map((state) => (
                      <MenuItem key={state} value={state}>{state}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small">
                  <InputLabel sx={{ color: tokenText.secondary, fontWeight: 500 }}>Package Status</InputLabel>
                  <Select
                    label="Package Status"
                    value={workOrderPackageFilter}
                    onChange={(event) => setWorkOrderPackageFilter(event.target.value as WorkOrderPackageFilter)}
                    sx={{ borderRadius: '12px', bgcolor: 'background.default', fontWeight: 500 }}
                    onMouseDown={handleSelectMenuMouseDown}
                    onClose={handleSelectMenuClose}
                    MenuProps={selectMenuProps}
                  >
                    {workOrderPackageFilters.map((filter) => (
                      <MenuItem key={filter.value} value={filter.value}>{filter.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Box sx={{ justifySelf: { xs: 'stretch', lg: 'end' }, display: 'flex', alignItems: 'center', justifyContent: { xs: 'space-between', sm: 'flex-end' }, gap: 0.8, flexWrap: 'wrap' }}>
                  <ToggleButtonGroup
                    size="small"
                    exclusive
                    value={workOrderViewMode}
                    onChange={(_, value) => value && setWorkOrderViewMode(value)}
                    sx={{
                      bgcolor: 'background.default',
                      '& .MuiToggleButton-root': {
                        px: 1.5,
                        borderColor: tokenDivider,
                        color: tokenText.secondary,
                        fontWeight: 500,
                        textTransform: 'none',
                      },
                      '& .Mui-selected': {
                        color: tokenBrand.main,
                        bgcolor: tokenBrand.selectedBg,
                      },
                    }}
                  >
                    <ToggleButton value="board" aria-label="Board view">
                      <Tooltip title="Board">
                        <WorkOrderBoardIcon sx={{ fontSize: 18 }} />
                      </Tooltip>
                    </ToggleButton>
                    <ToggleButton value="list" aria-label="List view">
                      <Tooltip title="List">
                        <WorkOrderListIcon sx={{ fontSize: 18 }} />
                      </Tooltip>
                    </ToggleButton>
                  </ToggleButtonGroup>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setIsCreateWorkOrderOpen(true)}
                    sx={{
                      minWidth: 132,
                      borderRadius: '8px',
                      bgcolor: tokenBrand.main,
                      color: '#FFFFFF',
                      boxShadow: 'none',
                      fontWeight: 700,
                      textTransform: 'none',
                      '&:hover': { bgcolor: tokenBrand.dark, boxShadow: 'none' },
                    }}
                  >
                    Create WO
                  </Button>
                </Box>
              </Box>
            </Paper>
            <Grid container spacing={2} sx={{ mb: 3 }} alignItems="stretch">
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: '12px',
                    border: `1px solid ${tokenDivider}`,
                    bgcolor: 'background.paper',
                    minHeight: 192,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.4, mb: 1.8 }}>
                    <Box
                      sx={{
                        width: 42,
                        height: 42,
                        borderRadius: '8px',
                        display: 'grid',
                        placeItems: 'center',
                        bgcolor: tokenBrand.softBg,
                        color: tokenBrand.main,
                      }}
                    >
                      <InventoryDrawerIcon sx={{ fontSize: 21 }} />
                    </Box>
                    <Box>
                      <Typography sx={{ color: tokenBrand.main, fontSize: '1rem', fontWeight: 700, lineHeight: 1.05 }}>
                        Package Summary
                      </Typography>
                      <Typography sx={{ color: tokenText.secondary, fontSize: '0.75rem', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase', mt: 0.25, display: 'block' }}>
                        Work Order readiness
                      </Typography>
                    </Box>
                  </Box>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(104px, 1fr))',
                      gap: 1.2,
                      my: 1.8,
                      minWidth: 0,
                    }}
                  >
                    {workOrderPackageStatusSummary.map((item) => {
                      const isActivePackageSummary = workOrderPackageFilter === item.filter;

                      return (
                        <Box
                          key={item.label}
                          onClick={() => setWorkOrderPackageFilter(isActivePackageSummary ? 'all' : item.filter)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault();
                              setWorkOrderPackageFilter(isActivePackageSummary ? 'all' : item.filter);
                            }
                          }}
                          role="button"
                          tabIndex={0}
                          sx={{
                            minWidth: 0,
                            textAlign: 'left',
                            border: `1px solid ${isActivePackageSummary ? tokenBrand.main : tokenDivider}`,
                            borderRadius: '8px',
                            bgcolor: isActivePackageSummary ? tokenBrand.selectedBg : 'background.default',
                            px: 1.2,
                            py: 1,
                            cursor: 'pointer',
                            transition: 'border-color 0.16s ease, background-color 0.16s ease',
                            '&:hover': {
                              borderColor: tokenBrand.light,
                              bgcolor: tokenBrand.softBg,
                            },
                            '&:focus-visible': { outline: `2px solid ${tokenBrand.main}`, outlineOffset: 2 },
                          }}
                        >
                          <Typography sx={{ color: tokenText.primary, fontSize: 'clamp(1.25rem, 2.2vw, 1.75rem)', fontWeight: 700, lineHeight: 1.12 }}>
                            {item.value}
                          </Typography>
                          <Typography variant="caption" sx={{ color: tokenText.secondary, fontWeight: 500, textTransform: 'uppercase', display: 'block', mt: 0.5, lineHeight: 1.2, overflowWrap: 'anywhere' }}>
                            {item.label}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                  <Typography variant="caption" sx={{ color: tokenText.secondary, fontWeight: 500, textAlign: 'right', display: 'block', overflowWrap: 'anywhere' }}>
                    {visibleWorkOrders.length} matching Work Orders
                  </Typography>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: '12px',
                    border: `1px solid ${tokenDivider}`,
                    bgcolor: 'background.paper',
                    minHeight: 192,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, gap: 1, flexWrap: 'wrap' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.4 }}>
                      <Box
                        sx={{
                          width: 42,
                          height: 42,
                          borderRadius: '8px',
                          display: 'grid',
                          placeItems: 'center',
                          bgcolor: tokenWarning.softBg,
                          color: tokenWarning.main,
                          flexShrink: 0,
                        }}
                      >
                        <WarningIcon sx={{ fontSize: 20 }} />
                      </Box>
                      <Box>
                        <Typography sx={{ color: tokenWarning.main, fontSize: '1rem', fontWeight: 700, lineHeight: 1.05 }}>
                          Missing Parts Requests
                        </Typography>
                        <Typography sx={{ color: tokenText.secondary, fontSize: '0.75rem', fontWeight: 500, display: 'block', mt: 0.25 }}>
                          Parts requested for WOs but not currently available
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7, flexWrap: 'wrap' }}>
                      <Chip
                        label={`${missingPartRequestSummary.requests} Requests`}
                        size="small"
                        sx={{ color: tokenWarning.dark, bgcolor: tokenWarning.softBg, border: `1px solid ${tokenWarning.light}`, fontWeight: 700 }}
                      />
                      <Chip
                        label={`${missingPartRequestSummary.units} Missing`}
                        size="small"
                        sx={{ color: tokenError.dark, bgcolor: tokenError.softBg, border: `1px solid ${tokenError.light}`, fontWeight: 700 }}
                      />
                    </Box>
                  </Box>

                  {missingPartRequestAlerts.length ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, pr: 0.35, overflowY: 'auto', maxHeight: 174 }}>
                      {missingPartRequestAlerts.map((alert) => (
                        <Paper
                          key={alert.id}
                          elevation={0}
                          onClick={() => handleMissingPartAlertOpen(alert.id)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault();
                              handleMissingPartAlertOpen(alert.id);
                            }
                          }}
                          role="button"
                          tabIndex={0}
                          sx={{
                            px: 1.2,
                            py: 1,
                            borderRadius: '8px',
                            border: `1px solid ${tokenDivider}`,
                            borderLeft: `4px solid ${tokenWarning.main}`,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 0.65,
                            bgcolor: 'background.paper',
                            cursor: 'pointer',
                            transition: 'border-color 0.16s ease, background-color 0.16s ease',
                            '&:hover': {
                              borderColor: tokenWarning.main,
                              bgcolor: tokenWarning.softBg,
                            },
                            '&:focus-visible': {
                              outline: `2px solid ${tokenBrand.main}`,
                              outlineOffset: 2,
                            },
                          }}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
                            <Box sx={{ minWidth: 0, flex: 1 }}>
                              <Typography sx={{ color: tokenText.primary, fontSize: 13.5, fontWeight: 700, lineHeight: 1.15, overflowWrap: 'anywhere' }}>
                                {alert.description}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 0.45, alignItems: 'center', flexShrink: 0 }}>
                              <Chip
                                size="small"
                                label={`${alert.shortageQuantity} missing`}
                                sx={{
                                  color: tokenError.dark,
                                  bgcolor: tokenError.softBg,
                                  border: `1px solid ${tokenError.light}`,
                                  fontWeight: 700,
                                  height: 22,
                                  '& .MuiChip-label': { px: 0.75, fontSize: 11 },
                                }}
                              />
                              <Chip
                                size="small"
                                label={alert.priorityLabel}
                                sx={{
                                  color: alert.priorityLabel === 'Emergency' ? tokenError.dark : alert.priorityLabel === 'High' ? tokenWarning.dark : tokenText.secondary,
                                  bgcolor: alert.priorityLabel === 'Emergency' ? tokenError.softBg : alert.priorityLabel === 'High' ? tokenWarning.softBg : tokenNeutral.lighter,
                                  border: `1px solid ${alert.priorityLabel === 'Emergency' ? tokenError.light : alert.priorityLabel === 'High' ? tokenWarning.light : tokenDivider}`,
                                  fontWeight: 700,
                                  height: 22,
                                  '& .MuiChip-label': { px: 0.75, fontSize: 11 },
                                }}
                              />
                            </Box>
                          </Box>

                          <Typography sx={{ color: tokenText.secondary, fontSize: 12.2, fontWeight: 500, lineHeight: 1.18 }} noWrap>
                            {alert.workOrderId} - {alert.equipment}
                          </Typography>

                          <Typography sx={{ color: tokenText.secondary, fontSize: 12, fontWeight: 500, lineHeight: 1.25 }} noWrap>
                            {alert.requiredBy || 'Not scheduled'} - {alert.requestedBy}{alert.location ? ` - Bin ${alert.location}` : ''}
                          </Typography>

                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.45, minWidth: 0 }}>
                            <Typography sx={{ color: tokenText.secondary, fontSize: 12, fontWeight: 500, flexShrink: 0 }}>
                              Suggested:
                            </Typography>
                            <Typography sx={{ color: tokenText.primary, fontSize: 12.2, fontWeight: 700, lineHeight: 1.2, minWidth: 0 }} noWrap>
                              {alert.suggestedAction}
                            </Typography>
                            <ChevronRightIcon sx={{ color: tokenText.secondary, fontSize: 16, ml: 'auto', flexShrink: 0 }} />
                          </Box>
                        </Paper>
                      ))}
                    </Box>
                  ) : (
                    <Paper
                      elevation={0}
                      sx={{
                        px: 1.5,
                        py: 1.2,
                        borderRadius: '8px',
                        border: `1px solid ${tokenBrand.light}`,
                        bgcolor: tokenBrand.softBg,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <CheckCircleIcon sx={{ fontSize: 18, color: tokenBrand.main }} />
                      <Typography variant="body2" sx={{ color: tokenText.primary, fontWeight: 700 }}>
                        All missing part requests have been handled.
                      </Typography>
                    </Paper>
                  )}
                </Paper>
              </Grid>
            </Grid>

            {workOrderViewMode === 'board' ? (

              <Box sx={{ overflowX: 'auto', pb: 0.5 }}>
                <Box sx={{ display: 'flex', gap: 0.8, alignItems: 'stretch', minWidth: { xs: 1180, xl: 0 } }}>
                  {workOrderBoardColumnsData.map((column) => (
                    workOrderLaneExpanded[column.key] ? (
                      <WorkOrderBoardColumn
                        key={column.key}
                        title={column.title}
                        helper={column.helper}
                        workOrders={column.workOrders}
                        selectedWorkOrderId={selectedWorkOrderId}
                        stockSnapshotsById={workOrderStockSnapshotsById}
                        onOpenWorkOrder={openFollowUpWorkOrderDrawer}
                        onCollapse={() => setWorkOrderLaneExpanded((current) => ({ ...current, [column.key]: false }))}
                      />
                    ) : (
                      <CollapsedWorkOrderBoardColumn
                        key={column.key}
                        title={column.title}
                        count={column.workOrders.length}
                        onExpand={() => setWorkOrderLaneExpanded((current) => ({ ...current, [column.key]: true }))}
                      />
                    )
                  ))}
                </Box>
                {!visibleWorkOrders.length ? (
                  <Paper elevation={0} sx={{ mt: 1.2, p: 2.2, borderRadius: '8px', border: `1px dashed ${tokenDivider}`, bgcolor: 'background.paper', textAlign: 'center' }}>
                    <Typography sx={{ color: tokenText.primary, fontWeight: 700, mb: 0.4 }}>
                      No open Work Orders match the current filters
                    </Typography>
                    <Typography sx={{ color: tokenText.secondary, fontWeight: 500 }}>
                      Clear the search or adjust type, state, and package filters to see the full board.
                    </Typography>
                  </Paper>
                ) : null}
              </Box>
            ) : (
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: '12px',
                  border: `1px solid ${tokenDivider}`,
                  bgcolor: 'background.paper',
                }}
              >
                <Box sx={{ overflowX: 'auto' }}>
                  <Box sx={{ minWidth: 1180, display: 'flex', flexDirection: 'column' }}>
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: '140px minmax(210px, 1.15fr) minmax(150px, 0.8fr) 130px 130px minmax(170px, 0.85fr) minmax(220px, 1fr)',
                        gap: 1.2,
                        px: 1.35,
                        py: 1,
                        borderBottom: `1px solid ${tokenDivider}`,
                        color: tokenText.secondary,
                      }}
                    >
                      {['WO number', 'Equipment', 'Assignee', 'Type', 'State', 'Date / Shift', 'Package status'].map((column) => (
                        <Typography key={column} sx={{ fontSize: 13, fontWeight: 500 }}>
                          {column}
                        </Typography>
                      ))}
                    </Box>
                    {visibleWorkOrders.length ? (
                      visibleWorkOrders.map((workOrder) => {
                        const typeStyle = workOrderTypeStyles[workOrder.maintenanceType];
                        const stateStyle = workOrderStateStyles[workOrder.status];
                        const packageStatus = getWorkOrderPackageStatus(workOrder);
                        const isSelected = selectedWorkOrderId === workOrder.id;
                        const isPlanning = workOrder.status === 'planning';
                        const dateShiftLabel = getWorkOrderDateShiftLabel(workOrder);

                        return (
                          <Box
                            key={workOrder.id}
                            onClick={() => openFollowUpWorkOrderDrawer(workOrder.id)}
                            onKeyDown={(event) => {
                              if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault();
                                openFollowUpWorkOrderDrawer(workOrder.id);
                              }
                            }}
                            role="button"
                            tabIndex={0}
                            sx={{
                              px: 1.35,
                              py: 1.05,
                              borderBottom: `1px solid ${tokenDivider}`,
                              borderLeft: `5px solid ${typeStyle.accent}`,
                              bgcolor: isSelected ? tokenBrand.selectedBg : 'transparent',
                              display: 'grid',
                              gridTemplateColumns: '140px minmax(210px, 1.15fr) minmax(150px, 0.8fr) 130px 130px minmax(170px, 0.85fr) minmax(220px, 1fr)',
                              alignItems: 'center',
                              gap: 1.2,
                              cursor: 'pointer',
                              transition: 'background-color 0.16s ease',
                              '&:hover': { bgcolor: tokenBrand.softBg },
                              '&:focus-visible': { outline: `2px solid ${tokenBrand.main}`, outlineOffset: -2 },
                            }}
                          >
                            <Typography sx={{ color: tokenText.primary, fontSize: 13.5, fontWeight: 700 }} noWrap>
                              {workOrder.id}
                            </Typography>
                            <Box sx={{ minWidth: 0 }}>
                              <Typography sx={{ color: tokenText.primary, fontSize: 13.5, fontWeight: 700, lineHeight: 1.2 }} noWrap>
                                {workOrder.equipment}
                              </Typography>
                            </Box>
                            <Typography sx={{ color: tokenText.primary, fontSize: 13.5, fontWeight: 700 }} noWrap>
                              {isPlanning ? '' : workOrder.assignee}
                            </Typography>
                            <Chip label={typeStyle.label} size="small" sx={{ justifySelf: { xs: 'flex-start', lg: 'stretch' }, bgcolor: typeStyle.bg, color: typeStyle.tone, border: `1px solid ${typeStyle.border}`, fontWeight: 700 }} />
                            <Chip label={workOrder.status} size="small" sx={{ justifySelf: { xs: 'flex-start', lg: 'stretch' }, color: stateStyle.tone, bgcolor: stateStyle.bg, border: `1px solid ${stateStyle.border}`, fontWeight: 700 }} />
                            <Typography sx={{ color: workOrder.maintenanceType === 'breakdown' ? tokenError.main : tokenText.primary, fontSize: 13.5, fontWeight: 700 }} noWrap>
                              {dateShiftLabel}
                            </Typography>
                            <Chip
                              icon={<InventoryDrawerIcon sx={{ fontSize: 16 }} />}
                              label={packageStatus.label}
                              size="small"
                              sx={{
                                justifySelf: { xs: 'flex-start', lg: 'stretch' },
                                color: packageStatus.tone,
                                bgcolor: packageStatus.bg,
                                border: `1px solid ${packageStatus.border}`,
                                fontWeight: 700,
                                '& .MuiChip-icon': { color: packageStatus.tone },
                                '& .MuiChip-label': { overflow: 'visible', textOverflow: 'clip' },
                              }}
                            />
                          </Box>
                        );
                      })
                    ) : (
                      <Paper elevation={0} sx={{ p: 2.2, borderRadius: '8px', border: `1px dashed ${tokenDivider}`, bgcolor: 'background.paper', textAlign: 'center' }}>
                        <Typography sx={{ color: tokenText.primary, fontWeight: 700, mb: 0.4 }}>
                          No open Work Orders match the current filters
                        </Typography>
                        <Typography sx={{ color: tokenText.secondary, fontWeight: 500 }}>
                          Clear the search or adjust type and state filters to see the full open WO list.
                        </Typography>
                      </Paper>
                    )}
                  </Box>
                </Box>
              </Paper>
            )}
            <CreateWorkOrderDrawer
              open={isCreateWorkOrderOpen}
              onClose={() => setIsCreateWorkOrderOpen(false)}
              onSubmit={handleCreateWorkOrder}
            />

            <MissingPartRequestDrawer
              request={activeMissingPartRequest}
              open={Boolean(activeMissingPartRequest)}
              onClose={() => setActiveMissingPartRequestId(null)}
              onSaveResolution={(requestId) => handleMissingPartRequested(requestId)}
              onMarkResolved={(requestId) => handleMissingPartRequested(requestId)}
            />

            <FollowUpWorkOrderDrawer
              open={Boolean(followUpWorkOrderDraft)}
              activeTab={followUpWorkOrderTab}
              initialDraft={followUpWorkOrderDraft}
              initialExpandedSections={sparePartsFocusedExecutionSections}
              onTabChange={setFollowUpWorkOrderTab}
              onClose={closeFollowUpWorkOrderDrawer}
              onSelectedSparePartsChange={handleFollowUpSparePartsChange}
            />
          </>
        ) : null}

        {activeView === 'purchase-orders' ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Scan Material Panel */}
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: '12px',
                border: `1px solid ${tokenDivider}`,
                bgcolor: 'background.paper',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <BarcodeIcon sx={{ color: tokenBrand.main, fontSize: 20 }} />
                <Typography sx={{ color: tokenText.primary, fontWeight: 700, fontSize: 14 }}>
                  Scan Material
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
                <Button
                  variant="contained"
                  onClick={() => {
                    setIsBarcodeModalOpen(true);
                    setScannedBarcodeText('');
                    setBarcodeAlert(null);
                  }}
                  startIcon={<BarcodeIcon sx={{ fontSize: 18 }} />}
                  sx={{
                    borderRadius: '8px',
                    bgcolor: tokenBrand.main,
                    color: '#FFFFFF',
                    boxShadow: 'none',
                    fontWeight: 700,
                    textTransform: 'none',
                    '&:hover': { bgcolor: tokenBrand.dark, boxShadow: 'none' },
                  }}
                  id="btn-scan-barcode"
                >
                  Scan Barcode
                </Button>
                <TextField
                  id="input-po-search"
                  size="small"
                  label="Search"
                  value={poSearch}
                  onChange={(e) => setPoSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleBarcodeSubmit(poSearch);
                    }
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => handleBarcodeSubmit(poSearch)}
                          edge="end"
                          size="small"
                          aria-label="Search"
                          sx={{ color: tokenText.secondary }}
                        >
                          <SearchIcon sx={{ fontSize: 20 }} />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    flexGrow: 1,
                    minWidth: 260,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      bgcolor: 'background.paper',
                    },
                  }}
                />
              </Box>
            </Paper>

            {/* Grid for Columns */}
            <Grid container spacing={2} alignItems="flex-start">
              {/* Pending Column */}
              <Grid
                size={{
                  xs: 12,
                  md: pendingColumnCollapsed ? 1 : (receivedColumnCollapsed ? 11 : 6),
                }}
                sx={{ transition: 'all 0.3s ease' }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: pendingColumnCollapsed ? 1 : 2,
                    borderRadius: '12px',
                    border: `1px solid ${tokenDivider}`,
                    bgcolor: 'background.default',
                    minHeight: 320,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.5,
                    overflow: 'hidden',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'nowrap' }}>
                    {!pendingColumnCollapsed ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ClockIcon sx={{ color: tokenWarning.main, fontSize: 18 }} />
                        <Typography sx={{ color: tokenText.primary, fontWeight: 700, fontSize: 14 }}>
                          Pending
                        </Typography>
                      </Box>
                    ) : (
                      <Tooltip title="Expand Pending Column">
                        <IconButton size="small" onClick={() => setPendingColumnCollapsed(false)} sx={{ mx: 'auto' }}>
                          <ClockIcon sx={{ color: tokenWarning.main, fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>
                    )}

                    {!pendingColumnCollapsed && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={`${pendingPos.length}`}
                          size="small"
                          sx={{
                            bgcolor: 'background.paper',
                            color: tokenText.secondary,
                            border: `1px solid ${tokenDivider}`,
                            fontWeight: 700,
                            height: 20,
                          }}
                        />
                        <IconButton size="small" onClick={() => setPendingColumnCollapsed(true)} sx={{ p: 0.2 }}>
                          <ChevronLeftIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Box>
                    )}

                    {pendingColumnCollapsed && (
                      <IconButton size="small" onClick={() => setPendingColumnCollapsed(false)} sx={{ p: 0.2, mx: 'auto', mt: 1 }}>
                        <ChevronRightIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    )}
                  </Box>

                  {!pendingColumnCollapsed && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      {pendingPos.length > 0 ? (
                        pendingPos.map((po) => renderPoCard(po))
                      ) : (
                        <Paper elevation={0} sx={{ p: 3, textAlign: 'center', border: `1px dashed ${tokenDivider}`, bgcolor: 'background.paper', borderRadius: '8px' }}>
                          <Typography sx={{ color: tokenText.secondary, fontWeight: 500 }}>
                            No pending purchase orders found.
                          </Typography>
                        </Paper>
                      )}
                    </Box>
                  )}
                </Paper>
              </Grid>

              {/* Received Column */}
              <Grid
                size={{
                  xs: 12,
                  md: receivedColumnCollapsed ? 1 : (pendingColumnCollapsed ? 11 : 6),
                }}
                sx={{ transition: 'all 0.3s ease' }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: receivedColumnCollapsed ? 1 : 2,
                    borderRadius: '12px',
                    border: `1px solid ${tokenDivider}`,
                    bgcolor: 'background.default',
                    minHeight: 320,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.5,
                    overflow: 'hidden',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'nowrap' }}>
                    {!receivedColumnCollapsed ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircleIcon sx={{ color: tokenBrand.main, fontSize: 18 }} />
                        <Typography sx={{ color: tokenText.primary, fontWeight: 700, fontSize: 14 }}>
                          Received
                        </Typography>
                      </Box>
                    ) : (
                      <Tooltip title="Expand Received Column">
                        <IconButton size="small" onClick={() => setReceivedColumnCollapsed(false)} sx={{ mx: 'auto' }}>
                          <CheckCircleIcon sx={{ color: tokenBrand.main, fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>
                    )}

                    {!receivedColumnCollapsed && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={`${completedPos.length}`}
                          size="small"
                          sx={{
                            bgcolor: 'background.paper',
                            color: tokenText.secondary,
                            border: `1px solid ${tokenDivider}`,
                            fontWeight: 700,
                            height: 20,
                          }}
                        />
                        <IconButton size="small" onClick={() => setReceivedColumnCollapsed(true)} sx={{ p: 0.2 }}>
                          <ChevronLeftIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Box>
                    )}

                    {receivedColumnCollapsed && (
                      <IconButton size="small" onClick={() => setReceivedColumnCollapsed(false)} sx={{ p: 0.2, mx: 'auto', mt: 1 }}>
                        <ChevronRightIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    )}
                  </Box>

                  {!receivedColumnCollapsed && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      {completedPos.length > 0 ? (
                        completedPos.map((po) => renderPoCard(po))
                      ) : (
                        <Paper elevation={0} sx={{ p: 3, textAlign: 'center', border: `1px dashed ${tokenDivider}`, bgcolor: 'background.paper', borderRadius: '8px' }}>
                          <Typography sx={{ color: tokenText.secondary, fontWeight: 500 }}>
                            No received purchase orders found.
                          </Typography>
                        </Paper>
                      )}
                    </Box>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </Box>
        ) : null}

        {activeView === 'history-consumption' ? (
          <>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: '12px',
                border: `1px solid ${tokenDivider}`,
                bgcolor: 'background.paper',
                mb: 2,
              }}
            >
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(280px, 1.2fr) minmax(160px, 0.6fr) minmax(280px, 1fr) auto' }, gap: 1.2, alignItems: 'center' }}>
                <TextField
                  id="input-history-search"
                  size="small"
                  label="Search"
                  value={historySearch}
                  onChange={(event) => setHistorySearch(event.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      bgcolor: 'background.paper',
                    },
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <SearchIcon sx={{ fontSize: 20, color: tokenText.secondary }} />
                      </InputAdornment>
                    ),
                  }}
                />
                <Select
                  size="small"
                  value={historyTypeFilter}
                  onChange={(event) => setHistoryTypeFilter(event.target.value as 'all' | HistoryType)}
                  sx={{
                    borderRadius: '12px',
                    bgcolor: 'background.default',
                    fontWeight: 500,
                  }}
                  onMouseDown={handleSelectMenuMouseDown}
                  onClose={handleSelectMenuClose}
                  MenuProps={selectMenuProps}
                >
                  <MenuItem value="all">All types</MenuItem>
                  <MenuItem value="Pick-up">Pick-up</MenuItem>
                  <MenuItem value="Receipt">Receipt</MenuItem>
                  <MenuItem value="Return">Return</MenuItem>
                </Select>
                <Box
                  sx={{
                    minWidth: 0,
                    display: 'flex',
                    alignItems: 'center',
                    '& > .MuiBox-root': { flex: 1, minWidth: 0, mb: 0, mt: 0 },
                  }}
                >
                  <EquipmentSelector
                    value={consumptionEquipment}
                    onChange={(selection) => setConsumptionEquipment(selection)}
                    label="Equipment"
                    placeholder="All equipment"
                  />
                </Box>
                <Button
                  variant="text"
                  size="small"
                  disabled={!hasConsumptionFilters}
                  onClick={() => {
                    setHistorySearch('');
                    setHistoryTypeFilter('all');
                    setConsumptionEquipment(null);
                  }}
                  sx={{
                    justifySelf: { xs: 'flex-start', lg: 'end' },
                    color: tokenBrand.main,
                    fontWeight: 700,
                    textTransform: 'none',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Clear filters
                </Button>
              </Box>
            </Paper>

            <Grid container spacing={1.25} sx={{ mb: 1.5 }}>
              {[
                {
                  label: 'Total Consumed',
                  value: consumptionAnalyticsSummary.totalConsumed,
                  caption: consumptionEquipment ? 'Filtered by equipment' : 'All equipment',
                  tone: tokenText.primary,
                  border: tokenDivider,
                  bg: 'background.paper',
                  chip: consumptionEquipment ? 'Filtered' : '+5%',
                  chipTone: tokenBrand.main,
                  chipBg: tokenBrand.softBg,
                  chipBorder: tokenDivider,
                  clickable: true,
                },
                {
                  label: 'Cost per Unit',
                  value: inventoryCurrencyFormatter.format(consumptionAnalyticsSummary.costPerUnit),
                  caption: 'Average consumed part cost',
                  tone: tokenText.primary,
                  border: tokenDivider,
                  bg: 'background.paper',
                },
                {
                  label: 'Reorder Alerts',
                  value: consumptionAnalyticsSummary.reorderAlerts,
                  caption: 'Consumed at or above stock',
                  tone: tokenError.main,
                  border: tokenError.light,
                  bg: tokenError.softBg,
                  chip: consumptionEquipment ? 'Filtered' : '+2',
                  chipTone: tokenError.dark,
                  chipBg: tokenError.softBg,
                  chipBorder: tokenError.light,
                },
              ].map((item) => (
                <Grid key={item.label} size={{ xs: 12, md: 4 }}>
                  <Paper
                    elevation={0}
                    role={item.clickable ? 'button' : undefined}
                    tabIndex={item.clickable ? 0 : undefined}
                    onClick={item.clickable ? () => setIsConsumptionTrendOpen(true) : undefined}
                    onKeyDown={item.clickable ? (event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        setIsConsumptionTrendOpen(true);
                      }
                    } : undefined}
                    sx={{
                      p: 1.25,
                      borderRadius: '12px',
                      border: `1px solid ${item.border}`,
                      bgcolor: item.bg,
                      minHeight: 104,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      cursor: item.clickable ? 'pointer' : 'default',
                      transition: 'border-color 0.16s ease, background-color 0.16s ease',
                      ...(item.clickable
                        ? {
                          '&:hover': {
                            borderColor: tokenBrand.light,
                            bgcolor: tokenBrand.softBg,
                          },
                          '&:focus-visible': {
                            outline: `2px solid ${tokenBrand.main}`,
                            outlineOffset: 2,
                          },
                        }
                        : {}),
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="caption" sx={{ color: tokenText.secondary, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.68rem' }}>
                          {item.label}
                        </Typography>
                        <Typography sx={{ color: item.tone, fontSize: item.label === 'Cost per Unit' ? 'clamp(1.25rem, 2vw, 1.65rem)' : 'clamp(1.45rem, 2.4vw, 2rem)', fontWeight: 700, lineHeight: 1.05, mt: 0.45, overflowWrap: 'anywhere' }}>
                          {item.value}
                        </Typography>
                      </Box>
                      {item.chip ? (
                        <Chip
                          label={item.chip}
                          size="small"
                          sx={{ color: item.chipTone, bgcolor: item.chipBg, border: `1px solid ${item.chipBorder}`, fontWeight: 700 }}
                        />
                      ) : null}
                    </Box>
                    <Typography variant="caption" sx={{ color: tokenText.secondary, fontWeight: 500 }}>
                      {item.caption}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>

            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: '12px',
                border: `1px solid ${tokenDivider}`,
                bgcolor: 'background.paper',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1.2, flexWrap: 'wrap' }}>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="h6" sx={{ color: tokenText.primary, fontWeight: 700, lineHeight: 1.1 }}>
                    Consumption History
                  </Typography>
                  <Typography variant="caption" sx={{ color: tokenText.secondary, fontWeight: 500 }}>
                    {filteredHistoryRecords.length} matching records
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ overflowX: 'auto' }}>
                <Box sx={{ minWidth: 980, display: 'flex', flexDirection: 'column' }}>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: '120px 140px 160px 150px 170px minmax(240px, 1fr)',
                      gap: 1.2,
                      px: 1.35,
                      py: 1,
                      borderBottom: `1px solid ${tokenDivider}`,
                      color: tokenText.secondary,
                    }}
                  >
                    {['Date', 'Type', 'Items', 'Reference', 'Operator', 'Reason'].map((column) => (
                      <Typography key={column} sx={{ fontSize: 13, fontWeight: 500 }}>
                        {column}
                      </Typography>
                    ))}
                  </Box>

                  {filteredHistoryRecords.length ? (
                    filteredHistoryRecords.map((record) => {
                      let typeColor = tokenText.secondary;
                      let typeBg = tokenNeutral.lighter;
                      let typeBorder = tokenDivider;
                      let TypeIcon = ReturnIcon;

                      if (record.type === 'Pick-up') {
                        typeColor = tokenError.main;
                        typeBg = tokenError.softBg;
                        typeBorder = tokenError.light;
                        TypeIcon = PickUpIcon;
                      } else if (record.type === 'Receipt') {
                        typeColor = tokenBrand.main;
                        typeBg = tokenBrand.softBg;
                        typeBorder = tokenDivider;
                        TypeIcon = ReceiptIcon;
                      }

                      const isNegative = record.quantityChange < 0;
                      const changeColor = record.type === 'Return' ? tokenBrand.main : (isNegative ? tokenError.dark : tokenBrand.main);
                      const changeBg = record.type === 'Return' ? tokenBrand.softBg : (isNegative ? tokenError.softBg : tokenBrand.softBg);
                      const changeBorder = record.type === 'Return' ? tokenDivider : (isNegative ? tokenError.light : tokenDivider);

                      return (
                        <Box
                          key={record.id}
                          sx={{
                            display: 'grid',
                            gridTemplateColumns: '120px 140px 160px 150px 170px minmax(240px, 1fr)',
                            gap: 1.2,
                            px: 1.35,
                            py: 1.05,
                            alignItems: 'center',
                            borderBottom: `1px solid ${tokenDivider}`,
                            bgcolor: 'transparent',
                            transition: 'background-color 0.16s ease',
                            '&:hover': { bgcolor: tokenBrand.softBg },
                          }}
                        >
                          <Typography sx={{ color: tokenText.primary, fontSize: 13.5, fontWeight: 700 }}>
                            {record.date}
                          </Typography>
                          <Chip
                            icon={<TypeIcon sx={{ fontSize: 14, color: `${typeColor} !important` }} />}
                            label={record.type}
                            size="small"
                            sx={{ justifySelf: 'flex-start', color: typeColor, bgcolor: typeBg, border: `1px solid ${typeBorder}`, fontWeight: 700, height: 24, '& .MuiChip-label': { pl: 0.5 } }}
                          />
                          <Chip
                            label={`${record.itemText} / ${record.quantityChange > 0 ? '+' : ''}${record.quantityChange}`}
                            size="small"
                            sx={{ justifySelf: 'flex-start', color: changeColor, bgcolor: changeBg, border: `1px solid ${changeBorder}`, fontWeight: 700, height: 24 }}
                          />
                          <Chip
                            label={record.reference}
                            size="small"
                            variant="outlined"
                            onClick={() => {
                              if (record.reference.startsWith('PO-')) {
                                setActiveView('purchase-orders');
                                setPoSearch(record.reference);
                              } else {
                                setActiveView('work-orders');
                                setWorkOrderSearch(record.reference);
                              }
                            }}
                            sx={{ justifySelf: 'flex-start', color: tokenText.primary, borderColor: tokenDivider, fontWeight: 700, cursor: 'pointer', height: 24, '&:hover': { bgcolor: tokenNeutral.lighter, borderColor: tokenText.secondary } }}
                          />
                          <Typography sx={{ color: tokenText.primary, fontSize: 13.5, fontWeight: 700 }} noWrap>
                            {record.operator}
                          </Typography>
                          <Typography sx={{ color: tokenText.secondary, fontSize: 13.5, fontWeight: 500 }} noWrap>
                            {record.reason}
                          </Typography>
                        </Box>
                      );
                    })
                  ) : (
                    <Paper elevation={0} sx={{ p: 2.2, borderRadius: '8px', border: `1px dashed ${tokenDivider}`, bgcolor: 'background.paper', textAlign: 'center', mt: 1.2 }}>
                      <Typography sx={{ color: tokenText.primary, fontWeight: 700, mb: 0.4 }}>
                        No consumption records match the current filters
                      </Typography>
                      <Typography sx={{ color: tokenText.secondary, fontWeight: 500 }}>
                        Clear the search or adjust type and equipment filters to see the full history.
                      </Typography>
                    </Paper>
                  )}
                </Box>
              </Box>
            </Paper>
          </>
        ) : null}
        <Dialog
          open={isConsumptionTrendOpen}
          onClose={() => setIsConsumptionTrendOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: '12px',
              p: 1.5,
              bgcolor: 'background.paper',
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.2, px: 2, pt: 1.5, pb: 1, flexWrap: 'wrap' }}>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ color: tokenText.primary, fontWeight: 700, fontSize: 18, lineHeight: 1.15 }}>
                Consumed Parts Trend
              </Typography>
              <Typography variant="caption" sx={{ color: tokenText.secondary, fontWeight: 500 }}>
                {consumptionAnalyticsSummary.totalConsumed} parts consumed in the selected scope
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <ToggleButtonGroup
                exclusive
                size="small"
                value={consumptionTrendView}
                onChange={(_, nextView: ConsumptionTrendView | null) => {
                  if (nextView) setConsumptionTrendView(nextView);
                }}
                sx={{
                  bgcolor: 'background.default',
                  '& .MuiToggleButton-root': {
                    px: 1.5,
                    py: 0.45,
                    borderColor: tokenDivider,
                    color: tokenText.secondary,
                    fontSize: 12,
                    fontWeight: 500,
                    textTransform: 'none',
                    '&.Mui-selected': {
                      color: tokenBrand.main,
                      bgcolor: tokenBrand.selectedBg,
                    },
                  },
                }}
              >
                <ToggleButton value="all">All</ToggleButton>
                <ToggleButton value="equipment">per Equipment</ToggleButton>
                <ToggleButton value="part">per Part</ToggleButton>
              </ToggleButtonGroup>
              <IconButton onClick={() => setIsConsumptionTrendOpen(false)} size="small" sx={{ color: tokenText.secondary }}>
                <CloseIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Box>
          </Box>

          <DialogContent sx={{ p: 2, pt: 1, display: 'flex', flexDirection: 'column', gap: 1.4 }}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: '8px',
                border: `1px solid ${tokenDivider}`,
                bgcolor: 'background.paper',
              }}
            >
              <Box sx={{ height: 230, width: '100%', position: 'relative' }}>
                {(() => {
                  const chartWidth = 760;
                  const chartHeight = 190;
                  const leftPad = 34;
                  const rightPad = 18;
                  const topPad = 16;
                  const bottomPad = 38;
                  const plotWidth = chartWidth - leftPad - rightPad;
                  const plotHeight = chartHeight - topPad - bottomPad;
                  const points = consumptionTrendDetails.trend.map((point, index) => {
                    const x = leftPad + (consumptionTrendDetails.trend.length <= 1 ? plotWidth / 2 : (plotWidth * index) / (consumptionTrendDetails.trend.length - 1));
                    const y = topPad + plotHeight - (plotHeight * point.value) / consumptionTrendDetails.maxTrendValue;
                    return { ...point, x, y };
                  });
                  const pointPath = points.map((point) => `${point.x},${point.y}`).join(' ');

                  return (
                    <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} width="100%" height="100%" preserveAspectRatio="none" role="img" aria-label="Consumed parts trend by time">
                      {[0, 1, 2, 3].map((tick) => {
                        const y = topPad + (plotHeight * tick) / 3;
                        return (
                          <g key={tick}>
                            <line x1={leftPad} x2={chartWidth - rightPad} y1={y} y2={y} stroke={tokenDivider} strokeWidth="1" />
                          </g>
                        );
                      })}
                      <polyline points={pointPath} fill="none" stroke={tokenBrand.main} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                      {points.map((point) => (
                        <g key={`${point.date}-${point.topContributor}`}>
                          <circle cx={point.x} cy={point.y} r="5.5" fill="#FFFFFF" stroke={tokenBrand.main} strokeWidth="3" />
                          <text x={point.x} y={chartHeight - 16} textAnchor="middle" fontSize="12" fontWeight="500" fill={tokenText.secondary}>
                            {point.date}
                          </text>
                          <text x={point.x} y={Math.max(point.y - 10, 12)} textAnchor="middle" fontSize="11" fontWeight="700" fill={tokenText.primary}>
                            {point.value}
                          </text>
                        </g>
                      ))}
                    </svg>
                  );
                })()}
              </Box>
              {consumptionTrendView !== 'all' ? (
                <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap', mt: 0.6 }}>
                  {consumptionTrendDetails.trend.map((point) => (
                    <Chip
                      key={`${point.date}-${point.topContributor}-chip`}
                      label={`${point.date}: ${point.topContributor}`}
                      size="small"
                      sx={{ height: 24, color: tokenText.primary, bgcolor: tokenNeutral.lighter, border: `1px solid ${tokenDivider}`, fontWeight: 700 }}
                    />
                  ))}
                </Box>
              ) : null}
            </Paper>

            <Grid container spacing={1.5}>
              {[
                { title: 'Equipment that consumes spare parts', rows: consumptionTrendDetails.topEquipment },
                { title: 'Spare parts consumed', rows: consumptionTrendDetails.topParts },
              ].map((section) => {
                const maxValue = Math.max(...section.rows.map((row) => row.value), 1);

                return (
                  <Grid key={section.title} size={{ xs: 12, md: 6 }}>
                    <Paper elevation={0} sx={{ p: 2, borderRadius: '8px', border: `1px solid ${tokenDivider}`, bgcolor: 'background.paper', height: '100%' }}>
                      <Typography sx={{ color: tokenText.primary, fontWeight: 700, fontSize: 14, mb: 1.5 }}>
                        Top 5 {section.title}
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                        {section.rows.map((row, index) => (
                          <Box key={row.label} sx={{ display: 'grid', gridTemplateColumns: '24px minmax(0, 1fr) 44px', gap: 0.8, alignItems: 'center' }}>
                            <Typography sx={{ color: tokenText.secondary, fontWeight: 700, fontSize: 12 }}>
                              {index + 1}
                            </Typography>
                            <Box sx={{ minWidth: 0 }}>
                              <Typography sx={{ color: tokenText.primary, fontWeight: 700, fontSize: 12.5 }} noWrap>
                                {row.label}
                              </Typography>
                              <Box sx={{ mt: 0.35, height: 7, borderRadius: 999, bgcolor: tokenNeutral.lighter, overflow: 'hidden' }}>
                                <Box sx={{ width: `${Math.max((row.value / maxValue) * 100, 8)}%`, height: '100%', borderRadius: 999, bgcolor: tokenBrand.main }} />
                              </Box>
                            </Box>
                            <Typography sx={{ color: tokenText.primary, fontWeight: 700, fontSize: 13, textAlign: 'right' }}>
                              {row.value}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          </DialogContent>
        </Dialog>
        {/* Simulated Barcode Scanner modal */}
        <Dialog
          open={isBarcodeModalOpen}
          onClose={() => setIsBarcodeModalOpen(false)}
          PaperProps={{
            sx: {
              borderRadius: '12px',
              p: 1.5,
              maxWidth: 480,
              width: '100%',
              bgcolor: 'background.paper',
            },
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, px: 1 }}>
            <Typography sx={{ color: tokenText.primary, fontWeight: 700, fontSize: 17, display: 'flex', alignItems: 'center', gap: 1 }}>
              <BarcodeIcon sx={{ color: tokenBrand.main }} />
              Simulated Barcode Scanner
            </Typography>
            <IconButton onClick={() => setIsBarcodeModalOpen(false)} size="small" sx={{ color: tokenText.secondary }}>
              <CloseIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Box>

          <DialogContent sx={{ p: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box
              sx={{
                width: '100%',
                height: 140,
                bgcolor: '#0F172A',
                borderRadius: '8px',
                position: 'relative',
                overflow: 'hidden',
                display: 'grid',
                placeItems: 'center',
                border: `1px solid ${tokenDivider}`,
              }}
            >
              <BarcodeIcon sx={{ color: 'rgba(255, 255, 255, 0.15)', fontSize: 72 }} />

              <Box
                sx={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  height: 3,
                  bgcolor: tokenBrand.main,
                  boxShadow: `0 0 12px ${tokenBrand.main}, 0 0 4px ${tokenBrand.main}`,
                  animation: 'laserScan 2.5s infinite linear',
                  '@keyframes laserScan': {
                    '0%': { top: '10%' },
                    '50%': { top: '90%' },
                    '100%': { top: '10%' },
                  },
                }}
              />

              <Typography variant="caption" sx={{ position: 'absolute', bottom: 8, color: '#94A3B8', fontWeight: 500 }}>
                Position barcode inside scanning area
              </Typography>
            </Box>

            {barcodeAlert && (
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: '8px',
                  border: `1px solid ${barcodeAlert.severity === 'success'
                    ? tokenBrand.light
                    : barcodeAlert.severity === 'warning'
                      ? tokenWarning.light
                      : tokenError.light
                    }`,
                  bgcolor:
                    barcodeAlert.severity === 'success'
                      ? tokenBrand.softBg
                      : barcodeAlert.severity === 'warning'
                        ? tokenWarning.softBg
                        : tokenError.softBg,
                  display: 'flex',
                  gap: 1,
                  alignItems: 'flex-start',
                }}
              >
                <SparkleIcon
                  sx={{
                    color:
                      barcodeAlert.severity === 'success'
                        ? tokenBrand.main
                        : barcodeAlert.severity === 'warning'
                          ? tokenWarning.main
                          : tokenError.main,
                    fontSize: 18,
                    flexShrink: 0,
                    mt: 0.25,
                  }}
                />
                <Typography sx={{ fontSize: 13, fontWeight: 700, color: tokenText.primary, lineHeight: 1.35 }}>
                  {barcodeAlert.message}
                </Typography>
              </Box>
            )}

            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <TextField
                fullWidth
                size="small"
                label="Enter Barcode / Serial manually"
                placeholder="e.g. PO-2024-0892 or SP-SEA-1001"
                value={scannedBarcodeText}
                onChange={(e) => setScannedBarcodeText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleBarcodeSubmit(scannedBarcodeText);
                  }
                }}
                sx={{
                  '& .MuiInputLabel-root': { fontSize: 12.5, fontWeight: 500 },
                }}
              />
              <Button
                variant="contained"
                onClick={() => handleBarcodeSubmit(scannedBarcodeText)}
                sx={{
                  borderRadius: '8px',
                  py: 1,
                  textTransform: 'none',
                  boxShadow: 'none',
                  fontWeight: 700,
                  bgcolor: tokenBrand.main,
                  color: '#FFFFFF',
                  '&:hover': { bgcolor: tokenBrand.dark },
                }}
              >
                Scan
              </Button>
            </Box>

            <Box>
              <Typography variant="caption" sx={{ color: tokenText.secondary, fontWeight: 500, textTransform: 'uppercase', display: 'block', mb: 1 }}>
                Or select a preset barcode to simulate scan
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {[
                  { label: 'PO-2024-0892 (Parker)', value: 'PO-2024-0892' },
                  { label: 'PO-2024-0885 (SKF)', value: 'PO-2024-0885' },
                  { label: 'Part: Rod Seal', value: 'SP-SEA-1001' },
                  { label: 'Part: Timing Belt', value: 'SP-BEL-1001' },
                ].map((preset) => (
                  <Button
                    key={preset.value}
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      setScannedBarcodeText(preset.value);
                      handleBarcodeSubmit(preset.value);
                    }}
                    sx={{
                      borderRadius: '8px',
                      borderColor: tokenDivider,
                      color: tokenText.secondary,
                      fontSize: 11,
                      fontWeight: 700,
                      py: 0.4,
                      px: 1,
                      textTransform: 'none',
                      bgcolor: 'background.paper',
                      '&:hover': { borderColor: tokenBrand.light, bgcolor: tokenBrand.softBg },
                    }}
                  >
                    {preset.label}
                  </Button>
                ))}
              </Box>
            </Box>
          </DialogContent>
        </Dialog>
      </Paper>
    </Box>
  );
}
