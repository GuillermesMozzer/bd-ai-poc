import type {
  WorkOrder, WOAuditEvent, WOException, WOAIRecommendation,
  WOConversationMessage, WOReadinessCheck, WOMaterialItem, WOGanttEvent, WOSavedView,
  WOSummary, BatchCreateRow,
} from './types';

const NOW = '2026-05-26T08:00:00.000Z';
const d = (offsetHours: number) =>
  new Date(new Date(NOW).getTime() + offsetHours * 3_600_000).toISOString();

let _seq = 1;
const uid = (p = 'ID') => `${p}-${String(_seq++).padStart(5, '0')}`;

export const LINES = ['Line 1', 'Line 2', 'Line 3', 'Line 4', 'Line 5'];
export const MACHINES: Record<string, { id: string; name: string }[]> = {
  'Line 1': [{ id: 'M-L1-01', name: 'Filler L1-A' }, { id: 'M-L1-02', name: 'Sealer L1-B' }],
  'Line 2': [{ id: 'M-L2-01', name: 'Filler L2-A' }, { id: 'M-L2-02', name: 'Packer L2-B' }],
  'Line 3': [{ id: 'M-L3-01', name: 'Assembly L3-A' }, { id: 'M-L3-02', name: 'Labeler L3-B' }],
  'Line 4': [{ id: 'M-L4-01', name: 'Press L4-A' }, { id: 'M-L4-02', name: 'Capper L4-B' }],
  'Line 5': [{ id: 'M-L5-01', name: 'Conveyor L5-A' }, { id: 'M-L5-02', name: 'Inspector L5-B' }],
};

export const GANTT_EVENTS: WOGanttEvent[] = [
  { id: 'GE-001', machineId: 'M-L1-01', type: 'Maintenance', label: 'Preventive Maintenance', startTime: d(-2), endTime: d(0) },
  { id: 'GE-002', machineId: 'M-L1-01', type: 'Normal', label: 'Normal Production', startTime: d(0), endTime: d(6) },
  { id: 'GE-003', machineId: 'M-L1-01', type: 'LowOEE', label: 'Low OEE Period', startTime: d(6), endTime: d(10), oeeValue: 52 },
  { id: 'GE-004', machineId: 'M-L1-01', type: 'Normal', label: 'Normal Production', startTime: d(10), endTime: d(18) },
  { id: 'GE-005', machineId: 'M-L1-01', type: 'Changeover', label: 'Product Changeover', startTime: d(18), endTime: d(20) },
  { id: 'GE-006', machineId: 'M-L1-02', type: 'Normal', label: 'Normal Production', startTime: d(-4), endTime: d(4) },
  { id: 'GE-007', machineId: 'M-L1-02', type: 'Downtime', label: 'Unplanned Downtime – Jam', startTime: d(4), endTime: d(6) },
  { id: 'GE-008', machineId: 'M-L1-02', type: 'Normal', label: 'Normal Production', startTime: d(6), endTime: d(16) },
  { id: 'GE-009', machineId: 'M-L2-01', type: 'LowOEE', label: 'Low OEE – Awaiting Material', startTime: d(-3), endTime: d(0), oeeValue: 44 },
  { id: 'GE-010', machineId: 'M-L2-01', type: 'Downtime', label: 'Emergency Stop', startTime: d(0), endTime: d(2) },
  { id: 'GE-011', machineId: 'M-L2-01', type: 'Normal', label: 'Normal Production', startTime: d(2), endTime: d(14) },
  { id: 'GE-012', machineId: 'M-L2-01', type: 'Maintenance', label: 'Scheduled Cleaning', startTime: d(14), endTime: d(16) },
  { id: 'GE-013', machineId: 'M-L2-02', type: 'Normal', label: 'Normal Production', startTime: d(-6), endTime: d(8) },
  { id: 'GE-014', machineId: 'M-L2-02', type: 'LowOEE', label: 'Low OEE – Operator Shortage', startTime: d(8), endTime: d(12), oeeValue: 61 },
  { id: 'GE-015', machineId: 'M-L2-02', type: 'Normal', label: 'Normal Production', startTime: d(12), endTime: d(24) },
  { id: 'GE-016', machineId: 'M-L3-01', type: 'Normal', label: 'Normal Production', startTime: d(-8), endTime: d(6) },
  { id: 'GE-017', machineId: 'M-L3-01', type: 'Cleaning', label: 'CIP Cleaning', startTime: d(6), endTime: d(8) },
  { id: 'GE-018', machineId: 'M-L3-01', type: 'Normal', label: 'Normal Production', startTime: d(8), endTime: d(20) },
  { id: 'GE-019', machineId: 'M-L3-02', type: 'Maintenance', label: 'Label Head Replacement', startTime: d(-1), endTime: d(1) },
  { id: 'GE-020', machineId: 'M-L3-02', type: 'Normal', label: 'Normal Production', startTime: d(1), endTime: d(12) },
  { id: 'GE-021', machineId: 'M-L4-01', type: 'Normal', label: 'Normal Production', startTime: d(-4), endTime: d(2) },
  { id: 'GE-022', machineId: 'M-L4-01', type: 'Downtime', label: 'Hydraulic Failure', startTime: d(2), endTime: d(5) },
  { id: 'GE-023', machineId: 'M-L4-01', type: 'LowOEE', label: 'Ramp-up after repair', startTime: d(5), endTime: d(8), oeeValue: 58 },
  { id: 'GE-024', machineId: 'M-L4-01', type: 'Normal', label: 'Normal Production', startTime: d(8), endTime: d(20) },
  { id: 'GE-025', machineId: 'M-L4-02', type: 'Normal', label: 'Normal Production', startTime: d(-2), endTime: d(18) },
  { id: 'GE-026', machineId: 'M-L5-01', type: 'Normal', label: 'Normal Production', startTime: d(-6), endTime: d(10) },
  { id: 'GE-027', machineId: 'M-L5-01', type: 'Maintenance', label: 'Belt Inspection', startTime: d(10), endTime: d(12) },
  { id: 'GE-028', machineId: 'M-L5-01', type: 'Normal', label: 'Normal Production', startTime: d(12), endTime: d(22) },
  { id: 'GE-029', machineId: 'M-L5-02', type: 'LowOEE', label: 'Vision System Calibration', startTime: d(0), endTime: d(3), oeeValue: 67 },
  { id: 'GE-030', machineId: 'M-L5-02', type: 'Normal', label: 'Normal Production', startTime: d(3), endTime: d(20) },
];

