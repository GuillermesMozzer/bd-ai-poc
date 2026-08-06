export const workstationDefaultWorkstreamApps = [
  'CIL CenterLine',
  'Equipment Setup Changeover',
  'Manage Task and Instructions'
];

export const workstationPredefinedApps: Record<string, string[]> = {
  'Leader View': ['Shift Handover', 'Doc Manager', 'Action Tracker', 'Tier Meeting'],
  'Operator View': ['Shift Handover', 'CIL CenterLine', 'ESO'],
  'Tier 1': ['Tier Meeting', 'Action Tracker', 'Shift Handover'],
  'Tier 2': ['Tier Meeting', 'Action Tracker', 'Control Tower'],
  'Tier 3': ['Tier Meeting', 'Control Tower', 'Global View'],
  'Maintenance Leader': ['Maintenance Hub', 'Maintenance Backlog', 'Maintenance Calendar', 'Maintenance Analytics'],
  'Maintenance Planner': ['Maintenance Planner', 'Maintenance Calendar', 'Maintenance Analytics', 'Spare Parts Monitor', 'Maintenance Backlog'],
  'Spare Parts': ['Spare Parts Management', 'Equipment Ledger'],
  'Maintenance Technician': ['Maintenance', 'Maintenance Calendar', 'Maintenance Follow Up Board', 'Spare Parts Management', 'Equipment Ledger', 'CBM & PdM'],
};
