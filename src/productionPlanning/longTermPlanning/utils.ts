import type {
  AuditEvent,
  CalendarDaySummary,
  CalendarFiltersState,
  CalendarMonthSummary,
  CalendarPlanningEvent,
  CapacityResult,
  CapacitySummary,
  ExceptionSeverity,
  LongTermPlan,
  LongTermPlanLine,
  LongTermPlanRowView,
  LongTermPlanningFiltersState,
  PlanHealthSummary,
  PlanningException,
  PlanningScenario,
  ProductLineCapability,
  ProductionLine,
  ScenarioComparisonRow,
  ScenarioLineChange,
  ValidationMessage,
  ValidationSummary,
} from './types';

const STALE_SOURCE_THRESHOLD_HOURS = 72;
const severityRank: Record<ExceptionSeverity, number> = {
  Info: 0,
  Warning: 1,
  Blocker: 2,
};
type PlanningRowLike = LongTermPlanLine | LongTermPlanRowView;

function round(value: number) {
  return Number.isFinite(value) ? Number(value.toFixed(2)) : 0;
}

function normalizeMonth(value: string) {
  return value.slice(0, 7);
}

function startOfMonth(month: string) {
  return `${normalizeMonth(month)}-01`;
}

function endOfMonth(month: string) {
  const [year, monthValue] = normalizeMonth(month).split('-').map(Number);
  const nextMonth = new Date(Date.UTC(year, monthValue, 1));
  nextMonth.setUTCDate(0);
  return nextMonth.toISOString().slice(0, 10);
}

function toIsoDate(value: string) {
  return value.slice(0, 10);
}

function dateToMonth(value: string) {
  return value.slice(0, 7);
}

function buildCapacityMap(capacityResults: CapacityResult[]) {
  return new Map(capacityResults.map((item) => [item.planLineId, item]));
}

function coerceCalendarRows(planLines: PlanningRowLike[], capacityResults: CapacityResult[]) {
  const capacityById = buildCapacityMap(capacityResults);
  return planLines.map<LongTermPlanRowView>((line) => {
    if ('requiredHours' in line && 'assignedLineName' in line) {
      return line;
    }
    const capacityResult = capacityById.get(line.id);
    const status = derivePlanningStatus(capacityResult, []);
    return {
      ...line,
      assignedLineName: line.assignedLineId ?? 'Unassigned',
      requiredHours: capacityResult?.requiredHours ?? 0,
      availableHours: capacityResult?.availableHours ?? 0,
      utilizationPercent: capacityResult?.utilizationPercent ?? 0,
      uncoveredQuantity: capacityResult?.uncoveredQuantity ?? Math.max(line.requestedQuantity - (line.committedQuantity ?? line.requestedQuantity), 0),
      status,
      pendingChanges: false,
      hasExceptions: status !== 'Feasible',
      validationMessages: [],
      capacityResult,
    };
  });
}

function buildPlanningImpact(row: LongTermPlanRowView): CalendarPlanningEvent['impact'] {
  return {
    requestedQuantity: row.requestedQuantity,
    committedQuantity: typeof row.committedQuantity === 'number' ? row.committedQuantity : row.requestedQuantity,
    uncoveredQuantity: row.uncoveredQuantity,
    requiredHours: row.requiredHours,
    availableHours: row.availableHours,
    utilizationPercent: row.utilizationPercent,
  };
}

function overlapsDateRange(event: CalendarPlanningEvent, startDate: string, endDate: string) {
  return event.startDate <= endDate && event.endDate >= startDate;
}

function buildSuggestedAction(row: LongTermPlanRowView) {
  if (row.status === 'Constrained') {
    return `Review commitment, line assignment, or available hours for ${row.productCode}.`;
  }
  if (row.status === 'AtRisk') {
    return `Protect capacity buffer for ${row.productCode} before releasing the month.`;
  }
  if (row.status === 'PendingData') {
    return `Complete missing master data for ${row.productCode} and rerun the review.`;
  }
  if (row.status === 'NotProducible') {
    return `Qualify or activate a supported line for ${row.productCode}.`;
  }
  if (row.status === 'RequiresDecision') {
    return `Planner decision is still pending for ${row.productCode}.`;
  }
  return `Continue monitoring ${row.productCode} in the selected month.`;
}

function buildMessageId(prefix: string, lineId: string, field: string) {
  return `${prefix}-${lineId}-${field}`;
}

export function getPlanMonths(plan: LongTermPlan) {
  const months: string[] = [];
  const cursor = new Date(`${plan.horizonStartMonth}-01T00:00:00`);
  const end = new Date(`${plan.horizonEndMonth}-01T00:00:00`);
  while (cursor <= end) {
    months.push(cursor.toISOString().slice(0, 7));
    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }
  return months;
}

export function isSourceStale(sourceTimestamp: string, thresholdHours = STALE_SOURCE_THRESHOLD_HOURS) {
  const sourceTime = new Date(sourceTimestamp).getTime();
  if (Number.isNaN(sourceTime)) {
    return true;
  }
  return Date.now() - sourceTime > thresholdHours * 60 * 60 * 1000;
}

export function getEligibleCapabilities(productCode: string, capabilities: ProductLineCapability[]) {
  return capabilities.filter((item) => item.productCode === productCode && item.active);
}

