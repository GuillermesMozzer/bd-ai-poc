import type {
  DocumentationReadinessItem,
  LaborReadinessItem,
  MachineReadinessItem,
  MaterialReadinessItem,
  QualityReadinessItem,
  RecommendedAction,
  ReadinessAuditEvent,
  ScheduleReadinessItem,
  ToolingReadinessItem,
  WarehouseStagingItem,
  WorkOrder,
  WorkOrderReadinessCheck,
  WorkOrderReadinessException,
  WoReadinessBundle,
} from './types';
import {
  buildRecommendedActions,
  calculateLaborCapacitySupportedPercent,
  hydrateWorkOrders,
} from './utils';

const REFERENCE_NOW = '2026-05-14T12:00:00.000Z';

function baseWorkOrders(): WorkOrder[] {
  return [
    {
      id: 'wo-100245',
      woNumber: 'WO-100245',
      batchNumber: 'B100245',
      productCode: 'FG-1001',
      productDescription: 'Standard Tube A',
      productFamily: 'Standard Tubes',
      quantityRequired: 32000,
      quantityProduced: 2000,
      quantityRemaining: 0,
      uom: 'PCS',
      dueDate: '2026-05-16T14:00:00.000Z',
      plannedStartDate: '2026-05-15T06:00:00.000Z',
      plannedEndDate: '2026-05-16T10:00:00.000Z',
      assignedLineId: 'line-10',
      assignedLineName: 'Line 10',
      machineId: 'mach-10-a',
      machineName: 'Tube Filler 10A',
      shift: 'Day',
      crew: 'Crew A',
      priority: 'High',
      status: 'Planned',
      readinessStatus: 'NotChecked',
      materialStatus: 'NotChecked',
      machineStatus: 'NotChecked',
      laborStatus: 'NotChecked',
      qualityStatus: 'NotChecked',
      documentationStatus: 'NotChecked',
      scheduleStatus: 'NotChecked',
      toolingStatus: 'NotChecked',
      warehouseStatus: 'NotChecked',
      exceptionCount: 0,
      owner: 'Maya Planner',
      lastCheckedAt: null,
      plannerComment: 'Watch final staging and line utilization before release.',
    },
    {
      id: 'wo-100246',
      woNumber: 'WO-100246',
      batchNumber: 'B100246',
      productCode: 'FG-1002',
      productDescription: 'Standard Tube B',
      productFamily: 'Standard Tubes',
      quantityRequired: 18000,
      quantityProduced: 0,
      quantityRemaining: 0,
      uom: 'PCS',
      dueDate: '2026-05-15T20:00:00.000Z',
      plannedStartDate: '2026-05-15T08:00:00.000Z',
      plannedEndDate: '2026-05-15T20:00:00.000Z',
      assignedLineId: 'line-20',
      assignedLineName: 'Line 20',
      machineId: 'mach-20-a',
      machineName: 'Tube Filler 20A',
      shift: 'Day',
      crew: 'Crew B',
      priority: 'Critical',
      status: 'Blocked',
      readinessStatus: 'NotChecked',
      materialStatus: 'NotChecked',
      machineStatus: 'NotChecked',
      laborStatus: 'NotChecked',
      qualityStatus: 'NotChecked',
      documentationStatus: 'NotChecked',
      scheduleStatus: 'NotChecked',
      toolingStatus: 'NotChecked',
      warehouseStatus: 'NotChecked',
      exceptionCount: 0,
      owner: 'Maya Planner',
      lastCheckedAt: null,
      plannerComment: 'Shortage needs expedite decision.',
    },
    {
      id: 'wo-100247',
      woNumber: 'WO-100247',
      batchNumber: 'B100247',
      productCode: 'FG-2001',
      productDescription: 'Additive Tube',
      productFamily: 'Additives',
      quantityRequired: 24000,
      quantityProduced: 0,
      quantityRemaining: 0,
      uom: 'PCS',
      dueDate: '2026-05-17T12:00:00.000Z',
      plannedStartDate: '2026-05-16T06:00:00.000Z',
      plannedEndDate: '2026-05-17T10:00:00.000Z',
      assignedLineId: 'line-10',
      assignedLineName: 'Line 10',
      machineId: 'mach-10-b',
      machineName: 'Additive Mixer 10B',
      shift: 'Night',
      crew: 'Crew A',
      priority: 'High',
      status: 'Planned',
      readinessStatus: 'NotChecked',
      materialStatus: 'NotChecked',
      machineStatus: 'NotChecked',
      laborStatus: 'NotChecked',
      qualityStatus: 'NotChecked',
      documentationStatus: 'NotChecked',
      scheduleStatus: 'NotChecked',
      toolingStatus: 'NotChecked',
      warehouseStatus: 'NotChecked',
      exceptionCount: 0,
      owner: 'Ramon Silva',
      lastCheckedAt: null,
      plannerComment: 'Machine availability must be confirmed.',
    },
    {
      id: 'wo-100248',
      woNumber: 'WO-100248',
      batchNumber: 'B100248',
      productCode: 'FG-3001',
      productDescription: 'Gel Product',
      productFamily: 'Gels',
      quantityRequired: 22000,
      quantityProduced: 0,
      quantityRemaining: 0,
      uom: 'PCS',
      dueDate: '2026-05-18T12:00:00.000Z',
      plannedStartDate: '2026-05-17T06:00:00.000Z',
      plannedEndDate: '2026-05-18T10:00:00.000Z',
      assignedLineId: 'line-30',
      assignedLineName: 'Line 30',
      machineId: 'mach-30-a',
      machineName: 'Gel Filler 30A',
      shift: 'Day',
      crew: 'Crew C',
      priority: 'Medium',
      status: 'Ready',
      readinessStatus: 'NotChecked',
      materialStatus: 'NotChecked',
      machineStatus: 'NotChecked',
      laborStatus: 'NotChecked',
      qualityStatus: 'NotChecked',
      documentationStatus: 'NotChecked',
      scheduleStatus: 'NotChecked',
      toolingStatus: 'NotChecked',
      warehouseStatus: 'NotChecked',
      exceptionCount: 0,
      owner: 'Paula Costa',
      lastCheckedAt: null,
      plannerComment: 'Good candidate to release once checks are rerun.',
    },
    {
      id: 'wo-100249',
      woNumber: 'WO-100249',
      batchNumber: 'B100249',
      productCode: 'FG-4001',
      productDescription: 'Specialty Pack',
      productFamily: 'Specialty',
      quantityRequired: 6400,
      quantityProduced: 0,
      quantityRemaining: 0,
      uom: 'PCS',
      dueDate: '2026-05-19T12:00:00.000Z',
      plannedStartDate: '2026-05-18T08:00:00.000Z',
      plannedEndDate: '2026-05-19T09:00:00.000Z',
      assignedLineId: 'line-30',
      assignedLineName: 'Line 30',
      machineId: 'mach-30-b',
      machineName: 'Cartoner 30B',
      shift: 'Day',
      crew: 'Crew C',
      priority: 'Medium',
      status: 'Planned',
      readinessStatus: 'NotChecked',
      materialStatus: 'NotChecked',
      machineStatus: 'NotChecked',
      laborStatus: 'NotChecked',
      qualityStatus: 'NotChecked',
      documentationStatus: 'NotChecked',
      scheduleStatus: 'NotChecked',
      toolingStatus: 'NotChecked',
      warehouseStatus: 'NotChecked',
      exceptionCount: 0,
      owner: 'Paula Costa',
      lastCheckedAt: null,
      plannerComment: 'Documentation under revision needs planner acknowledgment.',
    },
    {
      id: 'wo-100250',
      woNumber: 'WO-100250',
      batchNumber: 'B100250',
      productCode: 'FG-5001',
      productDescription: 'Low Volume Product',
      productFamily: 'Low Volume',
      quantityRequired: 3200,
      quantityProduced: 0,
      quantityRemaining: 0,
      uom: 'PCS',
      dueDate: '2026-05-18T18:00:00.000Z',
      plannedStartDate: '2026-05-17T18:00:00.000Z',
      plannedEndDate: '2026-05-18T16:00:00.000Z',
      assignedLineId: 'line-20',
      assignedLineName: 'Line 20',
      machineId: 'mach-20-b',
      machineName: 'Micro Batch 20B',
      shift: 'Night',
      crew: 'Crew B',
      priority: 'High',
      status: 'Planned',
      readinessStatus: 'NotChecked',
      materialStatus: 'NotChecked',
      machineStatus: 'NotChecked',
      laborStatus: 'NotChecked',
      qualityStatus: 'NotChecked',
      documentationStatus: 'NotChecked',
      scheduleStatus: 'NotChecked',
      toolingStatus: 'NotChecked',
      warehouseStatus: 'NotChecked',
      exceptionCount: 0,
      owner: 'Lucas Mota',
      lastCheckedAt: null,
      plannerComment: 'Labor support is the known constraint.',
    },
    {
      id: 'wo-100251',
      woNumber: 'WO-100251',
      batchNumber: 'B100251',
      productCode: 'FG-1001',
      productDescription: 'Standard Tube A',
      productFamily: 'Standard Tubes',
      quantityRequired: 27000,
      quantityProduced: 0,
      quantityRemaining: 0,
      uom: 'PCS',
      dueDate: '2026-05-16T08:00:00.000Z',
      plannedStartDate: '2026-05-15T06:00:00.000Z',
      plannedEndDate: '2026-05-16T06:00:00.000Z',
      assignedLineId: 'line-10',
      assignedLineName: 'Line 10',
      machineId: 'mach-10-a',
      machineName: 'Tube Filler 10A',
      shift: 'Day',
      crew: 'Crew A',
      priority: 'Critical',
      status: 'Blocked',
      readinessStatus: 'NotChecked',
      materialStatus: 'NotChecked',
      machineStatus: 'NotChecked',
      laborStatus: 'NotChecked',
      qualityStatus: 'NotChecked',
      documentationStatus: 'NotChecked',
      scheduleStatus: 'NotChecked',
      toolingStatus: 'NotChecked',
      warehouseStatus: 'NotChecked',
      exceptionCount: 0,
      owner: 'Maya Planner',
      lastCheckedAt: null,
      plannerComment: 'Quality release dependency must clear first.',
    },
    {
      id: 'wo-100252',
      woNumber: 'WO-100252',
      batchNumber: 'B100252',
      productCode: 'FG-1002',
      productDescription: 'Standard Tube B',
      productFamily: 'Standard Tubes',
      quantityRequired: 11000,
      quantityProduced: 0,
      quantityRemaining: 0,
      uom: 'PCS',
      dueDate: '2026-05-20T10:00:00.000Z',
      plannedStartDate: '2026-05-19T06:00:00.000Z',
      plannedEndDate: '2026-05-20T08:00:00.000Z',
      assignedLineId: 'line-20',
      assignedLineName: 'Line 20',
      machineId: 'mach-20-a',
      machineName: 'Tube Filler 20A',
      shift: 'Day',
      crew: 'Crew B',
      priority: 'Medium',
      status: 'Planned',
      readinessStatus: 'NotChecked',
      materialStatus: 'NotChecked',
      machineStatus: 'NotChecked',
      laborStatus: 'NotChecked',
      qualityStatus: 'NotChecked',
      documentationStatus: 'NotChecked',
      scheduleStatus: 'NotChecked',
      toolingStatus: 'NotChecked',
      warehouseStatus: 'NotChecked',
      exceptionCount: 0,
      owner: 'Lucas Mota',
      lastCheckedAt: null,
      plannerComment: 'Warehouse staging is the key dependency.',
    },
    {
      id: 'wo-100253',
      woNumber: 'WO-100253',
      batchNumber: 'B100253',
      productCode: 'FG-2001',
      productDescription: 'Additive Tube',
      productFamily: 'Additives',
      quantityRequired: 15000,
      quantityProduced: 0,
      quantityRemaining: 0,
      uom: 'PCS',
      dueDate: '2026-05-17T16:00:00.000Z',
      plannedStartDate: '2026-05-16T10:00:00.000Z',
      plannedEndDate: '2026-05-17T14:00:00.000Z',
      assignedLineId: 'line-20',
      assignedLineName: 'Line 20',
      machineId: 'mach-20-c',
      machineName: 'Additive Blender 20C',
      shift: 'Night',
      crew: 'Crew B',
      priority: 'High',
      status: 'Blocked',
      readinessStatus: 'NotChecked',
      materialStatus: 'NotChecked',
      machineStatus: 'NotChecked',
      laborStatus: 'NotChecked',
      qualityStatus: 'NotChecked',
      documentationStatus: 'NotChecked',
      scheduleStatus: 'NotChecked',
      toolingStatus: 'NotChecked',
      warehouseStatus: 'NotChecked',
      exceptionCount: 0,
      owner: 'Ramon Silva',
      lastCheckedAt: null,
      plannerComment: 'ERP stock does not match the physical confirmation.',
    },
    {
      id: 'wo-100254',
      woNumber: 'WO-100254',
      batchNumber: 'B100254',
      productCode: 'FG-3001',
      productDescription: 'Gel Product',
      productFamily: 'Gels',
      quantityRequired: 12500,
      quantityProduced: 0,
      quantityRemaining: 0,
      uom: 'PCS',
      dueDate: '2026-05-21T12:00:00.000Z',
      plannedStartDate: '2026-05-20T06:00:00.000Z',
      plannedEndDate: '2026-05-21T08:00:00.000Z',
      assignedLineId: 'line-30',
      assignedLineName: 'Line 30',
      machineId: 'mach-30-a',
      machineName: 'Gel Filler 30A',
      shift: 'Night',
      crew: 'Crew C',
      priority: 'Low',
      status: 'Planned',
      readinessStatus: 'NotChecked',
      materialStatus: 'NotChecked',
      machineStatus: 'NotChecked',
      laborStatus: 'NotChecked',
      qualityStatus: 'NotChecked',
      documentationStatus: 'NotChecked',
      scheduleStatus: 'NotChecked',
      toolingStatus: 'NotChecked',
      warehouseStatus: 'NotChecked',
      exceptionCount: 0,
      owner: 'Paula Costa',
      lastCheckedAt: null,
      plannerComment: 'Readiness has not been run for this order yet.',
    },
  ];
}

