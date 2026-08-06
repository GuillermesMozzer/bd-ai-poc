import { type AiMessage } from '../types';
import { type ShiftEntryMaintenancePrefill } from '../../shiftEntry/ShiftEntryMaintenance';
import { buildMyAiAssistantGreeting } from './myAiAssistantContent';

export const TECHNICIAN_MAINTENANCE_GUIDE_BADGE = 'Maintenance guide';

export type TechnicianMaintenanceIssueType =
  | 'breakdown'
  | 'abnormal'
  | 'preventive'
  | 'safety';

export type TechnicianMaintenanceGuideStep =
  | 'issue_type'
  | 'equipment'
  | 'description'
  | 'activity_type'
  | 'resolved'
  | 'risk_downtime'
  | 'risk_quality'
  | 'risk_ehs'
  | 'priority'
  | 'attachments'
  | 'review';

export type TechnicianMaintenanceGuideDraft = {
  issue?: TechnicianMaintenanceIssueOption;
  equipmentId?: string;
  equipmentName?: string;
  equipmentPath?: string;
  equipmentTags?: string[];
  whatHappened?: string;
  activityType?: string;
  resolved?: 'yes' | 'no';
  riskDowntime?: string;
  riskQuality?: string;
  riskEhs?: string;
  priority?: string;
  skipAttachments?: boolean;
};

export type TechnicianMaintenanceIssueOption = {
  id: TechnicianMaintenanceIssueType;
  label: string;
  summary: string;
  defaultDescription: string;
  activityType: string;
  priority: string;
  maintenanceType: 'issue' | 'breakdown';
  riskAssessment: {
    downtime: string;
    quality: string;
    ehs: string;
  };
};

export const TECHNICIAN_MAINTENANCE_ISSUE_OPTIONS: TechnicianMaintenanceIssueOption[] = [
  {
    id: 'breakdown',
    label: 'Equipment breakdown / line stopped',
    summary: 'Use this when production is blocked or the asset cannot run safely.',
    defaultDescription: 'Equipment stopped unexpectedly and needs immediate maintenance follow-up.',
    activityType: 'Mechanical',
    priority: '1 - Immediate (24 hours)',
    maintenanceType: 'breakdown',
    riskAssessment: { downtime: 'High', quality: 'Medium', ehs: 'Low' },
  },
  {
    id: 'abnormal',
    label: 'Abnormal noise, vibration, or leak',
    summary: 'Use this when the asset is still running but showing a warning signal.',
    defaultDescription: 'Abnormal equipment behavior was observed and should be logged before it escalates.',
    activityType: 'Mechanical',
    priority: '2 - High (3 days)',
    maintenanceType: 'issue',
    riskAssessment: { downtime: 'Medium', quality: 'Medium', ehs: 'Low' },
  },
  {
    id: 'preventive',
    label: 'Preventive maintenance finding',
    summary: 'Use this when a PM, inspection, or walkthrough uncovered follow-up work.',
    defaultDescription: 'A preventive maintenance check identified a condition that needs maintenance review.',
    activityType: 'Mechanical',
    priority: '3 - Medium (7 days)',
    maintenanceType: 'issue',
    riskAssessment: { downtime: 'Low', quality: 'Low', ehs: 'Low' },
  },
  {
    id: 'safety',
    label: 'Safety / EHS concern',
    summary: 'Use this when the issue could affect people, guarding, or safe operation.',
    defaultDescription: 'A safety-related equipment condition was observed and needs maintenance follow-up.',
    activityType: 'Safety / EHS',
    priority: '1 - Immediate (24 hours)',
    maintenanceType: 'issue',
    riskAssessment: { downtime: 'Medium', quality: 'Low', ehs: 'High' },
  },
];

export const TECHNICIAN_MAINTENANCE_EQUIPMENT_OPTIONS = [
  {
    id: 'SA-204',
    name: 'Syringe Assembly Machine SA-204',
    path: 'Plant A / Unit B / Line 10 / Syringe Assembly Machine SA-204',
    tags: ['SA-204', 'syringe', 'assembly', 'critical'],
  },
  {
    id: 'MM-301',
    name: 'Molding Machine MM-301',
    path: 'Plant A / Unit B / Line 10 / Molding Machine MM-301',
    tags: ['MM-301', 'molding', 'tooling'],
  },
  {
    id: 'VI-210',
    name: 'Vision Inspection System VI-210',
    path: 'Plant A / Unit B / Line 10 / Vision Inspection System VI-210',
    tags: ['VI-210', 'vision', 'inspection'],
  },
  {
    id: 'LM-88',
    name: 'Labeling Machine LM-88',
    path: 'Plant A / Unit B / Line 10 / Labeling Machine LM-88',
    tags: ['LM-88', 'labeling'],
  },
] as const;

