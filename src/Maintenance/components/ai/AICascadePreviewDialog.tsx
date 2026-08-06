import {
  CalendarMonth as MonthlyIcon,
  CheckCircleOutline as CheckIcon,
  Event as WeeklyIcon,
  ExpandMore as ExpandMoreIcon,
  Insights as QuarterlyIcon,
  Public as AnnualIcon,
  WarningAmber as WarningIcon,
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
import type {
  PlannerAiApprovalRequest,
  PlannerAiCascadeImpact,
  PlannerAiCascadeMetricDelta,
  PlannerAiCascadePreview,
} from '../../ai/types';
import { AIApprovalWorkflowPanel } from './AIApprovalWorkflowPanel';
import { AIBundleCard } from './AIBundleCard';
import { AICoverageHeatmap } from './AICoverageHeatmap';
import { PlannerAiWorkflowStepper } from './PlannerAiWorkflowStepper';

type AICascadePreviewDialogProps = {
  open: boolean;
  preview: PlannerAiCascadePreview | null;
  canConfirm: boolean;
  resolvedApprovalRequests: PlannerAiApprovalRequest[];
  onClose: () => void;
  onConfirm: () => void;
  onApproveStep: (requestId: string, stepId: string) => void;
  onRejectStep: (requestId: string, stepId: string, comment: string) => boolean;
  onOverride: (comment: string) => boolean;
};

type ApplyTab = 'overview' | 'horizons' | 'coverage';

function getMetricStyles(emphasis: PlannerAiCascadeMetricDelta['emphasis']) {
  if (emphasis === 'positive') {
    return { bg: '#ECFDF3', border: '#BBF7D0', color: tokenSuccess.dark };
  }
  if (emphasis === 'negative') {
    return { bg: '#FEF2F2', border: '#FECACA', color: tokenError.dark };
  }
  return { bg: '#F8FAFC', border: '#CBD5E1', color: tokenText.secondary };
}

function getHorizonMeta(horizon: PlannerAiCascadeImpact['horizon']) {
  const blue = {
    color: tokenBrand.main,
    bg: '#EFF6FF',
    border: '#BFDBFE',
  };

  switch (horizon) {
    case 'monthly':
      return { label: 'Monthly', icon: MonthlyIcon, ...blue };
    case 'quarterly':
      return { label: 'Quarterly', icon: QuarterlyIcon, ...blue };
    case 'annual':
      return { label: 'Annual', icon: AnnualIcon, ...blue };
    default:
      return { label: 'Weekly', icon: WeeklyIcon, ...blue };
  }
}

function CascadeMetricRow({ metric }: { metric: PlannerAiCascadeMetricDelta }) {
  const styles = getMetricStyles(metric.emphasis);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
      <Typography sx={{ flex: '1 1 120px', fontSize: '0.72rem', fontWeight: 700, color: tokenText.primary }}>
        {metric.label}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0 }}>
        <Typography sx={{ fontSize: '0.7rem', color: tokenText.secondary }}>{metric.beforeLabel}</Typography>
        <Typography sx={{ fontSize: '0.7rem', color: tokenText.secondary }}>→</Typography>
        <Typography sx={{ fontSize: '0.74rem', fontWeight: 800, color: tokenText.primary }}>{metric.afterLabel}</Typography>
      </Box>
      <Box
        sx={{
          px: 0.75,
          py: 0.2,
          borderRadius: 99,
          bgcolor: styles.bg,
          border: `1px solid ${styles.border}`,
          color: styles.color,
          fontSize: '0.66rem',
          fontWeight: 800,
          flexShrink: 0,
        }}
      >
        {metric.deltaLabel}
      </Box>
    </Box>
  );
}

