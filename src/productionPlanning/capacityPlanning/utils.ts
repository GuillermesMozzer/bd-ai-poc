import type {CapacityUnit, LineShiftSchedule, UtilizationStatus} from './types';
import {planningTokens} from '../ui/planningTheme';

export function getUtilizationStatus(pct: number): UtilizationStatus {
  if (pct > 120) return 'Overloaded';
  if (pct > 105) return 'AtRisk';
  if (pct > 90) return 'AtRisk';
  if (pct > 0) return 'OK';
  return 'NoData';
}

export function getUtilizationColor(status: UtilizationStatus | 'NA'): string {
  switch (status) {
    case 'Overloaded': return planningTokens.danger;
    case 'AtRisk': return '#F97316';
    case 'OK': return planningTokens.success;
    case 'UnderUtilized': return '#3B82F6';
    default: return planningTokens.textMuted;
  }
}

export function getUtilizationBg(status: UtilizationStatus | 'NA'): string {
  switch (status) {
    case 'Overloaded': return '#FEF2F2';
    case 'AtRisk': return '#FFF7ED';
    case 'OK': return '#F0FDF4';
    case 'UnderUtilized': return '#EFF6FF';
    default: return planningTokens.surfaceMuted;
  }
}

export function getCellBg(pct: number): string {
  if (pct > 120) return '#FECACA';
  if (pct > 105) return '#FED7AA';
  if (pct >= 90) return '#FEF08A';
  return 'transparent';
}

export function getCellColor(pct: number): string {
  if (pct > 120) return '#991B1B';
  if (pct > 105) return '#9A3412';
  if (pct >= 90) return '#713F12';
  return planningTokens.textPrimary;
}

export function formatKHours(hrs: number): string {
  if (hrs >= 1000000) return `${(hrs / 1000000).toFixed(1)}M`;
  if (hrs >= 1000) return `${(hrs / 1000).toFixed(0)}K`;
  return hrs.toLocaleString();
}

export function formatHours(hrs: number): string {
  return hrs.toLocaleString();
}

export function formatUnits(n: number): string {
  return n.toLocaleString();
}

export function convertCapacityHours(
  monthlyHrs: number,
  unit: CapacityUnit,
  schedule: LineShiftSchedule,
): number {
  const {workingDaysPerMonth, shiftsPerDay, daysPerWeek} = schedule;
  const workingWeeks = workingDaysPerMonth / daysPerWeek;
  switch (unit) {
    case 'pct': return monthlyHrs;
    case 'perMonth': return monthlyHrs;
    case 'perWeek': return Math.round(monthlyHrs / workingWeeks);
    case 'perDay': return Math.round(monthlyHrs / workingDaysPerMonth);
    case 'perShift': return Math.round(monthlyHrs / (workingDaysPerMonth * shiftsPerDay));
  }
}

export function formatCapacityValue(value: number, unit: CapacityUnit): string {
  const n = Math.round(value).toLocaleString();
  switch (unit) {
    case 'pct': return `${value.toFixed(0)}%`;
    case 'perMonth': return `${n} hrs`;
    case 'perWeek': return `${n} hrs/wk`;
    case 'perDay': return `${n} hrs/day`;
    case 'perShift': return `${n} hrs/shift`;
  }
}

export function capacityUnitLabel(unit: CapacityUnit): string {
  switch (unit) {
    case 'pct': return 'Utilization %';
    case 'perMonth': return 'hrs / month';
    case 'perWeek': return 'hrs / week';
    case 'perDay': return 'hrs / day';
    case 'perShift': return 'hrs / shift';
  }
}
