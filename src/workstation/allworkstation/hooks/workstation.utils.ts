import {
  AccessNode,
  WorkstationAssignment,
  WorkstationAssignmentDraft,
  WorkstationAssignmentLevel,
} from '../data/workstation.types';
import {accessSelectionTree, defaultAccessSelectionPath, defaultWorkstationAssignmentDraft} from '../data/workstation.mock';

export function findAccessNode(nodes: AccessNode[], nodeId: string): AccessNode | null {
  for (const node of nodes) {
    if (node.id === nodeId) return node;
    if (node.children?.length) {
      const found = findAccessNode(node.children, nodeId);
      if (found) return found;
    }
  }
  return null;
}

export function getNodeWithDescendantIds(node: AccessNode): string[] {
  return [node.id, ...(node.children?.flatMap((child) => getNodeWithDescendantIds(child)) ?? [])];
}

export function getAccessLeafIds(node: AccessNode): string[] {
  if (!node.children?.length) return [node.id];
  return node.children.flatMap((child) => getAccessLeafIds(child));
}

export function findAccessPath(nodes: AccessNode[], nodeId: string, trail: AccessNode[] = []): AccessNode[] | null {
  for (const node of nodes) {
    const nextTrail = [...trail, node];
    if (node.id === nodeId) return nextTrail;
    if (node.children?.length) {
      const found = findAccessPath(node.children, nodeId, nextTrail);
      if (found) return found;
    }
  }
  return null;
}

export function findChildNodeByLabel(nodes: AccessNode[] | undefined, label: string) {
  return nodes?.find((node) => node.label === label) ?? null;
}

export function getAccessPathIdsToExpand(nodeId: string) {
  return (findAccessPath(accessSelectionTree, nodeId) ?? [])
    .filter((node) => node.children?.length)
    .map((node) => node.id);
}

export function createWorkstationAssignmentDraft(assignment?: WorkstationAssignment | null): WorkstationAssignmentDraft {
  if (!assignment) return defaultWorkstationAssignmentDraft;
  return {
    area: assignment.areaLabel,
    level: assignment.level,
    line: assignment.lineLabel,
    plant: assignment.plantLabel,
    unit: assignment.unitLabel,
    zoneId: assignment.zoneId ?? defaultAccessSelectionPath.zoneId,
  };
}

export function getWorkstationAssignmentNodeId(assignment: WorkstationAssignment) {
  if (assignment.level === 'zone') return assignment.zoneId ?? assignment.lineId;
  if (assignment.level === 'line') return assignment.lineId;
  if (assignment.level === 'unit') return assignment.unitId;
  return assignment.areaId;
}

export function getWorkstationAssignmentKey(assignment?: WorkstationAssignment | null) {
  if (!assignment) return 'line:unassigned';
  return `${assignment.level}:${getWorkstationAssignmentNodeId(assignment)}`;
}

export function getWorkstationAssignmentPathIds(assignment: WorkstationAssignment) {
  const pathNodeId = getWorkstationAssignmentNodeId(assignment);
  return (findAccessPath(accessSelectionTree, pathNodeId) ?? []).map((node) => node.id);
}

export function getWorkstationAssignmentCoverageNodeIds(assignment: WorkstationAssignment) {
  const pathNodeId = getWorkstationAssignmentNodeId(assignment);
  const pathIds = getWorkstationAssignmentPathIds(assignment);
  const selectedNode = findAccessNode(accessSelectionTree, pathNodeId);
  if (!selectedNode) return pathIds;
  return Array.from(new Set([...pathIds, ...getNodeWithDescendantIds(selectedNode)]));
}

export function formatWorkstationAssignmentSummary(assignment?: WorkstationAssignment | null) {
  if (!assignment) return 'Unassigned';
  if (assignment.level === 'zone') return `${assignment.plantLabel} / ${assignment.areaLabel} / ${assignment.unitLabel} / ${assignment.lineLabel} / ${assignment.zoneLabel ?? 'Zone'}`;
  if (assignment.level === 'line') return `${assignment.plantLabel} / ${assignment.areaLabel} / ${assignment.unitLabel} / ${assignment.lineLabel}`;
  if (assignment.level === 'unit') return `${assignment.plantLabel} / ${assignment.areaLabel} / ${assignment.unitLabel}`;
  return `${assignment.plantLabel} / ${assignment.areaLabel}`;
}

