import { useEffect, useRef } from 'react';
import {
  AutoAwesome as SparkleIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  Drawer,
  IconButton,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { activeTheme } from '../../../theme';
import { usePlanningAgentChat } from '../../hooks/usePlanningAgentChat';
import {
  getPhaseHint,
  planningAgentStepLabels,
  planningAgentStepOrder,
} from '../../ai/planningAgent/planningAgentEngine';
import type {
  AgentChatMessage,
  AgentQuickReply,
  PlanningAgentContext,
  PlanningAgentPhase,
  PlanningAgentRequestDetails,
  PlanningAgentSchedulingOption,
  PlanningAgentSparePart,
  PlanningAgentTechnician,
  PlannedWorkOrder,
} from '../../ai/planningAgent/types';

type PlanningAgentChatDrawerProps = {
  open: boolean;
  context: PlanningAgentContext | null;
  onClose: () => void;
  onCommit: (plan: PlannedWorkOrder) => void;
};

function AiChatBubble({ role, children }: { role: 'assistant' | 'user'; children: React.ReactNode }) {
  const isUser = role === 'user';

  return (
    <Box sx={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
      <Box
        sx={{
          maxWidth: isUser ? '82%' : '94%',
          px: 1.2,
          py: 0.9,
          borderRadius: 1.6,
          borderTopRightRadius: isUser ? 0.4 : 1.6,
          borderTopLeftRadius: isUser ? 1.6 : 0.4,
          bgcolor: isUser ? activeTheme.primary : activeTheme.backgroundPaper,
          color: isUser ? activeTheme.backgroundPaper : activeTheme.textPrimary,
          border: isUser ? '1px solid #0B63E5' : '1px solid #D8DEE8',
          boxShadow: isUser ? 'none' : '0 1px 3px rgba(15, 23, 42, 0.08)',
        }}
      >
        <Typography sx={{ fontSize: '0.78rem', fontWeight: 650, lineHeight: 1.38, whiteSpace: 'pre-wrap' }}>
          {children}
        </Typography>
      </Box>
    </Box>
  );
}

function PlanningStepper({ phase }: { phase: PlanningAgentPhase }) {
  const currentIndex = phase === 'committed' ? planningAgentStepOrder.length : planningAgentStepOrder.indexOf(phase);
  const totalSteps = planningAgentStepOrder.length;
  const displayStep = phase === 'committed' ? totalSteps : currentIndex + 1;

  return (
    <Box sx={{ px: 1.6, py: 1, borderBottom: '1px solid #E5E7EB', bgcolor: '#FBFCFE' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.6 }}>
        <Typography sx={{ color: activeTheme.textSecondary, fontSize: '0.62rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 0.3 }}>
          Step {displayStep} of {totalSteps}
        </Typography>
        <Typography sx={{ color: activeTheme.primary, fontSize: '0.66rem', fontWeight: 850 }}>
          {planningAgentStepLabels[phase]}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', gap: 0.4 }}>
        {planningAgentStepOrder.map((step, index) => {
          const done = index < currentIndex;
          const active = index === currentIndex && phase !== 'committed';
          return (
            <Box
              key={step}
              sx={{
                flex: 1,
                height: 4,
                borderRadius: 99,
                bgcolor: done ? '#16A34A' : active ? activeTheme.primary : '#E2E8F0',
              }}
            />
          );
        })}
      </Box>
    </Box>
  );
}

function AiTypingIndicator() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, pl: 0.4 }}>
      {[0, 1, 2].map((item) => (
        <Box
          key={item}
          sx={{
            width: 5,
            height: 5,
            borderRadius: '50%',
            bgcolor: activeTheme.textSecondary,
            animation: 'aiChatPulse 900ms infinite ease-in-out',
            animationDelay: `${item * 120}ms`,
            '@keyframes aiChatPulse': {
              '0%, 80%, 100%': { opacity: 0.35, transform: 'translateY(0)' },
              '40%': { opacity: 1, transform: 'translateY(-2px)' },
            },
          }}
        />
      ))}
    </Box>
  );
}

