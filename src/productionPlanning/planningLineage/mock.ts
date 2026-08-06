import type {LineageChain, LineageDemandGroup, LineageFilterState, LineageNode, LineageStageConfig} from './types';

// ─── Stage definitions ────────────────────────────────────────────────────────

export const LINEAGE_STAGES: LineageStageConfig[] = [
  {id: 'demand',                 label: 'Demand',                   shortLabel: 'Demand',     widthPx: 200},
  {id: 'mps',                    label: 'MPS',                      shortLabel: 'MPS',        widthPx: 200},
  {id: 'mrp',                    label: 'MRP',                      shortLabel: 'MRP',        widthPx: 200},
  {id: 'planned-order',          label: 'Planned Order',            shortLabel: 'Plan. Ord',  widthPx: 200},
  {id: 'production-order',       label: 'Production Order / WO',    shortLabel: 'Prod. Order',widthPx: 220},
  {id: 'schedule',               label: 'Schedule',                 shortLabel: 'Schedule',   widthPx: 200},
  {id: 'wo-release',             label: 'WO Release',               shortLabel: 'WO Release', widthPx: 200},
  {id: 'execution',              label: 'Execution / Confirmations',shortLabel: 'Execution',  widthPx: 210},
  {id: 'batch-produced',         label: 'Batch Produced',           shortLabel: 'Batch',      widthPx: 200},
  {id: 'material-lot-genealogy', label: 'Material Lot Genealogy',   shortLabel: 'Mat. Lot',   widthPx: 220},
  {id: 'ipc-quality',            label: 'IPC / Quality Inspections',shortLabel: 'IPC / QA',   widthPx: 210},
  {id: 'deviations',             label: 'Deviations / QNs / Holds', shortLabel: 'Deviations', widthPx: 210},
  {id: 'sterilization',          label: 'Sterilization',            shortLabel: 'Steril.',    widthPx: 180},
  {id: 'dhr-documentation',      label: 'DHR / Documentation',      shortLabel: 'DHR / Docs', widthPx: 200},
  {id: 'batch-release-decision', label: 'Batch Release Decision',   shortLabel: 'Release',    widthPx: 200},
  {id: 'final-disposition',      label: 'Final Disposition / Audit',shortLabel: 'Disposition',widthPx: 210},
];

// ─── Demand A ─────────────────────────────────────────────────────────────────
// 6 chains (wo1–wo6). wo3 and wo5 skip sterilization (deviations → DHR directly).

const sharedA_demand: LineageNode = {
  id: 'a-demand', stageId: 'demand',
  label: 'Demand A-2026-05', sublabel: '28 Apr 2026',
  quantity: '120,000,000', status: 'approved', statusLabel: 'On Track',
  metaLine1: 'Product A | Line 2', metaLine2: 'Market: EMEA',
  sharedAcrossChains: true,
  linkedVersionId: 'FCT-2025-06-002', linkedPageId: 'twelve-month-plan',
};

const sharedA_mpsR3: LineageNode = {
  id: 'a-mps-r3', stageId: 'mps',
  label: 'MPS May-2026 (R3)', sublabel: '02 May 2026',
  quantity: '119,500,000', status: 'approved', statusLabel: 'Baseline',
  metaLine1: 'Approved Baseline', metaLine2: 'Rev 3',
  sharedAcrossChains: true, parentNodeId: 'a-demand',
  linkedVersionId: 'MPS-2025-06-001', linkedPageId: 'monthly-mps',
};

const sharedA_mrpV3: LineageNode = {
  id: 'a-mrp-v3', stageId: 'mrp',
  label: 'MRP 2026-05-10 (v3)', sublabel: '10 May 2026',
  quantity: '119,200,000', status: 'approved', statusLabel: 'Approved',
  metaLine1: 'No shortages', metaLine2: 'v3 Official',
  sharedAcrossChains: true, parentNodeId: 'a-mps-r3',
  linkedVersionId: 'MRP-2026-05-V3', linkedPageId: 'mrp',
};

// Individual planned order nodes — 1:1 with each Production Order / WO
const nodeA_pln1: LineageNode = {id: 'a-planned-order-1', stageId: 'planned-order', label: 'PLN-A-001', sublabel: '11 May 2026', metaLine1: '20,000,000 PCS', metaLine2: 'From MRP-v3', status: 'approved', statusLabel: 'Approved', parentNodeId: 'a-mrp-v3', linkedVersionId: 'PLN-A-001', linkedPageId: 'mrp'};
const nodeA_pln2: LineageNode = {id: 'a-planned-order-2', stageId: 'planned-order', label: 'PLN-A-002', sublabel: '11 May 2026', metaLine1: '20,000,000 PCS', metaLine2: 'From MRP-v3', status: 'approved', statusLabel: 'Approved', parentNodeId: 'a-mrp-v3', linkedVersionId: 'PLN-A-002', linkedPageId: 'mrp'};
const nodeA_pln3: LineageNode = {id: 'a-planned-order-3', stageId: 'planned-order', label: 'PLN-A-003', sublabel: '11 May 2026', metaLine1: '20,000,000 PCS', metaLine2: 'From MRP-v3', status: 'approved', statusLabel: 'Approved', parentNodeId: 'a-mrp-v3', linkedVersionId: 'PLN-A-003', linkedPageId: 'mrp'};
const nodeA_pln4: LineageNode = {id: 'a-planned-order-4', stageId: 'planned-order', label: 'PLN-A-004', sublabel: '11 May 2026', metaLine1: '20,000,000 PCS', metaLine2: 'From MRP-v3', status: 'approved', statusLabel: 'Approved', parentNodeId: 'a-mrp-v3', linkedVersionId: 'PLN-A-004', linkedPageId: 'mrp'};
const nodeA_pln5: LineageNode = {id: 'a-planned-order-5', stageId: 'planned-order', label: 'PLN-A-005', sublabel: '11 May 2026', metaLine1: '19,600,000 PCS', metaLine2: 'From MRP-v3', status: 'approved', statusLabel: 'Approved', parentNodeId: 'a-mrp-v3', linkedVersionId: 'PLN-A-005', linkedPageId: 'mrp'};
const nodeA_pln6: LineageNode = {id: 'a-planned-order-6', stageId: 'planned-order', label: 'PLN-A-006', sublabel: '11 May 2026', metaLine1: '19,600,000 PCS', metaLine2: 'From MRP-v3', status: 'approved', statusLabel: 'Approved', parentNodeId: 'a-mrp-v3', linkedVersionId: 'PLN-A-006', linkedPageId: 'mrp'};

const sharedA_schedule: LineageNode = {
  id: 'a-schedule', stageId: 'schedule',
  label: 'Sched May-2026 (v3)', sublabel: '11 May 2026',
  metaLine1: '6 orders | Line 2', metaLine2: 'No conflicts',
  status: 'approved', statusLabel: 'Approved',
  sharedAcrossChains: true, parentNodeId: 'a-planned-order-1',
  linkedVersionId: 'SCHED-2026-05-V3', linkedPageId: 'schedule-versions',
};

// Production order nodes
const nodeA_po1: LineageNode = {id: 'a-po-1', stageId: 'production-order', label: 'PO-A-001 / WO-A-001', sublabel: '20,000,000 PCS', metaLine1: 'Line 2 | M-01', metaLine2: 'Batch: B260512-A01', status: 'approved', statusLabel: 'Completed', parentNodeId: 'a-schedule', linkedPageId: 'work-orders'};
const nodeA_po2: LineageNode = {id: 'a-po-2', stageId: 'production-order', label: 'PO-A-002 / WO-A-002', sublabel: '20,000,000 PCS', metaLine1: 'Line 2 | M-02', metaLine2: 'Batch: B260512-A02', status: 'approved', statusLabel: 'Completed', parentNodeId: 'a-schedule', linkedPageId: 'work-orders'};
const nodeA_po3: LineageNode = {id: 'a-po-3', stageId: 'production-order', label: 'PO-A-003 / WO-A-003', sublabel: '20,000,000 PCS', metaLine1: 'Line 2 | M-03', metaLine2: 'Batch: B260513-A03', status: 'approved', statusLabel: 'Completed', parentNodeId: 'a-schedule', linkedPageId: 'work-orders'};
const nodeA_po4: LineageNode = {id: 'a-po-4', stageId: 'production-order', label: 'PO-A-004 / WO-A-004', sublabel: '20,000,000 PCS', metaLine1: 'Line 2 | M-04', metaLine2: 'Batch: B260514-A04', status: 'approved', statusLabel: 'Completed', parentNodeId: 'a-schedule', linkedPageId: 'work-orders'};
const nodeA_po5: LineageNode = {id: 'a-po-5', stageId: 'production-order', label: 'PO-A-005 / WO-A-005', sublabel: '19,600,000 PCS', metaLine1: 'Line 2 | M-05', metaLine2: 'Batch: B260515-A05', status: 'approved', statusLabel: 'Completed', parentNodeId: 'a-schedule', linkedPageId: 'work-orders'};
const nodeA_po6: LineageNode = {id: 'a-po-6', stageId: 'production-order', label: 'PO-A-006 / WO-A-006', sublabel: '19,600,000 PCS', metaLine1: 'Line 2 | M-06', metaLine2: 'Batch: B260515-A06', status: 'approved', statusLabel: 'Completed', parentNodeId: 'a-schedule', linkedPageId: 'work-orders'};

