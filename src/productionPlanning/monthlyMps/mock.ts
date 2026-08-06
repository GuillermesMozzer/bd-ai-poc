import type {
  AuditEvent,
  MpsBucketLine,
  MpsDemandLine,
  MpsPlan,
  MpsVersion,
  MpsVersionAuditEvent,
  MpsVersionFiltersState,
  MpsVersionKpi,
  ProductLineCapability,
  ProductPlanningRule,
  ProductionLine,
} from './types';

export type MpsPlanningMockBundle = {
  plan: MpsPlan;
  demandLines: MpsDemandLine[];
  bucketLines: MpsBucketLine[];
  productionLines: ProductionLine[];
  capabilities: ProductLineCapability[];
  planningRules: ProductPlanningRule[];
  initialAuditEvents: AuditEvent[];
};

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const PRODUCTS = [
  {code: 'FG-1001', desc: 'Standard Tube A', family: 'Tubes'},
  {code: 'FG-1002', desc: 'Standard Tube B', family: 'Tubes'},
  {code: 'FG-2001', desc: 'Additive Tube', family: 'Tubes'},
  {code: 'FG-3001', desc: 'Gel Product', family: 'Gels'},
  {code: 'FG-4001', desc: 'Specialty Pack', family: 'Specialty'},
  {code: 'FG-5001', desc: 'Low Volume Product', family: 'Specialty'},
];

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function getMonthBuckets(year: number, month: number) {
  const lastDay = new Date(year, month, 0).getDate();
  const m = `${year}-${pad(month)}`;
  return [
    {label: 'Week 1', start: `${m}-01`, end: `${m}-07`},
    {label: 'Week 2', start: `${m}-08`, end: `${m}-14`},
    {label: 'Week 3', start: `${m}-15`, end: `${m}-21`},
    {label: 'Week 4', start: `${m}-22`, end: `${m}-${pad(lastDay)}`},
  ];
}

