import {
  AutoAwesome as AutoAwesomeIcon,
  ArrowBackRounded as ArrowBackRoundedIcon,
  CheckCircle as CheckCircleIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  Cancel as CancelIcon,
  ForumOutlined as ForumOutlinedIcon,
  OpenInFull as OpenInFullIcon,
  SkipNext as SkipNextIcon,
  ThumbDown as ThumbDownIcon,
  ThumbUp as ThumbUpIcon,
  Tune as TuneIcon,
} from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {useMemo, useState, type ReactNode} from 'react';
import type {
  MpsAssistantEvidence,
  MpsAssistantFinalReadinessStatus,
  MpsAssistantImpact,
  MpsAssistantRecommendation,
  MpsAssistantStep,
} from '../types';
import {calculateRecommendationApprovalSummary} from '../assistantUtils';
import {MpsReadinessBadge, RecommendationSeverityBadge, StepStatusBadge} from './Badges';

type Props = {
  steps: MpsAssistantStep[];
  activeStepId: string;
  recommendations: MpsAssistantRecommendation[];
  evidence: MpsAssistantEvidence[];
  impacts: MpsAssistantImpact[];
  finalReadinessStatus: MpsAssistantFinalReadinessStatus;
  lastRunAt: string;
  explanationOpen: boolean;
  scenarioMessage: string | null;
  expanded?: boolean;
  onSelectStep: (stepId: string) => void;
  onApply: (stepId: string) => void;
  onSkip: (stepId: string) => void;
  onExplainToggle: () => void;
  onCreateScenario: (stepId: string) => void;
  onAcknowledgeRisk: (stepId: string, comment: string) => void;
  onDismissScenarioMessage: () => void;
  onApproveRecommendation: (stepId: string) => void;
  onRejectRecommendation: (stepId: string, reason: string) => void;
  onApproveAll: () => void;
  onRejectAll: (reason: string) => void;
  onExpand?: () => void;
  onCollapse?: () => void;
};

const checklist = [
  'Demand allocation complete',
  'Product rules reviewed',
  'Line assignment complete',
  'Capacity reviewed',
  'Inventory reviewed',
  'Material risks reviewed',
  'Exceptions resolved',
  'MRP readiness',
];

const STATUS_LABEL: Record<string, string> = {
  Proposed: 'Proposed',
  Approved: 'Approved',
  Applied: 'Approved',
  Rejected: 'Rejected',
  Edited: 'Edited',
  Skipped: 'Skipped',
  Acknowledged: 'Acknowledged',
};

const STATUS_COLOR: Record<string, {bg: string; color: string; border: string}> = {
  Proposed: {bg: '#EFF6FF', color: '#1769FF', border: '#BFDBFE'},
  Approved: {bg: '#ECFDF3', color: '#027A48', border: '#ABEFC6'},
  Applied: {bg: '#ECFDF3', color: '#027A48', border: '#ABEFC6'},
  Rejected: {bg: '#FEF2F2', color: '#B42318', border: '#FECDCA'},
  Edited: {bg: '#FFF7ED', color: '#B54708', border: '#FED7AA'},
  Skipped: {bg: '#F8FAFC', color: 'var(--planning-text-secondary)', border: '#D0D5DD'},
  Acknowledged: {bg: '#F5F3FF', color: '#6D28D9', border: '#DDD6FE'},
};

