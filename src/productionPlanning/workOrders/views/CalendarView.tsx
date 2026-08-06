import React, { useMemo, useState } from 'react';
import { Box, Paper, Typography, Chip, Tooltip, ToggleButtonGroup, ToggleButton } from '@mui/material';
import type { WorkOrder, WOFilters } from '../types';

interface CalendarViewProps {
  workOrders: WorkOrder[];
  filters: WOFilters;
  onSelectWO: (wo: WorkOrder) => void;
}

type CalendarMode = 'week' | 'month';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const NOW_DATE = new Date('2026-05-26');

function startOfWeek(d: Date): Date {
  const r = new Date(d);
  r.setDate(r.getDate() - r.getDay());
  r.setHours(0, 0, 0, 0);
  return r;
}

function startOfMonth(d: Date): Date {
  const r = new Date(d);
  r.setDate(1);
  r.setHours(0, 0, 0, 0);
  return r;
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function woDateKey(wo: WorkOrder): string {
  return wo.scheduledStart.slice(0, 10);
}

function DayCell({
  date,
  wos,
  isToday,
  isCurrentMonth,
  onSelectWO,
}: {
  date: Date;
  wos: WorkOrder[];
  isToday: boolean;
  isCurrentMonth: boolean;
  onSelectWO: (wo: WorkOrder) => void;
}) {
  const blocked = wos.filter(w => w.readinessStatus === 'Blocked').length;
  const critical = wos.filter(w => w.riskLevel === 'Critical').length;
  const released = wos.filter(w => w.lifecycleStatus === 'Released' || w.lifecycleStatus === 'InExecution').length;

  return (
    <Box
      sx={{
        minHeight: 90,
        p: 0.75,
        bgcolor: isToday ? '#EFF6FF' : isCurrentMonth ? 'white' : '#F8FAFC',
        border: isToday ? '2px solid #2563EB' : '1px solid #E2E8F0',
        borderRadius: 1.5,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Typography
        variant="caption"
        sx={{
          fontWeight: isToday ? 800 : 500,
          color: isToday ? '#1D4ED8' : isCurrentMonth ? '#334155' : '#CBD5E1',
          fontSize: '0.72rem',
          display: 'block',
          mb: 0.5,
        }}
      >
        {date.getDate()}
      </Typography>

      {wos.length > 0 && (
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {released > 0 && (
            <Tooltip title={`${released} active/released`}>
              <Chip label={released} size="small" sx={{ bgcolor: '#D1FAE5', color: '#047857', fontWeight: 800, height: 18, fontSize: '0.62rem', cursor: 'pointer' }}
                onClick={() => onSelectWO(wos.find(w => w.lifecycleStatus === 'Released' || w.lifecycleStatus === 'InExecution')!)} />
            </Tooltip>
          )}
          {blocked > 0 && (
            <Tooltip title={`${blocked} blocked`}>
              <Chip label={`${blocked}B`} size="small" sx={{ bgcolor: '#FEF2F2', color: '#DC2626', fontWeight: 800, height: 18, fontSize: '0.62rem' }} />
            </Tooltip>
          )}
          {critical > 0 && (
            <Tooltip title={`${critical} critical risk`}>
              <Chip label={`${critical}!`} size="small" sx={{ bgcolor: '#FEF2F2', color: '#991B1B', fontWeight: 800, height: 18, fontSize: '0.62rem' }} />
            </Tooltip>
          )}
          {wos.length > 3 && (
            <Chip label={`+${wos.length - 3}`} size="small" sx={{ bgcolor: 'var(--planning-surface-muted)', color: '#475569', height: 18, fontSize: '0.62rem' }} />
          )}
        </Box>
      )}

      {wos.slice(0, 2).map(wo => (
        <Tooltip key={wo.woId} title={`${wo.woId} — ${wo.lifecycleStatus}`} arrow>
          <Box
            onClick={() => onSelectWO(wo)}
            sx={{
              mt: 0.5, px: 0.5, py: 0.25, borderRadius: 0.75, cursor: 'pointer',
              bgcolor: wo.riskLevel === 'Critical' ? '#FEF2F2' : wo.readinessStatus === 'Blocked' ? '#FEF3C7' : '#EFF6FF',
              '&:hover': { opacity: 0.8 },
            }}
          >
            <Typography variant="caption" sx={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--planning-text-secondary)', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {wo.woId}
            </Typography>
          </Box>
        </Tooltip>
      ))}
    </Box>
  );
}

export default function CalendarView({ workOrders, filters, onSelectWO }: CalendarViewProps) {
  const [mode, setMode] = useState<CalendarMode>('week');
  const [anchor, setAnchor] = useState(NOW_DATE);

  const wosByDate = useMemo(() => {
    const map: Record<string, WorkOrder[]> = {};
    workOrders.forEach(wo => {
      const key = woDateKey(wo);
      if (!map[key]) map[key] = [];
      map[key].push(wo);
    });
    return map;
  }, [workOrders]);

  // Build calendar grid days
  const days = useMemo(() => {
    if (mode === 'week') {
      const sw = startOfWeek(anchor);
      return Array.from({ length: 7 }, (_, i) => addDays(sw, i));
    } else {
      const sm = startOfMonth(anchor);
      const startDay = startOfWeek(sm);
      const totalDays = 35;
      return Array.from({ length: totalDays }, (_, i) => addDays(startDay, i));
    }
  }, [mode, anchor]);

  const navigate = (dir: number) => {
    const next = new Date(anchor);
    if (mode === 'week') next.setDate(next.getDate() + dir * 7);
    else next.setMonth(next.getMonth() + dir);
    setAnchor(next);
  };

  const monthLabel = anchor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip label="◀" size="small" onClick={() => navigate(-1)} sx={{ cursor: 'pointer' }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 700, minWidth: 160, textAlign: 'center' }}>{monthLabel}</Typography>
          <Chip label="▶" size="small" onClick={() => navigate(1)} sx={{ cursor: 'pointer' }} />
        </Box>
        <ToggleButtonGroup size="small" value={mode} exclusive onChange={(_, v) => v && setMode(v)}>
          <ToggleButton value="week" sx={{ fontSize: '0.7rem', py: 0.5 }}>Week</ToggleButton>
          <ToggleButton value="month" sx={{ fontSize: '0.7rem', py: 0.5 }}>Month</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Day header */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5, mb: 0.5 }}>
        {DAYS.map(d => (
          <Typography key={d} variant="caption" sx={{ textAlign: 'center', fontWeight: 700, color: 'var(--planning-text-secondary)', fontSize: '0.68rem' }}>{d}</Typography>
        ))}
      </Box>

      {/* Calendar grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5 }}>
        {days.map((date, i) => {
          const key = date.toISOString().slice(0, 10);
          const wos = wosByDate[key] || [];
          const isToday = isSameDay(date, NOW_DATE);
          const isCurrentMonth = mode === 'month' ? date.getMonth() === anchor.getMonth() : true;
          return (
            <DayCell
              key={i}
              date={date}
              wos={wos}
              isToday={isToday}
              isCurrentMonth={isCurrentMonth}
              onSelectWO={onSelectWO}
            />
          );
        })}
      </Box>

      {/* Legend */}
      <Box sx={{ display: 'flex', gap: 2, mt: 1.5, flexWrap: 'wrap' }}>
        {[
          { bg: '#D1FAE5', color: '#047857', label: 'Released/In Execution count' },
          { bg: '#FEF2F2', color: '#DC2626', label: 'Blocked (B)' },
          { bg: '#FEF2F2', color: '#991B1B', label: 'Critical (!)' },
        ].map(l => (
          <Box key={l.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: l.bg, border: `1px solid ${l.color}` }} />
            <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'var(--planning-text-secondary)' }}>{l.label}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
