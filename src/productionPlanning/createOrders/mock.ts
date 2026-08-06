export type CreationMode = 'ai-assisted' | 'planned-order' | 'manual';

// ── Mode 1: AI-Assisted ──────────────────────────────────────────────────────

export type AiObjective =
  | 'fill-capacity'
  | 'protect-service-level'
  | 'reduce-bottlenecks'
  | 'inventory-replenishment'
  | 'ai-recommended';

export type AiAnalysisStep = {
  id: string;
  label: string;
  durationMs: number;
};

export const AI_ANALYSIS_STEPS: AiAnalysisStep[] = [
  { id: 'demand',      label: 'Analyzing demand signals',         durationMs: 900 },
  { id: 'inventory',   label: 'Checking inventory levels',        durationMs: 700 },
  { id: 'capacity',    label: 'Evaluating capacity windows',      durationMs: 1100 },
  { id: 'materials',   label: 'Reviewing material availability',  durationMs: 800 },
  { id: 'constraints', label: 'Applying planning constraints',    durationMs: 600 },
  { id: 'priorities',  label: 'Scoring order priorities',         durationMs: 700 },
  { id: 'changeovers', label: 'Optimizing changeover sequences',  durationMs: 900 },
  { id: 'resource',    label: 'Checking resource availability',   durationMs: 500 },
];

export type AiRecommendationRow = {
  id: string;
  product: string;
  quantity: string;
  suggestedLine: string;
  suggestedStartDate: string;
  priority: 'High' | 'Medium' | 'Low';
  confidenceScore: number;
  expectedBenefit: string;
  removed?: boolean;
};

export const AI_RECOMMENDATIONS: AiRecommendationRow[] = [
  { id: 'r1', product: 'FG-1001', quantity: '40,000 PCS', suggestedLine: 'Line 10', suggestedStartDate: 'Jun 10, 2026', priority: 'High',   confidenceScore: 94, expectedBenefit: '+12% capacity fill' },
  { id: 'r2', product: 'FG-2001', quantity: '10,000 PCS', suggestedLine: 'Line 20', suggestedStartDate: 'Jun 12, 2026', priority: 'High',   confidenceScore: 91, expectedBenefit: 'Prevents stockout Jun 18' },
  { id: 'r3', product: 'FG-3005', quantity: '25,000 PCS', suggestedLine: 'Line 10', suggestedStartDate: 'Jun 14, 2026', priority: 'Medium', confidenceScore: 86, expectedBenefit: '+8% service level' },
  { id: 'r4', product: 'FG-4001', quantity: '8,000 PCS',  suggestedLine: 'Line 30', suggestedStartDate: 'Jun 15, 2026', priority: 'Medium', confidenceScore: 78, expectedBenefit: 'Restores safety stock' },
  { id: 'r5', product: 'FG-5002', quantity: '15,000 PCS', suggestedLine: 'Line 20', suggestedStartDate: 'Jun 17, 2026', priority: 'Low',    confidenceScore: 72, expectedBenefit: 'Reduces bottleneck risk' },
  { id: 'r6', product: 'FG-1008', quantity: '30,000 PCS', suggestedLine: 'Line 10', suggestedStartDate: 'Jun 20, 2026', priority: 'Medium', confidenceScore: 83, expectedBenefit: 'Covers demand Jun 25–30' },
];

export type ImpactPanel = {
  id: string;
  title: string;
  current: string;
  proposed: string;
  delta: string;
  tone: 'good' | 'warning' | 'neutral';
};

export const AI_IMPACT_PANELS: ImpactPanel[] = [
  { id: 'capacity',      title: 'Capacity Utilization', current: '71%',  proposed: '88%',  delta: '+17%', tone: 'good' },
  { id: 'service-level', title: 'Service Level',        current: '92%',  proposed: '97%',  delta: '+5%',  tone: 'good' },
  { id: 'material',      title: 'Material Coverage',    current: '85%',  proposed: '91%',  delta: '+6%',  tone: 'good' },
  { id: 'inventory',     title: 'Inventory Health',     current: '63%',  proposed: '78%',  delta: '+15%', tone: 'good' },
  { id: 'changeovers',   title: 'Changeovers',          current: '14',   proposed: '11',   delta: '-3',   tone: 'good' },
  { id: 'risk',          title: 'Risk Reduction',       current: 'High', proposed: 'Low',  delta: '↓',    tone: 'good' },
];

