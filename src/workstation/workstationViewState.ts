import {
  type WorkstationResponsiveLayouts,
  type WorkstationLayoutBreakpoint,
  type WorkstationLayoutItem,
  type PersonalWorkstationState,
  type CustomCreatedWidget,
  type PersonalWorkstationDashboardProps,
  type PublishedWorkstationSnapshot,
  type WorkstationWidgetPreferences,
} from './types';
import {lossFocusedDefaultMetricIds, lossFocusedMetricCatalogOrder, type LossFocusedMetricId} from './components/lossFocusedKpisData';
import {
  workstationCols,
  workstationBreakpointKeys,
  workstationBreakpoints,
  personalWidgetIds,
  defaultPersonalVisibleWidgetIds,
  customWidgetDatasets,
  getPersonalWidgetDefinition,
  isTextBoxWidgetInstanceId,
} from './workstationConstants';

export const personalLayoutSchemaVersion = 37;

function uniqueArray(arr: string[]): string[] {
  return arr.filter((value, index) => arr.indexOf(value) === index);
}

const widgetPreferencesStorageSuffix = '::widget-preferences';
const workstationDefaultsAppliedStorageSuffix = '::defaults-applied-v2';
type WidgetBreakdownMode = 'line' | 'department';
const widgetsAddedInPersonalLayoutSchema19 = ['work-orders'];
const widgetsAddedInPersonalLayoutSchema20 = ['equipment-status'];
const widgetsAddedInPersonalLayoutSchema21 = ['maintenance-analytics'];
const widgetsAddedInPersonalLayoutSchema22 = ['maintenance-hub'];
const widgetsAddedInPersonalLayoutSchema23 = ['maintenance-planner'];
const widgetsAddedInPersonalLayoutSchema24 = ['spare-parts-monitor'];
const widgetsAddedInPersonalLayoutSchema30 = ['leader-cil', 'leader-centerline', 'leader-equipment-changeover'];
const widgetsAddedInPersonalLayoutSchema31 = ['molding'];
const widgetsAddedInPersonalLayoutSchema32 = ['cil', 'centerline', 'equipment-changeover'];
const widgetsAddedInPersonalLayoutSchema33 = ['three-d-view'];
const widgetsAddedInPersonalLayoutSchema34: string[] = [];
const widgetsAddedInPersonalLayoutSchema35: string[] = [];
const widgetsAddedInPersonalLayoutSchema36 = ['safety-operator', 'quality-operator'];
const defaultHiddenWidgetsAddedWithoutSchemaBump = ['text-box'];
const textBoxBackgroundTones: NonNullable<WorkstationWidgetPreferences['textBox']>['backgroundTone'][] = ['white', 'neutral', 'brand', 'success', 'warning', 'error'];
const textBoxTextTones: NonNullable<WorkstationWidgetPreferences['textBox']>['textTone'][] = ['primary', 'secondary', 'brand', 'success', 'warning', 'error'];
const textBoxFontSizes: NonNullable<WorkstationWidgetPreferences['textBox']>['fontSize'][] = [12, 14, 16, 20, 24, 34];
const textBoxAlignments: NonNullable<WorkstationWidgetPreferences['textBox']>['align'][] = ['left', 'center', 'right'];
const textBoxVerticalAlignments: NonNullable<WorkstationWidgetPreferences['textBox']>['verticalAlign'][] = ['top', 'middle', 'bottom'];
const taskListWidgetMinimumLayoutById: Record<string, {h: number; minH: number}> = {
  'operator-cil': {h: 10, minH: 8},
  'operator-centerline': {h: 10, minH: 8},
  cil: {h: 10, minH: 8},
  centerline: {h: 10, minH: 8},
  'leader-cil': {h: 10, minH: 8},
  'leader-centerline': {h: 10, minH: 8},
  'operator-equipment-changeover': {h: 10, minH: 8},
  'equipment-changeover': {h: 10, minH: 8},
  'leader-equipment-changeover': {h: 10, minH: 8},
};
const technicianMaintenanceLayoutWidgetIds = [
  'work-orders',
  'my-maintenance-backlog',
  'equipment-status',
  'spare-parts-monitor',
  'maintenance-calendarwidget',
] as const;
const operatorMaintenanceLayoutWidgetIds = [
  'work-orders',
  'my-maintenance-backlog',
  'equipment-status',
  'maintenance-calendarwidget',
] as const;
const maintenanceLeaderLayoutWidgetIds = [
  'maintenance-hub',
  'my-maintenance-backlog',
  'maintenance-calendarwidget',
  'maintenance-analytics',
] as const;

export function getWidgetPreferencesStorageKey(layoutStorageKey: string) {
  return `${layoutStorageKey}${widgetPreferencesStorageSuffix}`;
}

