import type { PublishedWorkstationSnapshot } from './types';
import {
  inferWorkstationType,
  isWorkstationType,
  type WorkstationType,
} from './workstationTypes';
import { readPublishedWorkstationSnapshot, personalLayoutSchemaVersion } from './workstationViewState';

// Increment this whenever preset layouts or snapshots change in this file
// to force invalidate local storage caches and reload default configurations
const presetLayoutVersion = 30;
const readablePresetLayoutVersions = [20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30] as const;
function getPublishedWorkstationsStorageKey(version: number) {
  return `published-workstations-v${personalLayoutSchemaVersion}-preset-v${version}`;
}
export const publishedWorkstationsStorageKey = getPublishedWorkstationsStorageKey(presetLayoutVersion);
export const publishedWorkstationsUpdatedEvent = 'published-workstations-updated';

export type PublishedWorkstation = {
  id: string;
  title: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  history?: PublishedWorkstationHistoryEntry[];
  domains: string[];
  apps?: string[];
  widgetCount: number;
  layoutStorageKey: string;
  snapshot: unknown;
  bookmarked: boolean;
  sharedWith: string[];
  nodeId?: string;
  assignmentSummary?: string;
  workstationType?: WorkstationType;
};

export type PublishedWorkstationHistoryEntry = {
  date: string;
  detail: string;
  label: string;
};

const presetVisibleWidgetIds = [
  'safety',
  'quality',
  'delivery',
  'cost',
  'people',
  'three-p-tracking',
  'loss-focused-kpis',
  'action-tracker',
] as const;

const presetHiddenWidgetIds = [
  'line-status-overview',
  'safety-operator',
  'quality-operator',
  'my-activities-kpis',
  'production-planning',
  'shift-oee',
  'shift-schedule',
  'shift-schedule-leader',
  'scrap',
  'my-tasks',
  'my-esos',
  'shift-production',
  'machine-utilization',
  'hourly-scrap',
  'downtime',
  'eso',
  'top-losses',
  'communication',
  'recognition',
  'escalation-tags',
  'zone-performance',
  'tier-management',
  'oee-performance',
  'output-vs-plan',
  'downtime-overview',
  'machine-health',
  'traceability-preview',
  'operational-metrics',
  'fpy-quality',
  'operator-tasks',
  'andon-actions',
  'material-risks',
  'line-routines',
  'quick-actions',
  'process-snapshot',
  'selected-item-details',
  'current-production-work-order',
  'cycle-time-target',
  'output-trend-hourly',
  'top-downtime-causes',
  'output-by-line',
  'energy-consumption',
  'machine-throughput',
  'state-distribution',
  'output-plan-shift',
  'defect-types',
  'bottleneck-monitor',
  'cycle-time-trend',
  'good-vs-rejected',
  'downtime-pareto',
  'wip-levels',
  'alarm-trend',
  'fpy-by-process',
  'utilities-cost',
  'production-vs-target',
  'line-status',
  'output-trend',
  'scrap-trend',
  'oee-kpi',
  'availability-kpi',
  'performance-kpi',
  'quality-kpi',
  'shift-execution',
  'downtime-kpi',
  'fpy-kpi',
  'scrap-kpi',
  'energy-unit-kpi',
  'operator-cil',
  'operator-centerline',
  'cil',
  'centerline',
  'leader-cil',
  'leader-centerline',
  'operator-equipment-changeover',
  'equipment-changeover',
  'leader-equipment-changeover',
  'work-orders',
  'my-maintenance-backlog',
  'equipment-status',
  'maintenance-hub',
  'maintenance-planner',
  'maintenance-calendarwidget',
  'maintenance-analytics',
  'molding',
  'maintenance-cbm-pdm',
  'spare-parts-monitor',
  'three-d-view',
  'oee-kpi-trend',
  'availability-kpi-trend',
  'performance-kpi-trend',
  'quality-kpi-trend',
  'fpy-kpi-trend',
  'scrap-kpi-trend',
  'downtime-kpi-trend',
  'energy-kpi-trend',
  'delivery-kpi-trend',
  'cost-kpi-trend',
  'people-kpi-trend',
  'safety-kpi-trend',
  'oee-monitoring',
  'oee-line-overview',
  'oee-top-losses',
  'shift-logbook',
  'text-box',
] as const;

const maintenanceTechnicianVisibleWidgetIds = [
  'quick-actions',
  'work-orders',
  'my-maintenance-backlog',
  'maintenance-calendarwidget',
  'equipment-status',
  'spare-parts-monitor',
] as const;

const maintenanceLeaderVisibleWidgetIds = [
  'maintenance-hub',
  'my-maintenance-backlog',
  'maintenance-calendarwidget',
  'maintenance-analytics',
] as const;

const maintenancePlannerVisibleWidgetIds = [
  'maintenance-planner',
  'maintenance-calendarwidget',
  'maintenance-analytics',
  'spare-parts-monitor',
  'my-maintenance-backlog',
] as const;

const sparePartsVisibleWidgetIds = [
  'spare-parts-monitor',
  'equipment-status',
  'maintenance-calendarwidget',
] as const;

const operatorVisibleWidgetIds = [
  'work-orders',
  'my-maintenance-backlog',
  'maintenance-calendarwidget',
  'equipment-status',
] as const;

const operatorCristianVisibleWidgetIds = [
  'text-box-main',
  'line-status-overview',
  'text-box-cockpit',
  'safety-operator',
  'quality-operator',
  'oee-line-overview',
  'shift-schedule',
  'my-tasks',
  'my-activities-kpis',
  'oee-top-losses',
  'quick-actions',
  'three-d-view',
  'shift-logbook',
] as const;

const sqdcpTierLayoutItems = [
  { i: 'safety', x: 0, y: 0, w: 2, h: 12, minW: 2, minH: 7 },
  { i: 'quality', x: 2, y: 0, w: 2, h: 12, minW: 2, minH: 7 },
  { i: 'delivery', x: 4, y: 0, w: 2, h: 12, minW: 2, minH: 9 },
  { i: 'cost', x: 6, y: 0, w: 2, h: 12, minW: 2, minH: 9 },
  { i: 'people', x: 8, y: 0, w: 2, h: 12, minW: 2, minH: 9 },
] as const;

const tierPresetLayoutItems = [
  ...sqdcpTierLayoutItems,
  { i: 'three-p-tracking', x: 10, y: 0, w: 2, h: 2, minW: 2, minH: 2 },
  { i: 'loss-focused-kpis', x: 10, y: 2, w: 2, h: 18, minW: 2, minH: 12 },
  { i: 'action-tracker', x: 0, y: 12, w: 10, h: 8, minW: 8, minH: 5 },
] as const;

export const tier1PublishedSnapshot: PublishedWorkstationSnapshot = {
  layoutState: {
    addedCustomWidgetIds: [],
    customWidgets: [],
    hiddenWidgetIds: [...presetHiddenWidgetIds],
    lossFocusedMetricIds: ['breakdown', 'changeover', 'scrap'],
    layoutSchemaVersion: personalLayoutSchemaVersion,
    layouts: {
      lg: [...tierPresetLayoutItems],
    },
  },
  widgetPreferences: {
    actionTracker: { viewMode: 'board' },
    cost: { breakdownBy: 'line', showBreakdown: false, chartType: 'bars', stackedCharts: true, showStackedChartControls: false },
    delivery: { breakdownBy: 'line', showBreakdown: false, chartType: 'bars' },
    people: { breakdownBy: 'line', showBreakdown: false, chartType: 'bars' },
    lossFocusedKpis: { activeMetricIds: ['breakdown', 'changeover', 'scrap'] },
  },
};

