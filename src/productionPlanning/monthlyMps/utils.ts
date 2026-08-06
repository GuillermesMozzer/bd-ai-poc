import type {
  AuditEvent,
  BucketStatus,
  DemandLineStatus,
  MpsAssistantFinalReadinessStatus,
  MpsBucketLine,
  MpsBucketRowView,
  MpsDemandLine,
  MpsException,
  MpsHealthSummary,
  MpsPlan,
  MpsScenario,
  MrpReadiness,
  MrpReadinessCheck,
  ProductLineCapability,
  ProductPlanningRule,
  ProductionLine,
  ScenarioComparisonRow,
  ValidationMessage,
  ValidationSummary,
  MpsPlanningFiltersState,
} from './types';

function round2(value: number): number {
  return Number.isFinite(value) ? Number(value.toFixed(2)) : 0;
}

function round1(value: number): number {
  return Number.isFinite(value) ? Number(value.toFixed(1)) : 0;
}

function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export function getLineName(lineId: string | null | undefined, lines: ProductionLine[]): string {
  if (!lineId) return 'Unassigned';
  return lines.find((l) => l.id === lineId)?.name ?? lineId;
}

export function getCapability(
  productCode: string,
  lineId: string | null | undefined,
  capabilities: ProductLineCapability[],
): ProductLineCapability | undefined {
  if (!lineId) return undefined;
  return capabilities.find((c) => c.productCode === productCode && c.lineId === lineId && c.active);
}

export function getAvailableHours(
  lineId: string | null | undefined,
  bucketLabel: string,
  lines: ProductionLine[],
): number {
  if (!lineId) return 0;
  const line = lines.find((l) => l.id === lineId);
  if (!line) return 0;
  return line.bucketAvailableHours.find((b) => b.bucketLabel === bucketLabel)?.availableHours ?? 0;
}

export function deriveMpsBucketStatus(
  bucket: MpsBucketLine,
  rule: ProductPlanningRule | undefined,
  capabilities: ProductLineCapability[],
  lines: ProductionLine[],
): BucketStatus {
  if (bucket.status === 'Released') return 'Released';

  const eligibleLineIds = rule?.eligibleLineIds ?? [];
  const hasNoEligibleLine = eligibleLineIds.length === 0;
  const cap = getCapability(bucket.productCode, bucket.assignedLineId, capabilities);
  const hasNoRate = !cap || cap.productionRateUnitsPerHour === null;
  const hasNoLine = !bucket.assignedLineId;
  const availHours = getAvailableHours(bucket.assignedLineId, bucket.bucketLabel, lines);
  const hasMissingHours = !hasNoLine && availHours === 0;

  if (hasNoEligibleLine || hasNoRate || hasNoLine || hasMissingHours) return 'MissingData';

  if (bucket.utilizationPercent > 100 && bucket.availableHours > 0) return 'Overloaded';

  if (rule) {
    if (bucket.plannedQuantity > 0 && bucket.plannedQuantity < rule.minLotSize) return 'BelowLotSize';
    if (bucket.plannedQuantity > rule.maxLotSize) return 'AboveLotSize';
    if (bucket.projectedEndingStock < rule.stockMin || bucket.projectedEndingStock > rule.stockMax) return 'StockRisk';
  }

  if (bucket.utilizationPercent >= 90 && bucket.utilizationPercent <= 100) return 'AtRisk';

  if (bucket.isEdited) return 'RequiresDecision';

  return 'Feasible';
}

export function deriveMpsDemandStatus(
  demandLine: MpsDemandLine,
  bucketLines: MpsBucketLine[],
): DemandLineStatus {
  const buckets = bucketLines.filter((b) => b.demandLineId === demandLine.id);
  const totalPlanned = buckets.reduce((sum, b) => sum + b.plannedQuantity, 0);

  if (totalPlanned === 0) return 'NotStarted';
  if (totalPlanned > demandLine.approvedMonthlyDemand) return 'OverPlanned';
  if (totalPlanned === demandLine.approvedMonthlyDemand) return 'FullyPlanned';

  const hasEdited = buckets.some((b) => b.isEdited);
  if (hasEdited) return 'RequiresDecision';

  return 'PartiallyPlanned';
}