// ─── Readiness check presets ──────────────────────────────────────────────────
const readyChecks = (): WOReadinessCheck[] => [
  { category: 'Material', status: 'Ready', reason: 'All components staged and confirmed', lastChecked: d(-1), source: 'Warehouse' },
  { category: 'Machine', status: 'Ready', reason: 'Machine calibrated and available', lastChecked: d(-2), source: 'MES' },
  { category: 'Labor', status: 'Ready', reason: 'Operators assigned for all shifts', lastChecked: d(-0.5), source: 'MES' },
  { category: 'Documentation', status: 'Ready', reason: 'SOPs and batch records available', lastChecked: d(-3), source: 'ERP' },
  { category: 'Quality', status: 'Ready', reason: 'Quality release issued', lastChecked: d(-1), source: 'Quality' },
  { category: 'Warehouse', status: 'Ready', reason: 'All stock confirmed at staging area', lastChecked: d(-1), source: 'Warehouse' },
  { category: 'Sterilization', status: 'NotApplicable', reason: 'Not required for this product', lastChecked: d(-4), source: 'ERP' },
  { category: 'Schedule', status: 'Ready', reason: 'No schedule conflicts detected', lastChecked: d(-0.5), source: 'ReadinessEngine' },
  { category: 'BatchLot', status: 'Ready', reason: 'Batch/lot numbers assigned', lastChecked: d(-1), source: 'ERP' },
];

const warnChecks = (): WOReadinessCheck[] => [
  { category: 'Material', status: 'Warning', reason: 'Material data is 14h old – refresh recommended', lastChecked: d(-14), source: 'Warehouse' },
  { category: 'Machine', status: 'Ready', reason: 'Machine available', lastChecked: d(-2), source: 'MES' },
  { category: 'Labor', status: 'Warning', reason: 'Night shift operator role unassigned', lastChecked: d(-0.5), source: 'MES' },
  { category: 'Documentation', status: 'Ready', reason: 'Batch records available', lastChecked: d(-3), source: 'ERP' },
  { category: 'Quality', status: 'Ready', reason: 'Quality released', lastChecked: d(-1), source: 'Quality' },
  { category: 'Warehouse', status: 'Warning', reason: 'Staging confirmation pending', lastChecked: d(-6), source: 'Warehouse' },
  { category: 'Sterilization', status: 'NotApplicable', reason: 'Not required', lastChecked: d(-4), source: 'ERP' },
  { category: 'Schedule', status: 'Ready', reason: 'No conflicts', lastChecked: d(-0.5), source: 'ReadinessEngine' },
  { category: 'BatchLot', status: 'Ready', reason: 'Lot numbers assigned', lastChecked: d(-1), source: 'ERP' },
];

const blockedChecks = (): WOReadinessCheck[] => [
  { category: 'Material', status: 'Blocked', reason: 'Component MAT-4821 short by 240 kg – replenishment ETA 48h', lastChecked: d(-0.5), source: 'Warehouse' },
  { category: 'Machine', status: 'Ready', reason: 'Machine available', lastChecked: d(-2), source: 'MES' },
  { category: 'Labor', status: 'Blocked', reason: 'No certified operator available for this product class', lastChecked: d(-1), source: 'MES' },
  { category: 'Documentation', status: 'Ready', reason: 'Documents available', lastChecked: d(-3), source: 'ERP' },
  { category: 'Quality', status: 'Blocked', reason: 'Quality hold active – deviation DEV-2241 open', lastChecked: d(-0.25), source: 'Quality' },
  { category: 'Warehouse', status: 'Blocked', reason: 'Missing stock – cycle count discrepancy', lastChecked: d(-2), source: 'Warehouse' },
  { category: 'Sterilization', status: 'NotApplicable', reason: 'Not required', lastChecked: d(-4), source: 'ERP' },
  { category: 'Schedule', status: 'Warning', reason: 'Potential conflict on Line 3 after 14:00', lastChecked: d(-0.5), source: 'ReadinessEngine' },
  { category: 'BatchLot', status: 'Ready', reason: 'Lots assigned', lastChecked: d(-1), source: 'ERP' },
];

// ─── Builder helpers ──────────────────────────────────────────────────────────
const mat = (code: string, desc: string, req: number, avail: number): WOMaterialItem => ({
  materialCode: code, description: desc, requiredQty: req, availableQty: avail,
  shortageQty: Math.max(0, req - avail), uom: 'KG',
  storageLocation: `WH-${(req % 4) + 1}A`, batch: `LOT-${1000 + req}`,
  stagingReady: avail >= req, missingStock: avail < req, cycleCountRecommended: avail < req * 0.9,
});

const aiRec = (woId: string, text: string, action: string, decision: WOAIRecommendation['userDecision'] = 'Pending'): WOAIRecommendation => ({
  id: uid('AI'), woId, text, dataUsed: ['ReadinessEngine', 'MES', 'Warehouse'],
  confidence: 75 + (woId.charCodeAt(3) % 20),
  impact: 'Potential 4–8 hour delay on production line if not resolved within 2 hours.',
  suggestedAction: action, userDecision: decision,
  confirmedBy: decision === 'Accepted' ? 'supervisor.jones' : decision === 'Rejected' ? 'planner.smith' : undefined,
  timestamp: d(-0.5),
  reasonCode: decision !== 'Pending' ? 'MAT-01' : undefined,
  appliedAction: decision === 'Accepted' ? action : undefined,
});

const exc = (woId: string, type: WOException['type'], sev: WOException['severity'], reason: string, impact: string, owner?: string): WOException => ({
  id: uid('EXC'), type, severity: sev, reason,
  detectedAt: d(-4), impact, owner, acknowledged: false,
  aiRecommendation: `Investigate ${type.toLowerCase()} issue and escalate to ${owner ?? 'responsible team'}.`,
});

