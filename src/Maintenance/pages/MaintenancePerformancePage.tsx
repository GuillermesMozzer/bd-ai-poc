import React from 'react';
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogContent,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Snackbar,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  AutoAwesome as SparkleIcon,
  Autorenew as CycleIcon,
  CalendarToday as CalendarIcon,
  CheckCircleOutline as ShieldIcon,
  ChevronRight as ChevronRightIcon,
  Close as CloseIcon,
  ContentCopy as CopyIcon,
  CreditCard as BudgetIcon,
  ErrorOutline as DowntimeIcon,
  Handyman as MaintenanceWorkIcon,
  Inventory2 as StockoutIcon,
  Info as InfoIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  LocalAtm as CostIcon,
  OpenInFull as OpenInFullIcon,
  PlaylistAddCheck as ActionPlanIcon,
  PendingActions as BacklogIcon,
  Schedule as TimeIcon,
  ShieldOutlined as PreventiveIcon,
  ShowChart as TrendIcon,
  Speed as AvailabilityIcon,
  Star as StarIcon,
  TaskAlt as CompletionIcon,
  WarningAmber as AlertIcon,
  Business as SiteIcon,
  LocalHospital as FacilityIcon,
  Biotech as BiotechIcon,
  PrecisionManufacturing as EquipmentIcon,
  MedicalServices as DeviceComponentIcon,
} from '@mui/icons-material';
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer as RechartsResponsiveContainer,
} from 'recharts';
import { activeTheme } from '../../theme';
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
  workstationPriorityTone,
  workstationVisuals,
} from '../../workstation/theme';

type MaintenancePerformancePageProps = {
  activeTheme?: { primary: string };
};

type MetricTone = 'good' | 'warn' | 'bad';
type DrilldownType = 'backlog' | 'cycleTime' | 'mtbf' | 'preventiveRatio' | 'cavityAvailability' | 'maintenanceTurnover';
type AiRecommendationContext = {
  sectionTitle: string;
  actionPlanCreated: boolean;
  workOrderCreated: boolean;
};
type AiInsight = {
  kpi: string;
  trend: string;
  driver: string;
  recommendation?: string;
  tone?: 'info' | 'warning' | 'success';
};

type MetricItem = {
  label: string;
  value: string;
  unit?: string;
  icon: React.ReactNode;
  tone: MetricTone;
  compareLabel: string;
  compareValue: string;
  compareTone?: MetricTone | 'neutral';
  hasDrilldown?: boolean;
  drilldown?: DrilldownType;
};

type Section = {
  title: string;
  filters: string[];
  metrics: MetricItem[];
};

type FilterSelectionState = Record<string, string[]>;

type HierarchyItem = {
  id: string;
  code: string;
  label: string;
  level: number;
  icon?: any;
  expanded?: boolean;
  active?: boolean;
};

const defaultAssetName = 'Autoguard Shielded IV Catheter';

const hierarchyItems: HierarchyItem[] = [
  { id: 'plant-sandy', code: 'PLT-SDY', label: 'Plant A', level: 0, icon: SiteIcon, expanded: true },
  { id: 'area-a', code: 'AREA-A', label: 'Area A', level: 1, icon: FacilityIcon, expanded: true },
  { id: 'unit-a', code: 'UNIT-A', label: 'Unit A', level: 2, icon: BiotechIcon, expanded: true },
  { id: 'line-10', code: 'LINE-10', label: 'Line 10', level: 3, icon: EquipmentIcon, expanded: true },
  { id: 'zone-1', code: 'ZONE-1', label: 'Zone 1', level: 4, icon: ShieldIcon, expanded: true },
  { id: 'asset-sa-204', code: 'SA-204', label: defaultAssetName, level: 5, icon: DeviceComponentIcon, active: true },
  { id: 'system-filling', code: 'SYS-FILL', label: 'Filling System', level: 6, icon: BiotechIcon, expanded: true },
  { id: 'assembly-filling-head', code: 'ASM-FH', label: 'Filling Head Assembly', level: 7, icon: EquipmentIcon, expanded: true },
  { id: 'component-servo-motor', code: 'SM-204', label: 'Servo Motor', level: 8, icon: DeviceComponentIcon },
  { id: 'component-nozzle-cluster', code: 'NC-12', label: 'Nozzle Cluster', level: 8, icon: DeviceComponentIcon },
  { id: 'component-drive-bearing', code: 'BRG-6204', label: 'Drive Bearing', level: 8, icon: DeviceComponentIcon },
  { id: 'module-dosing-pump', code: 'DPM-01', label: 'Dosing Pump Module', level: 7, icon: BiotechIcon },
  { id: 'system-transport', code: 'SYS-TRN', label: 'Transport System', level: 6, icon: EquipmentIcon },
  { id: 'asset-mm-301', code: 'MM-301', label: 'Molding Machine MM-301', level: 5, icon: EquipmentIcon },
  { id: 'asset-cv-101', code: 'CV-101', label: 'Conveyor CV-101', level: 5, icon: EquipmentIcon },
  { id: 'asset-vi-210', code: 'VI-210', label: 'Vision Inspection VI-210', level: 5, icon: DeviceComponentIcon },
  { id: 'asset-lm-88', code: 'LM-88', label: 'Labeling Machine LM-88', level: 5, icon: EquipmentIcon },
  { id: 'asset-ct-32', code: 'CT-32', label: 'Cartoner CT-32', level: 5, icon: EquipmentIcon },
];

const initialExpandedHierarchyIds = hierarchyItems.filter((item) => item.expanded).map((item) => item.id);
const baseHierarchyPath = ['plant-sandy', 'area-a', 'unit-a', 'line-10', 'zone-1', 'asset-sa-204'];


const toneColor: Record<MetricTone, string> = {
  good: tokenSuccess.main,
  warn: tokenWarning.main,
  bad: tokenError.main,
};

const compareBg: Record<MetricTone | 'neutral', string> = {
  good: tokenSuccess.lightest,
  warn: tokenWarning.lightest,
  bad: tokenError.lightest,
  neutral: tokenNeutral.lighter,
};

const compareColor: Record<MetricTone | 'neutral', string> = {
  good: tokenSuccess.darker,
  warn: tokenWarning.darker,
  bad: tokenError.dark,
  neutral: tokenText.primary,
};

const paperBorder = `1px solid ${tokenDivider}`;
const lowElevation = 'var(--visuals-card-shadow)';
const mediumElevation = 'var(--visuals-card-shadow)';
const pageBackground = 'background.default';
const surfaceBackground = 'background.paper';

