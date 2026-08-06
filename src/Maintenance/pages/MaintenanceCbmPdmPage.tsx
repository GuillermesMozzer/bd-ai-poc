import React, { useEffect, useMemo, useState } from 'react';
import {
  Add as AddIcon,
  AutoAwesome as SparkleIcon,
  CheckCircleOutline as CheckIcon,
  Close as CloseIcon,
  FolderOutlined as FolderIcon,
  HomeOutlined as HomeIcon,
  Inventory2Outlined as AssetIcon,
  KeyboardArrowDown as ArrowDownIcon,
  KeyboardArrowRight as ArrowRightIcon,
  PersonOutline as PersonIcon,
  PlaceOutlined as PlaceIcon,
  Search as SearchIcon,
  SettingsOutlined as ComponentIcon,
  BuildOutlined as WrenchIcon,
  Tune as TuneIcon,
  WarningAmber as WarningIcon,
} from '@mui/icons-material';
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Select,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { activeTheme } from '../../theme';
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
import { monitoringCards, type CbmMonitoringCard, type Severity } from '../data/cbmMonitoringData';

type MaintenanceCbmPdmPageProps = {
  activeTheme?: { primary: string };
  onOpenMaintenanceRequestEntry?: () => void;
};

type AssetCriticality = 'A' | 'B' | 'C';
const cbmMetricOptions = ['Vibration', 'Temperature', 'Oil Analysis', 'Pressure', 'Noise'] as const;
type CbmMetric = (typeof cbmMetricOptions)[number];
type HierarchyStatus = 'healthy' | 'warning' | 'critical';
type HierarchyKind = 'site' | 'area' | 'unit' | 'line' | 'zone' | 'assembly' | 'system' | 'component' | 'asset';

const parameterStatusTagSx = {
  bgcolor: tokenNeutral.lighter,
  color: tokenText.secondary,
};

const assetCriticalityStyles: Record<AssetCriticality, { bg: string; fg: string; border: string }> = {
  A: { bg: '#FEF2F2', fg: '#B91C1C', border: '#FCA5A5' },
  B: { bg: '#FEFCE8', fg: '#A16207', border: '#FDE047' },
  C: { bg: '#F0FDF4', fg: '#15803D', border: '#86EFAC' },
};
const neutralAssetCriticalityStyle = { bg: '#EEF2F7', fg: tokenText.secondary, border: tokenDivider };
const neutralAssetCriticalityAssets = new Set(['Molding M-301', 'Compressor C-102', 'Molding M-302']);

type HierarchyNode = {
  id: string;
  label: string;
  kind: HierarchyKind;
  status?: HierarchyStatus;
  children?: HierarchyNode[];
};

type PostInterventionItem = {
  asset: string;
  parameter: string;
  healthScore: number;
  window: string;
  intervention: string;
  owner: string;
  tone: string;
  severity: Severity;
  hierarchyIds: string[];
};

const severityStyles: Record<Severity, { label: string; tone: string; soft: string; border: string; fg: string }> = {
  critical: {
    label: 'Critical',
    tone: '#EF4444',
    soft: '#FEF2F2',
    border: '#FCA5A5',
    fg: '#B91C1C',
  },
  mediumCritical: {
    label: 'Medium critical',
    tone: '#F97316',
    soft: '#FFF7ED',
    border: '#FDBA74',
    fg: '#C2410C',
  },
  lessCritical: {
    label: 'Less critical',
    tone: '#F59E0B',
    soft: '#FFFBEB',
    border: '#FDE68A',
    fg: '#A16207',
  },
  normal: {
    label: 'Operating normally',
    tone: '#22C55E',
    soft: '#F0FDF4',
    border: '#86EFAC',
    fg: '#15803D',
  },
};

const criticalityOptions: Severity[] = ['critical', 'mediumCritical', 'lessCritical', 'normal'];

