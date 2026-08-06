import {useEffect, useState} from 'react';
import {
  type ActionTrackerRow as ActionTrackerItem,
  type ActionTrackerPriority as ActionPriority,
  type ActionTrackerStatus as ActionStatus,
  type ActionTrackerCategory as ActionCategory,
  type ActionTrackerRecurrence,
  type ActionTrackerRecurrenceUnit,
  type ActionTrackerAttachment,
  type ActionTrackerSource as ActionSource,
  type ActionTrackerType as ActionType,
  type ActionTrackerCreateDraft,
  type ActionTrackerCreateContext,
  type ActionTrackerDueDateExtensionHistoryEntry,
  type ActionTrackerReassignmentHistoryEntry,
} from '../../actionTracker/types';
import {buildActionTrackerLocationFromScope, resolveActionTrackerScope} from '../../actionTracker/utils';
import { useWorkstationContext } from '../contexts/WorkstationContext';
import { readPublishedWorkstations } from '../publishedWorkstations';

export {
  type ActionTrackerItem,
  type ActionTrackerAttachment,
  type ActionPriority,
  type ActionStatus,
  type ActionCategory,
  type ActionTrackerRecurrence,
  type ActionTrackerRecurrenceUnit,
  type ActionSource,
  type ActionType,
  type ActionTrackerCreateDraft,
  type ActionTrackerCreateContext,
};

const actionTrackerStorageKey = 'workstation-action-tracker-items-v1';
const actionTrackerChangedEvent = 'workstation-action-tracker-items-changed';
export const dueDateExtensionWorkflowMarker = '[due-date-extension-request]';
const dueDateExtensionDatePrefix = '[due-date-extension-date:';
const dueDateExtensionJustificationPrefix = '[due-date-extension-justification:';

function encodeDueDateExtensionValue(value: string) {
  return encodeURIComponent(value);
}

function decodeDueDateExtensionValue(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function readDueDateExtensionRequestMetadata(suggestedActions: string) {
  const hasPending = suggestedActions.includes(dueDateExtensionWorkflowMarker);
  const dateMatch = suggestedActions.match(/\[due-date-extension-date:([^\]]+)\]/);
  const justificationMatch = suggestedActions.match(/\[due-date-extension-justification:([^\]]+)\]/);

  return {
    hasPending,
    requestedDate: dateMatch ? decodeDueDateExtensionValue(dateMatch[1]) : '',
    justification: justificationMatch ? decodeDueDateExtensionValue(justificationMatch[1]) : '',
  };
}

export function clearDueDateExtensionRequestMetadata(suggestedActions: string) {
  return suggestedActions
    .replace(dueDateExtensionWorkflowMarker, '')
    .replace(/\[due-date-extension-date:[^\]]+\]/g, '')
    .replace(/\[due-date-extension-justification:[^\]]+\]/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export function appendDueDateExtensionRequestMetadata(
  suggestedActions: string,
  requestedDate: string,
  justification: string,
) {
  const base = clearDueDateExtensionRequestMetadata(suggestedActions);
  return [
    base,
    dueDateExtensionWorkflowMarker,
    `${dueDateExtensionDatePrefix}${encodeDueDateExtensionValue(requestedDate)}]`,
    `${dueDateExtensionJustificationPrefix}${encodeDueDateExtensionValue(justification)}]`,
  ].filter(Boolean).join(' ');
}

export const actionTrackerPeople = [
  'John Smith',
  'Ethan Walker',
  'Madison Brooks',
  'James Miller',
  'Olivia Martin',
  'David Cooper',
  'Gracie Walker',
] as const;

function normalizeActionSource(source?: string) {
  if (!source?.trim()) return 'Action Tracker';
  if (source === 'Tier 1') return 'TMS 1';
  if (source === 'Tier 2') return 'TMS 2';
  if (source === 'Tier 3') return 'TMS 3';
  if (source === 'Shift Logbook / WO') return 'Maintenance';
  return source;
}

function normalizeCreatedBy(createdBy: string | undefined, fallback: string) {
  const normalized = createdBy?.trim();
  return normalized || fallback;
}

const standardActionTypes: ActionType[] = ['Corrective', 'Preventive'];
const safetyActionTypes: ActionType[] = ['BBS', 'Near Miss', 'Condition Report'];
const genericWaterLeakTitlePrefix = 'There is water leaking from the ceiling';
const genericWaterLeakProblem = 'There is water leaking from the ceiling near Building A, 2nd Floor. The area needs containment, facilities support, and a quick inspection before the next handoff.';

const placeholderScenarioLibrary: Array<Pick<
  ActionTrackerItem,
  'source' | 'title' | 'problem' | 'type' | 'category' | 'machine' | 'location' | 'createdBy' | 'assignedTo' | 'dueDate' | 'priority' | 'suggestedActions' | 'supportNeeded'
