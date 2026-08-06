import type {
  ActionTrackerDueDateExtensionHistoryEntry,
  ActionTrackerReassignmentHistoryEntry,
  ActionTrackerRow,
} from './types';

type WorkflowPermissionConfig = {
  allowedUsers?: string[];
  requireJustification?: boolean;
  captureJustification?: boolean;
};

export type ActionTrackerWorkflowConfig = {
  reassignment: WorkflowPermissionConfig;
  dueDateExtension: WorkflowPermissionConfig;
};

type WorkflowFailureReason =
  | 'unauthorized'
  | 'missing_justification'
  | 'missing_value'
  | 'no_change';

type WorkflowFailure = {
  ok: false;
  reason: WorkflowFailureReason;
};

type ReassignmentSuccess = {
  ok: true;
  updates: Partial<ActionTrackerRow>;
  historyEntry: ActionTrackerReassignmentHistoryEntry;
};

type DueDateExtensionSuccess = {
  ok: true;
  updates: Partial<ActionTrackerRow>;
  historyEntry: ActionTrackerDueDateExtensionHistoryEntry;
};

export const defaultActionTrackerWorkflowConfig: ActionTrackerWorkflowConfig = {
  reassignment: {
    requireJustification: true,
    captureJustification: true,
  },
  dueDateExtension: {
    requireJustification: true,
    captureJustification: true,
  },
};

function normalizeName(value: string | undefined) {
  return value?.trim().toLowerCase() ?? '';
}

function formatHistoryTimestamp(timestampMs: number) {
  return new Date(timestampMs).toLocaleString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function canManageActionTrackerWorkflow(
  row: ActionTrackerRow,
  currentUserName: string,
  config: WorkflowPermissionConfig = {},
) {
  const normalizedUser = normalizeName(currentUserName);
  if (!normalizedUser) return false;

  const configuredUsers = (config.allowedUsers ?? [])
    .map((value) => normalizeName(value))
    .filter(Boolean);

  if (configuredUsers.length) {
    return configuredUsers.includes(normalizedUser);
  }

  const fallbackUsers = [
    row.createdBy,
    row.assignedTo,
    row.reviewer,
    row.approver,
  ]
    .map((value) => normalizeName(value))
    .filter(Boolean);

  return fallbackUsers.includes(normalizedUser);
}

export function buildReassignmentChange(
  row: ActionTrackerRow,
  currentUserName: string,
  nextOwner: string,
  justification: string,
  config: WorkflowPermissionConfig = defaultActionTrackerWorkflowConfig.reassignment,
  timestampMs = Date.now(),
): ReassignmentSuccess | WorkflowFailure {
  if (!canManageActionTrackerWorkflow(row, currentUserName, config)) {
    return {ok: false, reason: 'unauthorized'};
  }

  const trimmedOwner = nextOwner.trim();
  if (!trimmedOwner) {
    return {ok: false, reason: 'missing_value'};
  }
  if (trimmedOwner === row.assignedTo.trim()) {
    return {ok: false, reason: 'no_change'};
  }

  const normalizedJustification = config.captureJustification === false ? '' : justification.trim();
  if (config.requireJustification && !normalizedJustification) {
    return {ok: false, reason: 'missing_justification'};
  }

  const historyEntry: ActionTrackerReassignmentHistoryEntry = {
    id: `reassign-${timestampMs}`,
    actionReference: row.id,
    previousOwner: row.assignedTo,
    newOwner: trimmedOwner,
    changedBy: currentUserName,
    timestamp: formatHistoryTimestamp(timestampMs),
    timestampMs,
    justification: normalizedJustification || undefined,
    eventStatus: 'Completed',
  };

  return {
    ok: true,
    updates: {
      assignedTo: trimmedOwner,
      reassignmentCount: (row.reassignmentCount ?? 0) + 1,
      reassignmentLastUpdatedAtMs: timestampMs,
      reassignmentHistory: [historyEntry, ...(row.reassignmentHistory ?? [])],
    },
    historyEntry,
  };
}

export function buildDueDateExtensionChange(
  row: ActionTrackerRow,
  currentUserName: string,
  nextDueDate: string,
  justification: string,
  config: WorkflowPermissionConfig = defaultActionTrackerWorkflowConfig.dueDateExtension,
  timestampMs = Date.now(),
): DueDateExtensionSuccess | WorkflowFailure {
  if (!canManageActionTrackerWorkflow(row, currentUserName, config)) {
    return {ok: false, reason: 'unauthorized'};
  }

  const trimmedDueDate = nextDueDate.trim();
  if (!trimmedDueDate) {
    return {ok: false, reason: 'missing_value'};
  }
  if (trimmedDueDate === row.dueDate.trim()) {
    return {ok: false, reason: 'no_change'};
  }

  const normalizedJustification = config.captureJustification === false ? '' : justification.trim();
  if (config.requireJustification && !normalizedJustification) {
    return {ok: false, reason: 'missing_justification'};
  }

  const historyEntry: ActionTrackerDueDateExtensionHistoryEntry = {
    id: `due-date-extension-${timestampMs}`,
    actionReference: row.id,
    originalDueDate: row.dueDate,
    newDueDate: trimmedDueDate,
    changedBy: currentUserName,
    timestamp: formatHistoryTimestamp(timestampMs),
    timestampMs,
    justification: normalizedJustification || undefined,
    eventStatus: 'Completed',
  };

  return {
    ok: true,
    updates: {
      dueDate: trimmedDueDate,
      dueDateExtensionCount: (row.dueDateExtensionCount ?? 0) + 1,
      dueDateExtensionLastUpdatedAtMs: timestampMs,
      dueDateExtensionHistory: [historyEntry, ...(row.dueDateExtensionHistory ?? [])],
    },
    historyEntry,
  };
}