export function calculateMpsDemandAllocation(
  demandLines: MpsDemandLine[],
  bucketLines: MpsBucketLine[],
): MpsDemandLine[] {
  return demandLines.map((dl) => {
    const planned = bucketLines
      .filter((b) => b.demandLineId === dl.id)
      .reduce((sum, b) => sum + b.plannedQuantity, 0);
    const status = deriveMpsDemandStatus({...dl, alreadyPlannedQuantity: planned}, bucketLines);
    return {
      ...dl,
      alreadyPlannedQuantity: planned,
      remainingQuantityToPlan: dl.approvedMonthlyDemand - planned,
      status,
    };
  });
}

export function calculateMpsCapacity(
  bucketLines: MpsBucketLine[],
  lines: ProductionLine[],
  capabilities: ProductLineCapability[],
): MpsBucketLine[] {
  return bucketLines.map((bucket) => {
    const cap = getCapability(bucket.productCode, bucket.assignedLineId, capabilities);
    const rate = cap?.productionRateUnitsPerHour ?? null;
    const availHours = getAvailableHours(bucket.assignedLineId, bucket.bucketLabel, lines);
    const reqHours = rate && bucket.plannedQuantity > 0 ? round2(bucket.plannedQuantity / rate) : 0;
    const remainCap = round2(availHours - reqHours);
    const utilPct = availHours > 0 && reqHours > 0 ? round1((reqHours / availHours) * 100) : 0;
    return {...bucket, requiredHours: reqHours, availableHours: availHours, remainingCapacityHours: remainCap, utilizationPercent: utilPct};
  });
}

export function calculateMpsStockProjection(
  bucketLines: MpsBucketLine[],
  demandLines: MpsDemandLine[],
): MpsBucketLine[] {
  const BUCKETS = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
  const products = [...new Set(bucketLines.map((b) => b.productCode))];

  const updated = [...bucketLines];

  for (const productCode of products) {
    const dl = demandLines.find((d) => d.productCode === productCode);
    const weeklyDemand = dl ? dl.approvedMonthlyDemand / 4 : 0;
    const avgDailyDemand = weeklyDemand / 7;

    let openingStock = -1;
    for (const label of BUCKETS) {
      const idx = updated.findIndex((b) => b.productCode === productCode && b.bucketLabel === label);
      if (idx < 0) continue;
      const row = updated[idx];

      if (openingStock < 0) openingStock = row.projectedOpeningStock;

      const endingStock = openingStock + row.plannedQuantity - weeklyDemand;
      const coverageDays = avgDailyDemand > 0 ? round1(endingStock / avgDailyDemand) : 0;

      updated[idx] = {
        ...row,
        projectedOpeningStock: openingStock,
        projectedDemandConsumption: weeklyDemand,
        projectedEndingStock: endingStock,
        stockCoverageDays: coverageDays,
      };

      openingStock = endingStock;
    }
  }

  return updated;
}

export function buildMpsBucketRowViews(
  bucketLines: MpsBucketLine[],
  lines: ProductionLine[],
  capabilities: ProductLineCapability[],
  rules: ProductPlanningRule[],
): MpsBucketRowView[] {
  return bucketLines.map((bucket) => {
    const rule = rules.find((r) => r.productCode === bucket.productCode);
    const derivedStatus = deriveMpsBucketStatus(bucket, rule, capabilities, lines);
    return {
      ...bucket,
      status: derivedStatus,
      lineName: getLineName(bucket.assignedLineId, lines),
    };
  });
}

