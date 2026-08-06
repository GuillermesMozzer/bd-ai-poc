import type {
  AgentChatMessage,
  AgentQuickReply,
  AgentReasoningItem,
  PlanningAgentAction,
  PlanningAgentAdvanceResult,
  PlanningAgentContext,
  PlanningAgentPhase,
  PlanningAgentState,
  PlannedWorkOrder,
} from './types';

let messageCounter = 0;

function nextMessageId() {
  messageCounter += 1;
  return `planning-agent-msg-${messageCounter}`;
}

function timestampLabel() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function createMessage(
  role: AgentChatMessage['role'],
  kind: AgentChatMessage['kind'],
  options: Partial<AgentChatMessage> = {},
): AgentChatMessage {
  return {
    id: nextMessageId(),
    role,
    kind,
    timestamp: timestampLabel(),
    ...options,
  };
}

function criticalityLabel(grade: 'A' | 'B' | 'C') {
  if (grade === 'A') return 'high criticality';
  if (grade === 'B') return 'medium criticality';
  return 'lower criticality';
}

function buildInitialPlannedWorkOrder(ctx: PlanningAgentContext): Partial<PlannedWorkOrder> {
  return {
    action: 'create',
    title: ctx.cardTitle,
    description: ctx.requestDetails.problemDescription,
    maintenanceType: ctx.requestDetails.maintenanceType,
    equipment: ctx.requestDetails.equipment,
    equipmentCriticality: ctx.equipmentCriticality,
    priority: ctx.requestDetails.priority,
    riskAssessment: ctx.requestDetails.riskAssessment,
    spareParts: ctx.spareParts.filter((part) => part.stockState !== 'out-of-stock').slice(0, 3),
    safetyRequirements: ctx.defaultSafetyPlan,
    qualityRequirements: ctx.defaultQualityPlan,
    executionDay: ctx.defaultExecutionDay,
    linkedRequestId: ctx.requestDetails.requestId,
    linkedRequestCardId: ctx.requestCardId,
    source: ctx.source,
    status: 'Scheduled',
  };
}

export function reviewReasoning(ctx: PlanningAgentContext): AgentReasoningItem[] {
  const reasons: AgentReasoningItem[] = [
    {
      label: `This asset is classified as ${criticalityLabel(ctx.equipmentCriticality)}.`,
      tone: ctx.equipmentCriticality === 'A' ? 'critical' : 'info',
    },
    {
      label: `Reported issue: ${ctx.requestDetails.problemDescription}`,
      tone: 'info',
    },
    {
      label: `Downtime risk is ${ctx.requestDetails.riskAssessment.downtime.toLowerCase()}, quality impact is ${ctx.requestDetails.riskAssessment.quality.toLowerCase()}, and safety risk is ${ctx.requestDetails.riskAssessment.ehs.toLowerCase()}.`,
      tone: ctx.requestDetails.riskAssessment.downtime === 'High' ? 'warning' : 'info',
    },
    {
      label: `Suggested priority: ${ctx.requestDetails.priority}.`,
      tone: ctx.requestDetails.priority === 'Emergency' || ctx.requestDetails.priority === 'Immediate' ? 'critical' : 'info',
    },
  ];

  if (ctx.upcomingPmNote) {
    reasons.push({ label: ctx.upcomingPmNote, tone: 'positive' });
  }

  return reasons;
}

export function recommendActionReasoning(ctx: PlanningAgentContext): AgentReasoningItem[] {
  const pmCandidate = ctx.linkedWorkCandidates.find((candidate) => candidate.type === 'Preventive');
  const relatedCandidate = ctx.linkedWorkCandidates.find((candidate) =>
    candidate.title.toLowerCase().includes(ctx.cardTitle.toLowerCase().split(' ')[0]),
  ) ?? ctx.linkedWorkCandidates[0];

  const reasons: AgentReasoningItem[] = [];

  if (pmCandidate) {
    reasons.push({
      label: `There is a PM already scheduled for this equipment on ${pmCandidate.scheduledFor}.`,
      tone: 'positive',
    });
    reasons.push({
      label: 'This request can likely be combined with the existing PM to avoid additional downtime.',
      tone: 'positive',
    });
  }

  if (relatedCandidate && relatedCandidate.id !== pmCandidate?.id) {
    reasons.push({
      label: `${relatedCandidate.title} is already in ${relatedCandidate.status.toLowerCase()} for a related intervention.`,
      tone: 'info',
    });
  }

  if (!reasons.length) {
    reasons.push({
      label: 'No overlapping preventive or corrective work was found. A new Work Order is the safest planning path.',
      tone: 'info',
    });
  }

  return reasons;
}

