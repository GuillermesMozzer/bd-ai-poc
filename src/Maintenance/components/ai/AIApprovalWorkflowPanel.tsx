import { Box, Button, Chip, Paper, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { tokenBrand, tokenDivider, tokenText } from '../../../workstation/theme';
import type { PlannerAiApprovalRequest } from '../../ai/types';

type AIApprovalWorkflowPanelProps = {
  requests: PlannerAiApprovalRequest[];
  canConfirm: boolean;
  onApproveStep: (requestId: string, stepId: string) => void;
  onRejectStep: (requestId: string, stepId: string, comment: string) => boolean;
  onOverride: (comment: string) => boolean;
};

export function AIApprovalWorkflowPanel({
  requests,
  canConfirm,
  onApproveStep,
  onRejectStep,
  onOverride,
}: AIApprovalWorkflowPanelProps) {
  const [rejectCommentByStep, setRejectCommentByStep] = useState<Record<string, string>>({});
  const [overrideComment, setOverrideComment] = useState('');

  return (
    <Paper elevation={0} sx={{ borderRadius: '12px', border: `1px solid ${tokenDivider}`, p: 1.8 }}>
      <Typography sx={{ color: tokenText.primary, fontSize: '0.84rem', fontWeight: 800 }}>
        Approval workflow
      </Typography>
      <Typography sx={{ mt: 0.35, color: tokenText.secondary, fontSize: '0.72rem', lineHeight: 1.45 }}>
        Approve or reject each gate before the propagated change can commit.
      </Typography>

      <Box sx={{ mt: 1.05, display: 'grid', gap: 0.9 }}>
        {requests.length ? (
          requests.map((request) => (
            <Box
              key={request.id}
              sx={{
                p: 1,
                borderRadius: '10px',
                border: `1px solid ${tokenDivider}`,
                bgcolor: 'background.paper',
              }}
            >
              <Typography sx={{ color: tokenText.primary, fontSize: '0.75rem', fontWeight: 800 }}>
                {request.title}
              </Typography>
              <Typography sx={{ mt: 0.25, color: tokenText.secondary, fontSize: '0.71rem', lineHeight: 1.45 }}>
                {request.summary}
              </Typography>

              <Box sx={{ mt: 0.7, display: 'grid', gap: 0.65 }}>
                {request.steps.map((step) => (
                  <Box key={step.id} sx={{ p: 0.75, borderRadius: '8px', border: `1px solid ${tokenDivider}` }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                      <Typography sx={{ color: tokenText.primary, fontSize: '0.69rem', fontWeight: 800 }}>
                        {step.role}
                      </Typography>
                      <Chip
                        size="small"
                        label={step.status}
                        sx={{ height: 20, fontSize: '0.62rem', fontWeight: 800, textTransform: 'capitalize' }}
                      />
                    </Box>
                    <Typography sx={{ mt: 0.2, color: tokenText.secondary, fontSize: '0.68rem', lineHeight: 1.4 }}>
                      {step.summary}
                    </Typography>
                    {step.status === 'pending' ? (
                      <Box sx={{ mt: 0.55, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => onApproveStep(request.id, step.id)}
                          sx={{ textTransform: 'none', fontWeight: 700, boxShadow: 'none' }}
                        >
                          Approve
                        </Button>
                        <TextField
                          size="small"
                          placeholder="Reject comment"
                          value={rejectCommentByStep[step.id] ?? ''}
                          onChange={(event) =>
                            setRejectCommentByStep((current) => ({ ...current, [step.id]: event.target.value }))
                          }
                          sx={{ minWidth: 160, flex: 1 }}
                        />
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => onRejectStep(request.id, step.id, rejectCommentByStep[step.id] ?? '')}
                          sx={{ textTransform: 'none', fontWeight: 700 }}
                        >
                          Reject
                        </Button>
                      </Box>
                    ) : step.comment ? (
                      <Typography sx={{ mt: 0.35, color: tokenText.secondary, fontSize: '0.66rem' }}>
                        Comment: {step.comment}
                      </Typography>
                    ) : null}
                  </Box>
                ))}
              </Box>
            </Box>
          ))
        ) : (
          <Typography sx={{ color: tokenText.secondary, fontSize: '0.72rem', lineHeight: 1.45 }}>
            No extra approvals are required for the current cascade selection.
          </Typography>
        )}
      </Box>

      {requests.length && !canConfirm ? (
        <Box sx={{ mt: 1.1, p: 1, borderRadius: '10px', border: `1px dashed ${tokenDivider}` }}>
          <Typography sx={{ color: tokenText.secondary, fontSize: '0.7rem', lineHeight: 1.45 }}>
            Demo override: acknowledge remaining blockers with a comment to proceed.
          </Typography>
          <Box sx={{ mt: 0.6, display: 'flex', gap: 0.6, flexWrap: 'wrap' }}>
            <TextField
              size="small"
              placeholder="Override comment"
              value={overrideComment}
              onChange={(event) => setOverrideComment(event.target.value)}
              sx={{ minWidth: 220, flex: 1 }}
            />
            <Button
              size="small"
              variant="outlined"
              onClick={() => onOverride(overrideComment)}
              sx={{ textTransform: 'none', fontWeight: 700, color: tokenBrand.main, borderColor: tokenBrand.main }}
            >
              Override with comment
            </Button>
          </Box>
        </Box>
      ) : null}
    </Paper>
  );
}
