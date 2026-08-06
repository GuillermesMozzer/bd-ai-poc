export type WipSite = 'El Paso' | 'Sandy' | 'Curitiba';

export type WipLevel = 'Level 1' | 'Level 2' | 'Level 3';

export type WipStatus =
  | 'Created'
  | 'Available'
  | 'In Transit'
  | 'Staged'
  | 'Consumed'
  | 'Blocked'
  | 'Quarantined'
  | 'Under Quality Review'
  | 'Shipped'
  | 'Received'
  | 'Closed';

export type WipLocationType =
  | 'plant'
  | 'warehouse'
  | 'area'
  | 'line'
  | 'staging'
  | 'rack'
  | 'bin'
  | 'temporary'
  | 'in_transit';

export type WipHistoryAction =
  | 'created'
  | 'scanned'
  | 'moved'
  | 'staged'
  | 'consumed'
  | 'split'
  | 'combined'
  | 'status_change'
  | 'quantity_adjust'
  | 'quality_block'
  | 'quality_release'
  | 'shipped'
  | 'received'
  | 'exception'
  | 'label_printed'
  | 'comment';

export type WipExceptionType =
  | 'blocked'
  | 'no_destination'
  | 'exceeded_dwell'
  | 'stagnant'
  | 'quantity_divergence'
  | 'wrong_location'
  | 'quality_hold';

export type WipExceptionState = 'open' | 'assigned' | 'resolved';

export type WipRole =
  | 'Warehouse Operator'
  | 'Production Operator'
  | 'Team Lead'
  | 'Quality'
  | 'Planner'
  | 'Supervisor';

export type WipLocation = {
  plant: WipSite;
  warehouse?: string;
  area: string;
  line?: string;
  staging_zone?: string;
  rack?: string;
  bin?: string;
  temporary?: string;
  display: string;
  location_type: WipLocationType;
  expected?: boolean;
};

export type WipOrigin = {
  production_area: string;
  machine_id?: string;
  production_order?: string;
  batch?: string;
  lot: string;
  source_material?: string;
  source_system: 'SAP' | 'Datalan' | 'Manual' | 'Logistics';
  receiving_activity?: string;
};

export type WipGenealogyNode = {
  wip_id: string;
  relationship: 'upstream' | 'downstream' | 'self';
  label: string;
  lot?: string;
  qty?: number;
};

export type WipHistoryEntry = {
  at: string;
  user: string;
  role: WipRole;
  action: WipHistoryAction;
  detail: string;
  from_location?: string;
  to_location?: string;
  status_from?: WipStatus;
  status_to?: WipStatus;
};

export type WipSapLinks = {
  production_order?: string;
  material_number?: string;
  batch?: string;
  warehouse_location?: string;
  shipment_number?: string;
  sales_order?: string;
};

export type WipObject = {
  wip_id: string;
  barcode: string;
  qr_code: string;
  wip_type: string;
  level: WipLevel;
  site: WipSite;
  lot: string;
  batch?: string;
  quantity: number;
  uom: string;
  recorded_quantity: number;
  scanned_quantity?: number;
  location: WipLocation;
  expected_location: WipLocation;
  status: WipStatus;
  next_step: string;
  next_location: string;
  available_for_next: boolean;
  origin: WipOrigin;
  aging_created_hours: number;
  aging_location_hours: number;
  aging_status_hours: number;
  expected_dwell_hours: number;
  owner: string;
  sap?: WipSapLinks;
  datalan_ref?: string;
  genealogy: WipGenealogyNode[];
  history: WipHistoryEntry[];
  parent_wip_id?: string;
  child_wip_ids?: string[];
  transfer_id?: string;
  quality_hold_reason?: string;
  created_at: string;
  updated_at: string;
};

export type WipException = {
  exception_id: string;
  wip_id: string;
  type: WipExceptionType;
  reason: string;
  age_hours: number;
  owner: string;
  recommended_next_step: string;
  state: WipExceptionState;
  comments: { at: string; user: string; text: string }[];
  created_at: string;
  resolved_at?: string;
};

export type WipActionItem = {
  action_id: string;
  wip_id: string;
  action_type: 'move' | 'release' | 'investigate_discrepancy' | 'assign_destination' | 'escalate' | 'receive' | 'print_label';
  priority: 'critical' | 'high' | 'normal';
  title: string;
  due_hint: string;
};

export type WipTransfer = {
  transfer_id: string;
  from_site: WipSite;
  to_site: WipSite;
  wip_ids: string[];
  status: 'Created' | 'In Transit' | 'Received' | 'Closed';
  sap_shipment?: string;
  created_at: string;
  eta?: string;
};

export type WipMapZone = {
  zone_id: string;
  label: string;
  area: string;
  plant: WipSite;
  wip_count: number;
  blocked_count: number;
  aging_max_hours: number;
};
