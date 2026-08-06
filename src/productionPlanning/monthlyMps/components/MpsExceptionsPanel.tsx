import {Box, Chip, Stack, Typography} from '@mui/material';
import type {ExceptionCategory, ExceptionSeverity, MpsException} from '../types';
import {SeverityBadge} from './Badges';

type Props = {
  exceptions: MpsException[];
};

const categoryColor: Record<ExceptionCategory, string> = {
  Capacity:     '#0369A1',
  Stock:        '#B54708',
  ProductRule:  '#6D28D9',
  MissingData:  '#71717A',
  FrozenPeriod: '#1D4ED8',
  MRPReadiness: '#B42318',
  Planning:     '#475467',
};

const SEVERITY_ORDER: ExceptionSeverity[] = ['Blocker', 'Warning', 'Info'];

export default function MpsExceptionsPanel({exceptions}: Props) {
  if (exceptions.length === 0) {
    return (
      <Box sx={{textAlign: 'center', py: 6, color: 'var(--planning-text-muted)'}}>
        <Typography sx={{fontSize: 15, fontWeight: 600}}>No exceptions</Typography>
        <Typography sx={{fontSize: 13, mt: 0.4}}>Run Validate MPS to generate exception details.</Typography>
      </Box>
    );
  }

  const sorted = [...exceptions].sort((a, b) =>
    SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity),
  );

  const blockers = sorted.filter((e) => e.severity === 'Blocker');
  const warnings = sorted.filter((e) => e.severity === 'Warning');
  const infos = sorted.filter((e) => e.severity === 'Info');

  return (
    <Box>
      <Stack direction="row" spacing={1} alignItems="center" sx={{mb: 2}} flexWrap="wrap" rowGap={0.6}>
        <Typography sx={{fontSize: 15, fontWeight: 800, color: 'var(--planning-text-primary)'}}>Exceptions</Typography>
        {blockers.length > 0 && <Chip label={`${blockers.length} Blocker${blockers.length > 1 ? 's' : ''}`} size="small" sx={{fontWeight: 700, fontSize: 11, bgcolor: '#FEF3F2', color: '#B42318', border: '1px solid #FECDCA'}} />}
        {warnings.length > 0 && <Chip label={`${warnings.length} Warning${warnings.length > 1 ? 's' : ''}`} size="small" sx={{fontWeight: 700, fontSize: 11, bgcolor: '#FFF7E8', color: '#B54708', border: '1px solid #F9DBAF'}} />}
        {infos.length > 0 && <Chip label={`${infos.length} Info`} size="small" sx={{fontWeight: 700, fontSize: 11, bgcolor: 'var(--planning-ai-accent-bg)', color: '#3730A3', border: '1px solid #C7D2FE'}} />}
      </Stack>

      <Stack spacing={1}>
        {sorted.map((exc) => (
          <Box
            key={exc.id}
            sx={{
              border: '1px solid var(--planning-border)',
              borderLeft: `4px solid ${exc.severity === 'Blocker' ? '#B42318' : exc.severity === 'Warning' ? '#F59E0B' : '#6366F1'}`,
              borderRadius: 2,
              p: 1.4,
              bgcolor: exc.severity === 'Blocker' ? '#FFFAFA' : exc.severity === 'Warning' ? '#FFFBF0' : '#F8F9FF',
            }}
          >
            <Stack direction="row" spacing={1} alignItems="flex-start" flexWrap="wrap" rowGap={0.6}>
              <SeverityBadge severity={exc.severity} />
              <Chip
                label={exc.category}
                size="small"
                sx={{fontWeight: 700, fontSize: 11, bgcolor: `color-mix(in srgb, ${categoryColor[exc.category]} 9%, transparent)`, color: categoryColor[exc.category], border: `1px solid color-mix(in srgb, ${categoryColor[exc.category]} 25%, transparent)`, borderRadius: 1.5}}
              />
              {exc.productCode && <Chip label={exc.productCode} size="small" sx={{fontWeight: 600, fontSize: 11, bgcolor: 'var(--planning-surface-muted)', color: 'var(--planning-text-secondary)', border: '1px solid var(--planning-border)'}} />}
              {exc.bucketLabel && <Chip label={exc.bucketLabel} size="small" sx={{fontWeight: 600, fontSize: 11, bgcolor: 'var(--planning-surface-muted)', color: 'var(--planning-text-secondary)', border: '1px solid var(--planning-border)'}} />}
              {exc.lineId && <Chip label={exc.lineId} size="small" sx={{fontWeight: 600, fontSize: 11, bgcolor: 'var(--planning-surface-muted)', color: 'var(--planning-text-secondary)', border: '1px solid var(--planning-border)'}} />}
            </Stack>
            <Typography sx={{fontSize: 12, color: 'var(--planning-text-primary)', mt: 0.8, fontWeight: 500}}>{exc.reason}</Typography>
            {exc.suggestedAction && (
              <Typography sx={{fontSize: 11, color: 'var(--planning-text-secondary)', mt: 0.4}}>
                → {exc.suggestedAction}
              </Typography>
            )}
          </Box>
        ))}
      </Stack>
    </Box>
  );
}
