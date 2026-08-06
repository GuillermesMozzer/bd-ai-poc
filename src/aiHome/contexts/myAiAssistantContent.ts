export const MY_AI_ASSISTANT_SITE_NEWS_HEADING = 'Site news actions right now';

export const MY_AI_ASSISTANT_INTRO_COPY = {
  directorSummary:
    'From a director view, Columbus West is the top recovery risk, Juiz de Fora is the next escalation watch, and Fraga remains under quality pressure for a third straight shift.',
  priorityPrompt:
    'These are the site-news actions I would move first. Tap one and I will open the right flow.',
  operatorSummary:
    "I've prepared your priorities for this shift based on your assigned CIL and centerline work and today's changeover.",
  operatorPriorityPrompt:
    'Here are your recommended priorities for your shift right now. Tap one and I will guide you step by step in the chat.',
  technicianSummary:
    "I've prepared your priorities based on the work orders assigned to you, your maintenance calendar, and the analytics that need attention today.",
  technicianPriorityPrompt:
    'Here are your recommended technician priorities right now. Tap one and I will guide the next step in the chat.',
  plannerSummary:
    "I've prepared your priorities for this planning cycle based on forecast changes, capacity constraints, MPS approvals, schedule risks, and production lineage exceptions.",
  plannerPriorityPrompt:
    'Here are your recommended priorities right now. Tap one and I will show the context before opening the workflow.',
} as const;

export const MY_AI_ASSISTANT_SITE_CONTEXT_COPY = {
  sitePriorityLead:
    "I would start with the NC raised this morning, your team maintenance requests, the ESOs awaiting review, and the leader workstation view around those priorities.",
  sitePriorityPrompt:
    'These are the recommended priorities for {siteName} right now. Tap one and I will keep guiding the flow in the chat.',
} as const;

export function buildMyAiAssistantGreeting(greetingLabel: string, firstName: string) {
  return `${greetingLabel} ${firstName}. I reviewed the overnight activity, site watchlist, and this morning handoff for you.`;
}

export function buildMyAiAssistantSiteContextGreeting(input: {
  greetingLabel: string;
  firstName: string;
  siteName: string;
  scopeLabel: string;
  path: string[];
}) {
  const { greetingLabel, firstName, siteName, scopeLabel, path } = input;
  return `${greetingLabel}, ${firstName}. I am focused on ${siteName} now, with your ${scopeLabel.toLowerCase()} view set to ${path.join(' / ')}. ${MY_AI_ASSISTANT_SITE_CONTEXT_COPY.sitePriorityLead}`;
}

export function buildMyAiAssistantSitePriorityPrompt(siteName: string) {
  return MY_AI_ASSISTANT_SITE_CONTEXT_COPY.sitePriorityPrompt.replace('{siteName}', siteName);
}

export function buildMyAiAssistantSitePriorityHeading(siteName: string) {
  return `Recommended priorities for ${siteName}`;
}

export function buildMyAiAssistantOperatorPriorityHeading() {
  return 'Recommended priorities for your shift';
}

export function buildMyAiAssistantTechnicianPriorityHeading() {
  return 'Recommended priorities for your maintenance shift';
}

export function buildMyAiAssistantPlannerPriorityHeading() {
  return 'Recommended priorities for your planning cycle';
}

export type MyAiAssistantDirectorCardContent = {
  id: string;
  title: string;
  detail: string;
  owner: string;
  severity: string;
  color: string;
  siteName?: string;
  supportingText?: string;
};

export type MyAiAssistantUrgentTaskContent = {
  id: string;
  title: string;
  detail: string;
  owner: string;
  severity: string;
  color: string;
};