export function getLineName(lineId: string | null | undefined, productionLines: ProductionLine[]) {
  if (!lineId) {
    return 'Unassigned';
  }
  return productionLines.find((line) => line.id === lineId)?.name ?? lineId;
}

export function isPlanEditable(plan?: LongTermPlan | null) {
  return Boolean(plan) && plan.status !== 'Released' && plan.status !== 'Superseded';
}

export function validateLongTermPlan(
  plan: LongTermPlan,
  planLines: LongTermPlanLine[],
  productionLines: ProductionLine[],
  capabilities: ProductLineCapability[],
) : ValidationSummary {
  const horizonMonths = new Set(getPlanMonths(plan));
  const errors: ValidationMessage[] = [];
  const warnings: ValidationMessage[] = [];
  const affectedLineIds = new Set<string>();
  const affectedFields = new Set<string>();
  const duplicateKeys = new Map<string, string[]>();

  if (!plan.source) {
    errors.push({
      id: 'plan-source-missing',
      severity: 'Blocker',
      code: 'MISSING_SOURCE',
      message: 'Plan source is required.',
      field: 'source',
      affectedFields: ['source'],
    });
    affectedFields.add('source');
  }

  if (!plan.version) {
    errors.push({
      id: 'plan-version-missing',
      severity: 'Blocker',
      code: 'MISSING_VERSION',
      message: 'Plan version is required.',
      field: 'version',
      affectedFields: ['version'],
    });
    affectedFields.add('version');
  }

  if (isSourceStale(plan.sourceTimestamp)) {
    warnings.push({
      id: 'plan-source-stale',
      severity: 'Warning',
      code: 'STALE_SOURCE',
      message: 'Source data is stale and should be refreshed before release.',
      field: 'sourceTimestamp',
      affectedFields: ['sourceTimestamp'],
    });
    affectedFields.add('sourceTimestamp');
  }

  for (const line of planLines) {
    const duplicateKey = `${line.productCode}__${normalizeMonth(line.month)}`;
    const keys = duplicateKeys.get(duplicateKey) ?? [];
    keys.push(line.id);
    duplicateKeys.set(duplicateKey, keys);

    if (!line.productCode) {
      errors.push({
        id: buildMessageId('missing-product', line.id, 'productCode'),
        severity: 'Blocker',
        code: 'MISSING_PRODUCT',
        message: 'Product code is required.',
        planLineId: line.id,
        month: line.month,
        field: 'productCode',
        affectedFields: ['productCode'],
      });
      affectedLineIds.add(line.id);
      affectedFields.add('productCode');
    }

    if (!line.uom) {
      errors.push({
        id: buildMessageId('missing-uom', line.id, 'uom'),
        severity: 'Blocker',
        code: 'MISSING_UOM',
        message: `UOM is required for ${line.productCode || 'this line'}.`,
        planLineId: line.id,
        productCode: line.productCode,
        month: line.month,
        field: 'uom',
        affectedFields: ['uom'],
      });
      affectedLineIds.add(line.id);
      affectedFields.add('uom');
    }

    if (!horizonMonths.has(normalizeMonth(line.month))) {
      errors.push({
        id: buildMessageId('month-outside-horizon', line.id, 'month'),
        severity: 'Blocker',
        code: 'MONTH_OUTSIDE_HORIZON',
        message: `${line.productCode || 'Line'} has a month outside the 12-month horizon.`,
        planLineId: line.id,
        productCode: line.productCode,
        month: line.month,
        field: 'month',
        affectedFields: ['month'],
      });
      affectedLineIds.add(line.id);
      affectedFields.add('month');
    }

    if (typeof line.requestedQuantity !== 'number' || Number.isNaN(line.requestedQuantity)) {
      errors.push({
        id: buildMessageId('requested-not-numeric', line.id, 'requestedQuantity'),
        severity: 'Blocker',
        code: 'REQUESTED_NOT_NUMERIC',
        message: `${line.productCode || 'Line'} must have a numeric requested quantity.`,
        planLineId: line.id,
        productCode: line.productCode,
        month: line.month,
        field: 'requestedQuantity',
        affectedFields: ['requestedQuantity'],
      });
      affectedLineIds.add(line.id);
      affectedFields.add('requestedQuantity');
    } else if (line.requestedQuantity < 0) {
      errors.push({
        id: buildMessageId('requested-negative', line.id, 'requestedQuantity'),
        severity: 'Blocker',
        code: 'NEGATIVE_REQUESTED_QUANTITY',
        message: `${line.productCode || 'Line'} has a negative requested quantity.`,
        planLineId: line.id,
        productCode: line.productCode,
        month: line.month,
        field: 'requestedQuantity',
        affectedFields: ['requestedQuantity'],
      });
      affectedLineIds.add(line.id);
      affectedFields.add('requestedQuantity');
    }

    const eligibleCapabilities = getEligibleCapabilities(line.productCode, capabilities);
    if (!eligibleCapabilities.length) {
      errors.push({
        id: buildMessageId('no-eligible-line', line.id, 'assignedLineId'),
        severity: 'Blocker',
        code: 'NO_ELIGIBLE_LINE',
        message: `Product ${line.productCode || 'Unknown'} has no active eligible production line.`,
        planLineId: line.id,
        productCode: line.productCode,
        month: line.month,
        field: 'assignedLineId',
        affectedFields: ['assignedLineId'],
        statusHint: 'NotProducible',
      });
      affectedLineIds.add(line.id);
      affectedFields.add('assignedLineId');
      continue;
    }

    if (line.assignedLineId && !eligibleCapabilities.some((item) => item.lineId === line.assignedLineId)) {
      errors.push({
        id: buildMessageId('assigned-line-not-eligible', line.id, 'assignedLineId'),
        severity: 'Blocker',
        code: 'ASSIGNED_LINE_NOT_ELIGIBLE',
        message: `Assigned line is not eligible for product ${line.productCode}.`,
        planLineId: line.id,
        productCode: line.productCode,
        month: line.month,
        field: 'assignedLineId',
        lineId: line.assignedLineId,
        affectedFields: ['assignedLineId'],
      });
      affectedLineIds.add(line.id);
      affectedFields.add('assignedLineId');
    }

    const selectedCapability =
      eligibleCapabilities.find((item) => item.lineId === line.assignedLineId) ??
      eligibleCapabilities[0];

    if (!selectedCapability?.productionRateUnitsPerHour) {
      warnings.push({
        id: buildMessageId('missing-rate', line.id, 'productionRateUnitsPerHour'),
        severity: 'Warning',
        code: 'MISSING_PRODUCTION_RATE',
        message: `Missing production rate for ${line.productCode} on ${getLineName(line.assignedLineId ?? selectedCapability?.lineId, productionLines)}.`,
        planLineId: line.id,
        productCode: line.productCode,
        month: line.month,
        field: 'productionRateUnitsPerHour',
        lineId: line.assignedLineId ?? selectedCapability?.lineId,
        affectedFields: ['productionRateUnitsPerHour'],
        statusHint: 'PendingData',
      });
      affectedLineIds.add(line.id);
      affectedFields.add('productionRateUnitsPerHour');
    }

    const selectedLineId = line.assignedLineId ?? selectedCapability?.lineId;
    const productionLine = productionLines.find((item) => item.id === selectedLineId);
    const availableHours = productionLine?.monthlyAvailableHours.find(
      (item) => normalizeMonth(item.month) === normalizeMonth(line.month),
    );
    if (!availableHours) {
      warnings.push({
        id: buildMessageId('missing-available-hours', line.id, 'availableHours'),
        severity: 'Warning',
        code: 'MISSING_AVAILABLE_HOURS',
        message: `Monthly available hours are missing for ${getLineName(selectedLineId, productionLines)} in ${normalizeMonth(line.month)}.`,
        planLineId: line.id,
        productCode: line.productCode,
        month: line.month,
        field: 'availableHours',
        lineId: selectedLineId,
        affectedFields: ['availableHours'],
        statusHint: 'PendingData',
      });
      affectedLineIds.add(line.id);
      affectedFields.add('availableHours');
    }
  }

  for (const [duplicateKey, ids] of duplicateKeys.entries()) {
    if (ids.length < 2) {
      continue;
    }
    const [productCode, month] = duplicateKey.split('__');
    for (const lineId of ids) {
      errors.push({
        id: buildMessageId('duplicate-line', lineId, 'duplicate'),
        severity: 'Blocker',
        code: 'DUPLICATE_PRODUCT_MONTH',
        message: `Duplicate product/month combination found for ${productCode} in ${month}.`,
        planLineId: lineId,
        productCode,
        month,
        field: 'month',
        affectedFields: ['productCode', 'month'],
      });
      affectedLineIds.add(lineId);
      affectedFields.add('productCode');
      affectedFields.add('month');
    }
  }

  return {
    status: errors.length ? 'Invalid' : warnings.length ? 'Warning' : 'Valid',
    errors,
    warnings,
    affectedLineIds: [...affectedLineIds],
    affectedFields: [...affectedFields],
  };
}