const sections: Section[] = [
  {
    title: 'Maintenance Work',
    filters: ['All work orders', 'All PM types'],
    metrics: [
      {
        label: 'Schedule Compliance',
        value: '80.0',
        unit: '%',
        icon: <CalendarIcon />,
        tone: 'warn',
        compareLabel: 'VS PREV',
        compareValue: '0.0 PP',
        compareTone: 'neutral',
      },
      {
        label: 'Work Order Completion',
        value: '71.4',
        unit: '%',
        icon: <AssignmentTurnedInIcon />,
        tone: 'bad',
        compareLabel: 'VS PREV',
        compareValue: '0.0 PP',
        compareTone: 'bad',
      },
      {
        label: 'FTFR',
        value: '78.0',
        unit: '%',
        icon: <CycleIcon />,
        tone: 'warn',
        compareLabel: 'VS PREV',
        compareValue: '+18.0%',
        compareTone: 'neutral',
      },
      {
        label: 'Maintenance Backlog',
        value: '79.0',
        unit: 'h',
        icon: <BacklogIcon />,
        tone: 'warn',
        compareLabel: 'VS PREV',
        compareValue: '-30.0H',
        compareTone: 'neutral',
        hasDrilldown: true,
        drilldown: 'backlog',
      },
      {
        label: 'Work Order Cycle Time',
        value: '21.8',
        unit: 'h',
        icon: <TimeIcon />,
        tone: 'warn',
        compareLabel: 'VS PREV',
        compareValue: '+5.0H',
        compareTone: 'neutral',
        hasDrilldown: true,
        drilldown: 'cycleTime',
      },
    ],
  },
  {
    title: 'Equipment',
    filters: ['All equipment', 'All equipment types'],
    metrics: [
      {
        label: 'Unplanned Downtime',
        value: '1.7',
        unit: 'h',
        icon: <AlertIcon />,
        tone: 'warn',
        compareLabel: 'VS PREV',
        compareValue: '-0.4H',
        compareTone: 'neutral',
      },
      {
        label: 'Equipment Availability',
        value: '96.2',
        unit: '%',
        icon: <TrendIcon />,
        tone: 'good',
        compareLabel: 'VS PREV',
        compareValue: '+0.8 PP',
        compareTone: 'neutral',
      },
      {
        label: 'OEE Performance',
        value: '90.7',
        unit: '%',
        icon: <AvailabilityIcon />,
        tone: 'good',
        compareLabel: 'VS PREV',
        compareValue: '+0.1 PP',
        compareTone: 'neutral',
      },
      {
        label: 'MTTR',
        value: '0.0',
        unit: 'h',
        icon: <TrendIcon />,
        tone: 'good',
        compareLabel: 'VS PREV',
        compareValue: '+0.1H',
        compareTone: 'neutral',
      },
      {
        label: 'MTBF',
        value: '7.7',
        unit: 'h',
        icon: <DowntimeIcon />,
        tone: 'bad',
        compareLabel: 'VS PREV',
        compareValue: '+5.8H',
        compareTone: 'bad',
        hasDrilldown: true,
        drilldown: 'mtbf',
      },
    ],
  },
  {
    title: 'Preventive Maintenance',
    filters: ['All equipment', 'All PM types', 'All WO states', 'All assignees', 'All teams'],
    metrics: [
      {
        label: 'Preventive Maintenance Ratio',
        value: '66.7',
        unit: '%',
        icon: <PreventiveIcon />,
        tone: 'warn',
        compareLabel: 'TREND',
        compareValue: '0.0 PP',
        compareTone: 'neutral',
        hasDrilldown: true,
        drilldown: 'preventiveRatio',
      },
      {
        label: 'Preventive Maintenance Compliance (PMC)',
        value: '100.0',
        unit: '%',
        icon: <TrendIcon />,
        tone: 'good',
        compareLabel: 'TREND',
        compareValue: '0.0 PP',
        compareTone: 'neutral',
        hasDrilldown: true,
      },
      {
        label: 'Preventive Maintenance Overdue Ratio',
        value: '6.3',
        unit: '%',
        icon: <AvailabilityIcon />,
        tone: 'good',
        compareLabel: 'WO OVERDUE',
        compareValue: '1/16 PM',
        compareTone: 'neutral',
        hasDrilldown: true,
      },
    ],
  },
  {
    title: 'Autonomous Maintenance (CIL. CL)',
    filters: ['All equipments'],
    metrics: [
      {
        label: 'CIL Completion Ratio',
        value: '96.6',
        unit: '%',
        icon: <CompletionIcon />,
        tone: 'good',
        compareLabel: 'VS PREV',
        compareValue: '+ 6.6%',
        compareTone: 'neutral',
      },
      {
        label: 'Centerline Completion Ratio',
        value: '91.3',
        unit: '%',
        icon: <ShieldIcon />,
        tone: 'good',
        compareLabel: 'VS PREV',
        compareValue: '+ 2.1%',
        compareTone: 'neutral',
      },
    ],
  },
  {
    title: 'Mold',
    filters: ['All molds', 'All cavities'],
    metrics: [
      {
        label: 'Total Cavity Availability',
        value: '94.8',
        unit: '%',
        icon: <EquipmentIcon />,
        tone: 'good',
        compareLabel: 'VS PREV',
        compareValue: '+1.6 PP',
        compareTone: 'good',
        hasDrilldown: true,
        drilldown: 'cavityAvailability',
      },
      {
        label: 'Average Maintenance Turn-over Time',
        value: '3.6',
        unit: 'h',
        icon: <TimeIcon />,
        tone: 'warn',
        compareLabel: 'VS PREV',
        compareValue: '-0.7H',
        compareTone: 'good',
        hasDrilldown: true,
        drilldown: 'maintenanceTurnover',
      },
    ],
  },
  {
    title: 'Resources',
    filters: ['All assignees', 'All teams'],
    metrics: [
      {
        label: 'Stockout Frequency',
        value: '4.2',
        unit: '%',
        icon: <StockoutIcon />,
        tone: 'good',
        compareLabel: 'VS PREV',
        compareValue: '+ 4.2%',
        compareTone: 'neutral',
      },
      {
        label: 'Safety Incident Ratio',
        value: '0.0',
        unit: '%',
        icon: <ShieldIcon />,
        tone: 'good',
        compareLabel: 'VS PREV',
        compareValue: '- 1.8%',
        compareTone: 'neutral',
      },
    ],
  },
  {
    title: 'Cost and Budget',
    filters: ['All equipment', 'All types'],
    metrics: [
      {
        label: 'Maintenance Cost',
        value: '$ 24.849.50',
        icon: <CostIcon />,
        tone: 'good',
        compareLabel: 'VS PREV',
        compareValue: '- 5.7%',
        compareTone: 'neutral',
      },
      {
        label: 'Maintenance Budget Variance',
        value: '591.7',
        unit: '%',
        icon: <BudgetIcon />,
        tone: 'bad',
        compareLabel: 'TREND',
        compareValue: '-44.8 PP',
        compareTone: 'bad',
      },
    ],
  },
];

const aiInsights: AiInsight[] = [
  {
    kpi: 'Schedule Compliance',
    trend: 'dropped to 80% (-12 pp vs target).',
    driver: 'Rescheduled work orders from technician constraints and spare parts delays.',
    recommendation: 'Review assignments and critical parts before schedule freeze.',
    tone: 'warning',
  },
  {
    kpi: 'MTBF',
    trend: 'decreased by 35% compared to the previous period.',
    driver: 'Repeated breakdowns from Packaging Line 3 accounted for most downtime events.',
    recommendation: 'Prioritize reliability review for Packaging Line 3 and link corrective actions to open breakdown WOs.',
    tone: 'warning',
  },
  {
    kpi: 'Maintenance Backlog',
    trend: 'increased by 30 hours.',
    driver: 'Corrective work orders increased faster than planned maintenance completion.',
    recommendation: 'Protect preventive windows while assigning overflow corrective work to available technician capacity.',
    tone: 'info',
  },
];

const aiRecommendationSummary = 'Equipment availability is critically low.';
const aiRecommendationCauses = [
  'Recurring failures concentrated in a few assets.',
  'Maintenance plans not aligned with current run rates.',
  'Lack of root-cause closure on previous events.',
];
const aiRecommendationItems = [
  { priority: 'High', text: 'Investigate the equipment contributing the most downtime.' },
  { priority: 'High', text: 'Prioritize recurring failure analysis on critical assets.' },
  { priority: 'Medium', text: 'Review preventive maintenance plans for critical assets.' },
  { priority: 'Low', text: 'Check open corrective work orders related to the same equipment.' },
];
const aiRecommendationImpact =
  'Acting on the high-priority items should stabilize the trend within 1-2 cycles and reduce risk of escalation to the next tier.';

function buildRecommendationClipboardText(sectionTitle: string) {
  return [
    `AI Recommendations - ${sectionTitle}`,
    'Severity: Critical',
    '',
    `Summary: ${aiRecommendationSummary}`,
    '',
    'Possible causes:',
    ...aiRecommendationCauses.map((cause) => `- ${cause}`),
    '',
    'Prioritized recommendations:',
    ...aiRecommendationItems.map((item) => `- ${item.priority}: ${item.text}`),
    '',
    `Expected impact: ${aiRecommendationImpact}`,
  ].join('\n');
}

function SectionActions({ onOpenAi }: { onOpenAi: () => void }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.2 }}>
      <Tooltip title="AI insight">
        <IconButton size="small" onClick={onOpenAi} sx={{ color: tokenBrand.lightest }}>
          <SparkleIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Expand">
        <IconButton size="small" sx={{ color: tokenBrand.main }}>
          <OpenInFullIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Tooltip>
    </Box>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const style = workstationPriorityTone[priority as keyof typeof workstationPriorityTone] ?? workstationPriorityTone.Low;

  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 42,
        px: 0.55,
        py: 0.22,
        borderRadius: '999px',
        bgcolor: style.bg,
        color: style.color,
        border: `1px solid ${style.border}`,
        fontSize: '0.58rem',
        fontWeight: 800,
        lineHeight: 1,
        flexShrink: 0,
      }}
    >
      {priority}
    </Box>
  );
}

function RecommendationPanelCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Paper elevation={0} sx={{ p: 1.25, borderRadius: '12px', bgcolor: surfaceBackground, border: paperBorder, boxShadow: '0 2px 7px rgba(15,23,42,0.08)' }}>
      <Typography sx={{ color: tokenText.secondary, fontSize: '0.64rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 0.2, mb: 0.75 }}>
        {title}
      </Typography>
      {children}
    </Paper>
  );
}