// ── Mode 2: Planned Order Creation ──────────────────────────────────────────

export type PlanningSource = 'approved-mps' | 'approved-mrp' | 'combined';

export type CandidateRow = {
  id: string;
  sourceRef: string;
  product: string;
  quantity: string;
  dueDate: string;
  planningHorizon: string;
  planningSource: 'MPS' | 'MRP';
  inventoryStatus: 'OK' | 'Low' | 'Critical';
  materialReadiness: 'Ready' | 'Partial' | 'Missing';
};

export const CANDIDATE_ROWS: CandidateRow[] = [
  { id: 'c1',  sourceRef: 'MPS-000123-10',    product: 'FG-1001', quantity: '40,000 PCS', dueDate: 'Jun 18, 2026', planningHorizon: 'Jun 2026',  planningSource: 'MPS', inventoryStatus: 'Low',      materialReadiness: 'Ready'   },
  { id: 'c2',  sourceRef: 'MPS-000124-20',    product: 'FG-2001', quantity: '10,000 PCS', dueDate: 'Jun 20, 2026', planningHorizon: 'Jun 2026',  planningSource: 'MPS', inventoryStatus: 'OK',       materialReadiness: 'Ready'   },
  { id: 'c3',  sourceRef: 'MRP-PL02-0156-20', product: 'FG-3005', quantity: '25,000 PCS', dueDate: 'Jun 22, 2026', planningHorizon: 'Jun 2026',  planningSource: 'MRP', inventoryStatus: 'Critical',  materialReadiness: 'Partial' },
  { id: 'c4',  sourceRef: 'MRP-PL03-0045-10', product: 'FG-4001', quantity: '8,000 PCS',  dueDate: 'Jun 25, 2026', planningHorizon: 'Jun 2026',  planningSource: 'MRP', inventoryStatus: 'Low',       materialReadiness: 'Missing' },
  { id: 'c5',  sourceRef: 'MPS-000125-30',    product: 'FG-5002', quantity: '15,000 PCS', dueDate: 'Jun 28, 2026', planningHorizon: 'Jun 2026',  planningSource: 'MPS', inventoryStatus: 'OK',        materialReadiness: 'Ready'   },
  { id: 'c6',  sourceRef: 'MRP-PL01-0089-10', product: 'FG-1008', quantity: '30,000 PCS', dueDate: 'Jul 03, 2026', planningHorizon: 'Jul 2026',  planningSource: 'MRP', inventoryStatus: 'Low',       materialReadiness: 'Partial' },
  { id: 'c7',  sourceRef: 'MPS-000126-10',    product: 'FG-6010', quantity: '20,000 PCS', dueDate: 'Jul 05, 2026', planningHorizon: 'Jul 2026',  planningSource: 'MPS', inventoryStatus: 'OK',        materialReadiness: 'Ready'   },
  { id: 'c8',  sourceRef: 'MRP-PL04-0023-20', product: 'FG-2009', quantity: '12,000 PCS', dueDate: 'Jul 08, 2026', planningHorizon: 'Jul 2026',  planningSource: 'MRP', inventoryStatus: 'Critical',  materialReadiness: 'Missing' },
];

export type PlannedOrderReviewRow = {
  id: string;
  product: string;
  quantity: string;
  suggestedDate: string;
  suggestedLine: string;
  materialStatus: 'Ready' | 'Partial' | 'Missing';
  planningConfidence: number;
};