export function calculateCapacity(
  planLines: LongTermPlanLine[],
  productionLines: ProductionLine[],
  capabilities: ProductLineCapability[],
) {
  const results: CapacityResult[] = [];
  for (const line of planLines) {
    const eligibleCapabilities = getEligibleCapabilities(line.productCode, capabilities);
    const selectedCapability =
      eligibleCapabilities.find((item) => item.lineId === line.assignedLineId) ??
      eligibleCapabilities[0];
    const selectedLineId = line.assignedLineId ?? selectedCapability?.lineId ?? null;
    const productionLine = productionLines.find((item) => item.id === selectedLineId);
    const monthlyHours = productionLine?.monthlyAvailableHours.find(
      (item) => normalizeMonth(item.month) === normalizeMonth(line.month),
    );
    const committedQuantity =
      typeof line.committedQuantity === 'number' && !Number.isNaN(line.committedQuantity)
        ? line.committedQuantity
        : line.requestedQuantity;
    const rate = selectedCapability?.productionRateUnitsPerHour ?? null;
    const availableHours = monthlyHours?.availableHours ?? 0;
    const requiredHours = rate && rate > 0 ? committedQuantity / rate : 0;
    const remainingHours = availableHours - requiredHours;
    const utilizationPercent = availableHours > 0 ? (requiredHours / availableHours) * 100 : 0;
    const uncoveredQuantity = Math.max(line.requestedQuantity - committedQuantity, 0);

    let status: CapacityResult['status'] = 'Feasible';
    let reason = '';

    if (!eligibleCapabilities.length) {
      status = 'NotProducible';
      reason = `Product ${line.productCode} has no active eligible line.`;
    } else if (!line.assignedLineId) {
      status = 'PendingData';
      reason = `Line assignment is required for ${line.productCode}.`;
    } else if (!rate || !availableHours) {
      status = 'PendingData';
      reason = `Missing capacity master data for ${line.productCode}.`;
    } else if (requiredHours > availableHours || uncoveredQuantity > 0) {
      status = 'Constrained';
      reason = `Capacity overload on ${getLineName(selectedLineId, productionLines)} in ${normalizeMonth(line.month)}.`;
    } else if (utilizationPercent >= 90) {
      status = 'AtRisk';
      reason = `Utilization exceeds 90% on ${getLineName(selectedLineId, productionLines)}.`;
    }

    results.push({
      planLineId: line.id,
      month: normalizeMonth(line.month),
      productCode: line.productCode,
      lineId: selectedLineId,
      requestedQuantity: line.requestedQuantity,
      committedQuantity,
      productionRateUnitsPerHour: rate,
      requiredHours: round(requiredHours),
      availableHours: round(availableHours),
      remainingHours: round(remainingHours),
      utilizationPercent: round(utilizationPercent),
      uncoveredQuantity: round(uncoveredQuantity),
      status,
      reason,
    });
  }
  return results;
}

