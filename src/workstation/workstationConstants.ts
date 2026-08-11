import { tokenBrand, tokenError, tokenWarning, tokenSuccess, tokenInfo, tokenNeutral, tokenText, tokenCommon, workstationVisuals, workstationChartSemantic, workstationPriorityTone, workstationSqdcpTone } from './theme';
import {
  DashboardCustomize as CustomizeIcon,
  Engineering as LeaderIcon,
  BuildCircle as MaintenanceIcon,
  Inventory2 as MaterialIcon,
  TaskAlt as QualityIcon,
} from '@mui/icons-material';
import type { LossFocusedMetricId } from './components/lossFocusedKpisData';
import type { CustomWidgetDataset, CustomWidgetEditSection, WorkstationLayoutBreakpoint, WorkstationResponsiveLayouts, WorkstationLayoutItem } from './types';

export const workstationBreakpoints = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };
export const workstationCols = { lg: 12, md: 12, sm: 8, xs: 4, xxs: 2 };
export const workstationBreakpointKeys: WorkstationLayoutBreakpoint[] = ['lg', 'md', 'sm', 'xs', 'xxs'];

export const shellLessWidgetIds = new Set([
  'line-status-overview',
  'safety-operator',
  'quality-operator',
  'oee-kpi',
  'availability-kpi',
  'performance-kpi',
  'quality-kpi',
  'fpy-kpi',
  'scrap-kpi',
  'downtime-kpi',
  'energy-unit-kpi',
  'shift-execution',
  'work-orders',
  'inbound_sla_chart',
  'active_loads_timeline',
  'line_shortage_risk',
  'spacex_shipping_gating',
]);

