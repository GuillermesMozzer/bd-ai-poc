import type {AdminWorkstationRow} from './data/workstation.types';
import {
  inferWorkstationType,
  isWorkstationType,
  workstationTypeOrder,
  type WorkstationType,
} from '../workstationTypes';

export const connectionPathStorageKey = 'workstation-connection-paths-v1';
export const connectionPathUpdatedEvent = 'workstation-connection-paths-updated';

export type StoredConnectionNode = {
  id: string;
  laneRow: number;
  level: string;
  status: 'Active' | 'Alert' | 'Inactive';
  title: string;
  workstationType: WorkstationType;
  x: number;
  y: number;
};

export type StoredConnectionEdge = {
  from: string;
  to: string;
};

export type StoredConnectionScope = {
  connections: StoredConnectionEdge[];
  contextNodeId: string;
  nodes: StoredConnectionNode[];
  updatedAt: string;
};

type ContextConnectionPathBlueprint = {
  connections: StoredConnectionEdge[];
  nodes: StoredConnectionNode[];
};

const defaultWorkstationOrder = ['Operator View', 'Tier 1', 'Tier 2', 'Tier 3', 'Leader View'] as const;
const titlePositionHints = new Map<string, number>([
  ['Operator View', 18],
  ['Tier 1', 36],
  ['Tier 2', 54],
  ['Tier 3', 72],
  ['Leader View', 86],
]);

const contextConnectionPathBlueprints = new Map<string, ContextConnectionPathBlueprint>([
  ['plant-columbus-west', {
    nodes: [
      buildBlueprintNode('cw-plant-operator-view', 'Operator View', 'Production', 28, 0),
      buildBlueprintNode('cw-plant-tier-1-poliflush', 'Tier 1 Poliflush', 'Tier Management', 30, 0),
      buildBlueprintNode('cw-plant-tier-1-cannula', 'Tier 1 Cannula', 'Tier Management', 30, 1),
      buildBlueprintNode('cw-plant-tier-1-hypordemic', 'Tier 1 Hypodermic', 'Tier Management', 30, 2),
      buildBlueprintNode('cw-plant-tier-2-poliflush', 'Tier 2 Poliflush', 'Tier Management', 54, 0),
      buildBlueprintNode('cw-plant-tier-2-cannula', 'Tier 2 Cannula', 'Tier Management', 54, 1),
      buildBlueprintNode('cw-plant-tier-2-hypordemic', 'Tier 2 Hypodermic', 'Tier Management', 54, 2),
      buildBlueprintNode('cw-plant-tier-3', 'Tier 3', 'Tier Management', 80, 1),
      buildBlueprintNode('cw-plant-quality-team', 'Quality Team', 'Quality', 78, 0),
      buildBlueprintNode('cw-plant-leadership-view', 'Leadership View', 'Leadership', 78, 0),
      buildBlueprintNode('cw-plant-reliability-team', 'Reliability Team', 'Maintenance', 22, 0),
      buildBlueprintNode('cw-plant-preventive-maintenance-team', 'Preventive Maintenance Team', 'Maintenance', 50, 0),
      buildBlueprintNode('cw-plant-tool-crib-team', 'Tool Crib Team', 'Maintenance', 78, 0),
    ],
    connections: [
      {from: 'cw-plant-tier-1-poliflush', to: 'cw-plant-tier-2-poliflush'},
      {from: 'cw-plant-tier-1-cannula', to: 'cw-plant-tier-2-cannula'},
      {from: 'cw-plant-tier-1-hypordemic', to: 'cw-plant-tier-2-hypordemic'},
      {from: 'cw-plant-tier-2-poliflush', to: 'cw-plant-tier-3'},
      {from: 'cw-plant-tier-2-cannula', to: 'cw-plant-tier-3'},
      {from: 'cw-plant-tier-2-hypordemic', to: 'cw-plant-tier-3'},
      {from: 'cw-plant-tier-3', to: 'cw-plant-quality-team'},
      {from: 'cw-plant-tier-3', to: 'cw-plant-leadership-view'},
      {from: 'cw-plant-tier-3', to: 'cw-plant-reliability-team'},
      {from: 'cw-plant-tier-3', to: 'cw-plant-preventive-maintenance-team'},
      {from: 'cw-plant-tier-3', to: 'cw-plant-tool-crib-team'},
    ],
  }],
]);

