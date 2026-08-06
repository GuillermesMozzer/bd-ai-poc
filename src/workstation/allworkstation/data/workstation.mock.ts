import { tokenBrand, tokenError, tokenWarning, tokenSuccess, tokenInfo, tokenNeutral, tokenText, tokenCommon, workstationVisuals, workstationChartSemantic, workstationPriorityTone, workstationSqdcpTone } from '../../theme';
import {
  AccessNode,
  AdminWorkstationRow,
  UserDirectoryRow,
  WorkstationAssignmentDraft,
} from './workstation.types';
import {inferWorkstationType} from '../../workstationTypes';

function createLine(id: string, label: string, zone1Id: string, zone2Id: string): AccessNode {
  return {
    id,
    label,
    children: [
      {id: zone1Id, label: 'Zone 1'},
      {id: zone2Id, label: 'Zone 2'},
    ],
  };
}

function createUnit(id: string, label: string, lines: AccessNode[]): AccessNode {
  return {id, label, children: lines};
}

function createArea(id: string, label: string, units: AccessNode[]): AccessNode {
  return {id, label, children: units};
}

function createPlant(id: string, label: string, areas: AccessNode[]): AccessNode {
  return {id, label, children: areas};
}

export const defaultAccessSelectionPath = {
  plantId: 'plant-columbus-west',
  areaId: 'plant-columbus-west-area-assembly',
  unitId: 'plant-columbus-west-area-assembly-unit-a',
  lineId: 'plant-columbus-west-area-assembly-unit-a-line-10',
  zoneId: 'zone-cw-assembly-a-10-final',
} as const;