// WO Release nodes
const nodeA_wor1: LineageNode = {id: 'a-wor-1', stageId: 'wo-release', label: 'WOR-A-001', sublabel: '11 May 2026', metaLine1: 'Materials ✓ | Machine ✓', metaLine2: 'QA ✓ | Docs ✓', status: 'released', statusLabel: 'Released', parentNodeId: 'a-po-1', linkedPageId: 'work-orders'};
const nodeA_wor2: LineageNode = {id: 'a-wor-2', stageId: 'wo-release', label: 'WOR-A-002', sublabel: '11 May 2026', metaLine1: 'Materials ✓ | Machine ✓', metaLine2: 'QA ✓ | Docs ✓', status: 'released', statusLabel: 'Released', parentNodeId: 'a-po-2', linkedPageId: 'work-orders'};
const nodeA_wor3: LineageNode = {id: 'a-wor-3', stageId: 'wo-release', label: 'WOR-A-003', sublabel: '12 May 2026', metaLine1: 'Materials ✓ | Machine ✓', metaLine2: 'QA ✓ | Docs ✓', status: 'released', statusLabel: 'Released', parentNodeId: 'a-po-3', linkedPageId: 'work-orders'};
const nodeA_wor4: LineageNode = {id: 'a-wor-4', stageId: 'wo-release', label: 'WOR-A-004', sublabel: '12 May 2026', metaLine1: 'Materials ✓ | Machine ✓', metaLine2: 'QA ✓ | Docs ✓', status: 'released', statusLabel: 'Released', parentNodeId: 'a-po-4', linkedPageId: 'work-orders'};
const nodeA_wor5: LineageNode = {id: 'a-wor-5', stageId: 'wo-release', label: 'WOR-A-005', sublabel: '13 May 2026', metaLine1: 'Materials ✓ | Machine ✓', metaLine2: 'QA ✓ | Docs ✓', status: 'released', statusLabel: 'Released', parentNodeId: 'a-po-5', linkedPageId: 'work-orders'};
const nodeA_wor6: LineageNode = {id: 'a-wor-6', stageId: 'wo-release', label: 'WOR-A-006', sublabel: '13 May 2026', metaLine1: 'Materials ✓ | Machine ✓', metaLine2: 'QA ✓ | Docs ✓', status: 'released', statusLabel: 'Released', parentNodeId: 'a-po-6', linkedPageId: 'work-orders'};

// Execution nodes
const nodeA_exec1: LineageNode = {id: 'a-exec-1', stageId: 'execution', label: 'EXEC-A-001', sublabel: '12 May 2026', quantity: '19,800,000 PCS', metaLine1: 'Scrap: 200,000 PCS', metaLine2: 'Op: John D. | Confirmed', status: 'approved', statusLabel: 'Completed', parentNodeId: 'a-wor-1', linkedPageId: 'work-orders'};
const nodeA_exec2: LineageNode = {id: 'a-exec-2', stageId: 'execution', label: 'EXEC-A-002', sublabel: '12 May 2026', quantity: '19,850,000 PCS', metaLine1: 'Scrap: 150,000 PCS', metaLine2: 'Op: Maria S. | Confirmed', status: 'approved', statusLabel: 'Completed', parentNodeId: 'a-wor-2', linkedPageId: 'work-orders'};
const nodeA_exec3: LineageNode = {id: 'a-exec-3', stageId: 'execution', label: 'EXEC-A-003', sublabel: '13 May 2026', quantity: '19,600,000 PCS', metaLine1: 'Scrap: 400,000 PCS', metaLine2: 'Op: Carlos M. | Confirmed', status: 'approved', statusLabel: 'Completed', parentNodeId: 'a-wor-3', linkedPageId: 'work-orders'};
const nodeA_exec4: LineageNode = {id: 'a-exec-4', stageId: 'execution', label: 'EXEC-A-004', sublabel: '15 May 2026', quantity: '19,900,000 PCS', metaLine1: 'Scrap: 100,000 PCS', metaLine2: 'Op: Ana P. | Confirmed', status: 'approved', statusLabel: 'Completed', parentNodeId: 'a-wor-4', linkedPageId: 'work-orders'};
const nodeA_exec5: LineageNode = {id: 'a-exec-5', stageId: 'execution', label: 'EXEC-A-005', sublabel: '15 May 2026', quantity: '19,400,000 PCS', metaLine1: 'Scrap: 200,000 PCS', metaLine2: 'Op: R. Ferreira | Confirmed', status: 'approved', statusLabel: 'Completed', parentNodeId: 'a-wor-5', linkedPageId: 'work-orders'};
const nodeA_exec6: LineageNode = {id: 'a-exec-6', stageId: 'execution', label: 'EXEC-A-006', sublabel: '15 May 2026', quantity: '19,300,000 PCS', metaLine1: 'Scrap: 300,000 PCS', metaLine2: 'Op: F. Silva | Confirmed', status: 'approved', statusLabel: 'Completed', parentNodeId: 'a-wor-6', linkedPageId: 'work-orders'};

// Batch produced nodes
const nodeA_bp1: LineageNode = {id: 'a-bp-1', stageId: 'batch-produced', label: 'Batch B260512-A01', sublabel: '12 May 2026', quantity: '19,800,000 PCS', metaLine1: 'Exp: 12 May 2028', metaLine2: 'WO: WO-A-001', status: 'approved', statusLabel: 'Completed', parentNodeId: 'a-exec-1', linkedPageId: 'batch-release'};
const nodeA_bp2: LineageNode = {id: 'a-bp-2', stageId: 'batch-produced', label: 'Batch B260512-A02', sublabel: '12 May 2026', quantity: '19,850,000 PCS', metaLine1: 'Exp: 12 May 2028', metaLine2: 'WO: WO-A-002', status: 'approved', statusLabel: 'Completed', parentNodeId: 'a-exec-2', linkedPageId: 'batch-release'};
const nodeA_bp3: LineageNode = {id: 'a-bp-3', stageId: 'batch-produced', label: 'Batch B260513-A03', sublabel: '13 May 2026', quantity: '19,600,000 PCS', metaLine1: 'Exp: 13 May 2028', metaLine2: 'WO: WO-A-003', status: 'approved', statusLabel: 'Completed', parentNodeId: 'a-exec-3', linkedPageId: 'batch-release'};
const nodeA_bp4: LineageNode = {id: 'a-bp-4', stageId: 'batch-produced', label: 'Batch B260515-A04', sublabel: '15 May 2026', quantity: '19,900,000 PCS', metaLine1: 'Exp: 15 May 2028', metaLine2: 'WO: WO-A-004', status: 'approved', statusLabel: 'Completed', parentNodeId: 'a-exec-4', linkedPageId: 'batch-release'};
const nodeA_bp5: LineageNode = {id: 'a-bp-5', stageId: 'batch-produced', label: 'Batch B260515-A05', sublabel: '15 May 2026', quantity: '19,400,000 PCS', metaLine1: 'Exp: 15 May 2028', metaLine2: 'WO: WO-A-005', status: 'approved', statusLabel: 'Completed', parentNodeId: 'a-exec-5', linkedPageId: 'batch-release'};
const nodeA_bp6: LineageNode = {id: 'a-bp-6', stageId: 'batch-produced', label: 'Batch B260515-A06', sublabel: '15 May 2026', quantity: '19,300,000 PCS', metaLine1: 'Exp: 15 May 2028', metaLine2: 'WO: WO-A-006', status: 'approved', statusLabel: 'Completed', parentNodeId: 'a-exec-6', linkedPageId: 'batch-release'};

// Material lot genealogy nodes
const nodeA_mat1: LineageNode = {id: 'a-mat-1', stageId: 'material-lot-genealogy', label: 'MAT-GENE-A01', sublabel: '12 May 2026', metaLine1: '4 components consumed', metaLine2: 'BOM v3.2 | No substitutions', status: 'approved', statusLabel: 'Approved', parentNodeId: 'a-bp-1', linkedPageId: 'batch-release'};
const nodeA_mat2: LineageNode = {id: 'a-mat-2', stageId: 'material-lot-genealogy', label: 'MAT-GENE-A02', sublabel: '12 May 2026', metaLine1: '4 components consumed', metaLine2: 'BOM v3.2 | No substitutions', status: 'approved', statusLabel: 'Approved', parentNodeId: 'a-bp-2', linkedPageId: 'batch-release'};
const nodeA_mat3: LineageNode = {id: 'a-mat-3', stageId: 'material-lot-genealogy', label: 'MAT-GENE-A03', sublabel: '13 May 2026', metaLine1: '4 components consumed', metaLine2: 'BOM v3.2 | Partial sub.', status: 'warning', statusLabel: 'Substitution', parentNodeId: 'a-bp-3', linkedPageId: 'batch-release'};
const nodeA_mat4: LineageNode = {id: 'a-mat-4', stageId: 'material-lot-genealogy', label: 'MAT-GENE-A04', sublabel: '15 May 2026', metaLine1: '4 components consumed', metaLine2: 'BOM v3.2 | No substitutions', status: 'approved', statusLabel: 'Approved', parentNodeId: 'a-bp-4', linkedPageId: 'batch-release'};
const nodeA_mat5: LineageNode = {id: 'a-mat-5', stageId: 'material-lot-genealogy', label: 'MAT-GENE-A05', sublabel: '15 May 2026', metaLine1: '4 components consumed', metaLine2: 'BOM v3.2 | No substitutions', status: 'approved', statusLabel: 'Approved', parentNodeId: 'a-bp-5', linkedPageId: 'batch-release'};
const nodeA_mat6: LineageNode = {id: 'a-mat-6', stageId: 'material-lot-genealogy', label: 'MAT-GENE-A06', sublabel: '15 May 2026', metaLine1: '4 components consumed', metaLine2: 'BOM v3.2 | No substitutions', status: 'approved', statusLabel: 'Approved', parentNodeId: 'a-bp-6', linkedPageId: 'batch-release'};