export const tier2PublishedSnapshot: PublishedWorkstationSnapshot = {
  layoutState: {
    addedCustomWidgetIds: [],
    customWidgets: [],
    hiddenWidgetIds: [...presetHiddenWidgetIds],
    lossFocusedMetricIds: ['breakdown', 'changeover', 'scrap'],
    layoutSchemaVersion: personalLayoutSchemaVersion,
    layouts: {
      lg: [...tierPresetLayoutItems],
    },
  },
  widgetPreferences: {
    actionTracker: { viewMode: 'table' },
    cost: { breakdownBy: 'line', showBreakdown: true },
    delivery: { breakdownBy: 'line', showBreakdown: true, showCurrentOrderCard: false },
    people: { breakdownBy: 'line', showBreakdown: true },
    lossFocusedKpis: { activeMetricIds: ['breakdown', 'changeover', 'scrap'] },
  },
};

export const tier3PublishedSnapshot: PublishedWorkstationSnapshot = {
  layoutState: {
    addedCustomWidgetIds: [],
    customWidgets: [],
    hiddenWidgetIds: [...presetHiddenWidgetIds],
    lossFocusedMetricIds: ['breakdown', 'changeover', 'scrap'],
    layoutSchemaVersion: personalLayoutSchemaVersion,
    layouts: {
      lg: [...tierPresetLayoutItems],
    },
  },
  widgetPreferences: {
    actionTracker: { viewMode: 'table' },
    cost: { breakdownBy: 'department', showBreakdown: true },
    delivery: { breakdownBy: 'department', showBreakdown: true, showCurrentOrderCard: false },
    people: { breakdownBy: 'department', showBreakdown: true },
    lossFocusedKpis: { activeMetricIds: ['breakdown', 'changeover', 'scrap'] },
  },
};

export const maintenanceTechnicianPublishedSnapshot: PublishedWorkstationSnapshot = {
  layoutState: {
    addedCustomWidgetIds: [],
    customWidgets: [],
    hiddenWidgetIds: [
      ...presetVisibleWidgetIds,
      ...presetHiddenWidgetIds.filter((widgetId) => !maintenanceTechnicianVisibleWidgetIds.includes(widgetId as typeof maintenanceTechnicianVisibleWidgetIds[number])),
    ],
    layoutSchemaVersion: personalLayoutSchemaVersion,
    layouts: {
      lg: [
        { i: 'quick-actions', x: 0, y: 0, w: 2, h: 12, minW: 2, minH: 3 },
        { i: 'work-orders', x: 2, y: 0, w: 5, h: 12, minW: 4, minH: 8 },
        { i: 'my-maintenance-backlog', x: 7, y: 0, w: 5, h: 12, minW: 4, minH: 8 },
        { i: 'equipment-status', x: 0, y: 12, w: 5, h: 12, minW: 4, minH: 8 },
        { i: 'spare-parts-monitor', x: 5, y: 12, w: 7, h: 12, minW: 5, minH: 8 },
        { i: 'maintenance-calendarwidget', x: 0, y: 24, w: 12, h: 17, minW: 4, minH: 10 },
      ],
      md: [
        { i: 'quick-actions', x: 0, y: 0, w: 2, h: 12, minW: 2, minH: 3 },
        { i: 'work-orders', x: 2, y: 0, w: 5, h: 12, minW: 4, minH: 8 },
        { i: 'my-maintenance-backlog', x: 7, y: 0, w: 5, h: 12, minW: 4, minH: 8 },
        { i: 'equipment-status', x: 0, y: 12, w: 5, h: 12, minW: 4, minH: 8 },
        { i: 'spare-parts-monitor', x: 5, y: 12, w: 7, h: 12, minW: 5, minH: 8 },
        { i: 'maintenance-calendarwidget', x: 0, y: 24, w: 12, h: 17, minW: 4, minH: 10 },
      ],
      sm: [
        { i: 'quick-actions', x: 0, y: 0, w: 8, h: 6, minW: 2, minH: 3 },
        { i: 'work-orders', x: 0, y: 6, w: 8, h: 12, minW: 4, minH: 8 },
        { i: 'my-maintenance-backlog', x: 0, y: 18, w: 8, h: 12, minW: 4, minH: 8 },
        { i: 'equipment-status', x: 0, y: 30, w: 8, h: 12, minW: 4, minH: 8 },
        { i: 'spare-parts-monitor', x: 0, y: 42, w: 8, h: 12, minW: 5, minH: 8 },
        { i: 'maintenance-calendarwidget', x: 0, y: 54, w: 8, h: 17, minW: 5, minH: 12 },
      ],
      xs: [
        { i: 'quick-actions', x: 0, y: 0, w: 4, h: 6, minW: 2, minH: 3 },
        { i: 'work-orders', x: 0, y: 6, w: 4, h: 12, minW: 4, minH: 8 },
        { i: 'my-maintenance-backlog', x: 0, y: 18, w: 4, h: 12, minW: 4, minH: 8 },
        { i: 'equipment-status', x: 0, y: 30, w: 4, h: 12, minW: 4, minH: 8 },
        { i: 'spare-parts-monitor', x: 0, y: 42, w: 4, h: 12, minW: 4, minH: 8 },
        { i: 'maintenance-calendarwidget', x: 0, y: 54, w: 4, h: 17, minW: 4, minH: 12 },
      ],
      xxs: [
        { i: 'quick-actions', x: 0, y: 0, w: 2, h: 6, minW: 2, minH: 3 },
        { i: 'work-orders', x: 0, y: 6, w: 2, h: 12, minW: 2, minH: 8 },
        { i: 'my-maintenance-backlog', x: 0, y: 18, w: 2, h: 12, minW: 2, minH: 8 },
        { i: 'equipment-status', x: 0, y: 30, w: 2, h: 12, minW: 2, minH: 8 },
        { i: 'spare-parts-monitor', x: 0, y: 42, w: 2, h: 12, minW: 2, minH: 8 },
        { i: 'maintenance-calendarwidget', x: 0, y: 54, w: 2, h: 17, minW: 2, minH: 12 },
      ],
    },
  },
  widgetPreferences: {},
};