function createReadinessChecks(): WorkOrderReadinessCheck[] {
  const create = (
    workOrderId: string,
    category: WorkOrderReadinessCheck['category'],
    status: WorkOrderReadinessCheck['status'],
    description: string,
    requiredAction: string,
    severity: WorkOrderReadinessCheck['severity'] = status === 'Blocked' ? 'Blocker' : status === 'Warning' ? 'Warning' : 'Info',
    owner = 'Planner Team',
  ): WorkOrderReadinessCheck => ({
    id: `${workOrderId}-${category}`,
    workOrderId,
    category,
    status,
    title: `${category} readiness`,
    description,
    details: description,
    owner,
    lastCheckedAt: workOrderId === 'wo-100254' ? null : '2026-05-14T11:30:00.000Z',
    requiredAction,
    canOverride: status !== 'Blocked',
    severity,
  });

  const defaults = (workOrderId: string) => ([
    create(workOrderId, 'Material', 'Ready', 'Materials are available and staged.', 'No action required'),
    create(workOrderId, 'Machine', 'Ready', 'Assigned machine is available inside the required window.', 'No action required'),
    create(workOrderId, 'Labor', 'Ready', 'Qualified labor is available for the planned shift.', 'No action required'),
    create(workOrderId, 'Quality', 'Ready', 'No quality blockers remain open.', 'No action required'),
    create(workOrderId, 'Documentation', 'Ready', 'Required documents are approved and current.', 'No action required'),
    create(workOrderId, 'Tooling', 'Ready', 'Required tooling is available and calibrated.', 'No action required'),
    create(workOrderId, 'WarehouseStaging', 'Ready', 'Warehouse staging is complete.', 'No action required'),
    create(workOrderId, 'Schedule', 'Ready', 'Line capacity remains within target.', 'No action required'),
    create(workOrderId, 'BatchLot', 'Ready', 'Batch and lot dependencies are clear.', 'No action required'),
  ]);

  const checks = [
    ...defaults('wo-100245'),
    ...defaults('wo-100246'),
    ...defaults('wo-100247'),
    ...defaults('wo-100248'),
    ...defaults('wo-100249'),
    ...defaults('wo-100250'),
    ...defaults('wo-100251'),
    ...defaults('wo-100252'),
    ...defaults('wo-100253'),
    ...defaults('wo-100254').map((check) => ({...check, status: 'NotChecked' as const, description: 'Check not run yet.', details: 'Check not run yet.', requiredAction: 'Run readiness check', lastCheckedAt: null})),
  ];

  return checks.map((check) => {
    if (check.workOrderId === 'wo-100245' && check.category === 'WarehouseStaging') {
      return {...check, status: 'Warning', description: 'Final pallet still moving to staging area.', details: 'One pallet is still in transfer to Sandy staging zone B.', requiredAction: 'Confirm final pallet move', severity: 'Warning'};
    }
    if (check.workOrderId === 'wo-100245' && check.category === 'Schedule') {
      return {...check, status: 'Warning', description: 'Capacity utilization after release reaches 92%.', details: 'The release would push Line 10 above the 90% threshold.', requiredAction: 'Review schedule loading', severity: 'Warning'};
    }
    if (check.workOrderId === 'wo-100246' && check.category === 'Material') {
      return {...check, status: 'Blocked', description: 'Material shortage on component COMP-1002.', details: 'Required quantity exceeds confirmed available stock.', requiredAction: 'Expedite missing component', severity: 'Blocker'};
    }
    if (check.workOrderId === 'wo-100247' && check.category === 'Machine') {
      return {...check, status: 'Blocked', description: 'Assigned machine is down.', details: 'Tube Filler 10B is unavailable due to an unplanned breakdown.', requiredAction: 'Move to alternative line or wait for repair', severity: 'Blocker'};
    }
    if (check.workOrderId === 'wo-100249' && check.category === 'Documentation') {
      return {...check, status: 'Warning', description: 'Packaging instruction is under revision.', details: 'The current instruction is under revision and not ready for release approval.', requiredAction: 'Update document approval', severity: 'Warning'};
    }
    if (check.workOrderId === 'wo-100250' && check.category === 'Labor') {
      return {...check, status: 'Warning', description: 'Labor supports only 60% of required capacity.', details: 'Available qualified operators support only 60% of the planned throughput.', requiredAction: 'Adjust labor plan', severity: 'Warning'};
    }
    if (check.workOrderId === 'wo-100251' && check.category === 'Quality') {
      return {...check, status: 'Blocked', description: 'Quality hold remains open for the lot.', details: 'A quality hold is preventing release until disposition clears.', requiredAction: 'Request quality release', severity: 'Blocker'};
    }
    if (check.workOrderId === 'wo-100252' && check.category === 'WarehouseStaging') {
      return {...check, status: 'Warning', description: 'Warehouse staging is incomplete.', details: 'Two required material groups are not yet staged.', requiredAction: 'Complete warehouse staging', severity: 'Warning'};
    }
    if (check.workOrderId === 'wo-100253' && check.category === 'Material') {
      return {...check, status: 'Blocked', description: 'Material is available in system but not physically found.', details: 'The inventory system shows stock, but physical confirmation failed during kitting.', requiredAction: 'Confirm physical material stock', severity: 'Blocker'};
    }
    if (check.workOrderId === 'wo-100253' && check.category === 'Tooling') {
      return {...check, status: 'Warning', description: 'Tooling calibration is due soon.', details: 'The dosing tool expires within the next 24 hours.', requiredAction: 'Review tooling calibration', severity: 'Warning'};
    }
    return check;
  });
}