export const personalWidgetDefinitions = [
  {
    id: 'line-status-overview',
    category: 'Production',
    label: 'Operator Overview',
    description: 'Operator-focused line snapshot with work order progress, alerts, AI insights, timeline, KPIs, and next centerline activity.',
    tags: ['operator overview', 'line status', 'work order', 'alerts', 'ai insights', 'centerline'],
    defaultLayout: { x: 0, y: 0, w: 12, h: 22, minW: 6, minH: 14 },
  },
  {
    id: 'operator-cil',
    category: 'Production',
    label: 'CIL Operator',
    description: 'Today CIL tasks with operator execution and quick start actions.',
    tags: ['cil', 'cilt', 'operator', 'execution', 'routines'],
    defaultLayout: { x: 0, y: 0, w: 6, h: 10, minW: 4, minH: 8 },
  },
  {
    id: 'operator-centerline',
    category: 'Production',
    label: 'Centerline Operator',
    description: 'Today Centerline checks with operator readings and quick start actions.',
    tags: ['centerline', 'operator', 'parameters', 'readings', 'execution'],
    defaultLayout: { x: 6, y: 0, w: 6, h: 10, minW: 4, minH: 8 },
  },
  {
    id: 'cil',
    category: 'Production',
    label: 'CIL',
    description: 'CIL status, execution performance, and current activity readiness.',
    tags: ['cil', 'cilt', 'activities', 'readiness', 'performance'],
    defaultLayout: { x: 0, y: 10, w: 6, h: 10, minW: 4, minH: 8 },
  },
  {
    id: 'centerline',
    category: 'Production',
    label: 'Centerline',
    description: 'Centerline checks, parameter adherence, and current activity readiness.',
    tags: ['centerline', 'parameters', 'readings', 'stability', 'performance'],
    defaultLayout: { x: 6, y: 10, w: 6, h: 10, minW: 4, minH: 8 },
  },
  {
    id: 'leader-cil',
    category: 'Production',
    label: 'CIL Leader',
    description: 'Leader view for CIL status, review, and follow-up.',
    tags: ['cil', 'cilt', 'leader', 'review', 'follow-up'],
    defaultLayout: { x: 0, y: 10, w: 6, h: 10, minW: 4, minH: 8 },
  },
  {
    id: 'leader-centerline',
    category: 'Production',
    label: 'Centerline Leader',
    description: 'Leader view for Centerline status, review, and follow-up.',
    tags: ['centerline', 'leader', 'review', 'parameters', 'follow-up'],
    defaultLayout: { x: 6, y: 10, w: 6, h: 10, minW: 4, minH: 8 },
  },
  {
    id: 'shift-schedule',
    category: 'Production',
    label: 'Shift Schedule',
    description: 'Today shift, weekly hours, breaks, and assignment context.',
    defaultLayout: { x: 0, y: 8, w: 6, h: 8, minW: 4, minH: 5 },
  },
  {
    id: 'shift-schedule-leader',
    category: 'Production',
    label: 'Shift Schedule Leader',
    description: 'Leader shift coverage, crew availability, and schedule risks.',
    defaultLayout: { x: 6, y: 8, w: 6, h: 9, minW: 4, minH: 7 },
  },
  {
    id: 'operator-equipment-changeover',
    category: 'Delivery',
    label: 'Equipment Setup Changeover Operator',
    description: 'Today changeover status and next schedule with quick start.',
    tags: ['equipment setup changeover', 'changeover', 'operator', 'setup', 'execution'],
    defaultLayout: { x: 0, y: 20, w: 6, h: 10, minW: 4, minH: 8 },
  },
  {
    id: 'equipment-changeover',
    category: 'Delivery',
    label: 'Equipment Setup Changeover',
    description: 'Changeover readiness, performance, and current setup activity status.',
    tags: ['equipment setup changeover', 'changeover', 'setup', 'readiness', 'performance'],
    defaultLayout: { x: 0, y: 30, w: 6, h: 10, minW: 4, minH: 8 },
  },
  {
    id: 'leader-equipment-changeover',
    category: 'Delivery',
    label: 'Equipment Setup Changeover Leader',
    description: 'Leader view for changeover readiness, validation, and follow-up.',
    tags: ['equipment setup changeover', 'changeover', 'leader', 'review', 'validation'],
    defaultLayout: { x: 6, y: 20, w: 6, h: 10, minW: 4, minH: 8 },
  },
  {
    id: 'work-orders',
    category: 'Maintenance',
    label: 'My Work Orders',
    description: 'Work orders assigned to me for today and the upcoming days.',
    tags: ['maintenance', 'work orders', 'assigned', 'technician', 'operator'],
    defaultLayout: { x: 0, y: 0, w: 7, h: 12, minW: 4, minH: 8 },
  },
  {
    id: 'my-maintenance-backlog',
    category: 'Maintenance',
    label: 'Maintenance Backlog',
    description: 'Maintenance requests and unplanned work orders waiting for planning, assignment, or prioritization.',
    tags: ['maintenance', 'backlog', 'requests', 'work orders', 'planning'],
    defaultLayout: { x: 7, y: 0, w: 5, h: 12, minW: 4, minH: 8 },
  },
  {
    id: 'maintenance-hub',
    category: 'Maintenance',
    label: 'Maintenance Hub',
    description: 'High-level overview of what is happening now and what is coming next in maintenance.',
    defaultLayout: { x: 6, y: 32, w: 6, h: 8, minW: 4, minH: 6 },
  },
  {
    id: 'maintenance-planner',
    category: 'Maintenance',
    label: 'Maintenance Planner',
    description: 'Planning queue, scheduling readiness, labor capacity, and parts readiness for upcoming maintenance work.',
    tags: ['maintenance', 'planner', 'planning', 'schedule', 'capacity'],
    defaultLayout: { x: 6, y: 40, w: 6, h: 8, minW: 5, minH: 6 },
  },
  {
    id: 'maintenance-calendarwidget',
    category: 'Maintenance',
    label: 'Maintenance Calendar',
    description: 'Calendar view of upcoming maintenance work orders, maintenance plans, shutdowns, and changeovers.',
    tags: ['maintenance', 'calendar', 'schedule', 'work orders', 'PM'],
    defaultLayout: { x: 0, y: 24, w: 6, h: 14, minW: 4, minH: 10 },
  },
  {
    id: 'equipment-status',
    category: 'Maintenance',
    label: 'Equipment Status',
    description: 'Operational equipment availability, critical metrics, assets requiring attention, and quick actions.',
    defaultLayout: { x: 0, y: 12, w: 5, h: 12, minW: 4, minH: 8 },
  },
  {
    id: 'maintenance-analytics',
    category: 'Maintenance',
    label: 'Maintenance Analytics',
    description: 'Maintenance KPI health, reliability trends, highlights, and analytics actions.',
    defaultLayout: { x: 6, y: 24, w: 6, h: 14, minW: 4, minH: 7 },
  },
  {
    id: 'molding',
    category: 'Maintenance',
    label: 'Molding',
    description: 'Mold cavity availability, molding-level cavity percentages, and cavity status list.',
    tags: ['maintenance', 'molding', 'mold', 'cavity', 'availability'],
    defaultLayout: { x: 0, y: 42, w: 6, h: 10, minW: 5, minH: 8 },
  },
  {
    id: 'maintenance-cbm-pdm',
    category: 'Maintenance',
    label: 'CBM & PdM',
    description: 'Condition-based and predictive maintenance alerts, monitored assets, high-risk assets, and quick actions.',
    tags: ['maintenance', 'cbm', 'pdm', 'condition monitoring', 'predictive maintenance', 'sensor alerts'],
    defaultLayout: { x: 6, y: 33, w: 6, h: 9, minW: 5, minH: 7 },
  },
  {
    id: 'spare-parts-monitor',
    category: 'Maintenance',
    label: 'Spare Parts Monitor',
    description: 'Monitor spare parts risks that may impact maintenance execution, planning, and readiness.',
    tags: ['spare parts', 'inventory', 'maintenance', 'materials'],
    defaultLayout: { x: 5, y: 12, w: 7, h: 12, minW: 5, minH: 8 },
  },
  {
    id: 'tier-management',
    category: 'Action Management',
    label: 'Tier Management',
    description: 'Shopfloor SQDCP tier summary with top issues and action shortcuts.',
    defaultLayout: { x: 6, y: 15, w: 6, h: 8, minW: 5, minH: 7 },
  },
  {
    id: 'quick-actions',
    category: 'Action Management',
    label: 'Quick Actions',
    description: 'Large tap targets for common operator requests, support, issues, ESOs, and shift swaps.',
    tags: ['quick actions', 'operator', 'support', 'maintenance', 'eso', 'shift swap'],
    defaultLayout: { x: 0, y: 15, w: 6, h: 6, minW: 2, minH: 4 },
  },
  {
    id: 'my-tasks',
    category: 'Production',
    label: 'My Tasks',
    description: 'Consolidated CIL, Centerline, and Changeover operator tasks with timing, reminders, and quick actions.',
    defaultLayout: { x: 0, y: 24, w: 6, h: 9, minW: 4, minH: 7 },
  },
  {
    id: 'my-activities-kpis',
    category: 'Production',
    label: 'My Activities KPIs',
    description: 'Summary of activities created and performed across ESOs, CILs, centerlines, and maintenance requests.',
    tags: ['activities', 'kpis', 'eso', 'cil', 'centerline', 'maintenance requests'],
    defaultLayout: { x: 0, y: 33, w: 8, h: 7, minW: 4, minH: 5 },
  },
  {
    id: 'my-esos',
    category: 'Safety',
    label: 'My ESOs',
    description: 'Operator ESO count, categories, target progress, and recent submissions.',
    defaultLayout: { x: 0, y: 23, w: 10, h: 13, minW: 4, minH: 12 },
  },
  {
    id: 'eso',
    category: 'Safety',
    label: 'My Team ESOs',
    description: 'Team ESO summary, insights, report trend, and top causes.',
    defaultLayout: { x: 0, y: 36, w: 10, h: 13, minW: 4, minH: 13 },
  },
  {
    id: 'delivery',
    category: 'Delivery',
    label: 'Delivery',
    description: 'Work order delivery progress, OEE trend, and line-level delivery performance.',
    defaultLayout: { x: 0, y: 33, w: 4, h: 12, minW: 2, minH: 10 },
  },
  {
    id: 'three-p-tracking',
    category: 'Production',
    label: '3P Tracking',
    description: 'Presence, punctuality, and participation status toggles.',
    defaultLayout: { x: 4, y: 32, w: 4, h: 4, minW: 2, minH: 2 },
  },
  {
    id: 'loss-focused-kpis',
    category: 'Production',
    label: 'Lean Focused KPIs',
    description: 'Breakdown and changeover loss KPIs with trends, lines, and linked actions.',
    defaultLayout: { x: 8, y: 32, w: 4, h: 12, minW: 2, minH: 10 },
  },
  {
    id: 'safety',
    category: 'Safety',
    label: 'Safety',
    description: 'Safety calendar, current streak, and incident KPIs.',
    defaultLayout: { x: 0, y: 45, w: 4, h: 12, minW: 2, minH: 7 },
  },
  {
    id: 'safety-operator',
    category: 'Safety',
    label: 'Safety Operator',
    description: 'Operator-focused safety calendar visual without tier KPI cards.',
    tags: ['safety', 'operator', 'calendar', 'sqdc'],
    defaultLayout: { x: 0, y: 69, w: 4, h: 9, minW: 2, minH: 4 },
  },
  {
    id: 'quality',
    category: 'Quality',
    label: 'Quality',
    description: 'Quality calendar, actions, complaints, NCRs, and CAPAs.',
    defaultLayout: { x: 4, y: 44, w: 4, h: 12, minW: 2, minH: 7 },
  },
  {
    id: 'quality-operator',
    category: 'Quality',
    label: 'Quality Operator',
    description: 'Operator-focused quality calendar visual without tier KPI cards.',
    tags: ['quality', 'operator', 'calendar', 'sqdc'],
    defaultLayout: { x: 4, y: 69, w: 4, h: 9, minW: 2, minH: 4 },
  },
  {
    id: 'action-tracker',
    category: 'Action Management',
    label: 'Action Tracker',
    description: 'Operational dashboard for action health, risks, AI prioritization, and follow-up.',
    defaultLayout: { x: 0, y: 57, w: 12, h: 12, minW: 8, minH: 8 },
  },
  {
    id: 'communication',
    category: 'People',
    label: 'Communication',
    description: 'Shift announcements, handoff notes, and team reminders.',
    defaultLayout: { x: 8, y: 44, w: 4, h: 4, minW: 2, minH: 3 },
  },
  {
    id: 'recognition',
    category: 'People',
    label: 'Recognition',
    description: 'Team shout-outs, streaks, and positive performance moments.',
    defaultLayout: { x: 8, y: 48, w: 4, h: 4, minW: 2, minH: 3 },
  },
  {
    id: 'people',
    category: 'People',
    label: 'People',
    description: 'Absenteeism, days off, medical leave, and vacation trends by period and shift.',
    defaultLayout: { x: 8, y: 52, w: 4, h: 11, minW: 2, minH: 10 },
  },
  {
    id: 'cost',
    category: 'Cost',
    label: 'Cost',
    description: 'Scrap and downtime cost signals with hourly, daily, and monthly trend controls.',
    defaultLayout: { x: 4, y: 56, w: 4, h: 12, minW: 2, minH: 10 },
  },
  {
    id: 'oee-monitoring',
    category: 'OEE',
    label: 'OEE Line Monitor',
    description: '3D line layout visualization of OEE status with interactive zones and status warnings.',
    defaultLayout: { x: 0, y: 0, w: 8, h: 12, minW: 4, minH: 8 },
  },
  {
    id: 'three-d-view',
    category: 'OEE',
    label: '3D View Component',
    description: 'Same Shift Logbook 3D equipment view with orbit, zoom, hotspots, and native hover behavior.',
    tags: ['3d', 'logbook', 'equipment view', 'digital twin', 'hotspots'],
    defaultLayout: { x: 0, y: 0, w: 8, h: 17, minW: 4, minH: 12 },
  },
  {
    id: 'oee-line-overview',
    category: 'OEE',
    label: 'OEE Line Overview',
    description: 'Comprehensive line-level overview of OEE, yield, line speed, downtime, shift production, and work order status.',
    defaultLayout: { x: 0, y: 0, w: 8, h: 8, minW: 4, minH: 5 },
  },
  {
    id: 'oee-top-losses',
    category: 'OEE',
    label: 'OEE Top Losses',
    description: 'Detailed view of top losses by cell/zone with interactive grouping and bottleneck filters.',
    defaultLayout: { x: 0, y: 0, w: 6, h: 6, minW: 3, minH: 3 },
  },
  {
    id: 'shift-logbook',
    category: 'Production',
    label: 'Shift Logbook',
    description: 'Top recent events and issues across categories.',
    defaultLayout: { x: 0, y: 0, w: 6, h: 9, minW: 4, minH: 7 },
  },
  {
    id: 'text-box',
    category: 'Others',
    label: 'Text Box',
    description: 'Editable rich text note with saved formatting, background, font size, and alignment.',
    tags: ['text box', 'note', 'annotation', 'message'],
    defaultLayout: { x: 0, y: 0, w: 4, h: 5, minW: 2, minH: 3 },
  },
  {
    id: 'inbound_sla_chart',
    category: 'Logistics',
    label: 'KPI: Inbound Dock-to-Stock SLA',
    description: 'Real-time monitoring of inbound receiving and release cycle time.',
    tags: ['logistics', 'inbound', 'sla', 'dock-to-stock'],
    defaultLayout: { x: 0, y: 0, w: 6, h: 10, minW: 4, minH: 8 },
  },
  {
    id: 'active_loads_timeline',
    category: 'Logistics',
    label: 'Sterilization Load Tracking',
    description: 'Physical custody of trucks in transit with an external provider (Sterigenics).',
    tags: ['logistics', 'sterilization', 'timeline', 'sterigenics'],
    defaultLayout: { x: 0, y: 0, w: 4, h: 10, minW: 3, minH: 8 },
  },
  {
    id: 'line_shortage_risk',
    category: 'Logistics',
    label: 'Line Shortage Risk',
    description: 'Picking queues prioritized by imminent line-stop risk.',
    tags: ['logistics', 'shortage', 'picking', 'line stop'],
    defaultLayout: { x: 0, y: 0, w: 6, h: 10, minW: 4, minH: 8 },
  },
  {
    id: 'spacex_shipping_gating',
    category: 'Logistics',
    label: 'SpaceX Shipping Gating Console',
    description: 'Compliance status of the 4 release gates before loading the truck.',
    tags: ['logistics', 'shipping', 'spacex', 'gating'],
    defaultLayout: { x: 0, y: 0, w: 4, h: 10, minW: 3, minH: 8 },
  },
] as const;