function AiRecommendationsDialog({
  context,
  onClose,
  onCreateActionPlan,
  onCreateWorkOrder,
  onCopyRecommendations,
}: {
  context: AiRecommendationContext | null;
  onClose: () => void;
  onCreateActionPlan: () => void;
  onCreateWorkOrder: () => void;
  onCopyRecommendations: () => void;
}) {
  const open = Boolean(context);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      PaperProps={{
        sx: {
          width: 316,
          maxWidth: 'calc(100vw - 20px)',
          height: '100vh',
          maxHeight: '100vh',
          m: 0,
          ml: 'auto',
          borderRadius: 0,
          bgcolor: 'var(--drawer-panel-bg)',
          borderLeft: '1px solid var(--token-divider)',
          boxShadow: '0 24px 54px rgba(15,23,42,0.22)',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
      sx={{
        '& .MuiDialog-container': {
          justifyContent: 'flex-end',
          alignItems: 'flex-start',
        },
      }}
    >
      <Box sx={{ px: 1.4, py: 1.1, borderBottom: '1px solid var(--token-divider)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
        <Box sx={{ minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.55, minWidth: 0 }}>
            <SparkleIcon sx={{ fontSize: 17, color: activeTheme.primary, flexShrink: 0 }} />
            <Typography sx={{ color: tokenText.primary, fontWeight: 900, fontSize: '0.94rem', lineHeight: 1.2 }}>
              AI Recommendations - {context?.sectionTitle ?? 'Equipment'}
            </Typography>
          </Box>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.3, mt: 0.65, px: 0.6, py: 0.22, borderRadius: 99, bgcolor: '#FFF1F0', color: '#EF4444', border: '1px solid #FDA29B', fontSize: '0.58rem', fontWeight: 900, lineHeight: 1 }}>
            <AlertIcon sx={{ fontSize: 10 }} />
            Critical
          </Box>
        </Box>
        <Tooltip title="Close">
          <IconButton size="small" onClick={onClose} sx={{ color: tokenText.secondary, mt: -0.4 }}>
            <CloseIcon sx={{ fontSize: 17 }} />
          </IconButton>
        </Tooltip>
      </Box>

      <DialogContent sx={{ p: 1.2, display: 'flex', flexDirection: 'column', gap: 1.2, overflowY: 'auto' }}>
        <RecommendationPanelCard title="Summary">
          <Typography sx={{ color: tokenText.primary, fontSize: '0.76rem', lineHeight: 1.35 }}>
            {aiRecommendationSummary}
          </Typography>
        </RecommendationPanelCard>

        <RecommendationPanelCard title="Possible Causes">
          <Box component="ul" sx={{ m: 0, pl: 1.4, color: tokenText.primary, display: 'flex', flexDirection: 'column', gap: 0.65 }}>
            {aiRecommendationCauses.map((cause) => (
              <Typography component="li" key={cause} sx={{ fontSize: '0.76rem', lineHeight: 1.35 }}>
                {cause}
              </Typography>
            ))}
          </Box>
        </RecommendationPanelCard>

        <RecommendationPanelCard title="Prioritized Recommendations">
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
            {aiRecommendationItems.map((item) => (
              <Box key={`${item.priority}-${item.text}`} sx={{ display: 'grid', gridTemplateColumns: '48px minmax(0, 1fr)', gap: 0.65, alignItems: 'start' }}>
                <PriorityBadge priority={item.priority} />
                <Typography sx={{ color: tokenText.primary, fontSize: '0.75rem', lineHeight: 1.25 }}>
                  {item.text}
                </Typography>
              </Box>
            ))}
          </Box>
        </RecommendationPanelCard>

        <RecommendationPanelCard title="Expected Impact">
          <Typography sx={{ color: tokenText.primary, fontSize: '0.76rem', lineHeight: 1.35 }}>
            {aiRecommendationImpact}
          </Typography>
        </RecommendationPanelCard>
      </DialogContent>

      <Box sx={{ mt: 'auto', px: 1.2, py: 1.2, borderTop: '1px solid var(--token-divider)', display: 'flex', flexDirection: 'column', gap: 0.65 }}>
        <Button
          fullWidth
          variant="contained"
          size="small"
          startIcon={<ActionPlanIcon sx={{ fontSize: 15 }} />}
          onClick={onCreateActionPlan}
          sx={{ justifyContent: 'flex-start', borderRadius: 1.4, fontSize: '0.72rem', fontWeight: 900, textTransform: 'none', px: 1 }}
        >
          {context?.actionPlanCreated ? 'Action plan created' : 'Create action plan'}
        </Button>
        <Button
          fullWidth
          variant="outlined"
          size="small"
          startIcon={<MaintenanceWorkIcon sx={{ fontSize: 15 }} />}
          onClick={onCreateWorkOrder}
          sx={{ justifyContent: 'flex-start', borderRadius: 1.4, borderColor: 'var(--token-divider)', color: tokenText.primary, fontSize: '0.72rem', fontWeight: 700, textTransform: 'none', px: 1, bgcolor: 'transparent' }}
        >
          {context?.workOrderCreated ? 'Maintenance work order created' : 'Create maintenance work order'}
        </Button>
        <Button
          fullWidth
          variant="text"
          size="small"
          startIcon={<CopyIcon sx={{ fontSize: 15 }} />}
          onClick={onCopyRecommendations}
          sx={{ justifyContent: 'flex-start', color: tokenText.primary, fontSize: '0.72rem', fontWeight: 700, textTransform: 'none', px: 1 }}
        >
          Copy recommendations
        </Button>
      </Box>
    </Dialog>
  );
}

const filterOptionsByLabel: Record<string, string[]> = {
  'All work orders': ['Corrective', 'Preventive', 'Emergency', 'Inspection'],
  'All PM types': ['Daily PM', 'Weekly PM', 'Monthly PM', 'Quarterly PM'],
  'All equipment': ['Autoguard Shielded IV Catheter', 'Molding Machine MM-301', 'Conveyor CV-101', 'Vision Inspection VI-210', 'Labeling Machine LM-88', 'Cartoner CT-32'],
  'All equipment types': ['Filling', 'Molding', 'Conveyor', 'Inspection', 'Labeling', 'Packaging'],
  'All WO states': ['Open', 'In progress', 'Scheduled', 'Overdue', 'Completed'],
  'All assignees': ['Afoson Davi', 'Bruno Aquino', 'John Joshua', 'Maria Pinna', 'Ronnie D elano'],
  'All teams': ['Maintenance A', 'Maintenance B', 'Reliability', 'Utilities'],
  'All equipments': ['Autoguard Shielded IV Catheter', 'Molding Machine MM-301', 'Conveyor CV-101', 'Vision Inspection VI-210', 'Labeling Machine LM-88', 'Cartoner CT-32'],
  'All types': ['Corrective', 'Preventive', 'Predictive', 'Inspection'],
};

function getFilterKey(sectionTitle: string, label: string) {
  return `${sectionTitle}::${label}`;
}

function getFilterDisplayLabel(label: string, selectedValues: string[]) {
  const options = filterOptionsByLabel[label] ?? [];
  if (!options.length || selectedValues.length === options.length) return label;
  if (selectedValues.length === 0) return 'None selected';
  if (selectedValues.length === 1) return selectedValues[0];
  return `${selectedValues.length} selected`;
}

function FilterButton({
  label,
  selectedValues,
  onChange,
}: {
  label: string;
  selectedValues: string[];
  onChange: (values: string[]) => void;
}) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const options = filterOptionsByLabel[label] ?? [];
  const allSelected = options.length > 0 && selectedValues.length === options.length;
  const displayLabel = getFilterDisplayLabel(label, selectedValues);

  const handleToggle = (option: string) => {
    const nextValues = selectedValues.includes(option)
      ? selectedValues.filter((value) => value !== option)
      : [...selectedValues, option];
    onChange(nextValues);
  };

  const handleToggleAll = () => {
    onChange(allSelected ? [] : options);
  };

  return (
    <>
      <Button
        size="small"
        endIcon={<KeyboardArrowDownIcon sx={{ fontSize: 14 }} />}
        onClick={(event) => setAnchorEl(event.currentTarget)}
        sx={{
          minWidth: 0,
          p: 0,
          color: '#6B7280',
          fontSize: '0.7rem',
          fontWeight: 700,
          lineHeight: 1,
          '& .MuiButton-endIcon': { ml: 0.3 },
          '&:hover': { bgcolor: 'transparent', boxShadow: 'none', transform: 'none', color: activeTheme.primary },
        }}
      >
        {displayLabel}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        slotProps={{
          paper: {
            sx: {
              mt: 0.6,
              minWidth: 240,
              borderRadius: 1.5,
              border: paperBorder,
              boxShadow: mediumElevation,
            },
          },
        }}
      >
        <MenuItem dense onClick={handleToggleAll}>
          <Checkbox size="small" checked={allSelected} indeterminate={selectedValues.length > 0 && !allSelected} />
          <ListItemText primary={label} primaryTypographyProps={{ fontSize: '0.78rem', fontWeight: 800 }} />
        </MenuItem>
        <Divider />
        {options.map((option) => (
          <MenuItem key={option} dense onClick={() => handleToggle(option)}>
            <Checkbox size="small" checked={selectedValues.includes(option)} />
            <ListItemText primary={option} primaryTypographyProps={{ fontSize: '0.78rem', fontWeight: 700 }} />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

const backlogTrendLines = [
  { color: '#00BFA6', points: [6.08, 6.08, 6.02, 6.0, 5.98, 6.02, 5.95] },
  { color: '#20B7FF', points: [5.12, 5.28, 5.36, 5.42, 5.42, 5.48, 5.58] },
  { color: '#FF3E78', points: [4.1, 4.12, 4.13, 4.02, 3.9, 3.78, 3.63] },
  { color: '#7657E8', points: [3.12, 3.25, 3.42, 3.56, 3.7, 3.78, 3.86] },
  { color: '#FF5C35', points: [2.08, 2.35, 2.42, 2.47, 2.58, 2.6, 2.7] },
  { color: '#C9E500', points: [1.0, 1.28, 1.52, 1.72, 1.74, 1.88, 2.02] },
];

const weekLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const backlogStateRows = [
  { label: 'Scheduled', value: '27.5 h', percent: 93 },
  { label: 'In Progress', value: '26.3 h', percent: 90 },
  { label: 'On Hold', value: '25.1 h', percent: 88 },
];

const backlogTypeRows = [
  { label: 'Preventive', value: '20.7 h' },
  { label: 'Corrective', value: '20.1 h' },
  { label: 'Inspection', value: '19.4 h' },
  { label: 'Inspection', value: '18.8 h' },
];

const cycleTimeRows = [
  { label: 'H6', percent: 89 },
  { label: 'H5', percent: 57 },
  { label: 'H4', percent: 57 },
  { label: 'H3', percent: 57 },
  { label: 'H2', percent: 57 },
  { label: 'H1', percent: 57 },
];

const mtbfEquipmentRows = [
  { label: 'Equipment A', value: 250 },
  { label: 'Equipment B', value: 310 },
  { label: 'Equipment C', value: 425 },
  { label: 'Equipment D', value: 545 },
];

const mtbfTarget = 390;
const preventiveRatioData = [
  { name: 'Preventive Maintenance', value: 66.7, color: '#2563EB' },
  { name: 'Corrective / Reactive', value: 33.3, color: '#F97316' },
];
const preventiveWorkOrderSummary = [
  { label: 'Preventive WOs', value: '16', color: '#2563EB' },
  { label: 'Corrective WOs', value: '8', color: '#F97316' },
  { label: 'Total closed WOs', value: '24', color: '#0F172A' },
];
const moldCavityAvailabilityRows = [
  { label: 'MLD-104', value: '98.2%', percent: 98 },
  { label: 'MLD-118', value: '95.6%', percent: 96 },
  { label: 'MLD-122', value: '92.4%', percent: 92 },
  { label: 'MLD-131', value: '88.9%', percent: 89 },
];
const moldTurnoverRows = [
  { label: 'Diagnosis', value: '0.8 h', percent: 22 },
  { label: 'Tooling work', value: '1.7 h', percent: 47 },
  { label: 'Validation', value: '0.7 h', percent: 19 },
  { label: 'Release', value: '0.4 h', percent: 12 },
];

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

function TrendBadgeIcon({ direction }: { direction: 'up' | 'down' }) {
  const points = direction === 'up'
    ? '2,13 7,8 11,10 17,4 20,7'
    : '2,5 7,10 11,8 17,14 20,11';
  return (
    <Box
      component="svg"
      viewBox="0 0 22 16"
      aria-hidden="true"
      sx={{ width: 18, height: 14, color: 'inherit', flexShrink: 0 }}
    >
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      {direction === 'up' ? (
        <polyline points="16,4 20,4 20,8" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <polyline points="16,14 20,14 20,10" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </Box>
  );
}

function getTrendDirection(compareValue: string): 'up' | 'down' | null {
  const normalized = compareValue.trim();
  if (normalized.startsWith('+')) return 'up';
  if (normalized.startsWith('-')) return 'down';
  return null;
}

function MetricTile({
  metric,
  compact = false,
  onOpenDrilldown,
}: {
  metric: MetricItem;
  compact?: boolean;
  onOpenDrilldown?: (drilldown: DrilldownType) => void;
}) {
  const color = toneColor[metric.tone];
  const isInteractive = Boolean(metric.drilldown && onOpenDrilldown);
  const trendDirection = getTrendDirection(metric.compareValue);

  const handleOpen = () => {
    if (metric.drilldown) {
      onOpenDrilldown?.(metric.drilldown);
    }
  };

  return (
    <Paper
      elevation={0}
      component={isInteractive ? 'button' : 'div'}
      type={isInteractive ? 'button' : undefined}
      onClick={isInteractive ? handleOpen : undefined}
      sx={{
        position: 'relative',
        width: '100%',
        minHeight: compact ? 78 : 80,
        p: { xs: 1, md: 1.15 },
        pl: { xs: 1.35, md: 1.45 },
        borderRadius: 1.4,
        overflow: 'hidden',
        bgcolor: 'var(--token-neutral-lightest)',
        border: '1px solid var(--token-divider)',
        boxShadow: 'var(--visuals-card-shadow)',
        font: 'inherit',
        textAlign: 'left',
        cursor: isInteractive ? 'pointer' : 'default',
        transition: 'border-color 0.18s ease, box-shadow 0.18s ease, background-color 0.18s ease',
        '&:hover': isInteractive
          ? {
            bgcolor: 'var(--surface-hover-bg)',
            borderColor: 'var(--token-brand-main)',
            boxShadow: 'var(--visuals-card-shadow)',
          }
          : undefined,
      }}
    >
      <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 5, bgcolor: color }} />
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: metric.hasDrilldown ? 'minmax(0, 1fr) auto 20px' : 'minmax(0, 1fr) auto',
          alignItems: 'center',
          columnGap: 0.8,
          minWidth: 0,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
            <Box sx={{ color, mr: 0.75, display: 'flex', flexShrink: 0, '& svg': { fontSize: 18 } }}>{metric.icon}</Box>
            <Box sx={{ display: 'flex', alignItems: 'baseline', minWidth: 0 }}>
              <Typography
                sx={{
                  color: tokenText.primary,
                  fontWeight: 500,
                  fontSize: compact ? { xs: 25, md: 27 } : { xs: 27, md: 30 },
                  lineHeight: 0.95,
                  letterSpacing: 0,
                  whiteSpace: 'nowrap',
                }}
              >
                {metric.value}
              </Typography>
              {metric.unit ? (
                <Typography sx={{ color: tokenText.primary, fontSize: 12, fontWeight: 500, ml: 0.45, lineHeight: 1 }}>
                  {metric.unit}
                </Typography>
              ) : null}
            </Box>
          </Box>

          <Typography
            sx={{
              color: tokenText.secondary,
              fontSize: '0.72rem',
              fontWeight: 500,
              ml: 3.25,
              mt: 0.2,
              lineHeight: 1.05,
              overflowWrap: 'anywhere',
            }}
          >
            {metric.label}
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.35,
            px: { xs: 0.75, md: 0.9 },
            py: 0.5,
            borderRadius: 99,
            bgcolor: compareBg[metric.compareTone ?? 'neutral'],
            color: compareColor[metric.compareTone ?? 'neutral'],
            fontSize: { xs: '0.64rem', md: '0.68rem' },
            fontWeight: 900,
            lineHeight: 1,
            whiteSpace: 'nowrap',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.55)',
          }}
        >
          {trendDirection ? <TrendBadgeIcon direction={trendDirection} /> : null}
          <Box component="span">{metric.compareValue}</Box>
          <Box component="span" sx={{ letterSpacing: 0.3 }}>{metric.compareLabel}</Box>
        </Box>

        {metric.hasDrilldown ? (
          <ChevronRightIcon
            sx={{
              color: tokenText.secondary,
              fontSize: 20,
            }}
          />
        ) : null}
      </Box>
    </Paper>
  );
}

function TrendLineChart() {
  const width = 330;
  const height = 126;
  const plotLeft = 34;
  const plotRight = 8;
  const plotTop = 4;
  const plotBottom = 20;
  const plotWidth = width - plotLeft - plotRight;
  const plotHeight = height - plotTop - plotBottom;
  const toPoint = (value: number, index: number) => {
    const x = plotLeft + (index * plotWidth) / (weekLabels.length - 1);
    const y = plotTop + ((6.4 - value) / 5.6) * plotHeight;
    return `${x},${y}`;
  };

  return (
    <Box sx={{ position: 'relative', height }}>
      <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 20, width: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        {['h6', 'h5', 'h4', 'h3', 'h2', 'h1'].map((label) => (
          <Typography key={label} sx={{ color: tokenText.secondary, fontSize: '0.64rem', lineHeight: 1 }}>
            {label}
          </Typography>
        ))}
      </Box>
      <Box component="svg" viewBox={`0 0 ${width} ${height}`} sx={{ width: '100%', height: '100%', display: 'block' }}>
        {backlogTrendLines.map((line) => (
          <polyline
            key={line.color}
            points={line.points.map(toPoint).join(' ')}
            fill="none"
            stroke={line.color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
        <line x1={plotLeft} y1={height - plotBottom} x2={width - plotRight} y2={height - plotBottom} stroke="#111827" strokeWidth="1" />
      </Box>
      <Box sx={{ position: 'absolute', left: 31, right: 2, bottom: 0, display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
        {weekLabels.map((label) => (
          <Typography key={label} sx={{ color: tokenText.secondary, fontSize: '0.62rem', textAlign: 'center', lineHeight: 1 }}>
            {label}
          </Typography>
        ))}
      </Box>
    </Box>
  );
}

function MtbfDetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Typography sx={{ color: '#334155', fontSize: '0.78rem', lineHeight: 1.35 }}>
      <Box component="span" sx={{ color: '#0F172A', fontWeight: 900 }}>{label}:</Box> {children}
    </Typography>
  );
}

function MtbfInfoContent() {
  return (
    <Box sx={{ maxWidth: 310, display: 'flex', flexDirection: 'column', gap: 0.7, p: 0.35 }}>
      <Typography sx={{ color: '#0F172A', fontWeight: 900, fontSize: '0.95rem', lineHeight: 1.2 }}>
        Mean Time Between Failures (MTBF)
      </Typography>
      <MtbfDetailRow label="Formula">Total Uptime Hours / Number of Failures</MtbfDetailRow>
      <MtbfDetailRow label="Purpose">Measures asset reliability.</MtbfDetailRow>
      <MtbfDetailRow label="Why It Matters">Higher MTBF indicates fewer breakdowns.</MtbfDetailRow>
      <MtbfDetailRow label="Cost Savings">Reduces repair frequency and parts usage.</MtbfDetailRow>
      <MtbfDetailRow label="Benchmark">Track sustained movement above target by critical asset.</MtbfDetailRow>
    </Box>
  );
}

function MtbfBarChart() {
  const width = 620;
  const height = 360;
  const plotLeft = 72;
  const plotRight = 24;
  const plotTop = 42;
  const plotBottom = 74;
  const maxValue = 600;
  const plotWidth = width - plotLeft - plotRight;
  const plotHeight = height - plotTop - plotBottom;
  const barWidth = 66;
  const band = plotWidth / mtbfEquipmentRows.length;
  const targetY = plotTop + ((maxValue - mtbfTarget) / maxValue) * plotHeight;

  const yFor = (value: number) => plotTop + ((maxValue - value) / maxValue) * plotHeight;

  return (
    <Box sx={{ position: 'relative', width: '100%', height: { xs: 330, sm: 360 } }}>
      <Box component="svg" viewBox={`0 0 ${width} ${height}`} sx={{ width: '100%', height: '100%', display: 'block' }}>
        <defs>
          <linearGradient id="mtbf-good-gradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#35B779" />
            <stop offset="100%" stopColor="#167A48" />
          </linearGradient>
          <linearGradient id="mtbf-risk-gradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#FF5A66" />
            <stop offset="100%" stopColor="#DC2626" />
          </linearGradient>
          <filter id="mtbf-bar-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="7" stdDeviation="5" floodColor="#0F172A" floodOpacity="0.13" />
          </filter>
        </defs>

        <rect x={plotLeft} y={plotTop} width={plotWidth} height={plotHeight} rx="8" fill="var(--token-neutral-lightest)" />
        <rect x={plotLeft} y={plotTop} width={plotWidth} height={targetY - plotTop} rx="8" fill="#ECFDF3" opacity="0.75" />

        {[0, 100, 200, 300, 400, 500, 600].map((tick) => {
          const y = yFor(tick);
          return (
            <React.Fragment key={tick}>
              <line x1={plotLeft} y1={y} x2={width - plotRight} y2={y} stroke="#E2E8F0" strokeWidth="1" />
              <text x={plotLeft - 14} y={y + 4} textAnchor="end" fill="#64748B" fontSize="12" fontWeight="700">
                {tick}
              </text>
            </React.Fragment>
          );
        })}

        <line x1={plotLeft} y1={height - plotBottom} x2={width - plotRight} y2={height - plotBottom} stroke="#CBD5E1" strokeWidth="1.4" />

        <line
          x1={plotLeft}
          y1={targetY}
          x2={width - plotRight}
          y2={targetY}
          stroke="#2563EB"
          strokeWidth="2.4"
          strokeDasharray="8 8"
          strokeLinecap="round"
        />
        <rect x={plotLeft + 12} y={targetY - 24} width="86" height="20" rx="10" fill="#EFF6FF" stroke="#BFDBFE" />
        <text x={plotLeft + 55} y={targetY - 10} textAnchor="middle" fill="#1D4ED8" fontSize="11" fontWeight="900">
          Target 390h
        </text>

        {mtbfEquipmentRows.map((row, index) => {
          const x = plotLeft + index * band + (band - barWidth) / 2;
          const y = yFor(row.value);
          const barHeight = height - plotBottom - y;
          const isAboveTarget = row.value >= mtbfTarget;
          const gap = Math.abs(row.value - mtbfTarget);
          return (
            <React.Fragment key={row.label}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx="8"
                fill={isAboveTarget ? 'url(#mtbf-good-gradient)' : 'url(#mtbf-risk-gradient)'}
                filter="url(#mtbf-bar-shadow)"
              />
              <text x={x + barWidth / 2} y={Math.max(y - 12, 18)} textAnchor="middle" fill="#0F172A" fontSize="15" fontWeight="900">
                {row.value}h
              </text>
              <rect x={x + barWidth / 2 - 27} y={height - 58} width="54" height="18" rx="9" fill={isAboveTarget ? '#DCFCE7' : '#FEE2E2'} />
              <text x={x + barWidth / 2} y={height - 45} textAnchor="middle" fill={isAboveTarget ? '#166534' : '#B91C1C'} fontSize="9" fontWeight="900">
                {isAboveTarget ? `+${gap}h` : `-${gap}h`}
              </text>
              <text x={x + barWidth / 2} y={height - 20} textAnchor="middle" fill="#0F172A" fontSize="14" fontWeight="900">
                {row.label}
              </text>
            </React.Fragment>
          );
        })}

        <text transform={`translate(25 ${plotTop + plotHeight / 2}) rotate(-90)`} textAnchor="middle" fill="#475569" fontSize="12" fontWeight="900">
          MTBF hours
        </text>
      </Box>
    </Box>
  );
}

function MtbfDetails() {
  const aboveTargetCount = mtbfEquipmentRows.filter((row) => row.value >= mtbfTarget).length;
  const averageMtbf = Math.round(mtbfEquipmentRows.reduce((total, row) => total + row.value, 0) / mtbfEquipmentRows.length);
  const lowestMtbf = mtbfEquipmentRows.reduce((lowest, row) => (row.value < lowest.value ? row : lowest), mtbfEquipmentRows[0]);

  return (
    <Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'minmax(0, 1fr) auto' }, alignItems: 'start', gap: 1.2, mb: 1.4 }}>
        <Box sx={{ minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7, minWidth: 0 }}>
            <Typography sx={{ color: '#050B22', fontWeight: 900, fontSize: { xs: '1.2rem', sm: '1.45rem' }, lineHeight: 1.1 }}>
              Mean Time Between Failures
            </Typography>
            <Box component="span" sx={{ px: 0.7, py: 0.32, borderRadius: 99, bgcolor: '#F1F5F9', color: '#475569', fontSize: '0.68rem', fontWeight: 900, lineHeight: 1 }}>
              MTBF
            </Box>
          </Box>
          <Typography sx={{ mt: 0.55, color: '#64748B', fontSize: '0.78rem', lineHeight: 1.35 }}>
            Reliability by equipment, compared with the target threshold.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'space-between', sm: 'flex-end' }, gap: 0.7 }}>
          <Box sx={{ px: 1.05, py: 0.55, borderRadius: 99, bgcolor: '#EEF6FF', color: activeTheme.primary, fontSize: '0.75rem', fontWeight: 900, whiteSpace: 'nowrap' }}>
            Target {mtbfTarget}h
          </Box>
          <Tooltip
            arrow
            placement="right-start"
            title={<MtbfInfoContent />}
            componentsProps={{
              tooltip: {
                sx: {
                  bgcolor: '#FFFFFF',
                  color: '#334155',
                  borderRadius: 1.4,
                  border: '1px solid #D8DEE8',
                  boxShadow: '0 18px 40px rgba(15,23,42,0.18)',
                  '& .MuiTooltip-arrow': { color: '#FFFFFF', '&:before': { border: '1px solid #D8DEE8' } },
                },
              },
            }}
          >
            <IconButton
              size="small"
              sx={{
                color: '#FFFFFF',
                bgcolor: activeTheme.primary,
                width: 28,
                height: 28,
                flexShrink: 0,
                '&:hover': { bgcolor: '#063DA8' },
              }}
            >
              <InfoIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 0.9, mb: 1.2 }}>
        {[
          { label: 'Average MTBF', value: `${averageMtbf}h`, color: tokenText.primary },
          { label: 'Above target', value: `${aboveTargetCount}/${mtbfEquipmentRows.length}`, color: '#166534' },
          { label: 'Highest risk', value: lowestMtbf.label, color: '#B91C1C' },
        ].map((item) => (
          <Paper key={item.label} elevation={0} sx={{ p: 1, borderRadius: 1.2, bgcolor: 'var(--token-neutral-lightest)', border: '1px solid var(--token-divider)' }}>
            <Typography sx={{ color: tokenText.secondary, fontSize: '0.64rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 0.3, lineHeight: 1 }}>
              {item.label}
            </Typography>
            <Typography sx={{ color: item.color, fontSize: '1.05rem', fontWeight: 900, lineHeight: 1.1, mt: 0.55 }}>
              {item.value}
            </Typography>
          </Paper>
        ))}
      </Box>

      <Paper elevation={0} sx={{ p: { xs: 1, sm: 1.25 }, borderRadius: 1.4, border: '1px solid var(--token-divider)', bgcolor: 'var(--active-theme-background-paper)', boxShadow: '0 10px 28px rgba(15,23,42,0.08)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, px: 0.5, pt: 0.2, mb: 0.4 }}>
          <Typography sx={{ color: '#334155', fontWeight: 900, fontSize: '0.78rem' }}>
            Equipment reliability
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.1, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.45, color: '#166534', fontSize: '0.68rem', fontWeight: 800 }}>
              <Box sx={{ width: 9, height: 9, borderRadius: 99, bgcolor: '#22A366' }} />
              Meets target
            </Box>
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.45, color: '#B91C1C', fontSize: '0.68rem', fontWeight: 800 }}>
              <Box sx={{ width: 9, height: 9, borderRadius: 99, bgcolor: '#EF4444' }} />
              Below target
            </Box>
          </Box>
        </Box>
        <MtbfBarChart />
      </Paper>
    </Box>
  );
}