export function executionWindowReasoning(
  ctx: PlanningAgentContext,
  optionId?: string,
): AgentReasoningItem[] {
  const selected =
    ctx.schedulingOptions.find((option) => option.id === optionId) ??
    ctx.schedulingOptions.find((option) => option.recommended) ??
    ctx.schedulingOptions[0];

  const reasons: AgentReasoningItem[] = [];

  ctx.productionWindows.forEach((window) => {
    reasons.push({ label: window, tone: 'info' });
  });

  if (selected) {
    reasons.push({
      label: `Recommended window: ${selected.windowLabel}. ${selected.description}`,
      tone: 'positive',
    });
    if (selected.productionNote) {
      reasons.push({ label: selected.productionNote, tone: 'info' });
    }
  }

  const availableParts = ctx.spareParts.filter((part) => part.stockState === 'in-stock').length;
  if (availableParts > 0) {
    reasons.push({
      label: `${availableParts} required spare part${availableParts === 1 ? '' : 's'} ${availableParts === 1 ? 'is' : 'are'} available in stock.`,
      tone: 'positive',
    });
  }

  const shortage = ctx.spareParts.find((part) => part.stockState !== 'in-stock');
  if (shortage) {
    reasons.push({
      label: `${shortage.description} is constrained (${shortage.stockState.replace('-', ' ')}).`,
      tone: 'warning',
    });
  }

  return reasons;
}

export function sparePartsReasoning(ctx: PlanningAgentContext): AgentReasoningItem[] {
  return ctx.spareParts.map((part) => ({
    label:
      part.stockState === 'in-stock'
        ? `${part.description} is available in stock (${part.availableQuantity} on hand).`
        : part.stockState === 'low-stock'
          ? `${part.description} is low stock (${part.availableQuantity} available, ${part.requestedQuantity} requested).`
          : `${part.description} is out of stock and may delay scheduling.`,
    tone: part.stockState === 'in-stock' ? 'positive' : part.stockState === 'low-stock' ? 'warning' : 'critical',
  }));
}

export function technicianReasoning(ctx: PlanningAgentContext, technicianId?: string): AgentReasoningItem[] {
  const recommended =
    ctx.technicians.find((technician) => technician.id === technicianId) ??
    ctx.technicians.find((technician) => technician.recommended) ??
    ctx.technicians[0];

  const reasons: AgentReasoningItem[] = ctx.technicians.map((technician) => ({
    label: technician.assigned
      ? `${technician.name} is already assigned (${technician.status}).`
      : `${technician.name}: ${technician.status}${technician.skills?.length ? ` • Skills: ${technician.skills.join(', ')}` : ''}.`,
    tone: technician.recommended ? 'positive' : technician.assigned ? 'warning' : 'info',
  }));

  if (recommended) {
    reasons.push({
      label: `Recommended assignment: ${recommended.name}${recommended.workloadSummary ? ` — ${recommended.workloadSummary}` : ''}.`,
      tone: 'positive',
    });
  }

  return reasons;
}

export function safetyQualityReasoning(ctx: PlanningAgentContext): AgentReasoningItem[] {
  const reasons: AgentReasoningItem[] = [
    {
      label: ctx.defaultSafetyPlan.lotoRequired
        ? 'Safety lockout requirements should be added before scheduling.'
        : 'Standard safety checks are sufficient for this activity.',
      tone: ctx.defaultSafetyPlan.lotoRequired ? 'warning' : 'info',
    },
    {
      label: ctx.defaultQualityPlan.qualityImpacting
        ? 'Quality verification and evidence capture should be added before scheduling.'
        : 'No additional quality validation is required beyond standard checks.',
      tone: ctx.defaultQualityPlan.qualityImpacting ? 'warning' : 'info',
    },
  ];

  ctx.defaultSafetyPlan.requirements.slice(0, 3).forEach((requirement) => {
    reasons.push({ label: `Safety: ${requirement}`, tone: 'info' });
  });

  ctx.defaultQualityPlan.requirements.slice(0, 3).forEach((requirement) => {
    reasons.push({ label: `Quality: ${requirement}`, tone: 'info' });
  });

  return reasons;
}

