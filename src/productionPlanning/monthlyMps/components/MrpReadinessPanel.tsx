import {CheckCircle as CheckIcon, Cancel as CrossIcon} from '@mui/icons-material';
import {Box, Stack, Typography} from '@mui/material';
import type {MrpReadiness} from '../types';

type Props = {
  mrpReadiness: MrpReadiness;
};

export default function MrpReadinessPanel({mrpReadiness}: Props) {
  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{mb: 2}}>
        <Typography sx={{fontSize: 15, fontWeight: 800, color: 'var(--planning-text-primary)'}}>MRP Readiness</Typography>
        <Box sx={{
          px: 1.4, py: 0.5, borderRadius: 2, fontWeight: 800, fontSize: 13,
          bgcolor: mrpReadiness.isReady ? '#ECFDF3' : '#FEF3F2',
          color: mrpReadiness.isReady ? '#027A48' : '#B42318',
          border: `1px solid ${mrpReadiness.isReady ? '#ABEFC6' : '#FECDCA'}`,
        }}>
          {mrpReadiness.isReady ? 'Ready for MRP' : 'Not Ready for MRP'}
        </Box>
      </Stack>

      <Typography sx={{fontSize: 12, color: 'var(--planning-text-secondary)', mb: 2}}>
        All checks must pass before MPS can be released and submitted for MRP processing.
        MRP itself is not executed here — this screen only confirms readiness.
      </Typography>

      <Stack spacing={1}>
        {mrpReadiness.checks.map((check) => (
          <Box
            key={check.label}
            sx={{
              display: 'flex', alignItems: 'flex-start', gap: 1.2, p: 1.2,
              border: '1px solid var(--planning-border)', borderRadius: 2,
              bgcolor: check.passed ? '#FAFFF9' : '#FFFAFA',
              borderLeft: `3px solid ${check.passed ? '#ABEFC6' : '#FECDCA'}`,
            }}
          >
            {check.passed
              ? <CheckIcon sx={{fontSize: 18, color: '#027A48', mt: 0.1, flexShrink: 0}} />
              : <CrossIcon sx={{fontSize: 18, color: '#B42318', mt: 0.1, flexShrink: 0}} />
            }
            <Box>
              <Typography sx={{fontSize: 13, fontWeight: 600, color: check.passed ? '#1E293B' : '#B42318'}}>
                {check.label}
              </Typography>
              {!check.passed && check.detail && (
                <Typography sx={{fontSize: 12, color: 'var(--planning-text-secondary)', mt: 0.2}}>{check.detail}</Typography>
              )}
            </Box>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}