export const maintenanceLeaderPublishedSnapshot: PublishedWorkstationSnapshot = {
  layoutState: {
    addedCustomWidgetIds: [],
    customWidgets: [],
    hiddenWidgetIds: [
      ...presetVisibleWidgetIds,
      ...presetHiddenWidgetIds.filter((widgetId) => !maintenanceLeaderVisibleWidgetIds.includes(widgetId as typeof maintenanceLeaderVisibleWidgetIds[number])),
    ],
    layoutSchemaVersion: personalLayoutSchemaVersion,
    layouts: {
      lg: [
        { i: 'maintenance-hub', x: 0, y: 0, w: 6, h: 9, minW: 4, minH: 6 },
        { i: 'my-maintenance-backlog', x: 6, y: 0, w: 6, h: 9, minW: 4, minH: 7 },
        { i: 'maintenance-calendarwidget', x: 0, y: 9, w: 6, h: 14, minW: 4, minH: 10 },
        { i: 'maintenance-analytics', x: 6, y: 9, w: 6, h: 14, minW: 4, minH: 7 },
      ],
      md: [
        { i: 'maintenance-hub', x: 0, y: 0, w: 6, h: 9, minW: 4, minH: 6 },
        { i: 'my-maintenance-backlog', x: 6, y: 0, w: 6, h: 9, minW: 4, minH: 7 },
        { i: 'maintenance-calendarwidget', x: 0, y: 9, w: 6, h: 14, minW: 4, minH: 10 },
        { i: 'maintenance-analytics', x: 6, y: 9, w: 6, h: 14, minW: 4, minH: 7 },
      ],
      sm: [
        { i: 'maintenance-hub', x: 0, y: 0, w: 8, h: 9, minW: 4, minH: 6 },
        { i: 'my-maintenance-backlog', x: 0, y: 9, w: 8, h: 10, minW: 4, minH: 7 },
        { i: 'maintenance-calendarwidget', x: 0, y: 19, w: 8, h: 14, minW: 5, minH: 10 },
        { i: 'maintenance-analytics', x: 0, y: 33, w: 8, h: 12, minW: 5, minH: 7 },
      ],
      xs: [
        { i: 'maintenance-hub', x: 0, y: 0, w: 4, h: 9, minW: 4, minH: 6 },
        { i: 'my-maintenance-backlog', x: 0, y: 9, w: 4, h: 10, minW: 4, minH: 7 },
        { i: 'maintenance-calendarwidget', x: 0, y: 19, w: 4, h: 14, minW: 4, minH: 10 },
        { i: 'maintenance-analytics', x: 0, y: 33, w: 4, h: 12, minW: 4, minH: 7 },
      ],
      xxs: [
        { i: 'maintenance-hub', x: 0, y: 0, w: 2, h: 9, minW: 2, minH: 6 },
        { i: 'my-maintenance-backlog', x: 0, y: 9, w: 2, h: 10, minW: 2, minH: 7 },
        { i: 'maintenance-calendarwidget', x: 0, y: 19, w: 2, h: 14, minW: 2, minH: 10 },
        { i: 'maintenance-analytics', x: 0, y: 33, w: 2, h: 12, minW: 2, minH: 7 },
      ],
    },
  },
  widgetPreferences: {},
};

export const maintenancePlannerPublishedSnapshot: PublishedWorkstationSnapshot = {
  layoutState: {
    addedCustomWidgetIds: [],
    customWidgets: [],
    hiddenWidgetIds: [
      ...presetVisibleWidgetIds,
      ...presetHiddenWidgetIds.filter((widgetId) => !maintenancePlannerVisibleWidgetIds.includes(widgetId as typeof maintenancePlannerVisibleWidgetIds[number])),
    ],
    layoutSchemaVersion: personalLayoutSchemaVersion,
    layouts: {
      lg: [
        { i: 'maintenance-planner', x: 0, y: 0, w: 6, h: 11, minW: 4, minH: 7 },
        { i: 'my-maintenance-backlog', x: 6, y: 0, w: 6, h: 11, minW: 4, minH: 7 },
        { i: 'maintenance-analytics', x: 0, y: 11, w: 6, h: 11, minW: 4, minH: 7 },
        { i: 'spare-parts-monitor', x: 6, y: 11, w: 6, h: 11, minW: 5, minH: 8 },
        { i: 'maintenance-calendarwidget', x: 0, y: 22, w: 12, h: 15, minW: 8, minH: 10 },
      ],
      md: [
        { i: 'maintenance-planner', x: 0, y: 0, w: 6, h: 11, minW: 4, minH: 7 },
        { i: 'my-maintenance-backlog', x: 6, y: 0, w: 6, h: 11, minW: 4, minH: 7 },
        { i: 'maintenance-analytics', x: 0, y: 11, w: 6, h: 11, minW: 4, minH: 7 },
        { i: 'spare-parts-monitor', x: 6, y: 11, w: 6, h: 11, minW: 5, minH: 8 },
        { i: 'maintenance-calendarwidget', x: 0, y: 22, w: 12, h: 15, minW: 8, minH: 10 },
      ],
      sm: [
        { i: 'maintenance-planner', x: 0, y: 0, w: 4, h: 11, minW: 4, minH: 7 },
        { i: 'my-maintenance-backlog', x: 4, y: 0, w: 4, h: 11, minW: 4, minH: 7 },
        { i: 'maintenance-analytics', x: 0, y: 11, w: 4, h: 11, minW: 4, minH: 7 },
        { i: 'spare-parts-monitor', x: 4, y: 11, w: 4, h: 11, minW: 4, minH: 8 },
        { i: 'maintenance-calendarwidget', x: 0, y: 22, w: 8, h: 15, minW: 5, minH: 10 },
      ],
      xs: [
        { i: 'maintenance-planner', x: 0, y: 0, w: 4, h: 11, minW: 4, minH: 7 },
        { i: 'my-maintenance-backlog', x: 0, y: 11, w: 4, h: 11, minW: 4, minH: 7 },
        { i: 'maintenance-analytics', x: 0, y: 22, w: 4, h: 11, minW: 4, minH: 7 },
        { i: 'spare-parts-monitor', x: 0, y: 33, w: 4, h: 11, minW: 4, minH: 8 },
        { i: 'maintenance-calendarwidget', x: 0, y: 44, w: 4, h: 12, minW: 4, minH: 8 },
      ],
      xxs: [
        { i: 'maintenance-planner', x: 0, y: 0, w: 2, h: 11, minW: 2, minH: 7 },
        { i: 'my-maintenance-backlog', x: 0, y: 11, w: 2, h: 11, minW: 2, minH: 7 },
        { i: 'maintenance-analytics', x: 0, y: 22, w: 2, h: 11, minW: 2, minH: 7 },
        { i: 'spare-parts-monitor', x: 0, y: 33, w: 2, h: 11, minW: 2, minH: 8 },
        { i: 'maintenance-calendarwidget', x: 0, y: 44, w: 2, h: 12, minW: 2, minH: 8 },
      ],
    },
  },
  widgetPreferences: {},
};

