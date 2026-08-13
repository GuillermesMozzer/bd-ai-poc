import React, { useMemo, useState } from 'react';
import {
  Box,
  Chip,
  LinearProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import type { CtTone } from '../cockpit/cockpitTheme';
import { receivingControlTowerData } from '../data/receivingMockData';
import { fmtDuration, fmtTime, humanize } from '../utils';
import {
  ctV2Type,
  tokenBrand,
  tokenError,
  tokenText,
  tokenWarning,
} from '../ctV2Theme';
import type { CtV2VisualTone } from '../ctV2/CtV2Visuals';
import {
  CtV2InsetCard,
  CtV2StatusChip,
  CtV2WidgetShell,
  toneColorV2,
  toneSoftBgV2,
} from '../ctV2/CtV2Visuals';
import { useCtV2Filters } from '../ctV2/CtV2FiltersContext';

const data = receivingControlTowerData;
const supplierMap = Object.fromEntries(data.suppliers.map((s) => [s.supplier_id, s]));
const dockMap = Object.fromEntries(data.docks.map((d) => [d.dock_id, d]));
const STATUS_FILTERS = ['', 'expected', 'arrived', 'unloading', 'closed'] as const;

function truckStatusTone(status: string): CtV2VisualTone {
  if (status === 'unloading') return 'ok';
  if (status === 'arrived') return 'warn';
  if (status === 'closed') return 'neutral';
  return 'neutral';
}

function dockStatusTone(status: string): CtV2VisualTone {
  if (status === 'idle') return 'ok';
  if (status === 'unloading') return 'warn';
  if (status === 'blocked') return 'danger';
  return 'neutral';
}

function laneStatusTone(status: string): CtV2VisualTone {
  if (status === 'open') return 'ok';
  if (status === 'waiting_qa') return 'warn';
  if (status === 'occupied') return 'accent';
  return 'neutral';
}

function computeReceivingKpis() {
  const trucks = data.truck_schedules;
  return {
    scheduledToday: trucks.length,
    inTransit: trucks.filter((t) => t.status === 'expected' || t.status === 'arrived').length,
    unloading: trucks.filter((t) => t.status === 'unloading').length,
    openExceptions: data.exceptions.filter((e) => e.state !== 'resolved').length,
    docksAvailable: data.docks.filter(
      (d) => d.availability_status === 'open' || d.current_status === 'idle',
    ).length,
    stagingOpen: data.staging_lanes.filter((l) => l.lane_status === 'open').length,
  };
}

export function CtV2ReceivingKpiStripWidget() {
  const { scaleCount, sitesLabel, periodLabel } = useCtV2Filters();
  const k = useMemo(() => computeReceivingKpis(), []);
  const items: { label: string; value: string | number; tone: CtV2VisualTone }[] = [
    { label: 'Trucks scheduled today', value: scaleCount(k.scheduledToday), tone: 'neutral' },
    { label: 'In transit / arrived', value: scaleCount(k.inTransit), tone: 'accent' },
    { label: 'Unloading now', value: Math.max(1, scaleCount(k.unloading)), tone: 'ok' },
    { label: 'Open exceptions', value: scaleCount(k.openExceptions), tone: 'danger' },
    { label: 'Docks available', value: `${k.docksAvailable}/${data.docks.length}`, tone: 'neutral' },
    { label: 'Staging lanes open', value: `${k.stagingOpen}/${data.staging_lanes.length}`, tone: 'warn' },
  ];

  return (
    <CtV2WidgetShell title="Inbound KPIs" subtitle={`${sitesLabel} · ${periodLabel} · ST01–ST07`}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(6, 1fr)' }, gap: 1 }}>
        {items.map((item) => (
          <CtV2InsetCard
            key={item.label}
            sx={{ borderTop: `3px solid ${toneColorV2(item.tone)}` }}
          >
            <Typography sx={{ fontSize: 26, fontWeight: 800, color: tokenText.primary, lineHeight: 1.1 }}>
              {item.value}
            </Typography>
            <Typography sx={{ ...ctV2Type.caption, color: tokenText.secondary, mt: 0.6 }}>{item.label}</Typography>
          </CtV2InsetCard>
        ))}
      </Box>
    </CtV2WidgetShell>
  );
}

export function CtV2ReceivingTruckBoardWidget() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const rows = useMemo(() => {
    let list = [...data.truck_schedules].sort((a, b) => a.priority_rank - b.priority_rank);
    if (statusFilter) list = list.filter((t) => t.status === statusFilter);
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((t) => {
        const supplier = supplierMap[t.supplier_id]?.name ?? '';
        const pos = t.purchase_orders.map((p) => p.po_number).join(' ');
        return (
          t.trailer_id.toLowerCase().includes(q)
          || supplier.toLowerCase().includes(q)
          || pos.toLowerCase().includes(q)
          || t.truck_schedule_id.toLowerCase().includes(q)
        );
      });
    }
    return list;
  }, [search, statusFilter]);

  return (
    <CtV2WidgetShell title="Truck Schedule" subtitle="Priority receiving · ST01–ST07">
      <Stack spacing={1.25} sx={{ height: '100%' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'stretch', sm: 'center' }}>
          <TextField
            size="small"
            placeholder="Search trailer, supplier, PO…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{
              flex: 1,
              minWidth: 180,
              '& .MuiInputBase-root': { fontSize: 13, fontWeight: 600 },
            }}
          />
          <Stack direction="row" flexWrap="wrap" gap={0.75}>
            {STATUS_FILTERS.map((s) => {
              const active = statusFilter === s;
              return (
                <Chip
                  key={s || 'all'}
                  label={s ? humanize(s) : 'All'}
                  size="small"
                  onClick={() => setStatusFilter(s)}
                  sx={{
                    fontWeight: 800,
                    fontSize: 11,
                    textTransform: 'capitalize',
                    bgcolor: active ? tokenBrand.main : 'transparent',
                    color: active ? tokenBrand.contrast ?? '#fff' : tokenText.secondary,
                    border: `1px solid ${active ? tokenBrand.main : 'divider'}`,
                    '&:hover': { bgcolor: active ? tokenBrand.dark : tokenBrand.softBg },
                  }}
                />
              );
            })}
          </Stack>
        </Stack>

        <Box sx={{ overflow: 'auto', flex: 1, minHeight: 0 }}>
          <Table size="small" stickyHeader sx={{ '& td, & th': { borderColor: 'divider', py: 0.9, fontSize: 12 } }}>
            <TableHead>
              <TableRow>
                {['#', 'Arrival', 'Vendor / carrier', 'PO', 'Material', 'Dock', 'Status', 'Unload', 'Inspection'].map((h) => (
                  <TableCell key={h} sx={{ ...ctV2Type.caption, fontWeight: 800, color: tokenText.secondary, whiteSpace: 'nowrap' }}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((t) => {
                const supplier = supplierMap[t.supplier_id];
                const dock = t.dock_id ? dockMap[t.dock_id] : null;
                const insp = data.inspections.filter((i) => i.truck_schedule_id === t.truck_schedule_id);
                const inspLabel = insp.length
                  ? insp.map((i) => humanize(i.release_decision)).join(', ')
                  : t.status === 'closed' || t.status === 'unloading'
                    ? 'pending'
                    : '—';
                const progress =
                  t.unload_progress_pct
                  ?? (t.status === 'closed' ? 100 : t.status === 'unloading' ? 50 : 0);
                const po = t.purchase_orders[0];

                return (
                  <TableRow key={t.truck_schedule_id} hover>
                    <TableCell>
                      <Chip
                        size="small"
                        label={t.priority_rank}
                        sx={{
                          height: 22,
                          minWidth: 26,
                          fontWeight: 800,
                          fontSize: 11,
                          bgcolor: t.priority_rank === 1 ? tokenError.softBg : t.priority_rank === 2 ? tokenWarning.softBg : tokenBrand.softBg,
                          color: t.priority_rank === 1 ? tokenError.main : t.priority_rank === 2 ? tokenWarning.main : tokenBrand.main,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ ...ctV2Type.caption, fontWeight: 800 }}>{fmtTime(t.expected_arrival_at)}</Typography>
                      {t.actual_arrival_at ? (
                        <Typography sx={{ ...ctV2Type.caption, color: tokenText.secondary }}>
                          Actual {fmtTime(t.actual_arrival_at)}
                        </Typography>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ ...ctV2Type.caption, fontWeight: 800 }}>{supplier?.name ?? t.supplier_id}</Typography>
                      <Typography sx={{ ...ctV2Type.caption, color: tokenText.secondary }}>
                        {t.carrier_name ?? ''} · {t.trailer_id}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ ...ctV2Type.caption, fontWeight: 700 }}>
                      {t.purchase_orders.map((p) => p.po_number).join(', ')}
                    </TableCell>
                    <TableCell>
                      {po ? (
                        <>
                          <Typography sx={{ ...ctV2Type.caption, fontWeight: 800 }}>
                            {po.material.sku} — {po.material.description}
                          </Typography>
                          <Typography sx={{ ...ctV2Type.caption, color: tokenText.secondary }}>
                            {'batch' in po && po.batch ? `Lot ${po.batch.lot_number} · ` : ''}
                            {po.expected_qty} {po.uom}
                          </Typography>
                        </>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell sx={{ ...ctV2Type.caption, fontWeight: 700, color: dock ? tokenText.primary : tokenWarning.main }}>
                      {dock?.dock_name ?? 'Unassigned'}
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <CtV2StatusChip label={t.status} tone={truckStatusTone(t.status)} />
                        {t.exception_flag ? <CtV2StatusChip label="Exception" tone="danger" /> : null}
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ minWidth: 90 }}>
                      <Typography sx={{ ...ctV2Type.caption }}>{progress}%</Typography>
                      <LinearProgress
                        variant="determinate"
                        value={progress}
                        sx={{
                          mt: 0.4,
                          height: 6,
                          borderRadius: 999,
                          bgcolor: 'action.hover',
                          '& .MuiLinearProgress-bar': { bgcolor: tokenBrand.main, borderRadius: 999 },
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ ...ctV2Type.caption, textTransform: 'capitalize' }}>{inspLabel}</TableCell>
                  </TableRow>
                );
              })}
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} sx={{ ...ctV2Type.caption, color: tokenText.secondary, py: 3 }}>
                    No trucks match filters
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </Box>
      </Stack>
    </CtV2WidgetShell>
  );
}