export function buildMpsExceptions(
  bucketLines: MpsBucketLine[],
  demandLines: MpsDemandLine[],
  capabilities: ProductLineCapability[],
  rules: ProductPlanningRule[],
  lines: ProductionLine[],
): MpsException[] {
  const exceptions: MpsException[] = [];

  for (const dl of demandLines) {
    const rule = rules.find((r) => r.productCode === dl.productCode);
    if (rule && rule.eligibleLineIds.length === 0) {
      exceptions.push({
        id: uid('exc'),
        severity: 'Blocker',
        category: 'MissingData',
        productCode: dl.productCode,
        reason: `Product ${dl.productCode} has no eligible production line configured.`,
        suggestedAction: 'Add at least one active eligible line in product planning rules.',
      });
    }
    if (dl.remainingQuantityToPlan > 0) {
      exceptions.push({
        id: uid('exc'),
        severity: 'Warning',
        category: 'Planning',
        productCode: dl.productCode,
        reason: `Monthly demand not fully allocated. Remaining: ${dl.remainingQuantityToPlan} ${dl.uom}.`,
        suggestedAction: 'Distribute remaining quantity across available weeks.',
      });
    }
    if (dl.remainingQuantityToPlan < 0) {
      exceptions.push({
        id: uid('exc'),
        severity: 'Warning',
        category: 'Planning',
        productCode: dl.productCode,
        reason: `Product ${dl.productCode} is overplanned by ${Math.abs(dl.remainingQuantityToPlan)} ${dl.uom}.`,
        suggestedAction: 'Reduce planned quantities to match approved monthly demand.',
      });
    }
  }

  for (const bucket of bucketLines) {
    const rule = rules.find((r) => r.productCode === bucket.productCode);
    const cap = getCapability(bucket.productCode, bucket.assignedLineId, capabilities);

    if (!bucket.assignedLineId) {
      exceptions.push({
        id: uid('exc'),
        severity: 'Warning',
        category: 'MissingData',
        productCode: bucket.productCode,
        bucketLabel: bucket.bucketLabel,
        reason: `No production line assigned for ${bucket.productCode} in ${bucket.bucketLabel}.`,
        suggestedAction: 'Assign a production line to enable capacity calculation.',
      });
      continue;
    }

    if (!cap || cap.productionRateUnitsPerHour === null) {
      exceptions.push({
        id: uid('exc'),
        severity: 'Blocker',
        category: 'MissingData',
        productCode: bucket.productCode,
        bucketLabel: bucket.bucketLabel,
        lineId: bucket.assignedLineId ?? undefined,
        reason: `Missing production rate for ${bucket.productCode} on ${getLineName(bucket.assignedLineId, lines)}.`,
        suggestedAction: 'Enter the production rate in product-line capability master data.',
      });
    }

    const availHours = getAvailableHours(bucket.assignedLineId, bucket.bucketLabel, lines);
    if (availHours === 0 && bucket.assignedLineId) {
      exceptions.push({
        id: uid('exc'),
        severity: 'Warning',
        category: 'MissingData',
        productCode: bucket.productCode,
        bucketLabel: bucket.bucketLabel,
        lineId: bucket.assignedLineId,
        reason: `No available hours found for ${getLineName(bucket.assignedLineId, lines)} in ${bucket.bucketLabel}.`,
        suggestedAction: 'Check the capacity calendar for the assigned line and bucket.',
      });
    }

    if (bucket.utilizationPercent > 100 && bucket.availableHours > 0) {
      exceptions.push({
        id: uid('exc'),
        severity: 'Blocker',
        category: 'Capacity',
        productCode: bucket.productCode,
        bucketLabel: bucket.bucketLabel,
        lineId: bucket.assignedLineId ?? undefined,
        reason: `Capacity overload on ${getLineName(bucket.assignedLineId, lines)} in ${bucket.bucketLabel}: ${bucket.utilizationPercent}% utilization.`,
        suggestedAction: 'Reduce planned quantity, move to another week, or assign an alternative line.',
      });
    } else if (bucket.utilizationPercent >= 90) {
      exceptions.push({
        id: uid('exc'),
        severity: 'Warning',
        category: 'Capacity',
        productCode: bucket.productCode,
        bucketLabel: bucket.bucketLabel,
        lineId: bucket.assignedLineId ?? undefined,
        reason: `Utilization above 90% on ${getLineName(bucket.assignedLineId, lines)} in ${bucket.bucketLabel}: ${bucket.utilizationPercent}%.`,
        suggestedAction: 'Review capacity buffer and consider load leveling.',
      });
    }

    if (rule) {
      if (bucket.plannedQuantity > 0 && bucket.plannedQuantity < rule.minLotSize) {
        exceptions.push({
          id: uid('exc'),
          severity: 'Warning',
          category: 'ProductRule',
          productCode: bucket.productCode,
          bucketLabel: bucket.bucketLabel,
          reason: `Planned quantity (${bucket.plannedQuantity}) is below minimum lot size (${rule.minLotSize}) for ${bucket.productCode}.`,
          suggestedAction: 'Increase quantity to at least the minimum lot size or merge with adjacent week.',
        });
      }
      if (bucket.plannedQuantity > rule.maxLotSize) {
        exceptions.push({
          id: uid('exc'),
          severity: 'Blocker',
          category: 'ProductRule',
          productCode: bucket.productCode,
          bucketLabel: bucket.bucketLabel,
          reason: `Planned quantity (${bucket.plannedQuantity}) exceeds maximum lot size (${rule.maxLotSize}) for ${bucket.productCode}.`,
          suggestedAction: 'Split quantity across multiple weeks or confirm exception with reason.',
        });
      }
      if (bucket.projectedEndingStock < rule.stockMin) {
        exceptions.push({
          id: uid('exc'),
          severity: 'Warning',
          category: 'Stock',
          productCode: bucket.productCode,
          bucketLabel: bucket.bucketLabel,
          reason: `Projected ending stock (${bucket.projectedEndingStock}) is below minimum (${rule.stockMin}) after ${bucket.bucketLabel}.`,
          suggestedAction: 'Increase planned production in this or previous week.',
        });
      }
      if (bucket.projectedEndingStock > rule.stockMax) {
        exceptions.push({
          id: uid('exc'),
          severity: 'Warning',
          category: 'Stock',
          productCode: bucket.productCode,
          bucketLabel: bucket.bucketLabel,
          reason: `Projected ending stock (${bucket.projectedEndingStock}) exceeds maximum (${rule.stockMax}) after ${bucket.bucketLabel}.`,
          suggestedAction: 'Reduce planned quantity to avoid excess inventory.',
        });
      }
    }

    if (bucket.isFrozenPeriod && bucket.isEdited && !bucket.constraintReason) {
      exceptions.push({
        id: uid('exc'),
        severity: 'Warning',
        category: 'FrozenPeriod',
        productCode: bucket.productCode,
        bucketLabel: bucket.bucketLabel,
        reason: `Change in frozen period (${bucket.bucketLabel}) for ${bucket.productCode} requires a constraint reason or planner comment.`,
        suggestedAction: 'Add a constraint reason before saving.',
      });
    }
  }

  return exceptions;
}

