import type {
  MpsBucketLine,
  MpsPlan,
  ProductionLine,
  WorkOrderProposal,
  WorkOrderProposalAuditEvent,
  WorkOrderProposalAuditEventType,
  WorkOrderProposalFiltersState,
  WorkOrderProposalKpis,
} from './types';

function createId(prefix: string, suffix: string): string {
  return `${prefix}-${suffix}`;
}

function createTimestamp(): string {
  return new Date().toISOString();
}

export function createWorkOrderProposalAuditEvent(params: {
  proposalId: string;
  user: string;
  eventType: WorkOrderProposalAuditEventType;
  previousValue?: string;
  newValue?: string;
  comment?: string;
}): WorkOrderProposalAuditEvent {
  return {
    id: createId('wop-audit', `${params.proposalId}-${Math.random().toString(36).slice(2, 8)}`),
    proposalId: params.proposalId,
    timestamp: createTimestamp(),
    user: params.user,
    eventType: params.eventType,
    previousValue: params.previousValue,
    newValue: params.newValue,
    comment: params.comment,
  };
}

export function generateWorkOrderProposalsFromMps(
  plan: MpsPlan,
  _bucketLines: MpsBucketLine[],
  _productionLines: ProductionLine[],
): WorkOrderProposal[] {
  const mpsId = plan.id;

  return [
    {
      id: 'wop-0001',
      proposalNumber: 'WOP-0001',
      sourceMpsId: mpsId,
      sourceMpsBucketId: 'bucket-fg1001-w1',
      productCode: 'FG-1001',
      productDescription: 'Standard Tube A',
      productFamily: 'Standard Tubes',
      proposedQuantity: 40000,
      uom: 'PCS',
      proposedLineId: 'line-10',
      proposedLineName: 'Line 10',
      plannedStartDateTime: '2026-06-03T07:00:00.000Z',
      plannedEndDateTime: '2026-06-03T15:00:00.000Z',
      durationHours: 8,
      dueDate: '2026-06-07',
      priority: 'High',
      readinessPreview: 'Ready',
      capacityStatus: 'Feasible',
      materialRisk: 'None',
      inventoryImpact: 'Positive',
      aiConfidence: 'High',
      aiReasoning:
        'Created from Week 1 MPS bucket to satisfy high-priority demand while keeping Line 10 below 90% utilization. FG-1001 Week 1 demand can be produced on Line 10 within available capacity. The proposed quantity respects the preferred lot size and keeps utilization below the warning threshold.',
      recommendationSummary: 'Week 1 production run on Line 10 — fully feasible',
      expectedImpact: 'Covers Week 1 demand with positive inventory impact and no capacity risk.',
      status: 'PendingReview',
      selected: false,
    },
    {
      id: 'wop-0002',
      proposalNumber: 'WOP-0002',
      sourceMpsId: mpsId,
      sourceMpsBucketId: 'bucket-fg1001-w2',
      productCode: 'FG-1001',
      productDescription: 'Standard Tube A',
      productFamily: 'Standard Tubes',
      proposedQuantity: 40000,
      uom: 'PCS',
      proposedLineId: 'line-10',
      proposedLineName: 'Line 10',
      plannedStartDateTime: '2026-06-10T07:00:00.000Z',
      plannedEndDateTime: '2026-06-10T15:00:00.000Z',
      durationHours: 8,
      dueDate: '2026-06-14',
      priority: 'High',
      readinessPreview: 'Warning',
      capacityStatus: 'AtRisk',
      materialRisk: 'None',
      inventoryImpact: 'Neutral',
      aiConfidence: 'Medium',
      aiReasoning:
        'Supports Week 2 demand, but Line 10 utilization is expected near 94%. The MPS assistant flagged this bucket as AtRisk due to high utilization. Monitor closely and consider shifting volume to Line 20 if utilization spikes further.',
      recommendationSummary: 'Week 2 production on Line 10 — near capacity',
      expectedImpact: 'Covers Week 2 demand but Line 10 will be at 94% utilization.',
      constraintNotes: 'Line 10 Week 2 utilization ~94%. Consider alternative line if additional volume is added.',
      status: 'PendingReview',
      selected: false,
    },
    {
      id: 'wop-0003',
      proposalNumber: 'WOP-0003',
      sourceMpsId: mpsId,
      sourceMpsBucketId: 'bucket-fg1001-w3',
      productCode: 'FG-1001',
      productDescription: 'Standard Tube A',
      productFamily: 'Standard Tubes',
      proposedQuantity: 35000,
      uom: 'PCS',
      proposedLineId: 'line-20',
      proposedLineName: 'Line 20',
      plannedStartDateTime: '2026-06-17T07:00:00.000Z',
      plannedEndDateTime: '2026-06-17T14:00:00.000Z',
      durationHours: 7,
      dueDate: '2026-06-21',
      priority: 'Medium',
      readinessPreview: 'Ready',
      capacityStatus: 'Feasible',
      materialRisk: 'None',
      inventoryImpact: 'Positive',
      aiConfidence: 'High',
      aiReasoning:
        'Week 3 production of FG-1001 routed to Line 20 to balance load with Line 10. Line 20 has available capacity and the product is eligible. Lot size complies with planning rules.',
      recommendationSummary: 'Week 3 load-balanced to Line 20 — fully feasible',
      expectedImpact: 'Balances Week 3 load across lines with positive inventory outcome.',
      status: 'PendingReview',
      selected: false,
    },
    {
      id: 'wop-0004',
      proposalNumber: 'WOP-0004',
      sourceMpsId: mpsId,
      sourceMpsBucketId: 'bucket-fg2001-w1',
      productCode: 'FG-2001',
      productDescription: 'Additive Tube',
      productFamily: 'Additive Tubes',
      proposedQuantity: 12000,
      uom: 'PCS',
      proposedLineId: 'line-20',
      proposedLineName: 'Line 20',
      plannedStartDateTime: '2026-06-06T07:00:00.000Z',
      plannedEndDateTime: '2026-06-06T11:00:00.000Z',
      durationHours: 4,
      dueDate: '2026-06-08',
      priority: 'Critical',
      readinessPreview: 'Warning',
      capacityStatus: 'Feasible',
      materialRisk: 'Medium',
      inventoryImpact: 'Neutral',
      aiConfidence: 'Medium',
      aiReasoning:
        'Moved from Line 30 to Line 20 to reduce overload. Material CAP-204 replenishment is close to planned start. The MPS assistant flagged the material risk and recommended monitoring. Priority is Critical due to firm customer demand.',
      recommendationSummary: 'Critical demand — moved to Line 20, material risk flagged',
      expectedImpact: 'Reduces Line 30 overload risk. Material CAP-204 requires monitoring.',
      constraintNotes: 'CAP-204 replenishment expected close to production start date. Escalate if not confirmed.',
      status: 'PendingReview',
      selected: false,
    },
    {
      id: 'wop-0005',
      proposalNumber: 'WOP-0005',
      sourceMpsId: mpsId,
      sourceMpsBucketId: 'bucket-fg2001-w3',
      productCode: 'FG-2001',
      productDescription: 'Additive Tube',
      productFamily: 'Additive Tubes',
      proposedQuantity: 10000,
      uom: 'PCS',
      proposedLineId: 'line-20',
      proposedLineName: 'Line 20',
      plannedStartDateTime: '2026-06-20T07:00:00.000Z',
      plannedEndDateTime: '2026-06-20T10:30:00.000Z',
      durationHours: 3.5,
      dueDate: '2026-06-22',
      priority: 'Critical',
      readinessPreview: 'Warning',
      capacityStatus: 'Feasible',
      materialRisk: 'High',
      inventoryImpact: 'Neutral',
      aiConfidence: 'Low',
      aiReasoning:
        'Week 3 FG-2001 volume shifted from Week 2 due to CAP-204 material shortage. Replenishment expected Week 3 but exact timing is uncertain. Planner review required before approval.',
      recommendationSummary: 'Week 3 rescheduled volume — high material risk, needs review',
      expectedImpact: 'Accommodates material delay but introduces schedule risk.',
      constraintNotes: 'CAP-204 replenishment timing is uncertain. Confirm with procurement before approving.',
      status: 'NeedsReview',
      selected: false,
    },
    {
      id: 'wop-0006',
      proposalNumber: 'WOP-0006',
      sourceMpsId: mpsId,
      sourceMpsBucketId: 'bucket-fg3001-w2',
      productCode: 'FG-3001',
      productDescription: 'Gel Product',
      productFamily: 'Gel Products',
      proposedQuantity: 20000,
      uom: 'PCS',
      proposedLineId: 'line-20',
      proposedLineName: 'Line 20',
      plannedStartDateTime: '2026-06-12T07:00:00.000Z',
      plannedEndDateTime: '2026-06-12T13:00:00.000Z',
      durationHours: 6,
      dueDate: '2026-06-19',
      priority: 'High',
      readinessPreview: 'Ready',
      capacityStatus: 'Feasible',
      materialRisk: 'None',
      inventoryImpact: 'Positive',
      aiConfidence: 'High',
      aiReasoning:
        'Pulled forward from Week 4 to Week 2 to prevent stock falling below minimum in Week 3. The MPS assistant inventory recommendation was applied. Line 20 Week 2 utilization increases to 91% — within warning range but still feasible.',
      recommendationSummary: 'Pull-forward applied — prevents stock breach',
      expectedImpact: 'Prevents minimum stock breach in Week 3. Slightly increases Line 20 load.',
      status: 'PendingReview',
      selected: false,
    },
    {
      id: 'wop-0007',
      proposalNumber: 'WOP-0007',
      sourceMpsId: mpsId,
      sourceMpsBucketId: 'bucket-fg4001-w2',
      productCode: 'FG-4001',
      productDescription: 'Specialty Pack',
      productFamily: 'Specialty',
      proposedQuantity: 8000,
      uom: 'PCS',
      proposedLineId: 'line-30',
      proposedLineName: 'Line 30',
      plannedStartDateTime: '2026-06-10T07:00:00.000Z',
      plannedEndDateTime: '2026-06-10T11:00:00.000Z',
      durationHours: 4,
      dueDate: '2026-06-14',
      priority: 'Medium',
      readinessPreview: 'Blocked',
      capacityStatus: 'MissingData',
      materialRisk: 'None',
      inventoryImpact: 'Neutral',
      aiConfidence: 'Low',
      aiReasoning:
        'Cannot recommend creation until missing production rate for FG-4001 on Line 30 is resolved. The MPS assistant flagged this as a blocker. A master data fix was requested locally but not confirmed.',
      recommendationSummary: 'Blocked — missing production rate master data',
      expectedImpact: 'No execution until production rate is confirmed.',
      constraintNotes: 'Production rate for FG-4001 on Line 30 is missing. Resolve in master data before approving.',
      status: 'Blocked',
      selected: false,
    },
    {
      id: 'wop-0008',
      proposalNumber: 'WOP-0008',
      sourceMpsId: mpsId,
      sourceMpsBucketId: 'bucket-fg5001-w4',
      productCode: 'FG-5001',
      productDescription: 'Low Volume Product',
      productFamily: 'Specialty',
      proposedQuantity: 25000,
      uom: 'PCS',
      proposedLineId: 'line-30',
      proposedLineName: 'Line 30',
      plannedStartDateTime: '2026-06-24T07:00:00.000Z',
      plannedEndDateTime: '2026-06-24T13:00:00.000Z',
      durationHours: 6,
      dueDate: '2026-06-28',
      priority: 'Low',
      readinessPreview: 'Warning',
      capacityStatus: 'Feasible',
      materialRisk: 'None',
      inventoryImpact: 'Negative',
      aiConfidence: 'Medium',
      aiReasoning:
        'Rounded to minimum lot size of 25,000 based on product planning rules. Original demand was 18,000 but falls below minimum. Excess 7,000 units will increase ending stock above target. Planner review recommended.',
      recommendationSummary: 'Rounded to min lot size — inventory impact negative',
      expectedImpact: 'Covers demand but adds excess inventory above target stock level.',
      constraintNotes: 'Quantity increased from 18,000 to 25,000 (minimum lot size rule). Review stock impact.',
      status: 'NeedsReview',
      selected: false,
    },
    {
      id: 'wop-0009',
      proposalNumber: 'WOP-0009',
      sourceMpsId: mpsId,
      sourceMpsBucketId: 'bucket-fg1002-w2',
      productCode: 'FG-1002',
      productDescription: 'Standard Tube B',
      productFamily: 'Standard Tubes',
      proposedQuantity: 15000,
      uom: 'PCS',
      proposedLineId: 'line-10',
      proposedLineName: 'Line 10',
      plannedStartDateTime: '2026-06-09T07:00:00.000Z',
      plannedEndDateTime: '2026-06-09T11:00:00.000Z',
      durationHours: 4,
      dueDate: '2026-06-14',
      priority: 'High',
      readinessPreview: 'Ready',
      capacityStatus: 'Feasible',
      materialRisk: 'None',
      inventoryImpact: 'Positive',
      aiConfidence: 'High',
      aiReasoning:
        'Capacity rebalancing move from Week 3 to Week 2 applied by the MPS assistant. Moves FG-1002 earlier to relieve overloaded Week 3 on Line 30 while keeping Line 10 within feasible range.',
      recommendationSummary: 'Capacity rebalancing move — Week 3 to Week 2',
      expectedImpact: 'Relieves Line 30 Week 3 overload. Line 10 remains within feasible range.',
      status: 'PendingReview',
      selected: false,
    },
    {
      id: 'wop-0010',
      proposalNumber: 'WOP-0010',
      sourceMpsId: mpsId,
      sourceMpsBucketId: 'bucket-fg3001-w3',
      productCode: 'FG-3001',
      productDescription: 'Gel Product',
      productFamily: 'Gel Products',
      proposedQuantity: 18000,
      uom: 'PCS',
      proposedLineId: 'line-20',
      proposedLineName: 'Line 20',
      plannedStartDateTime: '2026-06-18T07:00:00.000Z',
      plannedEndDateTime: '2026-06-18T12:00:00.000Z',
      durationHours: 5,
      dueDate: '2026-06-22',
      priority: 'Medium',
      readinessPreview: 'Warning',
      capacityStatus: 'AtRisk',
      materialRisk: 'Low',
      inventoryImpact: 'Neutral',
      aiConfidence: 'Medium',
      aiReasoning:
        'Residual FG-3001 Week 3 volume after the pull-forward. Line 20 is at risk in Week 3 due to cumulative load. Material availability is acceptable but flagged as low risk due to shelf life constraints.',
      recommendationSummary: 'Residual Week 3 volume — capacity at risk',
      expectedImpact: 'Covers residual demand but Line 20 utilization is elevated.',
      constraintNotes: 'Line 20 Week 3 cumulative load is elevated. Review if additional volume is added.',
      status: 'NeedsReview',
      selected: false,
    },
    {
      id: 'wop-0011',
      proposalNumber: 'WOP-0011',
      sourceMpsId: mpsId,
      sourceMpsBucketId: 'bucket-fg5001-w2',
      productCode: 'FG-5001',
      productDescription: 'Low Volume Product',
      productFamily: 'Specialty',
      proposedQuantity: 13000,
      uom: 'PCS',
      proposedLineId: 'line-30',
      proposedLineName: 'Line 30',
      plannedStartDateTime: '2026-06-11T07:00:00.000Z',
      plannedEndDateTime: '2026-06-11T10:00:00.000Z',
      durationHours: 3,
      dueDate: '2026-06-15',
      priority: 'Low',
      readinessPreview: 'Ready',
      capacityStatus: 'Feasible',
      materialRisk: 'None',
      inventoryImpact: 'Neutral',
      aiConfidence: 'High',
      aiReasoning:
        'Trimmed commitment applied by the MPS capacity recommendation to reduce Line 30 overload in Week 4. Quantity adjusted from 18,000 to 13,000 to bring utilization within target.',
      recommendationSummary: 'Trimmed commitment — Line 30 capacity relief',
      expectedImpact: 'Reduces Line 30 Week 4 overload. Demand partially covered.',
      status: 'PendingReview',
      selected: false,
    },
    {
      id: 'wop-0012',
      proposalNumber: 'WOP-0012',
      sourceMpsId: mpsId,
      sourceMpsBucketId: 'bucket-fg2001-w2',
      productCode: 'FG-2001',
      productDescription: 'Additive Tube',
      productFamily: 'Additive Tubes',
      proposedQuantity: 12000,
      uom: 'PCS',
      proposedLineId: 'line-20',
      proposedLineName: 'Line 20',
      plannedStartDateTime: '2026-06-13T07:00:00.000Z',
      plannedEndDateTime: '2026-06-13T11:00:00.000Z',
      durationHours: 4,
      dueDate: '2026-06-15',
      priority: 'Critical',
      readinessPreview: 'Ready',
      capacityStatus: 'Feasible',
      materialRisk: 'None',
      inventoryImpact: 'Positive',
      aiConfidence: 'High',
      aiReasoning:
        'FG-2001 Week 2 balance run on Line 20 after line assignment recommendation was applied. Material CAP-204 risk resolved by the procurement escalation. All readiness checks pass.',
      recommendationSummary: 'Pre-approved by planner — ready for creation',
      expectedImpact: 'Critical demand fully covered. All checks passed.',
      status: 'ApprovedForCreation',
      selected: false,
      approvedBy: 'Danilo Brooks',
      approvedAt: new Date('2026-05-14T09:30:00Z').toISOString(),
    },
  ];
}