>> = [
  {
    source: 'Maintenance',
    title: 'Repair condensate leak above packaging corridor',
    problem: 'Facilities reported recurring condensate dripping above the packaging corridor, creating slip risk and line access disruption during handoff.',
    type: 'Corrective',
    category: 'COST',
    machine: 'Air Handler AH-03',
    location: 'Building A, 2nd Floor',
    createdBy: 'Bruno',
    assignedTo: 'James Miller',
    dueDate: 'Jun 14, 2026',
    priority: 'High',
    suggestedActions: 'Isolate the leak source, validate temporary containment, and close the WO after facilities confirms the repair.',
    supportNeeded: 'Facilities support',
  },
  {
    source: 'ESO',
    title: 'Investigate forklift near miss at outbound dock',
    problem: 'An operator reported a near miss between a forklift and a pedestrian at the outbound dock during pallet staging.',
    type: 'Near Miss',
    category: 'SAFETY',
    machine: '',
    location: 'Line 3',
    createdBy: 'Madison Brooks',
    assignedTo: 'David Cooper',
    dueDate: 'Jun 12, 2026',
    priority: 'High',
    suggestedActions: 'Interview the team, confirm pedestrian lane controls, and assign corrective actions before the next shift starts.',
    supportNeeded: 'EHS review',
  },
  {
    source: 'TMS 1',
    title: 'Recover startup scrap loss on blister line',
    problem: 'Startup scrap on the blister line has repeated for three shifts and is now affecting release timing for the next order batch.',
    type: 'Corrective',
    category: 'QUALITY',
    machine: 'Palletizer PL-22',
    location: 'Packaging Area',
    createdBy: 'John Smith',
    assignedTo: 'James Miller',
    dueDate: 'Jun 13, 2026',
    priority: 'High',
    suggestedActions: 'Confirm containment settings, verify changeover parameters, and document the startup checks for the next crew.',
    supportNeeded: 'Process engineer',
  },
  {
    source: 'TMS 2',
    title: 'Stabilize temperature drift on molding press',
    problem: 'Molding press temperature drift is causing repeated dimensional variation after the first hour of runtime.',
    type: 'Corrective',
    category: 'QUALITY',
    machine: 'Molding 4',
    location: 'Line 2',
    createdBy: 'Bruno',
    assignedTo: 'Olivia Martin',
    dueDate: 'Jun 16, 2026',
    priority: 'Medium',
    suggestedActions: 'Validate sensor readings, tighten the response plan, and confirm the escalation owner for the next run window.',
    supportNeeded: 'Maintenance technician',
  },
  {
    source: 'Action Tracker',
    title: 'Close audit gaps on gowning compliance',
    problem: 'Internal audit findings show repeat gowning deviations at the clean entry checkpoint during peak staffing hours.',
    type: 'Preventive',
    category: 'PEOPLE',
    machine: '',
    location: 'Line 1',
    createdBy: 'Ethan Walker',
    assignedTo: 'Gracie Walker',
    dueDate: 'Jun 18, 2026',
    priority: 'Medium',
    suggestedActions: 'Refresh the checkpoint routine, retrain the affected operators, and verify compliance during the next two audits.',
    supportNeeded: 'Supervisor alignment',
  },
  {
    source: 'Shift Logbook',
    title: 'Replace worn guide rail on cartoner infeed',
    problem: 'The cartoner infeed guide rail is worn and causing intermittent jams that slow recovery after minor stops.',
    type: 'Preventive',
    category: 'COST',
    machine: 'Packaging 2',
    location: 'Packaging Area',
    createdBy: 'Dwe',
    assignedTo: 'James Miller',
    dueDate: 'Jun 17, 2026',
    priority: 'Low',
    suggestedActions: 'Plan the replacement window, confirm spare part availability, and validate startup after the repair.',
    supportNeeded: 'Planner coordination',
  },
  {
    source: 'ESO',
    title: 'Address repeated housekeeping hazard near solvent station',
    problem: 'BBS observations flagged repeated housekeeping debris near the solvent station walkway.',
    type: 'BBS',
    category: 'SAFETY',
    machine: '',
    location: 'Building A, 2nd Floor',
    createdBy: 'Fds',
    assignedTo: 'David Cooper',
    dueDate: 'Jun 11, 2026',
    priority: 'Medium',
    suggestedActions: 'Remove the debris source, reinforce ownership for the area, and verify housekeeping checks at shift close.',
    supportNeeded: 'Area ownership review',
  },
  {
    source: 'TMS 3',
    title: 'Contain recurring supplier label mismatch',
    problem: 'Supplier labels do not match the received lot paperwork, creating release delays and manual verification rework.',
    type: 'Corrective',
    category: 'DELIVERY',
    machine: '',
    location: 'Line 3',
    createdBy: 'Bruno',
    assignedTo: 'Gracie Walker',
    dueDate: 'Jun 19, 2026',
    priority: 'Medium',
    suggestedActions: 'Escalate the mismatch trend to the supplier, confirm receiving checks, and assign a closure owner for the next delivery.',
    supportNeeded: 'Supplier quality',
  },
];

