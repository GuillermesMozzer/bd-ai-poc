import { useCallback, useMemo, useState } from 'react';
import {
  buildIntentFromAiActions,
  buildSyntheticPlanForIntent,
} from '../ai/buildPlannerChangeIntent';
import { generatePlannerAiCascadePreview } from '../ai/generatePlannerAiCascadePreview';
import type {
  PlannerAiCalendarCardInput,
  PlannerAiCascadePreview,
  PlannerAiChangeIntent,
  PlannerAiComparisonSession,
  PlannerAiHorizonProjection,
  PlannerAiPlanVariant,
  PlannerAiPlannerSnapshot,
  PlannerAiPlanningItemInput,
  PlannerAiUndoSnapshot,
} from '../ai/types';
import type { ApplyPlannerAiActionsResult } from '../ai/applyPlannerAiActionsToBoard';
import { usePlannerApprovalState } from './usePlannerApprovalState';

type UseCascadeEngineOptions = {
  plannerSnapshot: PlannerAiPlannerSnapshot;
  cards: PlannerAiCalendarCardInput[];
  planningItems: PlannerAiPlanningItemInput[];
  comparisonSession: PlannerAiComparisonSession | null;
  generatedPlan: PlannerAiPlanVariant | null;
  applySelectedActions: (targetPlan: PlannerAiPlanVariant, nextActionIds: string[]) => ApplyPlannerAiActionsResult;
  applyManualCardMove: (cardId: string, toDay: number, toShift: PlannerAiCalendarCardInput['shift']) => number;
  applyCopilotSchedule: (intent: PlannerAiChangeIntent) => number;
};

export function useCascadeEngine({
  plannerSnapshot,
  comparisonSession,
  generatedPlan,
  applySelectedActions,
  applyManualCardMove,
  applyCopilotSchedule,
}: UseCascadeEngineOptions) {
  const [isCascadePreviewOpen, setIsCascadePreviewOpen] = useState(false);
  const [cascadePreview, setCascadePreview] = useState<PlannerAiCascadePreview | null>(null);
  const [appliedCascadePreview, setAppliedCascadePreview] = useState<PlannerAiCascadePreview | null>(null);
  const [pendingIntent, setPendingIntent] = useState<PlannerAiChangeIntent | null>(null);
  const [undoSnapshot, setUndoSnapshot] = useState<PlannerAiUndoSnapshot | null>(null);

  const approval = usePlannerApprovalState(cascadePreview?.approvalRequests ?? []);

  const resolvePlanForIntent = useCallback(
    (intent: PlannerAiChangeIntent) => {
      if (intent.variantId) {
        const variant =
          comparisonSession?.variants.find((item) => item.id === intent.variantId) ??
          (generatedPlan?.id === intent.variantId ? generatedPlan : null);
        if (variant) {
          return variant;
        }
      }
      return buildSyntheticPlanForIntent(intent);
    },
    [comparisonSession, generatedPlan],
  );

  const previewChange = useCallback(
    (intent: PlannerAiChangeIntent) => {
      const plan = resolvePlanForIntent(intent);
      const selectedActionIds =
        intent.selectedActionIds ?? intent.syntheticActions.map((action) => action.id);
      if (!selectedActionIds.length) {
        return 0;
      }

      const preview = generatePlannerAiCascadePreview({
        snapshot: plannerSnapshot,
        plan,
        selectedActionIds,
        changeSource: intent.source,
      });

      approval.resetFromRequests();
      setPendingIntent(intent);
      setCascadePreview(preview);
      setIsCascadePreviewOpen(true);
      return selectedActionIds.length;
    },
    [approval, plannerSnapshot, resolvePlanForIntent],
  );

  const discardPreview = useCallback(() => {
    setIsCascadePreviewOpen(false);
    setCascadePreview(null);
    setPendingIntent(null);
    approval.resetFromRequests();
  }, [approval]);

  const confirmChange = useCallback(
    (cards: PlannerAiCalendarCardInput[], planningItems: PlannerAiPlanningItemInput[]) => {
      if (!cascadePreview || !pendingIntent) {
        return { appliedCount: 0, createdCardIds: [] as string[], updatedCardIds: [] as string[] };
      }

      setUndoSnapshot({
        cards: cards.map((card) => ({ ...card })),
        planningItems: planningItems.map((item) => ({ ...item })),
        capturedAt: new Date().toLocaleString(),
        changeLabel: pendingIntent.label,
      });

      let appliedCount = 0;
      let createdCardIds: string[] = [];
      let updatedCardIds: string[] = [];

      if (pendingIntent.manualCardMove) {
        appliedCount = applyManualCardMove(
          pendingIntent.manualCardMove.cardId,
          pendingIntent.manualCardMove.toDay,
          pendingIntent.manualCardMove.toShift,
        );
        if (appliedCount) {
          updatedCardIds = [pendingIntent.manualCardMove.cardId];
        }
      } else if (pendingIntent.source === 'copilot-drag' && pendingIntent.copilotSchedule) {
        appliedCount = applyCopilotSchedule(pendingIntent);
      } else if (cascadePreview.selectedActionIds.length) {
        const plan = resolvePlanForIntent(pendingIntent);
        const applyResult = applySelectedActions(plan, cascadePreview.selectedActionIds);
        appliedCount = applyResult.appliedCount;
        createdCardIds = applyResult.createdCardIds;
        updatedCardIds = applyResult.updatedCardIds;
        setAppliedCascadePreview(cascadePreview);
        setCascadePreview(null);
        setPendingIntent(null);
        setIsCascadePreviewOpen(false);
        approval.resetFromRequests();
        return {
          appliedCount,
          createdCardIds,
          updatedCardIds,
          planningItems: applyResult.planningItems,
        };
      }

      setAppliedCascadePreview(cascadePreview);
      setCascadePreview(null);
      setPendingIntent(null);
      setIsCascadePreviewOpen(false);
      approval.resetFromRequests();
      return { appliedCount, createdCardIds, updatedCardIds };
    },
    [
      approval,
      applyCopilotSchedule,
      applyManualCardMove,
      applySelectedActions,
      cascadePreview,
      pendingIntent,
      resolvePlanForIntent,
    ],
  );

  const horizonImpacts = useMemo(
    () => appliedCascadePreview?.impacts ?? cascadePreview?.impacts ?? [],
    [appliedCascadePreview, cascadePreview],
  );

  const horizonProjections = useMemo<PlannerAiHorizonProjection[]>(
    () => appliedCascadePreview?.horizonProjections ?? cascadePreview?.horizonProjections ?? [],
    [appliedCascadePreview, cascadePreview],
  );

  const openAiCascadePreview = useCallback(
    (variantId: string, strategyLabel: string, actions: PlannerAiPlanVariant['actions'], selectedActionIds: string[]) => {
      return previewChange(buildIntentFromAiActions(variantId, strategyLabel, actions, selectedActionIds));
    },
    [previewChange],
  );

  return {
    isCascadePreviewOpen,
    cascadePreview,
    appliedCascadePreview,
    pendingIntent,
    undoSnapshot,
    horizonImpacts,
    horizonProjections,
    approval,
    previewChange,
    openAiCascadePreview,
    confirmChange,
    discardPreview,
    clearUndoSnapshot: () => setUndoSnapshot(null),
    clearAppliedCascadePreview: () => setAppliedCascadePreview(null),
  };
}
