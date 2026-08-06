import {
  AutoAwesome as SparkleIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  CompareArrows as CompareIcon,
  ExpandMore as ExpandMoreIcon,
  Shield as ShieldIcon,
  WarningAmber as WarningAmberIcon,
} from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useState, type SyntheticEvent } from 'react';
import {
  tokenBrand,
  tokenDivider,
  tokenError,
  tokenNeutral,
  tokenSuccess,
  tokenText,
  tokenWarning,
} from '../../../workstation/theme';
import type { PlannerAiPlanVariant } from '../../ai/types';
import { AIBundleCard } from './AIBundleCard';
import { AIFeasibilityChecklist } from './AIFeasibilityChecklist';
import { AIImpactMetricCard } from './AIImpactMetricCard';
import { AIScheduleChangesTable } from './AIScheduleChangesTable';
import { PlannerAiWorkflowStepper } from './PlannerAiWorkflowStepper';

type PreviewAiPlanDialogProps = {
  open: boolean;
  plan: PlannerAiPlanVariant | null;
  previewSource?: 'generated' | 'copilot' | 'what-if' | null;
  selectedActionIds: string[];
  selectedActionCount: number;
  onToggleAction: (actionId: string) => void;
  onSelectAllActions: () => void;
  onClearActionSelection: () => void;
  onClose: () => void;
  onApply: () => void;
  onComparePlans?: () => void;
};

type ReviewTab = 'overview' | 'changes' | 'details';

function getFeasibilitySummary(plan: PlannerAiPlanVariant) {
  const passed = plan.feasibilityChecklist.filter((item) => item.status === 'pass').length;
  const warnings = plan.feasibilityChecklist.filter((item) => item.status === 'warning').length;
  const blockers = plan.feasibilityChecklist.filter((item) => item.status === 'blocker').length;
  return { passed, warnings, blockers, total: plan.feasibilityChecklist.length };
}

function StrategyHero({ plan }: { plan: PlannerAiPlanVariant }) {
  const feasibility = getFeasibilitySummary(plan);
  const cautionCount = plan.agentConflicts.length;

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: '16px',
        border: `1px solid ${tokenDivider}`,
        bgcolor: 'background.paper',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          px: 2,
          py: 1.5,
          background: 'linear-gradient(135deg, rgba(4,78,215,0.06) 0%, rgba(249,115,22,0.04) 100%)',
          borderBottom: `1px solid ${tokenDivider}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ color: tokenBrand.main, fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase' }}>
              {plan.strategyLabel} strategy
            </Typography>
            <Typography sx={{ mt: 0.3, color: tokenText.primary, fontSize: '0.95rem', fontWeight: 800, lineHeight: 1.35 }}>
              {plan.rationale.headline}
            </Typography>
            <Typography sx={{ mt: 0.45, color: tokenText.secondary, fontSize: '0.76rem', lineHeight: 1.5, maxWidth: 560 }}>
              {plan.strategyDescription}
            </Typography>
          </Box>

          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              border: `4px solid ${plan.confidence >= 80 ? tokenSuccess.main : tokenBrand.main}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              bgcolor: 'background.paper',
            }}
          >
            <Typography sx={{ color: tokenText.primary, fontSize: '1.1rem', fontWeight: 800, lineHeight: 1 }}>
              {plan.confidence}%
            </Typography>
            <Typography sx={{ color: tokenText.secondary, fontSize: '0.58rem', fontWeight: 700, mt: 0.15 }}>
              confidence
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ px: 2, py: 1.25, display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <CheckCircleOutlineIcon sx={{ fontSize: 16, color: tokenSuccess.main }} />
          <Typography sx={{ fontSize: '0.74rem', fontWeight: 700, color: tokenText.primary }}>
            {feasibility.passed}/{feasibility.total} checks passed
          </Typography>
        </Box>
        {cautionCount > 0 ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <WarningAmberIcon sx={{ fontSize: 16, color: tokenWarning.main }} />
            <Typography sx={{ fontSize: '0.74rem', fontWeight: 700, color: tokenWarning.dark }}>
              {cautionCount} agent caution{cautionCount === 1 ? '' : 's'}
            </Typography>
          </Box>
        ) : null}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <ShieldIcon sx={{ fontSize: 16, color: tokenBrand.main }} />
          <Typography sx={{ fontSize: '0.74rem', fontWeight: 700, color: tokenText.secondary }}>
            {plan.actions.length} proposed action{plan.actions.length === 1 ? '' : 's'}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}