export const MY_AI_ASSISTANT_DIRECTOR_CARD_CONTENT: MyAiAssistantDirectorCardContent[] = [
  {
    id: 'open-global-view',
    title: 'Open Global View',
    detail: 'Scan network risk, top issue sites, and cross-site movement first',
    owner: 'Global View',
    severity: 'Director Lens',
    color: '#044ED7',
  },
  {
    id: 'columbus-west-tower',
    title: 'Columbus West Tower',
    detail: 'OEE dropped to 72% due to downtime on Packaging Line 3.',
    owner: 'Control Tower',
    severity: 'Highest Risk',
    color: '#E43B46',
    siteName: 'Columbus West',
    supportingText:
      'AI detected a recurring pattern of unplanned stops between 14:00 and 16:00, impacting overall equipment effectiveness across the shift.',
  },
  {
    id: 'juiz-de-fora-tower',
    title: 'Juiz de Fora Tower',
    detail: 'Safety incidents increased in final assembly during the last shift.',
    owner: 'Control Tower',
    severity: 'Watch Site',
    color: '#F97316',
    siteName: 'Juiz de Fora',
    supportingText:
      'Quality losses and rework are still pressuring recovery, so the local team is tracking the next 8 hours with tighter escalation routines.',
  },
  {
    id: 'fraga-tower',
    title: 'Fraga Tower',
    detail: 'Quality trend remains below target for the third shift in a row.',
    owner: 'Control Tower',
    severity: 'Quality Watch',
    color: '#F59E0B',
    siteName: 'Fraga',
    supportingText:
      'The plant is holding deliveries, but yield variability is reducing flexibility and creating extra checks on the next release window.',
  },
  {
    id: 'sandy-tower',
    title: 'Sandy Tower',
    detail: 'Top performer today with OEE recovering across all key lines.',
    owner: 'Control Tower',
    severity: 'Best Buffer',
    color: '#22C55E',
    siteName: 'Sandy',
    supportingText:
      'Sandy is holding the cleanest execution rhythm in the network, helping absorb regional support without adding new delivery risk.',
  },
  {
    id: 'temse-tower',
    title: 'Temse Tower',
    detail: 'OTIF is stable and above target while export lanes stay on plan.',
    owner: 'Control Tower',
    severity: 'Stable Node',
    color: '#06B6D4',
    siteName: 'Temse',
    supportingText:
      'The DC remains one of the healthiest logistics nodes, with strong inventory accuracy and no current signal of transport disruption.',
  },
  {
    id: 'franklin-lakes-tower',
    title: 'Franklin Lakes Tower',
    detail: 'Building health is improving after HVAC stabilization in the west wing.',
    owner: 'Control Tower',
    severity: 'Recovery Watch',
    color: '#8B5CF6',
    siteName: 'Franklin Lakes',
    supportingText:
      'Facilities cleared the main comfort issue, but a small alarm backlog remains open while the team validates utility performance.',
  },
] as const;

export const MY_AI_ASSISTANT_OPERATOR_CARD_CONTENT: MyAiAssistantDirectorCardContent[] = [
  {
    id: 'operator-cil-task',
    title: "Today's CIL Task",
    detail: 'Zone A Cutter starts at 10:00. Expected duration: 18 minutes.',
    owner: 'CIL & Centerline',
    severity: 'On Schedule',
    color: '#044ED7',
  },
  {
    id: 'operator-centerline-task',
    title: "Today's Centerline Task",
    detail: 'Zone B Tipper starts at 11:00. Expected duration: 96 minutes.',
    owner: 'CIL & Centerline',
    severity: 'Due Next',
    color: '#7C3AED',
  },
  {
    id: 'operator-changeover',
    title: "Today's Changeover",
    detail: 'SKU A to SKU B at 08:15 AM. Planned: 99 minutes | Previous: 106 minutes.',
    owner: 'Changeover',
    severity: 'On Schedule',
    color: '#F97316',
  },
  {
    id: 'operator-build-workstation',
    title: 'Build My Workstation',
    detail: 'Assemble my operator view with CIL, centerline, and changeover priorities.',
    owner: 'Operator View',
    severity: 'Recommended',
    color: '#0F766E',
  },
] as const;

