import React, { useMemo } from 'react';
import {
  Drawer, Box, Typography, IconButton, Chip, Divider, Paper,
  LinearProgress, Table, TableBody, TableCell, TableHead, TableRow,
  Tooltip, Button, Alert, Stack,
} from '@mui/material';
import {
  Close as CloseIcon,
  CheckCircle as CheckIcon,
  Warning as WarnIcon,
  Cancel as BlockIcon,
  RemoveCircle as NAIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Done as DoneIcon,
  Inventory2 as MaterialIcon,
  Engineering as MachineIcon,
  Assignment as DocIcon,
  Science as QualityIcon,
  LocalShipping as WarehouseIcon,
  People as LaborIcon,
  Sanitizer as SteriIcon,
  Schedule as ScheduleIcon,
  BatchPrediction as BatchIcon,
} from '@mui/icons-material';
import type { WorkOrder, WOConversationMessage, WOReadinessCheck, WOLifecycleStatus } from '../types';
import { LifecycleChip, ReadinessChip, RiskChip, DataFreshnessChip } from './WOStatusChip';
import { GANTT_EVENTS } from '../mockData';
import AICopilotPanel from './AICopilotPanel';

interface WODetailDrawerProps {
  wo: WorkOrder | null;
  onClose: () => void;
  bluAiConversation?: WOConversationMessage[];
  onBluAiConversationChange?: (messages: WOConversationMessage[]) => void;
  onOpenBluAiWorkflow?: () => void;
}

const READINESS_ICON: Record<string, React.ReactNode> = {
  Ready: <CheckIcon sx={{ fontSize: 16, color: '#059669' }} />,
  Warning: <WarnIcon sx={{ fontSize: 16, color: '#D97706' }} />,
  Blocked: <BlockIcon sx={{ fontSize: 16, color: '#DC2626' }} />,
  NotApplicable: <NAIcon sx={{ fontSize: 16, color: 'var(--planning-text-muted)' }} />,
};

const CATEGORY_ICON: Record<string, React.ReactNode> = {
  Material: <MaterialIcon sx={{ fontSize: 14 }} />,
  Machine: <MachineIcon sx={{ fontSize: 14 }} />,
  Labor: <LaborIcon sx={{ fontSize: 14 }} />,
  Documentation: <DocIcon sx={{ fontSize: 14 }} />,
  Quality: <QualityIcon sx={{ fontSize: 14 }} />,
  Warehouse: <WarehouseIcon sx={{ fontSize: 14 }} />,
  Sterilization: <SteriIcon sx={{ fontSize: 14 }} />,
  Schedule: <ScheduleIcon sx={{ fontSize: 14 }} />,
  BatchLot: <BatchIcon sx={{ fontSize: 14 }} />,
};

const ACTION_CONFIG: Record<WOLifecycleStatus, { label: string; disabled?: boolean; reason?: string; color?: string }[]> = {
  Draft:           [{ label: 'Move to Planned', color: '#2563EB' }, { label: 'Cancel WO', color: '#DC2626' }],
  Planned:         [{ label: 'Schedule WO', color: '#0369A1' }, { label: 'Move Back to Draft' }, { label: 'Cancel WO', color: '#DC2626' }],
  Scheduled:       [{ label: 'Mark Ready for Release', color: '#059669' }, { label: 'Put On Hold', color: '#B45309' }, { label: 'Cancel WO', color: '#DC2626' }],
  ReadyForRelease: [{ label: 'Release WO', color: '#047857' }, { label: 'Put On Hold', color: '#B45309' }],
  Released:        [{ label: 'Start Execution', color: '#92400E' }, { label: 'Put On Hold', color: '#B45309' }, { label: 'Cancel WO', color: '#DC2626' }],
  InExecution:     [{ label: 'Complete WO', color: '#047857' }, { label: 'Put On Hold', color: '#B45309' }],
  OnHold:          [{ label: 'Resume WO', color: '#059669' }, { label: 'Cancel WO', color: '#DC2626' }],
  Completed:       [{ label: 'Close WO', color: '#15803D' }],
  Closed:          [],
  Cancelled:       [],
};

