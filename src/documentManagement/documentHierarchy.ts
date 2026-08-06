import {accessSelectionTree, defaultAccessSelectionPath} from '../workstation/allworkstation/data/workstation.mock';
import type {AccessNode} from '../workstation/allworkstation/data/workstation.types';

export type DocumentHierarchyNodeKind = 'global' | 'region' | 'plant' | 'area' | 'unit' | 'line' | 'zone';

export type DocumentHierarchyNode = {
  children?: DocumentHierarchyNode[];
  id: string;
  kind: DocumentHierarchyNodeKind;
  label: string;
};

export const DOCUMENT_HIERARCHY_ROOT_ID = 'document-hierarchy-bd-global';
export const DEFAULT_DOCUMENT_HIERARCHY_SELECTION_ID = defaultAccessSelectionPath.lineId;

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

const staticRegionNodes: Partial<Record<string, DocumentHierarchyNode[]>> = {
  Europe: [
    {id: 'document-site-plymouth', kind: 'plant', label: 'Plymouth'},
    {id: 'document-site-temse', kind: 'plant', label: 'Temse'},
    {id: 'document-site-le-pont-de-claix', kind: 'plant', label: 'Le Pont-de-Claix'},
    {id: 'document-site-eysins', kind: 'plant', label: 'Eysins'},
    {id: 'document-site-tatabanya', kind: 'plant', label: 'Tatabanya'},
  ],
  'Asia Pacific': [
    {id: 'document-site-shanghai', kind: 'plant', label: 'Shanghai'},
    {id: 'document-site-kulim', kind: 'plant', label: 'Kulim'},
  ],
};

function createDocumentNode(node: AccessNode, depth: number): DocumentHierarchyNode {
  const kindByDepth: DocumentHierarchyNodeKind[] = ['plant', 'area', 'unit', 'line', 'zone'];
  const kind = kindByDepth[Math.min(depth, kindByDepth.length - 1)] ?? 'zone';

  return {
    id: node.id,
    kind,
    label: node.label,
    children: node.children?.map((child) => createDocumentNode(child, depth + 1)),
  };
}

function buildDocumentHierarchyTree(): DocumentHierarchyNode {
  const regions = new Map<string, DocumentHierarchyNode[]>();

  accessSelectionTree.forEach((plantNode) => {
    const regionLabel = plantRegionLabels[plantNode.id] ?? 'Americas';
    const collection = regions.get(regionLabel) ?? [];
    collection.push(createDocumentNode(plantNode, 0));
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
    id: DOCUMENT_HIERARCHY_ROOT_ID,
    kind: 'global',
    label: 'BD Global',
    children: regionOrder
      .filter((regionLabel) => (regions.get(regionLabel) ?? []).length > 0)
      .map((regionLabel) => ({
        id: `document-region-${regionLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        kind: 'region' as const,
        label: regionLabel,
        children: regions.get(regionLabel),
      })),
  };
}

export const documentHierarchyTree = buildDocumentHierarchyTree();

export function findDocumentHierarchyPath(
  nodeId: string,
  trail: DocumentHierarchyNode[] = [],
  node: DocumentHierarchyNode = documentHierarchyTree,
): DocumentHierarchyNode[] | null {
  const nextTrail = [...trail, node];
  if (node.id === nodeId) return nextTrail;

  for (const child of node.children ?? []) {
    const found = findDocumentHierarchyPath(nodeId, nextTrail, child);
    if (found) return found;
  }

  return null;
}

export function findDocumentHierarchyNode(nodeId: string) {
  return findDocumentHierarchyPath(nodeId)?.at(-1) ?? null;
}

export function getDocumentHierarchyExpandablePathIds(nodeId: string) {
  return (findDocumentHierarchyPath(nodeId) ?? [])
    .filter((node) => (node.children?.length ?? 0) > 0)
    .map((node) => node.id);
}

export function flattenDocumentHierarchy(
  node: DocumentHierarchyNode = documentHierarchyTree,
  trail: DocumentHierarchyNode[] = [],
) {
  const nextTrail = [...trail, node];
  return [
    {node, path: nextTrail},
    ...((node.children ?? []).flatMap((child) => flattenDocumentHierarchy(child, nextTrail))),
  ];
}
