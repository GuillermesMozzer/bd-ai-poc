import type { CtV2LayoutItem } from './CtV2GridLayout';
import { CT_V2_DASHBOARD_WIDGET_IDS } from '../widgets/CtV2DashboardWidgets';
import { CT_V2_RECEIVING_WIDGET_IDS } from '../widgets/CtV2ReceivingAreaWidgets';
import { CT_V2_WIP_WIDGET_IDS } from '../widgets/CtV2WipAreaWidgets';
import { CT_V2_OUTBOUND_WIDGET_IDS } from '../widgets/CtV2OutboundAreaWidgets';

export const OVERVIEW_LAYOUT_KEY = 'bd-logistics-ct-v2-layout-v1';
export const DASHBOARD_LAYOUT_KEY = 'bd-logistics-ct-v2-dashboard-layout-v1';
export const RECEIVING_LAYOUT_KEY = 'bd-logistics-ct-v2-receiving-layout-v1';
export const WIP_LAYOUT_KEY = 'bd-logistics-ct-v2-wip-layout-v1';
export const OUTBOUND_LAYOUT_KEY = 'bd-logistics-ct-v2-outbound-layout-v1';

function stacked(
  ids: readonly string[],
  height = 10,
): Record<string, CtV2LayoutItem[]> {
  const xs = ids.map((id, index) => ({
    i: id,
    x: 0,
    y: index * height,
    w: 4,
    h: height,
    minW: 2,
    minH: 4,
  }));
  const xxs = ids.map((id, index) => ({
    i: id,
    x: 0,
    y: index * height,
    w: 2,
    h: height,
    minW: 2,
    minH: 4,
  }));
  return { xs, xxs };
}

const OVERVIEW_DEFAULT_LG: CtV2LayoutItem[] = [
  { i: 'decision_queue', x: 0, y: 0, w: 4, h: 14, minW: 3, minH: 8 },
  { i: 'atlas_ai', x: 0, y: 14, w: 4, h: 12, minW: 3, minH: 8 },
  { i: 'spacex_gating', x: 4, y: 0, w: 4, h: 15, minW: 3, minH: 8 },
  { i: 'inbound_sla', x: 4, y: 15, w: 4, h: 11, minW: 3, minH: 7 },
  { i: 'sterilization_timeline', x: 8, y: 0, w: 4, h: 26, minW: 3, minH: 10 },
];

export const OVERVIEW_DEFAULT_LAYOUTS: Record<string, CtV2LayoutItem[]> = {
  lg: OVERVIEW_DEFAULT_LG,
  md: OVERVIEW_DEFAULT_LG,
  sm: [
    { i: 'decision_queue', x: 0, y: 0, w: 4, h: 12, minW: 3, minH: 8 },
    { i: 'atlas_ai', x: 4, y: 0, w: 4, h: 12, minW: 3, minH: 8 },
    { i: 'spacex_gating', x: 0, y: 12, w: 4, h: 13, minW: 3, minH: 8 },
    { i: 'inbound_sla', x: 4, y: 12, w: 4, h: 13, minW: 3, minH: 7 },
    { i: 'sterilization_timeline', x: 0, y: 25, w: 8, h: 14, minW: 4, minH: 10 },
  ],
  ...stacked(['decision_queue', 'spacex_gating', 'atlas_ai', 'inbound_sla', 'sterilization_timeline'], 12),
};

const DASHBOARD_DEFAULT_LG: CtV2LayoutItem[] = [
  { i: 'global_alert', x: 0, y: 0, w: 12, h: 4, minW: 4, minH: 3 },
  { i: 'executive_kpis', x: 0, y: 4, w: 4, h: 16, minW: 3, minH: 10 },
  { i: 'macroflow_status', x: 4, y: 4, w: 5, h: 16, minW: 3, minH: 10 },
  { i: 'area_towers', x: 9, y: 4, w: 3, h: 8, minW: 2, minH: 6 },
  { i: 'exception_pulse', x: 9, y: 12, w: 3, h: 8, minW: 2, minH: 6 },
  { i: 'ai_site_summary', x: 0, y: 20, w: 4, h: 6, minW: 3, minH: 4 },
  { i: 'journey_heatmap', x: 4, y: 20, w: 5, h: 10, minW: 3, minH: 8 },
  { i: 'critical_materials', x: 9, y: 20, w: 3, h: 6, minW: 2, minH: 5 },
  { i: 'leadership_kpis', x: 0, y: 26, w: 4, h: 6, minW: 3, minH: 5 },
  { i: 'wip_lanes', x: 0, y: 32, w: 6, h: 12, minW: 3, minH: 8 },
  { i: 'related_shortcuts', x: 6, y: 32, w: 3, h: 6, minW: 2, minH: 5 },
  { i: 'receiving_kpis', x: 9, y: 26, w: 3, h: 6, minW: 2, minH: 5 },
  { i: 'truck_schedule', x: 6, y: 38, w: 6, h: 10, minW: 3, minH: 7 },
  { i: 'dock_status', x: 0, y: 44, w: 3, h: 8, minW: 2, minH: 6 },
  { i: 'outbound_kpis', x: 3, y: 44, w: 3, h: 8, minW: 2, minH: 6 },
  { i: 'outbound_units', x: 9, y: 32, w: 3, h: 16, minW: 2, minH: 8 },
];

