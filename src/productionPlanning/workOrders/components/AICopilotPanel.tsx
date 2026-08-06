import React, { useMemo, useState } from 'react';
import {
  Box, Paper, Typography, Button, Chip, Divider, TextField, CircularProgress,
  LinearProgress, Alert, Collapse, IconButton,
} from '@mui/material';
import {
  AutoAwesome as SparkleIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
  CheckCircle as CheckIcon,
  Cancel as RejectIcon,
  Send as SendIcon,
  Psychology as BrainIcon,
  TrendingUp as ImpactIcon,
  OpenInNew as OpenInNewIcon,
} from '@mui/icons-material';
import type { WorkOrder, WOAIRecommendation, WOConversationMessage } from '../types';

interface AICopilotPanelProps {
  wo: WorkOrder;
  onActionConfirmed?: (rec: WOAIRecommendation, action: string) => void;
  conversation?: WOConversationMessage[];
  onConversationChange?: (messages: WOConversationMessage[]) => void;
  onOpenBluAiWorkflow?: () => void;
  compact?: boolean;
}

interface ConfirmState {
  rec: WOAIRecommendation;
  action: string;
}

const CONFIDENCE_COLOR = (c: number) => c >= 80 ? '#059669' : c >= 60 ? '#D97706' : '#DC2626';
const createConversationId = () => `WO-CHAT-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;

function formatChatTimestamp(timestamp: string) {
  return new Date(timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function buildAssistantReply(wo: WorkOrder, query: string, messages: WOConversationMessage[]) {
  const lower = query.toLowerCase();
  const shortages = wo.materials.filter(m => m.missingStock);
  const pendingRecs = wo.aiRecommendations.filter(r => r.userDecision === 'Pending');
  const priorQuestions = messages.filter(message => message.role === 'user').length;

  if (lower.includes('material') || lower.includes('stock') || lower.includes('warehouse')) {
    return shortages.length > 0
      ? `For WO ${wo.woId}, I still see ${shortages.length} material shortage${shortages.length > 1 ? 's' : ''}. The main gap is ${shortages[0].materialCode} with ${shortages[0].shortageQty} ${shortages[0].uom} missing. I recommend keeping the order blocked until replenishment or a confirmed substitution is in place.`
      : `Material readiness looks clear for WO ${wo.woId}. All listed components are available and staged, so materials are not the current driver of risk.`;
  }

  if (lower.includes('risk') || lower.includes('blocker') || lower.includes('delay')) {
    return `Current risk for WO ${wo.woId} is ${wo.riskLevel} with AI score ${wo.aiRiskScore}/100. The main blocker is ${wo.currentBlocker || 'schedule adherence and execution stability'}. ${wo.exceptions.length > 0 ? `There are ${wo.exceptions.length} active exception${wo.exceptions.length > 1 ? 's' : ''}, led by ${wo.exceptions[0].type.toLowerCase()}: ${wo.exceptions[0].reason}.` : 'There are no active exceptions right now.'}`;
  }

  if (lower.includes('next') || lower.includes('action') || lower.includes('recommend')) {
    return pendingRecs.length > 0
      ? `The best next step is: ${pendingRecs[0].suggestedAction}. That recommendation is still pending and is based on ${pendingRecs[0].dataUsed.join(', ')} for WO ${wo.woId}.`
      : `There is no pending AI action for WO ${wo.woId}. My recommendation is to ${wo.aiRecommendation || 'review readiness and confirm execution timing before release'}.`;
  }

  if (lower.includes('summary') || lower.includes('status') || lower.includes('overview')) {
    return `WO ${wo.woId} is ${wo.lifecycleStatus} with readiness ${wo.readinessStatus}. Progress is ${wo.progressPct}% and quality status is ${wo.quality.status}. ${wo.currentOperation ? `The current operation is ${wo.currentOperation}.` : 'Execution has not started yet.'}`;
  }

  return `I can keep this conversation going for WO ${wo.woId}. Right now it is ${wo.lifecycleStatus}, readiness is ${wo.readinessStatus}, and the top focus is ${wo.currentBlocker || wo.aiRecommendation || 'maintaining release readiness'}. ${priorQuestions > 0 ? 'I am also keeping the previous questions in context for follow-up answers.' : 'Ask a follow-up about risk, materials, schedule, or the next action.'}`;
}

function AskAIBox({
  wo,
  conversation,
  onConversationChange,
  onOpenBluAiWorkflow,
}: {
  wo: WorkOrder;
  conversation: WOConversationMessage[];
  onConversationChange?: (messages: WOConversationMessage[]) => void;
  onOpenBluAiWorkflow?: () => void;
}) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const orderedConversation = useMemo(
    () => [...conversation].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),
    [conversation],
  );

  const simulate = () => {
    const trimmed = query.trim();
    if (!trimmed) return;

    const userMessage: WOConversationMessage = {
      id: createConversationId(),
      woId: wo.woId,
      role: 'user',
      kind: 'question',
      text: trimmed,
      timestamp: new Date().toISOString(),
    };

    onConversationChange?.([...orderedConversation, userMessage]);
    setLoading(true);
    setQuery('');

    setTimeout(() => {
      const assistantMessage: WOConversationMessage = {
        id: createConversationId(),
        woId: wo.woId,
        role: 'assistant',
        kind: 'answer',
        text: buildAssistantReply(wo, trimmed, [...orderedConversation, userMessage]),
        timestamp: new Date().toISOString(),
      };
      onConversationChange?.([...orderedConversation, userMessage, assistantMessage]);
      setLoading(false);
    }, 850);
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Ask AI</Typography>
      <Typography variant="body2" sx={{ mt: 0.5, color: 'var(--planning-text-secondary)', lineHeight: 1.5 }}>
        Ask follow-up questions about this work order and keep the conversation in context.
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
        {orderedConversation.length === 0 ? (
          <Alert severity="info" icon={<BrainIcon />} sx={{ borderRadius: 2 }}>
            Start the conversation here, or open the Blu.AI workflow for a deeper planning session.
          </Alert>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, maxHeight: 280, overflowY: 'auto', pr: 0.5 }}>
            {orderedConversation.map(message => (
              <Box
                key={message.id}
                sx={{
                  alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '92%',
                  p: 1.2,
                  borderRadius: 2,
                  border: message.role === 'user' ? '1px solid #BFDBFE' : '1px solid #DDE7F5',
                  bgcolor: message.role === 'user' ? '#EFF6FF' : '#F8FAFC',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.4 }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: message.role === 'user' ? '#1D4ED8' : '#334155' }}>
                    {message.role === 'user' ? 'You' : 'Blu.AI'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'var(--planning-text-muted)' }}>
                    {formatChatTimestamp(message.timestamp)}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: 'var(--planning-text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                  {message.text}
                </Typography>
              </Box>
            ))}
            {loading && (
              <Box sx={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 1, px: 1.2, py: 1 }}>
                <CircularProgress size={14} />
                <Typography variant="caption" sx={{ color: 'var(--planning-text-secondary)' }}>Blu.AI is answering...</Typography>
              </Box>
            )}
          </Box>
        )}
      </Box>

      <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
        <TextField
          size="small"
          fullWidth
          placeholder="Ask about this work order..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && query.trim()) simulate(); }}
        />
        <Button
          variant="contained"
          size="small"
          disabled={!query.trim() || loading}
          onClick={simulate}
          sx={{ minWidth: 40, bgcolor: 'var(--planning-text-primary)', '&:hover': { bgcolor: '#16194d' } }}
        >
          {loading ? <CircularProgress size={16} sx={{ color: 'white' }} /> : <SendIcon sx={{ fontSize: 18 }} />}
        </Button>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
        <Button
          size="small"
          variant="outlined"
          endIcon={<OpenInNewIcon />}
          onClick={onOpenBluAiWorkflow}
          sx={{ borderColor: '#93C5FD', color: '#1D4ED8', fontWeight: 700, textTransform: 'none' }}
        >
          Open Blu.AI workflow
        </Button>
      </Box>
    </Box>
  );
}

export default function AICopilotPanel({
  wo,
  onActionConfirmed,
  conversation = [],
  onConversationChange,
  onOpenBluAiWorkflow,
  compact = false,
}: AICopilotPanelProps) {
  const [expanded, setExpanded] = useState(!compact);
  const [confirming, setConfirming] = useState<ConfirmState | null>(null);
  const [applied, setApplied] = useState<Set<string>>(new Set());

  const recs = wo.aiRecommendations.filter(r => r.userDecision === 'Pending');

  const handleConfirm = (rec: WOAIRecommendation, action: string) => {
    setApplied(prev => new Set(prev).add(rec.id));
    setConfirming(null);
    onActionConfirmed?.(rec, action);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        border: '1.5px solid #818CF833',
        borderRadius: 2,
        overflow: 'hidden',
        bgcolor: '#FAFAFE',
      }}
    >
      <Box
        sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1.5, cursor: 'pointer', bgcolor: 'linear-gradient(90deg,#1F2366,#1E40AF)' }}
        onClick={() => setExpanded(e => !e)}
      >
        <SparkleIcon sx={{ fontSize: 18, color: '#818CF8' }} />
        <Typography variant="subtitle2" sx={{ fontWeight: 800, flex: 1, color: 'var(--planning-text-primary)' }}>AI Copilot</Typography>
        <Chip
          label={`Score ${wo.aiRiskScore}`}
          size="small"
          sx={{ bgcolor: CONFIDENCE_COLOR(100 - wo.aiRiskScore) + '22', color: CONFIDENCE_COLOR(100 - wo.aiRiskScore), fontWeight: 700, fontSize: '0.68rem' }}
        />
        <IconButton size="small">{expanded ? <CollapseIcon fontSize="small" /> : <ExpandIcon fontSize="small" />}</IconButton>
      </Box>

      <Collapse in={expanded}>
        <Box sx={{ p: 2 }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Risk Summary</Typography>
            <Typography variant="body2" sx={{ mt: 0.5, color: 'var(--planning-text-secondary)', lineHeight: 1.6 }}>
              {wo.aiRecommendation || `WO ${wo.woId} has ${wo.exceptions.length} active exceptions. Risk score is ${wo.aiRiskScore}/100.`}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={wo.aiRiskScore}
              sx={{
                mt: 1, height: 6, borderRadius: 3,
                bgcolor: '#E2E8F0',
                '& .MuiLinearProgress-bar': {
                  bgcolor: wo.aiRiskScore > 70 ? '#DC2626' : wo.aiRiskScore > 40 ? '#D97706' : '#059669',
                },
              }}
            />
          </Box>

          <Divider sx={{ mb: 2 }} />

          {recs.length === 0 && (
            <Alert severity="success" icon={<CheckIcon />} sx={{ fontSize: '0.78rem', borderRadius: 2, mb: 2 }}>
              No pending AI recommendations for this WO.
            </Alert>
          )}

          {recs.map(rec => (
            <Box
              key={rec.id}
              sx={{
                mb: 1.5,
                p: 1.5,
                borderRadius: 2,
                bgcolor: applied.has(rec.id) ? '#F0FDF4' : '#F8FAFF',
                border: applied.has(rec.id) ? '1px solid #86EFAC' : '1px solid #C7D2FE',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 0.75 }}>
                <BrainIcon sx={{ fontSize: 16, color: '#818CF8', mt: 0.2 }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#4338CA' }}>Recommendation</Typography>
                  <Typography variant="body2" sx={{ color: 'var(--planning-text-secondary)', lineHeight: 1.5, mt: 0.25 }}>{rec.text}</Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                <Chip
                  label={`Confidence: ${rec.confidence}%`}
                  size="small"
                  sx={{ bgcolor: CONFIDENCE_COLOR(rec.confidence) + '22', color: CONFIDENCE_COLOR(rec.confidence), fontWeight: 700, fontSize: '0.65rem' }}
                />
                <Chip
                  label={rec.impact}
                  size="small"
                  icon={<ImpactIcon sx={{ fontSize: '14px !important' }} />}
                  sx={{ bgcolor: 'var(--planning-surface-muted)', color: '#475569', fontWeight: 600, fontSize: '0.65rem' }}
                />
              </Box>

              <Typography variant="caption" sx={{ color: 'var(--planning-text-secondary)', display: 'block', mb: 1 }}>
                <strong>Suggested:</strong> {rec.suggestedAction}
              </Typography>

              {!applied.has(rec.id) ? (
                confirming?.rec.id === rec.id ? (
                  <Box sx={{ bgcolor: '#FEF9C3', border: '1px solid #FCD34D', borderRadius: 2, p: 1.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.75, color: '#92400E' }}>
                      Confirm action: "{confirming.action}"?
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#78350F', display: 'block', mb: 1 }}>
                      Data used: {rec.dataUsed.join(', ')}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<CheckIcon />}
                        onClick={() => handleConfirm(rec, confirming.action)}
                        sx={{ bgcolor: '#059669', '&:hover': { bgcolor: '#047857' }, fontSize: '0.72rem' }}
                      >
                        Confirm
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<RejectIcon />}
                        onClick={() => setConfirming(null)}
                        sx={{ borderColor: '#DC2626', color: '#DC2626', fontSize: '0.72rem' }}
                      >
                        Cancel
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => setConfirming({ rec, action: rec.suggestedAction })}
                    sx={{ borderColor: '#818CF8', color: '#4338CA', fontSize: '0.72rem', fontWeight: 700 }}
                  >
                    Prepare Action
                  </Button>
                )
              ) : (
                <Chip
                  label="Action applied"
                  size="small"
                  icon={<CheckIcon sx={{ fontSize: '14px !important' }} />}
                  sx={{ bgcolor: '#D1FAE5', color: '#065F46', fontWeight: 700, fontSize: '0.68rem' }}
                />
              )}
            </Box>
          ))}

          {!compact && (
            <AskAIBox
              wo={wo}
              conversation={conversation}
              onConversationChange={onConversationChange}
              onOpenBluAiWorkflow={onOpenBluAiWorkflow}
            />
          )}
        </Box>
      </Collapse>
    </Paper>
  );
}
