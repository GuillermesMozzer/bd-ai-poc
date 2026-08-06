import {actionTrackerContextHierarchy} from './config';
import type {ActionTrackerAttachment, ActionTrackerCreateContext, ActionTrackerCreateDraft, ActionTrackerRow, ActionTrackerStatus} from './types';

export const actionTrackerReferenceDate = new Date('2026-04-14T00:00:00');

export function parseActionTrackerDate(value: string) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.getTime();
}

export function isActionTrackerTerminalStatus(status: ActionTrackerStatus) {
  return status === 'Completed' || status === 'Canceled';
}

export function isActionTrackerExecutionStatus(status: ActionTrackerStatus) {
  return status === 'Open' || status === 'In Progress' || status === 'Reopened';
}

export function isActionTrackerOverdue(
  row: Pick<ActionTrackerRow, 'status' | 'dueDate'>,
  referenceDate = actionTrackerReferenceDate,
) {
  if (isActionTrackerTerminalStatus(row.status)) return false;
  const dueAt = parseActionTrackerDate(row.dueDate);
  if (dueAt === null) return false;
  return dueAt < referenceDate.getTime();
}

export function getActionTrackerVisibleStatus(
  row: Pick<ActionTrackerRow, 'status' | 'dueDate'>,
  referenceDate = actionTrackerReferenceDate,
) {
  if (row.status === 'Reopened') return row.status;
  if (isActionTrackerTerminalStatus(row.status)) return row.status;
  return isActionTrackerOverdue(row, referenceDate) ? 'Overdue' : row.status;
}

export function isActionTrackerPendingMyAction(
  row: Pick<ActionTrackerRow, 'status' | 'assignedTo' | 'approver'>,
  currentUserName: string,
) {
  if (!currentUserName.trim()) return false;
  if (row.status === 'Under Approval') return row.approver === currentUserName;
  if (row.status === 'Completed' || row.status === 'Canceled') return false;
  return row.assignedTo === currentUserName && isActionTrackerExecutionStatus(row.status);
}

export function isImplementedSolutionPresent(value: string | undefined) {
  return Boolean(value?.trim());
}

export function getActionTrackerAttachmentKind(attachment: Pick<ActionTrackerAttachment, 'mimeType' | 'name'>) {
  const mimeType = attachment.mimeType.toLowerCase();
  const fileName = attachment.name.toLowerCase();

  if (mimeType.startsWith('image/')) return 'image' as const;
  if (mimeType === 'application/pdf' || fileName.endsWith('.pdf')) return 'pdf' as const;
  return 'download' as const;
}

export type ActionTrackerResolvedScope = {
  plant: string;
  area: string;
  unit: string;
  line: string;
  zone: string;
  machine: string;
};

type ScopeSource = Partial<Pick<ActionTrackerRow, 'plant' | 'area' | 'unit' | 'line' | 'zone' | 'machine' | 'location'>>
  | Partial<Pick<ActionTrackerCreateDraft, 'plant' | 'area' | 'unit' | 'line' | 'zone' | 'machine' | 'location'>>
  | Partial<Pick<ActionTrackerCreateContext, 'plant' | 'area' | 'unit' | 'line' | 'zone' | 'machine' | 'location'>>;

const hierarchyEntries = actionTrackerContextHierarchy.flatMap((plant) => (
  plant.areas.flatMap((area) => (
    area.units.flatMap((unit) => (
      unit.lines.map((line) => ({
        plant: plant.plant,
        showZone: plant.showZone,
        area: area.name,
        unit: unit.name,
        line: line.name,
        zones: [...line.zones],
        machines: [...line.machines],
      }))
    ))
  ))
));

function normalizeValue(value: string | undefined) {
  return value?.trim() || '';
}

function buildFallbackScopeFromLocation(location: string) {
  if (location === 'Building A, 2nd Floor') {
    return {plant: 'TJ1', area: 'Facilities', unit: 'Infrastructure', line: 'Line Support', zone: ''};
  }
  if (location === 'Packaging Area') {
    return {plant: 'TJ1', area: 'Packaging', unit: 'Packaging Unit 1', line: 'Line 3', zone: ''};
  }
  const matchedEntry = hierarchyEntries.find((entry) => entry.line === location);
  if (!matchedEntry) {
    return {plant: '', area: '', unit: '', line: '', zone: ''};
  }
  return {
    plant: matchedEntry.plant,
    area: matchedEntry.area,
    unit: matchedEntry.unit,
    line: matchedEntry.line,
    zone: '',
  };
}