const aud = (woId: string, eventType: WOAuditEvent['eventType'], changedBy: string, from?: string, to?: string, comment?: string): WOAuditEvent => ({
  id: uid('AUD'), woId, timestamp: d(-24), eventType,
  field: from !== undefined ? 'lifecycleStatus' : undefined,
  previousValue: from, newValue: to, changedBy,
  source: 'ManualUserAction', comment,
  reasonCode: from && to ? 'CHG-01' : undefined,
});

const bluHistory = (woId: string, summary: string): WOConversationMessage[] => ([
  {
    id: uid('CHAT'),
    woId,
    role: 'assistant',
    kind: 'summary',
    text: summary,
    timestamp: d(-0.4),
  },
]);

// ─── Core hand-crafted WOs ────────────────────────────────────────────────────
const HAND_CRAFTED: WorkOrder[] = [
  {
    woId: 'WO-5001', materialCode: 'MAT-1001', materialDescription: 'Paracetamol Tablet 500mg', batch: 'B-2026-001',
    line: 'Line 1', machine: 'Filler L1-A', machineId: 'M-L1-01',
    lifecycleStatus: 'InExecution', readinessStatus: 'Ready', releaseStatus: 'Released', qualityStatus: 'Released',
    riskLevel: 'Low', scheduledStart: d(-4), scheduledEnd: d(4), actualStart: d(-3.5),
    plannedQty: 5000, completedQty: 2800, scrapQty: 12, progressPct: 56, uom: 'UNITS',
    owner: 'operator.carlos', sourceSystem: 'MES', sourceTimestamp: d(-0.25),
    dataFreshness: 'Fresh', dataFreshnessHours: 0.25, aiRiskScore: 18,
    aiRecommendation: 'Execution on track. Monitor scrap rate – currently 0.4%, within spec.',
    sterilizationRequired: false, shift: 'Morning',
    readinessChecks: readyChecks(),
    materials: [mat('MAT-1001-A', 'Paracetamol API 500mg', 500, 520), mat('MAT-1001-B', 'Lactose Filler', 200, 200)],
    quality: { status: 'Released', inspections: 3, deviations: 0, holds: 0, releaseConfidence: 98 },
    exceptions: [], aiRecommendations: [],
    auditEvents: [aud('WO-5001', 'Created', 'planner.smith'), aud('WO-5001', 'StatusChanged', 'operator.carlos', 'Released', 'InExecution')],
    bluAiHistory: bluHistory('WO-5001', 'WO-5001 is on track in execution. Ask about progress, scrap, or close-out readiness.'),
    currentOperation: 'Filling – Pass 2 of 4',
  },
  {
    woId: 'WO-5002', materialCode: 'MAT-1002', materialDescription: 'Ibuprofen Capsule 400mg', batch: 'B-2026-002',
    line: 'Line 1', machine: 'Sealer L1-B', machineId: 'M-L1-02',
    lifecycleStatus: 'InExecution', readinessStatus: 'Warning', releaseStatus: 'Released', qualityStatus: 'Released',
    riskLevel: 'Medium', scheduledStart: d(-2), scheduledEnd: d(6), actualStart: d(-1.5),
    plannedQty: 8000, completedQty: 2100, scrapQty: 85, progressPct: 26, uom: 'UNITS',
    currentBlocker: 'High scrap rate – sealing defects detected', owner: 'operator.luis',
    sourceSystem: 'MES', sourceTimestamp: d(-0.5),
    dataFreshness: 'Fresh', dataFreshnessHours: 0.5, aiRiskScore: 55,
    aiRecommendation: 'Scrap rate is 3x nominal. Recommend pausing for sealer head inspection.',
    sterilizationRequired: false, shift: 'Morning',
    readinessChecks: warnChecks(),
    materials: [mat('MAT-1002-A', 'Ibuprofen API', 800, 810)],
    quality: { status: 'Released', inspections: 5, deviations: 1, holds: 0, releaseConfidence: 84 },
    exceptions: [exc('WO-5002', 'Quality', 'Medium', 'Sealing defect – 3.1% scrap rate detected', 'Risk to batch yield', 'quality.team')],
    aiRecommendations: [aiRec('WO-5002', 'Pause execution for sealer inspection', 'Pause WO and notify Maintenance')],
    auditEvents: [aud('WO-5002', 'Created', 'planner.smith'), aud('WO-5002', 'ExceptionAdded', 'MES', undefined, undefined, 'High scrap rate auto-detected')],
    bluAiHistory: bluHistory('WO-5002', 'WO-5002 has a quality-related execution risk. Ask about scrap, blocker impact, or the next action.'),
    currentOperation: 'Sealing – Pass 1 of 3', delayReason: 'Scrap investigation in progress',
  },
  {
    woId: 'WO-5003', materialCode: 'MAT-1003', materialDescription: 'Amoxicillin Suspension 250mg', batch: 'B-2026-003',
    line: 'Line 2', machine: 'Filler L2-A', machineId: 'M-L2-01',
    lifecycleStatus: 'Released', readinessStatus: 'Ready', releaseStatus: 'Released', qualityStatus: 'Released',
    riskLevel: 'Low', scheduledStart: d(1), scheduledEnd: d(9),
    plannedQty: 3000, completedQty: 0, scrapQty: 0, progressPct: 0, uom: 'BOTTLES',
    owner: 'operator.anna', sourceSystem: 'ERP', sourceTimestamp: d(-1),
    dataFreshness: 'Fresh', dataFreshnessHours: 1, aiRiskScore: 22,
    aiRecommendation: 'WO is fully ready for execution. Start on schedule.',
    sterilizationRequired: false, shift: 'Morning',
    readinessChecks: readyChecks(),
    materials: [mat('MAT-1003-A', 'Amoxicillin API', 90, 95)],
    quality: { status: 'Released', inspections: 2, deviations: 0, holds: 0, releaseConfidence: 99 },
    exceptions: [], aiRecommendations: [],
    auditEvents: [aud('WO-5003', 'Created', 'planner.jones'), aud('WO-5003', 'StatusChanged', 'planner.jones', 'Planned', 'Released')],
    bluAiHistory: bluHistory('WO-5003', 'WO-5003 is released and ready to start on schedule. Ask about readiness, timing, or dependencies.'),
  },
  {
    woId: 'WO-5004', materialCode: 'MAT-1004', materialDescription: 'Metformin HCl 850mg', batch: 'B-2026-004',
    line: 'Line 2', machine: 'Packer L2-B', machineId: 'M-L2-02',
    lifecycleStatus: 'OnHold', readinessStatus: 'Blocked', releaseStatus: 'ReleaseBlocked', qualityStatus: 'OnHold',
    riskLevel: 'Critical', scheduledStart: d(-6), scheduledEnd: d(2),
    plannedQty: 10000, completedQty: 1200, scrapQty: 0, progressPct: 12, uom: 'UNITS',
    currentBlocker: 'Quality hold – active deviation DEV-2241: out-of-spec dissolution test',
    sourceSystem: 'Quality', sourceTimestamp: d(-4),
    dataFreshness: 'Stale', dataFreshnessHours: 4, aiRiskScore: 92,
    aiRecommendation: 'Quality hold blocking release. Escalate to QA Manager before resuming.',
    sterilizationRequired: false, shift: 'Afternoon',
    readinessChecks: blockedChecks(),
    materials: [mat('MAT-1004-A', 'Metformin API', 850, 900)],
    quality: { status: 'OnHold', inspections: 4, deviations: 1, holds: 1, releaseConfidence: 15, expectedReleaseDate: d(48) },
    exceptions: [
      exc('WO-5004', 'Quality', 'Critical', 'Dissolution test out of spec – DEV-2241', '10,000 units at risk, production halted', 'qa.manager'),
      exc('WO-5004', 'OnHold', 'High', 'WO placed On Hold with no assigned owner for 18 hours', 'Risk of line idle time'),
    ],
    aiRecommendations: [aiRec('WO-5004', 'Escalate to QA Manager and schedule deviation review', 'Notify QA Manager and assign investigation owner')],
    auditEvents: [aud('WO-5004', 'Created', 'planner.smith'), aud('WO-5004', 'StatusChanged', 'supervisor.jones', 'InExecution', 'OnHold')],
    bluAiHistory: bluHistory('WO-5004', 'WO-5004 is on hold because of a critical quality issue. Ask about the hold, impact, or escalation path.'),
    delayReason: 'Quality hold – dissolution test failure',
  },
  {
    woId: 'WO-5005', materialCode: 'MAT-1005', materialDescription: 'Omeprazole 20mg Capsules', batch: 'B-2026-005',
    line: 'Line 3', machine: 'Assembly L3-A', machineId: 'M-L3-01',
    lifecycleStatus: 'ReadyForRelease', readinessStatus: 'Ready', releaseStatus: 'PendingRelease', qualityStatus: 'Released',
    riskLevel: 'Low', scheduledStart: d(2), scheduledEnd: d(10),
    plannedQty: 6000, completedQty: 0, scrapQty: 0, progressPct: 0, uom: 'UNITS',
    owner: 'planner.jones', sourceSystem: 'ERP', sourceTimestamp: d(-0.5),
    dataFreshness: 'Fresh', dataFreshnessHours: 0.5, aiRiskScore: 15,
    aiRecommendation: 'All readiness checks green. Release WO to start on schedule.',
    sterilizationRequired: false, shift: 'Morning',
    readinessChecks: readyChecks(),
    materials: [mat('MAT-1005-A', 'Omeprazole API', 120, 130)],
    quality: { status: 'Released', inspections: 2, deviations: 0, holds: 0, releaseConfidence: 97 },
    exceptions: [],
    aiRecommendations: [aiRec('WO-5005', 'Release WO – all checks passed', 'Release WO-5005')],
    auditEvents: [aud('WO-5005', 'Created', 'planner.jones'), aud('WO-5005', 'ReadinessCalculated', 'ReadinessEngine')],
    bluAiHistory: bluHistory('WO-5005', 'WO-5005 is ready for release with all checks green. Ask for a readiness summary or the recommended release action.'),
  },
  {
    woId: 'WO-5006', materialCode: 'MAT-1006', materialDescription: 'Atorvastatin 10mg Tablets', batch: 'B-2026-006',
    line: 'Line 3', machine: 'Labeler L3-B', machineId: 'M-L3-02',
    lifecycleStatus: 'Scheduled', readinessStatus: 'Warning', releaseStatus: 'NotReleased', qualityStatus: 'Released',
    riskLevel: 'High', scheduledStart: d(4), scheduledEnd: d(12),
    plannedQty: 12000, completedQty: 0, scrapQty: 0, progressPct: 0, uom: 'UNITS',
    currentBlocker: 'Material shortage – MAT-4821 below minimum threshold',
    owner: 'planner.smith', sourceSystem: 'ERP', sourceTimestamp: d(-14),
    dataFreshness: 'Stale', dataFreshnessHours: 14, aiRiskScore: 74,
    aiRecommendation: 'Material shortage and stale data detected 4h before release window.',
    sterilizationRequired: false, shift: 'Afternoon',
    readinessChecks: warnChecks(),
    materials: [mat('MAT-4821', 'Atorvastatin API', 240, 120), mat('MAT-1006-B', 'Film Coat', 80, 85)],
    quality: { status: 'Released', inspections: 1, deviations: 0, holds: 0, releaseConfidence: 88 },
    exceptions: [
      exc('WO-5006', 'Material', 'High', 'MAT-4821 short by 120 kg – ETA 36h from supplier', 'Risk to schedule start in 4h', 'material.team'),
      exc('WO-5006', 'StaleData', 'Medium', 'Source data 14 hours old', 'Readiness decisions based on outdated information'),
    ],
    aiRecommendations: [aiRec('WO-5006', 'Contact supplier for expedited delivery and trigger material data refresh', 'Trigger data refresh + notify material.team')],
    auditEvents: [aud('WO-5006', 'Created', 'planner.smith')],
    bluAiHistory: bluHistory('WO-5006', 'WO-5006 has a material shortage and stale data warning. Ask about supply risk or readiness.'),
  },
  {
    woId: 'WO-5007', materialCode: 'MAT-1007', materialDescription: 'Lisinopril 5mg Tablets', batch: 'B-2026-007',
    line: 'Line 4', machine: 'Press L4-A', machineId: 'M-L4-01',
    lifecycleStatus: 'Planned', readinessStatus: 'Ready', releaseStatus: 'NotReleased', qualityStatus: 'Released',
    riskLevel: 'Low', scheduledStart: d(8), scheduledEnd: d(16),
    plannedQty: 9000, completedQty: 0, scrapQty: 0, progressPct: 0, uom: 'UNITS',
    owner: 'planner.jones', sourceSystem: 'ERP', sourceTimestamp: d(-2),
    dataFreshness: 'Fresh', dataFreshnessHours: 2, aiRiskScore: 20,
    aiRecommendation: 'Planned and ready. Confirm operator assignment before release window.',
    sterilizationRequired: false, shift: 'Afternoon',
    readinessChecks: readyChecks(),
    materials: [mat('MAT-1007-A', 'Lisinopril API', 45, 50)],
    quality: { status: 'Released', inspections: 1, deviations: 0, holds: 0, releaseConfidence: 98 },
    exceptions: [], aiRecommendations: [],
    auditEvents: [aud('WO-5007', 'Created', 'planner.jones')],
    bluAiHistory: bluHistory('WO-5007', 'WO-5007 is planned and stable. Ask about release preparation or schedule timing.'),
  },
  {
    woId: 'WO-5008', materialCode: 'MAT-1008', materialDescription: 'Insulin Glargine 100U/mL', batch: 'B-2026-008',
    line: 'Line 4', machine: 'Capper L4-B', machineId: 'M-L4-02',
    lifecycleStatus: 'Planned', readinessStatus: 'Blocked', releaseStatus: 'ReleaseBlocked', qualityStatus: 'Pending',
    riskLevel: 'Critical', scheduledStart: d(6), scheduledEnd: d(14),
    plannedQty: 2000, completedQty: 0, scrapQty: 0, progressPct: 0, uom: 'VIALS',
    currentBlocker: 'Sterilization slot not confirmed + quality release pending',
    owner: 'planner.smith', sourceSystem: 'ERP', sourceTimestamp: d(-3),
    dataFreshness: 'Stale', dataFreshnessHours: 3, aiRiskScore: 89,
    aiRecommendation: 'Sterilization slot and quality release both outstanding. Critical path – escalate immediately.',
    sterilizationRequired: true, shift: 'Night',
    readinessChecks: blockedChecks(),
    materials: [mat('MAT-1008-A', 'Insulin Glargine API', 200, 205)],
    quality: { status: 'Pending', inspections: 2, deviations: 0, holds: 0, releaseConfidence: 55, expectedReleaseDate: d(10) },
    sterilization: { required: true, readiness: 'Blocked', dwellDeadline: d(8), slotStatus: 'Pending', vendorCapacity: 'Limited', internalCapacity: 'Unavailable', riskLevel: 'Critical', relatedBatchStatus: 'Awaiting release' },
    exceptions: [
      exc('WO-5008', 'Sterilization', 'Critical', 'No confirmed sterilization slot – dwell deadline in 8h', 'Risk to entire batch if dwell window missed', 'production.manager'),
      exc('WO-5008', 'Quality', 'High', 'Quality release pending – inspection #2 incomplete', 'WO cannot be released without QA sign-off'),
    ],
    aiRecommendations: [aiRec('WO-5008', 'Escalate sterilization and quality release simultaneously', 'Notify sterilization vendor + QA Manager')],
    auditEvents: [aud('WO-5008', 'Created', 'planner.smith')],
    bluAiHistory: bluHistory('WO-5008', 'WO-5008 is blocked by sterilization and QA prerequisites. Ask about the critical path or escalation actions.'),
  },
  {
    woId: 'WO-5009', materialCode: 'MAT-1009', materialDescription: 'Azithromycin 500mg Tablets', batch: 'B-2026-009',
    line: 'Line 5', machine: 'Conveyor L5-A', machineId: 'M-L5-01',
    lifecycleStatus: 'InExecution', readinessStatus: 'Ready', releaseStatus: 'Released', qualityStatus: 'Released',
    riskLevel: 'Low', scheduledStart: d(-8), scheduledEnd: d(0), actualStart: d(-7.5),
    plannedQty: 4000, completedQty: 3600, scrapQty: 8, progressPct: 90, uom: 'UNITS',
    owner: 'operator.sofia', sourceSystem: 'MES', sourceTimestamp: d(-0.1),
    dataFreshness: 'Fresh', dataFreshnessHours: 0.1, aiRiskScore: 10,
    aiRecommendation: 'Near completion. Prepare for close-out inspection.',
    sterilizationRequired: false, shift: 'Morning',
    readinessChecks: readyChecks(),
    materials: [mat('MAT-1009-A', 'Azithromycin API', 200, 205)],
    quality: { status: 'Released', inspections: 4, deviations: 0, holds: 0, releaseConfidence: 99 },
    exceptions: [], aiRecommendations: [],
    auditEvents: [aud('WO-5009', 'Created', 'planner.jones'), aud('WO-5009', 'StatusChanged', 'operator.sofia', 'Released', 'InExecution')],
    bluAiHistory: bluHistory('WO-5009', 'WO-5009 is near completion. Ask about close-out readiness, yield, or the final steps.'),
    currentOperation: 'Packaging – final carton',
  },
  {
    woId: 'WO-5010', materialCode: 'MAT-1010', materialDescription: 'Ciprofloxacin 500mg Tablets', batch: 'B-2026-010',
    line: 'Line 1', machine: 'Filler L1-A', machineId: 'M-L1-01',
    lifecycleStatus: 'Completed', readinessStatus: 'Ready', releaseStatus: 'Released', qualityStatus: 'Released',
    riskLevel: 'Low', scheduledStart: d(-16), scheduledEnd: d(-8), actualStart: d(-15.5), actualEnd: d(-8.5),
    plannedQty: 5000, completedQty: 4980, scrapQty: 20, progressPct: 100, uom: 'UNITS',
    owner: 'operator.carlos', sourceSystem: 'MES', sourceTimestamp: d(-8),
    dataFreshness: 'Fresh', dataFreshnessHours: 8, aiRiskScore: 5,
    aiRecommendation: 'Completed successfully. 99.6% yield.',
    sterilizationRequired: false, shift: 'Night',
    readinessChecks: readyChecks(),
    materials: [mat('MAT-1010-A', 'Ciprofloxacin API', 250, 260)],
    quality: { status: 'Released', inspections: 5, deviations: 0, holds: 0, releaseConfidence: 100 },
    exceptions: [], aiRecommendations: [],
    auditEvents: [aud('WO-5010', 'Created', 'planner.smith'), aud('WO-5010', 'StatusChanged', 'operator.carlos', 'InExecution', 'Completed')],
    bluAiHistory: bluHistory('WO-5010', 'WO-5010 is completed successfully. Ask about yield, execution history, or closure actions.'),
  },
];

