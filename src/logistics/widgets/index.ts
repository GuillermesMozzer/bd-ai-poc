export { InboundSlaWidget } from './InboundSlaWidget';
export { ActiveLoadsTimelineWidget } from './ActiveLoadsTimelineWidget';
export { SpaceXShippingGatingWidget } from './SpaceXShippingGatingWidget';
export { LineShortageRiskWidget } from './LineShortageRiskWidget';

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
} as const;