function HorizonImpactCard({ impact }: { impact: PlannerAiCascadeImpact }) {
  const meta = getHorizonMeta(impact.horizon);
  const Icon = meta.icon;

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: '14px',
        border: `1px solid ${tokenDivider}`,
        bgcolor: 'background.paper',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          px: 1.5,
          py: 1.1,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          bgcolor: meta.bg,
          borderBottom: `1px solid ${meta.border}`,
        }}
      >
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: '10px',
            bgcolor: 'background.paper',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: `1px solid ${meta.border}`,
          }}
        >
          <Icon sx={{ fontSize: 17, color: meta.color }} />
        </Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography sx={{ fontSize: '0.8rem', fontWeight: 800, color: tokenText.primary, textTransform: 'capitalize' }}>
            {impact.horizon}
          </Typography>
          <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: meta.color }}>
            {impact.badgeLabel}
          </Typography>
        </Box>
      </Box>
      <Box sx={{ px: 1.5, py: 1.2 }}>
        <Typography sx={{ fontSize: '0.73rem', color: tokenText.secondary, lineHeight: 1.45, mb: 1 }}>
          {impact.summary}
        </Typography>
        <Box sx={{ display: 'grid', gap: 0.75 }}>
          {impact.metricDeltas.map((metric) => (
            <CascadeMetricRow key={metric.id} metric={metric} />
          ))}
        </Box>
      </Box>
    </Paper>
  );
}

function ApplyHero({
  preview,
  canConfirm,
  conflictCount,
  approvalCount,
}: {
  preview: PlannerAiCascadePreview;
  canConfirm: boolean;
  conflictCount: number;
  approvalCount: number;
}) {
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
          background: canConfirm
            ? 'linear-gradient(135deg, rgba(4,78,215,0.06) 0%, rgba(16,185,129,0.05) 100%)'
            : 'linear-gradient(135deg, rgba(249,115,22,0.06) 0%, rgba(4,78,215,0.04) 100%)',
          borderBottom: `1px solid ${tokenDivider}`,
        }}
      >
        <Typography sx={{ color: tokenBrand.main, fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase' }}>
          {preview.strategyLabel}
        </Typography>
        <Typography sx={{ mt: 0.3, color: tokenText.primary, fontSize: '0.95rem', fontWeight: 800, lineHeight: 1.35 }}>
          Ready to update the weekly board
        </Typography>
        <Typography sx={{ mt: 0.4, color: tokenText.secondary, fontSize: '0.76rem', lineHeight: 1.5 }}>
          {preview.recommendedApplySummary}
        </Typography>
      </Box>

      <Box sx={{ px: 2, py: 1.25, display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <CheckIcon sx={{ fontSize: 16, color: tokenBrand.main }} />
          <Typography sx={{ fontSize: '0.74rem', fontWeight: 700, color: tokenText.primary }}>
            {preview.selectedActionIds.length} action{preview.selectedActionIds.length === 1 ? '' : 's'} selected
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <CheckIcon sx={{ fontSize: 16, color: tokenSuccess.main }} />
          <Typography sx={{ fontSize: '0.74rem', fontWeight: 700, color: tokenText.primary }}>
            {preview.impacts.length} horizons affected
          </Typography>
        </Box>
        {conflictCount > 0 ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <WarningIcon sx={{ fontSize: 16, color: tokenWarning.main }} />
            <Typography sx={{ fontSize: '0.74rem', fontWeight: 700, color: tokenWarning.dark }}>
              {conflictCount} caution{conflictCount === 1 ? '' : 's'}
            </Typography>
          </Box>
        ) : null}
        {approvalCount > 0 ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <WarningIcon sx={{ fontSize: 16, color: tokenWarning.main }} />
            <Typography sx={{ fontSize: '0.74rem', fontWeight: 700, color: tokenWarning.dark }}>
              {approvalCount} approval gate{approvalCount === 1 ? '' : 's'}
            </Typography>
          </Box>
        ) : null}
      </Box>
    </Paper>
  );
}