// ─── Bulk-generated WOs ───────────────────────────────────────────────────────
function generateBulk(): WorkOrder[] {
  const items = [
    { code: 'MAT-2001', desc: 'Metoprolol 50mg Tablets', line: 'Line 1', mach: 'Sealer L1-B', machId: 'M-L1-02' },
    { code: 'MAT-2002', desc: 'Amlodipine 5mg Tablets', line: 'Line 2', mach: 'Filler L2-A', machId: 'M-L2-01' },
    { code: 'MAT-2003', desc: 'Losartan 50mg Tablets', line: 'Line 2', mach: 'Packer L2-B', machId: 'M-L2-02' },
    { code: 'MAT-2004', desc: 'Pantoprazole 40mg Tablets', line: 'Line 3', mach: 'Assembly L3-A', machId: 'M-L3-01' },
    { code: 'MAT-2005', desc: 'Gabapentin 300mg Capsules', line: 'Line 3', mach: 'Labeler L3-B', machId: 'M-L3-02' },
    { code: 'MAT-2006', desc: 'Fluoxetine 20mg Capsules', line: 'Line 4', mach: 'Press L4-A', machId: 'M-L4-01' },
    { code: 'MAT-2007', desc: 'Hydrochlorothiazide 25mg', line: 'Line 4', mach: 'Capper L4-B', machId: 'M-L4-02' },
    { code: 'MAT-2008', desc: 'Tramadol 50mg Capsules', line: 'Line 5', mach: 'Conveyor L5-A', machId: 'M-L5-01' },
    { code: 'MAT-2009', desc: 'Sertraline 50mg Tablets', line: 'Line 5', mach: 'Inspector L5-B', machId: 'M-L5-02' },
    { code: 'MAT-2010', desc: 'Doxycycline 100mg Capsules', line: 'Line 1', mach: 'Filler L1-A', machId: 'M-L1-01' },
    { code: 'MAT-2011', desc: 'Cephalexin 500mg Capsules', line: 'Line 1', mach: 'Sealer L1-B', machId: 'M-L1-02' },
    { code: 'MAT-2012', desc: 'Ranitidine 150mg Tablets', line: 'Line 2', mach: 'Filler L2-A', machId: 'M-L2-01' },
    { code: 'MAT-2013', desc: 'Clonazepam 0.5mg Tablets', line: 'Line 2', mach: 'Packer L2-B', machId: 'M-L2-02' },
    { code: 'MAT-2014', desc: 'Warfarin 5mg Tablets', line: 'Line 3', mach: 'Assembly L3-A', machId: 'M-L3-01' },
    { code: 'MAT-2015', desc: 'Levothyroxine 50mcg Tabs', line: 'Line 3', mach: 'Labeler L3-B', machId: 'M-L3-02' },
    { code: 'MAT-2016', desc: 'Salbutamol Inhaler 100mcg', line: 'Line 4', mach: 'Press L4-A', machId: 'M-L4-01' },
    { code: 'MAT-2017', desc: 'Prednisolone 5mg Tablets', line: 'Line 4', mach: 'Capper L4-B', machId: 'M-L4-02' },
    { code: 'MAT-2018', desc: 'Lactulose Solution 667mg', line: 'Line 5', mach: 'Conveyor L5-A', machId: 'M-L5-01' },
    { code: 'MAT-2019', desc: 'Furosemide 40mg Tablets', line: 'Line 5', mach: 'Inspector L5-B', machId: 'M-L5-02' },
    { code: 'MAT-2020', desc: 'Spironolactone 25mg Tabs', line: 'Line 1', mach: 'Filler L1-A', machId: 'M-L1-01' },
    { code: 'MAT-2021', desc: 'Cetirizine 10mg Tablets', line: 'Line 1', mach: 'Sealer L1-B', machId: 'M-L1-02' },
    { code: 'MAT-2022', desc: 'Loratadine 10mg Tablets', line: 'Line 2', mach: 'Filler L2-A', machId: 'M-L2-01' },
    { code: 'MAT-2023', desc: 'Fexofenadine 180mg Tabs', line: 'Line 2', mach: 'Packer L2-B', machId: 'M-L2-02' },
    { code: 'MAT-2024', desc: 'Montelukast 10mg Tablets', line: 'Line 3', mach: 'Assembly L3-A', machId: 'M-L3-01' },
    { code: 'MAT-2025', desc: 'Esomeprazole 40mg Caps', line: 'Line 3', mach: 'Labeler L3-B', machId: 'M-L3-02' },
    { code: 'MAT-2026', desc: 'Rosuvastatin 10mg Tablets', line: 'Line 4', mach: 'Press L4-A', machId: 'M-L4-01' },
    { code: 'MAT-2027', desc: 'Ezetimibe 10mg Tablets', line: 'Line 4', mach: 'Capper L4-B', machId: 'M-L4-02' },
    { code: 'MAT-2028', desc: 'Clopidogrel 75mg Tablets', line: 'Line 5', mach: 'Conveyor L5-A', machId: 'M-L5-01' },
    { code: 'MAT-2029', desc: 'Aspirin EC 100mg Tablets', line: 'Line 5', mach: 'Inspector L5-B', machId: 'M-L5-02' },
    { code: 'MAT-2030', desc: 'Naproxen 500mg Tablets', line: 'Line 1', mach: 'Filler L1-A', machId: 'M-L1-01' },
    { code: 'MAT-2031', desc: 'Diclofenac 75mg Tablets', line: 'Line 2', mach: 'Filler L2-A', machId: 'M-L2-01' },
    { code: 'MAT-2032', desc: 'Celecoxib 200mg Capsules', line: 'Line 3', mach: 'Assembly L3-A', machId: 'M-L3-01' },
    { code: 'MAT-2033', desc: 'Meloxicam 15mg Tablets', line: 'Line 4', mach: 'Press L4-A', machId: 'M-L4-01' },
    { code: 'MAT-2034', desc: 'Piroxicam 20mg Capsules', line: 'Line 5', mach: 'Conveyor L5-A', machId: 'M-L5-01' },
    { code: 'MAT-2035', desc: 'Zolpidem 10mg Tablets', line: 'Line 1', mach: 'Sealer L1-B', machId: 'M-L1-02' },
    { code: 'MAT-2036', desc: 'Alprazolam 0.5mg Tablets', line: 'Line 2', mach: 'Packer L2-B', machId: 'M-L2-02' },
    { code: 'MAT-2037', desc: 'Diazepam 5mg Tablets', line: 'Line 3', mach: 'Labeler L3-B', machId: 'M-L3-02' },
    { code: 'MAT-2038', desc: 'Venlafaxine 75mg Capsules', line: 'Line 4', mach: 'Capper L4-B', machId: 'M-L4-02' },
    { code: 'MAT-2039', desc: 'Duloxetine 60mg Capsules', line: 'Line 5', mach: 'Inspector L5-B', machId: 'M-L5-02' },
    { code: 'MAT-2040', desc: 'Quetiapine 100mg Tablets', line: 'Line 1', mach: 'Filler L1-A', machId: 'M-L1-01' },
  ];

  const statusPool: WorkOrder['lifecycleStatus'][] = [
    'Draft', 'Draft', 'Planned', 'Planned', 'Planned', 'Scheduled', 'Scheduled', 'Scheduled',
    'ReadyForRelease', 'ReadyForRelease', 'Released', 'Released', 'InExecution', 'InExecution',
    'InExecution', 'OnHold', 'OnHold', 'Completed', 'Completed', 'Completed',
    'Closed', 'Closed', 'Cancelled', 'Scheduled', 'Planned', 'ReadyForRelease', 'InExecution',
    'Planned', 'Planned', 'Planned', 'Scheduled', 'Scheduled', 'Released', 'InExecution',
    'OnHold', 'Completed', 'Closed', 'Planned', 'Scheduled', 'Released',
  ];

  return items.map((item, i) => {
    const woId = `WO-${5011 + i}`;
    const status = statusPool[i % statusPool.length];
    const risk: WorkOrder['riskLevel'] = i % 7 === 0 ? 'Critical' : i % 5 === 0 ? 'High' : i % 3 === 0 ? 'Medium' : 'Low';
    const readiness: WorkOrder['readinessStatus'] = risk === 'Critical' ? 'Blocked' : risk === 'High' ? 'Warning' : 'Ready';
    const startOff = (i - 10) * 2;
    const exceptions: WOException[] = (risk === 'Critical' || risk === 'High')
      ? [exc(woId, i % 2 === 0 ? 'Material' : 'Labor', risk, `Production at risk`, 'Potential delay of 4-8h', 'planner.smith')]
      : [];
    const aiRecs: WOAIRecommendation[] = risk !== 'Low'
      ? [aiRec(woId, `Risk detected for ${item.desc}. Review before scheduled start.`, 'Review readiness and resolve blockers')]
      : [];
    const isExecuting = status === 'InExecution' || status === 'Completed';
    return {
      woId, materialCode: item.code, materialDescription: item.desc,
      batch: `B-2026-${String(11 + i).padStart(3, '0')}`,
      line: item.line, machine: item.mach, machineId: item.machId,
      lifecycleStatus: status, readinessStatus: readiness,
      releaseStatus: isExecuting || status === 'Closed' ? 'Released' : readiness === 'Blocked' ? 'ReleaseBlocked' : 'NotReleased',
      qualityStatus: readiness === 'Blocked' && i % 4 === 0 ? 'OnHold' : 'Released',
      riskLevel: risk,
      scheduledStart: d(startOff), scheduledEnd: d(startOff + 8),
      actualStart: isExecuting ? d(startOff + 0.25) : undefined,
      actualEnd: status === 'Completed' ? d(startOff + 8.5) : undefined,
      plannedQty: (i + 1) * 1000 + 500,
      completedQty: status === 'InExecution' ? Math.floor((i + 1) * 500) : status === 'Completed' ? (i + 1) * 1000 + 480 : 0,
      scrapQty: isExecuting ? i * 3 : 0,
      progressPct: status === 'InExecution' ? Math.min(95, (i + 1) * 5) : status === 'Completed' ? 100 : 0,
      uom: 'UNITS',
      currentBlocker: readiness === 'Blocked' ? `${exceptions[0]?.type ?? 'Unknown'} issue blocking release` : undefined,
      owner: i % 3 === 0 ? 'planner.jones' : i % 3 === 1 ? 'planner.smith' : 'operator.carlos',
      sourceSystem: i % 2 === 0 ? 'ERP' : 'MES',
      sourceTimestamp: d(-(i % 6)),
      dataFreshness: i % 5 === 0 ? 'VeryStale' : i % 3 === 0 ? 'Stale' : 'Fresh',
      dataFreshnessHours: i % 5 === 0 ? 24 : i % 3 === 0 ? 8 : 1,
      aiRiskScore: risk === 'Critical' ? 85 + (i % 10) : risk === 'High' ? 65 + (i % 20) : risk === 'Medium' ? 40 + (i % 20) : 10 + (i % 20),
      aiRecommendation: aiRecs[0]?.text,
      sterilizationRequired: i % 8 === 0,
      shift: i % 3 === 0 ? 'Morning' : i % 3 === 1 ? 'Afternoon' : 'Night',
      readinessChecks: readiness === 'Blocked' ? blockedChecks() : readiness === 'Warning' ? warnChecks() : readyChecks(),
      materials: [mat(`${item.code}-A`, item.desc, (i + 1) * 100 + 50, (i + 1) * 100 + (readiness === 'Blocked' ? -20 : 60))],
      quality: { status: readiness === 'Blocked' && i % 4 === 0 ? 'OnHold' : 'Released', inspections: 2, deviations: readiness === 'Blocked' ? 1 : 0, holds: readiness === 'Blocked' && i % 4 === 0 ? 1 : 0, releaseConfidence: readiness === 'Ready' ? 96 : readiness === 'Warning' ? 75 : 35 },
      sterilization: i % 8 === 0 ? { required: true, readiness: readiness === 'Blocked' ? 'Blocked' : 'Ready', slotStatus: readiness === 'Blocked' ? 'Pending' : 'Confirmed', vendorCapacity: 'Available', internalCapacity: 'Available', riskLevel: readiness === 'Blocked' ? 'High' : 'Low', dwellDeadline: d(startOff + 4) } : undefined,
      exceptions, aiRecommendations: aiRecs,
      auditEvents: [aud(woId, 'Created', i % 2 === 0 ? 'planner.smith' : 'planner.jones')],
      bluAiHistory: bluHistory(woId, `I am ready to help with ${woId}. Ask about readiness, blockers, materials, schedule, or the next action.`),
      currentOperation: status === 'InExecution' ? `Operation ${i % 4 + 1} of 4` : undefined,
    } as WorkOrder;
  });
}