export type PersonalWidgetId = typeof personalWidgetDefinitions[number]['id'];

export const personalWidgetMap = personalWidgetDefinitions.reduce((map, widget) => {
  map[widget.id] = widget;
  return map;
}, {} as Record<PersonalWidgetId, typeof personalWidgetDefinitions[number]>);

export const personalWidgetIds = personalWidgetDefinitions.map((widget) => widget.id);
export const personalWidgetCategories = ['Production', 'Quality', 'Safety', 'Delivery', 'People', 'Cost', 'OEE', 'Action Management', 'Maintenance', 'Logistics', 'Others', 'My Widgets'] as const;
export const personalWidgetDomains = ['All', ...personalWidgetCategories] as const;
export const personalLayoutSchemaVersion = 37;

export const defaultPersonalVisibleWidgetIds: PersonalWidgetId[] = [
  'operator-cil',
  'operator-centerline',
  'shift-schedule',
  'shift-schedule-leader',
  'operator-equipment-changeover',
  'work-orders',
  'my-maintenance-backlog',
  'maintenance-cbm-pdm',
  'tier-management',
  'quick-actions',
  'my-tasks',
  'my-esos',
  'eso',
  'delivery',
  'three-p-tracking',
  'loss-focused-kpis',
  'safety',
  'quality',
  'action-tracker',
  'communication',
  'recognition',
  'people',
  'cost',
  'oee-monitoring',
  'oee-line-overview',
  'oee-top-losses',
  'shift-logbook',
];

