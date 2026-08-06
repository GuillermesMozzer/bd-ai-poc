import {
  AutoAwesome as SparkleIcon,
  CheckCircleOutline as CheckCircleIcon,
  ChatBubbleOutline as ChatIcon,
  CompareArrows as CompareArrowsIcon,
  FactCheck as FactCheckIcon,
  ReportProblemOutlined as WarningIcon,
} from '@mui/icons-material';
import { Box, Button, Checkbox, Paper, Tab, Tabs, Typography, Alert } from '@mui/material';
import { useEffect, useMemo, useRef, useState, type DragEvent, type SyntheticEvent } from 'react';
import { tokenBrand, tokenDivider, tokenNeutral, tokenText } from '../../../workstation/theme';
import type {
  PlannerAiAssistantHorizon,
  PlannerAiAssistantInsight,
  PlannerAiAssistantMessage,
  PlannerAiComparisonSession,
  PlannerAiCopilotSuggestion,
  PlannerAiCopilotProactiveContext,
  PlannerAiFollowUpBacklogSummary,
  PlannerAiPlanVariant,
  PlannerAiPlanAction,
  PlannerAiQuickPrompt,
  PlannerAiCascadeImpact,
  PlannerAiUndoSnapshot,
  PlannerAiWhatIfResult,
  PlannerAiWhatIfScenario,
} from '../../ai/types';
import { PlannerAiAgentSummaryStrip } from './PlannerAiAgentSummaryStrip';
import { PlannerAiConversation } from './PlannerAiConversation';
import { PlannerAiCopilotDrawer } from './PlannerAiCopilotDrawer';
import { PlannerAiUndoBanner } from './PlannerAiUndoBanner';
import { PlannerAiFollowUpBacklogPanel } from './PlannerAiFollowUpBacklogPanel';
import { PlannerAiInsightList } from './PlannerAiInsightList';
import { PlannerAiSuggestionCard } from './PlannerAiSuggestionCard';
import { PlannerAiCompareDrawerContext } from './PlannerAiCompareDrawerContext';
import { getCompareDialogTabLabel, type PlannerAiCompareDialogTab } from './plannerAiCompareDialog';
import { PlannerAiWhatIfPanel } from './PlannerAiWhatIfPanel';
import type { PlannerAiWorkflowStep } from './plannerAiWorkflow';

type PlannerAiCopilotPanelProps = {
  assistantHorizon: PlannerAiAssistantHorizon;
  workflowStep: PlannerAiWorkflowStep;
  comparisonSession: PlannerAiComparisonSession | null;
  generatedPlan: PlannerAiPlanVariant | null;
  reviewPlan: PlannerAiPlanVariant | null;
  reviewPlanSource: 'copilot' | 'what-if' | null;
  followUpBacklogSummary: PlannerAiFollowUpBacklogSummary;
  selectedActionCount: number;
  selectedActionIds: string[];
  isGenerating: boolean;
  isCopilotLoading: boolean;
  isWhatIfLoading: boolean;
  isPreviewOpen: boolean;
  isCompareOpen: boolean;
  compareDialogTab: PlannerAiCompareDialogTab;
  isCascadePreviewOpen: boolean;
  messages: PlannerAiAssistantMessage[];
  insights: PlannerAiAssistantInsight[];
  proactiveContext: PlannerAiCopilotProactiveContext | null;
  suggestions: PlannerAiCopilotSuggestion[];
  quickPrompts: PlannerAiQuickPrompt[];
  whatIfScenarios: PlannerAiWhatIfScenario[];
  whatIfResult: PlannerAiWhatIfResult | null;
  draggedSuggestionId: string | null;
  onGeneratePlan: () => void | Promise<void>;
  onReviewPlan: () => void;
  onComparePlans: () => void;
  onToggleAction: (actionId: string) => void;
  onSelectAllActions: () => void;
  onClearActionSelection: () => void;
  onApplySelectedActions: () => void;
  onSendMessage: (message: string) => void | Promise<void>;
  onRunQuickPrompt: (prompt: PlannerAiQuickPrompt) => void | Promise<void>;
  onRunWhatIf: (scenario: PlannerAiWhatIfScenario) => void | Promise<void>;
  onClearWhatIf: () => void;
  onSuggestionAction: (suggestion: PlannerAiCopilotSuggestion) => void;
  onSuggestionDragStart: (suggestion: PlannerAiCopilotSuggestion, event: DragEvent<HTMLDivElement>) => void;
  onSuggestionDragEnd: () => void;
  onReviewSuggestion: (suggestion: PlannerAiCopilotSuggestion) => void;
  onAddWhatIfToReview: () => void;
  onInsightLink?: (assetLabel: string, cardId?: string) => void;
  undoSnapshot?: PlannerAiUndoSnapshot | null;
  activeHorizonImpact?: PlannerAiCascadeImpact | null;
  onUndoLastChange?: () => void;
};

type CopilotTab = 'chat' | 'signals' | 'actions';

