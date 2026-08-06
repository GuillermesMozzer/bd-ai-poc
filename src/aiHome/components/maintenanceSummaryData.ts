export type MaintenanceContextAssetId =
  | 'molding-machine'
  | 'motor-line-3'
  | 'hydraulic-press-4'
  | 'conveyor-belt-c4'
  | 'syringe-assembly-sa-204';

export type MaintenanceSummaryItem = {
  assetId: MaintenanceContextAssetId;
  createdAt: string;
  descriptionPrefix: string;
  descriptionSuffix: string;
  equipmentName: string;
  location: string;
  priority: 'Critical' | 'High' | 'Medium';
  reporter: string;
  requestId: string;
  title: string;
};

export type MaintenanceContextSection = {
  count: number;
  label: string;
};

export type MaintenanceContextKop = {
  accent: string;
  delta: string;
  label: string;
  value: string;
};

export type MaintenanceContextRecord = {
  alertText: string;
  breadcrumb: string[];
  createdAt: string;
  equipmentName: string;
  eventLog: string;
  eventLogCount: number;
  filesCategories?: MaintenanceContextSection[];
  heroImagePath: string;
  insightBody: string;
  insightTitle: string;
  properties?: Array<{label: string; value: string}>;
  location: string;
  requestId: string;
  sections: MaintenanceContextSection[];
  kops: MaintenanceContextKop[];
};

export const maintenanceSummaryItems: MaintenanceSummaryItem[] = [
  {
    assetId: 'molding-machine',
    createdAt: '08:30 AM',
    descriptionPrefix: 'Leak alarm and pressure drift were reported on ',
    descriptionSuffix: ', with visible oil accumulation near the lower seal housing.',
    equipmentName: 'Molding Machine',
    location: 'Z6',
    priority: 'Critical',
    reporter: "Ronie D'elano",
    requestId: 'MR-952532567',
    title: 'Molding Machine Leak',
  },
  {
    assetId: 'motor-line-3',
    createdAt: '08:30 AM',
    descriptionPrefix: 'Recurring seal instability is affecting ',
    descriptionSuffix: ', with vibration spikes during startup and restart.',
    equipmentName: 'Motor Line 3',
    location: 'Z2 â€¢ Line 5',
    priority: 'High',
    reporter: "Ronie D'elano",
    requestId: 'MR-952532567',
    title: 'Motor Line 3 Gasket',
  },
  {
    assetId: 'hydraulic-press-4',
    createdAt: '08:30 AM',
    descriptionPrefix: 'Abnormal wear and flow instability were flagged on ',
    descriptionSuffix: ', and BLU.AI recommends a targeted inspection before the next handoff.',
    equipmentName: 'Hydraulic Press #4',
    location: 'Z6',
    priority: 'Critical',
    reporter: 'BLU.AI',
    requestId: 'MR-952532567',
    title: 'Hydraulic Press #4 Conveyor Belt',
  },
  {
    assetId: 'conveyor-belt-c4',
    createdAt: '08:30 AM',
    descriptionPrefix: 'Tracking deviation was observed on ',
    descriptionSuffix: ', with belt tension drift creating a repeat jam risk on the lane transfer.',
    equipmentName: 'Conveyor Belt C4',
    location: 'Z8',
    priority: 'Medium',
    reporter: 'BLU.AI',
    requestId: 'MR-952532567',
    title: 'Conveyor Belt C4',
  },
];

