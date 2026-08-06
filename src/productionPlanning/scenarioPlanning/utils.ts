import type {
  BaselineImpactRow,
  BucketType,
  CapacityStatus,
  PeriodImpact,
  PeriodSummaryRow,
  ReadinessStatus,
  ScenarioAuditEvent,
  ScenarioAuditEventType,
  ScenarioChange,
  ScenarioException,
  ScenarioImpactSummary,
  ScenarioPlan,
  ScenarioSeverity,
  StockStatus,
  SuggestedAction,
  TopImpactedProduct,
  UtilizationChartPoint,
} from './types';

// ── Baseline product/line config used for simulation ────────────────────────

// Rates calibrated so baseline ~70-87% utilization; +20% demand + downtime causes overloads.
const PRODUCT_CONFIG: Record<string, {baseMonthlyDemand: number; productionRatePerHour: number; minStock: number; maxStock: number; openingStock: number}> = {
  'FG-1001': {baseMonthlyDemand: 20000, productionRatePerHour: 50,  minStock: 5000,  maxStock: 30000, openingStock: 12000},
  'FG-1002': {baseMonthlyDemand: 15000, productionRatePerHour: 45,  minStock: 4000,  maxStock: 25000, openingStock: 9000},
  'FG-2001': {baseMonthlyDemand: 18000, productionRatePerHour: 48,  minStock: 4500,  maxStock: 28000, openingStock: 10000},
  'FG-3001': {baseMonthlyDemand: 12000, productionRatePerHour: 36,  minStock: 3000,  maxStock: 20000, openingStock: 8000},
  'FG-4001': {baseMonthlyDemand: 8000,  productionRatePerHour: 28,  minStock: 2000,  maxStock: 15000, openingStock: 6000},
  'FG-5001': {baseMonthlyDemand: 5000,  productionRatePerHour: 28,  minStock: 1000,  maxStock: 10000, openingStock: 4000},
};

const PRODUCT_DESCS: Record<string, string> = {
  'FG-1001': 'Standard Tube A',
  'FG-1002': 'Standard Tube B',
  'FG-2001': 'Additive Tube',
  'FG-3001': 'Gel Product',
  'FG-4001': 'Specialty Pack',
  'FG-5001': 'Low Volume Product',
};

const PRODUCT_FAMILIES: Record<string, string> = {
  'FG-1001': 'Tubes',
  'FG-1002': 'Tubes',
  'FG-2001': 'Tubes',
  'FG-3001': 'Gels',
  'FG-4001': 'Specialty',
  'FG-5001': 'Specialty',
};

const LINE_MONTHLY_HOURS: Record<string, number> = {
  'Line 10': 480,
  'Line 20': 460,
  'Line 30': 440,
};

const PRODUCT_LINE_MAP: Record<string, string> = {
  'FG-1001': 'Line 10',
  'FG-1002': 'Line 10',
  'FG-2001': 'Line 20',
  'FG-3001': 'Line 20',
  'FG-4001': 'Line 30',
  'FG-5001': 'Line 30',
};

const WEEKLY_HOURS_PER_LINE = 128;

// ── Status derivation ────────────────────────────────────────────────────────

export function deriveCapacityStatus(utilizationPct: number): CapacityStatus {
  if (utilizationPct > 100) return 'Overloaded';
  if (utilizationPct >= 90) return 'AtRisk';
  return 'Feasible';
}

export function deriveStockStatus(endingStock: number, minStock: number, maxStock: number): StockStatus {
  if (endingStock < minStock) return 'BelowMin';
  if (endingStock > maxStock) return 'AboveMax';
  return 'OK';
}

export function deriveReadinessStatus(capacityStatus: CapacityStatus, stockStatus: StockStatus): ReadinessStatus {
  if (capacityStatus === 'Overloaded' || stockStatus === 'BelowMin') return 'NotReady';
  return 'Ready';
}