export function calculateWorkOrderProposalKpis(proposals: WorkOrderProposal[]): WorkOrderProposalKpis {
  return proposals.reduce(
    (acc, p) => {
      acc.total += 1;
      acc.totalQty += p.proposedQuantity;
      if (p.status === 'PendingReview') acc.pendingReview += 1;
      if (p.status === 'ApprovedForCreation') acc.approvedForCreation += 1;
      if (p.status === 'Rejected') acc.rejected += 1;
      if (p.status === 'NeedsReview') acc.needsReview += 1;
      if (p.status === 'Blocked') acc.blocked += 1;
      if (p.priority === 'High' || p.priority === 'Critical') acc.highCriticalCount += 1;
      return acc;
    },
    {total: 0, pendingReview: 0, approvedForCreation: 0, rejected: 0, needsReview: 0, blocked: 0, totalQty: 0, highCriticalCount: 0},
  );
}

export function filterWorkOrderProposals(
  proposals: WorkOrderProposal[],
  filters: WorkOrderProposalFiltersState,
): WorkOrderProposal[] {
  return proposals.filter((p) => {
    if (filters.status && p.status !== filters.status) return false;
    if (filters.product && !p.productCode.toLowerCase().includes(filters.product.toLowerCase()) && !p.productDescription.toLowerCase().includes(filters.product.toLowerCase())) return false;
    if (filters.line && p.proposedLineName !== filters.line) return false;
    if (filters.priority && p.priority !== filters.priority) return false;
    if (filters.readinessPreview && p.readinessPreview !== filters.readinessPreview) return false;
    if (filters.capacityStatus && p.capacityStatus !== filters.capacityStatus) return false;
    if (filters.materialRisk && p.materialRisk !== filters.materialRisk) return false;
    if (filters.aiConfidence && p.aiConfidence !== filters.aiConfidence) return false;
    if (filters.showNeedsReview && p.status !== 'NeedsReview') return false;
    if (filters.showBlocked && p.status !== 'Blocked') return false;
    return true;
  });
}

