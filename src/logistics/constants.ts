export const JOURNEY_STEPS = [
  { id: 'receiving', label: 'Receiving', steps: 'ST01–ST11' },
  { id: 'quality', label: 'Quality', steps: 'ST12–ST22' },
  { id: 'rm_warehouse', label: 'RM Warehouse', steps: 'ST24–ST25' },
  { id: 'production_supply', label: 'Production Supply', steps: 'ST26–ST43' },
  { id: 'pre_steril', label: 'Pre-Sterilization', steps: 'ST44–ST61' },
  { id: 'provider', label: 'Provider', steps: 'ST62–ST64' },
  { id: 'post_steril_qa', label: 'Post-Steril QA', steps: 'ST69–ST83' },
  { id: 'fg_warehouse', label: 'FG Warehouse', steps: 'ST84–ST93' },
  { id: 'shipping', label: 'Shipping', steps: 'ST94–ST108' },
] as const;

export const READINESS_GATES = [
  { key: 'sales_order_selected', label: 'Sales order selected' },
  { key: 'inventory_available', label: 'Inventory available' },
  { key: 'picking_complete', label: 'Picking complete' },
  { key: 'pallet_config_complete', label: 'Pallet configuration complete' },
  { key: 'damage_check_complete', label: 'Damage check complete' },
  { key: 'reboxing_resolved', label: 'Reboxing resolved' },
  { key: 'documents_ready', label: 'Documents ready' },
  { key: 'hazmat_docs_ready', label: 'Hazmat docs ready (intl)' },
  { key: 'carrier_booked', label: 'Carrier booked' },
  { key: 'dock_ready', label: 'Dock / container ready' },
  { key: 'sap_delivery_ready', label: 'SAP delivery / shipment ready' },
] as const;

export const STERILIZATION_STATES = [
  'load_created',
  'ready_for_pickup',
  'picked_up',
  'in_transit_to_provider',
  'received_by_provider',
  'sterilization_in_progress',
  'sterilization_completed',
  'certificate_pending',
  'ready_for_return',
  'pickup_scheduled',
  'in_transit_to_bd',
  'arrived_at_bd',
  'receiving_validation',
  'pending_qa_release',
  'released',
] as const;

export const JOB_READINESS_STAGES = [
  { id: 'job_created', label: 'Job Created' },
  { id: 'batch_record_available', label: 'Batch Record / Order Available' },
  { id: 'labels_requested', label: 'Labels Requested' },
  { id: 'label_cage_prep', label: 'Label Cage / Label Prep' },
  { id: 'warehouse_preparation', label: 'Warehouse Preparation' },
  { id: 'kitting_staging', label: 'Supermarket' },
  { id: 'material_handler_assigned', label: 'Material Handler Assigned' },
  { id: 'in_transit_to_machine', label: 'In Transit to Machine' },
  { id: 'arrived_at_machine', label: 'Arrived at Machine' },
  { id: 'ready_to_run', label: 'Ready to Run' },
] as const;

export const LOGISTICS_ACCENT = 'var(--token-brand-main)';
export const LOGISTICS_ACCENT_SOFT = 'var(--token-brand-soft-bg)';
