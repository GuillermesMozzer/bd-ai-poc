import { getPlannerAiRiskSignals } from './adapters/cbmAdapter';
import { getFollowUpPlanningSnapshot } from './adapters/followUpAdapter';
import { getPartsReadinessForAsset } from './adapters/sparePartsAdapter';
import { plannerStaffSkillMatrix } from '../data/plannerStaffSkills';
import { enrichCoverageSummary } from './buildCoverageGapAnalysis';
import type {
  PlannerAiCalendarCardInput,
  PlannerAiCoverageCell,
  PlannerAiCoverageRecommendation,
  PlannerAiCoverageSummary,
  PlannerAiPlannerSnapshot,
  PlannerAiPlannerSnapshotAsset,
  PlannerAiPlanningItemInput,
  PlannerAiRiskSignal,
  PlannerAiShift,
  PlannerAiSourceKind,
  PlannerAiWorkItem,
} from './types';

const coverageZones = ['Zone 1', 'Zone 2', 'Packaging', 'Utilities'] as const;
const coverageCategories = ['Mechanical', 'Electrical & Automation', 'Reliability & Maintenance', 'Safety'] as const;

function severityWeight(signal: PlannerAiRiskSignal) {
  switch (signal.severity) {
    case 'critical':
      return 4;
    case 'high':
      return 3;
    case 'medium':
      return 2;
    default:
      return 1;
  }
}

function getHighestPrioritySignalByAsset(signals: PlannerAiRiskSignal[]) {
  const map = new Map<string, PlannerAiRiskSignal>();
  signals.forEach((signal) => {
    const current = map.get(signal.asset);
    if (!current) {
      map.set(signal.asset, signal);
      return;
    }

    const currentWeight = severityWeight(current) * 100 - current.healthScore;
    const nextWeight = severityWeight(signal) * 100 - signal.healthScore;
    if (nextWeight > currentWeight) {
      map.set(signal.asset, signal);
    }
  });
  return map;
}

function parseDurationHours(durationLabel: string) {
  const hoursMatch = durationLabel.match(/(\d+(?:\.\d+)?)\s*h/i);
  const minutesMatch = durationLabel.match(/(\d+)\s*min/i);
  const hours = hoursMatch ? Number(hoursMatch[1]) : 0;
  const minutes = minutesMatch ? Number(minutesMatch[1]) : 0;
  const parsed = hours + minutes / 60;
  return parsed > 0 ? parsed : 1;
}

export function inferPlannerZoneFromAsset(asset: string) {
  if (/packaging|labeler|conveyor/i.test(asset)) {
    return 'Packaging';
  }

  if (/boiler|compressor|pump|utilities/i.test(asset)) {
    return 'Utilities';
  }

  if (/extrusion|robot/i.test(asset)) {
    return 'Zone 2';
  }

  return 'Zone 1';
}

export function inferPlannerLineFromAsset(asset: string) {
  if (/boiler|compressor|pump|utilities/i.test(asset)) {
    return 'Utilities';
  }

  if (/labeler|packaging/i.test(asset)) {
    return 'Line 4';
  }

  if (/extrusion|conveyor/i.test(asset)) {
    return 'Line 1';
  }

  if (/assembly|filler/i.test(asset)) {
    return 'Line 2';
  }

  if (/robot/i.test(asset)) {
    return 'Line 3';
  }

  if (/molding/i.test(asset)) {
    return 'Line 10';
  }

  return 'Line review';
}

function splitTechnicianNames(value?: string) {
  if (!value) {
    return [];
  }

  return value
    .split(' + ')
    .map((item) => item.trim())
    .filter(Boolean);
}

function toSnapshotAssetFromCard(
  card: PlannerAiCalendarCardInput,
  riskByAsset: Map<string, PlannerAiRiskSignal>,
): PlannerAiPlannerSnapshotAsset {
  return {
    id: card.id,
    asset: card.title,
    line: inferPlannerLineFromAsset(card.title),
    zone: inferPlannerZoneFromAsset(card.title),
    sourceKind: 'planner-card',
    workOrderLabel: card.workOrder,
    workType: card.type,
    priorityLabel: card.priority,
    durationHours: parseDurationHours(card.duration),
    assigneeName: card.assignee.name,
    day: card.day,
    shift: card.shift,
    partsReadiness: getPartsReadinessForAsset(card.title),
    riskSignal: riskByAsset.get(card.title),
  };
}