export const TECHNICIAN_MAINTENANCE_ACTIVITY_OPTIONS = [
  'Mechanical',
  'Electrical',
  'Automation / Controls',
  'Utilities',
  'Facilities',
  'Safety / EHS',
  'Other',
] as const;

export const TECHNICIAN_MAINTENANCE_PRIORITY_OPTIONS = [
  '0 - Emergency Breakdown',
  '1 - Immediate (24 hours)',
  '2 - High (3 days)',
  '3 - Medium (7 days)',
  '4 - Low (30 days)',
  '5 - Very Low (90 days)',
] as const;

export const TECHNICIAN_MAINTENANCE_RISK_OPTIONS = ['High', 'Medium', 'Low'] as const;

const GUIDE_STEP_LABELS: Record<TechnicianMaintenanceGuideStep, string> = {
  issue_type: 'Choose the issue type',
  equipment: 'Select the equipment',
  description: 'Describe what is happening',
  activity_type: 'Choose activity type',
  resolved: 'Confirm if it is resolved',
  risk_downtime: 'Assess downtime risk',
  risk_quality: 'Assess quality risk',
  risk_ehs: 'Assess EHS risk',
  priority: 'Set request priority',
  attachments: 'Add supporting evidence',
  review: 'Review and open the request',
};

const GUIDE_STEP_ORDER: TechnicianMaintenanceGuideStep[] = [
  'issue_type',
  'equipment',
  'description',
  'activity_type',
  'resolved',
  'risk_downtime',
  'risk_quality',
  'risk_ehs',
  'priority',
  'attachments',
  'review',
];

export function getTechnicianMaintenanceGuideStepIndex(step: TechnicianMaintenanceGuideStep) {
  return GUIDE_STEP_ORDER.indexOf(step);
}

export function buildTechnicianMaintenanceProgressItems(activeStep: TechnicianMaintenanceGuideStep) {
  const activeIndex = getTechnicianMaintenanceGuideStepIndex(activeStep);
  return GUIDE_STEP_ORDER.map((step, index) => ({
    label: GUIDE_STEP_LABELS[step],
    state: index < activeIndex ? 'done' as const : index === activeIndex ? 'active' as const : 'pending' as const,
  }));
}

export function buildTechnicianMaintenancePrefill(
  draft: TechnicianMaintenanceGuideDraft,
): ShiftEntryMaintenancePrefill {
  const issue = draft.issue ?? TECHNICIAN_MAINTENANCE_ISSUE_OPTIONS[0];
  return {
    aiSuggestionText:
      'BLU.AI captured your guided answers and prefilled the maintenance request. Review each field before submitting.',
    equipment: draft.equipmentName,
    equipmentId: draft.equipmentId,
    equipmentPath: draft.equipmentPath,
    equipmentTags: draft.equipmentTags,
    whatHappened: draft.whatHappened ?? issue.defaultDescription,
    maintenanceType: issue.maintenanceType,
    activityType: draft.activityType ?? issue.activityType,
    priority: draft.priority ?? issue.priority,
    suggestedActivityType: draft.activityType ?? issue.activityType,
    suggestedPriority: draft.priority ?? issue.priority,
    suggestedRiskAssessment: {
      downtime: draft.riskDowntime ?? issue.riskAssessment.downtime,
      quality: draft.riskQuality ?? issue.riskAssessment.quality,
      ehs: draft.riskEhs ?? issue.riskAssessment.ehs,
    },
    riskAssessment: {
      downtime: draft.riskDowntime ?? issue.riskAssessment.downtime,
      quality: draft.riskQuality ?? issue.riskAssessment.quality,
      ehs: draft.riskEhs ?? issue.riskAssessment.ehs,
    },
    liveFill: true,
  };
}

export function buildTechnicianMaintenanceGuideOpeningMessages(): AiMessage[] {
  return [
    {
      role: 'assistant',
      text: '',
      variant: 'typing',
      heading: 'Reading your workstation',
      badge: TECHNICIAN_MAINTENANCE_GUIDE_BADGE,
    },
  ];
}