function materialItems(): MaterialReadinessItem[] {
  return [
    {id: 'mat-245-1', workOrderId: 'wo-100245', componentCode: 'COMP-1001', componentDescription: 'Tube resin', requiredQuantity: 32000, systemAvailableQuantity: 32000, physicallyConfirmedQuantity: 32000, stagedQuantity: 32000, uom: 'PCS', location: 'STG-B1', lotNumber: 'LOT-245-A', expiryDate: '2027-02-01', qualityStatus: 'Clear', status: 'Ready', issue: 'No issue'},
    {id: 'mat-245-2', workOrderId: 'wo-100245', componentCode: 'COMP-3301', componentDescription: 'Outer cartons', requiredQuantity: 1600, systemAvailableQuantity: 1600, physicallyConfirmedQuantity: 1600, stagedQuantity: 1200, uom: 'PCS', location: 'STG-B2', lotNumber: 'LOT-245-B', expiryDate: '2027-03-01', qualityStatus: 'Clear', status: 'Warning', issue: 'Final pallet is still in transfer to staging'},
    {id: 'mat-246-1', workOrderId: 'wo-100246', componentCode: 'COMP-1002', componentDescription: 'Tube base resin', requiredQuantity: 18000, systemAvailableQuantity: 9200, physicallyConfirmedQuantity: 9200, stagedQuantity: 9200, uom: 'PCS', location: 'RM-01', lotNumber: 'LOT-246-A', expiryDate: '2026-12-01', qualityStatus: 'Clear', status: 'Blocked', issue: 'Material shortage'},
    {id: 'mat-247-1', workOrderId: 'wo-100247', componentCode: 'COMP-2001', componentDescription: 'Additive resin', requiredQuantity: 24000, systemAvailableQuantity: 24000, physicallyConfirmedQuantity: 24000, stagedQuantity: 24000, uom: 'PCS', location: 'RM-02', lotNumber: 'LOT-247-A', expiryDate: '2027-01-14', qualityStatus: 'Clear', status: 'Ready', issue: 'No issue'},
    {id: 'mat-248-1', workOrderId: 'wo-100248', componentCode: 'COMP-3001', componentDescription: 'Gel blend', requiredQuantity: 22000, systemAvailableQuantity: 22000, physicallyConfirmedQuantity: 22000, stagedQuantity: 22000, uom: 'PCS', location: 'RM-03', lotNumber: 'LOT-248-A', expiryDate: '2026-11-10', qualityStatus: 'Clear', status: 'Ready', issue: 'No issue'},
    {id: 'mat-249-1', workOrderId: 'wo-100249', componentCode: 'COMP-4001', componentDescription: 'Specialty carton', requiredQuantity: 6400, systemAvailableQuantity: 6400, physicallyConfirmedQuantity: 6400, stagedQuantity: 6400, uom: 'PCS', location: 'STG-C1', lotNumber: 'LOT-249-A', expiryDate: '2027-04-15', qualityStatus: 'Clear', status: 'Ready', issue: 'No issue'},
    {id: 'mat-250-1', workOrderId: 'wo-100250', componentCode: 'COMP-5001', componentDescription: 'Low volume formula', requiredQuantity: 3200, systemAvailableQuantity: 3200, physicallyConfirmedQuantity: 3200, stagedQuantity: 3200, uom: 'PCS', location: 'STG-A1', lotNumber: 'LOT-250-A', expiryDate: '2026-10-20', qualityStatus: 'Clear', status: 'Ready', issue: 'No issue'},
    {id: 'mat-251-1', workOrderId: 'wo-100251', componentCode: 'COMP-1001', componentDescription: 'Tube resin', requiredQuantity: 27000, systemAvailableQuantity: 27000, physicallyConfirmedQuantity: 27000, stagedQuantity: 27000, uom: 'PCS', location: 'STG-A2', lotNumber: 'LOT-251-A', expiryDate: '2027-02-10', qualityStatus: 'Hold', status: 'Warning', issue: 'Quality hold on associated lot'},
    {id: 'mat-252-1', workOrderId: 'wo-100252', componentCode: 'COMP-1002', componentDescription: 'Tube base resin', requiredQuantity: 11000, systemAvailableQuantity: 11000, physicallyConfirmedQuantity: 11000, stagedQuantity: 7000, uom: 'PCS', location: 'STG-A3', lotNumber: 'LOT-252-A', expiryDate: '2027-01-01', qualityStatus: 'Clear', status: 'Warning', issue: 'Staging incomplete'},
    {id: 'mat-253-1', workOrderId: 'wo-100253', componentCode: 'COMP-2002', componentDescription: 'Additive active', requiredQuantity: 15000, systemAvailableQuantity: 15000, physicallyConfirmedQuantity: 0, stagedQuantity: 0, uom: 'PCS', location: 'RM-05', lotNumber: 'LOT-253-A', expiryDate: '2026-09-15', qualityStatus: 'InspectionRequired', status: 'Blocked', issue: 'Available in system but not physically found'},
    {id: 'mat-254-1', workOrderId: 'wo-100254', componentCode: 'COMP-3001', componentDescription: 'Gel blend', requiredQuantity: 12500, systemAvailableQuantity: 12500, physicallyConfirmedQuantity: 0, stagedQuantity: 0, uom: 'PCS', location: 'RM-03', lotNumber: 'LOT-254-A', expiryDate: '2026-11-15', qualityStatus: 'InspectionRequired', status: 'Warning', issue: 'Not checked yet'},
  ];
}