const defaultActionTrackerItems: ActionTrackerItem[] = [
  {
    id: 'A8932001',
    creationDate: 'Mar 17, 2026',
    source: 'Tier 1',
    title: 'Implement corrective actions and verify effectiveness',
    problem: 'Recurring paint surface defects continue after the last containment pass on Line 1.',
    type: 'Corrective',
    category: 'QUALITY',
    machine: '',
    location: 'Line 1',
    createdBy: 'Madison Brooks',
    assignedTo: 'John Smith',
    reviewer: 'Ethan Walker',
    approver: 'Madison Brooks',
    dueDate: 'Mar 21, 2026',
    priority: 'High',
    shift: 'Day Shift',
    status: 'Open',
    suggestedActions: 'Review calibration plan, validate setup, and update the verification checklist.',
    supportNeeded: 'Quality review',
    recurrence: {
      interval: 1,
      unit: 'Weekly',
      startsOn: 'Mar 24, 2026',
      endsOn: 'Jun 30, 2026',
    },
    aiAssisted: false,
  },
  {
    id: 'A8932009',
    creationDate: 'Mar 11, 2026',
    source: 'Tier 2',
    title: 'Develop an action plan for future risk mitigation',
    problem: 'Absenteeism risk is creating repeat handoff gaps for Shift C coverage.',
    type: 'Preventive',
    category: 'PEOPLE',
    machine: '',
    location: 'Line 3',
    createdBy: 'John Smith',
    assignedTo: 'Gracie Walker',
    reviewer: 'Ethan Walker',
    approver: 'Madison Brooks',
    dueDate: 'May 11, 2026',
    priority: 'High',
    shift: 'Shift C',
    status: 'Completed',
    suggestedActions: 'Build mitigation plan, align owners, and confirm leadership approval.',
    supportNeeded: 'Ops approval',
    aiAssisted: false,
  },
  {
    id: 'A8932002',
    creationDate: 'Mar 17, 2026',
    source: 'Tier 1',
    title: 'Conduct staff training on compliance and SOP adherence',
    problem: 'Inspection findings show missed standard work steps during surface preparation.',
    type: 'Preventive',
    category: 'QUALITY',
    machine: '',
    location: 'Line 3',
    createdBy: 'Madison Brooks',
    assignedTo: 'James Miller',
    reviewer: 'Ethan Walker',
    approver: 'Madison Brooks',
    dueDate: 'Mar 18, 2026',
    priority: 'Medium',
    shift: 'Shift B',
    status: 'In Progress',
    suggestedActions: 'Inspect standards, retrain operators, and verify audit readiness.',
    supportNeeded: 'Training room',
    aiAssisted: false,
  },
  {
    id: 'A8932006',
    creationDate: 'Mar 16, 2026',
    source: 'Tier 2',
    title: 'Establish a monitoring plan for critical processes',
    problem: 'Critical process checks do not have a stable escalation cadence after the last quality alert.',
    type: 'Corrective',
    category: 'QUALITY',
    machine: '',
    location: 'Line 3',
    createdBy: 'John Smith',
    assignedTo: 'David Cooper',
    reviewer: 'Ethan Walker',
    approver: 'Madison Brooks',
    dueDate: 'Mar 26, 2026',
    priority: 'Medium',
    shift: 'Shift B',
    status: 'Under Approval',
    suggestedActions: appendDueDateExtensionRequestMetadata(
      'Define monitoring cadence, assign line checks, and publish the escalation path.',
      'Apr 02, 2026',
      'Need one additional week to complete validation coverage across all three shifts.',
    ),
    supportNeeded: 'Line lead input',
    aiAssisted: false,
  },
  {
    id: 'A8932003',
    creationDate: 'Mar 17, 2026',
    source: 'Tier 1',
    title: 'Review and update quality control procedures',
    problem: 'Recent scrap spikes show the current controls are not preventing repeat rework cost.',
    type: 'Corrective',
    category: 'COST',
    machine: '',
    location: 'Line 2',
    createdBy: 'Madison Brooks',
    assignedTo: 'Olivia Martin',
    reviewer: 'Ethan Walker',
    approver: 'Madison Brooks',
    dueDate: 'Mar 20, 2026',
    priority: 'Low',
    shift: 'Shift A',
    status: 'Completed',
    suggestedActions: 'Refresh standard work, update controls, and communicate new checkpoints.',
    supportNeeded: 'Document control',
    aiAssisted: false,
  },
  {
    id: 'A8932004',
    creationDate: 'Mar 16, 2026',
    source: 'Tier 1',
    title: 'Initiate a supplier audit and assess materials quality',
    problem: 'Incoming material variation is driving repeated quality findings at startup.',
    type: 'Preventive',
    category: 'PEOPLE',
    machine: '',
    location: 'Line 1',
    createdBy: 'John Smith',
    assignedTo: 'James Miller',
    reviewer: 'Ethan Walker',
    approver: 'Madison Brooks',
    dueDate: 'Mar 19, 2026',
    priority: 'Low',
    shift: 'Shift A',
    status: 'Open',
    suggestedActions: 'Prepare supplier audit, collect material history, and confirm open risks.',
    supportNeeded: 'Supplier data',
    aiAssisted: false,
  },
  {
    id: 'A8932005',
    creationDate: 'Mar 14, 2026',
    source: 'Tier 2',
    title: 'Schedule maintenance for equipment to prevent failures',
    problem: 'Preventive maintenance timing is not aligned with current delivery-critical windows.',
    type: 'Preventive',
    category: 'DELIVERY',
    machine: '',
    location: 'Line 3',
    createdBy: 'Madison Brooks',
    assignedTo: 'Gracie Walker',
    reviewer: 'Ethan Walker',
    approver: 'Madison Brooks',
    dueDate: 'Mar 16, 2026',
    priority: 'Low',
    shift: 'Shift B',
    status: 'Canceled',
    suggestedActions: 'Validate maintenance window, review downtime risk, and reschedule if needed.',
    supportNeeded: 'Maintenance planner',
    aiAssisted: false,
  },
  {
    id: 'A8932007',
    creationDate: 'Mar 15, 2026',
    source: 'Tier 1',
    title: 'Create a feedback loop for continuous improvement',
    problem: 'Operators do not have a clean process to escalate recurring people and staffing issues.',
    type: 'Preventive',
    category: 'PEOPLE',
    machine: '',
    location: 'Line 2',
    createdBy: 'Madison Brooks',
    assignedTo: 'Olivia Martin',
    reviewer: 'Ethan Walker',
    approver: 'Madison Brooks',
    dueDate: 'Apr 03, 2026',
    priority: 'Low',
    shift: 'Day Shift',
    status: 'Open',
    suggestedActions: 'Collect team feedback, summarize themes, and assign follow-up owners.',
    supportNeeded: 'Supervisor alignment',
    aiAssisted: false,
  },
  {
    id: 'A8932008',
    creationDate: 'Feb 25, 2026',
    source: 'Tier 3',
    title: 'Document all findings and report to management',
    problem: 'Safety findings from the last incident review still need final closure and leadership communication.',
    type: 'Condition Report',
    category: 'SAFETY',
    machine: '',
    location: 'Line 1',
    createdBy: 'John Smith',
    assignedTo: 'Olivia Martin',
    reviewer: 'Ethan Walker',
    approver: 'Madison Brooks',
    dueDate: 'Apr 19, 2026',
    priority: 'Low',
    shift: 'Day Shift',
    status: 'Open',
    suggestedActions: 'Compile incident learnings, validate actions taken, and issue the final report.',
    supportNeeded: 'Management review',
    aiAssisted: false,
  },
];

