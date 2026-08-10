/**
 * Capacity Contracts — Inside Logistics backbone (IN01–OB03).
 * Directed Movement / Assisted Decision / Inspect & Disposition.
 */

export type CapacityContractCode = 'MD' | 'DA' | 'ID';

export type AutonomyLevel = 'N1_HUMAN_GATE' | 'N2_ASSISTED' | 'N3_AUTO';

export interface CapacityContractDefinition {
  code: CapacityContractCode;
  name: string;
  namePt: string;
  engineeringRigor: string;
  description: string;
  /** Regulatory ceiling: ID disposition release is permanently N1. */
  maxAutonomy: AutonomyLevel;
}

export const CAPACITY_CONTRACTS: Record<CapacityContractCode, CapacityContractDefinition> = {
  MD: {
    code: 'MD',
    name: 'Directed Movement',
    namePt: 'Movimento Dirigido',
    engineeringRigor: 'Idempotency',
    description:
      'Move a physical unit (pallet/box) from origin to destination. Confirming the same task twice must not double-move stock. Confirmation is a state transition anchored on immutable keys (idempotency_key / LP).',
    maxAutonomy: 'N2_ASSISTED',
  },
  DA: {
    code: 'DA',
    name: 'Assisted Decision',
    namePt: 'Decisão Assistida',
    engineeringRigor: 'Autonomy Threshold',
    description:
      'Engine calculates prioritization, sequencing, and routing; humans govern with auditable overrides. Quarantine / quality blocks must never be auto-overridden.',
    maxAutonomy: 'N2_ASSISTED',
  },
  ID: {
    code: 'ID',
    name: 'Inspect & Disposition',
    namePt: 'Inspeção e Disposição',
    engineeringRigor: 'Regulatory Ceiling (FDA 21 CFR Part 11)',
    description:
      'Collect physical evidence and issue quarantine verdicts (Approve / Hold / Reject). Commercial release disposition must NEVER be automatic (N3). Evidence can be N2; release gate remains N1 by design.',
    maxAutonomy: 'N1_HUMAN_GATE',
  },
};