// IPC / Quality nodes
const nodeA_ipc1: LineageNode = {id: 'a-ipc-1', stageId: 'ipc-quality', label: 'IPC-A-001', sublabel: '12 May 2026', metaLine1: 'All checkpoints: PASS', metaLine2: 'Inspector: L. Ribeiro', status: 'approved', statusLabel: 'Passed', parentNodeId: 'a-mat-1', linkedPageId: 'quality-inspections'};
const nodeA_ipc2: LineageNode = {id: 'a-ipc-2', stageId: 'ipc-quality', label: 'IPC-A-002', sublabel: '12 May 2026', metaLine1: 'All checkpoints: PASS', metaLine2: 'Inspector: L. Ribeiro', status: 'approved', statusLabel: 'Passed', parentNodeId: 'a-mat-2', linkedPageId: 'quality-inspections'};
const nodeA_ipc3: LineageNode = {id: 'a-ipc-3', stageId: 'ipc-quality', label: 'IPC-A-003', sublabel: '13 May 2026', metaLine1: 'All checkpoints: PASS', metaLine2: 'Inspector: T. Costa', status: 'approved', statusLabel: 'Passed', parentNodeId: 'a-mat-3', linkedPageId: 'quality-inspections'};
const nodeA_ipc4: LineageNode = {id: 'a-ipc-4', stageId: 'ipc-quality', label: 'IPC-A-004', sublabel: '15 May 2026', metaLine1: 'All checkpoints: PASS', metaLine2: 'Inspector: L. Ribeiro', status: 'approved', statusLabel: 'Passed', parentNodeId: 'a-mat-4', linkedPageId: 'quality-inspections'};
const nodeA_ipc5: LineageNode = {id: 'a-ipc-5', stageId: 'ipc-quality', label: 'IPC-A-005', sublabel: '15 May 2026', metaLine1: 'All checkpoints: PASS', metaLine2: 'Inspector: T. Costa', status: 'approved', statusLabel: 'Passed', parentNodeId: 'a-mat-5', linkedPageId: 'quality-inspections'};
const nodeA_ipc6: LineageNode = {id: 'a-ipc-6', stageId: 'ipc-quality', label: 'IPC-A-006', sublabel: '15 May 2026', metaLine1: 'All checkpoints: PASS', metaLine2: 'Inspector: L. Ribeiro', status: 'approved', statusLabel: 'Passed', parentNodeId: 'a-mat-6', linkedPageId: 'quality-inspections'};

// Deviation nodes
const nodeA_dev1: LineageNode = {id: 'a-dev-1', stageId: 'deviations', label: 'DEV-A-001', sublabel: '12 May 2026', metaLine1: 'No open deviations', metaLine2: 'QN: 0 | Hold: None', status: 'approved', statusLabel: 'Clear', parentNodeId: 'a-ipc-1', linkedPageId: 'quality-inspections'};
const nodeA_dev2: LineageNode = {id: 'a-dev-2', stageId: 'deviations', label: 'DEV-A-002', sublabel: '12 May 2026', metaLine1: 'No open deviations', metaLine2: 'QN: 0 | Hold: None', status: 'approved', statusLabel: 'Clear', parentNodeId: 'a-ipc-2', linkedPageId: 'quality-inspections'};
const nodeA_dev3: LineageNode = {id: 'a-dev-3', stageId: 'deviations', label: 'DEV-A-003', sublabel: '13 May 2026', metaLine1: '1 deviation — closed', metaLine2: 'QN-2026-0517 | Resolved', status: 'approved', statusLabel: 'Resolved', parentNodeId: 'a-ipc-3', linkedPageId: 'quality-inspections'};
const nodeA_dev4: LineageNode = {id: 'a-dev-4', stageId: 'deviations', label: 'DEV-A-004', sublabel: '15 May 2026', metaLine1: 'No open deviations', metaLine2: 'QN: 0 | Hold: None', status: 'approved', statusLabel: 'Clear', parentNodeId: 'a-ipc-4'};
const nodeA_dev5: LineageNode = {id: 'a-dev-5', stageId: 'deviations', label: 'DEV-A-005', sublabel: '15 May 2026', metaLine1: 'No open deviations', metaLine2: 'QN: 0 | Hold: None', status: 'approved', statusLabel: 'Clear', parentNodeId: 'a-ipc-5'};
const nodeA_dev6: LineageNode = {id: 'a-dev-6', stageId: 'deviations', label: 'DEV-A-006', sublabel: '15 May 2026', metaLine1: 'No open deviations', metaLine2: 'QN: 0 | Hold: None', status: 'approved', statusLabel: 'Clear', parentNodeId: 'a-ipc-6'};

// Sterilization nodes (wo1, wo2, wo4, wo6 only — wo3 and wo5 skip sterilization)
const nodeA_ster1: LineageNode = {id: 'a-ster-1', stageId: 'sterilization', label: 'STER-A-001', sublabel: '14 May 2026', metaLine1: 'EO | Load: LD-0512-A', metaLine2: 'Cycle: SC-1244', status: 'released', statusLabel: 'Completed', parentNodeId: 'a-dev-1', linkedPageId: 'sterilization'};
const nodeA_ster2: LineageNode = {id: 'a-ster-2', stageId: 'sterilization', label: 'STER-A-002', sublabel: '14 May 2026', metaLine1: 'EO | Load: LD-0512-B', metaLine2: 'Cycle: SC-1245', status: 'released', statusLabel: 'Completed', parentNodeId: 'a-dev-2', linkedPageId: 'sterilization'};
const nodeA_ster4: LineageNode = {id: 'a-ster-4', stageId: 'sterilization', label: 'STER-A-004', sublabel: '16 May 2026', metaLine1: 'EO | Load: LD-0515-A', metaLine2: 'Cycle: SC-1247', status: 'released', statusLabel: 'Completed', parentNodeId: 'a-dev-4', linkedPageId: 'sterilization'};
const nodeA_ster6: LineageNode = {id: 'a-ster-6', stageId: 'sterilization', label: 'STER-A-006', sublabel: '17 May 2026', metaLine1: 'EO | Load: LD-0515-B', metaLine2: 'Cycle: SC-1248', status: 'released', statusLabel: 'Completed', parentNodeId: 'a-dev-6', linkedPageId: 'sterilization'};

// DHR nodes (wo3 and wo5: parent is deviations node, bypassing sterilization)
const nodeA_dhr1: LineageNode = {id: 'a-dhr-1', stageId: 'dhr-documentation', label: 'DHR-A-001', sublabel: '15 May 2026', metaLine1: 'All docs complete', metaLine2: 'Reviewer: P. Gomes', status: 'approved', statusLabel: 'Complete', parentNodeId: 'a-ster-1', linkedPageId: 'batch-release'};
const nodeA_dhr2: LineageNode = {id: 'a-dhr-2', stageId: 'dhr-documentation', label: 'DHR-A-002', sublabel: '15 May 2026', metaLine1: 'All docs complete', metaLine2: 'Reviewer: P. Gomes', status: 'approved', statusLabel: 'Complete', parentNodeId: 'a-ster-2', linkedPageId: 'batch-release'};
const nodeA_dhr3: LineageNode = {id: 'a-dhr-3', stageId: 'dhr-documentation', label: 'DHR-A-003', sublabel: '16 May 2026', metaLine1: 'All docs complete', metaLine2: 'Reviewer: Q. Santos', status: 'approved', statusLabel: 'Complete', parentNodeId: 'a-dev-3', linkedPageId: 'batch-release'};
const nodeA_dhr4: LineageNode = {id: 'a-dhr-4', stageId: 'dhr-documentation', label: 'DHR-A-004', sublabel: '17 May 2026', metaLine1: 'All docs complete', metaLine2: 'Reviewer: P. Gomes', status: 'approved', statusLabel: 'Complete', parentNodeId: 'a-ster-4', linkedPageId: 'batch-release'};
const nodeA_dhr5: LineageNode = {id: 'a-dhr-5', stageId: 'dhr-documentation', label: 'DHR-A-005', sublabel: '17 May 2026', metaLine1: 'All docs complete', metaLine2: 'Reviewer: P. Gomes', status: 'approved', statusLabel: 'Complete', parentNodeId: 'a-dev-5', linkedPageId: 'batch-release'};
const nodeA_dhr6: LineageNode = {id: 'a-dhr-6', stageId: 'dhr-documentation', label: 'DHR-A-006', sublabel: '18 May 2026', metaLine1: 'All docs complete', metaLine2: 'Reviewer: P. Gomes', status: 'approved', statusLabel: 'Complete', parentNodeId: 'a-ster-6', linkedPageId: 'batch-release'};

// Batch release decision nodes
const nodeA_rel1: LineageNode = {id: 'a-rel-1', stageId: 'batch-release-decision', label: 'REL-A-001', sublabel: '16 May 2026', metaLine1: 'Approver: Dr. C. Alves', metaLine2: 'Decision: Released', status: 'released', statusLabel: 'Released', parentNodeId: 'a-dhr-1', linkedPageId: 'batch-release'};
const nodeA_rel2: LineageNode = {id: 'a-rel-2', stageId: 'batch-release-decision', label: 'REL-A-002', sublabel: '16 May 2026', metaLine1: 'Approver: Dr. C. Alves', metaLine2: 'Decision: Released', status: 'released', statusLabel: 'Released', parentNodeId: 'a-dhr-2', linkedPageId: 'batch-release'};
const nodeA_rel3: LineageNode = {id: 'a-rel-3', stageId: 'batch-release-decision', label: 'REL-A-003', sublabel: '17 May 2026', metaLine1: 'Approver: Dr. C. Alves', metaLine2: 'Decision: Released', status: 'released', statusLabel: 'Released', parentNodeId: 'a-dhr-3', linkedPageId: 'batch-release'};
const nodeA_rel4: LineageNode = {id: 'a-rel-4', stageId: 'batch-release-decision', label: 'REL-A-004', sublabel: '18 May 2026', metaLine1: 'Approver: Dr. C. Alves', metaLine2: 'Decision: Released', status: 'released', statusLabel: 'Released', parentNodeId: 'a-dhr-4', linkedPageId: 'batch-release'};
const nodeA_rel5: LineageNode = {id: 'a-rel-5', stageId: 'batch-release-decision', label: 'REL-A-005', sublabel: '18 May 2026', metaLine1: 'Approver: Dr. C. Alves', metaLine2: 'Decision: Released', status: 'released', statusLabel: 'Released', parentNodeId: 'a-dhr-5', linkedPageId: 'batch-release'};
const nodeA_rel6: LineageNode = {id: 'a-rel-6', stageId: 'batch-release-decision', label: 'REL-A-006', sublabel: '19 May 2026', metaLine1: 'Approver: Dr. C. Alves', metaLine2: 'Decision: Released', status: 'released', statusLabel: 'Released', parentNodeId: 'a-dhr-6', linkedPageId: 'batch-release'};

