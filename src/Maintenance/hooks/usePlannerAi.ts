import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import {
  requestMockPlannerAiComparisonSession,
  requestMockPlannerAiInsights,
  requestMockPlannerAiSuggestions,
  requestMockPlannerAiWhatIf,
} from '../ai/mockPlannerAiService';
import {
  buildReviewPlanFromCopilotSuggestion,
  buildReviewPlanFromWhatIf,
  resolveCopilotPlanningItem,
} from '../ai/buildCopilotReviewPlan';
import { applyPlannerAiActionsToBoard } from '../ai/applyPlannerAiActionsToBoard';
import { propagateHorizonPlanningItems } from '../ai/propagateHorizonPlanningMutations';
import { buildPlannerAiSnapshot } from '../ai/buildPlannerAiSnapshot';
import {
  buildIntentFromAiActions,
  buildIntentFromCardMove,
} from '../ai/buildPlannerChangeIntent';
import { analyzePlannerSnapshot } from '../ai/agents/plannerAiAnalysis';
import type {
  PlannerAiAssistantHorizon,
  PlannerAiAssistantInsight,
  PlannerAiAssistantMessage,
  PlannerAiCalendarCardInput,
  PlannerAiChangeIntent,
  PlannerAiCopilotSuggestion,
  PlannerAiComparisonSession,
  PlannerAiCopilotProactiveContext,
  PlannerAiCoverageSummary,
  PlannerAiPlanVariant,
  PlannerAiPlanningItemInput,
  PlannerAiQuickPrompt,
  PlannerAiWhatIfResult,
  PlannerAiWhatIfScenario,
  PlannerAiShift,
} from '../ai/types';
import { buildCascadeApplySuccessMessage } from '../components/ai/plannerAiWorkflow';
import type { PlannerAiCompareDialogTab } from '../components/ai/plannerAiCompareDialog';
import { useCascadeEngine } from './useCascadeEngine';

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part.trim()[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

type UsePlannerAiOptions = {
  assistantHorizon: PlannerAiAssistantHorizon;
  cards: PlannerAiCalendarCardInput[];
  planningItems: PlannerAiPlanningItemInput[];
  setCards: Dispatch<SetStateAction<PlannerAiCalendarCardInput[]>>;
  setPlanningItems: Dispatch<SetStateAction<PlannerAiPlanningItemInput[]>>;
};

export function usePlannerAi({
  assistantHorizon,
  cards,
  planningItems,
  setCards,
  setPlanningItems,
}: UsePlannerAiOptions) {
  const [comparisonSession, setComparisonSession] = useState<PlannerAiComparisonSession | null>(null);
  const [activeVariantId, setActiveVariantId] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [compareDialogTab, setCompareDialogTab] = useState<PlannerAiCompareDialogTab>('compare');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedActionIdsByVariant, setSelectedActionIdsByVariant] = useState<Record<string, string[]>>({});
  const [copilotMessages, setCopilotMessages] = useState<PlannerAiAssistantMessage[]>([]);
  const [copilotInsights, setCopilotInsights] = useState<PlannerAiAssistantInsight[]>([]);
  const [copilotProactiveContext, setCopilotProactiveContext] = useState<PlannerAiCopilotProactiveContext | null>(null);
  const [copilotSuggestions, setCopilotSuggestions] = useState<PlannerAiCopilotSuggestion[]>([]);
  const [quickPrompts, setQuickPrompts] = useState<PlannerAiQuickPrompt[]>([]);
  const [whatIfScenarios, setWhatIfScenarios] = useState<PlannerAiWhatIfScenario[]>([]);
  const [whatIfResult, setWhatIfResult] = useState<PlannerAiWhatIfResult | null>(null);
  const [isCopilotLoading, setIsCopilotLoading] = useState(false);
  const [isWhatIfLoading, setIsWhatIfLoading] = useState(false);
  const [draggedSuggestionId, setDraggedSuggestionId] = useState<string | null>(null);
  const [reviewPlan, setReviewPlan] = useState<PlannerAiPlanVariant | null>(null);
  const [reviewPlanSource, setReviewPlanSource] = useState<'copilot' | 'what-if' | null>(null);
  const [pendingReviewIntent, setPendingReviewIntent] = useState<PlannerAiChangeIntent | null>(null);
  const [activeWhatIfScenario, setActiveWhatIfScenario] = useState<PlannerAiWhatIfScenario | null>(null);

  const plannerSnapshot = useMemo(
    () =>
      buildPlannerAiSnapshot({
        cards,
        planningItems,
      }),
    [cards, planningItems],
  );

  const generatedPlan = useMemo<PlannerAiPlanVariant | null>(() => {
    if (!comparisonSession) {
      return null;
    }

    const fallbackVariantId = activeVariantId ?? comparisonSession.recommendedVariantId;
    return (
      comparisonSession.variants.find((variant) => variant.id === fallbackVariantId) ?? comparisonSession.variants[0] ?? null
    );
  }, [activeVariantId, comparisonSession]);

  const previewPlan = reviewPlan ?? generatedPlan;

  const selectedActionIds = useMemo(() => {
    if (!previewPlan) {
      return [];
    }

    return selectedActionIdsByVariant[previewPlan.id] ?? [];
  }, [previewPlan, selectedActionIdsByVariant]);

  const clearReviewSession = () => {
    setReviewPlan(null);
    setReviewPlanSource(null);
    setPendingReviewIntent(null);
  };

  const openReviewSession = (
    plan: PlannerAiPlanVariant,
    source: 'copilot' | 'what-if',
    intent: PlannerAiChangeIntent,
    actionIds: string[],
  ) => {
    setReviewPlan(plan);
    setReviewPlanSource(source);
    setPendingReviewIntent(intent);
    setSelectedActionIdsByVariant((currentSelections) => ({
      ...currentSelections,
      [plan.id]: actionIds,
    }));
    cascadeEngine.discardPreview();
    setIsCompareOpen(false);
    setIsPreviewOpen(true);
  };

  const applySelectedActions = (targetPlan: PlannerAiPlanVariant, nextActionIds: string[]) => {
    const selectedActions = targetPlan.actions.filter((action) => nextActionIds.includes(action.id));
    const result = applyPlannerAiActionsToBoard(cards, planningItems, selectedActions);

    if (result.appliedCount > 0) {
      setCards(result.cards);
      setPlanningItems(result.planningItems);
    }

    return result;
  };

  const applyManualCardMove = (cardId: string, toDay: number, toShift: PlannerAiShift) => {
    let applied = 0;
    setCards((currentCards) => {
      const hasCard = currentCards.some((card) => card.id === cardId);
      if (!hasCard) {
        return currentCards;
      }
      applied = 1;
      return currentCards.map((card) =>
        card.id === cardId
          ? {
            ...card,
            day: toDay,
            shift: toShift,
          }
          : card,
      );
    });
    return applied;
  };

  const applyCopilotSchedule = (intent: PlannerAiChangeIntent) => {
    const schedule = intent.copilotSchedule;
    if (!schedule) {
      return 0;
    }

    const suggestion = copilotSuggestions.find((item) => item.id === schedule.suggestionId);
    if (!suggestion || suggestion.actionType !== 'drag-to-schedule') {
      return 0;
    }

    const matchingPlanningItem =
      planningItems.find((item) => item.wo === suggestion.planningItemSourceId) ??
      (suggestion.workOrderLabel && suggestion.asset && suggestion.priorityLabel && suggestion.durationLabel && suggestion.workType
        ? {
          wo: suggestion.workOrderLabel,
          asset: suggestion.asset,
          line: suggestion.line ?? 'AI Copilot',
          zone: suggestion.zone ?? 'Planner',
          duration: suggestion.durationLabel,
          priority: suggestion.priorityLabel,
          suggestedTechnician: suggestion.suggestedTechnician ?? 'BLU.AI Review',
          type: suggestion.workType,
          tone: '#2563EB',
        }
        : null);

    if (!matchingPlanningItem) {
      return 0;
    }

    setPlanningItems((currentItems) =>
      suggestion.planningItemSourceId
        ? currentItems.filter((item) => item.wo !== suggestion.planningItemSourceId)
        : currentItems,
    );
    setCards((currentCards) => {
      if (currentCards.some((card) => card.workOrder === matchingPlanningItem.wo)) {
        return currentCards;
      }

      const assigneeName = suggestion.suggestedTechnician ?? matchingPlanningItem.suggestedTechnician;
      return [
        ...currentCards,
        {
          id: `ai-copilot-card-${matchingPlanningItem.wo.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
          workOrder: matchingPlanningItem.wo,
          shift: schedule.targetShift,
          day: schedule.targetDay,
          startHour: suggestion.recommendedStartHour ?? 8,
          title: matchingPlanningItem.asset,
          type: matchingPlanningItem.type,
          priority: matchingPlanningItem.priority as PlannerAiCalendarCardInput['priority'],
          duration: matchingPlanningItem.duration,
          assignee: {
            name: assigneeName,
            initials: getInitials(assigneeName),
          },
          due: 'AI COPILOT',
          statusOverride: 'Planning',
        },
      ];
    });
    setDraggedSuggestionId(null);
    return 1;
  };

  const cascadeEngine = useCascadeEngine({
    plannerSnapshot,
    cards,
    planningItems,
    comparisonSession,
    generatedPlan,
    applySelectedActions,
    applyManualCardMove,
    applyCopilotSchedule,
  });

  useEffect(() => {
    let isCancelled = false;

    const syncCopilotContext = async () => {
      setIsCopilotLoading(true);

      try {
        const [snapshot, suggestions] = await Promise.all([
          requestMockPlannerAiInsights({
            snapshot: plannerSnapshot,
            horizon: assistantHorizon,
            activePlan: generatedPlan,
          }),
          requestMockPlannerAiSuggestions({
            snapshot: plannerSnapshot,
            horizon: assistantHorizon,
            activePlan: generatedPlan,
          }),
        ]);

        if (isCancelled) {
          return;
        }

        setQuickPrompts(snapshot.quickPrompts);
        setCopilotInsights(snapshot.insights);
        setCopilotProactiveContext(snapshot.proactiveContext);
        setCopilotSuggestions(suggestions);
        setWhatIfScenarios(snapshot.whatIfScenarios);
        setCopilotMessages((currentMessages) =>
          currentMessages.length
            ? currentMessages
            : [
              {
                id: `assistant-greeting-${Date.now()}`,
                role: 'assistant',
                content: snapshot.greeting,
                timestampLabel: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                horizon: assistantHorizon,
                intent: 'general',
              },
            ],
        );
      } finally {
        if (!isCancelled) {
          setIsCopilotLoading(false);
        }
      }
    };

    void syncCopilotContext();

    return () => {
      isCancelled = true;
    };
  }, [assistantHorizon, generatedPlan, plannerSnapshot]);

  const overviewItems = useMemo(() => {
    if (!generatedPlan || !comparisonSession) {
      return [
        'Generate a weekly AI plan using planner, follow-up, CBM, and spare-parts signals.',
        'Compare multiple weekly AI strategies before anything is applied to the board.',
        'Keep blocked work visible when parts readiness or follow-up context says execution is not ready.',
      ];
    }

    return [
      `${comparisonSession.variants.length} strategies generated. ${generatedPlan.strategyLabel} is currently active for review.`,
      `${selectedActionIds.length} of ${generatedPlan.actions.length} recommendation${generatedPlan.actions.length === 1 ? '' : 's'} currently selected for apply.`,
      `${generatedPlan.feasibilityChecklist.filter((item) => item.status !== 'pass').length} feasibility item${generatedPlan.feasibilityChecklist.filter((item) => item.status !== 'pass').length === 1 ? '' : 's'} require attention before full execution.`,
      `${generatedPlan.generatorLabel} completed the ${generatedPlan.horizonLabel.toLowerCase()} comparison in ${generatedPlan.generationDurationMs}ms.`,
    ];
  }, [comparisonSession, generatedPlan, selectedActionIds.length]);

  const generateAndOpenPlan = async () => {
    setIsGenerating(true);
    try {
      const nextSession = await requestMockPlannerAiComparisonSession({ snapshot: plannerSnapshot });
      setComparisonSession(nextSession);
      setActiveVariantId(nextSession.recommendedVariantId);
      clearReviewSession();
      setSelectedActionIdsByVariant(
        Object.fromEntries(nextSession.variants.map((variant) => [variant.id, variant.actions.map((action) => action.id)])),
      );
      cascadeEngine.discardPreview();
      setIsPreviewOpen(false);
      setCompareDialogTab('compare');
      setIsCompareOpen(true);
    } finally {
      setIsGenerating(false);
    }
  };

  const askCopilot = async (question: string) => {
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion) {
      return;
    }

    setCopilotMessages((currentMessages) => [
      ...currentMessages,
      {
        id: `planner-message-${Date.now()}`,
        role: 'planner',
        content: trimmedQuestion,
        timestampLabel: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        horizon: assistantHorizon,
        intent: 'general',
      },
    ]);

    const lower = trimmedQuestion.toLowerCase();
    if (lower.includes('analyze scenarios') || lower.includes('give recommendation')) {
      setCopilotMessages((currentMessages) => [
        ...currentMessages,
        {
          id: `assistant-reply-${Date.now()}`,
          role: 'assistant',
          content: 'Sure! I will analyze the weekly schedule recommendations and open the comparison board for you.',
          timestampLabel: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          horizon: assistantHorizon,
          intent: 'general',
        },
      ]);
      void generateAndOpenPlan();
      return;
    }

    setIsCopilotLoading(true);

    try {
      const [snapshot, suggestions] = await Promise.all([
        requestMockPlannerAiInsights({
          snapshot: plannerSnapshot,
          horizon: assistantHorizon,
          question: trimmedQuestion,
          activePlan: generatedPlan,
        }),
        requestMockPlannerAiSuggestions({
          snapshot: plannerSnapshot,
          horizon: assistantHorizon,
          activePlan: generatedPlan,
        }),
      ]);

      setQuickPrompts(snapshot.quickPrompts);
      setCopilotInsights(snapshot.insights);
      setCopilotProactiveContext(snapshot.proactiveContext);
      setCopilotSuggestions(suggestions);
      setWhatIfScenarios(snapshot.whatIfScenarios);
      if (snapshot.assistantReply) {
        setCopilotMessages((currentMessages) => [...currentMessages, snapshot.assistantReply]);
      }
    } finally {
      setIsCopilotLoading(false);
    }
  };

  const runWhatIfScenario = async (scenario: PlannerAiWhatIfScenario) => {
    setIsWhatIfLoading(true);

    try {
      const result = await requestMockPlannerAiWhatIf({
        snapshot: plannerSnapshot,
        horizon: assistantHorizon,
        activePlan: generatedPlan,
        scenario,
      });

      setWhatIfResult({ ...result, scenarioId: scenario.id });
      setActiveWhatIfScenario(scenario);
      setCopilotMessages((currentMessages) => [
        ...currentMessages,
        {
          id: `assistant-what-if-${Date.now()}`,
          role: 'assistant',
          content: `${result.title}: ${result.summary} ${result.recommendation}`,
          timestampLabel: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          horizon: assistantHorizon,
          intent: 'what-if',
        },
      ]);
    } finally {
      setIsWhatIfLoading(false);
    }
  };

  const openCascadePreview = () => {
    if (pendingReviewIntent && previewPlan) {
      const actionIds = selectedActionIdsByVariant[previewPlan.id] ?? pendingReviewIntent.selectedActionIds ?? [];
      if (!actionIds.length) {
        return 0;
      }

      return cascadeEngine.previewChange({
        ...pendingReviewIntent,
        selectedActionIds: actionIds,
      });
    }

    if (!generatedPlan) {
      return 0;
    }

    const variantId = generatedPlan.id;
    const nextActionIds = selectedActionIdsByVariant[variantId] ?? [];
    if (!nextActionIds.length) {
      return 0;
    }

    const targetPlan =
      comparisonSession?.variants.find((variant) => variant.id === variantId) ?? generatedPlan;

    return cascadeEngine.openAiCascadePreview(
      variantId,
      targetPlan.strategyLabel,
      targetPlan.actions,
      nextActionIds,
    );
  };

  const confirmCascadeApply = () => {
    const preview = cascadeEngine.cascadePreview;
    const applyResult = cascadeEngine.confirmChange(cards, planningItems);
    if (applyResult.appliedCount) {
      if (preview) {
        const basePlanningItems = applyResult.planningItems ?? planningItems;
        setPlanningItems(propagateHorizonPlanningItems(basePlanningItems, preview));
      }
      setIsPreviewOpen(false);
      setIsCompareOpen(false);
      clearReviewSession();
      setComparisonSession(null);

      const msg = buildCascadeApplySuccessMessage(applyResult.appliedCount, preview);
      setCopilotMessages((currentMessages) => [
        ...currentMessages,
        {
          id: `assistant-applied-${Date.now()}`,
          role: 'assistant',
          content: msg,
          timestampLabel: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          horizon: assistantHorizon,
          intent: 'general',
        },
      ]);
    }
    return applyResult;
  };

  const previewManualCardMove = (
    card: PlannerAiCalendarCardInput,
    toDay: number,
    toShift: PlannerAiShift,
    source: 'manual-dnd' | 'reschedule-modal' = 'manual-dnd',
  ) => cascadeEngine.previewChange(buildIntentFromCardMove(card, toDay, toShift, source));

  const openSuggestionReview = (suggestionId: string, targetDay?: number, targetShift?: PlannerAiShift) => {
    const suggestion = copilotSuggestions.find((item) => item.id === suggestionId);
    if (!suggestion || suggestion.actionType !== 'drag-to-schedule') {
      setDraggedSuggestionId(null);
      return 0;
    }

    const matchingPlanningItem = resolveCopilotPlanningItem(suggestion, planningItems);
    if (!matchingPlanningItem) {
      setDraggedSuggestionId(null);
      return 0;
    }

    const resolvedDay = targetDay ?? suggestion.recommendedDay ?? 2;
    const resolvedShift = targetShift ?? suggestion.recommendedShift ?? 'day';
    const { plan, intent } = buildReviewPlanFromCopilotSuggestion(
      suggestion,
      matchingPlanningItem,
      resolvedDay,
      resolvedShift,
    );

    openReviewSession(plan, 'copilot', intent, intent.selectedActionIds ?? []);
    setDraggedSuggestionId(null);
    return 1;
  };

  const previewCopilotDrag = (suggestionId: string, targetShift: PlannerAiShift, targetDay: number) =>
    openSuggestionReview(suggestionId, targetDay, targetShift);

  const openWhatIfReview = () => {
    if (!whatIfResult || !activeWhatIfScenario) {
      return 0;
    }

    const analysis = analyzePlannerSnapshot(plannerSnapshot);
    const plan = buildReviewPlanFromWhatIf(activeWhatIfScenario, whatIfResult, analysis, cards);
    if (!plan) {
      return 0;
    }

    const actionIds = plan.actions.map((action) => action.id);
    const intent = buildIntentFromAiActions(plan.id, plan.strategyLabel, plan.actions, actionIds);
    openReviewSession(plan, 'what-if', intent, actionIds);
    return 1;
  };

  const undoLastChange = () => {
    if (!cascadeEngine.undoSnapshot) {
      return false;
    }

    setCards(cascadeEngine.undoSnapshot.cards);
    setPlanningItems(cascadeEngine.undoSnapshot.planningItems);
    cascadeEngine.clearAppliedCascadePreview();
    cascadeEngine.clearUndoSnapshot();
    return true;
  };

  const setActiveVariant = (variantId: string) => {
    if (!comparisonSession?.variants.some((variant) => variant.id === variantId)) {
      return;
    }

    setActiveVariantId(variantId);
  };

  const toggleActionSelection = (actionId: string) => {
    if (!previewPlan) {
      return;
    }

    setSelectedActionIdsByVariant((currentSelections) => {
      const currentIds = currentSelections[previewPlan.id] ?? [];
      return {
        ...currentSelections,
        [previewPlan.id]: currentIds.includes(actionId)
          ? currentIds.filter((currentId) => currentId !== actionId)
          : [...currentIds, actionId],
      };
    });
  };

  const coverageSummary = useMemo<PlannerAiCoverageSummary>(
    () =>
      cascadeEngine.cascadePreview?.coverageSummary ??
      cascadeEngine.appliedCascadePreview?.coverageSummary ??
      generatedPlan?.coverageSummary ??
      plannerSnapshot.coverageSummary,
    [cascadeEngine.appliedCascadePreview, cascadeEngine.cascadePreview, generatedPlan, plannerSnapshot.coverageSummary],
  );

  const activeHorizonImpact = useMemo(
    () => cascadeEngine.horizonImpacts.find((impact) => impact.horizon === assistantHorizon) ?? null,
    [assistantHorizon, cascadeEngine.horizonImpacts],
  );

  return {
    plannerSnapshot,
    followUpBacklogSummary: plannerSnapshot.followUpBacklogSummary,
    comparisonSession,
    generatedPlan,
    previewPlan,
    reviewPlan,
    reviewPlanSource,
    assistantHorizon,
    activeVariantId,
    isGenerating,
    isPreviewOpen,
    isCompareOpen,
    compareDialogTab,
    isCascadePreviewOpen: cascadeEngine.isCascadePreviewOpen,
    isCopilotLoading,
    isWhatIfLoading,
    overviewItems,
    copilotMessages,
    copilotInsights,
    copilotProactiveContext,
    copilotSuggestions,
    quickPrompts,
    whatIfScenarios,
    whatIfResult,
    draggedSuggestionId,
    cascadePreview: cascadeEngine.cascadePreview,
    appliedCascadePreview: cascadeEngine.appliedCascadePreview,
    undoSnapshot: cascadeEngine.undoSnapshot,
    coverageSummary,
    horizonImpacts: cascadeEngine.horizonImpacts,
    horizonProjections: cascadeEngine.horizonProjections,
    approval: cascadeEngine.approval,
    activeHorizonImpact,
    selectedActionIds,
    selectedActionCount: selectedActionIds.length,
    totalActionCount: previewPlan?.actions.length ?? 0,
    closePreview: () => {
      setIsPreviewOpen(false);
      clearReviewSession();
    },
    openPreview: (variantId?: string) => {
      if (variantId) {
        setActiveVariant(variantId);
      }
      if (reviewPlan) {
        setIsCompareOpen(false);
        cascadeEngine.discardPreview();
        setIsPreviewOpen(true);
        return;
      }
      clearReviewSession();
      if (comparisonSession?.variants.length) {
        setIsCompareOpen(false);
        cascadeEngine.discardPreview();
        setIsPreviewOpen(true);
      }
    },
    openCompare: () => {
      if (comparisonSession?.variants.length) {
        setIsPreviewOpen(false);
        cascadeEngine.discardPreview();
        setCompareDialogTab('compare');
        setIsCompareOpen(true);
      }
    },
    closeCompare: () => setIsCompareOpen(false),
    setCompareDialogTab,
    closeCascadePreview: cascadeEngine.discardPreview,
    setActiveVariant: (variantId: string) => {
      setActiveVariant(variantId);
    },
    activateVariantAndOpenPreview: (variantId: string) => {
      setActiveVariant(variantId);
      clearReviewSession();
      cascadeEngine.discardPreview();
      setIsCompareOpen(false);
      setIsPreviewOpen(true);
    },
    toggleActionSelection,
    selectAllActions: () => {
      if (!previewPlan) {
        return;
      }
      setSelectedActionIdsByVariant((currentSelections) => ({
        ...currentSelections,
        [previewPlan.id]: previewPlan.actions.map((action) => action.id),
      }));
    },
    clearActionSelection: () => {
      if (!previewPlan) {
        return;
      }
      setSelectedActionIdsByVariant((currentSelections) => ({
        ...currentSelections,
        [previewPlan.id]: [],
      }));
    },
    askCopilot,
    runWhatIfScenario,
    clearWhatIfResult: () => {
      setWhatIfResult(null);
      setActiveWhatIfScenario(null);
    },
    startSuggestionDrag: (suggestionId: string) => setDraggedSuggestionId(suggestionId),
    endSuggestionDrag: () => setDraggedSuggestionId(null),
    openSuggestionReview,
    openWhatIfReview,
    previewCopilotDrag,
    previewManualCardMove,
    previewChange: cascadeEngine.previewChange,
    undoLastChange,
    generateAndOpenPlan,
    openCascadePreview,
    confirmCascadeApply,
  };
}
