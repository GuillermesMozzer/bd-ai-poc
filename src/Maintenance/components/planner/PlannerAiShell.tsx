import { ExpandLess as ExpandLessIcon, ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { Box, Collapse, IconButton, Paper, Typography } from '@mui/material';
import { useState } from 'react';
import { tokenDivider, tokenText } from '../../../workstation/theme';
import { usePlannerAi } from '../../hooks/usePlannerAi';
import { AICascadePreviewDialog } from '../ai/AICascadePreviewDialog';
import { AIGapAnalysisPanel } from '../ai/AIGapAnalysisPanel';
import { AIHorizonImpactBadges } from '../ai/AIHorizonImpactBadges';
import { ComparePlansDialog } from '../ai/ComparePlansDialog';
import { PreviewAiPlanDialog } from '../ai/PreviewAiPlanDialog';

type PlannerAiShellProps = {
  section: 'footer' | 'dialogs';
  plannerAi: ReturnType<typeof usePlannerAi>;
  onApplyAiPlan: () => void;
  onConfirmCascadeApply: () => void;
};

function CollapsibleGapAnalysis({ summary }: { summary: ReturnType<typeof usePlannerAi>['coverageSummary'] }) {
  const [expanded, setExpanded] = useState(false);
  const gapCount = summary.recommendations.length;

  if (!gapCount) {
    return null;
  }

  return (
    <Paper elevation={0} sx={{ borderRadius: '12px', border: `1px solid ${tokenDivider}`, overflow: 'hidden' }}>
      <Box
        sx={{
          px: 1.4,
          py: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          bgcolor: 'background.paper',
        }}
      >
        <Box>
          <Typography sx={{ color: tokenText.primary, fontSize: '0.8rem', fontWeight: 800 }}>
            Coverage gap analysis
          </Typography>
          <Typography sx={{ mt: 0.2, color: tokenText.secondary, fontSize: '0.7rem' }}>
            {gapCount} thin or critical staffing cell{gapCount === 1 ? '' : 's'} detected
          </Typography>
        </Box>
        <IconButton
          size="small"
          onClick={() => setExpanded((current) => !current)}
          aria-label={expanded ? 'Collapse gap analysis' : 'Expand gap analysis'}
        >
          {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
        </IconButton>
      </Box>
      <Collapse in={expanded} unmountOnExit>
        <Box sx={{ px: 1.2, pb: 1.2 }}>
          <AIGapAnalysisPanel summary={summary} />
        </Box>
      </Collapse>
    </Paper>
  );
}

export function PlannerAiShell({
  section,
  plannerAi,
  onApplyAiPlan,
  onConfirmCascadeApply,
}: PlannerAiShellProps) {
  if (section === 'footer') {
    if (plannerAi.undoSnapshot || plannerAi.appliedCascadePreview) {
      return null;
    }

    const hasImpacts = plannerAi.horizonImpacts.length > 0;
    const hasGaps = plannerAi.coverageSummary.recommendations.length > 0 && Boolean(plannerAi.generatedPlan);

    if (!hasImpacts && !hasGaps) {
      return null;
    }

    return (
      <Box sx={{ display: 'grid', gap: 1.2 }}>
        {hasImpacts ? (
          <AIHorizonImpactBadges impacts={plannerAi.horizonImpacts} activeHorizon={plannerAi.assistantHorizon} />
        ) : null}


        {hasGaps ? <CollapsibleGapAnalysis summary={plannerAi.coverageSummary} /> : null}
      </Box>
    );
  }

  return (
    <>
      <PreviewAiPlanDialog
        open={plannerAi.isPreviewOpen}
        plan={plannerAi.previewPlan}
        previewSource={plannerAi.reviewPlanSource}
        selectedActionIds={plannerAi.selectedActionIds}
        selectedActionCount={plannerAi.selectedActionCount}
        onClose={plannerAi.closePreview}
        onToggleAction={plannerAi.toggleActionSelection}
        onSelectAllActions={plannerAi.selectAllActions}
        onClearActionSelection={plannerAi.clearActionSelection}
        onApply={onApplyAiPlan}
        onComparePlans={plannerAi.reviewPlan ? undefined : plannerAi.comparisonSession ? plannerAi.openCompare : undefined}
      />
      <ComparePlansDialog
        open={plannerAi.isCompareOpen}
        comparisonSession={plannerAi.comparisonSession}
        activeVariantId={plannerAi.activeVariantId}
        activeTab={plannerAi.compareDialogTab}
        onTabChange={plannerAi.setCompareDialogTab}
        onClose={plannerAi.closeCompare}
        onSelectVariant={plannerAi.setActiveVariant}
        onReviewVariant={plannerAi.activateVariantAndOpenPreview}
      />
      <AICascadePreviewDialog
        open={plannerAi.isCascadePreviewOpen}
        preview={plannerAi.cascadePreview}
        canConfirm={plannerAi.approval.canConfirm}
        resolvedApprovalRequests={plannerAi.approval.resolvedRequests}
        onClose={plannerAi.closeCascadePreview}
        onConfirm={onConfirmCascadeApply}
        onApproveStep={plannerAi.approval.approveStep}
        onRejectStep={plannerAi.approval.rejectStep}
        onOverride={plannerAi.approval.overrideWithComment}
      />
    </>
  );
}
