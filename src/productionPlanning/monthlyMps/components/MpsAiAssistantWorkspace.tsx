import {
  AutoAwesome as AutoAwesomeIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
  WarningAmber as WarningAmberIcon,
  Error as ErrorIcon,
  TrendingUp as TrendingUpIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  Bolt as BoltIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  Science as ScienceIcon,
} from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Paper,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import {type ReactNode, useRef, useState} from 'react';
import MpsDemandSummary from './MpsDemandSummary';
import type {MpsDemandLine} from '../types';
import {MpsBucketStatusBadge} from './Badges';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
  Cell,
} from 'recharts';

type Props = {
  open: boolean;
  onClose: () => void;
  onComplete?: () => void;
};

type ProgressStep = {label: string};

type OptionConfig = {
  label: string;
  userText: string;
  action: (state: WorkspaceState) => WorkspaceState;
  nextStepIndex?: number;
  detailMessage?: string;
};

type AssistantStage = {
  title: string;
  body: string[];
  options: OptionConfig[];
};

type ChatMessage = {
  id: string;
  role: 'assistant' | 'user';
  title?: string;
  body: string;
  options?: OptionConfig[];
};

type ScenarioRow = {
  scenario: string;
  feasibility: string;
  feasibilityColor: string;
  coverage: string;
  utilization: string;
  inventory: string;
  atRisk: string;
  tradeoff: string;
};

type ActionItem = {
  label: string;
  owner: string;
  due: string;
  status: 'Open' | 'Ready' | 'Pending';
};

type WorkspaceState = {
  currentStepIndex: number;
  stepOneCompletedWithWarnings: boolean;
  selectedScenario: string | null;
  mpsStatus: string;
  kpis: {
    forecastDemand: string;
    proposedCommitment: string;
    inventoryCoverage: string;
    capacityUtilization: string;
    atRiskVolume: string;
    criticalRisks: string;
  };
  actions: ActionItem[];
  recentDecisions: {label: string; by: string; time: string}[];
  approvalComment: string;
  recommendationTitle: string;
  recommendationBody: string;
  recommendationReasons: string[];
  remainingRisks: string[];
  scenarioRows: ScenarioRow[];
  submitted: boolean;
};

const PROGRESS_STEPS: ProgressStep[] = [
  {label: 'Demand\nValidation'},
  {label: 'Inventory\nProjection'},
  {label: 'Capacity\nCheck'},
  {label: 'Materials\nFeasibility'},
  {label: 'Downstream\nConstraints'},
  {label: 'Scenarios'},
  {label: 'Compare\nScenarios'},
  {label: 'Site\nCommitment'},
  {label: 'Approval\nPackage'},
  {label: 'Submit &\nHandoff'},
];

const BASE_SCENARIOS: ScenarioRow[] = [
  {
    scenario: '1. Baseline',
    feasibility: 'Not Feasible',
    feasibilityColor: '#B42318',
    coverage: '91%',
    utilization: '108%',
    inventory: '2.1 weeks',
    atRisk: '112,450 units',
    tradeoff: 'High capacity gap, stockout risk',
  },
  {
    scenario: '2. Capacity Recovery',
    feasibility: 'Feasible with risk',
    feasibilityColor: '#B54708',
    coverage: '98%',
    utilization: '94%',
    inventory: '3.2 weeks',
    atRisk: '27,020 units',
    tradeoff: 'Requires overtime, mat. confirmation',
  },
  {
    scenario: '3. Demand Smoothing',
    feasibility: 'Feasible',
    feasibilityColor: '#027A48',
    coverage: '96%',
    utilization: '91%',
    inventory: '4.0 weeks',
    atRisk: '41,300 units',
    tradeoff: 'Pull production earlier',
  },
  {
    scenario: '4. Constrained Commitment',
    feasibility: 'Feasible',
    feasibilityColor: '#027A48',
    coverage: '93%',
    utilization: '87%',
    inventory: '3.5 weeks',
    atRisk: '83,200 units',
    tradeoff: 'Lower commitment',
  },
];

const AI_DEMAND_LINES: MpsDemandLine[] = [
  {id: 'd1', planId: 'mps-ai', productCode: 'FG-1001', productDescription: 'Standard Tube A', productFamily: 'Tubes', uom: 'UN', approvedMonthlyDemand: 320000, alreadyPlannedQuantity: 312000, remainingQuantityToPlan: 8000, demandSource: 'GlobalForecast', priority: 'High', riskLevel: 'Low', status: 'PartiallyPlanned'},
  {id: 'd2', planId: 'mps-ai', productCode: 'FG-2001', productDescription: 'Additive Tube', productFamily: 'Tubes', uom: 'UN', approvedMonthlyDemand: 165000, alreadyPlannedQuantity: 165000, remainingQuantityToPlan: 0, demandSource: 'FirmOrder', priority: 'Critical', riskLevel: 'High', status: 'FullyPlanned'},
  {id: 'd3', planId: 'mps-ai', productCode: 'FG-3001', productDescription: 'Gel Product', productFamily: 'Gels', uom: 'UN', approvedMonthlyDemand: 280000, alreadyPlannedQuantity: 220000, remainingQuantityToPlan: 60000, demandSource: 'GlobalForecast', priority: 'High', riskLevel: 'Medium', status: 'PartiallyPlanned'},
  {id: 'd4', planId: 'mps-ai', productCode: 'FG-4001', productDescription: 'Specialty Pack', productFamily: 'Specialty', uom: 'UN', approvedMonthlyDemand: 480320, alreadyPlannedQuantity: 480320, remainingQuantityToPlan: 0, demandSource: 'GlobalForecast', priority: 'Medium', riskLevel: 'Low', status: 'FullyPlanned'},
];

type MiniGridRow = {
  productCode: string;
  description: string;
  family: string;
  bucket: string;
  plannedQty: number;
  lineName: string;
  reqHrs: number;
  availHrs: number;
  utilPct: number;
  openStock: number;
  demand: number;
  endStock: number;
  minStock: number;
  maxStock: number;
  covDays: number;
  status: 'Feasible' | 'AtRisk' | 'Overloaded' | 'StockRisk';
  reason?: string;
  comment?: string;
};

const AI_MINI_GRID_ROWS: MiniGridRow[] = [
  {productCode: 'FG-1001', description: 'Standard Tube A', family: 'Tubes', bucket: 'Week 1', plannedQty: 78000, lineName: 'Line 03', reqHrs: 390, availHrs: 440, utilPct: 88, openStock: 52000, demand: 88000, endStock: 42000, minStock: 20000, maxStock: 80000, covDays: 24, status: 'Feasible'},
  {productCode: 'FG-1001', description: 'Standard Tube A', family: 'Tubes', bucket: 'Week 2', plannedQty: 80000, lineName: 'Line 03', reqHrs: 400, availHrs: 440, utilPct: 91, openStock: 42000, demand: 84000, endStock: 38000, minStock: 20000, maxStock: 80000, covDays: 22, status: 'Feasible'},
  {productCode: 'FG-1001', description: 'Standard Tube A', family: 'Tubes', bucket: 'Week 3', plannedQty: 85000, lineName: 'Line 03', reqHrs: 425, availHrs: 440, utilPct: 96, openStock: 38000, demand: 101000, endStock: 22000, minStock: 20000, maxStock: 80000, covDays: 11, status: 'AtRisk', reason: 'Demand spike'},
  {productCode: 'FG-2001', description: 'Additive Tube', family: 'Tubes', bucket: 'Week 1', plannedQty: 40000, lineName: 'Line 10', reqHrs: 480, availHrs: 440, utilPct: 108, openStock: 12000, demand: 42500, endStock: 9500, minStock: 10000, maxStock: 40000, covDays: 11, status: 'Overloaded', reason: 'Capacity gap -40hrs'},
  {productCode: 'FG-2001', description: 'Additive Tube', family: 'Tubes', bucket: 'Week 2', plannedQty: 42000, lineName: 'Line 10', reqHrs: 415, availHrs: 440, utilPct: 94, openStock: 9500, demand: 37500, endStock: 14000, minStock: 10000, maxStock: 40000, covDays: 19, status: 'Feasible'},
  {productCode: 'FG-3001', description: 'Gel Product', family: 'Gels', bucket: 'Week 1', plannedQty: 55000, lineName: 'Line 07', reqHrs: 360, availHrs: 440, utilPct: 82, openStock: 8200, demand: 57000, endStock: 6200, minStock: 8000, maxStock: 35000, covDays: 7, status: 'StockRisk', reason: 'Below min stock'},
  {productCode: 'FG-3001', description: 'Gel Product', family: 'Gels', bucket: 'Week 2', plannedQty: 60000, lineName: 'Line 07', reqHrs: 392, availHrs: 440, utilPct: 89, openStock: 6200, demand: 48200, endStock: 18000, minStock: 8000, maxStock: 35000, covDays: 19, status: 'Feasible'},
  {productCode: 'FG-4001', description: 'Specialty Pack', family: 'Specialty', bucket: 'Week 1', plannedQty: 120080, lineName: 'Line 03', reqHrs: 383, availHrs: 440, utilPct: 87, openStock: 41000, demand: 129880, endStock: 31200, minStock: 25000, maxStock: 90000, covDays: 17, status: 'Feasible'},
];