function getRecommendedAction(ctx: PlanningAgentContext): PlanningAgentAction {
  const pmCandidate = ctx.linkedWorkCandidates.find((candidate) => candidate.type === 'Preventive');
  if (pmCandidate && ctx.equipmentCriticality !== 'C') return 'link-pm';
  const mergeCandidate = ctx.linkedWorkCandidates.find((candidate) => candidate.status === 'Planning');
  if (mergeCandidate) return 'merge';
  return 'create';
}

function getRecommendedSchedulingOption(ctx: PlanningAgentContext) {
  return ctx.schedulingOptions.find((option) => option.recommended) ?? ctx.schedulingOptions[0];
}

function getRecommendedTechnician(ctx: PlanningAgentContext) {
  return ctx.technicians.find((technician) => technician.recommended && !technician.assigned) ?? ctx.technicians.find((technician) => !technician.assigned);
}

function getLinkedCandidateForAction(ctx: PlanningAgentContext, action: PlanningAgentAction) {
  if (action === 'link-pm') {
    return ctx.linkedWorkCandidates.find((candidate) => candidate.type === 'Preventive');
  }
  if (action === 'merge') {
    return ctx.linkedWorkCandidates.find((candidate) => candidate.status === 'Planning' || candidate.status === 'Scheduled');
  }
  return undefined;
}

function parseActionIntent(input: string, ctx: PlanningAgentContext): PlanningAgentAction | undefined {
  const normalized = input.toLowerCase();
  if (/(link|pm|preventive|combine|merge with pm)/.test(normalized)) return 'link-pm';
  if (/(merge|attach|existing wo|existing work)/.test(normalized)) return 'merge';
  if (/(new wo|new work order|create)/.test(normalized)) return 'create';

  const option = ctx.linkedWorkCandidates.find((candidate) => normalized.includes(candidate.id.toLowerCase()));
  if (option?.type === 'Preventive') return 'link-pm';
  if (option) return 'merge';

  return undefined;
}

function parseSchedulingIntent(input: string, ctx: PlanningAgentContext): string | undefined {
  const normalized = input.toLowerCase();
  const matched = ctx.schedulingOptions.find(
    (option) =>
      normalized.includes(option.id) ||
      normalized.includes(option.title.toLowerCase()) ||
      normalized.includes(option.windowLabel.toLowerCase()),
  );
  if (matched) return matched.id;
  if (/wednesday|option 1|together|pm/.test(normalized)) return ctx.schedulingOptions[0]?.id;
  if (/immediate|urgent|now|option 2/.test(normalized)) return ctx.schedulingOptions[1]?.id;
  if (/tomorrow|lower production|option 3/.test(normalized)) return ctx.schedulingOptions[2]?.id;
  return undefined;
}

function parseTechnicianIntent(input: string, ctx: PlanningAgentContext): string | undefined {
  const normalized = input.toLowerCase();
  const matched = ctx.technicians.find((technician) => normalized.includes(technician.name.toLowerCase()));
  if (matched) return matched.id;
  if (/recommend|suggest/.test(normalized)) return getRecommendedTechnician(ctx)?.id;
  return undefined;
}

function isAffirmative(input: string) {
  return /^(yes|yep|confirm|proceed|approve|create|go ahead|looks good|ok|okay)\b/i.test(input.trim());
}

function isNegative(input: string) {
  return /^(no|not yet|wait|change|edit|back|revise)\b/i.test(input.trim());
}

function wantsToRevise(input: string) {
  return /(change|edit|revise|back|restart|review again)/i.test(input);
}