export function readConnectionPathScopes() {
  if (typeof window === 'undefined') return [] as StoredConnectionScope[];

  try {
    const raw = window.localStorage.getItem(connectionPathStorageKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? sanitizeScopes(parsed) : [];
  } catch {
    return [];
  }
}

export function readConnectionPathScope(contextNodeId: string, rows: AdminWorkstationRow[]) {
  const scopes = readConnectionPathScopes();
  const stored = scopes.find((scope) => scope.contextNodeId === contextNodeId);
  return stored ? mergeScopeWithRows(stored, rows) : createDefaultScope(contextNodeId, rows);
}

export function writeConnectionPathScope(scope: StoredConnectionScope) {
  if (typeof window === 'undefined') return;

  const scopes = readConnectionPathScopes();
  const nextScopes = [
    scope,
    ...scopes.filter((item) => item.contextNodeId !== scope.contextNodeId),
  ];

  window.localStorage.setItem(connectionPathStorageKey, JSON.stringify(nextScopes));
  window.dispatchEvent(new CustomEvent(connectionPathUpdatedEvent, {detail: scope}));
}

export function buildAutoLayoutScope(contextNodeId: string, rows: AdminWorkstationRow[]) {
  return createDefaultScope(contextNodeId, rows);
}

export function readWorkstationConnectionSummary(workstationTitle: string) {
  const defaultSummary = buildDefaultSummary(workstationTitle);
  const scopes = readConnectionPathScopes();
  const upstream = new Set(defaultSummary.upstream);
  const downstream = new Set(defaultSummary.downstream);

  scopes.forEach((scope) => {
    const matchingNodeIds = scope.nodes
      .filter((node) => normalizeTitle(node.title) === normalizeTitle(workstationTitle))
      .map((node) => node.id);

    if (!matchingNodeIds.length) return;

    scope.connections.forEach((edge) => {
      if (matchingNodeIds.includes(edge.from)) {
        const target = scope.nodes.find((node) => node.id === edge.to);
        if (target) downstream.add(target.title);
      }
      if (matchingNodeIds.includes(edge.to)) {
        const source = scope.nodes.find((node) => node.id === edge.from);
        if (source) upstream.add(source.title);
      }
    });
  });

  return {
    upstream: Array.from(upstream),
    downstream: Array.from(downstream),
  };
}

export function readEscalationTargetsForSource(workstationTitle: string) {
  const summary = readWorkstationConnectionSummary(workstationTitle);
  return summary.downstream;
}

function sanitizeScopes(value: unknown[]) {
  return value.reduce<StoredConnectionScope[]>((scopes, candidate) => {
    if (typeof candidate !== 'object' || candidate === null) return scopes;
    const row = candidate as Record<string, unknown>;
    if (typeof row.contextNodeId !== 'string' || !Array.isArray(row.nodes) || !Array.isArray(row.connections) || typeof row.updatedAt !== 'string') {
      return scopes;
    }

    const nodes = row.nodes.reduce<StoredConnectionNode[]>((items, nodeCandidate) => {
      if (typeof nodeCandidate !== 'object' || nodeCandidate === null) return items;
      const node = nodeCandidate as Record<string, unknown>;
      if (
        typeof node.id !== 'string'
        || typeof node.title !== 'string'
        || typeof node.level !== 'string'
        || typeof node.x !== 'number'
        || typeof node.y !== 'number'
        || (node.status !== 'Active' && node.status !== 'Alert' && node.status !== 'Inactive')
      ) {
        return items;
      }

      items.push({
        id: node.id,
        laneRow: typeof node.laneRow === 'number' && Number.isFinite(node.laneRow) ? Math.max(0, Math.round(node.laneRow)) : 0,
        title: node.title,
        level: node.level,
        x: node.x,
        y: node.y,
        status: node.status,
        workstationType: isWorkstationType(node.workstationType)
          ? node.workstationType
          : inferWorkstationType({title: node.title}),
      });
      return items;
    }, []);

    const connections = row.connections.reduce<StoredConnectionEdge[]>((items, edgeCandidate) => {
      if (typeof edgeCandidate !== 'object' || edgeCandidate === null) return items;
      const edge = edgeCandidate as Record<string, unknown>;
      if (typeof edge.from !== 'string' || typeof edge.to !== 'string') return items;
      items.push({from: edge.from, to: edge.to});
      return items;
    }, []);

    scopes.push({
      contextNodeId: row.contextNodeId,
      nodes,
      connections,
      updatedAt: row.updatedAt,
    });

    return scopes;
  }, []);
}

function mergeScopeWithRows(scope: StoredConnectionScope, rows: AdminWorkstationRow[]) {
  const defaultScope = createDefaultScope(scope.contextNodeId, rows);
  const isBlueprintScope = contextConnectionPathBlueprints.has(scope.contextNodeId);
  const storedNodesById = new Map(scope.nodes.map((node) => [node.id, node]));
  const isBlueprintStructureCompatible = !isBlueprintScope || (
    scope.nodes.length === defaultScope.nodes.length
    && defaultScope.nodes.every((node) => storedNodesById.has(node.id))
  );
  const nodes = defaultScope.nodes.map((node) => {
    const storedNode = isBlueprintStructureCompatible ? storedNodesById.get(node.id) : undefined;
    return storedNode
      ? {
          ...node,
          laneRow: storedNode.laneRow,
          x: storedNode.x,
          y: storedNode.y,
          workstationType: storedNode.workstationType,
        }
      : node;
  });
  const validNodeIds = new Set(nodes.map((node) => node.id));
  const filteredStoredConnections = scope.connections.filter((edge) => validNodeIds.has(edge.from) && validNodeIds.has(edge.to));
  const connections = isBlueprintStructureCompatible
    ? filteredStoredConnections
    : defaultScope.connections;

  return {
    contextNodeId: scope.contextNodeId,
    nodes,
    connections,
    updatedAt: scope.updatedAt,
  };
}

function createDefaultScope(contextNodeId: string, rows: AdminWorkstationRow[]): StoredConnectionScope {
  const blueprintScope = createBlueprintScope(contextNodeId);
  if (blueprintScope) {
    return blueprintScope;
  }

  const orderedRows = [...rows].sort((left, right) => {
    const leftTypeIndex = workstationTypeOrder.indexOf(left.workstationType);
    const rightTypeIndex = workstationTypeOrder.indexOf(right.workstationType);
    const normalizedLeftType = leftTypeIndex === -1 ? Number.MAX_SAFE_INTEGER : leftTypeIndex;
    const normalizedRightType = rightTypeIndex === -1 ? Number.MAX_SAFE_INTEGER : rightTypeIndex;
    if (normalizedLeftType !== normalizedRightType) return normalizedLeftType - normalizedRightType;

    const leftIndex = defaultWorkstationOrder.indexOf(left.title as typeof defaultWorkstationOrder[number]);
    const rightIndex = defaultWorkstationOrder.indexOf(right.title as typeof defaultWorkstationOrder[number]);
    const normalizedLeft = leftIndex === -1 ? Number.MAX_SAFE_INTEGER : leftIndex;
    const normalizedRight = rightIndex === -1 ? Number.MAX_SAFE_INTEGER : rightIndex;
    if (normalizedLeft !== normalizedRight) return normalizedLeft - normalizedRight;
    return left.title.localeCompare(right.title);
  });

  const nodes: StoredConnectionNode[] = [];
  const laneDescriptors = buildLaneDescriptors();

  workstationTypeOrder.forEach((type, laneIndex) => {
    const laneRows = orderedRows.filter((row) => row.workstationType === type);
    const lane = laneDescriptors[laneIndex];
    const laneCenter = lane.top + (lane.height / 2);

    laneRows.forEach((row, index) => {
      const titleHint = titlePositionHints.get(row.title);
      const fallbackStep = 58 / Math.max(laneRows.length, 1);
      const fallbackX = laneRows.length === 1
        ? 56
        : 24 + (fallbackStep * index) + (fallbackStep / 2);

      nodes.push({
        id: row.id,
        laneRow: Math.floor(index / 4),
        title: row.title,
        level: row.level,
        status: row.status,
        workstationType: row.workstationType,
        x: titleHint ?? clamp(fallbackX, 22, 90),
        y: clamp(laneCenter, 12, 92),
      });
    });
  });

  const rowsByScopeKey = orderedRows.reduce<Map<string, AdminWorkstationRow[]>>((groups, row) => {
    const scopeKey = row.nodeId ?? row.assignmentSummary ?? row.id;
    const list = groups.get(scopeKey) ?? [];
    list.push(row);
    groups.set(scopeKey, list);
    return groups;
  }, new Map());
  const defaultConnections = Array.from(rowsByScopeKey.values()).flatMap((groupRows) => {
    const titleToId = new Map(groupRows.map((row) => [row.title, row.id]));
    return defaultWorkstationOrder.reduce<StoredConnectionEdge[]>((edges, title, index) => {
      const nextTitle = defaultWorkstationOrder[index + 1];
      if (!nextTitle) return edges;
      const from = titleToId.get(title);
      const to = titleToId.get(nextTitle);
      if (from && to) edges.push({from, to});
      return edges;
    }, []);
  });

  return {
    contextNodeId,
    nodes,
    connections: defaultConnections,
    updatedAt: new Date().toISOString(),
  };
}

function createBlueprintScope(contextNodeId: string) {
  const blueprint = contextConnectionPathBlueprints.get(contextNodeId);
  if (!blueprint) return null;

  return {
    contextNodeId,
    nodes: blueprint.nodes.map((node) => ({...node})),
    connections: blueprint.connections.map((edge) => ({...edge})),
    updatedAt: new Date().toISOString(),
  } satisfies StoredConnectionScope;
}

function buildBlueprintNode(
  id: string,
  title: string,
  workstationType: WorkstationType,
  x: number,
  laneRow: number,
): StoredConnectionNode {
  return {
    id,
    title,
    level: 'Plant',
    status: 'Active',
    workstationType,
    x,
    y: 50,
    laneRow,
  };
}


function buildDefaultSummary(workstationTitle: string) {
  const index = defaultWorkstationOrder.findIndex((title) => normalizeTitle(title) === normalizeTitle(workstationTitle));
  if (index === -1) {
    return {upstream: [] as string[], downstream: [] as string[]};
  }

  return {
    upstream: index > 0 ? [defaultWorkstationOrder[index - 1]] : [],
    downstream: index < defaultWorkstationOrder.length - 1 ? [defaultWorkstationOrder[index + 1]] : [],
  };
}

function normalizeTitle(value: string) {
  return value.trim().toLowerCase();
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function buildLaneDescriptors() {
  const laneTop = 12;
  const laneBottom = 8;
  const laneGap = 1.4;
  const laneCount = workstationTypeOrder.length;
  const laneHeight = (100 - laneTop - laneBottom - (Math.max(laneCount - 1, 0) * laneGap)) / laneCount;

  return workstationTypeOrder.map((type, index) => ({
    type,
    top: laneTop + (index * (laneHeight + laneGap)),
    height: laneHeight,
  }));
}