export function createMpsPlanningMockData(now: Date): MpsPlanningMockBundle {
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // 1-based
  const monthName = MONTH_NAMES[month - 1];
  const monthStr = `${year}-${pad(month)}`;
  const ts = now.toISOString();

  const prevMonthDate = new Date(year, month - 2, 1);
  const prevMonthStr = `${prevMonthDate.getFullYear()}-${pad(prevMonthDate.getMonth() + 1)}`;

  const lastDay = new Date(year, month, 0).getDate();
  const buckets = getMonthBuckets(year, month);

  const plan: MpsPlan = {
    id: `mps-${monthStr}-v1`,
    name: `${monthName} ${year} MPS`,
    site: 'Plymouth',
    planningPeriod: `${monthName} ${year}`,
    periodStartDate: `${monthStr}-01`,
    periodEndDate: `${monthStr}-${pad(lastDay)}`,
    sourceLongTermPlanVersion: `LTP-v${prevMonthStr}.13`,
    mpsVersion: `MPS-${monthStr}-v1`,
    status: 'Draft',
    frozenPeriodStartDate: `${monthStr}-01`,
    frozenPeriodEndDate: `${monthStr}-07`,
    isFrozenPeriod: true,
    createdBy: 'Danilo Brooks',
    createdAt: `${prevMonthStr}-13T08:00:00Z`,
    updatedAt: ts,
    planDataTimestamp: `${prevMonthStr}-13T07:45:00Z`,
    notes: `${monthName} ${year} MPS based on approved LTP. Frozen period covers Week 1.`,
  };

  const productionLines: ProductionLine[] = [
    {
      id: 'line-10',
      name: 'Line 10',
      area: 'Production Hall A',
      active: true,
      bucketAvailableHours: [
        {bucketLabel: 'Week 1', bucketStartDate: buckets[0].start, bucketEndDate: buckets[0].end, availableHours: 120, plannedDowntimeHours: 8, calendarNotes: 'Frozen period'},
        {bucketLabel: 'Week 2', bucketStartDate: buckets[1].start, bucketEndDate: buckets[1].end, availableHours: 128, plannedDowntimeHours: 0},
        {bucketLabel: 'Week 3', bucketStartDate: buckets[2].start, bucketEndDate: buckets[2].end, availableHours: 128, plannedDowntimeHours: 0},
        {bucketLabel: 'Week 4', bucketStartDate: buckets[3].start, bucketEndDate: buckets[3].end, availableHours: 160, plannedDowntimeHours: 8},
      ],
    },
    {
      id: 'line-20',
      name: 'Line 20',
      area: 'Production Hall A',
      active: true,
      bucketAvailableHours: [
        {bucketLabel: 'Week 1', bucketStartDate: buckets[0].start, bucketEndDate: buckets[0].end, availableHours: 112, plannedDowntimeHours: 16, calendarNotes: 'PM scheduled'},
        {bucketLabel: 'Week 2', bucketStartDate: buckets[1].start, bucketEndDate: buckets[1].end, availableHours: 128, plannedDowntimeHours: 0},
        {bucketLabel: 'Week 3', bucketStartDate: buckets[2].start, bucketEndDate: buckets[2].end, availableHours: 120, plannedDowntimeHours: 8},
        {bucketLabel: 'Week 4', bucketStartDate: buckets[3].start, bucketEndDate: buckets[3].end, availableHours: 160, plannedDowntimeHours: 0},
      ],
    },
    {
      id: 'line-30',
      name: 'Line 30',
      area: 'Production Hall B',
      active: true,
      bucketAvailableHours: [
        {bucketLabel: 'Week 1', bucketStartDate: buckets[0].start, bucketEndDate: buckets[0].end, availableHours: 96, plannedDowntimeHours: 0},
        {bucketLabel: 'Week 2', bucketStartDate: buckets[1].start, bucketEndDate: buckets[1].end, availableHours: 96, plannedDowntimeHours: 0},
        {bucketLabel: 'Week 3', bucketStartDate: buckets[2].start, bucketEndDate: buckets[2].end, availableHours: 96, plannedDowntimeHours: 0},
        {bucketLabel: 'Week 4', bucketStartDate: buckets[3].start, bucketEndDate: buckets[3].end, availableHours: 128, plannedDowntimeHours: 0},
      ],
    },
  ];

  // Capabilities: FG-1001 on Line 10 only, FG-1002 on Line 10 + 20,
  // FG-2001 on Line 20 + 30, FG-3001 on Line 30, FG-4001 on Line 10 (no rate),
  // FG-5001 has no eligible line
  const capabilities: ProductLineCapability[] = [
    {productCode: 'FG-1001', lineId: 'line-10', productionRateUnitsPerHour: 220, minLotSize: 2000, maxLotSize: 14000, preferredLotSize: 8000, active: true, changeoverFamily: 'TubeA'},
    {productCode: 'FG-1002', lineId: 'line-10', productionRateUnitsPerHour: 200, minLotSize: 1500, maxLotSize: 12000, preferredLotSize: 6000, active: true, changeoverFamily: 'TubeB'},
    {productCode: 'FG-1002', lineId: 'line-20', productionRateUnitsPerHour: 190, minLotSize: 1500, maxLotSize: 12000, preferredLotSize: 6000, active: true, changeoverFamily: 'TubeB'},
    {productCode: 'FG-2001', lineId: 'line-20', productionRateUnitsPerHour: 150, minLotSize: 1000, maxLotSize: 8000, preferredLotSize: 4000, active: true, changeoverFamily: 'TubeAdditive'},
    {productCode: 'FG-2001', lineId: 'line-30', productionRateUnitsPerHour: 110, minLotSize: 1000, maxLotSize: 8000, preferredLotSize: 4000, active: true, changeoverFamily: 'TubeAdditive'},
    {productCode: 'FG-3001', lineId: 'line-30', productionRateUnitsPerHour: 80, minLotSize: 500, maxLotSize: 5000, preferredLotSize: 2000, active: true, changeoverFamily: 'Gel'},
    // FG-4001: no production rate (null)
    {productCode: 'FG-4001', lineId: 'line-10', productionRateUnitsPerHour: null, minLotSize: 500, maxLotSize: 4000, preferredLotSize: 1500, active: true},
    // FG-5001: no eligible line (no capabilities entry)
  ];

  const planningRules: ProductPlanningRule[] = [
    {productCode: 'FG-1001', minLotSize: 2000, maxLotSize: 14000, preferredLotSize: 8000, eligibleLineIds: ['line-10'], preferredLineId: 'line-10', stockMin: 3000, stockMax: 20000, stockTarget: 10000, shelfLifeDays: 730, changeoverFamily: 'TubeA'},
    {productCode: 'FG-1002', minLotSize: 1500, maxLotSize: 12000, preferredLotSize: 6000, eligibleLineIds: ['line-10', 'line-20'], preferredLineId: 'line-10', stockMin: 2500, stockMax: 16000, stockTarget: 8000, shelfLifeDays: 730, changeoverFamily: 'TubeB'},
    {productCode: 'FG-2001', minLotSize: 1000, maxLotSize: 8000, preferredLotSize: 4000, eligibleLineIds: ['line-20', 'line-30'], preferredLineId: 'line-20', stockMin: 1500, stockMax: 10000, stockTarget: 4500, shelfLifeDays: 365, changeoverFamily: 'TubeAdditive'},
    {productCode: 'FG-3001', minLotSize: 500, maxLotSize: 5000, preferredLotSize: 2000, eligibleLineIds: ['line-30'], preferredLineId: 'line-30', stockMin: 800, stockMax: 6000, stockTarget: 2500, shelfLifeDays: 180, changeoverFamily: 'Gel'},
    {productCode: 'FG-4001', minLotSize: 500, maxLotSize: 4000, preferredLotSize: 1500, eligibleLineIds: ['line-10'], preferredLineId: 'line-10', stockMin: 400, stockMax: 5000, stockTarget: 1800, shelfLifeDays: 365},
    {productCode: 'FG-5001', minLotSize: 200, maxLotSize: 2000, preferredLotSize: 600, eligibleLineIds: [], stockMin: 200, stockMax: 2500, stockTarget: 800, shelfLifeDays: 365},
  ];

  // Demand lines (approved monthly demand)
  const demandLines: MpsDemandLine[] = [
    {
      id: 'dl-fg1001', planId: plan.id,
      productCode: 'FG-1001', productDescription: 'Standard Tube A', productFamily: 'Tubes',
      uom: 'Units', approvedMonthlyDemand: 32000,
      alreadyPlannedQuantity: 0, remainingQuantityToPlan: 32000,
      demandSource: 'GlobalForecast', priority: 'High', riskLevel: 'Low',
      status: 'NotStarted',
    },
    {
      id: 'dl-fg1002', planId: plan.id,
      productCode: 'FG-1002', productDescription: 'Standard Tube B', productFamily: 'Tubes',
      uom: 'Units', approvedMonthlyDemand: 24000,
      alreadyPlannedQuantity: 0, remainingQuantityToPlan: 24000,
      demandSource: 'GlobalForecast', priority: 'High', riskLevel: 'Low',
      status: 'NotStarted',
    },
    {
      id: 'dl-fg2001', planId: plan.id,
      productCode: 'FG-2001', productDescription: 'Additive Tube', productFamily: 'Tubes',
      uom: 'Units', approvedMonthlyDemand: 16000,
      alreadyPlannedQuantity: 0, remainingQuantityToPlan: 16000,
      demandSource: 'FirmOrder', priority: 'Critical', riskLevel: 'Medium',
      status: 'NotStarted',
    },
    {
      id: 'dl-fg3001', planId: plan.id,
      productCode: 'FG-3001', productDescription: 'Gel Product', productFamily: 'Gels',
      uom: 'Units', approvedMonthlyDemand: 8000,
      alreadyPlannedQuantity: 0, remainingQuantityToPlan: 8000,
      demandSource: 'GlobalForecast', priority: 'Medium', riskLevel: 'Low',
      status: 'NotStarted',
    },
    {
      id: 'dl-fg4001', planId: plan.id,
      productCode: 'FG-4001', productDescription: 'Specialty Pack', productFamily: 'Specialty',
      uom: 'Units', approvedMonthlyDemand: 6000,
      alreadyPlannedQuantity: 0, remainingQuantityToPlan: 6000,
      demandSource: 'ManualAdjustment', priority: 'Medium', riskLevel: 'High',
      status: 'NotStarted',
    },
    {
      id: 'dl-fg5001', planId: plan.id,
      productCode: 'FG-5001', productDescription: 'Low Volume Product', productFamily: 'Specialty',
      uom: 'Units', approvedMonthlyDemand: 18000,
      alreadyPlannedQuantity: 0, remainingQuantityToPlan: 18000,
      demandSource: 'FirmOrder', priority: 'Low', riskLevel: 'High',
      status: 'NotStarted',
    },
  ];

  // Stock parameters per product (opening stock at start of month)
  const openingStocks: Record<string, number> = {
    'FG-1001': 6000,
    'FG-1002': 4500,
    'FG-2001': 3000,
    'FG-3001': 1200,
    'FG-4001': 800,
    'FG-5001': 300,
  };

  // Weekly demand consumption (approvedMonthlyDemand / 4)
  const weeklyDemand: Record<string, number> = {
    'FG-1001': 8000,
    'FG-1002': 6000,
    'FG-2001': 4000,
    'FG-3001': 2000,
    'FG-4001': 1500,
    'FG-5001': 4500,
  };

  // Pre-set planned quantities per product per week
  const planned: Record<string, number[]> = {
    'FG-1001': [8000, 10000, 7000, 7000],
    'FG-1002': [5000, 7000, 6000, 6000],
    'FG-2001': [500, 4500, 4500, 5000],
    'FG-3001': [2000, 9000, 2000, 2000],
    'FG-4001': [1500, 1500, 1500, 1500],
    'FG-5001': [600, 600, 600, 600],
  };

  const assigned: Record<string, Array<string | null>> = {
    'FG-1001': ['line-10', 'line-10', 'line-10', 'line-10'],
    'FG-1002': ['line-10', 'line-20', 'line-10', 'line-20'],
    'FG-2001': ['line-20', 'line-30', 'line-30', 'line-20'],
    'FG-3001': ['line-30', 'line-30', 'line-30', 'line-30'],
    'FG-4001': ['line-10', 'line-10', 'line-10', 'line-10'],
    'FG-5001': [null, null, null, null],
  };

  const bucketLines: MpsBucketLine[] = [];
  let bucketIdCounter = 1;

  for (const prod of PRODUCTS) {
    const rule = planningRules.find((r) => r.productCode === prod.code)!;
    const dl = demandLines.find((d) => d.productCode === prod.code)!;
    const plannedQtys = planned[prod.code];
    const assignedLines = assigned[prod.code];
    let openingStock = openingStocks[prod.code] ?? 0;

    for (let wi = 0; wi < buckets.length; wi++) {
      const bucket = buckets[wi];
      const qty = plannedQtys[wi];
      const lineId = assignedLines[wi];
      const isFrozen = wi === 0; // Week 1 is frozen

      const capability = lineId
        ? capabilities.find((c) => c.productCode === prod.code && c.lineId === lineId)
        : undefined;

      const rate = capability?.productionRateUnitsPerHour ?? null;
      const lineBucket = lineId
        ? productionLines.find((l) => l.id === lineId)?.bucketAvailableHours.find((b) => b.bucketLabel === bucket.label)
        : undefined;

      const availHours = lineBucket?.availableHours ?? 0;
      const reqHours = rate && qty > 0 ? Number((qty / rate).toFixed(2)) : 0;
      const remainCap = Number((availHours - reqHours).toFixed(2));
      const utilPct = availHours > 0 && reqHours > 0 ? Number(((reqHours / availHours) * 100).toFixed(1)) : 0;

      const consumption = weeklyDemand[prod.code] ?? 0;
      const endingStock = openingStock + qty - consumption;
      const avgDailyDemand = consumption / 7;
      const coverageDays = avgDailyDemand > 0 ? Number((endingStock / avgDailyDemand).toFixed(1)) : 0;

      const hasNoLine = !lineId;
      const hasNoRate = rate === null;
      const hasNoEligibleLine = rule.eligibleLineIds.length === 0;
      const isOverloaded = availHours > 0 && reqHours > availHours;
      const isBelowLot = qty > 0 && qty < rule.minLotSize;
      const isAboveLot = qty > rule.maxLotSize;
      const isStockRisk = endingStock < rule.stockMin || endingStock > rule.stockMax;
      const isAtRisk = utilPct >= 90 && utilPct <= 100;

      let status: MpsBucketLine['status'] = 'Feasible';
      if (hasNoEligibleLine || hasNoRate || hasNoLine || availHours === 0) {
        status = 'MissingData';
      } else if (isOverloaded) {
        status = 'Overloaded';
      } else if (isBelowLot) {
        status = 'BelowLotSize';
      } else if (isAboveLot) {
        status = 'AboveLotSize';
      } else if (isStockRisk) {
        status = 'StockRisk';
      } else if (isAtRisk) {
        status = 'AtRisk';
      }

      const bucketId = `bl-${String(bucketIdCounter).padStart(3, '0')}`;
      bucketIdCounter++;

      const row: MpsBucketLine = {
        id: bucketId,
        planId: plan.id,
        demandLineId: dl.id,
        productCode: prod.code,
        productDescription: prod.desc,
        productFamily: prod.family,
        bucketType: 'Week',
        bucketLabel: bucket.label,
        bucketStartDate: bucket.start,
        bucketEndDate: bucket.end,
        plannedQuantity: qty,
        assignedLineId: lineId,
        requiredHours: reqHours,
        availableHours: availHours,
        remainingCapacityHours: remainCap,
        utilizationPercent: utilPct,
        projectedOpeningStock: openingStock,
        projectedDemandConsumption: consumption,
        projectedEndingStock: endingStock,
        minStock: rule.stockMin,
        maxStock: rule.stockMax,
        targetStock: rule.stockTarget,
        stockCoverageDays: coverageDays,
        status,
        isFrozenPeriod: isFrozen,
      };

      if (prod.code === 'FG-1001' && wi === 2) {
        row.plannerComment = 'Split production to balance Line 10 load in W2.';
      }

      if (prod.code === 'FG-3001' && wi === 1) {
        row.status = 'RequiresDecision';
        row.constraintReason = 'Planned quantity exceeds maximum lot size. Planner confirmation required.';
      }

      openingStock = endingStock;
      bucketLines.push(row);
    }
  }

  const initialAuditEvents: AuditEvent[] = [
    {
      id: 'audit-001',
      entityType: 'MpsPlan',
      entityId: plan.id,
      eventType: 'PlanInitialized',
      newValue: plan.mpsVersion,
      user: 'Danilo Brooks',
      timestamp: ts,
      comment: `MPS Planning page initialized with demo data for ${monthName} ${year}.`,
      sourceScreen: 'MpsPlanningPage',
    },
  ];

  return {plan, demandLines, bucketLines, productionLines, capabilities, planningRules, initialAuditEvents};
}