function PreventiveRatioDetails() {
  const preventiveValue = preventiveRatioData[0].value;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1, mb: 1.35 }}>
        <Box sx={{ minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7, minWidth: 0 }}>
            <Typography sx={{ color: tokenText.primary, fontWeight: 900, fontSize: { xs: '1.1rem', sm: '1.35rem' }, lineHeight: 1.1 }}>
              Preventive Maintenance Ratio
            </Typography>
            <Box component="span" sx={{ px: 0.7, py: 0.32, borderRadius: '999px', bgcolor: tokenWarning.lightest, color: tokenWarning.darker, fontSize: '0.68rem', fontWeight: 900, lineHeight: 1 }}>
              Trend 0.0 PP
            </Box>
          </Box>
          <Typography sx={{ mt: 0.55, color: tokenText.secondary, fontSize: '0.78rem', lineHeight: 1.35 }}>
            Share of completed work orders handled through preventive maintenance versus corrective or reactive work.
          </Typography>
        </Box>
      </Box>

      <Paper elevation={0} sx={{ p: { xs: 1.25, sm: 1.6 }, borderRadius: '12px', border: paperBorder, bgcolor: surfaceBackground, boxShadow: mediumElevation }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '260px minmax(0, 1fr)' }, gap: { xs: 1.4, sm: 2 }, alignItems: 'center' }}>
          <Box sx={{ position: 'relative', height: 240, minWidth: 0 }}>
            <RechartsResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={preventiveRatioData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={64}
                  outerRadius={96}
                  paddingAngle={2}
                  stroke={tokenCommon.white}
                  strokeWidth={4}
                  isAnimationActive={false}
                >
                  {preventiveRatioData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </RechartsResponsiveContainer>
            <Box sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', pointerEvents: 'none' }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography sx={{ color: tokenText.primary, fontWeight: 900, fontSize: '2rem', lineHeight: 1, letterSpacing: 0 }}>
                  {preventiveValue.toFixed(1)}%
                </Typography>
                <Typography sx={{ color: tokenText.secondary, fontWeight: 900, fontSize: '0.64rem', textTransform: 'uppercase', lineHeight: 1.1, mt: 0.45 }}>
                  Preventive
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {preventiveRatioData.map((item) => (
              <Box key={item.name} sx={{ display: 'grid', gridTemplateColumns: '12px minmax(0, 1fr) auto', alignItems: 'center', gap: 0.8 }}>
                <Box sx={{ width: 12, height: 12, borderRadius: '999px', bgcolor: item.color }} />
                <Typography sx={{ color: tokenText.secondary, fontSize: '0.82rem', fontWeight: 800, lineHeight: 1.2 }}>
                  {item.name}
                </Typography>
                <Typography sx={{ color: tokenText.primary, fontSize: '0.86rem', fontWeight: 900, lineHeight: 1 }}>
                  {item.value.toFixed(1)}%
                </Typography>
              </Box>
            ))}

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 0.75, mt: 0.55 }}>
              {preventiveWorkOrderSummary.map((item) => (
                <Paper key={item.label} elevation={0} sx={{ p: 0.9, borderRadius: '8px', bgcolor: tokenNeutral.lightest, border: paperBorder }}>
                  <Typography sx={{ color: tokenText.secondary, fontSize: '0.6rem', fontWeight: 900, textTransform: 'uppercase', lineHeight: 1.1 }}>
                    {item.label}
                  </Typography>
                  <Typography sx={{ color: item.color, fontSize: '1.15rem', fontWeight: 900, lineHeight: 1.05, mt: 0.55 }}>
                    {item.value}
                  </Typography>
                </Paper>
              ))}
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}