export type PersonalWidgetDomain = typeof personalWidgetDomains[number];

export const personalWidgetDomainMap: Record<Exclude<PersonalWidgetDomain, 'All'>, PersonalWidgetId[]> = {
  Production: ['line-status-overview', 'operator-cil', 'operator-centerline', 'cil', 'centerline', 'leader-cil', 'leader-centerline', 'shift-schedule', 'shift-schedule-leader', 'my-tasks', 'my-activities-kpis', 'three-p-tracking', 'loss-focused-kpis', 'shift-logbook'],
  Quality: ['quality', 'quality-operator'],
  Safety: ['safety', 'safety-operator', 'my-esos', 'eso'],
  Delivery: ['delivery', 'operator-equipment-changeover', 'equipment-changeover', 'leader-equipment-changeover'],
  People: ['communication', 'recognition', 'people'],
  Cost: ['cost'],
  OEE: ['oee-monitoring', 'three-d-view', 'oee-line-overview', 'oee-top-losses'],
  'Action Management': ['action-tracker', 'tier-management', 'quick-actions'],
  Maintenance: ['work-orders', 'my-maintenance-backlog', 'maintenance-hub', 'maintenance-planner', 'maintenance-calendarwidget', 'equipment-status', 'maintenance-analytics', 'molding', 'maintenance-cbm-pdm', 'spare-parts-monitor'],
  Logistics: ['inbound_sla_chart', 'active_loads_timeline', 'line_shortage_risk', 'spacex_shipping_gating'],
  Others: ['text-box'],
  'My Widgets': [],
};

