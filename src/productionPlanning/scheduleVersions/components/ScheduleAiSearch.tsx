import {AutoAwesome as AutoAwesomeIcon, Clear as ClearIcon, Search as SearchIcon} from '@mui/icons-material';
import {Box, Chip, IconButton, InputAdornment, Stack, TextField, Typography} from '@mui/material';
import type {ScheduleVersion} from '../types';

export type ScheduleAiFilter = {
  query: string;
  interpretations: string[];
  apply: (v: ScheduleVersion) => boolean;
};

const SUGGESTIONS = [
  'Show frozen baselines',
  'Pending approval',
  'Draft versions',
  'Simulation',
  'June cycle',
  'Line 2 impacted',
];

export function parseScheduleAiQuery(query: string): ScheduleAiFilter {
  const q = query.trim();
  if (!q) return {query: q, interpretations: [], apply: () => true};

  const ql = q.toLowerCase();
  const interpretations: string[] = [];
  const checks: ((v: ScheduleVersion) => boolean)[] = [];

  // Status
  if (/\bfrozen\b/i.test(ql)) {
    checks.push((v) => v.status === 'Frozen');
    interpretations.push('Status: Frozen');
  } else if (/\bpublished\b/i.test(ql)) {
    checks.push((v) => v.status === 'Published');
    interpretations.push('Status: Published');
  } else if (/\bsuperseded\b/i.test(ql)) {
    checks.push((v) => v.status === 'Superseded');
    interpretations.push('Status: Superseded');
  } else if (/\bsimulation\b|sim\b/i.test(ql)) {
    checks.push((v) => v.status === 'Simulation');
    interpretations.push('Status: Simulation');
  } else if (/\bdraft\b/i.test(ql)) {
    checks.push((v) => v.status === 'Draft');
    interpretations.push('Status: Draft');
  }

  // Approval status
  if (/reject/i.test(ql)) {
    checks.push((v) => v.approvalStatus === 'Rejected');
    interpretations.push('Approval: Rejected');
  } else if (/pending|waiting|await/i.test(ql)) {
    checks.push((v) => v.approvalStatus === 'Pending Approval');
    interpretations.push('Approval: Pending Approval');
  } else if (/\bapproved\b/i.test(ql) && !/pending/i.test(ql)) {
    checks.push((v) => v.approvalStatus === 'Approved');
    interpretations.push('Approval: Approved');
  }

  // Baseline flag
  if (/\bbaseline\b/i.test(ql)) {
    checks.push((v) => v.isApprovedBaseline);
    interpretations.push('Baseline: Yes');
  }

  // Validation
  if (/\bblocked\b/i.test(ql)) {
    checks.push((v) => v.validationStatus === 'Blocked');
    interpretations.push('Validation: Blocked');
  } else if (/\bwarning\b/i.test(ql)) {
    checks.push((v) => v.validationStatus === 'Warning');
    interpretations.push('Validation: Warning');
  } else if (/\bvalid\b/i.test(ql) && !/not/i.test(ql)) {
    checks.push((v) => v.validationStatus === 'Valid');
    interpretations.push('Validation: Valid');
  }

  // Cycle
  if (/\b(june|jun)\b/i.test(ql)) {
    checks.push((v) => v.cycleId.includes('06'));
    interpretations.push('Cycle: June');
  } else if (/\b(march|mar)\b/i.test(ql)) {
    checks.push((v) => v.cycleId.includes('03'));
    interpretations.push('Cycle: March');
  }

  // Lines
  const lineHits = [...ql.matchAll(/line\s*(\d)/gi)];
  if (lineHits.length) {
    const lines = lineHits.map((m) => `Line ${m[1]}`);
    checks.push((v) => lines.some((l) => v.impactedLines.includes(l)));
    interpretations.push(`Line: ${lines.join(', ')}`);
  }

  // Work orders
  const woHits = [...ql.matchAll(/wo[-\s]?(\d+)/gi)];
  if (woHits.length) {
    const wos = woHits.map((m) => `WO-${m[1]}`);
    checks.push((v) => wos.some((w) => v.impactedWOs.includes(w)));
    interpretations.push(`WO: ${wos.join(', ')}`);
  }

  // Week number (schedule code pattern)
  const weekHits = [...ql.matchAll(/w(\d{2})/gi)];
  if (weekHits.length) {
    const weeks = weekHits.map((m) => `W${m[1].toUpperCase()}`);
    checks.push((v) => weeks.some((w) => v.scheduleVersionCode.includes(w) || v.scheduleNumber.includes(w)));
    interpretations.push(`Week: ${weeks.join(', ')}`);
  }

  // Actors
  if (/\bmaya\b/i.test(ql)) {
    checks.push((v) => v.createdBy.toLowerCase().includes('maya') || (v.approvedBy?.toLowerCase().includes('maya') ?? false));
    interpretations.push('Actor: Maya Planner');
  } else if (/\bcarlos\b/i.test(ql)) {
    checks.push((v) => v.createdBy.toLowerCase().includes('carlos') || (v.approvedBy?.toLowerCase().includes('carlos') ?? false));
    interpretations.push('Actor: Carlos Ops Manager');
  } else if (/\bdanilo\b/i.test(ql)) {
    checks.push((v) => v.createdBy.toLowerCase().includes('danilo'));
    interpretations.push('Actor: Danilo Brooks');
  }

  // Fallback: broad text match
  if (!checks.length) {
    checks.push((v) =>
      v.id.toLowerCase().includes(ql) ||
      v.scheduleVersionCode.toLowerCase().includes(ql) ||
      v.scheduleNumber.toLowerCase().includes(ql) ||
      v.planningCycle.toLowerCase().includes(ql) ||
      v.linkedMpsVersionId.toLowerCase().includes(ql) ||
      v.linkedMrpSnapshotId.toLowerCase().includes(ql) ||
      v.createdBy.toLowerCase().includes(ql) ||
      v.changeReason.toLowerCase().includes(ql) ||
      v.impactedWOs.some((w) => w.toLowerCase().includes(ql)) ||
      v.impactedLines.some((l) => l.toLowerCase().includes(ql)) ||
      v.impactedMaterials.some((m) => m.toLowerCase().includes(ql))
    );
    interpretations.push(`Text: "${q}"`);
  }

  return {
    query: q,
    interpretations,
    apply: (v) => checks.every((fn) => fn(v)),
  };
}

interface ScheduleAiSearchProps {
  value: string;
  onChange: (v: string) => void;
  resultCount: number;
  totalCount: number;
}

export default function ScheduleAiSearch({value, onChange, resultCount, totalCount}: ScheduleAiSearchProps) {
  const parsed = parseScheduleAiQuery(value);
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
        placeholder='e.g. "frozen baselines" · "June pending approval" · "W23" · "Line 2"'
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