function phaseQuickReplies(phase: PlanningAgentPhase, ctx: PlanningAgentContext, state: PlanningAgentState): AgentQuickReply[] {
  switch (phase) {
    case 'review':
      return [
        { id: 'review-continue', label: 'Continue planning', value: 'Continue planning' },
        { id: 'review-priority', label: 'Why this priority?', value: 'Why is this the suggested priority?' },
      ];
    case 'action': {
      const pm = ctx.linkedWorkCandidates.find((candidate) => candidate.type === 'Preventive');
      const merge = ctx.linkedWorkCandidates.find((candidate) => candidate.status === 'Planning');
      const replies: AgentQuickReply[] = [];
      if (pm) replies.push({ id: 'action-pm', label: 'Link to upcoming PM', value: `Link to ${pm.title}` });
      if (merge) replies.push({ id: 'action-merge', label: 'Merge with existing WO', value: `Merge with ${merge.title}` });
      replies.push({ id: 'action-create', label: 'Create new Work Order', value: 'Create a new Work Order' });
      return replies;
    }
    case 'window':
      return ctx.schedulingOptions.map((option) => ({
        id: `window-${option.id}`,
        label: option.recommended ? `${option.title} (recommended)` : option.title,
        value: option.title,
      }));
    case 'parts':
      return [
        { id: 'parts-confirm', label: 'Use recommended parts', value: 'Use the recommended spare parts' },
        { id: 'parts-review', label: 'Show shortages only', value: 'Show only constrained spare parts' },
      ];
    case 'technician':
      return ctx.technicians
        .filter((technician) => !technician.assigned)
        .slice(0, 3)
        .map((technician) => ({
          id: `tech-${technician.id}`,
          label: technician.recommended ? `${technician.name} (recommended)` : technician.name,
          value: `Assign ${technician.name}`,
        }));
    case 'safetyQuality':
      return [
        { id: 'sq-accept', label: 'Accept safety & quality plan', value: 'Accept the recommended safety and quality requirements' },
        { id: 'sq-add', label: 'Add lockout & QA checks', value: 'Add lockout and quality verification requirements' },
      ];
    case 'confirm':
      return [
        { id: 'confirm-yes', label: 'Confirm & create Work Order', value: 'Confirm and create the Work Order' },
        { id: 'confirm-no', label: 'Not yet', value: 'Not yet, I want to revise the plan' },
      ];
    default:
      return [];
  }
}

function buildReviewMessages(ctx: PlanningAgentContext): AgentChatMessage[] {
  const intro =
    ctx.source === 'request'
      ? `I'll help you review ${ctx.requestDetails.requestId} and prepare it for scheduling.`
      : `I'll help you complete planning for this Work Order and move it to Scheduling.`;

  return [
    createMessage('assistant', 'text', { content: intro }),
    createMessage('assistant', 'reasoning', {
      content: 'Here is what I found while reviewing this maintenance request:',
      reasons: reviewReasoning(ctx),
      isRecommendation: true,
    }),
    createMessage('assistant', 'requestDetails', {
      content: `${ctx.requestDetails.requestId} details`,
      payload: ctx.requestDetails,
    }),
  ];
}

function buildActionMessages(ctx: PlanningAgentContext, action: PlanningAgentAction): AgentChatMessage[] {
  const linked = getLinkedCandidateForAction(ctx, action);
  const actionLabel =
    action === 'link-pm'
      ? `Link this request to ${linked?.title ?? 'the upcoming PM'}`
      : action === 'merge'
        ? `Merge this request with ${linked?.title ?? 'an existing Work Order'}`
        : 'Create a new Work Order for this request';

  return [
    createMessage('assistant', 'recommendation', {
      content: `Recommended planning action: ${actionLabel}.`,
      reasons: recommendActionReasoning(ctx),
      isRecommendation: true,
      quickReplies: phaseQuickReplies('action', ctx, { phase: 'action', messages: [], plannedWorkOrder: {}, awaitingConfirmation: false }),
    }),
  ];
}

function buildWindowMessages(ctx: PlanningAgentContext, optionId?: string): AgentChatMessage[] {
  const option = ctx.schedulingOptions.find((item) => item.id === optionId) ?? getRecommendedSchedulingOption(ctx);
  return [
    createMessage('assistant', 'reasoning', {
      content: 'I checked production schedule, shutdowns, technician coverage, and spare parts readiness.',
      reasons: executionWindowReasoning(ctx, option?.id),
      isRecommendation: true,
    }),
    createMessage('assistant', 'schedulingOptions', {
      content: 'Here are the best execution windows I found:',
      payload: { options: ctx.schedulingOptions, selectedOptionId: option?.id },
    }),
  ];
}

function buildPartsMessages(ctx: PlanningAgentContext, onlyShortages = false): AgentChatMessage[] {
  const parts = onlyShortages ? ctx.spareParts.filter((part) => part.stockState !== 'in-stock') : ctx.spareParts;
  return [
    createMessage('assistant', 'reasoning', {
      content: onlyShortages
        ? 'These spare parts may constrain scheduling:'
        : 'I identified the spare parts likely required for this intervention:',
      reasons: sparePartsReasoning(ctx),
      isRecommendation: true,
    }),
    createMessage('assistant', 'spareParts', {
      payload: { parts },
    }),
  ];
}

function buildTechnicianMessages(ctx: PlanningAgentContext, technicianId?: string): AgentChatMessage[] {
  const technician = ctx.technicians.find((item) => item.id === technicianId) ?? getRecommendedTechnician(ctx);
  return [
    createMessage('assistant', 'reasoning', {
      content: `I reviewed technician skills, shifts, and workload for ${technician?.name ?? 'the recommended window'}.`,
      reasons: technicianReasoning(ctx, technician?.id),
      isRecommendation: true,
    }),
    createMessage('assistant', 'technicians', {
      payload: { technicians: ctx.technicians, selectedTechnicianId: technician?.id },
    }),
  ];
}