export function deriveSeverity(capacityStatus: CapacityStatus, stockStatus: StockStatus): ScenarioSeverity {
  if (capacityStatus === 'Overloaded') return 'Blocker';
  if (capacityStatus === 'AtRisk' || stockStatus === 'BelowMin') return 'Warning';
  return 'Info';
}

// ── Checks if a scenario change affects a given period ──────────────────────

function demandMultiplierForPeriod(changes: ScenarioChange[], period: string): number {
  let multiplier = 1.0;
  for (const chg of changes) {
    if (!chg.active) continue;
    if (chg.category !== 'DemandChange') continue;
    const periods = getLTPeriodsBetween(chg.startPeriod, chg.endPeriod);
    if (periods.includes(period) || chg.startPeriod === period || chg.endPeriod === period) {
      const pct = typeof chg.scenarioValue === 'number' ? chg.scenarioValue : 0;
      multiplier *= 1 + pct / 100;
    }
  }
  return multiplier;
}

function capacityMultiplierForPeriodLine(changes: ScenarioChange[], period: string, lineId: string): number {
  let multiplier = 1.0;
  for (const chg of changes) {
    if (!chg.active) continue;
    if (chg.category !== 'CapacityChange') continue;
    if (chg.lineId && chg.lineId !== lineId) continue;
    const periods = getLTPeriodsBetween(chg.startPeriod, chg.endPeriod);
    if (periods.includes(period) || chg.startPeriod === period || chg.endPeriod === period) {
      const pct = typeof chg.scenarioValue === 'number' ? chg.scenarioValue : 100;
      multiplier *= pct / 100;
    }
  }
  return multiplier;
}

function downtimeHoursForPeriodLine(changes: ScenarioChange[], period: string, lineId: string): number {
  let extraDowntime = 0;
  for (const chg of changes) {
    if (!chg.active) continue;
    if (chg.category !== 'CalendarEvent') continue;
    if (chg.lineId && chg.lineId !== lineId) continue;
    const downtimePeriod = period.toLowerCase();
    if (downtimePeriod.includes('jul') || chg.startPeriod.toLowerCase().includes('jul')) {
      const days = typeof chg.deltaValue === 'number' ? Math.abs(chg.deltaValue) : 5;
      extraDowntime += days * 16;
    }
  }
  return extraDowntime;
}

// Simple helper: list LT periods between start and end (inclusive)
function getLTPeriodsBetween(start: string, end: string): string[] {
  const ALL_PERIODS = [
    'Jun 2026', 'Jul 2026', 'Aug 2026', 'Sep 2026', 'Oct 2026', 'Nov 2026',
    'Dec 2026', 'Jan 2027', 'Feb 2027', 'Mar 2027', 'Apr 2027', 'May 2027',
  ];
  const si = ALL_PERIODS.indexOf(start);
  const ei = ALL_PERIODS.indexOf(end);
  if (si < 0 || ei < 0) return [start, end];
  return ALL_PERIODS.slice(si, ei + 1);
}

// ── Core simulation: build BaselineImpactRows ────────────────────────────────

