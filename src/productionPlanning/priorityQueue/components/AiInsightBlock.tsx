import React from 'react';
import {Alert, Box, Button, Divider, Stack, Typography} from '@mui/material';
import {AutoAwesome as AutoAwesomeIcon} from '@mui/icons-material';
import type {AiInsight} from '../types';
import {ConfidenceBadge, GovernedBadge} from './Badges';

interface AiInsightBlockProps {
  insight: AiInsight;
  onAcceptRecommendation: (recommendation: string) => void;
}

export default function AiInsightBlock({insight, onAcceptRecommendation}: AiInsightBlockProps) {
  return (
    <Box
      sx={{
        borderRadius: 2.5,
        border: '1px solid #BFD3FF',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          px: 2,
          py: 1.25,
          background: 'linear-gradient(135deg, #044ED7 0%, #1D74FF 100%)',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <AutoAwesomeIcon sx={{fontSize: 16, color: '#FFFFFF'}} />
        <Typography sx={{fontSize: 11, fontWeight: 900, color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: '0.08em'}}>
          AI Explainability
        </Typography>
        <Typography sx={{fontSize: 10, color: 'rgba(255,255,255,0.7)', ml: 'auto'}}>
          AI-generated content
        </Typography>
      </Box>

      <Box sx={{p: 2, bgcolor: '#F0F5FF', display: 'flex', flexDirection: 'column', gap: 1.5}}>
        {insight.isStale && (
          <Alert severity="warning" sx={{py: 0.5, fontSize: 12}}>
            Some source data may be older than the configured freshness threshold.
          </Alert>
        )}

        <InsightRow label="Why AI recommended this" value={insight.whyPriority} />
        <Divider sx={{borderColor: '#D1DCF8'}} />
        <InsightRow label="Demand and operational impact" value={insight.predictedImpact} />
        {insight.noActionImpact ? (
          <>
            <Divider sx={{borderColor: '#D1DCF8'}} />
            <InsightRow label="If no action is taken" value={insight.noActionImpact} />
          </>
        ) : null}
        <Divider sx={{borderColor: '#D1DCF8'}} />
        <InsightRow label="Recommended next action" value={insight.recommendedAction} />

        {(insight.suggestedOwner || insight.deadline || insight.governed) ? (
          <>
            <Divider sx={{borderColor: '#D1DCF8'}} />
            <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
              {insight.suggestedOwner ? <Meta label="Suggested owner" value={insight.suggestedOwner} /> : null}
              {insight.deadline ? <Meta label="Deadline" value={insight.deadline} /> : null}
              {insight.governed ? (
                <Box>
                  <Typography sx={{fontSize: 11, fontWeight: 700, color: '#5B668A', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.5}}>
                    Governance
                  </Typography>
                  <GovernedBadge />
                </Box>
              ) : null}
            </Stack>
          </>
        ) : null}

        {insight.relatedObjects && insight.relatedObjects.length > 0 && (
          <>
            <Divider sx={{borderColor: '#D1DCF8'}} />
            <Box>
              <Typography sx={{fontSize: 11, fontWeight: 700, color: '#5B668A', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.5}}>
                Related WOs / objects
              </Typography>
              <Stack direction="row" flexWrap="wrap" gap={0.5}>
                {insight.relatedObjects.map((obj) => (
                  <Box
                    key={obj}
                    sx={{
                      px: 1,
                      py: 0.25,
                      borderRadius: 1,
                      bgcolor: 'var(--planning-neutral-bg)',
                      border: '1px solid #BFDBFE',
                      fontSize: 11,
                      fontWeight: 700,
                      color: '#1D4ED8',
                    }}
                  >
                    {obj}
                  </Box>
                ))}
              </Stack>
            </Box>
          </>
        )}

        <Divider sx={{borderColor: '#D1DCF8'}} />

        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography sx={{fontSize: 11, fontWeight: 700, color: '#5B668A', textTransform: 'uppercase', letterSpacing: '0.05em'}}>
              Confidence
            </Typography>
            <Box sx={{mt: 0.5}}>
              <ConfidenceBadge confidence={insight.confidence} />
            </Box>
          </Box>
          <Box sx={{textAlign: 'right'}}>
            <Typography sx={{fontSize: 11, fontWeight: 700, color: '#5B668A', textTransform: 'uppercase', letterSpacing: '0.05em'}}>
              Data freshness
            </Typography>
            <Typography sx={{fontSize: 11, color: '#8B95B5', mt: 0.25}}>
              {insight.dataFreshness}
            </Typography>
          </Box>
        </Stack>

        <Button
          variant="contained"
          size="small"
          startIcon={<AutoAwesomeIcon sx={{fontSize: 14}} />}
          onClick={() => onAcceptRecommendation(insight.recommendedAction)}
          sx={{
            textTransform: 'none',
            fontWeight: 700,
            fontSize: 12,
            bgcolor: '#1D74FF',
            '&:hover': {bgcolor: '#044ED7'},
            alignSelf: 'flex-start',
          }}
        >
          Review prepared action
        </Button>
      </Box>
    </Box>
  );
}

function InsightRow({label, value}: {label: string; value: string}) {
  return (
    <Box>
      <Typography sx={{fontSize: 11, fontWeight: 700, color: '#5B668A', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.5}}>
        {label}
      </Typography>
      <Typography sx={{fontSize: 13, color: 'var(--planning-text-primary)', lineHeight: 1.5}}>
        {value}
      </Typography>
    </Box>
  );
}

function Meta({label, value}: {label: string; value: string}) {
  return (
    <Box>
      <Typography sx={{fontSize: 11, fontWeight: 700, color: '#5B668A', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.5}}>
        {label}
      </Typography>
      <Typography sx={{fontSize: 12, color: 'var(--planning-text-primary)'}}>{value}</Typography>
    </Box>
  );
}
