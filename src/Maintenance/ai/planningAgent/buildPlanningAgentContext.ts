import type { MaintenanceCard } from '../../types';
import type {
  PlanningAgentContext,
  PlanningAgentSource,
  PlanningAgentSparePart,
} from './types';

type BoardRequestDetails = {
  requestId: string;
  maintenanceType: string;
  location: string;
  priority: MaintenanceCard['priority'];
  equipment: string;
  createdBy: string;
  activityType: string;
  downtime: string;
  quality: string;
  ehs: string;
  problemDescription: string;
};

type BoardLinkedWorkCandidate = {
  id: string;
  type: 'Preventive' | 'Corrective' | 'Breakdown' | 'Work Order';
  title: string;
  description: string;
  scheduledFor: string;
  assignee: string;
  status: string;
};

type BoardTechnicianAvailability = {
  name: string;
  status: string;
  value: number;
  recommended?: boolean;
  assigned?: boolean;
};

type BoardSparePartOption = {
  id: string;
  code: string;
  description: string;
  location: string;
  availableQuantity: number;
  defaultRequestedQuantity: number;
};

type BoardSafetyPlan = PlanningAgentContext['defaultSafetyPlan'];
type BoardQualityPlan = PlanningAgentContext['defaultQualityPlan'];
type BoardExecutionDay = PlanningAgentContext['defaultExecutionDay'];

type BuildPlanningAgentContextInput = {
  card: MaintenanceCard;
  source: PlanningAgentSource;
  requestCardId: string;
  requestDetails: BoardRequestDetails;
  equipmentCriticality: 'A' | 'B' | 'C';
  linkedWorkCandidates: BoardLinkedWorkCandidate[];
  technicianAvailability: BoardTechnicianAvailability[];
  sparePartOptions: BoardSparePartOption[];
  defaultSafetyPlan: BoardSafetyPlan;
  defaultQualityPlan: BoardQualityPlan;
  defaultExecutionDay: BoardExecutionDay;
  technicianSkills?: Record<string, string[]>;
};

function getStockState(available: number, requested: number): PlanningAgentSparePart['stockState'] {
  if (available <= 0) return 'out-of-stock';
  if (available < requested) return 'low-stock';
  return 'in-stock';
}

function buildSchedulingOptions(card: MaintenanceCard, linkedWorkCandidates: BoardLinkedWorkCandidate[]) {
  const pm = linkedWorkCandidates.find((candidate) => candidate.type === 'Preventive');
  return [
    {
      id: 'option1',
      title: pm ? `Together with ${pm.title}` : 'Wednesday production changeover window',
      description: pm ? 'Lowest downtime impact by combining with planned maintenance.' : 'Align with the next low-impact production window.',
      windowLabel: pm?.scheduledFor ?? 'Wed May 27, 2:00 PM – 5:00 PM',
      recommended: true,
      productionNote: 'Production has a planned changeover window on Wednesday from 2 PM to 5 PM.',
    },
    {
      id: 'option2',
      title: 'Immediate intervention',
      description: 'Fastest response with available technician coverage.',
      windowLabel: 'Today, next available shift window',
      productionNote: 'Higher production disruption risk during active run.',
    },
    {
      id: 'option3',
      title: 'Tomorrow during lower production load',
      description: 'Lowest production impact based on current schedule.',
      windowLabel: 'Thu May 28, 6:00 AM – 9:00 AM',
      productionNote: 'Night shift handover provides a short low-load window.',
    },
  ];
}

export function buildPlanningAgentContext({
  card,
  source,
  requestCardId,
  requestDetails,
  equipmentCriticality,
  linkedWorkCandidates,
  technicianAvailability,
  sparePartOptions,
  defaultSafetyPlan,
  defaultQualityPlan,
  defaultExecutionDay,
  technicianSkills = {},
}: BuildPlanningAgentContextInput): PlanningAgentContext {
  const pmCandidate = linkedWorkCandidates.find((candidate) => candidate.type === 'Preventive');

  return {
    source,
    cardId: card.id,
    requestCardId,
    cardTitle: card.title,
    requestDetails: {
      requestId: requestDetails.requestId,
      maintenanceType: requestDetails.maintenanceType,
      location: requestDetails.location,
      priority: requestDetails.priority,
      equipment: requestDetails.equipment,
      createdBy: requestDetails.createdBy,
      activityType: requestDetails.activityType,
      problemDescription: requestDetails.problemDescription || card.detail,
      attachmentAvailable: true,
      riskAssessment: {
        downtime: requestDetails.downtime as 'Low' | 'Medium' | 'High',
        quality: requestDetails.quality as 'Low' | 'Medium' | 'High',
        ehs: requestDetails.ehs as 'Low' | 'Medium' | 'High',
      },
    },
    equipmentCriticality,
    criticalityLabel: equipmentCriticality === 'A' ? 'high criticality' : equipmentCriticality === 'B' ? 'medium criticality' : 'lower criticality',
    linkedWorkCandidates,
    technicians: technicianAvailability.map((technician, index) => ({
      id: `tech-${index}-${technician.name.toLowerCase().replace(/\s+/g, '-')}`,
      name: technician.name,
      status: technician.status,
      availabilityPercent: technician.value,
      recommended: technician.recommended,
      assigned: technician.assigned,
      skills: technicianSkills[technician.name],
      workloadSummary: technician.recommended ? 'best skill and workload fit for this window' : undefined,
    })),
    spareParts: sparePartOptions.map((part) => ({
      id: part.id,
      code: part.code,
      description: part.description,
      location: part.location,
      availableQuantity: part.availableQuantity,
      requestedQuantity: part.defaultRequestedQuantity,
      stockState: getStockState(part.availableQuantity, part.defaultRequestedQuantity),
    })),
    schedulingOptions: buildSchedulingOptions(card, linkedWorkCandidates),
    defaultSafetyPlan,
    defaultQualityPlan,
    defaultExecutionDay,
    productionWindows: [
      'Production has a planned changeover window on Wednesday from 2 PM to 5 PM.',
      'Line A has a planned shutdown window on Friday for preventive checks.',
    ],
    upcomingPmNote: pmCandidate
      ? `There is a PM already scheduled for this equipment on ${pmCandidate.scheduledFor}.`
      : undefined,
  };
}

export const demoSa204PlanningCard: MaintenanceCard = {
  id: 'mr-demo-sa204',
  title: 'Syringe Assembly Machine SA-204',
  detail: 'During the last production run, the equipment stopped three times due to abnormal vibration in the assembly head. Increased noise and slight misalignment were observed, especially at higher speeds.',
  assignee: 'Maria Silva',
  due: 'May 27',
  priority: 'High',
  equipmentCriticality: 'A',
};

export function buildDemoSa204PlanningContext(
  input: Omit<BuildPlanningAgentContextInput, 'card' | 'source' | 'requestDetails' | 'equipmentCriticality' | 'requestCardId'>,
): PlanningAgentContext {
  return buildPlanningAgentContext({
    ...input,
    card: demoSa204PlanningCard,
    source: 'request',
    requestCardId: demoSa204PlanningCard.id,
    equipmentCriticality: 'A',
    requestDetails: {
      requestId: 'MR 606034670',
      maintenanceType: 'Corrective',
      location: 'Zone 1 - Line A',
      priority: 'High',
      equipment: 'Syringe Assembly Machine SA-204 (Criticality A)',
      createdBy: 'Maria Silva',
      activityType: 'Mechanical',
      downtime: 'High',
      quality: 'Medium',
      ehs: 'Low',
      problemDescription: demoSa204PlanningCard.detail,
    },
  });
}