export function resolveActionTrackerScope(scopeSource: ScopeSource): ActionTrackerResolvedScope {
  const provided = {
    plant: normalizeValue(scopeSource.plant),
    area: normalizeValue(scopeSource.area),
    unit: normalizeValue(scopeSource.unit),
    line: normalizeValue(scopeSource.line),
    zone: normalizeValue(scopeSource.zone),
    machine: normalizeValue(scopeSource.machine),
    location: normalizeValue(scopeSource.location),
  };

  const machineEntry = provided.machine
    ? hierarchyEntries.find((entry) => entry.machines.includes(provided.machine))
    : undefined;
  const lineEntry = provided.line
    ? hierarchyEntries.find((entry) => entry.line === provided.line)
    : undefined;
  const locationFallback = provided.location ? buildFallbackScopeFromLocation(provided.location) : undefined;
  const areaEntry = provided.area
    ? hierarchyEntries.find((entry) => entry.area === provided.area && (!provided.plant || entry.plant === provided.plant))
    : undefined;
  const unitEntry = provided.unit
    ? hierarchyEntries.find((entry) => entry.unit === provided.unit && (!provided.area || entry.area === provided.area))
    : undefined;
  const baseEntry = machineEntry ?? lineEntry ?? unitEntry ?? areaEntry;
  const resolvedPlant = provided.plant || baseEntry?.plant || locationFallback?.plant || actionTrackerContextHierarchy[0]?.plant || '';
  const resolvedArea = provided.area || baseEntry?.area || locationFallback?.area || '';
  const resolvedUnit = provided.unit || baseEntry?.unit || locationFallback?.unit || '';
  const resolvedLine = provided.line || baseEntry?.line || locationFallback?.line || '';
  const resolvedLineEntry = hierarchyEntries.find((entry) => (
    entry.line === resolvedLine
    && (!resolvedPlant || entry.plant === resolvedPlant)
    && (!resolvedArea || entry.area === resolvedArea)
    && (!resolvedUnit || entry.unit === resolvedUnit)
  ));
  const resolvedZone = provided.zone && resolvedLineEntry?.zones.includes(provided.zone)
    ? provided.zone
    : '';

  return {
    plant: resolvedPlant,
    area: resolvedArea,
    unit: resolvedUnit,
    line: resolvedLine,
    zone: resolvedZone,
    machine: provided.machine,
  };
}

export function resolveActionTrackerScopeFromLocation(location: string) {
  const scope = resolveActionTrackerScope({location});
  return {
    plant: scope.plant,
    area: scope.area,
    unit: scope.unit,
    line: scope.line,
    zone: scope.zone,
  };
}

export function buildActionTrackerLocationFromScope(
  line: string,
  area: string,
  unit = '',
  plant = '',
  zone = '',
) {
  if (line === 'Line Support' && area === 'Facilities') return 'Building A, 2nd Floor';
  if (area === 'Packaging' && unit === 'Packaging Unit 1' && line === 'Line 3') return 'Packaging Area';
  return line || zone || unit || area || plant;
}

export function isActionTrackerZoneVisible(plant: string) {
  return actionTrackerContextHierarchy.find((item) => item.plant === plant)?.showZone ?? false;
}

export function getActionTrackerAreaOptionsByPlant(plant: string) {
  return (actionTrackerContextHierarchy.find((item) => item.plant === plant)?.areas ?? []).map((area) => area.name);
}

export function getActionTrackerUnitOptionsByArea(plant: string, areaName: string) {
  const plantConfig = actionTrackerContextHierarchy.find((item) => item.plant === plant);
  return (plantConfig?.areas.find((area) => area.name === areaName)?.units ?? []).map((unit) => unit.name);
}

export function getActionTrackerLineOptionsByUnit(plant: string, areaName: string, unitName: string) {
  const plantConfig = actionTrackerContextHierarchy.find((item) => item.plant === plant);
  const area = plantConfig?.areas.find((item) => item.name === areaName);
  return (area?.units.find((unit) => unit.name === unitName)?.lines ?? []).map((line) => line.name);
}

export function getActionTrackerZoneOptionsByLine(plant: string, areaName: string, unitName: string, lineName: string) {
  const plantConfig = actionTrackerContextHierarchy.find((item) => item.plant === plant);
  const area = plantConfig?.areas.find((item) => item.name === areaName);
  const unit = area?.units.find((item) => item.name === unitName);
  return [...(unit?.lines.find((line) => line.name === lineName)?.zones ?? [])];
}

export function getActionTrackerMachineOptionsByScope(
  plant: string,
  areaName: string,
  unitName: string,
  lineName: string,
  zoneName: string,
) {
  const plantConfig = actionTrackerContextHierarchy.find((item) => item.plant === plant);
  const area = plantConfig?.areas.find((item) => item.name === areaName);
  const unit = area?.units.find((item) => item.name === unitName);
  const line = unit?.lines.find((item) => item.name === lineName);
  if (!line) return [];
  if (!zoneName) return [...line.machines];
  return [...line.machines];
}

type ActionTrackerSourceDetailsInput = {
  source?: string | null;
  originRecordId?: string | null;
  originRecordLabel?: string | null;
  originScreen?: string | null;
  tierLevel?: string | null;
  meetingDate?: string | null;
};

export type ActionTrackerSourceDetails = {
  source: string;
  reference: string | null;
  meetingDate: string | null;
  tierLevel: string | null;
  showTierLevel: boolean;
  showBackReference: boolean;
  hasAdditionalDetails: boolean;
};

function normalizeSourceDetailValue(value?: string | null) {
  const normalizedValue = value?.trim();
  return normalizedValue ? normalizedValue : null;
}

function sourceIncludesTierContext(source: string) {
  return /^(TMS|Tier)\s*\d+\b/i.test(source.trim());
}

export function getActionTrackerSourceDetails(input: ActionTrackerSourceDetailsInput): ActionTrackerSourceDetails {
  const source = normalizeSourceDetailValue(input.source) ?? '';
  const reference = normalizeSourceDetailValue(input.originRecordLabel) ?? normalizeSourceDetailValue(input.originRecordId);
  const meetingDate = normalizeSourceDetailValue(input.meetingDate);
  const tierLevel = normalizeSourceDetailValue(input.tierLevel);
  const showTierLevel = Boolean(tierLevel) && !sourceIncludesTierContext(source);
  const showBackReference = Boolean(normalizeSourceDetailValue(input.originScreen));

  return {
    source,
    reference,
    meetingDate,
    tierLevel,
    showTierLevel,
    showBackReference,
    hasAdditionalDetails: Boolean(reference || meetingDate || showTierLevel || showBackReference),
  };
}
