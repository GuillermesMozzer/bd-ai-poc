import {
  AutoAwesome as SparkleIcon,
  InfoOutlined as InfoOutlinedIcon,
  WarningAmber as WarningAmberIcon,
} from '@mui/icons-material';
import { Box, Button, Chip, Paper, Typography } from '@mui/material';
import { tokenBrand, tokenDivider, tokenNeutral, tokenText } from '../../../workstation/theme';
import type { PlannerAiPlan } from '../../ai/types';

type PlannerAiOverviewPanelProps = {
  generatedPlan: PlannerAiPlan | null;
  overviewItems: string[];
  isGenerating: boolean;
  onGeneratePlan: () => void | Promise<void>;
  onReviewPlan: () => void;
  onComparePlans: () => void;
};

export function PlannerAiOverviewPanel({
  generatedPlan,
  overviewItems,
  isGenerating,
  onGeneratePlan,
  onReviewPlan,
  onComparePlans,
}: PlannerAiOverviewPanelProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: '12px',
        border: `1px solid ${tokenDivider}`,
        bgcolor: tokenNeutral.lightest,
        p: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
        <Box sx={{ minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <SparkleIcon sx={{ color: '#F97316', fontSize: 16 }} />
            <Typography sx={{ color: tokenBrand.main, fontSize: '0.875rem', fontWeight: 800 }}>
              BLU.AI weekly planning
            </Typography>
            {generatedPlan ? (
              <Chip
                size="small"
                label={`${generatedPlan.confidence}% confidence`}
                sx={{
                  height: 22,
                  borderRadius: 99,
                  bgcolor: '#EFF6FF',
                  color: tokenBrand.main,
                  border: '1px solid #BFDBFE',
                  fontWeight: 800,
                }}
              />
            ) : null}
          </Box>
          <Typography sx={{ mt: 0.6, color: tokenText.secondary, fontSize: '0.78rem', lineHeight: 1.45 }}>
            Generate and compare weekly AI strategies from the planner board, Follow-Up backlog, CBM/PdM signals, and spare-parts readiness.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          {generatedPlan ? (
            <Button
              variant="outlined"
              onClick={onComparePlans}
              sx={{
                minHeight: 36,
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 700,
                borderColor: tokenDivider,
                color: tokenText.primary,
                bgcolor: 'background.paper',
              }}
            >
              Compare plans
            </Button>
          ) : null}
          {generatedPlan ? (
            <Button
              variant="outlined"
              onClick={onReviewPlan}
              sx={{
                minHeight: 36,
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 700,
                borderColor: tokenBrand.main,
                color: tokenBrand.main,
              }}
            >
              Review plan
            </Button>
          ) : null}
          <Button
            variant="contained"
            onClick={onGeneratePlan}
            disabled={isGenerating}
            startIcon={<SparkleIcon />}
            sx={{
              minHeight: 36,
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 800,
              boxShadow: 'none',
              bgcolor: tokenBrand.main,
              '&:hover': { bgcolor: tokenBrand.dark, boxShadow: 'none' },
            }}
          >
            {isGenerating ? 'Generating plan...' : generatedPlan ? 'Regenerate AI plan' : 'Generate AI plan'}
          </Button>
        </Box>
      </Box>
      <Box sx={{ mt: 1.5, display: 'grid', gap: 0.7 }}>
        {overviewItems.map((item, index) => (
          <Box
            key={`${item}-${index}`}
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 1,
              p: 1,
              borderRadius: '8px',
              bgcolor: index === 0 && generatedPlan ? 'rgba(4,78,215,0.06)' : 'rgba(255,255,255,0.75)',
              border: `1px solid ${index === 0 && generatedPlan ? '#BFDBFE' : tokenDivider}`,
            }}
          >
            {index === 0 && generatedPlan ? (
              <WarningAmberIcon sx={{ fontSize: 16, color: '#EA580C', mt: 0.1 }} />
            ) : (
              <InfoOutlinedIcon sx={{ fontSize: 16, color: tokenBrand.main, mt: 0.1 }} />
            )}
            <Typography sx={{ color: tokenText.secondary, fontSize: '0.76rem', lineHeight: 1.45 }}>
              {item}
            </Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  );
}