export const WORK_ORDERS: WorkOrder[] = [...HAND_CRAFTED, ...generateBulk()];

export function computeWOSummary(wos: WorkOrder[]): WOSummary {
  return {
    total: wos.length,
    draft: wos.filter(w => w.lifecycleStatus === 'Draft').length,
    planned: wos.filter(w => w.lifecycleStatus === 'Planned').length,
    scheduled: wos.filter(w => w.lifecycleStatus === 'Scheduled').length,
    readyForRelease: wos.filter(w => w.lifecycleStatus === 'ReadyForRelease').length,
    released: wos.filter(w => w.lifecycleStatus === 'Released').length,
    inExecution: wos.filter(w => w.lifecycleStatus === 'InExecution').length,
    onHold: wos.filter(w => w.lifecycleStatus === 'OnHold').length,
    completed: wos.filter(w => w.lifecycleStatus === 'Completed').length,
    closed: wos.filter(w => w.lifecycleStatus === 'Closed').length,
    cancelled: wos.filter(w => w.lifecycleStatus === 'Cancelled').length,
    blocked: wos.filter(w => w.readinessStatus === 'Blocked').length,
    critical: wos.filter(w => w.riskLevel === 'Critical').length,
    staleData: wos.filter(w => w.dataFreshness !== 'Fresh').length,
    withExceptions: wos.filter(w => w.exceptions.length > 0).length,
  };
}