export function buildBaselineImpactRows(
  scenarioId: string,
  changes: ScenarioChange[],
  periods: string[],
  bucketType: BucketType,
): BaselineImpactRow[] {
  const productCodes = Object.keys(PRODUCT_CONFIG);
  const rows: BaselineImpactRow[] = [];
  let idCounter = 1;

  const hoursPerPeriod = bucketType === 'Month' ? LINE_MONTHLY_HOURS : {
    'Line 10': WEEKLY_HOURS_PER_LINE,
    'Line 20': WEEKLY_HOURS_PER_LINE,
    'Line 30': WEEKLY_HOURS_PER_LINE,
  };

  for (const productCode of productCodes) {
    const cfg = PRODUCT_CONFIG[productCode];
    const lineId = PRODUCT_LINE_MAP[productCode];
    let runningBaselineStock = cfg.openingStock;
    let runningScenarioStock = cfg.openingStock;

    for (const period of periods) {
      const demandMult = demandMultiplierForPeriod(changes, period);
      const capMult = capacityMultiplierForPeriodLine(changes, period, lineId);
      const downtimeHrs = downtimeHoursForPeriodLine(changes, period, lineId);

      const baseAvailHours = (hoursPerPeriod as Record<string, number>)[lineId] ?? 480;
      const scenAvailHours = Math.max(0, baseAvailHours * capMult - downtimeHrs);

      const baseReqQty = cfg.baseMonthlyDemand;
      const scenReqQty = Math.round(cfg.baseMonthlyDemand * demandMult);

      const baseReqHours = baseReqQty / cfg.productionRatePerHour;
      const scenReqHours = scenReqQty / cfg.productionRatePerHour;

      const baseCommitted = Math.min(baseReqQty, baseAvailHours * cfg.productionRatePerHour);
      const scenCommitted = Math.min(scenReqQty, scenAvailHours * cfg.productionRatePerHour);

      const baseUtilPct = baseAvailHours > 0 ? (baseReqHours / baseAvailHours) * 100 : 0;
      const scenUtilPct = scenAvailHours > 0 ? (scenReqHours / scenAvailHours) * 100 : 0;

      const baseUncovered = Math.max(0, baseReqQty - baseCommitted);
      const scenUncovered = Math.max(0, scenReqQty - scenCommitted);

      runningBaselineStock = runningBaselineStock + baseCommitted - baseReqQty;
      runningScenarioStock = runningScenarioStock + scenCommitted - scenReqQty;

      const baseCapStatus = deriveCapacityStatus(baseUtilPct);
      const scenCapStatus = deriveCapacityStatus(scenUtilPct);
      const baseStockStatus = deriveStockStatus(runningBaselineStock, cfg.minStock, cfg.maxStock);
      const scenStockStatus = deriveStockStatus(runningScenarioStock, cfg.minStock, cfg.maxStock);

      rows.push({
        id: `row-${idCounter++}`,
        productCode,
        productDescription: PRODUCT_DESCS[productCode] ?? productCode,
        productFamily: PRODUCT_FAMILIES[productCode] ?? '',
        period,
        bucketType,
        baselineRequestedQuantity: baseReqQty,
        scenarioRequestedQuantity: scenReqQty,
        baselineCommittedQuantity: Math.round(baseCommitted),
        scenarioCommittedQuantity: Math.round(scenCommitted),
        baselineRequiredHours: Math.round(baseReqHours),
        scenarioRequiredHours: Math.round(scenReqHours),
        baselineAvailableHours: Math.round(baseAvailHours),
        scenarioAvailableHours: Math.round(scenAvailHours),
        baselineUtilizationPercent: Math.round(baseUtilPct * 10) / 10,
        scenarioUtilizationPercent: Math.round(scenUtilPct * 10) / 10,
        baselineUncoveredQuantity: Math.round(baseUncovered),
        scenarioUncoveredQuantity: Math.round(scenUncovered),
        baselineEndingStock: Math.round(runningBaselineStock),
        scenarioEndingStock: Math.round(runningScenarioStock),
        baselineCapacityStatus: baseCapStatus,
        scenarioCapacityStatus: scenCapStatus,
        baselineStockStatus: baseStockStatus,
        scenarioStockStatus: scenStockStatus,
        baselineReadinessStatus: deriveReadinessStatus(baseCapStatus, baseStockStatus),
        scenarioReadinessStatus: deriveReadinessStatus(scenCapStatus, scenStockStatus),
      });
    }
  }

  return rows;
}

// ── Aggregate by period: PeriodSummaryRow ───────────────────────────────────

