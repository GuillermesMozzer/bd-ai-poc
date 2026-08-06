import { useCallback, useEffect, useRef, useState } from 'react';
import {
  advancePlanningAgent,
  buildCommittedState,
  createInitialState,
  finalizePlannedWorkOrder,
  getActiveQuickReplies,
} from '../ai/planningAgent/planningAgentEngine';
import type {
  AgentChatMessage,
  AgentQuickReply,
  PlanningAgentContext,
  PlanningAgentPhase,
  PlanningAgentState,
  PlannedWorkOrder,
} from '../ai/planningAgent/types';

const TYPING_DELAY_MS = 680;

type UsePlanningAgentChatOptions = {
  context: PlanningAgentContext | null;
  open: boolean;
  onCommit: (plan: PlannedWorkOrder) => void;
};

export function usePlanningAgentChat({ context, open, onCommit }: UsePlanningAgentChatOptions) {
  const [state, setState] = useState<PlanningAgentState | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const timeoutRef = useRef<number | null>(null);
  const onCommitRef = useRef(onCommit);
  onCommitRef.current = onCommit;

  useEffect(() => {
    if (!open || !context) {
      setState(null);
      setIsTyping(false);
      setInputValue('');
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      return;
    }

    setState(createInitialState(context));
    setIsTyping(true);
    timeoutRef.current = window.setTimeout(() => {
      setIsTyping(false);
      timeoutRef.current = null;
    }, TYPING_DELAY_MS);

    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [context, open]);

  const appendWithTyping = useCallback(
    (updater: (current: PlanningAgentState) => PlanningAgentState, newMessages: AgentChatMessage[]) => {
      if (!newMessages.length) return;

      setIsTyping(true);
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = window.setTimeout(() => {
        setState(updater);
        setIsTyping(false);
        timeoutRef.current = null;
      }, TYPING_DELAY_MS);
    },
    [],
  );

  const sendMessage = useCallback(
    (message: string) => {
      if (!context || !state || state.phase === 'committed' || isTyping) return;

      const trimmed = message.trim();
      if (!trimmed) return;

      setInputValue('');

      if (state.phase === 'confirm' && /^(yes|yep|confirm|proceed|approve|create|go ahead|looks good|ok|okay|confirm and create)/i.test(trimmed)) {
        const plan = finalizePlannedWorkOrder(context, state);
        const userMessage: AgentChatMessage = {
          id: `planning-agent-user-${Date.now()}`,
          role: 'user',
          kind: 'text',
          content: trimmed,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        const committedState = buildCommittedState(context, { ...state, messages: [...state.messages, userMessage] }, plan);

        appendWithTyping(() => committedState, committedState.messages.slice(state.messages.length + 1));
        onCommitRef.current(plan);
        return;
      }

      const result = advancePlanningAgent(context, state, trimmed);
      appendWithTyping(() => result.state, result.newMessages);
    },
    [appendWithTyping, context, isTyping, state],
  );

  const confirmPlan = useCallback(() => {
    if (!context || !state || state.phase !== 'confirm' || isTyping) return;

    const plan = finalizePlannedWorkOrder(context, state);
    const userMessage: AgentChatMessage = {
      id: `planning-agent-user-${Date.now()}`,
      role: 'user',
      kind: 'text',
      content: 'Confirm and create the Work Order',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    const committedState = buildCommittedState(context, { ...state, messages: [...state.messages, userMessage] }, plan);

    appendWithTyping(() => committedState, committedState.messages.slice(state.messages.length + 1));
    onCommitRef.current(plan);
  }, [appendWithTyping, context, isTyping, state]);

  const selectQuickReply = useCallback(
    (reply: AgentQuickReply) => {
      if (reply.id === 'confirm-yes') {
        confirmPlan();
        return;
      }
      sendMessage(reply.value);
    },
    [confirmPlan, sendMessage],
  );

  const quickReplies = context && state ? getActiveQuickReplies(context, state) : [];

  return {
    messages: state?.messages ?? [],
    phase: (state?.phase ?? 'review') as PlanningAgentPhase,
    plannedWorkOrder: state?.plannedWorkOrder,
    awaitingConfirmation: state?.awaitingConfirmation ?? false,
    isTyping,
    inputValue,
    setInputValue,
    quickReplies,
    sendMessage,
    selectQuickReply,
    confirmPlan,
  };
}
