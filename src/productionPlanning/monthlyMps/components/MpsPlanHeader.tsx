import {
  AcUnit as FrozenIcon,
  ArrowBackRounded as ArrowBackRoundedIcon,
  ArrowBack as ArrowBackIcon,
  East as EastIcon,
} from '@mui/icons-material';
import {Box, Button, Chip, IconButton, Stack, Tooltip, Typography} from '@mui/material';
import type {MpsPlan} from '../types';
import {MpsPlanStatusBadge} from './Badges';

type Props = {
  plan: MpsPlan;
  lastRefreshedAt: string | null;
  currentUser: string;
  expanded?: boolean;
  onExpand?: () => void;
  onCollapse?: () => void;
  linkedDemandCount?: number;
  linkedMrpCount?: number;
  onOpenDemandDrawer?: () => void;
  onOpenMrpDrawer?: () => void;
};

export default function MpsPlanHeader({
  plan,
  lastRefreshedAt,
  currentUser,
  expanded = false,
  onExpand,
  onCollapse,
  linkedDemandCount = 0,
  linkedMrpCount = 0,
  onOpenDemandDrawer,
  onOpenMrpDrawer,
}: Props) {
  const dataTs = plan.planDataTimestamp ? new Date(plan.planDataTimestamp).toLocaleString() : '-';
  const refreshTs = lastRefreshedAt ? new Date(lastRefreshedAt).toLocaleString() : '-';

  return (
    <Box sx={{mb: 2.2}}>
      {expanded ? (
        <Box sx={{display: 'flex', alignItems: 'center', gap: 1, mb: 1.2}}>
          <Button
            onClick={onCollapse}
            startIcon={<ArrowBackRoundedIcon />}
            sx={{minWidth: 0, px: 0.4, color: '#1769FF', fontWeight: 900, fontSize: 15, textTransform: 'none'}}
          >
            Back
          </Button>
        </Box>
      ) : null}

      <Box
        sx={{
          border: '1px solid #D8E2F0',
          borderRadius: 3.5,
          bgcolor: 'var(--planning-surface)',
          overflow: 'hidden',
          boxShadow: '0 18px 40px rgba(8,24,74,0.08)',
        }}
      >
        <Box
          sx={{
            px: {xs: 1.7, md: 2.1},
            py: 1.7,
            borderBottom: '1px solid #E7EDF7',
            background: 'linear-gradient(135deg, #F7FAFF 0%, #EDF4FF 52%, #F8F4FF 100%)',
          }}
        >
          <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2} flexWrap="wrap" rowGap={1}>
            <Box>
              <Typography sx={{fontSize: 11, fontWeight: 900, color: '#1769FF', letterSpacing: '0.1em', textTransform: 'uppercase', mb: 0.45}}>
                Production Planning
              </Typography>
              <Stack direction="row" alignItems="center" spacing={1.2} flexWrap="wrap" rowGap={0.5}>
                <Typography sx={{fontSize: {xs: 24, md: 28}, fontWeight: 900, color: 'var(--planning-text-primary)', lineHeight: 1.05, letterSpacing: '-0.03em'}}>
                  MPS
                </Typography>
                <MpsPlanStatusBadge status={plan.status} size="small" />
              </Stack>
            </Box>

            <Stack direction="row" spacing={1} flexWrap="wrap" rowGap={0.5} alignItems="center">
              <Button
                variant="outlined"
                size="small"
                onClick={onOpenDemandDrawer}
                startIcon={<ArrowBackIcon sx={{fontSize: 15}} />}
                sx={{textTransform: 'none', fontWeight: 800, borderRadius: 2, fontSize: 12, color: '#4338CA', borderColor: '#C7D2FE', bgcolor: 'var(--planning-surface)', '&:hover': {bgcolor: 'var(--planning-ai-accent-bg)'}}}
              >
                Linked Demands ({linkedDemandCount})
              </Button>
              <Button
                variant="contained"
                size="small"
                onClick={onOpenMrpDrawer}
                endIcon={<EastIcon sx={{fontSize: 15}} />}
                sx={{textTransform: 'none', fontWeight: 800, borderRadius: 2, fontSize: 12, bgcolor: '#059669', '&:hover': {bgcolor: '#047857'}}}
              >
                Linked MRP ({linkedMrpCount})
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}

function MetaItem({label, value}: {label: string; value: string}) {
  return (
    <Box>
      <Typography sx={{fontSize: 10, fontWeight: 800, color: 'var(--planning-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em'}}>{label}</Typography>
      <Typography sx={{fontSize: 13, fontWeight: 700, color: 'var(--planning-text-primary)', mt: 0.2}}>{value}</Typography>
    </Box>
  );
}
