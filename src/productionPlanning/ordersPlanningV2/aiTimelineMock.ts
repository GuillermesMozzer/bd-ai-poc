import type {MachineWorkOrder} from './types';
import type {V2ColumnLine, V2ObjectCategoryConfig, V2TimeSlot} from './types';
import {generateV2TimeSlots} from './mock';

export const aiTimelineLines: V2ColumnLine[] = [
  {
    id: 'ai-line-10',
    label: 'Line 10 — Filling',
    shortLabel: 'L10',
    status: 'Running',
    utilizationPercent: 72,
    expanded: true,
    oeeTrend: [],
    machines: [
      {
        id: 'ai-machine-10a',
        lineId: 'ai-line-10',
        label: 'Filler A',
        shortLabel: 'F-A',
        status: 'Running',
        utilizationPercent: 78,
        oeeTrend: [],
      },
      {
        id: 'ai-machine-10b',
        lineId: 'ai-line-10',
        label: 'Sealer B',
        shortLabel: 'S-B',
        status: 'Available',
        utilizationPercent: 65,
        oeeTrend: [],
      },
    ],
  },
  {
    id: 'ai-line-20',
    label: 'Line 20 — Packaging',
    shortLabel: 'L20',
    status: 'Available',
    utilizationPercent: 58,
    expanded: true,
    oeeTrend: [],
    machines: [
      {
        id: 'ai-machine-20a',
        lineId: 'ai-line-20',
        label: 'Packer A',
        shortLabel: 'P-A',
        status: 'Running',
        utilizationPercent: 62,
        oeeTrend: [],
      },
      {
        id: 'ai-machine-20b',
        lineId: 'ai-line-20',
        label: 'Labeler B',
        shortLabel: 'L-B',
        status: 'Available',
        utilizationPercent: 54,
        oeeTrend: [],
      },
    ],
  },
];

export const aiTimelineSlots: V2TimeSlot[] = generateV2TimeSlots('2026-05-15', '2026-05-15');

export const AI_TIMELINE_CATEGORIES: V2ObjectCategoryConfig[] = [
  {id: 'work-orders', label: 'Work Orders', color: '#2563EB', enabled: true},
  {id: 'maintenance', label: 'Maintenance', color: '#F59E0B', enabled: false},
  {id: 'Downtime', label: 'Downtime', color: '#b910ae', enabled: false},
  {id: 'changeover', label: 'Changeover / Setup', color: '#10B981', enabled: false},
  {id: 'quality-hold', label: 'Quality Hold', color: '#DC2626', enabled: false},
  {id: 'cleaning', label: 'Cleaning', color: '#8B5CF6', enabled: false},
];

const BASE: Omit<MachineWorkOrder, 'id' | 'woNumber' | 'machineId' | 'machineName' | 'lineId' | 'plannedStartDateTime' | 'plannedEndDateTime' | 'durationHours' | 'productCode' | 'productDescription' | 'productFamily' | 'quantity' | 'status' | 'priority' | 'readinessStatus' | 'changeoverGroup'> = {
  batchNumber: 'B-AI-001',
  uom: 'units',
  exceptionCount: 0,
  operationName: 'Fill & Seal',
  operationSequence: 1,
  machineType: 'Filler',
  setupRequired: false,
  setupMinutes: 0,
  materialRisk: 'None',
  qualityRisk: 'None',
  laborRisk: 'None',
  progressPercent: 0,
  aiSequenceRecommendation: 'On-time',
};

function d(hour: number, minute = 0): string {
  return `2026-05-15T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`;
}