export const DASHBOARD_DEFAULT_LAYOUTS: Record<string, CtV2LayoutItem[]> = {
  lg: DASHBOARD_DEFAULT_LG,
  md: DASHBOARD_DEFAULT_LG,
  sm: DASHBOARD_DEFAULT_LG.map((item) => ({ ...item, w: Math.min(item.w, 8), x: item.x >= 8 ? 0 : item.x })),
  ...stacked(CT_V2_DASHBOARD_WIDGET_IDS, 10),
};

const RECEIVING_DEFAULT_LG: CtV2LayoutItem[] = [
  { i: 'recv_kpis', x: 0, y: 0, w: 12, h: 5, minW: 4, minH: 4 },
  { i: 'recv_trucks', x: 0, y: 5, w: 8, h: 16, minW: 4, minH: 10 },
  { i: 'recv_docks', x: 8, y: 5, w: 4, h: 16, minW: 3, minH: 8 },
  { i: 'recv_staging', x: 0, y: 21, w: 4, h: 12, minW: 3, minH: 7 },
  { i: 'recv_inspection', x: 4, y: 21, w: 4, h: 12, minW: 3, minH: 7 },
  { i: 'recv_exceptions', x: 8, y: 21, w: 4, h: 12, minW: 3, minH: 7 },
];

export const RECEIVING_DEFAULT_LAYOUTS: Record<string, CtV2LayoutItem[]> = {
  lg: RECEIVING_DEFAULT_LG,
  md: RECEIVING_DEFAULT_LG,
  sm: RECEIVING_DEFAULT_LG.map((item) => ({ ...item, w: Math.min(item.w, 8), x: item.x >= 8 ? 0 : item.x })),
  ...stacked(CT_V2_RECEIVING_WIDGET_IDS, 12),
};

const WIP_DEFAULT_LG: CtV2LayoutItem[] = [
  { i: 'wip_kpis', x: 0, y: 0, w: 12, h: 5, minW: 4, minH: 4 },
  { i: 'wip_aging', x: 0, y: 5, w: 6, h: 7, minW: 3, minH: 5 },
  { i: 'wip_stagnant', x: 6, y: 5, w: 6, h: 7, minW: 3, minH: 5 },
  { i: 'wip_inventory', x: 0, y: 12, w: 8, h: 12, minW: 4, minH: 8 },
  { i: 'wip_exceptions', x: 8, y: 12, w: 4, h: 12, minW: 3, minH: 7 },
  { i: 'wip_actions', x: 0, y: 24, w: 4, h: 10, minW: 3, minH: 6 },
  { i: 'wip_map', x: 4, y: 24, w: 4, h: 10, minW: 3, minH: 6 },
  { i: 'wip_transfers', x: 8, y: 24, w: 4, h: 10, minW: 3, minH: 6 },
];

export const WIP_DEFAULT_LAYOUTS: Record<string, CtV2LayoutItem[]> = {
  lg: WIP_DEFAULT_LG,
  md: WIP_DEFAULT_LG,
  sm: WIP_DEFAULT_LG.map((item) => ({ ...item, w: Math.min(item.w, 8), x: item.x >= 8 ? 0 : item.x })),
  ...stacked(CT_V2_WIP_WIDGET_IDS, 11),
};

const OUTBOUND_DEFAULT_LG: CtV2LayoutItem[] = [
  { i: 'ob_kpis', x: 0, y: 0, w: 12, h: 8, minW: 4, minH: 6 },
  { i: 'ob_alert', x: 0, y: 8, w: 4, h: 16, minW: 3, minH: 8 },
  { i: 'ob_normal', x: 4, y: 8, w: 8, h: 16, minW: 4, minH: 8 },
  { i: 'ob_insight', x: 0, y: 24, w: 6, h: 7, minW: 3, minH: 5 },
  { i: 'ob_exceptions', x: 6, y: 24, w: 6, h: 7, minW: 3, minH: 5 },
];

export const OUTBOUND_DEFAULT_LAYOUTS: Record<string, CtV2LayoutItem[]> = {
  lg: OUTBOUND_DEFAULT_LG,
  md: OUTBOUND_DEFAULT_LG,
  sm: OUTBOUND_DEFAULT_LG.map((item) => ({ ...item, w: Math.min(item.w, 8), x: item.x >= 8 ? 0 : item.x })),
  ...stacked(CT_V2_OUTBOUND_WIDGET_IDS, 12),
};