function machineItems(): MachineReadinessItem[] {
  return [
    {id: 'mach-245', workOrderId: 'wo-100245', lineId: 'line-10', machineId: 'mach-10-a', machineName: 'Tube Filler 10A', requiredWindowStart: '2026-05-15T06:00:00.000Z', requiredWindowEnd: '2026-05-16T10:00:00.000Z', machineStatus: 'Available', plannedDowntimeStart: null, plannedDowntimeEnd: null, capacityImpactHours: 0, alternativeLineId: 'line-20', alternativeLineName: 'Line 20', status: 'Ready', issue: 'No issue'},
    {id: 'mach-246', workOrderId: 'wo-100246', lineId: 'line-20', machineId: 'mach-20-a', machineName: 'Tube Filler 20A', requiredWindowStart: '2026-05-15T08:00:00.000Z', requiredWindowEnd: '2026-05-15T20:00:00.000Z', machineStatus: 'Available', plannedDowntimeStart: null, plannedDowntimeEnd: null, capacityImpactHours: 0, alternativeLineId: 'line-10', alternativeLineName: 'Line 10', status: 'Ready', issue: 'No issue'},
    {id: 'mach-247', workOrderId: 'wo-100247', lineId: 'line-10', machineId: 'mach-10-b', machineName: 'Additive Mixer 10B', requiredWindowStart: '2026-05-16T06:00:00.000Z', requiredWindowEnd: '2026-05-17T10:00:00.000Z', machineStatus: 'Down', plannedDowntimeStart: '2026-05-14T04:00:00.000Z', plannedDowntimeEnd: '2026-05-16T18:00:00.000Z', capacityImpactHours: 14, alternativeLineId: 'line-30', alternativeLineName: 'Line 30', status: 'Blocked', issue: 'Machine down due to motor failure'},
    {id: 'mach-248', workOrderId: 'wo-100248', lineId: 'line-30', machineId: 'mach-30-a', machineName: 'Gel Filler 30A', requiredWindowStart: '2026-05-17T06:00:00.000Z', requiredWindowEnd: '2026-05-18T10:00:00.000Z', machineStatus: 'Available', plannedDowntimeStart: null, plannedDowntimeEnd: null, capacityImpactHours: 0, alternativeLineId: null, alternativeLineName: null, status: 'Ready', issue: 'No issue'},
    {id: 'mach-249', workOrderId: 'wo-100249', lineId: 'line-30', machineId: 'mach-30-b', machineName: 'Cartoner 30B', requiredWindowStart: '2026-05-18T08:00:00.000Z', requiredWindowEnd: '2026-05-19T09:00:00.000Z', machineStatus: 'Available', plannedDowntimeStart: null, plannedDowntimeEnd: null, capacityImpactHours: 0, alternativeLineId: null, alternativeLineName: null, status: 'Ready', issue: 'No issue'},
    {id: 'mach-250', workOrderId: 'wo-100250', lineId: 'line-20', machineId: 'mach-20-b', machineName: 'Micro Batch 20B', requiredWindowStart: '2026-05-17T18:00:00.000Z', requiredWindowEnd: '2026-05-18T16:00:00.000Z', machineStatus: 'Available', plannedDowntimeStart: null, plannedDowntimeEnd: null, capacityImpactHours: 0, alternativeLineId: null, alternativeLineName: null, status: 'Ready', issue: 'No issue'},
    {id: 'mach-251', workOrderId: 'wo-100251', lineId: 'line-10', machineId: 'mach-10-a', machineName: 'Tube Filler 10A', requiredWindowStart: '2026-05-15T06:00:00.000Z', requiredWindowEnd: '2026-05-16T06:00:00.000Z', machineStatus: 'Available', plannedDowntimeStart: null, plannedDowntimeEnd: null, capacityImpactHours: 0, alternativeLineId: null, alternativeLineName: null, status: 'Ready', issue: 'No issue'},
    {id: 'mach-252', workOrderId: 'wo-100252', lineId: 'line-20', machineId: 'mach-20-a', machineName: 'Tube Filler 20A', requiredWindowStart: '2026-05-19T06:00:00.000Z', requiredWindowEnd: '2026-05-20T08:00:00.000Z', machineStatus: 'Changeover', plannedDowntimeStart: '2026-05-19T05:00:00.000Z', plannedDowntimeEnd: '2026-05-19T07:30:00.000Z', capacityImpactHours: 1.5, alternativeLineId: 'line-10', alternativeLineName: 'Line 10', status: 'Warning', issue: 'Changeover compresses the start window'},
    {id: 'mach-253', workOrderId: 'wo-100253', lineId: 'line-20', machineId: 'mach-20-c', machineName: 'Additive Blender 20C', requiredWindowStart: '2026-05-16T10:00:00.000Z', requiredWindowEnd: '2026-05-17T14:00:00.000Z', machineStatus: 'Available', plannedDowntimeStart: null, plannedDowntimeEnd: null, capacityImpactHours: 0, alternativeLineId: null, alternativeLineName: null, status: 'Ready', issue: 'No issue'},
    {id: 'mach-254', workOrderId: 'wo-100254', lineId: 'line-30', machineId: 'mach-30-a', machineName: 'Gel Filler 30A', requiredWindowStart: '2026-05-20T06:00:00.000Z', requiredWindowEnd: '2026-05-21T08:00:00.000Z', machineStatus: 'Unknown', plannedDowntimeStart: null, plannedDowntimeEnd: null, capacityImpactHours: 0, alternativeLineId: null, alternativeLineName: null, status: 'Warning', issue: 'Not checked yet'},
  ];
}