export const maintenanceContextByAssetId: Record<MaintenanceContextAssetId, MaintenanceContextRecord> = {
  'molding-machine': {
    alertText: 'Recent leak alarms and thermal instability indicate potential seal degradation.',
    breadcrumb: ['CILT Execution', 'Molding Machine'],
    createdAt: 'Opened today at 08:30 AM',
    equipmentName: 'Molding Machine',
    eventLog: 'Oil accumulation and cavity pressure drift suggest incipient seal failure.',
    eventLogCount: 1,
    filesCategories: [
      {label: 'Manuals', count: 16},
      {label: 'Electrical', count: 349},
      {label: 'Structural', count: 103},
      {label: 'Mechanical', count: 184},
      {label: 'Procedures', count: 42},
      {label: 'Quality', count: 67},
      {label: 'Safety', count: 29},
      {label: 'Photos', count: 58},
    ],
    heroImagePath: '/images/shift-logbook-equipment-views/05_isometric_view.png',
    insightBody: 'Repeated leak alarms, pressure drift, and thermal variation suggest an early seal failure pattern. A targeted inspection may prevent unplanned downtime and secondary scrap.',
    insightTitle: 'Preventive Maintenance Recommended',
    location: 'Zone 6',
    properties: [
      {label: 'Tag', value: 'E9867-A'},
      {label: 'Name', value: 'Molding Machine'},
      {label: 'Suction pressure', value: '1.7 bar'},
      {label: 'Discharge pressure', value: '5.3 bar'},
      {label: 'Inlet temperature', value: '122 °F'},
      {label: 'Discharge temperature', value: '342 °F'},
      {label: 'Flow rate', value: '99,852 Nm³/h'},
      {label: 'Liquid content tolerance', value: '33'},
      {label: 'Stand by', value: 'No'},
      {label: 'Material', value: 'Carbon Steel'},
      {label: 'Driver Type', value: 'Electric motor'},
      {label: 'Location', value: 'Train A Area'},
      {label: 'Installation', value: '2018/05/11'},
      {label: 'Spare availability', value: '1 Unit in warehouse'},
      {label: 'Manufacturer', value: 'Engel'},
      {label: 'Model', value: 'Victory 500'},
      {label: 'Serial number', value: 'EN-V500-18422'},
      {label: 'Criticality', value: 'A — Production critical'},
      {label: 'Operating status', value: 'Running with alert'},
      {label: 'Last inspection', value: '2026/06/24'},
    ],
    requestId: 'MR-952532567',
    sections: [
      {label: 'Properties', count: 51},
      {label: '3D View', count: 1},
      {label: 'Work Orders', count: 45},
      {label: 'Timeseries', count: 26},
      {label: 'Files', count: 806},
      {label: 'Notification', count: 6},
    ],
    kops: [
      {label: 'Cycle Time', value: '45.2 s', delta: '-0.5%', accent: '#1D74FF'},
      {label: 'Seal Temperature', value: '82.4 C', delta: '+3.1%', accent: '#FF8A00'},
    ],
  },
  'motor-line-3': {
    alertText: 'Vibration growth and gasket drift indicate mounting wear risk.',
    breadcrumb: ['CILT Execution', 'Motor Line 3'],
    createdAt: 'Opened today at 08:30 AM',
    equipmentName: 'Motor Line 3',
    eventLog: 'Startup vibration and gasket drift suggest misalignment around the drive assembly.',
    eventLogCount: 1,
    filesCategories: [
      {label: 'Manuals', count: 12},
      {label: 'Electrical', count: 211},
      {label: 'Structural', count: 118},
      {label: 'Mechanical', count: 96},
      {label: 'Procedures', count: 31},
      {label: 'Quality', count: 44},
      {label: 'Safety', count: 22},
      {label: 'Photos', count: 37},
    ],
    heroImagePath: '/images/shift-logbook-equipment-views/08_syringe_assembly_closeup.png',
    insightBody: 'The vibration signature and gasket instability point to progressive mounting wear. Inspecting alignment and fastener torque now is likely to reduce restart losses later in the shift.',
    insightTitle: 'Inspection Window Recommended',
    location: 'Zone 2 â€¢ Line 5',
    properties: [
      {label: 'Tag', value: 'ML3-204'},
      {label: 'Name', value: 'Motor Line 3'},
      {label: 'Drive vibration', value: '4.8 mm/s'},
      {label: 'Seal pressure', value: '2.3 bar'},
      {label: 'Bearing temperature', value: '79 °C'},
      {label: 'Location', value: 'Zone 2 • Line 5'},
      {label: 'Motor power', value: '45 kW'},
      {label: 'Rated speed', value: '1,780 rpm'},
      {label: 'Current load', value: '82%'},
      {label: 'Alignment offset', value: '0.18 mm'},
      {label: 'Mounting torque', value: '92 Nm'},
      {label: 'Lubrication type', value: 'EP2 lithium grease'},
      {label: 'Manufacturer', value: 'Siemens'},
      {label: 'Model', value: 'SIMOTICS GP'},
      {label: 'Serial number', value: 'ML3-204-8821'},
      {label: 'Installation', value: '2020/09/18'},
      {label: 'Criticality', value: 'A — Production critical'},
      {label: 'Operating status', value: 'Running with warning'},
      {label: 'Last inspection', value: '2026/06/29'},
      {label: 'Spare availability', value: '1 motor · 4 gasket kits'},
    ],
    requestId: 'MR-952532567',
    sections: [
      {label: 'Properties', count: 47},
      {label: '3D View', count: 1},
      {label: 'Work Orders', count: 29},
      {label: 'Timeseries', count: 19},
      {label: 'Files', count: 522},
      {label: 'Notification', count: 4},
    ],
    kops: [
      {label: 'Startup Vibration', value: '4.8 mm/s', delta: '+11%', accent: '#1D74FF'},
      {label: 'Torque Stability', value: '91.3%', delta: '-2.4%', accent: '#FF8A00'},
    ],
  },
  'syringe-assembly-sa-204': {
    alertText: 'Maintenance risk is elevated after repeated fill-head torque variation and transfer timing drift.',
    breadcrumb: ['Maintenance Technician', 'Line 10', 'Syringe Assembly Machine SA-204'],
    createdAt: 'Opened today at 07:45 AM',
    equipmentName: 'Syringe Assembly Machine SA-204',
    eventLog: 'Fill-head torque variation, intermittent indexing delay, and syringe transfer retries indicate a rising maintenance risk.',
    eventLogCount: 4,
    filesCategories: [
      {label: 'Manuals', count: 18},
      {label: 'Electrical', count: 142},
      {label: 'Structural', count: 64},
      {label: 'Mechanical', count: 127},
      {label: 'Procedures', count: 39},
      {label: 'Quality', count: 51},
      {label: 'Safety', count: 24},
      {label: 'Photos', count: 58},
    ],
    heroImagePath: '/images/shift-logbook-equipment-views/08_syringe_assembly_closeup.png',
    insightBody: 'The SA-204 assembly module is showing the highest maintenance risk in the technician area. Review recent asset history, inspect fill-head alignment, and verify transfer timing before the next production run.',
    insightTitle: 'Asset History Review Recommended',
    location: 'Autoguard Line 10',
    properties: [
      {label: 'Tag', value: 'SA-204'},
      {label: 'Name', value: 'Syringe Assembly Machine SA-204'},
      {label: 'Current risk rank', value: '#1 in technician area'},
      {label: 'Fill-head torque variation', value: '+9% vs baseline'},
      {label: 'Transfer retry rate', value: '3.8%'},
      {label: 'Indexing delay', value: '0.42 s'},
      {label: 'Location', value: 'Autoguard Line 10'},
      {label: 'Criticality', value: 'A - Production critical'},
      {label: 'Operating status', value: 'Running with warning'},
      {label: 'Last inspection', value: '2026/06/30'},
      {label: 'Manufacturer', value: 'BD Autoguard'},
      {label: 'Model', value: 'SA-204 Shielded IV Assembly'},
      {label: 'Serial number', value: 'SA204-L10-7708'},
      {label: 'Spare availability', value: '2 fill-head kits · 4 transfer sensors'},
    ],
    requestId: 'MR-606034603',
    sections: [
      {label: 'Properties', count: 42},
      {label: '3D View', count: 1},
      {label: 'Work Orders', count: 12},
      {label: 'Timeseries', count: 18},
      {label: 'Files', count: 523},
      {label: 'Notification', count: 5},
    ],
    kops: [
      {label: 'Transfer Accuracy', value: '94.1%', delta: '-2.2%', accent: '#1D74FF'},
      {label: 'Fill Torque Stability', value: '91.0%', delta: '-3.4%', accent: '#FF8A00'},
    ],
  },
  'hydraulic-press-4': {
    alertText: 'Recent anomalies and performance drift indicate potential component wear.',
    breadcrumb: ['CILT Execution', 'Hydraulic Press #4'],
    createdAt: 'Opened today at 08:30 AM',
    equipmentName: 'Hydraulic Press #4',
    eventLog: 'Pressure fluctuations and flow anomalies suggest incipient cavitation.',
    eventLogCount: 1,
    filesCategories: [
      {label: 'Manuals', count: 16},
      {label: 'Electrical', count: 349},
      {label: 'Structural', count: 103},
      {label: 'Mechanical', count: 184},
      {label: 'Procedures', count: 42},
      {label: 'Quality', count: 67},
      {label: 'Safety', count: 29},
      {label: 'Photos', count: 58},
    ],
    heroImagePath: '/images/shift-logbook-equipment-views/07_feeder_bowl_closeup.png',
    insightBody: 'Recent anomalies and performance drift suggest increased risk of component wear. A targeted inspection may prevent future downtime and reduce the chance of a larger hydraulic intervention.',
    insightTitle: 'Preventive Maintenance Recommended',
    location: 'Zone 6',
    properties: [
      {label: 'Tag', value: 'HP-04'},
      {label: 'Name', value: 'Hydraulic Press #4'},
      {label: 'System pressure', value: '218 bar'},
      {label: 'Return pressure', value: '4.8 bar'},
      {label: 'Oil temperature', value: '68 °C'},
      {label: 'Hydraulic flow', value: '45.2 l/min'},
      {label: 'Reservoir level', value: '78%'},
      {label: 'Filter differential', value: '1.4 bar'},
      {label: 'Stand by', value: 'No'},
      {label: 'Material', value: 'Carbon Steel'},
      {label: 'Pump type', value: 'Variable displacement axial piston'},
      {label: 'Location', value: 'Zone 6 · Press Bay'},
      {label: 'Installation', value: '2019/03/22'},
      {label: 'Manufacturer', value: 'Bosch Rexroth'},
      {label: 'Model', value: 'HPX-800'},
      {label: 'Serial number', value: 'HP04-190322'},
      {label: 'Press force', value: '800 ton'},
      {label: 'Criticality', value: 'A — Production critical'},
      {label: 'Operating status', value: 'Running with alert'},
      {label: 'Last oil analysis', value: '2026/06/16'},
      {label: 'Spare availability', value: '2 seal kits · 1 pump'},
    ],
    requestId: 'MR-952532567',
    sections: [
      {label: 'Properties', count: 51},
      {label: '3D View', count: 1},
      {label: 'Work Orders', count: 45},
      {label: 'Timeseries', count: 26},
      {label: 'Files', count: 806},
      {label: 'Notification', count: 6},
    ],
    kops: [
      {label: 'Cycle Time', value: '45.2 s', delta: '-0.5%', accent: '#1D74FF'},
      {label: 'Hydraulic Flow', value: '45.2 l/m', delta: '-0.5%', accent: '#FF8A00'},
    ],
  },
  'conveyor-belt-c4': {
    alertText: 'Tracking drift and belt tension instability indicate a growing jam risk.',
    breadcrumb: ['CILT Execution', 'Conveyor Belt C4'],
    createdAt: 'Opened today at 08:30 AM',
    equipmentName: 'Conveyor Belt C4',
    eventLog: 'Tracking deviation and roller drag suggest belt alignment loss at the lane transfer.',
    eventLogCount: 1,
    filesCategories: [
      {label: 'Manuals', count: 10},
      {label: 'Electrical', count: 122},
      {label: 'Structural', count: 74},
      {label: 'Mechanical', count: 88},
      {label: 'Procedures', count: 26},
      {label: 'Quality', count: 39},
      {label: 'Safety', count: 18},
      {label: 'Photos', count: 46},
    ],
    heroImagePath: '/images/shift-logbook-equipment-views/10_conveyor_exit_closeup.png',
    insightBody: 'The lane transfer is showing early belt drift and roller drag. A quick alignment and tension check is recommended before the issue escalates into a stop or transfer jam.',
    insightTitle: 'Targeted Adjustment Recommended',
    location: 'Zone 8',
    properties: [
      {label: 'Tag', value: 'CB-C4'},
      {label: 'Name', value: 'Conveyor Belt C4'},
      {label: 'Tracking drift', value: '2.4 mm'},
      {label: 'Tension variation', value: '+8%'},
      {label: 'Location', value: 'Zone 8'},
      {label: 'Belt width', value: '600 mm'},
      {label: 'Belt length', value: '18.4 m'},
      {label: 'Nominal speed', value: '1.8 m/s'},
      {label: 'Motor power', value: '7.5 kW'},
      {label: 'Drive current', value: '8.4 A'},
      {label: 'Roller temperature', value: '54 °C'},
      {label: 'Transfer accuracy', value: '93.6%'},
      {label: 'Manufacturer', value: 'Dorner'},
      {label: 'Model', value: '3200 Series'},
      {label: 'Serial number', value: 'C4-3200-77419'},
      {label: 'Installation', value: '2021/11/08'},
      {label: 'Material', value: 'Polyurethane · Blue FDA'},
      {label: 'Criticality', value: 'A — Production critical'},
      {label: 'Operating status', value: 'Running with warning'},
      {label: 'Last inspection', value: '2026/06/30'},
      {label: 'Spare availability', value: '2 belts · 6 bearings'},
    ],
    requestId: 'MR-952532567',
    sections: [
      {label: 'Properties', count: 38},
      {label: '3D View', count: 1},
      {label: 'Work Orders', count: 17},
      {label: 'Timeseries', count: 14},
      {label: 'Files', count: 211},
      {label: 'Notification', count: 3},
    ],
    kops: [
      {label: 'Belt Speed', value: '1.8 m/s', delta: '-4.2%', accent: '#1D74FF'},
      {label: 'Transfer Accuracy', value: '93.6%', delta: '-1.8%', accent: '#FF8A00'},
    ],
  },
};

export function isMaintenanceSummaryPrompt(value: string) {
  const normalizedValue = value.trim().toLowerCase();

  return normalizedValue.includes('which assets are critical right now')
    || normalizedValue.includes('what work orders should i follow up before handoff')
    || normalizedValue.includes('top maintenance requests')
    || normalizedValue.includes('maintenance summary');
}