export function derivePlanningStatus(
  capacityResult: CapacityResult | undefined,
  validationMessages: ValidationMessage[],
  options?: { sourceStale?: boolean; requiresDecision?: boolean; hasWarnings?: boolean },
) {
  if (options?.requiresDecision) {
    return 'RequiresDecision' as const;
  }

  if (validationMessages.some((item) => item.statusHint === 'PendingData') || capacityResult?.status === 'PendingData') {
    return 'PendingData' as const;
  }

  if (validationMessages.some((item) => item.statusHint === 'NotProducible') || capacityResult?.status === 'NotProducible') {
    return 'NotProducible' as const;
  }

  if (capacityResult?.status === 'Constrained' || (capacityResult?.requiredHours ?? 0) > (capacityResult?.availableHours ?? 0) || (capacityResult?.uncoveredQuantity ?? 0) > 0) {
    return 'Constrained' as const;
  }

  if (
    capacityResult?.status === 'AtRisk' ||
    ((capacityResult?.utilizationPercent ?? 0) >= 90 && (capacityResult?.utilizationPercent ?? 0) <= 100) ||
    options?.sourceStale ||
    options?.hasWarnings ||
    validationMessages.some((item) => item.severity === 'Warning')
  ) {
    return 'AtRisk' as const;
  }

  return 'Feasible' as const;
}

export function buildExceptions(
  plan: LongTermPlan,
  validationMessages: ValidationMessage[],
  capacityResults: CapacityResult[],
  productionLines: ProductionLine[],
) {
  const exceptions: PlanningException[] = [];

  for (const message of validationMessages) {
    exceptions.push({
      id: `exception-${message.id}`,
      severity: message.severity === 'Blocker' ? 'Blocker' : 'Warning',
      product: message.productCode ?? plan.name,
      month: message.month ?? normalizeMonth(plan.horizonStartMonth),
      line: getLineName(message.lineId, productionLines),
      reason: message.message,
      suggestedAction:
        message.code === 'STALE_SOURCE'
          ? 'Refresh the imported plan before releasing.'
          : message.statusHint === 'PendingData'
            ? 'Complete the missing master data and rerun validation.'
            : 'Review the highlighted planning line and correct the data.',
      planLineId: message.planLineId,
    });
  }

  for (const result of capacityResults) {
    if (result.status === 'Feasible') {
      continue;
    }
    exceptions.push({
      id: `capacity-${result.planLineId}`,
      severity: result.status === 'Constrained' || result.status === 'NotProducible' ? 'Blocker' : 'Warning',
      product: result.productCode,
      month: result.month,
      line: getLineName(result.lineId, productionLines),
      reason:
        result.reason ||
        (result.status === 'Constrained'
          ? 'Committed quantity is lower than requested demand.'
          : 'Planner review required.'),
      suggestedAction:
        result.status === 'Constrained'
          ? 'Rebalance committed quantity, line assignment, or available hours.'
          : result.status === 'NotProducible'
            ? 'Assign an eligible line or update the capability master data.'
            : result.status === 'PendingData'
              ? 'Load missing capacity rate or calendar data.'
              : 'Review this at-risk month before release.',
      planLineId: result.planLineId,
    });
  }

  return exceptions;
}