function buildSafetyQualityMessages(ctx: PlanningAgentContext): AgentChatMessage[] {
  return [
    createMessage('assistant', 'reasoning', {
      content: 'Based on the asset, activity type, and risk level, these safety and quality requirements are recommended:',
      reasons: safetyQualityReasoning(ctx),
      isRecommendation: true,
    }),
    createMessage('assistant', 'safetyQuality', {
      payload: {
        safety: ctx.defaultSafetyPlan,
        quality: ctx.defaultQualityPlan,
      },
    }),
  ];
}

function buildConfirmMessages(ctx: PlanningAgentContext, plan: Partial<PlannedWorkOrder>): AgentChatMessage[] {
  return [
    createMessage('assistant', 'planSummary', {
      content: 'Here is the planned Work Order ready for scheduling. Review the details before confirming:',
      payload: plan,
    }),
    createMessage('assistant', 'confirm', {
      content: 'Would you like me to create this Work Order and move it to Scheduling?',
      quickReplies: phaseQuickReplies('confirm', ctx, { phase: 'confirm', messages: [], plannedWorkOrder: plan, awaitingConfirmation: true }),
    }),
  ];
}

function buildSuccessMessages(plan: PlannedWorkOrder): AgentChatMessage[] {
  const windowLabel = plan.executionWindow?.windowLabel ?? plan.executionDay?.fullLabel ?? 'the selected window';
  const technicianLabel = plan.technician?.name ?? 'the recommended technician group';
  const linkLabel = plan.linkedWorkOrderOrPm ? `, linked to ${plan.linkedWorkOrderOrPm.title}` : '';

  return [
    createMessage('assistant', 'success', {
      content: `Work Order created successfully. Scheduled for ${windowLabel}${linkLabel} and assigned to ${technicianLabel}.`,
      payload: plan,
    }),
    createMessage('assistant', 'text', {
      content: 'The Work Order has been moved to Scheduling with spare parts, safety requirements, quality requirements, and risk assessment attached.',
      quickReplies: [
        { id: 'followup-pm', label: 'Review preventive maintenance alerts', value: 'Show preventive maintenance alerts' },
        { id: 'followup-shift', label: 'Shift schedule impact', value: 'What is the shift schedule impact?' },
      ],
    }),
  ];
}

export function createInitialState(ctx: PlanningAgentContext): PlanningAgentState {
  const plannedWorkOrder = buildInitialPlannedWorkOrder(ctx);
  const messages = buildReviewMessages(ctx);

  return {
    phase: 'review',
    messages,
    plannedWorkOrder,
    awaitingConfirmation: false,
    selectedSchedulingOptionId: getRecommendedSchedulingOption(ctx)?.id,
    selectedTechnicianId: getRecommendedTechnician(ctx)?.id,
  };
}

export function buildInitialMessages(ctx: PlanningAgentContext): AgentChatMessage[] {
  return createInitialState(ctx).messages;
}

function advanceFromReview(ctx: PlanningAgentContext, state: PlanningAgentState, input: string): PlanningAgentAdvanceResult {
  const userMessage = createMessage('user', 'text', { content: input });
  const action = getRecommendedAction(ctx);
  const linked = getLinkedCandidateForAction(ctx, action);
  const updatedPlan: Partial<PlannedWorkOrder> = {
    ...state.plannedWorkOrder,
    action,
    linkedWorkOrderOrPm: linked,
    executionWindow: getRecommendedSchedulingOption(ctx),
    technician: getRecommendedTechnician(ctx),
  };
  const assistantMessages = buildActionMessages(ctx, action);

  return {
    state: {
      ...state,
      phase: 'action',
      messages: [...state.messages, userMessage, ...assistantMessages],
      plannedWorkOrder: updatedPlan,
      awaitingConfirmation: false,
    },
    newMessages: [userMessage, ...assistantMessages],
  };
}

