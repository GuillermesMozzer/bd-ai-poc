import { monitoringCards, type Severity } from '../../data/cbmMonitoringData';
import type { PlannerAiRiskSignal, PlannerAiSeverity } from '../types';

function mapSeverity(severity: Severity): PlannerAiSeverity {
  switch (severity) {
    case 'critical':
      return 'critical';
    case 'mediumCritical':
      return 'high';
    case 'lessCritical':
      return 'medium';
    default:
      return 'low';
  }
}

export function getPlannerAiRiskSignals(): PlannerAiRiskSignal[] {
  return monitoringCards.map((card) => ({
    id: card.id,
    asset: card.asset,
    severity: mapSeverity(card.severity),
    healthScore: card.healthScore,
    daysToFailure: card.daysToFailure,
    recommendation: card.recommended,
    area: card.area,
    trend: card.trend,
    metric: card.metric,
    currentReading: card.currentReading,
    warningThreshold: card.warningThreshold,
    criticalThreshold: card.criticalThreshold,
  }));
}