function isGenericWaterLeakPlaceholder(item: ActionTrackerItem) {
  return item.title.startsWith(genericWaterLeakTitlePrefix) || item.problem.trim() === genericWaterLeakProblem;
}

function applyActionTrackerMockMigration(items: ActionTrackerItem[]) {
  const genericIndexes = items.reduce<number[]>((indexes, item, index) => {
    if (isGenericWaterLeakPlaceholder(item)) indexes.push(index);
    return indexes;
  }, []);

  const diversifiedItems = genericIndexes.length
    ? items.map((item, index) => {
        const scenarioIndex = genericIndexes.indexOf(index);
        if (scenarioIndex === -1) return item;

        const scenario = placeholderScenarioLibrary[scenarioIndex % placeholderScenarioLibrary.length];
        return {
          ...item,
          source: scenario.source,
          title: scenario.title,
          problem: scenario.problem,
          type: scenario.type,
          category: scenario.category,
          machine: scenario.machine,
          location: scenario.location,
          createdBy: scenario.createdBy,
          assignedTo: scenario.assignedTo,
          dueDate: scenario.dueDate,
          priority: scenario.priority,
          suggestedActions: scenario.suggestedActions,
          supportNeeded: scenario.supportNeeded,
        };
      })
    : items;

  if (diversifiedItems.some((item) => readDueDateExtensionRequestMetadata(item.suggestedActions).hasPending)) {
    return diversifiedItems;
  }

  const approvalIndex = diversifiedItems.findIndex((item) => item.status === 'Under Approval');
  if (approvalIndex === -1) return diversifiedItems;

  const approvalItem = diversifiedItems[approvalIndex];
  const nextApprovalItem: ActionTrackerItem = {
    ...approvalItem,
    source: approvalItem.source === 'Action Tracker' ? 'TMS 2' : approvalItem.source,
    title: approvalItem.title === 'Conduct staff training on compliance and SOP adherence'
      ? 'Approve extension for compliance retraining rollout'
      : approvalItem.title,
    suggestedActions: appendDueDateExtensionRequestMetadata(
      clearDueDateExtensionRequestMetadata(approvalItem.suggestedActions),
      'Jun 20, 2026',
      'Training attendance was incomplete on the last shift, so the owner requested extra time to finish certification coverage.',
    ),
  };

  return diversifiedItems.map((item, index) => (index === approvalIndex ? nextApprovalItem : item));
}