function laborItems(): LaborReadinessItem[] {
  const items: LaborReadinessItem[] = [
    {id: 'lab-245', workOrderId: 'wo-100245', requiredCrew: 8, availableCrew: 8, requiredQualifiedOperators: 4, availableQualifiedOperators: 4, requiredSkill: 'Tube Filling', shift: 'Day', capacitySupportedPercent: 0, status: 'Ready', issue: 'No issue'},
    {id: 'lab-246', workOrderId: 'wo-100246', requiredCrew: 8, availableCrew: 8, requiredQualifiedOperators: 4, availableQualifiedOperators: 4, requiredSkill: 'Tube Filling', shift: 'Day', capacitySupportedPercent: 0, status: 'Ready', issue: 'No issue'},
    {id: 'lab-247', workOrderId: 'wo-100247', requiredCrew: 8, availableCrew: 8, requiredQualifiedOperators: 4, availableQualifiedOperators: 4, requiredSkill: 'Additive Mixing', shift: 'Night', capacitySupportedPercent: 0, status: 'Ready', issue: 'No issue'},
    {id: 'lab-248', workOrderId: 'wo-100248', requiredCrew: 6, availableCrew: 6, requiredQualifiedOperators: 3, availableQualifiedOperators: 3, requiredSkill: 'Gel Filling', shift: 'Day', capacitySupportedPercent: 0, status: 'Ready', issue: 'No issue'},
    {id: 'lab-249', workOrderId: 'wo-100249', requiredCrew: 5, availableCrew: 5, requiredQualifiedOperators: 2, availableQualifiedOperators: 2, requiredSkill: 'Pack-out', shift: 'Day', capacitySupportedPercent: 0, status: 'Ready', issue: 'No issue'},
    {id: 'lab-250', workOrderId: 'wo-100250', requiredCrew: 5, availableCrew: 3, requiredQualifiedOperators: 2, availableQualifiedOperators: 2, requiredSkill: 'Micro Batch', shift: 'Night', capacitySupportedPercent: 0, status: 'Warning', issue: 'Enough people to run only 60% of capacity'},
    {id: 'lab-251', workOrderId: 'wo-100251', requiredCrew: 8, availableCrew: 8, requiredQualifiedOperators: 4, availableQualifiedOperators: 4, requiredSkill: 'Tube Filling', shift: 'Day', capacitySupportedPercent: 0, status: 'Ready', issue: 'No issue'},
    {id: 'lab-252', workOrderId: 'wo-100252', requiredCrew: 7, availableCrew: 6, requiredQualifiedOperators: 3, availableQualifiedOperators: 3, requiredSkill: 'Tube Filling', shift: 'Day', capacitySupportedPercent: 0, status: 'Warning', issue: 'One crew member still unassigned'},
    {id: 'lab-253', workOrderId: 'wo-100253', requiredCrew: 7, availableCrew: 7, requiredQualifiedOperators: 3, availableQualifiedOperators: 3, requiredSkill: 'Additive Blend', shift: 'Night', capacitySupportedPercent: 0, status: 'Ready', issue: 'No issue'},
    {id: 'lab-254', workOrderId: 'wo-100254', requiredCrew: 6, availableCrew: 0, requiredQualifiedOperators: 3, availableQualifiedOperators: 0, requiredSkill: 'Gel Filling', shift: 'Night', capacitySupportedPercent: 0, status: 'Blocked', issue: 'No labor review yet'},
  ];

  return items.map((item) => ({...item, capacitySupportedPercent: calculateLaborCapacitySupportedPercent(item)}));
}