export function buildTechnicianMaintenanceGuideIntroMessages(firstName: string): AiMessage[] {
  return [
    {
      role: 'assistant',
      text: buildMyAiAssistantGreeting('Good afternoon', firstName),
      badge: TECHNICIAN_MAINTENANCE_GUIDE_BADGE,
    },
    {
      role: 'assistant',
      text:
        'I will guide you step-by-step to open a maintenance request. I will ask each question in order, and only open Operations Entry after we have everything captured.',
      badge: TECHNICIAN_MAINTENANCE_GUIDE_BADGE,
    },
    {
      role: 'assistant',
      text:
        'We will cover issue type, equipment, description, activity type, resolved status, risk assessment, priority, and attachments.',
      variant: 'priority_progress',
      heading: 'Maintenance request guide',
      badge: TECHNICIAN_MAINTENANCE_GUIDE_BADGE,
      progressTitle: 'Guided request flow',
      progressDetail: 'Answer each step in the chat before the form opens.',
      progressItems: buildTechnicianMaintenanceProgressItems('issue_type'),
    },
    ...buildTechnicianMaintenanceStepPrompt('issue_type'),
  ];
}

export function buildTechnicianMaintenanceTypingMessage(heading: string): AiMessage {
  return {
    role: 'assistant',
    text: '',
    variant: 'typing',
    heading,
    badge: TECHNICIAN_MAINTENANCE_GUIDE_BADGE,
  };
}

export function buildTechnicianMaintenanceStepPrompt(
  step: TechnicianMaintenanceGuideStep,
  draft: TechnicianMaintenanceGuideDraft = {},
): AiMessage[] {
  const progressMessage: AiMessage = {
    role: 'assistant',
    text: `Step ${getTechnicianMaintenanceGuideStepIndex(step) + 1} of ${GUIDE_STEP_ORDER.length}: ${GUIDE_STEP_LABELS[step]}.`,
    variant: 'priority_progress',
    heading: 'Maintenance request guide',
    badge: TECHNICIAN_MAINTENANCE_GUIDE_BADGE,
    progressTitle: 'Guided request flow',
    progressDetail: 'Answer each step in the chat before the form opens.',
    progressItems: buildTechnicianMaintenanceProgressItems(step),
  };

  switch (step) {
    case 'issue_type':
      return [
        progressMessage,
        {
          role: 'assistant',
          text: 'What type of issue are you reporting?',
          variant: 'quick_actions',
          badge: TECHNICIAN_MAINTENANCE_GUIDE_BADGE,
          quickActions: [],
        },
      ];
    case 'equipment':
      return [
        progressMessage,
        {
          role: 'assistant',
          text: 'Which equipment is affected? Pick the asset from your line context.',
          variant: 'quick_actions',
          badge: TECHNICIAN_MAINTENANCE_GUIDE_BADGE,
          quickActions: [],
        },
      ];
    case 'description':
      return [
        progressMessage,
        {
          role: 'assistant',
          text:
            'Describe what is happening in your own words.\n\nType the description in the chat box below and press Send. Include symptoms, timing, and anything you already checked.',
          badge: TECHNICIAN_MAINTENANCE_GUIDE_BADGE,
        },
      ];
    case 'activity_type':
      return [
        progressMessage,
        {
          role: 'assistant',
          text: `What activity type best matches this request? I suggest ${draft.issue?.activityType ?? 'Mechanical'} based on your issue type.`,
          variant: 'quick_actions',
          badge: TECHNICIAN_MAINTENANCE_GUIDE_BADGE,
          quickActions: [],
        },
      ];
    case 'resolved':
      return [
        progressMessage,
        {
          role: 'assistant',
          text: 'Is the issue already resolved on the line?',
          variant: 'quick_actions',
          badge: TECHNICIAN_MAINTENANCE_GUIDE_BADGE,
          quickActions: [],
        },
      ];
    case 'risk_downtime':
      return [
        progressMessage,
        {
          role: 'assistant',
          text: `What is the downtime risk? Suggested: ${draft.issue?.riskAssessment.downtime ?? 'Medium'}.`,
          variant: 'quick_actions',
          badge: TECHNICIAN_MAINTENANCE_GUIDE_BADGE,
          quickActions: [],
        },
      ];
    case 'risk_quality':
      return [
        progressMessage,
        {
          role: 'assistant',
          text: `What is the quality risk? Suggested: ${draft.issue?.riskAssessment.quality ?? 'Medium'}.`,
          variant: 'quick_actions',
          badge: TECHNICIAN_MAINTENANCE_GUIDE_BADGE,
          quickActions: [],
        },
      ];
    case 'risk_ehs':
      return [
        progressMessage,
        {
          role: 'assistant',
          text: `What is the EHS risk? Suggested: ${draft.issue?.riskAssessment.ehs ?? 'Low'}.`,
          variant: 'quick_actions',
          badge: TECHNICIAN_MAINTENANCE_GUIDE_BADGE,
          quickActions: [],
        },
      ];
    case 'priority':
      return [
        progressMessage,
        {
          role: 'assistant',
          text: `What priority should this request use? Suggested: ${draft.issue?.priority ?? '3 - Medium (7 days)'}.`,
          variant: 'quick_actions',
          badge: TECHNICIAN_MAINTENANCE_GUIDE_BADGE,
          quickActions: [],
        },
      ];
    case 'attachments':
      return [
        progressMessage,
        {
          role: 'assistant',
          text:
            'Do you want to add a photo, file, or audio note with this request? You can attach evidence in the form after it opens.',
          variant: 'quick_actions',
          badge: TECHNICIAN_MAINTENANCE_GUIDE_BADGE,
          quickActions: [],
        },
      ];
    case 'review':
      return [
        progressMessage,
        {
          role: 'assistant',
          text: buildTechnicianMaintenanceReviewSummary(draft),
          variant: 'priority_summary',
          heading: 'Review your maintenance request',
          badge: TECHNICIAN_MAINTENANCE_GUIDE_BADGE,
        },
        {
          role: 'assistant',
          text:
            'Everything is ready. I will open Operations Entry on the Maintenance Request tab with these answers prefilled so you can confirm and submit.',
          variant: 'action',
          badge: TECHNICIAN_MAINTENANCE_GUIDE_BADGE,
          accent: '#044ED7',
          actionLabel: 'Open maintenance request',
          action: () => {},
        },
      ];
    default:
      return [progressMessage];
  }
}