export const accessSelectionTree: AccessNode[] = [
  createPlant('plant-columbus-west', 'Columbus West', [
    createArea('plant-columbus-west-area-assembly', 'Area A', [
      createUnit('plant-columbus-west-area-assembly-unit-a', 'Unit A', [
        createLine('plant-columbus-west-area-assembly-unit-a-line-10', 'Line 10', 'zone-cw-assembly-a-10-final', 'zone-cw-assembly-a-10-torque'),
        createLine('plant-columbus-west-area-assembly-unit-a-line-nexiva', 'Nexiva', 'zone-cw-assembly-a-nexiva-1', 'zone-cw-assembly-a-nexiva-2'),
      ]),
      createUnit('plant-columbus-west-area-assembly-unit-b', 'Unit B', [
        createLine('plant-columbus-west-area-assembly-unit-b-line-30', 'Autoguard', 'zone-cw-assembly-b-30-chassis-1', 'zone-cw-assembly-b-30-chassis-2'),
      ]),
      createUnit('plant-columbus-west-area-assembly-unit-c', 'Unit C', [
        createLine('plant-columbus-west-area-assembly-unit-c-line-40', 'Line 40', 'zone-cw-assembly-c-40-trim-1', 'zone-cw-assembly-c-40-trim-2'),
      ]),
    ]),
    createArea('plant-columbus-west-area-molding', 'Area B', [
      createUnit('plant-columbus-west-area-molding-unit-a', 'Unit A', [
        createLine('plant-columbus-west-area-molding-unit-a-line-50', 'Line 50', 'zone-cw-molding-a-50-injection-1', 'zone-cw-molding-a-50-injection-2'),
      ]),
    ]),
    createArea('plant-columbus-west-area-packing', 'Area C', [
      createUnit('plant-columbus-west-area-packing-unit-a', 'Unit A', [
        createLine('plant-columbus-west-area-packing-unit-a-line-70', 'Line 70', 'zone-cw-packing-a-70-wrap', 'zone-cw-packing-a-70-label'),
      ]),
    ]),
  ]),
  createPlant('plant-sandy', 'Sandy', [
    createArea('plant-sandy-area-assembly', 'Area A', [
      createUnit('plant-sandy-area-assembly-unit-b', 'Unit B', [
        createLine('plant-sandy-area-assembly-unit-b-line-autoguard', 'Autoguard', 'zone-sandy-assembly-b-autoguard-1', 'zone-sandy-assembly-b-autoguard-2'),
        createLine('plant-sandy-area-assembly-unit-b-line-nexiva', 'Nexiva', 'zone-sandy-assembly-b-nexiva-1', 'zone-sandy-assembly-b-nexiva-2'),
      ]),
    ]),
    createArea('plant-sandy-area-molding', 'Area B', [
      createUnit('plant-sandy-area-molding-unit-c', 'Unit C', [
        createLine('plant-sandy-area-molding-unit-c-line-30', 'Line 30', 'zone-sandy-molding-c-30-injection-1', 'zone-sandy-molding-c-30-injection-2'),
      ]),
    ]),
    createArea('plant-sandy-area-packing', 'Area C', [
      createUnit('plant-sandy-area-packing-unit-a', 'Unit A', [
        createLine('plant-sandy-area-packing-unit-a-line-40', 'Line 40', 'zone-sandy-packing-a-40-wrap', 'zone-sandy-packing-a-40-label'),
      ]),
    ]),
  ]),
  createPlant('plant-fraga', 'Fraga', [
    createArea('plant-fraga-area-assembly', 'Area A', [
      createUnit('plant-fraga-area-assembly-unit-a', 'Unit A', [
        createLine('plant-fraga-area-assembly-unit-a-line-autoguard', 'Autoguard', 'zone-fraga-assembly-a-autoguard-1', 'zone-fraga-assembly-a-autoguard-2'),
        createLine('plant-fraga-area-assembly-unit-a-line-nexiva', 'Nexiva', 'zone-fraga-assembly-a-nexiva-1', 'zone-fraga-assembly-a-nexiva-2'),
      ]),
    ]),
    createArea('plant-fraga-area-packing', 'Area B', [
      createUnit('plant-fraga-area-packing-unit-b', 'Unit B', [
        createLine('plant-fraga-area-packing-unit-b-line-25', 'Line 25', 'zone-fraga-packing-b-25-ship', 'zone-fraga-packing-b-25-dock'),
      ]),
    ]),
    createArea('plant-fraga-area-quality', 'Area C', [
      createUnit('plant-fraga-area-quality-unit-c', 'Unit C', [
        createLine('plant-fraga-area-quality-unit-c-line-35', 'Line 35', 'zone-fraga-quality-c-35-audit-1', 'zone-fraga-quality-c-35-audit-2'),
      ]),
    ]),
  ]),
  createPlant('plant-humacao', 'Humacao', [
    createArea('plant-humacao-area-assembly', 'Area A', [
      createUnit('plant-humacao-area-assembly-unit-a', 'Unit A', [
        createLine('plant-humacao-area-assembly-unit-a-line-12', 'Line 12', 'zone-humacao-assembly-a-12-1', 'zone-humacao-assembly-a-12-2'),
        createLine('plant-humacao-area-assembly-unit-a-line-22', 'Line 22', 'zone-humacao-assembly-a-22-1', 'zone-humacao-assembly-a-22-2'),
      ]),
    ]),
    createArea('plant-humacao-area-quality', 'Area B', [
      createUnit('plant-humacao-area-quality-unit-b', 'Unit B', [
        createLine('plant-humacao-area-quality-unit-b-line-34', 'Line 34', 'zone-humacao-quality-b-34-1', 'zone-humacao-quality-b-34-2'),
      ]),
    ]),
    createArea('plant-humacao-area-packing', 'Area C', [
      createUnit('plant-humacao-area-packing-unit-c', 'Unit C', [
        createLine('plant-humacao-area-packing-unit-c-line-44', 'Line 44', 'zone-humacao-packing-c-44-1', 'zone-humacao-packing-c-44-2'),
      ]),
    ]),
  ]),
  createPlant('plant-columbus-east', 'Columbus East', [
    createArea('plant-columbus-east-area-assembly', 'Area A', [
      createUnit('plant-columbus-east-area-assembly-unit-a', 'Unit A', [
        createLine('plant-columbus-east-area-assembly-unit-a-line-12', 'Line 12', 'zone-ce-assembly-a-12-1', 'zone-ce-assembly-a-12-2'),
        createLine('plant-columbus-east-area-assembly-unit-a-line-nexiva', 'Nexiva', 'zone-ce-assembly-a-nexiva-1', 'zone-ce-assembly-a-nexiva-2'),
      ]),
    ]),
    createArea('plant-columbus-east-area-molding', 'Area B', [
      createUnit('plant-columbus-east-area-molding-unit-b', 'Unit B', [
        createLine('plant-columbus-east-area-molding-unit-b-line-28', 'Line 28', 'zone-ce-molding-b-28-1', 'zone-ce-molding-b-28-2'),
      ]),
    ]),
    createArea('plant-columbus-east-area-packing', 'Area C', [
      createUnit('plant-columbus-east-area-packing-unit-c', 'Unit C', [
        createLine('plant-columbus-east-area-packing-unit-c-line-38', 'Line 38', 'zone-ce-packing-c-38-1', 'zone-ce-packing-c-38-2'),
      ]),
    ]),
  ]),
  createPlant('plant-el-paso', 'El Paso', [
    createArea('plant-el-paso-area-assembly', 'Area A', [
      createUnit('plant-el-paso-area-assembly-unit-a', 'Unit A', [
        createLine('plant-el-paso-area-assembly-unit-a-line-15', 'Line 15', 'zone-el-paso-assembly-a-15-1', 'zone-el-paso-assembly-a-15-2'),
      ]),
    ]),
    createArea('plant-el-paso-area-molding', 'Area B', [
      createUnit('plant-el-paso-area-molding-unit-b', 'Unit B', [
        createLine('plant-el-paso-area-molding-unit-b-line-27', 'Line 27', 'zone-el-paso-molding-b-27-1', 'zone-el-paso-molding-b-27-2'),
        createLine('plant-el-paso-area-molding-unit-b-line-45', 'Line 45', 'zone-el-paso-molding-b-45-1', 'zone-el-paso-molding-b-45-2'),
      ]),
    ]),
    createArea('plant-el-paso-area-packing', 'Area C', [
      createUnit('plant-el-paso-area-packing-unit-c', 'Unit C', [
        createLine('plant-el-paso-area-packing-unit-c-line-60', 'Line 60', 'zone-el-paso-packing-c-60-1', 'zone-el-paso-packing-c-60-2'),
      ]),
    ]),
  ]),
  createPlant('plant-tijuana-1', 'Tijuana 1', [
    createArea('plant-tijuana-1-area-assembly', 'Area A', [
      createUnit('plant-tijuana-1-area-assembly-unit-a', 'Unit A', [
        createLine('plant-tijuana-1-area-assembly-unit-a-line-20', 'Line 20', 'zone-tijuana-assembly-a-20-1', 'zone-tijuana-assembly-a-20-2'),
        createLine('plant-tijuana-1-area-assembly-unit-a-line-nexiva', 'Nexiva', 'zone-tijuana-assembly-a-nexiva-1', 'zone-tijuana-assembly-a-nexiva-2'),
      ]),
    ]),
    createArea('plant-tijuana-1-area-quality', 'Area B', [
      createUnit('plant-tijuana-1-area-quality-unit-b', 'Unit B', [
        createLine('plant-tijuana-1-area-quality-unit-b-line-55', 'Line 55', 'zone-tijuana-quality-b-55-1', 'zone-tijuana-quality-b-55-2'),
      ]),
    ]),
    createArea('plant-tijuana-1-area-packing', 'Area C', [
      createUnit('plant-tijuana-1-area-packing-unit-c', 'Unit C', [
        createLine('plant-tijuana-1-area-packing-unit-c-line-80', 'Line 80', 'zone-tijuana-packing-c-80-1', 'zone-tijuana-packing-c-80-2'),
      ]),
    ]),
  ]),
  createPlant('plant-tuas', 'Tuas', [
    createArea('plant-tuas-area-assembly', 'Area A', [
      createUnit('plant-tuas-area-assembly-unit-a', 'Unit A', [
        createLine('plant-tuas-area-assembly-unit-a-line-18', 'Line 18', 'zone-tuas-assembly-a-18-1', 'zone-tuas-assembly-a-18-2'),
      ]),
    ]),
    createArea('plant-tuas-area-molding', 'Area B', [
      createUnit('plant-tuas-area-molding-unit-b', 'Unit B', [
        createLine('plant-tuas-area-molding-unit-b-line-26', 'Line 26', 'zone-tuas-molding-b-26-1', 'zone-tuas-molding-b-26-2'),
        createLine('plant-tuas-area-molding-unit-b-line-52', 'Line 52', 'zone-tuas-molding-b-52-1', 'zone-tuas-molding-b-52-2'),
      ]),
    ]),
    createArea('plant-tuas-area-packing', 'Area C', [
      createUnit('plant-tuas-area-packing-unit-c', 'Unit C', [
        createLine('plant-tuas-area-packing-unit-c-line-65', 'Line 65', 'zone-tuas-packing-c-65-1', 'zone-tuas-packing-c-65-2'),
      ]),
    ]),
  ]),
];

