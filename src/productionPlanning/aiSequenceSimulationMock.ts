import type {SchedulingWorkOrder, SchedulingWorkOrderStatus} from './schedulingWorkspaceMock';
import type {PriorityLevel, ReadinessStatus, ScheduledWorkOrder} from './schedulingWorkspaceTimeline/types';
import {validateNoGapsInLineSequence} from './aiSequenceSimulationUtils';

export type AISequenceSimulationMetricSet = {
  totalWorkOrders: number;
  totalPlannedHours: number;
  totalIdleHours: number;
  totalChangeovers: number;
  averageUtilizationPercent: number;
  overloadedLines: number;
  lateRiskOrders: number;
  materialRiskOrders: number;
  readinessBlockedOrders: number;
  projectedThroughput: number;
  estimatedDowntimeHours: number;
};

export type AISequenceReasoningEntry = {
  id: string;
  title: string;
  category: 'Capacity' | 'Changeover' | 'DueDate' | 'Material' | 'Readiness';
  severity: 'Info' | 'Warning' | 'Critical';
  description: string;
};

export type AISequenceChangeType =
  | 'EarlierStart'
  | 'LaterStart'
  | 'Resequenced'
  | 'SameFamilyGrouped'
  | 'MaterialWindowAligned'
  | 'NeedsReview'
  | 'BlockedAtEnd';

export type AISequenceRiskLevel = 'Low' | 'Medium' | 'High' | 'Critical' | 'None';

export type AISequenceItem = {
  id: string;
  proposedSequenceNumber: number;
  workOrderId: string;
  originalWorkOrderId: string;
  productCode: string;
  productDescription: string;
  productFamily: string;
  quantity: number;
  uom: string;
  lineId: string;
  lineName: string;
  proposedStartDateTime: string;
  proposedEndDateTime: string;
  durationHours: number;
  dueDate: string;
  priority: PriorityLevel;
  readinessStatus: ReadinessStatus;
  materialRisk: AISequenceRiskLevel;
  qualityRisk: AISequenceRiskLevel;
  laborRisk: AISequenceRiskLevel;
  changeoverGroup: string;
  status: 'Proposed' | 'Warning' | 'Blocked';
  aiReasoning: string;
  expectedImpact: string;
  changedFromCurrent: boolean;
  changeType: AISequenceChangeType;
  warningReason?: string;
};

export type AISequenceLine = {
  lineId: string;
  lineName: string;
  area: string;
  currentUtilizationPercent: number;
  proposedUtilizationPercent: number;
  currentTotalHours: number;
  proposedTotalHours: number;
  idleTimeBeforeHours: number;
  idleTimeAfterHours: number;
  changeoverBeforeCount: number;
  changeoverAfterCount: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  sequenceItems: AISequenceItem[];
  lineReasoning: string;
  gapFreeSequence: boolean;
};

export type AISequenceSimulation = {
  id: string;
  generatedAt: string;
  generatedBy: string;
  planningHorizonStart: string;
  planningHorizonEnd: string;
  confidencePercent: number;
  optimizationObjective: string;
  status: 'Draft';
  summary: string;
  lineSequences: AISequenceLine[];
  reasoning: AISequenceReasoningEntry[];
  keyChanges: string[];
  assumptions: string[];
  risks: string[];
  metricsBefore: AISequenceSimulationMetricSet;
  metricsAfter: AISequenceSimulationMetricSet;
};

function buildSimulationItem(item: Omit<AISequenceItem, 'id' | 'originalWorkOrderId'>): AISequenceItem {
  return {
    ...item,
    id: item.workOrderId,
    originalWorkOrderId: item.workOrderId,
  };
}

function buildLine(line: Omit<AISequenceLine, 'gapFreeSequence'>): AISequenceLine {
  return {
    ...line,
    gapFreeSequence: validateNoGapsInLineSequence(line.sequenceItems),
  };
}

