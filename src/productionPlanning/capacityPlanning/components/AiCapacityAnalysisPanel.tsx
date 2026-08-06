import {useState} from 'react';
import {Box, Button, Chip, CircularProgress, Stack, Typography} from '@mui/material';
import {
  AutoAwesome as AiIcon,
  CheckCircle as AcceptIcon,
  Cancel as RejectIcon,
} from '@mui/icons-material';
import {planningTokens} from '../../ui/planningTheme';
import type {AiCapacityProposal} from '../types';

type Props = {
  lineId: string;
  proposal: AiCapacityProposal | null;
  onAnalyze: () => void;
  onAccept: (p: AiCapacityProposal) => void;
  onReject: (p: AiCapacityProposal) => void;
};

const confidenceChip: Record<string, {bg: string; color: string}> = {
  High: {bg: '#DCFCE7', color: '#16A34A'},
  Medium: {bg: '#FEF9C3', color: '#CA8A04'},
  Low: {bg: '#FEE2E2', color: '#DC2626'},
};

export default function AiCapacityAnalysisPanel({proposal, onAnalyze, onAccept, onReject}: Props) {
  const [loading, setLoading] = useState(false);

  function handleAnalyze() {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onAnalyze();
    }, 1500);
  }

  if (loading) {
    return (
      <Stack alignItems="center" spacing={1.5} sx={{py: 3}}>
        <CircularProgress size={28} sx={{color: planningTokens.primaryBlue}} />
        <Typography sx={{fontSize: 12, color: planningTokens.textSecondary}}>
          Analyzing 12 months of historical performance…
        </Typography>
      </Stack>
    );
  }

  if (!proposal || proposal.status === 'rejected') {
    return (
      <Box sx={{display: 'flex', flexDirection: 'column', gap: 1}}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <AiIcon sx={{fontSize: 16, color: '#7C3AED'}} />
          <Typography sx={{fontSize: 12, color: planningTokens.textSecondary}}>
            AI can analyze historical production data and propose a realistic planning efficiency factor.
          </Typography>
        </Stack>
        {proposal?.status === 'rejected' && (
          <Typography sx={{fontSize: 11, color: planningTokens.textMuted}}>
            Last proposal was rejected. You can request a new analysis.
          </Typography>
        )}
        <Box>
          <Button
            variant="outlined"
            size="small"
            startIcon={<AiIcon sx={{fontSize: 14}} />}
            onClick={handleAnalyze}
            sx={{
              fontSize: 11, fontWeight: 700, textTransform: 'none', height: 30,
              borderColor: '#7C3AED', color: '#7C3AED',
              '&:hover': {bgcolor: 'var(--planning-ai-accent-bg)', borderColor: '#7C3AED'},
            }}
          >
            Analyze with AI
          </Button>
        </Box>
      </Box>
    );
  }

  if (proposal.status === 'accepted') {
    return (
      <Stack direction="row" alignItems="center" spacing={1} sx={{py: 1}}>
        <AcceptIcon sx={{fontSize: 16, color: '#16A34A'}} />
        <Typography sx={{fontSize: 12, color: '#16A34A', fontWeight: 600}}>
          AI proposal accepted and applied to Planning Assumptions.
        </Typography>
      </Stack>
    );
  }

  const conf = confidenceChip[proposal.confidence] ?? confidenceChip.Medium;

  return (
    <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.5}}>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={1}>
        <AiIcon sx={{fontSize: 16, color: '#7C3AED'}} />
        <Typography sx={{fontSize: 12, fontWeight: 700, color: planningTokens.textPrimary}}>
          AI Capacity Proposal
        </Typography>
        <Chip
          label={proposal.confidence}
          size="small"
          sx={{fontSize: 10, height: 18, bgcolor: conf.bg, color: conf.color, border: `1px solid color-mix(in srgb, ${conf.color} 20%, transparent)`}}
        />
        <Typography sx={{fontSize: 10, color: planningTokens.textMuted, ml: 'auto !important'}}>
          Based on {proposal.basedOnMonths} months of data
        </Typography>
      </Stack>

      {/* Proposed values */}
      <Box
        sx={{
          bgcolor: 'var(--planning-ai-accent-bg)',
          border: '1px solid #DDD6FE',
          borderRadius: 2,
          px: 2,
          py: 1.5,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 1,
        }}
      >
        <Box>
          <Typography sx={{fontSize: 10, color: '#7C3AED'}}>Proposed Efficiency Factor</Typography>
          <Typography sx={{fontSize: 18, fontWeight: 800, color: '#4C1D95'}}>
            {(proposal.proposedEfficiencyFactor * 100).toFixed(0)}%
          </Typography>
        </Box>
        <Box>
          <Typography sx={{fontSize: 10, color: '#7C3AED'}}>Effective Hrs / Month</Typography>
          <Typography sx={{fontSize: 18, fontWeight: 800, color: '#4C1D95'}}>
            {Math.round(proposal.proposedPlanningHrsPerMonth / 1000)}K
          </Typography>
        </Box>
      </Box>

      {/* Reasoning */}
      <Box sx={{bgcolor: '#FAFAFA', border: `1px solid ${planningTokens.border}`, borderRadius: 2, p: 1.5}}>
        <Typography sx={{fontSize: 11, color: planningTokens.textSecondary, lineHeight: 1.6}}>
          {proposal.reasoning}
        </Typography>
      </Box>

      {/* Actions */}
      <Stack direction="row" spacing={1}>
        <Button
          variant="contained"
          size="small"
          startIcon={<AcceptIcon sx={{fontSize: 14}} />}
          onClick={() => onAccept(proposal)}
          sx={{
            fontSize: 11, fontWeight: 700, textTransform: 'none', height: 30,
            bgcolor: '#16A34A', '&:hover': {bgcolor: '#15803D'},
          }}
        >
          Accept
        </Button>
        <Button
          variant="outlined"
          size="small"
          startIcon={<RejectIcon sx={{fontSize: 14}} />}
          onClick={() => onReject(proposal)}
          sx={{
            fontSize: 11, fontWeight: 700, textTransform: 'none', height: 30,
            borderColor: '#DC2626', color: '#DC2626',
            '&:hover': {bgcolor: '#FEF2F2'},
          }}
        >
          Reject
        </Button>
        <Button
          variant="text"
          size="small"
          onClick={handleAnalyze}
          sx={{fontSize: 11, textTransform: 'none', height: 30, color: planningTokens.textSecondary}}
        >
          Re-analyze
        </Button>
      </Stack>
    </Box>
  );
}