export default function AiMpsAssistantPanel({
  steps,
  activeStepId,
  recommendations,
  evidence,
  impacts,
  finalReadinessStatus,
  lastRunAt,
  explanationOpen,
  scenarioMessage,
  expanded = false,
  onSelectStep,
  onApply,
  onSkip,
  onExplainToggle,
  onCreateScenario,
  onAcknowledgeRisk,
  onDismissScenarioMessage,
  onApproveRecommendation,
  onRejectRecommendation,
  onApproveAll,
  onRejectAll,
  onExpand,
  onCollapse,
}: Props) {
  const [commentOpen, setCommentOpen] = useState(false);
  const [comment, setComment] = useState('');
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [approveAllDialogOpen, setApproveAllDialogOpen] = useState(false);
  const [rejectAllDialogOpen, setRejectAllDialogOpen] = useState(false);
  const [rejectAllReason, setRejectAllReason] = useState('');

  const activeStep = steps.find((step) => step.id === activeStepId) ?? steps[0];
  const activeRecommendation = recommendations.find((recommendation) => recommendation.stepId === activeStepId) ?? null;
  const activeEvidence = evidence.filter((item) => item.stepId === activeStepId);
  const activeImpact = impacts.filter((item) => item.stepId === activeStepId);

  const progress = useMemo(() => {
    const done = steps.filter((step) => step.status === 'Complete' || step.status === 'Warning').length;
    return `${done} of ${steps.length} steps complete`;
  }, [steps]);

  const approvalSummary = useMemo(
    () => calculateRecommendationApprovalSummary(recommendations),
    [recommendations],
  );

  const isRecActionable = activeRecommendation?.status === 'Proposed';
  const isRecDone = activeRecommendation?.status === 'Applied' || activeRecommendation?.status === 'Approved';
  const isRecRejected = activeRecommendation?.status === 'Rejected';

  const handleAcknowledge = () => {
    if (!activeRecommendation) return;
    if (activeRecommendation.severity === 'Info') {
      onAcknowledgeRisk(activeStepId, '');
      return;
    }
    setCommentOpen(true);
  };

  function handleRejectConfirm() {
    if (!rejectReason.trim()) return;
    onRejectRecommendation(activeStepId, rejectReason.trim());
    setRejectReason('');
    setRejectDialogOpen(false);
  }

  function handleRejectAllConfirm() {
    if (!rejectAllReason.trim()) return;
    onRejectAll(rejectAllReason.trim());
    setRejectAllReason('');
    setRejectAllDialogOpen(false);
  }

  const recStatus = activeRecommendation?.status ?? 'Proposed';
  const recStatusColors = STATUS_COLOR[recStatus] ?? STATUS_COLOR.Proposed;

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        border: '1px solid #D8DEE8',
        bgcolor: 'var(--planning-surface)',
        boxShadow: 'var(--planning-soft-shadow)',
        overflow: 'hidden',
        position: expanded ? 'relative' : {lg: 'sticky'},
        top: expanded ? 'auto' : {lg: 24},
      }}
    >
      <Stack spacing={0}>
        {expanded ? (
          <Box sx={{px: {xs: 1.25, md: 1.75}, pt: 1.25}}>
            <Button
              onClick={onCollapse}
              startIcon={<ArrowBackRoundedIcon />}
              sx={{minWidth: 0, px: 0.4, color: '#1769FF', fontWeight: 900, fontSize: 15, textTransform: 'none'}}
            >
              Back
            </Button>
          </Box>
        ) : null}

        <Box
          sx={{
            px: expanded ? {xs: 1.25, md: 1.75} : 1.6,
            py: 1.5,
            borderBottom: '1px solid var(--planning-border)',
            background: 'linear-gradient(135deg, #0B1F4D 0%, #123A86 58%, #1D74FF 100%)',
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1.2}>
            <Box>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Avatar sx={{width: 34, height: 34, bgcolor: '#DBEAFE', color: '#1769FF'}}>
                  <AutoAwesomeIcon sx={{fontSize: 18}} />
                </Avatar>
                <Box>
                  <Typography sx={{fontSize: 18, fontWeight: 900, color: '#FFFFFF'}}>
                    Blu.AI MPS Assistant
                  </Typography>
                  <Typography sx={{fontSize: 12.5, color: 'rgba(255,255,255,0.78)', mt: 0.2}}>
                    Conversational guidance for MPS decisions
                  </Typography>
                </Box>
              </Stack>
            </Box>
            <Stack direction="row" spacing={1} alignItems="center">
              {expanded ? null : (
                <Tooltip title="Expand AI MPS assistant">
                  <IconButton size="small" aria-label="Expand AI MPS assistant" onClick={onExpand} sx={{color: '#FFFFFF'}}>
                    <OpenInFullIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              <MpsReadinessBadge status={finalReadinessStatus} />
            </Stack>
          </Stack>

          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{mt: 1.3}}>
            <Chip label={progress} size="small" sx={{fontWeight: 700, bgcolor: 'rgba(255,255,255,0.12)', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.18)'}} />
            <Chip label={`Last run ${new Date(lastRunAt).toLocaleString()}`} size="small" sx={{fontWeight: 700, bgcolor: 'rgba(255,255,255,0.10)', color: '#E2E8F0', border: '1px solid rgba(255,255,255,0.18)'}} />
          </Stack>
        </Box>

        <Box sx={{px: expanded ? {xs: 1.25, md: 1.75} : 1.6, py: 1.4, bgcolor: 'var(--planning-surface-muted)', borderBottom: '1px solid var(--planning-border)'}}>
          <Stack direction="row" flexWrap="wrap" gap={1} sx={{mb: 1}}>
            <SummaryChip label="Proposed" value={approvalSummary.Proposed} color="#1769FF" bg="#EFF6FF" />
            <SummaryChip label="Approved" value={approvalSummary.Applied + approvalSummary.Approved} color="#027A48" bg="#ECFDF3" />
            <SummaryChip label="Rejected" value={approvalSummary.Rejected} color="#B42318" bg="#FEF2F2" />
            {approvalSummary.blockers > 0 && <SummaryChip label="Blockers" value={approvalSummary.blockers} color="#B42318" bg="#FEF2F2" />}
            {approvalSummary.warnings > 0 && <SummaryChip label="Warnings" value={approvalSummary.warnings} color="#B54708" bg="#FFF7ED" />}
          </Stack>
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              variant="contained"
              startIcon={<ThumbUpIcon sx={{fontSize: 14}} />}
              onClick={() => setApproveAllDialogOpen(true)}
              sx={{fontSize: 12, fontWeight: 800, textTransform: 'none', bgcolor: '#1769FF', '&:hover': {bgcolor: '#1769FF'}}}
            >
              Approve All
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="error"
              startIcon={<ThumbDownIcon sx={{fontSize: 14}} />}
              onClick={() => setRejectAllDialogOpen(true)}
              sx={{fontSize: 12, fontWeight: 800, textTransform: 'none'}}
            >
              Reject All
            </Button>
          </Stack>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: expanded ? {xs: '1fr', lg: '280px minmax(0, 1fr)'} : {xs: '1fr', xl: '220px minmax(0, 1fr)'},
            minHeight: expanded ? 'calc(100vh - 180px)' : 'auto',
          }}
        >
          <Box sx={{borderRight: {xs: 'none', lg: '1px solid #E2E8F0'}, borderBottom: {xs: '1px solid #E2E8F0', lg: 'none'}, bgcolor: '#FCFDFE', p: 1.2}}>
            <Typography sx={{fontSize: 11, fontWeight: 900, color: 'var(--planning-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', mb: 1}}>
              Workflow Steps
            </Typography>
            <Box sx={{display: 'grid', gap: 0.8}}>
              {steps.map((step) => (
                <Box
                  key={step.id}
                  component="button"
                  onClick={() => onSelectStep(step.id)}
                  sx={{
                    width: '100%',
                    border: '1px solid',
                    borderColor: step.id === activeStepId ? '#BFDBFE' : '#E2E8F0',
                    bgcolor: step.id === activeStepId ? '#EFF6FF' : '#FFFFFF',
                    borderRadius: 2.5,
                    p: 1.1,
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'grid',
                    gridTemplateColumns: '30px 1fr auto',
                    gap: 0.9,
                    alignItems: 'center',
                  }}
                >
                  <Box sx={{width: 26, height: 26, borderRadius: '50%', bgcolor: step.id === activeStepId ? '#DBEAFE' : '#F1F5F9', color: step.id === activeStepId ? '#1769FF' : '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900}}>
                    {step.sequence}
                  </Box>
                  <Box>
                    <Typography sx={{fontSize: 12.25, fontWeight: 800, color: 'var(--planning-text-primary)'}}>
                      {step.shortTitle}
                    </Typography>
                    <Typography sx={{fontSize: 11.5, color: 'var(--planning-text-secondary)', mt: 0.2}}>
                      {step.category}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    {(() => {
                      const rec = recommendations.find((r) => r.stepId === step.id);
                      if (rec?.status === 'Rejected') return <CancelIcon sx={{fontSize: 14, color: '#B42318'}} />;
                      if (rec?.status === 'Applied' || rec?.status === 'Approved') return <CheckCircleIcon sx={{fontSize: 14, color: '#027A48'}} />;
                      return null;
                    })()}
                    <StepStatusBadge status={step.status} />
                  </Stack>
                </Box>
              ))}
            </Box>
          </Box>

          <Box sx={{p: 1.2}}>
            <Stack spacing={1.1}>
              {activeStep ? (
                <>
                  <ChatBubble
                    role="assistant"
                    title="Blu.AI"
                    meta={`Step ${activeStep.sequence} • ${activeStep.title}`}
                    body={activeStep.question}
                  />

                  {activeRecommendation ? (
                    <ChatBubble
                      role="assistant"
                      title={activeRecommendation.title}
                      meta={`Confidence ${activeRecommendation.confidence} • ${STATUS_LABEL[recStatus] ?? recStatus}`}
                      body={activeRecommendation.description}
                      footer={(
                        <Stack direction="row" spacing={0.8} flexWrap="wrap" alignItems="center">
                          <Chip label={STATUS_LABEL[recStatus] ?? recStatus} size="small" sx={{height: 22, fontSize: 11, fontWeight: 800, bgcolor: recStatusColors.bg, color: recStatusColors.color, border: `1px solid ${recStatusColors.border}`}} />
                          <RecommendationSeverityBadge severity={activeRecommendation.severity} />
                          <Typography sx={{fontSize: 11.5, color: 'var(--planning-text-secondary)'}}>
                            Impact: {activeRecommendation.expectedImpact}
                          </Typography>
                        </Stack>
                      )}
                    />
                  ) : null}

                  {activeRecommendation?.rejectionReason ? (
                    <ChatBubble
                      role="user"
                      title="Planner response"
                      body={`Rejected recommendation: ${activeRecommendation.rejectionReason}`}
                    />
                  ) : null}

                  <ChatBubble
                    role="assistant"
                    title="Why this matters"
                    body={activeStep.impactSummary}
                  />

                  {activeEvidence.length > 0 ? (
                    <ChatBubble
                      role="assistant"
                      title="Evidence"
                      body=""
                      content={(
                        <Stack spacing={1}>
                          {activeEvidence.map((item) => (
                            <Box key={item.id} sx={{border: '1px solid var(--planning-border)', borderRadius: 2, p: 1, bgcolor: 'var(--planning-surface)'}}>
                              <Stack direction="row" justifyContent="space-between" spacing={1}>
                                <Typography sx={{fontSize: 12, fontWeight: 800, color: 'var(--planning-text-primary)'}}>{item.label}</Typography>
                                <Chip label={item.status} size="small" sx={{height: 24, fontWeight: 700, bgcolor: item.status === 'Blocker' ? '#FEF3F2' : item.status === 'Warning' ? '#FFF7E8' : item.status === 'OK' ? '#ECFDF3' : '#EEF2FF', color: item.status === 'Blocker' ? '#B42318' : item.status === 'Warning' ? '#B54708' : item.status === 'OK' ? '#027A48' : '#3730A3', border: '1px solid var(--planning-border)'}} />
                              </Stack>
                              <Typography sx={{fontSize: 12.5, color: 'var(--planning-text-secondary)', mt: 0.45}}>{item.value}</Typography>
                              <Typography sx={{fontSize: 11.5, color: 'var(--planning-text-secondary)', mt: 0.35, lineHeight: 1.5}}>{item.details}</Typography>
                            </Box>
                          ))}
                        </Stack>
                      )}
                    />
                  ) : null}

                  {activeImpact.length > 0 ? (
                    <ChatBubble
                      role="assistant"
                      title="Expected impact"
                      body=""
                      content={(
                        <Stack spacing={1}>
                          {activeImpact.map((item) => (
                            <Box key={item.id} sx={{display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto auto auto', gap: 1, border: '1px solid var(--planning-border)', borderRadius: 2, p: 1, bgcolor: 'var(--planning-surface)', alignItems: 'center'}}>
                              <Typography sx={{fontSize: 12, fontWeight: 800, color: 'var(--planning-text-primary)'}}>{item.metric}</Typography>
                              <Typography sx={{fontSize: 12, color: 'var(--planning-text-secondary)'}}>{item.beforeValue}{item.unit ? ` ${item.unit}` : ''}</Typography>
                              <Typography sx={{fontSize: 12, fontWeight: 800, color: '#1769FF'}}>{item.afterValue}{item.unit ? ` ${item.unit}` : ''}</Typography>
                              <Typography sx={{fontSize: 12, fontWeight: 800, color: item.status === 'Negative' ? '#B42318' : item.status === 'Neutral' ? '#475467' : '#027A48'}}>
                                {item.deltaValue}
                              </Typography>
                            </Box>
                          ))}
                        </Stack>
                      )}
                    />
                  ) : null}

                  <Box sx={{border: '1px solid #D8DEE8', borderRadius: 3, bgcolor: 'var(--planning-surface)', p: 1.2}}>
                    <Typography sx={{fontSize: 11, fontWeight: 900, color: 'var(--planning-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', mb: 1}}>
                      Planner actions
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      <Tooltip title={isRecDone ? 'Already approved' : isRecRejected ? 'Already rejected' : 'Approve this recommendation'}>
                        <span>
                          <Button
                            variant="contained"
                            startIcon={<ThumbUpIcon sx={{fontSize: 14}} />}
                            onClick={() => onApproveRecommendation(activeStep.id)}
                            disabled={!isRecActionable}
                            sx={{textTransform: 'none', fontWeight: 800, bgcolor: '#1769FF', '&:hover': {bgcolor: '#1769FF'}, '&.Mui-disabled': {bgcolor: '#DBEAFE', color: '#93C5FD'}}}
                          >
                            Approve
                          </Button>
                        </span>
                      </Tooltip>
                      <Tooltip title={isRecRejected ? 'Already rejected' : 'Reject this recommendation'}>
                        <span>
                          <Button
                            variant="outlined"
                            color="error"
                            startIcon={<ThumbDownIcon sx={{fontSize: 14}} />}
                            onClick={() => setRejectDialogOpen(true)}
                            disabled={isRecDone || isRecRejected}
                            sx={{textTransform: 'none', fontWeight: 800}}
                          >
                            Reject
                          </Button>
                        </span>
                      </Tooltip>
                      <Button variant="outlined" onClick={() => onApply(activeStep.id)} sx={{textTransform: 'none', fontWeight: 800}}>
                        Apply recommendation
                      </Button>
                      <Button variant="outlined" onClick={() => onCreateScenario(activeStep.id)} sx={{textTransform: 'none', fontWeight: 800}}>
                        Create Scenario
                      </Button>
                      <Button variant="outlined" onClick={onExplainToggle} startIcon={<ForumOutlinedIcon />} sx={{textTransform: 'none', fontWeight: 800}}>
                        Explain
                      </Button>
                      {activeRecommendation?.severity === 'Info' ? (
                        <Button variant="outlined" color="warning" onClick={handleAcknowledge} sx={{textTransform: 'none', fontWeight: 800}}>
                          Acknowledge
                        </Button>
                      ) : null}
                      <Button variant="text" onClick={() => onSkip(activeStep.id)} startIcon={<SkipNextIcon />} sx={{textTransform: 'none', fontWeight: 800}}>
                        Skip
                      </Button>
                    </Stack>
                    <Typography sx={{fontSize: 11.5, color: 'var(--planning-text-secondary)', mt: 1}}>
                      Secondary action: {activeStep.secondaryActionLabel}
                    </Typography>
                  </Box>

                  {activeStep.id === 'step-10' ? (
                    <Box sx={{border: '1px solid #D8DEE8', borderRadius: 3, bgcolor: 'var(--planning-surface-muted)', p: 1.2}}>
                      <Stack direction="row" alignItems="center" spacing={1} sx={{mb: 1}}>
                        <CheckCircleOutlineIcon sx={{fontSize: 16, color: '#1769FF'}} />
                        <Typography sx={{fontSize: 12, fontWeight: 900, color: 'var(--planning-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em'}}>
                          Final checklist
                        </Typography>
                      </Stack>
                      <Stack spacing={0.8}>
                        {checklist.map((item) => (
                          <Box key={item} sx={{display: 'flex', justifyContent: 'space-between', gap: 1}}>
                            <Typography sx={{fontSize: 12.5, color: 'var(--planning-text-primary)'}}>{item}</Typography>
                            <MpsReadinessBadge status={finalReadinessStatus} />
                          </Box>
                        ))}
                      </Stack>
                    </Box>
                  ) : null}
                </>
              ) : null}

              {scenarioMessage ? (
                <Box sx={{border: '1px solid #BFDBFE', borderRadius: 2.2, bgcolor: 'var(--planning-neutral-bg)', p: 1.1}}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                    <Typography sx={{fontSize: 12.5, color: '#1769FF', fontWeight: 700}}>
                      {scenarioMessage}
                    </Typography>
                    <Button size="small" onClick={onDismissScenarioMessage} sx={{textTransform: 'none', fontWeight: 800}}>
                      Dismiss
                    </Button>
                  </Stack>
                </Box>
              ) : null}
            </Stack>
          </Box>
        </Box>
      </Stack>

      <Dialog open={explanationOpen} onClose={onExplainToggle} fullWidth maxWidth="sm">
        <DialogTitle sx={{fontWeight: 900}}>Assistant explanation</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1.4}>
            <ExplanationLine label="Why AI recommended this" value={activeRecommendation?.description ?? activeStep.description} />
            <ExplanationLine label="Data used" value={activeEvidence.map((item) => `${item.label}: ${item.value}`).join(' | ')} />
            <ExplanationLine label="Assumptions" value="Demo-only planning assumptions and local state are used. No backend, AI service, SAP data, or MRP run is called." />
            <ExplanationLine label="Expected benefit" value={activeRecommendation?.expectedImpact ?? activeStep.impactSummary} />
            <ExplanationLine label="Risks" value="Warnings and blockers remain visible until the planner applies, skips, or acknowledges them." />
            <ExplanationLine label="What changes if applied" value={activeImpact.map((item) => `${item.metric}: ${item.beforeValue} -> ${item.afterValue}`).join(' | ')} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{p: 2}}>
          <Button onClick={onExplainToggle} sx={{textTransform: 'none', fontWeight: 800}}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={commentOpen} onClose={() => setCommentOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{fontWeight: 900}}>Acknowledge risk</DialogTitle>
        <DialogContent dividers>
          <Typography sx={{fontSize: 13, color: 'var(--planning-text-secondary)', lineHeight: 1.6}}>
            A comment is required when acknowledging a warning or blocker recommendation.
          </Typography>
          <TextField
            fullWidth
            multiline
            minRows={4}
            label="Planner comment"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            sx={{mt: 2}}
          />
        </DialogContent>
        <DialogActions sx={{p: 2}}>
          <Button onClick={() => setCommentOpen(false)} sx={{textTransform: 'none', fontWeight: 800}}>
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={!comment.trim()}
            onClick={() => {
              onAcknowledgeRisk(activeStepId, comment);
              setComment('');
              setCommentOpen(false);
            }}
            sx={{textTransform: 'none', fontWeight: 800, bgcolor: '#1769FF', '&:hover': {bgcolor: '#1769FF'}}}
          >
            Save acknowledgement
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{fontWeight: 900}}>Reject recommendation</DialogTitle>
        <DialogContent dividers>
          <Typography sx={{fontSize: 13, color: 'var(--planning-text-secondary)', lineHeight: 1.6, mb: 1.5}}>
            Provide a reason for rejecting this AI recommendation. The recommendation will not be applied.
          </Typography>
          <TextField
            fullWidth
            multiline
            minRows={3}
            label="Rejection reason *"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="e.g. Planner override: different capacity strategy chosen"
            sx={{'& .MuiOutlinedInput-root': {borderRadius: 2}}}
          />
        </DialogContent>
        <DialogActions sx={{p: 2}}>
          <Button onClick={() => {setRejectDialogOpen(false); setRejectReason('');}} sx={{textTransform: 'none', fontWeight: 800}}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            disabled={!rejectReason.trim()}
            onClick={handleRejectConfirm}
            sx={{textTransform: 'none', fontWeight: 800}}
          >
            Reject recommendation
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={approveAllDialogOpen} onClose={() => setApproveAllDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{fontWeight: 900}}>Approve all recommendations</DialogTitle>
        <DialogContent dividers>
          <Typography sx={{fontSize: 13, color: 'var(--planning-text-secondary)', lineHeight: 1.6}}>
            Approve all AI recommendations for this Monthly MPS?
          </Typography>
          <Typography sx={{fontSize: 12.5, color: 'var(--planning-text-secondary)', mt: 1}}>
            All pending recommendations will be applied to the plan. This will simulate the recommended changes locally.
          </Typography>
        </DialogContent>
        <DialogActions sx={{p: 2}}>
          <Button onClick={() => setApproveAllDialogOpen(false)} sx={{textTransform: 'none', fontWeight: 800}}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              onApproveAll();
              setApproveAllDialogOpen(false);
            }}
            sx={{textTransform: 'none', fontWeight: 800, bgcolor: '#1769FF', '&:hover': {bgcolor: '#1769FF'}}}
          >
            Approve all
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={rejectAllDialogOpen} onClose={() => setRejectAllDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{fontWeight: 900}}>Reject all pending recommendations</DialogTitle>
        <DialogContent dividers>
          <Typography sx={{fontSize: 13, color: 'var(--planning-text-secondary)', lineHeight: 1.6, mb: 1.5}}>
            Reject all pending AI recommendations? A reason is required.
          </Typography>
          <TextField
            fullWidth
            multiline
            minRows={3}
            label="Batch rejection reason *"
            value={rejectAllReason}
            onChange={(e) => setRejectAllReason(e.target.value)}
            placeholder="e.g. Planner will apply manual planning instead of AI recommendations"
            sx={{'& .MuiOutlinedInput-root': {borderRadius: 2}}}
          />
        </DialogContent>
        <DialogActions sx={{p: 2}}>
          <Button onClick={() => {setRejectAllDialogOpen(false); setRejectAllReason('');}} sx={{textTransform: 'none', fontWeight: 800}}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            disabled={!rejectAllReason.trim()}
            onClick={handleRejectAllConfirm}
            sx={{textTransform: 'none', fontWeight: 800}}
          >
            Reject all
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}

