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
import { CtV2AdaptiveGrid } from '../ctV2/CtV2AdaptiveGrid';
import { useCtV2Filters } from '../ctV2/CtV2FiltersContext';
import { simulateDocks, simulateTrucks } from '../ctV2/ctV2SiteSimulation';

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
  const { scaleCount, sitesLabel, periodLabel, sites } = useCtV2Filters();
  const trucks = useMemo(() => simulateTrucks(sites), [sites]);
  const docks = useMemo(() => simulateDocks(sites), [sites]);
  const k = useMemo(() => ({
    scheduledToday: trucks.length,
    inTransit: trucks.filter((t) => t.status === 'expected' || t.status === 'arrived').length,
    unloading: trucks.filter((t) => t.status === 'unloading').length,
    openExceptions: trucks.filter((t) => t.status === 'arrived').length,
    docksAvailable: docks.filter((d) => d.current_status === 'idle').length,
    stagingOpen: Math.max(1, Math.round(docks.length * 0.6)),
  }), [trucks, docks]);
  const items: { label: string; value: string | number; tone: CtV2VisualTone }[] = [
    { label: 'Trucks scheduled today', value: scaleCount(Math.max(1, k.scheduledToday)), tone: 'neutral' },
    { label: 'In transit / arrived', value: scaleCount(k.inTransit), tone: 'accent' },
    { label: 'Unloading now', value: Math.max(1, scaleCount(k.unloading)), tone: 'ok' },
    { label: 'Open exceptions', value: scaleCount(k.openExceptions), tone: 'danger' },
    { label: 'Docks available', value: `${k.docksAvailable}/${docks.length || 1}`, tone: 'neutral' },
    { label: 'Staging lanes open', value: `${k.stagingOpen}/${Math.max(k.stagingOpen, docks.length)}`, tone: 'warn' },
  ];

  return (
    <CtV2WidgetShell title="Inbound KPIs" subtitle={`${sitesLabel} · ${periodLabel} · ST01–ST07`}>
      <CtV2AdaptiveGrid itemCount={items.length} preset="kpiStrip" gap={1}>
        {items.map((item) => (
          <CtV2InsetCard
            key={item.label}
            sx={{ borderTop: `3px solid ${toneColorV2(item.tone)}`, minWidth: 0, height: '100%' }}
          >
            <Typography sx={{ fontSize: 26, fontWeight: 800, color: tokenText.primary, lineHeight: 1.1 }}>
              {item.value}
            </Typography>
            <Typography sx={{ ...ctV2Type.caption, color: tokenText.secondary, mt: 0.6 }}>{item.label}</Typography>
          </CtV2InsetCard>
        ))}
      </CtV2AdaptiveGrid>
    </CtV2WidgetShell>
  );
}