function toSnapshotAssetFromPlanningItem(
  item: PlannerAiPlanningItemInput,
  riskByAsset: Map<string, PlannerAiRiskSignal>,
): PlannerAiPlannerSnapshotAsset {
  return {
    id: item.wo,
    asset: item.asset,
    line: item.line,
    zone: item.zone,
    sourceKind: 'planning-queue',
    workOrderLabel: item.wo,
    workType: item.type,
    priorityLabel: item.priority,
    durationHours: parseDurationHours(item.duration),
    recommendedTechnician: item.suggestedTechnician,
    partsReadiness: getPartsReadinessForAsset(item.asset),
    riskSignal: riskByAsset.get(item.asset),
  };
}

function toSnapshotAssetFromFollowUpItem(
  item: PlannerAiWorkItem,
  sourceKind: PlannerAiSourceKind,
  riskByAsset: Map<string, PlannerAiRiskSignal>,
): PlannerAiPlannerSnapshotAsset {
  const zone = item.zone ?? inferPlannerZoneFromAsset(item.asset);
  return {
    id: item.id,
    asset: item.asset,
    line: item.line ?? inferPlannerLineFromAsset(item.asset),
    zone,
    sourceKind,
    workOrderLabel: item.workOrderLabel,
    workType: item.workType,
    priorityLabel: item.priorityLabel,
    durationHours: item.durationHours,
    assigneeName: item.assigneeName,
    partsReadiness: getPartsReadinessForAsset(item.asset, item.tags),
    riskSignal: riskByAsset.get(item.asset),
  };
}

function buildCoverageSummary(
  cards: PlannerAiCalendarCardInput[],
  planningItems: PlannerAiPlanningItemInput[],
): PlannerAiCoverageSummary {
  const techniciansByZoneCategory = new Map<string, Set<string>>();

  const registerTechnician = (technicianName: string, zone: string) => {
    const skillCategories = plannerStaffSkillMatrix[technicianName] ?? [];
    skillCategories.forEach((category) => {
      const key = `${zone}__${category.category}`;
      const current = techniciansByZoneCategory.get(key) ?? new Set<string>();
      current.add(technicianName);
      techniciansByZoneCategory.set(key, current);
    });
  };

  cards.forEach((card) => {
    splitTechnicianNames(card.assignee.name).forEach((name) =>
      registerTechnician(name, inferPlannerZoneFromAsset(card.title)),
    );
  });

  planningItems.forEach((item) => {
    registerTechnician(item.suggestedTechnician, item.zone);
  });

  const cells: PlannerAiCoverageCell[] = [];
  const shifts: PlannerAiShift[] = ['day', 'night'];

  coverageZones.forEach((zone) => {
    coverageCategories.forEach((category) => {
      shifts.forEach((shift) => {
        const baseTechnicians = [...(techniciansByZoneCategory.get(`${zone}__${category}`) ?? new Set<string>())];
        const shiftTechnicians = [
          ...new Set(
            [
              ...baseTechnicians,
              ...cards
                .filter((card) => card.shift === shift && inferPlannerZoneFromAsset(card.title) === zone)
                .flatMap((card) => splitTechnicianNames(card.assignee.name)),
            ].filter(Boolean),
          ),
        ].sort();
        const technicianCount = shiftTechnicians.length;
        const status =
          technicianCount >= 3 ? 'healthy' : technicianCount === 2 ? 'thin' : 'critical';
        cells.push({
          id: `${zone}__${category}__${shift}`,
          zone,
          category,
          shift,
          technicianCount,
          status,
          technicianNames: shiftTechnicians,
        });
      });
    });
  });

  const weightedScore = cells.reduce((total, cell) => {
    if (cell.status === 'healthy') {
      return total + 100;
    }
    if (cell.status === 'thin') {
      return total + 70;
    }
    return total + 35;
  }, 0);
  const constrainedZones = coverageZones.filter((zone) =>
    cells.some((cell) => cell.zone === zone && cell.status !== 'healthy'),
  );

  return enrichCoverageSummary({
    coverageScore: Math.round(weightedScore / Math.max(1, cells.length)),
    zones: [...coverageZones],
    categories: [...coverageCategories],
    cells,
    constrainedZones,
    recommendations: [],
  });
}

