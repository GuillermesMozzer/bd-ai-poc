import { useCallback, useRef } from 'react';
import { type AiMessage } from '../types';
import { type ShiftEntryMaintenancePrefill } from '../../shiftEntry/ShiftEntryMaintenance';
import {
  buildTechnicianMaintenanceFormOpenedMessages,
  buildTechnicianMaintenanceGuideIntroMessages,
  buildTechnicianMaintenanceGuideOpeningMessages,
  buildTechnicianMaintenancePrefill,
  buildTechnicianMaintenanceStepPrompt,
  buildTechnicianMaintenanceTypingMessage,
  getNextTechnicianMaintenanceGuideStep,
  TECHNICIAN_MAINTENANCE_ACTIVITY_OPTIONS,
  TECHNICIAN_MAINTENANCE_EQUIPMENT_OPTIONS,
  TECHNICIAN_MAINTENANCE_GUIDE_BADGE,
  TECHNICIAN_MAINTENANCE_ISSUE_OPTIONS,
  TECHNICIAN_MAINTENANCE_PRIORITY_OPTIONS,
  TECHNICIAN_MAINTENANCE_RISK_OPTIONS,
  type TechnicianMaintenanceGuideDraft,
  type TechnicianMaintenanceGuideStep,
} from '../contexts/technicianMaintenanceRequestGuide';
import { buildTechnicianMaintenanceRequestAckMessage } from '../contexts/technicianAssistantIntro';

type UseTechnicianMaintenanceRequestGuideArgs = {
  currentUserName: string;
  setAiMessages: React.Dispatch<React.SetStateAction<AiMessage[]>>;
  setAiInput: (value: string) => void;
  setAiDrawerWidth: (value: number) => void;
  setAiProblemFilter: (value: string) => void;
  setAiProblemFilterInput: (value: string) => void;
  setIsAiDrawerOpen: (open: boolean) => void;
  setShiftEntryMaintenancePrefill: (prefill: ShiftEntryMaintenancePrefill | null) => void;
  setShiftEntryMode: (mode: 'maintenance') => void;
  setIsShiftEntryOpen: (open: boolean) => void;
  clearTimers: () => void;
  registerTimer: (timerId: number) => void;
  unregisterTimer: (timerId: number) => void;
};