export const textBoxWidgetTemplateId = 'text-box';

export function isTextBoxWidgetInstanceId(widgetId: string) {
  return widgetId === textBoxWidgetTemplateId || widgetId.startsWith(`${textBoxWidgetTemplateId}-`);
}

export function getPersonalWidgetDefinition(widgetId: string) {
  return personalWidgetMap[widgetId as PersonalWidgetId] ?? (isTextBoxWidgetInstanceId(widgetId) ? personalWidgetMap[textBoxWidgetTemplateId] : undefined);
}

export const personalWidgetAccentMap: Record<PersonalWidgetDomain, { bg: string; fg: string; border: string }> = {
  All: { bg: tokenNeutral.lighter, fg: tokenBrand.dark, border: tokenBrand.lighter },
  Production: { bg: tokenNeutral.lighter, fg: tokenBrand.main, border: tokenBrand.lighter },
  Quality: { bg: tokenNeutral.lighter, fg: tokenSuccess.darker, border: tokenSuccess.main },
  Safety: { bg: tokenNeutral.lighter, fg: tokenError.darker, border: tokenError.lighter },
  Delivery: { bg: tokenNeutral.lighter, fg: tokenBrand.main, border: tokenBrand.lighter },
  People: { bg: tokenNeutral.lighter, fg: tokenError.main, border: tokenError.lighter },
  Cost: { bg: tokenNeutral.lighter, fg: tokenSuccess.darkest, border: tokenSuccess.dark },
  OEE: { bg: tokenWarning.lightest, fg: tokenWarning.darker, border: tokenWarning.main },
  'Action Management': { bg: tokenNeutral.lightest, fg: tokenBrand.main, border: workstationVisuals.textMuted },
  Maintenance: { bg: tokenNeutral.lighter, fg: tokenInfo.darker, border: tokenInfo.main },
  Logistics: { bg: tokenNeutral.lighter, fg: '#044ED7', border: '#FF5F00' },
  Others: { bg: tokenNeutral.lighter, fg: tokenBrand.dark, border: tokenBrand.lightest },
  'My Widgets': { bg: tokenNeutral.lighter, fg: tokenBrand.dark, border: tokenBrand.lightest },
};