function advanceFromAction(ctx: PlanningAgentContext, state: PlanningAgentState, input: string): PlanningAgentAdvanceResult {
  const userMessage = createMessage('user', 'text', { content: input });
  const parsedAction = parseActionIntent(input, ctx) ?? state.plannedWorkOrder.action ?? getRecommendedAction(ctx);
  const linked = getLinkedCandidateForAction(ctx, parsedAction);
  const updatedPlan: Partial<PlannedWorkOrder> = {
    ...state.plannedWorkOrder,
    action: parsedAction,
    linkedWorkOrderOrPm: linked,
    executionWindow: getRecommendedSchedulingOption(ctx),
  };
  const assistantMessages = [
    createMessage('assistant', 'text', {
      content:
        parsedAction === 'link-pm'
          ? `Good choice. Linking to ${linked?.title ?? 'the upcoming PM'} should reduce duplicate downtime.`
          : parsedAction === 'merge'
            ? `Understood. I'll plan this together with ${linked?.title ?? 'the existing Work Order'}.`
            : 'Understood. I will prepare a new Work Order for this request.',
    }),
    ...buildWindowMessages(ctx, state.selectedSchedulingOptionId),
  ];

  return {
    state: {
      ...state,
      phase: 'window',
      messages: [...state.messages, userMessage, ...assistantMessages],
      plannedWorkOrder: updatedPlan,
      selectedSchedulingOptionId: getRecommendedSchedulingOption(ctx)?.id,
    },
    newMessages: [userMessage, ...assistantMessages],
  };
}

function advanceFromWindow(ctx: PlanningAgentContext, state: PlanningAgentState, input: string): PlanningAgentAdvanceResult {
  const userMessage = createMessage('user', 'text', { content: input });
  const optionId = parseSchedulingIntent(input, ctx) ?? state.selectedSchedulingOptionId ?? getRecommendedSchedulingOption(ctx)?.id;
  const option = ctx.schedulingOptions.find((item) => item.id === optionId);
  const updatedPlan: Partial<PlannedWorkOrder> = {
    ...state.plannedWorkOrder,
    executionWindow: option,
    executionDay: ctx.defaultExecutionDay,
  };
  const assistantMessages = buildPartsMessages(ctx);

  return {
    state: {
      ...state,
      phase: 'parts',
      messages: [...state.messages, userMessage, ...assistantMessages],
      plannedWorkOrder: updatedPlan,
      selectedSchedulingOptionId: optionId,
    },
    newMessages: [userMessage, ...assistantMessages],
  };
}

function advanceFromParts(ctx: PlanningAgentContext, state: PlanningAgentState, input: string): PlanningAgentAdvanceResult {
  const userMessage = createMessage('user', 'text', { content: input });
  const onlyShortages = /shortage|constrained|missing|low stock/i.test(input);
  const parts = onlyShortages
    ? ctx.spareParts.filter((part) => part.stockState !== 'in-stock')
    : ctx.spareParts.filter((part) => part.stockState !== 'out-of-stock').slice(0, 3);
  const updatedPlan: Partial<PlannedWorkOrder> = {
    ...state.plannedWorkOrder,
    spareParts: parts.length ? parts : ctx.spareParts.slice(0, 3),
  };
  const assistantMessages = onlyShortages ? buildPartsMessages(ctx, true) : buildTechnicianMessages(ctx, state.selectedTechnicianId);

  return {
    state: {
      ...state,
      phase: onlyShortages ? 'parts' : 'technician',
      messages: [...state.messages, userMessage, ...assistantMessages],
      plannedWorkOrder: updatedPlan,
    },
    newMessages: [userMessage, ...assistantMessages],
  };
}

function advanceFromTechnician(ctx: PlanningAgentContext, state: PlanningAgentState, input: string): PlanningAgentAdvanceResult {
  const userMessage = createMessage('user', 'text', { content: input });
  const technicianId = parseTechnicianIntent(input, ctx) ?? state.selectedTechnicianId ?? getRecommendedTechnician(ctx)?.id;
  const technician = ctx.technicians.find((item) => item.id === technicianId);
  const updatedPlan: Partial<PlannedWorkOrder> = {
    ...state.plannedWorkOrder,
    technician,
  };
  const assistantMessages = buildSafetyQualityMessages(ctx);

  return {
    state: {
      ...state,
      phase: 'safetyQuality',
      messages: [...state.messages, userMessage, ...assistantMessages],
      plannedWorkOrder: updatedPlan,
      selectedTechnicianId: technicianId,
    },
    newMessages: [userMessage, ...assistantMessages],
  };
}