const INITIAL_STATE: WorkspaceState = {
  currentStepIndex: -1,
  stepOneCompletedWithWarnings: false,
  selectedScenario: null,
  mpsStatus: 'In Progress',
  kpis: {
    forecastDemand: '1,245,320',
    proposedCommitment: 'Pending',
    inventoryCoverage: '3.2 weeks',
    capacityUtilization: '94%',
    atRiskVolume: '27,020',
    criticalRisks: '3',
  },
  actions: [
    {label: 'Confirm expedite for RM-301656', owner: 'Material Controller', due: 'Today', status: 'Open'},
    {label: 'Approve overtime for Line 10', owner: 'Production Manager', due: 'Tomorrow', status: 'Pending'},
    {label: 'Reserve sterilization slots for Family C', owner: 'Sterilization Lead', due: '2 days', status: 'Open'},
    {label: 'Validate quality release for 2 batches', owner: 'Quality Manager', due: '2 days', status: 'Pending'},
  ],
  recentDecisions: [],
  approvalComment: '',
  recommendationTitle: 'Capacity Recovery',
  recommendationBody: 'Start the review to see step-by-step MPS recommendations.',
  recommendationReasons: [
    'Raises commitment coverage to 98%',
    'Removes March stockout risk',
    'Keeps inventory within target',
    'Requires overtime but avoids constrained commitment',
  ],
  remainingRisks: [
    'RM-301656 delivery confirmation required',
    'Line 10 overtime must be approved',
    'Sterilization slots need confirmation',
  ],
  scenarioRows: BASE_SCENARIOS,
  submitted: false,
};

const DEMAND_CAPACITY_DATA = [
  {month: 'May', demand: 98, capacity: 105},
  {month: 'Jun', demand: 95, capacity: 100},
  {month: 'Jul', demand: 85, capacity: 88},
  {month: 'Aug', demand: 90, capacity: 95},
  {month: 'Sep', demand: 105, capacity: 108},
  {month: 'Oct', demand: 110, capacity: 112},
  {month: 'Nov', demand: 115, capacity: 118},
  {month: 'Dec', demand: 120, capacity: 120},
  {month: 'Jan', demand: 128, capacity: 125},
  {month: 'Feb', demand: 135, capacity: 125},
  {month: 'Mar', demand: 165, capacity: 140},
  {month: 'Apr', demand: 155, capacity: 148},
];

const INVENTORY_DATA = [
  {month: 'May', coverage: 4.5},
  {month: 'Jun', coverage: 4.8},
  {month: 'Jul', coverage: 4.2},
  {month: 'Aug', coverage: 3.8},
  {month: 'Sep', coverage: 4.0},
  {month: 'Oct', coverage: 4.2},
  {month: 'Nov', coverage: 4.8},
  {month: 'Dec', coverage: 5.2},
  {month: 'Jan', coverage: 5.8},
  {month: 'Feb', coverage: 5.2},
  {month: 'Mar', coverage: 2.8},
  {month: 'Apr', coverage: 3.2},
];

const CAPACITY_GAP_DATA = [
  {line: 'Line 10', gap: -24800},
  {line: 'Line 07', gap: -12400},
  {line: 'Line 03', gap: -6200},
];

const PLANNING_MONTHS = ['May-25', 'Jun-25', 'Jul-25', 'Aug-25', 'Sep-25', 'Oct-25', 'Nov-25', 'Dec-25', 'Jan-26', 'Feb-26', 'Mar-26', 'Apr-26'];

type PlanningRow = {
  metric: string;
  values: (number | string)[];
  format: 'number' | 'percent' | 'decimal' | 'text';
  highlight?: (v: number) => 'error' | 'warning' | 'normal';
};

const PLANNING_TABLE_ROWS: PlanningRow[] = [
  {
    metric: 'Forecast Demand (units)',
    values: [98000, 95000, 85000, 90000, 105000, 110000, 115000, 120000, 128000, 132000, 165000, 155000],
    format: 'number',
  },
  {
    metric: 'Proposed Commitment (units)',
    values: [98000, 95000, 85000, 90000, 105000, 110000, 112000, 118000, 125000, 125000, 140000, 148000],
    format: 'number',
  },
  {
    metric: 'Commitment Coverage (%)',
    values: [100, 100, 100, 100, 100, 100, 97, 98, 98, 95, 85, 95],
    format: 'percent',
    highlight: (v) => v < 90 ? 'error' : v < 97 ? 'warning' : 'normal',
  },
  {
    metric: 'Available Capacity (hrs)',
    values: [10500, 10000, 8800, 9500, 10800, 11200, 11800, 12000, 12500, 12500, 14000, 14800],
    format: 'number',
  },
  {
    metric: 'Capacity Utilization (%)',
    values: [88, 85, 82, 86, 89, 91, 92, 94, 96, 98, 108, 96],
    format: 'percent',
    highlight: (v) => v > 100 ? 'error' : v > 95 ? 'warning' : 'normal',
  },
  {
    metric: 'Inventory Opening (weeks)',
    values: [4.5, 4.8, 5.1, 4.2, 3.8, 4.0, 4.2, 4.8, 5.2, 5.8, 5.2, 2.8],
    format: 'decimal',
  },
  {
    metric: 'Inventory Closing (weeks)',
    values: [4.8, 5.1, 4.2, 3.8, 4.0, 4.2, 4.8, 5.2, 5.8, 5.2, 2.8, 3.2],
    format: 'decimal',
    highlight: (v) => v < 3.0 ? 'error' : v < 3.5 ? 'warning' : 'normal',
  },
  {
    metric: 'At-Risk Volume (units)',
    values: [0, 0, 0, 0, 0, 0, 3000, 2000, 3000, 7000, 25000, 7000],
    format: 'number',
    highlight: (v) => v > 10000 ? 'error' : v > 0 ? 'warning' : 'normal',
  },
];

function formatPlanningValue(value: number | string, format: string): string {
  if (typeof value !== 'number') return String(value);
  if (format === 'number') return value === 0 ? '—' : value.toLocaleString();
  if (format === 'percent') return `${value}%`;
  if (format === 'decimal') return `${value.toFixed(1)}`;
  return String(value);
}

function appendUniqueAction(actions: ActionItem[], next: ActionItem) {
  return actions.some((a) => a.label === next.label) ? actions : [...actions, next];
}

