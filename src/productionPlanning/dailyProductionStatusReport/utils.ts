import type {
  DailyProductionAuditEvent,
  DailyProductionKpi,
  DowntimeEvent,
  PerformanceStatusTone,
  ProductionLineLifecycleStatus,
  ProductionLineStatus,
  ProductionNote,
  ProductionTrendPoint,
  SeverityLevel,
  DailyProductionLineFilters,
} from './types';

function roundToOneDecimal(value: number) {
  return Number(value.toFixed(1));
}

function roundToWhole(value: number) {
  return Math.round(value);
}

function weightedAverage(
  lines: ProductionLineStatus[],
  selector: (line: ProductionLineStatus) => number | null,
) {
  const weighted = lines.reduce(
    (accumulator, line) => {
      const metric = selector(line);
      if (metric === null || line.planUnits <= 0) {
        return accumulator;
      }
      return {
        numerator: accumulator.numerator + metric * line.planUnits,
        denominator: accumulator.denominator + line.planUnits,
      };
    },
    {numerator: 0, denominator: 0},
  );

  if (weighted.denominator === 0) {
    return null;
  }

  return roundToOneDecimal(weighted.numerator / weighted.denominator);
}

export function calculateLineAchievementPercent(planUnits: number, actualUnits: number) {
  if (planUnits <= 0) {
    return null;
  }
  return roundToOneDecimal((actualUnits / planUnits) * 100);
}

export function calculateVarianceUnits(planUnits: number, actualUnits: number) {
  return actualUnits - planUnits;
}

export function deriveAchievementStatus(value: number | null): PerformanceStatusTone {
  if (value === null) {
    return 'gray';
  }
  if (value >= 90) {
    return 'green';
  }
  if (value >= 80) {
    return 'orange';
  }
  return 'red';
}

export function deriveOeeStatus(value: number | null): PerformanceStatusTone {
  if (value === null) {
    return 'gray';
  }
  if (value >= 90) {
    return 'green';
  }
  if (value >= 85) {
    return 'orange';
  }
  return 'red';
}

export function deriveQualityYieldStatus(value: number | null): PerformanceStatusTone {
  if (value === null) {
    return 'gray';
  }
  if (value >= 95) {
    return 'green';
  }
  if (value >= 90) {
    return 'orange';
  }
  return 'red';
}

export function deriveOnTimeStatus(value: number | null): PerformanceStatusTone {
  if (value === null) {
    return 'gray';
  }
  if (value >= 85) {
    return 'green';
  }
  if (value >= 75) {
    return 'orange';
  }
  return 'red';
}

export function deriveLineStatusSeverity(status: ProductionLineLifecycleStatus): PerformanceStatusTone {
  switch (status) {
    case 'Running':
      return 'green';
    case 'Complete':
      return 'blue';
    case 'Stopped':
      return 'red';
    case 'Maintenance':
      return 'orange';
    case 'PlannedDown':
      return 'orange';
    case 'Idle':
    default:
      return 'gray';
  }
}

export function calculateDailyProductionKpis(
  productionLineStatuses: ProductionLineStatus[],
  safetyIncidents = 0,
): DailyProductionKpi {
  const activeMetricLines = productionLineStatuses.filter((line) => line.status === 'Running' || line.status === 'Complete');
  const totalPlanUnits = productionLineStatuses.reduce((sum, line) => sum + line.planUnits, 0);
  const totalActualUnits = productionLineStatuses.reduce((sum, line) => sum + line.actualUnits, 0);
  const totalVarianceUnits = totalActualUnits - totalPlanUnits;
  const planAchievementPercent = totalPlanUnits > 0 ? roundToOneDecimal((totalActualUnits / totalPlanUnits) * 100) : 0;

  return {
    totalLines: productionLineStatuses.length,
    activeLines: activeMetricLines.length,
    stoppedLines: productionLineStatuses.filter((line) => line.status === 'Stopped').length,
    idleLines: productionLineStatuses.filter((line) => line.status === 'Idle').length,
    totalPlanUnits,
    totalActualUnits,
    totalVarianceUnits,
    planAchievementPercent,
    onTimeOrdersPercent: weightedAverage(activeMetricLines, (line) => line.ordersOnTimePercent),
    qualityYieldPercent: weightedAverage(activeMetricLines, (line) => line.qualityYieldPercent),
    totalDowntimeMinutes: productionLineStatuses.reduce((sum, line) => sum + line.downtimeMinutes, 0),
    safetyIncidents,
    oeePercent: weightedAverage(activeMetricLines, (line) => line.oeePercent),
  };
}