const hierarchyTree: HierarchyNode[] = [
  {
    id: 'site-sandy',
    label: 'Sandy',
    kind: 'site',
    status: 'healthy',
    children: [
      {
        id: 'area-a',
        label: 'Area A',
        kind: 'area',
        status: 'healthy',
        children: [
          {
            id: 'unit-a',
            label: 'Unit A',
            kind: 'unit',
            status: 'healthy',
            children: [
              {
                id: 'line-10',
                label: 'Line 10',
                kind: 'line',
                status: 'warning',
                children: [
                  {
                    id: 'zone-1',
                    label: 'Zone 1',
                    kind: 'zone',
                    status: 'warning',
                    children: [
                      {
                        id: 'assembly',
                        label: 'Syringe Assembly Machine SA',
                        kind: 'assembly',
                        status: 'critical',
                        children: [
                          {
                            id: 'filling-system',
                            label: 'Filling System',
                            kind: 'system',
                            status: 'warning',
                            children: [
                              {
                                id: 'filling-head',
                                label: 'Filling Head Assembly',
                                kind: 'system',
                                status: 'warning',
                                children: [
                                  { id: 'servo-motor', label: 'Servo Motor', kind: 'component', status: 'critical' },
                                  { id: 'nozzle-cluster', label: 'Nozzle Cluster', kind: 'component', status: 'healthy' },
                                  { id: 'drive-bearing', label: 'Drive Bearing', kind: 'component', status: 'warning' },
                                ],
                              },
                              { id: 'dosing-pump-module', label: 'Dosing Pump Module', kind: 'system', status: 'warning' },
                            ],
                          },
                          { id: 'transport-system', label: 'Transport System', kind: 'system', status: 'healthy' },
                          { id: 'conveyor-cv101-packaging', label: 'Conveyor CV-101', kind: 'asset', status: 'healthy' },
                          { id: 'vision-inspection', label: 'Vision Inspection VI-210', kind: 'asset', status: 'healthy' },
                          { id: 'labeling-machine', label: 'Labeling Machine LM-88', kind: 'asset', status: 'healthy' },
                          { id: 'cartoner-ct32', label: 'Cartoner CT-32', kind: 'asset', status: 'healthy' },
                          { id: 'reject-station', label: 'Reject Station RJ-11', kind: 'asset', status: 'healthy' },
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
  },
];

const postInterventionCards: PostInterventionItem[] = [
  {
    asset: 'Filling Head Assembly',
    parameter: 'Noise',
    healthScore: 78,
    window: '18h remaining',
    intervention: 'Bearing replaced and sensor recalibrated',
    owner: 'Maintenance Team A',
    tone: '#0EA5E9',
    severity: 'mediumCritical',
    hierarchyIds: ['all', 'site-sandy', 'area-a', 'unit-a', 'line-10', 'zone-1', 'assembly', 'filling-system', 'filling-head'],
  },
  {
    asset: 'Dosing Pump Module',
    parameter: 'Temperature',
    healthScore: 81,
    window: '2 days remaining',
    intervention: 'Cooling loop cleaned after high temperature drift',
    owner: 'Utilities',
    tone: '#22C55E',
    severity: 'mediumCritical',
    hierarchyIds: ['all', 'site-sandy', 'area-a', 'unit-a', 'line-10', 'zone-1', 'assembly', 'filling-system', 'dosing-pump-module'],
  },
  {
    asset: 'Servo Motor',
    parameter: 'Vibration',
    healthScore: 74,
    window: '10h remaining',
    intervention: 'Shaft alignment adjusted after vibration alert',
    owner: 'Reliability',
    tone: '#F97316',
    severity: 'critical',
    hierarchyIds: ['all', 'site-sandy', 'area-a', 'unit-a', 'line-10', 'zone-1', 'assembly', 'filling-system', 'filling-head', 'servo-motor'],
  },
];

const sparePartsByAsset: Record<string, { availability: number; available: string[]; missing: string[] }> = {
  'Molding M-301': {
    availability: 82,
    available: ['Servo bearing kit BRG-771', 'Vibration sensor VS-18', 'Spindle alignment shim set', 'M8 mounting hardware'],
    missing: ['High-temp seal kit HTS-44'],
  },
  'Assembly A-201': {
    availability: 76,
    available: ['Bearing assembly BA-102', 'Noise sensor NS-09', 'Drive coupling DC-12'],
    missing: ['Lubrication cartridge LC-5', 'Motor isolator pad MIP-20'],
  },
  'Conveyor CV-101': {
    availability: 88,
    available: ['Belt roller kit CVR-101', 'Oil sample cartridge OSC-7', 'Guide rail sensor GRS-2'],
    missing: ['Reducer seal RS-101'],
  },
  'Pump P-205': {
    availability: 67,
    available: ['Impeller kit IP-205', 'Pressure sensor PS-14', 'Cooling hose CH-8'],
    missing: ['Mechanical seal MS-205', 'Pump bearing PB-205'],
  },
};

const sensorAlerts = [
  { asset: 'Pump P-205', location: 'Utilities', value: '8.4', target: '7.5 bar', age: '42m ago', parameter: 'Pressure', grade: 'B' },
  { asset: 'Motor MT-501', location: 'Motor Room', value: '4.2', target: '5 mm/s', age: '6h ago', parameter: 'Vibration', grade: 'C' },
] as const;

const maintenanceRequests = [
  { id: 'MR 606034603', asset: 'Mixer Unit 3', zone: 'Z2', description: 'Inspect the local component. Vibration drift trending upward.', sentAt: 'Jan 13, 15:30PM', createdBy: 'Maintenance Leader' },
  { id: 'MR 606034617', asset: 'Motor MT-501', zone: 'Motor Room', description: 'Inspect the local component. Vibration drift trending upward.', sentAt: 'Jan 13, 16:10PM', createdBy: 'Planner' },
  { id: 'MR 606034642', asset: 'Molding M-301', zone: 'Molding', description: 'Inspect the local component. Temperature drift trending upward.', sentAt: 'Jan 14, 09:20AM', createdBy: 'Maintenance Leader' },
  { id: 'MR 606034688', asset: 'Pump P-205', zone: 'Utilities', description: 'Inspect the local component. Oil analysis drift trending upward.', sentAt: 'Jan 14, 10:45AM', createdBy: 'Planner' },
] as const;

const predictiveWorkOrders = [
  { id: 'WO-2024-0160', asset: 'Motor MT-501', zone: 'Motor Room', description: 'Perform vibration analysis after predictive alert.', scheduledAt: 'Jan 14, 08:00AM', createdBy: 'Planner', status: 'Planning' },
  { id: 'WO-2024-0171', asset: 'Bearing Assembly BA-102', zone: 'Assembly', description: 'Inspect bearing condition after vibration alert.', scheduledAt: 'Jan 14, 09:15AM', createdBy: 'Maintenance Leader', status: 'Planning' },
  { id: 'WO-2026-0174', asset: 'Temperature Sensor TS-105', zone: 'Utilities', description: 'Calibrate temperature sensor after drift indication.', scheduledAt: 'Jan 14, 10:00AM', createdBy: 'Planner', status: 'Planning' },
  { id: 'WO-2026-0176', asset: 'Motor MT-205', zone: 'Motor Room', description: 'Lubricate motor bearing according to predictive trend.', scheduledAt: 'Jan 14, 11:30AM', createdBy: 'Planner', status: 'Planning' },
  { id: 'WO-PDM-2051', asset: 'Press P-110', zone: 'Press Line', description: 'Execute lubrication route for predictive maintenance.', scheduledAt: 'Jan 15, 08:30AM', createdBy: 'Reliability', status: 'Scheduled' },
  { id: 'WO-PDM-2052', asset: 'Compressor C-102', zone: 'Utilities', description: 'Check vibration levels and confirm compressor health.', scheduledAt: 'Jan 15, 10:45AM', createdBy: 'Reliability', status: 'Scheduled' },
  { id: 'WO-PDM-2041', asset: 'Extruder EX-401', zone: 'Extrusion', description: 'Replace bearing flagged by predictive monitoring.', scheduledAt: 'Jan 13, 13:20PM', createdBy: 'Maintenance Leader', status: 'In Progress' },
  { id: 'WO-PDM-2042', asset: 'Molding M-302', zone: 'Molding', description: 'Perform thermal scan and alignment adjustment.', scheduledAt: 'Jan 13, 14:40PM', createdBy: 'Reliability', status: 'In Progress' },
] as const;

const explicitAssetCriticality: Record<string, AssetCriticality> = {
  'Filling Head Assembly': 'A',
  'Dosing Pump Module': 'B',
  'Servo Motor': 'A',
  'Mixer Unit 3': 'B',
  'Bearing Assembly BA-102': 'A',
  'Temperature Sensor TS-105': 'B',
  'Motor MT-205': 'B',
  'Press P-110': 'A',
};

const getAssetCriticality = (asset: string): AssetCriticality => {
  const grade = explicitAssetCriticality[asset]
    ?? monitoringCards.find((card) => card.asset === asset)?.grade
    ?? sensorAlerts.find((alert) => alert.asset === asset)?.grade;

  return grade === 'A' || grade === 'B' || grade === 'C' ? grade : 'C';
};

function AssetCriticalityTag({ value, asset }: { value: AssetCriticality; asset?: string }) {
  const style = asset && neutralAssetCriticalityAssets.has(asset) ? neutralAssetCriticalityStyle : assetCriticalityStyles[value];

  return (
    <Chip
      label={value}
      size="small"
      title={`Asset Criticality ${value}`}
      sx={{
        height: 18,
        minWidth: 22,
        borderRadius: 0.8,
        border: `1px solid ${style.border}`,
        bgcolor: style.bg,
        color: style.fg,
        fontSize: '0.62rem',
        fontWeight: 950,
        lineHeight: 1,
        flexShrink: 0,
        '& .MuiChip-label': { px: 0.55 },
      }}
    />
  );
}

const findHierarchyLabel = (nodes: HierarchyNode[], id: string): string => {
  for (const node of nodes) {
    if (node.id === id) return node.label;
    if (node.children) {
      const childLabel = findHierarchyLabel(node.children, id);
      if (childLabel) return childLabel;
    }
  }
  return 'All assets';
};

const filterHierarchyNodes = (nodes: HierarchyNode[], searchTerm: string): HierarchyNode[] => {
  const normalizedSearch = searchTerm.trim().toLowerCase();
  if (!normalizedSearch) return nodes;

  return nodes.reduce<HierarchyNode[]>((matches, node) => {
    const filteredChildren = node.children ? filterHierarchyNodes(node.children, normalizedSearch) : undefined;
    const matchesLabel = node.label.toLowerCase().includes(normalizedSearch);

    if (matchesLabel || filteredChildren?.length) {
      matches.push({
        ...node,
        children: filteredChildren,
      });
    }

    return matches;
  }, []);
};

const getNodeIcon = (kind: HierarchyKind) => {
  if (kind === 'site') return <HomeIcon sx={{ fontSize: 14 }} />;
  if (kind === 'assembly' || kind === 'asset') return <AssetIcon sx={{ fontSize: 14 }} />;
  if (kind === 'system') return <ComponentIcon sx={{ fontSize: 14 }} />;
  if (kind === 'component') return <TuneIcon sx={{ fontSize: 14 }} />;
  return <FolderIcon sx={{ fontSize: 14 }} />;
};

function HierarchyRow({
  node,
  depth,
  selectedId,
  onSelect,
}: {
  node: HierarchyNode;
  depth: number;
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const [open, setOpen] = useState(depth < 5);
  const hasChildren = Boolean(node.children?.length);
  const selected = selectedId === node.id;

  return (
    <Box>
      <Box
        role="button"
        tabIndex={0}
        onClick={() => onSelect(node.id)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') onSelect(node.id);
        }}
        sx={{
          minHeight: 28,
          pl: `${depth * 14 + 6}px`,
          pr: 0.7,
          py: 0.35,
          display: 'flex',
          alignItems: 'center',
          gap: 0.55,
          cursor: 'pointer',
          color: selected ? tokenBrand.main : tokenText.primary,
          bgcolor: selected ? tokenBrand.selectedBg : 'transparent',
          borderRadius: '6px',
          fontWeight: selected ? 800 : 600,
          '&:hover': { bgcolor: selected ? tokenBrand.selectedBg : tokenNeutral.lightest },
        }}
      >
        <IconButton
          size="small"
          onClick={(event) => {
            event.stopPropagation();
            setOpen((current) => !current);
          }}
          disabled={!hasChildren}
          sx={{ width: 18, height: 18, color: tokenText.secondary, p: 0 }}
        >
          {hasChildren ? (open ? <ArrowDownIcon sx={{ fontSize: 14 }} /> : <ArrowRightIcon sx={{ fontSize: 14 }} />) : null}
        </IconButton>
        <Box sx={{ color: selected ? tokenBrand.main : tokenText.secondary, display: 'grid', placeItems: 'center' }}>{getNodeIcon(node.kind)}</Box>
        <Typography
          variant="caption"
          noWrap
          sx={{
            flex: 1,
            color: 'inherit',
            fontWeight: 'inherit',
            minWidth: 0,
          }}
        >
          {node.label}
        </Typography>
      </Box>
      {open && node.children ? (
        <Box sx={{ mt: 0.2 }}>
          {node.children.map((child) => (
            <HierarchyRow key={child.id} node={child} depth={depth + 1} selectedId={selectedId} onSelect={onSelect} />
          ))}
        </Box>
      ) : null}
    </Box>
  );
}

function AssetHierarchyFilter({
  selectedId,
  selectedLabel,
  onSelect,
}: {
  selectedId: string;
  selectedLabel: string;
  onSelect: (id: string) => void;
}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const open = Boolean(anchorEl);
  const visibleHierarchy = useMemo(() => filterHierarchyNodes(hierarchyTree, searchTerm), [searchTerm]);

  const handleSelect = (id: string) => {
    onSelect(id);
    setAnchorEl(null);
  };

  return (
    <>
      <Button
        variant="outlined"
        size="small"
        endIcon={<ArrowDownIcon sx={{ fontSize: 17 }} />}
        onClick={(event) => setAnchorEl(event.currentTarget)}
        sx={{
          minWidth: { xs: '100%', sm: 170 },
          maxWidth: { xs: '100%', sm: 210 },
          height: 30,
          px: 1.75,
          justifyContent: 'space-between',
          borderColor: tokenDivider,
          borderRadius: '8px',
          color: tokenText.primary,
          bgcolor: 'background.paper',
          textTransform: 'none',
          fontSize: '0.72rem',
          fontWeight: 600,
          '&:hover': {
            borderColor: tokenBrand.main,
            bgcolor: tokenNeutral.lightest,
          },
          '& .MuiButton-endIcon': {
            ml: 0.6,
            mr: -0.7,
            color: tokenText.secondary,
          },
        }}
      >
        <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selectedLabel}
        </Box>
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        MenuListProps={{ sx: { p: 0 } }}
        PaperProps={{
          sx: {
            width: 320,
            maxWidth: 'calc(100vw - 24px)',
            mt: 0.7,
            borderRadius: '12px',
            border: `1px solid ${tokenDivider}`,
            boxShadow: 'var(--paper-shadow)',
          },
        }}
      >
        <Box sx={{ p: 1 }}>
          <Typography variant="subtitle1" sx={{ color: tokenText.primary, fontWeight: 700, mb: 0.8 }}>
            Asset Hierarchy
          </Typography>
          <TextField
            size="small"
            fullWidth
            label="Search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            onKeyDown={(event) => event.stopPropagation()}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <SearchIcon sx={{ fontSize: 17, color: tokenText.secondary }} />
                </InputAdornment>
              ),
            }}
            sx={{
              mb: 0.8,
              '& .MuiOutlinedInput-root': {
                height: 34,
                borderRadius: '8px',
                bgcolor: 'background.default',
              },
            }}
          />
          <Box sx={{ borderTop: `1px solid ${tokenDivider}`, pt: 0.8, maxHeight: 330, overflowY: 'auto' }}>
            <Box
              role="button"
              tabIndex={0}
              onClick={() => handleSelect('all')}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') handleSelect('all');
              }}
              sx={{
                minHeight: 28,
                px: 0.8,
                py: 0.35,
                mb: 0.2,
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                color: selectedId === 'all' ? tokenBrand.main : tokenText.primary,
                bgcolor: selectedId === 'all' ? tokenBrand.selectedBg : 'transparent',
                borderRadius: '6px',
                fontWeight: selectedId === 'all' ? 800 : 600,
                '&:hover': { bgcolor: selectedId === 'all' ? tokenBrand.selectedBg : tokenNeutral.lightest },
              }}
            >
              <Typography variant="caption" sx={{ color: 'inherit', fontWeight: 'inherit' }}>
                All assets
              </Typography>
            </Box>
            {visibleHierarchy.length ? (
              visibleHierarchy.map((node) => (
                <HierarchyRow key={node.id} node={node} depth={0} selectedId={selectedId} onSelect={handleSelect} />
              ))
            ) : (
              <Typography variant="caption" sx={{ color: tokenText.secondary, display: 'block', px: 0.8, py: 1 }}>
                No assets found.
              </Typography>
            )}
          </Box>
        </Box>
      </Menu>
    </>
  );
}

function CriticalityFilter({
  value,
  onChange,
  counts,
}: {
  value: Severity[];
  onChange: (value: Severity[]) => void;
  counts: Record<Severity, number>;
}) {
  return (
    <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 170 }, maxWidth: { xs: '100%', sm: 210 } }}>
      <Select
        multiple
        displayEmpty
        value={value}
        onChange={(event) => {
          const selectedValue = event.target.value;
          onChange(typeof selectedValue === 'string' ? (selectedValue.split(',') as Severity[]) : (selectedValue as Severity[]));
        }}
        renderValue={(selected) => {
          const selectedCriticalities = selected as Severity[];
          if (!selectedCriticalities.length) return 'All Criticality';
          return selectedCriticalities.map((severity) => severityStyles[severity].label).join(', ');
        }}
        sx={{
          height: 30,
          bgcolor: 'background.paper',
          fontSize: '0.72rem',
          fontWeight: 600,
          borderRadius: '8px',
          '& .MuiSelect-select': {
            py: 0.45,
            pr: 3.4,
          },
        }}
      >
        {criticalityOptions.map((severity) => (
          <MenuItem key={severity} value={severity} sx={{ minHeight: 32 }}>
            <Checkbox size="small" checked={value.includes(severity)} />
            <ListItemText
              primary={`${severityStyles[severity].label} (${counts[severity]})`}
              primaryTypographyProps={{ fontSize: '0.76rem', fontWeight: 600, color: tokenText.primary }}
            />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

function MetricTile({ label, value, accent, suffix }: { label: string; value: string; accent: string; suffix?: string }) {
  return (
    <Paper
      elevation={0}
      sx={{
        minHeight: 52,
        p: 1,
        borderRadius: '8px',
        border: `1px solid ${tokenDivider}`,
        borderLeft: `4px solid ${accent}`,
        bgcolor: 'background.default',
      }}
    >
      <Typography variant="h6" sx={{ color: accent, fontWeight: 700, lineHeight: 1 }}>
        {value}
        {suffix ? (
          <Box component="span" sx={{ fontSize: '0.75rem', ml: 0.25, color: tokenText.secondary, fontWeight: 600 }}>
            {suffix}
          </Box>
        ) : null}
      </Typography>
      <Typography variant="caption" sx={{ color: tokenText.secondary, display: 'block', mt: 0.2, fontWeight: 600 }}>
        {label}
      </Typography>
    </Paper>
  );
}

const getThresholdValue = (value: string, fallback: number) => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

type CbmTrendPoint = {
  date: string;
  historical: number | null;
  predicted: number | null;
};

type CbmMetricData = {
  currentReading: string;
  warningThreshold: string;
  criticalThreshold: string;
  trend: string;
  trendData: CbmTrendPoint[];
  rules: { icon: 'critical' | 'warning' | 'healthy'; title: string; detail: string }[];
};

type ParameterMonitoringDraft = {
  equipment: string;
  operatingMin: string;
  operatingMax: string;
  warningEnabled: boolean;
  warningLow: string;
  warningHigh: string;
  criticalEnabled: boolean;
  criticalLow: string;
  criticalHigh: string;
  dataSource: string;
  samplingInterval: string;
  samplingUnit: string;
  durationEnabled: boolean;
  duration: string;
  durationUnit: string;
};

const parameterMonitoringUnits: Record<CbmMetric, string> = {
  Vibration: 'mm/s',
  Temperature: 'C',
  'Oil Analysis': 'ppm',
  Pressure: 'bar',
  Noise: 'dB',
};

const parameterMonitoringDefaults: Record<CbmMetric, ParameterMonitoringDraft> = {
  Vibration: {
    equipment: 'Value',
    operatingMin: '0',
    operatingMax: '5',
    warningEnabled: true,
    warningLow: '3.5',
    warningHigh: '5',
    criticalEnabled: true,
    criticalLow: '5',
    criticalHigh: '7',
    dataSource: '',
    samplingInterval: '10',
    samplingUnit: 'Minutes',
    durationEnabled: true,
    duration: '1',
    durationUnit: 'Days',
  },
  Temperature: {
    equipment: 'Value',
    operatingMin: '40',
    operatingMax: '72',
    warningEnabled: true,
    warningLow: '72',
    warningHigh: '85',
    criticalEnabled: true,
    criticalLow: '85',
    criticalHigh: '100',
    dataSource: '',
    samplingInterval: '10',
    samplingUnit: 'Minutes',
    durationEnabled: true,
    duration: '1',
    durationUnit: 'Days',
  },
  'Oil Analysis': {
    equipment: 'Value',
    operatingMin: '0',
    operatingMax: '110',
    warningEnabled: true,
    warningLow: '110',
    warningHigh: '190',
    criticalEnabled: true,
    criticalLow: '190',
    criticalHigh: '260',
    dataSource: '',
    samplingInterval: '10',
    samplingUnit: 'Minutes',
    durationEnabled: true,
    duration: '1',
    durationUnit: 'Days',
  },
  Pressure: {
    equipment: 'Value',
    operatingMin: '0',
    operatingMax: '8',
    warningEnabled: true,
    warningLow: '8',
    warningHigh: '9.5',
    criticalEnabled: true,
    criticalLow: '9.5',
    criticalHigh: '12',
    dataSource: '',
    samplingInterval: '10',
    samplingUnit: 'Minutes',
    durationEnabled: true,
    duration: '1',
    durationUnit: 'Days',
  },
  Noise: {
    equipment: 'Value',
    operatingMin: '30',
    operatingMax: '120',
    warningEnabled: true,
    warningLow: '35',
    warningHigh: '85',
    criticalEnabled: true,
    criticalLow: '30',
    criticalHigh: '100',
    dataSource: '',
    samplingInterval: '10',
    samplingUnit: 'Minutes',
    durationEnabled: true,
    duration: '1',
    durationUnit: 'Days',
  },
};

const toCbmMetric = (metric: string): CbmMetric => (
  cbmMetricOptions.includes(metric as CbmMetric) ? metric as CbmMetric : 'Vibration'
);

const getCbmMetricData = (card: CbmMonitoringCard, metric: CbmMetric): CbmMetricData => {
  const data: Record<CbmMetric, CbmMetricData> = {
    Vibration: {
      currentReading: card.metric === 'Vibration' ? card.currentReading : '3.9 mm/s',
      warningThreshold: card.metric === 'Vibration' ? card.warningThreshold : '3.5 mm/s',
      criticalThreshold: card.metric === 'Vibration' ? card.criticalThreshold : '5.0 mm/s',
      trend: card.metric === 'Vibration' ? card.trend : '+18%',
      trendData: [
        { date: 'May 11', historical: 2.0, predicted: null },
        { date: 'May 12', historical: 3.0, predicted: null },
        { date: 'May 13', historical: 3.2, predicted: null },
        { date: 'May 14', historical: 3.7, predicted: null },
        { date: 'May 15', historical: 3.7, predicted: null },
        { date: 'May 16', historical: 4.1, predicted: null },
        { date: 'May 17', historical: 4.5, predicted: 4.5 },
        { date: 'May 18', historical: null, predicted: 4.8 },
        { date: 'May 19', historical: null, predicted: 5.05 },
        { date: 'May 20', historical: null, predicted: 5.25 },
        { date: 'May 21', historical: null, predicted: 5.05 },
        { date: 'May 22', historical: null, predicted: 4.85 },
        { date: 'May 23', historical: null, predicted: 4.6 },
      ],
      rules: [
        { icon: 'critical', title: 'Critical', detail: '>5.0 mm/s or +15%/24h creates a high-priority Maintenance Request.' },
        { icon: 'warning', title: 'Warning', detail: '>3.5 mm/s for 3 consecutive readings triggers inspection.' },
        { icon: 'healthy', title: 'Healthy', detail: 'Vibration below warning threshold and Health Score > 85%.' },
      ],
    },
    Temperature: {
      currentReading: card.metric === 'Temperature' ? card.currentReading : '78 C',
      warningThreshold: card.metric === 'Temperature' ? card.warningThreshold : '72 C',
      criticalThreshold: card.metric === 'Temperature' ? card.criticalThreshold : '85 C',
      trend: card.metric === 'Temperature' ? card.trend : '+11%',
      trendData: [
        { date: 'May 11', historical: 61, predicted: null },
        { date: 'May 12', historical: 64, predicted: null },
        { date: 'May 13', historical: 66, predicted: null },
        { date: 'May 14', historical: 69, predicted: null },
        { date: 'May 15', historical: 70, predicted: null },
        { date: 'May 16', historical: 73, predicted: null },
        { date: 'May 17', historical: 76, predicted: 76 },
        { date: 'May 18', historical: null, predicted: 79 },
        { date: 'May 19', historical: null, predicted: 82 },
        { date: 'May 20', historical: null, predicted: 86 },
        { date: 'May 21', historical: null, predicted: 84 },
        { date: 'May 22', historical: null, predicted: 81 },
        { date: 'May 23', historical: null, predicted: 79 },
      ],
      rules: [
        { icon: 'critical', title: 'Critical', detail: '>85 C or +10%/24h creates a high-priority Maintenance Request.' },
        { icon: 'warning', title: 'Warning', detail: '>72 C for 3 consecutive readings triggers thermal inspection.' },
        { icon: 'healthy', title: 'Healthy', detail: 'Temperature is stable below warning threshold after calibration check.' },
      ],
    },
    'Oil Analysis': {
      currentReading: card.metric === 'Oil Analysis' ? card.currentReading : '142 ppm',
      warningThreshold: card.metric === 'Oil Analysis' ? card.warningThreshold : '110 ppm',
      criticalThreshold: card.metric === 'Oil Analysis' ? card.criticalThreshold : '190 ppm',
      trend: card.metric === 'Oil Analysis' ? card.trend : '+9%',
      trendData: [
        { date: 'May 11', historical: 72, predicted: null },
        { date: 'May 12', historical: 84, predicted: null },
        { date: 'May 13', historical: 93, predicted: null },
        { date: 'May 14', historical: 105, predicted: null },
        { date: 'May 15', historical: 118, predicted: null },
        { date: 'May 16', historical: 131, predicted: null },
        { date: 'May 17', historical: 142, predicted: 142 },
        { date: 'May 18', historical: null, predicted: 151 },
        { date: 'May 19', historical: null, predicted: 164 },
        { date: 'May 20', historical: null, predicted: 181 },
        { date: 'May 21', historical: null, predicted: 196 },
        { date: 'May 22', historical: null, predicted: 188 },
        { date: 'May 23', historical: null, predicted: 176 },
      ],
      rules: [
        { icon: 'critical', title: 'Critical', detail: '>190 ppm wear metals creates a high-priority Maintenance Request.' },
        { icon: 'warning', title: 'Warning', detail: '>110 ppm or rapid particle growth triggers lubricant sampling.' },
        { icon: 'healthy', title: 'Healthy', detail: 'Particle count below warning threshold with no abnormal viscosity drift.' },
      ],
    },
    Pressure: {
      currentReading: card.metric === 'Pressure' ? card.currentReading : '8.4 bar',
      warningThreshold: card.metric === 'Pressure' ? card.warningThreshold : '8.0 bar',
      criticalThreshold: card.metric === 'Pressure' ? card.criticalThreshold : '9.5 bar',
      trend: card.metric === 'Pressure' ? card.trend : '+7%',
      trendData: [
        { date: 'May 11', historical: 6.7, predicted: null },
        { date: 'May 12', historical: 6.9, predicted: null },
        { date: 'May 13', historical: 7.1, predicted: null },
        { date: 'May 14', historical: 7.4, predicted: null },
        { date: 'May 15', historical: 7.8, predicted: null },
        { date: 'May 16', historical: 8.1, predicted: null },
        { date: 'May 17', historical: 8.4, predicted: 8.4 },
        { date: 'May 18', historical: null, predicted: 8.7 },
        { date: 'May 19', historical: null, predicted: 9.0 },
        { date: 'May 20', historical: null, predicted: 9.3 },
        { date: 'May 21', historical: null, predicted: 9.6 },
        { date: 'May 22', historical: null, predicted: 9.2 },
        { date: 'May 23', historical: null, predicted: 8.9 },
      ],
      rules: [
        { icon: 'critical', title: 'Critical', detail: '>9.5 bar or unstable pressure spikes creates a high-priority Maintenance Request.' },
        { icon: 'warning', title: 'Warning', detail: '>8.0 bar for 3 consecutive readings triggers valve and seal inspection.' },
        { icon: 'healthy', title: 'Healthy', detail: 'Pressure remains within operating band without recurring spikes.' },
      ],
    },
    Noise: {
      currentReading: card.metric === 'Noise' ? card.currentReading : '78.5 dB',
      warningThreshold: card.metric === 'Noise' ? card.warningThreshold : '80 dB',
      criticalThreshold: card.metric === 'Noise' ? card.criticalThreshold : '85 dB',
      trend: card.metric === 'Noise' ? card.trend : '+12%',
      trendData: [
        { date: 'May 11', historical: 68, predicted: null },
        { date: 'May 12', historical: 70, predicted: null },
        { date: 'May 13', historical: 71, predicted: null },
        { date: 'May 14', historical: 73, predicted: null },
        { date: 'May 15', historical: 75, predicted: null },
        { date: 'May 16', historical: 77, predicted: null },
        { date: 'May 17', historical: 78.5, predicted: 78.5 },
        { date: 'May 18', historical: null, predicted: 80 },
        { date: 'May 19', historical: null, predicted: 82 },
        { date: 'May 20', historical: null, predicted: 84 },
        { date: 'May 21', historical: null, predicted: 86 },
        { date: 'May 22', historical: null, predicted: 84 },
        { date: 'May 23', historical: null, predicted: 81 },
      ],
      rules: [
        { icon: 'critical', title: 'Critical', detail: '>85 dB or +15%/24h creates a high-priority Maintenance Request.' },
        { icon: 'warning', title: 'Warning', detail: '>80 dB for 3 consecutive readings triggers inspection.' },
        { icon: 'healthy', title: 'Healthy', detail: 'Health Score > 85% and noise below warning threshold.' },
      ],
    },
  };

  return data[metric];
};

function CbmTrendChart({ metricData, severityColor }: { metricData: CbmMetricData; severityColor: string }) {
  const warningThreshold = getThresholdValue(metricData.warningThreshold, 3.5);
  const criticalThreshold = getThresholdValue(metricData.criticalThreshold, 5);
  const yMax = Math.max(criticalThreshold + 0.8, 5.8);
  const yTicks = yMax <= 6
    ? [0, 1, 2, 3, 4, 5]
    : Array.from({ length: 6 }, (_, index) => Number(((yMax / 5) * index).toFixed(yMax > 30 ? 0 : 1)));

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ height: 294, width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%" minHeight={0}>
          <LineChart data={metricData.trendData} margin={{ left: yMax > 30 ? -4 : -18, right: 18, top: 12, bottom: 8 }}>
            <CartesianGrid stroke={tokenDivider} strokeDasharray="3 3" vertical horizontal />
            <ReferenceArea y1={warningThreshold} y2={criticalThreshold} fill="#F97316" fillOpacity={0.08} ifOverflow="extendDomain" />
            <ReferenceArea y1={criticalThreshold} y2={yMax} fill="#EF4444" fillOpacity={0.08} ifOverflow="extendDomain" />
            <ReferenceArea x1="May 17" x2="May 23" fill="#CBD5E1" fillOpacity={0.18} />
            <ReferenceLine y={warningThreshold} stroke="#F97316" strokeWidth={2} ifOverflow="extendDomain" />
            <ReferenceLine y={criticalThreshold} stroke="#EF4444" strokeWidth={2} ifOverflow="extendDomain" />
            <XAxis
              dataKey="date"
              axisLine={{ stroke: tokenDivider }}
              tickLine={false}
              interval="preserveStartEnd"
              tick={{ fill: tokenText.secondary, fontSize: 10, fontWeight: 600 }}
              padding={{ left: 4, right: 4 }}
            />
            <YAxis
              domain={[0, yMax]}
              ticks={yTicks}
              axisLine={{ stroke: tokenDivider }}
              tickLine={false}
              tick={{ fill: tokenText.secondary, fontSize: 10, fontWeight: 600 }}
              width={yMax > 30 ? 46 : 34}
            />
            <Line
              type="monotone"
              dataKey="historical"
              stroke={severityColor}
              strokeWidth={2.5}
              dot={{ r: 5, strokeWidth: 2, fill: 'background.paper', stroke: severityColor }}
              activeDot={{ r: 6, strokeWidth: 2, fill: 'background.paper', stroke: severityColor }}
              connectNulls={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="predicted"
              stroke="#64748B"
              strokeWidth={2.5}
              strokeDasharray="5 4"
              dot={{ r: 4, strokeWidth: 2, fill: 'background.paper', stroke: tokenText.secondary }}
              activeDot={{ r: 5, strokeWidth: 2, fill: 'background.paper', stroke: tokenText.secondary }}
              connectNulls={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2.2, flexWrap: 'wrap', mt: 0.4 }}>
        {[
          { label: 'Historical Data', color: severityColor, dash: 'none' },
          { label: 'Predicted Values', color: tokenText.secondary, dash: '5px 4px' },
          { label: `Alert Zone (>${warningThreshold})`, color: '#F97316', dash: 'none' },
          { label: `Critical Zone (>${criticalThreshold})`, color: '#EF4444', dash: 'none' },
        ].map((item) => (
          <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 17, borderTop: `4px ${item.dash === 'none' ? 'solid' : 'dashed'} ${item.color}`, borderRadius: 99 }} />
            <Typography variant="caption" sx={{ color: tokenText.secondary, fontWeight: 600, fontSize: '0.68rem' }}>
              {item.label}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

function CbmStatusCard({ card, onOpen }: { card: CbmMonitoringCard; onOpen: (card: CbmMonitoringCard) => void }) {
  const severity = severityStyles[card.severity];

  return (
    <Paper
      elevation={0}
      component="button"
      onClick={() => onOpen(card)}
      sx={{
        width: '100%',
        height: 104,
        minHeight: 104,
        textAlign: 'left',
        p: 0.9,
        borderRadius: '12px',
        border: `1px solid ${tokenDivider}`,
        borderLeft: `4px solid ${severity.tone}`,
        bgcolor: 'background.paper',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'stretch',
        justifyContent: 'space-between',
        gap: 0.75,
        overflow: 'hidden',
        transition: 'all 0.18s ease',
        '&:hover': {
          transform: 'translateY(-1px)',
          boxShadow: 'var(--card-shadow)',
          borderColor: tokenBrand.main,
          borderLeftColor: severity.tone,
        },
      }}
    >
      <Box sx={{ minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 0.4 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.45, minWidth: 0 }}>
            <AssetCriticalityTag value={card.grade} asset={card.asset} />
            <Typography variant="body2" noWrap sx={{ color: tokenText.primary, fontWeight: 800, lineHeight: 1.15 }}>
              {card.asset}
            </Typography>
          </Box>
          {card.parameter !== 'All parameters operating normally' ? (
            <Typography variant="caption" noWrap sx={{ color: tokenText.secondary, display: 'block', mt: 0.15, fontWeight: 600 }}>
              {card.parameter}
            </Typography>
          ) : null}
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0.35, maxHeight: 44, overflow: 'hidden' }}>
          {card.severity !== 'normal' ? (
            <Chip
              label={severity.label}
              size="small"
              sx={{
                height: 20,
                borderRadius: '999px',
                ...parameterStatusTagSx,
                borderColor: 'transparent',
                fontSize: '0.62rem',
                fontWeight: 900,
                maxWidth: 150,
                '& .MuiChip-label': { px: 0.7 },
              }}
            />
          ) : (
            <Chip
              label={severity.label}
              size="small"
              sx={{
                height: 20,
                borderRadius: '999px',
                ...parameterStatusTagSx,
                fontSize: '0.6rem',
                fontWeight: 900,
                maxWidth: 214,
                '& .MuiChip-label': { px: 0.65 },
              }}
            />
          )}
          <Chip
            icon={<SparkleIcon sx={{ fontSize: '12px !important', color: `${tokenBrand.main} !important` }} />}
            label={`AI Recommendation (${card.recommendationCount})`}
            size="small"
            sx={{
              height: 20,
              borderRadius: '999px',
              bgcolor: tokenBrand.softBg,
              color: tokenBrand.main,
              fontSize: '0.61rem',
              fontWeight: 800,
              maxWidth: 164,
              '& .MuiChip-label': { px: 0.5 },
            }}
          />
        </Box>
      </Box>

      <Box sx={{ minWidth: 54, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center' }}>
        <Typography variant="h5" sx={{ color: severity.tone, fontWeight: 900, lineHeight: 0.9 }}>
          {card.healthScore}
          <Box component="span" sx={{ fontSize: '0.8rem', ml: 0.25, fontWeight: 800 }}>
            %
          </Box>
        </Typography>
        <Typography variant="caption" sx={{ color: tokenText.secondary, fontWeight: 600, mt: 0.25, fontSize: '0.62rem' }}>
          Health Score
        </Typography>
      </Box>
    </Paper>
  );
}

function PostInterventionCard({ item }: { item: (typeof postInterventionCards)[number] }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.1,
        height: '100%',
        minHeight: 106,
        borderRadius: '12px',
        border: `1px solid ${tokenDivider}`,
        borderLeft: `4px solid ${item.tone}`,
        bgcolor: 'background.paper',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, mb: 0.7 }}>
        <Box sx={{ minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.45, minWidth: 0 }}>
            <AssetCriticalityTag value={getAssetCriticality(item.asset)} asset={item.asset} />
            <Typography variant="body2" noWrap sx={{ color: tokenText.primary, fontWeight: 900 }}>
              {item.asset}
            </Typography>
          </Box>
          <Typography variant="caption" sx={{ color: tokenText.secondary, fontWeight: 600 }}>
            {item.parameter} post-adjustment monitoring
          </Typography>
        </Box>
        <Typography variant="h5" sx={{ color: item.tone, fontWeight: 900, lineHeight: 1 }}>
          {item.healthScore}
          <Box component="span" sx={{ fontSize: '0.74rem', ml: 0.2 }}>%</Box>
        </Typography>
      </Box>
      <Typography variant="caption" sx={{ color: tokenText.primary, display: 'block', fontWeight: 700, lineHeight: 1.25 }}>
        {item.intervention}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap', mt: 0.8 }}>
        <Chip label={item.window} size="small" sx={{ height: 20, bgcolor: tokenBrand.softBg, color: tokenBrand.main, fontSize: '0.62rem', fontWeight: 900, borderRadius: '999px' }} />
        <Chip label={item.owner} size="small" sx={{ height: 20, bgcolor: tokenNeutral.lighter, color: tokenText.secondary, fontSize: '0.62rem', fontWeight: 800, borderRadius: '999px' }} />
      </Box>
    </Paper>
  );
}

function AddParameterMonitoringDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [selectedMetric, setSelectedMetric] = useState<CbmMetric>('Noise');
  const [drafts, setDrafts] = useState<Record<CbmMetric, ParameterMonitoringDraft>>(parameterMonitoringDefaults);
  const draft = drafts[selectedMetric];
  const unit = parameterMonitoringUnits[selectedMetric];
  const updateDraft = (updates: Partial<ParameterMonitoringDraft>) => {
    setDrafts((currentDrafts) => ({
      ...currentDrafts,
      [selectedMetric]: {
        ...currentDrafts[selectedMetric],
        ...updates,
      },
    }));
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      PaperProps={{
        sx: {
          width: 'min(460px, 94vw)',
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '12px',
          border: `1px solid ${tokenDivider}`,
          bgcolor: 'background.paper',
          overflow: 'hidden',
        },
      }}
    >
      <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1, borderBottom: `1px solid ${tokenDivider}` }}>
        <Box>
          <Typography variant="subtitle1" sx={{ color: tokenText.primary, fontWeight: 700, lineHeight: 1 }}>
            Add Parameter Monitoring
          </Typography>
          <Typography variant="caption" sx={{ color: tokenText.secondary, fontWeight: 500 }}>
            Configure thresholds and limits for a monitored parameter.
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color: tokenText.secondary }}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Box
        sx={{
          p: 1,
          display: 'flex',
          flex: 1,
          flexDirection: 'column',
          gap: 0.7,
          overflowY: 'auto',
          '& .MuiInputBase-root': { minHeight: 34 },
          '& .MuiInputBase-input': { py: 0.7 },
          '& .MuiInputLabel-root': { fontSize: '0.78rem' },
        }}
      >
        <Grid container spacing={0.7}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="small"
              label="Equipment"
              value={draft.equipment}
              onChange={(event) => updateDraft({ equipment: event.target.value })}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Parameter Type</InputLabel>
              <Select
                label="Parameter Type"
                value={selectedMetric}
                onChange={(event) => setSelectedMetric(event.target.value as CbmMetric)}
              >
                {cbmMetricOptions.map((metric) => (
                  <MenuItem key={metric} value={metric}>
                    {metric}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Paper elevation={0} sx={{ p: 0.8, borderRadius: '8px', border: `1px solid ${tokenDivider}`, bgcolor: 'background.default' }}>
          <Typography variant="body2" sx={{ color: tokenText.primary, fontWeight: 700, mb: 0.55 }}>
            Acceptable Operating Range ({unit})
          </Typography>
          <Grid container spacing={0.7}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                size="small"
                label="Minimum"
                value={draft.operatingMin}
                onChange={(event) => updateDraft({ operatingMin: event.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                size="small"
                label="Maximum"
                value={draft.operatingMax}
                onChange={(event) => updateDraft({ operatingMax: event.target.value })}
              />
            </Grid>
          </Grid>
        </Paper>

        {[
          {
            title: `Warning Range (${unit})`,
            enabled: draft.warningEnabled,
            low: draft.warningLow,
            high: draft.warningHigh,
            onEnabledChange: (checked: boolean) => updateDraft({ warningEnabled: checked }),
            onLowChange: (value: string) => updateDraft({ warningLow: value }),
            onHighChange: (value: string) => updateDraft({ warningHigh: value }),
          },
          {
            title: `Critical Range (${unit})`,
            enabled: draft.criticalEnabled,
            low: draft.criticalLow,
            high: draft.criticalHigh,
            onEnabledChange: (checked: boolean) => updateDraft({ criticalEnabled: checked }),
            onLowChange: (value: string) => updateDraft({ criticalLow: value }),
            onHighChange: (value: string) => updateDraft({ criticalHigh: value }),
          },
        ].map((section) => (
          <Paper key={section.title} elevation={0} sx={{ p: 0.8, borderRadius: '8px', border: `1px solid ${tokenDivider}`, bgcolor: 'background.default' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.55 }}>
              <Typography variant="body2" sx={{ color: tokenText.primary, fontWeight: 700 }}>
                {section.title}
              </Typography>
              <Switch checked={section.enabled} onChange={(event) => section.onEnabledChange(event.target.checked)} size="small" />
            </Box>
            <Grid container spacing={0.7}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Low Threshold"
                  value={section.low}
                  onChange={(event) => section.onLowChange(event.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="High Threshold"
                  value={section.high}
                  onChange={(event) => section.onHighChange(event.target.value)}
                />
              </Grid>
            </Grid>
          </Paper>
        ))}

        <Paper elevation={0} sx={{ p: 0.8, borderRadius: '8px', border: `1px solid ${tokenDivider}`, bgcolor: 'background.default' }}>
          <Typography variant="body2" sx={{ color: tokenText.primary, fontWeight: 700, mb: 0.35 }}>
            Data Source
          </Typography>
          <Typography variant="caption" sx={{ color: tokenText.secondary, display: 'block', mb: 0.5 }}>
            Select the data source that feeds this parameter.
          </Typography>
          <FormControl fullWidth size="small">
            <Select displayEmpty value={draft.dataSource} onChange={(event) => updateDraft({ dataSource: event.target.value })}>
              <MenuItem value="">Select data source...</MenuItem>
              <MenuItem value="sensor">Line 10 sensor historian</MenuItem>
              <MenuItem value="manual">Manual operator reading</MenuItem>
            </Select>
          </FormControl>
        </Paper>

        <Paper elevation={0} sx={{ p: 0.8, borderRadius: '8px', border: `1px solid ${tokenDivider}`, bgcolor: 'background.default' }}>
          <Typography variant="body2" sx={{ color: tokenText.primary, fontWeight: 700, mb: 0.35 }}>
            Sampling Frequency
          </Typography>
          <Typography variant="caption" sx={{ color: tokenText.secondary, display: 'block', mb: 0.5 }}>
            Define how often data is collected for this parameter.
          </Typography>
          <Grid container spacing={0.7}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                size="small"
                label="Interval"
                value={draft.samplingInterval}
                onChange={(event) => updateDraft({ samplingInterval: event.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Unit</InputLabel>
                <Select label="Unit" value={draft.samplingUnit} onChange={(event) => updateDraft({ samplingUnit: event.target.value })}>
                  <MenuItem value="Minutes">Minutes</MenuItem>
                  <MenuItem value="Hours">Hours</MenuItem>
                  <MenuItem value="Days">Days</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

      </Box>

      <Box sx={{ px: 2, py: 1.5, display: 'flex', justifyContent: 'flex-end', gap: 1, borderTop: `1px solid ${tokenDivider}` }}>
        <Button variant="outlined" size="small" onClick={onClose} sx={{ borderRadius: '8px', color: tokenBrand.main, borderColor: tokenDivider }}>
          Cancel
        </Button>
        <Button variant="contained" size="small" onClick={onClose} sx={{ borderRadius: '8px', bgcolor: tokenBrand.main, color: '#FFFFFF' }}>
          Create Monitoring
        </Button>
      </Box>
    </Dialog>
  );
}

function SparePartsAvailabilityDialog({
  card,
  open,
  onClose,
}: {
  card: CbmMonitoringCard;
  open: boolean;
  onClose: () => void;
}) {
  const parts = sparePartsByAsset[card.asset] ?? {
    availability: 74,
    available: ['Standard bearing kit', 'Sensor cable harness', 'Mounting hardware'],
    missing: ['OEM calibration kit'],
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      PaperProps={{
        sx: {
          width: 'min(520px, 94vw)',
          borderRadius: '12px',
          border: `1px solid ${tokenDivider}`,
          bgcolor: 'background.paper',
        },
      }}
    >
      <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', borderBottom: `1px solid ${tokenDivider}` }}>
        <Box>
          <Typography variant="h6" sx={{ color: tokenText.primary, fontWeight: 700, lineHeight: 1 }}>
            Spare Parts Availability
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.45, mt: 0.25, minWidth: 0 }}>
            <AssetCriticalityTag value={card.grade} asset={card.asset} />
            <Typography variant="caption" noWrap sx={{ color: tokenText.secondary, fontWeight: 500 }}>
              {card.asset} / {card.assetCode}
            </Typography>
          </Box>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color: tokenText.secondary }}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Box sx={{ p: 1.5 }}>
        <Paper elevation={0} sx={{ p: 1.2, borderRadius: '8px', border: `1px solid ${tokenDivider}`, borderLeft: `4px solid ${parts.availability >= 80 ? tokenSuccess.main : tokenWarning.main}`, mb: 1.2 }}>
          <Typography variant="h4" sx={{ color: parts.availability >= 80 ? tokenSuccess.main : tokenWarning.main, fontWeight: 700, lineHeight: 1 }}>
            {parts.availability}%
          </Typography>
          <Typography variant="caption" sx={{ color: tokenText.secondary, fontWeight: 600 }}>
            Parts available for the recommended intervention
          </Typography>
        </Paper>

        <Grid container spacing={1.2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper elevation={0} sx={{ p: 1.1, height: '100%', borderRadius: '8px', border: `1px solid ${tokenSuccess.lightest}`, bgcolor: tokenSuccess.softBg }}>
              <Typography variant="body2" sx={{ color: tokenSuccess.darker, fontWeight: 700, mb: 0.8 }}>
                Available
              </Typography>
              {parts.available.map((part) => (
                <Box key={part} sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mb: 0.6 }}>
                  <CheckIcon sx={{ fontSize: 15, color: tokenSuccess.main }} />
                  <Typography variant="caption" sx={{ color: tokenText.primary, fontWeight: 700 }}>
                    {part}
                  </Typography>
                </Box>
              ))}
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper elevation={0} sx={{ p: 1.1, height: '100%', borderRadius: '8px', border: `1px solid ${tokenError.lightest}`, bgcolor: tokenError.softBg }}>
              <Typography variant="body2" sx={{ color: tokenError.dark, fontWeight: 700, mb: 0.8 }}>
                Missing
              </Typography>
              {parts.missing.map((part) => (
                <Box key={part} sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mb: 0.6 }}>
                  <WarningIcon sx={{ fontSize: 15, color: tokenError.main }} />
                  <Typography variant="caption" sx={{ color: tokenText.primary, fontWeight: 700 }}>
                    {part}
                  </Typography>
                </Box>
              ))}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Dialog>
  );
}

function AlertPanel({
  title,
  action,
  children,
  hideIcon = false,
  titleColor = activeTheme.primary,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  hideIcon?: boolean;
  titleColor?: string;
}) {
  const mappedTitleColor = titleColor === '#000000'
    ? tokenText.primary
    : (titleColor === activeTheme.primary ? tokenBrand.main : titleColor);

  return (
    <Paper elevation={0} sx={{ borderRadius: '12px', border: `1px solid ${tokenDivider}`, overflow: 'hidden', height: '100%', bgcolor: 'background.paper' }}>
      <Box sx={{ px: 1.2, py: 0.95, bgcolor: tokenNeutral.lightest, borderBottom: `1px solid ${tokenDivider}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
        <Typography variant="subtitle1" sx={{ color: mappedTitleColor, fontWeight: 700 }}>
          {!hideIcon && <WarningIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: '-3px' }} />}
          {title}
        </Typography>
        {action}
      </Box>
      <Box sx={{ p: 1.1 }}>{children}</Box>
    </Paper>
  );
}

function SensorAlertsGrid() {
  const [expanded, setExpanded] = useState(true);

  return (
    <Box
      sx={{
        mb: 1.25,
        p: 1.5,
        borderRadius: '12px',
        bgcolor: tokenNeutral.lightest,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: expanded ? 1.5 : 0, px: 0.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SparkleIcon sx={{ fontSize: 16, color: '#F97316' }} />
          <Typography sx={{ color: tokenBrand.main, fontSize: '0.875rem', fontWeight: 700 }}>
            BLU.AI analysis
          </Typography>
        </Box>
        <Button
          size="small"
          onClick={() => setExpanded((current) => !current)}
          sx={{
            color: tokenText.secondary,
            fontSize: '0.75rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            minWidth: 0,
            p: 0,
          }}
        >
          {expanded ? 'Collapse' : 'Expand'}
        </Button>
      </Box>

      {expanded ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {sensorAlerts.map((alert, index) => {
            const isHighlighted = index === 0;
            return (
              <Box
                key={`${alert.asset}-${alert.parameter}`}
                sx={{
                  px: isHighlighted ? 2 : 1,
                  py: isHighlighted ? 1.5 : 0.5,
                  borderRadius: '6px',
                  border: isHighlighted ? `1px solid ${tokenDivider}` : '1px solid transparent',
                  bgcolor: isHighlighted ? 'rgba(0,0,0,0.03)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  minWidth: 0,
                }}
              >
                <WarningIcon sx={{ fontSize: 16, color: tokenError.main, flexShrink: 0 }} />
                <Typography sx={{ color: tokenText.secondary, fontSize: '0.75rem', fontWeight: 400, flex: 1 }}>
                  <Box component="span" sx={{ color: tokenText.primary, fontWeight: 700 }}>
                    Sensor alert: {alert.asset}
                  </Box>{' '}
                  in {alert.location} has {alert.parameter.toLowerCase()} at{' '}
                  <Box component="span" sx={{ color: tokenWarning.main, fontWeight: 700 }}>
                    {alert.value}
                  </Box>{' '}
                  versus target {alert.target}. Last detected {alert.age}.
                </Typography>
              </Box>
            );
          })}
        </Box>
      ) : null}
    </Box>
  );
}

function AlertsDashboard() {
  return (
    <Box sx={{ p: 1 }}>
      <Grid container spacing={1.2}>
        <Grid size={{ xs: 12 }}>
          <AlertPanel title={`Maintenance Requests (${maintenanceRequests.length})`} titleColor="#000000" hideIcon>
            <Grid container spacing={0.9}>
              {maintenanceRequests.map((request) => (
                <Grid key={request.id} size={{ xs: 12, sm: 6, lg: 4, xl: 3 }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 0.65,
                      minHeight: 82,
                      height: '100%',
                      borderRadius: '12px',
                      border: `1px solid ${tokenDivider}`,
                      bgcolor: 'background.paper',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 0.35,
                    }}
                  >
                    <Box sx={{ minWidth: 0 }}>
                      <Box sx={{ minWidth: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.45, minWidth: 0 }}>
                          <AssetCriticalityTag value={getAssetCriticality(request.asset)} asset={request.asset} />
                          <Typography variant="body2" noWrap sx={{ color: tokenText.primary, display: 'block', fontWeight: 900, fontSize: '0.86rem', lineHeight: 1.12 }}>
                            {request.asset}
                          </Typography>
                        </Box>
                        <Typography
                          variant="caption"
                          sx={{
                            color: tokenText.secondary,
                            display: '-webkit-box',
                            mt: 0.35,
                            minHeight: '1.7rem',
                            overflow: 'hidden',
                            WebkitBoxOrient: 'vertical',
                            WebkitLineClamp: 2,
                            fontWeight: 750,
                            fontSize: '0.68rem',
                            lineHeight: 1.25,
                          }}
                        >
                          {request.description}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 0.55, flexWrap: 'wrap', mt: 'auto' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, minWidth: 0 }}>
                        <FolderIcon sx={{ fontSize: 13, color: tokenText.secondary }} />
                        <Typography variant="caption" noWrap sx={{ color: tokenText.secondary, fontSize: '0.64rem', fontWeight: 850 }}>
                          {request.id}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                        <PlaceIcon sx={{ fontSize: 13, color: tokenText.secondary }} />
                        <Typography variant="caption" sx={{ color: tokenText.secondary, fontSize: '0.64rem', fontWeight: 850 }}>
                          {request.zone}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                        <WrenchIcon sx={{ fontSize: 13, color: tokenText.secondary }} />
                        <Typography variant="caption" sx={{ color: tokenText.secondary, fontSize: '0.64rem', fontWeight: 850 }}>
                          Maintenance Request
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ pt: 0.45, borderTop: `1px solid ${tokenDivider}`, display: 'flex', alignItems: 'center', gap: 0.3, minWidth: 0 }}>
                      <PersonIcon sx={{ fontSize: 13, color: tokenText.secondary, flexShrink: 0 }} />
                      <Typography variant="caption" noWrap sx={{ color: tokenText.secondary, fontSize: '0.63rem', fontWeight: 800 }}>
                        Created by {request.createdBy} on {request.sentAt}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </AlertPanel>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <AlertPanel title={`Work Orders (${predictiveWorkOrders.length})`} titleColor="#000000" hideIcon>
            <Grid container spacing={0.9}>
              {predictiveWorkOrders.map((order) => (
                <Grid key={order.id} size={{ xs: 12, sm: 6, lg: 4, xl: 3 }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 0.65,
                      minHeight: 82,
                      borderRadius: '12px',
                      border: `1px solid ${tokenDivider}`,
                      bgcolor: 'background.paper',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 0.35,
                      position: 'relative',
                    }}
                  >
                    <Chip
                      label={order.status === 'Scheduled' ? 'Schedule' : order.status}
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 6,
                        right: 6,
                        height: 20,
                        bgcolor: tokenBrand.softBg,
                        color: tokenBrand.main,
                        fontSize: '0.6rem',
                        fontWeight: 900,
                        borderRadius: '999px',
                      }}
                    />
                    <Box sx={{ minWidth: 0, pr: 8 }}>
                      <Box sx={{ minWidth: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.45, minWidth: 0 }}>
                          <AssetCriticalityTag value={getAssetCriticality(order.asset)} asset={order.asset} />
                          <Typography variant="body2" noWrap sx={{ color: tokenText.primary, display: 'block', fontWeight: 900, fontSize: '0.86rem', lineHeight: 1.12 }}>
                            {order.asset}
                          </Typography>
                        </Box>
                        <Typography variant="caption" sx={{ color: tokenText.secondary, display: 'block', mt: 0.35, fontWeight: 750, fontSize: '0.68rem', lineHeight: 1.25 }}>
                          {order.description}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 0.55, flexWrap: 'wrap', mt: 'auto' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, minWidth: 0 }}>
                        <FolderIcon sx={{ fontSize: 13, color: tokenText.secondary }} />
                        <Typography variant="caption" noWrap sx={{ color: tokenText.secondary, fontSize: '0.64rem', fontWeight: 850 }}>
                          {order.id}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                        <PlaceIcon sx={{ fontSize: 13, color: tokenText.secondary }} />
                        <Typography variant="caption" sx={{ color: tokenText.secondary, fontSize: '0.64rem', fontWeight: 850 }}>
                          {order.zone}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </AlertPanel>
        </Grid>
      </Grid>
    </Box>
  );
}

function CbmModal({
  card,
  open,
  onClose,
  onOpenMaintenanceRequestEntry,
}: {
  card: CbmMonitoringCard | null;
  open: boolean;
  onClose: () => void;
  onOpenMaintenanceRequestEntry?: () => void;
}) {
  const [activeMetric, setActiveMetric] = useState<CbmMetric>('Vibration');

  useEffect(() => {
    if (card) {
      setActiveMetric(toCbmMetric(card.metric));
    }
  }, [card?.id, card?.metric]);

  if (!card) return null;

  const severity = severityStyles[card.severity];
  const spareParts = sparePartsByAsset[card.asset] ?? {
    availability: 74,
    available: ['Standard bearing kit', 'Sensor cable harness', 'Mounting hardware'],
    missing: ['OEM calibration kit'],
  };
  const activeMetricData = getCbmMetricData(card, activeMetric);

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth={false}
        PaperProps={{
          sx: {
            width: 'min(1400px, 96vw)',
            maxHeight: '92vh',
            borderRadius: '16px',
            p: 0,
            overflow: 'hidden',
            border: `1px solid ${tokenDivider}`,
            bgcolor: 'background.default',
          },
        }}
      >
      <Box sx={{ px: 2, py: 1.5, bgcolor: 'background.paper', borderBottom: `1px solid ${tokenDivider}`, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7, flexWrap: 'wrap' }}>
            <AssetCriticalityTag value={card.grade} asset={card.asset} />
            <Typography variant="h6" sx={{ color: tokenText.primary, fontWeight: 700, lineHeight: 1 }}>
              {card.asset}
            </Typography>
            <Chip
              label={severity.label.toUpperCase()}
              size="small"
              sx={{ height: 20, bgcolor: severity.tone, color: '#FFFFFF', fontSize: '0.62rem', fontWeight: 950, borderRadius: '999px' }}
            />
          </Box>
          <Typography variant="caption" sx={{ color: tokenText.secondary, fontWeight: 500 }}>
            {card.assetCode} / {card.area} / Line 10 / Zone 1
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.65, flexShrink: 0 }}>
          <Button
            size="small"
            variant="outlined"
            onClick={onOpenMaintenanceRequestEntry}
            sx={{
              height: 30,
              borderRadius: '8px',
              px: 1.5,
              borderColor: tokenDivider,
              color: tokenText.secondary,
              fontWeight: 700,
              fontSize: '0.8125rem',
              textTransform: 'none',
              '&:hover': {
                borderColor: tokenText.primary,
                bgcolor: tokenNeutral.lightest,
              },
            }}
          >
            Open Maintenance Request form
          </Button>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              width: 30,
              height: 30,
              borderRadius: '8px',
              border: `1px solid ${tokenDivider}`,
              color: tokenText.secondary,
              bgcolor: 'background.paper',
              '&:hover': {
                bgcolor: tokenNeutral.lightest,
                borderColor: tokenText.primary,
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>

      <Box sx={{ p: 1.5, overflowY: 'auto' }}>
        <Grid container spacing={1.4}>
          <Grid size={{ xs: 12, lg: 7.7 }}>
            <Grid container spacing={1.2} alignItems="stretch" sx={{ mb: 1.2 }}>
              <Grid size={{ xs: 12, md: 7 }}>
                <Paper elevation={0} sx={{ height: '100%', p: 1.2, borderRadius: '12px', border: `1px solid ${tokenDivider}`, bgcolor: 'background.paper' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1 }}>
                    <Box>
                      <Typography variant="subtitle1" sx={{ color: tokenBrand.main, fontWeight: 700 }}>
                        <SparkleIcon sx={{ fontSize: 15, mr: 0.4, verticalAlign: '-2px', color: '#FF6E00' }} />
                        BLU.AI Recommendation
                      </Typography>
                      <Typography variant="caption" sx={{ color: tokenText.secondary, fontWeight: 500 }}>
                        Ranked actions generated from sensor trend and maintenance history
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.65, maxHeight: 92, overflowY: 'auto', pr: 0.5 }}>
                    {[
                      `${card.recommended} based on subtle sensor readings on ${card.asset}.`,
                      `${card.metric} drift trending upward; inspect the local component before next shift.`,
                      'Temperature variance outside baseline; compare against last PM calibration.',
                    ].map((recommendation, index) => (
                      <Box key={recommendation} sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.7 }}>
                        <CheckIcon sx={{ fontSize: 15, mt: 0.25, color: index === 0 ? tokenBrand.main : tokenText.secondary }} />
                        <Typography variant="body2" sx={{ color: index === 0 ? tokenText.primary : tokenText.secondary, fontWeight: index === 0 ? 800 : 600 }}>
                          {recommendation}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, md: 5 }}>
                <Paper elevation={0} sx={{ height: '100%', p: 1.2, borderRadius: '12px', border: `1px solid ${tokenDivider}`, bgcolor: 'background.paper' }}>
                  <Typography variant="subtitle1" sx={{ color: tokenText.primary, fontWeight: 700, mb: 1 }}>
                    Health Summary
                  </Typography>
                  <Grid container spacing={1}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <MetricTile label="Health Score" value={`${card.healthScore}%`} accent={severity.tone} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <MetricTile label="Target" value="85%" accent="#64748B" />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <MetricTile label="Predicted Failure" value={`${card.daysToFailure}`} suffix="days" accent="#EF4444" />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <MetricTile label="Sensor Health" value="Good" accent="#2563EB" />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>

            <Paper
              elevation={0}
              sx={{
                borderRadius: '12px',
                border: `1px solid ${tokenDivider}`,
                bgcolor: 'background.paper',
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(12, minmax(0, 1fr))',
                }}
              >
                <Box sx={{ gridColumn: '1 / -1', p: 1.2 }}>
                  <Grid container spacing={1}>
                    <Grid size={{ xs: 6, md: 3 }}>
                      <MetricTile label="Current Value" value={activeMetricData.currentReading.split(' ')[0]} suffix={activeMetricData.currentReading.split(' ').slice(1).join(' ')} accent="#64748B" />
                    </Grid>
                    <Grid size={{ xs: 6, md: 3 }}>
                      <MetricTile label="Warning Threshold" value={activeMetricData.warningThreshold.split(' ')[0]} suffix={activeMetricData.warningThreshold.split(' ').slice(1).join(' ')} accent="#F97316" />
                    </Grid>
                    <Grid size={{ xs: 6, md: 3 }}>
                      <MetricTile label="Critical Threshold" value={activeMetricData.criticalThreshold.split(' ')[0]} suffix={activeMetricData.criticalThreshold.split(' ').slice(1).join(' ')} accent="#EF4444" />
                    </Grid>
                    <Grid size={{ xs: 6, md: 3 }}>
                      <MetricTile label="Trend (24h)" value={activeMetricData.trend} accent={severity.tone} />
                    </Grid>
                  </Grid>
                </Box>

                <Box sx={{ gridColumn: '1 / -1', p: 1.2, borderTop: `1px solid ${tokenDivider}` }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 0.4, flexWrap: 'wrap' }}>
                    <Typography variant="subtitle1" sx={{ color: tokenText.primary, fontWeight: 700 }}>
                      Trend Analysis
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.45, flexWrap: 'wrap' }}>
                      {cbmMetricOptions.map((metric) => (
                        <Chip
                          key={metric}
                          label={metric}
                          size="small"
                          onClick={() => setActiveMetric(metric)}
                          sx={{
                            height: 24,
                            bgcolor: metric === activeMetric ? tokenBrand.main : tokenNeutral.lighter,
                            color: metric === activeMetric ? '#FFFFFF' : tokenText.primary,
                            fontWeight: 600,
                            fontSize: '0.68rem',
                            cursor: 'pointer',
                            borderRadius: '999px',
                            '&:hover': {
                              bgcolor: metric === activeMetric ? tokenBrand.dark : tokenNeutral.dark,
                            },
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                  <CbmTrendChart metricData={activeMetricData} severityColor={severity.tone} />
                </Box>

                <Box sx={{ gridColumn: '1 / -1', p: 1.2, borderTop: `1px solid ${tokenDivider}` }}>
                  <Typography variant="subtitle1" sx={{ color: tokenText.primary, fontWeight: 700, mb: 0.8 }}>
                    CBM Monitoring Rules
                  </Typography>
                  {activeMetricData.rules.map((rule) => {
                    const icon = rule.icon === 'healthy'
                      ? <CheckIcon sx={{ fontSize: 16, color: tokenBrand.main }} />
                      : <WarningIcon sx={{ fontSize: 16, color: rule.icon === 'critical' ? '#EF4444' : '#F97316' }} />;

                    return (
                      <Box key={rule.title} sx={{ display: 'flex', alignItems: 'center', gap: 0.7, mb: 0.65 }}>
                        {icon}
                        <Typography variant="body2" sx={{ color: tokenText.secondary }}>
                          <Box component="span" sx={{ color: tokenText.primary, fontWeight: 700 }}>{rule.title}</Box> {rule.detail}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, lg: 4.3 }}>
            <Paper elevation={0} sx={{ p: 1.2, borderRadius: '12px', border: `1px solid ${tokenDivider}`, bgcolor: 'background.paper', mb: 1.2 }}>
              <Typography variant="subtitle1" sx={{ color: tokenText.primary, fontWeight: 700, mb: 0.9 }}>
                Maintenance Context
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, max-content)', columnGap: 3, alignItems: 'stretch', pb: 0.85, mb: 0.85, borderBottom: `1px solid ${tokenDivider}` }}>
                {[
                  ['Last PM', '14/01/2026'],
                  ['Next PM', card.scheduled],
                ].map(([label, value]) => (
                  <Box key={label} sx={{ minWidth: 0 }}>
                    <Typography variant="caption" sx={{ color: tokenText.secondary, display: 'block', fontWeight: 600 }}>
                      {label}
                    </Typography>
                    <Typography variant="body2" sx={{ color: tokenText.primary, fontWeight: 700 }}>
                      {value}
                    </Typography>
                  </Box>
                ))}
              </Box>
              {[
                ['Work Description', 'Replace worn bearings and inspect spindle alignment'],
                ['Recommended Execution Date', card.recommended || 'Keep current PM cadence'],
              ].map(([label, value]) => (
                <Box key={label} sx={{ pb: 0.85, mb: 0.85, borderBottom: `1px solid ${tokenDivider}` }}>
                  <Typography variant="caption" sx={{ color: tokenText.secondary, display: 'block', fontWeight: 600 }}>
                    {label}
                  </Typography>
                  <Typography variant="body2" sx={{ color: tokenText.primary, fontWeight: 700 }}>
                    {value}
                  </Typography>
                </Box>
              ))}
            </Paper>

            <Paper elevation={0} sx={{ p: 1.2, borderRadius: '12px', border: `1px solid ${tokenDivider}`, bgcolor: 'background.paper', mb: 1.2 }}>
              <Typography variant="subtitle1" sx={{ color: tokenText.primary, fontWeight: 700, mb: 0.9 }}>
                Event History
              </Typography>
              {[
                { date: 'Mar 11, 2026', text: 'Threshold exceeded. Auto-MR created with High priority.', tag: 'Critical Event' },
                { date: 'Mar 11, 2026', text: 'Preventive task executed by Maintenance. Sensor recalibrated.', tag: 'Maintenance' },
                { date: 'Mar 10, 2026', text: 'Noise drift detected. Inspection request opened.', tag: 'Alert' },
                { date: 'Mar 10, 2026', text: 'Noise measured within normal operating range.', tag: 'Reading' },
              ].map((event) => (
                <Box
                  key={`${event.date}-${event.tag}`}
                  sx={{
                    border: `1px solid ${tokenDivider}`,
                    bgcolor: 'background.default',
                    borderRadius: '8px',
                    px: 0.85,
                    py: 0.55,
                    mb: 0.55,
                  }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.65, mb: 0.15, minWidth: 0 }}>
                      <Typography variant="caption" sx={{ color: tokenText.secondary, fontWeight: 600, lineHeight: 1.15 }}>
                        {event.date}
                      </Typography>
                      <Chip label={event.tag} size="small" sx={{ height: 18, bgcolor: tokenNeutral.lighter, color: tokenText.secondary, fontSize: '0.58rem', fontWeight: 700, borderRadius: '999px' }} />
                    </Box>
                    <Typography variant="body2" sx={{ color: tokenText.primary, fontWeight: 650 }}>
                      {event.text}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Paper>

            <Paper
              elevation={0}
              sx={{
                width: '100%',
                p: 1.2,
                borderRadius: '12px',
                border: `1px solid ${tokenDivider}`,
                bgcolor: 'background.paper',
                textAlign: 'left',
                mb: 1.2,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.2, mb: 0.9 }}>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="subtitle1" sx={{ color: tokenText.primary, fontWeight: 700, lineHeight: 1.1 }}>
                    Spare Parts Availability
                  </Typography>
                  <Typography variant="caption" sx={{ color: tokenText.secondary, fontWeight: 500 }}>
                    Parts readiness for this equipment
                  </Typography>
                </Box>
                <Typography
                  variant="h5"
                  sx={{
                    color: spareParts.availability >= 80 ? tokenSuccess.main : tokenWarning.main,
                    fontWeight: 700,
                    lineHeight: 1,
                    flexShrink: 0,
                  }}
                >
                  {spareParts.availability}%
                </Typography>
              </Box>
              <Paper elevation={0} sx={{ p: 1.2, borderRadius: '8px', border: `1px solid ${tokenDivider}`, borderLeft: `4px solid ${spareParts.availability >= 80 ? tokenSuccess.main : tokenWarning.main}`, mb: 1.2 }}>
                <Typography variant="h4" sx={{ color: spareParts.availability >= 80 ? tokenSuccess.main : tokenWarning.main, fontWeight: 700, lineHeight: 1 }}>
                  {spareParts.availability}%
                </Typography>
                <Typography variant="caption" sx={{ color: tokenText.secondary, fontWeight: 600 }}>
                  Parts available for the recommended intervention
                </Typography>
              </Paper>

              <Grid container spacing={1.2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Paper elevation={0} sx={{ p: 1.1, height: '100%', borderRadius: '8px', border: `1px solid ${tokenSuccess.lightest}`, bgcolor: tokenSuccess.softBg }}>
                    <Typography variant="body2" sx={{ color: tokenSuccess.darker, fontWeight: 700, mb: 0.8 }}>
                      Available
                    </Typography>
                    {spareParts.available.map((part) => (
                      <Box key={part} sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mb: 0.6 }}>
                        <CheckIcon sx={{ fontSize: 15, color: tokenSuccess.main }} />
                        <Typography variant="caption" sx={{ color: tokenText.primary, fontWeight: 700 }}>
                          {part}
                        </Typography>
                      </Box>
                    ))}
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Paper elevation={0} sx={{ p: 1.1, height: '100%', borderRadius: '8px', border: `1px solid ${tokenError.lightest}`, bgcolor: tokenError.softBg }}>
                    <Typography variant="body2" sx={{ color: tokenError.dark, fontWeight: 700, mb: 0.8 }}>
                      Missing
                    </Typography>
                    {spareParts.missing.length ? spareParts.missing.map((part) => (
                      <Box key={part} sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mb: 0.6 }}>
                        <WarningIcon sx={{ fontSize: 15, color: tokenError.main }} />
                        <Typography variant="caption" sx={{ color: tokenText.primary, fontWeight: 700 }}>
                          {part}
                        </Typography>
                      </Box>
                    )) : (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mb: 0.6 }}>
                        <CheckIcon sx={{ fontSize: 15, color: tokenSuccess.main }} />
                        <Typography variant="caption" sx={{ color: tokenText.primary, fontWeight: 700 }}>
                          No shortage risk
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Box>
      </Dialog>
    </>
  );
}

export default function MaintenanceCbmPdmPage({ activeTheme: propTheme, onOpenMaintenanceRequestEntry }: MaintenanceCbmPdmPageProps) {
  const primary = propTheme?.primary ?? activeTheme.primary;
  const [selectedCard, setSelectedCard] = useState<CbmMonitoringCard | null>(null);
  const [selectedHierarchyId, setSelectedHierarchyId] = useState('assembly');
  const [activeTab, setActiveTab] = useState<'monitoring' | 'postAdjustment' | 'alerts'>('monitoring');
  const [criticalityFilter, setCriticalityFilter] = useState<Severity[]>([]);
  const [isAddParameterOpen, setIsAddParameterOpen] = useState(false);

  const filteredCards = useMemo(() => {
    const byHierarchy = monitoringCards.filter((card) => card.hierarchyIds.includes(selectedHierarchyId));
    const hierarchySource = byHierarchy.length ? byHierarchy : monitoringCards;
    const source = activeTab === 'alerts' ? hierarchySource.filter((card) => card.severity !== 'normal') : hierarchySource;

    if (criticalityFilter.length) return source.filter((card) => criticalityFilter.includes(card.severity));
    return source;
  }, [activeTab, criticalityFilter, selectedHierarchyId]);

  const filteredPostInterventionCards = useMemo(() => {
    const hierarchySource = postInterventionCards.filter((item) => item.hierarchyIds.includes(selectedHierarchyId));

    if (criticalityFilter.length) return hierarchySource.filter((item) => criticalityFilter.includes(item.severity));
    return hierarchySource;
  }, [criticalityFilter, selectedHierarchyId]);

  const counts = useMemo(
    () => ({
      critical: monitoringCards.filter((card) => card.severity === 'critical').length,
      mediumCritical: monitoringCards.filter((card) => card.severity === 'mediumCritical').length,
      lessCritical: monitoringCards.filter((card) => card.severity === 'lessCritical').length,
      normal: monitoringCards.filter((card) => card.severity === 'normal').length,
      avgHealth: Math.round(monitoringCards.reduce((acc, card) => acc + card.healthScore, 0) / monitoringCards.length),
    }),
    [],
  );
  const postInterventionCounts = useMemo<Record<Severity, number>>(
    () => ({
      critical: postInterventionCards.filter((item) => item.severity === 'critical').length,
      mediumCritical: postInterventionCards.filter((item) => item.severity === 'mediumCritical').length,
      lessCritical: postInterventionCards.filter((item) => item.severity === 'lessCritical').length,
      normal: postInterventionCards.filter((item) => item.severity === 'normal').length,
    }),
    [],
  );

  const selectedHierarchyLabel = findHierarchyLabel(hierarchyTree, selectedHierarchyId);

  return (
    <Box sx={{ flexGrow: 1, minHeight: 'calc(100vh - 64px)', overflowY: 'auto', bgcolor: 'background.default', p: { xs: 1.4, md: 2 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1.5, mb: 1.6, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="h5" sx={{ color: tokenText.primary, fontWeight: 700, lineHeight: 1.1 }}>
            CBM & PdM
          </Typography>
        </Box>
      </Box>

      <Box sx={{ mb: 1.4 }}>
        <SensorAlertsGrid />
      </Box>

      <Grid container spacing={1.4} alignItems="stretch">
        <Grid size={{ xs: 12 }}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: '16px',
              border: `1px solid ${tokenDivider}`,
              bgcolor: 'background.paper',
              overflow: 'hidden',
            }}
          >
            {/* Card Header with Tabs */}
            <Box
              sx={{
                px: 2,
                pt: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
                borderBottom: `1px solid ${tokenDivider}`,
                width: '100%',
                flexWrap: 'wrap',
              }}
            >
              <Box sx={{ display: 'flex', gap: 3 }}>
                {[
                  { id: 'monitoring', label: 'Monitoring' },
                  { id: 'postAdjustment', label: 'Post-adjustment Monitoring Window' },
                  { id: 'alerts', label: 'Maintenance Request & Work Order by Predictive' },
                ].map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <Box
                      key={tab.id}
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setActiveTab(tab.id as any)}
                      sx={{
                        pb: 1.5,
                        cursor: 'pointer',
                        borderBottom: isActive ? `2px solid ${tokenBrand.main}` : '2px solid transparent',
                        color: isActive ? tokenText.primary : tokenText.secondary,
                        fontWeight: isActive ? 700 : 500,
                        fontSize: '0.875rem',
                        letterSpacing: '0.1px',
                        transition: 'all 0.2s ease',
                        '&:hover': { color: tokenBrand.main },
                      }}
                    >
                      {tab.label}
                    </Box>
                  );
                })}
              </Box>
              <Button
                variant="contained"
                size="small"
                startIcon={<AddIcon />}
                onClick={() => setIsAddParameterOpen(true)}
                sx={{
                  borderRadius: '8px',
                  bgcolor: tokenBrand.main,
                  color: '#FFFFFF',
                  fontWeight: 500,
                  textTransform: 'none',
                  boxShadow: 'none',
                  mb: 1.5,
                  '&:hover': {
                    bgcolor: tokenBrand.dark,
                    boxShadow: 'none',
                  },
                }}
              >
                Add Monitoring
              </Button>
            </Box>

            {activeTab === 'monitoring' ? (
              <>
                <Box sx={{ px: 2, pt: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <AssetHierarchyFilter
                      selectedId={selectedHierarchyId}
                      selectedLabel={selectedHierarchyLabel}
                      onSelect={setSelectedHierarchyId}
                    />
                    <CriticalityFilter value={criticalityFilter} onChange={setCriticalityFilter} counts={counts} />
                  </Box>
                  <Chip
                    label={`${filteredCards.length} of ${monitoringCards.length} Monitoring`}
                    size="small"
                    sx={{ bgcolor: tokenBrand.softBg, color: tokenBrand.main, fontWeight: 900, borderRadius: '999px' }}
                  />
                </Box>

                <Box sx={{ p: 2 }}>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: {
                        xs: '1fr',
                        md: 'repeat(2, minmax(0, 1fr))',
                        lg: 'repeat(3, minmax(0, 1fr))',
                        xl: 'repeat(5, minmax(0, 1fr))',
                      },
                      gap: 0.8,
                      alignItems: 'stretch',
                    }}
                  >
                    {filteredCards.map((card) => (
                      <CbmStatusCard key={card.id} card={card} onOpen={setSelectedCard} />
                    ))}
                  </Box>
                </Box>
              </>
            ) : activeTab === 'postAdjustment' ? (
              <Box sx={{ p: 2 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: '12px',
                    border: `1px solid ${tokenDivider}`,
                    bgcolor: 'background.default',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
                    <Box>
                      <Typography variant="caption" sx={{ color: tokenText.secondary, fontWeight: 500 }}>
                        Equipment with recent intervention being watched before returning to standard cadence.
                      </Typography>
                    </Box>
                    <Chip
                      label={`${filteredPostInterventionCards.length} Active window`}
                      size="small"
                      sx={{ bgcolor: tokenBrand.softBg, color: tokenBrand.main, fontWeight: 900, borderRadius: '999px' }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
                    <AssetHierarchyFilter
                      selectedId={selectedHierarchyId}
                      selectedLabel={selectedHierarchyLabel}
                      onSelect={setSelectedHierarchyId}
                    />
                    <CriticalityFilter value={criticalityFilter} onChange={setCriticalityFilter} counts={postInterventionCounts} />
                  </Box>
                  {filteredPostInterventionCards.length ? (
                    <Grid container spacing={1}>
                      {filteredPostInterventionCards.map((item) => (
                        <Grid key={item.asset} size={{ xs: 12, md: 4 }}>
                          <PostInterventionCard item={item} />
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Typography variant="body2" sx={{ color: tokenText.secondary, fontWeight: 600, px: 0.4, py: 1 }}>
                      No active windows found.
                    </Typography>
                  )}
                </Paper>
              </Box>
            ) : (
              <AlertsDashboard />
            )}
          </Paper>
        </Grid>
      </Grid>

      <CbmModal
        card={selectedCard}
        open={Boolean(selectedCard)}
        onClose={() => setSelectedCard(null)}
        onOpenMaintenanceRequestEntry={onOpenMaintenanceRequestEntry}
      />
      <AddParameterMonitoringDialog open={isAddParameterOpen} onClose={() => setIsAddParameterOpen(false)} />
    </Box>
  );
}