function buildFollowUpBacklogSummary(followUpSnapshot: ReturnType<typeof getFollowUpPlanningSnapshot>) {
  const highlightItems = [
    ...followUpSnapshot.requests.map((item) => ({
      id: item.id,
      asset: item.asset,
      workOrderLabel: item.workOrderLabel,
      laneLabel: 'Request',
      priorityLabel: item.priorityLabel,
      statusLabel: item.statusLabel,
      summary: item.summary,
      tags: item.tags,
    })),
    ...followUpSnapshot.planning.map((item) => ({
      id: item.id,
      asset: item.asset,
      workOrderLabel: item.workOrderLabel,
      laneLabel: 'Planning',
      priorityLabel: item.priorityLabel,
      statusLabel: item.statusLabel,
      summary: item.summary,
      tags: item.tags,
    })),
    ...followUpSnapshot.blockedScheduled.map((item) => ({
      id: item.id,
      asset: item.asset,
      workOrderLabel: item.workOrderLabel,
      laneLabel: 'Blocked · Scheduled',
      priorityLabel: item.priorityLabel,
      statusLabel: item.statusLabel,
      summary: item.summary,
      tags: item.tags,
    })),
  ].slice(0, 5);

  return {
    openRequestCount: followUpSnapshot.requests.length,
    planningLaneCount: followUpSnapshot.planning.length,
    scheduledCount: followUpSnapshot.scheduled.length,
    inProgressCount: followUpSnapshot.inProgress.length,
    blockedByPartsCount: followUpSnapshot.blockedScheduled.length,
    highlightItems,
  };
}

export function buildPlannerAiSnapshot({
  cards,
  planningItems,
}: {
  cards: PlannerAiCalendarCardInput[];
  planningItems: PlannerAiPlanningItemInput[];
}): PlannerAiPlannerSnapshot {
  const riskSignals = getPlannerAiRiskSignals();
  const riskByAsset = getHighestPrioritySignalByAsset(riskSignals);
  const followUpSnapshot = getFollowUpPlanningSnapshot();
  const assets: PlannerAiPlannerSnapshotAsset[] = [
    ...cards.map((card) => toSnapshotAssetFromCard(card, riskByAsset)),
    ...planningItems.map((item) => toSnapshotAssetFromPlanningItem(item, riskByAsset)),
    ...followUpSnapshot.requests.map((item) => toSnapshotAssetFromFollowUpItem(item, 'follow-up-request', riskByAsset)),
    ...followUpSnapshot.planning.map((item) => toSnapshotAssetFromFollowUpItem(item, 'follow-up-planning', riskByAsset)),
    ...followUpSnapshot.scheduled.map((item) => toSnapshotAssetFromFollowUpItem(item, 'follow-up-scheduled', riskByAsset)),
    ...followUpSnapshot.inProgress.map((item) => toSnapshotAssetFromFollowUpItem(item, 'follow-up-progress', riskByAsset)),
  ];

  const partsReadiness = assets.map((asset) => asset.partsReadiness);
  const blockers = partsReadiness.filter((readiness) => readiness.status === 'blocked' || readiness.status === 'risk');
  const criticalSignals = riskSignals
    .filter((signal) => signal.severity === 'critical' || signal.severity === 'high')
    .sort((left, right) => left.daysToFailure - right.daysToFailure)
    .slice(0, 3);

  return {
    id: `planner-snapshot-${cards.length}-${planningItems.length}-${followUpSnapshot.requests.length}`,
    generatedAt: new Date().toLocaleString(),
    cards,
    planningItems,
    followUpSnapshot,
    followUpBacklogSummary: buildFollowUpBacklogSummary(followUpSnapshot),
    riskSignals,
    partsReadiness,
    assets,
    baseline: {
      riskScore: 72 + criticalSignals.length * 2,
      pmCompliance: 78,
      plannedDowntimeHours: 18.5,
      partsReadiness: Math.max(52, 72 - blockers.length * 6),
      openBacklog: planningItems.length + followUpSnapshot.planning.length + followUpSnapshot.requests.length + blockers.length,
    },
    coverageSummary: buildCoverageSummary(cards, planningItems),
  };
}

export function formatPlannerAiShiftLabel(shift: PlannerAiShift) {
  return shift === 'day' ? 'Day shift' : 'Night shift';
}