export function CtV2ReceivingTruckBoardWidget() {
  const { sites, sitesLabel, periodLabel } = useCtV2Filters();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const trucks = useMemo(() => simulateTrucks(sites), [sites]);

  const rows = useMemo(() => {
    let list = [...trucks];
    if (statusFilter) list = list.filter((t) => t.status === statusFilter);
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((t) => (
        t.trailer_id.toLowerCase().includes(q)
        || t.supplier.toLowerCase().includes(q)
        || t.plantName.toLowerCase().includes(q)
        || t.purchase_orders.some((p) => p.po_number.toLowerCase().includes(q))
      ));
    }
    return list;
  }, [trucks, search, statusFilter]);

  return (
    <CtV2WidgetShell title="Truck Schedule" subtitle={`${sitesLabel} · ${periodLabel} · inbound appointments`}>
      <Stack spacing={1.25} sx={{ height: '100%' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'stretch', sm: 'center' }}>
          <TextField
            size="small"
            placeholder="Search trailer, plant, supplier, PO…"
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
                    color: active ? '#fff' : tokenText.secondary,
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
                {['#', 'Plant', 'Trailer', 'Vendor', 'PO', 'Status', 'Unload'].map((h) => (
                  <TableCell key={h} sx={{ ...ctV2Type.caption, fontWeight: 800, color: tokenText.secondary, whiteSpace: 'nowrap' }}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((t) => (
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
                  <TableCell sx={{ fontWeight: 800 }}>{t.plantName}</TableCell>
                  <TableCell>{t.trailer_id}</TableCell>
                  <TableCell>{t.supplier}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{t.purchase_orders.map((p) => p.po_number).join(', ')}</TableCell>
                  <TableCell>
                    <CtV2StatusChip label={t.status} tone={truckStatusTone(t.status)} />
                  </TableCell>
                  <TableCell sx={{ minWidth: 90 }}>
                    <Typography sx={{ ...ctV2Type.caption }}>{t.unload_progress_pct}%</Typography>
                    <LinearProgress
                      variant="determinate"
                      value={t.unload_progress_pct}
                      sx={{
                        mt: 0.4,
                        height: 6,
                        borderRadius: 999,
                        bgcolor: 'action.hover',
                        '& .MuiLinearProgress-bar': { bgcolor: tokenBrand.main, borderRadius: 999 },
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} sx={{ ...ctV2Type.caption, color: tokenText.secondary, py: 3 }}>
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
  const { sites, sitesLabel } = useCtV2Filters();
  const docks = useMemo(() => simulateDocks(sites), [sites]);
  return (
    <CtV2WidgetShell title="Dock / Port Assignment" subtitle={`${sitesLabel} · RM docks & import`}>
      <CtV2AdaptiveGrid itemCount={docks.length} preset="boards" gap={1}>
        {docks.map((d) => {
          const tone = dockStatusTone(d.current_status);
          return (
            <CtV2InsetCard
              key={d.dock_id}
              sx={{ borderLeft: `4px solid ${toneColorV2(tone)}`, minWidth: 0, height: '100%' }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
                <Typography sx={{ ...ctV2Type.body, fontWeight: 800 }}>{d.dock_name}</Typography>
                <CtV2StatusChip label={d.current_status} tone={tone} />
              </Stack>
              <Typography sx={{ ...ctV2Type.caption, color: tokenText.secondary, textTransform: 'capitalize' }}>
                {d.availability_status.replace(/_/g, ' ')} · {d.plantName}
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
      </CtV2AdaptiveGrid>
    </CtV2WidgetShell>
  );
}
export function CtV2ReceivingStagingWidget() {
  const { sitesLabel, scaleCount } = useCtV2Filters();
  return (
    <CtV2WidgetShell title="Staging Space Availability" subtitle={`${sitesLabel} · lane occupancy & aging`}>
      <CtV2AdaptiveGrid itemCount={data.staging_lanes.length} preset="boards" gap={1.25}>
        {data.staging_lanes.map((l) => (
          <CtV2InsetCard key={l.lane_id} sx={{ minWidth: 0, height: '100%' }}>
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
          </CtV2InsetCard>
        ))}
      </CtV2AdaptiveGrid>
    </CtV2WidgetShell>
  );
}

export function CtV2ReceivingInspectionWidget() {
  const { sitesLabel } = useCtV2Filters();
  return (
    <CtV2WidgetShell title="Inspection Status" subtitle={`${sitesLabel} · incoming QA TAT`}>
      <CtV2AdaptiveGrid itemCount={data.inspections.length} preset="boards" gap={1.25}>
        {data.inspections.map((i) => {
          const truck = data.truck_schedules.find((t) => t.truck_schedule_id === i.truck_schedule_id);
          const overdue =
            i.tat_actual_min != null && i.tat_target_min != null && i.tat_actual_min > i.tat_target_min;
          return (
            <CtV2InsetCard key={i.qa_inspection_id} sx={{ minWidth: 0, height: '100%' }}>
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
      </CtV2AdaptiveGrid>
    </CtV2WidgetShell>
  );
}

export function CtV2ReceivingExceptionsWidget() {
  const { sitesLabel, scaleCount } = useCtV2Filters();
  return (
    <CtV2WidgetShell title="Open Exceptions" subtitle={`${sitesLabel} · IN01 receiving queue`}>
      <CtV2AdaptiveGrid itemCount={data.exceptions.length} preset="boards" gap={1}>
        {data.exceptions.map((e) => {
          const tone: CtTone = e.severity === 'high' || e.severity === 'critical' ? 'danger' : 'warn';
          return (
            <CtV2InsetCard key={e.exception_id} sx={{ bgcolor: toneSoftBgV2(tone), minWidth: 0, height: '100%' }}>
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
      </CtV2AdaptiveGrid>
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
