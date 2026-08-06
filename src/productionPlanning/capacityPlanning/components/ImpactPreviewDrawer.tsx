import {useState} from 'react';
import {
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {Close as CloseIcon, TrendingDown as TrendingDownIcon, TrendingUp as TrendingUpIcon} from '@mui/icons-material';
import {planningTokens} from '../../ui/planningTheme';
import type {PendingCellAdjustment} from '../types';
import {getCellBg, getCellColor, formatKHours} from '../utils';

type Props = {
  open: boolean;
  onClose: () => void;
  pending: PendingCellAdjustment[];
  scenarioLabel: string;
  onApply: (reason: string, comment: string) => void;
};

function StatusChangeBadge({from, to}: {from: string; to: string}) {
  if (from === to) return <Typography sx={{fontSize: 11, color: planningTokens.textMuted}}>—</Typography>;
  const improved = (
    (from === 'Overloaded' && (to === 'AtRisk' || to === 'OK')) ||
    (from === 'AtRisk' && to === 'OK')
  );
  const worsened = (
    (from === 'OK' && (to === 'AtRisk' || to === 'Overloaded')) ||
    (from === 'AtRisk' && to === 'Overloaded')
  );
  const color = improved ? '#16A34A' : worsened ? '#DC2626' : planningTokens.textSecondary;
  return (
    <Chip
      label={`${from} → ${to}`}
      size="small"
      sx={{fontSize: 9, height: 18, color, bgcolor: `color-mix(in srgb, ${color} 9%, transparent)`, border: `1px solid color-mix(in srgb, ${color} 27%, transparent)`, fontWeight: 700}}
    />
  );
}

const colSx = {
  px: 1, py: 0.5, fontSize: 11,
  borderRight: `1px solid ${planningTokens.border}`,
  textAlign: 'center' as const,
};

export default function ImpactPreviewDrawer({open, onClose, pending, scenarioLabel, onApply}: Props) {
  const [reason, setReason] = useState('');
  const [comment, setComment] = useState('');

  function handleClose() {
    setReason('');
    setComment('');
    onClose();
  }

  function handleApply() {
    if (!reason.trim()) return;
    onApply(reason.trim(), comment.trim());
    setReason('');
    setComment('');
  }

  const totalHoursDelta = pending.reduce((sum, a) => sum + a.hoursDelta, 0);
  const linesAffected = new Set(pending.map((a) => a.lineId)).size;
  const statusImprovements = pending.filter(
    (a) => a.baselineStatus !== a.scenarioStatus && (
      (a.baselineStatus === 'Overloaded' && a.scenarioStatus !== 'Overloaded') ||
      (a.baselineStatus === 'AtRisk' && a.scenarioStatus === 'OK')
    ),
  ).length;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={handleClose}
      PaperProps={{sx: {width: 480, display: 'flex', flexDirection: 'column'}}}
    >
      {/* Header */}
      <Box sx={{px: 2.5, py: 1.5, borderBottom: `1px solid ${planningTokens.border}`, display: 'flex', alignItems: 'center', bgcolor: planningTokens.surfaceMuted}}>
        <Typography sx={{fontSize: 14, fontWeight: 800, color: planningTokens.textPrimary, flex: 1}}>
          Preview Impact
        </Typography>
        <Typography sx={{fontSize: 11, color: planningTokens.textSecondary, mr: 1}}>→ {scenarioLabel}</Typography>
        <IconButton size="small" onClick={handleClose} sx={{p: 0.4}}>
          <CloseIcon sx={{fontSize: 16}} />
        </IconButton>
      </Box>

      {/* Summary bar */}
      <Box sx={{px: 2.5, py: 1, borderBottom: `1px solid ${planningTokens.border}`, display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center', bgcolor: 'var(--planning-surface-muted)'}}>
        <Stack direction="row" spacing={0.5} alignItems="center">
          {totalHoursDelta >= 0
            ? <TrendingUpIcon sx={{fontSize: 14, color: '#16A34A'}} />
            : <TrendingDownIcon sx={{fontSize: 14, color: '#DC2626'}} />
          }
          <Typography sx={{fontSize: 11, fontWeight: 700, color: totalHoursDelta >= 0 ? '#16A34A' : '#DC2626'}}>
            {totalHoursDelta >= 0 ? '+' : ''}{formatKHours(totalHoursDelta)} hrs
          </Typography>
        </Stack>
        <Chip label={`${pending.length} cells`} size="small" sx={{fontSize: 10, height: 18, bgcolor: 'var(--planning-ai-accent-bg)', color: '#4F46E5'}} />
        <Chip label={`${linesAffected} line${linesAffected !== 1 ? 's' : ''}`} size="small" sx={{fontSize: 10, height: 18}} />
        {statusImprovements > 0 && (
          <Chip
            label={`${statusImprovements} resolved`}
            size="small"
            sx={{fontSize: 10, height: 18, bgcolor: '#F0FDF4', color: '#16A34A', border: '1px solid #86EFAC'}}
          />
        )}
      </Box>

      {/* Table */}
      <Box sx={{flex: 1, overflowY: 'auto', px: 0}}>
        <Box component="table" sx={{width: '100%', borderCollapse: 'collapse'}}>
          <Box component="thead">
            <Box component="tr" sx={{bgcolor: planningTokens.surfaceMuted}}>
              {['Line', 'Month', 'Before', 'After', 'Before%', 'After%', 'Status'].map((h) => (
                <Box component="th" key={h} sx={{...colSx, fontSize: 10, fontWeight: 700, color: planningTokens.textSecondary, py: 0.75}}>
                  {h}
                </Box>
              ))}
            </Box>
          </Box>
          <Box component="tbody">
            {[...pending]
              .sort((a, b) => {
                const order = ['Overloaded', 'AtRisk', 'OK', 'NoData'];
                return order.indexOf(a.scenarioStatus) - order.indexOf(b.scenarioStatus);
              })
              .map((adj, idx) => (
                <Box
                  component="tr"
                  key={`${adj.lineId}-${adj.month}-${idx}`}
                  sx={{borderTop: `1px solid ${planningTokens.border}`, '&:hover': {bgcolor: '#F8FAFF'}}}
                >
                  <Box component="td" sx={{...colSx, fontWeight: 600, textAlign: 'left', fontSize: 11}}>
                    {adj.lineName}
                  </Box>
                  <Box component="td" sx={{...colSx, color: planningTokens.textSecondary}}>
                    {adj.month}
                  </Box>
                  <Box component="td" sx={{...colSx, color: planningTokens.textSecondary}}>
                    {formatKHours(adj.baselineAvailable)}
                  </Box>
                  <Box component="td" sx={{...colSx, fontWeight: 600, color: adj.hoursDelta >= 0 ? '#16A34A' : '#DC2626'}}>
                    {formatKHours(adj.scenarioAvailable)}
                  </Box>
                  <Box component="td" sx={{...colSx, bgcolor: getCellBg(adj.baselineUtilPct), color: getCellColor(adj.baselineUtilPct), fontWeight: 700}}>
                    {adj.baselineUtilPct}%
                  </Box>
                  <Box component="td" sx={{...colSx, bgcolor: getCellBg(adj.scenarioUtilPct), color: getCellColor(adj.scenarioUtilPct), fontWeight: 700}}>
                    {adj.scenarioUtilPct}%
                  </Box>
                  <Box component="td" sx={{...colSx, px: 0.5}}>
                    <StatusChangeBadge from={adj.baselineStatus} to={adj.scenarioStatus} />
                  </Box>
                </Box>
              ))}
          </Box>
        </Box>
      </Box>

      <Divider />

      {/* Reason / comment form */}
      <Box sx={{px: 2.5, py: 1.5, display: 'flex', flexDirection: 'column', gap: 1}}>
        <TextField
          label="Reason for adjustment *"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          multiline
          minRows={2}
          fullWidth
          size="small"
          inputProps={{style: {fontSize: 12}}}
          InputLabelProps={{style: {fontSize: 12}}}
        />
        <TextField
          label="Additional comment (optional)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          multiline
          minRows={1}
          fullWidth
          size="small"
          inputProps={{style: {fontSize: 12}}}
          InputLabelProps={{style: {fontSize: 12}}}
        />
      </Box>

      {/* Footer */}
      <Box sx={{px: 2.5, py: 1.5, borderTop: `1px solid ${planningTokens.border}`, display: 'flex', gap: 1, justifyContent: 'flex-end', bgcolor: planningTokens.surfaceMuted}}>
        <Button
          variant="text"
          size="small"
          onClick={handleClose}
          sx={{fontSize: 12, textTransform: 'none', color: planningTokens.textSecondary}}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          size="small"
          disabled={!reason.trim()}
          onClick={handleApply}
          sx={{fontSize: 12, textTransform: 'none', fontWeight: 700, bgcolor: planningTokens.primaryBlue}}
        >
          Apply to Scenario
        </Button>
      </Box>
    </Drawer>
  );
}
