import {accessSelectionTree, defaultAccessSelectionPath} from '../workstation/allworkstation/data/workstation.mock';
import type {AccessNode} from '../workstation/allworkstation/data/workstation.types';

export type HeaderHierarchyNodeKind = 'global' | 'region' | 'plant' | 'area' | 'unit' | 'line' | 'zone' | 'system' | 'asset';

export type HeaderHierarchyNode = {
  children?: HeaderHierarchyNode[];
  id: string;
  kind: HeaderHierarchyNodeKind;
  label: string;
};

export const HEADER_HIERARCHY_ROOT_ID = 'header-hierarchy-bd-global';
export const DEFAULT_HEADER_HIERARCHY_SELECTION_ID = defaultAccessSelectionPath.lineId;

const plantRegionLabels: Record<string, string> = {
  'plant-columbus-west': 'Americas',
  'plant-sandy': 'Americas',
  'plant-fraga': 'Europe',
  'plant-humacao': 'Americas',
  'plant-columbus-east': 'Americas',
  'plant-el-paso': 'Americas',
  'plant-tijuana-1': 'Americas',
  'plant-tuas': 'Asia Pacific',
};

const regionOrder = ['Americas', 'Europe', 'Asia Pacific', 'Africa'];

const staticRegionNodes: Partial<Record<string, HeaderHierarchyNode[]>> = {
  Europe: [
    {id: 'header-site-plymouth', kind: 'plant', label: 'Plymouth'},
    {id: 'header-site-temse', kind: 'plant', label: 'Temse'},
    {id: 'header-site-le-pont-de-claix', kind: 'plant', label: 'Le Pont-de-Claix'},
    {id: 'header-site-eysins', kind: 'plant', label: 'Eysins'},
    {id: 'header-site-tatabanya', kind: 'plant', label: 'Tatabanya'},
  ],
  'Asia Pacific': [
    {id: 'header-site-shanghai', kind: 'plant', label: 'Shanghai'},
    {id: 'header-site-kulim', kind: 'plant', label: 'Kulim'},
  ],
};

const headerHierarchySupplementalChildren: Partial<Record<string, HeaderHierarchyNode[]>> = {
  'zone-cw-assembly-a-10-final': [
    {
      id: 'cw-syringe-assembly-module',
      kind: 'system',
      label: 'Syringe Assembly Module',
      children: [
        {
          id: 'cw-filling-system',
          kind: 'system',
          label: 'Filling System',
          children: [
            {
              id: 'cw-filling-head-assembly',
              kind: 'system',
              label: 'Filling Head Assembly',
              children: [
                {id: 'cw-servo-motor', kind: 'asset', label: 'Servo Motor'},
                {id: 'cw-nozzle-cluster', kind: 'asset', label: 'Nozzle Cluster'},
                {id: 'cw-drive-bearing', kind: 'asset', label: 'Drive Bearing'},
                {id: 'cw-dosing-pump-module', kind: 'asset', label: 'Dosing Pump Module'},
              ],
            },
          ],
        },
        {id: 'cw-transport-system', kind: 'system', label: 'Transport System'},
        {id: 'cw-conveyor-cv101', kind: 'system', label: 'Conveyor CV-101'},
        {id: 'cw-vision-vi210', kind: 'system', label: 'Vision Inspection VI-210'},
      ],
    },
  ],
};

function attachSupplementalChildren(node: HeaderHierarchyNode): HeaderHierarchyNode {
  const mappedChildren = node.children?.map((child) => attachSupplementalChildren(child)) ?? [];
  const supplementalChildren = (headerHierarchySupplementalChildren[node.id] ?? [])
    .map((child) => attachSupplementalChildren(child));

  return {
    ...node,
    children: [...mappedChildren, ...supplementalChildren],
  };
}

function createHeaderNode(node: AccessNode, depth: number): HeaderHierarchyNode {
  const kindByDepth: HeaderHierarchyNodeKind[] = ['plant', 'area', 'unit', 'line', 'zone'];
  const kind = kindByDepth[Math.min(depth, kindByDepth.length - 1)] ?? 'zone';

  return {
    id: node.id,
    kind,
    label: node.label,
    children: node.children?.map((child) => createHeaderNode(child, depth + 1)),
  };
}

function buildHeaderHierarchyTree() {
  const regions = new Map<string, HeaderHierarchyNode[]>();

  accessSelectionTree.forEach((plantNode) => {
    const regionLabel = plantRegionLabels[plantNode.id] ?? 'Americas';
    const collection = regions.get(regionLabel) ?? [];
    collection.push(createHeaderNode(plantNode, 0));
    regions.set(regionLabel, collection);
  });

  Object.entries(staticRegionNodes).forEach(([regionLabel, nodes]) => {
    const collection = regions.get(regionLabel) ?? [];
    const existingIds = new Set(collection.map((node) => node.id));
    (nodes ?? []).forEach((node) => {
      if (!existingIds.has(node.id)) {
        collection.push(node);
      }
    });
    regions.set(regionLabel, collection);
  });

  return {
    id: HEADER_HIERARCHY_ROOT_ID,
    kind: 'global' as const,
    label: 'BD Global',
    children: regionOrder
      .filter((regionLabel) => (regions.get(regionLabel) ?? []).length > 0)
      .map((regionLabel) => ({
        id: `header-region-${regionLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        kind: 'region' as const,
        label: regionLabel,
        children: regions.get(regionLabel),
      })),
  };
}

export const headerHierarchyTree = attachSupplementalChildren(buildHeaderHierarchyTree());

export function findHeaderHierarchyPath(nodeId: string, trail: HeaderHierarchyNode[] = [], node: HeaderHierarchyNode = headerHierarchyTree): HeaderHierarchyNode[] | null {
  const nextTrail = [...trail, node];
  if (node.id === nodeId) return nextTrail;

  for (const child of node.children ?? []) {
    const found = findHeaderHierarchyPath(nodeId, nextTrail, child);
    if (found) return found;
  }

  return null;
}

export function findHeaderHierarchyNode(nodeId: string) {
  return findHeaderHierarchyPath(nodeId)?.at(-1) ?? null;
}

export function getHeaderHierarchyExpandablePathIds(nodeId: string) {
  return (findHeaderHierarchyPath(nodeId) ?? [])
    .filter((node) => (node.children?.length ?? 0) > 0)
    .map((node) => node.id);
}

export function flattenHeaderHierarchy(node: HeaderHierarchyNode = headerHierarchyTree, trail: HeaderHierarchyNode[] = []) {
  const nextTrail = [...trail, node];
  return [
    {node, path: nextTrail},
    ...((node.children ?? []).flatMap((child) => flattenHeaderHierarchy(child, nextTrail))),
  ];
}

export function deriveHomeSiteScopeFromHierarchy(nodeId: string) {
  const path = findHeaderHierarchyPath(nodeId);
  if (!path?.length) return 'Global';

  const selectedNode = path[path.length - 1];
  if (selectedNode.kind === 'global') return 'Global';
  if (selectedNode.kind === 'region') return selectedNode.label;

  const plantNode = path.find((node) => node.kind === 'plant');
  if (!plantNode) return selectedNode.label;
  if (plantNode.label === 'Tijuana 1') return 'Tijuana';
  if (plantNode.label === 'Tuas') return 'Asia';
  return plantNode.label;
}
