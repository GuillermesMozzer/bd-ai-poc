import { Box, Button, Paper, Typography } from '@mui/material';
import { tokenBrand, tokenDivider, tokenText } from '../../../workstation/theme';
import type { PlannerAiWhatIfResult, PlannerAiWhatIfScenario } from '../../ai/types';

type PlannerAiWhatIfPanelProps = {
  scenarios: PlannerAiWhatIfScenario[];
  result: PlannerAiWhatIfResult | null;
  isLoading: boolean;
  onRunScenario: (scenario: PlannerAiWhatIfScenario) => void | Promise<void>;
  onClearResult: () => void;
  onAddToReview?: () => void;
};

function getMetricStyles(emphasis: PlannerAiWhatIfResult['metrics'][number]['emphasis']) {
  if (emphasis === 'positive') {
    return { color: '#166534', bg: '#ECFDF3', border: '#BBF7D0' };
  }

  if (emphasis === 'negative') {
    return { color: '#B91C1C', bg: '#FEF2F2', border: '#FECACA' };
  }

  return { color: '#475569', bg: '#F8FAFC', border: '#CBD5E1' };
}

export function PlannerAiWhatIfPanel({
  scenarios,
  result,
  isLoading,
  onRunScenario,
  onClearResult,
  onAddToReview,
}: PlannerAiWhatIfPanelProps) {
  return (
    <Paper elevation={0} sx={{ borderRadius: '12px', border: `1px solid ${tokenDivider}`, p: 1.8 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
        <Typography sx={{ color: tokenText.primary, fontSize: '0.84rem', fontWeight: 800 }}>
          What-if simulation
        </Typography>
        {result ? (
          <Button
            size="small"
            onClick={onClearResult}
            sx={{ minHeight: 28, textTransform: 'none', fontWeight: 700, color: tokenText.secondary }}
          >
            Clear result
          </Button>
        ) : null}
      </Box>

      <Box sx={{ mt: 1.05, display: 'grid', gap: 0.7 }}>
        {scenarios.map((scenario) => (
          <Box
            key={scenario.id}
            sx={{
              p: 1,
              borderRadius: '10px',
              border: `1px solid ${tokenDivider}`,
              bgcolor: 'background.paper',
            }}
          >
            <Typography sx={{ color: tokenText.primary, fontSize: '0.75rem', fontWeight: 800 }}>
              {scenario.label}
            </Typography>
            <Typography sx={{ mt: 0.25, color: tokenText.secondary, fontSize: '0.72rem', lineHeight: 1.45 }}>
              {scenario.description}
            </Typography>
            <Box sx={{ mt: 0.8, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                size="small"
                variant="outlined"
                onClick={() => void onRunScenario(scenario)}
                disabled={isLoading}
                sx={{
                  minHeight: 30,
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontWeight: 700,
                  borderColor: tokenBrand.main,
                  color: tokenBrand.main,
                }}
              >
                {isLoading ? 'Simulating...' : 'Run simulation'}
              </Button>
            </Box>
          </Box>
        ))}
      </Box>

      {result ? (
        <Box sx={{ mt: 1.2, p: 1.2, borderRadius: '12px', border: `1px solid ${tokenDivider}`, bgcolor: 'background.paper' }}>
          <Typography sx={{ color: tokenText.primary, fontSize: '0.78rem', fontWeight: 800 }}>
            {result.title}
          </Typography>
          <Typography sx={{ mt: 0.35, color: tokenText.secondary, fontSize: '0.72rem', lineHeight: 1.5 }}>
            {result.summary}
          </Typography>
          <Typography sx={{ mt: 0.45, color: tokenText.secondary, fontSize: '0.72rem', lineHeight: 1.5 }}>
            Recommendation: {result.recommendation}
          </Typography>

          <Box sx={{ mt: 1, display: 'grid', gap: 0.7 }}>
            {result.metrics.map((metric) => {
              const styles = getMetricStyles(metric.emphasis);
              return (
                <Box
                  key={metric.id}
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: '1fr auto auto auto' },
                    gap: 0.8,
                    alignItems: 'center',
                    p: 0.9,
                    borderRadius: '10px',
                    border: `1px solid ${tokenDivider}`,
                    bgcolor: '#fff',
                  }}
                >
                  <Typography sx={{ color: tokenText.primary, fontSize: '0.72rem', fontWeight: 800 }}>
                    {metric.label}
                  </Typography>
                  <Typography sx={{ color: tokenText.secondary, fontSize: '0.7rem' }}>
                    {metric.beforeLabel}
                  </Typography>
                  <Typography sx={{ color: tokenText.secondary, fontSize: '0.7rem' }}>
                    {metric.afterLabel}
                  </Typography>
                  <Box
                    sx={{
                      justifySelf: { xs: 'flex-start', md: 'end' },
                      px: 0.7,
                      py: 0.3,
                      borderRadius: 99,
                      bgcolor: styles.bg,
                      border: `1px solid ${styles.border}`,
                      color: styles.color,
                      fontSize: '0.68rem',
                      fontWeight: 800,
                    }}
                  >
                    {metric.deltaLabel}
                  </Box>
                </Box>
              );
            })}
          </Box>

          {result.blockers.length ? (
            <Box sx={{ mt: 0.9, display: 'grid', gap: 0.3 }}>
              {result.blockers.map((blocker) => (
                <Typography key={blocker} sx={{ color: tokenText.secondary, fontSize: '0.7rem', lineHeight: 1.45 }}>
                  • {blocker}
                </Typography>
              ))}
            </Box>
          ) : null}
          {result.agentCommentary?.length ? (
            <Box sx={{ mt: 1, display: 'grid', gap: 0.45 }}>
              {result.agentCommentary.map((item) => (
                <Typography key={`${item.agent}-${item.summary}`} sx={{ color: tokenText.secondary, fontSize: '0.69rem', lineHeight: 1.45 }}>
                  <Box component="span" sx={{ color: tokenText.primary, fontWeight: 800 }}>
                    {item.agent}
                  </Box>{' '}
                  · {item.summary}
                </Typography>
              ))}
            </Box>
          ) : null}
          {result.horizonImpacts?.length ? (
            <Box sx={{ mt: 1, display: 'grid', gap: 0.45 }}>
              {result.horizonImpacts.map((impact) => (
                <Typography key={impact.horizon} sx={{ color: tokenText.secondary, fontSize: '0.69rem', lineHeight: 1.45 }}>
                  <Box component="span" sx={{ color: tokenText.primary, fontWeight: 800, textTransform: 'capitalize' }}>
                    {impact.horizon}
                  </Box>{' '}
                  · {impact.badgeLabel} · {impact.summary}
                </Typography>
              ))}
            </Box>
          ) : null}
          {result.approvalRequests?.length ? (
            <Box sx={{ mt: 0.9, display: 'grid', gap: 0.35 }}>
              {result.approvalRequests.map((request) => (
                <Typography key={request.id} sx={{ color: tokenText.secondary, fontSize: '0.69rem', lineHeight: 1.45 }}>
                  <Box component="span" sx={{ color: tokenText.primary, fontWeight: 800 }}>
                    Approval
                  </Box>{' '}
                  · {request.title}
                </Typography>
              ))}
            </Box>
          ) : null}
          {result.coverageSummary ? (
            <Typography sx={{ mt: 0.9, color: tokenText.secondary, fontSize: '0.69rem', lineHeight: 1.45 }}>
              Coverage score {result.coverageSummary.coverageScore}. Constrained zones:{' '}
              {result.coverageSummary.constrainedZones.join(', ') || 'none visible'}.
            </Typography>
          ) : null}
          {onAddToReview ? (
            <Box sx={{ mt: 1.1, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                size="small"
                variant="contained"
                onClick={onAddToReview}
                sx={{
                  minHeight: 32,
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontWeight: 800,
                  boxShadow: 'none',
                  bgcolor: tokenBrand.main,
                  '&:hover': { boxShadow: 'none', bgcolor: tokenBrand.dark },
                }}
              >
                Add to plan review
              </Button>
            </Box>
          ) : null}
        </Box>
      ) : null}
    </Paper>
  );
}