function isActionPriority(value: unknown): value is ActionPriority {
  return value === 'High' || value === 'Medium' || value === 'Low';
}

function isActionStatus(value: unknown): value is ActionStatus {
  return value === 'Open'
    || value === 'In Progress'
    || value === 'Under Approval'
    || value === 'Completed'
    || value === 'Canceled'
    || value === 'Overdue'
    || value === 'Reopened';
}

function isActionCategory(value: unknown): value is ActionCategory {
  return value === 'QUALITY'
    || value === 'COST'
    || value === 'PEOPLE'
    || value === 'DELIVERY'
    || value === 'SAFETY'
    ;
}

function isActionType(value: unknown): value is ActionType {
  return standardActionTypes.includes(value as ActionType) || safetyActionTypes.includes(value as ActionType);
}

function isActionRecurrenceUnit(value: unknown): value is ActionTrackerRecurrenceUnit {
  return value === 'Daily' || value === 'Weekly' || value === 'Monthly';
}

function sanitizeActionRecurrence(value: unknown): ActionTrackerRecurrence | null {
  if (typeof value !== 'object' || value === null) return null;

  const recurrence = value as Record<string, unknown>;
  if (!isActionRecurrenceUnit(recurrence.unit)) return null;
  if (typeof recurrence.interval !== 'number' || !Number.isFinite(recurrence.interval) || recurrence.interval < 1) {
    return null;
  }

  return {
    interval: Math.max(1, Math.round(recurrence.interval)),
    unit: recurrence.unit,
    startsOn: typeof recurrence.startsOn === 'string' ? recurrence.startsOn : undefined,
    endsOn: typeof recurrence.endsOn === 'string' ? recurrence.endsOn : undefined,
  };
}

function sanitizeActionTrackerAttachment(value: unknown): ActionTrackerAttachment | null {
  if (typeof value !== 'object' || value === null) return null;

  const attachment = value as Record<string, unknown>;
  if (
    typeof attachment.id !== 'string'
    || typeof attachment.name !== 'string'
    || typeof attachment.mimeType !== 'string'
    || typeof attachment.size !== 'number'
    || !Number.isFinite(attachment.size)
    || typeof attachment.dataUrl !== 'string'
  ) {
    return null;
  }

  return {
    id: attachment.id,
    name: attachment.name,
    mimeType: attachment.mimeType,
    size: attachment.size,
    dataUrl: attachment.dataUrl,
  };
}

function sanitizeReassignmentHistory(value: unknown): ActionTrackerReassignmentHistoryEntry[] {
  if (!Array.isArray(value)) return [];

  return value.reduce<ActionTrackerReassignmentHistoryEntry[]>((items, candidate) => {
    if (typeof candidate !== 'object' || candidate === null) return items;
    const row = candidate as Record<string, unknown>;
    if (
      typeof row.id !== 'string'
      || typeof row.actionReference !== 'string'
      || typeof row.previousOwner !== 'string'
      || typeof row.newOwner !== 'string'
      || typeof row.changedBy !== 'string'
      || typeof row.timestamp !== 'string'
      || typeof row.timestampMs !== 'number'
      || !Number.isFinite(row.timestampMs)
      || (typeof row.justification !== 'string' && typeof row.justification !== 'undefined')
      || (row.eventStatus !== 'Completed' && row.eventStatus !== 'Cancelled')
    ) {
      return items;
    }

    items.push({
      id: row.id,
      actionReference: row.actionReference,
      previousOwner: row.previousOwner,
      newOwner: row.newOwner,
      changedBy: row.changedBy,
      timestamp: row.timestamp,
      timestampMs: row.timestampMs,
      justification: typeof row.justification === 'string' ? row.justification : undefined,
      eventStatus: row.eventStatus,
    });
    return items;
  }, []);
}

