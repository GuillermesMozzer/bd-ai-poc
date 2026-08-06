import type {
  CalendarPlanningEvent,
  LongTermPlan,
  LongTermPlanLine,
  LongTermPlanningMockBundle,
  ProductLineCapability,
  ProductionLine,
} from './types';

function monthSequence(startDate = new Date()) {
  const months: string[] = [];
  const cursor = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), 1));
  for (let index = 0; index < 12; index += 1) {
    months.push(cursor.toISOString().slice(0, 7));
    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }
  return months;
}

function createImpact(overrides?: Partial<CalendarPlanningEvent['impact']>): CalendarPlanningEvent['impact'] {
  return {
    requestedQuantity: 0,
    committedQuantity: 0,
    uncoveredQuantity: 0,
    requiredHours: 0,
    availableHours: 0,
    utilizationPercent: 0,
    ...overrides,
  };
}

function createDemoCalendarEvents(site: string, year: number): CalendarPlanningEvent[] {
  return [
    {
      id: `calendar-holiday-${year}-01-01`,
      title: 'New Year Holiday',
      type: 'Holiday',
      date: `${year}-01-01`,
      startDate: `${year}-01-01`,
      endDate: `${year}-01-01`,
      month: `${year}-01`,
      site,
      severity: 'Info',
      description: 'Holiday closure affecting production and logistics.',
      source: 'Calendar',
      impact: createImpact(),
    },
    {
      id: `calendar-maintenance-${year}-02-18`,
      title: 'Line maintenance',
      type: 'Maintenance',
      date: `${year}-02-18`,
      startDate: `${year}-02-18`,
      endDate: `${year}-02-18`,
      month: `${year}-02`,
      site,
      lineId: 'line-20',
      severity: 'Warning',
      description: 'Planned maintenance reduces available runtime on Line 20.',
      source: 'Calendar',
      impact: createImpact({availableHours: -24}),
    },
    {
      id: `calendar-reduced-capacity-${year}-05-13`,
      title: 'Reduced capacity staffing event',
      type: 'ReducedCapacity',
      date: `${year}-05-13`,
      startDate: `${year}-05-13`,
      endDate: `${year}-05-13`,
      month: `${year}-05`,
      site,
      severity: 'Warning',
      description: 'Temporary staffing gap reduces effective line capacity.',
      source: 'Capacity',
      impact: createImpact({availableHours: -16, utilizationPercent: 12}),
    },
    {
      id: `calendar-supplier-test-${year}-05-22`,
      title: 'Supplier qualification test',
      type: 'SupplierTest',
      date: `${year}-05-22`,
      startDate: `${year}-05-22`,
      endDate: `${year}-05-22`,
      month: `${year}-05`,
      site,
      severity: 'Info',
      description: 'Supplier test may consume line time and QA resources.',
      source: 'Calendar',
      impact: createImpact(),
    },
    {
      id: `calendar-annual-shutdown-${year}-07`,
      title: 'Annual shutdown',
      type: 'AnnualShutdown',
      date: `${year}-07-06`,
      startDate: `${year}-07-06`,
      endDate: `${year}-07-10`,
      month: `${year}-07`,
      site,
      severity: 'Blocker',
      description: 'Annual shutdown window with no planned production.',
      source: 'Calendar',
      impact: createImpact({availableHours: -80}),
    },
    {
      id: `calendar-engineering-${year}-10-14`,
      title: 'Engineering event',
      type: 'EngineeringEvent',
      date: `${year}-10-14`,
      startDate: `${year}-10-14`,
      endDate: `${year}-10-14`,
      month: `${year}-10`,
      site,
      severity: 'Info',
      description: 'Engineering trial window reserved for process tuning.',
      source: 'Calendar',
      impact: createImpact(),
    },
    {
      id: `calendar-validation-${year}-12-08`,
      title: 'Validation campaign',
      type: 'Validation',
      date: `${year}-12-08`,
      startDate: `${year}-12-08`,
      endDate: `${year}-12-08`,
      month: `${year}-12`,
      site,
      severity: 'Warning',
      description: 'Validation activities consume quality and line time.',
      source: 'Calendar',
      impact: createImpact({availableHours: -12}),
    },
    {
      id: `calendar-shutdown-${year}-12`,
      title: 'Year-end shutdown',
      type: 'AnnualShutdown',
      date: `${year}-12-24`,
      startDate: `${year}-12-24`,
      endDate: `${year}-12-31`,
      month: `${year}-12`,
      site,
      severity: 'Blocker',
      description: 'Year-end shutdown period for maintenance and inventory.',
      source: 'Calendar',
      impact: createImpact({availableHours: -96}),
    },
    {
      id: `calendar-material-test-${year}-09-17`,
      title: 'Material test',
      type: 'MaterialTest',
      date: `${year}-09-17`,
      startDate: `${year}-09-17`,
      endDate: `${year}-09-17`,
      month: `${year}-09`,
      site,
      severity: 'Info',
      description: 'Material validation sample run scheduled.',
      source: 'Calendar',
      impact: createImpact(),
    },
  ];
}

