import { AutoAwesome as SparkleIcon, DragIndicator as DragIndicatorIcon } from '@mui/icons-material';
import { Box, Button, Chip, Paper, Typography } from '@mui/material';
import type { DragEvent } from 'react';
import { tokenBrand, tokenDivider, tokenText } from '../../../workstation/theme';
import type { PlannerAiCopilotSuggestion } from '../../ai/types';

type PlannerAiSuggestionCardProps = {
  suggestion: PlannerAiCopilotSuggestion;
  isDragging: boolean;
  onPrimaryAction: (suggestion: PlannerAiCopilotSuggestion) => void;
  onReviewSuggestion?: (suggestion: PlannerAiCopilotSuggestion) => void;
  onDragStart: (suggestion: PlannerAiCopilotSuggestion, event: DragEvent<HTMLDivElement>) => void;
  onDragEnd: () => void;
};

function getToneChipStyles(tone: PlannerAiCopilotSuggestion['tone']) {
  if (tone === 'critical') {
    return { bgcolor: '#FEF2F2', color: '#B91C1C', border: '#FECACA' };
  }

  if (tone === 'warning') {
    return { bgcolor: '#FFF7ED', color: '#C2410C', border: '#FED7AA' };
  }

  if (tone === 'positive') {
    return { bgcolor: '#ECFDF3', color: '#166534', border: '#BBF7D0' };
  }

  return { bgcolor: '#EFF6FF', color: tokenBrand.main, border: '#BFDBFE' };
}

export function PlannerAiSuggestionCard({
  suggestion,
  isDragging,
  onPrimaryAction,
  onReviewSuggestion,
  onDragStart,
  onDragEnd,
}: PlannerAiSuggestionCardProps) {
  const toneChip = getToneChipStyles(suggestion.tone);
  const isDraggable = suggestion.actionType === 'drag-to-schedule';

  return (
    <Paper
      elevation={0}
      draggable={isDraggable}
      onDragStart={(event) => onDragStart(suggestion, event)}
      onDragEnd={onDragEnd}
      sx={{
        borderRadius: '12px',
        border: `1px solid ${isDragging ? '#93C5FD' : tokenDivider}`,
        bgcolor: isDragging ? 'rgba(4,78,215,0.06)' : 'background.paper',
        p: 1.2,
        cursor: isDraggable ? 'grab' : 'default',
        opacity: isDragging ? 0.72 : 1,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
        <Box sx={{ minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, flexWrap: 'wrap' }}>
            <SparkleIcon sx={{ color: '#F97316', fontSize: 15 }} />
            <Typography sx={{ color: tokenText.primary, fontSize: '0.76rem', fontWeight: 800 }}>
              {suggestion.title}
            </Typography>
          </Box>
          <Typography sx={{ mt: 0.35, color: tokenText.secondary, fontSize: '0.72rem', lineHeight: 1.45 }}>
            {suggestion.summary}
          </Typography>
        </Box>
        <Chip
          size="small"
          label={suggestion.horizon}
          sx={{
            height: 22,
            borderRadius: 99,
            bgcolor: toneChip.bgcolor,
            color: toneChip.color,
            border: `1px solid ${toneChip.border}`,
            fontWeight: 700,
            textTransform: 'capitalize',
          }}
        />
      </Box>

      <Typography sx={{ mt: 0.7, color: tokenText.secondary, fontSize: '0.69rem', lineHeight: 1.45 }}>
        {suggestion.reason}
      </Typography>
      {suggestion.agentContributors?.length ? (
        <Typography sx={{ mt: 0.35, color: tokenText.secondary, fontSize: '0.68rem', fontWeight: 700, lineHeight: 1.4 }}>
          Agents: {suggestion.agentContributors.join(', ')}
        </Typography>
      ) : null}

      <Box sx={{ mt: 0.9, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, flexWrap: 'wrap' }}>
          {suggestion.workOrderLabel ? (
            <Typography sx={{ color: tokenText.primary, fontSize: '0.69rem', fontWeight: 800 }}>
              {suggestion.workOrderLabel}
            </Typography>
          ) : null}
          {suggestion.durationLabel ? (
            <Typography sx={{ color: tokenText.secondary, fontSize: '0.68rem' }}>
              {suggestion.durationLabel}
            </Typography>
          ) : null}
        </Box>

        {isDraggable ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.35, color: tokenBrand.main }}>
            <DragIndicatorIcon sx={{ fontSize: 15 }} />
            <Typography sx={{ fontSize: '0.67rem', fontWeight: 800 }}>Drag to weekly board · opens Step 2</Typography>
          </Box>
        ) : null}
      </Box>

      {isDraggable ? (
        <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end', gap: 0.6, flexWrap: 'wrap' }}>
          <Button
            size="small"
            variant="contained"
            onClick={() => onReviewSuggestion?.(suggestion)}
            sx={{
              minHeight: 30,
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 700,
              boxShadow: 'none',
              bgcolor: tokenBrand.main,
              '&:hover': {
                boxShadow: 'none',
                bgcolor: tokenBrand.dark,
              },
            }}
          >
            Review in Step 2
          </Button>
        </Box>
      ) : (
        <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            size="small"
            variant="contained"
            onClick={() => onPrimaryAction(suggestion)}
            sx={{
              minHeight: 30,
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 700,
              boxShadow: 'none',
              bgcolor: tokenBrand.main,
              '&:hover': {
                boxShadow: 'none',
                bgcolor: tokenBrand.dark,
              },
            }}
          >
            {suggestion.actionLabel}
          </Button>
        </Box>
      )}
    </Paper>
  );
}
