import { useCallback, useMemo, useState } from 'react';
import type {
  PlannerAiApprovalAction,
  PlannerAiApprovalDecision,
  PlannerAiApprovalRequest,
} from '../ai/types';

function getStepDecisionKey(requestId: string, stepId: string) {
  return `${requestId}__${stepId}`;
}

export function usePlannerApprovalState(requests: PlannerAiApprovalRequest[]) {
  const [decisions, setDecisions] = useState<Record<string, PlannerAiApprovalAction>>({});
  const [overrideComment, setOverrideComment] = useState<string | null>(null);

  const resetFromRequests = useCallback(() => {
    setDecisions({});
    setOverrideComment(null);
  }, []);

  const recordDecision = useCallback(
    (requestId: string, stepId: string, decision: PlannerAiApprovalDecision, comment?: string) => {
      const key = getStepDecisionKey(requestId, stepId);
      setDecisions((current) => ({
        ...current,
        [key]: {
          stepId,
          requestId,
          decision,
          comment,
          decidedAt: new Date().toLocaleString(),
        },
      }));
    },
    [],
  );

  const approveStep = useCallback(
    (requestId: string, stepId: string) => {
      recordDecision(requestId, stepId, 'approved');
    },
    [recordDecision],
  );

  const rejectStep = useCallback(
    (requestId: string, stepId: string, comment: string) => {
      if (!comment.trim()) {
        return false;
      }
      recordDecision(requestId, stepId, 'rejected', comment.trim());
      return true;
    },
    [recordDecision],
  );

  const overrideWithComment = useCallback((comment: string) => {
    if (!comment.trim()) {
      return false;
    }
    setOverrideComment(comment.trim());
    return true;
  }, []);

  const resolvedRequests = useMemo(
    () =>
      requests.map((request) => ({
        ...request,
        steps: request.steps.map((step) => {
          const decision = decisions[getStepDecisionKey(request.id, step.id)];
          if (!decision) {
            return step;
          }
          return {
            ...step,
            status: decision.decision,
            comment: decision.comment,
            decidedAt: decision.decidedAt,
          };
        }),
      })),
    [decisions, requests],
  );

  const hasBlockingApprovals = useMemo(() => {
    if (overrideComment) {
      return false;
    }

    if (!requests.length) {
      return false;
    }

    return resolvedRequests.some((request) =>
      request.steps.some((step) => step.status === 'pending' || step.status === 'rejected'),
    );
  }, [overrideComment, requests.length, resolvedRequests]);

  const canConfirm = !hasBlockingApprovals;

  return {
    resolvedRequests,
    hasBlockingApprovals,
    canConfirm,
    overrideComment,
    approveStep,
    rejectStep,
    overrideWithComment,
    resetFromRequests,
  };
}
