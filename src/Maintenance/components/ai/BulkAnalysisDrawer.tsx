import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AutoAwesome as SparkleIcon,
  Check as CheckIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  Drawer,
  IconButton,
  Paper,
  Typography,
} from '@mui/material';
import { activeTheme } from '../../../theme';
import type {
  BulkAnalysisAction,
  BulkAnalysisResult,
  BulkRecommendation,
} from '../../ai/planningAgent/bulkAnalysis';

type BulkAnalysisDrawerProps = {
  open: boolean;
  result: BulkAnalysisResult | null;
  onClose: () => void;
  onApply: (recommendation: BulkRecommendation) => void;
  onApplyAll: (recommendations: BulkRecommendation[]) => void;
};

const actionMeta: Record<BulkAnalysisAction, { label: string; color: string; bg: string }> = {
  'absorb-pm': { label: 'Absorb PM', color: '#0F766E', bg: '#CCFBF1' },
  link: { label: 'Link', color: '#15803D', bg: '#DCFCE7' },
  'group-line': { label: 'Line batch', color: '#7C3AED', bg: '#F3E8FF' },
  group: { label: 'Group', color: '#6D28D9', bg: '#EDE9FE' },
  create: { label: 'New WO', color: activeTheme.primary, bg: '#EFF6FF' },
};

const priorityDotColor: Record<string, string> = {
  Emergency: '#DC2626',
  Immediate: '#EA580C',
  High: '#D97706',
  Medium: '#CA8A04',
  Low: '#16A34A',
  'Very Low': '#0EA5E9',
};

const thinkingStepDelayMs = 680;

function confidenceTone(confidence: number) {
  if (confidence >= 85) return { dot: '#16A34A', label: '#166534' };
  if (confidence >= 70) return { dot: '#64748B', label: '#475569' };
  return { dot: '#D97706', label: '#92400E' };
}

function formatCurrency(value: number) {
  return `$${value.toLocaleString()}`;
}