export function calculateMpsHealthSummary(
  bucketLines: MpsBucketLine[],
  demandLines: MpsDemandLine[],
): MpsHealthSummary {
  const totalApproved = demandLines.reduce((s, d) => s + d.approvedMonthlyDemand, 0);
  const totalPlanned = demandLines.reduce((s, d) => s + d.alreadyPlannedQuantity, 0);
  const remaining = totalApproved - totalPlanned;
  const overplanned = demandLines.reduce((s, d) => s + Math.max(0, -d.remainingQuantityToPlan), 0);

  const withUtil = bucketLines.filter((b) => b.utilizationPercent > 0);
  const avgUtil = withUtil.length > 0
    ? round1(withUtil.reduce((s, b) => s + b.utilizationPercent, 0) / withUtil.length)
    : 0;
  const highestBucket = bucketLines.reduce<MpsBucketLine | null>((best, b) =>
    !best || b.utilizationPercent > best.utilizationPercent ? b : best, null);

  const frozenEdits = bucketLines.filter((b) => b.isFrozenPeriod && b.isEdited).length;

  return {
    totalApprovedDemand: totalApproved,
    totalPlannedQuantity: totalPlanned,
    remainingUnplanned: remaining,
    overplannedQuantity: overplanned,
    avgUtilization: avgUtil,
    highestUtilizationPercent: highestBucket?.utilizationPercent ?? 0,
    highestUtilizationLabel: highestBucket ? `${highestBucket.bucketLabel} / ${highestBucket.assignedLineId ?? 'Unassigned'}` : '-',
    feasibleCount: bucketLines.filter((b) => b.status === 'Feasible').length,
    atRiskCount: bucketLines.filter((b) => b.status === 'AtRisk').length,
    overloadedCount: bucketLines.filter((b) => b.status === 'Overloaded').length,
    stockRiskCount: bucketLines.filter((b) => b.status === 'StockRisk').length,
    missingDataCount: bucketLines.filter((b) => b.status === 'MissingData').length,
    requiresDecisionCount: bucketLines.filter((b) => b.status === 'RequiresDecision').length,
    frozenPeriodEditsCount: frozenEdits,
  };
}