function DialogMetricSummary({ metric }: { metric: MetricItem }) {
  const color = toneColor[metric.tone];
  const badgeTone = metric.compareTone ?? 'neutral';

  return (
    <Box sx={{ position: 'relative', minHeight: 50, p: 1.2, pl: 1.5, borderRadius: '8px', bgcolor: surfaceBackground, border: paperBorder, boxShadow: lowElevation }}>
      <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, borderRadius: '4px 0 0 4px', bgcolor: color }} />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
          <Box sx={{ color, mr: 0.75, display: 'flex', '& svg': { fontSize: 17 } }}>{metric.icon}</Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
              <Typography sx={{ color: tokenText.primary, fontWeight: 500, fontSize: 29, lineHeight: 0.9, letterSpacing: 0 }}>
                {metric.value}
              </Typography>
              {metric.unit ? (
                <Typography sx={{ color: tokenText.primary, fontSize: 12, fontWeight: 500, ml: 0.45, lineHeight: 1 }}>
                  {metric.unit}
                </Typography>
              ) : null}
            </Box>
            <Typography sx={{ color: tokenText.primary, fontSize: '0.65rem', fontWeight: 500, lineHeight: 1.05 }}>
              {metric.label}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <Typography sx={{ color: tokenText.secondary, fontSize: '0.55rem', fontWeight: 900, lineHeight: 1 }}>
            {metric.compareLabel}
          </Typography>
          <Box sx={{ display: 'inline-flex', mt: 0.35, px: 0.55, py: 0.25, borderRadius: '999px', bgcolor: compareBg[badgeTone], color: compareColor[badgeTone], fontSize: '0.55rem', fontWeight: 900, lineHeight: 1, whiteSpace: 'nowrap' }}>
            {metric.compareValue}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