export function canApproveProposal(proposal: WorkOrderProposal): boolean {
  return proposal.status !== 'Blocked' && proposal.status !== 'ApprovedForCreation' && proposal.status !== 'Rejected';
}

export function approveWorkOrderProposal(
  proposals: WorkOrderProposal[],
  auditEvents: WorkOrderProposalAuditEvent[],
  id: string,
  currentUser: string,
): {proposals: WorkOrderProposal[]; auditEvents: WorkOrderProposalAuditEvent[]} {
  const now = new Date().toISOString();
  const nextProposals = proposals.map((p) =>
    p.id === id && canApproveProposal(p)
      ? {...p, status: 'ApprovedForCreation' as const, approvedBy: currentUser, approvedAt: now, selected: false}
      : p,
  );
  const target = proposals.find((p) => p.id === id);
  const nextAudit = [
    ...auditEvents,
    createWorkOrderProposalAuditEvent({
      proposalId: id,
      user: currentUser,
      eventType: 'ProposalApproved',
      previousValue: target?.status,
      newValue: 'ApprovedForCreation',
    }),
  ];
  return {proposals: nextProposals, auditEvents: nextAudit};
}

export function rejectWorkOrderProposal(
  proposals: WorkOrderProposal[],
  auditEvents: WorkOrderProposalAuditEvent[],
  id: string,
  reason: string,
  currentUser: string,
): {proposals: WorkOrderProposal[]; auditEvents: WorkOrderProposalAuditEvent[]} {
  const now = new Date().toISOString();
  const target = proposals.find((p) => p.id === id);
  const nextProposals = proposals.map((p) =>
    p.id === id
      ? {...p, status: 'Rejected' as const, rejectedBy: currentUser, rejectedAt: now, rejectionReason: reason, selected: false}
      : p,
  );
  const nextAudit = [
    ...auditEvents,
    createWorkOrderProposalAuditEvent({
      proposalId: id,
      user: currentUser,
      eventType: 'ProposalRejected',
      previousValue: target?.status,
      newValue: 'Rejected',
      comment: reason,
    }),
  ];
  return {proposals: nextProposals, auditEvents: nextAudit};
}