export function calculateMrpReadiness(
  plan: MpsPlan,
  bucketLines: MpsBucketLine[],
  demandLines: MpsDemandLine[],
  exceptions: MpsException[],
  validationRun: boolean,
): MrpReadiness {
  const blockers = exceptions.filter((e) => e.severity === 'Blocker');
  const capacityBlockers = blockers.filter((e) => e.category === 'Capacity');
  const missingDataBlockers = blockers.filter((e) => e.category === 'MissingData');
  const productRuleBlockers = blockers.filter((e) => e.category === 'ProductRule');

  const allDemandAllocated = demandLines.every((d) => d.remainingQuantityToPlan <= 0);
  const noCapacityOverload = capacityBlockers.length === 0;
  const noMissingData = missingDataBlockers.length === 0;
  const noLotSizeBlockers = productRuleBlockers.length === 0;
  const frozenPeriodOk = !bucketLines.some((b) => b.isFrozenPeriod && b.isEdited && !b.constraintReason);
  const isValidated = validationRun;
  const canRelease = plan.status === 'Draft' || plan.status === 'Validated' || plan.status === 'CapacityChecked' || plan.status === 'Adjusted';

  const checks: MrpReadinessCheck[] = [
    {label: 'All monthly demand is allocated', passed: allDemandAllocated, detail: allDemandAllocated ? undefined : 'Some products have unallocated demand.'},
    {label: 'No capacity overload', passed: noCapacityOverload, detail: noCapacityOverload ? undefined : `${capacityBlockers.length} overload(s) found.`},
    {label: 'No missing product-line capability', passed: noMissingData, detail: noMissingData ? undefined : `${missingDataBlockers.length} missing data issue(s).`},
    {label: 'Lot-size blockers resolved', passed: noLotSizeBlockers, detail: noLotSizeBlockers ? undefined : `${productRuleBlockers.length} lot-size blocker(s).`},
    {label: 'Frozen-period changes have reason/comment', passed: frozenPeriodOk, detail: frozenPeriodOk ? undefined : 'Some frozen-period edits are missing constraint reason.'},
    {label: 'MPS has been validated', passed: isValidated, detail: isValidated ? undefined : 'Run Validate MPS before release.'},
    {label: 'MPS is releasable', passed: canRelease, detail: canRelease ? undefined : `Plan status is ${plan.status}.`},
  ];

  return {isReady: checks.every((c) => c.passed), checks};
}

