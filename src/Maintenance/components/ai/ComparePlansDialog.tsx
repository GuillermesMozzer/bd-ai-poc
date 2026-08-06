import {
  AutoAwesome as SparkleIcon,
  ExpandMore as ExpandMoreIcon,
  ThumbDownOutlined as WeaknessIcon,
  ThumbUpOutlined as StrengthIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { useMemo, type SyntheticEvent } from 'react';
import { buildStrategyComparisonInsights } from '../../ai/buildStrategyComparisonInsights';
import { tokenBrand, tokenDivider, tokenError, tokenNeutral, tokenSuccess, tokenText, tokenWarning } from '../../../workstation/theme';
import type { PlannerAiComparisonSession, PlannerAiPlanVariant } from '../../ai/types';
import { AIAgentReasoningPanel } from './AIAgentReasoningPanel';
import { AIBundleCard } from './AIBundleCard';
import { AILongTermMetricsPanel } from './AILongTermMetricsPanel';
import { AIPlanScheduleDeltaView } from './AIPlanScheduleDeltaView';
import { AIPlanTradeoffMatrix } from './AIPlanTradeoffMatrix';
import { AIStrategyComparisonTable } from './AIStrategyComparisonTable';
import { PlannerAiWorkflowStepper } from './PlannerAiWorkflowStepper';
import type { PlannerAiCompareDialogTab } from './plannerAiCompareDialog';

type ComparePlansDialogProps = {
  open: boolean;
  comparisonSession: PlannerAiComparisonSession | null;
  activeVariantId: string | null;
  activeTab: PlannerAiCompareDialogTab;
  onTabChange: (tab: PlannerAiCompareDialogTab) => void;
  onClose: () => void;
  onSelectVariant: (variantId: string) => void;
  onReviewVariant: (variantId: string) => void;
};

function SelectedStrategyHero({
  variant,
  allVariants,
}: {
  variant: PlannerAiPlanVariant;
  allVariants: PlannerAiPlanVariant[];
}) {
  const blockingAgents = variant.agentReasoning.filter((entry) => entry.stance === 'blocking').length;
  const insights = useMemo(
    () => buildStrategyComparisonInsights(variant, allVariants),
    [allVariants, variant],
  );

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: '14px',
        border: `1px solid ${tokenDivider}`,
        overflow: 'hidden',
        bgcolor: 'background.paper',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{
          px: 2,
          py: 1.6,
          background: 'linear-gradient(135deg, rgba(4,78,215,0.05) 0%, rgba(16,185,129,0.04) 100%)',
          borderBottom: `1px solid ${tokenDivider}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography sx={{ color: tokenBrand.main, fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase' }}>
              Selected · {variant.strategyLabel}
            </Typography>
            <Typography sx={{ mt: 0.35, color: tokenText.primary, fontSize: '0.92rem', fontWeight: 800, lineHeight: 1.35 }}>
              {variant.rationale.headline}
            </Typography>
            <Typography sx={{ mt: 0.45, color: tokenText.secondary, fontSize: '0.74rem', lineHeight: 1.5, maxWidth: 640 }}>
              {variant.strategyDescription}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              icon={<TrendingDownIcon sx={{ fontSize: '0.9rem !important' }} />}
              label={variant.summaryMetrics.annualCostDelta}
              sx={{
                height: 28,
                borderRadius: 99,
                bgcolor: '#ECFDF3',
                color: tokenSuccess.dark,
                border: '1px solid #BBF7D0',
                fontWeight: 800,
                '& .MuiChip-icon': { color: tokenSuccess.dark },
              }}
            />
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                border: `3px solid ${variant.confidence >= 80 ? tokenSuccess.main : tokenBrand.main}`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'background.paper',
              }}
            >
              <Typography sx={{ color: tokenText.primary, fontSize: '0.95rem', fontWeight: 800, lineHeight: 1 }}>
                {variant.confidence}%
              </Typography>
              <Typography sx={{ color: tokenText.secondary, fontSize: '0.55rem', fontWeight: 700 }}>
                confidence
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      <Box sx={{ px: 2, py: 1.5, flex: 1, display: 'grid', gap: 1.2 }}>
        <Box>
          <Typography sx={{ color: tokenText.primary, fontSize: '0.76rem', fontWeight: 800 }}>
            Why this strategy
          </Typography>
          <Typography sx={{ mt: 0.4, color: tokenText.secondary, fontSize: '0.74rem', lineHeight: 1.55 }}>
            {insights.summary}
          </Typography>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 1.1 }}>
          <Box
            sx={{
              p: 1.2,
              borderRadius: '10px',
              border: '1px solid #BBF7D0',
              bgcolor: '#F7FEF9',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mb: 0.7 }}>
              <StrengthIcon sx={{ fontSize: 16, color: tokenSuccess.dark }} />
              <Typography sx={{ color: tokenSuccess.dark, fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase' }}>
                Strengths
              </Typography>
            </Box>
            <Box sx={{ display: 'grid', gap: 0.55 }}>
              {insights.strengths.map((item) => (
                <Typography key={item} sx={{ color: tokenText.secondary, fontSize: '0.71rem', lineHeight: 1.5 }}>
                  • {item}
                </Typography>
              ))}
            </Box>
          </Box>

          <Box
            sx={{
              p: 1.2,
              borderRadius: '10px',
              border: `1px solid ${blockingAgents ? '#FECACA' : '#FED7AA'}`,
              bgcolor: blockingAgents ? '#FEF2F2' : '#FFFBEB',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mb: 0.7 }}>
              <WeaknessIcon sx={{ fontSize: 16, color: blockingAgents ? tokenError.main : tokenWarning.dark }} />
              <Typography
                sx={{
                  color: blockingAgents ? tokenError.main : tokenWarning.dark,
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                }}
              >
                Weaknesses & watch-outs
              </Typography>
            </Box>
            <Box sx={{ display: 'grid', gap: 0.55 }}>
              {insights.weaknesses.map((item) => (
                <Typography key={item} sx={{ color: tokenText.secondary, fontSize: '0.71rem', lineHeight: 1.5 }}>
                  • {item}
                </Typography>
              ))}
            </Box>
          </Box>
        </Box>

        {insights.beforeYouApply.length ? (
          <Box
            sx={{
              px: 1.2,
              py: 1,
              borderRadius: '10px',
              border: `1px solid ${tokenDivider}`,
              bgcolor: neutralInsightBg,
            }}
          >
            <Typography sx={{ color: tokenText.primary, fontSize: '0.72rem', fontWeight: 800 }}>
              Before you apply
            </Typography>
            <Box sx={{ mt: 0.5, display: 'grid', gap: 0.45 }}>
              {insights.beforeYouApply.map((item) => (
                <Typography key={item} sx={{ color: tokenText.secondary, fontSize: '0.7rem', lineHeight: 1.5 }}>
                  → {item}
                </Typography>
              ))}
            </Box>
          </Box>
        ) : null}
      </Box>
    </Paper>
  );
}

const neutralInsightBg = '#F8FAFC';

export function ComparePlansDialog({
  open,
  comparisonSession,
  activeVariantId,
  activeTab,
  onTabChange,
  onClose,
  onSelectVariant,
  onReviewVariant,
}: ComparePlansDialogProps) {
  const activeVariant =
    comparisonSession?.variants.find((variant) => variant.id === activeVariantId) ??
    comparisonSession?.variants.find((variant) => variant.id === comparisonSession.recommendedVariantId) ??
    comparisonSession?.variants[0] ??
    null;

  const handleTabChange = (_event: SyntheticEvent, nextTab: PlannerAiCompareDialogTab) => {
    onTabChange(nextTab);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xl"
      PaperProps={{
        sx: {
          borderRadius: '18px',
          border: `1px solid ${tokenDivider}`,
          overflow: 'hidden',
        },
      }}
    >
      <DialogTitle sx={{ px: 3, py: 2.2, borderBottom: `1px solid ${tokenDivider}` }}>
        <Box sx={{ display: 'grid', gap: 1.2 }}>
          <PlannerAiWorkflowStepper activeStep={1} compact />
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SparkleIcon sx={{ color: '#F97316', fontSize: 18 }} />
                <Typography sx={{ color: tokenBrand.main, fontSize: '0.82rem', fontWeight: 800 }}>
                  Step 1 · Compare strategies
                </Typography>
              </Box>
              <Typography sx={{ mt: 0.45, color: tokenText.primary, fontSize: '1rem', fontWeight: 800 }}>
                {comparisonSession?.label ?? 'BLU.AI Weekly Strategy Comparison'}
              </Typography>
              {comparisonSession ? (
                <Typography sx={{ mt: 0.35, color: tokenText.secondary, fontSize: '0.76rem' }}>
                  {comparisonSession.variants.length} scenarios · pick the best trade-off, then review changes in Step 2
                </Typography>
              ) : null}
            </Box>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 0, bgcolor: tokenNeutral.lightest }}>
        {comparisonSession && activeVariant ? (
          <Box sx={{ py: 2 }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              sx={{
                minHeight: 40,
                mb: 1.5,
                '& .MuiTab-root': {
                  minHeight: 40,
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                },
              }}
            >
              <Tab value="compare" label="Scorecard" />
              <Tab value="changes" label={`What changes (${activeVariant.scheduleDelta.length})`} />
              <Tab value="details" label="Agent & long-term" />
            </Tabs>

            {activeTab === 'compare' ? (
              <Box sx={{ display: 'grid', gap: 1.4 }}>
                <AIStrategyComparisonTable
                  comparisonSession={comparisonSession}
                  activeVariantId={activeVariant.id}
                  onSelectVariant={onSelectVariant}
                  onReviewVariant={onReviewVariant}
                />

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1.2fr 0.8fr' }, gap: 1.4 }}>
                  <SelectedStrategyHero variant={activeVariant} allVariants={comparisonSession.variants} />
                  <AIPlanTradeoffMatrix
                    variants={comparisonSession.variants}
                    activeVariantId={activeVariant.id}
                    onSelectVariant={onSelectVariant}
                  />
                </Box>
              </Box>
            ) : null}

            {activeTab === 'changes' ? (
              <Box sx={{ display: 'grid', gap: 1.4 }}>
                <SelectedStrategyHero variant={activeVariant} allVariants={comparisonSession.variants} />
                <AIPlanScheduleDeltaView variant={activeVariant} />
                {activeVariant.bundles.length ? (
                  <Paper elevation={0} sx={{ borderRadius: '12px', border: `1px solid ${tokenDivider}`, p: 1.8 }}>
                    <Typography sx={{ color: tokenText.primary, fontSize: '0.84rem', fontWeight: 800 }}>
                      Bundle opportunities
                    </Typography>
                    <Typography sx={{ mt: 0.35, color: tokenText.secondary, fontSize: '0.72rem', lineHeight: 1.45 }}>
                      Grouped shutdown windows that reduce stop-start overhead.
                    </Typography>
                    <Box sx={{ mt: 1.05, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 0.9 }}>
                      {activeVariant.bundles.map((bundle) => (
                        <AIBundleCard key={bundle.id} bundle={bundle} />
                      ))}
                    </Box>
                  </Paper>
                ) : null}
              </Box>
            ) : null}

            {activeTab === 'details' ? (
              <Box sx={{ display: 'grid', gap: 1.2 }}>
                <Accordion
                  defaultExpanded
                  elevation={0}
                  sx={{ borderRadius: '12px !important', border: `1px solid ${tokenDivider}`, '&:before': { display: 'none' } }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography sx={{ fontSize: '0.84rem', fontWeight: 800 }}>Agent feedback</Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ pt: 0 }}>
                    <AIAgentReasoningPanel variant={activeVariant} embedded />
                  </AccordionDetails>
                </Accordion>

                <Accordion
                  elevation={0}
                  sx={{ borderRadius: '12px !important', border: `1px solid ${tokenDivider}`, '&:before': { display: 'none' } }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography sx={{ fontSize: '0.84rem', fontWeight: 800 }}>Long-term impact</Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ pt: 0 }}>
                    <AILongTermMetricsPanel variant={activeVariant} compact />
                  </AccordionDetails>
                </Accordion>

                <Accordion elevation={0} sx={{ borderRadius: '12px !important', border: `1px solid ${tokenDivider}`, '&:before': { display: 'none' } }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography sx={{ fontSize: '0.84rem', fontWeight: 800 }}>Strategy rationale</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography sx={{ color: tokenText.secondary, fontSize: '0.74rem', lineHeight: 1.5 }}>
                      {activeVariant.narrative}
                    </Typography>
                    <Box sx={{ mt: 1, display: 'grid', gap: 0.5 }}>
                      {activeVariant.rationale.tradeoffs.map((tradeoff) => (
                        <Typography key={tradeoff} sx={{ color: tokenText.secondary, fontSize: '0.72rem', lineHeight: 1.45 }}>
                          • {tradeoff}
                        </Typography>
                      ))}
                    </Box>
                  </AccordionDetails>
                </Accordion>
              </Box>
            ) : null}
          </Box>
        ) : null}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: `1px solid ${tokenDivider}` }}>
        <Button
          onClick={onClose}
          sx={{
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 700,
            color: tokenText.secondary,
          }}
        >
          Close
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            if (activeVariant) {
              onReviewVariant(activeVariant.id);
            }
          }}
          disabled={!activeVariant}
          sx={{
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 800,
            boxShadow: 'none',
            bgcolor: tokenBrand.main,
            '&:hover': { bgcolor: tokenBrand.dark, boxShadow: 'none' },
          }}
        >
          Review
        </Button>
      </DialogActions>
    </Dialog>
  );
}