function findPathById(nodes: AccessNode[], nodeId: string, trail: AccessNode[] = []): AccessNode[] | null {
  for (const node of nodes) {
    const nextTrail = [...trail, node];
    if (node.id === nodeId) return nextTrail;
    if (node.children?.length) {
      const found = findPathById(node.children, nodeId, nextTrail);
      if (found) return found;
    }
  }
  return null;
}

function summarizeNodePath(nodeId: string) {
  const path = findPathById(accessSelectionTree, nodeId) ?? [];
  return path.map((node) => node.label).join(' / ');
}

function getScopeLevel(pathLength: number): AdminWorkstationRow['level'] {
  if (pathLength >= 5) return 'Zone';
  if (pathLength === 4) return 'Line';
  if (pathLength === 3) return 'Unit';
  if (pathLength === 2) return 'Area';
  return 'Plant';
}

type SeedPlacement = {
  nodeId: string;
  titles?: string[];
  count: number;
  prefix?: string;
  statusByIndex?: Partial<Record<number, AdminWorkstationRow['status']>>;
};

const seededPlacements: SeedPlacement[] = [
  {
    nodeId: 'plant-columbus-west-area-assembly-unit-a-line-10',
    titles: ['Operator View', 'Tier 1', 'Tier 2', 'Tier 3', 'Leader View'],
    count: 5,
    statusByIndex: {4: 'Alert'},
  },
  {
    nodeId: 'plant-columbus-west-area-assembly-unit-a-line-nexiva',
    titles: ['Operator View', 'Tier 1', 'Tier 2'],
    count: 3,
  },
  {
    nodeId: 'plant-columbus-west-area-assembly-unit-b-line-30',
    titles: ['Tier 1', 'Tier 2', 'Tier 3'],
    count: 3,
  },
  {
    nodeId: 'plant-columbus-west-area-assembly-unit-c-line-40',
    titles: ['Tier 3', 'Leader View'],
    count: 2,
  },
  {nodeId: 'plant-columbus-west-area-molding-unit-a-line-50', titles: ['Tier 2', 'Tier 3'], count: 2},
  {nodeId: 'plant-columbus-west-area-packing-unit-a-line-70', titles: ['Leader View'], count: 1},
  {nodeId: 'plant-sandy-area-assembly-unit-b-line-autoguard', titles: ['Operator View', 'Tier 1', 'Tier 2', 'Tier 3'], count: 4},
  {nodeId: 'plant-sandy-area-assembly-unit-b-line-nexiva', titles: ['Operator View', 'Tier 1', 'Tier 2'], count: 3},
  {nodeId: 'plant-sandy-area-molding-unit-c-line-30', titles: ['Tier 2', 'Tier 3'], count: 2},
  {nodeId: 'plant-sandy-area-packing-unit-a-line-40', titles: ['Leader View'], count: 1},
  {nodeId: 'plant-fraga-area-assembly-unit-a-line-autoguard', titles: ['Operator View', 'Tier 1', 'Tier 2', 'Tier 3'], count: 4},
  {nodeId: 'plant-fraga-area-assembly-unit-a-line-nexiva', titles: ['Operator View', 'Tier 1', 'Tier 2'], count: 3},
  {nodeId: 'plant-fraga-area-packing-unit-b-line-25', titles: ['Tier 3', 'Leader View'], count: 2},
  {nodeId: 'plant-fraga-area-quality-unit-c-line-35', titles: ['Tier 2', 'Tier 3'], count: 2},
  {nodeId: 'plant-humacao-area-assembly-unit-a-line-12', titles: ['Operator View', 'Tier 1', 'Tier 2'], count: 3},
  {nodeId: 'plant-humacao-area-assembly-unit-a-line-22', titles: ['Operator View', 'Tier 1', 'Tier 2'], count: 3},
  {nodeId: 'plant-humacao-area-quality-unit-b-line-34', titles: ['Tier 1', 'Tier 2', 'Tier 3'], count: 3},
  {nodeId: 'plant-humacao-area-packing-unit-c-line-44', titles: ['Tier 3', 'Leader View'], count: 2},
  {nodeId: 'plant-columbus-east-area-assembly-unit-a-line-12', titles: ['Operator View', 'Tier 1', 'Tier 2'], count: 3},
  {nodeId: 'plant-columbus-east-area-assembly-unit-a-line-nexiva', titles: ['Operator View', 'Tier 1', 'Tier 2'], count: 3},
  {nodeId: 'plant-columbus-east-area-molding-unit-b-line-28', titles: ['Tier 2', 'Tier 3'], count: 2},
  {nodeId: 'plant-columbus-east-area-packing-unit-c-line-38', titles: ['Leader View'], count: 1},
  {nodeId: 'plant-el-paso-area-assembly-unit-a-line-15', titles: ['Operator View', 'Tier 1', 'Tier 2'], count: 3},
  {nodeId: 'plant-el-paso-area-molding-unit-b-line-27', titles: ['Tier 2', 'Tier 3'], count: 2},
  {nodeId: 'plant-el-paso-area-molding-unit-b-line-45', titles: ['Tier 2', 'Leader View'], count: 2},
  {nodeId: 'plant-el-paso-area-packing-unit-c-line-60', titles: ['Tier 3', 'Leader View'], count: 2},
  {nodeId: 'plant-tijuana-1-area-assembly-unit-a-line-20', titles: ['Operator View', 'Tier 1', 'Tier 2'], count: 3},
  {nodeId: 'plant-tijuana-1-area-assembly-unit-a-line-nexiva', titles: ['Tier 1', 'Tier 2'], count: 2},
  {nodeId: 'plant-tijuana-1-area-quality-unit-b-line-55', titles: ['Tier 2', 'Tier 3'], count: 2},
  {nodeId: 'plant-tijuana-1-area-packing-unit-c-line-80', titles: ['Tier 3', 'Leader View'], count: 2},
  {nodeId: 'plant-tuas-area-assembly-unit-a-line-18', titles: ['Operator View', 'Tier 1', 'Tier 2'], count: 3},
  {nodeId: 'plant-tuas-area-molding-unit-b-line-26', titles: ['Tier 2', 'Tier 3'], count: 2},
  {nodeId: 'plant-tuas-area-molding-unit-b-line-52', titles: ['Tier 2', 'Leader View'], count: 2},
  {nodeId: 'plant-tuas-area-packing-unit-c-line-65', titles: ['Tier 3', 'Leader View'], count: 2},
];