function buildAssistantStages(): AssistantStage[] {
  return [
    {
      title: 'Step 1 of 10 — Demand Validation',
      body: [
        'I analyzed the demand for May-2026 Reforecast.',
        'Findings:',
        '✓ Demand is complete for 98% of product-family/month combinations.',
        '⚠ March demand increased 18% vs prior forecast.',
        '⚠ 2 product families have missing demand in May.',
        '⚠ 1 SKU has demand but no assigned production line.',
        'How would you like to proceed?',
      ],
      options: [
        {
          label: 'Resolve issues',
          userText: 'Resolve issues.',
          nextStepIndex: 1,
          action: (state) => ({
            ...state,
            currentStepIndex: 1,
            recentDecisions: [...state.recentDecisions, {label: 'Resolved demand gaps before continuing.', by: 'By You', time: '09:41'}],
            kpis: {...state.kpis, criticalRisks: '2'},
          }),
        },
        {
          label: 'Continue with warnings',
          userText: 'Continue with warnings.',
          nextStepIndex: 1,
          action: (state) => ({
            ...state,
            currentStepIndex: 1,
            stepOneCompletedWithWarnings: true,
            recentDecisions: [...state.recentDecisions, {label: 'Continued with demand warnings.', by: 'By You', time: '09:42'}],
          }),
        },
        {
          label: 'Show demand details',
          userText: 'Show demand details.',
          detailMessage: 'Demand details: Family B and Family D are missing May demand. SKU FG-7740 has demand with no assigned production line.',
          action: (state) => state,
        },
      ],
    },
    {
      title: 'Step 2 of 10 — Inventory Projection',
      body: [
        'Calculating inventory position based on current demand and opening stock.',
        'Risks identified:',
        '⚠ March falls below minimum coverage (2.8 weeks vs 3.0 target).',
        '⚠ April remains at risk without pull-forward production.',
        '• July shutdown requires build-ahead starting in June.',
        'Recommendation: Include inventory build-ahead assumption for scenario simulation.',
      ],
      options: [
        {
          label: 'Include build-ahead assumption',
          userText: 'Include build-ahead assumption.',
          nextStepIndex: 2,
          action: (state) => ({
            ...state,
            currentStepIndex: 2,
            kpis: {...state.kpis, inventoryCoverage: '3.2 weeks'},
            recentDecisions: [...state.recentDecisions, {label: 'Included inventory build-ahead assumption.', by: 'By You', time: '09:45'}],
          }),
        },
        {
          label: 'Do not include',
          userText: 'Do not include.',
          nextStepIndex: 2,
          action: (state) => ({
            ...state,
            currentStepIndex: 2,
            recentDecisions: [...state.recentDecisions, {label: 'Kept baseline inventory without build-ahead.', by: 'By You', time: '09:45'}],
          }),
        },
        {
          label: 'Show inventory chart',
          userText: 'Show inventory chart.',
          detailMessage: 'March coverage drops to 2.1 weeks in baseline. April stays at 2.4 weeks without build-ahead. July shutdown window needs June production uplift.',
          action: (state) => state,
        },
      ],
    },
    {
      title: 'Step 3 of 10 — Capacity Check',
      body: [
        'The baseline MPS is not fully feasible.',
        'Capacity gaps detected:',
        '• Line 10: -24,800 hrs in March',
        '• Line 07: -12,400 hrs in April',
        '• Line 03: -6,200 hrs in March',
        'Main causes: demand spike in March, planned downtime Week 11, OEE at 82%.',
        'Which recovery option should I simulate?',
      ],
      options: [
        {
          label: 'Simulate all recovery options',
          userText: 'Simulate all recovery options.',
          nextStepIndex: 3,
          action: (state) => ({
            ...state,
            currentStepIndex: 3,
            recentDecisions: [...state.recentDecisions, {label: 'Simulated all capacity recovery options.', by: 'By You', time: '09:48'}],
          }),
        },
        {
          label: 'Simulate overtime only',
          userText: 'Simulate overtime only.',
          nextStepIndex: 3,
          action: (state) => ({...state, currentStepIndex: 3}),
        },
        {
          label: 'Edit capacity assumptions',
          userText: 'Edit capacity assumptions.',
          detailMessage: 'Editable: OEE target (currently 82%), available overtime hours, and planned downtime windows.',
          action: (state) => state,
        },
      ],
    },
    {
      title: 'Step 4 of 10 — Materials Feasibility',
      body: [
        'I found 3 material risks impacting the proposed MPS.',
        'Critical:',
        '• RM-301656 shortage impacts 4 WOs / 500,000 units. Delivery after planned production window.',
        'Medium:',
        '• RM-882410 has partial stock available.',
        '• RM-771220 supplier confirmation pending.',
        'Recommended: Create action for Material Controller to confirm expedite options.',
      ],
      options: [
        {
          label: 'Create material action',
          userText: 'Create material action.',
          nextStepIndex: 4,
          action: (state) => ({
            ...state,
            currentStepIndex: 4,
            actions: appendUniqueAction(state.actions, {label: 'Confirm expedite for RM-301656', owner: 'Material Controller', due: 'Today', status: 'Open'}),
            recentDecisions: [...state.recentDecisions, {label: 'Created material expedite action.', by: 'By You', time: '09:50'}],
          }),
        },
        {
          label: 'Show impacted WOs',
          userText: 'Show impacted WOs.',
          detailMessage: 'Impacted WOs: WO-30102, WO-30117, WO-30121, WO-30128 — all waiting on RM-301656 for March execution.',
          action: (state) => state,
        },
        {
          label: 'Continue without action',
          userText: 'Continue without action.',
          nextStepIndex: 4,
          action: (state) => ({...state, currentStepIndex: 4}),
        },
      ],
    },
    {
      title: 'Step 5 of 10 — Downstream Constraints',
      body: [
        'Quality: 2 batches medium release confidence. 1 batch open deviation.',
        'Warehouse: No critical staging blockers.',
        'Sterilization: 3 batches may exceed dwell-time threshold if production delayed. Slots require confirmation.',
        'Recommendation: Reserve sterilization slots earlier for Family C.',
      ],
      options: [
        {
          label: 'Create sterilization action',
          userText: 'Create sterilization action.',
          nextStepIndex: 5,
          action: (state) => ({
            ...state,
            currentStepIndex: 5,
            actions: appendUniqueAction(state.actions, {label: 'Reserve sterilization slots for Family C', owner: 'Warehouse', due: '2 days', status: 'Open'}),
            recentDecisions: [...state.recentDecisions, {label: 'Created sterilization action for Family C.', by: 'By You', time: '09:52'}],
          }),
        },
        {
          label: 'Show quality risks',
          userText: 'Show quality risks.',
          detailMessage: 'Batch BR-4402 has an open deviation. BR-4408 and BR-4410 have medium release confidence for the current sequence.',
          action: (state) => state,
        },
        {
          label: 'Continue',
          userText: 'Continue.',
          nextStepIndex: 5,
          action: (state) => ({...state, currentStepIndex: 5}),
        },
      ],
    },
    {
      title: 'Step 6 of 10 — Scenario Generation',
      body: [
        'I generated 4 planning scenarios:',
        '1. Baseline — Not feasible',
        '2. Capacity Recovery — Feasible with risk',
        '3. Demand Smoothing — Feasible',
        '4. Constrained Commitment — Feasible',
        'Would you like to compare scenarios?',
      ],
      options: [
        {
          label: 'Compare scenarios',
          userText: 'Compare scenarios.',
          nextStepIndex: 6,
          action: (state) => ({...state, currentStepIndex: 6}),
        },
        {
          label: 'Create custom scenario',
          userText: 'Create custom scenario.',
          nextStepIndex: 6,
          action: (state) => ({...state, currentStepIndex: 6}),
        },
        {
          label: 'Show scenario details',
          userText: 'Show scenario details.',
          detailMessage: 'Capacity Recovery uses overtime + material confirmation. Demand Smoothing shifts production earlier to reduce line peaks.',
          action: (state) => state,
        },
      ],
    },
    {
      title: 'Step 7 of 10 — Compare Scenarios',
      body: [
        'AI recommended scenario: Capacity Recovery.',
        'Why this scenario:',
        '✓ Raises commitment coverage to 98%',
        '✓ Removes March stockout risk',
        '✓ Keeps inventory within target',
        '✓ Requires overtime but avoids constrained commitment',
        'Remaining risks: RM-301656 delivery, Line 10 overtime approval, sterilization slots.',
      ],
      options: [
        {
          label: 'Accept recommendation',
          userText: 'Accept recommendation.',
          nextStepIndex: 7,
          action: (state) => ({
            ...state,
            currentStepIndex: 7,
            selectedScenario: 'Capacity Recovery',
            kpis: {...state.kpis, proposedCommitment: '1,218,300', capacityUtilization: '94%', atRiskVolume: '27,020'},
            recentDecisions: [...state.recentDecisions, {label: 'Accepted Capacity Recovery recommendation.', by: 'By You', time: '09:55'}],
          }),
        },
        {
          label: 'Modify scenario',
          userText: 'Modify scenario.',
          nextStepIndex: 7,
          action: (state) => ({
            ...state,
            currentStepIndex: 7,
            selectedScenario: 'Custom Capacity Recovery',
          }),
        },
        {
          label: 'Compare with demand smoothing',
          userText: 'Compare with demand smoothing.',
          detailMessage: 'Demand Smoothing: utilization 91%, coverage 96%, higher build-ahead inventory. Lower peak risk but lower service commitment.',
          action: (state) => state,
        },
      ],
    },
    {
      title: 'Step 8 of 10 — Site Commitment',
      body: [
        'Based on Capacity Recovery scenario:',
        '• Forecast demand: 1,245,320 units',
        '• Proposed site commitment: 1,218,300 units',
        '• Commitment coverage: 98%',
        '• At-risk volume: 27,020 units',
        'Do you want to set this as the proposed site commitment?',
      ],
      options: [
        {
          label: 'Set as proposed commitment',
          userText: 'Set as proposed commitment.',
          nextStepIndex: 8,
          action: (state) => ({
            ...state,
            currentStepIndex: 8,
            mpsStatus: 'Commitment Proposed',
            kpis: {...state.kpis, proposedCommitment: '1,218,300'},
            recentDecisions: [...state.recentDecisions, {label: 'Set Capacity Recovery as proposed site commitment.', by: 'By You', time: '09:58'}],
          }),
        },
        {
          label: 'Edit commitment',
          userText: 'Edit commitment.',
          nextStepIndex: 8,
          action: (state) => ({...state, currentStepIndex: 8, mpsStatus: 'Commitment Proposed'}),
        },
        {
          label: 'Mark volume as at risk',
          userText: 'Mark volume as at risk.',
          nextStepIndex: 8,
          action: (state) => ({...state, currentStepIndex: 8, mpsStatus: 'Commitment Proposed'}),
        },
      ],
    },
    {
      title: 'Step 9 of 10 — Approval Package',
      body: [
        'I prepared the MPS approval summary:',
        '• Version: May-2026 Reforecast',
        '• Scenario: Capacity Recovery',
        '• Coverage: 98%, Utilization avg: 94%',
        '• Main risks: material, overtime, sterilization',
        '• Required actions: 4',
        'Would you like to add a planner comment before submission?',
      ],
      options: [
        {
          label: 'Add comment',
          userText: 'Add comment: Capacity Recovery accepted with material and sterilization actions open.',
          nextStepIndex: 9,
          action: (state) => ({
            ...state,
            currentStepIndex: 9,
            approvalComment: 'Capacity Recovery accepted with material and sterilization actions open.',
            recentDecisions: [...state.recentDecisions, {label: 'Added planner comment to approval package.', by: 'By You', time: '10:02'}],
          }),
        },
        {
          label: 'Submit without comment',
          userText: 'Submit without comment.',
          nextStepIndex: 9,
          action: (state) => ({...state, currentStepIndex: 9}),
        },
        {
          label: 'Generate summary',
          userText: 'Generate summary.',
          detailMessage: 'Summary: Capacity Recovery selected, 98% commitment coverage, 94% avg utilization, 4 open actions, 3 critical risks tracked.',
          action: (state) => state,
        },
      ],
    },
    {
      title: 'Step 10 of 10 — Submit & Handoff',
      body: [
        'Please confirm submission.',
        'You are submitting Capacity Recovery as the proposed MPS baseline.',
        'This will not release production orders automatically.',
        'The system will log: scenario, planner decisions, AI recommendations, timestamp, source data version, and open actions.',
      ],
      options: [
        {
          label: 'Confirm and submit',
          userText: 'Confirm and submit.',
          action: (state) => ({
            ...state,
            submitted: true,
            mpsStatus: 'Submitted for Approval',
            recentDecisions: [...state.recentDecisions, {label: 'MPS submitted for approval.', by: 'By You', time: '10:05'}],
          }),
        },
        {
          label: 'Save draft',
          userText: 'Save draft.',
          detailMessage: 'Draft saved. The proposed scenario, actions, and planner decisions stay visible until you confirm submission.',
          action: (state) => state,
        },
        {
          label: 'Go back',
          userText: 'Go back.',
          detailMessage: 'You can revise the approval package or site commitment before submitting.',
          action: (state) => state,
        },
      ],
    },
  ];
}

