// @ts-nocheck — ported from logistics-mock prototype
/**
 * Unified mock CDF Gold-layer data for Inside Logistics MVP prototypes — v2.
 * Incorporates 2026-07-09 inbound/outbound presentation feedback.
 * Entities aligned with bd-datasource-mapping (ST01–ST108).
 */

export const logisticsData = {
  as_of: '2026-07-09T14:30:00-06:00',
  prototype_version: 'v2',

  users: {
    'USR-qa-insp': 'M. Chen — QA Inspector',
    'USR-qa-super': 'R. Patel — QA Supervisor',
    'USR-sqe': 'C. Alvarez — Supplier Quality Engineer',
    'USR-recv-lead': 'J. Morales — Receiving Lead',
    'USR-wh-tl': 'A. Brooks — Warehouse TL',
    'USR-fg-lead': 'L. Nguyen — FG Team Leader',
    'USR-steril-coord': 'D. Walsh — Sterilization Coordinator',
    'USR-picker-01': 'K. Ortiz — Picker',
    'USR-fg-op': 'S. Kim — FG Operator',
    'USR-cs': 'V. Torres — Customer Service',
  },

  materials: {
    'MAT-RM-88210': { material_id: 'MAT-RM-88210', sku: '88210', description: 'Medical-grade PP resin — natural' },
    'MAT-RM-44102': { material_id: 'MAT-RM-44102', sku: '44102', description: 'Catalyst additive — Class 3' },
    'MAT-FG-12045': { material_id: 'MAT-FG-12045', sku: '12045', description: 'BD Vacutainer SST Tube 13×100' },
    'MAT-FG-12088': { material_id: 'MAT-FG-12088', sku: '12088', description: 'BD Luer-Lok Syringe 10mL' },
  },

  customers: {
    'CUST-4401': { customer_id: 'CUST-4401', name: 'Mayo Clinic Supply Chain' },
    'CUST-5520': { customer_id: 'CUST-5520', name: 'Cardinal Health — West' },
    'CUST-6612': { customer_id: 'CUST-6612', name: 'McKesson Medical' },
    'CUST-DC-PLAY': { customer_id: 'CUST-DC-PLAY', name: 'BD Playas DC (scheduled)' },
  },

  providers: {
    'PROV-STER-01': { provider_id: 'PROV-STER-01', name: 'SteriTech El Paso', portal_url: 'portal.steritech.example' },
    'PROV-STER-02': { provider_id: 'PROV-STER-02', name: 'GammaMed Solutions', portal_url: 'gamma.steril.example' },
    'PROV-STER-03': { provider_id: 'PROV-STER-03', name: 'BD Sandy Intercompany', portal_url: null },
  },

  carriers: {
    'CAR-220': { carrier_id: 'CAR-220', name: 'Southwest Freight' },
    'CAR-305': { carrier_id: 'CAR-305', name: 'El Paso Cartage' },
    'CAR-901': { carrier_id: 'CAR-901', name: 'Maersk Road — Laredo' },
    'CAR-FDX': { carrier_id: 'CAR-FDX', name: 'FedEx Express (air / hazmat)' },
  },

  /** Receiving staging capacity — frees when QA releases (outbound feedback) */
  receiving_capacity: {
    total_pallet_slots: 48,
    occupied_pallets: 39,
    capacity_pct: 81,
    inbound_expected_pallets: 14,
    projected_pct_after_inbound: 110,
    note: 'Small receiving area — release queue frees space for arriving trucks',
  },

  /** WIP snapshot for Control Tower (inbound feedback: track WIP) */
  wip_lanes: [
    { machine_id: 'LINE-03', name: 'Line 3 — Filling', status: 'blocked', job_id: 'JOB-DEMO-001', material: '88210', note: 'Waiting labels' },
    { machine_id: 'LINE-05', name: 'Line 5 — Assembly', status: 'waiting', job_id: 'JOB-100228', material: '44102', note: 'Supermarket short' },
    { machine_id: 'LINE-01', name: 'Line 1 — Molding', status: 'running', job_id: 'JOB-100215', material: '55301', note: 'On track' },
    { machine_id: 'LINE-02', name: 'Line 2 — Assembly', status: 'running', job_id: 'JOB-100218', material: '12045', note: 'Material staged' },
  ],

  journey_heatmap: [
    { step_id: 'receiving', label: 'Receiving', level: 'yellow', aging_hours: 4, sla_status: 'at_risk', open_count: 3 },
    { step_id: 'quality', label: 'Quality', level: 'red', aging_hours: 52, sla_status: 'late', open_count: 8 },
    { step_id: 'rm_warehouse', label: 'RM Warehouse', level: 'green', aging_hours: 2, sla_status: 'on_track', open_count: 1 },
    { step_id: 'production_supply', label: 'Production Supply', level: 'yellow', aging_hours: 6, sla_status: 'at_risk', open_count: 4 },
    { step_id: 'pre_steril', label: 'Pre-Sterilization', level: 'green', aging_hours: 1, sla_status: 'on_track', open_count: 2 },
    { step_id: 'provider', label: 'Provider', level: 'yellow', aging_hours: 36, sla_status: 'at_risk', open_count: 3 },
    { step_id: 'post_steril_qa', label: 'Post-Steril QA', level: 'red', aging_hours: 168, sla_status: 'late', open_count: 5 },
    { step_id: 'fg_warehouse', label: 'FG Warehouse', level: 'green', aging_hours: 3, sla_status: 'on_track', open_count: 2 },
    { step_id: 'shipping', label: 'Shipping', level: 'yellow', aging_hours: 8, sla_status: 'at_risk', open_count: 6 },
  ],

  executive_kpis: {
    inbound_today: 5,
    qa_hold_count: 13,
    sterilization_in_transit: 4,
    shipments_not_ready: 6,
    critical_exceptions: 4,
    quarantine_aging_avg_days: 3.2,
    dock_backlog: 2,
    qa_release_lead_time_hours: 38,
    loads_at_provider: 3,
    receiving_capacity_pct: 81,
    open_backorders: 7,
    pledge_due_today: 2,
  },

  critical_materials: [
    { material_id: 'MAT-RM-44102', sku: '44102', lot: 'LOT-26-0709-B', impact: 'Production Order PO-100234 — line stop risk', owner: 'USR-qa-super', step: 'Quality', aging_hours: 28 },
    { material_id: 'MAT-FG-12045', sku: '12045', lot: 'LOT-26-0701-FG', impact: 'Sales Order SO-8802142 — Mayo Clinic pledge', owner: 'USR-fg-lead', step: 'Shipping', aging_hours: 12 },
    { material_id: 'MAT-FG-12088', sku: '12088', lot: 'LOT-26-0698-FG', impact: 'Sterilization Load SL-2026-0712 — cert pending', owner: 'USR-steril-coord', step: 'Provider', aging_hours: 72 },
  ],

  qa_inspections: [
    {
      qa_inspection_id: 'QA-0709-001', inspection_type: 'incoming_raw', material_id: 'MAT-RM-88210',
      batch_id: 'BAT-2026-0712-A', lot: 'LOT-26-0712-A', pallet_id: 'PLT-88409', pallet_qty: 6,
      qa_status: 'lab_testing', aging_days: 1.2, sla_risk: 'at_risk', sla_tat_days: 2,
      impact: 'Production Order PO-100228', required_action: 'Lab result pending',
      owner_user_id: 'USR-qa-insp', release_blocker: 'test_pending',
      tat_target_min: 2880, tat_actual_min: 3000,
      urgency_requests: [],
      linked_backorders: [],
    },
    {
      qa_inspection_id: 'QA-0709-002', inspection_type: 'incoming_raw', material_id: 'MAT-RM-44102',
      batch_id: 'BAT-2026-0709-B', lot: 'LOT-26-0709-B', pallet_id: 'PLT-88501', pallet_qty: 4,
      qa_status: 'pending_qa_review', aging_days: 1.1, sla_risk: 'at_risk', sla_tat_days: 2,
      impact: 'Production Order PO-100234 — URGENT', required_action: 'QA supervisor decision',
      owner_user_id: 'USR-qa-super', release_blocker: 'discrepancy',
      tat_target_min: 2880, tat_actual_min: 1680,
      urgency_requests: [
        { from: 'USR-wh-tl', at: '2026-07-09T13:10:00-06:00', reason: 'Line 3 stop risk — please prioritize review' },
      ],
      linked_backorders: [],
    },
    {
      qa_inspection_id: 'QA-0708-014', inspection_type: 'post_sterilization', material_id: 'MAT-FG-12045',
      batch_id: 'BAT-2026-0701-FG', lot: 'LOT-26-0701-FG', pallet_id: 'PLT-FG-2201', pallet_qty: 8,
      qa_status: 'lab_testing', aging_days: 7.5, sla_risk: 'late', sla_tat_days: 7,
      impact: 'Sales Order SO-8802142 — pledge + backorder air risk', required_action: 'Microbiology results',
      owner_user_id: 'USR-qa-insp', release_blocker: 'test_pending',
      sterilization_load_id: 'SL-2026-0705',
      tat_target_min: 10080, tat_actual_min: 10800,
      urgency_requests: [
        { from: 'USR-fg-lead', at: '2026-07-09T09:15:00-06:00', reason: 'Pledge must leave today — carrier load report waiting on release (cutoff 09:30)' },
      ],
      linked_backorders: ['BO-0709-01'],
    },
    {
      qa_inspection_id: 'QA-0708-015', inspection_type: 'post_sterilization', material_id: 'MAT-FG-12088',
      batch_id: 'BAT-2026-0698-FG', lot: 'LOT-26-0698-FG', pallet_id: 'PLT-FG-2198', pallet_qty: 5,
      qa_status: 'sampling_collected', aging_days: 5.2, sla_risk: 'on_track', sla_tat_days: 7,
      impact: 'Inventory availability — 3 SOs waiting', required_action: 'Chemistry lab queue',
      owner_user_id: 'USR-qa-insp', release_blocker: 'test_pending',
      sterilization_load_id: 'SL-2026-0701',
      tat_target_min: 10080, tat_actual_min: 7488,
      note: 'Within 7-day expected TAT — not yet “pending late”',
      urgency_requests: [],
      linked_backorders: ['BO-0709-02'],
    },
    {
      qa_inspection_id: 'QA-0709-010', inspection_type: 'incoming_raw', material_id: 'MAT-RM-88210',
      batch_id: 'BAT-2026-0710-C', lot: 'LOT-26-0710-C', pallet_id: 'PLT-88421', pallet_qty: 3,
      qa_status: 'released', aging_days: 0, sla_risk: 'on_track', sla_tat_days: 2,
      impact: 'None — released today · frees 3 staging slots', required_action: 'SAP update complete',
      owner_user_id: 'USR-qa-super', release_blocker: null,
      released_at: '2026-07-09T11:00:00-06:00',
      urgency_requests: [],
      linked_backorders: [],
    },
  ],

  /** SQE queue — quality notifications from incoming (30-day close SLA) */
  quality_notifications: [
    {
      qn_id: 'QN-26-4410', sap_qn: 'QN-10004410', material_id: 'MAT-RM-44102', lot: 'LOT-26-0709-B',
      defect: 'Did not meet incoming specification — dimensional',
      disposition: 'under_review', aging_days: 4, close_sla_days: 30, days_to_close: 26,
      owner_user_id: 'USR-sqe', next_action: 'Supplier review call scheduled',
      options: ['return_to_vendor', 'rework', 'sort', 'scrap'],
    },
    {
      qn_id: 'QN-26-4388', sap_qn: 'QN-10004388', material_id: 'MAT-RM-88210', lot: 'LOT-26-0695-A',
      defect: 'CoA mismatch vs PO',
      disposition: 'return_to_vendor', aging_days: 22, close_sla_days: 30, days_to_close: 8,
      owner_user_id: 'USR-sqe', next_action: 'Arrange RTV pickup with vendor',
      options: ['return_to_vendor'],
    },
  ],

  quarantine_holds: [
    { hold_id: 'QH-001', material_id: 'MAT-RM-44102', lot: 'LOT-26-0709-B', pallet_id: 'PLT-88501', location: 'Hold Cage A', aging_days: 1.1, disposition: 'pending_review', qn_id: 'QN-26-4410' },
    { hold_id: 'QH-002', material_id: 'MAT-FG-12045', lot: 'LOT-26-0701-FG', pallet_id: 'PLT-FG-2201', location: 'Main Warehouse Quarantine', aging_days: 7.5, disposition: 'awaiting_lab' },
  ],

  sterilization_loads: [
    {
      sterilization_load_id: 'SL-2026-0712', provider_id: 'PROV-STER-01', state: 'certificate_pending',
      pallets_count: 12, product_family: 'Vacutainer SST', eta_return: '2026-07-11T08:00:00-06:00',
      sla_risk: 'at_risk', documentation_ok: false, external_sap_shipment_number: 'SAP-STO-449201',
      pallets: ['PLT-FG-2210', 'PLT-FG-2211'], missing_docs: ['Sterilization certificate'],
      qa_aging_days: null, qa_expected_tat_days: 7,
    },
    {
      sterilization_load_id: 'SL-2026-0705', provider_id: 'PROV-STER-02', state: 'pending_qa_release',
      pallets_count: 8, product_family: 'Vacutainer SST', eta_return: null,
      sla_risk: 'late', documentation_ok: true, external_sap_shipment_number: 'SAP-STO-448890',
      pallets: ['PLT-FG-2201'], missing_docs: [],
      arrived_at_bd: '2026-07-07T14:00:00-06:00',
      qa_aging_days: 7.5, qa_expected_tat_days: 7,
      qa_pending_reason: 'Past 7-day expected TAT — flag as late pending',
    },
    {
      sterilization_load_id: 'SL-2026-0714', provider_id: 'PROV-STER-01', state: 'in_transit_to_provider',
      pallets_count: 10, product_family: 'Luer-Lok Syringe', eta_return: '2026-07-15T10:00:00-06:00',
      sla_risk: 'on_track', documentation_ok: true, external_sap_shipment_number: 'SAP-STO-449310',
      pallets: ['PLT-FG-2230'], missing_docs: [],
      departed_at: '2026-07-09T06:00:00-06:00',
      qa_aging_days: null, qa_expected_tat_days: 7,
    },
    {
      sterilization_load_id: 'SL-2026-0701', provider_id: 'PROV-STER-03', state: 'sterilization_in_progress',
      pallets_count: 6, product_family: 'Luer-Lok Syringe', eta_return: '2026-07-12T16:00:00-06:00',
      sla_risk: 'on_track', documentation_ok: true, external_sap_shipment_number: 'SAP-STO-448501',
      pallets: ['PLT-FG-2198'], missing_docs: [],
      qa_aging_days: 5.2, qa_expected_tat_days: 7,
      qa_pending_reason: 'Within 7-day TAT — expected process, not late',
    },
  ],

  /** Shipping daily ops report (manual report replacement) */
  shipping_daily: {
    open_cases_today: 42,
    cases_shipped_today: 18,
    pledge_remaining: 2,
    window_48h_remaining: 5,
    overtime_risk: true,
    saturday_candidate: false,
    eom_volume_flag: true,
    eom_note: 'Customer service OTP push — elevated volume expected last week of month',
  },

  backorders: [
    {
      backorder_id: 'BO-0709-01', sales_order_id: 'SO-8802142', material_id: 'MAT-FG-12045',
      qty_open: 240, reason: 'QA hold post-sterilization', linked_qa: 'QA-0708-014',
      ship_mode_if_released: 'air_fedex_box_label', eom_pressure: true,
      owner_user_id: 'USR-fg-lead',
    },
    {
      backorder_id: 'BO-0709-02', sales_order_id: 'SO-8802190', material_id: 'MAT-FG-12088',
      qty_open: 600, reason: 'Partial ship — inventory short', linked_qa: 'QA-0708-015',
      ship_mode_if_released: 'ground', eom_pressure: true,
      owner_user_id: 'USR-fg-lead',
    },
    {
      backorder_id: 'BO-0709-03', sales_order_id: 'SO-8802201', material_id: 'MAT-FG-12045',
      qty_open: 120, reason: 'Waiting end-of-month quality releases', linked_qa: null,
      ship_mode_if_released: 'air_fedex_box_label', eom_pressure: true,
      owner_user_id: 'USR-cs',
    },
  ],

  outbound_shipments: [
    {
      outbound_shipment_id: 'OB-0709-001', sales_order_id: 'SO-8802142', customer_id: 'CUST-4401',
      readiness_pct: 45, due_date: '2026-07-09T17:00:00-06:00', carrier_id: 'CAR-901',
      owner_user_id: 'USR-fg-lead', blockers: ['picking_complete', 'carrier_booked', 'documents_ready'],
      priority_tier: 'pledge', ship_type: 'international', cases_open: 12, cases_shipped: 0,
      hazmat_required: true, hazmat_docs_ready: false,
      gates: {
        sales_order_selected: true, inventory_available: true, picking_complete: false,
        pallet_config_complete: false, damage_check_complete: false, reboxing_resolved: true,
        documents_ready: false, hazmat_docs_ready: false, carrier_booked: false, dock_ready: false, sap_delivery_ready: false,
      },
      pallets: [{ pallet_id: 'PLT-FG-2201', sku: '12045', batch: 'LOT-26-0701-FG', qty: 480, position: 'A1' }],
      linked_backorder_ids: ['BO-0709-01'],
    },
    {
      outbound_shipment_id: 'OB-0709-002', sales_order_id: 'SO-8802155', customer_id: 'CUST-5520',
      readiness_pct: 92, due_date: '2026-07-09T18:00:00-06:00', carrier_id: 'CAR-305',
      owner_user_id: 'USR-fg-lead', blockers: ['sap_delivery_ready'],
      priority_tier: 'pledge', ship_type: 'domestic', cases_open: 8, cases_shipped: 0,
      hazmat_required: false, hazmat_docs_ready: true,
      gates: {
        sales_order_selected: true, inventory_available: true, picking_complete: true,
        pallet_config_complete: true, damage_check_complete: true, reboxing_resolved: true,
        documents_ready: true, hazmat_docs_ready: true, carrier_booked: true, dock_ready: true, sap_delivery_ready: false,
      },
      pallets: [
        { pallet_id: 'PLT-FG-2240', sku: '12088', batch: 'LOT-26-0705-FG', qty: 600, position: 'B1' },
        { pallet_id: 'PLT-FG-2241', sku: '12088', batch: 'LOT-26-0705-FG', qty: 600, position: 'B2' },
      ],
      carrier_pickup_window: '2026-07-09T16:00:00-06:00',
      linked_backorder_ids: [],
    },
    {
      outbound_shipment_id: 'OB-0709-003', sales_order_id: 'SO-8802160', customer_id: 'CUST-6612',
      readiness_pct: 28, due_date: '2026-07-11T12:00:00-06:00', carrier_id: null,
      owner_user_id: 'USR-fg-lead', blockers: ['inventory_available', 'reboxing_resolved', 'carrier_booked'],
      priority_tier: 'window_48h', ship_type: 'domestic', cases_open: 15, cases_shipped: 0,
      hazmat_required: false, hazmat_docs_ready: true,
      gates: {
        sales_order_selected: true, inventory_available: false, picking_complete: false,
        pallet_config_complete: false, damage_check_complete: false, reboxing_resolved: false,
        documents_ready: false, hazmat_docs_ready: true, carrier_booked: false, dock_ready: false, sap_delivery_ready: false,
      },
      reboxing_case_id: 'RBX-0709-001',
      linked_backorder_ids: [],
    },
    {
      outbound_shipment_id: 'OB-0709-004', sales_order_id: 'SO-8802171', customer_id: 'CUST-4401',
      readiness_pct: 100, due_date: '2026-07-09T15:00:00-06:00', carrier_id: 'CAR-220',
      owner_user_id: 'USR-fg-op', blockers: [],
      priority_tier: 'window_48h', ship_type: 'domestic', cases_open: 0, cases_shipped: 6,
      hazmat_required: false, hazmat_docs_ready: true,
      gates: {
        sales_order_selected: true, inventory_available: true, picking_complete: true,
        pallet_config_complete: true, damage_check_complete: true, reboxing_resolved: true,
        documents_ready: true, hazmat_docs_ready: true, carrier_booked: true, dock_ready: true, sap_delivery_ready: true,
      },
      sap_delivery_id: '80045221', sap_pgi_doc: 'PGI-0709-004',
      linked_backorder_ids: [],
    },
    {
      outbound_shipment_id: 'OB-0709-005', sales_order_id: 'SO-8802188', customer_id: 'CUST-DC-PLAY',
      readiness_pct: 70, due_date: '2026-07-12T17:00:00-06:00', carrier_id: 'CAR-305',
      owner_user_id: 'USR-fg-lead', blockers: ['picking_complete'],
      priority_tier: 'standard', ship_type: 'domestic', cases_open: 20, cases_shipped: 0,
      hazmat_required: false, hazmat_docs_ready: true,
      gates: {
        sales_order_selected: true, inventory_available: true, picking_complete: false,
        pallet_config_complete: true, damage_check_complete: true, reboxing_resolved: true,
        documents_ready: true, hazmat_docs_ready: true, carrier_booked: true, dock_ready: false, sap_delivery_ready: false,
      },
      note: 'Scheduled DC lane — controlled cadence',
      linked_backorder_ids: [],
    },
    {
      outbound_shipment_id: 'OB-0709-006', sales_order_id: 'SO-8802199', customer_id: 'CUST-5520',
      readiness_pct: 55, due_date: '2026-07-10T14:00:00-06:00', carrier_id: 'CAR-FDX',
      owner_user_id: 'USR-fg-lead', blockers: ['inventory_available', 'documents_ready'],
      priority_tier: 'backorder', ship_type: 'international', cases_open: 4, cases_shipped: 0,
      hazmat_required: true, hazmat_docs_ready: false,
      gates: {
        sales_order_selected: true, inventory_available: false, picking_complete: false,
        pallet_config_complete: false, damage_check_complete: false, reboxing_resolved: true,
        documents_ready: false, hazmat_docs_ready: false, carrier_booked: true, dock_ready: false, sap_delivery_ready: false,
      },
      note: 'EOM backorder clear — air + box-by-box label when QA releases',
      linked_backorder_ids: ['BO-0709-02', 'BO-0709-03'],
    },
  ],

  guided_tasks: [
    {
      task_id: 'TO-0709-101', task_type: 'putaway', area: 'RM', priority: 'high',
      source: 'Dock STG-01', destination: 'RM-A-12-03', item_sku: '88210', lot: 'LOT-26-0710-C',
      qty: 1200, uom: 'KG', required_scans: ['pallet', 'location'], deadline: '2026-07-09T15:00:00-06:00',
      status: 'in_progress', assigned_operator_id: 'USR-picker-01', transfer_order_id: 'WM-TO-44901',
      badge_id: 'BDG-10442', device: 'forklift_tablet',
    },
    {
      task_id: 'TO-0709-102', task_type: 'rm_picking', area: 'RM', priority: 'critical',
      source: 'RM-B-08-01', destination: 'Line 3 — Kitting', item_sku: '44102', lot: 'LOT-26-0708-A',
      qty: 200, uom: 'L', required_scans: ['pallet', 'location', 'destination'], deadline: '2026-07-09T14:45:00-06:00',
      status: 'not_started', assigned_operator_id: 'USR-picker-01', production_order_id: 'PO-100234',
      picking_order_id: 'PICK-0709-044', badge_id: 'BDG-10442', device: 'rf_scanner',
    },
    {
      task_id: 'TO-0709-103', task_type: 'kitting', area: 'RM', priority: 'normal',
      source: 'Kitting Area K-02', destination: 'Line 5 staging', item_sku: 'KIT-5501', lot: '—',
      qty: 1, uom: 'KIT', required_scans: ['component_scan', 'qty_confirm'], deadline: '2026-07-09T16:30:00-06:00',
      status: 'blocked', assigned_operator_id: 'USR-picker-01', blocker: 'blocked_by_quality',
      kitting_order_id: 'KIT-0709-012', badge_id: 'BDG-10442', device: 'rf_scanner',
    },
    {
      task_id: 'TO-0709-104', task_type: 'replenishment', area: 'RM', priority: 'high',
      source: 'RM-A-04-02', destination: 'Supermarket 415', item_sku: '55301', lot: 'LOT-26-0708-C',
      qty: 400, uom: 'M', required_scans: ['pallet', 'location', 'destination'], deadline: '2026-07-09T15:30:00-06:00',
      status: 'not_started', assigned_operator_id: null, replenishment_task_id: 'REPL-0709-008',
      badge_id: null, device: 'forklift_tablet',
    },
    {
      task_id: 'TO-0709-201', task_type: 'fg_picking', area: 'FG', priority: 'critical',
      source: 'FG-BIN-12-A', destination: 'Shipping Stage S-02', item_sku: '12088', lot: 'LOT-26-0705-FG',
      qty: 1200, uom: 'EA', required_scans: ['pallet', 'location', 'staging'], deadline: '2026-07-09T16:00:00-06:00',
      status: 'in_progress', assigned_operator_id: 'USR-fg-op', outbound_shipment_id: 'OB-0709-002',
      badge_id: 'BDG-20811', device: 'rf_scanner',
    },
    {
      task_id: 'TO-0709-202', task_type: 'fg_staging', area: 'FG', priority: 'high',
      source: 'Shipping Stage S-02', destination: 'Outbound Dock D-04', item_sku: '12088', lot: 'LOT-26-0705-FG',
      qty: 1200, uom: 'EA', required_scans: ['pallet', 'dock', 'container'], deadline: '2026-07-09T17:00:00-06:00',
      status: 'not_started', assigned_operator_id: 'USR-fg-op', outbound_shipment_id: 'OB-0709-002',
      badge_id: 'BDG-20811', device: 'forklift_tablet',
    },
    {
      task_id: 'TO-0709-203', task_type: 'receiving_validation', area: 'RM', priority: 'normal',
      source: 'RM Dock B', destination: 'Staging STG-04', item_sku: '88210', lot: 'TBD',
      qty: 900, uom: 'KG', required_scans: ['pallet', 'po_confirm'], deadline: '2026-07-09T16:00:00-06:00',
      status: 'not_started', assigned_operator_id: 'USR-picker-01', truck_schedule_id: 'TS-2026-0709-005',
      badge_id: 'BDG-10442', device: 'rf_scanner',
    },
  ],

  exceptions: [
    {
      exception_id: 'EXC-0709-001', process_area: 'Receiving', exception_type: 'truck_delay',
      linked_entity_type: 'TruckSchedule', linked_entity_id: 'TS-2026-0709-002',
      severity: 'high', owner_user_id: 'USR-recv-lead', next_action: 'Assign dock when arrived',
      impact: 'Production stoppage risk — RM-44102', age_hours: 4, state: 'in_progress',
      description: 'Import truck delayed 35 min at border',
    },
    {
      exception_id: 'EXC-0709-002', process_area: 'Quality', exception_type: 'qa_delay',
      linked_entity_type: 'QAInspection', linked_entity_id: 'QA-0708-014',
      severity: 'high', owner_user_id: 'USR-qa-super', next_action: 'Escalate lab TAT',
      impact: 'SO-8802142 pledge + backorder blocked', age_hours: 52, state: 'escalated',
      description: 'Post-sterilization QA exceeded 7-day TAT target',
    },
    {
      exception_id: 'EXC-0709-003', process_area: 'Sterilization', exception_type: 'missing_certificate',
      linked_entity_type: 'SterilizationLoad', linked_entity_id: 'SL-2026-0712',
      severity: 'medium', owner_user_id: 'USR-steril-coord', next_action: 'Request cert from SteriTech',
      impact: 'Load cannot schedule return pickup', age_hours: 18, state: 'open',
      description: 'Sterilization certificate not received from provider',
    },
    {
      exception_id: 'EXC-0709-004', process_area: 'Shipping', exception_type: 'reboxing_delay',
      linked_entity_type: 'OutboundShipment', linked_entity_id: 'OB-0709-003',
      severity: 'medium', owner_user_id: 'USR-fg-lead', next_action: 'Complete reboxing RBX-0709-001',
      impact: 'McKesson SO-8802160 at risk (48h window)', age_hours: 6, state: 'in_progress',
      description: 'Damaged box on pallet — reboxing in progress',
    },
    {
      exception_id: 'EXC-0709-005', process_area: 'Production Supply', exception_type: 'material_not_found',
      linked_entity_type: 'PickingOrder', linked_entity_id: 'PICK-0709-044',
      severity: 'critical', owner_user_id: 'USR-wh-tl', next_action: 'Verify bin RM-B-08-01',
      impact: 'PO-100234 line stop imminent', age_hours: 1, state: 'open',
      description: 'Picker reported material not found at expected location',
    },
    {
      exception_id: 'EXC-0709-006', process_area: 'Shipping', exception_type: 'carrier_delay',
      linked_entity_type: 'CarrierBooking', linked_entity_id: 'BK-0709-002',
      severity: 'medium', owner_user_id: 'USR-fg-lead', next_action: 'Confirm pickup window with carrier',
      impact: 'SO-8802155 may miss customer window', age_hours: 2, state: 'open',
      description: 'Carrier has not confirmed pickup for 16:00 window',
    },
    {
      exception_id: 'EXC-0709-007', process_area: 'Shipping', exception_type: 'hazmat_doc_gap',
      linked_entity_type: 'OutboundShipment', linked_entity_id: 'OB-0709-001',
      severity: 'high', owner_user_id: 'USR-fg-lead', next_action: 'Complete hazmat documentation before carrier pickup',
      impact: 'International pledge — risk of carrier / port rejection', age_hours: 3, state: 'open',
      description: 'Hazmat docs incomplete — previously manual form errors caused returns',
    },
  ],

  genealogy_sample: {
    root_id: 'LOT-26-0701-FG',
    nodes: [
      { type: 'supplier', label: 'BD Sandy Intercompany', at: '2026-06-20' },
      { type: 'po', label: 'PO-4500123400', at: '2026-06-21' },
      { type: 'pallet', label: 'PLT-FG-2201', at: '2026-07-01' },
      { type: 'qa', label: 'Pre-steril gate — Approved', at: '2026-07-02' },
      { type: 'sterilization', label: 'SL-2026-0705 → GammaMed', at: '2026-07-03' },
      { type: 'qa', label: 'Post-steril QA — Lab testing (day 7.5 / 7)', at: '2026-07-07' },
      { type: 'shipment', label: 'SO-8802142 — Pledge pending', at: '—' },
    ],
  },
};