export const AI_TIMELINE_INITIAL_WOS: MachineWorkOrder[] = [
  // ai-machine-10a — gaps at 10:00–13:00 and 16:30–19:00
  {
    ...BASE, id: 'ai-wo-001', woNumber: 'WO-AI-001', lineId: 'ai-line-10', machineId: 'ai-machine-10a',
    machineName: 'Filler A', machineType: 'Filler', changeoverGroup: 'grp-A',
    productCode: 'PRD-001', productDescription: 'Product Alpha', productFamily: 'Family A',
    quantity: 500, status: 'Released', priority: 'High', readinessStatus: 'Ready',
    plannedStartDateTime: d(7), plannedEndDateTime: d(10), durationHours: 3,
  },
  {
    ...BASE, id: 'ai-wo-002', woNumber: 'WO-AI-002', lineId: 'ai-line-10', machineId: 'ai-machine-10a',
    machineName: 'Filler A', machineType: 'Filler', changeoverGroup: 'grp-A',
    productCode: 'PRD-002', productDescription: 'Product Beta', productFamily: 'Family A',
    quantity: 700, status: 'Planned', priority: 'Medium', readinessStatus: 'Ready',
    plannedStartDateTime: d(13), plannedEndDateTime: d(16, 30), durationHours: 3.5,
  },
  {
    ...BASE, id: 'ai-wo-003', woNumber: 'WO-AI-003', lineId: 'ai-line-10', machineId: 'ai-machine-10a',
    machineName: 'Filler A', machineType: 'Filler', changeoverGroup: 'grp-A',
    productCode: 'PRD-003', productDescription: 'Product Gamma', productFamily: 'Family A',
    quantity: 400, status: 'Planned', priority: 'Low', readinessStatus: 'Warning',
    plannedStartDateTime: d(19), plannedEndDateTime: d(22), durationHours: 3,
  },
  // ai-machine-10b — gaps at 10:30–14:00 and 17:00–19:30
  {
    ...BASE, id: 'ai-wo-004', woNumber: 'WO-AI-004', lineId: 'ai-line-10', machineId: 'ai-machine-10b',
    machineName: 'Sealer B', machineType: 'Sealer', changeoverGroup: 'grp-B',
    productCode: 'PRD-004', productDescription: 'Product Delta', productFamily: 'Family B',
    quantity: 600, status: 'Released', priority: 'High', readinessStatus: 'Ready',
    plannedStartDateTime: d(7, 30), plannedEndDateTime: d(10, 30), durationHours: 3,
  },
  {
    ...BASE, id: 'ai-wo-005', woNumber: 'WO-AI-005', lineId: 'ai-line-10', machineId: 'ai-machine-10b',
    machineName: 'Sealer B', machineType: 'Sealer', changeoverGroup: 'grp-B',
    productCode: 'PRD-005', productDescription: 'Product Epsilon', productFamily: 'Family B',
    quantity: 450, status: 'Planned', priority: 'Medium', readinessStatus: 'Ready',
    plannedStartDateTime: d(14), plannedEndDateTime: d(17), durationHours: 3,
  },
  {
    ...BASE, id: 'ai-wo-006', woNumber: 'WO-AI-006', lineId: 'ai-line-10', machineId: 'ai-machine-10b',
    machineName: 'Sealer B', machineType: 'Sealer', changeoverGroup: 'grp-B',
    productCode: 'PRD-006', productDescription: 'Product Zeta', productFamily: 'Family B',
    quantity: 350, status: 'Planned', priority: 'Low', readinessStatus: 'Ready',
    plannedStartDateTime: d(19, 30), plannedEndDateTime: d(22), durationHours: 2.5,
  },
  // ai-machine-20a — gaps at 12:00–15:00 and 18:00–20:00
  {
    ...BASE, id: 'ai-wo-007', woNumber: 'WO-AI-007', lineId: 'ai-line-20', machineId: 'ai-machine-20a',
    machineName: 'Packer A', machineType: 'Packer', changeoverGroup: 'grp-C',
    productCode: 'PRD-007', productDescription: 'Product Eta', productFamily: 'Family C',
    quantity: 800, status: 'Released', priority: 'Critical', readinessStatus: 'Ready',
    plannedStartDateTime: d(8), plannedEndDateTime: d(12), durationHours: 4,
  },
  {
    ...BASE, id: 'ai-wo-008', woNumber: 'WO-AI-008', lineId: 'ai-line-20', machineId: 'ai-machine-20a',
    machineName: 'Packer A', machineType: 'Packer', changeoverGroup: 'grp-C',
    productCode: 'PRD-008', productDescription: 'Product Theta', productFamily: 'Family C',
    quantity: 550, status: 'Planned', priority: 'High', readinessStatus: 'Warning',
    plannedStartDateTime: d(15), plannedEndDateTime: d(18), durationHours: 3,
  },
  {
    ...BASE, id: 'ai-wo-009', woNumber: 'WO-AI-009', lineId: 'ai-line-20', machineId: 'ai-machine-20a',
    machineName: 'Packer A', machineType: 'Packer', changeoverGroup: 'grp-C',
    productCode: 'PRD-009', productDescription: 'Product Iota', productFamily: 'Family C',
    quantity: 400, status: 'Planned', priority: 'Medium', readinessStatus: 'Ready',
    plannedStartDateTime: d(20), plannedEndDateTime: d(23), durationHours: 3,
  },
  // ai-machine-20b — gaps at 09:00–13:00 and 16:00–19:00
  {
    ...BASE, id: 'ai-wo-010', woNumber: 'WO-AI-010', lineId: 'ai-line-20', machineId: 'ai-machine-20b',
    machineName: 'Labeler B', machineType: 'Labeler', changeoverGroup: 'grp-D',
    productCode: 'PRD-010', productDescription: 'Product Kappa', productFamily: 'Family D',
    quantity: 300, status: 'Released', priority: 'High', readinessStatus: 'Ready',
    plannedStartDateTime: d(7), plannedEndDateTime: d(9), durationHours: 2,
  },
  {
    ...BASE, id: 'ai-wo-011', woNumber: 'WO-AI-011', lineId: 'ai-line-20', machineId: 'ai-machine-20b',
    machineName: 'Labeler B', machineType: 'Labeler', changeoverGroup: 'grp-D',
    productCode: 'PRD-011', productDescription: 'Product Lambda', productFamily: 'Family D',
    quantity: 500, status: 'Planned', priority: 'Medium', readinessStatus: 'Ready',
    plannedStartDateTime: d(13), plannedEndDateTime: d(16), durationHours: 3,
  },
  {
    ...BASE, id: 'ai-wo-012', woNumber: 'WO-AI-012', lineId: 'ai-line-20', machineId: 'ai-machine-20b',
    machineName: 'Labeler B', machineType: 'Labeler', changeoverGroup: 'grp-D',
    productCode: 'PRD-012', productDescription: 'Product Mu', productFamily: 'Family D',
    quantity: 420, status: 'Planned', priority: 'Low', readinessStatus: 'Warning',
    plannedStartDateTime: d(19), plannedEndDateTime: d(22), durationHours: 3,
  },
];

