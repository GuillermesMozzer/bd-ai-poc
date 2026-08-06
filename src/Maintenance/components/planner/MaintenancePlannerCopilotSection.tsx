import { type DragEvent } from 'react';
import type {
  PlannerAiAssistantHorizon,
  PlannerAiCopilotSuggestion,
  PlannerAiPlanVariant,
  PlannerAiQuickPrompt,
  PlannerAiWhatIfScenario,
} from '../../ai/types';
import { PlannerAiCopilotPanel } from '../ai/PlannerAiCopilotPanel';
import { resolvePlannerAiWorkflowStep } from '../ai/plannerAiWorkflow';
import { usePlannerAi } from '../../hooks/usePlannerAi';

type MaintenancePlannerCopilotSectionProps = {
  assistantHorizon: PlannerAiAssistantHorizon;
  workflowStep: ReturnType<typeof resolvePlannerAiWorkflowStep>;
  comparisonSession: ReturnType<typeof usePlannerAi>['comparisonSession'];
  generatedPlan: PlannerAiPlanVariant | null;
  reviewPlan: PlannerAiPlanVariant | null;
  reviewPlanSource: 'copilot' | 'what-if' | null;
  followUpBacklogSummary: ReturnType<typeof usePlannerAi>['followUpBacklogSummary'];
  selectedActionCount: number;
  selectedActionIds: string[];
  isGenerating: boolean;
  isCopilotLoading: boolean;
  isWhatIfLoading: boolean;
  isPreviewOpen: boolean;
  isCompareOpen: boolean;
  compareDialogTab: ReturnType<typeof usePlannerAi>['compareDialogTab'];
  isCascadePreviewOpen: boolean;
  messages: ReturnType<typeof usePlannerAi>['copilotMessages'];
  insights: ReturnType<typeof usePlannerAi>['copilotInsights'];
  proactiveContext: ReturnType<typeof usePlannerAi>['copilotProactiveContext'];
  suggestions: ReturnType<typeof usePlannerAi>['copilotSuggestions'];
  quickPrompts: PlannerAiQuickPrompt[];
  whatIfScenarios: PlannerAiWhatIfScenario[];
  whatIfResult: ReturnType<typeof usePlannerAi>['whatIfResult'];
  draggedSuggestionId: string | null;
  onGeneratePlan: () => void | Promise<void>;
  onReviewPlan: () => void;
  onComparePlans: () => void;
  onToggleAction: (actionId: string) => void;
  onSelectAllActions: () => void;
  onClearActionSelection: () => void;
  onApplySelectedActions: () => void;
  onAskQuestion: (message: string) => void | Promise<void>;
  onRunQuickPrompt: (prompt: PlannerAiQuickPrompt) => void | Promise<void>;
  onRunWhatIf: (scenario: PlannerAiWhatIfScenario) => void | Promise<void>;
  onClearWhatIf: () => void;
  onSuggestionDragStart: (suggestion: PlannerAiCopilotSuggestion, event: DragEvent<HTMLDivElement>) => void;
  onSuggestionDragEnd: () => void;
  onReviewSuggestion: (suggestion: PlannerAiCopilotSuggestion) => void;
  onAddWhatIfToReview: () => void;
  onReschedule?: (cardId: string) => void;
  onInsightLink?: (assetLabel: string, cardId?: string) => void;
  undoSnapshot?: ReturnType<typeof usePlannerAi>['undoSnapshot'];
  activeHorizonImpact?: ReturnType<typeof usePlannerAi>['activeHorizonImpact'];
  onUndoLastChange?: () => void;
};

export function MaintenancePlannerCopilotSection({
  onReschedule,
  onReviewPlan,
  onComparePlans,
  onUndoLastChange,
  ...props
}: MaintenancePlannerCopilotSectionProps) {
  const handleSuggestionAction = (suggestion: PlannerAiCopilotSuggestion) => {
    if (suggestion.actionType === 'open-reschedule' && suggestion.targetCardId && onReschedule) {
      onReschedule(suggestion.targetCardId);
      return;
    }

    if (suggestion.actionType === 'review-plan') {
      onReviewPlan();
      return;
    }

    if (suggestion.actionType === 'review-compare') {
      onComparePlans();
    }
  };

  return (
    <PlannerAiCopilotPanel
      {...props}
      onReviewPlan={onReviewPlan}
      onComparePlans={onComparePlans}
      onSendMessage={props.onAskQuestion}
      onSuggestionAction={handleSuggestionAction}
      onInsightLink={props.onInsightLink}
      onUndoLastChange={onUndoLastChange}
    />
  );
}