// Final disposition nodes
const nodeA_fin1: LineageNode = {id: 'a-fin-1', stageId: 'final-disposition', label: 'DISP-A-001', sublabel: '17 May 2026', metaLine1: 'Released to Inventory', metaLine2: 'Audit: 12 events | FDA-ready', status: 'released', statusLabel: 'Released to Inventory', parentNodeId: 'a-rel-1', linkedPageId: 'batch-release'};
const nodeA_fin2: LineageNode = {id: 'a-fin-2', stageId: 'final-disposition', label: 'DISP-A-002', sublabel: '17 May 2026', metaLine1: 'Released to Inventory', metaLine2: 'Audit: 11 events | FDA-ready', status: 'released', statusLabel: 'Released to Inventory', parentNodeId: 'a-rel-2', linkedPageId: 'batch-release'};
const nodeA_fin3: LineageNode = {id: 'a-fin-3', stageId: 'final-disposition', label: 'DISP-A-003', sublabel: '18 May 2026', metaLine1: 'Released to Inventory', metaLine2: 'Audit: 10 events | FDA-ready', status: 'released', statusLabel: 'Released to Inventory', parentNodeId: 'a-rel-3', linkedPageId: 'batch-release'};
const nodeA_fin4: LineageNode = {id: 'a-fin-4', stageId: 'final-disposition', label: 'DISP-A-004', sublabel: '19 May 2026', metaLine1: 'Released to Inventory', metaLine2: 'Audit: 11 events | FDA-ready', status: 'released', statusLabel: 'Released to Inventory', parentNodeId: 'a-rel-4', linkedPageId: 'batch-release'};
const nodeA_fin5: LineageNode = {id: 'a-fin-5', stageId: 'final-disposition', label: 'DISP-A-005', sublabel: '19 May 2026', metaLine1: 'Released to Inventory', metaLine2: 'Audit: 10 events | FDA-ready', status: 'released', statusLabel: 'Released to Inventory', parentNodeId: 'a-rel-5', linkedPageId: 'batch-release'};
const nodeA_fin6: LineageNode = {id: 'a-fin-6', stageId: 'final-disposition', label: 'DISP-A-006', sublabel: '20 May 2026', metaLine1: 'Released to Inventory', metaLine2: 'Audit: 10 events | FDA-ready', status: 'released', statusLabel: 'Released to Inventory', parentNodeId: 'a-rel-6', linkedPageId: 'batch-release'};

// Planned order nodes without Production Order conversion (pending WO creation)
const nodeA_plannedOrder7: LineageNode = {
  id: 'a-planned-order-7', stageId: 'planned-order',
  label: 'PLN-A-007', sublabel: '11 May 2026',
  metaLine1: 'Pending WO conversion', metaLine2: 'From MRP-v3',
  status: 'approved', statusLabel: 'Approved',
  parentNodeId: 'a-mrp-v3',
  linkedVersionId: 'PLN-A-007', linkedPageId: 'mrp',
};

const nodeA_plannedOrder8: LineageNode = {
  id: 'a-planned-order-8', stageId: 'planned-order',
  label: 'PLN-A-008', sublabel: '11 May 2026',
  metaLine1: 'Pending WO conversion', metaLine2: 'From MRP-v3',
  status: 'approved', statusLabel: 'Approved',
  parentNodeId: 'a-mrp-v3',
  linkedVersionId: 'PLN-A-008', linkedPageId: 'mrp',
};

// ── Chains ────────────────────────────────────────────────────────────────────

const chainA_wo1: LineageChain = {
  id: 'chain-a-wo-1', demandGroupId: 'demand-a', label: 'WO-A-001 — Fully Released', isSimulation: false,
  nodeIdsByStage: {
    demand: 'a-demand', mps: 'a-mps-r3', mrp: 'a-mrp-v3',
    'planned-order': 'a-planned-order-1', 'production-order': 'a-po-1',
    schedule: 'a-schedule', 'wo-release': 'a-wor-1', execution: 'a-exec-1',
    'batch-produced': 'a-bp-1', 'material-lot-genealogy': 'a-mat-1',
    'ipc-quality': 'a-ipc-1', deviations: 'a-dev-1', sterilization: 'a-ster-1',
    'dhr-documentation': 'a-dhr-1', 'batch-release-decision': 'a-rel-1', 'final-disposition': 'a-fin-1',
  },
  nodes: [sharedA_demand, sharedA_mpsR3, sharedA_mrpV3, nodeA_pln1, nodeA_po1, sharedA_schedule, nodeA_wor1, nodeA_exec1, nodeA_bp1, nodeA_mat1, nodeA_ipc1, nodeA_dev1, nodeA_ster1, nodeA_dhr1, nodeA_rel1, nodeA_fin1],
};

const chainA_wo2: LineageChain = {
  id: 'chain-a-wo-2', demandGroupId: 'demand-a', label: 'WO-A-002 — Fully Released', isSimulation: false,
  nodeIdsByStage: {
    demand: 'a-demand', mps: 'a-mps-r3', mrp: 'a-mrp-v3',
    'planned-order': 'a-planned-order-2', 'production-order': 'a-po-2',
    schedule: 'a-schedule', 'wo-release': 'a-wor-2', execution: 'a-exec-2',
    'batch-produced': 'a-bp-2', 'material-lot-genealogy': 'a-mat-2',
    'ipc-quality': 'a-ipc-2', deviations: 'a-dev-2', sterilization: 'a-ster-2',
    'dhr-documentation': 'a-dhr-2', 'batch-release-decision': 'a-rel-2', 'final-disposition': 'a-fin-2',
  },
  nodes: [sharedA_demand, sharedA_mpsR3, sharedA_mrpV3, nodeA_pln2, nodeA_po2, sharedA_schedule, nodeA_wor2, nodeA_exec2, nodeA_bp2, nodeA_mat2, nodeA_ipc2, nodeA_dev2, nodeA_ster2, nodeA_dhr2, nodeA_rel2, nodeA_fin2],
};

// wo3 skips sterilization — DHR parent is deviations node
const chainA_wo3: LineageChain = {
  id: 'chain-a-wo-3', demandGroupId: 'demand-a', label: 'WO-A-003 — Released (No Sterilization)', isSimulation: false,
  nodeIdsByStage: {
    demand: 'a-demand', mps: 'a-mps-r3', mrp: 'a-mrp-v3',
    'planned-order': 'a-planned-order-3', 'production-order': 'a-po-3',
    schedule: 'a-schedule', 'wo-release': 'a-wor-3', execution: 'a-exec-3',
    'batch-produced': 'a-bp-3', 'material-lot-genealogy': 'a-mat-3',
    'ipc-quality': 'a-ipc-3', deviations: 'a-dev-3',
    'dhr-documentation': 'a-dhr-3', 'batch-release-decision': 'a-rel-3', 'final-disposition': 'a-fin-3',
  },
  nodes: [sharedA_demand, sharedA_mpsR3, sharedA_mrpV3, nodeA_pln3, nodeA_po3, sharedA_schedule, nodeA_wor3, nodeA_exec3, nodeA_bp3, nodeA_mat3, nodeA_ipc3, nodeA_dev3, nodeA_dhr3, nodeA_rel3, nodeA_fin3],
};

const chainA_wo4: LineageChain = {
  id: 'chain-a-wo-4', demandGroupId: 'demand-a', label: 'WO-A-004 — Fully Released', isSimulation: false,
  nodeIdsByStage: {
    demand: 'a-demand', mps: 'a-mps-r3', mrp: 'a-mrp-v3',
    'planned-order': 'a-planned-order-4', 'production-order': 'a-po-4',
    schedule: 'a-schedule', 'wo-release': 'a-wor-4', execution: 'a-exec-4',
    'batch-produced': 'a-bp-4', 'material-lot-genealogy': 'a-mat-4',
    'ipc-quality': 'a-ipc-4', deviations: 'a-dev-4', sterilization: 'a-ster-4',
    'dhr-documentation': 'a-dhr-4', 'batch-release-decision': 'a-rel-4', 'final-disposition': 'a-fin-4',
  },
  nodes: [sharedA_demand, sharedA_mpsR3, sharedA_mrpV3, nodeA_pln4, nodeA_po4, sharedA_schedule, nodeA_wor4, nodeA_exec4, nodeA_bp4, nodeA_mat4, nodeA_ipc4, nodeA_dev4, nodeA_ster4, nodeA_dhr4, nodeA_rel4, nodeA_fin4],
};