function qualityItems(): QualityReadinessItem[] {
  return [
    {id: 'qual-245', workOrderId: 'wo-100245', qualityStatus: 'Clear', openQnCount: 0, openDeviationCount: 0, batchReleaseDependency: 'None', requiredInspection: 'In-process visual check', status: 'Ready', issue: 'No issue'},
    {id: 'qual-246', workOrderId: 'wo-100246', qualityStatus: 'Clear', openQnCount: 0, openDeviationCount: 0, batchReleaseDependency: 'None', requiredInspection: 'Incoming material check', status: 'Ready', issue: 'No issue'},
    {id: 'qual-247', workOrderId: 'wo-100247', qualityStatus: 'Clear', openQnCount: 0, openDeviationCount: 0, batchReleaseDependency: 'None', requiredInspection: 'Standard inspection', status: 'Ready', issue: 'No issue'},
    {id: 'qual-248', workOrderId: 'wo-100248', qualityStatus: 'Clear', openQnCount: 0, openDeviationCount: 0, batchReleaseDependency: 'None', requiredInspection: 'Standard inspection', status: 'Ready', issue: 'No issue'},
    {id: 'qual-249', workOrderId: 'wo-100249', qualityStatus: 'InspectionRequired', openQnCount: 0, openDeviationCount: 0, batchReleaseDependency: 'Packaging check', requiredInspection: 'First article inspection', status: 'Warning', issue: 'Inspection still pending'},
    {id: 'qual-250', workOrderId: 'wo-100250', qualityStatus: 'Clear', openQnCount: 0, openDeviationCount: 0, batchReleaseDependency: 'None', requiredInspection: 'Standard inspection', status: 'Ready', issue: 'No issue'},
    {id: 'qual-251', workOrderId: 'wo-100251', qualityStatus: 'Hold', openQnCount: 1, openDeviationCount: 1, batchReleaseDependency: 'QA release required', requiredInspection: 'Deviation review', status: 'Blocked', issue: 'Quality hold'},
    {id: 'qual-252', workOrderId: 'wo-100252', qualityStatus: 'Clear', openQnCount: 0, openDeviationCount: 0, batchReleaseDependency: 'None', requiredInspection: 'Standard inspection', status: 'Ready', issue: 'No issue'},
    {id: 'qual-253', workOrderId: 'wo-100253', qualityStatus: 'InspectionRequired', openQnCount: 0, openDeviationCount: 0, batchReleaseDependency: 'None', requiredInspection: 'Identity check', status: 'Warning', issue: 'Material identity still unconfirmed'},
    {id: 'qual-254', workOrderId: 'wo-100254', qualityStatus: 'InspectionRequired', openQnCount: 0, openDeviationCount: 0, batchReleaseDependency: 'None', requiredInspection: 'Standard inspection', status: 'Warning', issue: 'Not checked yet'},
  ];
}

function documentationItems(): DocumentationReadinessItem[] {
  return [
    {id: 'doc-245', workOrderId: 'wo-100245', documentName: 'WO Pack Instruction', documentType: 'WorkInstruction', requiredVersion: '7.1', availableVersion: '7.1', lifecycleStatus: 'Approved', eSignatureRequired: true, status: 'Ready', issue: 'No issue'},
    {id: 'doc-246', workOrderId: 'wo-100246', documentName: 'WO Pack Instruction', documentType: 'WorkInstruction', requiredVersion: '7.1', availableVersion: '7.1', lifecycleStatus: 'Approved', eSignatureRequired: true, status: 'Ready', issue: 'No issue'},
    {id: 'doc-247', workOrderId: 'wo-100247', documentName: 'Additive SOP', documentType: 'SOP', requiredVersion: '4.0', availableVersion: '4.0', lifecycleStatus: 'Approved', eSignatureRequired: false, status: 'Ready', issue: 'No issue'},
    {id: 'doc-248', workOrderId: 'wo-100248', documentName: 'Gel Fill Instruction', documentType: 'WorkInstruction', requiredVersion: '3.2', availableVersion: '3.2', lifecycleStatus: 'Approved', eSignatureRequired: true, status: 'Ready', issue: 'No issue'},
    {id: 'doc-249', workOrderId: 'wo-100249', documentName: 'Specialty Pack Instruction', documentType: 'WorkInstruction', requiredVersion: '8.0', availableVersion: '8.0-draft', lifecycleStatus: 'UnderRevision', eSignatureRequired: true, status: 'Warning', issue: 'Document under revision'},
    {id: 'doc-250', workOrderId: 'wo-100250', documentName: 'Micro Batch Checklist', documentType: 'Checklist', requiredVersion: '2.0', availableVersion: '2.0', lifecycleStatus: 'Approved', eSignatureRequired: false, status: 'Ready', issue: 'No issue'},
    {id: 'doc-251', workOrderId: 'wo-100251', documentName: 'Deviation Packet', documentType: 'DHR', requiredVersion: '1.0', availableVersion: '1.0', lifecycleStatus: 'Approved', eSignatureRequired: true, status: 'Ready', issue: 'No issue'},
    {id: 'doc-252', workOrderId: 'wo-100252', documentName: 'Staging Checklist', documentType: 'Checklist', requiredVersion: '1.5', availableVersion: '1.5', lifecycleStatus: 'Approved', eSignatureRequired: false, status: 'Ready', issue: 'No issue'},
    {id: 'doc-253', workOrderId: 'wo-100253', documentName: 'Inventory Verification Sheet', documentType: 'Checklist', requiredVersion: '5.0', availableVersion: '5.0', lifecycleStatus: 'Approved', eSignatureRequired: false, status: 'Ready', issue: 'No issue'},
    {id: 'doc-254', workOrderId: 'wo-100254', documentName: 'Gel Fill Instruction', documentType: 'WorkInstruction', requiredVersion: '3.2', availableVersion: '3.2', lifecycleStatus: 'Approved', eSignatureRequired: true, status: 'Ready', issue: 'No issue'},
  ];
}