function AgentConsensusStrip({ plan }: { plan: PlannerAiPlanVariant }) {
  return (
    <Paper elevation={0} sx={{ borderRadius: '12px', border: `1px solid ${tokenDivider}`, p: 1.5, bgcolor: 'background.paper' }}>
      <Typography sx={{ color: tokenText.secondary, fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', mb: 1 }}>
        Agent consensus
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(5, 1fr)' }, gap: 1 }}>
        {plan.confidenceFactors.map((factor) => (
          <Box key={factor.label} sx={{ textAlign: 'center' }}>
            <Box
              sx={{
                mx: 'auto',
                width: 44,
                height: 44,
                borderRadius: '50%',
                border: `3px solid ${factor.value >= 85 ? tokenSuccess.main : factor.value >= 75 ? tokenBrand.main : tokenWarning.main}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: tokenText.primary }}>
                {factor.value}%
              </Typography>
            </Box>
            <Typography sx={{ mt: 0.5, fontSize: '0.66rem', fontWeight: 700, color: tokenText.secondary, lineHeight: 1.2 }}>
              {factor.label}
            </Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  );
}

export function PreviewAiPlanDialog({
  open,
  plan,
  previewSource = null,
  selectedActionIds,
  selectedActionCount,
  onToggleAction,
  onSelectAllActions,
  onClearActionSelection,
  onClose,
  onApply,
  onComparePlans,
}: PreviewAiPlanDialogProps) {
  const [activeTab, setActiveTab] = useState<ReviewTab>('overview');

  useEffect(() => {
    if (open) {
      setActiveTab('overview');
    }
  }, [open, plan?.id]);

  const primaryMetrics = useMemo(() => {
    if (!plan) {
      return [];
    }
    const priority = ['breakdown-risk', 'pm-compliance', 'planned-downtime', 'parts-readiness', 'open-backlog'];
    return [...plan.impactMetrics].sort(
      (left, right) => priority.indexOf(left.id) - priority.indexOf(right.id),
    );
  }, [plan]);

  const handleTabChange = (_event: SyntheticEvent, nextTab: ReviewTab) => {
    setActiveTab(nextTab);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: '18px',
          border: `1px solid ${tokenDivider}`,
          overflow: 'hidden',
          maxHeight: '92vh',
        },
      }}
    >
      <DialogTitle sx={{ px: 2.5, py: 2, borderBottom: `1px solid ${tokenDivider}`, bgcolor: 'background.paper' }}>
        <Box sx={{ display: 'grid', gap: 1.1 }}>
          <PlannerAiWorkflowStepper activeStep={2} compact />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <SparkleIcon sx={{ color: '#F97316', fontSize: 17 }} />
            <Typography sx={{ color: tokenText.primary, fontSize: '0.92rem', fontWeight: 800 }}>
              Review your plan
              {previewSource === 'copilot' ? ' · Copilot' : previewSource === 'what-if' ? ' · What-if' : ''}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      {plan ? (
        <Box sx={{ px: 2.5, pt: 0, bgcolor: tokenNeutral.lightest, borderBottom: `1px solid ${tokenDivider}` }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              minHeight: 40,
              '& .MuiTab-root': {
                minHeight: 40,
                py: 0.75,
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.8rem',
              },
            }}
          >
            <Tab value="overview" label="Overview" />
            <Tab value="changes" label={`Changes (${plan.actions.length})`} />
            <Tab value="details" label="Details" />
          </Tabs>
        </Box>
      ) : null}

      <DialogContent sx={{ px: 2.5, py: 2, bgcolor: tokenNeutral.lightest }}>
        {plan ? (
          <Box sx={{ display: 'grid', gap: 1.5 }}>
            {activeTab === 'overview' ? (
              <>
                <StrategyHero plan={plan} />
                <AgentConsensusStrip plan={plan} />

                <Paper elevation={0} sx={{ borderRadius: '14px', border: `1px solid ${tokenDivider}`, p: 1.75, bgcolor: 'background.paper' }}>
                  <Typography sx={{ color: tokenText.primary, fontSize: '0.82rem', fontWeight: 800, mb: 1.25 }}>
                    Impact at a glance
                  </Typography>
                  <Box sx={{ display: 'grid', gap: 1.1 }}>
                    {primaryMetrics.map((metric) => (
                      <AIImpactMetricCard key={metric.id} metric={metric} compact />
                    ))}
                  </Box>
                </Paper>

                {plan.agentConflicts.length ? (
                  <Paper elevation={0} sx={{ borderRadius: '14px', border: `1px solid ${tokenWarning.light}`, p: 1.5, bgcolor: '#FFFBEB' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mb: 0.75 }}>
                      <WarningAmberIcon sx={{ fontSize: 18, color: tokenWarning.dark }} />
                      <Typography sx={{ fontSize: '0.8rem', fontWeight: 800, color: tokenWarning.dark }}>
                        {plan.agentConflicts.length} item{plan.agentConflicts.length === 1 ? '' : 's'} need a quick review
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'grid', gap: 0.6 }}>
                      {plan.agentConflicts.slice(0, 3).map((conflict) => (
                        <Typography key={conflict.id} sx={{ fontSize: '0.73rem', color: tokenText.secondary, lineHeight: 1.45 }}>
                          <Box component="span" sx={{ fontWeight: 800, color: tokenText.primary }}>
                            {conflict.title.replace(' cross-agent caution', '')}
                          </Box>
                          {' — '}
                          {conflict.agents.join(' & ')} flagged this. Review before applying.
                        </Typography>
                      ))}
                    </Box>
                    {plan.agentConflicts.length > 3 ? (
                      <Button
                        size="small"
                        onClick={() => setActiveTab('details')}
                        sx={{ mt: 0.75, textTransform: 'none', fontWeight: 700, color: tokenBrand.main, p: 0 }}
                      >
                        See all in Details
                      </Button>
                    ) : null}
                  </Paper>
                ) : null}
              </>
            ) : null}

            {activeTab === 'changes' ? (
              <AIScheduleChangesTable
                actions={plan.actions}
                selectedActionIds={selectedActionIds}
                onToggleAction={onToggleAction}
                onSelectAllActions={onSelectAllActions}
                onClearActionSelection={onClearActionSelection}
              />
            ) : null}

            {activeTab === 'details' ? (
              <Box sx={{ display: 'grid', gap: 1 }}>
                <AIFeasibilityChecklist items={plan.feasibilityChecklist} />

                {plan.agentConflicts.length ? (
                  <Accordion
                    defaultExpanded
                    elevation={0}
                    sx={{ borderRadius: '12px !important', border: `1px solid ${tokenDivider}`, '&:before': { display: 'none' } }}
                  >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography sx={{ fontSize: '0.82rem', fontWeight: 800 }}>
                        Agent cautions ({plan.agentConflicts.length})
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ pt: 0 }}>
                      <Box sx={{ display: 'grid', gap: 0.75 }}>
                        {plan.agentConflicts.map((conflict) => (
                          <Box
                            key={conflict.id}
                            sx={{
                              p: 1.1,
                              borderRadius: '10px',
                              border: `1px solid ${conflict.severity === 'blocker' ? tokenError.light : tokenWarning.light}`,
                              bgcolor: 'background.paper',
                            }}
                          >
                            <Typography sx={{ fontSize: '0.76rem', fontWeight: 800, color: tokenText.primary }}>
                              {conflict.title}
                            </Typography>
                            <Typography sx={{ mt: 0.25, fontSize: '0.72rem', color: tokenText.secondary, lineHeight: 1.45 }}>
                              {conflict.summary}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                ) : null}

                {plan.riskCallouts.length ? (
                  <Accordion
                    elevation={0}
                    sx={{ borderRadius: '12px !important', border: `1px solid ${tokenDivider}`, '&:before': { display: 'none' } }}
                  >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography sx={{ fontSize: '0.82rem', fontWeight: 800 }}>
                        CBM risk signals ({plan.riskCallouts.length})
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ pt: 0 }}>
                      <Box sx={{ display: 'grid', gap: 0.75 }}>
                        {plan.riskCallouts.map((signal) => (
                          <Box key={signal.id} sx={{ display: 'flex', gap: 0.75, alignItems: 'flex-start' }}>
                            <WarningAmberIcon sx={{ fontSize: 16, color: '#EA580C', mt: 0.15 }} />
                            <Typography sx={{ fontSize: '0.73rem', color: tokenText.secondary, lineHeight: 1.45 }}>
                              <Box component="span" sx={{ fontWeight: 800, color: tokenText.primary }}>
                                {signal.asset}
                              </Box>
                              {' · '}
                              {signal.metric} {signal.currentReading} · {signal.daysToFailure}d to failure
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                ) : null}

                {plan.bundles.length ? (
                  <Accordion
                    elevation={0}
                    sx={{ borderRadius: '12px !important', border: `1px solid ${tokenDivider}`, '&:before': { display: 'none' } }}
                  >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography sx={{ fontSize: '0.82rem', fontWeight: 800 }}>
                        Bundled packages ({plan.bundles.length})
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ pt: 0 }}>
                      <Box sx={{ display: 'grid', gap: 0.85 }}>
                        {plan.bundles.map((bundle) => (
                          <AIBundleCard key={bundle.id} bundle={bundle} />
                        ))}
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                ) : null}
              </Box>
            ) : null}
          </Box>
        ) : null}
      </DialogContent>

      <DialogActions
        sx={{
          px: 2.5,
          py: 1.75,
          borderTop: `1px solid ${tokenDivider}`,
          bgcolor: 'background.paper',
          gap: 0.75,
          flexWrap: 'wrap',
        }}
      >
        <Button onClick={onClose} sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700, color: tokenText.secondary }}>
          Cancel
        </Button>
        <Box sx={{ flex: 1 }} />
        {onComparePlans ? (
          <Button
            onClick={onComparePlans}
            startIcon={<CompareIcon sx={{ fontSize: 16 }} />}
            variant="outlined"
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 700,
              borderColor: tokenBrand.main,
              color: tokenBrand.main,
            }}
          >
            Compare strategies
          </Button>
        ) : null}
        <Button
          variant="contained"
          onClick={onApply}
          disabled={selectedActionCount === 0}
          sx={{
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 800,
            boxShadow: 'none',
            bgcolor: tokenBrand.main,
            '&:hover': { bgcolor: tokenBrand.dark, boxShadow: 'none' },
          }}
        >
          {selectedActionCount === 0
            ? 'Select actions to continue'
            : `Apply ${selectedActionCount} change${selectedActionCount === 1 ? '' : 's'}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