// wo5 skips sterilization — DHR parent is deviations node
const chainA_wo5: LineageChain = {
  id: 'chain-a-wo-5', demandGroupId: 'demand-a', label: 'WO-A-005 — Released (No Sterilization)', isSimulation: false,
  nodeIdsByStage: {
    demand: 'a-demand', mps: 'a-mps-r3', mrp: 'a-mrp-v3',
    'planned-order': 'a-planned-order-5', 'production-order': 'a-po-5',
    schedule: 'a-schedule', 'wo-release': 'a-wor-5', execution: 'a-exec-5',
    'batch-produced': 'a-bp-5', 'material-lot-genealogy': 'a-mat-5',
    'ipc-quality': 'a-ipc-5', deviations: 'a-dev-5',
    'dhr-documentation': 'a-dhr-5', 'batch-release-decision': 'a-rel-5', 'final-disposition': 'a-fin-5',
  },
  nodes: [sharedA_demand, sharedA_mpsR3, sharedA_mrpV3, nodeA_pln5, nodeA_po5, sharedA_schedule, nodeA_wor5, nodeA_exec5, nodeA_bp5, nodeA_mat5, nodeA_ipc5, nodeA_dev5, nodeA_dhr5, nodeA_rel5, nodeA_fin5],
};

const chainA_wo6: LineageChain = {
  id: 'chain-a-wo-6', demandGroupId: 'demand-a', label: 'WO-A-006 — Fully Released', isSimulation: false,
  nodeIdsByStage: {
    demand: 'a-demand', mps: 'a-mps-r3', mrp: 'a-mrp-v3',
    'planned-order': 'a-planned-order-6', 'production-order': 'a-po-6',
    schedule: 'a-schedule', 'wo-release': 'a-wor-6', execution: 'a-exec-6',
    'batch-produced': 'a-bp-6', 'material-lot-genealogy': 'a-mat-6',
    'ipc-quality': 'a-ipc-6', deviations: 'a-dev-6', sterilization: 'a-ster-6',
    'dhr-documentation': 'a-dhr-6', 'batch-release-decision': 'a-rel-6', 'final-disposition': 'a-fin-6',
  },
  nodes: [sharedA_demand, sharedA_mpsR3, sharedA_mrpV3, nodeA_pln6, nodeA_po6, sharedA_schedule, nodeA_wor6, nodeA_exec6, nodeA_bp6, nodeA_mat6, nodeA_ipc6, nodeA_dev6, nodeA_ster6, nodeA_dhr6, nodeA_rel6, nodeA_fin6],
};

// Planned orders with no Production Order / WO association yet
const chainA_pln7: LineageChain = {
  id: 'chain-a-pln-7', demandGroupId: 'demand-a', label: 'PLN-A-007 — Pending WO Conversion', isSimulation: false,
  nodeIdsByStage: {
    demand: 'a-demand', mps: 'a-mps-r3', mrp: 'a-mrp-v3',
    'planned-order': 'a-planned-order-7',
  },
  nodes: [sharedA_demand, sharedA_mpsR3, sharedA_mrpV3, nodeA_plannedOrder7],
};

const chainA_pln8: LineageChain = {
  id: 'chain-a-pln-8', demandGroupId: 'demand-a', label: 'PLN-A-008 — Pending WO Conversion', isSimulation: false,
  nodeIdsByStage: {
    demand: 'a-demand', mps: 'a-mps-r3', mrp: 'a-mrp-v3',
    'planned-order': 'a-planned-order-8',
  },
  nodes: [sharedA_demand, sharedA_mpsR3, sharedA_mrpV3, nodeA_plannedOrder8],
};

// ─── Demand B ─────────────────────────────────────────────────────────────────

const nodeB_demand: LineageNode = {
  id: 'b-demand', stageId: 'demand',
  label: 'Demand B-2026-05', sublabel: '01 May 2026',
  quantity: '85,000,000', status: 'approved', statusLabel: 'On Track',
  metaLine1: 'Product B | Line 1', metaLine2: 'Market: Americas',
};
const nodeB_mpsR1: LineageNode = {id: 'b-mps-r1', stageId: 'mps', label: 'MPS May-2026 (R1)', sublabel: '05 May 2026', quantity: '84,500,000', status: 'approved', statusLabel: 'Approved', metaLine1: 'Approved Baseline', parentNodeId: 'b-demand'};
const nodeB_mrpV1: LineageNode = {id: 'b-mrp-v1', stageId: 'mrp', label: 'MRP 2026-05-10', sublabel: '10 May 2026', quantity: '84,000,000', status: 'approved', statusLabel: 'Approved', metaLine1: 'No shortages', parentNodeId: 'b-mps-r1'};
const nodeB_plannedOrder: LineageNode = {id: 'b-planned-order', stageId: 'planned-order', label: 'PLN-B-2026-05', sublabel: '11 May 2026', metaLine1: '1 planned run', metaLine2: 'From MRP', status: 'approved', statusLabel: 'Approved', parentNodeId: 'b-mrp-v1'};
const nodeB_po1: LineageNode = {id: 'b-po-1', stageId: 'production-order', label: 'PO-B-001 / WO-B-001', sublabel: '84,000,000 PCS', metaLine1: 'Line 1 | M-01', metaLine2: 'Batch: B260514-B01', status: 'approved', statusLabel: 'Completed', parentNodeId: 'b-planned-order', linkedPageId: 'work-orders'};
const nodeB_schedule: LineageNode = {id: 'b-schedule', stageId: 'schedule', label: 'Sched May-2026 (B)', sublabel: '12 May 2026', metaLine1: '1 order | Line 1', metaLine2: 'No conflicts', status: 'approved', statusLabel: 'Approved', parentNodeId: 'b-planned-order', linkedPageId: 'schedule-versions'};
const nodeB_wor: LineageNode = {id: 'b-wor-1', stageId: 'wo-release', label: 'WOR-B-001', sublabel: '13 May 2026', metaLine1: 'Materials ✓ | Machine ✓', metaLine2: 'QA ✓ | Docs ✓', status: 'released', statusLabel: 'Released', parentNodeId: 'b-po-1', linkedPageId: 'work-orders'};
const nodeB_exec: LineageNode = {id: 'b-exec-1', stageId: 'execution', label: 'EXEC-B-001', sublabel: '14 May 2026', quantity: '83,700,000 PCS', metaLine1: 'Scrap: 300,000 PCS', metaLine2: 'Op: M. Nunes | Confirmed', status: 'approved', statusLabel: 'Completed', parentNodeId: 'b-wor-1', linkedPageId: 'work-orders'};
const nodeB_bp: LineageNode = {id: 'b-bp-1', stageId: 'batch-produced', label: 'Batch B260514-B01', sublabel: '14 May 2026', quantity: '83,700,000 PCS', metaLine1: 'Exp: 14 May 2028', metaLine2: 'WO: WO-B-001', status: 'approved', statusLabel: 'Completed', parentNodeId: 'b-exec-1', linkedPageId: 'batch-release'};
const nodeB_mat: LineageNode = {id: 'b-mat-1', stageId: 'material-lot-genealogy', label: 'MAT-GENE-B01', sublabel: '14 May 2026', metaLine1: '5 components consumed', metaLine2: 'BOM v2.1 | No substitutions', status: 'approved', statusLabel: 'Approved', parentNodeId: 'b-bp-1'};
const nodeB_ipc: LineageNode = {id: 'b-ipc-1', stageId: 'ipc-quality', label: 'IPC-B-001', sublabel: '14 May 2026', metaLine1: 'All checkpoints: PASS', metaLine2: 'Inspector: V. Almeida', status: 'approved', statusLabel: 'Passed', parentNodeId: 'b-mat-1', linkedPageId: 'quality-inspections'};
const nodeB_dev: LineageNode = {id: 'b-dev-1', stageId: 'deviations', label: 'DEV-B-001', sublabel: '14 May 2026', metaLine1: 'No open deviations', metaLine2: 'QN: 0 | Hold: None', status: 'approved', statusLabel: 'Clear', parentNodeId: 'b-ipc-1'};
const nodeB_ster: LineageNode = {id: 'b-ster-1', stageId: 'sterilization', label: 'STER-B-001', sublabel: '16 May 2026', metaLine1: 'EO | Load: LD-0516-B', metaLine2: 'Cycle: SC-1250', status: 'released', statusLabel: 'Completed', parentNodeId: 'b-dev-1', linkedPageId: 'sterilization'};
const nodeB_dhr: LineageNode = {id: 'b-dhr-1', stageId: 'dhr-documentation', label: 'DHR-B-001', sublabel: '17 May 2026', metaLine1: 'All docs complete', metaLine2: 'Reviewer: K. Mendes', status: 'approved', statusLabel: 'Complete', parentNodeId: 'b-ster-1', linkedPageId: 'batch-release'};
const nodeB_rel: LineageNode = {id: 'b-rel-1', stageId: 'batch-release-decision', label: 'REL-B-001', sublabel: '18 May 2026', metaLine1: 'Approver: Dr. H. Barros', metaLine2: 'Decision: Released', status: 'released', statusLabel: 'Released', parentNodeId: 'b-dhr-1', linkedPageId: 'batch-release'};
const nodeB_fin: LineageNode = {id: 'b-fin-1', stageId: 'final-disposition', label: 'DISP-B-001', sublabel: '19 May 2026', metaLine1: 'Released to Inventory', metaLine2: 'Audit: 8 events | FDA-ready', status: 'released', statusLabel: 'Released to Inventory', parentNodeId: 'b-rel-1', linkedPageId: 'batch-release'};

const chainB_complete: LineageChain = {
  id: 'chain-b-complete', demandGroupId: 'demand-b', label: 'WO-B-001 — Fully Released', isSimulation: false,
  nodeIdsByStage: {
    demand: 'b-demand', mps: 'b-mps-r1', mrp: 'b-mrp-v1', 'planned-order': 'b-planned-order',
    'production-order': 'b-po-1', schedule: 'b-schedule', 'wo-release': 'b-wor-1',
    execution: 'b-exec-1', 'batch-produced': 'b-bp-1', 'material-lot-genealogy': 'b-mat-1',
    'ipc-quality': 'b-ipc-1', deviations: 'b-dev-1', sterilization: 'b-ster-1',
    'dhr-documentation': 'b-dhr-1', 'batch-release-decision': 'b-rel-1', 'final-disposition': 'b-fin-1',
  },
  nodes: [nodeB_demand, nodeB_mpsR1, nodeB_mrpV1, nodeB_plannedOrder, nodeB_po1, nodeB_schedule, nodeB_wor, nodeB_exec, nodeB_bp, nodeB_mat, nodeB_ipc, nodeB_dev, nodeB_ster, nodeB_dhr, nodeB_rel, nodeB_fin],
};