function ReasoningCard({ title, reasons, isRecommendation = false }: { title?: string; reasons: Array<{ label: string; tone?: string }>; isRecommendation?: boolean }) {
  const dotColor = (tone?: string) => {
    if (tone === 'critical') return '#DC2626';
    if (tone === 'warning') return '#D97706';
    if (tone === 'positive') return '#16A34A';
    return '#94A3B8';
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.1,
        borderRadius: 1.4,
        border: '1px solid #E5E7EB',
        bgcolor: activeTheme.backgroundPaper,
      }}
    >
      {title ? (
        <Typography sx={{ color: activeTheme.textSecondary, fontSize: '0.66rem', fontWeight: 900, mb: 0.6, textTransform: 'uppercase', letterSpacing: 0.3 }}>
          {isRecommendation ? 'Recommendation' : title}
        </Typography>
      ) : null}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.55 }}>
        {reasons.map((reason) => (
          <Box key={reason.label} sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.6 }}>
            <Box sx={{ mt: 0.45, width: 6, height: 6, borderRadius: '50%', bgcolor: dotColor(reason.tone), flexShrink: 0 }} />
            <Typography sx={{ color: activeTheme.textPrimary, fontSize: '0.72rem', fontWeight: 600, lineHeight: 1.35 }}>
              {reason.label}
            </Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  );
}

function RequestDetailsCard({ details }: { details: PlanningAgentRequestDetails }) {
  return (
    <Paper elevation={0} sx={{ borderRadius: 1.4, border: '1px solid #D8DEE8', overflow: 'hidden', bgcolor: activeTheme.backgroundPaper }}>
      <Box sx={{ px: 1.2, py: 0.9, bgcolor: activeTheme.backgroundDefault, borderBottom: '1px solid #E5E7EB' }}>
        <Typography sx={{ color: activeTheme.textPrimary, fontSize: '0.78rem', fontWeight: 900, lineHeight: 1.15 }}>
          {details.requestId} details
        </Typography>
        <Typography sx={{ color: activeTheme.textSecondary, fontSize: '0.66rem', fontWeight: 700, mt: 0.15 }}>
          {details.priority} Priority • {details.equipment}
        </Typography>
      </Box>
      <Box sx={{ p: 1.2 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.8, mb: 1 }}>
          {[
            ['Submitted by', details.createdBy],
            ['Equipment', details.equipment],
            ['Priority', details.priority],
            ['Activity', details.activityType],
          ].map(([label, value]) => (
            <Box key={label}>
              <Typography sx={{ color: activeTheme.textSecondary, fontSize: '0.61rem', fontWeight: 800, textTransform: 'uppercase' }}>
                {label}
              </Typography>
              <Typography sx={{ color: activeTheme.textPrimary, fontSize: '0.72rem', fontWeight: 750, lineHeight: 1.25 }}>
                {value}
              </Typography>
            </Box>
          ))}
        </Box>
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 0.8 }}>
          {[
            ['Downtime', details.riskAssessment.downtime, '#B91C1C', '#FEF2F2'],
            ['Quality', details.riskAssessment.quality, '#B45309', '#FFFBEB'],
            ['EHS', details.riskAssessment.ehs, '#15803D', '#F0FDF4'],
          ].map(([label, value, color, bg]) => (
            <Chip
              key={label}
              size="small"
              label={`${label}: ${value}`}
              sx={{ height: 21, borderRadius: 1, bgcolor: bg, color, border: '1px solid #E5E7EB', fontSize: '0.62rem', fontWeight: 800 }}
            />
          ))}
        </Box>
        <Typography sx={{ color: activeTheme.textSecondary, fontSize: '0.61rem', fontWeight: 900, textTransform: 'uppercase', mb: 0.25 }}>
          Detailed Description
        </Typography>
        <Typography sx={{ color: activeTheme.textPrimary, fontSize: '0.72rem', fontWeight: 600, lineHeight: 1.4 }}>
          {details.problemDescription}
        </Typography>
      </Box>
    </Paper>
  );
}

