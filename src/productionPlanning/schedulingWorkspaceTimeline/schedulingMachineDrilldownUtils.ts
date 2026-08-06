import type {
  MachineWorkOrder,
  ProductionMachine,
  SchedulingTimelineLine,
  TimelineDateRange,
  TimelineEvent,
  TimelineRow,
} from './types';
import {calculateWorkOrderBarPosition, detectTimelineConflicts, generateTimelineHourColumns} from './utils';

export function getMachinesForLine(lineId: string, machines: ProductionMachine[]) {
  return machines.filter((machine) => machine.lineId === lineId);
}

export function getMachineWorkOrders(machineId: string, machineWorkOrders: MachineWorkOrder[]) {
  return machineWorkOrders.filter((workOrder) => workOrder.machineId === machineId);
}

export function calculateLineMachineCount(lineId: string, machines: ProductionMachine[]) {
  return getMachinesForLine(lineId, machines).length;
}

export function toggleExpandedLine(expandedLineIds: string[], lineId: string) {
  return expandedLineIds.includes(lineId) ? expandedLineIds.filter((id) => id !== lineId) : [...expandedLineIds, lineId];
}

export function expandAllLines(lines: SchedulingTimelineLine[]) {
  return lines.map((line) => line.id);
}

export function collapseAllLines() {
  return [] as string[];
}

export function calculateMachineUtilization(machineId: string, machineWorkOrders: MachineWorkOrder[], dateRange: TimelineDateRange) {
  const columns = generateTimelineHourColumns(dateRange.startDate, dateRange.endDate);
  const totalHours = columns.length;
  if (totalHours === 0) {
    return 0;
  }
  const plannedHours = getMachineWorkOrders(machineId, machineWorkOrders)
    .reduce((sum, workOrder) => sum + calculateWorkOrderBarPosition(workOrder, columns).columnSpan, 0);
  return Number(Math.min(100, (plannedHours / totalHours) * 100).toFixed(1));
}

export function detectMachineOverlaps(machineWorkOrders: MachineWorkOrder[]) {
  const conflicts = detectTimelineConflicts(machineWorkOrders, [] as TimelineEvent[]);
  return Object.fromEntries(
    Object.entries(conflicts.workOrderConflicts).filter(([, messages]) => messages.length > 0),
  );
}

export function getMachineRiskSummary(machine: ProductionMachine) {
  return machine.riskReason?.trim() ? machine.riskReason : machine.riskLevel === 'None' ? 'No active risk' : `${machine.riskLevel} risk`;
}

export function mapMachineStatusToBadgeVariant(status: ProductionMachine['status']) {
  if (status === 'Running' || status === 'Available') {
    return 'success' as const;
  }
  if (status === 'Down' || status === 'Blocked') {
    return 'error' as const;
  }
  if (status === 'Maintenance' || status === 'Idle') {
    return 'default' as const;
  }
  return 'warning' as const;
}

export function buildTimelineRows(
  lines: SchedulingTimelineLine[],
  machines: ProductionMachine[],
  expandedLineIds: string[],
  showMachineDrilldown: boolean,
) {
  return lines.reduce<TimelineRow[]>((rows, line) => {
    const lineMachines = getMachinesForLine(line.id, machines);
    const isExpanded = expandedLineIds.includes(line.id);
    rows.push({
      id: line.id,
      rowType: 'Line',
      parentLineId: line.id,
      label: line.name,
      subLabel: line.area,
      status: line.status,
      utilizationPercent: line.utilizationPercent,
      riskLevel: line.riskLevel ?? 'None',
      depth: 0,
      isExpanded,
      machineCount: lineMachines.length,
      currentWorkOrderId: line.currentWorkOrderId ?? null,
      dataRef: line,
    });

    if (showMachineDrilldown && isExpanded) {
      for (const machine of lineMachines) {
        rows.push({
          id: machine.id,
          rowType: 'Machine',
          parentLineId: line.id,
          label: machine.name,
          subLabel: `${line.name} · ${machine.machineType}`,
          status: machine.status,
          utilizationPercent: machine.utilizationPercent,
          riskLevel: machine.riskLevel,
          depth: 1,
          isExpanded: false,
          machineCount: 0,
          currentWorkOrderId: machine.currentWorkOrderId,
          dataRef: machine,
        });
      }
    }

    return rows;
  }, []);
}

export function getRowScheduleItems(
  row: TimelineRow,
  lineItems: {workOrders: MachineWorkOrder[]; events: TimelineEvent[]},
  machineItems: {workOrders: MachineWorkOrder[]; events: TimelineEvent[]},
) {
  if (row.rowType === 'Line') {
    return lineItems;
  }
  return machineItems;
}