function ThinkingReveal({ result, visibleStepCount }: { result: BulkAnalysisResult; visibleStepCount: number }) {
  const steps = [
    `Scanning ${result.totalRequests} maintenance requests`,
    'Clustering by production line and equipment family',
    'Checking existing Work Orders and upcoming PMs',
    'Evaluating spare parts and technician overlap',
    'Estimating downtime, trips, and cost impact',
  ];

  return (
    <Paper elevation={0} sx={{ p: 1.2, borderRadius: 1.5, border: '1px solid #E5E7EB', bgcolor: activeTheme.backgroundPaper }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.55, mb: 0.8 }}>
        <SparkleIcon sx={{ fontSize: 16, color: '#F97316' }} />
        <Typography sx={{ color: activeTheme.textPrimary, fontSize: '0.76rem', fontWeight: 850 }}>
          BLU.AI is analyzing your backlog...
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.55 }}>
        {steps.map((step, index) => {
          const done = index < visibleStepCount;
          const active = index === visibleStepCount;
          return (
            <Box key={step} sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
              <Box
                sx={{
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  border: '1px solid #CBD5E1',
                  display: 'grid',
                  placeItems: 'center',
                  bgcolor: done ? '#F0FDF4' : activeTheme.backgroundPaper,
                }}
              >
                {done ? <CheckIcon sx={{ fontSize: 10, color: '#16A34A' }} /> : null}
              </Box>
              <Typography
                sx={{
                  color: done ? activeTheme.textPrimary : active ? activeTheme.textPrimary : activeTheme.textSecondary,
                  fontSize: '0.7rem',
                  fontWeight: done || active ? 750 : 650,
                  lineHeight: 1.3,
                }}
              >
                {step}
                {active ? '...' : ''}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
}

function ImpactDashboard({ result }: { result: BulkAnalysisResult }) {
  const reduction = Math.max(result.workOrdersBefore - result.workOrdersAfter, 0);
  const beforeWidth = 100;
  const afterWidth = result.workOrdersBefore > 0 ? Math.max((result.workOrdersAfter / result.workOrdersBefore) * 100, 18) : 100;

  return (
    <Paper elevation={0} sx={{ p: 1.2, borderRadius: 1.5, border: '1px solid #E5E7EB', bgcolor: activeTheme.backgroundPaper }}>
      <Typography sx={{ color: activeTheme.textPrimary, fontSize: '0.76rem', fontWeight: 650, lineHeight: 1.4, mb: 0.9 }}>
        {result.summary}
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0.6, mb: 1 }}>
        {[
          ['Downtime saved', `${result.downtimeHoursSaved}h`],
          ['Trips saved', String(result.technicianTripsSaved)],
          ['Est. cost saved', formatCurrency(result.estimatedCostSaved)],
        ].map(([label, value]) => (
          <Box key={label} sx={{ p: 0.8, borderRadius: 1.2, bgcolor: activeTheme.backgroundDefault, textAlign: 'center' }}>
            <Typography sx={{ color: activeTheme.primary, fontSize: '1rem', fontWeight: 900, lineHeight: 1 }}>
              {value}
            </Typography>
            <Typography sx={{ color: activeTheme.textSecondary, fontSize: '0.56rem', fontWeight: 800, textTransform: 'uppercase', mt: 0.3 }}>
              {label}
            </Typography>
          </Box>
        ))}
      </Box>

      <Box sx={{ p: 0.9, borderRadius: 1.2, bgcolor: activeTheme.backgroundDefault }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 0.8, mb: 0.55 }}>
          <Typography sx={{ color: activeTheme.textSecondary, fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase' }}>
            Work Orders
          </Typography>
          <Typography sx={{ color: activeTheme.textPrimary, fontSize: '0.68rem', fontWeight: 850 }}>
            {result.workOrdersBefore} → {result.workOrdersAfter}
            {reduction > 0 ? ` (−${reduction})` : ''}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.45 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
            <Typography sx={{ color: activeTheme.textSecondary, fontSize: '0.62rem', fontWeight: 700, width: 42 }}>
              Before
            </Typography>
            <Box sx={{ flex: 1, height: 8, borderRadius: 99, bgcolor: '#E2E8F0', overflow: 'hidden' }}>
              <Box sx={{ width: `${beforeWidth}%`, height: '100%', bgcolor: '#94A3B8' }} />
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
            <Typography sx={{ color: activeTheme.textSecondary, fontSize: '0.62rem', fontWeight: 700, width: 42 }}>
              After
            </Typography>
            <Box sx={{ flex: 1, height: 8, borderRadius: 99, bgcolor: '#E2E8F0', overflow: 'hidden' }}>
              <Box sx={{ width: `${afterWidth}%`, height: '100%', bgcolor: activeTheme.primary }} />
            </Box>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
}

function RecommendationCard({
  recommendation,
  applied,
  onApply,
}: {
  recommendation: BulkRecommendation;
  applied: boolean;
  onApply: () => void;
}) {
  const meta = actionMeta[recommendation.action];
  const confidence = confidenceTone(recommendation.confidence);

  return (
    <Paper elevation={0} sx={{ p: 1.2, borderRadius: 1.5, border: '1px solid #E5E7EB', bgcolor: activeTheme.backgroundPaper }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 0.8, mb: 0.7 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0, flexWrap: 'wrap' }}>
          <Chip
            label={meta.label}
            size="small"
            sx={{ height: 20, fontSize: '0.6rem', fontWeight: 900, bgcolor: meta.bg, color: meta.color }}
          />
          <Chip
            label={`${recommendation.confidence}% confident`}
            size="small"
            icon={<Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: confidence.dot, ml: 0.5 }} />}
            sx={{ height: 20, fontSize: '0.58rem', fontWeight: 800, color: confidence.label }}
          />
        </Box>
      </Box>

      <Typography sx={{ color: activeTheme.textPrimary, fontSize: '0.78rem', fontWeight: 850, lineHeight: 1.2, mb: 0.7 }}>
        {recommendation.headline}
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.35, mb: 0.7 }}>
        {recommendation.requests.map((request) => (
          <Box key={request.cardId} sx={{ display: 'flex', alignItems: 'center', gap: 0.55, flexWrap: 'wrap' }}>
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: priorityDotColor[request.priority] ?? '#94A3B8', flexShrink: 0 }} />
            <Typography sx={{ color: activeTheme.textPrimary, fontSize: '0.71rem', fontWeight: 700, lineHeight: 1.25 }}>
              {request.title}
            </Typography>
            <Typography sx={{ color: activeTheme.textSecondary, fontSize: '0.64rem', fontWeight: 700 }}>
              {request.requestId} • {request.priority}
            </Typography>
          </Box>
        ))}
      </Box>

      {recommendation.linkedTarget ? (
        <Typography sx={{ color: activeTheme.textSecondary, fontSize: '0.66rem', fontWeight: 700, mb: 0.55 }}>
          Target: {recommendation.linkedTarget.title}
        </Typography>
      ) : null}

      {recommendation.sharedParts?.length ? (
        <Box sx={{ display: 'flex', gap: 0.4, flexWrap: 'wrap', mb: 0.7 }}>
          {recommendation.sharedParts.map((part) => (
            <Chip key={part} label={part} size="small" sx={{ height: 20, fontSize: '0.58rem', fontWeight: 750 }} />
          ))}
        </Box>
      ) : null}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.4, mb: 0.85 }}>
        {recommendation.reasons.map((reason) => (
          <Box key={reason.label} sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.55 }}>
            <Box
              sx={{
                mt: 0.4,
                width: 5,
                height: 5,
                borderRadius: '50%',
                flexShrink: 0,
                bgcolor:
                  reason.tone === 'critical'
                    ? '#DC2626'
                    : reason.tone === 'warning'
                      ? '#D97706'
                      : reason.tone === 'positive'
                        ? '#16A34A'
                        : '#94A3B8',
              }}
            />
            <Typography sx={{ color: activeTheme.textSecondary, fontSize: '0.68rem', fontWeight: 600, lineHeight: 1.3 }}>
              {reason.label}
            </Typography>
          </Box>
        ))}
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 0.8 }}>
        <Chip
          label={recommendation.benefit}
          size="small"
          sx={{ height: 20, fontSize: '0.6rem', fontWeight: 800, bgcolor: activeTheme.backgroundDefault, color: activeTheme.textSecondary }}
        />
        {applied ? (
          <Chip
            icon={<CheckIcon sx={{ fontSize: 14 }} />}
            label="Applied"
            size="small"
            sx={{ height: 24, fontSize: '0.64rem', fontWeight: 800, bgcolor: '#F0FDF4', color: '#166534' }}
          />
        ) : (
          <Button
            size="small"
            variant="outlined"
            onClick={onApply}
            sx={{ textTransform: 'none', fontWeight: 800, borderRadius: 1, fontSize: '0.7rem', py: 0.2 }}
          >
            Apply
          </Button>
        )}
      </Box>
    </Paper>
  );
}