function SchedulingOptionsCard({
  options,
  selectedOptionId,
}: {
  options: PlanningAgentSchedulingOption[];
  selectedOptionId?: string;
}) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.65 }}>
      {options.map((option) => {
        const selected = option.id === selectedOptionId || option.recommended;
        return (
          <Paper
            key={option.id}
            elevation={0}
            sx={{
              p: 1,
              borderRadius: 1.3,
              border: selected ? '1px solid #86EFAC' : '1px solid #D8DEE8',
              bgcolor: selected ? '#F0FDF4' : activeTheme.backgroundPaper,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 0.6 }}>
              <Typography sx={{ color: activeTheme.textPrimary, fontSize: '0.74rem', fontWeight: 900, lineHeight: 1.2 }}>
                {option.title}
              </Typography>
              {option.recommended ? (
                <Chip label="Recommended" size="small" sx={{ height: 18, fontSize: '0.55rem', fontWeight: 900, bgcolor: '#DCFCE7', color: '#15803D' }} />
              ) : null}
            </Box>
            <Typography sx={{ color: activeTheme.textSecondary, fontSize: '0.68rem', fontWeight: 650, mt: 0.25 }}>
              {option.description}
            </Typography>
            <Typography sx={{ color: activeTheme.primary, fontSize: '0.66rem', fontWeight: 800, mt: 0.35 }}>
              {option.windowLabel}
            </Typography>
          </Paper>
        );
      })}
    </Box>
  );
}

function TechnicianAvailabilityCard({
  technicians,
  selectedTechnicianId,
}: {
  technicians: PlanningAgentTechnician[];
  selectedTechnicianId?: string;
}) {
  return (
    <Paper elevation={0} sx={{ p: 1, borderRadius: 1.3, border: '1px solid #D8DEE8', bgcolor: activeTheme.backgroundPaper }}>
      <Typography sx={{ color: activeTheme.textPrimary, fontSize: '0.76rem', fontWeight: 900, mb: 0.7 }}>
        Technician availability
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
        {technicians.map((technician) => {
          const selected = technician.id === selectedTechnicianId;
          return (
            <Box key={technician.id} sx={{ display: 'grid', gridTemplateColumns: '1fr 76px', gap: 0.8, alignItems: 'center' }}>
              <Box sx={{ minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.45 }}>
                  <Typography noWrap sx={{ color: activeTheme.textPrimary, fontSize: '0.72rem', fontWeight: 850 }}>
                    {technician.name}
                  </Typography>
                  {technician.recommended || selected ? (
                    <Chip label="Recommended" size="small" sx={{ height: 17, fontSize: '0.55rem', fontWeight: 900, bgcolor: '#DCFCE7', color: '#15803D' }} />
                  ) : null}
                </Box>
                <Box sx={{ mt: 0.45, height: 5, borderRadius: 99, bgcolor: '#E5E7EB', overflow: 'hidden' }}>
                  <Box
                    sx={{
                      width: `${technician.availabilityPercent}%`,
                      height: '100%',
                      bgcolor: technician.assigned ? '#94A3B8' : technician.recommended ? '#16A34A' : '#F59E0B',
                    }}
                  />
                </Box>
              </Box>
              <Typography sx={{ color: activeTheme.textSecondary, fontSize: '0.64rem', fontWeight: 800, lineHeight: 1.15 }}>
                {technician.status}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
}

function SparePartsCard({ parts }: { parts: PlanningAgentSparePart[] }) {
  const stockColor = (state: PlanningAgentSparePart['stockState']) => {
    if (state === 'in-stock') return { color: '#15803D', bg: '#DCFCE7' };
    if (state === 'low-stock') return { color: '#B45309', bg: '#FEF3C7' };
    return { color: '#B91C1C', bg: '#FEE2E2' };
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.6 }}>
      {parts.map((part) => {
        const colors = stockColor(part.stockState);
        return (
          <Paper key={part.id} elevation={0} sx={{ p: 0.9, borderRadius: 1.2, border: '1px solid #D8DEE8', bgcolor: activeTheme.backgroundPaper }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 0.6, alignItems: 'flex-start' }}>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ color: activeTheme.textPrimary, fontSize: '0.72rem', fontWeight: 850 }}>
                  {part.description}
                </Typography>
                <Typography sx={{ color: activeTheme.textSecondary, fontSize: '0.64rem', fontWeight: 700 }}>
                  {part.code} • {part.location}
                </Typography>
              </Box>
              <Chip
                label={part.stockState.replace('-', ' ')}
                size="small"
                sx={{ height: 18, fontSize: '0.55rem', fontWeight: 900, bgcolor: colors.bg, color: colors.color }}
              />
            </Box>
            <Typography sx={{ color: activeTheme.textSecondary, fontSize: '0.64rem', fontWeight: 700, mt: 0.35 }}>
              Available: {part.availableQuantity} • Requested: {part.requestedQuantity}
            </Typography>
          </Paper>
        );
      })}
    </Box>
  );
}

