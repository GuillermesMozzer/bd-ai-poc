import {AutoAwesome as AutoAwesomeIcon, Clear as ClearIcon, Search as SearchIcon} from '@mui/icons-material';
import {Box, Chip, IconButton, InputAdornment, Stack, TextField, Typography} from '@mui/material';
import type {MrpVersion} from '../types';

export type MrpAiFilter = {
  query: string;
  interpretations: string[];
  apply: (v: MrpVersion) => boolean;
};

const SUGGESTIONS = [
  'Official MRPs',
  'Simulation runs',
  'Pending approval',
  'Approved baselines',
  'Line 1 impacted',
  'June cycle',
];

export function parseMrpAiQuery(query: string): MrpAiFilter {
  const q = query.trim();
  if (!q) return {query: q, interpretations: [], apply: () => true};

  const ql = q.toLowerCase();
  const interpretations: string[] = [];
  const checks: ((v: MrpVersion) => boolean)[] = [];

  // MRP type
  if (/\bofficial\b/i.test(ql)) {
    checks.push((v) => v.mrpType === 'Official');
    interpretations.push('Type: Official');
  } else if (/\bsimulation|sim\b/i.test(ql)) {
    checks.push((v) => v.mrpType === 'Simulation');
    interpretations.push('Type: Simulation');
  }

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
    checks.push((v) => v.cycleId === 'MRP-CYCLE-2025-03');
    interpretations.push('Cycle: March 2025');
  } else if (/\b(june|jun)\b/i.test(ql)) {
    checks.push((v) => v.cycleId === 'MRP-CYCLE-2025-06');
    interpretations.push('Cycle: June 2025');
  }

  // Parent MPS
  const mpsHits = [...ql.matchAll(/mps[-\s]?(\S+)/gi)];
  if (mpsHits.length) {
    const mpsIds = mpsHits.map((m) => `MPS-${m[1].toUpperCase()}`);
    checks.push((v) => mpsIds.some((id) => v.parentMpsVersionId.toUpperCase() === id));
    interpretations.push(`Parent MPS: ${mpsIds.join(', ')}`);
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
    checks.push((v) => v.generatedBy.toLowerCase().includes('maya') || (v.approvedBy?.toLowerCase().includes('maya') ?? false));
    interpretations.push('Actor: Maya Planner');
  } else if (/\bana\b/i.test(ql)) {
    checks.push((v) => v.generatedBy.toLowerCase().includes('ana') || (v.approvedBy?.toLowerCase().includes('ana') ?? false));
    interpretations.push('Actor: Ana Forecast Analyst');
  } else if (/\bcarlos\b/i.test(ql)) {
    checks.push((v) => v.generatedBy.toLowerCase().includes('carlos') || (v.approvedBy?.toLowerCase().includes('carlos') ?? false));
    interpretations.push('Actor: Carlos Ops Manager');
  }

  // Fallback: broad text match
  if (!checks.length) {
    checks.push((v) =>
      v.id.toLowerCase().includes(ql) ||
      v.planningCycle.toLowerCase().includes(ql) ||
      v.generatedBy.toLowerCase().includes(ql) ||
      v.changeReason.toLowerCase().includes(ql) ||
      v.parentMpsVersionId.toLowerCase().includes(ql) ||
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

interface MrpAiSearchProps {
  value: string;
  onChange: (v: string) => void;
  resultCount: number;
  totalCount: number;
}

export default function MrpAiSearch({value, onChange, resultCount, totalCount}: MrpAiSearchProps) {
  const parsed = parseMrpAiQuery(value);
  const hasQuery = value.trim().length > 0;
  const isFiltered = hasQuery && resultCount < totalCount;

  return (
    <Box
      sx={{
        borderRadius: 4,
        border: '1.5px solid',
        borderColor: hasQuery ? '#818CF8' : 'rgba(148,163,184,0.3)',
        bgcolor: 'var(--planning-surface)',
        boxShadow: hasQuery
          ? '0 0 0 3px rgba(99,102,241,0.10), 0 4px 16px rgba(99,102,241,0.08)'
          : '0 4px 12px rgba(15,23,42,0.04)',
        p: 1.5,
        transition: 'all 0.2s ease',
      }}
    >
      <Stack direction="row" alignItems="center" gap={0.8} mb={1}>
        <AutoAwesomeIcon sx={{fontSize: 14, color: '#818CF8'}} />
        <Typography sx={{fontSize: 11, fontWeight: 800, color: '#818CF8', letterSpacing: '0.06em', textTransform: 'uppercase'}}>
          AI Search
        </Typography>
        {isFiltered && (
          <Typography sx={{fontSize: 11, color: 'var(--planning-text-muted)', ml: 'auto'}}>
            {resultCount} of {totalCount} versions
          </Typography>
        )}
      </Stack>

      <TextField
        fullWidth
        size="small"
        placeholder='e.g. "official MRPs" · "simulation runs" · "pending approval"'
        value={value}
        onChange={(e) => onChange(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{fontSize: 18, color: hasQuery ? '#818CF8' : '#94A3B8'}} />
            </InputAdornment>
          ),
          endAdornment: hasQuery ? (
            <InputAdornment position="end">
              <IconButton size="small" onClick={() => onChange('')} sx={{color: 'var(--planning-text-muted)'}}>
                <ClearIcon sx={{fontSize: 16}} />
              </IconButton>
            </InputAdornment>
          ) : null,
          sx: {
            fontSize: 13,
            '& fieldset': {border: 'none'},
            bgcolor: 'var(--planning-surface-muted)',
            borderRadius: 2,
          },
        }}
      />

      {!hasQuery && (
        <Stack direction="row" flexWrap="wrap" gap={0.8} mt={1}>
          {SUGGESTIONS.map((s) => (
            <Chip
              key={s}
              label={s}
              size="small"
              onClick={() => onChange(s)}
              sx={{
                fontSize: 11,
                height: 22,
                bgcolor: 'var(--planning-surface-muted)',
                color: 'var(--planning-text-secondary)',
                fontWeight: 500,
                cursor: 'pointer',
                '&:hover': {bgcolor: '#E0E7FF', color: '#4338CA'},
                transition: 'all 0.15s',
              }}
            />
          ))}
        </Stack>
      )}

      {hasQuery && parsed.interpretations.length > 0 && (
        <Stack direction="row" flexWrap="wrap" gap={0.8} mt={1} alignItems="center">
          <Typography sx={{fontSize: 11, color: 'var(--planning-text-muted)', mr: 0.5}}>Understood:</Typography>
          {parsed.interpretations.map((interp) => (
            <Chip
              key={interp}
              label={interp}
              size="small"
              icon={<AutoAwesomeIcon style={{fontSize: 11, color: '#818CF8'}} />}
              sx={{
                fontSize: 11,
                height: 22,
                bgcolor: 'var(--planning-ai-accent-bg)',
                color: '#4338CA',
                fontWeight: 700,
                border: '1px solid #C7D2FE',
              }}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
}
