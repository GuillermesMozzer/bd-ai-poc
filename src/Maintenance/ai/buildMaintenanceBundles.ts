import { inferPlannerLineFromAsset, inferPlannerZoneFromAsset } from './buildPlannerAiSnapshot';
import type { PlannerAiMaintenanceBundle, PlannerAiPlanAction } from './types';

function getActionLine(action: PlannerAiPlanAction) {
  return 'line' in action && action.line ? action.line : inferPlannerLineFromAsset(action.asset);
}

function getActionZone(action: PlannerAiPlanAction) {
  return 'zone' in action && action.zone ? action.zone : inferPlannerZoneFromAsset(action.asset);
}

function getActionDay(action: PlannerAiPlanAction) {
  if ('recommendedDay' in action) {
    return action.recommendedDay;
  }
  return undefined;
}

function getActionShift(action: PlannerAiPlanAction) {
  if ('recommendedShift' in action) {
    return action.recommendedShift;
  }
  return undefined;
}

function getCrewLabel(action: PlannerAiPlanAction) {
  if (action.workOrderLabel.startsWith('CM-') || action.title.toLowerCase().includes('corrective')) {
    return 'Mechanical crew';
  }
  if (/electrical|automation|drive/i.test(action.asset)) {
    return 'Electrical crew';
  }
  return 'Mechanical crew';
}

function getLotoZone(action: PlannerAiPlanAction) {
  return getActionZone(action);
}

function getPartsCrib(action: PlannerAiPlanAction) {
  const zone = getActionZone(action);
  if (zone === 'Utilities') {
    return 'Crib B';
  }
  if (zone === 'Packaging') {
    return 'Crib C';
  }
  return 'Crib A';
}

function buildBundleFromGroup(
  key: string,
  groupedActions: PlannerAiPlanAction[],
  index: number,
  constraintType: PlannerAiMaintenanceBundle['constraintType'],
  constraintLabel: string,
  namePrefix: string,
): PlannerAiMaintenanceBundle {
  const zone = getActionZone(groupedActions[0]);
  const line = getActionLine(groupedActions[0]);
  const durationHours = groupedActions.reduce((total, action) => {
    if ('durationLabel' in action && action.durationLabel) {
      const hours = Number(action.durationLabel.match(/(\d+(?:\.\d+)?)/)?.[1] ?? '1');
      return total + hours;
    }
    return total + 1.5;
  }, 0);
  const timeSavedHours = Math.max(1, Math.round(groupedActions.length * 0.75));
  const riskLevel = groupedActions.some((action) => action.executionReadiness === 'blocker')
    ? 'high'
    : groupedActions.some((action) => action.executionReadiness === 'warning')
      ? 'medium'
      : 'low';

  return {
    id: `bundle-${constraintType}-${index + 1}`,
    name: `${namePrefix} ${index + 1}`,
    summary: `${groupedActions.length} actions share ${constraintLabel.toLowerCase()} and can be reviewed as one coordinated package.`,
    constraint: constraintLabel,
    constraintType,
    actionIds: groupedActions.map((action) => action.id),
    workOrderLabels: groupedActions.map((action) => action.workOrderLabel),
    line,
    zone,
    lotoZone: constraintType === 'loto-zone' ? getLotoZone(groupedActions[0]) : zone,
    crewLabel: constraintType === 'crew' ? getCrewLabel(groupedActions[0]) : getCrewLabel(groupedActions[0]),
    timeSaved: `${timeSavedHours}h saved`,
    productionImpact: `${Math.max(1, Math.round(durationHours * 0.35))} fewer stop-start windows`,
    riskLevel,
    riskOfBundling: riskLevel,
  };
}

function groupActions(actions: PlannerAiPlanAction[], keyFn: (action: PlannerAiPlanAction) => string) {
  const grouped = new Map<string, PlannerAiPlanAction[]>();
  actions.forEach((action) => {
    const key = keyFn(action);
    const current = grouped.get(key) ?? [];
    current.push(action);
    grouped.set(key, current);
  });
  return grouped;
}

export function buildMaintenanceBundles(actions: PlannerAiPlanAction[]): PlannerAiMaintenanceBundle[] {
  const bundles: PlannerAiMaintenanceBundle[] = [];
  const usedActionIds = new Set<string>();

  const lotoGroups = groupActions(actions, (action) => `loto__${getLotoZone(action)}`);
  [...lotoGroups.entries()]
    .filter(([, groupedActions]) => groupedActions.length > 1)
    .forEach(([, groupedActions], index) => {
      bundles.push(
        buildBundleFromGroup(
          `loto-${index}`,
          groupedActions,
          index,
          'loto-zone',
          `Same LOTO area (${getLotoZone(groupedActions[0])})`,
          `${getLotoZone(groupedActions[0])} LOTO package`,
        ),
      );
      groupedActions.forEach((action) => usedActionIds.add(action.id));
    });

  const crewGroups = groupActions(
    actions.filter((action) => !usedActionIds.has(action.id)),
    (action) => `crew__${getCrewLabel(action)}__${getActionZone(action)}`,
  );
  [...crewGroups.entries()]
    .filter(([, groupedActions]) => groupedActions.length > 1)
    .forEach(([, groupedActions], index) => {
      bundles.push(
        buildBundleFromGroup(
          `crew-${index}`,
          groupedActions,
          index,
          'crew',
          `Same crew (${getCrewLabel(groupedActions[0])})`,
          `${getCrewLabel(groupedActions[0])} bundle`,
        ),
      );
      groupedActions.forEach((action) => usedActionIds.add(action.id));
    });

  const cribGroups = groupActions(
    actions.filter((action) => !usedActionIds.has(action.id)),
    (action) => `crib__${getPartsCrib(action)}`,
  );
  [...cribGroups.entries()]
    .filter(([, groupedActions]) => groupedActions.length > 1)
    .forEach(([, groupedActions], index) => {
      bundles.push(
        buildBundleFromGroup(
          `crib-${index}`,
          groupedActions,
          index,
          'parts-crib',
          `Same parts crib (${getPartsCrib(groupedActions[0])})`,
          `${getPartsCrib(groupedActions[0])} kit bundle`,
        ),
      );
      groupedActions.forEach((action) => usedActionIds.add(action.id));
    });

  const downtimeGroups = groupActions(
    actions.filter((action) => !usedActionIds.has(action.id)),
    (action) => `window__${getActionDay(action) ?? 'review'}__${getActionShift(action) ?? 'review'}`,
  );
  [...downtimeGroups.entries()]
    .filter(([, groupedActions]) => groupedActions.length > 1)
    .forEach(([, groupedActions], index) => {
      const day = getActionDay(groupedActions[0]);
      const shift = getActionShift(groupedActions[0]);
      bundles.push(
        buildBundleFromGroup(
          `window-${index}`,
          groupedActions,
          index,
          'shared-downtime',
          `Shared downtime window (${shift === 'night' ? 'Night' : 'Day'} · Day ${day !== undefined ? day + 1 : 'review'})`,
          `${getActionZone(groupedActions[0])} shutdown package`,
        ),
      );
    });

  return bundles;
}