function createInitialMessages(): ChatMessage[] {
  return [
    {
      id: 'assistant-intro',
      role: 'assistant',
      title: 'MPS Assistant',
      body: "Hi! I'll guide you through the MPS process step by step.\nShall we start with demand validation?",
      options: [
        {
          label: 'Start review',
          userText: 'Yes, start the review.',
          nextStepIndex: 0,
          action: (state) => ({...state, currentStepIndex: 0}),
        },
      ],
    },
  ];
}

function buildStageMessage(stage: AssistantStage, id: string): ChatMessage {
  return {id, role: 'assistant', title: stage.title, body: stage.body.join('\n'), options: stage.options};
}

function rf() { return 0.8 + Math.random() * 0.4; }

const AI_FREE_RESPONSES = [
  'Noted. I\'ve updated the analysis based on your input. The planning data has been recalculated — check the dashboard for the latest numbers.',
  'Got it. I\'ve refreshed the projections with your latest input. The scenario table and charts reflect the updated values.',
  'Understood. The MPS projections have been recalibrated. Review the dashboard for revised capacity and inventory figures.',
  'I\'ve processed your input and updated the planning numbers. The charts on the right now show the recalculated values.',
  'Thank you. I\'ve integrated your input into the current analysis. The updated values are visible in the planning table and charts.',
  'Input received. I\'ve re-run the demand and capacity simulation — the updated results are now reflected across all panels.',
];

function buildJumpOptions(currentStepIdx: number, stages: AssistantStage[]): OptionConfig[] {
  const after = stages.map((_, i) => i).filter(i => i > currentStepIdx);
  const before = stages.map((_, i) => i).filter(i => i < currentStepIdx);
  const ordered = [...after, ...before];
  return ordered.slice(0, 4).map(idx => ({
    label: `Step ${idx + 1}: ${PROGRESS_STEPS[idx].label.replace('\n', ' ')}`,
    userText: `Jump to Step ${idx + 1} — ${PROGRESS_STEPS[idx].label.replace('\n', ' ')}.`,
    nextStepIndex: idx,
    action: (state: WorkspaceState): WorkspaceState => ({...state, currentStepIndex: idx}),
  }));
}