export function buildTechnicianMaintenanceReviewSummary(draft: TechnicianMaintenanceGuideDraft) {
  const issue = draft.issue;
  return [
    `Issue type: ${issue?.label ?? 'Not set'}`,
    `Equipment: ${draft.equipmentName ?? 'Not set'}`,
    `Description: ${draft.whatHappened ?? 'Not set'}`,
    `Activity type: ${draft.activityType ?? issue?.activityType ?? 'Not set'}`,
    `Resolved: ${draft.resolved === 'yes' ? 'Yes' : draft.resolved === 'no' ? 'No' : 'Not set'}`,
    `Risk — Downtime: ${draft.riskDowntime ?? issue?.riskAssessment.downtime ?? 'Not set'}`,
    `Risk — Quality: ${draft.riskQuality ?? issue?.riskAssessment.quality ?? 'Not set'}`,
    `Risk — EHS: ${draft.riskEhs ?? issue?.riskAssessment.ehs ?? 'Not set'}`,
    `Priority: ${draft.priority ?? issue?.priority ?? 'Not set'}`,
    `Attachments: ${draft.skipAttachments ? 'Skip for now' : 'Add in the form after it opens'}`,
  ].join('\n');
}

export function buildTechnicianMaintenanceFormOpenedMessages(draft: TechnicianMaintenanceGuideDraft): AiMessage[] {
  return [
    {
      role: 'assistant',
      text:
        'Operations Entry is open with your guided answers prefilled.\n\nBefore submitting, confirm:\n1. What is happening?\n2. Equipment\n3. Resolved status\n4. Activity type and risk assessment\n5. Priority\n6. Attachments, if needed\n\nSubmit when the request is complete.',
      variant: 'priority_summary',
      heading: 'Final step: submit the request',
      badge: TECHNICIAN_MAINTENANCE_GUIDE_BADGE,
    },
    {
      role: 'assistant',
      text: buildTechnicianMaintenanceReviewSummary(draft),
      badge: TECHNICIAN_MAINTENANCE_GUIDE_BADGE,
    },
  ];
}

export function getNextTechnicianMaintenanceGuideStep(
  currentStep: TechnicianMaintenanceGuideStep,
): TechnicianMaintenanceGuideStep | null {
  const currentIndex = getTechnicianMaintenanceGuideStepIndex(currentStep);
  return GUIDE_STEP_ORDER[currentIndex + 1] ?? null;
}