export const sparePartsPublishedSnapshot: PublishedWorkstationSnapshot = {
  layoutState: {
    addedCustomWidgetIds: [],
    customWidgets: [],
    hiddenWidgetIds: [
      ...presetVisibleWidgetIds,
      ...presetHiddenWidgetIds.filter((widgetId) => !sparePartsVisibleWidgetIds.includes(widgetId as typeof sparePartsVisibleWidgetIds[number])),
    ],
    layoutSchemaVersion: personalLayoutSchemaVersion,
    layouts: {
      lg: [
        { i: 'spare-parts-monitor', x: 0, y: 0, w: 7, h: 12, minW: 5, minH: 8 },
        { i: 'equipment-status', x: 7, y: 0, w: 5, h: 12, minW: 4, minH: 8 },
        { i: 'maintenance-calendarwidget', x: 0, y: 12, w: 12, h: 17, minW: 8, minH: 12 },
      ],
      md: [
        { i: 'spare-parts-monitor', x: 0, y: 0, w: 7, h: 12, minW: 5, minH: 8 },
        { i: 'equipment-status', x: 7, y: 0, w: 5, h: 12, minW: 4, minH: 8 },
        { i: 'maintenance-calendarwidget', x: 0, y: 12, w: 12, h: 17, minW: 8, minH: 12 },
      ],
      sm: [
        { i: 'spare-parts-monitor', x: 0, y: 0, w: 8, h: 12, minW: 5, minH: 8 },
        { i: 'equipment-status', x: 0, y: 12, w: 8, h: 12, minW: 4, minH: 8 },
        { i: 'maintenance-calendarwidget', x: 0, y: 24, w: 8, h: 17, minW: 5, minH: 12 },
      ],
      xs: [
        { i: 'spare-parts-monitor', x: 0, y: 0, w: 4, h: 12, minW: 4, minH: 8 },
        { i: 'equipment-status', x: 0, y: 12, w: 4, h: 12, minW: 4, minH: 8 },
        { i: 'maintenance-calendarwidget', x: 0, y: 24, w: 4, h: 17, minW: 4, minH: 12 },
      ],
      xxs: [
        { i: 'spare-parts-monitor', x: 0, y: 0, w: 2, h: 12, minW: 2, minH: 8 },
        { i: 'equipment-status', x: 0, y: 12, w: 2, h: 12, minW: 2, minH: 8 },
        { i: 'maintenance-calendarwidget', x: 0, y: 24, w: 2, h: 17, minW: 2, minH: 12 },
      ],
    },
  },
  widgetPreferences: {},
};

export const leaderViewPublishedSnapshot: PublishedWorkstationSnapshot = {
  layoutState: {
    addedCustomWidgetIds: [],
    customWidgets: [],
    hiddenWidgetIds: [
      'operator-tasks',
      'andon-actions',
      'material-risks',
      'shift-schedule',
      'quick-actions',
      'output-trend-hourly',
      'output-by-line',
    ],
    layoutSchemaVersion: personalLayoutSchemaVersion,
    layouts: {
      lg: [
        { i: 'oee-performance', x: 0, y: 0, w: 12, h: 6, minW: 6, minH: 4 },
        { i: 'downtime-overview', x: 0, y: 6, w: 4, h: 6, minW: 3, minH: 4 },
        { i: 'output-vs-plan', x: 4, y: 6, w: 8, h: 6, minW: 4, minH: 4 },
        { i: 'machine-health', x: 0, y: 12, w: 12, h: 7, minW: 6, minH: 4 },
        { i: 'traceability-preview', x: 0, y: 19, w: 6, h: 6, minW: 4, minH: 4 },
        { i: 'operational-metrics', x: 6, y: 19, w: 6, h: 6, minW: 4, minH: 4 },
      ],
    },
  },
  widgetPreferences: {
    cost: { breakdownBy: 'department', showBreakdown: true },
    delivery: { breakdownBy: 'department', showBreakdown: true },
    people: { breakdownBy: 'department', showBreakdown: true },
  },
};

export const operatorViewPublishedSnapshot: PublishedWorkstationSnapshot = {
  layoutState: {
    addedCustomWidgetIds: [],
    customWidgets: [],
    hiddenWidgetIds: [
      ...presetVisibleWidgetIds,
      ...presetHiddenWidgetIds.filter((widgetId) => !operatorVisibleWidgetIds.includes(widgetId as typeof operatorVisibleWidgetIds[number])),
    ],
    layoutSchemaVersion: personalLayoutSchemaVersion,
    layouts: {
      lg: [
        { i: 'work-orders', x: 0, y: 0, w: 7, h: 12, minW: 4, minH: 8 },
        { i: 'my-maintenance-backlog', x: 7, y: 0, w: 5, h: 12, minW: 4, minH: 8 },
        { i: 'equipment-status', x: 0, y: 12, w: 5, h: 12, minW: 4, minH: 8 },
        { i: 'maintenance-calendarwidget', x: 5, y: 12, w: 7, h: 12, minW: 5, minH: 8 },
      ],
      md: [
        { i: 'work-orders', x: 0, y: 0, w: 7, h: 12, minW: 4, minH: 8 },
        { i: 'my-maintenance-backlog', x: 7, y: 0, w: 5, h: 12, minW: 4, minH: 8 },
        { i: 'equipment-status', x: 0, y: 12, w: 5, h: 12, minW: 4, minH: 8 },
        { i: 'maintenance-calendarwidget', x: 5, y: 12, w: 7, h: 12, minW: 5, minH: 8 },
      ],
      sm: [
        { i: 'work-orders', x: 0, y: 0, w: 8, h: 12, minW: 4, minH: 8 },
        { i: 'my-maintenance-backlog', x: 0, y: 12, w: 8, h: 12, minW: 4, minH: 8 },
        { i: 'equipment-status', x: 0, y: 24, w: 8, h: 12, minW: 4, minH: 8 },
        { i: 'maintenance-calendarwidget', x: 0, y: 36, w: 8, h: 12, minW: 5, minH: 8 },
      ],
      xs: [
        { i: 'work-orders', x: 0, y: 0, w: 4, h: 12, minW: 4, minH: 8 },
        { i: 'my-maintenance-backlog', x: 0, y: 12, w: 4, h: 12, minW: 4, minH: 8 },
        { i: 'equipment-status', x: 0, y: 24, w: 4, h: 12, minW: 4, minH: 8 },
        { i: 'maintenance-calendarwidget', x: 0, y: 36, w: 4, h: 12, minW: 4, minH: 8 },
      ],
      xxs: [
        { i: 'work-orders', x: 0, y: 0, w: 2, h: 12, minW: 2, minH: 8 },
        { i: 'my-maintenance-backlog', x: 0, y: 12, w: 2, h: 12, minW: 2, minH: 8 },
        { i: 'equipment-status', x: 0, y: 24, w: 2, h: 12, minW: 2, minH: 8 },
        { i: 'maintenance-calendarwidget', x: 0, y: 36, w: 2, h: 12, minW: 2, minH: 8 },
      ],
    },
  },
  widgetPreferences: {},
};