export {MONTH_NAMES};

// ── MPS Versioning / Baseline Control ─────────────────────────────────────────

export const mpsVersions: MpsVersion[] = [
  // May 2026 Forecast workspace linked MPS
  {
    id: 'MPS-2026-05-001',
    planningCycle: 'May 2026 Forecast',
    cycleId: 'MPS-CYCLE-2026-05',
    effectivePeriodStart: '2026-06-01',
    effectivePeriodEnd: '2027-05-31',
    sourceSystem: 'Forecast Workspace',
    importedAt: '2026-05-23T14:30:00',
    importedBy: 'J. Ramirez',
    isApprovedBaseline: true,
    approvedBy: 'Carlos Ops Manager',
    approvedAt: '2026-05-23T16:00:00',
    approvalStatus: 'Approved',
    changeReason: 'Base case generated from May-2026 demand forecast.',
    previousValues: {},
    impactedWOs: [],
    impactedMaterials: [],
    impactedLines: [],
    linkedForecastVersionIds: ['FCT-2025-06-001'],
    linkedMrpVersionIds: ['MRP-2025-03-001', 'MRP-2025-03-002'],
    notes: 'Scenario MPS linked to the May-2026 forecast workspace.',
  },
  {
    id: 'MPS-2026-05-002',
    planningCycle: 'May 2026 Forecast',
    cycleId: 'MPS-CYCLE-2026-05',
    effectivePeriodStart: '2026-06-01',
    effectivePeriodEnd: '2027-05-31',
    sourceSystem: 'Forecast Workspace',
    importedAt: '2026-05-22T09:15:00',
    importedBy: 'A. Lopez',
    isApprovedBaseline: false,
    approvedBy: null,
    approvedAt: null,
    approvalStatus: 'Pending Approval',
    changeReason: 'Capacity upside scenario generated from May-2026 demand forecast.',
    previousValues: {},
    impactedWOs: [],
    impactedMaterials: [],
    impactedLines: [],
    linkedForecastVersionIds: ['FCT-2025-06-002'],
    linkedMrpVersionIds: [],
    notes: 'Scenario MPS under review.',
  },
  {
    id: 'MPS-2026-05-003',
    planningCycle: 'Actual vs Plan - Apr 2026',
    cycleId: 'MPS-CYCLE-2026-04-ACTUAL',
    effectivePeriodStart: '2026-04-01',
    effectivePeriodEnd: '2026-04-30',
    sourceSystem: 'Forecast Workspace',
    importedAt: '2026-05-21T16:45:00',
    importedBy: 'M. Silva',
    isApprovedBaseline: false,
    approvedBy: null,
    approvedAt: null,
    approvalStatus: 'Draft',
    changeReason: 'Actual evaluation linked to May-2026 forecast context.',
    previousValues: {},
    impactedWOs: [],
    impactedMaterials: [],
    impactedLines: [],
    linkedForecastVersionIds: ['FCT-2025-06-002'],
    linkedMrpVersionIds: [],
    notes: 'Actual evaluation MPS draft.',
  },
  // ── March Reforecast 2025 ────────────────────────────────────────────────────
  {
    id: 'MPS-2025-03-001',
    planningCycle: 'March Reforecast 2025',
    cycleId: 'MPS-CYCLE-2025-03',
    effectivePeriodStart: '2025-03-01',
    effectivePeriodEnd: '2025-03-31',
    sourceSystem: 'SAP',
    importedAt: '2025-03-05T15:00:00',
    importedBy: 'Maya Planner',
    isApprovedBaseline: true,
    approvedBy: 'Carlos Ops Manager',
    approvedAt: '2025-03-06T09:30:00',
    approvalStatus: 'Approved',
    changeReason: 'Initial MPS baseline for March reforecast cycle.',
    previousValues: {},
    impactedWOs: ['WO-1800', 'WO-1801', 'WO-1802', 'WO-1803'],
    impactedMaterials: ['MAT-4421', 'MAT-0882', 'MAT-1134'],
    impactedLines: ['Line 1', 'Line 2'],
    linkedForecastVersionIds: ['FCT-2025-03-001'],
    linkedMrpVersionIds: ['MRP-2025-03-001', 'MRP-2025-03-002'],
    notes: 'Committed baseline. Drives March scheduling and WO release.',
  },
  {
    id: 'MPS-2025-03-002',
    planningCycle: 'March Reforecast 2025',
    cycleId: 'MPS-CYCLE-2025-03',
    effectivePeriodStart: '2025-03-01',
    effectivePeriodEnd: '2025-03-31',
    sourceSystem: 'SAP',
    importedAt: '2025-03-11T11:00:00',
    importedBy: 'Ana Forecast Analyst',
    isApprovedBaseline: false,
    approvedBy: 'Carlos Ops Manager',
    approvedAt: '2025-03-12T10:00:00',
    approvalStatus: 'Approved',
    changeReason: 'Line 3 peak shift per updated customer PO — non-baseline revision.',
    previousValues: {line3PlannedQty: 12000, line3PlannedQtyNew: 9500},
    impactedWOs: ['WO-1810', 'WO-1811'],
    impactedMaterials: ['MAT-4421', 'MAT-2291'],
    impactedLines: ['Line 3'],
    linkedForecastVersionIds: ['FCT-2025-03-002'],
    linkedMrpVersionIds: [],
    notes: null,
  },
  // ── June Forecast 2025 ───────────────────────────────────────────────────────
  {
    id: 'MPS-2025-06-001',
    planningCycle: 'June Forecast 2025',
    cycleId: 'MPS-CYCLE-2025-06',
    effectivePeriodStart: '2025-06-01',
    effectivePeriodEnd: '2025-08-31',
    sourceSystem: 'SAP',
    importedAt: '2025-06-04T14:00:00',
    importedBy: 'Maya Planner',
    isApprovedBaseline: true,
    approvedBy: 'Carlos Ops Manager',
    approvedAt: '2025-06-05T09:00:00',
    approvalStatus: 'Approved',
    changeReason: 'Initial MPS baseline for June planning cycle (Jun–Aug horizon).',
    previousValues: {},
    impactedWOs: ['WO-1830', 'WO-1831', 'WO-1832', 'WO-1833', 'WO-1834'],
    impactedMaterials: ['MAT-4421', 'MAT-0882', 'MAT-1134', 'MAT-2291'],
    impactedLines: ['Line 1', 'Line 2', 'Line 3'],
    linkedForecastVersionIds: ['FCT-2025-06-001', 'FCT-2025-06-002'],
    linkedMrpVersionIds: ['MRP-2025-06-001', 'MRP-2025-06-002'],
    notes: 'Drives WO release for June and July. August buckets under review.',
  },
  {
    id: 'MPS-2025-06-002',
    planningCycle: 'June Forecast 2025',
    cycleId: 'MPS-CYCLE-2025-06',
    effectivePeriodStart: '2025-06-01',
    effectivePeriodEnd: '2025-08-31',
    sourceSystem: 'SAP',
    importedAt: '2025-06-17T10:30:00',
    importedBy: 'Maya Planner',
    isApprovedBaseline: false,
    approvedBy: 'Carlos Ops Manager',
    approvedAt: '2025-06-18T08:00:00',
    approvalStatus: 'Approved',
    changeReason: 'SKU-449 volume reallocated from Line 2 to Line 3 following maintenance window.',
    previousValues: {sku449Line: 'Line 2', sku449LineNew: 'Line 3'},
    impactedWOs: ['WO-1850', 'WO-1851'],
    impactedMaterials: ['MAT-0449', 'MAT-2291'],
    impactedLines: ['Line 2', 'Line 3'],
    linkedForecastVersionIds: ['FCT-2025-06-003'],
    linkedMrpVersionIds: ['MRP-2025-06-003'],
    notes: null,
  },
  {
    id: 'MPS-2025-06-003',
    planningCycle: 'June Forecast 2025',
    cycleId: 'MPS-CYCLE-2025-06',
    effectivePeriodStart: '2025-06-01',
    effectivePeriodEnd: '2025-09-30',
    sourceSystem: 'Excel',
    importedAt: '2025-06-24T09:00:00',
    importedBy: 'Ana Forecast Analyst',
    isApprovedBaseline: false,
    approvedBy: null,
    approvedAt: null,
    approvalStatus: 'Pending Approval',
    changeReason: 'September customer pull-in +12K units SKU-221. Extends horizon to Sep.',
    previousValues: {sepPlannedQty: 0, sepPlannedQtyNew: 12000},
    impactedWOs: ['WO-1860', 'WO-1861'],
    impactedMaterials: ['MAT-4421', 'MAT-0882'],
    impactedLines: ['Line 1'],
    linkedForecastVersionIds: ['FCT-2025-06-004'],
    linkedMrpVersionIds: ['MRP-2025-06-004'],
    notes: 'Submitted to Carlos Ops Manager. Capacity check pending.',
  },
  // ── September Forecast 2025 ──────────────────────────────────────────────────
  {
    id: 'MPS-2025-09-001',
    planningCycle: 'September Forecast 2025',
    cycleId: 'MPS-CYCLE-2025-09',
    effectivePeriodStart: '2025-09-01',
    effectivePeriodEnd: '2025-11-30',
    sourceSystem: 'SAP',
    importedAt: '2025-09-01T08:00:00',
    importedBy: 'Maya Planner',
    isApprovedBaseline: false,
    approvedBy: null,
    approvedAt: null,
    approvalStatus: 'Draft',
    changeReason: 'Initial import for Q4 planning cycle. Under review.',
    previousValues: {},
    impactedWOs: [],
    impactedMaterials: ['MAT-4421', 'MAT-0882', 'MAT-1134'],
    impactedLines: ['Line 1', 'Line 2'],
    linkedForecastVersionIds: [],
    linkedMrpVersionIds: [],
    notes: 'Working draft. Not yet submitted for approval.',
  },
  {
    id: 'MPS-2025-09-002',
    planningCycle: 'September Forecast 2025',
    cycleId: 'MPS-CYCLE-2025-09',
    effectivePeriodStart: '2025-09-01',
    effectivePeriodEnd: '2025-11-30',
    sourceSystem: 'Excel',
    importedAt: '2025-09-03T14:20:00',
    importedBy: 'Ana Forecast Analyst',
    isApprovedBaseline: false,
    approvedBy: null,
    approvedAt: null,
    approvalStatus: 'Rejected',
    changeReason: 'Attempt to add Line 4 to Q4 scope — rejected, Line 4 not validated.',
    previousValues: {},
    impactedWOs: [],
    impactedMaterials: ['MAT-3301'],
    impactedLines: ['Line 4'],
    linkedForecastVersionIds: [],
    linkedMrpVersionIds: [],
    notes: 'Rejected by planning manager. Line 4 qualification incomplete.',
  },
];