export default function MpsAiAssistantWorkspace({open, onClose, onComplete}: Props) {
  const stagesRef = useRef<AssistantStage[]>(buildAssistantStages());
  const [workspaceState, setWorkspaceState] = useState(INITIAL_STATE);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => createInitialMessages());
  const [exitConfirmOpen, setExitConfirmOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [rightTab, setRightTab] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [chatInput, setChatInput] = useState('');
  const [demandCapacityData, setDemandCapacityData] = useState(DEMAND_CAPACITY_DATA);
  const [inventoryData, setInventoryData] = useState(INVENTORY_DATA);
  const [capacityGapData, setCapacityGapData] = useState(CAPACITY_GAP_DATA);
  const [planningTableRows, setPlanningTableRows] = useState<PlanningRow[]>(PLANNING_TABLE_ROWS);

  const activeStepIndex = workspaceState.submitted
    ? PROGRESS_STEPS.length - 1
    : workspaceState.currentStepIndex;
  const latestMessageId = chatMessages[chatMessages.length - 1]?.id;

  if (!open) return null;

  const handleResetAndClose = () => {
    const wasSubmitted = workspaceState.submitted;
    setWorkspaceState(INITIAL_STATE);
    setChatMessages(createInitialMessages());
    setExitConfirmOpen(false);
    onClose();
    if (wasSubmitted) onComplete?.();
  };

  const handleRequestClose = () => {
    if (workspaceState.submitted || workspaceState.currentStepIndex < 0) {
      handleResetAndClose();
      return;
    }
    setExitConfirmOpen(true);
  };

  const randomizeData = () => {
    setDemandCapacityData(prev =>
      prev.map(d => ({...d, demand: Math.round(d.demand * rf()), capacity: Math.round(d.capacity * rf())}))
    );
    setInventoryData(prev =>
      prev.map(d => ({...d, coverage: parseFloat((d.coverage * rf()).toFixed(1))}))
    );
    setCapacityGapData(prev =>
      prev.map(d => ({...d, gap: Math.round(d.gap * rf())}))
    );
    setPlanningTableRows(prev =>
      prev.map(row => ({
        ...row,
        values: row.values.map(v => {
          if (typeof v !== 'number') return v;
          const r = v * rf();
          return row.format === 'decimal' ? parseFloat(r.toFixed(1)) : Math.round(r);
        }),
      }))
    );
    setWorkspaceState(prev => ({
      ...prev,
      kpis: {
        forecastDemand: Math.round(parseInt(prev.kpis.forecastDemand.replace(/,/g, ''), 10) * rf()).toLocaleString(),
        proposedCommitment: prev.kpis.proposedCommitment === 'Pending'
          ? 'Pending'
          : Math.round(parseInt(prev.kpis.proposedCommitment.replace(/,/g, ''), 10) * rf()).toLocaleString(),
        inventoryCoverage: `${(parseFloat(prev.kpis.inventoryCoverage) * rf()).toFixed(1)} weeks`,
        capacityUtilization: `${Math.round(parseFloat(prev.kpis.capacityUtilization) * rf())}%`,
        atRiskVolume: Math.round(parseInt(prev.kpis.atRiskVolume.replace(/,/g, ''), 10) * rf()).toLocaleString(),
        criticalRisks: String(Math.max(1, Math.round(parseInt(prev.kpis.criticalRisks, 10) * rf()))),
      },
      scenarioRows: prev.scenarioRows.map(row => ({
        ...row,
        coverage: `${Math.round(parseFloat(row.coverage) * rf())}%`,
        utilization: `${Math.round(parseFloat(row.utilization) * rf())}%`,
        inventory: `${(parseFloat(row.inventory) * rf()).toFixed(1)} weeks`,
        atRisk: `${Math.round(parseInt(row.atRisk.replace(/[^0-9]/g, ''), 10) * rf()).toLocaleString()} units`,
      })),
    }));
  };

  const handleSendMessage = () => {
    const text = chatInput.trim();
    if (!text || workspaceState.submitted) return;
    const responseText = AI_FREE_RESPONSES[Math.floor(Math.random() * AI_FREE_RESPONSES.length)];
    const jumpOptions = buildJumpOptions(workspaceState.currentStepIndex, stagesRef.current);
    setChatMessages(prev => [
      ...prev,
      {id: `user-${Date.now()}`, role: 'user', body: text},
      {
        id: `assistant-${Date.now() + 1}`,
        role: 'assistant',
        title: 'MPS Assistant',
        body: `${responseText}\n\nWhere would you like to go next?`,
        options: jumpOptions,
      },
    ]);
    setChatInput('');
    randomizeData();
    setTimeout(() => chatEndRef.current?.scrollIntoView({behavior: 'smooth'}), 80);
  };

  const handleOptionClick = (option: OptionConfig) => {
    const assistantMessageId = `assistant-${Date.now()}`;
    const updatedState = option.action(workspaceState);
    const nextMessages: ChatMessage[] = [
      {id: `user-${Date.now()}`, role: 'user', title: 'Planner', body: option.userText},
    ];

    if (option.detailMessage) {
      const currentStage = stagesRef.current[Math.max(workspaceState.currentStepIndex, 0)];
      nextMessages.push({
        id: assistantMessageId,
        role: 'assistant',
        title: currentStage.title,
        body: option.detailMessage,
        options: currentStage.options,
      });
    } else if (updatedState.submitted) {
      nextMessages.push({
        id: assistantMessageId,
        role: 'assistant',
        title: 'Submission complete',
        body: 'MPS review submitted successfully. The approval package is ready for approver review.',
      });
    } else if (typeof option.nextStepIndex === 'number') {
      const nextStage = stagesRef.current[option.nextStepIndex];
      nextMessages.push(buildStageMessage(nextStage, assistantMessageId));
    }

    setWorkspaceState(updatedState);
    setChatMessages((prev) => [...prev, ...nextMessages]);
    randomizeData();
    setTimeout(() => chatEndRef.current?.scrollIntoView({behavior: 'smooth'}), 80);
  };

  return (
    <>
      <Paper
        variant="outlined"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          bgcolor: '#F4F7FB',
          overflow: 'hidden',
          borderColor: '#D8DEE8',
          boxShadow: 'var(--planning-soft-shadow)',
          ...(isFullscreen
            ? {position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1300, height: '100vh', minHeight: 'unset', borderRadius: 0}
            : {height: 'calc(100vh - 260px)', minHeight: 680, borderRadius: 3}
          ),
        }}
      >
        {/* Top progress bar */}
        <Box sx={{bgcolor: 'var(--planning-surface)', borderBottom: '1px solid var(--planning-border)', px: 2.5, pt: 1.5, pb: 1}}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{mb: 1.2}}>
            <Typography sx={{fontSize: 14, fontWeight: 800, color: 'var(--planning-text-primary)'}}>MPS Review Progress</Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip
                label={workspaceState.mpsStatus}
                size="small"
                sx={{
                  fontWeight: 800,
                  bgcolor: workspaceState.submitted ? '#ECFDF3' : '#FFF7ED',
                  color: workspaceState.submitted ? '#027A48' : '#B54708',
                  border: `1px solid ${workspaceState.submitted ? '#ABEFC6' : '#FEC84B'}`,
                }}
              />
              <Button
                size="small"
                variant="outlined"
                startIcon={<ScienceIcon sx={{fontSize: 14}} />}
                sx={{textTransform: 'none', fontWeight: 800, fontSize: 12}}
              >
                Create Scenario
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={handleRequestClose}
                startIcon={<CloseIcon sx={{fontSize: 14}} />}
                sx={{textTransform: 'none', fontWeight: 800, fontSize: 12}}
              >
                End Review
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={() => setIsFullscreen(v => !v)}
                sx={{minWidth: 0, px: 0.8, fontWeight: 800, fontSize: 12}}
              >
                {isFullscreen
                  ? <FullscreenExitIcon sx={{fontSize: 18}} />
                  : <FullscreenIcon sx={{fontSize: 18}} />
                }
              </Button>
            </Stack>
          </Stack>
          <Box sx={{overflowX: 'auto', pb: 0.5}}>
            <Stack direction="row" spacing={0} sx={{minWidth: 900}}>
              {PROGRESS_STEPS.map((step, index) => {
                const completed = workspaceState.submitted || index < activeStepIndex;
                const active = !workspaceState.submitted && index === activeStepIndex;
                return (
                  <Box
                    key={step.label}
                    sx={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      position: 'relative',
                      '&::before': index > 0 ? {
                        content: '""',
                        position: 'absolute',
                        top: 13,
                        left: '-50%',
                        right: '50%',
                        height: 2,
                        bgcolor: completed || active ? '#1769FF' : '#E2E8F0',
                      } : {},
                    }}
                  >
                    <Box
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: completed ? '#1769FF' : active ? '#1769FF' : '#E2E8F0',
                        color: completed || active ? '#FFFFFF' : '#94A3B8',
                        fontSize: 12,
                        fontWeight: 900,
                        border: active ? '2px solid #BFDBFE' : 'none',
                        zIndex: 1,
                        position: 'relative',
                      }}
                    >
                      {completed ? <CheckCircleIcon sx={{fontSize: 16}} /> : index + 1}
                    </Box>
                    <Typography
                      sx={{
                        fontSize: 10,
                        fontWeight: active ? 900 : 600,
                        color: active ? '#1769FF' : completed ? '#1E293B' : '#94A3B8',
                        textAlign: 'center',
                        mt: 0.4,
                        whiteSpace: 'pre-line',
                        lineHeight: 1.2,
                      }}
                    >
                      {step.label}
                    </Typography>
                  </Box>
                );
              })}
            </Stack>
          </Box>
        </Box>

        {/* Main content area */}
        <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', lg: 'minmax(0, 1fr) 320px'}, flex: 1, minHeight: 0}}>
          {/* Right (visually): Chat panel */}
          <Box sx={{display: 'flex', flexDirection: 'column', borderLeft: '1px solid #E2E8F0', minHeight: 0, order: {lg: 2}}}>
            {/* Chat header */}
            <Box
              sx={{
                px: 2,
                py: 1.5,
                background: 'linear-gradient(135deg, #0B1F4D 0%, #123A86 58%, #1D74FF 100%)',
                flexShrink: 0,
              }}
            >
              <Stack direction="row" spacing={1.2} alignItems="center">
                <Avatar sx={{width: 36, height: 36, bgcolor: 'rgba(255,255,255,0.15)', color: '#FFFFFF'}}>
                  <AutoAwesomeIcon sx={{fontSize: 20}} />
                </Avatar>
                <Box>
                  <Typography sx={{fontSize: 15, fontWeight: 900, color: '#FFFFFF'}}>MPS Assistant</Typography>
                  <Typography sx={{fontSize: 11.5, color: 'rgba(255,255,255,0.75)'}}>Your AI copilot for MPS planning</Typography>
                </Box>
              </Stack>
            </Box>

            {/* Messages */}
            <Box sx={{flex: 1, overflowY: 'auto', px: 1.5, py: 1.5, bgcolor: 'var(--planning-surface)'}}>
              <Stack spacing={1.2}>
                {chatMessages.map((message) => (
                  <Box
                    key={message.id}
                    sx={{display: 'flex', justifyContent: message.role === 'assistant' ? 'flex-start' : 'flex-end'}}
                  >
                    {message.role === 'assistant' ? (
                      <Stack direction="row" spacing={0.8} alignItems="flex-start" sx={{maxWidth: '95%'}}>
                        <Avatar sx={{width: 28, height: 28, bgcolor: '#DBEAFE', color: '#1769FF', mt: 0.3, flexShrink: 0}}>
                          <AutoAwesomeIcon sx={{fontSize: 15}} />
                        </Avatar>
                        <Box>
                          <Paper
                            variant="outlined"
                            sx={{px: 1.4, py: 1, bgcolor: 'var(--planning-surface)', borderColor: '#E2E8F0', borderRadius: 2.5}}
                          >
                            {message.title ? (
                              <Typography sx={{fontSize: 11.5, fontWeight: 900, color: '#1769FF', mb: 0.3}}>
                                {message.title}
                              </Typography>
                            ) : null}
                            <Typography sx={{fontSize: 12.5, color: 'var(--planning-text-secondary)', whiteSpace: 'pre-line', lineHeight: 1.6}}>
                              {message.body}
                            </Typography>
                            {message.options && !workspaceState.submitted && message.id === latestMessageId ? (
                              <Stack spacing={0.6} sx={{mt: 1}}>
                                {message.options.map((option) => (
                                  <Button
                                    key={`${message.id}-${option.label}`}
                                    variant="outlined"
                                    size="small"
                                    onClick={() => handleOptionClick(option)}
                                    sx={{justifyContent: 'flex-start', textTransform: 'none', fontWeight: 700, fontSize: 12, borderRadius: 2}}
                                  >
                                    {option.label}
                                  </Button>
                                ))}
                              </Stack>
                            ) : null}
                          </Paper>
                          <Typography sx={{fontSize: 10.5, color: 'var(--planning-text-muted)', mt: 0.3, ml: 0.5}}>
                            {new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                          </Typography>
                        </Box>
                      </Stack>
                    ) : (
                      <Box sx={{maxWidth: '85%'}}>
                        <Paper
                          variant="outlined"
                          sx={{px: 1.4, py: 1, bgcolor: 'var(--planning-neutral-bg)', borderColor: '#BFDBFE', borderRadius: 2.5}}
                        >
                          <Typography sx={{fontSize: 12.5, color: 'var(--planning-text-primary)', lineHeight: 1.5}}>
                            {message.body}
                          </Typography>
                        </Paper>
                        <Typography sx={{fontSize: 10.5, color: 'var(--planning-text-muted)', mt: 0.3, textAlign: 'right'}}>
                          {new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})} ✓
                        </Typography>
                      </Box>
                    )}
                  </Box>
                ))}
                <div ref={chatEndRef} />
              </Stack>
            </Box>

            <Divider />
            <Box sx={{p: 1.5, bgcolor: 'var(--planning-surface)', flexShrink: 0}}>
              <Stack direction="row" spacing={1}>
                <TextField
                  fullWidth
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                  placeholder="Type a message..."
                  size="small"
                  disabled={workspaceState.submitted}
                  sx={{'& .MuiOutlinedInput-root': {borderRadius: 3, fontSize: 13}}}
                />
                <Button
                  variant="contained"
                  onClick={handleSendMessage}
                  disabled={!chatInput.trim() || workspaceState.submitted}
                  sx={{textTransform: 'none', fontWeight: 800, minWidth: 64, borderRadius: 3, bgcolor: '#1769FF', '&:hover': {bgcolor: '#1250CC'}}}
                >
                  Send
                </Button>
              </Stack>
            </Box>
          </Box>

          {/* Left (visually): Tabbed workspace */}
          <Box sx={{display: 'flex', flexDirection: 'column', minHeight: 0, overflowY: 'auto', bgcolor: 'var(--planning-surface-muted)', order: {lg: 1}}}>
            <Box sx={{bgcolor: 'var(--planning-surface)', borderBottom: '1px solid var(--planning-border)', px: 2, flexShrink: 0}}>
              <Tabs
                value={rightTab}
                onChange={(_, v) => setRightTab(v)}
                sx={{'& .MuiTab-root': {textTransform: 'none', fontWeight: 800, fontSize: 13}}}
              >
                <Tab label="Dashboard" />
                <Tab label="Planning Table" />
              </Tabs>
            </Box>

            {rightTab === 0 ? (
              <Box sx={{p: 2, display: 'flex', flexDirection: 'column', gap: 2}}>
                {/* KPI cards */}
                <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(6, minmax(0, 1fr))', gap: 1.5}}>
                  <KpiCard
                    label="Forecast Demand"
                    value={`${workspaceState.kpis.forecastDemand} units`}
                    sub="+18% vs prior forecast"
                    icon={<TrendingUpIcon sx={{fontSize: 18, color: '#1769FF'}} />}
                    iconBg="#EFF6FF"
                  />
                  <KpiCard
                    label="Proposed Commitment"
                    value={workspaceState.kpis.proposedCommitment === 'Pending' ? 'Pending' : `${workspaceState.kpis.proposedCommitment} units`}
                    sub="98% coverage"
                    icon={<AssignmentTurnedInIcon sx={{fontSize: 18, color: '#027A48'}} />}
                    iconBg="#ECFDF3"
                  />
                  <KpiCard
                    label="Inventory Coverage"
                    value={workspaceState.kpis.inventoryCoverage}
                    sub="Within target"
                    icon={<BoltIcon sx={{fontSize: 18, color: '#7C3AED'}} />}
                    iconBg="#F5F3FF"
                  />
                  <KpiCard
                    label="Capacity Utilization"
                    value={workspaceState.kpis.capacityUtilization}
                    sub="vs 88% last run"
                    icon={<BoltIcon sx={{fontSize: 18, color: '#1769FF'}} />}
                    iconBg="#EFF6FF"
                  />
                  <KpiCard
                    label="At-Risk Volume"
                    value={`${workspaceState.kpis.atRiskVolume} units`}
                    sub="2.2% of demand"
                    icon={<WarningAmberIcon sx={{fontSize: 18, color: '#D92D20'}} />}
                    iconBg="#FEF2F2"
                    valueColor="#D92D20"
                  />
                  <KpiCard
                    label="Critical Risks"
                    value={workspaceState.kpis.criticalRisks}
                    sub="Requires attention"
                    icon={<ErrorIcon sx={{fontSize: 18, color: '#B54708'}} />}
                    iconBg="#FFFBEB"
                    valueColor="#B54708"
                  />
                </Box>

                {/* Charts row */}
                <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', xl: 'minmax(0,2fr) minmax(0,2fr) minmax(0,1.2fr)'}, gap: 1.5}}>
                  {/* Demand vs Capacity */}
                  <Paper variant="outlined" sx={{p: 1.5, bgcolor: 'var(--planning-surface)'}}>
                    <Typography sx={{fontSize: 13, fontWeight: 800, color: 'var(--planning-text-primary)', mb: 0.3}}>Demand vs Capacity</Typography>
                    <Typography sx={{fontSize: 11, color: 'var(--planning-text-secondary)', mb: 1}}>Units</Typography>
                    <ResponsiveContainer width="100%" height={150}>
                      <ComposedChart data={demandCapacityData} margin={{top: 4, right: 8, left: -20, bottom: 0}}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                        <XAxis dataKey="month" tick={{fontSize: 10, fill: '#94A3B8'}} />
                        <YAxis tick={{fontSize: 10, fill: '#94A3B8'}} domain={['auto', 'auto']} unit="k" />
                        <RechartsTooltip formatter={(v: number) => [`${v}k units`]} />
                        <Area type="monotone" dataKey="capacity" stroke="#12B76A" strokeWidth={2} fill="rgba(18,183,106,0.08)" dot={false} strokeDasharray="5 4" name="Available Capacity" />
                        <Line type="monotone" dataKey="demand" stroke="#1769FF" strokeWidth={2} dot={{r: 3, fill: '#1769FF'}} name="Demand" />
                      </ComposedChart>
                    </ResponsiveContainer>
                    <Stack direction="row" spacing={2} sx={{mt: 0.5}}>
                      <LegendDot color="#1769FF" label="Demand" />
                      <LegendDot color="#12B76A" label="Available Capacity" dashed />
                    </Stack>
                    <Typography sx={{fontSize: 10.5, color: 'var(--planning-text-secondary)', mt: 0.5}}>The red area indicates capacity gap</Typography>
                  </Paper>

                  {/* Inventory Projection */}
                  <Paper variant="outlined" sx={{p: 1.5, bgcolor: 'var(--planning-surface)'}}>
                    <Typography sx={{fontSize: 13, fontWeight: 800, color: 'var(--planning-text-primary)', mb: 0.3}}>Inventory Projection</Typography>
                    <Typography sx={{fontSize: 11, color: 'var(--planning-text-secondary)', mb: 1}}>Weeks of Coverage</Typography>
                    <ResponsiveContainer width="100%" height={150}>
                      <LineChart data={inventoryData} margin={{top: 4, right: 8, left: -20, bottom: 0}}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                        <XAxis dataKey="month" tick={{fontSize: 10, fill: '#94A3B8'}} />
                        <YAxis tick={{fontSize: 10, fill: '#94A3B8'}} domain={[1, 9]} />
                        <RechartsTooltip formatter={(v: number) => [`${v} wks`]} />
                        <ReferenceLine y={7} stroke="#12B76A" strokeDasharray="5 4" label={{value: 'Max Target', position: 'right', fontSize: 9, fill: '#12B76A'}} />
                        <ReferenceLine y={3} stroke="#D92D20" strokeDasharray="5 4" label={{value: 'Min Target', position: 'right', fontSize: 9, fill: '#D92D20'}} />
                        <Line type="monotone" dataKey="coverage" stroke="#1769FF" strokeWidth={2} dot={{r: 3, fill: '#1769FF'}} name="Coverage" />
                      </LineChart>
                    </ResponsiveContainer>
                    <Typography sx={{fontSize: 10.5, color: 'var(--planning-text-secondary)', mt: 0.5}}>Coverage below minimum in Mar. Build-ahead needed in Jun.</Typography>
                  </Paper>

                  {/* Capacity Gap by Line */}
                  <Paper variant="outlined" sx={{p: 1.5, bgcolor: 'var(--planning-surface)'}}>
                    <Typography sx={{fontSize: 13, fontWeight: 800, color: 'var(--planning-text-primary)', mb: 0.3}}>Capacity Gap by Line (Critical)</Typography>
                    <Typography sx={{fontSize: 11, color: 'var(--planning-text-secondary)', mb: 1}}>Hours</Typography>
                    <ResponsiveContainer width="100%" height={150}>
                      <BarChart layout="vertical" data={capacityGapData} margin={{top: 4, right: 30, left: 10, bottom: 0}}>
                        <XAxis type="number" tick={{fontSize: 10, fill: '#94A3B8'}} domain={[-30000, 0]} tickFormatter={(v) => `${v / 1000}k`} />
                        <YAxis type="category" dataKey="line" tick={{fontSize: 11, fill: '#1E293B', fontWeight: 700}} width={50} />
                        <RechartsTooltip formatter={(v: number) => [`${v.toLocaleString()} hrs`]} />
                        <Bar dataKey="gap" radius={[0, 3, 3, 0]}>
                          {capacityGapData.map((entry) => (
                            <Cell key={entry.line} fill="#D92D20" />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                    <Typography sx={{fontSize: 10.5, color: 'var(--planning-text-secondary)', mt: 0.5}}>Negative values indicate capacity shortfall</Typography>
                  </Paper>
                </Box>

                {/* Demand Summary */}
                <MpsDemandSummary
                  demandLines={AI_DEMAND_LINES}
                  selectedProductCode={null}
                  onSelectProduct={() => undefined}
                />

                {/* MPS Planning Grid (simplified) */}
                <Paper variant="outlined" sx={{bgcolor: 'var(--planning-surface)', overflow: 'hidden'}}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{px: 2, py: 1.2, borderBottom: '1px solid var(--planning-border)'}}>
                    <Box>
                      <Typography sx={{fontSize: 13, fontWeight: 800, color: 'var(--planning-text-primary)'}}>MPS Planning Grid</Typography>
                      <Typography sx={{fontSize: 11, color: 'var(--planning-text-secondary)', mt: 0.2}}>May-2026 Reforecast · Plymouth · Week view</Typography>
                    </Box>
                  </Stack>
                  <Box sx={{overflowX: 'auto'}}>
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: '90px 1fr 70px 100px 90px 72px 72px 68px 84px 72px 84px 60px 60px 72px 100px 140px 140px',
                        minWidth: 1400,
                      }}
                    >
                      {['Product', 'Description', 'Bucket', 'Planned Qty', 'Line', 'Req Hrs', 'Avail Hrs', 'Util %', 'Open Stock', 'Demand', 'End Stock', 'Min', 'Max', 'Cov Days', 'Status', 'Reason', 'Comment'].map((h) => (
                        <Typography
                          key={h}
                          sx={{fontSize: 10, fontWeight: 800, color: 'var(--planning-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', p: '8px 10px', bgcolor: 'var(--planning-surface-muted)', borderBottom: '2px solid #E2E8F0', borderRight: '1px solid #E2E8F0', whiteSpace: 'nowrap'}}
                        >
                          {h}
                        </Typography>
                      ))}
                      {AI_MINI_GRID_ROWS.map((row, i) => {
                        const bg = i % 2 === 0 ? '#FFFFFF' : '#F8FAFC';
                        const utilClr = row.utilPct > 100 ? '#B42318' : row.utilPct >= 90 ? '#B54708' : '#027A48';
                        const endStockClr = row.endStock < row.minStock ? '#B42318' : row.endStock > row.maxStock ? '#B54708' : '#1E293B';
                        const c = {p: '6px 10px', borderBottom: '1px solid var(--planning-border)', borderRight: '1px solid #F1F5F9', bgcolor: bg, display: 'flex', alignItems: 'center', minHeight: 44, fontSize: 12};
                        return (
                          <Box key={`${row.productCode}-${row.bucket}`} sx={{display: 'contents'}}>
                            <Box sx={{...c, borderLeft: '3px solid transparent'}}>
                              <Box>
                                <Typography sx={{fontSize: 12, fontWeight: 700, color: 'var(--planning-text-primary)'}}>{row.productCode}</Typography>
                              </Box>
                            </Box>
                            <Box sx={c}>
                              <Box>
                                <Typography sx={{fontSize: 12, color: 'var(--planning-text-primary)'}}>{row.description}</Typography>
                                <Typography sx={{fontSize: 10, color: 'var(--planning-text-muted)'}}>{row.family}</Typography>
                              </Box>
                            </Box>
                            <Box sx={c}><Typography sx={{fontSize: 11, fontWeight: 600, color: 'var(--planning-text-secondary)'}}>{row.bucket}</Typography></Box>
                            <Box sx={c}><Typography sx={{fontSize: 12, fontWeight: 600, color: 'var(--planning-text-primary)'}}>{row.plannedQty.toLocaleString()}</Typography></Box>
                            <Box sx={c}><Typography sx={{fontSize: 12, color: 'var(--planning-text-secondary)'}}>{row.lineName}</Typography></Box>
                            <Box sx={c}><Typography sx={{fontSize: 12, color: 'var(--planning-text-secondary)'}}>{row.reqHrs.toLocaleString()}</Typography></Box>
                            <Box sx={c}><Typography sx={{fontSize: 12, color: 'var(--planning-text-secondary)'}}>{row.availHrs.toLocaleString()}</Typography></Box>
                            <Box sx={c}><Typography sx={{fontSize: 12, fontWeight: 700, color: utilClr}}>{row.utilPct}%</Typography></Box>
                            <Box sx={c}><Typography sx={{fontSize: 12, color: 'var(--planning-text-secondary)'}}>{row.openStock.toLocaleString()}</Typography></Box>
                            <Box sx={c}><Typography sx={{fontSize: 12, color: 'var(--planning-text-secondary)'}}>{row.demand.toLocaleString()}</Typography></Box>
                            <Box sx={c}><Typography sx={{fontSize: 12, fontWeight: 600, color: endStockClr}}>{row.endStock.toLocaleString()}</Typography></Box>
                            <Box sx={c}><Typography sx={{fontSize: 11, color: 'var(--planning-text-secondary)'}}>{row.minStock.toLocaleString()}</Typography></Box>
                            <Box sx={c}><Typography sx={{fontSize: 11, color: 'var(--planning-text-secondary)'}}>{row.maxStock.toLocaleString()}</Typography></Box>
                            <Box sx={c}><Typography sx={{fontSize: 12, color: 'var(--planning-text-secondary)'}}>{row.covDays > 0 ? `${row.covDays}d` : '-'}</Typography></Box>
                            <Box sx={c}><MpsBucketStatusBadge status={row.status} /></Box>
                            <Box sx={c}><Typography sx={{fontSize: 11, color: 'var(--planning-text-secondary)'}}>{row.reason ?? '-'}</Typography></Box>
                            <Box sx={c}><Typography sx={{fontSize: 11, color: 'var(--planning-text-secondary)'}}>{row.comment ?? '-'}</Typography></Box>
                          </Box>
                        );
                      })}
                    </Box>
                  </Box>
                </Paper>

                {/* Bottom row: Risks / Actions / AI Recommendation / Recent Decisions */}
                <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', xl: '1fr 1fr 1.3fr 1fr'}, gap: 1.5}}>
                  {/* Top Risks */}
                  <Paper variant="outlined" sx={{p: 1.5, bgcolor: 'var(--planning-surface)'}}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{mb: 1}}>
                      <Typography sx={{fontSize: 13, fontWeight: 800, color: 'var(--planning-text-primary)'}}>Top Risks (3)</Typography>
                      <Button size="small" sx={{textTransform: 'none', fontWeight: 700, fontSize: 11, color: '#1769FF', p: 0}}>
                        View all risks
                      </Button>
                    </Stack>
                    <Stack spacing={0.8}>
                      <RiskRow icon="error" label="RM-301656 shortage" severity="Critical" detail="Impacts 4 WOs / 500,000 units" />
                      <RiskRow icon="error" label="Line 10 capacity overload in Mar" severity="Critical" detail="-24,800 hrs" />
                      <RiskRow icon="warning" label="Sterilization backlog" severity="High" detail="3 batches at risk" />
                    </Stack>
                  </Paper>

                  {/* Open Actions */}
                  <Paper variant="outlined" sx={{p: 1.5, bgcolor: 'var(--planning-surface)'}}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{mb: 1}}>
                      <Typography sx={{fontSize: 13, fontWeight: 800, color: 'var(--planning-text-primary)'}}>Open Actions ({workspaceState.actions.length})</Typography>
                      <Button size="small" sx={{textTransform: 'none', fontWeight: 700, fontSize: 11, color: '#1769FF', p: 0}}>
                        View all actions
                      </Button>
                    </Stack>
                    <Stack spacing={0.7}>
                      {workspaceState.actions.slice(0, 4).map((action) => (
                        <Stack key={action.label} direction="row" alignItems="flex-start" spacing={0.8}>
                          <CheckCircleIcon sx={{fontSize: 14, color: '#12B76A', mt: 0.25, flexShrink: 0}} />
                          <Box sx={{flex: 1, minWidth: 0}}>
                            <Typography sx={{fontSize: 11.5, color: 'var(--planning-text-primary)', lineHeight: 1.4}} noWrap>{action.label}</Typography>
                            <Stack direction="row" justifyContent="space-between">
                              <Typography sx={{fontSize: 10.5, color: 'var(--planning-text-secondary)'}}>Owner: {action.owner}</Typography>
                              <Typography sx={{fontSize: 10.5, color: 'var(--planning-text-secondary)'}}>Due: {action.due}</Typography>
                            </Stack>
                          </Box>
                        </Stack>
                      ))}
                    </Stack>
                  </Paper>

                  {/* AI Recommendation */}
                  <Paper variant="outlined" sx={{p: 1.5, bgcolor: 'var(--planning-surface)'}}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{mb: 1}}>
                      <AutoAwesomeIcon sx={{fontSize: 16, color: '#1769FF'}} />
                      <Typography sx={{fontSize: 13, fontWeight: 800, color: 'var(--planning-text-primary)'}}>Impacts</Typography>
                    </Stack>
                    <Stack spacing={0.4} sx={{mb: 1}}>
                      {workspaceState.recommendationReasons.map((r) => (
                        <Stack key={r} direction="row" spacing={0.6} alignItems="flex-start">
                          <CheckCircleIcon sx={{fontSize: 13, color: '#12B76A', mt: 0.2, flexShrink: 0}} />
                          <Typography sx={{fontSize: 11.5, color: 'var(--planning-text-secondary)', lineHeight: 1.4}}>{r}</Typography>
                        </Stack>
                      ))}
                    </Stack>
                    <Typography sx={{fontSize: 11.5, fontWeight: 800, color: 'var(--planning-text-secondary)', mb: 0.5}}>Remaining Risks</Typography>
                    <Stack spacing={0.4} sx={{mb: 1.2}}>
                      {workspaceState.remainingRisks.map((r) => (
                        <Stack key={r} direction="row" spacing={0.6} alignItems="flex-start">
                          <WarningAmberIcon sx={{fontSize: 13, color: '#F79009', mt: 0.2, flexShrink: 0}} />
                          <Typography sx={{fontSize: 11.5, color: 'var(--planning-text-secondary)', lineHeight: 1.4}}>{r}</Typography>
                        </Stack>
                      ))}
                    </Stack>                    
                  </Paper>

                  {/* Recent Decisions */}
                  <Paper variant="outlined" sx={{p: 1.5, bgcolor: 'var(--planning-surface)'}}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{mb: 1}}>
                      <Typography sx={{fontSize: 13, fontWeight: 800, color: 'var(--planning-text-primary)'}}>Recent Decisions</Typography>
                      <Button size="small" sx={{textTransform: 'none', fontWeight: 700, fontSize: 11, color: '#1769FF', p: 0}}>
                        View decision log
                      </Button>
                    </Stack>
                    {workspaceState.recentDecisions.length === 0 ? (
                      <Typography sx={{fontSize: 12, color: 'var(--planning-text-muted)'}}>
                        Decisions will appear here as the guided review advances.
                      </Typography>
                    ) : (
                      <Stack spacing={0.8}>
                        {workspaceState.recentDecisions.slice(-4).map((d, i) => (
                          <Stack key={i} direction="row" spacing={0.8} alignItems="flex-start">
                            <CheckCircleIcon sx={{fontSize: 14, color: '#12B76A', mt: 0.25, flexShrink: 0}} />
                            <Box sx={{flex: 1, minWidth: 0}}>
                              <Typography sx={{fontSize: 12, color: 'var(--planning-text-primary)', lineHeight: 1.4}}>{d.label}</Typography>
                              <Stack direction="row" justifyContent="space-between">
                                <Typography sx={{fontSize: 10.5, color: 'var(--planning-text-secondary)'}}>{d.by}</Typography>
                                <Typography sx={{fontSize: 10.5, color: 'var(--planning-text-secondary)'}}>{d.time}</Typography>
                              </Stack>
                            </Box>
                          </Stack>
                        ))}
                      </Stack>
                    )}
                  </Paper>
                </Box>
              </Box>
            ) : (
              /* Planning Table tab */
              <Box sx={{p: 2}}>
                <Paper variant="outlined" sx={{bgcolor: 'var(--planning-surface)', overflow: 'hidden'}}>
                  <Box sx={{px: 2, py: 1.5, borderBottom: '1px solid var(--planning-border)'}}>
                    <Typography sx={{fontSize: 14, fontWeight: 800, color: 'var(--planning-text-primary)'}}>Monthly Planning Values</Typography>
                    <Typography sx={{fontSize: 12, color: 'var(--planning-text-secondary)', mt: 0.3}}>
                      Forecast version: May-2026 Reforecast — Site: Plymouth — Horizon: 12 months
                    </Typography>
                  </Box>
                  <Box sx={{overflowX: 'auto'}}>
                    <Table size="small">
                      <TableHead>
                        <TableRow
                          sx={{'& th': {bgcolor: 'var(--planning-surface-muted)', fontWeight: 800, fontSize: 12, color: 'var(--planning-text-secondary)', borderBottom: '2px solid #E2E8F0', whiteSpace: 'nowrap'}}}
                        >
                          <TableCell sx={{position: 'sticky', left: 0, zIndex: 2, bgcolor: '#F8FAFC !important', minWidth: 200}}>
                            Metric
                          </TableCell>
                          {PLANNING_MONTHS.map((m) => (
                            <TableCell key={m} align="center">{m}</TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {planningTableRows.map((row, rowIdx) => (
                          <TableRow
                            key={row.metric}
                            sx={{
                              bgcolor: rowIdx % 2 === 0 ? '#FFFFFF' : '#F8FAFC',
                              '& td': {fontSize: 12, borderColor: '#F1F5F9'},
                            }}
                          >
                            <TableCell
                              sx={{
                                position: 'sticky',
                                left: 0,
                                zIndex: 1,
                                bgcolor: rowIdx % 2 === 0 ? '#FFFFFF' : '#F8FAFC',
                                fontWeight: 700,
                                color: 'var(--planning-text-primary)',
                                whiteSpace: 'nowrap',
                                borderRight: '2px solid #E2E8F0',
                              }}
                            >
                              {row.metric}
                            </TableCell>
                            {row.values.map((v, colIdx) => {
                              const numV = typeof v === 'number' ? v : 0;
                              const hl = row.highlight ? row.highlight(numV) : 'normal';
                              return (
                                <TableCell
                                  key={colIdx}
                                  align="center"
                                  sx={{
                                    fontWeight: hl !== 'normal' ? 800 : 400,
                                    color: hl === 'error' ? '#B42318' : hl === 'warning' ? '#B54708' : '#334155',
                                    bgcolor: hl === 'error' ? '#FEF2F2' : hl === 'warning' ? '#FFFBEB' : undefined,
                                    borderRadius: 0,
                                  }}
                                >
                                  {formatPlanningValue(v, row.format)}
                                </TableCell>
                              );
                            })}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Box>
                  <Box sx={{px: 2, py: 1, borderTop: '1px solid var(--planning-border)', bgcolor: 'var(--planning-surface-muted)'}}>
                    <Stack direction="row" spacing={2}>
                      <Stack direction="row" spacing={0.6} alignItems="center">
                        <Box sx={{width: 12, height: 12, borderRadius: 0.5, bgcolor: '#FEF2F2', border: '1px solid #FECDCA'}} />
                        <Typography sx={{fontSize: 11, color: 'var(--planning-text-secondary)'}}>At risk / Critical</Typography>
                      </Stack>
                      <Stack direction="row" spacing={0.6} alignItems="center">
                        <Box sx={{width: 12, height: 12, borderRadius: 0.5, bgcolor: '#FFFBEB', border: '1px solid #FEC84B'}} />
                        <Typography sx={{fontSize: 11, color: 'var(--planning-text-secondary)'}}>Warning</Typography>
                      </Stack>
                      <Stack direction="row" spacing={0.6} alignItems="center">
                        <Box sx={{width: 12, height: 12, borderRadius: 0.5, bgcolor: 'var(--planning-surface)', border: '1px solid var(--planning-border)'}} />
                        <Typography sx={{fontSize: 11, color: 'var(--planning-text-secondary)'}}>Normal</Typography>
                      </Stack>
                    </Stack>
                  </Box>
                </Paper>
              </Box>
            )}
          </Box>
        </Box>
      </Paper>

      <Dialog open={exitConfirmOpen} onClose={() => setExitConfirmOpen(false)}>
        <DialogTitle sx={{fontWeight: 900}}>Exit AI Assistant?</DialogTitle>
        <DialogContent>
          <Typography sx={{fontSize: 13, color: 'var(--planning-text-secondary)'}}>
            Current review progress will be lost.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExitConfirmOpen(false)} sx={{textTransform: 'none'}}>Cancel</Button>
          <Button onClick={handleResetAndClose} color="error" sx={{textTransform: 'none', fontWeight: 800}}>Exit</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

function KpiCard({label, value, sub, icon, iconBg, valueColor}: {label: string; value: string; sub: string; icon: ReactNode; iconBg: string; valueColor?: string}) {
  return (
    <Paper variant="outlined" sx={{p: 1.5, bgcolor: 'var(--planning-surface)'}}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{mb: 0.8}}>
        <Typography sx={{fontSize: 11, fontWeight: 700, color: 'var(--planning-text-secondary)'}}>{label}</Typography>
        <Box sx={{width: 28, height: 28, borderRadius: 1.5, bgcolor: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
          {icon}
        </Box>
      </Stack>
      <Typography sx={{fontSize: 18, fontWeight: 900, color: valueColor ?? '#1E293B', lineHeight: 1.1}}>{value}</Typography>
      <Typography sx={{fontSize: 11, color: 'var(--planning-text-secondary)', mt: 0.3}}>{sub}</Typography>
    </Paper>
  );
}

function RiskRow({icon, label, severity, detail}: {icon: 'error' | 'warning'; label: string; severity: string; detail: string}) {
  const isError = icon === 'error';
  return (
    <Stack direction="row" spacing={0.8} alignItems="flex-start">
      {isError ? (
        <ErrorIcon sx={{fontSize: 14, color: '#D92D20', mt: 0.15, flexShrink: 0}} />
      ) : (
        <WarningAmberIcon sx={{fontSize: 14, color: '#F79009', mt: 0.15, flexShrink: 0}} />
      )}
      <Box sx={{flex: 1, minWidth: 0}}>
        <Stack direction="row" spacing={0.6} alignItems="center">
          <Typography sx={{fontSize: 11.5, fontWeight: 700, color: 'var(--planning-text-primary)'}} noWrap>{label}</Typography>
          <Box sx={{px: 0.6, py: 0.15, borderRadius: 0.8, bgcolor: isError ? '#FEF2F2' : '#FFFBEB', flexShrink: 0}}>
            <Typography sx={{fontSize: 10, fontWeight: 800, color: isError ? '#B42318' : '#B54708'}}>{severity}</Typography>
          </Box>
        </Stack>
        <Typography sx={{fontSize: 11, color: 'var(--planning-text-secondary)'}}>{detail}</Typography>
      </Box>
    </Stack>
  );
}

function LegendDot({color, label, dashed}: {color: string; label: string; dashed?: boolean}) {
  return (
    <Stack direction="row" spacing={0.5} alignItems="center">
      <Box
        sx={{
          width: 16,
          height: 2,
          bgcolor: dashed ? 'transparent' : color,
          borderTop: dashed ? `2px dashed ${color}` : 'none',
        }}
      />
      <Typography sx={{fontSize: 10.5, color: 'var(--planning-text-secondary)'}}>{label}</Typography>
    </Stack>
  );
}