export function useTechnicianMaintenanceRequestGuide({
  currentUserName,
  setAiMessages,
  setAiInput,
  setAiDrawerWidth,
  setAiProblemFilter,
  setAiProblemFilterInput,
  setIsAiDrawerOpen,
  setShiftEntryMaintenancePrefill,
  setShiftEntryMode,
  setIsShiftEntryOpen,
  clearTimers,
  registerTimer,
  unregisterTimer,
}: UseTechnicianMaintenanceRequestGuideArgs) {
  const guideActiveRef = useRef(false);
  const guideStepRef = useRef<TechnicianMaintenanceGuideStep | null>(null);
  const guideDraftRef = useRef<TechnicianMaintenanceGuideDraft>({});
  const openMaintenanceRequestRef = useRef<() => void>(() => {});
  const advanceGuideToStepRef = useRef<(step: TechnicianMaintenanceGuideStep, userText?: string) => void>(() => {});

  const appendGuideMessages = useCallback((messages: AiMessage[]) => {
    setAiMessages((current) => [...current, ...messages]);
  }, [setAiMessages]);

  const replaceTypingWithMessages = useCallback((heading: string, messages: AiMessage[]) => {
    setAiMessages((current) => [
      ...current.filter((message) => !(message.variant === 'typing' && message.heading === heading)),
      ...messages,
    ]);
  }, [setAiMessages]);

  const withQuickActions = (
    messages: AiMessage[],
    quickActions: NonNullable<AiMessage['quickActions']>,
  ) => messages.map((message) => (
    message.variant === 'quick_actions'
      ? { ...message, quickActions }
      : message
  ));

  const buildQuickActionsForStep = useCallback((step: TechnicianMaintenanceGuideStep) => {
    const draft = guideDraftRef.current;

    if (step === 'issue_type') {
      return TECHNICIAN_MAINTENANCE_ISSUE_OPTIONS.map((issue) => ({
        label: issue.label,
        action: () => {
          guideDraftRef.current = {
            ...guideDraftRef.current,
            issue,
            activityType: issue.activityType,
            priority: issue.priority,
            riskDowntime: issue.riskAssessment.downtime,
            riskQuality: issue.riskAssessment.quality,
            riskEhs: issue.riskAssessment.ehs,
          };
          const next = getNextTechnicianMaintenanceGuideStep('issue_type');
          if (next) advanceGuideToStepRef.current(next, issue.label);
        },
      }));
    }

    if (step === 'equipment') {
      return TECHNICIAN_MAINTENANCE_EQUIPMENT_OPTIONS.map((equipment) => ({
        label: equipment.name,
        action: () => {
          guideDraftRef.current = {
            ...guideDraftRef.current,
            equipmentId: equipment.id,
            equipmentName: equipment.name,
            equipmentPath: equipment.path,
            equipmentTags: [...equipment.tags],
          };
          const next = getNextTechnicianMaintenanceGuideStep('equipment');
          if (next) advanceGuideToStepRef.current(next, equipment.name);
        },
      }));
    }

    if (step === 'activity_type') {
      return TECHNICIAN_MAINTENANCE_ACTIVITY_OPTIONS.map((activityType) => ({
        label: activityType,
        action: () => {
          guideDraftRef.current = { ...guideDraftRef.current, activityType };
          const next = getNextTechnicianMaintenanceGuideStep('activity_type');
          if (next) advanceGuideToStepRef.current(next, activityType);
        },
      }));
    }

    if (step === 'resolved') {
      return [
        {
          label: 'No, still open',
          action: () => {
            guideDraftRef.current = { ...guideDraftRef.current, resolved: 'no' };
            const next = getNextTechnicianMaintenanceGuideStep('resolved');
            if (next) advanceGuideToStepRef.current(next, 'No, still open');
          },
        },
        {
          label: 'Yes, already resolved',
          action: () => {
            guideDraftRef.current = { ...guideDraftRef.current, resolved: 'yes' };
            const next = getNextTechnicianMaintenanceGuideStep('resolved');
            if (next) advanceGuideToStepRef.current(next, 'Yes, already resolved');
          },
        },
      ];
    }

    if (step === 'risk_downtime' || step === 'risk_quality' || step === 'risk_ehs') {
      return TECHNICIAN_MAINTENANCE_RISK_OPTIONS.map((risk) => ({
        label: risk,
        action: () => {
          if (step === 'risk_downtime') {
            guideDraftRef.current = { ...guideDraftRef.current, riskDowntime: risk };
          }
          if (step === 'risk_quality') {
            guideDraftRef.current = { ...guideDraftRef.current, riskQuality: risk };
          }
          if (step === 'risk_ehs') {
            guideDraftRef.current = { ...guideDraftRef.current, riskEhs: risk };
          }
          const next = getNextTechnicianMaintenanceGuideStep(step);
          if (next) advanceGuideToStepRef.current(next, risk);
        },
      }));
    }

    if (step === 'priority') {
      const suggested = draft.issue?.priority;
      const priorityChoices = TECHNICIAN_MAINTENANCE_PRIORITY_OPTIONS.filter((priority) => (
        priority === suggested
        || priority.startsWith('0')
        || priority.startsWith('1')
        || priority.startsWith('2')
        || priority.startsWith('3')
      ));
      return priorityChoices.map((priority) => ({
        label: priority,
        action: () => {
          guideDraftRef.current = { ...guideDraftRef.current, priority };
          const next = getNextTechnicianMaintenanceGuideStep('priority');
          if (next) advanceGuideToStepRef.current(next, priority);
        },
      }));
    }

    if (step === 'attachments') {
      return [
        {
          label: 'I will add photo or audio in the form',
          action: () => {
            guideDraftRef.current = { ...guideDraftRef.current, skipAttachments: false };
            const next = getNextTechnicianMaintenanceGuideStep('attachments');
            if (next) advanceGuideToStepRef.current(next, 'I will add photo or audio in the form');
          },
        },
        {
          label: 'Skip attachments for now',
          action: () => {
            guideDraftRef.current = { ...guideDraftRef.current, skipAttachments: true };
            const next = getNextTechnicianMaintenanceGuideStep('attachments');
            if (next) advanceGuideToStepRef.current(next, 'Skip attachments for now');
          },
        },
      ];
    }

    return [];
  }, []);

  const advanceGuideToStep = useCallback((step: TechnicianMaintenanceGuideStep, userText?: string) => {
    guideStepRef.current = step;
    const draft = guideDraftRef.current;
    const heading = `Preparing step ${step}`;

    if (userText) {
      appendGuideMessages([{ role: 'user', text: userText }]);
    }

    appendGuideMessages([buildTechnicianMaintenanceTypingMessage(heading)]);

    const timerId = window.setTimeout(() => {
      let promptMessages = buildTechnicianMaintenanceStepPrompt(step, draft);

      if (step === 'review') {
        promptMessages = promptMessages.map((message) => (
          message.variant === 'action'
            ? { ...message, action: () => openMaintenanceRequestRef.current() }
            : message
        ));
      } else {
        const quickActions = buildQuickActionsForStep(step);
        if (quickActions.length) {
          promptMessages = withQuickActions(promptMessages, quickActions);
        }
      }

      replaceTypingWithMessages(heading, promptMessages);
      unregisterTimer(timerId);
    }, 850);
    registerTimer(timerId);
  }, [appendGuideMessages, buildQuickActionsForStep, registerTimer, replaceTypingWithMessages, unregisterTimer]);

  advanceGuideToStepRef.current = advanceGuideToStep;

  const openMaintenanceRequestFromGuide = useCallback(() => {
    const draft = guideDraftRef.current;
    setShiftEntryMaintenancePrefill(buildTechnicianMaintenancePrefill(draft));
    setShiftEntryMode('maintenance');
    setIsShiftEntryOpen(true);
    appendGuideMessages(buildTechnicianMaintenanceFormOpenedMessages(draft));
    guideActiveRef.current = false;
    guideStepRef.current = null;
  }, [appendGuideMessages, setIsShiftEntryOpen, setShiftEntryMaintenancePrefill, setShiftEntryMode]);

  openMaintenanceRequestRef.current = openMaintenanceRequestFromGuide;

  const handleGuideUserMessage = useCallback((message: string) => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || !guideActiveRef.current || guideStepRef.current !== 'description') {
      return false;
    }

    guideDraftRef.current = {
      ...guideDraftRef.current,
      whatHappened: trimmedMessage,
    };
    setAiInput('');

    const next = getNextTechnicianMaintenanceGuideStep('description');
    if (next) {
      advanceGuideToStep(next, trimmedMessage);
    }
    return true;
  }, [advanceGuideToStep, setAiInput]);

  const isGuideActive = useCallback(() => guideActiveRef.current, []);

  const beginGuideSession = useCallback(() => {
    clearTimers();
    guideActiveRef.current = true;
    guideStepRef.current = 'issue_type';
    guideDraftRef.current = {};
    setAiInput('');
    setAiDrawerWidth(520);
    setAiProblemFilterInput('Maintenance Technician · Open request');
    setAiProblemFilter('Maintenance Technician · Open request');
    setIsAiDrawerOpen(true);
  }, [
    clearTimers,
    setAiDrawerWidth,
    setAiInput,
    setAiProblemFilter,
    setAiProblemFilterInput,
    setIsAiDrawerOpen,
  ]);

  const openGuide = useCallback(() => {
    beginGuideSession();

    const firstName = currentUserName.split(' ')[0] || 'there';
    const introMessages = buildTechnicianMaintenanceGuideIntroMessages(firstName);
    const issuePromptMessage = introMessages[introMessages.length - 1];

    setAiMessages(buildTechnicianMaintenanceGuideOpeningMessages());

    const introTimerId = window.setTimeout(() => {
      setAiMessages([
        ...introMessages.slice(0, -1),
        {
          ...issuePromptMessage,
          quickActions: buildQuickActionsForStep('issue_type'),
        },
      ]);
      unregisterTimer(introTimerId);
    }, 950);
    registerTimer(introTimerId);
  }, [
    beginGuideSession,
    buildQuickActionsForStep,
    currentUserName,
    registerTimer,
    setAiMessages,
    unregisterTimer,
  ]);

  const startGuideFromChat = useCallback(() => {
    beginGuideSession();

    appendGuideMessages([
      buildTechnicianMaintenanceRequestAckMessage(),
      buildTechnicianMaintenanceTypingMessage('Starting maintenance request guide'),
    ]);

    const introTimerId = window.setTimeout(() => {
      const promptMessages = withQuickActions(
        buildTechnicianMaintenanceStepPrompt('issue_type'),
        buildQuickActionsForStep('issue_type'),
      );
      replaceTypingWithMessages('Starting maintenance request guide', promptMessages);
      unregisterTimer(introTimerId);
    }, 900);
    registerTimer(introTimerId);
  }, [
    appendGuideMessages,
    beginGuideSession,
    buildQuickActionsForStep,
    registerTimer,
    replaceTypingWithMessages,
    unregisterTimer,
  ]);

  return {
    openGuide,
    startGuideFromChat,
    handleGuideUserMessage,
    isGuideActive,
    TECHNICIAN_MAINTENANCE_GUIDE_BADGE,
  };
}