export const operatorCristianPublishedSnapshot: PublishedWorkstationSnapshot = {
  layoutState: {
    addedCustomWidgetIds: [],
    customWidgets: [],
    hiddenWidgetIds: [
      ...presetVisibleWidgetIds.filter((widgetId) => !operatorCristianVisibleWidgetIds.includes(widgetId as typeof operatorCristianVisibleWidgetIds[number])),
      ...presetHiddenWidgetIds.filter((widgetId) => !operatorCristianVisibleWidgetIds.includes(widgetId as typeof operatorCristianVisibleWidgetIds[number])),
    ],
    layoutSchemaVersion: personalLayoutSchemaVersion,
    layouts: {
      lg: [
        { i: 'text-box-main', x: 0, y: 0, w: 12, h: 3, minW: 2, minH: 3 },
        { i: 'line-status-overview', x: 0, y: 3, w: 12, h: 27, minW: 6, minH: 14 },
        { i: 'text-box-cockpit', x: 0, y: 30, w: 12, h: 3, minW: 2, minH: 3 },
        { i: 'safety-operator', x: 0, y: 33, w: 2, h: 8, minW: 2, minH: 4 },
        { i: 'quality-operator', x: 2, y: 33, w: 2, h: 8, minW: 2, minH: 4 },
        { i: 'oee-line-overview', x: 4, y: 33, w: 4, h: 8, minW: 4, minH: 5 },
        { i: 'shift-schedule', x: 8, y: 33, w: 4, h: 8, minW: 4, minH: 5 },
        { i: 'my-tasks', x: 0, y: 41, w: 8, h: 17, minW: 4, minH: 7 },
        { i: 'my-activities-kpis', x: 8, y: 41, w: 4, h: 9, minW: 4, minH: 5 },
        { i: 'oee-top-losses', x: 8, y: 50, w: 4, h: 8, minW: 3, minH: 3 },
        { i: 'three-d-view', x: 0, y: 58, w: 8, h: 22, minW: 4, minH: 12 },
        { i: 'shift-logbook', x: 8, y: 58, w: 4, h: 14, minW: 4, minH: 7 },
        { i: 'quick-actions', x: 8, y: 72, w: 4, h: 8, minW: 2, minH: 4 },
      ],
      md: [
        { i: 'text-box-main', x: 0, y: 0, w: 12, h: 3, minW: 2, minH: 3 },
        { i: 'line-status-overview', x: 0, y: 3, w: 12, h: 27, minW: 6, minH: 14 },
        { i: 'text-box-cockpit', x: 0, y: 30, w: 12, h: 3, minW: 2, minH: 3 },
        { i: 'safety-operator', x: 0, y: 33, w: 2, h: 8, minW: 2, minH: 4 },
        { i: 'quality-operator', x: 2, y: 33, w: 2, h: 8, minW: 2, minH: 4 },
        { i: 'oee-line-overview', x: 4, y: 33, w: 4, h: 8, minW: 4, minH: 5 },
        { i: 'shift-schedule', x: 8, y: 33, w: 4, h: 8, minW: 4, minH: 5 },
        { i: 'my-tasks', x: 0, y: 41, w: 8, h: 17, minW: 4, minH: 7 },
        { i: 'my-activities-kpis', x: 8, y: 41, w: 4, h: 9, minW: 4, minH: 5 },
        { i: 'oee-top-losses', x: 8, y: 50, w: 4, h: 8, minW: 3, minH: 3 },
        { i: 'three-d-view', x: 0, y: 58, w: 8, h: 22, minW: 4, minH: 12 },
        { i: 'shift-logbook', x: 8, y: 58, w: 4, h: 14, minW: 4, minH: 7 },
        { i: 'quick-actions', x: 8, y: 72, w: 4, h: 8, minW: 2, minH: 4 },
      ],
      sm: [
        { i: 'text-box-main', x: 0, y: 0, w: 8, h: 3, minW: 2, minH: 3 },
        { i: 'line-status-overview', x: 0, y: 3, w: 8, h: 27, minW: 6, minH: 14 },
        { i: 'text-box-cockpit', x: 0, y: 30, w: 8, h: 3, minW: 2, minH: 3 },
        { i: 'safety-operator', x: 0, y: 33, w: 2, h: 8, minW: 2, minH: 4 },
        { i: 'quality-operator', x: 2, y: 33, w: 2, h: 8, minW: 2, minH: 4 },
        { i: 'oee-line-overview', x: 4, y: 33, w: 4, h: 8, minW: 4, minH: 5 },
        { i: 'shift-schedule', x: 0, y: 41, w: 8, h: 8, minW: 3, minH: 5 },
        { i: 'my-tasks', x: 0, y: 49, w: 5, h: 17, minW: 3, minH: 7 },
        { i: 'my-activities-kpis', x: 5, y: 49, w: 3, h: 8, minW: 3, minH: 5 },
        { i: 'oee-top-losses', x: 5, y: 57, w: 3, h: 9, minW: 3, minH: 3 },
        { i: 'three-d-view', x: 0, y: 66, w: 5, h: 22, minW: 4, minH: 12 },
        { i: 'shift-logbook', x: 5, y: 66, w: 3, h: 14, minW: 3, minH: 7 },
        { i: 'quick-actions', x: 5, y: 80, w: 3, h: 8, minW: 2, minH: 4 },
      ],
      xs: [
        { i: 'text-box-main', x: 0, y: 0, w: 4, h: 3, minW: 2, minH: 3 },
        { i: 'line-status-overview', x: 0, y: 3, w: 4, h: 27, minW: 4, minH: 14 },
        { i: 'text-box-cockpit', x: 0, y: 30, w: 4, h: 3, minW: 2, minH: 3 },
        { i: 'safety-operator', x: 0, y: 33, w: 2, h: 8, minW: 2, minH: 4 },
        { i: 'quality-operator', x: 2, y: 33, w: 2, h: 8, minW: 2, minH: 4 },
        { i: 'oee-line-overview', x: 0, y: 41, w: 4, h: 8, minW: 4, minH: 5 },
        { i: 'shift-schedule', x: 0, y: 49, w: 4, h: 8, minW: 4, minH: 5 },
        { i: 'my-tasks', x: 0, y: 57, w: 4, h: 17, minW: 4, minH: 7 },
        { i: 'my-activities-kpis', x: 0, y: 74, w: 4, h: 8, minW: 4, minH: 5 },
        { i: 'oee-top-losses', x: 0, y: 82, w: 4, h: 9, minW: 3, minH: 3 },
        { i: 'three-d-view', x: 0, y: 91, w: 4, h: 22, minW: 4, minH: 12 },
        { i: 'shift-logbook', x: 0, y: 113, w: 4, h: 14, minW: 4, minH: 7 },
        { i: 'quick-actions', x: 0, y: 127, w: 4, h: 8, minW: 2, minH: 4 },
      ],
      xxs: [
        { i: 'text-box-main', x: 0, y: 0, w: 2, h: 3, minW: 2, minH: 3 },
        { i: 'line-status-overview', x: 0, y: 3, w: 2, h: 27, minW: 2, minH: 14 },
        { i: 'text-box-cockpit', x: 0, y: 30, w: 2, h: 3, minW: 2, minH: 3 },
        { i: 'safety-operator', x: 0, y: 33, w: 2, h: 8, minW: 2, minH: 4 },
        { i: 'quality-operator', x: 0, y: 41, w: 2, h: 8, minW: 2, minH: 4 },
        { i: 'oee-line-overview', x: 0, y: 49, w: 2, h: 8, minW: 2, minH: 5 },
        { i: 'shift-schedule', x: 0, y: 57, w: 2, h: 8, minW: 2, minH: 5 },
        { i: 'my-tasks', x: 0, y: 65, w: 2, h: 17, minW: 2, minH: 7 },
        { i: 'my-activities-kpis', x: 0, y: 82, w: 2, h: 8, minW: 2, minH: 5 },
        { i: 'oee-top-losses', x: 0, y: 90, w: 2, h: 9, minW: 2, minH: 3 },
        { i: 'three-d-view', x: 0, y: 99, w: 2, h: 22, minW: 2, minH: 12 },
        { i: 'shift-logbook', x: 0, y: 121, w: 2, h: 14, minW: 2, minH: 7 },
        { i: 'quick-actions', x: 0, y: 135, w: 2, h: 8, minW: 2, minH: 4 },
      ],
    },
  },
  widgetPreferences: {
    delivery: { breakdownBy: 'line', showBreakdown: false, showCurrentOrderCard: true, chartType: 'lines' },
    textBoxes: {
      'text-box-main': {
        content: 'Operator Main Page',
        backgroundTone: 'white',
        textTone: 'primary',
        fontSize: 20,
        bold: true,
        italic: false,
        underline: false,
        align: 'center',
        verticalAlign: 'middle',
      },
      'text-box-cockpit': {
        content: 'Operator Cockpit',
        backgroundTone: 'white',
        textTone: 'primary',
        fontSize: 20,
        bold: true,
        italic: false,
        underline: false,
        align: 'center',
        verticalAlign: 'middle',
      },
    },
  },
};