// ─── Demand C ─────────────────────────────────────────────────────────────────

const nodeC_demand: LineageNode = {id: 'c-demand', stageId: 'demand', label: 'Demand C-2026-05', sublabel: '10 May 2026', quantity: '62,000,000', status: 'approved', statusLabel: 'On Track', metaLine1: 'Product C | Line 3'};
const nodeC_mpsR1: LineageNode = {id: 'c-mps-r1', stageId: 'mps', label: 'MPS May-2026 (R1)', sublabel: '14 May 2026', quantity: '61,500,000', status: 'warning', statusLabel: 'At Risk', parentNodeId: 'c-demand'};
const nodeC_mrpV1: LineageNode = {id: 'c-mrp-v1', stageId: 'mrp', label: 'MRP 2026-05-18', sublabel: '18 May 2026', quantity: '60,800,000', status: 'warning', statusLabel: 'Capacity Gap', parentNodeId: 'c-mps-r1'};
const nodeC_plannedOrder: LineageNode = {id: 'c-planned-order', stageId: 'planned-order', label: 'PLN-C-2026-05', sublabel: '19 May 2026', metaLine1: 'Capacity constrained', status: 'warning', statusLabel: 'At Risk', parentNodeId: 'c-mrp-v1'};
const nodeC_po1: LineageNode = {id: 'c-po-1', stageId: 'production-order', label: 'PO-C-001 / WO-C-001', sublabel: '60,800,000 PCS', metaLine1: 'Line 3 | M-01', status: 'warning', statusLabel: 'At Risk', parentNodeId: 'c-planned-order', linkedPageId: 'work-orders'};
const nodeC_schedule: LineageNode = {id: 'c-schedule', stageId: 'schedule', label: 'Sched May-2026 (C)', sublabel: '20 May 2026', metaLine1: 'Scheduling conflict', status: 'warning', statusLabel: 'Conflict', parentNodeId: 'c-po-1', linkedPageId: 'schedule-versions'};
const nodeC_wor: LineageNode = {id: 'c-wor-1', stageId: 'wo-release', label: 'WOR-C-001', sublabel: '21 May 2026', metaLine1: 'Materials ✓', metaLine2: 'Machine: WARNING', status: 'warning', statusLabel: 'Warning', hasRiskIndicator: true, parentNodeId: 'c-schedule', linkedPageId: 'work-orders'};
const nodeC_exec: LineageNode = {id: 'c-exec-1', stageId: 'execution', label: 'EXEC-C-001', sublabel: '22 May 2026', quantity: '58,000,000 PCS', metaLine1: 'Scrap: 2,800,000 PCS', metaLine2: 'Op: B. Lopes | Confirmed', status: 'warning', statusLabel: 'Completed w/ Issues', parentNodeId: 'c-wor-1', linkedPageId: 'work-orders'};
const nodeC_bp: LineageNode = {id: 'c-bp-1', stageId: 'batch-produced', label: 'Batch B260522-C01', sublabel: '22 May 2026', quantity: '58,000,000 PCS', metaLine1: 'Exp: 22 May 2028', metaLine2: 'WO: WO-C-001', status: 'warning', statusLabel: 'Completed', parentNodeId: 'c-exec-1', linkedPageId: 'batch-release'};
const nodeC_mat: LineageNode = {id: 'c-mat-1', stageId: 'material-lot-genealogy', label: 'MAT-GENE-C01', sublabel: '22 May 2026', metaLine1: 'Component substitution', metaLine2: 'Approved deviation', status: 'warning', statusLabel: 'Substitution', parentNodeId: 'c-bp-1'};
const nodeC_ipc: LineageNode = {id: 'c-ipc-1', stageId: 'ipc-quality', label: 'IPC-C-001', sublabel: '23 May 2026', metaLine1: 'All checkpoints: PASS', metaLine2: 'Inspector: J. Dias', status: 'approved', statusLabel: 'Passed', parentNodeId: 'c-mat-1', linkedPageId: 'quality-inspections'};
const nodeC_dev: LineageNode = {id: 'c-dev-1', stageId: 'deviations', label: 'DEV-C-001', sublabel: '23 May 2026', metaLine1: '1 deviation — closed', metaLine2: 'QN-2026-0523 | Resolved', status: 'approved', statusLabel: 'Resolved', parentNodeId: 'c-ipc-1'};
const nodeC_ster: LineageNode = {id: 'c-ster-1', stageId: 'sterilization', label: 'STER-C-001', sublabel: '25 May 2026', metaLine1: 'EO | Load: LD-0525-C', metaLine2: 'Cycle: SC-1255', status: 'released', statusLabel: 'Completed', parentNodeId: 'c-dev-1', linkedPageId: 'sterilization'};
const nodeC_dhr: LineageNode = {id: 'c-dhr-1', stageId: 'dhr-documentation', label: 'DHR-C-001', sublabel: '26 May 2026', metaLine1: 'All docs complete', metaLine2: 'Reviewer: F. Monteiro', status: 'approved', statusLabel: 'Complete', parentNodeId: 'c-ster-1', linkedPageId: 'batch-release'};
const nodeC_rel: LineageNode = {id: 'c-rel-1', stageId: 'batch-release-decision', label: 'REL-C-001', sublabel: '27 May 2026', metaLine1: 'Approver: Dr. C. Alves', metaLine2: 'Decision: Released', status: 'released', statusLabel: 'Released', parentNodeId: 'c-dhr-1', linkedPageId: 'batch-release'};
const nodeC_fin: LineageNode = {id: 'c-fin-1', stageId: 'final-disposition', label: 'DISP-C-001', sublabel: '28 May 2026', metaLine1: 'Released to Inventory', metaLine2: 'Audit: 9 events | FDA-ready', status: 'released', statusLabel: 'Released to Inventory', parentNodeId: 'c-rel-1', linkedPageId: 'batch-release'};

const chainC_complete: LineageChain = {
  id: 'chain-c-complete', demandGroupId: 'demand-c', label: 'WO-C-001 — Fully Released', isSimulation: false,
  nodeIdsByStage: {
    demand: 'c-demand', mps: 'c-mps-r1', mrp: 'c-mrp-v1', 'planned-order': 'c-planned-order',
    'production-order': 'c-po-1', schedule: 'c-schedule', 'wo-release': 'c-wor-1',
    execution: 'c-exec-1', 'batch-produced': 'c-bp-1', 'material-lot-genealogy': 'c-mat-1',
    'ipc-quality': 'c-ipc-1', deviations: 'c-dev-1', sterilization: 'c-ster-1',
    'dhr-documentation': 'c-dhr-1', 'batch-release-decision': 'c-rel-1', 'final-disposition': 'c-fin-1',
  },
  nodes: [nodeC_demand, nodeC_mpsR1, nodeC_mrpV1, nodeC_plannedOrder, nodeC_po1, nodeC_schedule, nodeC_wor, nodeC_exec, nodeC_bp, nodeC_mat, nodeC_ipc, nodeC_dev, nodeC_ster, nodeC_dhr, nodeC_rel, nodeC_fin],
};

// ─── Demand D ─────────────────────────────────────────────────────────────────
// Sterilization N/A — non-sterile product.