function SummaryChip({label, value, color, bg}: {label: string; value: number; color: string; bg: string}) {
  return (
    <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5, px: 0.8, py: 0.3, borderRadius: 1.5, bgcolor: bg, border: `1px solid color-mix(in srgb, ${color} 19%, transparent)`}}>
      <Typography sx={{fontSize: 11, fontWeight: 900, color}}>{value}</Typography>
      <Typography sx={{fontSize: 11, color: 'var(--planning-text-secondary)'}}>{label}</Typography>
    </Box>
  );
}

function ChatBubble({
  role,
  title,
  meta,
  body,
  footer,
  content,
}: {
  role: 'assistant' | 'user';
  title: string;
  meta?: string;
  body: string;
  footer?: ReactNode;
  content?: ReactNode;
}) {
  const assistant = role === 'assistant';

  return (
    <Box sx={{display: 'flex', justifyContent: assistant ? 'flex-start' : 'flex-end'}}>
      <Box sx={{display: 'flex', gap: 0.9, maxWidth: '100%', width: '100%', justifyContent: assistant ? 'flex-start' : 'flex-end'}}>
        {assistant ? (
          <Avatar sx={{width: 32, height: 32, bgcolor: '#DBEAFE', color: '#1769FF', mt: 0.3}}>
            <AutoAwesomeIcon sx={{fontSize: 17}} />
          </Avatar>
        ) : null}
        <Box
          sx={{
            maxWidth: assistant ? 'calc(100% - 44px)' : '88%',
            borderRadius: 3,
            px: 1.2,
            py: 1.1,
            border: `1px solid ${assistant ? '#D8DEE8' : '#BFDBFE'}`,
            bgcolor: assistant ? '#FFFFFF' : '#EFF6FF',
            boxShadow: '0 6px 18px rgba(15,23,42,0.04)',
          }}
        >
          <Typography sx={{fontSize: 12.5, fontWeight: 800, color: 'var(--planning-text-primary)'}}>
            {title}
          </Typography>
          {meta ? (
            <Typography sx={{fontSize: 11, color: 'var(--planning-text-muted)', mt: 0.15}}>
              {meta}
            </Typography>
          ) : null}
          {body ? (
            <Typography sx={{fontSize: 12.5, color: 'var(--planning-text-secondary)', mt: 0.55, lineHeight: 1.6}}>
              {body}
            </Typography>
          ) : null}
          {content ? <Box sx={{mt: body ? 0.9 : 0.7}}>{content}</Box> : null}
          {footer ? <Box sx={{mt: 0.9}}>{footer}</Box> : null}
        </Box>
      </Box>
    </Box>
  );
}

function ExplanationLine({label, value}: {label: string; value: string}) {
  return (
    <Box>
      <Typography sx={{fontSize: 11.5, fontWeight: 900, color: 'var(--planning-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em'}}>
        {label}
      </Typography>
      <Typography sx={{fontSize: 13, color: 'var(--planning-text-primary)', mt: 0.5, lineHeight: 1.6}}>
        {value}
      </Typography>
    </Box>
  );
}