function advanceFromSafetyQuality(ctx: PlanningAgentContext, state: PlanningAgentState, input: string): PlanningAgentAdvanceResult {
  const userMessage = createMessage('user', 'text', { content: input });
  const addRequirements = /add|lockout|qa|quality verification/i.test(input);
  const safety = {
    ...ctx.defaultSafetyPlan,
    lotoRequired: addRequirements ? true : ctx.defaultSafetyPlan.lotoRequired,
    selectedRequirementIds: addRequirements
      ? Array.from(new Set([...ctx.defaultSafetyPlan.selectedRequirementIds, 'safety-glasses', 'cut-gloves', 'electrical']))
      : ctx.defaultSafetyPlan.selectedRequirementIds,
  };
  const quality = {
    ...ctx.defaultQualityPlan,
    qualityImpacting: addRequirements ? true : ctx.defaultQualityPlan.qualityImpacting,
    selectedRequirementIds: addRequirements
      ? Array.from(new Set([...ctx.defaultQualityPlan.selectedRequirementIds, 'visual-inspection', 'measurement-verification', 'photo']))
      : ctx.defaultQualityPlan.selectedRequirementIds,
  };
  const updatedPlan: Partial<PlannedWorkOrder> = {
    ...state.plannedWorkOrder,
    safetyRequirements: safety,
    qualityRequirements: quality,
  };
  const assistantMessages = buildConfirmMessages(ctx, updatedPlan);

  return {
    state: {
      ...state,
      phase: 'confirm',
      messages: [...state.messages, userMessage, ...assistantMessages],
      plannedWorkOrder: updatedPlan,
      awaitingConfirmation: true,
    },
    newMessages: [userMessage, ...assistantMessages],
  };
}

function advanceFromConfirm(ctx: PlanningAgentContext, state: PlanningAgentState, input: string): PlanningAgentAdvanceResult {
  const userMessage = createMessage('user', 'text', { content: input });

  if (isNegative(input) || wantsToRevise(input)) {
    const assistantMessages = [
      createMessage('assistant', 'text', {
        content: 'No problem. Tell me what you want to change, or choose a step to revisit.',
        quickReplies: [
          { id: 'revise-action', label: 'Change planning action', value: 'I want to change the planning action' },
          { id: 'revise-window', label: 'Change execution window', value: 'I want to change the execution window' },
          { id: 'revise-tech', label: 'Change technician', value: 'I want to change the technician assignment' },
        ],
      }),
    ];

    return {
      state: {
        ...state,
        phase: 'confirm',
        messages: [...state.messages, userMessage, ...assistantMessages],
        awaitingConfirmation: true,
      },
      newMessages: [userMessage, ...assistantMessages],
    };
  }

  if (!isAffirmative(input)) {
    const assistantMessages = [
      createMessage('assistant', 'text', {
        content: 'Please confirm before I create or update the Work Order. You can say "Confirm" or use the confirmation button.',
        quickReplies: phaseQuickReplies('confirm', ctx, state),
      }),
    ];

    return {
      state: {
        ...state,
        messages: [...state.messages, userMessage, ...assistantMessages],
        awaitingConfirmation: true,
      },
      newMessages: [userMessage, ...assistantMessages],
    };
  }

  return {
    state: {
      ...state,
      phase: 'confirm',
      messages: [...state.messages, userMessage],
      awaitingConfirmation: true,
    },
    newMessages: [userMessage],
  };
}

export function finalizePlannedWorkOrder(ctx: PlanningAgentContext, state: PlanningAgentState): PlannedWorkOrder {
  const plan = state.plannedWorkOrder;
  return {
    action: plan.action ?? 'create',
    title: plan.title ?? ctx.cardTitle,
    description: plan.description ?? ctx.requestDetails.problemDescription,
    maintenanceType: plan.maintenanceType ?? ctx.requestDetails.maintenanceType,
    equipment: plan.equipment ?? ctx.requestDetails.equipment,
    equipmentCriticality: plan.equipmentCriticality ?? ctx.equipmentCriticality,
    priority: plan.priority ?? ctx.requestDetails.priority,
    riskAssessment: plan.riskAssessment ?? ctx.requestDetails.riskAssessment,
    executionWindow: plan.executionWindow ?? getRecommendedSchedulingOption(ctx),
    executionDay: plan.executionDay ?? ctx.defaultExecutionDay,
    technician: plan.technician ?? getRecommendedTechnician(ctx),
    spareParts: plan.spareParts ?? ctx.spareParts.slice(0, 3),
    safetyRequirements: plan.safetyRequirements ?? ctx.defaultSafetyPlan,
    qualityRequirements: plan.qualityRequirements ?? ctx.defaultQualityPlan,
    linkedRequestId: plan.linkedRequestId ?? ctx.requestDetails.requestId,
    linkedRequestCardId: plan.linkedRequestCardId ?? ctx.requestCardId,
    linkedWorkOrderOrPm: plan.linkedWorkOrderOrPm,
    source: plan.source ?? ctx.source,
    status: 'Scheduled',
  };
}