function SafetyQualityCard({ safety, quality }: { safety: { requirements: string[]; safetyNotes: string; lotoRequired: boolean }; quality: { requirements: string[]; qualityNotes: string; qualityImpacting: boolean } }) {
  return (
    <Paper elevation={0} sx={{ p: 1, borderRadius: 1.3, border: '1px solid #D8DEE8', bgcolor: activeTheme.backgroundPaper }}>
      <Typography sx={{ color: activeTheme.textPrimary, fontSize: '0.74rem', fontWeight: 900, mb: 0.5 }}>
        Safety & quality requirements
      </Typography>
      <Typography sx={{ color: activeTheme.textSecondary, fontSize: '0.66rem', fontWeight: 800, textTransform: 'uppercase', mb: 0.25 }}>
        Safety
      </Typography>
      <Box sx={{ display: 'flex', gap: 0.4, flexWrap: 'wrap', mb: 0.7 }}>
        {safety.requirements.map((item) => (
          <Chip key={item} label={item} size="small" sx={{ height: 20, fontSize: '0.6rem', fontWeight: 800 }} />
        ))}
        {safety.lotoRequired ? <Chip label="LOTO required" size="small" color="warning" sx={{ height: 20, fontSize: '0.6rem', fontWeight: 800 }} /> : null}
      </Box>
      <Typography sx={{ color: activeTheme.textPrimary, fontSize: '0.68rem', fontWeight: 650, mb: 0.8 }}>
        {safety.safetyNotes}
      </Typography>
      <Typography sx={{ color: activeTheme.textSecondary, fontSize: '0.66rem', fontWeight: 800, textTransform: 'uppercase', mb: 0.25 }}>
        Quality
      </Typography>
      <Box sx={{ display: 'flex', gap: 0.4, flexWrap: 'wrap', mb: 0.5 }}>
        {quality.requirements.map((item) => (
          <Chip key={item} label={item} size="small" sx={{ height: 20, fontSize: '0.6rem', fontWeight: 800 }} />
        ))}
      </Box>
      <Typography sx={{ color: activeTheme.textPrimary, fontSize: '0.68rem', fontWeight: 650 }}>
        {quality.qualityNotes}
      </Typography>
    </Paper>
  );
}