function getHorizonLabel(horizon: PlannerAiAssistantHorizon) {
  switch (horizon) {
    case 'monthly':
      return 'Monthly';
    case 'quarterly':
      return 'Quarterly';
    case 'annual':
      return 'Annual';
    default:
      return 'Weekly';
  }
}

function getCommandBarMessage(
  proactiveContext: PlannerAiCopilotProactiveContext | null,
  isCopilotLoading: boolean,
  generatedPlan: PlannerAiPlanVariant | null,
  reviewPlan: PlannerAiPlanVariant | null,
  selectedActionCount: number,
) {
  if (isCopilotLoading && !generatedPlan && !reviewPlan) {
    return 'Analyzing your schedule against CBM, follow-up, and parts signals...';
  }
  if (!generatedPlan && !reviewPlan && proactiveContext?.commandBarMessage) {
    return proactiveContext.commandBarMessage;
  }
  return getWorkflowHint(generatedPlan, reviewPlan, selectedActionCount);
}

function getWorkflowHint(
  generatedPlan: PlannerAiPlanVariant | null,
  reviewPlan: PlannerAiPlanVariant | null,
  selectedActionCount: number,
) {
  if (generatedPlan || reviewPlan) {
    return selectedActionCount > 0
      ? `${selectedActionCount} action${selectedActionCount === 1 ? '' : 's'} ready — open Review from the command bar or copilot drawer.`
      : 'Plan ready — open Review to inspect recommendations before applying.';
  }
  return 'Run Analyze to generate strategies, then open the copilot drawer for chat, signals, and actions.';
}

function getDefaultDrawerOpen(
  workflowStep: PlannerAiWorkflowStep,
  hasActivePlan: boolean,
  isCompareOpen: boolean,
  isPreviewOpen: boolean,
) {
  return workflowStep > 1 || hasActivePlan || isCompareOpen || isPreviewOpen;
}

type ScenarioSupportProps = {
  activePlan: PlannerAiPlanVariant | null;
  comparisonSession: PlannerAiComparisonSession | null;
  selectedActionCount: number;
  isGenerating: boolean;
  canReview: boolean;
  reviewDisabled: boolean;
  compareDisabled: boolean;
  onGeneratePlan: () => void | Promise<void>;
  onReviewPlan: () => void;
  onComparePlans: () => void;
};

type ChatScenarioSupportProps = {
  activePlan: PlannerAiPlanVariant | null;
  comparisonSession: PlannerAiComparisonSession | null;
  selectedActionCount: number;
  isLoading: boolean;
  onAsk: (message: string) => void | Promise<void>;
};

type ReviewApplySupportProps = {
  activePlan: PlannerAiPlanVariant | null;
  suggestions: PlannerAiCopilotSuggestion[];
  selectedActionCount: number;
  selectedActionIds: string[];
  canReview: boolean;
  reviewDisabled: boolean;
  compareDisabled: boolean;
  isGenerating: boolean;
  onReviewPlan: () => void;
  onComparePlans: () => void;
  onGeneratePlan: () => void | Promise<void>;
  onToggleAction: (actionId: string) => void;
  onSelectAllActions: () => void;
  onClearActionSelection: () => void;
  onApplySelectedActions: () => void;
};

function getActivePlan(generatedPlan: PlannerAiPlanVariant | null, reviewPlan: PlannerAiPlanVariant | null) {
  return reviewPlan ?? generatedPlan;
}

function getPlanIssueCount(plan: PlannerAiPlanVariant | null) {
  if (!plan) {
    return 0;
  }
  return (
    plan.agentConflicts.length +
    plan.blockers.length +
    plan.feasibilityChecklist.filter((item) => item.status !== 'pass').length
  );
}

function getFeasibilityTone(status: PlannerAiPlanVariant['feasibilityChecklist'][number]['status']) {
  if (status === 'blocker') {
    return { border: '#FECACA', bg: '#FEF2F2', color: '#B91C1C', icon: <WarningIcon sx={{ fontSize: 15 }} /> };
  }
  if (status === 'warning') {
    return { border: '#FED7AA', bg: '#FFF7ED', color: '#C2410C', icon: <WarningIcon sx={{ fontSize: 15 }} /> };
  }
  return { border: '#BBF7D0', bg: '#ECFDF3', color: '#166534', icon: <CheckCircleIcon sx={{ fontSize: 15 }} /> };
}

function ScenarioMetric({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <Box
      sx={{
        p: 0.85,
        borderRadius: '10px',
        border: `1px solid ${tokenDivider}`,
        bgcolor: 'background.paper',
        minWidth: 0,
      }}
    >
      <Typography sx={{ color: tokenText.secondary, fontSize: '0.64rem', fontWeight: 800, textTransform: 'uppercase' }}>
        {label}
      </Typography>
      <Typography sx={{ mt: 0.25, color: tokenText.primary, fontSize: '0.86rem', fontWeight: 900, lineHeight: 1.15 }}>
        {value}
      </Typography>
      <Typography sx={{ mt: 0.25, color: tokenText.secondary, fontSize: '0.67rem', lineHeight: 1.35 }}>
        {note}
      </Typography>
    </Box>
  );
}