const oeeVisibleWidgetIds = [
  'oee-monitoring',
  'oee-line-overview',
  'oee-top-losses',
] as const;

export const oeePublishedSnapshot: PublishedWorkstationSnapshot = {
  layoutState: {
    addedCustomWidgetIds: [],
    customWidgets: [],
    hiddenWidgetIds: [
      ...presetVisibleWidgetIds,
      ...presetHiddenWidgetIds.filter((widgetId) => !oeeVisibleWidgetIds.includes(widgetId as any)),
    ],
    layoutSchemaVersion: personalLayoutSchemaVersion,
    layouts: {
      lg: [
        { i: 'oee-monitoring', x: 0, y: 0, w: 8, h: 17, minW: 4, minH: 8 },
        { i: 'oee-line-overview', x: 8, y: 0, w: 4, h: 8, minW: 4, minH: 5 },
        { i: 'oee-top-losses', x: 8, y: 8, w: 4, h: 9, minW: 3, minH: 3 },
      ],
    },
  },
  widgetPreferences: {},
};

const projectPublishedWorkstations: PublishedWorkstation[] = [
  {
    id: 'operator-view-cristian',
    title: 'Operator View - Cristian',
    author: 'Cristian',
    createdAt: '2026-07-08T00:00:00.000Z',
    updatedAt: '2026-07-10T00:00:00.000Z',
    domains: ['operator', 'maintenance', 'work orders', 'equipment'],
    apps: ['Operator Main Page', 'Operator Overview', 'Operator Cockpit', 'Safety', 'Quality', 'OEE Line Overview', 'My Shift Schedule', 'My Tasks', 'My Activities KPIs', 'Top Losses', '3D View', 'Shift Logbook', 'Quick Actions'],
    widgetCount: operatorCristianVisibleWidgetIds.length,
    layoutStorageKey: 'operator-view-cristian-layout-v1',
    snapshot: operatorCristianPublishedSnapshot,
    bookmarked: true,
    sharedWith: ['Cristian', 'Operators'],
    nodeId: 'plant-columbus-west-area-assembly-unit-a-line-10',
    assignmentSummary: 'Columbus West / Area Assembly / Unit A / Line 10',
    workstationType: 'Production',
  },
  {
    id: 'sample-oee',
    title: 'OEE',
    author: 'Codex Project Seed',
    createdAt: '2026-05-06T00:00:00.000Z',
    updatedAt: '2026-05-06T00:00:00.000Z',
    domains: ['oee', 'production', 'downtime'],
    widgetCount: 3,
    layoutStorageKey: 'workstation-dashboard-layout-v12',
    snapshot: oeePublishedSnapshot,
    bookmarked: true,
    sharedWith: ['Operators', 'Area Leaders', 'Maintenance'],
    workstationType: 'Production',
  },
  {
    id: 'sample-operator-view',
    title: 'Operator View',
    author: 'Codex Project Seed',
    createdAt: '2026-05-06T00:00:00.000Z',
    updatedAt: '2026-06-22T00:00:00.000Z',
    domains: ['operator', 'maintenance', 'work orders', 'equipment'],
    apps: ['My Work Orders', 'Maintenance Backlog', 'Maintenance Calendar', 'Equipment Status'],
    widgetCount: operatorVisibleWidgetIds.length,
    layoutStorageKey: 'workstation-dashboard-layout-v12',
    snapshot: operatorViewPublishedSnapshot,
    bookmarked: true,
    sharedWith: ['Operators'],
    workstationType: 'Maintenance',
  },
  {
    id: 'sample-leader-view',
    title: 'Leader View',
    author: 'Codex Project Seed',
    createdAt: '2026-05-06T00:00:00.000Z',
    updatedAt: '2026-05-06T00:00:00.000Z',
    domains: ['leadership', 'oee', 'actions'],
    widgetCount: 11,
    layoutStorageKey: 'workstation-dashboard-layout-v12',
    snapshot: leaderViewPublishedSnapshot,
    bookmarked: true,
    sharedWith: ['Site Leadership', 'Area Leaders'],
    workstationType: 'Leadership',
  },
  {
    id: 'sample-tier-1',
    title: 'Tier 1',
    author: 'Codex Project Seed',
    createdAt: '2026-05-06T00:00:00.000Z',
    updatedAt: '2026-05-06T00:00:00.000Z',
    domains: ['shopfloor', 'safety', 'quality', 'actions'],
    widgetCount: presetVisibleWidgetIds.length,
    layoutStorageKey: 'workstation-dashboard-layout-v12',
    snapshot: tier1PublishedSnapshot,
    bookmarked: true,
    sharedWith: ['Line 10 Leads', 'Operations Team'],
    workstationType: 'Tier Management',
  },
  {
    id: 'sample-tier-2',
    title: 'Tier 2',
    author: 'Codex Project Seed',
    createdAt: '2026-05-06T00:00:00.000Z',
    updatedAt: '2026-05-06T00:00:00.000Z',
    domains: ['oee', 'downtime', 'actions', 'quality'],
    widgetCount: presetVisibleWidgetIds.length,
    layoutStorageKey: 'workstation-dashboard-layout-v9',
    snapshot: tier2PublishedSnapshot,
    bookmarked: true,
    sharedWith: ['Area Leaders', 'Maintenance'],
    workstationType: 'Tier Management',
  },
  {
    id: 'sample-tier-3',
    title: 'Tier 3',
    author: 'Codex Project Seed',
    createdAt: '2026-05-06T00:00:00.000Z',
    updatedAt: '2026-05-06T00:00:00.000Z',
    domains: ['operations', 'quality', 'maintenance', 'actions'],
    widgetCount: presetVisibleWidgetIds.length,
    layoutStorageKey: 'workstation-dashboard-layout-v12',
    snapshot: tier3PublishedSnapshot,
    bookmarked: true,
    sharedWith: ['Site Leadership', 'Quality Team'],
    workstationType: 'Tier Management',
  },
  {
    id: 'sample-maintenance-leader',
    title: 'Maintenance Leader',
    author: 'Codex Project Seed',
    createdAt: '2026-05-06T00:00:00.000Z',
    updatedAt: '2026-06-22T00:00:00.000Z',
    domains: ['maintenance', 'leadership', 'backlog', 'analytics'],
    apps: ['Maintenance Hub', 'Maintenance Backlog', 'Maintenance Calendar', 'Maintenance Analytics'],
    widgetCount: maintenanceLeaderVisibleWidgetIds.length,
    layoutStorageKey: 'workstation-dashboard-layout-v12',
    snapshot: maintenanceLeaderPublishedSnapshot,
    bookmarked: true,
    sharedWith: ['Maintenance Leaders', 'Area Leaders'],
    workstationType: 'Maintenance',
  },
  {
    id: 'sample-maintenance-planner',
    title: 'Maintenance Planner',
    author: 'Codex Project Seed',
    createdAt: '2026-06-22T00:00:00.000Z',
    updatedAt: '2026-06-22T00:00:00.000Z',
    domains: ['maintenance', 'planner', 'calendar', 'analytics', 'backlog', 'spare parts'],
    apps: ['Maintenance Planner', 'Maintenance Calendar', 'Maintenance Analytics', 'Spare Parts Monitor', 'Maintenance Backlog'],
    widgetCount: maintenancePlannerVisibleWidgetIds.length,
    layoutStorageKey: 'workstation-dashboard-layout-v13',
    snapshot: maintenancePlannerPublishedSnapshot,
    bookmarked: true,
    sharedWith: ['Maintenance Planners', 'Maintenance Leaders'],
    workstationType: 'Maintenance',
  },
  {
    id: 'sample-spare-parts',
    title: 'Spare Parts',
    author: 'Codex Project Seed',
    createdAt: '2026-06-23T00:00:00.000Z',
    updatedAt: '2026-06-23T00:00:00.000Z',
    domains: ['maintenance', 'spare parts', 'inventory', 'equipment'],
    apps: ['Spare Parts Management', 'Equipment Ledger', 'Maintenance Calendar'],
    widgetCount: sparePartsVisibleWidgetIds.length,
    layoutStorageKey: 'workstation-dashboard-layout-v17',
    snapshot: sparePartsPublishedSnapshot,
    bookmarked: true,
    sharedWith: ['Maintenance', 'Spare Parts'],
    workstationType: 'Maintenance',
  },
  {
    id: 'sample-maintenance-technician',
    title: 'Maintenance Technician',
    author: 'Codex Project Seed',
    createdAt: '2026-05-06T00:00:00.000Z',
    updatedAt: '2026-05-06T00:00:00.000Z',
    domains: ['maintenance', 'work orders', 'equipment', 'spare parts'],
    apps: ['Maintenance', 'Maintenance Calendar', 'Maintenance Follow Up Board', 'Spare Parts Management', 'Equipment Ledger', 'CBM & PdM'],
    widgetCount: maintenanceTechnicianVisibleWidgetIds.length,
    layoutStorageKey: 'workstation-dashboard-layout-v12',
    snapshot: maintenanceTechnicianPublishedSnapshot,
    bookmarked: true,
    sharedWith: ['Maintenance'],
    workstationType: 'Maintenance',
  },
];