export function createAuditEvent(input: Omit<AuditEvent, 'id' | 'timestamp'>): AuditEvent {
  return {
    ...input,
    id: `AUD-LTP-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    timestamp: new Date().toISOString(),
  };
}

export function applyScenarioChanges(planLines: LongTermPlanLine[], changes: ScenarioLineChange[]) {
  const changeMap = new Map(changes.map((item) => [item.planLineId, item]));
  return planLines.map((line) => {
    const change = changeMap.get(line.id);
    if (!change) {
      return {...line};
    }
    return {
      ...line,
      committedQuantity: typeof change.committedQuantity === 'number' ? change.committedQuantity : line.committedQuantity,
      assignedLineId: typeof change.assignedLineId === 'string' ? change.assignedLineId : line.assignedLineId,
      plannerComment: change.plannerComment ?? line.plannerComment,
    };
  });
}

export function buildScenarioComparison(
  baselineLines: LongTermPlanLine[],
  scenario: PlanningScenario,
  productionLines: ProductionLine[],
  capabilities: ProductLineCapability[],
  validationMessages: ValidationMessage[],
) {
  const baselineCopy = baselineLines.map((line) => ({...line}));
  const scenarioLines = applyScenarioChanges(baselineCopy, scenario.changedLines);
  const baselineCapacity = calculateCapacity(baselineCopy, productionLines, capabilities);
  const scenarioCapacity = calculateCapacity(scenarioLines, productionLines, capabilities);

  const baselineCapacityById = new Map(baselineCapacity.map((item) => [item.planLineId, item]));
  const scenarioCapacityById = new Map(scenarioCapacity.map((item) => [item.planLineId, item]));
  const messagesByLine = validationMessages.reduce<Map<string, ValidationMessage[]>>((acc, message) => {
    if (!message.planLineId) {
      return acc;
    }
    const list = acc.get(message.planLineId) ?? [];
    list.push(message);
    acc.set(message.planLineId, list);
    return acc;
  }, new Map());

  const comparison: ScenarioComparisonRow[] = [];
  for (const change of scenario.changedLines) {
    const baselineLine = baselineCopy.find((line) => line.id === change.planLineId);
    const scenarioLine = scenarioLines.find((line) => line.id === change.planLineId);
    if (!baselineLine || !scenarioLine) {
      continue;
    }
    const baselineResult = baselineCapacityById.get(change.planLineId);
    const scenarioResult = scenarioCapacityById.get(change.planLineId);
    const messages = messagesByLine.get(change.planLineId) ?? [];
    comparison.push({
      planLineId: change.planLineId,
      productCode: baselineLine.productCode,
      month: normalizeMonth(baselineLine.month),
      baselineCommittedQuantity: baselineResult?.committedQuantity ?? baselineLine.requestedQuantity,
      scenarioCommittedQuantity: scenarioResult?.committedQuantity ?? scenarioLine.requestedQuantity,
      baselineStatus: derivePlanningStatus(baselineResult, messages),
      scenarioStatus: derivePlanningStatus(scenarioResult, messages),
      baselineUtilization: round(baselineResult?.utilizationPercent ?? 0),
      scenarioUtilization: round(scenarioResult?.utilizationPercent ?? 0),
      uncoveredQuantityDelta: round((scenarioResult?.uncoveredQuantity ?? 0) - (baselineResult?.uncoveredQuantity ?? 0)),
      requiredHoursDelta: round((scenarioResult?.requiredHours ?? 0) - (baselineResult?.requiredHours ?? 0)),
    });
  }

  return {
    comparison,
    scenarioLines,
  };
}

export function buildRowViews(
  planLines: LongTermPlanLine[],
  productionLines: ProductionLine[],
  validationMessages: ValidationMessage[],
  capacityResults: CapacityResult[],
  pendingLineIds: Set<string>,
  sourceStale: boolean,
) {
  const messagesByLine = validationMessages.reduce<Map<string, ValidationMessage[]>>((acc, message) => {
    if (!message.planLineId) {
      return acc;
    }
    const list = acc.get(message.planLineId) ?? [];
    list.push(message);
    acc.set(message.planLineId, list);
    return acc;
  }, new Map());
  const capacityByLine = new Map(capacityResults.map((item) => [item.planLineId, item]));

  return planLines.map<LongTermPlanRowView>((line) => {
    const messages = messagesByLine.get(line.id) ?? [];
    const capacityResult = capacityByLine.get(line.id);
    const status = derivePlanningStatus(capacityResult, messages, {
      sourceStale,
      requiresDecision: pendingLineIds.has(line.id),
      hasWarnings: messages.some((item) => item.severity === 'Warning'),
    });
    return {
      ...line,
      assignedLineName: getLineName(line.assignedLineId ?? capacityResult?.lineId, productionLines),
      requiredHours: capacityResult?.requiredHours ?? 0,
      availableHours: capacityResult?.availableHours ?? 0,
      utilizationPercent: capacityResult?.utilizationPercent ?? 0,
      uncoveredQuantity: capacityResult?.uncoveredQuantity ?? 0,
      status,
      pendingChanges: pendingLineIds.has(line.id),
      hasExceptions: status !== 'Feasible' || messages.length > 0,
      validationMessages: messages,
      capacityResult,
    };
  });
}

export function filterRows(rows: LongTermPlanRowView[], filters: LongTermPlanningFiltersState) {
  return rows.filter((row) => {
    if (filters.productFamily && row.productFamily !== filters.productFamily) {
      return false;
    }
    if (filters.productionLine && row.assignedLineId !== filters.productionLine) {
      return false;
    }
    if (filters.status && row.status !== filters.status) {
      return false;
    }
    if (filters.demandSource && row.demandSource !== filters.demandSource) {
      return false;
    }
    if (filters.monthStart && normalizeMonth(row.month) < filters.monthStart) {
      return false;
    }
    if (filters.monthEnd && normalizeMonth(row.month) > filters.monthEnd) {
      return false;
    }
    if (filters.onlyExceptions && !row.hasExceptions) {
      return false;
    }
    if (filters.search) {
      const searchValue = filters.search.toLowerCase();
      const target = `${row.productCode} ${row.productDescription}`.toLowerCase();
      if (!target.includes(searchValue)) {
        return false;
      }
    }
    return true;
  });
}

export function summarizeCapacity(rows: LongTermPlanRowView[]): CapacitySummary {
  const totals = rows.reduce(
    (acc, row) => {
      acc.totalRequiredHours += row.requiredHours;
      acc.totalAvailableHours += row.availableHours;
      if (row.status === 'Feasible') acc.feasibleItems += 1;
      if (row.status === 'Constrained') acc.constrainedItems += 1;
      if (row.status === 'AtRisk') acc.atRiskItems += 1;
      if (row.status === 'PendingData') acc.pendingDataItems += 1;
      if (row.status === 'NotProducible') acc.notProducibleItems += 1;
      if (row.status === 'RequiresDecision') acc.requiresDecisionItems += 1;
      return acc;
    },
    {
      totalRequiredHours: 0,
      totalAvailableHours: 0,
      feasibleItems: 0,
      constrainedItems: 0,
      atRiskItems: 0,
      pendingDataItems: 0,
      notProducibleItems: 0,
      requiresDecisionItems: 0,
    },
  );

  return {
    totalRequiredHours: round(totals.totalRequiredHours),
    totalAvailableHours: round(totals.totalAvailableHours),
    remainingHours: round(totals.totalAvailableHours - totals.totalRequiredHours),
    averageUtilizationPercent: rows.length ? round(rows.reduce((sum, row) => sum + row.utilizationPercent, 0) / rows.length) : 0,
    feasibleItems: totals.feasibleItems,
    constrainedItems: totals.constrainedItems,
    atRiskItems: totals.atRiskItems,
    pendingDataItems: totals.pendingDataItems,
    notProducibleItems: totals.notProducibleItems,
    requiresDecisionItems: totals.requiresDecisionItems,
  };
}

export function calculatePlanHealthSummary(rows: LongTermPlanRowView[]): PlanHealthSummary {
  let totalRequestedQuantity = 0;
  let totalCommittedQuantity = 0;
  let feasibleItems = 0;
  let atRiskItems = 0;
  let constrainedItems = 0;
  let pendingDataItems = 0;
  let notProducibleItems = 0;
  let requiresDecisionItems = 0;
  let overloadedLineMonths = 0;
  let highestUtil = 0;
  let highestUtilizationMonth = '';

  const monthUtilMap = new Map<string, {requiredHours: number; availableHours: number}>();

  for (const row of rows) {
    totalRequestedQuantity += row.requestedQuantity;
    totalCommittedQuantity += typeof row.committedQuantity === 'number' ? row.committedQuantity : row.requestedQuantity;
    if (row.status === 'Feasible') feasibleItems += 1;
    else if (row.status === 'AtRisk') atRiskItems += 1;
    else if (row.status === 'Constrained') constrainedItems += 1;
    else if (row.status === 'PendingData') pendingDataItems += 1;
    else if (row.status === 'NotProducible') notProducibleItems += 1;
    else if (row.status === 'RequiresDecision') requiresDecisionItems += 1;

    if (row.requiredHours > row.availableHours && row.availableHours > 0) {
      overloadedLineMonths += 1;
    }

    const monthKey = `${row.assignedLineId ?? 'unassigned'}__${row.month.slice(0, 7)}`;
    const current = monthUtilMap.get(monthKey) ?? {requiredHours: 0, availableHours: 0};
    current.requiredHours += row.requiredHours;
    current.availableHours = Math.max(current.availableHours, row.availableHours);
    monthUtilMap.set(monthKey, current);
  }

  for (const [key, value] of monthUtilMap.entries()) {
    const util = value.availableHours > 0 ? (value.requiredHours / value.availableHours) * 100 : 0;
    if (util > highestUtil) {
      highestUtil = util;
      highestUtilizationMonth = key.split('__')[1] ?? '';
    }
  }

  const totalUtil = rows.length > 0
    ? rows.reduce((sum, row) => sum + row.utilizationPercent, 0) / rows.length
    : 0;

  return {
    totalRequestedQuantity: round(totalRequestedQuantity),
    totalCommittedQuantity: round(totalCommittedQuantity),
    commitmentGap: round(Math.max(totalRequestedQuantity - totalCommittedQuantity, 0)),
    averageUtilizationPercent: round(totalUtil),
    feasibleItems,
    atRiskItems,
    constrainedItems,
    pendingDataItems,
    notProducibleItems,
    requiresDecisionItems,
    overloadedLineMonths,
    highestUtilizationMonth,
  };
}

export function buildMonthlyUtilizationDataset(rows: LongTermPlanRowView[]) {
  const byMonth = new Map<string, { requiredHours: number; availableHours: number }>();
  for (const row of rows) {
    const month = normalizeMonth(row.month);
    const current = byMonth.get(month) ?? {requiredHours: 0, availableHours: 0};
    current.requiredHours += row.requiredHours;
    current.availableHours += row.availableHours;
    byMonth.set(month, current);
  }
  return [...byMonth.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, value]) => ({
      month,
      utilizationPercent: value.availableHours > 0 ? round((value.requiredHours / value.availableHours) * 100) : 0,
    }));
}

export function mapPlanningRowsToCalendarEvents(
  planLines: PlanningRowLike[],
  capacityResults: CapacityResult[],
) {
  const rows = coerceCalendarRows(planLines, capacityResults);
  const events: CalendarPlanningEvent[] = [];

  for (const row of rows) {
    const base = {
      date: startOfMonth(row.month),
      startDate: startOfMonth(row.month),
      endDate: endOfMonth(row.month),
      month: normalizeMonth(row.month),
      site: undefined,
      lineId: row.assignedLineId,
      productCode: row.productCode,
      impact: buildPlanningImpact(row),
    };

    if (row.status === 'Constrained') {
      events.push({
        id: `event-constrained-${row.id}`,
        title: `${row.productCode} constrained demand`,
        type: 'ConstrainedDemand',
        severity: row.uncoveredQuantity > 0 || row.requiredHours > row.availableHours ? 'Blocker' : 'Warning',
        description: row.constraintReason || row.capacityResult?.reason || 'Demand is constrained in the selected month.',
        source: 'Plan',
        ...base,
      });
    }

    if (row.status === 'AtRisk') {
      events.push({
        id: `event-risk-${row.id}`,
        title: `${row.productCode} at risk`,
        type: 'AtRisk',
        severity: 'Warning',
        description: row.constraintReason || row.capacityResult?.reason || 'Utilization is close to the available capacity limit.',
        source: 'Capacity',
        ...base,
      });
    }

    if (row.uncoveredQuantity > 0) {
      events.push({
        id: `event-uncovered-${row.id}`,
        title: `${row.productCode} uncovered demand`,
        type: 'UncoveredDemand',
        severity: 'Blocker',
        description: `${row.uncoveredQuantity.toLocaleString()} units remain uncovered for the month.`,
        source: 'Plan',
        ...base,
      });
    }

    if (row.requiredHours > row.availableHours && row.availableHours > 0) {
      events.push({
        id: `event-overload-${row.id}`,
        title: `${row.productCode} capacity overload`,
        type: 'CapacityOverload',
        severity: 'Blocker',
        description: `Required hours exceed available hours on ${row.assignedLineName}.`,
        source: 'Capacity',
        ...base,
      });
    }

    if (row.status === 'PendingData') {
      events.push({
        id: `event-pending-${row.id}`,
        title: `${row.productCode} pending data`,
        type: 'Validation',
        severity: 'Warning',
        description: row.constraintReason || row.capacityResult?.reason || 'Pending data blocks a confident capacity decision.',
        source: 'Plan',
        ...base,
      });
    }
  }

  return events;
}

export function getCalendarEventsForDate(events: CalendarPlanningEvent[], date: string) {
  const isoDate = toIsoDate(date);
  return events.filter((event) => overlapsDateRange(event, isoDate, isoDate));
}

export function getCalendarEventsForMonth(events: CalendarPlanningEvent[], month: string) {
  return events.filter((event) => overlapsDateRange(event, startOfMonth(month), endOfMonth(month)));
}

export function calculateCalendarSeverity(summary: {blockerCount: number; warningCount: number}): ExceptionSeverity {
  if (summary.blockerCount > 0) {
    return 'Blocker';
  }
  if (summary.warningCount > 0) {
    return 'Warning';
  }
  return 'Info';
}

export function filterCalendarEvents(events: CalendarPlanningEvent[], filters: CalendarFiltersState) {
  return events.filter((event) => {
    if (filters.eventType && event.type !== filters.eventType) {
      return false;
    }
    if (filters.severity && event.severity !== filters.severity) {
      return false;
    }
    if (filters.source && event.source !== filters.source) {
      return false;
    }
    if (filters.impactType && event.impact[filters.impactType] === 0) {
      return false;
    }
    return true;
  });
}

export function getLongTermPlanningMonthSummary(
  planLines: PlanningRowLike[],
  capacityResults: CapacityResult[],
  events: CalendarPlanningEvent[],
  month: string,
): CalendarMonthSummary {
  const rows = coerceCalendarRows(planLines, capacityResults).filter((row) => normalizeMonth(row.month) === normalizeMonth(month));
  const monthEvents = getCalendarEventsForMonth(events, month);
  const topConstraints = [...new Set(
    rows
      .map((row) => row.constraintReason || row.capacityResult?.reason || row.validationMessages[0]?.message)
      .filter((item): item is string => Boolean(item)),
  )].slice(0, 3);

  const summary = rows.reduce(
    (acc, row) => {
      acc.requestedQuantity += row.requestedQuantity;
      acc.committedQuantity += typeof row.committedQuantity === 'number' ? row.committedQuantity : row.requestedQuantity;
      acc.uncoveredQuantity += row.uncoveredQuantity;
      acc.requiredHours += row.requiredHours;
      acc.availableHours += row.availableHours;
      if (row.status === 'Feasible') acc.feasibleCount += 1;
      if (row.status === 'AtRisk') acc.atRiskCount += 1;
      if (row.status === 'Constrained') acc.constrainedCount += 1;
      if (row.status === 'PendingData') acc.pendingDataCount += 1;
      if (row.status === 'NotProducible') acc.notProducibleCount += 1;
      return acc;
    },
    {
      requestedQuantity: 0,
      committedQuantity: 0,
      uncoveredQuantity: 0,
      requiredHours: 0,
      availableHours: 0,
      feasibleCount: 0,
      atRiskCount: 0,
      constrainedCount: 0,
      pendingDataCount: 0,
      notProducibleCount: 0,
    },
  );

  const blockerCount = monthEvents.filter((event) => event.severity === 'Blocker').length;
  const warningCount = monthEvents.filter((event) => event.severity === 'Warning').length;

  return {
    month: normalizeMonth(month),
    year: Number(normalizeMonth(month).slice(0, 4)),
    requestedQuantity: round(summary.requestedQuantity),
    committedQuantity: round(summary.committedQuantity),
    uncoveredQuantity: round(summary.uncoveredQuantity),
    requiredHours: round(summary.requiredHours),
    availableHours: round(summary.availableHours),
    utilizationPercent: summary.availableHours > 0 ? round((summary.requiredHours / summary.availableHours) * 100) : 0,
    totalPlanningRows: rows.length,
    feasibleCount: summary.feasibleCount,
    atRiskCount: summary.atRiskCount,
    constrainedCount: summary.constrainedCount,
    pendingDataCount: summary.pendingDataCount,
    notProducibleCount: summary.notProducibleCount,
    eventCount: monthEvents.length,
    blockerCount,
    warningCount,
    topConstraints,
  };
}

export function getLongTermPlanningYearSummary(
  planLines: PlanningRowLike[],
  capacityResults: CapacityResult[],
  events: CalendarPlanningEvent[],
  year: number,
) {
  return Array.from({length: 12}, (_, index) => {
    const month = `${year}-${String(index + 1).padStart(2, '0')}`;
    return getLongTermPlanningMonthSummary(planLines, capacityResults, events, month);
  });
}

export function getLongTermPlanningDaySummary(
  planLines: PlanningRowLike[],
  capacityResults: CapacityResult[],
  events: CalendarPlanningEvent[],
  date: string,
): CalendarDaySummary {
  const rows = coerceCalendarRows(planLines, capacityResults);
  const month = dateToMonth(date);
  const monthRows = rows.filter((row) => normalizeMonth(row.month) === month);
  const dayEvents = getCalendarEventsForDate(events, date);
  const monthSummary = getLongTermPlanningMonthSummary(rows, capacityResults, events, month);
  const affectedProducts = [...new Set([
    ...monthRows.map((row) => row.productCode),
    ...dayEvents.map((event) => event.productCode).filter((value): value is string => Boolean(value)),
  ])];
  const affectedLines = [...new Set([
    ...monthRows.map((row) => row.assignedLineName),
    ...dayEvents.map((event) => event.lineId).filter((value): value is string => Boolean(value)),
  ])];
  const constraints = [...new Set([
    ...monthRows.map((row) => row.constraintReason || row.capacityResult?.reason || row.validationMessages[0]?.message).filter((value): value is string => Boolean(value)),
    ...dayEvents.filter((event) => event.severity !== 'Info').map((event) => event.description),
  ])];
  const suggestedActions = [...new Set([
    ...monthRows.map((row) => buildSuggestedAction(row)),
    ...dayEvents
      .filter((event) => event.severity !== 'Info')
      .map((event) => event.severity === 'Blocker' ? `Resolve ${event.type} before release.` : `Monitor ${event.type} during execution planning.`),
  ])];
  const blockerCount = dayEvents.filter((event) => event.severity === 'Blocker').length;
  const warningCount = dayEvents.filter((event) => event.severity === 'Warning').length;

  return {
    date: toIsoDate(date),
    requestedQuantity: monthSummary.requestedQuantity,
    committedQuantity: monthSummary.committedQuantity,
    uncoveredQuantity: monthSummary.uncoveredQuantity,
    requiredHours: monthSummary.requiredHours,
    availableHours: monthSummary.availableHours,
    utilizationPercent: monthSummary.utilizationPercent,
    eventCount: dayEvents.length,
    blockerCount,
    warningCount,
    events: dayEvents.sort((left, right) => severityRank[right.severity] - severityRank[left.severity]),
    planningRows: monthRows,
    affectedProducts,
    affectedLines,
    constraints,
    suggestedActions,
    highestSeverity: calculateCalendarSeverity({blockerCount, warningCount}),
    fallbackMessage: 'Demand Forecast is maintained at monthly level. This day view shows calendar events and the monthly planning summary for the selected period.',
  };
}

export function canReleasePlan(plan: LongTermPlan | null, validationRun: boolean, exceptions: PlanningException[]) {
  if (!plan || !validationRun || !isPlanEditable(plan)) {
    return false;
  }
  return !exceptions.some((item) => item.severity === 'Blocker');
}
