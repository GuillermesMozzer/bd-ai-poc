import type {ActionTrackerSource, ActionTrackerStatus} from './types';

export type ActionTrackerTableColumnId =
  | 'id'
  | 'creationDate'
  | 'source'
  | 'title'
  | 'type'
  | 'category'
  | 'plant'
  | 'area'
  | 'unit'
  | 'line'
  | 'zone'
  | 'machine'
  | 'createdBy'
  | 'assignedTo'
  | 'dueDate'
  | 'priority'
  | 'status';

export type ActionTrackerKanbanColumnId = ActionTrackerStatus;

export const actionTrackerTableColumns: Array<{id: ActionTrackerTableColumnId; label: string; width: string}> = [
  {id: 'id', label: '#', width: '0.8fr'},
  {id: 'creationDate', label: 'Creation Date', width: '1.1fr'},
  {id: 'source', label: 'Source', width: '1fr'},
  {id: 'title', label: 'Title', width: '2.2fr'},
  {id: 'type', label: 'Type', width: '1fr'},
  {id: 'category', label: 'Category', width: '1.1fr'},
  {id: 'plant', label: 'Plant', width: '0.95fr'},
  {id: 'area', label: 'Area', width: '1fr'},
  {id: 'unit', label: 'Unit', width: '1.1fr'},
  {id: 'line', label: 'Line', width: '0.95fr'},
  {id: 'zone', label: 'Zone', width: '0.95fr'},
  {id: 'machine', label: 'Machine', width: '1.1fr'},
  {id: 'createdBy', label: 'Created By', width: '1.3fr'},
  {id: 'assignedTo', label: 'Owner', width: '1.3fr'},
  {id: 'dueDate', label: 'Due Date', width: '1.1fr'},
  {id: 'priority', label: 'Priority', width: '0.9fr'},
  {id: 'status', label: 'Status', width: '1fr'},
];

export const actionTrackerKanbanColumns: Array<{id: ActionTrackerKanbanColumnId; color: string; label: string}> = [
  {id: 'Open', label: 'Open', color: '#2563eb'},
  {id: 'In Progress', label: 'In Progress', color: '#0f766e'},
  {id: 'Reopened', label: 'Reopened', color: '#f59e0b'},
  {id: 'Under Approval', label: 'Under Approval', color: '#0f172a'},
  {id: 'Completed', label: 'Completed', color: '#4caf50'},
  {id: 'Overdue', label: 'Overdue', color: '#ef4444'},
  {id: 'Canceled', label: 'Canceled', color: '#9ca3af'},
];

export const actionTrackerSourceOptions: ActionTrackerSource[] = [
  'ESO',
  'Maintenance',
  'Shift Logbook',
  'Tier',
  'TMS 1',
  'TMS 2',
  'TMS 3',
  'Action Tracker',
];

export const actionTrackerContextHierarchy = [
  {
    plant: 'TJ1',
    showZone: true,
    areas: [
      {
        name: 'Facilities',
        units: [
          {
            name: 'Infrastructure',
            lines: [
              {
                name: 'Line Support',
                zones: [],
                machines: ['Air Handler AH-03'],
              },
            ],
          },
        ],
      },
      {
        name: 'Assembly',
        units: [
          {
            name: 'Assembly Unit 1',
            lines: [
              {
                name: 'Line 1',
                zones: ['Zone 2'],
                machines: ['Assembly 1', 'Extruder A-01'],
              },
              {
                name: 'Line 2',
                zones: ['Zone 2'],
                machines: ['Molding 4', 'Extrusion 2', 'Cartoner BX-14'],
              },
              {
                name: 'Line 4',
                zones: ['Zone 1'],
                machines: ['Welding 3'],
              },
            ],
          },
        ],
      },
      {
        name: 'Packaging',
        units: [
          {
            name: 'Packaging Unit 1',
            lines: [
              {
                name: 'Line 3',
                zones: ['Zone 1'],
                machines: ['Packaging 2', 'Case Packer CP-07', 'Palletizer PL-22', 'Wrapper PK-03'],
              },
              {
                name: 'Line 5',
                zones: ['Zone 3'],
                machines: [],
              },
              {
                name: 'Line 6',
                zones: ['Zone 3'],
                machines: [],
              },
            ],
          },
        ],
      },
    ],
  },
] as const;

export const actionTrackerPlantOptions = actionTrackerContextHierarchy.map((item) => item.plant);
export const actionTrackerAreaOptions = Array.from(new Set(actionTrackerContextHierarchy.flatMap((item) => item.areas.map((area) => area.name))));
export const actionTrackerUnitOptions = Array.from(new Set(actionTrackerContextHierarchy.flatMap((item) => item.areas.flatMap((area) => area.units.map((unit) => unit.name)))));
export const actionTrackerLineOptions = Array.from(new Set(actionTrackerContextHierarchy.flatMap((item) => item.areas.flatMap((area) => area.units.flatMap((unit) => unit.lines.map((line) => line.name))))));
export const actionTrackerZoneOptions = Array.from(new Set(actionTrackerContextHierarchy.flatMap((item) => item.areas.flatMap((area) => area.units.flatMap((unit) => unit.lines.flatMap((line) => line.zones))))));
export const actionTrackerMachineOptions = Array.from(new Set(actionTrackerContextHierarchy.flatMap((item) => item.areas.flatMap((area) => area.units.flatMap((unit) => unit.lines.flatMap((line) => line.machines))))));

export const actionTrackerMachineLocationMap = Object.fromEntries(
  actionTrackerContextHierarchy.flatMap((plant) => (
    plant.areas.flatMap((area) => (
      area.units.flatMap((unit) => (
        unit.lines.flatMap((line) => line.machines.map((machine) => [machine, line.name]))
      ))
    ))
  )),
) as Record<string, string>;

export const actionTrackerLocationOptions = Array.from(new Set([
  ...actionTrackerLineOptions,
  'Building A, 2nd Floor',
  'Packaging Area',
]));