function isOptimizationAction(action: BulkAnalysisAction) {
  return action === 'absorb-pm' || action === 'link' || action === 'group-line' || action === 'group';
}

export function BulkAnalysisDrawer({ open, result, onClose, onApply, onApplyAll }: BulkAnalysisDrawerProps) {
  const [appliedIds, setAppliedIds] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [visibleThinkingSteps, setVisibleThinkingSteps] = useState(0);
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];

    if (!open || !result) {
      setIsAnalyzing(false);
      setVisibleThinkingSteps(0);
      return;
    }

    setAppliedIds([]);
    setIsAnalyzing(true);
    setVisibleThinkingSteps(0);

    const thinkingSteps = 5;
    for (let index = 0; index < thinkingSteps; index += 1) {
      const timer = window.setTimeout(() => {
        setVisibleThinkingSteps(index + 1);
      }, thinkingStepDelayMs + index * thinkingStepDelayMs);
      timersRef.current.push(timer);
    }

    const revealTimer = window.setTimeout(() => {
      setIsAnalyzing(false);
    }, thinkingStepDelayMs * (thinkingSteps + 1));
    timersRef.current.push(revealTimer);

    return () => {
      timersRef.current.forEach((timer) => window.clearTimeout(timer));
      timersRef.current = [];
    };
  }, [open, result]);

  const pendingRecommendations = useMemo(
    () => (result?.recommendations ?? []).filter((rec) => !appliedIds.includes(rec.id)),
    [appliedIds, result],
  );

  const handleApply = (recommendation: BulkRecommendation) => {
    onApply(recommendation);
    setAppliedIds((current) => [...current, recommendation.id]);
  };

  const handleApplyAll = () => {
    onApplyAll(pendingRecommendations);
    setAppliedIds((result?.recommendations ?? []).map((rec) => rec.id));
  };

  const optimizationRecommendations = result?.recommendations.filter((rec) => isOptimizationAction(rec.action)) ?? [];
  const createRecommendations = result?.recommendations.filter((rec) => rec.action === 'create') ?? [];

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 440 },
          maxWidth: '100%',
          bgcolor: '#F5F7FA',
          borderLeft: '1px solid #D8DEE8',
        },
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box
          sx={{
            px: 1.6,
            py: 1.35,
            borderBottom: '1px solid #D8DEE8',
            bgcolor: activeTheme.backgroundPaper,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.55 }}>
              <SparkleIcon sx={{ color: '#FF8A00', fontSize: 19 }} />
              <Typography sx={{ color: activeTheme.primary, fontSize: '0.95rem', fontWeight: 900, lineHeight: 1 }}>
                BLU.AI Bulk Analysis
              </Typography>
            </Box>
            <Typography sx={{ color: activeTheme.textSecondary, fontSize: '0.68rem', fontWeight: 750, mt: 0.4 }}>
              Optimize all maintenance requests
            </Typography>
          </Box>
          <IconButton size="small" onClick={onClose} aria-label="Close bulk analysis">
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>

        <Box sx={{ flexGrow: 1, overflowY: 'auto', px: 1.4, py: 1.3 }}>
          {result ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {isAnalyzing ? (
                <ThinkingReveal result={result} visibleStepCount={visibleThinkingSteps} />
              ) : (
                <>
                  <ImpactDashboard result={result} />

                  {optimizationRecommendations.length > 0 ? (
                    <Typography sx={{ color: activeTheme.textSecondary, fontSize: '0.64rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 0.3, mt: 0.3 }}>
                      Optimization opportunities
                    </Typography>
                  ) : null}
                  {optimizationRecommendations.map((rec) => (
                    <RecommendationCard
                      key={rec.id}
                      recommendation={rec}
                      applied={appliedIds.includes(rec.id)}
                      onApply={() => handleApply(rec)}
                    />
                  ))}

                  {createRecommendations.length > 0 ? (
                    <Typography sx={{ color: activeTheme.textSecondary, fontSize: '0.64rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 0.3, mt: 0.3 }}>
                      Individual Work Orders
                    </Typography>
                  ) : null}
                  {createRecommendations.map((rec) => (
                    <RecommendationCard
                      key={rec.id}
                      recommendation={rec}
                      applied={appliedIds.includes(rec.id)}
                      onApply={() => handleApply(rec)}
                    />
                  ))}
                </>
              )}
            </Box>
          ) : (
            <Typography sx={{ color: activeTheme.textSecondary, fontSize: '0.76rem', fontWeight: 650 }}>
              No maintenance requests to analyze.
            </Typography>
          )}
        </Box>

        {result && result.recommendations.length > 0 && !isAnalyzing ? (
          <Box sx={{ px: 1.4, py: 1.2, borderTop: '1px solid #D8DEE8', bgcolor: activeTheme.backgroundPaper, display: 'flex', gap: 0.8 }}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleApplyAll}
              disabled={pendingRecommendations.length === 0}
              sx={{ textTransform: 'none', fontWeight: 850, borderRadius: 1.2 }}
            >
              {pendingRecommendations.length === 0
                ? 'All recommendations applied'
                : `Apply all (${pendingRecommendations.length})`}
            </Button>
          </Box>
        ) : null}
      </Box>
    </Drawer>
  );
}