export function createLongTermPlanningMockData(now = new Date()): LongTermPlanningMockBundle {
  const months = monthSequence(now);
  const [m1, m2, m3, m4, m5, m6, m7, m8, m9, m10, m11, m12] = months;
  const plan: LongTermPlan = {
    id: 'LTP-PLY-2026-001',
    name: 'Plymouth Rolling 12M Plan',
    site: 'Plymouth',
    horizonStartMonth: m1,
    horizonEndMonth: m12,
    version: 'v2026.05.13',
    source: 'Global Supply Chain MPS Extract',
    status: 'Imported',
    createdBy: 'Maya Planner',
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    sourceTimestamp: new Date(now.getTime() - 96 * 60 * 60 * 1000).toISOString(),
    notes: 'Mock rolling 12-month plan for front-end-only validation and scenario review.',
  };

  const productionLines: ProductionLine[] = [
    {
      id: 'line-10',
      name: 'Line 10',
      area: 'Tube Assembly',
      active: true,
      monthlyAvailableHours: months.map((month, index) => ({
        month,
        availableHours: index === 1 ? 250 : index === 4 ? 230 : 280,
        plannedDowntimeHours: index === 1 ? 32 : 20,
        calendarNotes: index === 1 ? 'Validation shutdown window' : undefined,
      })),
    },
    {
      id: 'line-20',
      name: 'Line 20',
      area: 'Packaging',
      active: true,
      monthlyAvailableHours: months.map((month, index) => ({
        month,
        availableHours: index === 1 ? 160 : index === 5 ? 210 : 240,
        plannedDowntimeHours: index === 1 ? 48 : 24,
        calendarNotes: index === 1 ? 'Major maintenance outage' : undefined,
      })),
    },
    {
      id: 'line-30',
      name: 'Line 30',
      area: 'Specialty Finishing',
      active: true,
      monthlyAvailableHours: months.map((month, index) => ({
        month,
        availableHours: index === 2 ? 190 : 220,
        plannedDowntimeHours: index === 2 ? 36 : 18,
        calendarNotes: index === 2 ? 'Seasonal staffing constraint' : undefined,
      })),
    },
  ];

  const capabilities: ProductLineCapability[] = [
    {productCode: 'FG-1001', lineId: 'line-10', productionRateUnitsPerHour: 220, minLotSize: 4000, maxLotSize: 16000, preferredLotSize: 10000, active: true},
    {productCode: 'FG-1001', lineId: 'line-20', productionRateUnitsPerHour: 180, minLotSize: 4000, maxLotSize: 15000, preferredLotSize: 9000, active: true},
    {productCode: 'FG-1002', lineId: 'line-10', productionRateUnitsPerHour: 210, minLotSize: 5000, maxLotSize: 17000, preferredLotSize: 11000, active: true},
    {productCode: 'FG-2001', lineId: 'line-20', productionRateUnitsPerHour: 120, minLotSize: 3000, maxLotSize: 12000, preferredLotSize: 8000, active: true},
    {productCode: 'FG-2001', lineId: 'line-30', productionRateUnitsPerHour: 110, minLotSize: 2500, maxLotSize: 9000, preferredLotSize: 7000, active: true},
    {productCode: 'FG-3001', lineId: 'line-20', productionRateUnitsPerHour: 95, minLotSize: 2500, maxLotSize: 10000, preferredLotSize: 6000, active: true},
    {productCode: 'FG-3001', lineId: 'line-30', productionRateUnitsPerHour: 90, minLotSize: 2500, maxLotSize: 9000, preferredLotSize: 5500, active: true},
    {productCode: 'FG-4001', lineId: 'line-20', productionRateUnitsPerHour: null, minLotSize: 1500, maxLotSize: 6000, preferredLotSize: 3500, active: true, notes: 'Rate pending engineering confirmation'},
    {productCode: 'FG-5001', lineId: 'line-30', productionRateUnitsPerHour: 70, minLotSize: 800, maxLotSize: 3000, preferredLotSize: 1500, active: false, notes: 'Capability not yet requalified'},
  ];

  const lines: LongTermPlanLine[] = [
    {id: 'ltp-line-001', planId: plan.id, productCode: 'FG-1001', productDescription: 'Standard Tube A', productFamily: 'Standard Tubes', uom: 'EA', month: m1, requestedQuantity: 32000, committedQuantity: 32000, assignedLineId: 'line-10', demandSource: 'GlobalForecast', status: 'Feasible', plannerComment: 'Baseline demand aligned.'},
    {id: 'ltp-line-002', planId: plan.id, productCode: 'FG-1001', productDescription: 'Standard Tube A', productFamily: 'Standard Tubes', uom: 'EA', month: m2, requestedQuantity: 69000, committedQuantity: 56000, assignedLineId: 'line-20', demandSource: 'GlobalForecast', status: 'Constrained', constraintReason: 'Packaging line overload in peak month.', plannerComment: 'Need balancing scenario.'},
    {id: 'ltp-line-003', planId: plan.id, productCode: 'FG-1002', productDescription: 'Standard Tube B', productFamily: 'Standard Tubes', uom: 'EA', month: m2, requestedQuantity: 39500, committedQuantity: 39500, assignedLineId: 'line-10', demandSource: 'FirmOrder', status: 'Feasible', plannerComment: 'Firm order drives commitment.'},
    {id: 'ltp-line-004', planId: plan.id, productCode: 'FG-2001', productDescription: 'Additive Tube', productFamily: 'Additives', uom: 'EA', month: m3, requestedQuantity: 18000, committedQuantity: 18000, assignedLineId: 'line-30', demandSource: 'DistributionCenterEstimate', status: 'Feasible', plannerComment: 'Line 30 preferred due to mix flexibility.'},
    {id: 'ltp-line-005', planId: plan.id, productCode: 'FG-3001', productDescription: 'Gel Product', productFamily: 'Gel Products', uom: 'EA', month: m4, requestedQuantity: 22000, committedQuantity: 22000, assignedLineId: 'line-20', demandSource: 'GlobalForecast', status: 'AtRisk', plannerComment: 'High utilization watch.'},
    {id: 'ltp-line-006', planId: plan.id, productCode: 'FG-4001', productDescription: 'Specialty Pack', productFamily: 'Specialty Packs', uom: 'EA', month: m5, requestedQuantity: 5200, committedQuantity: 5200, assignedLineId: 'line-20', demandSource: 'ManualAdjustment', status: 'PendingData', constraintReason: 'Rate missing in master data.', plannerComment: 'Engineering data required.'},
    {id: 'ltp-line-007', planId: plan.id, productCode: 'FG-5001', productDescription: 'Low Volume Product', productFamily: 'Specialty Packs', uom: 'EA', month: m6, requestedQuantity: 1700, committedQuantity: 1700, assignedLineId: null, demandSource: 'Other', status: 'NotProducible', constraintReason: 'No qualified line currently active.', plannerComment: 'Escalate capability qualification.'},
    {id: 'ltp-line-008', planId: plan.id, productCode: 'FG-2001', productDescription: 'Additive Tube', productFamily: 'Additives', uom: 'EA', month: m7, requestedQuantity: 12000, committedQuantity: 11000, assignedLineId: 'line-20', demandSource: 'GlobalForecast', status: 'Constrained', constraintReason: 'Committed below requested due to capacity.', plannerComment: 'Undercoverage accepted pending review.'},
    {id: 'ltp-line-009', planId: plan.id, productCode: 'FG-3001', productDescription: 'Gel Product', productFamily: 'Gel Products', uom: 'EA', month: m8, requestedQuantity: 16000, committedQuantity: 16000, assignedLineId: 'line-30', demandSource: 'GlobalForecast', status: 'Feasible', plannerComment: 'Scenario candidate for alternate line.'},
    {id: 'ltp-line-010', planId: plan.id, productCode: 'FG-1002', productDescription: 'Standard Tube B', productFamily: 'Standard Tubes', uom: 'EA', month: m9, requestedQuantity: 28000, committedQuantity: 28000, assignedLineId: 'line-10', demandSource: 'DistributionCenterEstimate', status: 'Feasible', plannerComment: 'Steady demand profile.'},
  ];

  return {
    plan,
    planLines: lines,
    productionLines,
    capabilities,
    calendarEvents: createDemoCalendarEvents(plan.site, new Date(`${m1}-01T00:00:00Z`).getUTCFullYear()),
  };
}
