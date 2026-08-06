import { Box, Paper, Typography } from '@mui/material';
import { tokenDivider, tokenText } from '../../../workstation/theme';
import type { PlannerAiCoverageSummary } from '../../ai/types';

type AIGapAnalysisPanelProps = {
  summary: PlannerAiCoverageSummary;
  highlightedCellId?: string | null;
};

export function AIGapAnalysisPanel({ summary, highlightedCellId }: AIGapAnalysisPanelProps) {
  return (
    <Paper elevation={0} sx={{ borderRadius: '12px', border: `1px solid ${tokenDivider}`, p: 1.8 }}>
      <Typography sx={{ color: tokenText.primary, fontSize: '0.84rem', fontWeight: 800 }}>
        Gap analysis
      </Typography>
      <Typography sx={{ mt: 0.35, color: tokenText.secondary, fontSize: '0.72rem', lineHeight: 1.45 }}>
        Actionable recommendations for thin or critical coverage cells.
      </Typography>

      <Box sx={{ mt: 1.05, display: 'grid', gap: 0.75, maxHeight: 280, overflowY: 'auto', pr: 0.5 }}>
        {summary.recommendations.map((recommendation) => {
          const isHighlighted = highlightedCellId && recommendation.cellId === highlightedCellId;
          return (
            <Box
              key={recommendation.id}
              id={`gap-${recommendation.id}`}
              sx={{
                p: 1,
                borderRadius: '10px',
                border: `1px solid ${isHighlighted ? '#BFDBFE' : tokenDivider}`,
                bgcolor: isHighlighted ? '#EFF6FF' : 'background.paper',
              }}
            >
              <Typography sx={{ color: tokenText.primary, fontSize: '0.74rem', fontWeight: 800 }}>
                {recommendation.title}
              </Typography>
              <Typography sx={{ mt: 0.24, color: tokenText.secondary, fontSize: '0.7rem', lineHeight: 1.45 }}>
                {recommendation.summary}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
}