export function buildPeriodSummaryRows(
  rows: BaselineImpactRow[],
  periods: string[],
  bucketType: BucketType,
): PeriodSummaryRow[] {
  return periods.map((period) => {
    const periodRows = rows.filter((r) => r.period === period);
    if (periodRows.length === 0) {
      return {
        period, bucketType,
        baselineUtilizationPercent: 0, scenarioUtilizationPercent: 0, utilizationDelta: 0,
        uncoveredDemand: 0, inventoryDelta: 0,
        capacityStatus: 'Feasible', stockStatus: 'OK', readinessStatus: 'Ready',
      };
    }

    const baseUtil = periodRows.reduce((s, r) => s + r.baselineUtilizationPercent, 0) / periodRows.length;
    const scenUtil = periodRows.reduce((s, r) => s + r.scenarioUtilizationPercent, 0) / periodRows.length;
    const uncovered = periodRows.reduce((s, r) => s + r.scenarioUncoveredQuantity, 0);
    const invDelta = periodRows.reduce((s, r) => s + (r.scenarioEndingStock - r.baselineEndingStock), 0);

    const worstCap = periodRows.reduce<CapacityStatus>((worst, r) => {
      if (r.scenarioCapacityStatus === 'Overloaded') return 'Overloaded';
      if (r.scenarioCapacityStatus === 'AtRisk' && worst !== 'Overloaded') return 'AtRisk';
      return worst;
    }, 'Feasible');

    const worstStock = periodRows.reduce<StockStatus>((worst, r) => {
      if (r.scenarioStockStatus === 'BelowMin') return 'BelowMin';
      if (r.scenarioStockStatus === 'AboveMax' && worst !== 'BelowMin') return 'AboveMax';
      return worst;
    }, 'OK');

    return {
      period,
      bucketType,
      baselineUtilizationPercent: Math.round(baseUtil * 10) / 10,
      scenarioUtilizationPercent: Math.round(scenUtil * 10) / 10,
      utilizationDelta: Math.round((scenUtil - baseUtil) * 10) / 10,
      uncoveredDemand: uncovered,
      inventoryDelta: invDelta,
      capacityStatus: worstCap,
      stockStatus: worstStock,
      readinessStatus: deriveReadinessStatus(worstCap, worstStock),
    };
  });
}

// ── Impact Summary ──────────────────────────────────────────────────────────

export function calculateScenarioImpactSummary(
  rows: BaselineImpactRow[],
  periodRows: PeriodSummaryRow[],
): ScenarioImpactSummary {
  const totalBaselineDemand = rows.reduce((s, r) => s + r.baselineRequestedQuantity, 0);
  const totalScenarioDemand = rows.reduce((s, r) => s + r.scenarioRequestedQuantity, 0);
  const demandChangeUnits = totalScenarioDemand - totalBaselineDemand;

  const baselineUncovered = rows.reduce((s, r) => s + r.baselineUncoveredQuantity, 0);
  const scenarioUncovered = rows.reduce((s, r) => s + r.scenarioUncoveredQuantity, 0);
  const commitmentGapUnits = scenarioUncovered - baselineUncovered;
  const uncoveredDemandDelta = commitmentGapUnits;

  const overloadedPeriods = periodRows.filter((p) => p.capacityStatus === 'Overloaded').length;
  const inventoryBelowMinCount = periodRows.filter((p) => p.stockStatus === 'BelowMin').length;

  const hasBlocker = overloadedPeriods > 0 || inventoryBelowMinCount > 0;
  const hasWarning = periodRows.some((p) => p.capacityStatus === 'AtRisk');
  const mrpReadinessImpact: import('./types').ReadinessStatus = hasBlocker ? 'NotReady' : 'Ready';
  const overallSeverity: import('./types').ScenarioSeverity = hasBlocker ? 'Blocker' : hasWarning ? 'Warning' : 'Info';

  const baselineCap = rows.reduce((s, r) => s + r.baselineAvailableHours, 0);
  const scenarioCap = rows.reduce((s, r) => s + r.scenarioAvailableHours, 0);
  const capacityHoursDelta = scenarioCap - baselineCap;

  const affectedProducts = new Set(rows.filter((r) => r.scenarioUncoveredQuantity > 0 || r.scenarioCapacityStatus !== r.baselineCapacityStatus).map((r) => r.productCode));
  const affectedLines = new Set(rows.filter((r) => r.scenarioCapacityStatus !== r.baselineCapacityStatus).map((r) => PRODUCT_LINE_MAP[r.productCode]).filter(Boolean));

  return {
    demandChangeUnits,
    demandChangePercent: totalBaselineDemand > 0 ? Math.round((demandChangeUnits / totalBaselineDemand) * 1000) / 10 : 0,
    commitmentGapUnits,
    overloadedPeriods,
    inventoryBelowMinCount,
    mrpReadinessImpact,
    overallSeverity,
    capacityHoursDelta,
    uncoveredDemandDelta,
    affectedProductsCount: affectedProducts.size,
    affectedLinesCount: affectedLines.size,
  };
}

