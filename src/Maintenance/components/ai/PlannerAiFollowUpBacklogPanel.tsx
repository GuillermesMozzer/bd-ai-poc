import { AssignmentLate as BacklogIcon } from '@mui/icons-material';
import { Box, Chip, Paper, Typography } from '@mui/material';
import { tokenBrand, tokenDivider, tokenError, tokenText, tokenWarning } from '../../../workstation/theme';
import type { PlannerAiFollowUpBacklogSummary } from '../../ai/types';

type PlannerAiFollowUpBacklogPanelProps = {
  backlogSummary: PlannerAiFollowUpBacklogSummary;
  compact?: boolean;
};

function getPriorityTone(priority: string) {
  if (/emergency|immediate|high/i.test(priority)) {
    return { color: tokenError.dark, bg: '#FEF2F2', border: '#FECACA' };
  }

  if (/medium/i.test(priority)) {
    return { color: tokenWarning.dark, bg: '#FFF7ED', border: '#FED7AA' };
  }

  return { color: tokenBrand.main, bg: '#EFF6FF', border: '#BFDBFE' };
}

export function PlannerAiFollowUpBacklogPanel({ backlogSummary, compact = false }: PlannerAiFollowUpBacklogPanelProps) {
  const openBacklog =
    backlogSummary.openRequestCount +
    backlogSummary.planningLaneCount +
    backlogSummary.blockedByPartsCount;
  const highlightItems = compact ? backlogSummary.highlightItems.slice(0, 2) : backlogSummary.highlightItems;

  return (
    <Paper elevation={0} sx={{ borderRadius: '12px', border: `1px solid ${tokenDivider}`, p: compact ? 1.2 : 1.8 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <BacklogIcon sx={{ color: tokenBrand.main, fontSize: 17 }} />
          <Typography sx={{ color: tokenText.primary, fontSize: '0.84rem', fontWeight: 800 }}>
            Follow-up backlog
          </Typography>
        </Box>
        <Chip
          size="small"
          label="Mock Follow-Up Board"
          sx={{ height: 22, borderRadius: 99, fontWeight: 700, bgcolor: 'background.paper' }}
        />
      </Box>

      {!compact ? (
        <Typography sx={{ mt: 0.55, color: tokenText.secondary, fontSize: '0.72rem', lineHeight: 1.45 }}>
          Shared snapshot from the Follow-Up Board lanes — requests, planning queue, and parts-blocked scheduled work.
        </Typography>
      ) : null}

      <Box sx={{ mt: 1, display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 0.65 }}>
        {[
          { label: 'Requests', value: backlogSummary.openRequestCount },
          { label: 'Planning', value: backlogSummary.planningLaneCount },
          { label: 'In progress', value: backlogSummary.inProgressCount },
          { label: 'Parts blocked', value: backlogSummary.blockedByPartsCount, warn: true },
        ].map((metric) => (
          <Box
            key={metric.label}
            sx={{
              p: 0.85,
              borderRadius: '10px',
              border: `1px solid ${metric.warn ? '#FECACA' : tokenDivider}`,
              bgcolor: metric.warn ? '#FEF2F2' : 'background.paper',
            }}
          >
            <Typography sx={{ color: tokenText.secondary, fontSize: '0.66rem', fontWeight: 700, textTransform: 'uppercase' }}>
              {metric.label}
            </Typography>
            <Typography sx={{ mt: 0.2, color: metric.warn ? tokenError.dark : tokenText.primary, fontSize: '0.92rem', fontWeight: 800 }}>
              {metric.value}
            </Typography>
          </Box>
        ))}
      </Box>

      {!compact ? (
        <Typography sx={{ mt: 1.05, color: tokenText.secondary, fontSize: '0.7rem', fontWeight: 700 }}>
          {openBacklog} open follow-up item{openBacklog === 1 ? '' : 's'} visible to BLU.AI this cycle
        </Typography>
      ) : null}

      <Box sx={{ mt: compact ? 0.75 : 0.85, display: 'grid', gap: 0.65 }}>
        {highlightItems.map((item) => {
          const tone = getPriorityTone(item.priorityLabel);
          const blockedByParts = item.tags.some((tag) => tag.toLowerCase().includes('missing parts'));

          return (
            <Box
              key={item.id}
              sx={{
                p: 0.95,
                borderRadius: '10px',
                border: `1px solid ${blockedByParts ? '#FECACA' : tokenDivider}`,
                bgcolor: 'background.paper',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 0.75, flexWrap: 'wrap' }}>
                <Typography sx={{ color: tokenText.primary, fontSize: '0.74rem', fontWeight: 800 }}>
                  {item.asset} · {item.workOrderLabel}
                </Typography>
                <Chip
                  size="small"
                  label={item.laneLabel}
                  sx={{ height: 20, borderRadius: 99, fontWeight: 700, bgcolor: '#F8FAFC' }}
                />
              </Box>
              <Typography sx={{ mt: 0.25, color: tokenText.secondary, fontSize: '0.7rem', lineHeight: 1.45 }}>
                {item.summary}
              </Typography>
              <Box sx={{ mt: 0.45, display: 'flex', gap: 0.45, flexWrap: 'wrap' }}>
                <Chip
                  size="small"
                  label={item.priorityLabel}
                  sx={{
                    height: 20,
                    borderRadius: 99,
                    fontWeight: 700,
                    bgcolor: tone.bg,
                    color: tone.color,
                    border: `1px solid ${tone.border}`,
                  }}
                />
                {blockedByParts ? (
                  <Chip
                    size="small"
                    label="Missing parts"
                    sx={{ height: 20, borderRadius: 99, fontWeight: 700, bgcolor: '#FEF2F2', color: tokenError.dark }}
                  />
                ) : null}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
}