export function getWorkstationDefaultsAppliedStorageKey(layoutStorageKey: string) {
  return `${layoutStorageKey}${workstationDefaultsAppliedStorageSuffix}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function rawPersonalLayoutsMentionWidget(rawLayouts: unknown, widgetId: string) {
  if (!isRecord(rawLayouts)) return false;

  return workstationBreakpointKeys.some((breakpoint) => {
    const layout = rawLayouts[breakpoint];
    return Array.isArray(layout) && layout.some((item) => isRecord(item) && item.i === widgetId);
  });
}

function sanitizeTextBoxWidgetPreference(candidate: unknown): WorkstationWidgetPreferences['textBox'] | undefined {
  if (!isRecord(candidate)) return undefined;

  const rawContent = candidate.content;
  const rawBackgroundTone = candidate.backgroundTone;
  const rawTextTone = candidate.textTone;
  const rawFontSize = candidate.fontSize;
  const rawAlign = candidate.align;
  const rawVerticalAlign = candidate.verticalAlign;

  return {
    content: typeof rawContent === 'string' ? rawContent.slice(0, 6000) : '',
    backgroundTone: textBoxBackgroundTones.includes(rawBackgroundTone as any) ? rawBackgroundTone as NonNullable<WorkstationWidgetPreferences['textBox']>['backgroundTone'] : 'white',
    textTone: textBoxTextTones.includes(rawTextTone as any) ? rawTextTone as NonNullable<WorkstationWidgetPreferences['textBox']>['textTone'] : 'primary',
    fontSize: rawFontSize === 32
      ? 34
      : textBoxFontSizes.includes(rawFontSize as any)
        ? rawFontSize as NonNullable<WorkstationWidgetPreferences['textBox']>['fontSize']
        : 16,
    bold: typeof candidate.bold === 'boolean' ? candidate.bold : false,
    italic: typeof candidate.italic === 'boolean' ? candidate.italic : false,
    underline: typeof candidate.underline === 'boolean' ? candidate.underline : false,
    align: textBoxAlignments.includes(rawAlign as any) ? rawAlign as NonNullable<WorkstationWidgetPreferences['textBox']>['align'] : 'left',
    verticalAlign: textBoxVerticalAlignments.includes(rawVerticalAlign as any) ? rawVerticalAlign as NonNullable<WorkstationWidgetPreferences['textBox']>['verticalAlign'] : 'top',
  };
}

export function sanitizeWorkstationWidgetPreferences(value: unknown): WorkstationWidgetPreferences {
  if (!isRecord(value)) return {};

  const readBreakdownPreference = (
    candidate: unknown,
  ): {breakdownBy: WidgetBreakdownMode; chartType?: 'bars' | 'lines'; showBreakdown: boolean; showCurrentOrderCard?: boolean; stackedCharts?: boolean; showStackedChartControls?: boolean} | undefined => {
    if (!isRecord(candidate)) return undefined;
    const rawBreakdownBy = candidate.breakdownBy;
    const rawShowBreakdown = candidate.showBreakdown;
    const rawChartType = candidate.chartType;
    const rawShowCurrentOrderCard = candidate.showCurrentOrderCard;
    const rawStackedCharts = candidate.stackedCharts;
    const rawShowStackedChartControls = candidate.showStackedChartControls;
    if ((rawBreakdownBy !== 'line' && rawBreakdownBy !== 'department') || typeof rawShowBreakdown !== 'boolean') {
      return undefined;
    }

    return {
      breakdownBy: rawBreakdownBy,
      ...(rawChartType === 'bars' || rawChartType === 'lines' ? {chartType: rawChartType} : {}),
      showBreakdown: rawShowBreakdown,
      ...(typeof rawShowCurrentOrderCard === 'boolean' ? {showCurrentOrderCard: rawShowCurrentOrderCard} : {}),
      ...(typeof rawStackedCharts === 'boolean' ? {stackedCharts: rawStackedCharts} : {}),
      ...(typeof rawShowStackedChartControls === 'boolean' ? {showStackedChartControls: rawShowStackedChartControls} : {}),
    };
  };

  let actionTracker: WorkstationWidgetPreferences['actionTracker'];
  if (isRecord(value.actionTracker)) {
    const rawViewMode = value.actionTracker.viewMode;
    if (rawViewMode === 'dashboard') {
      actionTracker = {viewMode: rawViewMode};
    } else if (rawViewMode === 'board' || rawViewMode === 'table') {
      actionTracker = {viewMode: 'dashboard'};
    }
  }

  const cost = readBreakdownPreference(value.cost);
  const delivery = readBreakdownPreference(value.delivery);
  const people = readBreakdownPreference(value.people);
  let lossFocusedKpis: WorkstationWidgetPreferences['lossFocusedKpis'];
  if (isRecord(value.lossFocusedKpis)) {
    const rawChartType = value.lossFocusedKpis.chartType;
    const rawActiveMetricIds = value.lossFocusedKpis.activeMetricIds;
    lossFocusedKpis = {
      ...(Array.isArray(rawActiveMetricIds) ? {activeMetricIds: sanitizeLossFocusedMetricIds(rawActiveMetricIds)} : {}),
      ...(rawChartType === 'bars' || rawChartType === 'lines' ? {chartType: rawChartType} : {}),
    };
    if (Object.keys(lossFocusedKpis).length === 0) {
      lossFocusedKpis = undefined;
    }
  }

  const textBox = sanitizeTextBoxWidgetPreference(value.textBox);
  let textBoxes: WorkstationWidgetPreferences['textBoxes'];
  if (isRecord(value.textBoxes)) {
    textBoxes = Object.entries(value.textBoxes).reduce<NonNullable<WorkstationWidgetPreferences['textBoxes']>>((preferences, [widgetId, preference]) => {
      if (!isTextBoxWidgetInstanceId(widgetId)) return preferences;
      const sanitized = sanitizeTextBoxWidgetPreference(preference);
      if (sanitized) preferences[widgetId] = sanitized;
      return preferences;
    }, {});
    if (Object.keys(textBoxes).length === 0) {
      textBoxes = undefined;
    }
  }

  return {
    ...(actionTracker ? {actionTracker} : {}),
    ...(textBox ? {textBox} : {}),
    ...(textBoxes ? {textBoxes} : {}),
    ...(lossFocusedKpis ? {lossFocusedKpis} : {}),
    ...(cost ? {cost} : {}),
    ...(delivery ? {delivery} : {}),
    ...(people ? {people} : {}),
  };
}

export function readWorkstationWidgetPreferences(layoutStorageKey: string): WorkstationWidgetPreferences {
  if (typeof window === 'undefined') return {};

  try {
    const raw = window.localStorage.getItem(getWidgetPreferencesStorageKey(layoutStorageKey));
    return raw ? sanitizeWorkstationWidgetPreferences(JSON.parse(raw)) : {};
  } catch {
    return {};
  }
}

export function writeWorkstationWidgetPreferences(
  layoutStorageKey: string,
  preferences: WorkstationWidgetPreferences,
) {
  if (typeof window === 'undefined') return;

  window.localStorage.setItem(
    getWidgetPreferencesStorageKey(layoutStorageKey),
    JSON.stringify(sanitizeWorkstationWidgetPreferences(preferences)),
  );
}

export function readPublishedWorkstationSnapshot(layoutStorageKey: string): PublishedWorkstationSnapshot {
  if (typeof window === 'undefined') {
    return {layoutState: null, widgetPreferences: {}};
  }

  let layoutState: unknown = null;
  try {
    const rawLayout = window.localStorage.getItem(layoutStorageKey);
    layoutState = rawLayout ? JSON.parse(rawLayout) : null;
  } catch {
    layoutState = null;
  }

  return {
    layoutState,
    widgetPreferences: readWorkstationWidgetPreferences(layoutStorageKey),
  };
}

export function hasStoredWorkstationViewState(layoutStorageKey: string) {
  if (typeof window === 'undefined') return false;

  return window.localStorage.getItem(layoutStorageKey) !== null
    || window.localStorage.getItem(getWidgetPreferencesStorageKey(layoutStorageKey)) !== null;
}

export function hasAppliedWorkstationDefaults(layoutStorageKey: string) {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(getWorkstationDefaultsAppliedStorageKey(layoutStorageKey)) === 'true';
}

export function markWorkstationDefaultsApplied(layoutStorageKey: string) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(getWorkstationDefaultsAppliedStorageKey(layoutStorageKey), 'true');
}

export function restorePublishedWorkstationSnapshot(
  layoutStorageKey: string,
  snapshot: unknown,
) {
  if (typeof window === 'undefined') return;

  const widgetPreferencesKey = getWidgetPreferencesStorageKey(layoutStorageKey);
  const parsedSnapshot = isRecord(snapshot) && ('layoutState' in snapshot || 'widgetPreferences' in snapshot)
    ? snapshot
    : null;
  const layoutState = parsedSnapshot ? parsedSnapshot.layoutState ?? null : snapshot ?? null;
  const widgetPreferences = parsedSnapshot
    ? sanitizeWorkstationWidgetPreferences(parsedSnapshot.widgetPreferences)
    : {};

  if (layoutState === null) {
    window.localStorage.removeItem(layoutStorageKey);
  } else {
    window.localStorage.setItem(layoutStorageKey, JSON.stringify(layoutState));
  }

  if (Object.keys(widgetPreferences).length === 0) {
    window.localStorage.removeItem(widgetPreferencesKey);
  } else {
    window.localStorage.setItem(widgetPreferencesKey, JSON.stringify(widgetPreferences));
  }
}

export function sanitizePersonalWidgetIds(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((id): id is string => typeof id === 'string');
}

export function sanitizeAddedCustomWidgetIds(raw: unknown, customWidgets: CustomCreatedWidget[]): string[] {
  const ids = sanitizePersonalWidgetIds(raw);
  const customIds = new Set(customWidgets.map((w) => w.id));
  return ids.filter((id) => customIds.has(id));
}

export function sanitizeLossFocusedMetricIds(raw: unknown): LossFocusedMetricId[] {
  if (!Array.isArray(raw)) return lossFocusedDefaultMetricIds;
  return raw.filter((id): id is LossFocusedMetricId => typeof id === 'string' && lossFocusedMetricCatalogOrder.includes(id as LossFocusedMetricId));
}

export function sanitizeCustomCreatedWidgets(raw: unknown): CustomCreatedWidget[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null && typeof item.id === 'string')
    .map((item) => ({
      id: item.id as string,
      title: typeof item.title === 'string' ? item.title : 'Custom Widget',
      dataset: customWidgetDatasets.includes(item.dataset as any) ? item.dataset as CustomCreatedWidget['dataset'] : 'Production',
      metrics: Array.isArray(item.metrics) ? item.metrics.filter((m): m is string => typeof m === 'string') : [],
      visualization: typeof item.visualization === 'string' ? item.visualization : 'KPI Card',
      filters: Array.isArray(item.filters) ? item.filters.filter((f): f is string => typeof f === 'string') : [],
    }));
}

export function createPersonalLayoutItem(widgetId: string, cols: number, index = 0): WorkstationLayoutItem {
  const widget = getPersonalWidgetDefinition(widgetId);
  if (!widget) return {i: widgetId, x: 0, y: index * 4, w: 2, h: 4};

  const nextWidth = Math.min(widget.defaultLayout.w, cols);
  return {
    i: widgetId,
    x: (index * 2) % cols,
    y: 100 + index * 4,
    w: nextWidth,
    h: widget.defaultLayout.h,
    minW: Math.min(widget.defaultLayout.minW, cols),
    minH: widget.defaultLayout.minH,
  };
}

function createDefaultBreakpointLayout(breakpoint: WorkstationLayoutBreakpoint): WorkstationLayoutItem[] {
  const cols = workstationCols[breakpoint];
  return personalWidgetIds.map((id, index) => createPersonalLayoutItem(id, cols, index));
}

function createDefaultPersonalLayouts(): WorkstationResponsiveLayouts {
  return workstationBreakpointKeys.reduce((layouts, breakpoint) => {
    layouts[breakpoint] = createDefaultBreakpointLayout(breakpoint);
    return layouts;
  }, {} as WorkstationResponsiveLayouts);
}

export function sanitizePersonalLayoutItems(rawItems: unknown, breakpoint: WorkstationLayoutBreakpoint) {
  const cols = workstationCols[breakpoint];
  if (!Array.isArray(rawItems)) return createDefaultBreakpointLayout(breakpoint);

  const seen = new Set<string>();
  const sanitized = rawItems
    .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null && typeof item.i === 'string')
    .reduce<WorkstationLayoutItem[]>((items, item) => {
      const widgetId = item.i as string;
      const widget = getPersonalWidgetDefinition(widgetId);
      if (!widget || seen.has(widgetId)) return items;
      seen.add(widgetId);

      const width = Number(item.w);
      const height = Number(item.h);
      const x = Number(item.x);
      const y = Number(item.y);
      const minWidth = Math.min(widget.defaultLayout.minW, cols);
      const nextWidth = Number.isFinite(width) ? Math.max(minWidth, Math.min(Math.round(width), cols)) : Math.min(widget.defaultLayout.w, cols);

      items.push({
        i: widgetId,
        x: Number.isFinite(x) ? Math.min(Math.max(0, Math.round(x)), Math.max(0, cols - nextWidth)) : 0,
        y: Number.isFinite(y) ? Math.max(0, Math.round(y)) : widget.defaultLayout.y,
        w: nextWidth,
        h: Number.isFinite(height) ? Math.max(1, Math.round(height)) : widget.defaultLayout.h,
        minW: minWidth,
        minH: widget.defaultLayout.minH,
      });

      return items;
    }, []);

  personalWidgetIds.forEach((widgetId, index) => {
    if (!sanitized.some((item) => item.i === widgetId)) {
      sanitized.push(createPersonalLayoutItem(widgetId, cols, index));
    }
  });

  return sanitized;
}

function normalizeProductionAndOeePair(layouts: WorkstationResponsiveLayouts) {
  return workstationBreakpointKeys.reduce((nextLayouts, breakpoint) => {
    const cols = workstationCols[breakpoint];
    const pairIds = ['production-planning', 'shift-oee', 'my-tasks', 'eso', 'tier-management', 'quality', 'safety', 'delivery', 'people', 'communication', 'recognition', 'cost'];
    nextLayouts[breakpoint] = layouts[breakpoint].map((item) => {
      if (!pairIds.includes(item.i)) return item;
      return createPersonalLayoutItem(item.i, cols);
    });
    return nextLayouts;
  }, {} as WorkstationResponsiveLayouts);
}

function normalizeTechnicianMaintenanceLayout(layouts: WorkstationResponsiveLayouts) {
  return workstationBreakpointKeys.reduce((nextLayouts, breakpoint) => {
    const cols = workstationCols[breakpoint];
    nextLayouts[breakpoint] = layouts[breakpoint].map((item) => {
      if (!technicianMaintenanceLayoutWidgetIds.includes(item.i as any)) return item;
      return createPersonalLayoutItem(item.i, cols);
    });
    return nextLayouts;
  }, {} as WorkstationResponsiveLayouts);
}

function normalizeOperatorMaintenanceLayout(layouts: WorkstationResponsiveLayouts, hiddenWidgetIds: string[]) {
  const hiddenWidgetSet = new Set(hiddenWidgetIds);
  const hasOperatorMaintenanceSet = operatorMaintenanceLayoutWidgetIds.every((widgetId) => !hiddenWidgetSet.has(widgetId));
  if (!hasOperatorMaintenanceSet || !hiddenWidgetSet.has('spare-parts-monitor')) return layouts;

  const layoutByBreakpoint: Partial<Record<WorkstationLayoutBreakpoint, Record<string, WorkstationLayoutItem>>> = {
    lg: {
      'work-orders': { i: 'work-orders', x: 0, y: 0, w: 7, h: 12, minW: 4, minH: 8 },
      'my-maintenance-backlog': { i: 'my-maintenance-backlog', x: 7, y: 0, w: 5, h: 12, minW: 4, minH: 8 },
      'equipment-status': { i: 'equipment-status', x: 0, y: 12, w: 5, h: 12, minW: 4, minH: 8 },
      'maintenance-calendarwidget': { i: 'maintenance-calendarwidget', x: 5, y: 12, w: 7, h: 12, minW: 5, minH: 8 },
    },
    md: {
      'work-orders': { i: 'work-orders', x: 0, y: 0, w: 7, h: 12, minW: 4, minH: 8 },
      'my-maintenance-backlog': { i: 'my-maintenance-backlog', x: 7, y: 0, w: 5, h: 12, minW: 4, minH: 8 },
      'equipment-status': { i: 'equipment-status', x: 0, y: 12, w: 5, h: 12, minW: 4, minH: 8 },
      'maintenance-calendarwidget': { i: 'maintenance-calendarwidget', x: 5, y: 12, w: 7, h: 12, minW: 5, minH: 8 },
    },
    sm: {
      'work-orders': { i: 'work-orders', x: 0, y: 0, w: 8, h: 12, minW: 4, minH: 8 },
      'my-maintenance-backlog': { i: 'my-maintenance-backlog', x: 0, y: 12, w: 8, h: 12, minW: 4, minH: 8 },
      'equipment-status': { i: 'equipment-status', x: 0, y: 24, w: 8, h: 12, minW: 4, minH: 8 },
      'maintenance-calendarwidget': { i: 'maintenance-calendarwidget', x: 0, y: 36, w: 8, h: 12, minW: 5, minH: 8 },
    },
    xs: {
      'work-orders': { i: 'work-orders', x: 0, y: 0, w: 4, h: 12, minW: 4, minH: 8 },
      'my-maintenance-backlog': { i: 'my-maintenance-backlog', x: 0, y: 12, w: 4, h: 12, minW: 4, minH: 8 },
      'equipment-status': { i: 'equipment-status', x: 0, y: 24, w: 4, h: 12, minW: 4, minH: 8 },
      'maintenance-calendarwidget': { i: 'maintenance-calendarwidget', x: 0, y: 36, w: 4, h: 12, minW: 4, minH: 8 },
    },
    xxs: {
      'work-orders': { i: 'work-orders', x: 0, y: 0, w: 2, h: 12, minW: 2, minH: 8 },
      'my-maintenance-backlog': { i: 'my-maintenance-backlog', x: 0, y: 12, w: 2, h: 12, minW: 2, minH: 8 },
      'equipment-status': { i: 'equipment-status', x: 0, y: 24, w: 2, h: 12, minW: 2, minH: 8 },
      'maintenance-calendarwidget': { i: 'maintenance-calendarwidget', x: 0, y: 36, w: 2, h: 12, minW: 2, minH: 8 },
    },
  };

  return workstationBreakpointKeys.reduce((nextLayouts, breakpoint) => {
    const presetById = layoutByBreakpoint[breakpoint] ?? {};
    nextLayouts[breakpoint] = layouts[breakpoint].map((item) => presetById[item.i] ?? item);
    return nextLayouts;
  }, {} as WorkstationResponsiveLayouts);
}

function normalizeMaintenanceLeaderLayout(layouts: WorkstationResponsiveLayouts, hiddenWidgetIds: string[]) {
  const hiddenWidgetSet = new Set(hiddenWidgetIds);
  const hasMaintenanceLeaderSet = maintenanceLeaderLayoutWidgetIds.every((widgetId) => !hiddenWidgetSet.has(widgetId));
  if (!hasMaintenanceLeaderSet) return layouts;

  const layoutByBreakpoint: Partial<Record<WorkstationLayoutBreakpoint, Record<string, WorkstationLayoutItem>>> = {
    lg: {
      'maintenance-hub': { i: 'maintenance-hub', x: 0, y: 0, w: 6, h: 9, minW: 4, minH: 6 },
      'my-maintenance-backlog': { i: 'my-maintenance-backlog', x: 6, y: 0, w: 6, h: 9, minW: 4, minH: 7 },
      'maintenance-calendarwidget': { i: 'maintenance-calendarwidget', x: 0, y: 9, w: 6, h: 14, minW: 4, minH: 10 },
      'maintenance-analytics': { i: 'maintenance-analytics', x: 6, y: 9, w: 6, h: 14, minW: 4, minH: 7 },
    },
    md: {
      'maintenance-hub': { i: 'maintenance-hub', x: 0, y: 0, w: 6, h: 9, minW: 4, minH: 6 },
      'my-maintenance-backlog': { i: 'my-maintenance-backlog', x: 6, y: 0, w: 6, h: 9, minW: 4, minH: 7 },
      'maintenance-calendarwidget': { i: 'maintenance-calendarwidget', x: 0, y: 9, w: 6, h: 14, minW: 4, minH: 10 },
      'maintenance-analytics': { i: 'maintenance-analytics', x: 6, y: 9, w: 6, h: 14, minW: 4, minH: 7 },
    },
    sm: {
      'maintenance-hub': { i: 'maintenance-hub', x: 0, y: 0, w: 8, h: 9, minW: 4, minH: 6 },
      'my-maintenance-backlog': { i: 'my-maintenance-backlog', x: 0, y: 9, w: 8, h: 10, minW: 4, minH: 7 },
      'maintenance-calendarwidget': { i: 'maintenance-calendarwidget', x: 0, y: 19, w: 8, h: 14, minW: 5, minH: 10 },
      'maintenance-analytics': { i: 'maintenance-analytics', x: 0, y: 33, w: 8, h: 12, minW: 5, minH: 7 },
    },
    xs: {
      'maintenance-hub': { i: 'maintenance-hub', x: 0, y: 0, w: 4, h: 9, minW: 4, minH: 6 },
      'my-maintenance-backlog': { i: 'my-maintenance-backlog', x: 0, y: 9, w: 4, h: 10, minW: 4, minH: 7 },
      'maintenance-calendarwidget': { i: 'maintenance-calendarwidget', x: 0, y: 19, w: 4, h: 14, minW: 4, minH: 10 },
      'maintenance-analytics': { i: 'maintenance-analytics', x: 0, y: 33, w: 4, h: 12, minW: 4, minH: 7 },
    },
    xxs: {
      'maintenance-hub': { i: 'maintenance-hub', x: 0, y: 0, w: 2, h: 9, minW: 2, minH: 6 },
      'my-maintenance-backlog': { i: 'my-maintenance-backlog', x: 0, y: 9, w: 2, h: 10, minW: 2, minH: 7 },
      'maintenance-calendarwidget': { i: 'maintenance-calendarwidget', x: 0, y: 19, w: 2, h: 14, minW: 2, minH: 10 },
      'maintenance-analytics': { i: 'maintenance-analytics', x: 0, y: 33, w: 2, h: 12, minW: 2, minH: 7 },
    },
  };

  return workstationBreakpointKeys.reduce((nextLayouts, breakpoint) => {
    const presetById = layoutByBreakpoint[breakpoint] ?? {};
    nextLayouts[breakpoint] = layouts[breakpoint].map((item) => presetById[item.i] ?? item);
    return nextLayouts;
  }, {} as WorkstationResponsiveLayouts);
}

function ensureTaskListWidgetLayoutHeights(layouts: WorkstationResponsiveLayouts) {
  return workstationBreakpointKeys.reduce((nextLayouts, breakpoint) => {
    nextLayouts[breakpoint] = layouts[breakpoint].map((item) => {
      const minimum = taskListWidgetMinimumLayoutById[item.i];
      if (!minimum) return item;

      return {
        ...item,
        h: Math.max(item.h, minimum.h),
        minH: Math.max(item.minH ?? minimum.minH, minimum.minH),
      };
    });
    return nextLayouts;
  }, {} as WorkstationResponsiveLayouts);
}

function ensureEsoWidgetLayoutSizes(layouts: WorkstationResponsiveLayouts) {
  const presetByBreakpoint: Partial<Record<WorkstationLayoutBreakpoint, Record<string, WorkstationLayoutItem>>> = {
    lg: {
      'my-esos': { i: 'my-esos', x: 0, y: 23, w: 10, h: 13, minW: 4, minH: 12 },
      'eso': { i: 'eso', x: 0, y: 36, w: 10, h: 13, minW: 4, minH: 13 },
    },
    md: {
      'my-esos': { i: 'my-esos', x: 0, y: 23, w: 10, h: 13, minW: 4, minH: 12 },
      'eso': { i: 'eso', x: 0, y: 36, w: 10, h: 13, minW: 4, minH: 13 },
    },
    sm: {
      'my-esos': { i: 'my-esos', x: 0, y: 23, w: 8, h: 13, minW: 4, minH: 12 },
      'eso': { i: 'eso', x: 0, y: 36, w: 8, h: 13, minW: 4, minH: 13 },
    },
    xs: {
      'my-esos': { i: 'my-esos', x: 0, y: 23, w: 4, h: 13, minW: 4, minH: 12 },
      'eso': { i: 'eso', x: 0, y: 36, w: 4, h: 13, minW: 4, minH: 13 },
    },
    xxs: {
      'my-esos': { i: 'my-esos', x: 0, y: 23, w: 2, h: 13, minW: 2, minH: 12 },
      'eso': { i: 'eso', x: 0, y: 36, w: 2, h: 13, minW: 2, minH: 13 },
    },
  };

  return workstationBreakpointKeys.reduce((nextLayouts, breakpoint) => {
    const presets = presetByBreakpoint[breakpoint] ?? {};
    nextLayouts[breakpoint] = layouts[breakpoint].map((item) => presets[item.i] ?? item);
    return nextLayouts;
  }, {} as WorkstationResponsiveLayouts);
}

export function sanitizePersonalState(rawStateInput: any): PersonalWorkstationState {
  const rawState = (rawStateInput && typeof rawStateInput === 'object' && 'layoutState' in rawStateInput)
    ? rawStateInput.layoutState
    : rawStateInput;

  const defaultHiddenWidgetIds = personalWidgetIds.filter((widgetId) => !defaultPersonalVisibleWidgetIds.includes(widgetId));
  const rawLayoutSchemaVersion = typeof rawState?.layoutSchemaVersion === 'number' ? rawState.layoutSchemaVersion : 0;
  const hiddenWidgetIds = rawState?.hiddenWidgetIds
    ? sanitizePersonalWidgetIds(rawState.hiddenWidgetIds)
    : defaultHiddenWidgetIds;
  const hiddenWidgetIdsWithNewDefaultHidden = uniqueArray([
    ...hiddenWidgetIds,
    ...defaultHiddenWidgetsAddedWithoutSchemaBump.filter((widgetId) => (
      !hiddenWidgetIds.includes(widgetId)
      && !rawPersonalLayoutsMentionWidget(rawState?.layouts, widgetId)
    )),
  ]);
  const splitCilCenterlineHiddenWidgetIds = rawLayoutSchemaVersion < 30 && hiddenWidgetIdsWithNewDefaultHidden.includes('operator-cil-centerline')
    ? [
        ...hiddenWidgetIdsWithNewDefaultHidden.filter((widgetId) => widgetId !== 'operator-cil-centerline'),
        'operator-cil',
        'operator-centerline',
      ]
    : hiddenWidgetIdsWithNewDefaultHidden.filter((widgetId) => widgetId !== 'operator-cil-centerline');
  const migratedHiddenWidgetIds = rawLayoutSchemaVersion < personalLayoutSchemaVersion
    ? uniqueArray([
        ...splitCilCenterlineHiddenWidgetIds.filter((widgetId) => widgetId !== 'eso' && widgetId !== 'my-esos'),
        ...(rawLayoutSchemaVersion < 19 ? widgetsAddedInPersonalLayoutSchema19 : []),
        ...(rawLayoutSchemaVersion < 20 ? widgetsAddedInPersonalLayoutSchema20 : []),
        ...(rawLayoutSchemaVersion < 21 ? widgetsAddedInPersonalLayoutSchema21 : []),
        ...(rawLayoutSchemaVersion < 22 ? widgetsAddedInPersonalLayoutSchema22 : []),
        ...(rawLayoutSchemaVersion < 23 ? widgetsAddedInPersonalLayoutSchema23 : []),
        ...(rawLayoutSchemaVersion < 24 ? widgetsAddedInPersonalLayoutSchema24 : []),
        ...(rawLayoutSchemaVersion < 30 ? widgetsAddedInPersonalLayoutSchema30 : []),
        ...(rawLayoutSchemaVersion < 31 ? widgetsAddedInPersonalLayoutSchema31 : []),
        ...(rawLayoutSchemaVersion < 32 ? widgetsAddedInPersonalLayoutSchema32 : []),
        ...(rawLayoutSchemaVersion < 33 ? widgetsAddedInPersonalLayoutSchema33 : []),
        ...(rawLayoutSchemaVersion < 34 ? widgetsAddedInPersonalLayoutSchema34 : []),
        ...(rawLayoutSchemaVersion < 35 ? widgetsAddedInPersonalLayoutSchema35 : []),
        ...(rawLayoutSchemaVersion < 36 ? widgetsAddedInPersonalLayoutSchema36 : []),
      ])
    : hiddenWidgetIds;
  const rawLayouts = typeof rawState?.layouts === 'object' && rawState.layouts !== null
    ? rawState.layouts as Partial<Record<WorkstationLayoutBreakpoint, unknown>>
    : {};
  const layouts = workstationBreakpointKeys.reduce((nextLayouts, breakpoint) => {
    nextLayouts[breakpoint] = sanitizePersonalLayoutItems(rawLayouts[breakpoint], breakpoint);
    return nextLayouts;
  }, {} as WorkstationResponsiveLayouts);
  const customWidgets = sanitizeCustomCreatedWidgets(rawState?.customWidgets);

  return {
    addedCustomWidgetIds: sanitizeAddedCustomWidgetIds(rawState?.addedCustomWidgetIds, customWidgets),
    customWidgets,
    hiddenWidgetIds: migratedHiddenWidgetIds,
    layouts: rawLayoutSchemaVersion < personalLayoutSchemaVersion
      ? ensureEsoWidgetLayoutSizes(
          ensureTaskListWidgetLayoutHeights(
            normalizeMaintenanceLeaderLayout(
              normalizeOperatorMaintenanceLayout(
                normalizeTechnicianMaintenanceLayout(normalizeProductionAndOeePair(layouts)),
                migratedHiddenWidgetIds,
              ),
              migratedHiddenWidgetIds,
            ),
          ),
        )
      : ensureEsoWidgetLayoutSizes(layouts),
    lossFocusedMetricIds: sanitizeLossFocusedMetricIds(rawState?.lossFocusedMetricIds),
    layoutSchemaVersion: personalLayoutSchemaVersion,
  };
}

export function createEmptyPersonalWorkstationState(): PersonalWorkstationState {
  const emptyLayouts = workstationBreakpointKeys.reduce((acc, breakpoint) => {
    acc[breakpoint] = [];
    return acc;
  }, {} as WorkstationResponsiveLayouts);

  return sanitizePersonalState({
    addedCustomWidgetIds: [],
    customWidgets: [],
    hiddenWidgetIds: [...personalWidgetIds],
    layouts: emptyLayouts,
    layoutSchemaVersion: personalLayoutSchemaVersion,
  });
}

const tierPresetWidgetIds = [
  'safety',
  'quality',
  'delivery',
  'cost',
  'people',
  'three-p-tracking',
  'loss-focused-kpis',
  'action-tracker',
];

const operatorPresetWidgetIds = [
  'work-orders',
  'my-maintenance-backlog',
  'equipment-status',
  'maintenance-calendarwidget',
];

function getTierPresetWidgetLayouts(initialSnapshot: any) {
  const snapshotLayoutState = isRecord(initialSnapshot) && isRecord(initialSnapshot.layoutState)
    ? initialSnapshot.layoutState
    : null;
  const snapshotLayouts = snapshotLayoutState && isRecord(snapshotLayoutState.layouts)
    ? snapshotLayoutState.layouts
    : null;
  const snapshotLgLayout = snapshotLayouts && Array.isArray(snapshotLayouts.lg)
    ? snapshotLayouts.lg
    : [];

  const presetItems = snapshotLgLayout
    .filter((item): item is WorkstationLayoutItem => (
      isRecord(item)
      && typeof item.i === 'string'
      && tierPresetWidgetIds.includes(item.i)
      && typeof item.h === 'number'
    ));

  if (presetItems.length !== tierPresetWidgetIds.length) return null;

  return new Map(presetItems.map((item) => [item.i, item]));
}

function getTierPresetHiddenWidgetIds(initialSnapshot: any) {
  const snapshotLayoutState = isRecord(initialSnapshot) && isRecord(initialSnapshot.layoutState)
    ? initialSnapshot.layoutState
    : null;
  return snapshotLayoutState && Array.isArray(snapshotLayoutState.hiddenWidgetIds)
    ? sanitizePersonalWidgetIds(snapshotLayoutState.hiddenWidgetIds)
    : null;
}

function getOperatorPresetWidgetLayouts(initialSnapshot: any) {
  const snapshotLayoutState = isRecord(initialSnapshot) && isRecord(initialSnapshot.layoutState)
    ? initialSnapshot.layoutState
    : null;
  const snapshotLayouts = snapshotLayoutState && isRecord(snapshotLayoutState.layouts)
    ? snapshotLayoutState.layouts
    : null;
  if (!snapshotLayouts) return null;

  const presetLayouts = new Map<WorkstationLayoutBreakpoint, Map<string, WorkstationLayoutItem>>();

  workstationBreakpointKeys.forEach((breakpoint) => {
    const breakpointLayout = Array.isArray(snapshotLayouts[breakpoint])
      ? snapshotLayouts[breakpoint]
      : [];
    const presetItems = breakpointLayout
      .filter((item): item is WorkstationLayoutItem => (
        isRecord(item)
        && typeof item.i === 'string'
        && operatorPresetWidgetIds.includes(item.i)
        && typeof item.x === 'number'
        && typeof item.y === 'number'
        && typeof item.w === 'number'
        && typeof item.h === 'number'
      ));

    if (presetItems.length === operatorPresetWidgetIds.length) {
      presetLayouts.set(breakpoint, new Map(presetItems.map((item) => [item.i, item])));
    }
  });

  return presetLayouts.size > 0 ? presetLayouts : null;
}

function applyTierPresetWidgetLayout(rawState: any, initialSnapshot: any) {
  const presetLayoutById = getTierPresetWidgetLayouts(initialSnapshot);
  if (!presetLayoutById || !isRecord(rawState) || !isRecord(rawState.layouts)) {
    return {state: rawState, changed: false};
  }

  let changed = false;
  const nextLayouts = {...rawState.layouts};
  const presetHiddenWidgetIds = getTierPresetHiddenWidgetIds(initialSnapshot);

  workstationBreakpointKeys.forEach((breakpoint) => {
    const rawLayout = rawState.layouts[breakpoint];
    if (!Array.isArray(rawLayout)) return;

    nextLayouts[breakpoint] = rawLayout.map((item) => {
      if (!isRecord(item) || typeof item.i !== 'string') return item;
      const presetItem = presetLayoutById.get(item.i);
      if (!presetItem) return item;

      const nextItem: Record<string, unknown> = {
        ...item,
        h: presetItem.h,
        minH: presetItem.minH,
      };

      if (breakpoint === 'lg') {
        nextItem.x = presetItem.x;
        nextItem.y = presetItem.y;
        nextItem.w = presetItem.w;
        nextItem.minW = presetItem.minW;
      }

      if (
        item.h !== nextItem.h
        || item.minH !== nextItem.minH
        || item.x !== nextItem.x
        || item.y !== nextItem.y
        || item.w !== nextItem.w
        || item.minW !== nextItem.minW
      ) {
        changed = true;
      }

      return nextItem;
    });
  });

  const rawHiddenWidgetIds = sanitizePersonalWidgetIds(rawState.hiddenWidgetIds);
  const hiddenChanged = Boolean(presetHiddenWidgetIds)
    && (
      rawHiddenWidgetIds.length !== presetHiddenWidgetIds.length
      || rawHiddenWidgetIds.some((id, index) => id !== presetHiddenWidgetIds[index])
    );

  return {
    state: changed || hiddenChanged
      ? {
          ...rawState,
          hiddenWidgetIds: presetHiddenWidgetIds ?? rawState.hiddenWidgetIds,
          layouts: nextLayouts,
        }
      : rawState,
    changed: changed || hiddenChanged,
  };
}

function applyOperatorPresetWidgetLayout(rawState: any, initialSnapshot: any) {
  const presetLayouts = getOperatorPresetWidgetLayouts(initialSnapshot);
  if (!presetLayouts || !isRecord(rawState) || !isRecord(rawState.layouts)) {
    return {state: rawState, changed: false};
  }

  let changed = false;
  const nextLayouts = {...rawState.layouts};

  workstationBreakpointKeys.forEach((breakpoint) => {
    const rawLayout = rawState.layouts[breakpoint];
    const presetLayoutById = presetLayouts.get(breakpoint);
    if (!Array.isArray(rawLayout) || !presetLayoutById) return;

    nextLayouts[breakpoint] = rawLayout.map((item) => {
      if (!isRecord(item) || typeof item.i !== 'string') return item;
      const presetItem = presetLayoutById.get(item.i);
      if (!presetItem) return item;

      const nextItem: Record<string, unknown> = {
        ...item,
        x: presetItem.x,
        y: presetItem.y,
        w: presetItem.w,
        h: presetItem.h,
        minW: presetItem.minW,
        minH: presetItem.minH,
      };

      if (
        item.x !== nextItem.x
        || item.y !== nextItem.y
        || item.w !== nextItem.w
        || item.h !== nextItem.h
        || item.minW !== nextItem.minW
        || item.minH !== nextItem.minH
      ) {
        changed = true;
      }

      return nextItem;
    });
  });

  return {
    state: changed
      ? {
          ...rawState,
          layouts: nextLayouts,
        }
      : rawState,
    changed,
  };
}

export function getInitialPersonalWorkstationState(storageKey: string, initialSnapshot: any = null, startEmpty = false): PersonalWorkstationState {
  if (typeof window === 'undefined') return sanitizePersonalState(initialSnapshot);

  try {
    const raw = window.localStorage.getItem(storageKey);
    if (raw) {
      const parsedState = JSON.parse(raw);
      const tierMigratedState = applyTierPresetWidgetLayout(parsedState, initialSnapshot);
      const migratedState = applyOperatorPresetWidgetLayout(tierMigratedState.state, initialSnapshot);
      if (tierMigratedState.changed || migratedState.changed) {
        window.localStorage.setItem(storageKey, JSON.stringify(migratedState.state));
      }
      return sanitizePersonalState(migratedState.state);
    }

    const state = startEmpty ? createEmptyPersonalWorkstationState() : sanitizePersonalState(initialSnapshot);

    // If opening a workstation with a snapshot for the first time (no saved config),
    // ensure it's saved to the local database immediately.
    if (initialSnapshot && !startEmpty && !hasAppliedWorkstationDefaults(storageKey)) {
      restorePublishedWorkstationSnapshot(storageKey, initialSnapshot);
      markWorkstationDefaultsApplied(storageKey);
    }

    return state;
  } catch {
    return startEmpty ? createEmptyPersonalWorkstationState() : sanitizePersonalState(initialSnapshot);
  }
}