export function createWorkstationAssignmentFromNodes(
  level: WorkstationAssignmentLevel,
  plantNode: AccessNode,
  areaNode: AccessNode,
  unitNode: AccessNode,
  lineNode: AccessNode,
  zoneNode?: AccessNode | null,
): WorkstationAssignment {
  return {
    areaId: areaNode.id,
    areaLabel: areaNode.label,
    level,
    lineId: lineNode.id,
    lineLabel: lineNode.label,
    plantId: plantNode.id,
    plantLabel: plantNode.label,
    unitId: unitNode.id,
    unitLabel: unitNode.label,
    zoneId: zoneNode?.id,
    zoneLabel: zoneNode?.label,
  };
}

export function buildWorkstationAssignmentFromDraft(draft: WorkstationAssignmentDraft): WorkstationAssignment {
  const plantNode = findChildNodeByLabel(accessSelectionTree, draft.plant) ?? accessSelectionTree[0];
  const areaNode = findChildNodeByLabel(plantNode?.children, draft.area) ?? plantNode?.children?.[0];
  const unitNode = findChildNodeByLabel(areaNode?.children, draft.unit) ?? areaNode?.children?.[0];
  const lineNode = findChildNodeByLabel(unitNode?.children, draft.line) ?? unitNode?.children?.[0];
  const zoneNode = lineNode?.children?.find((node) => node.id === draft.zoneId) ?? lineNode?.children?.[0] ?? null;

  if (!plantNode || !areaNode || !unitNode || !lineNode) {
    const fallbackPlantNode = accessSelectionTree[0]!;
    const fallbackAreaNode = fallbackPlantNode.children?.[0]!;
    const fallbackUnitNode = fallbackAreaNode.children?.[0]!;
    const fallbackLineNode = fallbackUnitNode.children?.[0]!;
    const fallbackZoneNode = fallbackLineNode.children?.[0] ?? null;
    return createWorkstationAssignmentFromNodes(
      draft.level,
      fallbackPlantNode,
      fallbackAreaNode,
      fallbackUnitNode,
      fallbackLineNode,
      draft.level === 'zone' ? fallbackZoneNode : null,
    );
  }

  return createWorkstationAssignmentFromNodes(
    draft.level,
    plantNode,
    areaNode,
    unitNode,
    lineNode,
    draft.level === 'zone' ? zoneNode : null,
  );
}

export function buildWorkstationAssignmentFromNodeId(nodeId: string): WorkstationAssignment | null {
  const path = findAccessPath(accessSelectionTree, nodeId);
  if (!path || path.length < 2) return null;

  const [plantNode, areaNode, unitNode, lineNode, zoneNode] = path;
  if (!plantNode || !areaNode) return null;

  if (path.length === 2) {
    const defaultUnitNode = areaNode.children?.[0];
    const defaultLineNode = defaultUnitNode?.children?.[0];
    if (!defaultUnitNode || !defaultLineNode) return null;
    return createWorkstationAssignmentFromNodes('area', plantNode, areaNode, defaultUnitNode, defaultLineNode, null);
  }

  if (path.length === 3) {
    const defaultLineNode = unitNode?.children?.[0];
    if (!unitNode || !defaultLineNode) return null;
    return createWorkstationAssignmentFromNodes('unit', plantNode, areaNode, unitNode, defaultLineNode, null);
  }

  if (path.length === 4) {
    if (!unitNode || !lineNode) return null;
    return createWorkstationAssignmentFromNodes('line', plantNode, areaNode, unitNode, lineNode, null);
  }

  if (!unitNode || !lineNode || !zoneNode) return null;
  return createWorkstationAssignmentFromNodes('zone', plantNode, areaNode, unitNode, lineNode, zoneNode);
}
