import { tokenBrand, tokenError, tokenWarning, tokenSuccess, tokenInfo, tokenNeutral, tokenText, tokenCommon, workstationVisuals, workstationChartSemantic, workstationPriorityTone, workstationSqdcpTone } from '../../theme';
import {useEffect, useMemo, useState} from 'react';
import {readPublishedWorkstations, publishedWorkstationsUpdatedEvent} from '../../publishedWorkstations';
import {getWorkstationTypeMeta} from '../../workstationTypes';
import {accessSelectionTree, staticPredefinedRows} from '../data/workstation.mock';
import {AdminWorkstationRow, AccessNode} from '../data/workstation.types';
import {findAccessNode, findAccessPath, getNodeWithDescendantIds} from './workstation.utils';

export const ALL_WORKSTATIONS_NODE_ID = 'all-workstations';

export type HierarchyNodeMetrics = {
  active: number;
  alert: number;
  inactive: number;
  total: number;
};

export function useAllWorkstationsData(selectedNodeId: string | null) {
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const refresh = () => setVersion((current) => current + 1);
    window.addEventListener(publishedWorkstationsUpdatedEvent, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(publishedWorkstationsUpdatedEvent, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  return useMemo(() => {
    void version;

    const publishedRows = readPublishedWorkstations()
      .filter((workstation) => Boolean(workstation.nodeId))
      .map((workstation): AdminWorkstationRow => ({
        id: workstation.id,
        title: workstation.title,
        type: 'Published',
        level: getNodeLevelLabel(workstation.nodeId ?? ''),
        assignmentSummary: workstation.assignmentSummary || summarizeNodePath(workstation.nodeId ?? ''),
        status: 'Active',
        lastActivity: formatLastActivity(workstation.updatedAt),
        color: getWorkstationTypeMeta(workstation.workstationType ?? 'Production').accent,
        action: {kind: 'saved', workstationId: workstation.id},
        nodeId: workstation.nodeId,
        workstationType: workstation.workstationType ?? 'Production',
      }));

    const publishedKeys = new Set(
      publishedRows
        .filter((row) => row.nodeId)
        .map((row) => `${normalizeTitle(row.title)}::${row.nodeId}`),
    );
    const staticRows = staticPredefinedRows.filter((row) => {
      if (!row.nodeId) return true;
      return !publishedKeys.has(`${normalizeTitle(row.title)}::${row.nodeId}`);
    });

    const allRows = [...staticRows, ...publishedRows];
    const targetNodeIds = getFilterNodeIds(selectedNodeId);
    const directRows = selectedNodeId && selectedNodeId !== ALL_WORKSTATIONS_NODE_ID
      ? allRows.filter((row) => row.nodeId === selectedNodeId)
      : allRows;
    const filteredRows = targetNodeIds
      ? allRows.filter((row) => row.nodeId && targetNodeIds.has(row.nodeId))
      : allRows;

    return {
      allRows,
      directRows,
      filteredRows,
      stats: buildStats(filteredRows),
      totalByNodeId: buildNodeTotals(allRows),
    };
  }, [selectedNodeId, version]);
}

function buildNodeTotals(rows: AdminWorkstationRow[]) {
  const totals = new Map<string, number>();

  rows.forEach((row) => {
    if (!row.nodeId) return;
    const path = findAccessPath(accessSelectionTree, row.nodeId) ?? [];
    path.forEach((node) => {
      totals.set(node.id, (totals.get(node.id) ?? 0) + 1);
    });
  });

  return totals;
}

function buildStats(rows: AdminWorkstationRow[]): HierarchyNodeMetrics {
  return rows.reduce<HierarchyNodeMetrics>((acc, row) => {
    acc.total += 1;
    if (row.status === 'Alert') acc.alert += 1;
    else if (row.status === 'Inactive') acc.inactive += 1;
    else acc.active += 1;
    return acc;
  }, {total: 0, active: 0, alert: 0, inactive: 0});
}

function getFilterNodeIds(selectedNodeId: string | null) {
  if (!selectedNodeId || selectedNodeId === ALL_WORKSTATIONS_NODE_ID) return null;
  const selectedNode = findAccessNode(accessSelectionTree, selectedNodeId);
  if (!selectedNode) return new Set<string>();
  return new Set(getNodeWithDescendantIds(selectedNode));
}

function summarizeNodePath(nodeId: string) {
  return (findAccessPath(accessSelectionTree, nodeId) ?? []).map((node) => node.label).join(' / ');
}

function getNodeLevelLabel(nodeId: string) {
  const pathLength = (findAccessPath(accessSelectionTree, nodeId) ?? []).length;
  if (pathLength >= 5) return 'Zone';
  if (pathLength === 4) return 'Line';
  if (pathLength === 3) return 'Unit';
  if (pathLength === 2) return 'Area';
  if (pathLength === 1) return 'Plant';
  return 'Unknown';
}

function formatLastActivity(updatedAt: string) {
  const date = new Date(updatedAt);
  if (Number.isNaN(date.getTime())) return 'Just now';
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function normalizeTitle(value: string) {
  return value.trim().toLowerCase();
}

export type ConnectionPathNode = {
  color: string;
  id: string;
  isHierarchyNode: boolean;
  level: string;
  status: 'Active' | 'Alert' | 'Inactive';
  title: string;
  x: number;
  y: number;
};

export type ConnectionPathEdge = {
  from: string;
  to: string;
};

export function buildConnectionPathGraph(selectedNodeId: string | null, rows: AdminWorkstationRow[]) {
  const isGlobalView = !selectedNodeId || selectedNodeId === ALL_WORKSTATIONS_NODE_ID;
  const focusNodeId = isGlobalView ? ALL_WORKSTATIONS_NODE_ID : selectedNodeId;
  const focusNode = isGlobalView
    ? {id: ALL_WORKSTATIONS_NODE_ID, label: 'All Workstations', children: accessSelectionTree}
    : (focusNodeId ? findAccessNode(accessSelectionTree, focusNodeId) : null);

  if (!focusNode || !focusNodeId) {
    return {nodes: [] as ConnectionPathNode[], connections: [] as ConnectionPathEdge[]};
  }

  const subtreeNodes = flattenTree(focusNode);
  const maxDepth = Math.max(...subtreeNodes.map((entry) => entry.depth), 0);
  const hierarchyNodes: ConnectionPathNode[] = subtreeNodes.map(({node, depth, indexAtDepth, countAtDepth}) => ({
    id: node.id,
    title: node.label,
    level: getHierarchyLevelLabel(depth, isGlobalView),
    x: 14 + ((depth / Math.max(maxDepth, 1)) * 58),
    y: 14 + ((indexAtDepth + 1) * (72 / (countAtDepth + 1))),
    color: workstationVisuals.textSecondary,
    status: 'Active',
    isHierarchyNode: true,
  }));

  const hierarchyConnections = subtreeNodes
    .filter(({parentId}) => Boolean(parentId))
    .map(({node, parentId}) => ({from: parentId!, to: node.id}));

  const rowsByNode = new Map<string, AdminWorkstationRow[]>();
  rows.forEach((row) => {
    if (!row.nodeId) return;
    const list = rowsByNode.get(row.nodeId) ?? [];
    list.push(row);
    rowsByNode.set(row.nodeId, list);
  });

  const workstationNodes: ConnectionPathNode[] = [];
  const workstationConnections: ConnectionPathEdge[] = [];

  hierarchyNodes.forEach((node) => {
    const directRows = rowsByNode.get(node.id) ?? [];
    directRows.forEach((row, index) => {
      workstationNodes.push({
        id: row.id,
        title: row.title,
        level: row.level,
        x: 78 + ((index % 2) * 12),
        y: clamp(node.y - 8 + index * 10, 10, 90),
        color: row.status === 'Alert' ? tokenWarning.dark : tokenBrand.main,
        status: row.status,
        isHierarchyNode: false,
      });
      workstationConnections.push({from: node.id, to: row.id});
    });
  });

  return {
    nodes: [...hierarchyNodes, ...workstationNodes],
    connections: [...hierarchyConnections, ...workstationConnections],
  };
}

function flattenTree(root: AccessNode) {
  const depths = new Map<number, number>();
  const items: Array<{countAtDepth: number; depth: number; indexAtDepth: number; node: AccessNode; parentId: string | null}> = [];

  const visit = (node: AccessNode, depth: number, parentId: string | null) => {
    const indexAtDepth = depths.get(depth) ?? 0;
    depths.set(depth, indexAtDepth + 1);
    items.push({node, depth, parentId, indexAtDepth, countAtDepth: 0});
    node.children?.forEach((child) => visit(child, depth + 1, node.id));
  };

  visit(root, 0, null);

  const totals = new Map<number, number>();
  items.forEach((item) => totals.set(item.depth, (totals.get(item.depth) ?? 0) + 1));

  return items.map((item) => ({...item, countAtDepth: totals.get(item.depth) ?? 1}));
}

function getHierarchyLevelLabel(depth: number, isGlobalView: boolean) {
  if (depth === 0) return isGlobalView ? 'Global' : 'Selected';
  if (depth === 1) return isGlobalView ? 'Plant' : 'Area';
  if (depth === 2) return isGlobalView ? 'Area' : 'Unit';
  if (depth === 3) return isGlobalView ? 'Unit' : 'Line';
  if (depth === 4) return isGlobalView ? 'Line' : 'Zone';
  return 'Zone';
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}
