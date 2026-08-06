import type {MachineType, MachineWorkOrder} from '../schedulingWorkspaceTimeline/types';
import type {V2ColumnLine, V2DragPayload, V2TimeSlot, V2UnplannedWorkOrder} from './types';

export const V2_DRAG_MIME = 'application/x-order-planning-wo';

export function cloneWorkOrder<T>(workOrder: T): T {
  return structuredClone(workOrder);
}

export function cloneWorkOrders<T>(workOrders: T[]): T[] {
  return workOrders.map((workOrder) => cloneWorkOrder(workOrder));
}

export function serializeDragPayload(payload: V2DragPayload) {
  return JSON.stringify(payload);
}

export function parseDragPayload(raw: string): V2DragPayload | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as V2DragPayload;
    if (!parsed?.workOrderId || !parsed?.source) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function slotIdToDateTime(slotId: string) {
  const separatorIndex = slotId.lastIndexOf('-');
  const date = slotId.slice(0, separatorIndex);
  const hour = Number(slotId.slice(separatorIndex + 1));
  return `${date}T${String(hour).padStart(2, '0')}:00:00`;
}

export function addHoursToDateTime(dateTime: string, hours: number) {
  const date = new Date(dateTime);
  date.setHours(date.getHours() + hours);
  return toLocalIso(date);
}

export function toLocalIso(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

export function getMachineMeta(lines: V2ColumnLine[], machineId: string) {
  for (const line of lines) {
    const machine = line.machines.find((item) => item.id === machineId);
    if (machine) {
      return {
        lineId: line.id,
        machineId: machine.id,
        machineName: machine.label,
        machineType: inferMachineType(machine.label),
        operationName: machine.label,
      };
    }
  }
  return null;
}

function inferMachineType(machineLabel: string): MachineType {
  const normalized = machineLabel.toLowerCase();
  if (normalized.includes('filler')) return 'Filler';
  if (normalized.includes('sealer')) return 'Sealer';
  if (normalized.includes('label')) return 'Labeler';
  if (normalized.includes('packer')) return 'Packer';
  if (normalized.includes('steril')) return 'Sterilizer';
  if (normalized.includes('inspect')) return 'Inspector';
  if (normalized.includes('print')) return 'Printer';
  if (normalized.includes('robot')) return 'Robot';
  if (normalized.includes('conveyor')) return 'Conveyor';
  if (normalized.includes('test')) return 'Tester';
  if (normalized.includes('wash')) return 'Washer';
  if (normalized.includes('dry')) return 'Dryer';
  return 'Other';
}

export function createPlannedWorkOrder(
  unplanned: V2UnplannedWorkOrder,
  target: {lineId: string; machineId: string; slotId: string},
  lines: V2ColumnLine[],
): MachineWorkOrder | null {
  const machineMeta = getMachineMeta(lines, target.machineId);
  if (!machineMeta) return null;

  const plannedStartDateTime = slotIdToDateTime(target.slotId);
  const plannedEndDateTime = addHoursToDateTime(plannedStartDateTime, unplanned.durationHours);

  return {
    id: unplanned.id,
    woNumber: unplanned.woNumber,
    batchNumber: `${unplanned.woNumber.replace(/^WO-/, 'BT-')}`,
    productCode: unplanned.productCode,
    productDescription: unplanned.productDescription,
    productFamily: unplanned.productCode.split('-')[0] ?? 'FG',
    quantity: unplanned.quantity,
    uom: unplanned.uom,
    lineId: machineMeta.lineId,
    plannedStartDateTime,
    plannedEndDateTime,
    durationHours: unplanned.durationHours,
    status: 'Planned',
    readinessStatus: 'Ready',
    priority: unplanned.priority,
    exceptionCount: 0,
    machineId: machineMeta.machineId,
    machineName: machineMeta.machineName,
    machineType: machineMeta.machineType,
    operationName: machineMeta.operationName,
    operationSequence: 10,
    setupRequired: false,
    setupMinutes: 0,
    changeoverGroup: 'Manual',
    materialRisk: normalizeRisk(unplanned.materialRisk),
    qualityRisk: normalizeRisk(unplanned.qualityRisk),
    laborRisk: normalizeRisk(unplanned.laborRisk),
    progressPercent: 0,
    plannerComment: 'Scheduled from To Plan in edit mode.',
  };
}

export function movePlannedWorkOrder(
  workOrder: MachineWorkOrder,
  target: {lineId: string; machineId: string; slotId: string},
  lines: V2ColumnLine[],
): MachineWorkOrder | null {
  const machineMeta = getMachineMeta(lines, target.machineId);
  if (!machineMeta) return null;
  const plannedStartDateTime = slotIdToDateTime(target.slotId);
  const plannedEndDateTime = addHoursToDateTime(plannedStartDateTime, workOrder.durationHours);

  return {
    ...workOrder,
    lineId: machineMeta.lineId,
    machineId: machineMeta.machineId,
    machineName: machineMeta.machineName,
    machineType: machineMeta.machineType,
    operationName: machineMeta.operationName,
    plannedStartDateTime,
    plannedEndDateTime,
  };
}

export function isSlotVisible(slotId: string, slots: V2TimeSlot[]) {
  return slots.some((slot) => slot.id === slotId);
}

function normalizeRisk(value: string): 'None' | 'Low' | 'Medium' | 'High' {
  if (value === 'Low' || value === 'Medium' || value === 'High') return value;
  return 'None';
}