function SmallPill({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <Box sx={{ px: 1.1, py: 0.55, borderRadius: '999px', bgcolor: active ? tokenBrand.main : tokenNeutral.main, color: active ? surfaceBackground : tokenText.secondary, fontSize: '0.72rem', fontWeight: 800, lineHeight: 1 }}>
      {label}
    </Box>
  );
}

function ModalCard({ children }: { children: React.ReactNode }) {
  return (
    <Paper elevation={0} sx={{ p: 1.45, borderRadius: '12px', bgcolor: surfaceBackground, border: paperBorder, boxShadow: lowElevation }}>
      {children}
    </Paper>
  );
}

function BacklogBars({ rows, color, thin = false }: { rows: { label: string; value: string; percent?: number }[]; color: string; thin?: boolean }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: thin ? 1.15 : 1.25 }}>
      {rows.map((row) => (
        <Box key={`${row.label}-${row.value}`}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.55 }}>
            <Typography sx={{ color: tokenText.secondary, fontSize: '0.76rem', lineHeight: 1 }}>{row.label}</Typography>
            <Typography sx={{ color: tokenText.secondary, fontSize: '0.76rem', lineHeight: 1 }}>{row.value}</Typography>
          </Box>
          <Box sx={{ height: thin ? 4 : 5, borderRadius: '999px', bgcolor: tokenNeutral.main, overflow: 'hidden' }}>
            <Box sx={{ width: `${row.percent ?? 15}%`, height: '100%', borderRadius: '999px', bgcolor: color }} />
          </Box>
        </Box>
      ))}
    </Box>
  );
}