function createSimulationDefinition(): AISequenceSimulation {
  return {
    id: 'AISIM-2026-05-001',
    generatedAt: '2026-05-14T09:15:00',
    generatedBy: 'AI Scheduling Assistant',
    planningHorizonStart: '2026-05-15T07:00:00',
    planningHorizonEnd: '2026-05-17T23:00:00',
    confidencePercent: 86,
    optimizationObjective: 'Minimize idle time and changeovers while protecting due-date priority and readiness constraints.',
    status: 'Draft',
    summary:
      'The proposed sequence removes idle gaps within each line, groups similar product families to reduce changeovers, moves critical orders earlier, and avoids placing material-risk orders before expected staging windows.',
    metricsBefore: {
      totalWorkOrders: 26,
      totalPlannedHours: 118.5,
      totalIdleHours: 21,
      totalChangeovers: 17,
      averageUtilizationPercent: 78,
      overloadedLines: 2,
      lateRiskOrders: 7,
      materialRiskOrders: 6,
      readinessBlockedOrders: 3,
      projectedThroughput: 482000,
      estimatedDowntimeHours: 9.5,
    },
    metricsAfter: {
      totalWorkOrders: 26,
      totalPlannedHours: 118.5,
      totalIdleHours: 4,
      totalChangeovers: 10,
      averageUtilizationPercent: 91,
      overloadedLines: 0,
      lateRiskOrders: 3,
      materialRiskOrders: 4,
      readinessBlockedOrders: 3,
      projectedThroughput: 512000,
      estimatedDowntimeHours: 6,
    },
    reasoning: [
      {
        id: 'capacity-no-gaps',
        title: 'Removed idle gaps',
        category: 'Capacity',
        severity: 'Info',
        description: 'The proposed sequence removes planned idle gaps between work orders on each line.',
      },
      {
        id: 'changeover-family-grouping',
        title: 'Grouped similar product families',
        category: 'Changeover',
        severity: 'Info',
        description: 'Similar product families were grouped to reduce changeover count from 17 to 10.',
      },
      {
        id: 'due-date-priority-protected',
        title: 'Protected critical due dates',
        category: 'DueDate',
        severity: 'Warning',
        description: 'Critical and high-priority WOs were moved earlier when readiness allowed.',
      },
      {
        id: 'material-window-delay',
        title: 'Delayed material-risk WOs',
        category: 'Material',
        severity: 'Warning',
        description: 'Material-risk orders were scheduled after expected staging windows where possible.',
      },
      {
        id: 'blocked-orders-planner-owned',
        title: 'Blocked WOs remain planner-owned',
        category: 'Readiness',
        severity: 'Critical',
        description: 'Blocked WOs are not solved by the simulation. They remain visible but require planner action.',
      },
    ],
    keyChanges: [
      'WO-100251 moved before WO-100245 due to critical priority.',
      'WO-200118 aligned with material staging window.',
      'WO-300125 remains blocked and is placed at the end of Line 30 sequence.',
      'Standard Tube products grouped on Line 10.',
      'Gel Product products grouped on Line 40.',
      'Packaging idle time reduced on Line 50.',
    ],
    risks: [
      'Material staging times are assumed from readiness preview.',
      'Blocked WOs are not automatically released.',
      'Labor warnings remain on Line 50.',
      'No real production schedule is updated.',
      'Planner approval is required before any operational change.',
    ],
    assumptions: [
      'Product-line eligibility is already validated.',
      'Setup times are included in proposed duration.',
      'Current maintenance windows remain unchanged.',
      'Material availability is based on readiness preview.',
      'The simulation does not override quality or documentation blockers.',
    ],
    lineSequences: [
      buildLine({
        lineId: 'line-10',
        lineName: 'Line 10',
        area: 'Tube Fill & Seal',
        currentUtilizationPercent: 82,
        proposedUtilizationPercent: 94,
        currentTotalHours: 16.5,
        proposedTotalHours: 15,
        idleTimeBeforeHours: 4,
        idleTimeAfterHours: 0,
        changeoverBeforeCount: 4,
        changeoverAfterCount: 2,
        riskLevel: 'Medium',
        lineReasoning:
          'AI groups Standard Tube products together and moves the critical order earlier to reduce due date risk while removing idle time between jobs.',
        sequenceItems: [
          buildSimulationItem({
            proposedSequenceNumber: 1,
            workOrderId: 'WO-100251',
            productCode: 'FG-1002',
            productDescription: 'Standard Tube B',
            productFamily: 'Standard Tube',
            quantity: 39500,
            uom: 'PCS',
            lineId: 'line-10',
            lineName: 'Line 10',
            proposedStartDateTime: '2026-05-15T07:00:00',
            proposedEndDateTime: '2026-05-15T10:30:00',
            durationHours: 3.5,
            dueDate: '2026-05-15T18:00:00',
            priority: 'Critical',
            readinessStatus: 'Warning',
            materialRisk: 'Low',
            qualityRisk: 'None',
            laborRisk: 'None',
            changeoverGroup: 'STD-TUBE',
            status: 'Warning',
            aiReasoning: 'Critical order moved first because due date risk is higher than WO-100245.',
            expectedImpact: 'Reduces due-date exposure on the first campaign slot.',
            changedFromCurrent: true,
            changeType: 'EarlierStart',
            warningReason: 'Readiness warning remains visible for planner review.',
          }),
          buildSimulationItem({
            proposedSequenceNumber: 2,
            workOrderId: 'WO-100245',
            productCode: 'FG-1001',
            productDescription: 'Standard Tube A',
            productFamily: 'Standard Tube',
            quantity: 32000,
            uom: 'PCS',
            lineId: 'line-10',
            lineName: 'Line 10',
            proposedStartDateTime: '2026-05-15T10:30:00',
            proposedEndDateTime: '2026-05-15T14:30:00',
            durationHours: 4,
            dueDate: '2026-05-16T09:00:00',
            priority: 'High',
            readinessStatus: 'Ready',
            materialRisk: 'None',
            qualityRisk: 'None',
            laborRisk: 'Low',
            changeoverGroup: 'STD-TUBE',
            status: 'Proposed',
            aiReasoning: 'Runs after WO-100251 because both belong to the Standard Tubes family, reducing changeover complexity.',
            expectedImpact: 'Preserves family continuity and avoids an extra setup event.',
            changedFromCurrent: true,
            changeType: 'Resequenced',
          }),
          buildSimulationItem({
            proposedSequenceNumber: 3,
            workOrderId: 'WO-100266',
            productCode: 'FG-1001',
            productDescription: 'Standard Tube A',
            productFamily: 'Standard Tube',
            quantity: 28000,
            uom: 'PCS',
            lineId: 'line-10',
            lineName: 'Line 10',
            proposedStartDateTime: '2026-05-15T14:30:00',
            proposedEndDateTime: '2026-05-15T18:00:00',
            durationHours: 3.5,
            dueDate: '2026-05-16T12:00:00',
            priority: 'Medium',
            readinessStatus: 'Ready',
            materialRisk: 'None',
            qualityRisk: 'None',
            laborRisk: 'None',
            changeoverGroup: 'STD-TUBE',
            status: 'Proposed',
            aiReasoning: 'Kept adjacent to FG-1001 to avoid a product-family changeover.',
            expectedImpact: 'Removes a mid-line idle gap while keeping like products grouped.',
            changedFromCurrent: true,
            changeType: 'SameFamilyGrouped',
          }),
          buildSimulationItem({
            proposedSequenceNumber: 4,
            workOrderId: 'WO-100280',
            productCode: 'FG-1002',
            productDescription: 'Standard Tube B',
            productFamily: 'Standard Tube',
            quantity: 24000,
            uom: 'PCS',
            lineId: 'line-10',
            lineName: 'Line 10',
            proposedStartDateTime: '2026-05-15T18:00:00',
            proposedEndDateTime: '2026-05-15T22:00:00',
            durationHours: 4,
            dueDate: '2026-05-16T22:00:00',
            priority: 'High',
            readinessStatus: 'Warning',
            materialRisk: 'Medium',
            qualityRisk: 'None',
            laborRisk: 'Low',
            changeoverGroup: 'STD-TUBE',
            status: 'Warning',
            aiReasoning: 'Placed after related Standard Tube orders to preserve family grouping, with warning due to material staging risk.',
            expectedImpact: 'Lowers changeover count even though staging review is still required.',
            changedFromCurrent: true,
            changeType: 'LaterStart',
            warningReason: 'Material staging is expected later in the shift.',
          }),
        ],
      }),
      buildLine({
        lineId: 'line-20',
        lineName: 'Line 20',
        area: 'Additives / Gel',
        currentUtilizationPercent: 74,
        proposedUtilizationPercent: 90,
        currentTotalHours: 14,
        proposedTotalHours: 14,
        idleTimeBeforeHours: 5,
        idleTimeAfterHours: 0,
        changeoverBeforeCount: 5,
        changeoverAfterCount: 2,
        riskLevel: 'Medium',
        lineReasoning:
          'AI moves Additive Tube orders after the material staging window and groups Gel Product orders together to reduce changeovers.',
        sequenceItems: [
          buildSimulationItem({
            proposedSequenceNumber: 1,
            workOrderId: 'WO-200118',
            productCode: 'FG-2001',
            productDescription: 'Additive Tube',
            productFamily: 'Additive Tube',
            quantity: 18000,
            uom: 'PCS',
            lineId: 'line-20',
            lineName: 'Line 20',
            proposedStartDateTime: '2026-05-15T07:00:00',
            proposedEndDateTime: '2026-05-15T10:00:00',
            durationHours: 3,
            dueDate: '2026-05-15T16:00:00',
            priority: 'Critical',
            readinessStatus: 'Warning',
            materialRisk: 'Medium',
            qualityRisk: 'None',
            laborRisk: 'None',
            changeoverGroup: 'ADDITIVE-TUBE',
            status: 'Warning',
            aiReasoning: 'Scheduled first after expected component staging to protect critical demand.',
            expectedImpact: 'Improves due-date protection while keeping the line active from shift start.',
            changedFromCurrent: true,
            changeType: 'MaterialWindowAligned',
            warningReason: 'Material staging is expected but not yet fully confirmed.',
          }),
          buildSimulationItem({
            proposedSequenceNumber: 2,
            workOrderId: 'WO-200104',
            productCode: 'FG-2001',
            productDescription: 'Additive Tube',
            productFamily: 'Additive Tube',
            quantity: 12000,
            uom: 'PCS',
            lineId: 'line-20',
            lineName: 'Line 20',
            proposedStartDateTime: '2026-05-15T10:00:00',
            proposedEndDateTime: '2026-05-15T13:00:00',
            durationHours: 3,
            dueDate: '2026-05-16T08:00:00',
            priority: 'High',
            readinessStatus: 'Ready',
            materialRisk: 'Low',
            qualityRisk: 'None',
            laborRisk: 'None',
            changeoverGroup: 'ADDITIVE-TUBE',
            status: 'Proposed',
            aiReasoning: 'Grouped with Additive Tube to avoid unnecessary setup.',
            expectedImpact: 'Avoids an extra family swap and keeps setup losses low.',
            changedFromCurrent: true,
            changeType: 'SameFamilyGrouped',
          }),
          buildSimulationItem({
            proposedSequenceNumber: 3,
            workOrderId: 'WO-200133',
            productCode: 'FG-3001',
            productDescription: 'Gel Product',
            productFamily: 'Gel Product',
            quantity: 22000,
            uom: 'PCS',
            lineId: 'line-20',
            lineName: 'Line 20',
            proposedStartDateTime: '2026-05-15T13:00:00',
            proposedEndDateTime: '2026-05-15T17:00:00',
            durationHours: 4,
            dueDate: '2026-05-16T18:00:00',
            priority: 'Medium',
            readinessStatus: 'Ready',
            materialRisk: 'None',
            qualityRisk: 'None',
            laborRisk: 'None',
            changeoverGroup: 'GEL',
            status: 'Proposed',
            aiReasoning: 'Placed after Additive Tube sequence because readiness is clear and capacity window is available.',
            expectedImpact: 'Uses the next feasible family block without creating open time.',
            changedFromCurrent: true,
            changeType: 'Resequenced',
          }),
          buildSimulationItem({
            proposedSequenceNumber: 4,
            workOrderId: 'WO-200142',
            productCode: 'FG-3001',
            productDescription: 'Gel Product',
            productFamily: 'Gel Product',
            quantity: 16000,
            uom: 'PCS',
            lineId: 'line-20',
            lineName: 'Line 20',
            proposedStartDateTime: '2026-05-15T17:00:00',
            proposedEndDateTime: '2026-05-15T21:00:00',
            durationHours: 4,
            dueDate: '2026-05-16T22:00:00',
            priority: 'High',
            readinessStatus: 'Warning',
            materialRisk: 'Low',
            qualityRisk: 'None',
            laborRisk: 'None',
            changeoverGroup: 'GEL',
            status: 'Warning',
            aiReasoning: 'Kept adjacent to Gel Product family to reduce changeover time.',
            expectedImpact: 'Keeps the line gap-free while preserving the lower-changeover family run.',
            changedFromCurrent: true,
            changeType: 'SameFamilyGrouped',
            warningReason: 'Planner should confirm final readiness before release.',
          }),
        ],
      }),
      buildLine({
        lineId: 'line-30',
        lineName: 'Line 30',
        area: 'Specialty Packs',
        currentUtilizationPercent: 69,
        proposedUtilizationPercent: 88,
        currentTotalHours: 13.5,
        proposedTotalHours: 16,
        idleTimeBeforeHours: 6.5,
        idleTimeAfterHours: 0,
        changeoverBeforeCount: 4,
        changeoverAfterCount: 2,
        riskLevel: 'High',
        lineReasoning:
          'AI keeps blocked or needs-review work orders at the end of the sequence while filling the earlier available capacity with feasible Specialty Pack orders.',
        sequenceItems: [
          buildSimulationItem({
            proposedSequenceNumber: 1,
            workOrderId: 'WO-300090',
            productCode: 'FG-4001',
            productDescription: 'Specialty Pack',
            productFamily: 'Specialty Pack',
            quantity: 5200,
            uom: 'PCS',
            lineId: 'line-30',
            lineName: 'Line 30',
            proposedStartDateTime: '2026-05-15T07:00:00',
            proposedEndDateTime: '2026-05-15T11:00:00',
            durationHours: 4,
            dueDate: '2026-05-16T08:00:00',
            priority: 'High',
            readinessStatus: 'Ready',
            materialRisk: 'None',
            qualityRisk: 'None',
            laborRisk: 'None',
            changeoverGroup: 'SPECIALTY',
            status: 'Proposed',
            aiReasoning: 'Feasible order moved earlier to reduce idle time.',
            expectedImpact: 'Immediately consumes open capacity on the line.',
            changedFromCurrent: true,
            changeType: 'EarlierStart',
          }),
          buildSimulationItem({
            proposedSequenceNumber: 2,
            workOrderId: 'WO-300097',
            productCode: 'FG-4001',
            productDescription: 'Specialty Pack',
            productFamily: 'Specialty Pack',
            quantity: 6000,
            uom: 'PCS',
            lineId: 'line-30',
            lineName: 'Line 30',
            proposedStartDateTime: '2026-05-15T11:00:00',
            proposedEndDateTime: '2026-05-15T15:00:00',
            durationHours: 4,
            dueDate: '2026-05-16T14:00:00',
            priority: 'Medium',
            readinessStatus: 'Ready',
            materialRisk: 'Low',
            qualityRisk: 'None',
            laborRisk: 'None',
            changeoverGroup: 'SPECIALTY',
            status: 'Proposed',
            aiReasoning: 'Grouped with Specialty Pack family to reduce setup.',
            expectedImpact: 'Keeps the line in a single family run before risky work starts.',
            changedFromCurrent: true,
            changeType: 'SameFamilyGrouped',
          }),
          buildSimulationItem({
            proposedSequenceNumber: 3,
            workOrderId: 'WO-300111',
            productCode: 'FG-5001',
            productDescription: 'Low Volume Product',
            productFamily: 'Low Volume Product',
            quantity: 1700,
            uom: 'PCS',
            lineId: 'line-30',
            lineName: 'Line 30',
            proposedStartDateTime: '2026-05-15T15:00:00',
            proposedEndDateTime: '2026-05-15T19:00:00',
            durationHours: 4,
            dueDate: '2026-05-16T18:00:00',
            priority: 'Medium',
            readinessStatus: 'Warning',
            materialRisk: 'Medium',
            qualityRisk: 'None',
            laborRisk: 'Medium',
            changeoverGroup: 'LOW-VOLUME',
            status: 'Warning',
            aiReasoning: 'Scheduled after ready jobs because labor capacity is only partially available.',
            expectedImpact: 'Keeps the order visible without taking earlier feasible slots away from ready work.',
            changedFromCurrent: true,
            changeType: 'NeedsReview',
            warningReason: 'Labor capacity is only partially confirmed.',
          }),
          buildSimulationItem({
            proposedSequenceNumber: 4,
            workOrderId: 'WO-300125',
            productCode: 'FG-5001',
            productDescription: 'Low Volume Product',
            productFamily: 'Low Volume Product',
            quantity: 2000,
            uom: 'PCS',
            lineId: 'line-30',
            lineName: 'Line 30',
            proposedStartDateTime: '2026-05-15T19:00:00',
            proposedEndDateTime: '2026-05-15T23:00:00',
            durationHours: 4,
            dueDate: '2026-05-15T20:00:00',
            priority: 'Critical',
            readinessStatus: 'Blocked',
            materialRisk: 'High',
            qualityRisk: 'None',
            laborRisk: 'Medium',
            changeoverGroup: 'LOW-VOLUME',
            status: 'Blocked',
            aiReasoning: 'Kept visible at the end of the sequence but marked as blocked. Planner must resolve material issue before execution.',
            expectedImpact: 'Maintains visibility of the late-risk order without treating it as executable.',
            changedFromCurrent: true,
            changeType: 'BlockedAtEnd',
            warningReason: 'Material issue remains unresolved and planner-owned.',
          }),
        ],
      }),
      buildLine({
        lineId: 'line-40',
        lineName: 'Line 40',
        area: 'Assembly',
        currentUtilizationPercent: 80,
        proposedUtilizationPercent: 92,
        currentTotalHours: 14,
        proposedTotalHours: 16,
        idleTimeBeforeHours: 3,
        idleTimeAfterHours: 0,
        changeoverBeforeCount: 3,
        changeoverAfterCount: 1,
        riskLevel: 'Low',
        lineReasoning:
          'AI groups Gel Products first and then runs Standard Tube products in a continuous no-gap sequence to improve utilization.',
        sequenceItems: [
          buildSimulationItem({
            proposedSequenceNumber: 1,
            workOrderId: 'WO-400021',
            productCode: 'FG-3001',
            productDescription: 'Gel Product',
            productFamily: 'Gel Product',
            quantity: 20000,
            uom: 'PCS',
            lineId: 'line-40',
            lineName: 'Line 40',
            proposedStartDateTime: '2026-05-16T07:00:00',
            proposedEndDateTime: '2026-05-16T11:00:00',
            durationHours: 4,
            dueDate: '2026-05-16T14:00:00',
            priority: 'High',
            readinessStatus: 'Ready',
            materialRisk: 'None',
            qualityRisk: 'None',
            laborRisk: 'None',
            changeoverGroup: 'GEL',
            status: 'Proposed',
            aiReasoning: 'Pulled forward to protect inventory position.',
            expectedImpact: 'Improves near-term coverage for the Gel family.',
            changedFromCurrent: true,
            changeType: 'EarlierStart',
          }),
          buildSimulationItem({
            proposedSequenceNumber: 2,
            workOrderId: 'WO-400034',
            productCode: 'FG-3001',
            productDescription: 'Gel Product',
            productFamily: 'Gel Product',
            quantity: 18000,
            uom: 'PCS',
            lineId: 'line-40',
            lineName: 'Line 40',
            proposedStartDateTime: '2026-05-16T11:00:00',
            proposedEndDateTime: '2026-05-16T15:00:00',
            durationHours: 4,
            dueDate: '2026-05-16T20:00:00',
            priority: 'Medium',
            readinessStatus: 'Ready',
            materialRisk: 'None',
            qualityRisk: 'None',
            laborRisk: 'None',
            changeoverGroup: 'GEL',
            status: 'Proposed',
            aiReasoning: 'Kept adjacent to Gel Product to reduce changeover.',
            expectedImpact: 'Eliminates an avoidable family switch in the middle of the shift.',
            changedFromCurrent: true,
            changeType: 'SameFamilyGrouped',
          }),
          buildSimulationItem({
            proposedSequenceNumber: 3,
            workOrderId: 'WO-400047',
            productCode: 'FG-1001',
            productDescription: 'Standard Tube A',
            productFamily: 'Standard Tube',
            quantity: 30000,
            uom: 'PCS',
            lineId: 'line-40',
            lineName: 'Line 40',
            proposedStartDateTime: '2026-05-16T15:00:00',
            proposedEndDateTime: '2026-05-16T19:00:00',
            durationHours: 4,
            dueDate: '2026-05-17T10:00:00',
            priority: 'High',
            readinessStatus: 'Ready',
            materialRisk: 'None',
            qualityRisk: 'None',
            laborRisk: 'None',
            changeoverGroup: 'STD-TUBE',
            status: 'Proposed',
            aiReasoning: 'Scheduled after Gel Product run based on clean capacity window.',
            expectedImpact: 'Creates a single handoff point between product families.',
            changedFromCurrent: true,
            changeType: 'Resequenced',
          }),
          buildSimulationItem({
            proposedSequenceNumber: 4,
            workOrderId: 'WO-400052',
            productCode: 'FG-1001',
            productDescription: 'Standard Tube A',
            productFamily: 'Standard Tube',
            quantity: 26000,
            uom: 'PCS',
            lineId: 'line-40',
            lineName: 'Line 40',
            proposedStartDateTime: '2026-05-16T19:00:00',
            proposedEndDateTime: '2026-05-16T23:00:00',
            durationHours: 4,
            dueDate: '2026-05-17T18:00:00',
            priority: 'Medium',
            readinessStatus: 'Warning',
            materialRisk: 'Low',
            qualityRisk: 'None',
            laborRisk: 'None',
            changeoverGroup: 'STD-TUBE',
            status: 'Warning',
            aiReasoning: 'Same-family continuation avoids extra changeover.',
            expectedImpact: 'Improves utilization while keeping the line on a stable family campaign.',
            changedFromCurrent: true,
            changeType: 'SameFamilyGrouped',
            warningReason: 'Final material confirmation is still pending.',
          }),
        ],
      }),
      buildLine({
        lineId: 'line-50',
        lineName: 'Line 50',
        area: 'Packaging',
        currentUtilizationPercent: 77,
        proposedUtilizationPercent: 89,
        currentTotalHours: 12.5,
        proposedTotalHours: 14,
        idleTimeBeforeHours: 4.5,
        idleTimeAfterHours: 0,
        changeoverBeforeCount: 4,
        changeoverAfterCount: 2,
        riskLevel: 'Medium',
        lineReasoning:
          'AI fills idle packaging capacity with Low Volume Product first, then groups Specialty Pack orders to reduce setup time.',
        sequenceItems: [
          buildSimulationItem({
            proposedSequenceNumber: 1,
            workOrderId: 'WO-500044',
            productCode: 'FG-5001',
            productDescription: 'Low Volume Product',
            productFamily: 'Low Volume Product',
            quantity: 1700,
            uom: 'PCS',
            lineId: 'line-50',
            lineName: 'Line 50',
            proposedStartDateTime: '2026-05-16T07:00:00',
            proposedEndDateTime: '2026-05-16T10:00:00',
            durationHours: 3,
            dueDate: '2026-05-16T16:00:00',
            priority: 'High',
            readinessStatus: 'Warning',
            materialRisk: 'None',
            qualityRisk: 'None',
            laborRisk: 'Medium',
            changeoverGroup: 'LOW-VOLUME',
            status: 'Warning',
            aiReasoning: 'Placed first to avoid late risk, but warning remains due to labor capacity.',
            expectedImpact: 'Reduces late risk on packaging without creating open time.',
            changedFromCurrent: true,
            changeType: 'EarlierStart',
            warningReason: 'Labor capacity is still in warning status.',
          }),
          buildSimulationItem({
            proposedSequenceNumber: 2,
            workOrderId: 'WO-500051',
            productCode: 'FG-5001',
            productDescription: 'Low Volume Product',
            productFamily: 'Low Volume Product',
            quantity: 1900,
            uom: 'PCS',
            lineId: 'line-50',
            lineName: 'Line 50',
            proposedStartDateTime: '2026-05-16T10:00:00',
            proposedEndDateTime: '2026-05-16T13:00:00',
            durationHours: 3,
            dueDate: '2026-05-16T21:00:00',
            priority: 'Medium',
            readinessStatus: 'Ready',
            materialRisk: 'None',
            qualityRisk: 'None',
            laborRisk: 'None',
            changeoverGroup: 'LOW-VOLUME',
            status: 'Proposed',
            aiReasoning: 'Kept with Low Volume Product to avoid additional packaging setup.',
            expectedImpact: 'Removes a packaging changeover in the first half of the shift.',
            changedFromCurrent: true,
            changeType: 'SameFamilyGrouped',
          }),
          buildSimulationItem({
            proposedSequenceNumber: 3,
            workOrderId: 'WO-500063',
            productCode: 'FG-4001',
            productDescription: 'Specialty Pack',
            productFamily: 'Specialty Pack',
            quantity: 5500,
            uom: 'PCS',
            lineId: 'line-50',
            lineName: 'Line 50',
            proposedStartDateTime: '2026-05-16T13:00:00',
            proposedEndDateTime: '2026-05-16T17:00:00',
            durationHours: 4,
            dueDate: '2026-05-17T08:00:00',
            priority: 'High',
            readinessStatus: 'Ready',
            materialRisk: 'None',
            qualityRisk: 'None',
            laborRisk: 'None',
            changeoverGroup: 'SPECIALTY',
            status: 'Proposed',
            aiReasoning: 'Scheduled after low-volume run based on due-date priority and readiness.',
            expectedImpact: 'Transitions to the next family at the cleanest available boundary.',
            changedFromCurrent: true,
            changeType: 'Resequenced',
          }),
          buildSimulationItem({
            proposedSequenceNumber: 4,
            workOrderId: 'WO-500078',
            productCode: 'FG-4001',
            productDescription: 'Specialty Pack',
            productFamily: 'Specialty Pack',
            quantity: 6200,
            uom: 'PCS',
            lineId: 'line-50',
            lineName: 'Line 50',
            proposedStartDateTime: '2026-05-16T17:00:00',
            proposedEndDateTime: '2026-05-16T21:00:00',
            durationHours: 4,
            dueDate: '2026-05-17T18:00:00',
            priority: 'Medium',
            readinessStatus: 'Warning',
            materialRisk: 'Low',
            qualityRisk: 'None',
            laborRisk: 'None',
            changeoverGroup: 'SPECIALTY',
            status: 'Warning',
            aiReasoning: 'Kept adjacent to Specialty Pack to reduce changeover.',
            expectedImpact: 'Maintains the packaging family campaign and cuts idle time.',
            changedFromCurrent: true,
            changeType: 'SameFamilyGrouped',
            warningReason: 'Planner should confirm final material staging before release.',
          }),
        ],
      }),
    ],
  };
}