function sanitizeDueDateExtensionHistory(value: unknown): ActionTrackerDueDateExtensionHistoryEntry[] {
  if (!Array.isArray(value)) return [];

  return value.reduce<ActionTrackerDueDateExtensionHistoryEntry[]>((items, candidate) => {
    if (typeof candidate !== 'object' || candidate === null) return items;
    const row = candidate as Record<string, unknown>;
    if (
      typeof row.id !== 'string'
      || typeof row.actionReference !== 'string'
      || typeof row.originalDueDate !== 'string'
      || typeof row.newDueDate !== 'string'
      || typeof row.changedBy !== 'string'
      || typeof row.timestamp !== 'string'
      || typeof row.timestampMs !== 'number'
      || !Number.isFinite(row.timestampMs)
      || (typeof row.justification !== 'string' && typeof row.justification !== 'undefined')
      || (row.eventStatus !== 'Completed' && row.eventStatus !== 'Cancelled')
    ) {
      return items;
    }

    items.push({
      id: row.id,
      actionReference: row.actionReference,
      originalDueDate: row.originalDueDate,
      newDueDate: row.newDueDate,
      changedBy: row.changedBy,
      timestamp: row.timestamp,
      timestampMs: row.timestampMs,
      justification: typeof row.justification === 'string' ? row.justification : undefined,
      eventStatus: row.eventStatus,
    });
    return items;
  }, []);
}

function sanitizeActionTrackerItems(value: unknown): ActionTrackerItem[] {
  if (!Array.isArray(value) || !value.length) return defaultActionTrackerItems;

  const items = value.reduce<ActionTrackerItem[]>((items, candidate) => {
    if (typeof candidate !== 'object' || candidate === null) return items;
    const row = candidate as Record<string, unknown>;
    const normalizedStatus = row.status === 'Under Review' ? 'Under Approval' : row.status;
    if (
      typeof row.id !== 'string'
      || typeof row.creationDate !== 'string'
      || (typeof row.source !== 'string' && typeof row.source !== 'undefined')
      || typeof row.title !== 'string'
      || typeof row.problem !== 'string'
      || !isActionType(row.type)
      || !isActionCategory(row.category)
      || typeof row.location !== 'string'
      || typeof row.createdBy !== 'string'
      || typeof row.assignedTo !== 'string'
      || typeof row.reviewer !== 'string'
      || typeof row.approver !== 'string'
      || typeof row.dueDate !== 'string'
      || !isActionPriority(row.priority)
      || typeof row.shift !== 'string'
      || !isActionStatus(normalizedStatus)
      || typeof row.suggestedActions !== 'string'
      || typeof row.supportNeeded !== 'string'
      || typeof row.aiAssisted !== 'boolean'
    ) {
      return items;
    }

    const scope = resolveActionTrackerScope({
      plant: typeof row.plant === 'string' ? row.plant : '',
      area: typeof row.area === 'string' ? row.area : '',
      unit: typeof row.unit === 'string' ? row.unit : '',
      line: typeof row.line === 'string' ? row.line : '',
      zone: typeof row.zone === 'string' ? row.zone : '',
      machine: typeof row.machine === 'string' ? row.machine : '',
      location: row.location as string,
    });

    items.push({
      id: row.id,
      externalId: typeof row.externalId === 'string' ? row.externalId : undefined,
      recordType: row.recordType === 'MainAction' ? row.recordType : undefined,
      creationDate: row.creationDate as string,
      createdAtMs: typeof row.createdAtMs === 'number' && Number.isFinite(row.createdAtMs) ? row.createdAtMs : undefined,
      source: normalizeActionSource(typeof row.source === 'string' ? row.source : undefined),
      title: row.title as string,
      problem: row.problem as string,
      type: row.type as any,
      category: row.category as any,
      plant: scope.plant,
      area: scope.area,
      unit: scope.unit,
      line: scope.line,
      zone: scope.zone || undefined,
      machine: typeof row.machine === 'string' ? row.machine : '',
      location: (row.location as string) || buildActionTrackerLocationFromScope(scope.line, scope.area, scope.unit, scope.plant, scope.zone),
      createdBy: normalizeCreatedBy(row.createdBy as string, 'John Smith'),
      assignedTo: row.assignedTo as string,
      reviewer: row.reviewer as string,
      approver: row.approver as string,
      dueDate: row.dueDate as string,
      priority: row.priority,
      shift: row.shift,
      status: normalizedStatus,
      suggestedActions: row.suggestedActions,
      supportNeeded: row.supportNeeded,
      recurrence: sanitizeActionRecurrence(row.recurrence),
      aiAssisted: row.aiAssisted,
      implementedSolution: typeof row.implementedSolution === 'string' ? row.implementedSolution : '',
      attachments: Array.isArray(row.attachments)
        ? row.attachments
            .map((attachment) => sanitizeActionTrackerAttachment(attachment))
            .filter((attachment): attachment is ActionTrackerAttachment => attachment !== null)
        : [],
      implementationAttachments: Array.isArray((row as {implementationAttachments?: unknown}).implementationAttachments)
        ? (row as {implementationAttachments?: unknown[]}).implementationAttachments
            ?.map((attachment) => sanitizeActionTrackerAttachment(attachment))
            .filter((attachment): attachment is ActionTrackerAttachment => attachment !== null)
        : [],
      cancellationJustification: typeof (row as {cancellationJustification?: unknown}).cancellationJustification === 'string'
        ? (row as {cancellationJustification?: string}).cancellationJustification
        : '',
      dueDateExtensionCount: typeof row.dueDateExtensionCount === 'number' && Number.isFinite(row.dueDateExtensionCount) ? row.dueDateExtensionCount : 0,
      dueDateExtensionLastUpdatedAtMs: typeof row.dueDateExtensionLastUpdatedAtMs === 'number' && Number.isFinite(row.dueDateExtensionLastUpdatedAtMs)
        ? row.dueDateExtensionLastUpdatedAtMs
        : undefined,
      dueDateExtensionHistory: sanitizeDueDateExtensionHistory(row.dueDateExtensionHistory),
      reassignmentCount: typeof row.reassignmentCount === 'number' && Number.isFinite(row.reassignmentCount) ? row.reassignmentCount : 0,
      reassignmentLastUpdatedAtMs: typeof row.reassignmentLastUpdatedAtMs === 'number' && Number.isFinite(row.reassignmentLastUpdatedAtMs)
        ? row.reassignmentLastUpdatedAtMs
        : undefined,
      reassignmentHistory: sanitizeReassignmentHistory(row.reassignmentHistory),
      originRecordId: typeof row.originRecordId === 'string' ? row.originRecordId : undefined,
      originRecordLabel: typeof row.originRecordLabel === 'string' ? row.originRecordLabel : undefined,
      originScreen: typeof row.originScreen === 'string' ? row.originScreen : undefined,
      tierLevel: typeof row.tierLevel === 'string' ? row.tierLevel : undefined,
      meetingDate: typeof row.meetingDate === 'string' ? row.meetingDate : undefined,
    });
    return items;
  }, []);

  return applyActionTrackerMockMigration(items.length ? items : defaultActionTrackerItems);
}