// Packed state: each WO immediately follows the previous on the same machine (no gaps)
export const AI_TIMELINE_FINAL_WOS: MachineWorkOrder[] = [
  // ai-machine-10a: 07:00–10:00, 10:00–13:30, 13:30–16:30
  {...AI_TIMELINE_INITIAL_WOS[0], plannedStartDateTime: d(7), plannedEndDateTime: d(10)},
  {...AI_TIMELINE_INITIAL_WOS[1], plannedStartDateTime: d(10), plannedEndDateTime: d(13, 30)},
  {...AI_TIMELINE_INITIAL_WOS[2], plannedStartDateTime: d(13, 30), plannedEndDateTime: d(16, 30)},
  // ai-machine-10b: 07:30–10:30, 10:30–13:30, 13:30–16:00
  {...AI_TIMELINE_INITIAL_WOS[3], plannedStartDateTime: d(7, 30), plannedEndDateTime: d(10, 30)},
  {...AI_TIMELINE_INITIAL_WOS[4], plannedStartDateTime: d(10, 30), plannedEndDateTime: d(13, 30)},
  {...AI_TIMELINE_INITIAL_WOS[5], plannedStartDateTime: d(13, 30), plannedEndDateTime: d(16)},
  // ai-machine-20a: 08:00–12:00, 12:00–15:00, 15:00–18:00
  {...AI_TIMELINE_INITIAL_WOS[6], plannedStartDateTime: d(8), plannedEndDateTime: d(12)},
  {...AI_TIMELINE_INITIAL_WOS[7], plannedStartDateTime: d(12), plannedEndDateTime: d(15)},
  {...AI_TIMELINE_INITIAL_WOS[8], plannedStartDateTime: d(15), plannedEndDateTime: d(18)},
  // ai-machine-20b: 07:00–09:00, 09:00–12:00, 12:00–15:00
  {...AI_TIMELINE_INITIAL_WOS[9], plannedStartDateTime: d(7), plannedEndDateTime: d(9)},
  {...AI_TIMELINE_INITIAL_WOS[10], plannedStartDateTime: d(9), plannedEndDateTime: d(12)},
  {...AI_TIMELINE_INITIAL_WOS[11], plannedStartDateTime: d(12), plannedEndDateTime: d(15)},
];

function lerpIso(a: string, b: string, t: number): string {
  const ms = new Date(a).getTime() + (new Date(b).getTime() - new Date(a).getTime()) * t;
  return new Date(ms).toISOString();
}

export function interpolateTimelineWOs(
  initial: MachineWorkOrder[],
  final: MachineWorkOrder[],
  progress: number,
): MachineWorkOrder[] {
  const t = Math.max(0, Math.min(1, progress));
  return initial.map((wo, i) => ({
    ...wo,
    plannedStartDateTime: lerpIso(wo.plannedStartDateTime, final[i].plannedStartDateTime, t),
    plannedEndDateTime: lerpIso(wo.plannedEndDateTime, final[i].plannedEndDateTime, t),
  }));
}