function cloneSequenceItem(item: AISequenceItem): AISequenceItem {
  return {...item};
}

function cloneLine(line: AISequenceLine): AISequenceLine {
  return {
    ...line,
    sequenceItems: line.sequenceItems.map(cloneSequenceItem),
  };
}

export function createAiSequenceSimulationMock(): AISequenceSimulation {
  const simulation = createSimulationDefinition();
  return {
    ...simulation,
    metricsBefore: {...simulation.metricsBefore},
    metricsAfter: {...simulation.metricsAfter},
    reasoning: simulation.reasoning.map((entry) => ({...entry})),
    keyChanges: [...simulation.keyChanges],
    assumptions: [...simulation.assumptions],
    risks: [...simulation.risks],
    lineSequences: simulation.lineSequences.map(cloneLine),
  };
}

function toTimelineStatus(item: AISequenceItem): ScheduledWorkOrder['status'] {
  if (item.readinessStatus === 'Blocked' || item.status === 'Blocked') {
    return 'Blocked';
  }
  if (item.priority === 'Critical' || item.priority === 'High') {
    return 'Released';
  }
  if (item.readinessStatus === 'Warning' || item.status === 'Warning') {
    return 'Ready';
  }
  return 'Planned';
}

function toSchedulingStatus(item: AISequenceItem): SchedulingWorkOrderStatus {
  if (item.readinessStatus === 'Blocked' || item.status === 'Blocked') {
    return 'Blocked';
  }
  if (item.readinessStatus === 'Warning' || item.status === 'Warning') {
    return 'Warning';
  }
  if (item.priority === 'Critical' || item.priority === 'High') {
    return 'Approved';
  }
  return 'Scheduled';
}