export function CtV2ReceivingDockBoardWidget() {
  return (
    <CtV2WidgetShell title="Dock / Port Assignment" subtitle="RM docks & import port">
      <Stack spacing={1}>
        {data.docks.map((d) => {
          const truck = d.assigned_truck_appointment_id
            ? data.truck_schedules.find((t) => t.truck_schedule_id === d.assigned_truck_appointment_id)
            : null;
          const tone = dockStatusTone(d.current_status);
          return (
            <CtV2InsetCard
              key={d.dock_id}
              sx={{ borderLeft: `4px solid ${toneColorV2(tone)}` }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
                <Typography sx={{ ...ctV2Type.body, fontWeight: 800 }}>{d.dock_name}</Typography>
                <CtV2StatusChip label={d.current_status} tone={tone} />
              </Stack>
              <Typography sx={{ ...ctV2Type.caption, color: tokenText.secondary, textTransform: 'capitalize' }}>
                {d.availability_status.replace(/_/g, ' ')}
              </Typography>
              <Typography sx={{ ...ctV2Type.caption, color: tokenText.secondary, mt: 0.35 }}>
                {truck ? `Assigned: ${truck.trailer_id} (${truck.truck_schedule_id})` : 'No truck assigned'}
              </Typography>
              {d.blocked_reason ? (
                <Typography sx={{ ...ctV2Type.caption, color: tokenError.main, fontWeight: 800, mt: 0.5 }}>
                  {d.blocked_reason}
                </Typography>
              ) : (
                <Typography sx={{ ...ctV2Type.caption, color: tokenText.secondary, mt: 0.35 }}>
                  Team: {d.responsible_team}
                </Typography>
              )}
            </CtV2InsetCard>
          );
        })}
      </Stack>
    </CtV2WidgetShell>
  );
}

export function CtV2ReceivingStagingWidget() {
  return (
    <CtV2WidgetShell title="Staging Space Availability" subtitle="Lane occupancy & aging">
      <Stack spacing={1.25}>
        {data.staging_lanes.map((l) => (
          <Box key={l.lane_id}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography sx={{ ...ctV2Type.body, fontWeight: 800 }}>{l.lane_display_name}</Typography>
              <CtV2StatusChip label={l.lane_status} tone={laneStatusTone(l.lane_status)} />
            </Stack>
            <Typography sx={{ ...ctV2Type.caption, color: tokenText.secondary, mt: 0.35 }}>
              Occupation {l.occupation_pct}%
              {l.aging_time_min != null ? ` · Aging ${fmtDuration(l.aging_time_min)}` : ''}
            </Typography>
            <Typography sx={{ ...ctV2Type.caption, color: tokenText.secondary }}>{l.next_action}</Typography>
            <LinearProgress
              variant="determinate"
              value={l.occupation_pct}
              sx={{
                mt: 0.7,
                height: 6,
                borderRadius: 999,
                bgcolor: 'action.hover',
                '& .MuiLinearProgress-bar': { bgcolor: tokenBrand.main, borderRadius: 999 },
              }}
            />
          </Box>
        ))}
      </Stack>
    </CtV2WidgetShell>
  );
}

export function CtV2ReceivingInspectionWidget() {
  return (
    <CtV2WidgetShell title="Inspection Status" subtitle="Incoming QA TAT">
      <Stack spacing={1.25}>
        {data.inspections.map((i) => {
          const truck = data.truck_schedules.find((t) => t.truck_schedule_id === i.truck_schedule_id);
          const overdue =
            i.tat_actual_min != null && i.tat_target_min != null && i.tat_actual_min > i.tat_target_min;
          return (
            <CtV2InsetCard key={i.qa_inspection_id}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography sx={{ ...ctV2Type.body, fontWeight: 800 }}>{i.qa_inspection_id}</Typography>
                <CtV2StatusChip
                  label={i.release_decision}
                  tone={i.release_decision === 'in_progress' ? 'warn' : 'neutral'}
                />
              </Stack>
              <Typography sx={{ ...ctV2Type.caption, color: tokenText.secondary, mt: 0.4 }}>
                Truck {truck?.trailer_id ?? i.truck_schedule_id} · {humanize(i.inspection_type)}
              </Typography>
              <Typography sx={{ ...ctV2Type.caption, color: tokenText.secondary }}>
                TAT {i.tat_actual_min != null ? fmtDuration(i.tat_actual_min) : '—'} / {fmtDuration(i.tat_target_min)} target
                {overdue ? (
                  <Box component="span" sx={{ color: tokenError.main, fontWeight: 800 }}>
                    {' '}
                    · OVER TAT
                  </Box>
                ) : null}
              </Typography>
            </CtV2InsetCard>
          );
        })}
      </Stack>
    </CtV2WidgetShell>
  );
}

export function CtV2ReceivingExceptionsWidget() {
  return (
    <CtV2WidgetShell title="Open Exceptions" subtitle="IN01 receiving queue">
      <Stack spacing={1}>
        {data.exceptions.map((e) => {
          const tone: CtTone = e.severity === 'high' || e.severity === 'critical' ? 'danger' : 'warn';
          return (
            <CtV2InsetCard key={e.exception_id} sx={{ bgcolor: toneSoftBgV2(tone) }}>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                <Typography sx={{ ...ctV2Type.body, fontWeight: 800, textTransform: 'capitalize' }}>
                  {humanize(e.exception_type)}
                </Typography>
                <CtV2StatusChip label={e.severity} tone={tone} />
              </Stack>
              <Typography sx={{ ...ctV2Type.body, mt: 0.5, fontWeight: 600 }}>{e.description}</Typography>
              <Typography sx={{ ...ctV2Type.caption, color: tokenText.secondary, mt: 0.35 }}>
                {e.linked_entity_type}: {e.linked_entity_id} · {e.state}
                {e.escalation_required_flag ? ' · Escalation required' : ''}
              </Typography>
            </CtV2InsetCard>
          );
        })}
      </Stack>
    </CtV2WidgetShell>
  );
}

export const CT_V2_RECEIVING_WIDGET_IDS = [
  'recv_kpis',
  'recv_trucks',
  'recv_docks',
  'recv_staging',
  'recv_inspection',
  'recv_exceptions',
] as const;

export type CtV2ReceivingWidgetId = (typeof CT_V2_RECEIVING_WIDGET_IDS)[number];

export const CT_V2_RECEIVING_WIDGET_TITLES: Record<CtV2ReceivingWidgetId, string> = {
  recv_kpis: 'Inbound KPIs',
  recv_trucks: 'Truck Schedule',
  recv_docks: 'Dock Assignment',
  recv_staging: 'Staging Lanes',
  recv_inspection: 'Inspection Status',
  recv_exceptions: 'Open Exceptions',
};

export function renderCtV2ReceivingWidget(id: CtV2ReceivingWidgetId) {
  switch (id) {
    case 'recv_kpis':
      return <CtV2ReceivingKpiStripWidget />;
    case 'recv_trucks':
      return <CtV2ReceivingTruckBoardWidget />;
    case 'recv_docks':
      return <CtV2ReceivingDockBoardWidget />;
    case 'recv_staging':
      return <CtV2ReceivingStagingWidget />;
    case 'recv_inspection':
      return <CtV2ReceivingInspectionWidget />;
    case 'recv_exceptions':
      return <CtV2ReceivingExceptionsWidget />;
    default:
      return null;
  }
}