const sharedD_demand: LineageNode = {id: 'd-demand', stageId: 'demand', label: 'Demand D-2026-05', sublabel: '05 May 2026', quantity: '48,000,000', status: 'approved', statusLabel: 'On Track', metaLine1: 'Product D | Line 1', sharedAcrossChains: false};
const sharedD_mpsR1: LineageNode = {id: 'd-mps-r1', stageId: 'mps', label: 'MPS May-2026 (R1)', sublabel: '08 May 2026', quantity: '47,800,000', status: 'approved', statusLabel: 'Baseline', parentNodeId: 'd-demand'};
const nodeD_mrpV1: LineageNode = {id: 'd-mrp-v1', stageId: 'mrp', label: 'MRP 2026-05-12 (v1)', sublabel: '12 May 2026', quantity: '47,500,000', status: 'approved', statusLabel: 'Approved', parentNodeId: 'd-mps-r1'};
const nodeD_plannedOrder: LineageNode = {id: 'd-planned-order', stageId: 'planned-order', label: 'PLN-D-2026-05', sublabel: '13 May 2026', metaLine1: '1 planned run', status: 'approved', statusLabel: 'Approved', parentNodeId: 'd-mrp-v1'};
const nodeD_po1: LineageNode = {id: 'd-po-1', stageId: 'production-order', label: 'PO-D-001 / WO-D-001', sublabel: '47,500,000 PCS', metaLine1: 'Line 1 | M-01', status: 'approved', statusLabel: 'Completed', parentNodeId: 'd-planned-order', linkedPageId: 'work-orders'};
const nodeD_schedule: LineageNode = {id: 'd-schedule', stageId: 'schedule', label: 'Sched May-2026 (D)', sublabel: '13 May 2026', metaLine1: '1 order | Line 1', metaLine2: 'No conflicts', status: 'approved', statusLabel: 'Approved', parentNodeId: 'd-planned-order', linkedPageId: 'schedule-versions'};
const nodeD_wor: LineageNode = {id: 'd-wor-1', stageId: 'wo-release', label: 'WOR-D-001', sublabel: '14 May 2026', metaLine1: 'All checks: ✓', status: 'released', statusLabel: 'Released', parentNodeId: 'd-po-1', linkedPageId: 'work-orders'};
const nodeD_exec: LineageNode = {id: 'd-exec-1', stageId: 'execution', label: 'EXEC-D-001', sublabel: '15 May 2026', quantity: '47,200,000 PCS', metaLine1: 'Scrap: 300,000', metaLine2: 'Confirmed', status: 'approved', statusLabel: 'Completed', parentNodeId: 'd-wor-1', linkedPageId: 'work-orders'};
const nodeD_bp: LineageNode = {id: 'd-bp-1', stageId: 'batch-produced', label: 'Batch B260515-D01', sublabel: '15 May 2026', quantity: '47,200,000 PCS', metaLine1: 'Exp: 15 May 2028', status: 'approved', statusLabel: 'Completed', parentNodeId: 'd-exec-1', linkedPageId: 'batch-release'};
const nodeD_mat: LineageNode = {id: 'd-mat-1', stageId: 'material-lot-genealogy', label: 'MAT-GENE-D01', sublabel: '15 May 2026', metaLine1: '3 components', metaLine2: 'BOM v2.1 | No substitutions', status: 'approved', statusLabel: 'Approved', parentNodeId: 'd-bp-1'};
const nodeD_ipc: LineageNode = {id: 'd-ipc-1', stageId: 'ipc-quality', label: 'IPC-D-001', sublabel: '15 May 2026', metaLine1: 'All checkpoints: PASS', status: 'approved', statusLabel: 'Passed', parentNodeId: 'd-mat-1', linkedPageId: 'quality-inspections'};
const nodeD_dev: LineageNode = {id: 'd-dev-1', stageId: 'deviations', label: 'DEV-D-001', sublabel: '15 May 2026', metaLine1: 'No open deviations', metaLine2: 'QN: 0 | Hold: None', status: 'approved', statusLabel: 'Clear', parentNodeId: 'd-ipc-1'};
const nodeD_ster: LineageNode = {id: 'd-ster-1', stageId: 'sterilization', label: 'Not Applicable', sublabel: 'Product D', metaLine1: 'Non-sterile product', status: 'not-applicable', statusLabel: 'N/A', isNotApplicable: true, parentNodeId: 'd-dev-1'};
const nodeD_dhr: LineageNode = {id: 'd-dhr-1', stageId: 'dhr-documentation', label: 'DHR-D-001', sublabel: '16 May 2026', metaLine1: 'All docs complete', status: 'approved', statusLabel: 'Complete', parentNodeId: 'd-ster-1', linkedPageId: 'batch-release'};
const nodeD_rel: LineageNode = {id: 'd-rel-1', stageId: 'batch-release-decision', label: 'REL-D-001', sublabel: '17 May 2026', metaLine1: 'Approver: Dr. F. Lima', status: 'released', statusLabel: 'Released', parentNodeId: 'd-dhr-1', linkedPageId: 'batch-release'};
const nodeD_fin: LineageNode = {id: 'd-fin-1', stageId: 'final-disposition', label: 'DISP-D-001', sublabel: '18 May 2026', metaLine1: 'Released to Inventory', metaLine2: 'Audit: 9 events', status: 'released', statusLabel: 'Released to Inventory', parentNodeId: 'd-rel-1', linkedPageId: 'batch-release'};

const chainD_approved: LineageChain = {
  id: 'chain-d-approved', demandGroupId: 'demand-d', label: 'WO-D-001 — Fully Released', isSimulation: false,
  nodeIdsByStage: {
    demand: 'd-demand', mps: 'd-mps-r1', mrp: 'd-mrp-v1', 'planned-order': 'd-planned-order',
    'production-order': 'd-po-1', schedule: 'd-schedule', 'wo-release': 'd-wor-1', execution: 'd-exec-1',
    'batch-produced': 'd-bp-1', 'material-lot-genealogy': 'd-mat-1', 'ipc-quality': 'd-ipc-1',
    deviations: 'd-dev-1', sterilization: 'd-ster-1', 'dhr-documentation': 'd-dhr-1',
    'batch-release-decision': 'd-rel-1', 'final-disposition': 'd-fin-1',
  },
  nodes: [sharedD_demand, sharedD_mpsR1, nodeD_mrpV1, nodeD_plannedOrder, nodeD_po1, nodeD_schedule, nodeD_wor, nodeD_exec, nodeD_bp, nodeD_mat, nodeD_ipc, nodeD_dev, nodeD_ster, nodeD_dhr, nodeD_rel, nodeD_fin],
};

// ─── Demand E ─────────────────────────────────────────────────────────────────
// Blocked at WO Release — downstream stages on hold.

const nodeE_demand: LineageNode = {id: 'e-demand', stageId: 'demand', label: 'Demand E-2026-05', sublabel: '03 May 2026', quantity: '31,000,000', status: 'approved', statusLabel: 'On Track', metaLine1: 'Product E | Line 4'};
const nodeE_mpsR1: LineageNode = {id: 'e-mps-r1', stageId: 'mps', label: 'MPS May-2026 (R1)', sublabel: '07 May 2026', quantity: '30,500,000', status: 'critical', statusLabel: 'Blocked', metaLine1: 'Material shortage', parentNodeId: 'e-demand'};
const nodeE_mrpV1: LineageNode = {id: 'e-mrp-v1', stageId: 'mrp', label: 'MRP 2026-05-09', sublabel: '09 May 2026', quantity: '30,200,000', status: 'critical', statusLabel: 'Shortage Detected', metaLine1: 'RM-441 shortage', parentNodeId: 'e-mps-r1'};
const nodeE_plannedOrder: LineageNode = {id: 'e-planned-order', stageId: 'planned-order', label: 'PLN-E-2026-05', sublabel: '10 May 2026', metaLine1: 'On hold — shortage', status: 'critical', statusLabel: 'Blocked', hasRiskIndicator: true, parentNodeId: 'e-mrp-v1'};
const nodeE_po1: LineageNode = {id: 'e-po-1', stageId: 'production-order', label: 'PO-E-001 / WO-E-001', sublabel: '30,200,000 PCS', metaLine1: 'Line 4 | M-01', metaLine2: 'Blocked — RM-441', status: 'critical', statusLabel: 'Blocked', hasRiskIndicator: true, parentNodeId: 'e-planned-order', linkedPageId: 'work-orders'};
const nodeE_schedule: LineageNode = {id: 'e-schedule', stageId: 'schedule', label: 'Sched May-2026 (E)', sublabel: '10 May 2026', metaLine1: 'Scheduling on hold', status: 'critical', statusLabel: 'Blocked', parentNodeId: 'e-po-1', linkedPageId: 'schedule-versions'};
const nodeE_wor: LineageNode = {id: 'e-wor-1', stageId: 'wo-release', label: 'WOR-E-001', sublabel: '11 May 2026', metaLine1: 'Materials: BLOCKED', metaLine2: 'RM-441 ETA: unknown', status: 'blocked', statusLabel: 'Blocked', hasRiskIndicator: true, parentNodeId: 'e-schedule', linkedPageId: 'work-orders'};
const nodeE_exec: LineageNode = {id: 'e-exec-1', stageId: 'execution', label: 'EXEC-E-001', sublabel: 'Pending', metaLine1: 'Awaiting RM-441 delivery', metaLine2: 'Start: TBD', status: 'on-hold', statusLabel: 'On Hold', parentNodeId: 'e-wor-1', linkedPageId: 'work-orders'};
const nodeE_bp: LineageNode = {id: 'e-bp-1', stageId: 'batch-produced', label: 'Batch Pending', sublabel: 'TBD', metaLine1: 'Not started', metaLine2: 'Awaiting execution', status: 'on-hold', statusLabel: 'On Hold', parentNodeId: 'e-exec-1', linkedPageId: 'batch-release'};
const nodeE_mat: LineageNode = {id: 'e-mat-1', stageId: 'material-lot-genealogy', label: 'MAT-GENE-E01', sublabel: 'Pending', metaLine1: 'Not started', status: 'on-hold', statusLabel: 'On Hold', parentNodeId: 'e-bp-1'};
const nodeE_ipc: LineageNode = {id: 'e-ipc-1', stageId: 'ipc-quality', label: 'IPC-E-001', sublabel: 'Pending', metaLine1: 'Not started', status: 'on-hold', statusLabel: 'On Hold', parentNodeId: 'e-mat-1', linkedPageId: 'quality-inspections'};
const nodeE_dev: LineageNode = {id: 'e-dev-1', stageId: 'deviations', label: 'DEV-E-001', sublabel: 'Pending', metaLine1: 'Not started', status: 'on-hold', statusLabel: 'On Hold', parentNodeId: 'e-ipc-1'};
const nodeE_ster: LineageNode = {id: 'e-ster-1', stageId: 'sterilization', label: 'STER-E-001', sublabel: 'Pending', metaLine1: 'Not started', status: 'on-hold', statusLabel: 'On Hold', parentNodeId: 'e-dev-1', linkedPageId: 'sterilization'};
const nodeE_dhr: LineageNode = {id: 'e-dhr-1', stageId: 'dhr-documentation', label: 'DHR-E-001', sublabel: 'Pending', metaLine1: 'Not started', status: 'on-hold', statusLabel: 'On Hold', parentNodeId: 'e-ster-1', linkedPageId: 'batch-release'};
const nodeE_rel: LineageNode = {id: 'e-rel-1', stageId: 'batch-release-decision', label: 'REL-E-001', sublabel: 'Pending', metaLine1: 'Not started', status: 'on-hold', statusLabel: 'On Hold', parentNodeId: 'e-dhr-1', linkedPageId: 'batch-release'};
const nodeE_fin: LineageNode = {id: 'e-fin-1', stageId: 'final-disposition', label: 'DISP-E-001', sublabel: 'Pending', metaLine1: 'Not started', status: 'on-hold', statusLabel: 'On Hold', parentNodeId: 'e-rel-1', linkedPageId: 'batch-release'};