export const workstationAssistantSuggestions: Array<{
  id: string;
  title: string;
  role: string;
  reason: string;
  widgetIds: PersonalWidgetId[];
}> = [
    {
      id: 'operator-shift-focus',
      title: 'Operator shift focus',
      role: 'Operator / Line Lead',
      reason: 'Prioritize schedule, active tasks, and tier topics for fast shift control.',
      widgetIds: ['shift-schedule', 'my-tasks', 'tier-management'],
    },
    {
      id: 'lean-delivery-focus',
      title: 'Lean and Delivery focus',
      role: 'Supervisor / Process Engineer',
      reason: 'Bring together active setup changeovers, work order delivery, and lean focused KPIs to trace flow.',
      widgetIds: ['operator-equipment-changeover', 'delivery', 'loss-focused-kpis'],
    },
    {
      id: 'quality-safety-watch',
      title: 'Quality and safety watch',
      role: 'Quality / SHEQ',
      reason: 'Keep safety events, ESOs, quality behaviors, and actions visible.',
      widgetIds: ['quality', 'safety', 'eso', 'action-tracker'],
    },
  ];

export const customWidgetDatasets: CustomWidgetDataset[] = ['Production', 'CIL', 'Centerline', 'Equipment Setup Changeover', 'Quality', 'Safety', 'People', 'Cost', 'OEE', 'Energy', 'Scrap', 'Downtime', 'Shift Schedule', 'Action Tracker'];