// ── Period impacts (for Timeline tab) ──────────────────────────────────────

export function buildPeriodImpacts(
  rows: BaselineImpactRow[],
  periods: string[],
  bucketType: BucketType,
): PeriodImpact[] {
  return periods.map((period) => {
    const periodRows = rows.filter((r) => r.period === period);

    const demandDelta = periodRows.reduce((s, r) => s + (r.scenarioRequestedQuantity - r.baselineRequestedQuantity), 0);
    const capacityDelta = periodRows.reduce((s, r) => s + (r.scenarioAvailableHours - r.baselineAvailableHours), 0);
    const inventoryDelta = periodRows.reduce((s, r) => s + (r.scenarioEndingStock - r.baselineEndingStock), 0);
    const uncoveredDelta = periodRows.reduce((s, r) => s + (r.scenarioUncoveredQuantity - r.baselineUncoveredQuantity), 0);

    const baseUtil = periodRows.length > 0 ? periodRows.reduce((s, r) => s + r.baselineUtilizationPercent, 0) / periodRows.length : 0;
    const scenUtil = periodRows.length > 0 ? periodRows.reduce((s, r) => s + r.scenarioUtilizationPercent, 0) / periodRows.length : 0;

    const worstCap = periodRows.reduce<CapacityStatus>((w, r) => {
      if (r.scenarioCapacityStatus === 'Overloaded') return 'Overloaded';
      if (r.scenarioCapacityStatus === 'AtRisk' && w !== 'Overloaded') return 'AtRisk';
      return w;
    }, 'Feasible');

    const worstStock = periodRows.reduce<import('./types').StockStatus>((w, r) => {
      if (r.scenarioStockStatus === 'BelowMin') return 'BelowMin';
      return w;
    }, 'OK');

    const severity = deriveSeverity(worstCap, worstStock);
    const readinessStatus = deriveReadinessStatus(worstCap, worstStock);

    let mainConstraint = 'No significant constraint';
    if (worstCap === 'Overloaded') mainConstraint = 'Capacity overload';
    else if (worstCap === 'AtRisk') mainConstraint = 'Capacity at risk';
    else if (worstStock === 'BelowMin') mainConstraint = 'Inventory below minimum';

    const affectedProducts = [...new Set(periodRows.filter((r) => r.scenarioUncoveredQuantity > 0 || r.scenarioCapacityStatus !== 'Feasible').map((r) => r.productCode))];
    const affectedLines = [...new Set(affectedProducts.map((p) => PRODUCT_LINE_MAP[p]).filter(Boolean))];

    return {
      period,
      bucketType,
      demandDelta,
      capacityDelta,
      inventoryDelta,
      uncoveredDelta,
      utilizationBaseline: Math.round(baseUtil * 10) / 10,
      utilizationScenario: Math.round(scenUtil * 10) / 10,
      readinessStatus,
      capacityStatus: worstCap,
      severity,
      mainConstraint,
      affectedProducts,
      affectedLines,
    };
  });
}

// ── Exceptions ──────────────────────────────────────────────────────────────