const chainE_blocked: LineageChain = {
  id: 'chain-e-blocked', demandGroupId: 'demand-e', label: 'Chain 1 — Blocked at WO Release', isSimulation: false,
  nodeIdsByStage: {
    demand: 'e-demand', mps: 'e-mps-r1', mrp: 'e-mrp-v1', 'planned-order': 'e-planned-order',
    'production-order': 'e-po-1', schedule: 'e-schedule', 'wo-release': 'e-wor-1',
    execution: 'e-exec-1', 'batch-produced': 'e-bp-1', 'material-lot-genealogy': 'e-mat-1',
    'ipc-quality': 'e-ipc-1', deviations: 'e-dev-1', sterilization: 'e-ster-1',
    'dhr-documentation': 'e-dhr-1', 'batch-release-decision': 'e-rel-1', 'final-disposition': 'e-fin-1',
  },
  nodes: [nodeE_demand, nodeE_mpsR1, nodeE_mrpV1, nodeE_plannedOrder, nodeE_po1, nodeE_schedule, nodeE_wor, nodeE_exec, nodeE_bp, nodeE_mat, nodeE_ipc, nodeE_dev, nodeE_ster, nodeE_dhr, nodeE_rel, nodeE_fin],
};

// ─── Demand F ─────────────────────────────────────────────────────────────────
// New demand — draft status throughout, production not yet started.

const nodeF_demand: LineageNode = {
  id: 'f-demand', stageId: 'demand',
  label: 'Demand F-2026-06', sublabel: '20 May 2026',
  quantity: '18,500,000', status: 'draft', statusLabel: 'Draft',
  metaLine1: 'Product F | Line 2', metaLine2: 'Pending MPS review',
};
const nodeF_mps: LineageNode = {id: 'f-mps-r1', stageId: 'mps', label: 'MPS Jun-2026 (R1)', sublabel: '22 May 2026', quantity: '18,200,000', status: 'draft', statusLabel: 'Draft', metaLine1: 'Under review', parentNodeId: 'f-demand'};
const nodeF_mrp: LineageNode = {id: 'f-mrp-v1', stageId: 'mrp', label: 'MRP 2026-05-24 (v1)', sublabel: '24 May 2026', quantity: '18,000,000', status: 'draft', statusLabel: 'Draft', metaLine1: 'Initial run', parentNodeId: 'f-mps-r1'};
const nodeF_plannedOrder: LineageNode = {id: 'f-planned-order', stageId: 'planned-order', label: 'PLN-F-2026-06', sublabel: '25 May 2026', metaLine1: '1 planned run', status: 'draft', statusLabel: 'Draft', parentNodeId: 'f-mrp-v1'};
const nodeF_po: LineageNode = {id: 'f-po-1', stageId: 'production-order', label: 'PO-F-001 / WO-F-001', sublabel: '18,000,000 PCS', metaLine1: 'Line 2 | M-01', metaLine2: 'Not yet released', status: 'draft', statusLabel: 'Draft', parentNodeId: 'f-planned-order', linkedPageId: 'work-orders'};
const nodeF_schedule: LineageNode = {id: 'f-schedule', stageId: 'schedule', label: 'Sched Jun-2026 (F)', sublabel: '26 May 2026', metaLine1: '1 order | Line 2', metaLine2: 'Pending approval', status: 'draft', statusLabel: 'Draft', parentNodeId: 'f-planned-order', linkedPageId: 'schedule-versions'};
const nodeF_wor: LineageNode = {id: 'f-wor-1', stageId: 'wo-release', label: 'WOR-F-001', sublabel: 'Pending', metaLine1: 'Not yet released', metaLine2: 'Awaiting MPS approval', status: 'draft', statusLabel: 'Not Released', parentNodeId: 'f-po-1', linkedPageId: 'work-orders'};
const nodeF_exec: LineageNode = {id: 'f-exec-1', stageId: 'execution', label: 'EXEC-F-001', sublabel: 'Planned: Jun 2026', metaLine1: 'Not started', status: 'draft', statusLabel: 'Not Started', parentNodeId: 'f-wor-1', linkedPageId: 'work-orders'};
const nodeF_bp: LineageNode = {id: 'f-bp-1', stageId: 'batch-produced', label: 'Batch Planned', sublabel: 'Jun 2026', metaLine1: 'Not started', status: 'draft', statusLabel: 'Not Started', parentNodeId: 'f-exec-1', linkedPageId: 'batch-release'};
const nodeF_mat: LineageNode = {id: 'f-mat-1', stageId: 'material-lot-genealogy', label: 'MAT-GENE-F01', sublabel: 'Pending', metaLine1: 'Not started', status: 'draft', statusLabel: 'Not Started', parentNodeId: 'f-bp-1'};
const nodeF_ipc: LineageNode = {id: 'f-ipc-1', stageId: 'ipc-quality', label: 'IPC-F-001', sublabel: 'Pending', metaLine1: 'Not started', status: 'draft', statusLabel: 'Not Started', parentNodeId: 'f-mat-1', linkedPageId: 'quality-inspections'};
const nodeF_dev: LineageNode = {id: 'f-dev-1', stageId: 'deviations', label: 'DEV-F-001', sublabel: 'Pending', metaLine1: 'Not started', status: 'draft', statusLabel: 'Not Started', parentNodeId: 'f-ipc-1'};
const nodeF_ster: LineageNode = {id: 'f-ster-1', stageId: 'sterilization', label: 'STER-F-001', sublabel: 'Pending', metaLine1: 'Not started', status: 'draft', statusLabel: 'Not Started', parentNodeId: 'f-dev-1', linkedPageId: 'sterilization'};
const nodeF_dhr: LineageNode = {id: 'f-dhr-1', stageId: 'dhr-documentation', label: 'DHR-F-001', sublabel: 'Pending', metaLine1: 'Not started', status: 'draft', statusLabel: 'Not Started', parentNodeId: 'f-ster-1', linkedPageId: 'batch-release'};
const nodeF_rel: LineageNode = {id: 'f-rel-1', stageId: 'batch-release-decision', label: 'REL-F-001', sublabel: 'Pending', metaLine1: 'Not started', status: 'draft', statusLabel: 'Not Started', parentNodeId: 'f-dhr-1', linkedPageId: 'batch-release'};
const nodeF_fin: LineageNode = {id: 'f-fin-1', stageId: 'final-disposition', label: 'DISP-F-001', sublabel: 'Pending', metaLine1: 'Not started', status: 'draft', statusLabel: 'Not Started', parentNodeId: 'f-rel-1', linkedPageId: 'batch-release'};

const chainF_new: LineageChain = {
  id: 'chain-f-new', demandGroupId: 'demand-f', label: 'Chain 1 — New Entry', isSimulation: false,
  nodeIdsByStage: {
    demand: 'f-demand', mps: 'f-mps-r1', mrp: 'f-mrp-v1', 'planned-order': 'f-planned-order',
    'production-order': 'f-po-1', schedule: 'f-schedule', 'wo-release': 'f-wor-1',
    execution: 'f-exec-1', 'batch-produced': 'f-bp-1', 'material-lot-genealogy': 'f-mat-1',
    'ipc-quality': 'f-ipc-1', deviations: 'f-dev-1', sterilization: 'f-ster-1',
    'dhr-documentation': 'f-dhr-1', 'batch-release-decision': 'f-rel-1', 'final-disposition': 'f-fin-1',
  },
  nodes: [nodeF_demand, nodeF_mps, nodeF_mrp, nodeF_plannedOrder, nodeF_po, nodeF_schedule, nodeF_wor, nodeF_exec, nodeF_bp, nodeF_mat, nodeF_ipc, nodeF_dev, nodeF_ster, nodeF_dhr, nodeF_rel, nodeF_fin],
};

// ─── Demand Groups ────────────────────────────────────────────────────────────

export const LINEAGE_DEMAND_GROUPS: LineageDemandGroup[] = [
  {
    id: 'demand-a', demandLabel: 'Demand A', product: 'Product A', line: 'Line 2',
    quantity: '120,000,000 units', status: 'released', color: '#1D4ED8',
    chains: [chainA_wo1, chainA_wo2, chainA_wo3, chainA_wo4, chainA_wo5, chainA_wo6, chainA_pln7, chainA_pln8],
  },
  {
    id: 'demand-b', demandLabel: 'Demand B', product: 'Product B', line: 'Line 1',
    quantity: '85,000,000 units', status: 'released', color: '#16A34A',
    chains: [chainB_complete],
  },
  {
    id: 'demand-c', demandLabel: 'Demand C', product: 'Product C', line: 'Line 3',
    quantity: '62,000,000 units', status: 'released', color: '#D97706',
    chains: [chainC_complete],
  },
  {
    id: 'demand-d', demandLabel: 'Demand D', product: 'Product D', line: 'Line 1',
    quantity: '48,000,000 units', status: 'released', color: '#7C3AED',
    chains: [chainD_approved],
  },
  {
    id: 'demand-e', demandLabel: 'Demand E', product: 'Product E', line: 'Line 4',
    quantity: '31,000,000 units', status: 'critical', color: '#DC2626',
    chains: [chainE_blocked],
  },
  {
    id: 'demand-f', demandLabel: 'Demand F', product: 'Product F', line: 'Line 2',
    quantity: '18,500,000 units', status: 'draft', color: '#0891B2',
    chains: [chainF_new],
  },
];

export const DEFAULT_LINEAGE_FILTERS: LineageFilterState = {
  demandId: '',
  status: '',
  viewMode: 'flow',
  productCode: '',
  batchId: '',
  woNumber: '',
  line: '',
  qualityStatus: '',
  releaseStatus: '',
  sterilizationStatus: '',
  blockerType: '',
  dateFrom: '',
  dateTo: '',
  dataFreshness: '',
};
