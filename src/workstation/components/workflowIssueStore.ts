import {useEffect, useState} from 'react';
import type {ActionCategory, ActionPriority} from './actionTrackerStore';
import {resolveActionTrackerScope} from '../../actionTracker/utils';

export type WorkflowIssueHighlight = 'outline' | 'solid';

export type WorkflowIssue = {
  category: ActionCategory;
  createdAt: string;
  creator: string;
  detail: string;
  highlight: WorkflowIssueHighlight;
  id: string;
  line: string;
  area: string;
  location?: string;
  originTag?: string;
  priority: ActionPriority;
  sourceWorkstationTitle: string;
  state: 'Open' | 'Escalated';
  targetWorkstationTitle: string;
  title: string;
};

const workflowIssueStorageKey = 'workstation-workflow-issues-v1';
const workflowIssueChangedEvent = 'workstation-workflow-issues-changed';

const tier1NcIssue: WorkflowIssue = {
  id: 'NC-2026-0412',
  category: 'QUALITY',
  createdAt: 'May 22, 2026',
  creator: 'My Ia Assistent',
  detail: 'Sealing defect found on Batch B20260412-10. Two lots are on hold and the team needs containment, owner confirmation, and next inspection checks before the handoff.',
  highlight: 'solid',
  line: 'Line 3',
  area: 'Packaging Line',
  priority: 'High',
  sourceWorkstationTitle: 'Tier 1',
  state: 'Open',
  targetWorkstationTitle: 'Tier 1',
  title: 'NC Raised This Morning',
};

function normalizeTitle(value: string) {
  return value.trim().toLowerCase();
}

function sanitizeWorkflowIssues(value: unknown): WorkflowIssue[] {
  if (!Array.isArray(value)) return [];

  return value.reduce<WorkflowIssue[]>((issues, candidate) => {
    if (typeof candidate !== 'object' || candidate === null) return issues;
    const row = candidate as Record<string, unknown>;

    if (
      typeof row.id !== 'string'
      || typeof row.title !== 'string'
      || typeof row.detail !== 'string'
      || typeof row.createdAt !== 'string'
      || typeof row.creator !== 'string'
      || typeof row.sourceWorkstationTitle !== 'string'
      || typeof row.targetWorkstationTitle !== 'string'
      || (row.category !== 'SAFETY' && row.category !== 'QUALITY' && row.category !== 'DELIVERY' && row.category !== 'COST' && row.category !== 'PEOPLE')
      || (row.priority !== 'High' && row.priority !== 'Medium' && row.priority !== 'Low')
      || (row.state !== 'Open' && row.state !== 'Escalated')
    ) {
      return issues;
    }

    const scope = resolveActionTrackerScope({
      line: typeof row.line === 'string' ? row.line : '',
      area: typeof row.area === 'string' ? row.area : '',
      location: typeof row.location === 'string' ? row.location : '',
    });
    if (!scope.line || !scope.area) {
      return issues;
    }

    issues.push({
      id: row.id,
      category: row.category,
      createdAt: row.createdAt,
      creator: row.creator,
      detail: row.detail,
      highlight: row.highlight === 'outline' ? 'outline' : 'solid',
      line: scope.line,
      area: scope.area,
      originTag: typeof row.originTag === 'string' ? row.originTag : undefined,
      priority: row.priority,
      sourceWorkstationTitle: row.sourceWorkstationTitle,
      state: row.state,
      targetWorkstationTitle: row.targetWorkstationTitle,
      title: row.title,
    });

    return issues;
  }, []);
}

export function readWorkflowIssues() {
  if (typeof window === 'undefined') return [] as WorkflowIssue[];

  try {
    const raw = window.localStorage.getItem(workflowIssueStorageKey);
    return raw ? sanitizeWorkflowIssues(JSON.parse(raw)) : [];
  } catch {
    return [];
  }
}

export function writeWorkflowIssues(issues: WorkflowIssue[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(workflowIssueStorageKey, JSON.stringify(issues));
  window.dispatchEvent(new CustomEvent<WorkflowIssue[]>(workflowIssueChangedEvent, {detail: issues}));
}

export function seedTier1NcWorkflowIssue() {
  const issues = readWorkflowIssues();
  const exists = issues.some((issue) => issue.id === tier1NcIssue.id && normalizeTitle(issue.targetWorkstationTitle) === 'tier 1');
  if (exists) return;
  writeWorkflowIssues([tier1NcIssue, ...issues]);
}

export function escalateWorkflowIssue(issue: WorkflowIssue, targetWorkstationTitle: string) {
  const issues = readWorkflowIssues();
  const escalatedId = `${issue.id}-${normalizeTitle(targetWorkstationTitle).replace(/[^a-z0-9]+/g, '-')}`;
  const sourceLabel = issue.targetWorkstationTitle || issue.sourceWorkstationTitle;
  const nextIssue: WorkflowIssue = {
    ...issue,
    id: escalatedId,
    highlight: 'solid',
    originTag: `From ${sourceLabel}`,
    sourceWorkstationTitle: sourceLabel,
    state: 'Escalated',
    targetWorkstationTitle,
  };

  writeWorkflowIssues([
    nextIssue,
    ...issues
      .map((candidate) => (
        candidate.id === issue.id
          ? {...candidate, state: 'Escalated' as const, highlight: 'solid' as const}
          : candidate
      ))
      .filter((candidate) => candidate.id !== escalatedId),
  ]);
}

export function isWorkflowIssueVisibleForWorkstation(issue: WorkflowIssue, workstationTitle: string | null | undefined) {
  if (!workstationTitle) return false;
  const active = normalizeTitle(workstationTitle);
  const target = normalizeTitle(issue.targetWorkstationTitle);
  return active === target || active.startsWith(target) || target.startsWith(active);
}

export function useWorkflowIssues() {
  const [issues, setIssues] = useState<WorkflowIssue[]>(() => readWorkflowIssues());

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const handleChanged = (event: Event) => {
      const nextIssues = (event as CustomEvent<WorkflowIssue[]>).detail;
      setIssues(Array.isArray(nextIssues) ? sanitizeWorkflowIssues(nextIssues) : readWorkflowIssues());
    };
    const handleStorage = (event: StorageEvent) => {
      if (event.key === workflowIssueStorageKey) {
        setIssues(readWorkflowIssues());
      }
    };

    window.addEventListener(workflowIssueChangedEvent, handleChanged as EventListener);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener(workflowIssueChangedEvent, handleChanged as EventListener);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  return issues;
}
