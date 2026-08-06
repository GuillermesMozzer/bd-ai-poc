export type UtilizationStatus = 'Overloaded' | 'AtRisk' | 'OK' | 'UnderUtilized' | 'NoData';

export type CapacityLine = {
  id: string;
  name: string;
  availableHrs: number;
  requiredHrs: number;
  utilizationPct: number;
  status: UtilizationStatus;
  position: {x: string; y: string};
};

export type CapacityMonth = {
  month: string;
  available: number;
  required: number;
  utilizationPct: number;
  status: UtilizationStatus;
};

export type CapacityByLine = {
  lineId: string;
  lineName: string;
  months: CapacityMonth[];
  totalAvail: number;
  totalReq: number;
};

export type CapacitySiteArea = {
  area: string;
  availableHrs: number | null;
  requiredHrs: number | null;
  utilizationPct: number | null;
  status: UtilizationStatus | 'NA';
};

export type CapacityKpis = {
  totalDemand: number;
  requiredCapacity: number;
  availableCapacity: number;
  capacityGap: number;
  avgUtilization: number;
  overloadedMonths: string[];
  bottleneckLine: string;
  bottleneckMonth: string;
  planningConfidence: 'High' | 'Medium' | 'Low';
  totalDemandDelta: number;
  requiredCapacityDelta: number;
  availableCapacityDelta: number;
};

export type DailyCapacityPoint = {
  day: number;
  available: number;
  required: number;
  gap: number;
};

export type CapacityAction = {
  timestamp: string;
  description: string;
  user: string;
};

export type CapacityLineDetail = {
  lineId: string;
  month: string;
  availableHrs: number;
  requiredHrs: number;
  utilizationPct: number;
  capacityGap: number;
  bottleneckReason: string;
  mainProducts: string[];
  topConstraints: string[];
};

export type CapacityScenario = {
  id: string;
  label: string;
};

export type ViewByOption = 'Utilization %' | 'Available Hours' | 'Required Hours' | 'Gap Hours';

export type LayerKey = 'productionLines' | 'warehouses' | 'utilities' | 'buildings' | 'logistics';

export type LayersState = Record<LayerKey, boolean>;

export type PendingCellAdjustment = {
  lineId: string;
  lineName: string;
  month: string;
  baselineAvailable: number;
  baselineRequired: number;
  baselineUtilPct: number;
  baselineStatus: UtilizationStatus;
  scenarioAvailable: number;
  scenarioUtilPct: number;
  scenarioStatus: UtilizationStatus;
  adjustmentType: 'AddHours' | 'SubtractHours' | 'SetHours' | 'AddPct' | 'SubtractPct';
  adjustmentValue: number;
  hoursDelta: number;
};

export type BulkAdjustmentSpec = {
  adjustmentType: PendingCellAdjustment['adjustmentType'];
  adjustmentValue: number;
};

export type CapacityMachine = {
  machineId: string;
  machineName: string;
  lineId: string;
  months: CapacityMonth[];
  totalAvail: number;
  totalReq: number;
};

export type CapacityByLineMachines = CapacityByLine & {
  machines: CapacityMachine[];
};

// ─── Capacity Unit / Granularity ────────────────────────────────────────────

export type CapacityUnit = 'pct' | 'perMonth' | 'perWeek' | 'perDay' | 'perShift';

// ─── Shift Schedule ──────────────────────────────────────────────────────────

export type ShiftDefinition = {
  name: string;
  startTime: string;
  endTime: string;
  hoursPerShift: number;
};

export type LineShiftSchedule = {
  lineId: string;
  shiftsPerDay: number;
  daysPerWeek: number;
  workingDaysPerMonth: number;
  shifts: ShiftDefinition[];
};

// ─── Week / Day drill-down ───────────────────────────────────────────────────

export type CapacityDay = {
  date: string;
  dayLabel: string;
  isWorkingDay: boolean;
  available: number;
  required: number;
  utilizationPct: number;
  status: UtilizationStatus;
};

export type CapacityWeek = {
  weekLabel: string;
  startDate: string;
  endDate: string;
  days: CapacityDay[];
  available: number;
  required: number;
  utilizationPct: number;
  status: UtilizationStatus;
};

export type CapacityMonthDrilldown = {
  lineId: string;
  lineName: string;
  month: string;
  weeks: CapacityWeek[];
  machines?: {machineId: string; machineName: string; weeks: CapacityWeek[]}[];
};

// ─── Line Capacity Management ────────────────────────────────────────────────

export type LineDesignCapacity = {
  lineId: string;
  designHrsPerMonth: number;
  designShiftsPerDay: number;
  designDaysPerWeek: number;
  designHrsPerShift: number;
  nominalOeePct: number;
  designRatePerHr: number;
  rateUnit: string;
};

export type PlanningAssumption = {
  lineId: string;
  planningEfficiencyFactor: number;
  plannedShiftsPerDay: number;
  plannedDaysPerWeek: number;
  effectivePlanningHrsPerMonth: number;
  notes: string;
  lastUpdatedBy: string;
  lastUpdatedAt: string;
  aiProposed?: boolean;
};

export type HistoricalActualCapacity = {
  lineId: string;
  month: string;
  actualHrs: number;
  plannedHrs: number;
  designHrs: number;
  utilizationVsPlan: number;
  utilizationVsDesign: number;
};

export type AiCapacityProposal = {
  lineId: string;
  proposedEfficiencyFactor: number;
  proposedPlanningHrsPerMonth: number;
  reasoning: string;
  confidence: 'High' | 'Medium' | 'Low';
  basedOnMonths: number;
  generatedAt: string;
  status: 'pending' | 'accepted' | 'rejected';
};

// ─── Equipment Detail ────────────────────────────────────────────────────────

export type EquipmentOeePoint = {
  month: string;
  oee: number;
  availability: number;
  performance: number;
  quality: number;
  designRate: number;
  actualRate: number;
};

export type EquipmentLedgerEntry = {
  date: string;
  type: 'Planned Maintenance' | 'Unplanned Downtime' | 'Changeover' | 'Inspection' | 'Repair' | 'Calibration';
  duration: number;
  description: string;
  status: 'Closed' | 'Open';
};