function HorizonStrip({ impacts }: { impacts: PlannerAiCascadeImpact[] }) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' }, gap: 0.85 }}>
      {impacts.map((impact) => {
        const meta = getHorizonMeta(impact.horizon);
        const Icon = meta.icon;
        return (
          <Box
            key={impact.horizon}
            sx={{
              p: 1,
              borderRadius: '12px',
              border: `1px solid ${meta.border}`,
              bgcolor: meta.bg,
              textAlign: 'center',
            }}
          >
            <Icon sx={{ fontSize: 20, color: meta.color }} />
            <Typography sx={{ mt: 0.35, fontSize: '0.72rem', fontWeight: 800, color: tokenText.primary, textTransform: 'capitalize' }}>
              {impact.horizon}
            </Typography>
            <Typography sx={{ mt: 0.15, fontSize: '0.65rem', fontWeight: 700, color: meta.color, lineHeight: 1.3 }}>
              {impact.badgeLabel}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}

export function AICascadePreviewDialog({
  open,
  preview,
  canConfirm,
  resolvedApprovalRequests,
  onClose,
  onConfirm,
  onApproveStep,
  onRejectStep,
  onOverride,
}: AICascadePreviewDialogProps) {
  const [activeTab, setActiveTab] = useState<ApplyTab>('overview');

  useEffect(() => {
    if (open) {
      setActiveTab('overview');
    }
  }, [open, preview?.id]);

  const conflictCount = preview?.conflicts.length ?? 0;
  const blockerCount = preview?.conflicts.filter((c) => c.severity === 'blocker').length ?? 0;
  const approvalCount = resolvedApprovalRequests.length;

  const gapCount = preview?.coverageSummary.recommendations.length ?? 0;

  const handleTabChange = (_event: SyntheticEvent, nextTab: ApplyTab) => {
    setActiveTab(nextTab);
  };

  const needsApprovalPanel = useMemo(
    () => approvalCount > 0 && !canConfirm,
    [approvalCount, canConfirm],
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      aria-modal="true"
      aria-labelledby="cascade-preview-title"
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
          <PlannerAiWorkflowStepper activeStep={3} compact />
          <Typography id="cascade-preview-title" sx={{ color: tokenText.primary, fontSize: '0.92rem', fontWeight: 800 }}>
            Apply your plan
          </Typography>
        </Box>
      </DialogTitle>

      {preview ? (
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
            <Tab value="horizons" label={`Horizons (${preview.impacts.length})`} />
            <Tab value="coverage" label={`Coverage${gapCount ? ` (${gapCount})` : ''}`} />
          </Tabs>
        </Box>
      ) : null}

      <DialogContent sx={{ px: 2.5, py: 2, bgcolor: tokenNeutral.lightest }}>
        {preview ? (
          <Box sx={{ display: 'grid', gap: 1.5 }}>
            {activeTab === 'overview' ? (
              <>
                <ApplyHero
                  preview={preview}
                  canConfirm={canConfirm}
                  conflictCount={conflictCount}
                  approvalCount={approvalCount}
                />

                <Paper elevation={0} sx={{ borderRadius: '14px', border: `1px solid ${tokenDivider}`, p: 1.5, bgcolor: 'background.paper' }}>
                  <Typography sx={{ fontSize: '0.8rem', fontWeight: 800, color: tokenText.primary, mb: 1 }}>
                    Impact across horizons
                  </Typography>
                  <HorizonStrip impacts={preview.impacts} />
                </Paper>

                {conflictCount > 0 ? (
                  <Paper
                    elevation={0}
                    sx={{
                      borderRadius: '14px',
                      border: `1px solid ${blockerCount ? tokenError.light : tokenWarning.light}`,
                      p: 1.5,
                      bgcolor: blockerCount ? '#FEF2F2' : '#FFFBEB',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mb: 0.75 }}>
                      <WarningIcon sx={{ fontSize: 18, color: blockerCount ? tokenError.dark : tokenWarning.dark }} />
                      <Typography sx={{ fontSize: '0.8rem', fontWeight: 800, color: blockerCount ? tokenError.dark : tokenWarning.dark }}>
                        {conflictCount} conflict marker{conflictCount === 1 ? '' : 's'} to review
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'grid', gap: 0.55 }}>
                      {preview.conflicts.slice(0, 4).map((conflict) => (
                        <Typography key={conflict.id} sx={{ fontSize: '0.73rem', color: tokenText.secondary, lineHeight: 1.45 }}>
                          <Box component="span" sx={{ fontWeight: 800, color: tokenText.primary }}>
                            {conflict.title}
                          </Box>
                          {' — '}
                          {conflict.summary}
                        </Typography>
                      ))}
                    </Box>
                    {conflictCount > 4 ? (
                      <Button
                        size="small"
                        onClick={() => setActiveTab('horizons')}
                        sx={{ mt: 0.75, textTransform: 'none', fontWeight: 700, color: tokenBrand.main, p: 0 }}
                      >
                        See all conflicts
                      </Button>
                    ) : null}
                  </Paper>
                ) : (
                  <Paper
                    elevation={0}
                    sx={{ borderRadius: '14px', border: `1px solid ${tokenSuccess.light}`, p: 1.25, bgcolor: '#F0FDF4' }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                      <CheckIcon sx={{ fontSize: 18, color: tokenSuccess.dark }} />
                      <Typography sx={{ fontSize: '0.76rem', fontWeight: 700, color: tokenSuccess.dark }}>
                        No cascade conflicts blocking this change set
                      </Typography>
                    </Box>
                  </Paper>
                )}

                {needsApprovalPanel ? (
                  <AIApprovalWorkflowPanel
                    requests={resolvedApprovalRequests}
                    canConfirm={canConfirm}
                    onApproveStep={onApproveStep}
                    onRejectStep={onRejectStep}
                    onOverride={onOverride}
                  />
                ) : approvalCount === 0 ? (
                  <Paper elevation={0} sx={{ borderRadius: '14px', border: `1px solid ${tokenDivider}`, p: 1.25, bgcolor: 'background.paper' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                      <CheckIcon sx={{ fontSize: 18, color: tokenSuccess.dark }} />
                      <Typography sx={{ fontSize: '0.76rem', fontWeight: 700, color: tokenText.secondary }}>
                        No extra approvals required — you can confirm when ready
                      </Typography>
                    </Box>
                  </Paper>
                ) : null}

                {preview.bundles.length ? (
                  <Accordion
                    elevation={0}
                    sx={{ borderRadius: '12px !important', border: `1px solid ${tokenDivider}`, '&:before': { display: 'none' } }}
                  >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography sx={{ fontSize: '0.8rem', fontWeight: 800 }}>
                        Bundled packages ({preview.bundles.length})
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ pt: 0 }}>
                      <Box sx={{ display: 'grid', gap: 0.85 }}>
                        {preview.bundles.map((bundle) => (
                          <AIBundleCard key={bundle.id} bundle={bundle} />
                        ))}
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                ) : null}
              </>
            ) : null}

            {activeTab === 'horizons' ? (
              <Box sx={{ display: 'grid', gap: 1 }}>
                {preview.impacts.map((impact) => (
                  <HorizonImpactCard key={impact.horizon} impact={impact} />
                ))}

                {preview.conflicts.length ? (
                  <Paper elevation={0} sx={{ borderRadius: '14px', border: `1px solid ${tokenDivider}`, p: 1.5, bgcolor: 'background.paper' }}>
                    <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, mb: 1 }}>
                      All conflict markers ({preview.conflicts.length})
                    </Typography>
                    <Box sx={{ display: 'grid', gap: 0.75 }}>
                      {preview.conflicts.map((conflict) => (
                        <Box
                          key={conflict.id}
                          sx={{
                            p: 1.1,
                            borderRadius: '10px',
                            border: `1px solid ${conflict.severity === 'blocker' ? tokenError.light : tokenWarning.light}`,
                            bgcolor: conflict.severity === 'blocker' ? '#FEF2F2' : '#FFFBEB',
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
                  </Paper>
                ) : null}
              </Box>
            ) : null}

            {activeTab === 'coverage' ? (
              <AICoverageHeatmap summary={preview.coverageSummary} />
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
        }}
      >
        <Button onClick={onClose} sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700, color: tokenText.secondary }}>
          Back
        </Button>
        <Box sx={{ flex: 1 }} />
        <Button
          variant="contained"
          onClick={onConfirm}
          disabled={!preview}
          sx={{
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 800,
            boxShadow: 'none',
            bgcolor: tokenBrand.main,
            '&:hover': { bgcolor: tokenBrand.dark, boxShadow: 'none' },
          }}
        >
          {preview
            ? canConfirm
              ? `Confirm ${preview.selectedActionIds.length} board update${preview.selectedActionIds.length === 1 ? '' : 's'}`
              : `Confirm with open approvals (${preview.selectedActionIds.length})`
            : 'Resolve approvals to continue'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