export function buildScenarioExceptions(
  scenarioId: string,
  rows: BaselineImpactRow[],
  periodRows: PeriodSummaryRow[],
  bucketType: BucketType,
): import('./types').ScenarioException[] {
  const exceptions: import('./types').ScenarioException[] = [];
  let idCounter = 1;

  for (const row of rows) {
    if (row.scenarioCapacityStatus === 'Overloaded') {
      exceptions.push({
        id: `exc-${idCounter++}`,
        severity: 'Blocker',
        category: 'Capacity',
        productCode: row.productCode,
        productDescription: row.productDescription,
        period: row.period,
        lineId: PRODUCT_LINE_MAP[row.productCode],
        reason: `Utilization at ${row.scenarioUtilizationPercent}% — capacity overloaded`,
        suggestedAction: `Add ${Math.round((row.scenarioRequiredHours - row.scenarioAvailableHours))} overtime hours on ${PRODUCT_LINE_MAP[row.productCode]}`,
      });
    } else if (row.scenarioCapacityStatus === 'AtRisk' && row.baselineCapacityStatus !== 'AtRisk') {
      exceptions.push({
        id: `exc-${idCounter++}`,
        severity: 'Warning',
        category: 'Capacity',
        productCode: row.productCode,
        productDescription: row.productDescription,
        period: row.period,
        lineId: PRODUCT_LINE_MAP[row.productCode],
        reason: `Utilization increased to ${row.scenarioUtilizationPercent}% — at risk`,
        suggestedAction: 'Review capacity allocation or shift demand to adjacent period.',
      });
    }

    if (row.scenarioStockStatus === 'BelowMin' && row.baselineStockStatus !== 'BelowMin') {
      exceptions.push({
        id: `exc-${idCounter++}`,
        severity: 'Blocker',
        category: 'Inventory',
        productCode: row.productCode,
        productDescription: row.productDescription,
        period: row.period,
        reason: `Ending stock ${row.scenarioEndingStock} is below minimum threshold`,
        suggestedAction: 'Pull production forward or increase committed quantity in prior periods.',
      });
    }

    if (row.scenarioUncoveredQuantity > row.baselineUncoveredQuantity + 500) {
      exceptions.push({
        id: `exc-${idCounter++}`,
        severity: 'Warning',
        category: 'Demand',
        productCode: row.productCode,
        productDescription: row.productDescription,
        period: row.period,
        reason: `Uncovered demand increased by ${row.scenarioUncoveredQuantity - row.baselineUncoveredQuantity} units`,
        suggestedAction: 'Review commitment plan or add capacity to cover demand.',
      });
    }
  }

  const hasBlocker = exceptions.some((e) => e.severity === 'Blocker');
  if (hasBlocker) {
    exceptions.push({
      id: `exc-${idCounter++}`,
      severity: 'Blocker',
      category: 'MRPReadiness',
      period: 'Multiple',
      reason: 'MRP readiness is Not Ready due to capacity and inventory blockers',
      suggestedAction: 'Resolve all capacity overloads and inventory shortfalls before applying scenario to plan.',
    });
  }

  return exceptions;
}

// ── Suggested Actions ────────────────────────────────────────────────────────

