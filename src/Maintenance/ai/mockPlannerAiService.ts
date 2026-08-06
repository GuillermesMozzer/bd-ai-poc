import {
  generatePlannerAiComparisonSession,
  generatePlannerAiCopilotSnapshot,
  generatePlannerAiPlan,
  generatePlannerAiSuggestions,
  generatePlannerAiWhatIfResult,
} from './generatePlannerAiPlan';
import type {
  PlannerAiAssistantHorizon,
  PlannerAiCalendarCardInput,
  PlannerAiCopilotSnapshot,
  PlannerAiCopilotSuggestion,
  PlannerAiComparisonSession,
  PlannerAiPlan,
  PlannerAiPlannerSnapshot,
  PlannerAiPlanVariant,
  PlannerAiPlanningItemInput,
  PlannerAiWhatIfResult,
  PlannerAiWhatIfScenario,
} from './types';

type PlannerAiRequestInput = {
  snapshot?: PlannerAiPlannerSnapshot;
  cards?: PlannerAiCalendarCardInput[];
  planningItems?: PlannerAiPlanningItemInput[];
};

type PlannerAiCopilotRequestInput = PlannerAiRequestInput & {
  horizon: PlannerAiAssistantHorizon;
  activePlan?: PlannerAiPlanVariant | null;
};

async function simulatePlannerAiLatency() {
  const startedAt = Date.now();
  const simulatedLatencyMs = 520 + Math.round(Math.random() * 360);

  await new Promise((resolve) => window.setTimeout(resolve, simulatedLatencyMs));

  return {
    generatedAt: new Date().toLocaleString(),
    generationDurationMs: Date.now() - startedAt,
  };
}

export async function requestMockPlannerAiPlan({
  snapshot,
  cards,
  planningItems,
}: PlannerAiRequestInput): Promise<PlannerAiPlan> {
  const generation = await simulatePlannerAiLatency();

  return generatePlannerAiPlan({
    snapshot,
    cards,
    planningItems,
    generatedAt: generation.generatedAt,
    generationDurationMs: generation.generationDurationMs,
  });
}

export async function requestMockPlannerAiComparisonSession({
  snapshot,
  cards,
  planningItems,
}: PlannerAiRequestInput): Promise<PlannerAiComparisonSession> {
  const generation = await simulatePlannerAiLatency();

  return generatePlannerAiComparisonSession({
    snapshot,
    cards,
    planningItems,
    generatedAt: generation.generatedAt,
    generationDurationMs: generation.generationDurationMs,
  });
}

export async function requestMockPlannerAiInsights({
  snapshot,
  cards,
  planningItems,
  horizon,
  question,
  activePlan,
}: PlannerAiCopilotRequestInput & { question?: string }): Promise<PlannerAiCopilotSnapshot> {
  await simulatePlannerAiLatency();

  return generatePlannerAiCopilotSnapshot({
    snapshot,
    cards,
    planningItems,
    horizon,
    question,
    activePlan,
  });
}

export async function requestMockPlannerAiSuggestions({
  snapshot,
  cards,
  planningItems,
  horizon,
  activePlan,
}: PlannerAiCopilotRequestInput): Promise<PlannerAiCopilotSuggestion[]> {
  await simulatePlannerAiLatency();

  return generatePlannerAiSuggestions({
    snapshot,
    cards,
    planningItems,
    horizon,
    activePlan,
  });
}

export async function requestMockPlannerAiWhatIf({
  snapshot,
  cards,
  planningItems,
  horizon,
  scenario,
}: PlannerAiCopilotRequestInput & {
  scenario: PlannerAiWhatIfScenario;
}): Promise<PlannerAiWhatIfResult> {
  await simulatePlannerAiLatency();

  return generatePlannerAiWhatIfResult({
    snapshot,
    cards,
    planningItems,
    horizon,
    scenario,
  });
}