export const customWidgetMetricOptions: Record<CustomWidgetDataset, string[]> = {
  Production: ['Hourly Production', 'Actual Production', 'Target Production', 'Production vs Target', 'Production by Line', 'Production by Shift', 'SKU / Product', 'Work Order', 'Line', 'Shift', 'Date'],
  CIL: ['Completed CIL Tasks', 'Pending CIL Tasks', 'CIL On-Time Rate', 'Average CIL Execution Time', 'CIL Abnormalities', 'Equipment', 'Zone', 'Shift', 'Date'],
  Centerline: ['Completed Centerline Checks', 'Pending Centerline Checks', 'Centerline On-Time Rate', 'Out-of-Range Readings', 'Average Check Time', 'Parameter', 'Equipment', 'Shift', 'Date'],
  'Equipment Setup Changeover': ['Completed Changeovers', 'Pending Changeovers', 'Changeover On-Time Rate', 'Average Changeover Time', 'Line Clearance Issues', 'SKU From / To', 'Equipment', 'Shift', 'Date'],
  OEE: ['OEE %', 'Availability', 'Performance', 'Quality %', 'OEE by Line', 'OEE by Shift', 'OEE Trend', 'Top Losses', 'Line', 'Shift', 'Date'],
  Scrap: ['Scrap Quantity', 'Scrap Cost', 'Scrap %', 'Scrap by Line', 'Scrap by Shift', 'Top Scrap Drivers', 'Material Loss', 'Line', 'Shift', 'Date'],
  Downtime: ['Downtime Minutes', 'Downtime by Line', 'Downtime by Shift', 'Planned Downtime', 'Unplanned Downtime', 'Changeover', 'Breakdown', 'Top Downtime Reasons', 'Line', 'Shift', 'Date'],
  Quality: ['Quality %', 'FPY', 'NCRs', 'CAPAs', 'Complaints', 'Quality by Line', 'Quality by Shift', 'Date'],
  Safety: ['Incidents', 'Near Misses', 'Days Without Incident', 'Safety by Line', 'Safety by Shift', 'Date'],
  People: ['Absence', 'Training', 'Skill Matrix', 'Team Performance', 'Recognition', 'Date'],
  Cost: ['Utilities', 'Labor Cost', 'Maintenance Cost', 'Scrap Cost', 'Total Loss', 'Date'],
  Energy: ['Power Consumption', 'Water Usage', 'Gas Usage', 'Energy per Unit', 'Date'],
  'Shift Schedule': ['Current Shift', 'Breaks', 'Weekly Hours', 'Next Shift', 'Work Area', 'Line', 'Shift', 'Date'],
  'Action Tracker': ['Open Actions', 'Overdue Actions', 'Actions by Owner', 'Actions by Priority', 'Actions by Status', 'Due Date', 'Owner'],
};

export const customWidgetVisualizations = ['KPI Card', 'Big Number', 'Bar Chart', 'Line Chart', 'Combo Chart', 'Table', 'Heatmap', 'Trend Chart', 'Donut Chart'];
export const customWidgetFilters = ['Site', 'Area', 'Line', 'Shift', 'Date Range', 'SKU', 'Work Order', 'Product Family'];
export const customWidgetShareSuggestions = ['Shift A Team', 'Maintenance', 'Quality', 'supervisor@contoso.com'];

export const customWidgetEditSections: CustomWidgetEditSection[] = ['Dataset', 'Metrics', 'Style', 'Filters'];

export function getPriorityTone(priority: string) {
  if (priority === 'HIGH') return { bgcolor: tokenNeutral.lighter, color: tokenError.darker };
  if (priority === 'MEDIUM') return { bgcolor: tokenWarning.lightest, color: tokenWarning.dark };
  return { bgcolor: tokenNeutral.lighter, color: tokenSuccess.darkest };
}

export function getEscalationIcon(iconKey: string) {
  if (iconKey === 'leader') return LeaderIcon;
  if (iconKey === 'maintenance') return MaintenanceIcon;
  if (iconKey === 'quality') return QualityIcon;
  return MaterialIcon;
}