export const staticPredefinedRows: AdminWorkstationRow[] = seededPlacements.flatMap((placement) => {
  const path = findPathById(accessSelectionTree, placement.nodeId) ?? [];
  const assignmentSummary = summarizeNodePath(placement.nodeId);
  const inferredLevel = getScopeLevel(path.length);

  return Array.from({length: placement.count}, (_, index) => {
    const title = placement.titles?.[index] ?? `${placement.prefix ?? path[path.length - 1]?.label ?? 'Workstation'} Board ${index + 1}`;
    const templateLevelMap: Record<string, string> = {
      'Operator View': 'Operator',
      'Tier 1': 'Tier 1',
      'Tier 2': 'Tier 2',
      'Tier 3': 'Tier 3',
      'Leader View': 'Leader',
    };
    const isTemplate = Boolean(templateLevelMap[title]);

    return {
      id: `seed-${placement.nodeId}-${index + 1}`,
      title,
      type: isTemplate ? 'Template' : 'Custom',
      level: templateLevelMap[title] ?? inferredLevel,
      assignmentSummary,
      status: placement.statusByIndex?.[index] ?? 'Active',
      lastActivity: index === 0 ? '10 min ago' : index < 3 ? 'Today, 8:30 AM' : 'Yesterday, 4:10 PM',
      color: isTemplate ? tokenBrand.main : tokenInfo.darkest,
      action: {kind: 'predefined', title},
      nodeId: placement.nodeId,
      workstationType: inferWorkstationType({title}),
    } satisfies AdminWorkstationRow;
  });
});

export const seededUserDirectoryRows: UserDirectoryRow[] = [
  {
    id: 'user-1',
    name: 'Andre P.',
    initials: 'AP',
    email: 'andre.p@factory.com',
    plant: 'Columbus West',
    area: 'Area A',
    unit: 'Unit A',
    line: 'Line 10',
    role: 'Operator',
    status: 'Active',
    lastActivity: '12 min ago',
    avatarTone: tokenNeutral.main,
  },
  {
    id: 'user-2',
    name: 'Maria S.',
    initials: 'MS',
    email: 'maria.s@factory.com',
    plant: 'Columbus West',
    area: 'Area A',
    unit: 'Unit A',
    line: 'Line 10',
    role: 'Lead',
    status: 'Pending Invite',
    lastActivity: 'Yesterday',
    avatarTone: tokenError.lightest,
  },
];

export const defaultWorkstationAssignmentDraft: WorkstationAssignmentDraft = {
  area: 'Area A',
  level: 'line',
  line: 'Line 10',
  plant: 'Columbus West',
  unit: 'Unit A',
  zoneId: defaultAccessSelectionPath.zoneId,
};