function MaintenanceDrilldownDialog({
  openType,
  onClose,
}: {
  openType: DrilldownType | null;
  onClose: () => void;
}) {
  const metric = sections
    .flatMap((section) => section.metrics)
    .find((item) => item.drilldown === openType);

  if (!metric) return null;

  const isBacklog = openType === 'backlog';
  const isMtbf = openType === 'mtbf';
  const isPreventiveRatio = openType === 'preventiveRatio';
  const isCavityAvailability = openType === 'cavityAvailability';
  const isMaintenanceTurnover = openType === 'maintenanceTurnover';

  return (
    <Dialog
      open={Boolean(openType)}
      onClose={onClose}
      maxWidth={false}
      PaperProps={{
        sx: {
          width: isMtbf ? 760 : isPreventiveRatio ? 620 : 410,
          maxWidth: 'calc(100vw - 28px)',
          borderRadius: '12px',
          bgcolor: surfaceBackground,
          boxShadow: '0 22px 50px rgba(0,0,0,0.22)',
          border: paperBorder,
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: isMtbf || isPreventiveRatio ? 'flex-end' : 'space-between', px: 1.25, pt: 1.2, pb: isMtbf || isPreventiveRatio ? 0 : 0.7 }}>
        {isMtbf || isPreventiveRatio ? null : (
          <Typography sx={{ color: tokenText.primary, fontWeight: 900, fontSize: '1rem', lineHeight: 1.1 }}>
            {metric.label}
          </Typography>
        )}
        <Tooltip title="Close">
          <IconButton size="small" onClick={onClose} sx={{ color: tokenBrand.main }}>
            <CloseIcon sx={{ fontSize: 17 }} />
          </IconButton>
        </Tooltip>
      </Box>

      <DialogContent sx={{ p: 0, px: isMtbf || isPreventiveRatio ? { xs: 2, sm: 2.3 } : 1.25, pb: isMtbf || isPreventiveRatio ? 2 : 1.25, display: 'flex', flexDirection: 'column', gap: 1.15 }}>
        {isMtbf ? <MtbfDetails /> : isPreventiveRatio ? <PreventiveRatioDetails /> : <DialogMetricSummary metric={metric} />}

        {isBacklog ? (
          <>
            <ModalCard>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.2 }}>
                <Typography sx={{ color: tokenText.primary, fontWeight: 900, fontSize: '0.83rem' }}>
                  Backlog Trend
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.65 }}>
                  <SmallPill label="Week" active />
                  <SmallPill label="Month" />
                  <SmallPill label="Year" />
                </Box>
              </Box>
              <TrendLineChart />
            </ModalCard>

            <ModalCard>
              <Typography sx={{ color: tokenText.primary, fontWeight: 900, fontSize: '0.83rem', mb: 1.55 }}>
                By WO State
              </Typography>
              <BacklogBars rows={backlogStateRows} color={tokenWarning.main} />
            </ModalCard>

            <ModalCard>
              <Typography sx={{ color: tokenText.primary, fontWeight: 900, fontSize: '0.83rem', mb: 1.55 }}>
                By WO Type
              </Typography>
              <BacklogBars rows={backlogTypeRows} color={tokenError.main} thin />
            </ModalCard>
          </>
        ) : openType === 'cycleTime' ? (
          <ModalCard>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography sx={{ color: tokenText.primary, fontWeight: 900, fontSize: '0.83rem' }}>
                Cycle Time Trend
              </Typography>
              <SparkleIcon sx={{ color: tokenBrand.lightest, fontSize: 22 }} />
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.55 }}>
              {cycleTimeRows.map((row) => (
                <Box key={row.label}>
                  <Typography sx={{ color: tokenText.secondary, fontSize: '0.76rem', mb: 0.55, lineHeight: 1 }}>
                    {row.label}
                  </Typography>
                  <Box sx={{ height: 5, borderRadius: '999px', bgcolor: tokenNeutral.main, overflow: 'hidden' }}>
                    <Box sx={{ width: `${row.percent}%`, height: '100%', borderRadius: '999px', bgcolor: tokenInfo.main }} />
                  </Box>
                </Box>
              ))}
            </Box>
          </ModalCard>
        ) : isCavityAvailability ? (
          <ModalCard>
            <Typography sx={{ color: tokenText.primary, fontWeight: 900, fontSize: '0.83rem', mb: 1.55 }}>
              Cavity availability by mold
            </Typography>
            <BacklogBars rows={moldCavityAvailabilityRows} color={tokenSuccess.main} />
          </ModalCard>
        ) : isMaintenanceTurnover ? (
          <ModalCard>
            <Typography sx={{ color: tokenText.primary, fontWeight: 900, fontSize: '0.83rem', mb: 1.55 }}>
              Turn-over time by stage
            </Typography>
            <BacklogBars rows={moldTurnoverRows} color={tokenWarning.main} />
          </ModalCard>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function PerformanceSection({
  section,
  filterSelections,
  onFilterChange,
  onOpenDrilldown,
  onOpenAi,
}: {
  section: Section;
  filterSelections: FilterSelectionState;
  onFilterChange: (filterKey: string, values: string[]) => void;
  onOpenDrilldown: (drilldown: DrilldownType) => void;
  onOpenAi: (sectionTitle: string) => void;
}) {
  const hasWideMetric = section.metrics.length === 3 || section.metrics.length === 2;

  return (
    <Paper
      elevation={0}
      sx={{
        height: '100%',
        p: { xs: 1.35, md: 1.65 },
        borderRadius: '16px',
        bgcolor: surfaceBackground,
        border: paperBorder,
        boxShadow: 'none',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.7, gap: 1 }}>
        <Typography sx={{ color: tokenText.primary, fontWeight: 900, fontSize: { xs: '0.98rem', md: '1.05rem' }, lineHeight: 1.15 }}>
          {section.title}
        </Typography>
        <SectionActions onOpenAi={() => onOpenAi(section.title)} />
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 2.2, minHeight: 18, mb: 1.3, flexWrap: 'wrap' }}>
        {section.filters.map((filter) => {
          const filterKey = getFilterKey(section.title, filter);
          const options = filterOptionsByLabel[filter] ?? [];
          const selectedValues = filterSelections[filterKey] ?? options;
          return (
            <FilterButton
              key={filter}
              label={filter}
              selectedValues={selectedValues}
              onChange={(values) => onFilterChange(filterKey, values)}
            />
          );
        })}
      </Box>

      <Grid container spacing={1.1}>
        {section.metrics.map((metric, index) => {
          const fullWidth = index === 0 || hasWideMetric;
          return (
            <Grid key={`${section.title}-${metric.label}`} size={{ xs: 12, sm: fullWidth ? 12 : 6 }}>
              <MetricTile metric={metric} compact={section.metrics.length <= 2} onOpenDrilldown={onOpenDrilldown} />
            </Grid>
          );
        })}
      </Grid>
    </Paper>
  );
}