export function buildSuggestedActions(
  scenarioId: string,
  exceptions: import('./types').ScenarioException[],
  rows: BaselineImpactRow[],
): SuggestedAction[] {
  const actions: SuggestedAction[] = [];
  let idCounter = 1;

  const capacityBlockers = exceptions.filter((e) => e.category === 'Capacity' && e.severity === 'Blocker');
  const inventoryBlockers = exceptions.filter((e) => e.category === 'Inventory' && e.severity === 'Blocker');
  const demandWarnings = exceptions.filter((e) => e.category === 'Demand');

  if (capacityBlockers.length > 0) {
    const firstBlocker = capacityBlockers[0];
    actions.push({
      id: `act-${idCounter++}`,
      scenarioId,
      title: 'Add Overtime Capacity',
      description: `Add 24 hours overtime on ${firstBlocker.lineId ?? 'affected line'} in ${firstBlocker.period} to cover demand upside.`,
      category: 'AddCapacity',
      impact: 'High — eliminates overload, reduces uncovered demand by ~4,800 units',
      effort: 'Medium',
      priority: 'Critical',
      relatedProductCode: firstBlocker.productCode,
      relatedPeriod: firstBlocker.period,
    });

    actions.push({
      id: `act-${idCounter++}`,
      scenarioId,
      title: 'Move Demand to Adjacent Period',
      description: `Move 12,000 units of ${firstBlocker.productCode ?? 'high-demand product'} from ${firstBlocker.period} to a feasible adjacent period.`,
      category: 'MoveDemand',
      impact: 'Medium — reduces overload; may shift uncovered demand',
      effort: 'Low',
      priority: 'High',
      relatedProductCode: firstBlocker.productCode,
      relatedPeriod: firstBlocker.period,
    });
  }

  if (inventoryBlockers.length > 0) {
    const first = inventoryBlockers[0];
    actions.push({
      id: `act-${idCounter++}`,
      scenarioId,
      title: 'Pull Production Forward',
      description: `Increase production in the prior period to replenish stock before ${first.period} demand peak.`,
      category: 'PullProductionForward',
      impact: 'High — restores stock above minimum; improves MRP readiness',
      effort: 'Medium',
      priority: 'High',
      relatedProductCode: first.productCode,
      relatedPeriod: first.period,
    });
  }

  if (demandWarnings.length > 0) {
    actions.push({
      id: `act-${idCounter++}`,
      scenarioId,
      title: 'Reduce Commitment Quantity',
      description: 'Reduce committed quantity by 8,000 units if additional capacity cannot be secured.',
      category: 'ReduceCommitment',
      impact: 'Medium — reduces service level but maintains capacity balance',
      effort: 'Low',
      priority: 'Medium',
      relatedPeriod: demandWarnings[0]?.period,
    });
  }

  actions.push({
    id: `act-${idCounter++}`,
    scenarioId,
    title: 'Review MRP Readiness Before Applying',
    description: 'Ensure all capacity and inventory blockers are resolved before applying this scenario to the active plan.',
    category: 'ReviewMRPReadiness',
    impact: 'Prevents propagating planning errors downstream',
    effort: 'Low',
    priority: 'Critical',
  });

  return actions;
}

// ── Top Impacted Products ────────────────────────────────────────────────────

export function calculateTopImpactedProducts(rows: BaselineImpactRow[]): TopImpactedProduct[] {
  const byProduct: Record<string, {uncoveredDelta: number; utilDelta: number; desc: string}> = {};

  for (const row of rows) {
    if (!byProduct[row.productCode]) {
      byProduct[row.productCode] = {uncoveredDelta: 0, utilDelta: 0, desc: row.productDescription};
    }
    byProduct[row.productCode].uncoveredDelta += row.scenarioUncoveredQuantity - row.baselineUncoveredQuantity;
    byProduct[row.productCode].utilDelta += row.scenarioUtilizationPercent - row.baselineUtilizationPercent;
  }

  return Object.entries(byProduct)
    .map(([productCode, data]) => ({
      productCode,
      productDescription: data.desc,
      uncoveredDelta: Math.round(data.uncoveredDelta),
      utilizationDelta: Math.round(data.utilDelta * 10) / 10,
    }))
    .sort((a, b) => Math.abs(b.uncoveredDelta) - Math.abs(a.uncoveredDelta));
}

// ── Chart Data ───────────────────────────────────────────────────────────────

export function buildChartData(periodRows: PeriodSummaryRow[]): UtilizationChartPoint[] {
  return periodRows.map((r) => ({
    period: r.period,
    baseline: r.baselineUtilizationPercent,
    scenario: r.scenarioUtilizationPercent,
  }));
}

