import {useState} from 'react';
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import type {CommitmentRecommendation, LongTermPlanningAiProposal} from '../../aiProposalTypes';
import {
  acceptCommitmentRecommendation,
  acceptSelectedCommitmentRecommendations,
  rejectCommitmentRecommendation,
} from '../../aiProposalUtils';
import {planningTokens} from '../../../ui/planningTheme';

const DECISION_TONE: Record<string, {bg: string; color: string; border: string}> = {
  Pending: {bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE'},
  Accepted: {bg: '#ECFDF3', color: '#027A48', border: '#ABEFC6'},
  Edited: {bg: '#FFF7ED', color: '#B54708', border: '#FED7AA'},
  Rejected: {bg: '#FEF3F2', color: '#B42318', border: '#FECDCA'},
};

const CONFIDENCE_TONE: Record<string, {bg: string; color: string}> = {
  High: {bg: '#ECFDF3', color: '#16A34A'},
  Medium: {bg: '#FFF7E8', color: '#B54708'},
  Low: {bg: '#FEF3F2', color: '#B42318'},
};

function DecisionBadge({decision}: {decision: string}) {
  const tone = DECISION_TONE[decision] ?? DECISION_TONE['Pending'];
  return (
    <Chip label={decision} size="small" sx={{fontWeight: 700, fontSize: 11, bgcolor: tone.bg, color: tone.color, border: `1px solid ${tone.border}`, borderRadius: 1.5}} />
  );
}

function ConfidenceBadge({confidence}: {confidence: string}) {
  const tone = CONFIDENCE_TONE[confidence] ?? CONFIDENCE_TONE['Medium'];
  return (
    <Chip label={confidence} size="small" sx={{fontWeight: 700, fontSize: 11, bgcolor: tone.bg, color: tone.color, borderRadius: 1.5}} />
  );
}

type Props = {
  proposal: LongTermPlanningAiProposal;
  onProposalChange: (updated: LongTermPlanningAiProposal) => void;
};

export default function CommitmentRecommendationSection({proposal, onProposalChange}: Props) {
  const [rejectDialogId, setRejectDialogId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [explainId, setExplainId] = useState<string | null>(null);

  const recommendations = proposal.commitmentRecommendations;
  const selectedCount = recommendations.filter((r) => r.selected).length;
  const allSelected = recommendations.length > 0 && selectedCount === recommendations.length;

  const handleToggleRow = (id: string, checked: boolean) => {
    onProposalChange({
      ...proposal,
      commitmentRecommendations: recommendations.map(
        (r): CommitmentRecommendation => r.id === id ? {...r, selected: checked} : r,
      ),
    });
  };

  const handleToggleAll = (checked: boolean) => {
    onProposalChange({
      ...proposal,
      commitmentRecommendations: recommendations.map((r): CommitmentRecommendation => ({...r, selected: checked})),
    });
  };

  const handleAccept = (id: string) => {
    onProposalChange(acceptCommitmentRecommendation(proposal, id));
  };

  const handleRejectConfirm = () => {
    if (!rejectDialogId || !rejectReason.trim()) return;
    onProposalChange(rejectCommitmentRecommendation(proposal, rejectDialogId, rejectReason.trim()));
    setRejectDialogId(null);
    setRejectReason('');
  };

  const handleAcceptSelected = () => {
    onProposalChange(acceptSelectedCommitmentRecommendations(proposal));
  };

  const explainedRec = recommendations.find((r) => r.id === explainId);

  return (
    <Box>
      <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, px: 0.5}}>
        <Typography sx={{fontSize: 12, color: planningTokens.textSecondary}}>
          {selectedCount} of {recommendations.length} selected
        </Typography>
        <Button
          size="small"
          variant="contained"
          disabled={selectedCount === 0}
          onClick={handleAcceptSelected}
          sx={{fontSize: 12, textTransform: 'none', fontWeight: 700}}
        >
          Accept Selected ({selectedCount})
        </Button>
      </Box>

      <Box sx={{overflow: 'auto'}}>
        <Table size="small" aria-label="Commitment Recommendations">
          <TableHead>
            <TableRow sx={{'& th': {fontWeight: 800, fontSize: 11, color: planningTokens.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap', borderBottom: `2px solid ${planningTokens.border}`}}}>
              <TableCell padding="checkbox">
                <Checkbox
                  size="small"
                  checked={allSelected}
                  indeterminate={selectedCount > 0 && !allSelected}
                  onChange={(_, checked) => handleToggleAll(checked)}
                  inputProps={{'aria-label': 'Select all recommendations'}}
                />
              </TableCell>
              <TableCell>Product</TableCell>
              <TableCell>Month</TableCell>
              <TableCell align="right">Forecast</TableCell>
              <TableCell align="right">AI Commit</TableCell>
              <TableCell align="right">Commit %</TableCell>
              <TableCell align="right">Gap</TableCell>
              <TableCell>Constraint</TableCell>
              <TableCell>Confidence</TableCell>
              <TableCell>Decision</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {recommendations.map((rec) => (
              <TableRow key={rec.id} selected={rec.selected} sx={{'&:hover': {bgcolor: '#F8FAFF'}, '& td': {fontSize: 12, py: 1, borderBottom: `1px solid ${planningTokens.border}`}}}>
                <TableCell padding="checkbox">
                  <Checkbox
                    size="small"
                    checked={rec.selected}
                    onChange={(_, checked) => handleToggleRow(rec.id, checked)}
                    inputProps={{'aria-label': `Select ${rec.productCode} ${rec.month}`}}
                  />
                </TableCell>
                <TableCell>
                  <Typography sx={{fontSize: 12, fontWeight: 700, color: planningTokens.textPrimary}}>{rec.productCode}</Typography>
                  <Typography sx={{fontSize: 11, color: planningTokens.textMuted}}>{rec.productDescription}</Typography>
                </TableCell>
                <TableCell sx={{whiteSpace: 'nowrap'}}>{rec.month}</TableCell>
                <TableCell align="right" sx={{fontWeight: 600}}>{rec.forecastDemand.toLocaleString()}</TableCell>
                <TableCell align="right" sx={{fontWeight: 700}}>{rec.recommendedCommitment.toLocaleString()}</TableCell>
                <TableCell align="right">
                  <Typography sx={{fontSize: 12, fontWeight: 700, color: rec.commitmentPercent >= 95 ? planningTokens.success : rec.commitmentPercent >= 80 ? planningTokens.warning : planningTokens.danger}}>
                    {rec.commitmentPercent}%
                  </Typography>
                </TableCell>
                <TableCell align="right" sx={{color: rec.uncoveredDemand > 0 ? planningTokens.danger : planningTokens.success, fontWeight: 600}}>
                  {rec.uncoveredDemand > 0 ? rec.uncoveredDemand.toLocaleString() : rec.uncoveredDemand < 0 ? `+${Math.abs(rec.uncoveredDemand).toLocaleString()}` : '0'}
                </TableCell>
                <TableCell sx={{maxWidth: 120}}>
                  <Typography sx={{fontSize: 11, color: planningTokens.textSecondary}}>{rec.primaryConstraint ?? 'None'}</Typography>
                </TableCell>
                <TableCell><ConfidenceBadge confidence={rec.confidence} /></TableCell>
                <TableCell><DecisionBadge decision={rec.plannerDecision} /></TableCell>
                <TableCell sx={{whiteSpace: 'nowrap'}}>
                  <Box sx={{display: 'flex', gap: 0.5}}>
                    <Button
                      size="small"
                      variant="outlined"
                      color="success"
                      disabled={rec.plannerDecision === 'Accepted'}
                      onClick={() => handleAccept(rec.id)}
                      sx={{fontSize: 11, py: 0.3, px: 1, textTransform: 'none', minWidth: 'unset'}}
                      aria-label={`Accept recommendation for ${rec.productCode} ${rec.month}`}
                    >
                      Accept
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      disabled={rec.plannerDecision === 'Rejected'}
                      onClick={() => {setRejectDialogId(rec.id); setRejectReason('');}}
                      sx={{fontSize: 11, py: 0.3, px: 1, textTransform: 'none', minWidth: 'unset'}}
                      aria-label={`Reject recommendation for ${rec.productCode} ${rec.month}`}
                    >
                      Reject
                    </Button>
                    <Tooltip title={rec.aiReasoning} placement="left">
                      <Button
                        size="small"
                        onClick={() => setExplainId(rec.id === explainId ? null : rec.id)}
                        sx={{fontSize: 11, py: 0.3, px: 1, textTransform: 'none', minWidth: 'unset', color: planningTokens.textSecondary}}
                        aria-label={`Show AI reasoning for ${rec.productCode} ${rec.month}`}
                      >
                        Explain
                      </Button>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>

      {explainedRec ? (
        <Box sx={{mt: 1.5, p: 1.5, bgcolor: 'var(--planning-ai-accent-bg)', borderRadius: 2, border: '1px solid #DDD6FE'}}>
          <Typography sx={{fontSize: 11, fontWeight: 900, color: '#6D28D9', mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.06em'}}>
            AI Reasoning — {explainedRec.productCode} {explainedRec.month}
          </Typography>
          <Typography sx={{fontSize: 12.5, color: '#4B5563', lineHeight: 1.6}}>{explainedRec.aiReasoning}</Typography>
        </Box>
      ) : null}

      {/* Reject dialog */}
      <Dialog open={Boolean(rejectDialogId)} onClose={() => setRejectDialogId(null)} fullWidth maxWidth="sm">
        <DialogTitle sx={{fontWeight: 900}}>Reject Recommendation</DialogTitle>
        <DialogContent dividers>
          <Typography sx={{fontSize: 13, color: planningTokens.textSecondary, mb: 1.5}}>
            Please provide a reason for rejecting this commitment recommendation.
          </Typography>
          <TextField
            label="Rejection Reason"
            multiline
            minRows={3}
            fullWidth
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Explain why this recommendation is being rejected..."
          />
        </DialogContent>
        <DialogActions sx={{p: 2}}>
          <Button onClick={() => setRejectDialogId(null)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            disabled={!rejectReason.trim()}
            onClick={handleRejectConfirm}
          >
            Reject
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
