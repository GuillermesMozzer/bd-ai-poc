import {demandAverageByPeriod, skuDemandMatrix} from '../demandMatrix/demandMatrixMock';

export type ProductionLine = {
  id: string;
  name: string;
  nominalCapacityUnitsPerHour: number;
  avgOeePct: number;
  hoursPerShift: number;
  shiftsPerDay: number;
  workingDaysPerMonth: number;
  peopleCount: number;
};

export type SkuLineAssignment = {
  skuCode: string;
  lineId: string;
  demandUnitsMonthlyAvg: number;
  productionPlanUnits: number;
};

export const productionLines: ProductionLine[] = [
  {id: 'line-03', name: 'Line 03', nominalCapacityUnitsPerHour: 1200, avgOeePct: 82, hoursPerShift: 8, shiftsPerDay: 2, workingDaysPerMonth: 22, peopleCount: 14},
  {id: 'line-07', name: 'Line 07', nominalCapacityUnitsPerHour: 950,  avgOeePct: 78, hoursPerShift: 8, shiftsPerDay: 2, workingDaysPerMonth: 22, peopleCount: 11},
  {id: 'line-10', name: 'Line 10', nominalCapacityUnitsPerHour: 1500, avgOeePct: 85, hoursPerShift: 8, shiftsPerDay: 3, workingDaysPerMonth: 22, peopleCount: 18},
];

export function capacityAtOee(line: ProductionLine): number {
  return Math.round(line.nominalCapacityUnitsPerHour * (line.avgOeePct / 100) * line.hoursPerShift * line.shiftsPerDay * line.workingDaysPerMonth);
}

const LINE_ASSIGNMENTS: Record<string, string> = {
  '330002-02': 'line-03',
  '334181-02': 'line-03',
  '338011-04': 'line-03',
  '331200-01': 'line-03',
  '332388-02': 'line-07',
  '330851-06': 'line-07',
  '337711-02': 'line-07',
  '339204-02': 'line-10',
  '335500-04': 'line-10',
  '332901-01': 'line-10',
  '334802-03': 'line-10',
};

const PRODUCTION_PLAN_PCT: Record<string, number> = {
  '330002-02': 0.94,
  '334181-02': 0.91,
  '338011-04': 0.96,
  '331200-01': 0.90,
  '332388-02': 0.93,
  '330851-06': 0.92,
  '337711-02': 0.88,
  '339204-02': 0.97,
  '335500-04': 0.91,
  '332901-01': 0.94,
  '334802-03': 0.89,
};

export const skuLineAssignments: SkuLineAssignment[] = skuDemandMatrix.map((sku) => {
  const avg = demandAverageByPeriod.find((a) => a.skuCode === sku.skuCode);
  const demandUnitsMonthlyAvg = avg?.avg12M ?? 0;
  const pct = PRODUCTION_PLAN_PCT[sku.skuCode] ?? 0.92;
  return {
    skuCode: sku.skuCode,
    lineId: LINE_ASSIGNMENTS[sku.skuCode] ?? 'line-03',
    demandUnitsMonthlyAvg,
    productionPlanUnits: Math.round(demandUnitsMonthlyAvg * pct),
  };
});