export function buildDowntimeSummary(downtimeEvents: DowntimeEvent[], limit = 5) {
  return [...downtimeEvents]
    .sort((left, right) => {
      if (right.durationMinutes !== left.durationMinutes) {
        return right.durationMinutes - left.durationMinutes;
      }
      return left.lineName.localeCompare(right.lineName);
    })
    .slice(0, limit);
}

export function buildKeyProductionNotes(
  productionLineStatuses: ProductionLineStatus[],
  downtimeEvents: DowntimeEvent[],
  kpis: DailyProductionKpi,
): ProductionNote[] {
  const notes: ProductionNote[] = [];
  const reportId = productionLineStatuses[0]?.reportId ?? 'daily-production-report';
  const createdAt = productionLineStatuses[0]?.lastUpdatedAt ?? new Date().toISOString();

  const line30 = productionLineStatuses.find((line) => line.lineName === 'Line 30');
  if (line30?.status === 'Stopped') {
    notes.push({
      id: 'generated-line30',
      reportId,
      category: 'Downtime',
      message: 'Line 30 is facing machine downtime. Maintenance team is working on it.',
      severity: 'Critical',
      createdBy: 'BLU.AI',
      createdAt,
    });
  }

  const line20 = productionLineStatuses.find((line) => line.lineName === 'Line 20');
  if (line20?.reasonForGap.toLowerCase().includes('material')) {
    notes.push({
      id: 'generated-line20',
      reportId,
      category: 'Material',
      message: 'Material cap component shortage affected Line 20.',
      severity: 'Warning',
      createdBy: 'BLU.AI',
      createdAt,
    });
  }

  const line80 = productionLineStatuses.find((line) => line.lineName === 'Line 80');
  if (line80 && line80.actualUnits > line80.planUnits) {
    notes.push({
      id: 'generated-line80',
      reportId,
      category: 'Production',
      message: 'Rework volume is higher due to issues on Line 30.',
      severity: 'Warning',
      createdBy: 'BLU.AI',
      createdAt,
    });
  }

  notes.push({
    id: 'generated-plan-achievement',
    reportId,
    category: 'Planning',
    message:
      kpis.planAchievementPercent >= 90
        ? 'Overall plan achievement is above target.'
        : 'Overall plan achievement is below target. Monitor remaining day recovery actions.',
    severity: kpis.planAchievementPercent >= 90 ? 'Info' : 'Warning',
    createdBy: 'BLU.AI',
    createdAt,
  });

  notes.push({
    id: 'generated-quality',
    reportId,
    category: 'Quality',
    message:
      (kpis.qualityYieldPercent ?? 0) >= 95
        ? 'Quality yield is within acceptable range.'
        : 'Quality yield is below the preferred target and should be monitored.',
    severity: (kpis.qualityYieldPercent ?? 0) >= 95 ? 'Info' : 'Warning',
    createdBy: 'BLU.AI',
    createdAt,
  });

  notes.push({
    id: 'generated-safety',
    reportId,
    category: 'Safety',
    message: kpis.safetyIncidents === 0 ? 'No safety incidents today.' : 'Safety incidents were reported today.',
    severity: kpis.safetyIncidents === 0 ? 'Info' : 'Critical',
    createdBy: 'BLU.AI',
    createdAt,
  });

  if (downtimeEvents.length === 0) {
    notes.push({
      id: 'generated-downtime-clear',
      reportId,
      category: 'Downtime',
      message: 'No downtime events were captured for the selected period.',
      severity: 'Info',
      createdBy: 'BLU.AI',
      createdAt,
    });
  }

  return notes;
}

export function buildProductionTrendData(productionLineStatuses: ProductionLineStatus[]): ProductionTrendPoint[] {
  return productionLineStatuses.map((line) => ({
    id: `${line.id}-trend`,
    lineId: line.lineId,
    lineName: line.lineName,
    planUnits: line.planUnits,
    actualUnits: line.actualUnits,
    achievementPercent: line.achievementPercent,
    oeePercent: line.oeePercent,
    qualityYieldPercent: line.qualityYieldPercent,
  }));
}

export function filterProductionLines(
  productionLineStatuses: ProductionLineStatus[],
  filters: DailyProductionLineFilters,
) {
  const search = filters.productSearch.trim().toLowerCase();
  return productionLineStatuses.filter((line) => {
    if (filters.status !== 'All' && line.status !== filters.status) {
      return false;
    }
    if (filters.lineId !== 'All' && line.lineId !== filters.lineId) {
      return false;
    }
    if (filters.showOnlyGaps && line.varianceUnits >= 0) {
      return false;
    }
    if (filters.showStoppedLinesOnly && line.status !== 'Stopped') {
      return false;
    }
    if (!search) {
      return true;
    }
    return [
      line.lineName,
      line.lineDescription,
      line.productCode,
      line.productDescription,
      line.campaign,
      line.reasonForGap,
    ].some((value) => value.toLowerCase().includes(search));
  });
}