export const MY_AI_ASSISTANT_TECHNICIAN_CARD_CONTENT: MyAiAssistantDirectorCardContent[] = [
  {
    id: 'technician-assigned-work-orders',
    title: 'My Assigned Work Orders',
    detail: 'Review the scheduled work orders assigned to you and jump into the queue quickly.',
    owner: 'Work Orders',
    severity: '3 Scheduled',
    color: '#044ED7',
  },
  {
    id: 'technician-maintenance-calendar',
    title: 'Maintenance Calendar',
    detail: 'Open the maintenance calendar to review the week plan and scheduled interventions.',
    owner: 'Calendar',
    severity: '21 Work Orders',
    color: '#0F766E',
  },
  {
    id: 'technician-maintenance-analytics',
    title: 'Maintenance Analytics',
    detail: 'Review MTTR, PM compliance, availability, and maintenance performance signals.',
    owner: 'Analytics',
    severity: 'Needs Attention',
    color: '#F97316',
  },
  {
    id: 'technician-cbm-pdm',
    title: 'CBM & PdM',
    detail: 'Open critical condition alerts, high-risk assets, and predictive maintenance signals.',
    owner: 'Asset Health',
    severity: '7 Critical Alerts',
    color: '#E43B46',
  },
  {
    id: 'technician-build-workstation',
    title: 'Build My Workstation',
    detail: 'Assemble my maintenance technician view with work orders, calendar, equipment status, and spare parts.',
    owner: 'Maintenance Technician',
    severity: 'Recommended',
    color: '#7C3AED',
  },
] as const;

export const MY_AI_ASSISTANT_PLANNER_CARD_CONTENT: MyAiAssistantDirectorCardContent[] = [
  {
    id: 'planner-priority-work-orders',
    title: 'Planner Priority Queue',
    detail: 'Review the planning items most likely to block the next release window.',
    owner: 'Planning Queue',
    severity: '4 Priority Items',
    color: '#044ED7',
  },
  {
    id: 'planner-capacity-risk',
    title: 'Capacity Risk Review',
    detail: 'Check constrained lines, utilization pressure, and capacity exceptions before rescheduling.',
    owner: 'Capacity Planning',
    severity: '2 Constraints',
    color: '#F97316',
  },
  {
    id: 'planner-mps-approvals',
    title: 'MPS Approval Watch',
    detail: 'Review MPS approvals, demand changes, and release readiness for the next planning cycle.',
    owner: 'MPS',
    severity: 'Needs Approval',
    color: '#7C3AED',
  },
  {
    id: 'planner-schedule-risk',
    title: 'Schedule & Order Risk',
    detail: 'Open the schedule/order planning flow with risk context and impacted work orders.',
    owner: 'Scheduling',
    severity: 'At Risk',
    color: '#E43B46',
  },
  {
    id: 'planner-lineage',
    title: 'Production Lineage Exceptions',
    detail: 'Inspect planning lineage exceptions and AI reasoning behind recent plan changes.',
    owner: 'Lineage',
    severity: '3 Exceptions',
    color: '#0F766E',
  },
] as const;

export function buildMyAiAssistantUrgentTaskContent(): MyAiAssistantUrgentTaskContent[] {
  return [
    {
      id: 'nc-raised-this-morning',
      title: 'NC Raised This Morning',
      detail: 'Line 3 sealing defect needs Tier 1 review',
      owner: 'Quality',
      severity: 'High',
      color: '#E43B46',
    },
    {
      id: 'team-maintenance-requests',
      title: 'My Team Maintenance Requests',
      detail: 'Open the requests created by your team and review the list with AI guidance',
      owner: 'Maintenance',
      severity: 'Leader Review',
      color: '#F97316',
    },
    {
      id: 'action-priorities-today',
      title: 'My Action Priorities Today',
      detail: '5 actions can be elevated using due dates, blockers, and repeated patterns',
      owner: 'Action Tracker',
      severity: 'Important',
      color: '#4F46E5',
    },
    {
      id: 'team-esos-review',
      title: 'My Team ESOs',
      detail: '3 awaiting review need leader attention before the monthly close',
      owner: 'ESO',
      severity: '3 Review',
      color: '#FF8A00',
    },
    {
      id: 'shift-coverage-review',
      title: 'Shift Coverage Review',
      detail: '1 absence may require a team rebalance today',
      owner: 'Shift Schedule',
      severity: 'Optimize',
      color: '#F59E0B',
    },
    {
      id: 'leader-build-workstation',
      title: 'Build My Workstation',
      detail: 'Assemble my leader workstation with team maintenance requests and follow-up priorities',
      owner: 'Leader View',
      severity: 'Recommended',
      color: '#0F766E',
    },
  ];
}