function formatDateLabel(value: Date) {
  return value.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatExternalIdDate(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

function normalizeExternalIdToken(value: string) {
  return value.trim().toUpperCase().replace(/[^A-Z0-9]+/g, '') || 'UNKNOWN';
}

function buildMainActionExternalId(
  items: ActionTrackerItem[],
  source: string,
  site: string,
  createdAtMs: number,
) {
  const sourceToken = normalizeExternalIdToken(source);
  const siteToken = normalizeExternalIdToken(site);
  const dateToken = formatExternalIdDate(new Date(createdAtMs));
  const prefix = `AT-${sourceToken}-${siteToken}-${dateToken}-`;

  const nextSequence = items.reduce((maxSequence, item) => {
    if (item.externalId?.startsWith(prefix)) {
      const parsedSequence = Number(item.externalId.slice(prefix.length));
      if (Number.isFinite(parsedSequence)) {
        return Math.max(maxSequence, parsedSequence);
      }
    }
    return maxSequence;
  }, 0) + 1;

  return `${prefix}${String(nextSequence).padStart(3, '0')}`;
}

function buildSuggestedActions(draft: ActionTrackerCreateDraft) {
  if (draft.aiAssisted) {
    const machineContext = draft.machine.trim() ? ` on ${draft.machine.trim()}` : '';
    return `My Ia Assistent drafted the first pass. Validate ${draft.category.toLowerCase()} containment, confirm the owner, and verify follow-up on ${draft.line}${draft.zone.trim() ? ` / ${draft.zone.trim()}` : ''}${machineContext}.`;
  }

  const machineContext = draft.machine.trim() ? ` for ${draft.machine.trim()}` : '';
  return `Review ${draft.problem.toLowerCase()}, assign the owner, and confirm the next verification step before closure${machineContext}.`;
}

function buildNextActionId(items: ActionTrackerItem[]) {
  const nextNumber = items.reduce((maxValue, item) => {
    const numericValue = Number(item.id.replace(/[^0-9]/g, ''));
    return Number.isFinite(numericValue) ? Math.max(maxValue, numericValue) : maxValue;
  }, 8932000) + 1;

  return `A${String(nextNumber).padStart(7, '0')}`;
}

export function readActionTrackerItems() {
  if (typeof window === 'undefined') return defaultActionTrackerItems;

  try {
    const raw = window.localStorage.getItem(actionTrackerStorageKey);
    const nextItems = raw ? sanitizeActionTrackerItems(JSON.parse(raw)) : defaultActionTrackerItems;

    const serializedItems = JSON.stringify(nextItems);
    if (!raw || raw !== serializedItems || nextItems === defaultActionTrackerItems) {
      window.localStorage.setItem(actionTrackerStorageKey, serializedItems);
    }

    return nextItems;
  } catch {
    return defaultActionTrackerItems;
  }
}

export function writeActionTrackerItems(items: ActionTrackerItem[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(actionTrackerStorageKey, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent<ActionTrackerItem[]>(actionTrackerChangedEvent, {detail: items}));
}

export function createActionTrackerItem(
  draft: ActionTrackerCreateDraft,
  existingItems: ActionTrackerItem[],
  createdBy = 'John Smith',
  source = 'Action Tracker',
  integrationContext?: ActionTrackerCreateContext | null,
): ActionTrackerItem {
  if (!draft.category || !draft.priority || !draft.assignedTo || !draft.plant || !draft.area || !draft.unit || !draft.line) {
    throw new Error('Action Tracker draft is incomplete.');
  }

  const scope = resolveActionTrackerScope(draft);
  const createdAtMs = draft.createdAtMs ?? Date.now();
  const normalizedSource = normalizeActionSource(source);
  const externalId = buildMainActionExternalId(existingItems, normalizedSource, scope.plant, createdAtMs);

  return {
    id: buildNextActionId(existingItems),
    externalId,
    recordType: 'MainAction',
    creationDate: formatDateLabel(new Date(createdAtMs)),
    createdAtMs,
    source: normalizedSource,
    title: draft.title.trim(),
    problem: draft.problem.trim(),
    type: draft.type as any,
    category: draft.category as any,
    plant: scope.plant,
    area: scope.area,
    unit: scope.unit,
    line: scope.line,
    zone: scope.zone || undefined,
    machine: draft.machine.trim(),
    location: draft.location.trim() || buildActionTrackerLocationFromScope(scope.line, scope.area, scope.unit, scope.plant, scope.zone),
    createdBy: normalizeCreatedBy(draft.createdBy, createdBy),
    assignedTo: draft.assignedTo,
    reviewer: '',
    approver: draft.approver,
    dueDate: draft.dueDate.trim(),
    priority: draft.priority,
    shift: 'Day Shift',
    status: 'Open',
    suggestedActions: buildSuggestedActions(draft),
    supportNeeded: draft.supportNeeded
      ? draft.supportOwner.trim() || 'Cross-functional support'
      : 'No extra support',
    recurrence: null,
    aiAssisted: draft.aiAssisted,
    implementedSolution: '',
    attachments: draft.attachments,
    dueDateExtensionCount: 0,
    dueDateExtensionHistory: [],
    reassignmentCount: 0,
    reassignmentHistory: [],
    originRecordId: draft.originRecordId?.trim() || integrationContext?.originRecordId?.trim() || undefined,
    originRecordLabel: draft.originRecordLabel?.trim() || integrationContext?.originRecordLabel?.trim() || undefined,
    originScreen: draft.originScreen?.trim() || integrationContext?.originScreen?.trim() || undefined,
    tierLevel: draft.tierLevel?.trim() || integrationContext?.tierLevel?.trim() || undefined,
    meetingDate: draft.meetingDate?.trim() || integrationContext?.meetingDate?.trim() || undefined,
  };
}

export function useActionTrackerItems(createdBy = 'John Smith') {
  const [items, setItems] = useState<ActionTrackerItem[]>(() => readActionTrackerItems());
  const {activePredefinedWorkstationTitle, activeWorkstationId} = useWorkstationContext();

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const handleItemsChanged = (event: Event) => {
      const nextItems = (event as CustomEvent<ActionTrackerItem[]>).detail;
      setItems(Array.isArray(nextItems) ? sanitizeActionTrackerItems(nextItems) : readActionTrackerItems());
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === actionTrackerStorageKey) {
        setItems(readActionTrackerItems());
      }
    };

    window.addEventListener(actionTrackerChangedEvent, handleItemsChanged as EventListener);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener(actionTrackerChangedEvent, handleItemsChanged as EventListener);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const createAction = (draft: ActionTrackerCreateDraft, integrationContext?: ActionTrackerCreateContext | null) => {
    const activeSource = activePredefinedWorkstationTitle
      ?? readPublishedWorkstations().find((item) => item.id === activeWorkstationId)?.title
      ?? 'Tier 1';
    const nextItem = createActionTrackerItem(
      draft,
      items,
      createdBy,
      integrationContext?.source || draft.source || activeSource,
      integrationContext,
    );
    const nextItems = [nextItem, ...items];
    setItems(nextItems);
    writeActionTrackerItems(nextItems);
    return nextItem;
  };

  const updateAction = (id: string, updates: Partial<ActionTrackerItem>) => {
    const nextItems = items.map((item) => (item.id === id ? {...item, ...updates} : item));
    setItems(nextItems);
    writeActionTrackerItems(nextItems);
    return nextItems.find((item) => item.id === id) ?? null;
  };

  return {
    createAction,
    items,
    setItems,
    updateAction,
  };
}