export function validateMpsPlan(
  plan: MpsPlan,
  demandLines: MpsDemandLine[],
  bucketLines: MpsBucketLine[],
  lines: ProductionLine[],
  capabilities: ProductLineCapability[],
  rules: ProductPlanningRule[],
): ValidationSummary {
  const errors: ValidationMessage[] = [];
  const warnings: ValidationMessage[] = [];

  const push = (list: ValidationMessage[], severity: 'Warning' | 'Blocker', code: string, message: string, entityId?: string) => {
    list.push({id: uid('val'), severity, code, message, entityId});
  };

  for (const dl of demandLines) {
    if (!dl.productCode) push(errors, 'Blocker', 'MISSING_PRODUCT', 'Product code is required.', dl.id);
    if (!dl.productDescription) push(errors, 'Blocker', 'MISSING_DESC', 'Product description is required.', dl.id);
    if (!dl.productFamily) push(errors, 'Blocker', 'MISSING_FAMILY', 'Product family is required.', dl.id);
    if (!dl.uom) push(errors, 'Blocker', 'MISSING_UOM', 'Unit of measure is required.', dl.id);
    if (dl.approvedMonthlyDemand < 0) push(errors, 'Blocker', 'INVALID_DEMAND', 'Approved monthly demand must be >= 0.', dl.id);

    const rule = rules.find((r) => r.productCode === dl.productCode);
    if (rule && rule.eligibleLineIds.length === 0) {
      push(errors, 'Blocker', 'NO_ELIGIBLE_LINE', `Product ${dl.productCode} has no eligible production line.`, dl.id);
    }
  }

  for (const bucket of bucketLines) {
    if (bucket.plannedQuantity < 0) push(errors, 'Blocker', 'INVALID_QTY', 'Planned quantity must be >= 0.', bucket.id);

    const rule = rules.find((r) => r.productCode === bucket.productCode);

    if (!bucket.assignedLineId) {
      push(warnings, 'Warning', 'MISSING_LINE', `No line assigned for ${bucket.productCode} ${bucket.bucketLabel}.`, bucket.id);
    } else {
      const line = lines.find((l) => l.id === bucket.assignedLineId);
      if (!line?.active) push(errors, 'Blocker', 'INACTIVE_LINE', `Assigned line is not active for ${bucket.productCode} ${bucket.bucketLabel}.`, bucket.id);

      const cap = getCapability(bucket.productCode, bucket.assignedLineId, capabilities);
      if (!cap) push(errors, 'Blocker', 'LINE_NOT_ELIGIBLE', `Line not eligible for ${bucket.productCode}.`, bucket.id);
      if (cap && cap.productionRateUnitsPerHour === null) push(errors, 'Blocker', 'MISSING_RATE', `Missing production rate for ${bucket.productCode}.`, bucket.id);

      const availHours = getAvailableHours(bucket.assignedLineId, bucket.bucketLabel, lines);
      if (availHours === 0) push(warnings, 'Warning', 'MISSING_HOURS', `No available hours for ${getLineName(bucket.assignedLineId, lines)} in ${bucket.bucketLabel}.`, bucket.id);
    }

    if (rule) {
      if (bucket.plannedQuantity > 0 && bucket.plannedQuantity < rule.minLotSize) {
        push(warnings, 'Warning', 'BELOW_LOT', `Quantity below min lot size for ${bucket.productCode} ${bucket.bucketLabel}.`, bucket.id);
      }
      if (bucket.plannedQuantity > rule.maxLotSize) {
        push(errors, 'Blocker', 'ABOVE_LOT', `Quantity exceeds max lot size for ${bucket.productCode} ${bucket.bucketLabel}.`, bucket.id);
      }
    }

    // Compute utilization inline from source data so validation is not affected by stale cached values
    if (bucket.assignedLineId) {
      const valCap = getCapability(bucket.productCode, bucket.assignedLineId, capabilities);
      const valRate = valCap?.productionRateUnitsPerHour ?? null;
      const valAvail = getAvailableHours(bucket.assignedLineId, bucket.bucketLabel, lines);
      const valReqHrs = valRate && bucket.plannedQuantity > 0 ? bucket.plannedQuantity / valRate : 0;
      const valUtil = valAvail > 0 && valReqHrs > 0 ? (valReqHrs / valAvail) * 100 : 0;
      if (valUtil > 100 && valAvail > 0) {
        push(errors, 'Blocker', 'OVERLOAD', `Capacity overload in ${bucket.bucketLabel} for ${bucket.productCode}.`, bucket.id);
      }
    }

    if (bucket.isFrozenPeriod && bucket.isEdited && !bucket.constraintReason) {
      push(errors, 'Blocker', 'FROZEN_NO_REASON', `Frozen period change requires reason for ${bucket.productCode} ${bucket.bucketLabel}.`, bucket.id);
    }
  }

  return {errors, warnings};
}

export function canReleaseMps(
  plan: MpsPlan,
  exceptions: MpsException[],
  validationRun: boolean,
  assistantReadinessStatus?: MpsAssistantFinalReadinessStatus,
): boolean {
  if (plan.status === 'Released' || plan.status === 'ReleasedWithWarnings' || plan.status === 'Superseded') return false;
  // When the assistant has reached ReadyWithWarnings/ReadyForRelease it has already reviewed
  // and resolved exceptions in step-9 — trust its assessment over the recomputed exception list.
  if (assistantReadinessStatus === 'ReadyWithWarnings' || assistantReadinessStatus === 'ReadyForRelease') return true;
  if (exceptions.some((e) => e.severity === 'Blocker')) return false;
  return validationRun;
}

export function isPlanEditable(plan: MpsPlan): boolean {
  return plan.status !== 'Released' && plan.status !== 'ReleasedWithWarnings' && plan.status !== 'Superseded';
}