export const SAVED_VIEWS: WOSavedView[] = [
  { id: 'all', label: 'All WOs', filters: {} },
  { id: 'todays-releases', label: "Today's Releases", filters: { lifecycleStatus: ['ReadyForRelease', 'Released'] } },
  { id: 'blocked', label: 'Blocked WOs', filters: { readinessStatus: ['Blocked'] } },
  { id: 'on-hold', label: 'On Hold', filters: { lifecycleStatus: ['OnHold'] } },
  { id: 'high-risk', label: 'High Risk', filters: { riskLevel: ['High', 'Critical'] } },
  { id: 'in-execution', label: 'In Execution', filters: { lifecycleStatus: ['InExecution'] } },
];

export const BATCH_SAMPLE_ROWS: BatchCreateRow[] = [
  { rowIndex: 1, woId: 'WO-6001', materialCode: 'MAT-3001', materialDescription: 'Amoxicillin 250mg', batch: 'B-2026-101', line: 'Line 1', machine: 'Filler L1-A', scheduledStart: d(24), scheduledEnd: d(32), plannedQty: 5000, uom: 'UNITS', status: 'Valid', errors: [], warnings: [] },
  { rowIndex: 2, woId: 'WO-6002', materialCode: 'MAT-3002', materialDescription: 'Paracetamol 1000mg', batch: 'B-2026-102', line: 'Line 2', machine: 'Filler L2-A', scheduledStart: d(26), scheduledEnd: d(34), plannedQty: 8000, uom: 'UNITS', status: 'Valid', errors: [], warnings: [] },
  { rowIndex: 3, woId: '', materialCode: 'MAT-3003', materialDescription: 'Ibuprofen 600mg', batch: 'B-2026-103', line: 'Line 3', machine: 'Assembly L3-A', scheduledStart: d(28), scheduledEnd: d(36), plannedQty: 6000, uom: 'UNITS', status: 'Error', errors: ['WO ID is required'], warnings: [] },
  { rowIndex: 4, woId: 'WO-6004', materialCode: 'MAT-3004', materialDescription: 'Metformin 500mg', batch: '', line: 'Line 4', machine: 'Press L4-A', scheduledStart: d(30), scheduledEnd: d(38), plannedQty: 10000, uom: 'UNITS', status: 'Error', errors: ['Batch number is required'], warnings: [] },
  { rowIndex: 5, woId: 'WO-6005', materialCode: 'MAT-4821', materialDescription: 'Atorvastatin 20mg', batch: 'B-2026-105', line: 'Line 5', machine: 'Conveyor L5-A', scheduledStart: d(32), scheduledEnd: d(40), plannedQty: 4000, uom: 'UNITS', status: 'Warning', errors: [], warnings: ['Material MAT-4821 has active shortage – verify availability before creation'] },
  { rowIndex: 6, woId: 'WO-6006', materialCode: 'MAT-3006', materialDescription: 'Losartan 100mg', batch: 'B-2026-106', line: 'Line 1', machine: 'Sealer L1-B', scheduledStart: d(34), scheduledEnd: d(42), plannedQty: 7000, uom: 'UNITS', status: 'Valid', errors: [], warnings: [] },
  { rowIndex: 7, woId: 'WO-6007', materialCode: 'MAT-1008', materialDescription: 'Insulin Glargine', batch: 'B-2026-107', line: 'Line 4', machine: 'Capper L4-B', scheduledStart: d(36), scheduledEnd: d(44), plannedQty: 0, uom: 'VIALS', status: 'Error', errors: ['Planned quantity must be greater than zero'], warnings: ['Sterilization required – confirm slot availability'] },
];