export function createDailyProductionAuditEvent(params: {
  reportId: string;
  user: string;
  eventType: string;
  previousValue: string;
  newValue: string;
  comment: string;
  timestamp?: string;
}) {
  return {
    id: `AUD-DPSR-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    reportId: params.reportId,
    timestamp: params.timestamp ?? new Date().toISOString(),
    user: params.user,
    eventType: params.eventType,
    previousValue: params.previousValue,
    newValue: params.newValue,
    comment: params.comment,
  } satisfies DailyProductionAuditEvent;
}

export function enrichProductionLine(line: ProductionLineStatus): ProductionLineStatus {
  const achievementPercent = calculateLineAchievementPercent(line.planUnits, line.actualUnits);
  const varianceUnits = calculateVarianceUnits(line.planUnits, line.actualUnits);
  return {
    ...line,
    achievementPercent,
    varianceUnits,
  };
}

export function enrichProductionLines(lines: ProductionLineStatus[]) {
  return lines.map(enrichProductionLine);
}

export function formatUnits(value: number) {
  return new Intl.NumberFormat('en-US').format(value);
}

export function formatPercent(value: number | null) {
  if (value === null) {
    return '-';
  }
  return `${roundToOneDecimal(value).toFixed(1)}%`;
}

export function formatDeltaUnits(value: number) {
  const formatted = formatUnits(Math.abs(value));
  if (value > 0) {
    return `+${formatted}`;
  }
  if (value < 0) {
    return `-${formatted}`;
  }
  return '0';
}

export function formatCompactTimestamp(timestamp: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp));
}

export function formatTimeLabel(timestamp: string) {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(timestamp));
}

export function getSeverityColor(severity: SeverityLevel): PerformanceStatusTone {
  switch (severity) {
    case 'Critical':
      return 'red';
    case 'Warning':
      return 'orange';
    default:
      return 'blue';
  }
}

export function calculateTotalsRow(lines: ProductionLineStatus[]) {
  const totalPlanUnits = lines.reduce((sum, line) => sum + line.planUnits, 0);
  const totalActualUnits = lines.reduce((sum, line) => sum + line.actualUnits, 0);
  const totalVarianceUnits = totalActualUnits - totalPlanUnits;
  const achievementPercent = calculateLineAchievementPercent(totalPlanUnits, totalActualUnits);
  const oeePercent = weightedAverage(lines.filter((line) => line.status !== 'Idle'), (line) => line.oeePercent);
  const qualityYieldPercent = weightedAverage(lines.filter((line) => line.status !== 'Idle'), (line) => line.qualityYieldPercent);
  const ordersOnTimePercent = weightedAverage(lines.filter((line) => line.status !== 'Idle'), (line) => line.ordersOnTimePercent);
  const downtimeMinutes = lines.reduce((sum, line) => sum + line.downtimeMinutes, 0);

  return {
    totalPlanUnits,
    totalActualUnits,
    totalVarianceUnits,
    achievementPercent,
    oeePercent,
    qualityYieldPercent,
    ordersOnTimePercent,
    downtimeMinutes,
  };
}

export function deriveLineHealthSummary(line: ProductionLineStatus) {
  const tones = [
    deriveAchievementStatus(line.achievementPercent),
    deriveOeeStatus(line.oeePercent),
    deriveQualityYieldStatus(line.qualityYieldPercent),
    deriveOnTimeStatus(line.ordersOnTimePercent),
  ];
  if (tones.includes('red')) {
    return 'red' as const;
  }
  if (tones.includes('orange')) {
    return 'orange' as const;
  }
  if (tones.every((tone) => tone === 'gray')) {
    return 'gray' as const;
  }
  return 'green' as const;
}

export function summarizeDowntimeImpact(downtimeEvents: DowntimeEvent[]) {
  return downtimeEvents.reduce(
    (accumulator, event) => {
      accumulator.totalMinutes += event.durationMinutes;
      accumulator.totalImpactUnits += event.impactUnits ?? 0;
      return accumulator;
    },
    {totalMinutes: 0, totalImpactUnits: 0},
  );
}

export function createTimestampOffset(baseIso: string, minutesOffset: number) {
  const next = new Date(baseIso);
  next.setMinutes(next.getMinutes() + minutesOffset);
  return next.toISOString();
}