function MiniGantt({ wo }: { wo: WorkOrder }) {
  const events = useMemo(() => GANTT_EVENTS.filter(e => e.machineId === wo.machineId), [wo.machineId]);
  const scheduled = new Date(wo.scheduledStart).getTime();
  const scheduledEnd = new Date(wo.scheduledEnd).getTime();

  const windowStart = scheduled - 6 * 3_600_000;
  const windowEnd = scheduledEnd + 6 * 3_600_000;
  const windowMs = windowEnd - windowStart;

  const toLeft = (t: number) => Math.max(0, Math.min(100, ((t - windowStart) / windowMs) * 100));
  const toWidth = (s: number, e: number) => Math.max(0, Math.min(100 - toLeft(s), ((e - s) / windowMs) * 100));

  const COLOR: Record<string, string> = {
    Maintenance: '#7C3AED',
    Downtime:    '#DC2626',
    LowOEE:      '#F59E0B',
    Normal:      '#D1FAE5',
    Changeover:  '#3B82F6',
    Cleaning:    '#0EA5E9',
  };

  const eventsInWindow = events.filter(ev => {
    const s = new Date(ev.startTime).getTime();
    const e = new Date(ev.endTime).getTime();
    return e > windowStart && s < windowEnd;
  });

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

  return (
    <Box>
      <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', mb: 1 }}>
        Machine Timeline — {wo.machine}
      </Typography>

      <Box sx={{ position: 'relative', height: 56, borderRadius: 1, overflow: 'hidden', bgcolor: 'var(--planning-surface-muted)', border: '1px solid var(--planning-border)' }}>
        {/* Event bars */}
        {eventsInWindow.map(ev => {
          const s = new Date(ev.startTime).getTime();
          const e = new Date(ev.endTime).getTime();
          const left = toLeft(s);
          const width = toWidth(s, e);
          if (width < 0.1) return null;
          return (
            <Tooltip key={ev.id} title={`${ev.label} (${formatTime(ev.startTime)}–${formatTime(ev.endTime)})`} arrow>
              <Box sx={{
                position: 'absolute', top: 4, height: 20,
                left: `${left}%`, width: `${width}%`,
                bgcolor: COLOR[ev.type] || '#CBD5E1',
                opacity: ev.type === 'Normal' ? 0.4 : 0.85,
                borderRadius: 0.5,
                cursor: 'default',
              }} />
            </Tooltip>
          );
        })}

        {/* WO bar */}
        {(() => {
          const s = scheduled;
          const e = scheduledEnd;
          const actualS = wo.actualStart ? new Date(wo.actualStart).getTime() : null;
          const actualE = wo.actualEnd ? new Date(wo.actualEnd).getTime() : null;
          const left = toLeft(s);
          const width = toWidth(s, e);
          return (
            <>
              <Tooltip title={`WO ${wo.woId}: ${formatTime(wo.scheduledStart)}–${formatTime(wo.scheduledEnd)} (planned)`} arrow>
                <Box sx={{
                  position: 'absolute', top: 28, height: 20,
                  left: `${left}%`, width: `${width}%`,
                  bgcolor: '#1E40AF', borderRadius: 0.5, opacity: 0.85,
                  display: 'flex', alignItems: 'center', px: 0.5, overflow: 'hidden',
                }}>
                  <Typography variant="caption" sx={{ color: 'white', fontSize: '0.6rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {wo.woId}
                  </Typography>
                </Box>
              </Tooltip>
              {actualS && (
                <Tooltip title={`Actual: ${formatTime(wo.actualStart!)}–${actualE ? formatTime(wo.actualEnd!) : 'ongoing'}`} arrow>
                  <Box sx={{
                    position: 'absolute', top: 28, height: 20,
                    left: `${toLeft(actualS)}%`, width: `${toWidth(actualS, actualE || windowEnd)}%`,
                    bgcolor: '#059669', borderRadius: 0.5, opacity: 0.5,
                  }} />
                </Tooltip>
              )}
            </>
          );
        })()}
      </Box>

      {/* Legend */}
      <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mt: 1 }}>
        {Object.entries(COLOR).map(([type, color]) => (
          <Box key={type} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 10, height: 10, borderRadius: 0.5, bgcolor: color }} />
            <Typography variant="caption" sx={{ color: 'var(--planning-text-secondary)', fontSize: '0.64rem' }}>{type}</Typography>
          </Box>
        ))}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 10, height: 10, borderRadius: 0.5, bgcolor: '#1E40AF' }} />
          <Typography variant="caption" sx={{ color: 'var(--planning-text-secondary)', fontSize: '0.64rem' }}>WO (planned)</Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default function WODetailDrawer({
  wo,
  onClose,
  bluAiConversation = [],
  onBluAiConversationChange,
  onOpenBluAiWorkflow,
}: WODetailDrawerProps) {
  if (!wo) return null;

  const actions = ACTION_CONFIG[wo.lifecycleStatus] || [];

  return (
    <Drawer
      anchor="right"
      open={!!wo}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100%', sm: 620 }, p: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' } }}
    >
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: '1px solid var(--planning-border)', display: 'flex', alignItems: 'flex-start', gap: 1.5, flexShrink: 0 }}>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A' }}>{wo.woId}</Typography>
            <LifecycleChip status={wo.lifecycleStatus} />
            <ReadinessChip status={wo.readinessStatus} />
            <RiskChip level={wo.riskLevel} />
          </Box>
          <Typography variant="body2" sx={{ color: '#475569', fontWeight: 600 }}>{wo.materialDescription}</Typography>
          <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
            <Chip label={`Batch ${wo.batch}`} size="small" sx={{ bgcolor: 'var(--planning-surface-muted)', color: '#475569', fontSize: '0.68rem' }} />
            <Chip label={wo.line} size="small" sx={{ bgcolor: 'var(--planning-surface-muted)', color: '#475569', fontSize: '0.68rem' }} />
            <Chip label={wo.machine} size="small" sx={{ bgcolor: 'var(--planning-surface-muted)', color: '#475569', fontSize: '0.68rem' }} />
            <DataFreshnessChip freshness={wo.dataFreshness} hours={wo.dataFreshnessHours} />
          </Box>
        </Box>
        <IconButton size="small" onClick={onClose}><CloseIcon /></IconButton>
      </Box>

      {/* Scrollable content */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
        <Stack spacing={2}>
          {/* 1. AI Copilot */}
          <AICopilotPanel
            wo={wo}
            conversation={bluAiConversation}
            onConversationChange={onBluAiConversationChange}
            onOpenBluAiWorkflow={onOpenBluAiWorkflow}
          />

          {/* 2. Readiness */}
          <Paper elevation={0} sx={{ p: 2, border: '1px solid var(--planning-border)', borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5 }}>Readiness Checks</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
              {wo.readinessChecks.map(rc => (
                <Box key={rc.category} sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.75, p: 1, borderRadius: 1.5, bgcolor: rc.status === 'Blocked' ? '#FEF2F2' : rc.status === 'Warning' ? '#FFFBEB' : '#F8FAFC' }}>
                  {READINESS_ICON[rc.status]}
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {CATEGORY_ICON[rc.category]}
                      <Typography variant="caption" sx={{ fontWeight: 700, color: 'var(--planning-text-secondary)', fontSize: '0.68rem' }}>{rc.category}</Typography>
                    </Box>
                    <Typography variant="caption" sx={{ color: 'var(--planning-text-secondary)', fontSize: '0.65rem', display: 'block' }}>{rc.reason}</Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>

          {/* 3. Execution Summary */}
          <Paper elevation={0} sx={{ p: 2, border: '1px solid var(--planning-border)', borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5 }}>Execution Summary</Typography>
            <LinearProgress variant="determinate" value={wo.progressPct}
              sx={{ height: 8, borderRadius: 4, mb: 1.5, bgcolor: '#E2E8F0', '& .MuiLinearProgress-bar': { bgcolor: wo.progressPct > 80 ? '#059669' : '#2563EB' } }} />
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1, mb: 1 }}>
              {[
                { label: 'Planned', value: `${wo.plannedQty} ${wo.uom}` },
                { label: 'Completed', value: `${wo.completedQty} ${wo.uom}` },
                { label: 'Scrap', value: `${wo.scrapQty} ${wo.uom}` },
              ].map(f => (
                <Box key={f.label} sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: 'var(--planning-text-secondary)', display: 'block' }}>{f.label}</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: '#0F172A' }}>{f.value}</Typography>
                </Box>
              ))}
            </Box>
            {wo.currentBlocker && (
              <Alert severity="warning" sx={{ fontSize: '0.78rem', borderRadius: 2, mt: 1 }}><strong>Blocker:</strong> {wo.currentBlocker}</Alert>
            )}
            {wo.delayReason && (
              <Alert severity="error" sx={{ fontSize: '0.78rem', borderRadius: 2, mt: 1 }}><strong>Delay:</strong> {wo.delayReason}</Alert>
            )}
          </Paper>

          {/* 4. Materials */}
          <Paper elevation={0} sx={{ p: 2, border: '1px solid var(--planning-border)', borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5 }}>Materials & Warehouse</Typography>
            <Box sx={{ overflowX: 'auto' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {['Material', 'Required', 'Available', 'Shortage', 'Staged', 'Batch'].map(h => (
                      <TableCell key={h} sx={{ fontWeight: 700, fontSize: '0.68rem', color: '#475569', py: 0.5 }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {wo.materials.map(m => (
                    <TableRow key={m.materialCode} sx={{ bgcolor: m.missingStock ? '#FEF2F2' : 'transparent' }}>
                      <TableCell sx={{ fontSize: '0.72rem', py: 0.5 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, display: 'block' }}>{m.materialCode}</Typography>
                        <Typography variant="caption" sx={{ color: 'var(--planning-text-secondary)' }}>{m.description}</Typography>
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.72rem', py: 0.5 }}>{m.requiredQty} {m.uom}</TableCell>
                      <TableCell sx={{ fontSize: '0.72rem', py: 0.5 }}>{m.availableQty} {m.uom}</TableCell>
                      <TableCell sx={{ fontSize: '0.72rem', py: 0.5, color: m.shortageQty > 0 ? '#DC2626' : '#059669', fontWeight: 700 }}>
                        {m.shortageQty > 0 ? `-${m.shortageQty}` : '—'}
                      </TableCell>
                      <TableCell sx={{ py: 0.5 }}>
                        {m.stagingReady
                          ? <CheckIcon sx={{ fontSize: 16, color: '#059669' }} />
                          : <WarnIcon sx={{ fontSize: 16, color: '#D97706' }} />}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.72rem', py: 0.5 }}>{m.batch}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Paper>

          {/* 5. Quality */}
          <Paper elevation={0} sx={{ p: 2, border: '1px solid var(--planning-border)', borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5 }}>Quality</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1.5 }}>
              {[
                { label: 'Status', value: wo.quality.status },
                { label: 'Confidence', value: `${wo.quality.releaseConfidence}%` },
                { label: 'Deviations', value: wo.quality.deviations },
                { label: 'Holds', value: wo.quality.holds },
              ].map(f => (
                <Box key={f.label} sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: 'var(--planning-text-secondary)', display: 'block' }}>{f.label}</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: '#0F172A' }}>{f.value}</Typography>
                </Box>
              ))}
            </Box>
            {wo.quality.comments && (
              <Typography variant="caption" sx={{ color: 'var(--planning-text-secondary)', mt: 1, display: 'block' }}>{wo.quality.comments}</Typography>
            )}
          </Paper>

          {/* 6. Sterilization (conditional) */}
          {wo.sterilizationRequired && wo.sterilization && (
            <Paper elevation={0} sx={{ p: 2, border: '1px solid var(--planning-border)', borderRadius: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5 }}>Sterilization</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1.5 }}>
                {[
                  { label: 'Slot Status', value: wo.sterilization.slotStatus },
                  { label: 'Vendor Capacity', value: wo.sterilization.vendorCapacity },
                  { label: 'Risk', value: wo.sterilization.riskLevel },
                ].map(f => (
                  <Box key={f.label} sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ color: 'var(--planning-text-secondary)', display: 'block' }}>{f.label}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#0F172A' }}>{f.value}</Typography>
                  </Box>
                ))}
              </Box>
              {wo.sterilization.dwellDeadline && (
                <Typography variant="caption" sx={{ color: '#DC2626', mt: 1, fontWeight: 700, display: 'block' }}>
                  Dwell Deadline: {new Date(wo.sterilization.dwellDeadline).toLocaleString()}
                </Typography>
              )}
            </Paper>
          )}

          {/* 7. Mini Gantt */}
          <Paper elevation={0} sx={{ p: 2, border: '1px solid var(--planning-border)', borderRadius: 2 }}>
            <MiniGantt wo={wo} />
          </Paper>

          {/* 8. Audit Events */}
          <Paper elevation={0} sx={{ p: 2, border: '1px solid var(--planning-border)', borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5 }}>Event History</Typography>
            <Stack spacing={1}>
              {wo.auditEvents.slice(0, 8).map(ev => (
                <Box key={ev.id} sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                  <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#CBD5E1', mt: 0.75, flexShrink: 0 }} />
                  <Box>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: 'var(--planning-text-secondary)' }}>{ev.eventType}</Typography>
                      <Typography variant="caption" sx={{ color: 'var(--planning-text-muted)', fontSize: '0.65rem' }}>{new Date(ev.timestamp).toLocaleString()}</Typography>
                      <Typography variant="caption" sx={{ color: 'var(--planning-text-secondary)', fontSize: '0.65rem' }}>by {ev.changedBy}</Typography>
                    </Box>
                    {ev.comment && <Typography variant="caption" sx={{ color: 'var(--planning-text-secondary)', display: 'block' }}>{ev.comment}</Typography>}
                    {ev.previousValue && ev.newValue && (
                      <Typography variant="caption" sx={{ color: 'var(--planning-text-secondary)', display: 'block' }}>
                        {ev.field}: <span style={{ color: '#DC2626' }}>{ev.previousValue}</span> → <span style={{ color: '#059669' }}>{ev.newValue}</span>
                      </Typography>
                    )}
                  </Box>
                </Box>
              ))}
            </Stack>
          </Paper>
        </Stack>
      </Box>

      {/* Action footer */}
      {actions.length > 0 && (
        <Box sx={{ p: 2, borderTop: '1px solid var(--planning-border)', display: 'flex', gap: 1, flexWrap: 'wrap', flexShrink: 0 }}>
          {actions.map(a => (
            <Tooltip key={a.label} title={a.reason || ''} disableHoverListener={!a.reason}>
              <span>
                <Button
                  size="small"
                  variant={a.color ? 'contained' : 'outlined'}
                  disabled={!!a.disabled}
                  sx={a.color ? { bgcolor: a.color, '&:hover': { bgcolor: a.color + 'dd' }, fontSize: '0.72rem' } : { fontSize: '0.72rem' }}
                >
                  {a.label}
                </Button>
              </span>
            </Tooltip>
          ))}
        </Box>
      )}
    </Drawer>
  );
}