function toSchedulingReadiness(item: AISequenceItem): SchedulingWorkOrder['readiness'] {
  if (item.readinessStatus === 'Blocked') {
    return 'Blocked';
  }
  if (item.readinessStatus === 'Warning') {
    return 'Warning';
  }
  return 'Ready';
}

function toSchedulingRisk(item: AISequenceItem): SchedulingWorkOrder['risk'] {
  const highestRisk = [item.materialRisk, item.qualityRisk, item.laborRisk].reduce<AISequenceRiskLevel>((current, candidate) => {
    const rank: Record<AISequenceRiskLevel, number> = {
      None: 0,
      Low: 1,
      Medium: 2,
      High: 3,
      Critical: 4,
    };
    return rank[candidate] > rank[current] ? candidate : current;
  }, 'None');

  if (highestRisk === 'Critical' || highestRisk === 'High') {
    return 'High';
  }
  if (highestRisk === 'Medium') {
    return 'Medium';
  }
  return 'Low';
}

function toAiConfidence(item: AISequenceItem) {
  if (item.readinessStatus === 'Blocked') {
    return 58;
  }
  if (item.readinessStatus === 'Warning') {
    return item.priority === 'Critical' ? 82 : 79;
  }
  if (item.priority === 'Critical') {
    return 93;
  }
  if (item.priority === 'High') {
    return 90;
  }
  return 86;
}

