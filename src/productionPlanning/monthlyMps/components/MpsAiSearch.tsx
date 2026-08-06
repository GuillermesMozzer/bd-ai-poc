import {AutoAwesome as AutoAwesomeIcon, Clear as ClearIcon, Search as SearchIcon} from '@mui/icons-material';
import {Box, Chip, IconButton, InputAdornment, Stack, TextField, Typography} from '@mui/material';
import type {MpsVersion} from '../types';

export type MpsAiFilter = {
  query: string;
  interpretations: string[];
  apply: (v: MpsVersion) => boolean;
};

const SUGGESTIONS = [
  'Show pending approvals',
  'Approved baselines',
  'Rejected versions',
  'SAP imports',
  'Line 1 impacted',
  'June cycle',
];

export function parseMpsAiQuery(query: string): MpsAiFilter {
  const q = query.trim();
  if (!q) return {query: q, interpretations: [], apply: () => true};

  const ql = q.toLowerCase();
  const interpretations: string[] = [];
  const checks: ((v: MpsVersion) => boolean)[] = [];

  // Approval status
  if (/reject/i.test(ql)) {
    checks.push((v) => v.approvalStatus === 'Rejected');
    interpretations.push('Status: Rejected');
  } else if (/pending|waiting|await/i.test(ql)) {
    checks.push((v) => v.approvalStatus === 'Pending Approval');
    interpretations.push('Status: Pending Approval');
  } else if (/\bapproved\b/i.test(ql)) {
    checks.push((v) => v.approvalStatus === 'Approved');
    interpretations.push('Status: Approved');
  } else if (/\bdraft\b/i.test(ql)) {
    checks.push((v) => v.approvalStatus === 'Draft');
    interpretations.push('Status: Draft');
  }

  // Baseline flag
  if (/\bbaseline\b/i.test(ql)) {
    checks.push((v) => v.isApprovedBaseline);
    interpretations.push('Baseline: Yes');
  }

  // Cycle
  if (/\b(march|mar)\b/i.test(ql)) {
    checks.push((v) => v.cycleId === 'MPS-CYCLE-2025-03');
    interpretations.push('Cycle: March 2025');
  } else if (/\b(june|jun)\b/i.test(ql)) {
    checks.push((v) => v.cycleId === 'MPS-CYCLE-2025-06');
    interpretations.push('Cycle: June 2025');
  } else if (/\b(sep|sept|september)\b/i.test(ql)) {
    checks.push((v) => v.cycleId === 'MPS-CYCLE-2025-09');
    interpretations.push('Cycle: September 2025');
  }

  // Lines
  const lineHits = [...ql.matchAll(/line\s*(\d)/gi)];
  if (lineHits.length) {
    const lines = lineHits.map((m) => `Line ${m[1]}`);
    checks.push((v) => lines.some((l) => v.impactedLines.includes(l)));
    interpretations.push(`Line: ${lines.join(', ')}`);
  }

  // Materials
  const matHits = [...ql.matchAll(/mat[-\s]?(\d+)/gi)];
  if (matHits.length) {
    const mats = matHits.map((m) => `MAT-${m[1].padStart(4, '0').toUpperCase()}`);
    checks.push((v) => mats.some((m) => v.impactedMaterials.some((vm) => vm.toUpperCase() === m)));
    interpretations.push(`Material: ${mats.join(', ')}`);
  }

  // Work orders
  const woHits = [...ql.matchAll(/wo[-\s]?(\d+)/gi)];
  if (woHits.length) {
    const wos = woHits.map((m) => `WO-${m[1]}`);
    checks.push((v) => wos.some((w) => v.impactedWOs.includes(w)));
    interpretations.push(`WO: ${wos.join(', ')}`);
  }

  // Actors
  if (/\bmaya\b/i.test(ql)) {
    checks.push((v) => v.importedBy.toLowerCase().includes('maya') || (v.approvedBy?.toLowerCase().includes('maya') ?? false));
    interpretations.push('Actor: Maya Planner');
  } else if (/\bana\b/i.test(ql)) {
    checks.push((v) => v.importedBy.toLowerCase().includes('ana') || (v.approvedBy?.toLowerCase().includes('ana') ?? false));
    interpretations.push('Actor: Ana Forecast Analyst');
  } else if (/\bcarlos\b/i.test(ql)) {
    checks.push((v) => v.importedBy.toLowerCase().includes('carlos') || (v.approvedBy?.toLowerCase().includes('carlos') ?? false));
    interpretations.push('Actor: Carlos Ops Manager');
  }

  // Source system
  if (/\bsap\b/i.test(ql)) {
    checks.push((v) => v.sourceSystem.toLowerCase().includes('sap'));
    interpretations.push('Source: SAP');
  } else if (/\bexcel\b/i.test(ql)) {
    checks.push((v) => v.sourceSystem.toLowerCase().includes('excel'));
    interpretations.push('Source: Excel');
  } else if (/\bscm\b/i.test(ql)) {
    checks.push((v) => v.sourceSystem.toLowerCase().includes('scm'));
    interpretations.push('Source: SCM');
  }

  // Fallback: broad text match
  if (!checks.length) {
    checks.push((v) =>
      v.id.toLowerCase().includes(ql) ||
      v.planningCycle.toLowerCase().includes(ql) ||
      v.sourceSystem.toLowerCase().includes(ql) ||
      v.importedBy.toLowerCase().includes(ql) ||
      v.changeReason.toLowerCase().includes(ql) ||
      v.impactedMaterials.some((m) => m.toLowerCase().includes(ql)) ||
      v.impactedWOs.some((w) => w.toLowerCase().includes(ql)) ||
      v.impactedLines.some((l) => l.toLowerCase().includes(ql))
    );
    interpretations.push(`Text: "${q}"`);
  }

  return {
    query: q,
    interpretations,
    apply: (v) => checks.every((fn) => fn(v)),
  };
}