export function filterBucketRows(
  rows: MpsBucketRowView[],
  filters: MpsPlanningFiltersState,
  selectedProductCode: string | null,
): MpsBucketRowView[] {
  let result = rows;

  if (selectedProductCode) result = result.filter((r) => r.productCode === selectedProductCode);
  if (filters.productFamily) result = result.filter((r) => r.productFamily === filters.productFamily);
  if (filters.productionLine) result = result.filter((r) => r.assignedLineId === filters.productionLine);
  if (filters.bucket) result = result.filter((r) => r.bucketLabel === filters.bucket);
  if (filters.status) result = result.filter((r) => r.status === filters.status);
  if (filters.priority) {
    // priority is on demand line; rows don't carry it — skip for now
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter((r) =>
      r.productCode.toLowerCase().includes(q) || r.productDescription.toLowerCase().includes(q),
    );
  }
  if (filters.onlyExceptions) {
    const exceptionStatuses: MpsBucketRowView['status'][] = ['AtRisk', 'Overloaded', 'BelowLotSize', 'AboveLotSize', 'StockRisk', 'MissingData', 'RequiresDecision'];
    result = result.filter((r) => exceptionStatuses.includes(r.status));
  }
  if (filters.onlyFrozen) result = result.filter((r) => r.isFrozenPeriod);

  return result;
}

export function applyMpsScenario(
  bucketLines: MpsBucketLine[],
  scenario: MpsScenario,
): MpsBucketLine[] {
  const changeMap = new Map(scenario.changedBucketLines.map((c) => [c.bucketLineId, c]));
  return bucketLines.map((b) => {
    const change = changeMap.get(b.id);
    if (!change) return b;
    return {
      ...b,
      plannedQuantity: change.plannedQuantity,
      assignedLineId: change.assignedLineId !== undefined ? change.assignedLineId : b.assignedLineId,
      isEdited: true,
    };
  });
}

export function buildScenarioComparison(
  baselineBuckets: MpsBucketLine[],
  scenarioBuckets: MpsBucketLine[],
  demandLines: MpsDemandLine[],
): ScenarioComparisonRow[] {
  return scenarioBuckets
    .filter((sb) => {
      const base = baselineBuckets.find((b) => b.id === sb.id);
      return base && (base.plannedQuantity !== sb.plannedQuantity || base.assignedLineId !== sb.assignedLineId);
    })
    .map((sb) => {
      const base = baselineBuckets.find((b) => b.id === sb.id)!;
      const dl = demandLines.find((d) => d.productCode === sb.productCode);
      const baseTotal = baselineBuckets.filter((b) => b.productCode === sb.productCode).reduce((s, b) => s + b.plannedQuantity, 0);
      const scTotal = scenarioBuckets.filter((b) => b.productCode === sb.productCode).reduce((s, b) => s + b.plannedQuantity, 0);
      const approvedDemand = dl?.approvedMonthlyDemand ?? 0;

      return {
        productCode: sb.productCode,
        productDescription: sb.productDescription,
        bucketLabel: sb.bucketLabel,
        baselinePlannedQuantity: base.plannedQuantity,
        scenarioPlannedQuantity: sb.plannedQuantity,
        baselineLineId: base.assignedLineId,
        scenarioLineId: sb.assignedLineId,
        baselineUtilization: base.utilizationPercent,
        scenarioUtilization: sb.utilizationPercent,
        baselineEndingStock: base.projectedEndingStock,
        scenarioEndingStock: sb.projectedEndingStock,
        baselineStatus: base.status,
        scenarioStatus: sb.status,
        deltaRemainingUnplanned: (approvedDemand - baseTotal) - (approvedDemand - scTotal),
        deltaRequiredHours: sb.requiredHours - base.requiredHours,
      };
    });
}

export function createAuditEvent(params: {
  entityType: string;
  entityId: string;
  eventType: string;
  previousValue?: string;
  newValue?: string;
  user: string;
  reasonCode?: string;
  comment?: string;
  sourceScreen?: string;
}): AuditEvent {
  return {
    id: uid('audit'),
    entityType: params.entityType,
    entityId: params.entityId,
    eventType: params.eventType,
    previousValue: params.previousValue,
    newValue: params.newValue,
    user: params.user,
    timestamp: new Date().toISOString(),
    reasonCode: params.reasonCode,
    comment: params.comment,
    sourceScreen: params.sourceScreen ?? 'MpsPlanningPage',
  };
}
