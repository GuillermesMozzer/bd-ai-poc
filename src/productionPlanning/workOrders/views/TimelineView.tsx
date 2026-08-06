import React, { useMemo, useState } from 'react';
import { Box, Typography, Paper, Chip, Tooltip, ToggleButtonGroup, ToggleButton } from '@mui/material';
import type { WorkOrder, WOFilters } from '../types';
import { LIFECYCLE_COLORS } from '../components/WOStatusChip';
import { GANTT_EVENTS } from '../mockData';

interface TimelineViewProps {
  workOrders: WorkOrder[];
  filters: WOFilters;
  onSelectWO: (wo: WorkOrder) => void;
}

type ZoomLevel = 'day' | 'week' | 'month';

const ZOOM_HOURS: Record<ZoomLevel, number> = { day: 24, week: 168, month: 720 };

const EVENT_COLORS: Record<string, { bg: string; label: string }> = {
  Maintenance: { bg: '#7C3AED', label: 'Maint.' },
  Downtime:    { bg: '#DC2626', label: 'Down' },
  LowOEE:      { bg: '#F59E0B', label: 'Low OEE' },
  Normal:      { bg: '#D1FAE5', label: 'Normal' },
  Changeover:  { bg: '#3B82F6', label: 'C/O' },
  Cleaning:    { bg: '#0EA5E9', label: 'Clean' },
};

function applyFilters(wos: WorkOrder[], f: WOFilters): WorkOrder[] {
  return wos.filter(wo => {
    if (f.search) {
      const s = f.search.toLowerCase();
      if (!wo.woId.toLowerCase().includes(s) && !wo.materialDescription.toLowerCase().includes(s)) return false;
    }
    if (f.lifecycleStatus.length && !f.lifecycleStatus.includes(wo.lifecycleStatus)) return false;
    if (f.line.length && !f.line.includes(wo.line)) return false;
    if (f.machine.length && !f.machine.includes(wo.machine)) return false;
    return true;
  });
}

