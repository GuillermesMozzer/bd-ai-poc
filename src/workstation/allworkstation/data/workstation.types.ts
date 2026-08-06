import type {ReactNode} from 'react';
import type {WorkstationType} from '../../workstationTypes';

export type AccessNode = {
  children?: AccessNode[];
  id: string;
  label: string;
};

export type WorkstationAssignmentLevel = 'area' | 'unit' | 'line' | 'zone';

export type WorkstationAssignment = {
  areaId: string;
  areaLabel: string;
  level: WorkstationAssignmentLevel;
  lineId: string;
  lineLabel: string;
  plantId: string;
  plantLabel: string;
  unitId: string;
  unitLabel: string;
  zoneId?: string;
  zoneLabel?: string;
};

export type WorkstationAssignmentDraft = {
  area: string;
  level: WorkstationAssignmentLevel;
  line: string;
  plant: string;
  unit: string;
  zoneId: string;
};

export type AdminTab = 'workstations' | 'escalation' | 'users';

export type AdminWorkstationAction = {kind: 'predefined'; title: string; workstationId?: never} | {kind: 'saved'; workstationId?: string};

export type AdminWorkstationRow = {
  action: AdminWorkstationAction;
  assignment?: WorkstationAssignment | null;
  assignmentSummary: string;
  color: string;
  id: string;
  lastActivity: string;
  level: string;
  status: 'Active' | 'Alert' | 'Inactive';
  title: string;
  type: 'Template' | 'Custom' | 'Published';
  nodeId?: string;
  workstationType: WorkstationType;
};

export type UserDirectoryRow = {
  id: string;
  initials: string;
  name: string;
  email: string;
  plant: string;
  area: string;
  unit: string;
  line: string;
  role: string;
  status: 'Active' | 'Pending Invite' | 'Inactive';
  lastActivity: string;
  avatarTone: string;
};

export type WorkstationProfile = {
  summary: string;
  useCases: string[];
  widgetIds: string[];
};

export type TierTemplateDefinition = {
  actionTitle: 'Tier 1' | 'Tier 2' | 'Tier 3';
  canonicalId: string;
  canonicalNodeId: string;
  color: string;
  lastActivity: string;
  level: 'Tier 1' | 'Tier 2' | 'Tier 3';
  nodeDepth: number;
  title: 'Tier 1 Template' | 'Tier 2 Template' | 'Tier 3 Template';
};

export type HierarchyFilterState = {
  area: string;
  line: string;
  query: string;
  site: string;
  status: string;
  type: string;
  unit: string;
};

export type PublishedWorkstation = {
  assignment: WorkstationAssignment;
  id: string;
  title: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  domains: string[];
  history?: PublishedWorkstationHistoryEntry[];
  widgetCount: number;
  layoutStorageKey: string;
  snapshot: unknown;
  bookmarked: boolean;
  sharedWith: string[];
};

export type PublishedWorkstationHistoryEntry = {
  date: string;
  description: string;
  id: string;
  label: string;
};