export function buildCommittedState(ctx: PlanningAgentContext, state: PlanningAgentState, plan: PlannedWorkOrder): PlanningAgentState {
  const successMessages = buildSuccessMessages(plan);
  return {
    ...state,
    phase: 'committed',
    plannedWorkOrder: plan,
    awaitingConfirmation: false,
    messages: [...state.messages, ...successMessages],
  };
}

export function advancePlanningAgent(
  ctx: PlanningAgentContext,
  state: PlanningAgentState,
  input: string,
): PlanningAgentAdvanceResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return { state, newMessages: [] };
  }

  if (state.phase === 'committed') {
    const userMessage = createMessage('user', 'text', { content: trimmed });
    const assistantMessage = createMessage('assistant', 'text', {
      content: 'The Work Order is already planned and moved to Scheduling. Open the Scheduled lane to review the final details.',
    });
    return {
      state: {
        ...state,
        messages: [...state.messages, userMessage, assistantMessage],
      },
      newMessages: [userMessage, assistantMessage],
    };
  }

  if (state.phase === 'confirm' && (wantsToRevise(trimmed) || /change planning action/i.test(trimmed))) {
    return advanceFromReview(ctx, state, trimmed);
  }
  if (state.phase === 'confirm' && /execution window/i.test(trimmed)) {
    return advanceFromAction(ctx, state, 'Create a new Work Order');
  }
  if (state.phase === 'confirm' && /technician/i.test(trimmed)) {
    const userMessage = createMessage('user', 'text', { content: trimmed });
    const assistantMessages = buildTechnicianMessages(ctx, state.selectedTechnicianId);
    return {
      state: {
        ...state,
        phase: 'technician',
        messages: [...state.messages, userMessage, ...assistantMessages],
        awaitingConfirmation: false,
      },
      newMessages: [userMessage, ...assistantMessages],
    };
  }

  switch (state.phase) {
    case 'review':
      return advanceFromReview(ctx, state, trimmed);
    case 'action':
      return advanceFromAction(ctx, state, trimmed);
    case 'window':
      return advanceFromWindow(ctx, state, trimmed);
    case 'parts':
      return advanceFromParts(ctx, state, trimmed);
    case 'technician':
      return advanceFromTechnician(ctx, state, trimmed);
    case 'safetyQuality':
      return advanceFromSafetyQuality(ctx, state, trimmed);
    case 'confirm':
      return advanceFromConfirm(ctx, state, trimmed);
    default:
      return { state, newMessages: [] };
  }
}

export function getActiveQuickReplies(ctx: PlanningAgentContext, state: PlanningAgentState): AgentQuickReply[] {
  if (state.phase === 'committed') {
    return [];
  }

  const lastMessage = state.messages[state.messages.length - 1];
  if (lastMessage?.role === 'assistant' && lastMessage.quickReplies?.length) {
    return lastMessage.quickReplies;
  }

  return phaseQuickReplies(state.phase, ctx, state);
}

export const planningAgentStepLabels: Record<PlanningAgentPhase, string> = {
  review: 'Review',
  action: 'Action',
  window: 'Schedule',
  parts: 'Parts',
  technician: 'Technician',
  safetyQuality: 'Safety & Quality',
  confirm: 'Confirm',
  committed: 'Done',
};

export const planningAgentStepOrder: PlanningAgentPhase[] = [
  'review',
  'action',
  'window',
  'parts',
  'technician',
  'safetyQuality',
  'confirm',
];

export function getPhaseHint(phase: PlanningAgentPhase): string {
  switch (phase) {
    case 'review':
      return 'Review the request summary, then continue when ready.';
    case 'action':
      return 'Choose how to handle this request: link to a PM, merge with an existing WO, or create a new one.';
    case 'window':
      return 'Pick the execution window that works best.';
    case 'parts':
      return 'Confirm the spare parts, or review only the constrained ones.';
    case 'technician':
      return 'Choose the technician to assign.';
    case 'safetyQuality':
      return 'Accept the safety & quality plan, or add extra checks.';
    case 'confirm':
      return 'Review the planned Work Order and confirm to create it.';
    case 'committed':
      return 'The Work Order has been created and moved to Scheduling.';
    default:
      return '';
  }
}