export function createAiSimulationTimelineWorkOrders(simulation: AISequenceSimulation): ScheduledWorkOrder[] {
  return simulation.lineSequences.flatMap((line) =>
    line.sequenceItems.map((item) => ({
      id: item.workOrderId.toLowerCase(),
      woNumber: item.workOrderId,
      batchNumber: `B-${item.workOrderId.replace('WO-', '')}`,
      productCode: item.productCode,
      productDescription: `${item.productCode} ${item.productDescription}`,
      productFamily: item.productFamily,
      quantity: item.quantity,
      uom: item.uom,
      lineId: line.lineId,
      plannedStartDateTime: item.proposedStartDateTime,
      plannedEndDateTime: item.proposedEndDateTime,
      durationHours: item.durationHours,
      status: toTimelineStatus(item),
      readinessStatus: item.readinessStatus,
      priority: item.priority,
      exceptionCount: item.readinessStatus === 'Ready' ? 0 : 1,
      constraintReason: item.warningReason ?? '',
      plannerComment: item.aiReasoning,
    })),
  );
}

export function createAiSimulationSchedulingWorkOrders(simulation: AISequenceSimulation): SchedulingWorkOrder[] {
  return simulation.lineSequences.flatMap((line) =>
    line.sequenceItems.map((item) => ({
      id: item.workOrderId,
      product: `${item.productCode} ${item.productDescription}`,
      quantity: item.quantity,
      line: line.lineName,
      machine: line.area,
      status: toSchedulingStatus(item),
      readiness: toSchedulingReadiness(item),
      risk: toSchedulingRisk(item),
      aiConfidence: toAiConfidence(item),
      day: item.proposedStartDateTime.slice(0, 10),
      sequenceIndex: item.proposedSequenceNumber,
      family: item.productFamily,
      source: 'ai',
    })),
  );
}

export const aiSequenceSimulationMock = createAiSequenceSimulationMock();