function normalizeWorkstationIdentifier(value: string) {
  return value.trim().toLowerCase();
}

function getDefaultSnapshotByIdentifier(identifier: string) {
  const normalized = normalizeWorkstationIdentifier(identifier);

  if (normalized === 'sample-tier-1' || normalized === 'tier 1') return tier1PublishedSnapshot;
  if (normalized === 'sample-tier-2' || normalized === 'tier 2') return tier2PublishedSnapshot;
  if (normalized === 'sample-tier-3' || normalized === 'tier 3') return tier3PublishedSnapshot;
  if (normalized === 'sample-maintenance-leader' || normalized === 'maintenance leader' || normalized === 'maintenance lead' || normalized === 'lider maintenance' || normalized === 'lider manutencao') return maintenanceLeaderPublishedSnapshot;
  if (normalized === 'sample-maintenance-planner' || normalized === 'maintenance planner' || normalized === 'planner' || normalized === 'planejador maintenance' || normalized === 'planejador manutencao') return maintenancePlannerPublishedSnapshot;
  if (normalized === 'sample-spare-parts' || normalized === 'spare parts' || normalized === 'spare parts management') return sparePartsPublishedSnapshot;
  if (normalized === 'sample-maintenance-technician' || normalized === 'maintenance technician' || normalized === 'maintenance technician 2' || normalized === 'maintenance techinian' || normalized === 'technician') return maintenanceTechnicianPublishedSnapshot;
  if (normalized === 'leader view') return leaderViewPublishedSnapshot;
  if (normalized === 'operator-view-cristian' || normalized === 'operator view cristian' || normalized === 'operator view - cristian') return operatorCristianPublishedSnapshot;
  if (normalized === 'operator view') return operatorViewPublishedSnapshot;
  if (normalized === 'sample-oee' || normalized === 'oee') return oeePublishedSnapshot;

  return null;
}

export function getPresetSnapshotForWorkstationTitle(title: string) {
  return getDefaultSnapshotByIdentifier(title);
}

function getPresetSnapshotForWorkstation(workstation: Pick<PublishedWorkstation, 'id' | 'title'>) {
  return getDefaultSnapshotByIdentifier(workstation.id) ?? getDefaultSnapshotByIdentifier(workstation.title);
}

function withDefaultSnapshot(workstation: PublishedWorkstation): PublishedWorkstation {
  const presetSnapshot = getPresetSnapshotForWorkstation(workstation);
  if (workstation.snapshot || !presetSnapshot) {
    return workstation;
  }

  return {
    ...workstation,
    snapshot: presetSnapshot,
    widgetCount: presetVisibleWidgetIds.length,
  };
}

function withResolvedWorkstationType(workstation: PublishedWorkstation): PublishedWorkstation {
  const workstationType = isWorkstationType(workstation.workstationType)
    ? workstation.workstationType
    : inferWorkstationType({
        title: workstation.title,
        domains: workstation.domains,
        apps: workstation.apps,
      });

  if (workstation.workstationType === workstationType) {
    return workstation;
  }

  return {
    ...workstation,
    workstationType,
  };
}

export function createPublishedWorkstationHistoryEntry(
  label: string,
  detail: string,
  date: string,
): PublishedWorkstationHistoryEntry {
  return {label, detail, date};
}

function withDefaultHistory(workstation: PublishedWorkstation): PublishedWorkstation {
  if (Array.isArray(workstation.history) && workstation.history.length > 0) {
    return workstation;
  }

  const owner = workstation.author.trim() || 'Workstations Library';
  const assignmentSummary = workstation.assignmentSummary ?? 'the selected destination';
  const history = [
    createPublishedWorkstationHistoryEntry('Created', `${owner} created this workstation.`, workstation.createdAt),
    createPublishedWorkstationHistoryEntry('Published', `Assigned to ${assignmentSummary}.`, workstation.updatedAt),
  ];

  if (workstation.updatedAt !== workstation.createdAt) {
    history.push(
      createPublishedWorkstationHistoryEntry(
        'Updated',
        `${workstation.widgetCount} widgets are currently enabled in this workstation.`,
        workstation.updatedAt,
      ),
    );
  }

  return {
    ...workstation,
    history,
  };
}

function hydratePublishedWorkstation(workstation: PublishedWorkstation): PublishedWorkstation {
  return withDefaultHistory(withResolvedWorkstationType(withDefaultSnapshot(workstation)));
}

function readProjectPublishedWorkstations(): PublishedWorkstation[] {
  return projectPublishedWorkstations.map((item) => hydratePublishedWorkstation(item));
}

