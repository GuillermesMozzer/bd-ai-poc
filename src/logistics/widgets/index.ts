export { InboundSlaWidget } from './InboundSlaWidget';
export { ActiveLoadsTimelineWidget } from './ActiveLoadsTimelineWidget';
export { SpaceXShippingGatingWidget } from './SpaceXShippingGatingWidget';
export { LineShortageRiskWidget } from './LineShortageRiskWidget';

export const LOGISTICS_WIDGETS = {
  inbound_sla_chart: {
    id: 'inbound_sla_chart',
    title: 'KPI: Inbound Dock-to-Stock SLA',
    description: 'Monitoramento em tempo real do tempo de ciclo de recebimento e liberação.',
    category: 'Logistics',
    size: { w: 6, h: 4 },
    component: 'InboundSlaWidget',
  },
  active_loads_timeline: {
    id: 'active_loads_timeline',
    title: 'Rastreamento de Cargas de Esterilização',
    description: 'Custódia física de caminhões em trânsito com provedor externo (Sterigenics).',
    category: 'Logistics',
    size: { w: 4, h: 4 },
    component: 'ActiveLoadsTimelineWidget',
  },
  line_shortage_risk: {
    id: 'line_shortage_risk',
    title: 'Risco de Abastecimento (Shortage)',
    description: 'Filas de picking priorizadas por risco iminente de parada de linha.',
    category: 'Logistics',
    size: { w: 6, h: 4 },
    component: 'LineShortageRiskWidget',
  },
  spacex_shipping_gating: {
    id: 'spacex_shipping_gating',
    title: 'Console de Embarque SpaceX Gating',
    description: 'Status de conformidade das 4 travas de liberação antes de carregar o caminhão.',
    category: 'Logistics',
    size: { w: 4, h: 4 },
    component: 'SpaceXShippingGatingWidget',
  },
} as const;