function toolingItems(): ToolingReadinessItem[] {
  return [
    {id: 'tool-245', workOrderId: 'wo-100245', toolCode: 'TL-245', toolDescription: 'Tube forming die', requiredQuantity: 1, availableQuantity: 1, calibrationStatus: 'Valid', status: 'Ready', issue: 'No issue'},
    {id: 'tool-246', workOrderId: 'wo-100246', toolCode: 'TL-246', toolDescription: 'Tube forming die', requiredQuantity: 1, availableQuantity: 1, calibrationStatus: 'Valid', status: 'Ready', issue: 'No issue'},
    {id: 'tool-247', workOrderId: 'wo-100247', toolCode: 'TL-247', toolDescription: 'Mixer head', requiredQuantity: 1, availableQuantity: 1, calibrationStatus: 'Valid', status: 'Ready', issue: 'No issue'},
    {id: 'tool-248', workOrderId: 'wo-100248', toolCode: 'TL-248', toolDescription: 'Gel nozzle set', requiredQuantity: 1, availableQuantity: 1, calibrationStatus: 'Valid', status: 'Ready', issue: 'No issue'},
    {id: 'tool-249', workOrderId: 'wo-100249', toolCode: 'TL-249', toolDescription: 'Cartoner guides', requiredQuantity: 1, availableQuantity: 1, calibrationStatus: 'DueSoon', status: 'Warning', issue: 'Calibration due soon'},
    {id: 'tool-250', workOrderId: 'wo-100250', toolCode: 'TL-250', toolDescription: 'Micro batch valve set', requiredQuantity: 1, availableQuantity: 1, calibrationStatus: 'Valid', status: 'Ready', issue: 'No issue'},
    {id: 'tool-251', workOrderId: 'wo-100251', toolCode: 'TL-251', toolDescription: 'Tube forming die', requiredQuantity: 1, availableQuantity: 1, calibrationStatus: 'Valid', status: 'Ready', issue: 'No issue'},
    {id: 'tool-252', workOrderId: 'wo-100252', toolCode: 'TL-252', toolDescription: 'Tube cutter', requiredQuantity: 1, availableQuantity: 1, calibrationStatus: 'Valid', status: 'Ready', issue: 'No issue'},
    {id: 'tool-253', workOrderId: 'wo-100253', toolCode: 'TL-253', toolDescription: 'Additive dosing tool', requiredQuantity: 1, availableQuantity: 1, calibrationStatus: 'DueSoon', status: 'Warning', issue: 'Calibration due within 24 hours'},
    {id: 'tool-254', workOrderId: 'wo-100254', toolCode: 'TL-254', toolDescription: 'Gel nozzle set', requiredQuantity: 1, availableQuantity: 1, calibrationStatus: 'Missing', status: 'Blocked', issue: 'Tooling not checked yet'},
  ];
}

function warehouseItems(): WarehouseStagingItem[] {
  return [
    {id: 'wh-245', workOrderId: 'wo-100245', stagingArea: 'Zone B', requiredMaterialsCount: 5, stagedMaterialsCount: 4, missingMaterialsCount: 1, status: 'Warning', issue: 'One pallet still missing from staging'},
    {id: 'wh-246', workOrderId: 'wo-100246', stagingArea: 'Zone A', requiredMaterialsCount: 4, stagedMaterialsCount: 2, missingMaterialsCount: 2, status: 'Blocked', issue: 'Shortage prevents full staging'},
    {id: 'wh-247', workOrderId: 'wo-100247', stagingArea: 'Zone A', requiredMaterialsCount: 4, stagedMaterialsCount: 4, missingMaterialsCount: 0, status: 'Ready', issue: 'No issue'},
    {id: 'wh-248', workOrderId: 'wo-100248', stagingArea: 'Zone C', requiredMaterialsCount: 3, stagedMaterialsCount: 3, missingMaterialsCount: 0, status: 'Ready', issue: 'No issue'},
    {id: 'wh-249', workOrderId: 'wo-100249', stagingArea: 'Zone C', requiredMaterialsCount: 3, stagedMaterialsCount: 3, missingMaterialsCount: 0, status: 'Ready', issue: 'No issue'},
    {id: 'wh-250', workOrderId: 'wo-100250', stagingArea: 'Zone A', requiredMaterialsCount: 2, stagedMaterialsCount: 2, missingMaterialsCount: 0, status: 'Ready', issue: 'No issue'},
    {id: 'wh-251', workOrderId: 'wo-100251', stagingArea: 'Zone B', requiredMaterialsCount: 4, stagedMaterialsCount: 4, missingMaterialsCount: 0, status: 'Ready', issue: 'No issue'},
    {id: 'wh-252', workOrderId: 'wo-100252', stagingArea: 'Zone B', requiredMaterialsCount: 5, stagedMaterialsCount: 3, missingMaterialsCount: 2, status: 'Warning', issue: 'Warehouse staging incomplete'},
    {id: 'wh-253', workOrderId: 'wo-100253', stagingArea: 'Zone A', requiredMaterialsCount: 3, stagedMaterialsCount: 0, missingMaterialsCount: 3, status: 'Blocked', issue: 'Material not found physically'},
    {id: 'wh-254', workOrderId: 'wo-100254', stagingArea: 'Zone C', requiredMaterialsCount: 3, stagedMaterialsCount: 0, missingMaterialsCount: 3, status: 'Warning', issue: 'Not checked yet'},
  ];
}

function scheduleItems(): ScheduleReadinessItem[] {
  return [
    {id: 'sch-245', workOrderId: 'wo-100245', assignedLineId: 'line-10', plannedStartDate: '2026-05-15T06:00:00.000Z', plannedEndDate: '2026-05-16T10:00:00.000Z', dueDate: '2026-05-16T14:00:00.000Z', capacityUtilizationAfterRelease: 92, conflictsCount: 1, frozenPeriodImpact: 'None', status: 'Warning', issue: 'Capacity above 90% after release'},
    {id: 'sch-246', workOrderId: 'wo-100246', assignedLineId: 'line-20', plannedStartDate: '2026-05-15T08:00:00.000Z', plannedEndDate: '2026-05-15T20:00:00.000Z', dueDate: '2026-05-15T20:00:00.000Z', capacityUtilizationAfterRelease: 84, conflictsCount: 0, frozenPeriodImpact: 'None', status: 'Ready', issue: 'No issue'},
    {id: 'sch-247', workOrderId: 'wo-100247', assignedLineId: 'line-10', plannedStartDate: '2026-05-16T06:00:00.000Z', plannedEndDate: '2026-05-17T10:00:00.000Z', dueDate: '2026-05-17T12:00:00.000Z', capacityUtilizationAfterRelease: 88, conflictsCount: 0, frozenPeriodImpact: 'None', status: 'Ready', issue: 'No issue'},
    {id: 'sch-248', workOrderId: 'wo-100248', assignedLineId: 'line-30', plannedStartDate: '2026-05-17T06:00:00.000Z', plannedEndDate: '2026-05-18T10:00:00.000Z', dueDate: '2026-05-18T12:00:00.000Z', capacityUtilizationAfterRelease: 78, conflictsCount: 0, frozenPeriodImpact: 'None', status: 'Ready', issue: 'No issue'},
    {id: 'sch-249', workOrderId: 'wo-100249', assignedLineId: 'line-30', plannedStartDate: '2026-05-18T08:00:00.000Z', plannedEndDate: '2026-05-19T09:00:00.000Z', dueDate: '2026-05-19T12:00:00.000Z', capacityUtilizationAfterRelease: 81, conflictsCount: 0, frozenPeriodImpact: 'None', status: 'Ready', issue: 'No issue'},
    {id: 'sch-250', workOrderId: 'wo-100250', assignedLineId: 'line-20', plannedStartDate: '2026-05-17T18:00:00.000Z', plannedEndDate: '2026-05-18T16:00:00.000Z', dueDate: '2026-05-18T18:00:00.000Z', capacityUtilizationAfterRelease: 79, conflictsCount: 0, frozenPeriodImpact: 'None', status: 'Ready', issue: 'No issue'},
    {id: 'sch-251', workOrderId: 'wo-100251', assignedLineId: 'line-10', plannedStartDate: '2026-05-15T06:00:00.000Z', plannedEndDate: '2026-05-16T06:00:00.000Z', dueDate: '2026-05-16T08:00:00.000Z', capacityUtilizationAfterRelease: 89, conflictsCount: 0, frozenPeriodImpact: 'None', status: 'Ready', issue: 'No issue'},
    {id: 'sch-252', workOrderId: 'wo-100252', assignedLineId: 'line-20', plannedStartDate: '2026-05-19T06:00:00.000Z', plannedEndDate: '2026-05-20T08:00:00.000Z', dueDate: '2026-05-20T10:00:00.000Z', capacityUtilizationAfterRelease: 91, conflictsCount: 1, frozenPeriodImpact: 'Within frozen period', status: 'Warning', issue: 'Schedule conflict with higher priority WO'},
    {id: 'sch-253', workOrderId: 'wo-100253', assignedLineId: 'line-20', plannedStartDate: '2026-05-16T10:00:00.000Z', plannedEndDate: '2026-05-17T14:00:00.000Z', dueDate: '2026-05-17T16:00:00.000Z', capacityUtilizationAfterRelease: 83, conflictsCount: 0, frozenPeriodImpact: 'None', status: 'Ready', issue: 'No issue'},
    {id: 'sch-254', workOrderId: 'wo-100254', assignedLineId: 'line-30', plannedStartDate: '2026-05-20T06:00:00.000Z', plannedEndDate: '2026-05-21T08:00:00.000Z', dueDate: '2026-05-21T12:00:00.000Z', capacityUtilizationAfterRelease: 0, conflictsCount: 0, frozenPeriodImpact: 'Unknown', status: 'Warning', issue: 'Not checked yet'},
  ];
}