function RecommendationScenarioCard({
  activePlan,
  comparisonSession,
  selectedActionCount,
  isGenerating,
  canReview,
  reviewDisabled,
  compareDisabled,
  onGeneratePlan,
  onReviewPlan,
  onComparePlans,
}: ScenarioSupportProps) {
  const issueCount = getPlanIssueCount(activePlan);
  const recommendedVariant = comparisonSession?.variants.find((variant) => variant.id === comparisonSession.recommendedVariantId);
  const activeStrategyLabel = activePlan?.strategyLabel ?? recommendedVariant?.strategyLabel ?? 'No scenario selected';
  const actionTotal = activePlan?.actions.length ?? 0;

  return (
    <Paper elevation={0} sx={{ borderRadius: '12px', border: `1px solid ${tokenBrand.selectedBg}`, bgcolor: '#EFF6FF', p: 1.3 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
        <Box sx={{ minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.65, flexWrap: 'wrap' }}>
            <SparkleIcon sx={{ color: '#F97316', fontSize: 16 }} />
            <Typography sx={{ color: tokenBrand.main, fontSize: '0.78rem', fontWeight: 900 }}>
              {activePlan ? 'Recommendation scenario' : 'BLU.AI copilot'}
            </Typography>
          </Box>
          <Typography sx={{ mt: 0.45, color: tokenText.primary, fontSize: '0.84rem', fontWeight: 900, lineHeight: 1.3 }}>
            {activePlan?.rationale.headline ?? 'I found a stronger weekly plan than your current schedule . Select Analyze to review the recommendation.'}
          </Typography>
          {activePlan?.strategyDescription ? (
            <Typography sx={{ mt: 0.35, color: tokenText.secondary, fontSize: '0.71rem', lineHeight: 1.5 }}>
              {activePlan.strategyDescription}
            </Typography>
          ) : null}
        </Box>
        <Box
          sx={{
            px: 0.9,
            py: 0.55,
            borderRadius: '10px',
            border: `1px solid ${activePlan ? '#BBF7D0' : tokenDivider}`,
            bgcolor: activePlan ? '#ECFDF3' : 'background.paper',
            color: activePlan ? '#166534' : tokenText.secondary,
            fontSize: '0.68rem',
            fontWeight: 900,
            textAlign: 'center',
            minWidth: 74,
          }}
        >
          {activePlan ? `${activePlan.confidence}% confidence` : 'Needs analyze'}
        </Box>
      </Box>

      <Box sx={{ mt: 1, display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 0.65 }}>
        <ScenarioMetric label="Strategy" value={activeStrategyLabel} note={comparisonSession ? `${comparisonSession.variants.length} compared` : 'Run Step 1'} />
        <ScenarioMetric label="Review" value={`${selectedActionCount}/${actionTotal || suggestionsFallbackCount(activePlan)}`} note="actions selected" />
        <ScenarioMetric label="Cautions" value={`${issueCount}`} note="agent checks" />
      </Box>

      <Box sx={{ mt: 1, display: 'flex', gap: 0.65, flexWrap: 'nowrap', '& .MuiButton-root': { flex: '1 1 0', minWidth: 0, px: 0.8 } }}>
        <Button
          size="small"
          variant={activePlan ? 'outlined' : 'contained'}
          onClick={() => void onGeneratePlan()}
          disabled={isGenerating}
          startIcon={<SparkleIcon sx={{ fontSize: 15 }} />}
          sx={{ minHeight: 30, borderRadius: '8px', textTransform: 'none', fontWeight: 800 }}
        >
          {isGenerating ? 'Analyzing...' : activePlan ? 'Re-analyze' : 'Analyze'}
        </Button>
        {comparisonSession ? (
          <Button
            size="small"
            variant="outlined"
            onClick={onComparePlans}
            disabled={compareDisabled}
            startIcon={<CompareArrowsIcon sx={{ fontSize: 15 }} />}
            sx={{ minHeight: 30, borderRadius: '8px', textTransform: 'none', fontWeight: 800 }}
          >
            Compare
          </Button>
        ) : null}
        <Button
          size="small"
          variant="contained"
          onClick={onReviewPlan}
          disabled={!canReview || reviewDisabled}
          startIcon={<FactCheckIcon sx={{ fontSize: 15 }} />}
          sx={{ minHeight: 30, borderRadius: '8px', textTransform: 'none', fontWeight: 800, boxShadow: 'none', bgcolor: tokenBrand.main, '&:hover': { bgcolor: tokenBrand.dark, boxShadow: 'none' } }}
        >
          Review
        </Button>
      </Box>
    </Paper>
  );
}

function suggestionsFallbackCount(plan: PlannerAiPlanVariant | null) {
  return plan?.actions.length ?? 0;
}

function ChatScenarioSupport({ activePlan, comparisonSession, selectedActionCount, isLoading, onAsk }: ChatScenarioSupportProps) {
  const prompts = activePlan
    ? [
        `Explain why ${activePlan.strategyLabel} is recommended before I review it.`,
        `What should I check before applying the ${selectedActionCount} selected changes?`,
        'Which blockers or agent cautions could change this recommendation?',
      ]
    : [
        'What signals are driving the recommended weekly scenario?',
        'Which assets should I compare before choosing a strategy?',
        'What data is missing before I can apply a plan?',
      ];

  return (
    <Paper elevation={0} sx={{ borderRadius: '12px', border: `1px solid ${tokenDivider}`, p: 1.25 }}>
      <Typography sx={{ color: tokenText.primary, fontSize: '0.8rem', fontWeight: 900 }}>
        Ask about the recommendation scenario
      </Typography>
      <Typography sx={{ mt: 0.35, color: tokenText.secondary, fontSize: '0.7rem', lineHeight: 1.45 }}>
        The chat follows the same Analyze, Review, and Apply workflow as Strategy Comparison.
        {comparisonSession ? ` ${comparisonSession.variants.length} strategies are in context.` : ' Run Analyze to add strategy comparison context.'}
      </Typography>
      <Box sx={{ mt: 0.9, display: 'grid', gap: 0.55 }}>
        {prompts.map((prompt) => (
          <Button
            key={prompt}
            size="small"
            variant="outlined"
            disabled={isLoading}
            onClick={() => void onAsk(prompt)}
            sx={{ justifyContent: 'flex-start', minHeight: 30, borderRadius: '8px', textTransform: 'none', fontWeight: 700, fontSize: '0.72rem' }}
          >
            {prompt}
          </Button>
        ))}
      </Box>
    </Paper>
  );
}

function FeasibilityPreview({ activePlan }: { activePlan: PlannerAiPlanVariant | null }) {
  if (!activePlan) {
    return null;
  }
  const reviewItems = activePlan.feasibilityChecklist.filter((item) => item.status !== 'pass').slice(0, 3);
  const items = reviewItems.length ? reviewItems : activePlan.feasibilityChecklist.slice(0, 3);
  return (
    <Paper elevation={0} sx={{ borderRadius: '12px', border: `1px solid ${tokenDivider}`, p: 1.25 }}>
      <Typography sx={{ color: tokenText.primary, fontSize: '0.8rem', fontWeight: 900 }}>
        Review checkpoints
      </Typography>
      <Box sx={{ mt: 0.8, display: 'grid', gap: 0.65 }}>
        {items.map((item) => {
          const tone = getFeasibilityTone(item.status);
          return (
            <Box key={item.id} sx={{ p: 0.85, borderRadius: '10px', border: `1px solid ${tone.border}`, bgcolor: tone.bg }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.45, color: tone.color }}>
                {tone.icon}
                <Typography sx={{ color: tokenText.primary, fontSize: '0.72rem', fontWeight: 900 }}>
                  {item.label}
                </Typography>
              </Box>
              <Typography sx={{ mt: 0.3, color: tokenText.secondary, fontSize: '0.69rem', lineHeight: 1.45 }}>
                {item.detail}
              </Typography>
              {item.resolutionHint ? (
                <Typography sx={{ mt: 0.25, color: tone.color, fontSize: '0.67rem', lineHeight: 1.4, fontWeight: 700 }}>
                  Next step: {item.resolutionHint}
                </Typography>
              ) : null}
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
}

function getActionSlotLabel(action: PlannerAiPlanAction) {
  if (action.kind === 'promote-follow-up-request') {
    return `Queue - ${action.line}`;
  }
  return `Day ${action.recommendedDay + 1} - ${action.recommendedShift === 'day' ? 'AM' : 'PM'}`;
}

function getActionKindLabel(action: PlannerAiPlanAction) {
  if (action.kind === 'reschedule-card') {
    return 'Reschedule';
  }
  if (action.kind === 'schedule-planning-item') {
    return 'Schedule';
  }
  return 'Promote';
}

function ReviewApplySupport({
  activePlan,
  suggestions,
  selectedActionCount,
  selectedActionIds,
  canReview,
  reviewDisabled,
  compareDisabled,
  isGenerating,
  onReviewPlan,
  onComparePlans,
  onGeneratePlan,
  onToggleAction,
  onSelectAllActions,
  onClearActionSelection,
  onApplySelectedActions,
}: ReviewApplySupportProps) {
  const actions = activePlan?.actions ?? [];
  const hasActions = actions.length > 0;
  const allSelected = hasActions && selectedActionCount === actions.length;

  return (
    <Paper elevation={0} sx={{ borderRadius: '12px', border: `1px solid ${tokenDivider}`, p: 1.25 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ color: tokenText.primary, fontSize: '0.8rem', fontWeight: 900 }}>
            Select changes to apply
          </Typography>
          <Typography sx={{ mt: 0.35, color: tokenText.secondary, fontSize: '0.7rem', lineHeight: 1.45 }}>
            Choose which recommended changes should update the Maintenance Planner Calendar and KPI rollups.
          </Typography>
        </Box>
        <Box sx={{ color: tokenBrand.main, fontSize: '0.68rem', fontWeight: 900, whiteSpace: 'nowrap', pt: 0.1 }}>
          {selectedActionCount}/{actions.length || suggestions.length} selected
        </Box>
      </Box>

      {hasActions ? (
        <Box sx={{ mt: 0.9, display: 'flex', gap: 0.6, flexWrap: 'wrap' }}>
          <Button
            size="small"
            variant="outlined"
            onClick={allSelected ? onClearActionSelection : onSelectAllActions}
            sx={{ minHeight: 28, borderRadius: '8px', textTransform: 'none', fontWeight: 800, fontSize: '0.7rem' }}
          >
            {allSelected ? 'Clear all' : 'Select all'}
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={onReviewPlan}
            disabled={!canReview || reviewDisabled}
            sx={{ minHeight: 28, borderRadius: '8px', textTransform: 'none', fontWeight: 800, fontSize: '0.7rem' }}
          >
            Open review
          </Button>
        </Box>
      ) : null}

      <Box sx={{ mt: 0.9, display: 'grid', gap: 0.65 }}>
        {hasActions ? actions.map((action) => {
          const selected = selectedActionIds.includes(action.id);
          return (
            <Box
              key={action.id}
              onClick={() => onToggleAction(action.id)}
              sx={{
                display: 'grid',
                gridTemplateColumns: 'auto 1fr',
                gap: 0.75,
                p: 0.85,
                borderRadius: '10px',
                border: `1px solid ${selected ? tokenBrand.main : tokenDivider}`,
                bgcolor: selected ? '#EFF6FF' : 'background.paper',
                cursor: 'pointer',
              }}
            >
              <Checkbox
                checked={selected}
                size="small"
                tabIndex={-1}
                disableRipple
                sx={{ p: 0, mt: -0.15, color: tokenBrand.main, '&.Mui-checked': { color: tokenBrand.main } }}
              />
              <Box sx={{ minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 0.75 }}>
                  <Typography sx={{ color: tokenText.primary, fontSize: '0.72rem', fontWeight: 900, lineHeight: 1.25 }}>
                    {action.asset} - {action.workOrderLabel}
                  </Typography>
                  <Typography sx={{ color: tokenBrand.main, fontSize: '0.65rem', fontWeight: 900, whiteSpace: 'nowrap' }}>
                    {getActionSlotLabel(action)}
                  </Typography>
                </Box>
                <Typography sx={{ mt: 0.2, color: tokenText.secondary, fontSize: '0.67rem', lineHeight: 1.4 }}>
                  {getActionKindLabel(action)} - {action.reason}
                </Typography>
              </Box>
            </Box>
          );
        }) : (
          <Alert severity="info" sx={{ borderRadius: '10px', py: 0.6, '& .MuiAlert-message': { fontSize: '0.72rem' } }}>
            Run Analyze to load recommended changes before applying them.
          </Alert>
        )}
      </Box>

      <Box sx={{ mt: 1, display: 'grid', gap: 0.65 }}>
        <Button
          size="small"
          variant="contained"
          onClick={onApplySelectedActions}
          disabled={!canReview || reviewDisabled || selectedActionCount === 0}
          startIcon={<FactCheckIcon sx={{ fontSize: 15 }} />}
          sx={{ minHeight: 34, borderRadius: '8px', textTransform: 'none', fontWeight: 900, boxShadow: 'none', bgcolor: tokenBrand.main, '&:hover': { bgcolor: tokenBrand.dark, boxShadow: 'none' } }}
        >
          Apply {selectedActionCount} selected change{selectedActionCount === 1 ? '' : 's'}
        </Button>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.65 }}>
          <Button
            size="small"
            variant="outlined"
            onClick={onComparePlans}
            disabled={compareDisabled}
            sx={{ minHeight: 30, borderRadius: '8px', textTransform: 'none', fontWeight: 800 }}
          >
            Compare
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => void onGeneratePlan()}
            disabled={isGenerating}
            sx={{ minHeight: 30, borderRadius: '8px', textTransform: 'none', fontWeight: 800 }}
          >
            {isGenerating ? 'Analyzing...' : 'Refresh'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}

export function PlannerAiCopilotPanel({
  assistantHorizon,
  workflowStep,
  comparisonSession,
  generatedPlan,
  reviewPlan,
  reviewPlanSource,
  followUpBacklogSummary,
  selectedActionCount,
  selectedActionIds,
  isGenerating,
  isCopilotLoading,
  isWhatIfLoading,
  isPreviewOpen,
  isCompareOpen,
  compareDialogTab,
  isCascadePreviewOpen,
  messages,
  insights,
  proactiveContext,
  suggestions,
  quickPrompts,
  whatIfScenarios,
  whatIfResult,
  draggedSuggestionId,
  onGeneratePlan,
  onReviewPlan,
  onComparePlans,
  onToggleAction,
  onSelectAllActions,
  onClearActionSelection,
  onApplySelectedActions,
  onSendMessage,
  onRunQuickPrompt,
  onRunWhatIf,
  onClearWhatIf,
  onSuggestionAction,
  onSuggestionDragStart,
  onSuggestionDragEnd,
  onReviewSuggestion,
  onAddWhatIfToReview,
  onInsightLink,
  undoSnapshot = null,
  activeHorizonImpact = null,
  onUndoLastChange,
}: PlannerAiCopilotPanelProps) {
  const hasGeneratedPlan = Boolean(generatedPlan);
  const hasReviewPlan = Boolean(reviewPlan);
  const canReview = hasGeneratedPlan || hasReviewPlan;
  const activePlan = getActivePlan(generatedPlan, reviewPlan);
  const commandBarMessage = getCommandBarMessage(
    proactiveContext,
    isCopilotLoading,
    generatedPlan,
    reviewPlan,
    selectedActionCount,
  );
  const emphasizeAnalyzeCta = Boolean(proactiveContext?.hasBetterPlan && !canReview);
  const reviewDisabled = !canReview || isGenerating || isCascadePreviewOpen;
  const compareDisabled = !comparisonSession?.variants.length || isGenerating || isCascadePreviewOpen || hasReviewPlan;
  const showAnalysisTabs = isCompareOpen || isPreviewOpen || canReview;

  const signalCount = useMemo(
    () =>
      followUpBacklogSummary.openRequestCount +
      followUpBacklogSummary.blockedByPartsCount +
      insights.length,
    [followUpBacklogSummary.blockedByPartsCount, followUpBacklogSummary.openRequestCount, insights.length],
  );

  const [hasManuallyClosed, setHasManuallyClosed] = useState(() => {
    return sessionStorage.getItem('blu_copilot_manually_closed') === 'true';
  });

  const updateManuallyClosed = (val: boolean) => {
    setHasManuallyClosed(val);
    sessionStorage.setItem('blu_copilot_manually_closed', String(val));
  };

  const [drawerOpen, setDrawerOpen] = useState(() => {
    const defaultOpen = getDefaultDrawerOpen(workflowStep, canReview, isCompareOpen, isPreviewOpen);
    const manuallyClosed = sessionStorage.getItem('blu_copilot_manually_closed') === 'true';
    return defaultOpen && !manuallyClosed;
  });
  const [activeTab, setActiveTab] = useState<CopilotTab>('signals');
  const currentTab = showAnalysisTabs ? activeTab : 'chat';
  const [hasRevealedAnalysis, setHasRevealedAnalysis] = useState(() => canReview || isCompareOpen || isPreviewOpen || workflowStep > 1);
  const compareActiveVariant = activePlan ?? generatedPlan;

  const prevIsCompareOpen = useRef(isCompareOpen);
  const prevIsPreviewOpen = useRef(isPreviewOpen);
  const suppressAutoOpenRef = useRef(false);

  useEffect(() => {
    const wasInFlow = prevIsCompareOpen.current || prevIsPreviewOpen.current;
    const nowInFlow = isCompareOpen || isPreviewOpen;

    if (nowInFlow && !wasInFlow) {
      updateManuallyClosed(false);
    }
    prevIsCompareOpen.current = isCompareOpen;
    prevIsPreviewOpen.current = isPreviewOpen;
  }, [isCompareOpen, isPreviewOpen]);

  useEffect(() => {
    const inFlow = isCompareOpen || isPreviewOpen || workflowStep > 1;
    if (!inFlow) {
      suppressAutoOpenRef.current = false;
      return;
    }
    if (hasManuallyClosed) {
      return;
    }
    if (suppressAutoOpenRef.current) {
      setHasRevealedAnalysis(true);
      return;
    }
    setDrawerOpen(true);
    setHasRevealedAnalysis(true);
    if (isCompareOpen || isPreviewOpen) {
      setActiveTab('signals');
    }
  }, [workflowStep, isCompareOpen, isPreviewOpen, hasManuallyClosed]);

  useEffect(() => {
    if (canReview) {
      setHasRevealedAnalysis(true);
    }
  }, [canReview]);

  const handleGeneratePlan = async () => {
    suppressAutoOpenRef.current = true;
    setActiveTab('signals');
    await onGeneratePlan();
    setHasRevealedAnalysis(true);
  };

  const drawerSubtitle = isCompareOpen && compareActiveVariant
    ? `Step 1 compare - ${compareActiveVariant.strategyLabel} - ${getCompareDialogTabLabel(compareDialogTab)}`
    : `${getHorizonLabel(assistantHorizon)} recommendation support - chat, analysis, review, and apply`;

  const handleTabChange = (_event: SyntheticEvent, nextTab: CopilotTab) => {
    setActiveTab(nextTab);
  };

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          borderRadius: '12px',
          border: `1px solid ${tokenDivider}`,
          bgcolor: tokenNeutral.lightest,
          overflow: 'hidden',
        }}
      >
        <Box sx={{ px: 1.5, py: 1, display: 'grid', gap: 0.85 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.2, flexWrap: 'wrap' }}>
            <Box sx={{ minWidth: 0, flex: '1 1 320px' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
                <SparkleIcon sx={{ color: '#F97316', fontSize: 16 }} />
                <Typography sx={{ color: tokenBrand.main, fontSize: '0.84rem', fontWeight: 800 }}>
                  BLU.AI copilot
                </Typography>
              </Box>
              <Typography
                sx={{
                  mt: 0.4,
                  color: emphasizeAnalyzeCta ? tokenText.primary : tokenText.secondary,
                  fontSize: '0.74rem',
                  lineHeight: 1.45,
                  fontWeight: emphasizeAnalyzeCta ? 600 : 400,
                }}
              >
                {commandBarMessage}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.65, flexWrap: 'wrap' }}>
              <Button
                size="small"
                variant="outlined"
                onClick={() => {
                  setDrawerOpen(true);
                  updateManuallyClosed(false);
                }}
                startIcon={<ChatIcon sx={{ fontSize: 16 }} />}
                sx={{ minHeight: 32, borderRadius: '8px', textTransform: 'none', fontWeight: 700 }}
              >
                Open copilot
              </Button>
              {hasGeneratedPlan ? (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={onComparePlans}
                  disabled={compareDisabled}
                  sx={{ minHeight: 32, borderRadius: '8px', textTransform: 'none', fontWeight: 700 }}
                >
                  Compare
                </Button>
              ) : null}
              {canReview ? (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={onReviewPlan}
                  disabled={reviewDisabled}
                  sx={{ minHeight: 32, borderRadius: '8px', textTransform: 'none', fontWeight: 700, borderColor: tokenBrand.main, color: tokenBrand.main }}
                >
                  Review
                </Button>
              ) : null}
              <Button
                size="small"
                variant="contained"
                onClick={handleGeneratePlan}
                disabled={isGenerating || isCascadePreviewOpen}
                startIcon={<SparkleIcon sx={{ fontSize: 16 }} />}
                sx={{
                  minHeight: 32,
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontWeight: 800,
                  boxShadow: emphasizeAnalyzeCta ? '0 0 0 2px rgba(37, 99, 235, 0.18)' : 'none',
                  bgcolor: tokenBrand.main,
                  '&:hover': { bgcolor: tokenBrand.dark, boxShadow: emphasizeAnalyzeCta ? '0 0 0 2px rgba(37, 99, 235, 0.28)' : 'none' },
                }}
              >
                {isGenerating ? 'Analyzing...' : hasGeneratedPlan ? 'Re-analyze' : 'Analyze'}
              </Button>
            </Box>
          </Box>
        </Box>
      </Paper>

      {undoSnapshot || activeHorizonImpact ? (
        <Box sx={{ display: 'grid', gap: 0.75, mt: 0.85 }}>
          {activeHorizonImpact ? (
            <Alert severity="info" sx={{ border: `1px solid ${tokenDivider}`, alignItems: 'flex-start' }}>
              <Box sx={{ fontSize: '0.78rem', fontWeight: 800 }}>{activeHorizonImpact.title}</Box>
              <Box sx={{ mt: 0.15, fontSize: '0.74rem', lineHeight: 1.45 }}>{activeHorizonImpact.summary}</Box>
            </Alert>
          ) : null}
          {undoSnapshot && onUndoLastChange ? (
            <PlannerAiUndoBanner
              changeLabel={undoSnapshot.changeLabel}
              capturedAt={undoSnapshot.capturedAt}
              onUndo={onUndoLastChange}
            />
          ) : null}
        </Box>
      ) : null}

      <PlannerAiCopilotDrawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          updateManuallyClosed(true);
        }}
        subtitle={drawerSubtitle}
      >
        <Box sx={{ display: 'grid', gap: 1.1 }}>
          {!hasRevealedAnalysis ? (
            <RecommendationScenarioCard
              activePlan={activePlan}
              comparisonSession={comparisonSession}
              selectedActionCount={selectedActionCount}
              isGenerating={isGenerating}
              canReview={canReview}
              reviewDisabled={reviewDisabled}
              compareDisabled={compareDisabled}
              onGeneratePlan={handleGeneratePlan}
              onReviewPlan={onReviewPlan}
              onComparePlans={onComparePlans}
            />
          ) : null}

          {hasRevealedAnalysis && (generatedPlan ?? reviewPlan ?? whatIfResult) ? (
            <PlannerAiAgentSummaryStrip
              generatedPlan={generatedPlan}
              reviewPlan={reviewPlan}
              reviewPlanSource={reviewPlanSource}
              whatIfResult={whatIfResult}
              isCompareMode={isCompareOpen && !reviewPlan}
            />
          ) : null}

          {hasRevealedAnalysis && showAnalysisTabs ? (
            <Tabs
              value={currentTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                minHeight: 36,
                borderBottom: `1px solid ${tokenDivider}`,
                '& .MuiTab-root': {
                  minHeight: 36,
                  py: 0.5,
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '0.76rem',
                },
              }}
            >
              <Tab value="chat" label="Chat" />
              <Tab value="signals" label={`Analyze (${signalCount})`} />
              <Tab value="actions" label={`Review & apply (${suggestions.length})`} />
            </Tabs>
          ) : null}

          {hasRevealedAnalysis && currentTab === 'chat' ? (
            <Box sx={{ display: 'grid', gap: 1.1 }}>
              <ChatScenarioSupport
                activePlan={activePlan}
                comparisonSession={comparisonSession}
                selectedActionCount={selectedActionCount}
                isLoading={isCopilotLoading}
                onAsk={onSendMessage}
              />
              <PlannerAiConversation
                messages={messages}
                quickPrompts={quickPrompts}
                isLoading={isCopilotLoading}
                onSendMessage={onSendMessage}
                onRunQuickPrompt={onRunQuickPrompt}
                placeholder={`Ask BLU.AI about the ${activePlan ? activePlan.strategyLabel : getHorizonLabel(assistantHorizon).toLowerCase()} recommendation...`}
              />
            </Box>
          ) : null}

          {hasRevealedAnalysis && currentTab === 'signals' ? (
            <Box sx={{ display: 'grid', gap: 1.1 }}>
              <RecommendationScenarioCard
                activePlan={activePlan}
                comparisonSession={comparisonSession}
                selectedActionCount={selectedActionCount}
                isGenerating={isGenerating}
                canReview={canReview}
                reviewDisabled={reviewDisabled}
                compareDisabled={compareDisabled}
                onGeneratePlan={handleGeneratePlan}
                onReviewPlan={onReviewPlan}
                onComparePlans={onComparePlans}
              />
              {isCompareOpen && compareActiveVariant && comparisonSession ? (
                <PlannerAiCompareDrawerContext
                  compareTab={compareDialogTab}
                  activeVariant={compareActiveVariant}
                  allVariants={comparisonSession.variants}
                />
              ) : null}
              <FeasibilityPreview activePlan={activePlan} />
              <PlannerAiFollowUpBacklogPanel backlogSummary={followUpBacklogSummary} compact />
            </Box>
          ) : null}

          {hasRevealedAnalysis && currentTab === 'actions' ? (
            <Box sx={{ display: 'grid', gap: 1.1 }}>
              <ReviewApplySupport
                activePlan={activePlan}
                suggestions={suggestions}
                selectedActionCount={selectedActionCount}
                selectedActionIds={selectedActionIds}
                canReview={canReview}
                reviewDisabled={reviewDisabled}
                compareDisabled={compareDisabled}
                isGenerating={isGenerating}
                onReviewPlan={onReviewPlan}
                onComparePlans={onComparePlans}
                onGeneratePlan={handleGeneratePlan}
                onToggleAction={onToggleAction}
                onSelectAllActions={onSelectAllActions}
                onClearActionSelection={onClearActionSelection}
                onApplySelectedActions={onApplySelectedActions}
              />
              <FeasibilityPreview activePlan={activePlan} />
              <Paper elevation={0} sx={{ borderRadius: '12px', border: `1px solid ${tokenDivider}`, p: 1.4 }}>
                <Typography sx={{ color: tokenText.primary, fontSize: '0.8rem', fontWeight: 800 }}>
                  Actionable suggestions
                </Typography>
                <Typography sx={{ mt: 0.25, color: tokenText.secondary, fontSize: '0.7rem' }}>
                  {comparisonSession ? `${comparisonSession.variants.length} strategies loaded` : 'Run Analyze to load strategies'}
                </Typography>
                <Box sx={{ mt: 0.85, display: 'grid', gap: 0.75 }}>
                  {suggestions.map((suggestion) => (
                    <PlannerAiSuggestionCard
                      key={suggestion.id}
                      suggestion={suggestion}
                      isDragging={draggedSuggestionId === suggestion.id}
                      onPrimaryAction={onSuggestionAction}
                      onReviewSuggestion={onReviewSuggestion}
                      onDragStart={onSuggestionDragStart}
                      onDragEnd={onSuggestionDragEnd}
                    />
                  ))}
                </Box>
              </Paper>
              <PlannerAiWhatIfPanel
                scenarios={whatIfScenarios}
                result={whatIfResult}
                isLoading={isWhatIfLoading}
                onRunScenario={onRunWhatIf}
                onClearResult={onClearWhatIf}
                onAddToReview={onAddWhatIfToReview}
              />
            </Box>
          ) : null}
        </Box>
      </PlannerAiCopilotDrawer>
    </>
  );
}
