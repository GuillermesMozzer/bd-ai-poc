import DemandMatrixTab from './demandMatrix/DemandMatrixTab';
import ResourceDistributionTab from './resourceDistribution/ResourceDistributionTab';
import {
  AutoAwesome as AutoAwesomeIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  Close as CloseIcon,
  CompareArrows as CompareArrowsIcon,
  Inventory2Outlined as Inventory2OutlinedIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowRight as KeyboardArrowRightIcon,
  LinkOutlined as LinkOutlinedIcon,
  East as EastIcon,
  LocalShippingOutlined as LocalShippingOutlinedIcon,
  OpenInNew as OpenInNewIcon,
  PersonOutline as PersonOutlineIcon,
  ReportProblemOutlined as ReportProblemOutlinedIcon,
  RestartAlt as RestartAltIcon,
  RuleFolderOutlined as RuleFolderOutlinedIcon,
  ScienceOutlined as ScienceOutlinedIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import {Fragment, useEffect, useMemo, useState} from 'react';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {ActionButton, DataTable, InsightCard, MetricCard, SectionHeader, StatusPill} from '../ui/PlanningComponents';
import AiForecastAssistantPanel from './components/AiForecastAssistantPanel';
import type {LongTermAiAuditEvent, LongTermPlanningAiProposal} from './aiProposalTypes';
import {planningCardSx, planningSurfaceSx, planningTokens} from '../ui/planningTheme';
import {
  approvalAuditEvents,
  commitmentByMonth,
  constraints,
  forecastHeader,
  forecastKpis,
  inventoryByFamily,
  inventoryProjection,
  linkedMpsForForecast,
  monthlyDemandCapacity,
  scenarios,
  type ApprovalAuditEvent,
  type CommitmentMonth,
  type ConstraintRecord,
  type DemandCapacityMonth,
  type InventoryProjectionMonth,
  type LinkedMps,
  type LinkedMpsType,
  type ScenarioDefinition,
} from './forecastWorkspaceMock';

type ScenarioAssumptions = ScenarioDefinition['assumptions'];
type PlanningTab = 0 | 1 | 2 | 3 | 4 | 5 | 6;
type ViewMode = 'Monthly' | 'Weekly';
type GroupingMode = 'By Site' | 'By Line' | 'By Product Family';
type ApprovalStatus = 'Draft' | 'Submitted' | 'Approved' | 'Rejected' | 'Returned for Revision';

type DerivedDemandCapacityRow = DemandCapacityMonth & {
  displayedDemandUnits: number;
  displayedRequiredCapacityHours: number;
  displayedAvailableCapacityHours: number;
  capacityGapHours: number;
  utilizationPct: number;
  overload: boolean;
};

type DerivedCommitmentRow = CommitmentMonth & {
  gap: number;
  coveragePct: number;
  status: 'Covered' | 'At Risk';
};

type CommitmentSkuDerivedRow = {
  month: string;
  sku: string;
  forecastDemand: number;
  proposedCommitment: number;
  gap: number;
  coveragePct: number;
  status: 'Covered' | 'At Risk';
  mainGapReason: string;
  requiredDecision: string;
};

type DerivedInventoryRow = InventoryProjectionMonth & {
  adjustedClosingInventory: number;
  adjustedWeeksCoverage: number;
  risk: 'Low' | 'Medium' | 'High';
};

type ScenarioMetrics = {
  demandCoveragePct: number;
  capacityUtilizationPct: number;
  siteCommitmentUnits: number;
  inventoryWeeksCoverage: number;
  monthsBelowMinimum: number;
  monthsAboveMaximum: number;
  materialShortageRisk: string;
  qualityReleaseRisk: string;
  sterilizationRisk: string;
  extraCapacityRequired: number;
  planningConfidence: 'High' | 'Medium' | 'Low';
  riskMonths: string[];
};

const tabLabels = [
  'Demand Matrix',
  'Resource Distribution',
  'Inventory Projection',
  'Constraint Analysis',
  'Scenarios',
  'Site Commitment',
  'Approval & Audit',
] as const;

const dropdownFieldSx = {
  minWidth: 170,
  '& .MuiOutlinedInput-root': {
    height: 38,
    borderRadius: 2.5,
    bgcolor: 'var(--planning-surface)',
  },
};

const tableCellSx = {
  borderBottom: `1px solid ${planningTokens.border}`,
  fontSize: 12.5,
  color: planningTokens.textPrimary,
  py: 1.05,
};

const readOnlyFieldSx = {
  '& .MuiOutlinedInput-root': {
    height: 40,
    borderRadius: 2.5,
    bgcolor: '#F8FAFF',
  },
};

function formatUnits(value: number) {
  return new Intl.NumberFormat('en-US').format(Math.round(value));
}

function formatCompactUnits(value: number) {
  if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(2).replace(/\.00$/, '')}M`;
  if (Math.abs(value) >= 1_000) return `${(value / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  return String(Math.round(value));
}

function formatPercent(value: number, digits = 1) {
  return `${value.toFixed(digits)}%`;
}

function formatWeeks(value: number) {
  return `${value.toFixed(1)} weeks`;
}

function riskChipTone(risk: 'Low' | 'Medium' | 'High') {
  if (risk === 'High') {
    return {bg: '#FEF2F2', color: planningTokens.danger, border: '#FECACA'};
  }
  if (risk === 'Medium') {
    return {bg: '#FFF7ED', color: planningTokens.warning, border: '#FED7AA'};
  }
  return {bg: '#ECFDF3', color: planningTokens.success, border: '#BBF7D0'};
}

function statusToneFromApproval(status: ApprovalStatus) {
  if (status === 'Approved') return 'Validated';
  if (status === 'Rejected') return 'Blocker';
  if (status === 'Submitted') return 'CapacityReviewed';
  if (status === 'Returned for Revision') return 'Warning';
  return 'Draft';
}

function statusLabelFromScenario(scenario: ScenarioDefinition, metrics: ScenarioMetrics) {
  if (scenario.id === 'capacity-recovery') return 'Recommended';
  if (scenario.id === 'quality-delay') return 'High risk';
  if (scenario.id === 'constrained-commitment') return 'Low operational risk';
  if (scenario.id === 'demand-smoothing') return metrics.riskMonths.length > 1 ? 'Feasible with risks' : 'Feasible';
  return metrics.riskMonths.length > 0 ? 'Not feasible' : 'Feasible';
}

function linkedMpsStatusTone(status: string) {
  if (status === 'Approved') return {bg: planningTokens.successBg, color: planningTokens.success, border: planningTokens.successBorder};
  if (status === 'Pending Approval') return {bg: planningTokens.warningBg, color: planningTokens.warning, border: planningTokens.warningBorder};
  return {bg: planningTokens.draftBg, color: planningTokens.textSecondary, border: planningTokens.draftBorder};
}

function linkedMpsTypeTone(type: LinkedMpsType) {
  if (type === 'Actual Evaluation') return {bg: planningTokens.neutralBg, color: planningTokens.primaryBlue, border: planningTokens.neutralBorder};
  return {bg: planningTokens.aiAccentBg, color: planningTokens.aiAccent, border: planningTokens.aiAccentBorder};
}

function ConfidenceChip({value}: {value: 'High' | 'Medium' | 'Low'}) {
  const tone = riskChipTone(value === 'High' ? 'Low' : value === 'Medium' ? 'Medium' : 'High');
  return (
    <Chip
      size="small"
      label={value}
      sx={{
        height: 24,
        fontWeight: 800,
        bgcolor: tone.bg,
        color: tone.color,
        border: `1px solid ${tone.border}`,
      }}
    />
  );
}

function RiskChip({value}: {value: 'Low' | 'Medium' | 'High'}) {
  const tone = riskChipTone(value);
  return (
    <Chip
      size="small"
      label={value}
      sx={{
        height: 24,
        fontWeight: 800,
        bgcolor: tone.bg,
        color: tone.color,
        border: `1px solid ${tone.border}`,
      }}
    />
  );
}

function deriveDemandCapacityRows(data: DemandCapacityMonth[], assumptions: ScenarioAssumptions, viewMode: ViewMode) {
  return data.map((row, index) => {
    const recoveryBoost = index >= 8 && index <= 10
      ? assumptions.overtimeHours * 7 + assumptions.additionalShifts * 220
      : index === 7
        ? assumptions.overtimeHours * 3 + assumptions.additionalShifts * 100
        : assumptions.overtimeHours * 0.6;
    const smoothingShift = assumptions.demandShiftPct / 100;
    const inboundShift = index <= 7 ? (index >= 6 ? row.demandUnits * smoothingShift * 0.55 : row.demandUnits * smoothingShift * 0.2) : 0;
    const outboundShift = index >= 9 ? -row.demandUnits * smoothingShift * 0.6 : index === 8 ? -row.demandUnits * smoothingShift * 0.25 : 0;
    const qualityPenalty = (assumptions.materialDelayDays * 120) + (assumptions.qualityDelayDays * 150);
    const sterilizationPenalty = assumptions.sterilizationCapacityFactor < 1 ? (1 - assumptions.sterilizationCapacityFactor) * 3000 : 0;
    const adjustedDemandUnits = row.demandUnits + inboundShift + outboundShift;
    const requiredCapacityHours = row.requiredCapacityHours + (adjustedDemandUnits - row.demandUnits) * 1.18;
    const availableCapacityHours = (row.availableCapacityHours * assumptions.capacityRecoveryFactor * assumptions.sterilizationCapacityFactor)
      + recoveryBoost
      - qualityPenalty
      - sterilizationPenalty;
    const divisor = viewMode === 'Weekly' ? 4.33 : 1;
    const displayedDemandUnits = adjustedDemandUnits / divisor;
    const displayedRequiredCapacityHours = requiredCapacityHours / divisor;
    const displayedAvailableCapacityHours = availableCapacityHours / divisor;
    const capacityGapHours = availableCapacityHours - requiredCapacityHours;
    const utilizationPct = requiredCapacityHours > 0 ? (requiredCapacityHours / availableCapacityHours) * 100 : 0;
    return {
      ...row,
      displayedDemandUnits,
      displayedRequiredCapacityHours,
      displayedAvailableCapacityHours,
      capacityGapHours,
      utilizationPct,
      overload: capacityGapHours < 0,
    };
  });
}

function deriveCommitmentRows(rows: CommitmentMonth[], assumptions: ScenarioAssumptions, scenarioId: string) {
  return rows.map((row, index) => {
    let proposedCommitment = row.proposedCommitment;
    if (scenarioId === 'capacity-recovery' && (index === 8 || index === 9 || index === 10)) {
      proposedCommitment += Math.round(assumptions.overtimeHours * 3.4 + assumptions.additionalShifts * 700);
    }
    if (scenarioId === 'demand-smoothing' && (index === 7 || index === 8)) {
      proposedCommitment += Math.round(row.forecastDemand * (assumptions.demandShiftPct / 100) * 0.18);
    }
    if (scenarioId === 'demand-smoothing' && (index === 9 || index === 10)) {
      proposedCommitment -= Math.round(row.forecastDemand * (assumptions.demandShiftPct / 100) * 0.38);
    }
    if (scenarioId === 'constrained-commitment') {
      proposedCommitment = Math.min(proposedCommitment, Math.round(row.forecastDemand * 0.965));
    }
    if (scenarioId === 'quality-delay' && (index === 9 || index === 10 || index === 11)) {
      proposedCommitment -= Math.round(assumptions.qualityDelayDays * 185);
    }
    proposedCommitment = Math.max(0, Math.min(Math.round(proposedCommitment), row.forecastDemand));
    const gap = proposedCommitment - row.forecastDemand;
    const coveragePct = row.forecastDemand > 0 ? (proposedCommitment / row.forecastDemand) * 100 : 0;
    return {
      ...row,
      proposedCommitment,
      gap,
      coveragePct,
      status: coveragePct < 95 ? 'At Risk' : 'Covered',
    } as DerivedCommitmentRow;
  });
}

const SKU_SHARES = [
  {sku: 'Family A', share: 0.35},
  {sku: 'Family B', share: 0.28},
  {sku: 'Family C', share: 0.24},
  {sku: 'Other', share: 0.13},
] as const;

const SKU_GAP_OVERRIDES: Record<string, Record<string, {mainGapReason: string; requiredDecision: string; gapShare: number}>> = {
  'Feb-2027': {
    'Family A': {mainGapReason: 'Recovery plan not yet approved', requiredDecision: 'Confirm overtime budget', gapShare: 0.55},
    'Family C': {mainGapReason: 'Recovery plan not yet approved', requiredDecision: 'Confirm overtime budget', gapShare: 0.45},
  },
  'Mar-2027': {
    'Family A': {mainGapReason: 'Capacity overload', requiredDecision: 'Approve recovery capacity', gapShare: 0.40},
    'Family B': {mainGapReason: 'Capacity overload', requiredDecision: 'Approve recovery capacity', gapShare: 0.40},
    'Family C': {mainGapReason: 'Capacity overload', requiredDecision: 'Approve recovery capacity', gapShare: 0.20},
  },
  'Apr-2027': {
    'Family B': {mainGapReason: 'Material availability', requiredDecision: 'Confirm supplier recovery', gapShare: 1.0},
  },
};

function deriveCommitmentSkuRows(derivedRows: DerivedCommitmentRow[]): CommitmentSkuDerivedRow[] {
  const result: CommitmentSkuDerivedRow[] = [];
  for (const row of derivedRows) {
    const monthOverrides = SKU_GAP_OVERRIDES[row.month] ?? {};
    for (const {sku, share} of SKU_SHARES) {
      const skuForecast = Math.round(row.forecastDemand * share);
      const skuOverride = monthOverrides[sku];
      let skuCommitment: number;
      if (row.gap < 0 && skuOverride) {
        skuCommitment = Math.max(0, skuForecast + Math.round(row.gap * skuOverride.gapShare));
      } else if (row.gap < 0) {
        skuCommitment = skuForecast;
      } else {
        skuCommitment = Math.round(row.proposedCommitment * share);
      }
      const skuGap = skuCommitment - skuForecast;
      const skuCoveragePct = skuForecast > 0 ? (skuCommitment / skuForecast) * 100 : 0;
      result.push({
        month: row.month,
        sku,
        forecastDemand: skuForecast,
        proposedCommitment: skuCommitment,
        gap: skuGap,
        coveragePct: skuCoveragePct,
        status: skuCoveragePct < 95 ? 'At Risk' : 'Covered',
        mainGapReason: skuOverride?.mainGapReason ?? 'None',
        requiredDecision: skuOverride?.requiredDecision ?? 'No action',
      });
    }
  }
  return result;
}

function deriveInventoryRows(rows: InventoryProjectionMonth[], assumptions: ScenarioAssumptions, scenarioId: string) {
  return rows.map((row, index) => {
    const buildAheadGain = index <= 7 ? assumptions.buildAheadQuantity * 0.55 : index === 8 ? assumptions.buildAheadQuantity * 0.25 : 0;
    const smoothingEffect = scenarioId === 'demand-smoothing' && index >= 9 ? assumptions.buildAheadQuantity * 0.3 : 0;
    const delayPenalty = (assumptions.materialDelayDays * 120) + (assumptions.qualityDelayDays * 140);
    const targetShift = (assumptions.inventoryTargetWeeks - 4.8) * 1100;
    const adjustedClosingInventory = row.projectedClosingInventory + buildAheadGain + targetShift + smoothingEffect - delayPenalty;
    const adjustedWeeksCoverage = row.weeksCoverage + ((adjustedClosingInventory - row.projectedClosingInventory) / 8200);
    const risk = adjustedClosingInventory < row.minTarget
      ? 'High'
      : adjustedClosingInventory > row.maxTarget
        ? 'Medium'
        : adjustedWeeksCoverage < 4
          ? 'Medium'
          : 'Low';
    return {
      ...row,
      adjustedClosingInventory,
      adjustedWeeksCoverage,
      risk,
    } as DerivedInventoryRow;
  });
}

function deriveScenarioMetrics(commitments: DerivedCommitmentRow[], demandCapacityRows: DerivedDemandCapacityRow[], inventoryRows: DerivedInventoryRow[], scenarioId: string) {
  const totalForecast = commitments.reduce((sum, row) => sum + row.forecastDemand, 0);
  const totalCommitment = commitments.reduce((sum, row) => sum + row.proposedCommitment, 0);
  const demandCoveragePct = totalForecast > 0 ? (totalCommitment / totalForecast) * 100 : 0;
  const capacityUtilizationPct = demandCapacityRows.reduce((sum, row) => sum + row.utilizationPct, 0) / demandCapacityRows.length;
  const inventoryWeeksCoverage = inventoryRows.reduce((sum, row) => sum + row.adjustedWeeksCoverage, 0) / inventoryRows.length;
  const monthsBelowMinimum = inventoryRows.filter((row) => row.adjustedClosingInventory < row.minTarget).length;
  const monthsAboveMaximum = inventoryRows.filter((row) => row.adjustedClosingInventory > row.maxTarget).length;
  const extraCapacityRequired = demandCapacityRows
    .filter((row) => row.capacityGapHours < 0)
    .reduce((sum, row) => sum + Math.abs(row.capacityGapHours), 0);
  const riskMonths = commitments.filter((row) => row.status === 'At Risk').map((row) => row.month);
  const planningConfidence: 'High' | 'Medium' | 'Low' = scenarioId === 'quality-delay'
    ? 'Low'
    : scenarioId === 'capacity-recovery'
      ? 'High'
      : (riskMonths.length > 1 || monthsBelowMinimum > 0 || extraCapacityRequired > 12000)
        ? 'Medium'
        : 'High';
  return {
    demandCoveragePct,
    capacityUtilizationPct,
    siteCommitmentUnits: totalCommitment,
    inventoryWeeksCoverage,
    monthsBelowMinimum,
    monthsAboveMaximum,
    materialShortageRisk: scenarioId === 'quality-delay' ? 'High' : scenarioId === 'capacity-recovery' ? 'Medium' : 'Low',
    qualityReleaseRisk: scenarioId === 'quality-delay' ? 'High' : scenarioId === 'baseline' ? 'Medium' : 'Low',
    sterilizationRisk: scenarioId === 'quality-delay' ? 'High' : scenarioId === 'capacity-recovery' ? 'Medium' : 'Low',
    extraCapacityRequired,
    planningConfidence,
    riskMonths,
  } as ScenarioMetrics;
}

function createAuditEvent(action: string, object: string, previousValue: string, newValue: string, reasonComment: string): ApprovalAuditEvent {
  const now = new Date();
  const timestamp = `${String(now.getDate()).padStart(2, '0')}-${now.toLocaleString('en-US', {month: 'short'})}-${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  return {
    timestamp,
    user: 'Maya Planner',
    action,
    object,
    previousValue,
    newValue,
    reasonComment,
  };
}

type LongTermPlanningPageProps = {
  mode?: 'overview' | 'grid';
  onOpenMpsVersion?: (mpsVersionId: string) => void;
};

export default function LongTermPlanningPage({mode = 'grid', onOpenMpsVersion}: LongTermPlanningPageProps) {
  const [activeTab, setActiveTab] = useState<PlanningTab>(0);
  const [viewMode, setViewMode] = useState<ViewMode>('Monthly');
  const [groupingMode, setGroupingMode] = useState<GroupingMode>('By Site');
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('capacity-recovery');
  const [scenarioState, setScenarioState] = useState(scenarios);
  const [commitmentRows, setCommitmentRows] = useState(commitmentByMonth);
  const [selectedCommitmentMonth, setSelectedCommitmentMonth] = useState<string>(commitmentByMonth[9]?.month ?? commitmentByMonth[0].month);
  const [approvalStatus, setApprovalStatus] = useState<ApprovalStatus>('Draft');
  const [decisionComment, setDecisionComment] = useState('');
  const [auditEvents, setAuditEvents] = useState<ApprovalAuditEvent[]>(approvalAuditEvents);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [aiProposal, setAiProposal] = useState<LongTermPlanningAiProposal | null>(null);
  const [linkedMpsDrawerOpen, setLinkedMpsDrawerOpen] = useState(false);
  const [expandedCommitmentMonths, setExpandedCommitmentMonths] = useState<Set<string>>(new Set());

  useEffect(() => {
    setAuditEvents((current) => {
      if (current.some((event) => event.action === 'Forecast opened' && event.object === forecastHeader.title)) {
        return current;
      }
      return [
        createAuditEvent('Forecast opened', forecastHeader.title, 'Workspace not loaded', forecastHeader.status, 'Forecast-to-MPS planning workspace opened.'),
        ...current,
      ];
    });
  }, []);

  const selectedScenario = useMemo(
    () => scenarioState.find((scenario) => scenario.id === selectedScenarioId) ?? scenarioState[0],
    [scenarioState, selectedScenarioId],
  );

  const selectedAssumptions = selectedScenario.assumptions;

  const derivedDemandCapacityRows = useMemo(
    () => deriveDemandCapacityRows(monthlyDemandCapacity, selectedAssumptions, viewMode),
    [selectedAssumptions, viewMode],
  );

  const derivedCommitmentRows = useMemo(
    () => deriveCommitmentRows(commitmentRows, selectedAssumptions, selectedScenario.id),
    [commitmentRows, selectedAssumptions, selectedScenario.id],
  );

  const derivedInventoryRows = useMemo(
    () => deriveInventoryRows(inventoryProjection, selectedAssumptions, selectedScenario.id),
    [selectedAssumptions, selectedScenario.id],
  );

  const scenarioMetrics = useMemo(
    () => deriveScenarioMetrics(derivedCommitmentRows, derivedDemandCapacityRows, derivedInventoryRows, selectedScenario.id),
    [derivedCommitmentRows, derivedDemandCapacityRows, derivedInventoryRows, selectedScenario.id],
  );

  const comparisonRows = useMemo(() => {
    const byScenario = Object.fromEntries(
      scenarioState.map((scenario) => {
        const demandCapacityRows = deriveDemandCapacityRows(monthlyDemandCapacity, scenario.assumptions, 'Monthly');
        const commitments = deriveCommitmentRows(commitmentRows, scenario.assumptions, scenario.id);
        const inventoryRows = deriveInventoryRows(inventoryProjection, scenario.assumptions, scenario.id);
        return [scenario.id, deriveScenarioMetrics(commitments, demandCapacityRows, inventoryRows, scenario.id)];
      }),
    ) as Record<string, ScenarioMetrics>;

    return [
      {
        label: 'Demand coverage %',
        baseline: formatPercent(byScenario.baseline.demandCoveragePct),
        capacityRecovery: formatPercent(byScenario['capacity-recovery'].demandCoveragePct),
        demandSmoothing: formatPercent(byScenario['demand-smoothing'].demandCoveragePct),
        constrainedCommitment: formatPercent(byScenario['constrained-commitment'].demandCoveragePct),
        qualityDelay: formatPercent(byScenario['quality-delay'].demandCoveragePct),
      },
      {
        label: 'Capacity utilization %',
        baseline: formatPercent(byScenario.baseline.capacityUtilizationPct),
        capacityRecovery: formatPercent(byScenario['capacity-recovery'].capacityUtilizationPct),
        demandSmoothing: formatPercent(byScenario['demand-smoothing'].capacityUtilizationPct),
        constrainedCommitment: formatPercent(byScenario['constrained-commitment'].capacityUtilizationPct),
        qualityDelay: formatPercent(byScenario['quality-delay'].capacityUtilizationPct),
      },
      {
        label: 'Site commitment achieved',
        baseline: formatUnits(byScenario.baseline.siteCommitmentUnits),
        capacityRecovery: formatUnits(byScenario['capacity-recovery'].siteCommitmentUnits),
        demandSmoothing: formatUnits(byScenario['demand-smoothing'].siteCommitmentUnits),
        constrainedCommitment: formatUnits(byScenario['constrained-commitment'].siteCommitmentUnits),
        qualityDelay: formatUnits(byScenario['quality-delay'].siteCommitmentUnits),
      },
      {
        label: 'Inventory weeks coverage',
        baseline: formatWeeks(byScenario.baseline.inventoryWeeksCoverage),
        capacityRecovery: formatWeeks(byScenario['capacity-recovery'].inventoryWeeksCoverage),
        demandSmoothing: formatWeeks(byScenario['demand-smoothing'].inventoryWeeksCoverage),
        constrainedCommitment: formatWeeks(byScenario['constrained-commitment'].inventoryWeeksCoverage),
        qualityDelay: formatWeeks(byScenario['quality-delay'].inventoryWeeksCoverage),
      },
      {
        label: 'Months below minimum stock',
        baseline: String(byScenario.baseline.monthsBelowMinimum),
        capacityRecovery: String(byScenario['capacity-recovery'].monthsBelowMinimum),
        demandSmoothing: String(byScenario['demand-smoothing'].monthsBelowMinimum),
        constrainedCommitment: String(byScenario['constrained-commitment'].monthsBelowMinimum),
        qualityDelay: String(byScenario['quality-delay'].monthsBelowMinimum),
      },
      {
        label: 'Material shortage risk',
        baseline: byScenario.baseline.materialShortageRisk,
        capacityRecovery: byScenario['capacity-recovery'].materialShortageRisk,
        demandSmoothing: byScenario['demand-smoothing'].materialShortageRisk,
        constrainedCommitment: byScenario['constrained-commitment'].materialShortageRisk,
        qualityDelay: byScenario['quality-delay'].materialShortageRisk,
      },
      {
        label: 'Quality release risk',
        baseline: byScenario.baseline.qualityReleaseRisk,
        capacityRecovery: byScenario['capacity-recovery'].qualityReleaseRisk,
        demandSmoothing: byScenario['demand-smoothing'].qualityReleaseRisk,
        constrainedCommitment: byScenario['constrained-commitment'].qualityReleaseRisk,
        qualityDelay: byScenario['quality-delay'].qualityReleaseRisk,
      },
      {
        label: 'Sterilization / logistics risk',
        baseline: byScenario.baseline.sterilizationRisk,
        capacityRecovery: byScenario['capacity-recovery'].sterilizationRisk,
        demandSmoothing: byScenario['demand-smoothing'].sterilizationRisk,
        constrainedCommitment: byScenario['constrained-commitment'].sterilizationRisk,
        qualityDelay: byScenario['quality-delay'].sterilizationRisk,
      },
      {
        label: 'Extra capacity required',
        baseline: `${formatUnits(byScenario.baseline.extraCapacityRequired)} hrs`,
        capacityRecovery: `${formatUnits(byScenario['capacity-recovery'].extraCapacityRequired)} hrs`,
        demandSmoothing: `${formatUnits(byScenario['demand-smoothing'].extraCapacityRequired)} hrs`,
        constrainedCommitment: `${formatUnits(byScenario['constrained-commitment'].extraCapacityRequired)} hrs`,
        qualityDelay: `${formatUnits(byScenario['quality-delay'].extraCapacityRequired)} hrs`,
      },
      {
        label: 'Planning confidence',
        baseline: byScenario.baseline.planningConfidence,
        capacityRecovery: byScenario['capacity-recovery'].planningConfidence,
        demandSmoothing: byScenario['demand-smoothing'].planningConfidence,
        constrainedCommitment: byScenario['constrained-commitment'].planningConfidence,
        qualityDelay: byScenario['quality-delay'].planningConfidence,
      },
    ];
  }, [commitmentRows, scenarioState]);

  const headerKpis = useMemo(() => {
    const totalDemand = derivedCommitmentRows.reduce((sum, row) => sum + row.forecastDemand, 0);
    const totalCommitment = derivedCommitmentRows.reduce((sum, row) => sum + row.proposedCommitment, 0);
    const overloadMonths = derivedDemandCapacityRows.filter((row) => row.overload).map((row) => row.month);
    return [
      {...forecastKpis[0], value: `${formatUnits(totalDemand)} units`, helper: forecastKpis[0].helper},
      {...forecastKpis[1], value: `${Math.round(scenarioMetrics.capacityUtilizationPct)}%`, helper: forecastKpis[1].helper},
      {...forecastKpis[2], value: `${Math.round(scenarioMetrics.demandCoveragePct)}%`, helper: `${formatUnits(totalCommitment)} / ${formatUnits(totalDemand)} units`},
      {...forecastKpis[3], value: formatWeeks(scenarioMetrics.inventoryWeeksCoverage), helper: 'Target: 4–8 weeks'},
      {...forecastKpis[4], value: String(overloadMonths.length), helper: overloadMonths.join(', ') || 'No overload months'},
      {...forecastKpis[5], value: scenarioMetrics.planningConfidence, helper: 'Based on current scenario'},
    ];
  }, [derivedCommitmentRows, derivedDemandCapacityRows, scenarioMetrics]);

  const selectedCommitmentRow = derivedCommitmentRows.find((row) => row.month === selectedCommitmentMonth) ?? derivedCommitmentRows[0];

  const topConstraints = useMemo(() => {
    return derivedDemandCapacityRows
      .filter((row) => row.overload)
      .sort((a, b) => a.capacityGapHours - b.capacityGapHours)
      .slice(0, 3)
      .map((row, index) => ({
        line: ['Line 10', 'Line 07', 'Line 03'][index] ?? `Line ${index + 1}`,
        bottleneckMonth: row.month,
        gapHours: Math.round(row.capacityGapHours),
        utilizationPct: row.utilizationPct,
      }));
  }, [derivedDemandCapacityRows]);

  const capacitySummary = useMemo(() => {
    const available = derivedDemandCapacityRows.reduce((sum, row) => sum + row.displayedAvailableCapacityHours, 0);
    const required = derivedDemandCapacityRows.reduce((sum, row) => sum + row.displayedRequiredCapacityHours, 0);
    return {
      available,
      required,
      gap: available - required,
      utilization: scenarioMetrics.capacityUtilizationPct,
    };
  }, [derivedDemandCapacityRows, scenarioMetrics.capacityUtilizationPct]);

  const selectedConstraintGroups = useMemo(() => {
    return [
      {
        title: 'Material Constraints',
        icon: <ScienceOutlinedIcon sx={{fontSize: 18}} />,
        items: constraints.filter((item) => item.domain === 'Material Constraints'),
      },
      {
        title: 'Quality Constraints',
        icon: <RuleFolderOutlinedIcon sx={{fontSize: 18}} />,
        items: constraints.filter((item) => item.domain === 'Quality Constraints'),
      },
      {
        title: 'Warehouse / Logistics Constraints',
        icon: <LocalShippingOutlinedIcon sx={{fontSize: 18}} />,
        items: constraints.filter((item) => item.domain === 'Warehouse / Logistics Constraints'),
      },
      {
        title: 'Sterilization Constraints',
        icon: <Inventory2OutlinedIcon sx={{fontSize: 18}} />,
        items: constraints.filter((item) => item.domain === 'Sterilization Constraints'),
      },
    ];
  }, []);

  const inventoryFamilyRows = useMemo(() => {
    return inventoryByFamily.map((family) => ({
      ...family,
      projectedEndingInventory: Math.round(family.projectedEndingInventory + (selectedAssumptions.buildAheadQuantity * 0.14) - (selectedAssumptions.qualityDelayDays * 80)),
      weeksCoverage: Number((family.weeksCoverage + ((selectedAssumptions.inventoryTargetWeeks - 4.8) * 0.35)).toFixed(1)),
    }));
  }, [selectedAssumptions.buildAheadQuantity, selectedAssumptions.inventoryTargetWeeks, selectedAssumptions.qualityDelayDays]);

  function addAuditEvent(action: string, object: string, previousValue: string, newValue: string, reasonComment: string) {
    setAuditEvents((current) => [createAuditEvent(action, object, previousValue, newValue, reasonComment), ...current]);
  }

  function updateScenarioAssumption(field: keyof ScenarioAssumptions, value: number) {
    setScenarioState((current) =>
      current.map((scenario) =>
        scenario.id === selectedScenario.id
          ? {
              ...scenario,
              assumptions: {
                ...scenario.assumptions,
                [field]: value,
              },
            }
          : scenario,
      ),
    );
    addAuditEvent('Scenario modified', selectedScenario.name, `${selectedScenario.assumptions[field]}`, `${value}`, `Updated ${field} assumption in scenario workspace.`);
  }

  function updateCommitmentRow(field: keyof CommitmentMonth, value: string | boolean | number) {
    setCommitmentRows((current) =>
      current.map((row) => row.month === selectedCommitmentRow.month ? {...row, [field]: value} : row),
    );
    addAuditEvent(
      'Commitment edited',
      selectedCommitmentRow.month,
      String(selectedCommitmentRow[field as keyof DerivedCommitmentRow] ?? ''),
      String(value),
      'Planner updated draft commitment input. Source forecast demand remains read-only.',
    );
  }

  function handleApprovalAction(nextStatus: ApprovalStatus, action: string) {
    const previous = approvalStatus;
    setApprovalStatus(nextStatus);
    addAuditEvent(action, forecastHeader.title, previous, nextStatus, decisionComment || `${action} executed from Approval & Audit tab.`);
  }

  function resetScenarioAssumptions() {
    const original = scenarios.find((scenario) => scenario.id === selectedScenario.id);
    if (!original) return;
    setScenarioState((current) =>
      current.map((scenario) => scenario.id === selectedScenario.id ? {...scenario, assumptions: {...original.assumptions}} : scenario),
    );
    addAuditEvent('Scenario modified', selectedScenario.name, 'Edited assumptions', 'Reset to mock defaults', 'Planner reset current scenario assumptions.');
  }

  function renderDemandVsCapacityTab() {
    return (
      <Stack spacing={2}>
        <Paper elevation={0} sx={{...planningCardSx, p: 1.5}}>
          <Box sx={{display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap', alignItems: 'center', mb: 1.4}}>
            <Box>
              <Typography sx={{fontSize: 18, fontWeight: 900, color: planningTokens.textPrimary}}>
                Demand vs Capacity by Month
              </Typography>
              <Typography sx={{fontSize: 13, color: planningTokens.textSecondary, mt: 0.5}}>
                Current scenario: {selectedScenario.name}. {viewMode === 'Weekly' ? 'Weekly values are normalized from monthly totals.' : 'Monthly totals shown for the full horizon.'} {groupingMode} view.
              </Typography>
            </Box>
            <Box sx={{display: 'flex', gap: 1, flexWrap: 'wrap'}}>
              <TextField
                select
                size="small"
                value={viewMode}
                onChange={(event) => setViewMode(event.target.value as ViewMode)}
                sx={dropdownFieldSx}
              >
                <MenuItem value="Monthly">Monthly</MenuItem>
                <MenuItem value="Weekly">Weekly</MenuItem>
              </TextField>
              <TextField
                select
                size="small"
                value={groupingMode}
                onChange={(event) => setGroupingMode(event.target.value as GroupingMode)}
                sx={dropdownFieldSx}
              >
                <MenuItem value="By Site">By Site</MenuItem>
                <MenuItem value="By Line">By Line</MenuItem>
                <MenuItem value="By Product Family">By Product Family</MenuItem>
              </TextField>
            </Box>
          </Box>
          <Box sx={{height: 360}}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={derivedDemandCapacityRows} margin={{top: 12, right: 24, left: 0, bottom: 0}}>
                <CartesianGrid strokeDasharray="3 3" stroke={planningTokens.border} vertical={false} />
                <XAxis dataKey="month" tick={{fontSize: 11, fill: planningTokens.textSecondary}} />
                <YAxis yAxisId="left" tick={{fontSize: 11, fill: planningTokens.textSecondary}} tickFormatter={(value) => formatCompactUnits(Number(value))} />
                <YAxis yAxisId="right" orientation="right" tick={{fontSize: 11, fill: planningTokens.textSecondary}} tickFormatter={(value) => `${value}%`} />
                <Tooltip
                  formatter={(value: number, name: string) => {
                    if (name.includes('Utilization')) return `${value.toFixed(1)}%`;
                    return formatUnits(value);
                  }}
                  contentStyle={{borderRadius: 12, border: `1px solid ${planningTokens.border}`, boxShadow: planningTokens.softShadow}}
                />
                <Legend />
                <ReferenceLine yAxisId="right" y={100} stroke="#CBD5E1" strokeDasharray="4 4" />
                <Bar yAxisId="left" dataKey="displayedDemandUnits" name="Demand" fill="#2563EB" radius={[6, 6, 0, 0]} barSize={18} />
                <Bar yAxisId="left" dataKey="displayedAvailableCapacityHours" name="Available Capacity" fill="#6EE7B7" radius={[6, 6, 0, 0]} barSize={18} />
                <Line yAxisId="left" type="monotone" dataKey="displayedRequiredCapacityHours" name="Required Capacity" stroke="#1D4ED8" strokeWidth={2.5} dot={{r: 3}} />
                <Line yAxisId="right" type="monotone" dataKey="utilizationPct" name="Utilization %" stroke="#EF4444" strokeWidth={2} dot={{r: 0}} />
              </ComposedChart>
            </ResponsiveContainer>
          </Box>
        </Paper>        
      </Stack>
    );
  }

  function handleOpenMps(mpsId: string) {
    if (onOpenMpsVersion) {
      setLinkedMpsDrawerOpen(false);
      onOpenMpsVersion(mpsId);
      return;
    }
    // TODO: Wire this handler to the existing MPS detail route when available.
  }

  function handleCreateMpsFromForecast(type: LinkedMpsType) {
    const payload = {
      type,
      status: 'Draft',
      forecastId: forecastHeader.id,
      forecastVersionId: forecastHeader.versionId,
      forecastName: forecastHeader.title,
      period: forecastHeader.periodLabel,
      site: forecastHeader.siteLabel,
      productScope: forecastHeader.productScopeLabel,
      sourceForecastId: forecastHeader.id,
      sourceForecastVersionId: forecastHeader.versionId,
      demandQuantities: monthlyDemandCapacity.map((row) => ({month: row.month, demandUnits: row.demandUnits})),
    };
    void payload;
    // TODO: Replace this placeholder with the existing create MPS service when available.
  }

  function renderMetaItem(label: string, value: string) {
    return (
      <Box>
        <Typography sx={{fontSize: 11, fontWeight: 900, color: planningTokens.textSecondary, textTransform: 'uppercase'}}>
          {label}
        </Typography>
        <Typography sx={{fontSize: 13, fontWeight: 800, color: planningTokens.textPrimary, mt: 0.35}}>
          {value}
        </Typography>
      </Box>
    );
  }

  function renderLinkedMpsCard(mps: LinkedMps) {
    const statusTone = linkedMpsStatusTone(mps.status);
    const typeTone = linkedMpsTypeTone(mps.type);
    return (
      <Paper
        key={mps.id}
        elevation={0}
        component="article"
        role="button"
        tabIndex={0}
        onClick={() => handleOpenMps(mps.id)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleOpenMps(mps.id);
          }
        }}
        sx={{
          ...planningCardSx,
          p: 1.4,
          cursor: 'pointer',
          '&:hover': {
            borderColor: planningTokens.neutralBorder,
            boxShadow: planningTokens.outerShadow,
          },
        }}
      >
        <Box sx={{display: 'flex', justifyContent: 'space-between', gap: 1, alignItems: 'flex-start'}}>
          <Box sx={{minWidth: 0}}>
            <Box sx={{display: 'flex', alignItems: 'center', gap: 0.8, flexWrap: 'wrap'}}>
              <Typography sx={{fontSize: 15, fontWeight: 900, color: planningTokens.textPrimary, fontFamily: 'monospace'}}>
                {mps.id}
              </Typography>
              <Chip size="small" label={mps.type} sx={{height: 22, fontSize: 11, fontWeight: 800, bgcolor: typeTone.bg, color: typeTone.color, border: `1px solid ${typeTone.border}`}} />
            </Box>
            <Typography sx={{fontSize: 13, fontWeight: 800, color: planningTokens.textPrimary, mt: 0.5}}>
              {mps.name}
            </Typography>
          </Box>
          <Chip size="small" label={mps.status} sx={{height: 22, fontSize: 11, fontWeight: 800, bgcolor: statusTone.bg, color: statusTone.color, border: `1px solid ${statusTone.border}`}} />
        </Box>

        <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 1, mt: 1.4}}>
          {renderMetaItem('Period', mps.period)}
          {renderMetaItem('Site', mps.site)}
          {renderMetaItem('Last updated', mps.lastUpdated)}
          {renderMetaItem('Owner', mps.owner)}
        </Box>

        <Box sx={{display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1.4}} onClick={(event) => event.stopPropagation()}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<OpenInNewIcon sx={{fontSize: 16}} />}
            aria-label={`Open ${mps.id}`}
            onClick={() => handleOpenMps(mps.id)}
            sx={{textTransform: 'none', fontWeight: 800, borderRadius: 2}}
          >
            Open
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={<CompareArrowsIcon sx={{fontSize: 16}} />}
            aria-label={`Compare ${mps.id}`}
            disabled
            sx={{textTransform: 'none', fontWeight: 800, borderRadius: 2}}
          >
            Compare
          </Button>
        </Box>
      </Paper>
    );
  }

  function renderLinkedMpsDrawer() {
    return (
      <Drawer
        anchor="right"
        open={linkedMpsDrawerOpen}
        onClose={() => setLinkedMpsDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: {xs: '100%', sm: 500},
            bgcolor: planningTokens.background,
            borderLeft: `1px solid ${planningTokens.border}`,
            boxShadow: 'var(--planning-outer-shadow)',
          },
        }}
      >
        <Box sx={{height: '100%', display: 'flex', flexDirection: 'column'}}>
          <Box sx={{p: 2, bgcolor: planningTokens.surface, borderBottom: `1px solid ${planningTokens.border}`}}>
            <Box sx={{display: 'flex', justifyContent: 'space-between', gap: 1.5, alignItems: 'flex-start'}}>
              <Box>
                <Typography sx={{fontSize: 18, fontWeight: 900, color: planningTokens.textPrimary, lineHeight: 1.25}}>
                  MPS linked to {forecastHeader.title} Forecast
                </Typography>
                <Typography sx={{fontSize: 12.5, color: planningTokens.textSecondary, mt: 0.7, lineHeight: 1.45}}>
                  View and open existing MPS linked to this forecast or create a new one.
                </Typography>
              </Box>
              <IconButton
                aria-label={`Close linked MPS drawer for ${forecastHeader.title} Forecast`}
                onClick={() => setLinkedMpsDrawerOpen(false)}
                size="small"
                sx={{color: planningTokens.textSecondary}}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>

          <Box sx={{p: 1.8, overflowY: 'auto', flex: 1}}>
            <Stack spacing={1.6}>
              <Paper elevation={0} sx={{...planningCardSx, p: 1.4}}>
                <Typography sx={{fontSize: 11, fontWeight: 900, color: planningTokens.textSecondary, textTransform: 'uppercase'}}>
                  Forecast
                </Typography>
                <Box sx={{display: 'flex', alignItems: 'center', gap: 1, mt: 0.8, flexWrap: 'wrap'}}>
                  <Typography sx={{fontSize: 17, fontWeight: 900, color: planningTokens.textPrimary}}>
                    {forecastHeader.title}
                  </Typography>
                  <StatusPill label={forecastHeader.status} tone="Draft" />
                </Box>
                <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 1.2, mt: 1.4}}>
                  {renderMetaItem('Period', forecastHeader.periodLabel)}
                  {renderMetaItem('Site', forecastHeader.siteLabel)}
                  {renderMetaItem('Product Scope', forecastHeader.productScopeLabel)}
                </Box>
              </Paper>

              <Box>
                <Typography sx={{fontSize: 12, fontWeight: 900, color: planningTokens.textPrimary, mb: 1}}>
                  Linked MPS ({linkedMpsForForecast.length})
                </Typography>
                {linkedMpsForForecast.length > 0 ? (
                  <Stack spacing={1.2}>
                    {linkedMpsForForecast.map((mps) => renderLinkedMpsCard(mps))}
                  </Stack>
                ) : (
                  <Paper elevation={0} sx={{...planningCardSx, p: 1.6, textAlign: 'center'}}>
                    <Typography sx={{fontSize: 13, fontWeight: 800, color: planningTokens.textPrimary}}>
                      No MPS linked to this forecast yet.
                    </Typography>
                    <Box sx={{display: 'flex', gap: 1, mt: 1.3, justifyContent: 'center', flexWrap: 'wrap'}}>
                      <Button aria-label="Create Scenario MPS" onClick={() => handleCreateMpsFromForecast('Scenario')} sx={{textTransform: 'none', fontWeight: 800}}>Create Scenario MPS</Button>
                      <Button aria-label="Create Actual Evaluation MPS" onClick={() => handleCreateMpsFromForecast('Actual Evaluation')} sx={{textTransform: 'none', fontWeight: 800}}>Create Actual Evaluation MPS</Button>
                    </Box>
                  </Paper>
                )}
              </Box>

              <Divider />

              <Box>
                <Typography sx={{fontSize: 12, fontWeight: 900, color: planningTokens.textPrimary, mb: 1}}>
                  Create new MPS from this forecast
                </Typography>
                <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', sm: '1fr 1fr'}, gap: 1}}>
                  <Button
                    aria-label="Create Scenario MPS"
                    onClick={() => handleCreateMpsFromForecast('Scenario')}
                    variant="outlined"
                    startIcon={<LinkOutlinedIcon sx={{fontSize: 16}} />}
                    sx={{justifyContent: 'flex-start', textAlign: 'left', textTransform: 'none', fontWeight: 800, borderRadius: 2.5, py: 1.1}}
                  >
                    Create Scenario MPS
                  </Button>
                  <Button
                    aria-label="Create Actual Evaluation MPS"
                    onClick={() => handleCreateMpsFromForecast('Actual Evaluation')}
                    variant="outlined"
                    startIcon={<PersonOutlineIcon sx={{fontSize: 16}} />}
                    sx={{justifyContent: 'flex-start', textAlign: 'left', textTransform: 'none', fontWeight: 800, borderRadius: 2.5, py: 1.1}}
                  >
                    Create Actual Evaluation MPS
                  </Button>
                </Box>
                <Typography sx={{fontSize: 11.5, color: planningTokens.textSecondary, mt: 1.1}}>
                  New MPS will inherit period, site, product scope and available demand quantities from this forecast.
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Box>
      </Drawer>
    );
  }

  function renderSiteCommitmentTab() {
    const skuRows = deriveCommitmentSkuRows(derivedCommitmentRows);
    const skuRowsByMonth = skuRows.reduce<Record<string, CommitmentSkuDerivedRow[]>>((acc, row) => {
      (acc[row.month] ??= []).push(row);
      return acc;
    }, {});

    function toggleMonth(month: string) {
      setExpandedCommitmentMonths((prev) => {
        const next = new Set(prev);
        if (next.has(month)) next.delete(month);
        else next.add(month);
        return next;
      });
    }

    function statusChip(status: 'Covered' | 'At Risk') {
      return (
        <Chip
          size="small"
          label={status}
          sx={{
            height: 24,
            fontWeight: 800,
            bgcolor: status === 'At Risk' ? '#FFF7ED' : '#ECFDF3',
            color: status === 'At Risk' ? planningTokens.warning : planningTokens.success,
            border: `1px solid ${status === 'At Risk' ? '#FED7AA' : '#BBF7D0'}`,
          }}
        />
      );
    }

    const headerCellSx = {...tableCellSx, fontWeight: 900, color: planningTokens.textSecondary};
    const subRowSx = {bgcolor: 'var(--planning-surface-muted)'};
    const subCellSx = {...tableCellSx, color: planningTokens.textSecondary, fontSize: 12};

    return (
      <Stack spacing={2}>
        <DataTable title="Commitment by Month / SKU" description="Demand values remain read-only. Click a month row to expand SKU breakdown. Proposed commitment and rationale stay editable while the proposal is in Draft.">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{...headerCellSx, width: 36, p: 0}} />
                {['Month', 'SKU', 'Forecast Demand', 'Proposed Commitment', 'Gap', 'Coverage %', 'Status', 'Main Gap Reason', 'Required Decision'].map((header) => (
                  <TableCell key={header} sx={headerCellSx}>{header}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {derivedCommitmentRows.map((row) => {
                const isExpanded = expandedCommitmentMonths.has(row.month);
                const monthSkuRows = skuRowsByMonth[row.month] ?? [];
                return (
                  <Fragment key={row.month}>
                    <TableRow
                      hover
                      selected={row.month === selectedCommitmentMonth}
                      onClick={() => { setSelectedCommitmentMonth(row.month); toggleMonth(row.month); }}
                      sx={{cursor: 'pointer'}}
                    >
                      <TableCell sx={{...tableCellSx, width: 36, p: 0, textAlign: 'center'}}>
                        {isExpanded ? <KeyboardArrowDownIcon sx={{fontSize: 18, color: planningTokens.textSecondary, verticalAlign: 'middle'}} /> : <KeyboardArrowRightIcon sx={{fontSize: 18, color: planningTokens.textSecondary, verticalAlign: 'middle'}} />}
                      </TableCell>
                      <TableCell sx={{...tableCellSx, fontWeight: 800}}>{row.month}</TableCell>
                      <TableCell sx={{...tableCellSx, color: planningTokens.textSecondary, fontStyle: 'italic'}}>All SKUs</TableCell>
                      <TableCell sx={tableCellSx}>{formatUnits(row.forecastDemand)}</TableCell>
                      <TableCell sx={{...tableCellSx, fontWeight: 800}}>{formatUnits(row.proposedCommitment)}</TableCell>
                      <TableCell sx={{...tableCellSx, color: row.gap < 0 ? planningTokens.danger : planningTokens.success, fontWeight: 800}}>
                        {formatUnits(row.gap)}
                      </TableCell>
                      <TableCell sx={tableCellSx}>{formatPercent(row.coveragePct)}</TableCell>
                      <TableCell sx={tableCellSx}>{statusChip(row.status)}</TableCell>
                      <TableCell sx={tableCellSx}>{row.mainGapReason}</TableCell>
                      <TableCell sx={tableCellSx}>{row.requiredDecision}</TableCell>
                    </TableRow>
                    {isExpanded && monthSkuRows.map((skuRow) => (
                      <TableRow key={`${row.month}-${skuRow.sku}`} sx={subRowSx}>
                        <TableCell sx={{...subCellSx, width: 36, p: 0}} />
                        <TableCell sx={{...subCellSx, pl: 3}}>{skuRow.month}</TableCell>
                        <TableCell sx={{...subCellSx, fontWeight: 700}}>{skuRow.sku}</TableCell>
                        <TableCell sx={subCellSx}>{formatUnits(skuRow.forecastDemand)}</TableCell>
                        <TableCell sx={{...subCellSx, fontWeight: 700}}>{formatUnits(skuRow.proposedCommitment)}</TableCell>
                        <TableCell sx={{...subCellSx, color: skuRow.gap < 0 ? planningTokens.danger : planningTokens.success, fontWeight: 700}}>
                          {formatUnits(skuRow.gap)}
                        </TableCell>
                        <TableCell sx={subCellSx}>{formatPercent(skuRow.coveragePct)}</TableCell>
                        <TableCell sx={subCellSx}>{statusChip(skuRow.status)}</TableCell>
                        <TableCell sx={subCellSx}>{skuRow.mainGapReason}</TableCell>
                        <TableCell sx={subCellSx}>{skuRow.requiredDecision}</TableCell>
                      </TableRow>
                    ))}
                  </Fragment>
                );
              })}
            </TableBody>
          </Table>
        </DataTable>
      </Stack>
    );
  }

  function renderInventoryTab() {
    const monthsBelow = derivedInventoryRows.filter((row) => row.adjustedClosingInventory < row.minTarget).length;
    const monthsAbove = derivedInventoryRows.filter((row) => row.adjustedClosingInventory > row.maxTarget).length;
    const averageWeeks = derivedInventoryRows.reduce((sum, row) => sum + row.adjustedWeeksCoverage, 0) / derivedInventoryRows.length;
    const openingInventory = derivedInventoryRows[0]?.openingInventory ?? 0;
    return (
      <Stack spacing={2}>
        <Paper elevation={0} sx={{...planningCardSx, p: 1.5}}>
          <Typography sx={{fontSize: 18, fontWeight: 900, color: planningTokens.textPrimary}}>
            Inventory Projection by Month
          </Typography>
          <Typography sx={{fontSize: 13, color: planningTokens.textSecondary, mt: 0.5}}>
            System inventory is read-only. Scenario assumptions can adjust target weeks, build-ahead, and temporary policy settings.
          </Typography>
          <Box sx={{height: 360, mt: 1.25}}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={derivedInventoryRows} margin={{top: 12, right: 24, left: 0, bottom: 0}}>
                <CartesianGrid strokeDasharray="3 3" stroke={planningTokens.border} vertical={false} />
                <XAxis dataKey="month" tick={{fontSize: 11, fill: planningTokens.textSecondary}} />
                <YAxis tick={{fontSize: 11, fill: planningTokens.textSecondary}} tickFormatter={(value) => formatCompactUnits(Number(value))} />
                <Tooltip formatter={(value: number) => formatUnits(value)} contentStyle={{borderRadius: 12, border: `1px solid ${planningTokens.border}`}} />
                <Legend />
                <Bar dataKey="openingInventory" name="Opening Inventory" fill="#BFDBFE" radius={[6, 6, 0, 0]} barSize={18} />
                <Line type="monotone" dataKey="adjustedClosingInventory" name="Projected Closing Inventory" stroke="#2563EB" strokeWidth={2.6} dot={{r: 3}} />
                <Line type="monotone" dataKey="minTarget" name="Minimum Stock Threshold" stroke="#EF4444" strokeDasharray="6 4" dot={false} />
                <Line type="monotone" dataKey="maxTarget" name="Maximum Stock Threshold" stroke="#10B981" strokeDasharray="6 4" dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </Box>
        </Paper>

        <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(5, minmax(0, 1fr))'}, gap: 1.5}}>
          <MetricCard label="Opening Inventory" value={formatUnits(openingInventory)} helper="Read-only source snapshot" />
          <MetricCard label="Average Weeks Coverage" value={formatWeeks(averageWeeks)} helper="Calculated from current scenario" tone="blue" />
          <MetricCard label="Months Below Minimum" value={String(monthsBelow)} helper="Inventory floor breaches" tone={monthsBelow > 0 ? 'warning' : 'success'} />
          <MetricCard label="Months Above Maximum" value={String(monthsAbove)} helper="Inventory ceiling breaches" tone={monthsAbove > 0 ? 'warning' : 'success'} />
          <MetricCard label="Stockout / Backorder Risk" value={monthsBelow > 0 ? 'Active' : 'Low'} helper={monthsBelow > 0 ? 'Risk concentrated in Mar-Apr 2027' : 'No stockout risk'} tone={monthsBelow > 0 ? 'danger' : 'success'} />
        </Box>

        <DataTable title="Inventory by Product Family" description="Recommended actions stay planner-owned. Source inventory snapshots remain read-only.">
          <Table size="small">
            <TableHead>
              <TableRow>
                {['Product Family', 'Opening Inventory', 'Projected Ending Inventory', 'Min Target', 'Max Target', 'Weeks Coverage', 'Risk', 'Recommended Action'].map((header) => (
                  <TableCell key={header} sx={{...tableCellSx, fontWeight: 900, color: planningTokens.textSecondary}}>{header}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {inventoryFamilyRows.map((row) => (
                <TableRow key={row.family}>
                  <TableCell sx={tableCellSx}>{row.family}</TableCell>
                  <TableCell sx={tableCellSx}>{formatUnits(row.openingInventory)}</TableCell>
                  <TableCell sx={tableCellSx}>{formatUnits(row.projectedEndingInventory)}</TableCell>
                  <TableCell sx={tableCellSx}>{formatUnits(row.minTarget)}</TableCell>
                  <TableCell sx={tableCellSx}>{formatUnits(row.maxTarget)}</TableCell>
                  <TableCell sx={tableCellSx}>{formatWeeks(row.weeksCoverage)}</TableCell>
                  <TableCell sx={tableCellSx}><RiskChip value={row.risk} /></TableCell>
                  <TableCell sx={tableCellSx}>{row.recommendedAction}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DataTable>
      </Stack>
    );
  }

  function renderConstraintAnalysisTab() {
    return (
      <Stack spacing={2}>
        <DataTable title="Constraint Summary">
          <Table size="small">
            <TableHead>
              <TableRow>
                {['Domain', 'Constraint', 'Impacted Period', 'Impacted Volume', 'Risk', 'Owner', 'Due Date', 'Action Status'].map((header) => (
                  <TableCell key={header} sx={{...tableCellSx, fontWeight: 900, color: planningTokens.textSecondary}}>{header}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {constraints.map((item) => (
                <TableRow key={item.id}>
                  <TableCell sx={tableCellSx}>{item.domain}</TableCell>
                  <TableCell sx={tableCellSx}>{item.constraint}</TableCell>
                  <TableCell sx={tableCellSx}>{item.impactedPeriod}</TableCell>
                  <TableCell sx={tableCellSx}>{formatUnits(item.impactedVolume)}</TableCell>
                  <TableCell sx={tableCellSx}><RiskChip value={item.risk} /></TableCell>
                  <TableCell sx={tableCellSx}>{item.owner}</TableCell>
                  <TableCell sx={tableCellSx}>{item.dueDate}</TableCell>
                  <TableCell sx={tableCellSx}>{item.actionStatus}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DataTable>
        {selectedConstraintGroups.map((group) => (
          <Paper key={group.title} elevation={0} sx={{...planningCardSx, p: 1.5}}>
            <Box sx={{display: 'flex', alignItems: 'center', gap: 1, mb: 1.25}}>
              <Box
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: 2.5,
                  bgcolor: 'var(--planning-neutral-bg)',
                  color: planningTokens.primaryBlue,
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                {group.icon}
              </Box>
              <Typography sx={{fontSize: 18, fontWeight: 900, color: planningTokens.textPrimary}}>
                {group.title}
              </Typography>
            </Box>
            <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', xl: 'repeat(2, minmax(0, 1fr))'}, gap: 1.5}}>
              {group.items.map((item) => (
                <Paper key={item.id} elevation={0} sx={{...planningSurfaceSx, p: 1.25}}>
                  <Box sx={{display: 'flex', justifyContent: 'space-between', gap: 1, alignItems: 'flex-start'}}>
                    <Box>
                      <Typography sx={{fontSize: 15, fontWeight: 900, color: planningTokens.textPrimary}}>
                        {item.constraint}
                      </Typography>
                      <Typography sx={{fontSize: 12.5, color: planningTokens.textSecondary, mt: 0.5}}>
                        Impacted period: {item.impactedPeriod} · Impacted volume: {formatUnits(item.impactedVolume)} units
                      </Typography>
                    </Box>
                    <RiskChip value={item.risk} />
                  </Box>
                  <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', md: 'repeat(2, minmax(0, 1fr))'}, gap: 1, mt: 1.2}}>
                    {Object.entries(item.details).map(([key, value]) => (
                      <Box key={key}>
                        <Typography sx={{fontSize: 11, fontWeight: 900, color: planningTokens.textSecondary, textTransform: 'uppercase'}}>
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </Typography>
                        <Typography sx={{fontSize: 13, color: planningTokens.textPrimary, mt: 0.35}}>
                          {String(value)}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Paper>
              ))}
            </Box>
          </Paper>
        ))}        
      </Stack>
    );
  }

  function renderScenariosTab() {
    return (
      <Stack spacing={2}>
        <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', md: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(5, minmax(0, 1fr))'}, gap: 1.5}}>
          {scenarioState.map((scenario) => {
            const metrics = deriveScenarioMetrics(
              deriveCommitmentRows(commitmentRows, scenario.assumptions, scenario.id),
              deriveDemandCapacityRows(monthlyDemandCapacity, scenario.assumptions, 'Monthly'),
              deriveInventoryRows(inventoryProjection, scenario.assumptions, scenario.id),
              scenario.id,
            );
            const active = scenario.id === selectedScenarioId;
            return (
              <Paper
                key={scenario.id}
                elevation={0}
                onClick={() => setSelectedScenarioId(scenario.id)}
                sx={{
                  ...planningCardSx,
                  p: 1.35,
                  cursor: 'pointer',
                  borderColor: active ? '#BFDBFE' : planningTokens.border,
                  boxShadow: active ? '0 18px 36px rgba(23, 105, 255, 0.14)' : planningTokens.shadow,
                }}
              >
                <Typography sx={{fontSize: 16, fontWeight: 900, color: planningTokens.textPrimary}}>
                  {scenario.name}
                </Typography>
                <Typography sx={{fontSize: 12.5, color: planningTokens.textSecondary, mt: 0.55, minHeight: 36}}>
                  {scenario.description}
                </Typography>
                <Chip
                  size="small"
                  label={statusLabelFromScenario(scenario, metrics)}
                  sx={{
                    mt: 1.2,
                    height: 24,
                    fontWeight: 800,
                    bgcolor: active ? '#EFF6FF' : '#F8FAFC',
                    color: active ? planningTokens.primaryBlue : planningTokens.textSecondary,
                    border: `1px solid ${active ? '#BFDBFE' : '#CBD5E1'}`,
                  }}
                />
              </Paper>
            );
          })}
        </Box>

        <DataTable title="Scenario KPI Comparison" description="Scenario assumptions update the comparison table live without touching source data.">
          <Table size="small">
            <TableHead>
              <TableRow>
                {['KPI', 'Baseline', 'Capacity Recovery', 'Demand Smoothing', 'Constrained Commitment', 'Quality Delay'].map((header) => (
                  <TableCell key={header} sx={{...tableCellSx, fontWeight: 900, color: planningTokens.textSecondary}}>{header}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {comparisonRows.map((row) => (
                <TableRow key={row.label}>
                  <TableCell sx={{...tableCellSx, fontWeight: 800}}>{row.label}</TableCell>
                  <TableCell sx={tableCellSx}>{row.baseline}</TableCell>
                  <TableCell sx={tableCellSx}>{row.capacityRecovery}</TableCell>
                  <TableCell sx={tableCellSx}>{row.demandSmoothing}</TableCell>
                  <TableCell sx={tableCellSx}>{row.constrainedCommitment}</TableCell>
                  <TableCell sx={tableCellSx}>{row.qualityDelay}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DataTable>

        <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', xl: '1.2fr 1fr'}, gap: 2}}>
          <Paper elevation={0} sx={{...planningCardSx, p: 1.5}}>
            <Typography sx={{fontSize: 18, fontWeight: 900, color: planningTokens.textPrimary}}>
              Scenario Detail
            </Typography>
            <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', md: 'repeat(2, minmax(0, 1fr))'}, gap: 1.2, mt: 1.5}}>
              <InsightCard title="Overview" subtitle={selectedScenario.overview} />
              <InsightCard title="Main Driver" subtitle={selectedScenario.mainDriver} />
              <InsightCard title="Trade-Off" subtitle={selectedScenario.tradeOff} />
              <InsightCard title="Key Assumption" subtitle={selectedScenario.keyAssumption} />
              <InsightCard title="Risk" subtitle={selectedScenario.risk} tone="warning" />
              <InsightCard title="Expected Impact" subtitle={selectedScenario.expectedImpact} />
              <InsightCard title="Required Decision" subtitle={selectedScenario.requiredDecision} />
            </Box>
          </Paper>

          <Paper elevation={0} sx={{...planningCardSx, p: 1.5}}>
            <Box sx={{display: 'flex', justifyContent: 'space-between', gap: 1, alignItems: 'center'}}>
              <Typography sx={{fontSize: 18, fontWeight: 900, color: planningTokens.textPrimary}}>
                Scenario Assumptions
              </Typography>
              <ActionButton label="Reset" variant="ghost" startIcon={<RestartAltIcon />} onClick={resetScenarioAssumptions} />
            </Box>
            <Typography sx={{fontSize: 13, color: planningTokens.textSecondary, mt: 0.5}}>
              Edits affect only the selected scenario and its calculated planning outputs.
            </Typography>
            <Stack spacing={1.2} sx={{mt: 1.5}}>
              <TextField label="Overtime Hours" type="number" value={selectedAssumptions.overtimeHours} onChange={(event) => updateScenarioAssumption('overtimeHours', Number(event.target.value))} />
              <TextField label="Additional Shifts" type="number" value={selectedAssumptions.additionalShifts} onChange={(event) => updateScenarioAssumption('additionalShifts', Number(event.target.value))} />
              <TextField label="Demand Pull / Push %" type="number" value={selectedAssumptions.demandShiftPct} onChange={(event) => updateScenarioAssumption('demandShiftPct', Number(event.target.value))} />
              <TextField label="Capacity Recovery Factor" type="number" value={selectedAssumptions.capacityRecoveryFactor} onChange={(event) => updateScenarioAssumption('capacityRecoveryFactor', Number(event.target.value))} />
              <TextField label="Sterilization Capacity Factor" type="number" value={selectedAssumptions.sterilizationCapacityFactor} onChange={(event) => updateScenarioAssumption('sterilizationCapacityFactor', Number(event.target.value))} />
            </Stack>
          </Paper>
        </Box>
      </Stack>
    );
  }

  function renderApprovalTab() {
    return (
      <Stack spacing={2}>
        <Paper elevation={0} sx={{...planningCardSx, p: 1.5}}>
          <Typography sx={{fontSize: 18, fontWeight: 900, color: planningTokens.textPrimary}}>
            Approval Summary
          </Typography>
          <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', md: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(4, minmax(0, 1fr))'}, gap: 1.25, mt: 1.5}}>
            <InsightCard title="Selected Scenario" value={selectedScenario.name} />
            <InsightCard title="Forecast Version" value={forecastHeader.title} />
            <InsightCard title="Submitted By" value="Maya Planner" />
            <InsightCard title="Submitted Date" value={forecastHeader.lastRefreshLabel} />
            <InsightCard title="Approval Status" value={approvalStatus} tone={approvalStatus === 'Approved' ? 'success' : approvalStatus === 'Rejected' ? 'danger' : 'blue'} />
            <InsightCard title="Final Commitment Coverage" value={formatPercent(scenarioMetrics.demandCoveragePct)} />
            <InsightCard title="Main Risks" subtitle={scenarioMetrics.riskMonths.join(', ') || 'No critical risk months'} />
            <InsightCard title="Required Approver" value="Supply Chain Director" />
          </Box>
        </Paper>

        <Paper elevation={0} sx={{...planningCardSx, p: 1.5}}>
          <Typography sx={{fontSize: 18, fontWeight: 900, color: planningTokens.textPrimary}}>
            Decision
          </Typography>
          <Typography sx={{fontSize: 13, color: planningTokens.textSecondary, mt: 0.5}}>
            Use the existing approval states to move the forecast from draft to committed baseline.
          </Typography>
          <Box sx={{display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1.5}}>
            <ActionButton label="Submit for Approval" variant="secondary" onClick={() => handleApprovalAction('Submitted', 'Plan submitted')} />
            <ActionButton label="Approve" variant="primary" onClick={() => handleApprovalAction('Approved', 'Plan approved')} />
            <ActionButton label="Reject" variant="ghost" onClick={() => handleApprovalAction('Rejected', 'Plan rejected')} />
            <ActionButton label="Return for Revision" variant="ghost" onClick={() => handleApprovalAction('Returned for Revision', 'Plan returned')} />
          </Box>
          <TextField
            label="Decision Comment"
            placeholder="Add approval or revision comment"
            fullWidth
            multiline
            minRows={3}
            value={decisionComment}
            onChange={(event) => setDecisionComment(event.target.value)}
            sx={{mt: 1.5}}
          />
        </Paper>

        <DataTable title="Audit Trail" description="Planner-owned edits, scenario changes, approvals, and commitment actions are logged here.">
          <Table size="small">
            <TableHead>
              <TableRow>
                {['Timestamp', 'User', 'Action', 'Object', 'Previous Value', 'New Value', 'Reason / Comment'].map((header) => (
                  <TableCell key={header} sx={{...tableCellSx, fontWeight: 900, color: planningTokens.textSecondary}}>{header}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {auditEvents.map((event, index) => (
                <TableRow key={`${event.timestamp}-${event.action}-${index}`}>
                  <TableCell sx={tableCellSx}>{event.timestamp}</TableCell>
                  <TableCell sx={tableCellSx}>{event.user}</TableCell>
                  <TableCell sx={tableCellSx}>{event.action}</TableCell>
                  <TableCell sx={tableCellSx}>{event.object}</TableCell>
                  <TableCell sx={tableCellSx}>{event.previousValue}</TableCell>
                  <TableCell sx={tableCellSx}>{event.newValue}</TableCell>
                  <TableCell sx={tableCellSx}>{event.reasonComment}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DataTable>
      </Stack>
    );
  }

  return (
    <Box sx={{display: 'flex', flexDirection: 'column', gap: 2.1, px: mode === 'overview' ? 0 : 0.25}}>
      <Paper elevation={0} sx={{...planningCardSx, p: {xs: 1.5, md: 2}}}>
        <Box sx={{display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap', alignItems: 'flex-start'}}>
          <Box>
            <SectionHeader title={forecastHeader.title} eyebrow='' />
            <Box sx={{display: 'flex', alignItems: 'center', gap: 1, mt: 1}}>
              <StatusPill label={forecastHeader.status} tone="Draft" />
            </Box>
            <Box sx={{display: 'flex', gap: 1.5, flexWrap: 'wrap', mt: 1.4}}>
              <Typography sx={{fontSize: 13, color: planningTokens.textSecondary}}><strong>Horizon:</strong> {forecastHeader.horizonMonths} months</Typography>
              <Typography sx={{fontSize: 13, color: planningTokens.textSecondary}}><strong>Period:</strong> {forecastHeader.periodLabel}</Typography>
              <Typography sx={{fontSize: 13, color: planningTokens.textSecondary}}><strong>Site:</strong> {forecastHeader.siteLabel}</Typography>
              <Typography sx={{fontSize: 13, color: planningTokens.textSecondary}}><strong>Product Scope:</strong> {forecastHeader.productScopeLabel}</Typography>
              <Typography sx={{fontSize: 13, color: planningTokens.textSecondary}}><strong>Last refresh:</strong> {forecastHeader.lastRefreshLabel}</Typography>
            </Box>
          </Box>

          <Box sx={{display: 'flex', gap: 1, flexWrap: 'wrap'}}>
            <Button
              aria-label={`Open linked MPS for ${forecastHeader.title} Forecast`}
              onClick={() => setLinkedMpsDrawerOpen(true)}
              endIcon={<EastIcon sx={{fontSize: 17}} />}
              sx={{
                height: 40,
                px: 2,
                borderRadius: 3,
                fontWeight: 800,
                textTransform: 'none',
                bgcolor: planningTokens.surface,
                color: planningTokens.primaryBlue,
                border: `1px solid ${planningTokens.neutralBorder}`,
                '&:hover': {bgcolor: planningTokens.neutralBg},
              }}
            >
              Linked MPS ({linkedMpsForForecast.length})
            </Button>
            <ActionButton label="Submit for Approval" variant="secondary" startIcon={<CheckCircleOutlineIcon />} onClick={() => setActiveTab(5)} />
            <ActionButton label="AI Assistant" variant="primary" startIcon={<AutoAwesomeIcon />} onClick={() => setAssistantOpen(true)} />
          </Box>
        </Box>
      </Paper>

      <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(6, minmax(0, 1fr))'}, gap: 1.5}}>
        {headerKpis.map((kpi) => (
          <MetricCard
            key={kpi.id}
            label={kpi.label}
            value={kpi.value}
            helper={kpi.helper}
            tone={kpi.id === 'risk' ? 'warning' : kpi.id === 'confidence' ? 'success' : 'default'}
          />
        ))}
      </Box>
      
      <Paper elevation={0} sx={{...planningCardSx, overflow: 'hidden'}}>
        <Tabs
          value={activeTab}
          onChange={(_, value) => setActiveTab(value as PlanningTab)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            px: 1,
            '& .MuiTab-root': {
              minHeight: 54,
              textTransform: 'none',
              fontWeight: 800,
              color: planningTokens.textSecondary,
            },
            '& .Mui-selected': {
              color: planningTokens.primaryBlue,
            },
            '& .MuiTabs-indicator': {
              backgroundColor: planningTokens.primaryBlue,
              height: 3,
              borderRadius: 999,
            },
          }}
        >
          {tabLabels.map((label) => <Tab key={label} label={label} />)}
        </Tabs>
      </Paper>

      {activeTab === 0 ? <DemandMatrixTab /> : null}
      {activeTab === 1 ? <ResourceDistributionTab /> : null}
      {activeTab === 2 ? renderInventoryTab() : null}
      {activeTab === 3 ? renderConstraintAnalysisTab() : null}
      {activeTab === 4 ? renderScenariosTab() : null}      
      {activeTab === 5 ? renderSiteCommitmentTab() : null}
      {activeTab === 6 ? renderApprovalTab() : null}

      <AiForecastAssistantPanel
        open={assistantOpen}
        proposal={aiProposal}
        status="ready"
        onClose={() => setAssistantOpen(false)}
        onProposalChange={(updated) => setAiProposal(updated)}
        onAuditEvent={(event: LongTermAiAuditEvent) => {
          addAuditEvent('AI Proposal', event.eventType, event.previousValue ?? '', event.newValue ?? '', event.comment ?? '');
        }}
      />
      {renderLinkedMpsDrawer()}
    </Box>
  );
}