function PlanSummaryCard({ plan }: { plan: Partial<PlannedWorkOrder> }) {
  const rows = [
    ['Title', plan.title],
    ['Maintenance type', plan.maintenanceType],
    ['Asset / equipment', plan.equipment],
    ['Priority', plan.priority],
    ['Execution window', plan.executionWindow?.windowLabel ?? plan.executionDay?.fullLabel],
    ['Technician', plan.technician?.name],
    ['Linked request', plan.linkedRequestId],
    ['Linked WO / PM', plan.linkedWorkOrderOrPm?.title],
    ['Spare parts', plan.spareParts?.map((part) => part.description).join(', ') || 'None'],
    ['Safety', plan.safetyRequirements?.requirements?.slice(0, 2).join(', ')],
    ['Quality', plan.qualityRequirements?.requirements?.slice(0, 2).join(', ')],
  ];

  return (
    <Paper elevation={0} sx={{ p: 1.1, borderRadius: 1.4, border: '1px solid #BFDBFE', bgcolor: '#F8FBFF' }}>
      <Typography sx={{ color: activeTheme.primary, fontSize: '0.72rem', fontWeight: 900, mb: 0.7, textTransform: 'uppercase' }}>
        Planned Work Order summary
      </Typography>
      <Box sx={{ display: 'grid', gap: 0.55 }}>
        {rows.map(([label, value]) =>
          value ? (
            <Box key={label}>
              <Typography sx={{ color: activeTheme.textSecondary, fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase' }}>
                {label}
              </Typography>
              <Typography sx={{ color: activeTheme.textPrimary, fontSize: '0.72rem', fontWeight: 700, lineHeight: 1.3 }}>
                {value}
              </Typography>
            </Box>
          ) : null,
        )}
      </Box>
    </Paper>
  );
}

function ConfirmPanel({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <Paper elevation={0} sx={{ p: 1, borderRadius: 1.3, border: '1px solid #FCD34D', bgcolor: '#FFFBEB' }}>
      <Typography sx={{ color: '#92400E', fontSize: '0.72rem', fontWeight: 900, mb: 0.7 }}>
        Confirmation required
      </Typography>
      <Typography sx={{ color: '#92400E', fontSize: '0.68rem', fontWeight: 650, mb: 0.8, lineHeight: 1.35 }}>
        I will only create or update the Work Order after you confirm. Recommendations above are not applied yet.
      </Typography>
      <Box sx={{ display: 'flex', gap: 0.6, flexWrap: 'wrap' }}>
        <Button size="small" variant="contained" onClick={onConfirm} sx={{ textTransform: 'none', fontWeight: 800, borderRadius: 1 }}>
          Confirm & create Work Order
        </Button>
        <Button size="small" variant="outlined" onClick={onCancel} sx={{ textTransform: 'none', fontWeight: 800, borderRadius: 1 }}>
          Not yet
        </Button>
      </Box>
    </Paper>
  );
}

function SuccessCard({ content }: { content: string }) {
  return (
    <Paper elevation={0} sx={{ maxWidth: '94%', width: '100%', p: 1.2, borderRadius: 1.5, border: '1px solid #86EFAC', bgcolor: '#F0FDF4' }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.75 }}>
        <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: '#16A34A', color: activeTheme.backgroundPaper, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
          <CheckIcon sx={{ fontSize: 16 }} />
        </Box>
        <Typography sx={{ color: '#166534', fontSize: '0.76rem', fontWeight: 850, lineHeight: 1.35 }}>
          {content}
        </Typography>
      </Box>
    </Paper>
  );
}

function renderMessage(
  message: AgentChatMessage,
  onConfirm: () => void,
  onCancel: () => void,
) {
  if (message.role === 'user') {
    return <AiChatBubble role="user">{message.content}</AiChatBubble>;
  }

  const bubble = message.content ? <AiChatBubble role="assistant">{message.content}</AiChatBubble> : null;

  switch (message.kind) {
    case 'reasoning':
    case 'recommendation':
      return (
        <Box key={message.id}>
          {bubble}
          <Box sx={{ mt: 0.75 }}>
            <ReasoningCard title={message.kind === 'recommendation' ? 'Recommendation' : undefined} reasons={message.reasons ?? []} isRecommendation={message.isRecommendation} />
          </Box>
        </Box>
      );
    case 'requestDetails':
      return (
        <Box key={message.id}>
          {bubble}
          <Box sx={{ mt: 0.75 }}>
            <RequestDetailsCard details={message.payload as PlanningAgentRequestDetails} />
          </Box>
        </Box>
      );
    case 'schedulingOptions': {
      const payload = message.payload as { options: PlanningAgentSchedulingOption[]; selectedOptionId?: string };
      return (
        <Box key={message.id}>
          {bubble}
          <Box sx={{ mt: 0.75 }}>
            <SchedulingOptionsCard options={payload.options} selectedOptionId={payload.selectedOptionId} />
          </Box>
        </Box>
      );
    }
    case 'technicians': {
      const payload = message.payload as { technicians: PlanningAgentTechnician[]; selectedTechnicianId?: string };
      return (
        <Box key={message.id}>
          {bubble}
          <Box sx={{ mt: 0.75 }}>
            <TechnicianAvailabilityCard technicians={payload.technicians} selectedTechnicianId={payload.selectedTechnicianId} />
          </Box>
        </Box>
      );
    }
    case 'spareParts': {
      const payload = message.payload as { parts: PlanningAgentSparePart[] };
      return (
        <Box key={message.id}>
          {bubble}
          <Box sx={{ mt: 0.75 }}>
            <SparePartsCard parts={payload.parts} />
          </Box>
        </Box>
      );
    }
    case 'safetyQuality': {
      const payload = message.payload as { safety: { requirements: string[]; safetyNotes: string; lotoRequired: boolean }; quality: { requirements: string[]; qualityNotes: string; qualityImpacting: boolean } };
      return (
        <Box key={message.id}>
          {bubble}
          <Box sx={{ mt: 0.75 }}>
            <SafetyQualityCard safety={payload.safety} quality={payload.quality} />
          </Box>
        </Box>
      );
    }
    case 'planSummary':
      return (
        <Box key={message.id}>
          {bubble}
          <Box sx={{ mt: 0.75 }}>
            <PlanSummaryCard plan={message.payload as Partial<PlannedWorkOrder>} />
          </Box>
        </Box>
      );
    case 'confirm':
      return (
        <Box key={message.id}>
          {bubble}
          <Box sx={{ mt: 0.75 }}>
            <ConfirmPanel onConfirm={onConfirm} onCancel={onCancel} />
          </Box>
        </Box>
      );
    case 'success':
      return <SuccessCard key={message.id} content={message.content ?? 'Work Order created successfully.'} />;
    default:
      return bubble;
  }
}

export function PlanningAgentChatDrawer({ open, context, onClose, onCommit }: PlanningAgentChatDrawerProps) {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const {
    messages,
    phase,
    isTyping,
    inputValue,
    setInputValue,
    quickReplies,
    sendMessage,
    selectQuickReply,
    confirmPlan,
  } = usePlanningAgentChat({ context, open, onCommit });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isTyping]);

  const handleSend = () => {
    sendMessage(inputValue);
  };

  const contextLabel = context
    ? `${context.requestDetails.requestId} • ${context.cardTitle}`
    : 'Follow-up Board planning';

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 430 },
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
                BLU.AI Assistant
              </Typography>
            </Box>
            <Typography sx={{ color: activeTheme.textSecondary, fontSize: '0.68rem', fontWeight: 750, mt: 0.4 }}>
              Context: {contextLabel}
            </Typography>
          </Box>
          <IconButton size="small" onClick={onClose} aria-label="Close AI chat">
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>

        <PlanningStepper phase={phase} />

        <Box sx={{ flexGrow: 1, overflowY: 'auto', px: 1.4, py: 1.3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.9 }}>
            {messages.map((message) =>
              renderMessage(message, confirmPlan, () => sendMessage('Not yet, I want to revise the plan')),
            )}
            {isTyping ? <AiTypingIndicator /> : null}
            <Box ref={messagesEndRef} />
          </Box>
        </Box>

        {quickReplies.length > 0 && phase !== 'committed' && !isTyping ? (
          <Box sx={{ px: 1.4, pb: 0.6, pt: 0.4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
              <SparkleIcon sx={{ fontSize: 12, color: '#F97316' }} />
              <Typography sx={{ color: activeTheme.textSecondary, fontSize: '0.64rem', fontWeight: 800 }}>
                {getPhaseHint(phase)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              {quickReplies.map((reply: AgentQuickReply) => {
                const isPrimary = reply.id === 'confirm-yes';
                return (
                  <Chip
                    key={reply.id}
                    label={reply.label}
                    clickable
                    onClick={() => selectQuickReply(reply)}
                    size="small"
                    sx={{
                      height: 28,
                      borderRadius: 999,
                      bgcolor: isPrimary ? activeTheme.primary : activeTheme.backgroundPaper,
                      color: isPrimary ? activeTheme.backgroundPaper : activeTheme.primary,
                      border: isPrimary ? `1px solid ${activeTheme.primary}` : '1px solid #B8D4FF',
                      fontSize: '0.68rem',
                      fontWeight: 850,
                      '&:hover': { bgcolor: isPrimary ? '#0B63E5' : '#EFF6FF' },
                    }}
                  />
                );
              })}
            </Box>
          </Box>
        ) : null}

        <Box sx={{ px: 1.4, py: 1.2, borderTop: '1px solid #D8DEE8', bgcolor: activeTheme.backgroundPaper }}>
          <Box sx={{ display: 'flex', gap: 0.6, alignItems: 'flex-end' }}>
            <TextField
              fullWidth
              multiline
              minRows={1}
              maxRows={4}
              size="small"
              placeholder={phase === 'committed' ? 'Work Order planned and moved to Scheduling' : 'Ask BLU.AI or reply to continue planning...'}
              value={inputValue}
              disabled={phase === 'committed' || isTyping}
              onChange={(event) => setInputValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  handleSend();
                }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1.2,
                  bgcolor: '#F8FAFC',
                  fontSize: '0.78rem',
                },
              }}
            />
            <IconButton
              color="primary"
              onClick={handleSend}
              disabled={!inputValue.trim() || phase === 'committed' || isTyping}
              aria-label="Send message"
              sx={{ bgcolor: '#EFF6FF', border: '1px solid #BFDBFE' }}
            >
              <SendIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
}