export const mpsApprovalHistoryMap: Record<string, MpsVersionAuditEvent[]> = {
  'MPS-2025-03-001': [
    {id: 'MAH-301-1', versionId: 'MPS-2025-03-001', eventType: 'Imported', actor: 'Maya Planner', timestamp: '2025-03-05T15:00:00', comment: 'Imported from SAP automated export after FCT-2025-03-001 approval.'},
    {id: 'MAH-301-2', versionId: 'MPS-2025-03-001', eventType: 'Submitted', actor: 'Maya Planner', timestamp: '2025-03-05T15:20:00', comment: null},
    {id: 'MAH-301-3', versionId: 'MPS-2025-03-001', eventType: 'Approved', actor: 'Carlos Ops Manager', timestamp: '2025-03-06T09:30:00', comment: 'Baseline approved. March scheduling can proceed.'},
    {id: 'MAH-301-4', versionId: 'MPS-2025-03-001', eventType: 'SetAsBaseline', actor: 'Carlos Ops Manager', timestamp: '2025-03-06T09:32:00', comment: 'Set as committed baseline for March reforecast cycle.'},
  ],
  'MPS-2025-03-002': [
    {id: 'MAH-302-1', versionId: 'MPS-2025-03-002', eventType: 'Imported', actor: 'Ana Forecast Analyst', timestamp: '2025-03-11T11:00:00', comment: null},
    {id: 'MAH-302-2', versionId: 'MPS-2025-03-002', eventType: 'Submitted', actor: 'Ana Forecast Analyst', timestamp: '2025-03-11T11:15:00', comment: 'Line 3 peak shift adjustment.'},
    {id: 'MAH-302-3', versionId: 'MPS-2025-03-002', eventType: 'Approved', actor: 'Carlos Ops Manager', timestamp: '2025-03-12T10:00:00', comment: 'Approved as non-baseline revision.'},
  ],
  'MPS-2025-06-001': [
    {id: 'MAH-601-1', versionId: 'MPS-2025-06-001', eventType: 'Imported', actor: 'Maya Planner', timestamp: '2025-06-04T14:00:00', comment: 'Imported from SAP after June baseline forecast approval.'},
    {id: 'MAH-601-2', versionId: 'MPS-2025-06-001', eventType: 'Submitted', actor: 'Maya Planner', timestamp: '2025-06-04T14:20:00', comment: null},
    {id: 'MAH-601-3', versionId: 'MPS-2025-06-001', eventType: 'Approved', actor: 'Carlos Ops Manager', timestamp: '2025-06-05T09:00:00', comment: 'Baseline approved. June WO release can proceed.'},
    {id: 'MAH-601-4', versionId: 'MPS-2025-06-001', eventType: 'SetAsBaseline', actor: 'Carlos Ops Manager', timestamp: '2025-06-05T09:05:00', comment: 'Committed baseline for Jun–Aug horizon.'},
  ],
  'MPS-2025-06-002': [
    {id: 'MAH-602-1', versionId: 'MPS-2025-06-002', eventType: 'Imported', actor: 'Maya Planner', timestamp: '2025-06-17T10:30:00', comment: null},
    {id: 'MAH-602-2', versionId: 'MPS-2025-06-002', eventType: 'Submitted', actor: 'Maya Planner', timestamp: '2025-06-17T10:45:00', comment: 'SKU-449 line reallocation after maintenance.'},
    {id: 'MAH-602-3', versionId: 'MPS-2025-06-002', eventType: 'Approved', actor: 'Carlos Ops Manager', timestamp: '2025-06-18T08:00:00', comment: null},
  ],
  'MPS-2025-06-003': [
    {id: 'MAH-603-1', versionId: 'MPS-2025-06-003', eventType: 'Imported', actor: 'Ana Forecast Analyst', timestamp: '2025-06-24T09:00:00', comment: 'Excel import for September pull-in scenario.'},
    {id: 'MAH-603-2', versionId: 'MPS-2025-06-003', eventType: 'Submitted', actor: 'Ana Forecast Analyst', timestamp: '2025-06-24T09:20:00', comment: 'September +12K units pull-in. Capacity check needed.'},
  ],
  'MPS-2025-09-001': [
    {id: 'MAH-901-1', versionId: 'MPS-2025-09-001', eventType: 'Imported', actor: 'Maya Planner', timestamp: '2025-09-01T08:00:00', comment: 'Q4 planning cycle kickoff import.'},
  ],
  'MPS-2025-09-002': [
    {id: 'MAH-902-1', versionId: 'MPS-2025-09-002', eventType: 'Imported', actor: 'Ana Forecast Analyst', timestamp: '2025-09-03T14:20:00', comment: null},
    {id: 'MAH-902-2', versionId: 'MPS-2025-09-002', eventType: 'Submitted', actor: 'Ana Forecast Analyst', timestamp: '2025-09-03T14:35:00', comment: 'Adding Line 4 to Q4 scope.'},
    {id: 'MAH-902-3', versionId: 'MPS-2025-09-002', eventType: 'Rejected', actor: 'Carlos Ops Manager', timestamp: '2025-09-04T09:00:00', comment: 'Line 4 not qualified for production. Reject until qualification is complete.'},
  ],
};

