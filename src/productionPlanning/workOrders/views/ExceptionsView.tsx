import React, { useMemo, useState } from 'react';
import {
  Box, Paper, Typography, Chip, Button, Alert, Dialog, DialogTitle, DialogContent,
  DialogActions, Table, TableHead, TableRow, TableCell, TableBody, Collapse,
  IconButton, Tooltip,
} from '@mui/material';
import {
  AutoAwesome as SparkleIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
  CheckCircle as CheckIcon,
  Cancel as RejectIcon,
} from '@mui/icons-material';
import type { WorkOrder, WOException, WOFilters } from '../types';
import { RiskChip, LifecycleChip } from '../components/WOStatusChip';

interface ExceptionsViewProps {
  workOrders: WorkOrder[];
  filters: WOFilters;
  onSelectWO: (wo: WorkOrder) => void;
}

interface ExceptionRow {
  exception: WOException;
  wo: WorkOrder;
}

const SEVERITY_ORDER: Record<string, number> = { Critical: 0, High: 1, Medium: 2, Low: 3 };

function applyFilters(wos: WorkOrder[], f: WOFilters): WorkOrder[] {
  return wos.filter(wo => {
    if (f.search) {
      const s = f.search.toLowerCase();
      if (!wo.woId.toLowerCase().includes(s) && !wo.materialDescription.toLowerCase().includes(s)) return false;
    }
    if (f.line.length && !f.line.includes(wo.line)) return false;
    return wo.exceptions.length > 0;
  });
}