export default function TimelineView({ workOrders, filters, onSelectWO }: TimelineViewProps) {
  const [zoom, setZoom] = useState<ZoomLevel>('week');

  const filtered = useMemo(() => applyFilters(workOrders, filters), [workOrders, filters]);

  const windowHours = ZOOM_HOURS[zoom];
  const NOW = new Date('2026-05-26T08:00:00.000Z').getTime();
  const windowStart = NOW - (windowHours / 4) * 3_600_000;
  const windowEnd = windowStart + windowHours * 3_600_000;
  const windowMs = windowEnd - windowStart;

  const toLeft = (t: number) => Math.max(0, Math.min(100, ((t - windowStart) / windowMs) * 100));
  const toWidth = (s: number, e: number) => Math.max(0, Math.min(100 - toLeft(s), ((e - s) / windowMs) * 100));

  const machines = useMemo(() => {
    const m = new Map<string, { machineId: string; machine: string; line: string; wos: WorkOrder[] }>();
    filtered.forEach(wo => {
      if (!m.has(wo.machineId)) m.set(wo.machineId, { machineId: wo.machineId, machine: wo.machine, line: wo.line, wos: [] });
      m.get(wo.machineId)!.wos.push(wo);
    });
    return Array.from(m.values()).sort((a, b) => a.line.localeCompare(b.line) || a.machine.localeCompare(b.machine));
  }, [filtered]);

  // Build tick marks for axis
  const tickCount = zoom === 'day' ? 24 : zoom === 'week' ? 7 : 10;
  const ticks = Array.from({ length: tickCount + 1 }, (_, i) => {
    const t = windowStart + (windowMs / tickCount) * i;
    return { t, label: new Date(t).toLocaleDateString('en-US', zoom === 'day' ? { hour: '2-digit' } : { month: 'short', day: 'numeric' }) };
  });

  const ROW_H = 56;
  const LABEL_W = 160;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {Object.entries(EVENT_COLORS).map(([type, { bg, label }]) => (
            <Box key={type} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 10, height: 10, borderRadius: 0.5, bgcolor: bg }} />
              <Typography variant="caption" sx={{ color: 'var(--planning-text-secondary)', fontSize: '0.65rem' }}>{label}</Typography>
            </Box>
          ))}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 10, height: 10, borderRadius: 0.5, bgcolor: '#1E40AF' }} />
            <Typography variant="caption" sx={{ color: 'var(--planning-text-secondary)', fontSize: '0.65rem' }}>WO</Typography>
          </Box>
        </Box>
        <ToggleButtonGroup size="small" value={zoom} exclusive onChange={(_, v) => v && setZoom(v)}>
          <ToggleButton value="day" sx={{ fontSize: '0.7rem', py: 0.5 }}>Day</ToggleButton>
          <ToggleButton value="week" sx={{ fontSize: '0.7rem', py: 0.5 }}>Week</ToggleButton>
          <ToggleButton value="month" sx={{ fontSize: '0.7rem', py: 0.5 }}>Month</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Paper elevation={0} sx={{ border: '1px solid var(--planning-border)', borderRadius: 2, overflow: 'hidden' }}>
        {/* Time axis */}
        <Box sx={{ display: 'flex', borderBottom: '1px solid var(--planning-border)', bgcolor: 'var(--planning-surface-muted)' }}>
          <Box sx={{ width: LABEL_W, flexShrink: 0, borderRight: '1px solid #E2E8F0', py: 0.75, px: 1.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', fontSize: '0.68rem' }}>Line / Machine</Typography>
          </Box>
          <Box sx={{ flex: 1, position: 'relative', height: 28, overflow: 'hidden' }}>
            {ticks.map((tick, i) => (
              <Box key={i} sx={{ position: 'absolute', left: `${((tick.t - windowStart) / windowMs) * 100}%`, top: 0, height: '100%', borderLeft: '1px solid #E2E8F0' }}>
                <Typography variant="caption" sx={{ fontSize: '0.6rem', color: 'var(--planning-text-muted)', pl: 0.5, whiteSpace: 'nowrap' }}>{tick.label}</Typography>
              </Box>
            ))}
            {/* Now marker */}
            <Box sx={{ position: 'absolute', left: `${((NOW - windowStart) / windowMs) * 100}%`, top: 0, height: '100%', borderLeft: '2px solid #DC2626', zIndex: 2 }} />
          </Box>
        </Box>

        {/* Machine rows */}
        {machines.map(({ machineId, machine, line, wos }) => {
          const events = GANTT_EVENTS.filter(e => e.machineId === machineId);
          return (
            <Box key={machineId} sx={{ display: 'flex', borderBottom: '1px solid var(--planning-border)', '&:last-child': { borderBottom: 'none' } }}>
              {/* Label */}
              <Box sx={{ width: LABEL_W, flexShrink: 0, borderRight: '1px solid #E2E8F0', p: 1.5, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.7rem', color: 'var(--planning-text-secondary)' }}>{machine}</Typography>
                <Typography variant="caption" sx={{ fontSize: '0.62rem', color: 'var(--planning-text-muted)' }}>{line}</Typography>
              </Box>

              {/* Timeline area */}
              <Box sx={{ flex: 1, position: 'relative', height: ROW_H, overflow: 'hidden', bgcolor: '#FAFAFA' }}>
                {/* Now line */}
                <Box sx={{ position: 'absolute', left: `${((NOW - windowStart) / windowMs) * 100}%`, top: 0, height: '100%', borderLeft: '2px dashed #DC262644', zIndex: 3 }} />

                {/* Event bars (top half) */}
                {events.map(ev => {
                  const s = new Date(ev.startTime).getTime();
                  const e = new Date(ev.endTime).getTime();
                  if (e < windowStart || s > windowEnd) return null;
                  const left = toLeft(s);
                  const width = toWidth(s, e);
                  if (width < 0.2) return null;
                  const cfg = EVENT_COLORS[ev.type] || { bg: '#CBD5E1', label: ev.type };
                  return (
                    <Tooltip key={ev.id} title={`${ev.type}: ${ev.label}`} arrow>
                      <Box sx={{
                        position: 'absolute', top: 4, height: 22,
                        left: `${left}%`, width: `${width}%`,
                        bgcolor: cfg.bg, opacity: ev.type === 'Normal' ? 0.3 : 0.8,
                        borderRadius: 0.5, overflow: 'hidden',
                      }}>
                        {width > 3 && (
                          <Typography variant="caption" sx={{ fontSize: '0.58rem', color: 'white', pl: 0.5, fontWeight: 700, lineHeight: '22px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
                            {cfg.label}
                          </Typography>
                        )}
                      </Box>
                    </Tooltip>
                  );
                })}

                {/* WO bars (bottom half) */}
                {wos.map(wo => {
                  const s = new Date(wo.scheduledStart).getTime();
                  const e = new Date(wo.scheduledEnd).getTime();
                  if (e < windowStart || s > windowEnd) return null;
                  const left = toLeft(s);
                  const width = toWidth(s, e);
                  if (width < 0.1) return null;
                  const c = LIFECYCLE_COLORS[wo.lifecycleStatus];
                  const isDelayed = wo.actualStart && !wo.actualEnd && new Date(wo.scheduledEnd).getTime() < NOW;
                  return (
                    <Tooltip key={wo.woId} title={`${wo.woId} — ${wo.materialDescription} (${wo.lifecycleStatus})`} arrow>
                      <Box
                        onClick={() => onSelectWO(wo)}
                        sx={{
                          position: 'absolute', top: 30, height: 22,
                          left: `${left}%`, width: `${width}%`,
                          bgcolor: c.color, opacity: 0.85,
                          borderRadius: 0.5, cursor: 'pointer', overflow: 'hidden',
                          ...(isDelayed ? { backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(255,255,255,0.3) 3px, rgba(255,255,255,0.3) 6px)' } : {}),
                          '&:hover': { opacity: 1, boxShadow: '0 2px 8px rgba(0,0,0,0.25)' },
                          zIndex: 2,
                        }}
                      >
                        {width > 2 && (
                          <Typography variant="caption" sx={{ fontSize: '0.6rem', color: 'white', pl: 0.5, fontWeight: 700, lineHeight: '22px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
                            {wo.woId}
                          </Typography>
                        )}
                      </Box>
                    </Tooltip>
                  );
                })}
              </Box>
            </Box>
          );
        })}

        {machines.length === 0 && (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: 'var(--planning-text-muted)' }}>No work orders match the current filters.</Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