export default function MaintenancePerformancePage({ activeTheme: propTheme }: MaintenancePerformancePageProps) {
  const theme = propTheme ?? activeTheme;
  const [openDrilldown, setOpenDrilldown] = React.useState<DrilldownType | null>(null);
  const [aiRecommendationContext, setAiRecommendationContext] = React.useState<AiRecommendationContext | null>(null);
  const [toastMessage, setToastMessage] = React.useState('');
  const [isAiInsightsExpanded, setIsAiInsightsExpanded] = React.useState(true);
  const [filterSelections, setFilterSelections] = React.useState<FilterSelectionState>(() => (
    sections.reduce<FilterSelectionState>((acc, section) => {
      section.filters.forEach((filter) => {
        acc[getFilterKey(section.title, filter)] = filterOptionsByLabel[filter] ?? [];
      });
      return acc;
    }, {})
  ));

  const [selectedHierarchyId, setSelectedHierarchyId] = React.useState<string | null>(null);
  const [expandedHierarchyIds, setExpandedHierarchyIds] = React.useState<string[]>(initialExpandedHierarchyIds);
  const [hierarchySearchQuery, setHierarchySearchQuery] = React.useState('');

  const handleHierarchyClick = (hierarchyId: string) => {
    setSelectedHierarchyId(hierarchyId);
  };

  const handleToggleHierarchyNode = (hierarchyId: string) => {
    setExpandedHierarchyIds((prev) => (prev.includes(hierarchyId) ? prev.filter((id) => id !== hierarchyId) : [...prev, hierarchyId]));
  };

  const handleFilterChange = (filterKey: string, values: string[]) => {
    setFilterSelections((prev) => ({ ...prev, [filterKey]: values }));
  };

  const showToast = (message: string) => {
    setToastMessage(message);
  };

  const handleOpenAiRecommendations = (sectionTitle: string) => {
    setAiRecommendationContext({
      sectionTitle,
      actionPlanCreated: false,
      workOrderCreated: false,
    });
  };

  const handleCreateActionPlan = () => {
    setAiRecommendationContext((current) => (current ? { ...current, actionPlanCreated: true } : current));
    showToast('Action plan created from AI recommendations.');
  };

  const handleCreateWorkOrder = () => {
    setAiRecommendationContext((current) => (current ? { ...current, workOrderCreated: true } : current));
    showToast('Maintenance work order created from AI recommendations.');
  };

  const handleCopyRecommendations = async () => {
    if (!aiRecommendationContext) return;

    const text = buildRecommendationClipboardText(aiRecommendationContext.sectionTitle);

    try {
      await navigator.clipboard?.writeText(text);
      showToast('Recommendations copied to clipboard.');
    } catch {
      showToast('Recommendations ready to copy.');
    }
  };

  const selectedHierarchyItem = hierarchyItems.find((item) => item.id === 'asset-sa-204') ?? hierarchyItems[0];
  const headerHierarchyPath = getHierarchyPathLabels(selectedHierarchyItem.id).join(' / ');

  return (
    <Box sx={{ flexGrow: 1, overflowY: 'auto', bgcolor: 'background.default', p: { xs: 2, md: 3 } }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          gap: 1.5,
          flexWrap: 'wrap',
        }}
      >
        <Typography variant="h5" sx={{ color: tokenText.primary, fontWeight: 800, fontSize: { xs: '1.35rem', md: '1.6rem' }, lineHeight: 1.05, letterSpacing: '-0.03em' }}>
          Maintenance Analytics
        </Typography>
        <Button variant="contained" size="small" sx={{ borderRadius: '8px', px: 2 }}>
          Export Insights
        </Button>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 1.4 }}>
        {/* Main Performance Content */}
        <Box sx={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Selected Asset Header Card */}
          <Paper elevation={0} sx={{ p: 2, border: paperBorder, borderRadius: '12px', bgcolor: surfaceBackground, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, flexWrap: 'wrap' }}>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle2" sx={{ color: tokenText.primary, fontWeight: 700, lineHeight: 1.57 }}>
                {selectedHierarchyItem.label}
              </Typography>
              <Typography variant="caption" sx={{ color: tokenText.secondary, display: 'flex', alignItems: 'center', gap: 0.45, mt: 0.2, fontWeight: 400 }}>
                <PreventiveIcon sx={{ fontSize: 14, color: tokenText.secondary }} /> {headerHierarchyPath}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
              <Chip label={selectedHierarchyItem.code} size="small" sx={{ height: 24, bgcolor: tokenNeutral.lightest, color: tokenText.primary, border: `1px solid ${tokenDivider}`, borderRadius: '999px', fontWeight: 500 }} />
              <Chip label="Criticality A" size="small" sx={{ height: 24, bgcolor: tokenError.lightest, color: tokenError.dark, borderRadius: '999px', fontWeight: 500 }} />
              <Chip icon={<AlertIcon sx={{ fontSize: '14px !important' }} />} label="Warning" size="small" sx={{ height: 24, bgcolor: tokenWarning.lightest, color: tokenWarning.dark, borderRadius: '999px', fontWeight: 500 }} />
              <Chip label="In Operation" size="small" sx={{ height: 24, bgcolor: tokenBrand.softBg, color: tokenBrand.main, borderRadius: '999px', fontWeight: 500 }} />
            </Box>
          </Paper>

          {/* Performance KPI Section */}
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: '16px', border: paperBorder, bgcolor: 'background.paper' }}>
            <Paper
              elevation={0}
              sx={{
                mb: 2,
                p: 2,
                borderRadius: '12px',
                bgcolor: tokenNeutral.lightest,
                border: 'none',
                boxShadow: 'none',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, alignItems: 'center', mb: 0.6 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                  <SparkleIcon sx={{ fontSize: 17, color: tokenWarning.main }} />
                  <Typography sx={{ color: tokenBrand.main, fontWeight: 800, fontSize: '1rem', lineHeight: 1 }}>
                    BLU.AI Insights
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                  <Button
                    size="small"
                    onClick={() => setIsAiInsightsExpanded((current) => !current)}
                    endIcon={<KeyboardArrowDownIcon sx={{ fontSize: 15, color: tokenBrand.main, transform: isAiInsightsExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />}
                    sx={{
                      color: tokenText.secondary,
                      fontSize: '0.62rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      minWidth: 0,
                      px: 0.5,
                      py: 0,
                      '& .MuiButton-endIcon': { ml: 0.2 },
                      '&:hover': { bgcolor: 'transparent', color: tokenText.primary },
                    }}
                  >
                    {isAiInsightsExpanded ? 'Collapse' : 'Expand'}
                  </Button>
                  <StarIcon sx={{ fontSize: 17, color: tokenBrand.main }} />
                  <OpenInFullIcon sx={{ fontSize: 16, color: tokenBrand.main }} />
                </Box>
              </Box>

              {isAiInsightsExpanded ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  {aiInsights.map((insight, index) => {
                    const isHighlighted = index === 0;
                    const iconColor = insight.tone === 'warning' ? tokenError.main : tokenBrand.main;
                    const Icon = insight.tone === 'warning' ? AlertIcon : InfoIcon;

                    return (
                      <Box
                        key={`${insight.kpi}-${insight.trend}`}
                        sx={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 1,
                          px: isHighlighted ? 2 : 1,
                          py: isHighlighted ? 1.5 : 0.5,
                          borderRadius: '6px',
                          bgcolor: isHighlighted ? 'rgba(0,0,0,0.03)' : 'transparent',
                          border: isHighlighted ? paperBorder : '1px solid transparent',
                        }}
                      >
                        <Icon sx={{ color: iconColor, fontSize: 16, flexShrink: 0, mt: 0.2 }} />
                        <Typography sx={{ color: tokenText.secondary, fontSize: '0.75rem', lineHeight: '20px', fontWeight: 400, flex: 1 }}>
                          <Box component="span" sx={{ color: tokenText.primary, fontWeight: 700 }}>
                            {insight.kpi}
                          </Box>{' '}
                          {insight.trend}{' '}
                          <Box component="span" sx={{ color: tokenText.primary, fontWeight: 700 }}>
                            Primary driver:
                          </Box>{' '}
                          {insight.driver}
                          {insight.recommendation ? (
                            <>
                              {' '}
                              <Box component="span" sx={{ color: tokenText.primary, fontWeight: 700 }}>
                                Recommended action:
                              </Box>{' '}
                              {insight.recommendation}
                            </>
                          ) : null}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              ) : null}
            </Paper>

            <Grid container spacing={2}>
              {sections.map((section) => (
                <Grid key={section.title} size={{ xs: 12, md: 6 }}>
                  <PerformanceSection
                    section={section}
                    filterSelections={filterSelections}
                    onFilterChange={handleFilterChange}
                    onOpenDrilldown={setOpenDrilldown}
                    onOpenAi={handleOpenAiRecommendations}
                  />
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Box>
      </Box>
      <MaintenanceDrilldownDialog openType={openDrilldown} onClose={() => setOpenDrilldown(null)} />
      <AiRecommendationsDialog
        context={aiRecommendationContext}
        onClose={() => setAiRecommendationContext(null)}
        onCreateActionPlan={handleCreateActionPlan}
        onCreateWorkOrder={handleCreateWorkOrder}
        onCopyRecommendations={handleCopyRecommendations}
      />
      <Snackbar
        open={Boolean(toastMessage)}
        autoHideDuration={2600}
        onClose={() => setToastMessage('')}
        message={toastMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
}