export default function ExceptionsView({ workOrders, filters, onSelectWO }: ExceptionsViewProps) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ label: string; desc: string } | null>(null);

  const rows: ExceptionRow[] = useMemo(() => {
    const filtered = applyFilters(workOrders, filters);
    const result: ExceptionRow[] = [];
    filtered.forEach(wo => {
      wo.exceptions
        .filter(ex => !ex.resolvedAt)
        .forEach(ex => result.push({ exception: ex, wo }));
    });
    return result.sort((a, b) => {
      const sA = SEVERITY_ORDER[a.exception.severity] ?? 99;
      const sB = SEVERITY_ORDER[b.exception.severity] ?? 99;
      return sA - sB;
    });
  }, [workOrders, filters]);

  const critical = rows.filter(r => r.exception.severity === 'Critical').length;
  const high = rows.filter(r => r.exception.severity === 'High').length;

  return (
    <Box>
      {/* AI Banner */}
      <Alert severity="warning" icon={<SparkleIcon />} sx={{ mb: 2, borderRadius: 2, fontSize: '0.82rem' }}>
        <strong>AI Exception Inbox:</strong> {rows.length} active exceptions — {critical} critical, {high} high.
        {critical > 0 && ` Immediate action required on ${critical} critical item${critical !== 1 ? 's' : ''}.`}
        {' '}AI has prepared recommended actions for all unacknowledged exceptions below.
      </Alert>

      {/* Exception table */}
      <Box sx={{ overflowX: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.68rem', color: '#475569', bgcolor: 'var(--planning-surface-muted)', py: 0.75 }} />
              <TableCell sx={{ fontWeight: 700, fontSize: '0.68rem', color: '#475569', bgcolor: 'var(--planning-surface-muted)', py: 0.75 }}>WO / Line</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.68rem', color: '#475569', bgcolor: 'var(--planning-surface-muted)', py: 0.75 }}>Exception Type</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.68rem', color: '#475569', bgcolor: 'var(--planning-surface-muted)', py: 0.75 }}>Severity</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.68rem', color: '#475569', bgcolor: 'var(--planning-surface-muted)', py: 0.75 }}>Reason</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.68rem', color: '#475569', bgcolor: 'var(--planning-surface-muted)', py: 0.75 }}>Detected</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.68rem', color: '#475569', bgcolor: 'var(--planning-surface-muted)', py: 0.75 }}>Owner</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.68rem', color: '#475569', bgcolor: 'var(--planning-surface-muted)', py: 0.75 }}>AI Recommended Action</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.68rem', color: '#475569', bgcolor: 'var(--planning-surface-muted)', py: 0.75 }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map(({ exception: ex, wo }) => {
              const rowKey = `${wo.woId}-${ex.id}`;
              const isExpanded = expandedRow === rowKey;
              return (
                <React.Fragment key={rowKey}>
                  <TableRow
                    sx={{
                      bgcolor: ex.severity === 'Critical' ? '#FEF2F255' : ex.severity === 'High' ? '#FFF7ED55' : 'transparent',
                      '&:hover': { bgcolor: 'var(--planning-surface-muted)' },
                    }}
                  >
                    <TableCell sx={{ py: 0.75 }}>
                      <IconButton size="small" onClick={() => setExpandedRow(isExpanded ? null : rowKey)}>
                        {isExpanded ? <CollapseIcon fontSize="small" /> : <ExpandIcon fontSize="small" />}
                      </IconButton>
                    </TableCell>
                    <TableCell sx={{ py: 0.75 }}>
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: 800, color: '#1E40AF', display: 'block', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                        onClick={() => onSelectWO(wo)}
                      >
                        {wo.woId}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'var(--planning-text-secondary)', fontSize: '0.62rem' }}>{wo.line}</Typography>
                    </TableCell>
                    <TableCell sx={{ py: 0.75 }}>
                      <Chip label={ex.type} size="small" sx={{ bgcolor: 'var(--planning-surface-muted)', color: '#475569', fontWeight: 700, fontSize: '0.65rem' }} />
                    </TableCell>
                    <TableCell sx={{ py: 0.75 }}><RiskChip level={ex.severity} /></TableCell>
                    <TableCell sx={{ py: 0.75, maxWidth: 200 }}>
                      <Typography variant="caption" sx={{ fontSize: '0.72rem', color: 'var(--planning-text-secondary)' }}>{ex.reason}</Typography>
                    </TableCell>
                    <TableCell sx={{ py: 0.75, fontSize: '0.7rem', color: 'var(--planning-text-secondary)', whiteSpace: 'nowrap' }}>
                      {new Date(ex.detectedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </TableCell>
                    <TableCell sx={{ py: 0.75, fontSize: '0.7rem' }}>{ex.owner || '—'}</TableCell>
                    <TableCell sx={{ py: 0.75 }}>
                      {ex.aiRecommendation ? (
                        <Box>
                          <Typography variant="caption" sx={{ fontSize: '0.68rem', color: '#4338CA', display: 'block', mb: 0.5 }}>
                            {ex.aiRecommendation.slice(0, 60)}{ex.aiRecommendation.length > 60 ? '…' : ''}
                          </Typography>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<SparkleIcon sx={{ fontSize: '14px !important' }} />}
                            onClick={() => setConfirmAction({ label: ex.aiRecommendation!, desc: `Impact: ${ex.impact}` })}
                            sx={{ borderColor: '#818CF8', color: '#4338CA', fontSize: '0.65rem', py: 0.25, px: 1 }}
                          >
                            Prepare Action
                          </Button>
                        </Box>
                      ) : (
                        <Typography variant="caption" sx={{ color: 'var(--planning-text-muted)', fontSize: '0.68rem' }}>No AI recommendation</Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ py: 0.75 }}>
                      {ex.acknowledged
                        ? <Chip label="Acknowledged" size="small" sx={{ bgcolor: '#ECFDF5', color: '#059669', fontWeight: 700, fontSize: '0.62rem' }} />
                        : <Chip label="Open" size="small" sx={{ bgcolor: '#FEF2F2', color: '#DC2626', fontWeight: 700, fontSize: '0.62rem' }} />}
                    </TableCell>
                  </TableRow>

                  {/* Expanded detail row */}
                  <TableRow sx={{ bgcolor: '#FAFAFE' }}>
                    <TableCell colSpan={9} sx={{ py: 0, border: 'none' }}>
                      <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                        <Box sx={{ p: 2, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2 }}>
                          <Box>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', display: 'block', mb: 0.5 }}>Impact</Typography>
                            <Typography variant="body2" sx={{ fontSize: '0.78rem', color: 'var(--planning-text-secondary)' }}>{ex.impact}</Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', display: 'block', mb: 0.5 }}>WO Status</Typography>
                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                              <LifecycleChip status={wo.lifecycleStatus} />
                              <Chip label={`Risk Score: ${wo.aiRiskScore}`} size="small" sx={{ bgcolor: 'var(--planning-surface-muted)', color: '#475569', fontSize: '0.65rem' }} />
                            </Box>
                          </Box>
                          {ex.aiRecommendation && (
                            <Box>
                              <Typography variant="caption" sx={{ fontWeight: 700, color: '#4338CA', display: 'block', mb: 0.5 }}>Full AI Recommendation</Typography>
                              <Typography variant="body2" sx={{ fontSize: '0.78rem', color: 'var(--planning-text-secondary)' }}>{ex.aiRecommendation}</Typography>
                            </Box>
                          )}
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              );
            })}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} sx={{ textAlign: 'center', py: 5, color: 'var(--planning-text-muted)' }}>
                  No active exceptions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>

      {/* Confirm Action Dialog */}
      <Dialog open={!!confirmAction} onClose={() => setConfirmAction(null)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800, borderBottom: '1px solid var(--planning-border)' }}>Confirm AI Action</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Alert severity="warning" icon={<SparkleIcon />} sx={{ mb: 2, borderRadius: 2 }}>
            You are about to apply an AI-recommended action. Please review before confirming.
          </Alert>
          <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>Action:</Typography>
          <Typography variant="body2" sx={{ color: 'var(--planning-text-secondary)', mb: 2 }}>{confirmAction?.label}</Typography>
          <Typography variant="body2" sx={{ color: 'var(--planning-text-secondary)', fontSize: '0.8rem' }}>{confirmAction?.desc}</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button variant="outlined" startIcon={<RejectIcon />} onClick={() => setConfirmAction(null)} sx={{ color: '#DC2626', borderColor: '#DC2626' }}>Cancel</Button>
          <Button variant="contained" startIcon={<CheckIcon />} onClick={() => setConfirmAction(null)} sx={{ bgcolor: '#059669' }}>Confirm & Apply</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