export function approveSelectedWorkOrderProposals(
  proposals: WorkOrderProposal[],
  auditEvents: WorkOrderProposalAuditEvent[],
  ids: string[],
  currentUser: string,
): {proposals: WorkOrderProposal[]; auditEvents: WorkOrderProposalAuditEvent[]} {
  const now = new Date().toISOString();
  const eligibleIds = new Set(
    ids.filter((id) => {
      const p = proposals.find((pr) => pr.id === id);
      return p ? canApproveProposal(p) : false;
    }),
  );
  const nextProposals = proposals.map((p) =>
    eligibleIds.has(p.id)
      ? {...p, status: 'ApprovedForCreation' as const, approvedBy: currentUser, approvedAt: now, selected: false}
      : p,
  );
  const nextAudit = [
    ...auditEvents,
    createWorkOrderProposalAuditEvent({
      proposalId: 'batch',
      user: currentUser,
      eventType: 'ProposalsApprovedBatch',
      newValue: `Approved ${eligibleIds.size} proposals`,
    }),
  ];
  return {proposals: nextProposals, auditEvents: nextAudit};
}

export function rejectSelectedWorkOrderProposals(
  proposals: WorkOrderProposal[],
  auditEvents: WorkOrderProposalAuditEvent[],
  ids: string[],
  reason: string,
  currentUser: string,
): {proposals: WorkOrderProposal[]; auditEvents: WorkOrderProposalAuditEvent[]} {
  const now = new Date().toISOString();
  const idSet = new Set(ids);
  const nextProposals = proposals.map((p) =>
    idSet.has(p.id)
      ? {...p, status: 'Rejected' as const, rejectedBy: currentUser, rejectedAt: now, rejectionReason: reason, selected: false}
      : p,
  );
  const nextAudit = [
    ...auditEvents,
    createWorkOrderProposalAuditEvent({
      proposalId: 'batch',
      user: currentUser,
      eventType: 'ProposalsRejectedBatch',
      newValue: `Rejected ${ids.length} proposals`,
      comment: reason,
    }),
  ];
  return {proposals: nextProposals, auditEvents: nextAudit};
}

export function calculateProposalSelectionSummary(proposals: WorkOrderProposal[]): {
  selected: number;
  approveEligible: number;
  rejectEligible: number;
} {
  const selected = proposals.filter((p) => p.selected);
  return {
    selected: selected.length,
    approveEligible: selected.filter((p) => canApproveProposal(p)).length,
    rejectEligible: selected.filter((p) => p.status !== 'Rejected').length,
  };
}