function getWorkstationUpdatedAtTime(workstation: PublishedWorkstation) {
  const time = Date.parse(workstation.updatedAt);
  return Number.isFinite(time) ? time : 0;
}

function mergeProjectPublishedWorkstations(storedWorkstations: PublishedWorkstation[]) {
  const hydratedStoredWorkstations = storedWorkstations.map((item) => hydratePublishedWorkstation(item));
  const projectWorkstations = readProjectPublishedWorkstations();
  const usedStoredIds = new Set<string>();
  const resolvedProjectWorkstations = projectWorkstations.map((projectWorkstation) => {
    const matchingStoredWorkstation = hydratedStoredWorkstations.find((storedWorkstation) => (
      storedWorkstation.id === projectWorkstation.id
      || normalizeWorkstationIdentifier(storedWorkstation.title) === normalizeWorkstationIdentifier(projectWorkstation.title)
    ));

    if (!matchingStoredWorkstation) return projectWorkstation;

    usedStoredIds.add(matchingStoredWorkstation.id);
    return getWorkstationUpdatedAtTime(matchingStoredWorkstation) > getWorkstationUpdatedAtTime(projectWorkstation)
      ? matchingStoredWorkstation
      : projectWorkstation;
  });
  const projectIds = new Set(projectWorkstations.map((item) => item.id));
  const projectTitles = new Set(projectWorkstations.map((item) => normalizeWorkstationIdentifier(item.title)));
  const uniqueStoredWorkstations = hydratedStoredWorkstations.filter((item) => (
    !usedStoredIds.has(item.id)
    && !projectIds.has(item.id)
    && !projectTitles.has(normalizeWorkstationIdentifier(item.title))
  ));

  return [...uniqueStoredWorkstations, ...resolvedProjectWorkstations];
}

export function readPublishedWorkstations(): PublishedWorkstation[] {
  if (typeof window === 'undefined') {
    return readProjectPublishedWorkstations();
  }

  try {
    const storedWorkstations = readablePresetLayoutVersions
      .map((version) => getPublishedWorkstationsStorageKey(version))
      .filter((key, index, keys) => keys.indexOf(key) === index)
      .flatMap((key) => {
        const raw = window.localStorage.getItem(key);
        if (!raw) return [] as PublishedWorkstation[];

        try {
          const parsed = JSON.parse(raw);
          return Array.isArray(parsed) ? parsed as PublishedWorkstation[] : [];
        } catch {
          return [] as PublishedWorkstation[];
        }
      });

    if (storedWorkstations.length === 0) return readProjectPublishedWorkstations();

    const latestStoredByIdentity = new Map<string, PublishedWorkstation>();
    storedWorkstations.forEach((workstation) => {
      const identity = workstation.id || normalizeWorkstationIdentifier(workstation.title);
      const current = latestStoredByIdentity.get(identity);
      if (!current || getWorkstationUpdatedAtTime(workstation) >= getWorkstationUpdatedAtTime(current)) {
        latestStoredByIdentity.set(identity, workstation);
      }
    });

    return mergeProjectPublishedWorkstations([...latestStoredByIdentity.values()]);
  } catch {
    return readProjectPublishedWorkstations();
  }
}

export function writePublishedWorkstations(workstations: PublishedWorkstation[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(publishedWorkstationsStorageKey, JSON.stringify(workstations));
  window.dispatchEvent(new CustomEvent(publishedWorkstationsUpdatedEvent));
}

export function publishCurrentWorkstation({
  apps = [],
  author,
  domains = ['shopfloor', 'oee', 'quality', 'actions'],
  layoutStorageKey,
  replaceId,
  title,
  nodeId,
  assignmentSummary,
  workstationType,
}: {
  apps?: string[];
  author: string;
  domains?: string[];
  layoutStorageKey: string;
  replaceId?: string;
  title: string;
  nodeId?: string;
  assignmentSummary?: string;
  workstationType?: WorkstationType;
}) {
  const now = new Date().toISOString();
  const existing = readPublishedWorkstations();
  const previousWorkstation = replaceId ? existing.find((workstation) => workstation.id === replaceId) : null;
  const snapshot = readPublishedWorkstationSnapshot(layoutStorageKey);

  const layoutState = typeof snapshot === 'object' && snapshot && 'layoutState' in snapshot
    ? snapshot.layoutState
    : null;
  const hiddenWidgetIds = typeof layoutState === 'object' && layoutState && 'hiddenWidgetIds' in layoutState && Array.isArray((layoutState as { hiddenWidgetIds?: unknown }).hiddenWidgetIds)
    ? (layoutState as { hiddenWidgetIds: string[] }).hiddenWidgetIds
    : [];
  const widgetCount = Math.max(0, 16 - hiddenWidgetIds.length);
  const nextAssignmentSummary = assignmentSummary ?? previousWorkstation?.assignmentSummary ?? 'the selected destination';
  const nextWorkstationType = workstationType
    ?? previousWorkstation?.workstationType
    ?? inferWorkstationType({title, domains, apps});
  const history = previousWorkstation?.history ? [...previousWorkstation.history] : [
    createPublishedWorkstationHistoryEntry('Created', `${author.trim() || 'Anonymous'} created this workstation.`, previousWorkstation?.createdAt ?? now),
  ];

  if (!previousWorkstation) {
    history.push(createPublishedWorkstationHistoryEntry('Published', `Assigned to ${nextAssignmentSummary}.`, now));
  } else {
    let hasStructuredUpdate = false;

    if (previousWorkstation.assignmentSummary !== nextAssignmentSummary) {
      history.push(
        createPublishedWorkstationHistoryEntry(
          'Destination updated',
          `Reassigned from ${previousWorkstation.assignmentSummary ?? 'previous destination'} to ${nextAssignmentSummary}.`,
          now,
        ),
      );
      hasStructuredUpdate = true;
    }

    if (previousWorkstation.workstationType !== nextWorkstationType) {
      history.push(
        createPublishedWorkstationHistoryEntry(
          'Type updated',
          `Changed workstation type from ${previousWorkstation.workstationType ?? 'Unassigned'} to ${nextWorkstationType}.`,
          now,
        ),
      );
      hasStructuredUpdate = true;
    }

    if (!hasStructuredUpdate) {
      history.push(createPublishedWorkstationHistoryEntry('Updated', `${widgetCount} widgets are currently enabled in this workstation.`, now));
    }
  }

  const workstation: PublishedWorkstation = {
    id: replaceId ?? `ws-${Date.now()}`,
    title: title.trim() || 'Untitled page (workstation)',
    author: author.trim() || 'Anonymous',
    createdAt: previousWorkstation?.createdAt ?? now,
    updatedAt: now,
    history,
    domains,
    apps,
    widgetCount,
    layoutStorageKey,
    snapshot,
    bookmarked: previousWorkstation?.bookmarked ?? false,
    sharedWith: previousWorkstation?.sharedWith ?? ['Line 10 Leads'],
    nodeId: nodeId ?? previousWorkstation?.nodeId,
    assignmentSummary: nextAssignmentSummary,
    workstationType: nextWorkstationType,
  };

  writePublishedWorkstations(replaceId
    ? existing.map((item) => (item.id === replaceId ? workstation : item))
    : [workstation, ...existing]);
  return workstation;
}