function exceptions(): WorkOrderReadinessException[] {
  return [
    {id: 'exc-245-1', workOrderId: 'wo-100245', category: 'WarehouseStaging', severity: 'Warning', reason: 'One pallet is still in transfer to the staging area.', suggestedAction: 'Complete warehouse staging', owner: 'Warehouse Lead', ageMinutes: 45, status: 'Open'},
    {id: 'exc-245-2', workOrderId: 'wo-100245', category: 'Schedule', severity: 'Warning', reason: 'Release would push Line 10 to 92% utilization.', suggestedAction: 'Review schedule', owner: 'Scheduler', ageMinutes: 60, status: 'Open'},
    {id: 'exc-246-1', workOrderId: 'wo-100246', category: 'Material', severity: 'Blocker', reason: 'Component COMP-1002 is short for the planned quantity.', suggestedAction: 'Expedite missing component', owner: 'Materials Planner', ageMinutes: 180, status: 'Open'},
    {id: 'exc-247-1', workOrderId: 'wo-100247', category: 'Machine', severity: 'Blocker', reason: 'Assigned machine is down due to an unplanned breakdown.', suggestedAction: 'Move to alternative line', owner: 'Maintenance Lead', ageMinutes: 200, status: 'Open'},
    {id: 'exc-249-1', workOrderId: 'wo-100249', category: 'Documentation', severity: 'Warning', reason: 'Packaging instruction is under revision.', suggestedAction: 'Update document approval', owner: 'Document Control', ageMinutes: 90, status: 'Open'},
    {id: 'exc-250-1', workOrderId: 'wo-100250', category: 'Labor', severity: 'Warning', reason: 'Enough people to run only 60% of capacity.', suggestedAction: 'Adjust labor plan', owner: 'Production Supervisor', ageMinutes: 70, status: 'Open'},
    {id: 'exc-251-1', workOrderId: 'wo-100251', category: 'Quality', severity: 'Blocker', reason: 'Quality hold remains open for the lot.', suggestedAction: 'Request quality release', owner: 'QA Lead', ageMinutes: 155, status: 'Open'},
    {id: 'exc-252-1', workOrderId: 'wo-100252', category: 'WarehouseStaging', severity: 'Warning', reason: 'Warehouse staging is incomplete.', suggestedAction: 'Stage materials', owner: 'Warehouse Lead', ageMinutes: 50, status: 'Open'},
    {id: 'exc-252-2', workOrderId: 'wo-100252', category: 'Schedule', severity: 'Warning', reason: 'Schedule conflict exists in the frozen period.', suggestedAction: 'Review schedule', owner: 'Scheduler', ageMinutes: 55, status: 'Open'},
    {id: 'exc-253-1', workOrderId: 'wo-100253', category: 'Material', severity: 'Blocker', reason: 'Material is available in system but not physically found.', suggestedAction: 'Confirm physical material stock', owner: 'Warehouse Lead', ageMinutes: 140, status: 'Open'},
  ];
}

function auditEvents(): ReadinessAuditEvent[] {
  return [
    {id: 'audit-245-1', workOrderId: 'wo-100245', timestamp: '2026-05-14T11:35:00.000Z', user: 'Maya Planner', eventType: 'WorkOrderSelected', previousValue: 'N/A', newValue: 'WO-100245', comment: 'Default selection on page load.'},
    {id: 'audit-245-2', workOrderId: 'wo-100245', timestamp: '2026-05-14T11:40:00.000Z', user: 'Maya Planner', eventType: 'ReadinessCheckRun', previousValue: 'Warning', newValue: 'Warning', comment: 'Local readiness check refreshed.'},
  ];
}

export function createWoReadinessDemoBundle(): WoReadinessBundle {
  const workOrders = baseWorkOrders();
  const readinessChecks = createReadinessChecks();
  const material = materialItems();
  const machine = machineItems();
  const labor = laborItems();
  const quality = qualityItems();
  const documentation = documentationItems();
  const tooling = toolingItems();
  const warehouse = warehouseItems();
  const schedule = scheduleItems();
  const builtExceptions = exceptions();
  const hydrated = hydrateWorkOrders(workOrders, readinessChecks, builtExceptions);

  const recommendedActions: RecommendedAction[] = hydrated.flatMap((workOrder) =>
    buildRecommendedActions({
      workOrder,
      checks: readinessChecks.filter((item) => item.workOrderId === workOrder.id),
      exceptions: builtExceptions,
    }),
  );

  return {
    siteName: 'Sandy',
    siteLabel: 'San Diego Site',
    workOrders: hydrated,
    readinessChecks,
    materialItems: material,
    machineItems: machine,
    laborItems: labor,
    qualityItems: quality,
    documentationItems: documentation,
    toolingItems: tooling,
    warehouseItems: warehouse,
    scheduleItems: schedule,
    exceptions: builtExceptions,
    recommendedActions,
    auditEvents: auditEvents(),
    selectedWorkOrderId: 'wo-100245',
    referenceNow: REFERENCE_NOW,
  };
}