export const PLANNED_ORDER_REVIEW_ROWS: PlannedOrderReviewRow[] = [
  { id: 'pr1', product: 'FG-1001', quantity: '40,000 PCS', suggestedDate: 'Jun 10, 2026', suggestedLine: 'Line 10', materialStatus: 'Ready',   planningConfidence: 94 },
  { id: 'pr2', product: 'FG-2001', quantity: '10,000 PCS', suggestedDate: 'Jun 12, 2026', suggestedLine: 'Line 20', materialStatus: 'Ready',   planningConfidence: 91 },
  { id: 'pr3', product: 'FG-3005', quantity: '25,000 PCS', suggestedDate: 'Jun 14, 2026', suggestedLine: 'Line 10', materialStatus: 'Partial', planningConfidence: 78 },
  { id: 'pr4', product: 'FG-5002', quantity: '15,000 PCS', suggestedDate: 'Jun 17, 2026', suggestedLine: 'Line 30', materialStatus: 'Ready',   planningConfidence: 85 },
  { id: 'pr5', product: 'FG-1008', quantity: '30,000 PCS', suggestedDate: 'Jun 20, 2026', suggestedLine: 'Line 10', materialStatus: 'Partial', planningConfidence: 72 },
];

export type ValidationIssueSeverity = 'error' | 'warning' | 'info';
export type ValidationIssueCategory = 'material' | 'capacity' | 'master-data' | 'scheduling';

export type ValidationIssue = {
  id: string;
  severity: ValidationIssueSeverity;
  category: ValidationIssueCategory;
  message: string;
  recommendation: string;
};

export const VALIDATION_ISSUES: ValidationIssue[] = [
  { id: 'v1', severity: 'error',   category: 'material',     message: 'FG-4001: Component RM-0045 has 0 stock — insufficient for planned quantity.', recommendation: 'Place emergency PO or reschedule to Jul 10' },
  { id: 'v2', severity: 'warning', category: 'capacity',     message: 'Line 10 is at 97% utilization on Jun 14 — risk of overflow.', recommendation: 'Shift FG-3005 to Line 20 or Jun 16' },
  { id: 'v3', severity: 'warning', category: 'material',     message: 'FG-3005: Component RM-0112 is partially available (60% coverage).', recommendation: 'Confirm PO delivery ETA before releasing' },
  { id: 'v4', severity: 'info',    category: 'scheduling',   message: 'FG-1008 and FG-1001 share the same changeover sequence on Line 10.', recommendation: 'Sequence FG-1001 before FG-1008 to reduce changeover time' },
  { id: 'v5', severity: 'info',    category: 'master-data',  message: 'FG-6010: No preferred production line configured in master data.', recommendation: 'Update item master or assign manually' },
];

// ── Mode 3: Manual Creation ──────────────────────────────────────────────────

export type ManualOrderType = 'WO' | 'Planned' | 'Both';

export type ManualOrderRow = {
  id: string;
  orderType: 'WO' | 'Planned';
  product: string;
  quantity: string;
  targetDate: string;
  priority: 'High' | 'Medium' | 'Low';
  line: string;
};

export type CapacityStatus = 'Available' | 'Tight' | 'Overloaded';
export type MaterialStatus = 'Ready' | 'Partial' | 'Missing';

export type AiAssistanceSuggestion = {
  suggestedLine: string;
  suggestedStartDate: string;
  capacityStatus: CapacityStatus;
  materialStatus: MaterialStatus;
  confidenceScore: number;
};

export const MANUAL_AI_SUGGESTION: AiAssistanceSuggestion = {
  suggestedLine: 'Line 10',
  suggestedStartDate: 'Jun 10, 2026',
  capacityStatus: 'Available',
  materialStatus: 'Ready',
  confidenceScore: 87,
};

export const MANUAL_IMPACT_PANELS: ImpactPanel[] = [
  { id: 'capacity',      title: 'Capacity Utilization', current: '71%', proposed: '79%',  delta: '+8%',  tone: 'good' },
  { id: 'service-level', title: 'Service Level',        current: '92%', proposed: '94%',  delta: '+2%',  tone: 'good' },
  { id: 'material',      title: 'Material Coverage',    current: '85%', proposed: '87%',  delta: '+2%',  tone: 'good' },
  { id: 'inventory',     title: 'Inventory Health',     current: '63%', proposed: '68%',  delta: '+5%',  tone: 'good' },
  { id: 'changeovers',   title: 'Changeovers',          current: '14',  proposed: '13',   delta: '-1',   tone: 'neutral' },
  { id: 'completion',    title: 'Est. Completion',      current: '—',   proposed: 'Jun 12, 2026', delta: '', tone: 'neutral' },
];
