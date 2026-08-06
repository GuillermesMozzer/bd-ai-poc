import type { MaintenancePriority } from '../../types';

export type PlanningAgentSource = 'request' | 'planning';

export type PlanningAgentRiskLevel = 'Low' | 'Medium' | 'High';

export type PlanningAgentRiskAssessment = {
  downtime: PlanningAgentRiskLevel;
  quality: PlanningAgentRiskLevel;
  ehs: PlanningAgentRiskLevel;
};

export type PlanningAgentRequestDetails = {
  requestId: string;
  maintenanceType: string;
  location: string;
  priority: MaintenancePriority;
  equipment: string;
  createdBy: string;
  activityType: string;
  problemDescription: string;
  attachmentAvailable: boolean;
  riskAssessment: PlanningAgentRiskAssessment;
};

export type PlanningAgentWorkCandidate = {
  id: string;
  type: 'Preventive' | 'Corrective' | 'Breakdown' | 'Work Order';
  title: string;
  description: string;
  scheduledFor: string;
  assignee: string;
  status: string;
};

export type PlanningAgentTechnician = {
  id: string;
  name: string;
  status: string;
  availabilityPercent: number;
  recommended?: boolean;
  assigned?: boolean;
  shift?: string;
  skills?: string[];
  workloadSummary?: string;
};

export type PlanningAgentSparePart = {
  id: string;
  code: string;
  description: string;
  location: string;
  availableQuantity: number;
  requestedQuantity: number;
  stockState: 'in-stock' | 'low-stock' | 'out-of-stock';
};

export type PlanningAgentSchedulingOption = {
  id: string;
  title: string;
  description: string;
  windowLabel: string;
  recommended?: boolean;
  productionNote?: string;
};

export type PlanningAgentSafetyPlan = {
  equipmentCondition: string;
  lotoRequired: boolean;
  lockoutPoint: string;
  procedure: string;
  selectedRequirementIds: string[];
  safetyNotes: string;
  requirements: string[];
};

export type PlanningAgentQualityPlan = {
  qualityImpacting: boolean;
  selectedRequirementIds: string[];
  qualityNotes: string;
  requirements: string[];
};

export type PlanningAgentExecutionDay = {
  key: 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
  shortLabel: string;
  dayNumber: string;
  fullLabel: string;
  ctaLabel: string;
  isoDate?: string;
};

export type PlanningAgentContext = {
  source: PlanningAgentSource;
  cardId: string;
  requestCardId: string;
  cardTitle: string;
  requestDetails: PlanningAgentRequestDetails;
  equipmentCriticality: 'A' | 'B' | 'C';
  criticalityLabel: string;
  linkedWorkCandidates: PlanningAgentWorkCandidate[];
  technicians: PlanningAgentTechnician[];
  spareParts: PlanningAgentSparePart[];
  schedulingOptions: PlanningAgentSchedulingOption[];
  defaultSafetyPlan: PlanningAgentSafetyPlan;
  defaultQualityPlan: PlanningAgentQualityPlan;
  defaultExecutionDay: PlanningAgentExecutionDay;
  productionWindows: string[];
  upcomingPmNote?: string;
};

export type PlanningAgentPhase =
  | 'review'
  | 'action'
  | 'window'
  | 'parts'
  | 'technician'
  | 'safetyQuality'
  | 'confirm'
  | 'committed';

export type PlanningAgentAction = 'create' | 'merge' | 'link-pm';

export type AgentChatMessageRole = 'assistant' | 'user';

export type AgentChatMessageKind =
  | 'text'
  | 'reasoning'
  | 'requestDetails'
  | 'schedulingOptions'
  | 'technicians'
  | 'spareParts'
  | 'safetyQuality'
  | 'planSummary'
  | 'confirm'
  | 'success'
  | 'recommendation';

export type AgentReasoningItem = {
  label: string;
  tone?: 'info' | 'positive' | 'warning' | 'critical';
};

export type AgentQuickReply = {
  id: string;
  label: string;
  value: string;
};

export type AgentChatMessage = {
  id: string;
  role: AgentChatMessageRole;
  kind: AgentChatMessageKind;
  content?: string;
  reasons?: AgentReasoningItem[];
  quickReplies?: AgentQuickReply[];
  isRecommendation?: boolean;
  payload?: unknown;
  timestamp: string;
};

export type PlannedWorkOrder = {
  action: PlanningAgentAction;
  title: string;
  description: string;
  maintenanceType: string;
  equipment: string;
  equipmentCriticality: 'A' | 'B' | 'C';
  priority: MaintenancePriority;
  riskAssessment: PlanningAgentRiskAssessment;
  executionWindow?: PlanningAgentSchedulingOption;
  executionDay?: PlanningAgentExecutionDay;
  technician?: PlanningAgentTechnician;
  spareParts: PlanningAgentSparePart[];
  safetyRequirements: PlanningAgentSafetyPlan;
  qualityRequirements: PlanningAgentQualityPlan;
  linkedRequestId: string;
  linkedRequestCardId: string;
  linkedWorkOrderOrPm?: PlanningAgentWorkCandidate;
  source: PlanningAgentSource;
  status: 'Scheduled';
};

export type PlanningAgentState = {
  phase: PlanningAgentPhase;
  messages: AgentChatMessage[];
  plannedWorkOrder: Partial<PlannedWorkOrder>;
  awaitingConfirmation: boolean;
  selectedSchedulingOptionId?: string;
  selectedTechnicianId?: string;
};

export type PlanningAgentAdvanceResult = {
  state: PlanningAgentState;
  newMessages: AgentChatMessage[];
};
