import { tokenBrand, tokenError, tokenWarning, tokenSuccess, tokenInfo, tokenNeutral, tokenText, tokenCommon, workstationVisuals, workstationChartSemantic, workstationPriorityTone, workstationSqdcpTone } from '../theme';
import {accessSelectionTree} from './data/workstation.mock';
import {findAccessPath, findAccessNode, getNodeWithDescendantIds} from './hooks/workstation.utils';
import type {UserDirectoryRow} from './data/workstation.types';

export const usersStorageKey = 'all-workstations-users-v1';
export const usersUpdatedEvent = 'all-workstations-users-updated';

export type StoredHierarchyUser = {
  accessNodeIds: string[];
  email: string;
  id: string;
  lastActivity: string;
  name: string;
  primaryNodeId: string;
  role: string;
  status: UserDirectoryRow['status'];
};

const seededUsers: StoredHierarchyUser[] = [
  {
    id: 'user-1',
    name: 'Andre P.',
    email: 'andre.p@factory.com',
    role: 'Operator',
    status: 'Active',
    lastActivity: '12 min ago',
    primaryNodeId: 'plant-columbus-west-area-assembly-unit-a-line-10',
    accessNodeIds: ['plant-columbus-west-area-assembly-unit-a-line-10'],
  },
  {
    id: 'user-2',
    name: 'Maria S.',
    email: 'maria.s@factory.com',
    role: 'Line Leader',
    status: 'Pending Invite',
    lastActivity: 'Yesterday',
    primaryNodeId: 'zone-cw-assembly-a-10-final',
    accessNodeIds: ['zone-cw-assembly-a-10-final', 'zone-cw-assembly-a-10-torque'],
  },
  {
    id: 'user-3',
    name: 'Ethan Walker',
    email: 'ethan.walker@factory.com',
    role: 'Area Leader',
    status: 'Active',
    lastActivity: '1 hour ago',
    primaryNodeId: 'plant-columbus-west-area-assembly',
    accessNodeIds: ['plant-columbus-west-area-assembly'],
  },
  {
    id: 'user-4',
    name: 'Madison Brooks',
    email: 'madison.brooks@factory.com',
    role: 'Plant Manager',
    status: 'Active',
    lastActivity: '5 min ago',
    primaryNodeId: 'plant-columbus-west',
    accessNodeIds: ['plant-columbus-west'],
  },
];

export function readHierarchyUsers() {
  if (typeof window === 'undefined') return seededUsers;

  try {
    const raw = window.localStorage.getItem(usersStorageKey);
    if (!raw) return seededUsers;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? sanitizeUsers(parsed) : seededUsers;
  } catch {
    return seededUsers;
  }
}

export function writeHierarchyUsers(users: StoredHierarchyUser[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(usersStorageKey, JSON.stringify(users));
  window.dispatchEvent(new CustomEvent(usersUpdatedEvent, {detail: users}));
}

export function createHierarchyUser(input: Omit<StoredHierarchyUser, 'id' | 'lastActivity'>) {
  const nextUser: StoredHierarchyUser = {
    ...input,
    id: `user-${Date.now()}`,
    lastActivity: input.status === 'Pending Invite' ? 'Invite pending' : 'Just now',
  };
  const nextUsers = [nextUser, ...readHierarchyUsers()];
  writeHierarchyUsers(nextUsers);
  return nextUser;
}

export function deleteHierarchyUser(userId: string) {
  const nextUsers = readHierarchyUsers().filter((user) => user.id !== userId);
  writeHierarchyUsers(nextUsers);
}

export function buildUserDirectoryRows(selectedNodeId: string | null) {
  const targetNodeIds = getTargetNodeIds(selectedNodeId);
  return readHierarchyUsers()
    .filter((user) => {
      if (!targetNodeIds) return true;
      return user.accessNodeIds.some((nodeId) => targetNodeIds.has(nodeId));
    })
    .map((user) => toDirectoryRow(user));
}

function getTargetNodeIds(selectedNodeId: string | null) {
  if (!selectedNodeId || selectedNodeId === 'all-workstations') return null;
  const node = findAccessNode(accessSelectionTree, selectedNodeId);
  if (!node) return new Set<string>();
  return new Set(getNodeWithDescendantIds(node));
}

function toDirectoryRow(user: StoredHierarchyUser): UserDirectoryRow {
  const path = findAccessPath(accessSelectionTree, user.primaryNodeId) ?? [];
  const [plant, area, unit, line] = path;
  return {
    id: user.id,
    initials: buildInitials(user.name),
    name: user.name,
    email: user.email,
    plant: plant?.label ?? '-',
    area: area?.label ?? '-',
    unit: unit?.label ?? '-',
    line: line?.label ?? (path[path.length - 1]?.label ?? '-'),
    role: user.role,
    status: user.status,
    lastActivity: user.lastActivity,
    avatarTone: pickAvatarTone(user.name),
  };
}

function sanitizeUsers(value: unknown[]) {
  return value.reduce<StoredHierarchyUser[]>((users, candidate) => {
    if (typeof candidate !== 'object' || candidate === null) return users;
    const row = candidate as Record<string, unknown>;
    if (
      typeof row.id !== 'string'
      || typeof row.name !== 'string'
      || typeof row.email !== 'string'
      || typeof row.role !== 'string'
      || typeof row.lastActivity !== 'string'
      || typeof row.primaryNodeId !== 'string'
      || !Array.isArray(row.accessNodeIds)
      || (row.status !== 'Active' && row.status !== 'Pending Invite' && row.status !== 'Inactive')
    ) {
      return users;
    }

    users.push({
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role,
      status: row.status,
      lastActivity: row.lastActivity,
      primaryNodeId: row.primaryNodeId,
      accessNodeIds: row.accessNodeIds.filter((item): item is string => typeof item === 'string'),
    });
    return users;
  }, []);
}

function buildInitials(name: string) {
  return name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
}

function pickAvatarTone(name: string) {
  const tones = [tokenNeutral.main, tokenError.lightest, tokenNeutral.main, tokenWarning.lightest, tokenNeutral.main];
  const sum = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return tones[sum % tones.length];
}