export function getMpsApprovalHistory(versionId: string): MpsVersionAuditEvent[] {
  return mpsApprovalHistoryMap[versionId] ?? [];
}

export function buildMpsVersionKpis(versions: MpsVersion[]): MpsVersionKpi[] {
  const latestBaseline = [...versions]
    .filter((v) => v.isApprovedBaseline)
    .sort((a, b) => b.importedAt.localeCompare(a.importedAt))[0] ?? null;
  const pendingCount = versions.filter((v) => v.approvalStatus === 'Pending Approval').length;
  const mostRecentCycleId = versions[0]?.cycleId ?? '';
  const versionsThisCycle = versions.filter((v) => v.cycleId === mostRecentCycleId).length;
  const linesImpacted = new Set(versions.flatMap((v) => v.impactedLines)).size;

  return [
    {
      key: 'active-baseline',
      label: 'Active Baseline',
      value: latestBaseline?.id ?? '—',
      helperText: latestBaseline ? latestBaseline.planningCycle : 'No committed baseline',
      tone: latestBaseline ? 'success' : 'neutral',
      icon: 'baseline',
    },
    {
      key: 'pending-approval',
      label: 'Pending Approval',
      value: pendingCount,
      helperText: pendingCount > 0 ? 'Requires planner decision' : 'No versions pending',
      tone: pendingCount > 0 ? 'warning' : 'neutral',
      icon: 'pending',
    },
    {
      key: 'versions-this-cycle',
      label: 'Versions This Cycle',
      value: versionsThisCycle,
      helperText: versions.find((v) => v.cycleId === mostRecentCycleId)?.planningCycle ?? '—',
      tone: 'info',
      icon: 'versions',
    },
    {
      key: 'lines-impacted',
      label: 'Lines Impacted',
      value: linesImpacted,
      helperText: 'Unique lines across all versions',
      tone: 'neutral',
      icon: 'lines',
    },
  ];
}

export const defaultMpsVersionFilters: MpsVersionFiltersState = {
  cycleId: '',
  approvalStatus: '',
  isBaseline: '',
  dateFrom: '',
  dateTo: '',
  search: '',
};

export const mpsCycleOptions = [
  {id: 'MPS-CYCLE-2025-09', label: 'September Forecast 2025'},
  {id: 'MPS-CYCLE-2025-06', label: 'June Forecast 2025'},
  {id: 'MPS-CYCLE-2025-03', label: 'March Reforecast 2025'},
];
