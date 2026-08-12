export { InboundSlaWidget } from './InboundSlaWidget';
export { ActiveLoadsTimelineWidget } from './ActiveLoadsTimelineWidget';
export { SpaceXShippingGatingWidget } from './SpaceXShippingGatingWidget';
export { LineShortageRiskWidget } from './LineShortageRiskWidget';
export { PrioritizedDecisionQueue } from './PrioritizedDecisionQueue';
export { SpaceXShippingGatingConsole } from './SpaceXShippingGatingConsole';
export { SterilizationLoadsTimelineWidget } from './SterilizationLoadsTimelineWidget';
export { InboundSlaChartWidget } from './InboundSlaChartWidget';
export { AtlasAiPrescriptivePanel } from './AtlasAiPrescriptivePanel';

export const LOGISTICS_WIDGETS = {
  inbound_sla_chart: {
    id: 'inbound_sla_chart',
    title: 'KPI: Inbound Dock-to-Stock SLA',
    description: 'Real-time monitoring of inbound receiving and release cycle time.',
    category: 'Logistics',
    size: { w: 6, h: 4 },
    component: 'InboundSlaWidget',
  },
  active_loads_timeline: {
    id: 'active_loads_timeline',
    title: 'Sterilization Load Tracking',
    description: 'Physical custody of trucks in transit with an external provider (Sterigenics).',
    category: 'Logistics',
    size: { w: 4, h: 4 },
    component: 'ActiveLoadsTimelineWidget',
  },
  line_shortage_risk: {
    id: 'line_shortage_risk',
    title: 'Line Shortage Risk',
    description: 'Picking queues prioritized by imminent line-stop risk.',
    category: 'Logistics',
    size: { w: 6, h: 4 },
    component: 'LineShortageRiskWidget',
  },
  spacex_shipping_gating: {
    id: 'spacex_shipping_gating',
    title: 'SpaceX Shipping Gating Console',
    description: 'Compliance status of the 4 release gates before loading the truck.',
    category: 'Logistics',
    size: { w: 4, h: 4 },
    component: 'SpaceXShippingGatingWidget',
  },
  prioritized_decision_queue: {
    id: 'prioritized_decision_queue',
    title: 'Decision Queue (DA)',
    description: 'Exceptions prioritized by time-to-impact with owner and resolve CTA.',
    category: 'Logistics',
    size: { w: 4, h: 6 },
    component: 'PrioritizedDecisionQueue',
  },
  spacex_shipping_gating_console: {
    id: 'spacex_shipping_gating_console',
    title: 'SpaceX Gating Console (CT V2)',
    description: 'Dark CoreSight OB03 launch console with GO/No-Go gates.',
    category: 'Logistics',
    size: { w: 4, h: 5 },
    component: 'SpaceXShippingGatingConsole',
  },
  sterilization_loads_timeline: {
    id: 'sterilization_loads_timeline',
    title: 'Sterilization Timeline (OB02)',
    description: 'Dark CoreSight custody timeline for external sterilization loads.',
    category: 'Logistics',
    size: { w: 4, h: 6 },
    component: 'SterilizationLoadsTimelineWidget',
  },
  inbound_sla_chart_v2: {
    id: 'inbound_sla_chart_v2',
    title: 'Inbound SLA Chart (IN01)',
    description: 'Dark CoreSight dock-to-stock SLA area chart.',
    category: 'Logistics',
    size: { w: 6, h: 4 },
    component: 'InboundSlaChartWidget',
  },
  atlas_ai_prescriptive_panel: {
    id: 'atlas_ai_prescriptive_panel',
    title: 'ATLAS.AI Co-Pilot',
    description: 'Prescriptive logistics chat with actionable re-sync triggers.',
    category: 'Logistics',
    size: { w: 4, h: 6 },
    component: 'AtlasAiPrescriptivePanel',
  },
} as const;
