import {Box, Chip, Collapse, Divider, Typography} from '@mui/material';
import {
  AutoAwesome as AIIcon,
  CheckCircle as CheckIcon,
  ExpandLess as CollapseIcon,
  ExpandMore as ExpandIcon,
  Lightbulb as ReasoningIcon,
} from '@mui/icons-material';
import {useState} from 'react';
import {planningTokens} from '../../ui/planningTheme';
import type {BluAIRecommendation} from '../types';

type Props = {
  recommendation: BluAIRecommendation;
};

export default function BluAIRecommendationPanel({recommendation}: Props) {
  const [expanded, setExpanded] = useState(true);

  return (
    <Box sx={{
      borderRadius: 3,
      border: '1.5px solid #C4B5FD',
      bgcolor: '#FAFAFE',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <Box
        onClick={() => setExpanded((v) => !v)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1.2,
          background: 'linear-gradient(135deg, #EDE9FE 0%, #F5F3FF 100%)',
          borderBottom: expanded ? '1px solid #DDD6FE' : 'none',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
          <Box sx={{
            width: 28,
            height: 28,
            borderRadius: 1.5,
            background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <AIIcon sx={{fontSize: 15, color: '#fff'}} />
          </Box>
          <Box>
            <Typography sx={{fontSize: 12, fontWeight: 900, color: '#4C1D95', lineHeight: 1.2}}>
              Blu.AI Recommendation
            </Typography>
            <Typography sx={{fontSize: 10.5, color: '#7C3AED', lineHeight: 1.2}}>
              {recommendation.confidencePercent}% confidence · Based on {recommendation.keyDataPoints.length} data points
            </Typography>
          </Box>
        </Box>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
          <Chip
            label={recommendation.recommendedScenarioName}
            size="small"
            sx={{
              height: 22,
              fontSize: 11,
              fontWeight: 800,
              bgcolor: '#EDE9FE',
              color: '#5B21B6',
              border: '1px solid #C4B5FD',
              '& .MuiChip-label': {px: 0.9},
            }}
          />
          {expanded
            ? <CollapseIcon sx={{fontSize: 18, color: '#7C3AED'}} />
            : <ExpandIcon sx={{fontSize: 18, color: '#7C3AED'}} />
          }
        </Box>
      </Box>

      {/* Collapsible body */}
      <Collapse in={expanded}>
        <Box sx={{px: 2, py: 1.8}}>
          {/* Reasoning */}
          <Box sx={{display: 'flex', gap: 1, mb: 2}}>
            <ReasoningIcon sx={{fontSize: 16, color: '#7C3AED', mt: 0.15, flexShrink: 0}} />
            <Typography sx={{fontSize: 12.5, color: planningTokens.textSecondary, lineHeight: 1.6}}>
              {recommendation.reasoning}
            </Typography>
          </Box>

          <Divider sx={{mb: 1.5, borderColor: '#EDE9FE'}} />

          {/* Key data points */}
          <Typography sx={{fontSize: 11, fontWeight: 800, color: '#7C3AED', mb: 1, textTransform: 'uppercase', letterSpacing: '0.06em'}}>
            Supporting Data
          </Typography>
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: 1,
          }}>
            {recommendation.keyDataPoints.map((pt, i) => (
              <Box key={i} sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 0.8,
                p: 1,
                borderRadius: 1.5,
                bgcolor: pt.positive ? '#F0FDF4' : '#FEF2F2',
                border: `1px solid ${pt.positive ? '#BBF7D0' : '#FECACA'}`,
              }}>
                <CheckIcon sx={{
                  fontSize: 14,
                  color: pt.positive ? planningTokens.success : planningTokens.danger,
                  mt: 0.1,
                  flexShrink: 0,
                }} />
                <Box sx={{minWidth: 0}}>
                  <Typography sx={{fontSize: 10, fontWeight: 800, color: planningTokens.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', lineHeight: 1.3}}>
                    {pt.label}
                  </Typography>
                  <Typography sx={{fontSize: 12, fontWeight: 700, color: pt.positive ? planningTokens.success : planningTokens.danger, lineHeight: 1.3}}>
                    {pt.value}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Collapse>
    </Box>
  );
}