// ── Apply scenario to local working state ────────────────────────────────────

export function applyScenarioToWorkingState(
  scenario: ScenarioPlan,
  rows: BaselineImpactRow[],
): {appliedScenario: ScenarioPlan; appliedRows: BaselineImpactRow[]} {
  return {
    appliedScenario: {...scenario, status: 'Applied', updatedAt: new Date().toLocaleString()},
    appliedRows: rows.map((r) => ({
      ...r,
      baselineRequestedQuantity: r.scenarioRequestedQuantity,
      baselineCommittedQuantity: r.scenarioCommittedQuantity,
      baselineUtilizationPercent: r.scenarioUtilizationPercent,
      baselineUncoveredQuantity: r.scenarioUncoveredQuantity,
      baselineEndingStock: r.scenarioEndingStock,
      baselineCapacityStatus: r.scenarioCapacityStatus,
      baselineStockStatus: r.scenarioStockStatus,
      baselineReadinessStatus: r.scenarioReadinessStatus,
    })),
  };
}

// ── Duplicate Scenario ───────────────────────────────────────────────────────

export function duplicateScenario(
  scenario: ScenarioPlan,
  changes: import('./types').ScenarioChange[],
): {scenario: ScenarioPlan; changes: import('./types').ScenarioChange[]} {
  const newId = `scen-copy-${Date.now()}`;
  const newScenario: ScenarioPlan = {
    ...scenario,
    id: newId,
    name: `${scenario.name} (Copy)`,
    status: 'Draft',
    createdAt: new Date().toLocaleString(),
    updatedAt: new Date().toLocaleString(),
    lastCalculatedAt: null,
  };
  const newChanges: import('./types').ScenarioChange[] = changes.map((c) => ({
    ...c,
    id: `${c.id}-copy-${Date.now()}`,
    scenarioId: newId,
  }));
  return {scenario: newScenario, changes: newChanges};
}

// ── Audit Event ──────────────────────────────────────────────────────────────

export function createScenarioAuditEvent(
  scenarioId: string,
  eventType: ScenarioAuditEventType,
  user: string,
  previousValue?: string,
  newValue?: string,
  comment?: string,
): ScenarioAuditEvent {
  return {
    id: `ae-${Date.now()}`,
    scenarioId,
    timestamp: new Date().toLocaleString(),
    user,
    eventType,
    previousValue,
    newValue,
    comment,
  };
}

// ── Full simulation runner ───────────────────────────────────────────────────

export function runScenarioSimulation(
  scenario: ScenarioPlan,
  changes: import('./types').ScenarioChange[],
  periods: string[],
  bucketType: BucketType,
): {
  impactRows: BaselineImpactRow[];
  periodSummaryRows: PeriodSummaryRow[];
  impactSummary: ScenarioImpactSummary;
  periodImpacts: PeriodImpact[];
  exceptions: import('./types').ScenarioException[];
  suggestedActions: SuggestedAction[];
  topImpactedProducts: TopImpactedProduct[];
  chartData: UtilizationChartPoint[];
} {
  const impactRows = buildBaselineImpactRows(scenario.id, changes, periods, bucketType);
  const periodSummaryRows = buildPeriodSummaryRows(impactRows, periods, bucketType);
  const impactSummary = calculateScenarioImpactSummary(impactRows, periodSummaryRows);
  const periodImpacts = buildPeriodImpacts(impactRows, periods, bucketType);
  const exceptions = buildScenarioExceptions(scenario.id, impactRows, periodSummaryRows, bucketType);
  const suggestedActions = buildSuggestedActions(scenario.id, exceptions, impactRows);
  const topImpactedProducts = calculateTopImpactedProducts(impactRows);
  const chartData = buildChartData(periodSummaryRows);

  return {impactRows, periodSummaryRows, impactSummary, periodImpacts, exceptions, suggestedActions, topImpactedProducts, chartData};
}
