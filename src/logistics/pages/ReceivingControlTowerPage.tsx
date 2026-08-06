import React, { useMemo, useState } from 'react';
import {
  Box,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import LogisticsPageShell from '../components/LogisticsPageShell';
import KpiRow from '../components/KpiRow';
import PanelCard from '../components/PanelCard';
import LogisticsDrawer, { DrawerSection, DetailList } from '../components/LogisticsDrawer';
import { StatusPill, SeverityPill } from '../components/StatusPill';
import { receivingControlTowerData } from '../data/receivingMockData';
import { LOGISTICS_ACCENT } from '../constants';
import { fmtTime, fmtDuration, humanize, type KpiTone } from '../utils';
import { lx } from '../themeTokens';

export type ReceivingControlTowerPageProps = {
  /** When set, receiving is a L2 layer inside Logistics Control Tower (not a standalone app). */
  onBackToCockpit?: () => void;
};

const data = receivingControlTowerData;

const PROCESS_STEPS = [
  'ST01 Schedule',
  'ST02 Priority',
  'ST03 Communicate',
  'ST04 Arrive',
  'ST05 Unload',
  'ST06 Stage',
  'ST07 Inspect',
];

const STATUS_FILTERS = ['', 'expected', 'arrived', 'unloading', 'closed'] as const;

const supplierMap = Object.fromEntries(data.suppliers.map((s) => [s.supplier_id, s]));
const dockMap = Object.fromEntries(data.docks.map((d) => [d.dock_id, d]));

function truckStatusTone(status: string): KpiTone {
  if (status === 'unloading') return 'ok';
  if (status === 'arrived') return 'warn';
  if (status === 'closed') return 'default';
  return 'default';
}

function dockStatusTone(status: string): KpiTone {
  if (status === 'idle') return 'ok';
  if (status === 'unloading') return 'warn';
  if (status === 'blocked') return 'danger';
  return 'default';
}

function laneStatusTone(status: string): KpiTone {
  if (status === 'open') return 'ok';
  if (status === 'waiting_qa') return 'warn';
  if (status === 'occupied') return 'default';
  if (status === 'reserved') return 'default';
  return 'default';
}

function priorityColor(rank: number) {
  if (rank === 1) return { bg: lx.dangerSoft, color: lx.danger, border: 'rgba(239,68,68,0.35)' };
  if (rank === 2) return { bg: lx.warnSoft, color: lx.warn, border: 'rgba(245,158,11,0.35)' };
  if (rank <= 3) return { bg: 'rgba(11, 92, 171, 0.08)', color: LOGISTICS_ACCENT, border: 'rgba(11, 92, 171, 0.25)' };
  return { bg: lx.chipBg, color: lx.text, border: lx.border };
}

function PriorityBadge({ rank }: { rank: number }) {
  const styles = priorityColor(rank);
  return (
    <Chip
      size="small"
      label={rank}
      title="Priority rank (ST02–ST03)"
      sx={{
        height: 24,
        minWidth: 28,
        fontWeight: 800,
        bgcolor: styles.bg,
        color: styles.color,
        border: `1px solid ${styles.border}`,
      }}
    />
  );
}

function inspectionForTruck(truckId: string) {
  return data.inspections.filter((i) => i.truck_schedule_id === truckId);
}

function exceptionsForTruck(truckId: string) {
  return data.exceptions.filter(
    (e) => e.linked_entity_type === 'TruckSchedule' && e.linked_entity_id === truckId,
  );
}

function lanesForTruck(truckId: string) {
  return data.staging_lanes.filter((l) => l.assigned_truck_appointment_id === truckId);
}

function computeKpis() {
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

export default function ReceivingControlTowerPage({ onBackToCockpit }: ReceivingControlTowerPageProps = {}) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const k = useMemo(() => computeKpis(), []);

  const selected = useMemo(
    () => data.truck_schedules.find((t) => t.truck_schedule_id === selectedId) ?? null,
    [selectedId],
  );

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

  const selectedSupplier = selected ? supplierMap[selected.supplier_id] : null;
  const selectedDock = selected?.dock_id ? dockMap[selected.dock_id] : null;
  const selectedLanes = selectedId ? lanesForTruck(selectedId) : [];
  const selectedInspections = selectedId ? inspectionForTruck(selectedId) : [];
  const selectedExceptions = selectedId ? exceptionsForTruck(selectedId) : [];

  return (
    <LogisticsPageShell
      title="Inbound · Receiving (IN01)"
      subtitle="Logistics Control Tower · Level 2 detail — docks, staging, inspection · ST01–ST07"
      asOf={data.as_of}
      banner="Part of the main Logistics Control Tower. Traceability back to IN01 cockpit KPIs."
      backToControlTower
      backLabel="Back to cockpit"
      onBack={onBackToCockpit}
    >
      <KpiRow
        items={[
          { label: 'Trucks scheduled today', value: k.scheduledToday },
          { label: 'In transit / arrived', value: k.inTransit },
          { label: 'Unloading now', value: k.unloading, tone: 'ok' },
          { label: 'Open exceptions', value: k.openExceptions, tone: 'danger' },
          { label: 'Docks available', value: `${k.docksAvailable}/${data.docks.length}` },
          {
            label: 'Staging lanes open',
            value: `${k.stagingOpen}/${data.staging_lanes.length}`,
            tone: 'warn',
          },
        ]}
      />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' },
          gap: 2,
          mb: 2,
        }}
      >
        <PanelCard
          title="Truck Schedule"
          action={
            <Typography variant="caption" sx={{ color: lx.textMuted }}>
              Priority receiving · ST01–ST07
            </Typography>
          }
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            alignItems={{ xs: 'stretch', sm: 'center' }}
            mb={1.5}
          >
            <TextField
              size="small"
              placeholder="Search trailer, supplier, PO…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ flex: 1, minWidth: 200 }}
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
                      fontWeight: 700,
                      textTransform: 'capitalize',
                      bgcolor: active ? LOGISTICS_ACCENT : lx.chipBg,
                      color: active ? '#fff' : lx.text,
                      border: active ? 'none' : `1px solid ${lx.border}`,
                      '&:hover': { bgcolor: active ? LOGISTICS_ACCENT : lx.border },
                    }}
                  />
                );
              })}
            </Stack>
          </Stack>

          <TableContainer sx={{ maxHeight: 480 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Priority</TableCell>
                  <TableCell>Planned arrival</TableCell>
                  <TableCell>Vendor / carrier</TableCell>
                  <TableCell>PO number</TableCell>
                  <TableCell>Material · SKU · Lot · Qty</TableCell>
                  <TableCell>Dock</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Unloading</TableCell>
                  <TableCell>Inspection</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((t) => {
                  const supplier = supplierMap[t.supplier_id];
                  const dock = t.dock_id ? dockMap[t.dock_id] : null;
                  const insp = inspectionForTruck(t.truck_schedule_id);
                  const inspLabel = insp.length
                    ? insp.map((i) => humanize(i.release_decision)).join(', ')
                    : t.status === 'closed' || t.status === 'unloading'
                      ? 'pending'
                      : '—';
                  const progress =
                    t.unload_progress_pct
                    ?? (t.status === 'closed' ? 100 : t.status === 'unloading' ? 50 : 0);

                  return (
                    <TableRow
                      key={t.truck_schedule_id}
                      hover
                      selected={selectedId === t.truck_schedule_id}
                      onClick={() => setSelectedId(t.truck_schedule_id)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell>
                        <PriorityBadge rank={t.priority_rank} />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={700}>
                          {fmtTime(t.expected_arrival_at)}
                        </Typography>
                        {t.actual_arrival_at ? (
                          <Typography variant="caption" sx={{ color: lx.textMuted }}>
                            Actual: {fmtTime(t.actual_arrival_at)}
                          </Typography>
                        ) : null}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{supplier?.name ?? t.supplier_id}</Typography>
                        <Typography variant="caption" sx={{ color: lx.textMuted }}>
                          {t.carrier_name ?? ''} · {t.trailer_id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {t.purchase_orders.map((p) => (
                          <Typography key={p.po_number} variant="body2">
                            {p.po_number}
                          </Typography>
                        ))}
                      </TableCell>
                      <TableCell>
                        {t.purchase_orders.map((p) => (
                          <Box key={p.po_number} sx={{ mb: 0.75, '&:last-child': { mb: 0 } }}>
                            <Typography variant="body2">
                              {p.material.sku} — {p.material.description}
                            </Typography>
                            <Typography variant="caption" sx={{ color: lx.textMuted }}>
                              {p.batch ? `Lot: ${p.batch.lot_number} · ` : ''}
                              {p.expected_qty} {p.uom}
                            </Typography>
                          </Box>
                        ))}
                      </TableCell>
                      <TableCell>
                        {dock?.dock_name ?? (
                          <Typography variant="body2" sx={{ color: lx.warn, fontWeight: 700 }}>
                            Unassigned
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <StatusPill label={t.status} tone={truckStatusTone(t.status)} />
                          {t.exception_flag ? (
                            <Chip
                              size="small"
                              label="Exception"
                              sx={{
                                height: 20,
                                fontSize: 10,
                                fontWeight: 700,
                                bgcolor: lx.dangerSoft,
                                color: lx.danger,
                              }}
                            />
                          ) : null}
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ minWidth: 100 }}>
                        <Typography variant="caption">{progress}%</Typography>
                        <LinearProgress
                          variant="determinate"
                          value={progress}
                          sx={{
                            mt: 0.4,
                            height: 6,
                            borderRadius: 999,
                            bgcolor: lx.soft,
                            '& .MuiLinearProgress-bar': { bgcolor: LOGISTICS_ACCENT, borderRadius: 999 },
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" sx={{ textTransform: 'capitalize' }}>
                          {inspLabel}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} sx={{ color: lx.textMuted, py: 3 }}>
                      No trucks match filters
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </TableContainer>
        </PanelCard>

        <PanelCard title="Dock / Port Assignment">
          <Stack spacing={1.25}>
            {data.docks.map((d) => {
              const truck = d.assigned_truck_appointment_id
                ? data.truck_schedules.find(
                    (t) => t.truck_schedule_id === d.assigned_truck_appointment_id,
                  )
                : null;
              return (
                <Paper
                  key={d.dock_id}
                  elevation={0}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    border: `1px solid ${lx.border}`,
                    borderLeft: `4px solid ${
                      d.current_status === 'blocked'
                        ? lx.danger
                        : d.current_status === 'unloading'
                          ? lx.warn
                          : LOGISTICS_ACCENT
                    }`,
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
                    <Typography variant="subtitle2" fontWeight={800}>
                      {d.dock_name}
                    </Typography>
                    <StatusPill label={d.current_status} tone={dockStatusTone(d.current_status)} />
                  </Stack>
                  <Typography variant="caption" sx={{ color: lx.textMuted, display: 'block' }}>
                    {d.availability_status}
                    <br />
                    {truck
                      ? `Assigned: ${truck.trailer_id} (${truck.truck_schedule_id})`
                      : 'No truck assigned'}
                    <br />
                    {d.blocked_reason ? (
                      <Box component="span" sx={{ color: lx.warn, fontWeight: 700 }}>
                        {d.blocked_reason}
                      </Box>
                    ) : (
                      `Team: ${d.responsible_team}`
                    )}
                  </Typography>
                </Paper>
              );
            })}
          </Stack>
        </PanelCard>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 2,
          mb: 2,
        }}
      >
        <PanelCard title="Staging Space Availability">
          <List disablePadding>
            {data.staging_lanes.map((l) => (
              <ListItem
                key={l.lane_id}
                alignItems="flex-start"
                sx={{ px: 0, borderBottom: `1px solid ${lx.divider}`, '&:last-child': { borderBottom: 0 } }}
              >
                <ListItemText
                  primary={
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" fontWeight={700}>
                        {l.lane_display_name}
                      </Typography>
                      <StatusPill label={l.lane_status} tone={laneStatusTone(l.lane_status)} />
                    </Stack>
                  }
                  secondary={
                    <>
                      <Typography variant="caption" sx={{ color: lx.textMuted, display: 'block' }}>
                        Occupation: {l.occupation_pct}%
                        {l.aging_time_min != null ? ` · Aging: ${fmtDuration(l.aging_time_min)}` : ''}
                        <br />
                        {l.next_action}
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={l.occupation_pct}
                        sx={{
                          mt: 0.8,
                          height: 6,
                          borderRadius: 999,
                          bgcolor: lx.soft,
                          '& .MuiLinearProgress-bar': { bgcolor: LOGISTICS_ACCENT, borderRadius: 999 },
                        }}
                      />
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        </PanelCard>

        <PanelCard title="Inspection Status">
          <List disablePadding>
            {data.inspections.map((i) => {
              const truck = data.truck_schedules.find((t) => t.truck_schedule_id === i.truck_schedule_id);
              const overdue =
                i.tat_actual_min != null
                && i.tat_target_min != null
                && i.tat_actual_min > i.tat_target_min;
              return (
                <ListItem
                  key={i.qa_inspection_id}
                  alignItems="flex-start"
                  sx={{ px: 0, borderBottom: `1px solid ${lx.divider}`, '&:last-child': { borderBottom: 0 } }}
                >
                  <ListItemText
                    primary={
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" fontWeight={700}>
                          {i.qa_inspection_id}
                        </Typography>
                        <StatusPill
                          label={i.release_decision}
                          tone={i.release_decision === 'in_progress' ? 'warn' : 'default'}
                        />
                      </Stack>
                    }
                    secondary={
                      <Typography variant="caption" sx={{ color: lx.textMuted }}>
                        Truck: {truck?.trailer_id ?? i.truck_schedule_id} · {humanize(i.inspection_type)}
                        <br />
                        TAT: {i.tat_actual_min != null ? fmtDuration(i.tat_actual_min) : '—'} /{' '}
                        {fmtDuration(i.tat_target_min)} target
                        {overdue ? (
                          <Box component="span" sx={{ color: lx.danger, fontWeight: 800 }}>
                            {' '}
                            · OVER TAT
                          </Box>
                        ) : null}
                      </Typography>
                    }
                  />
                </ListItem>
              );
            })}
          </List>
        </PanelCard>
      </Box>

      <PanelCard title="Open Exceptions">
        <List disablePadding>
          {data.exceptions.map((e) => (
            <ListItem
              key={e.exception_id}
              alignItems="flex-start"
              sx={{ px: 0, borderBottom: `1px solid ${lx.divider}`, '&:last-child': { borderBottom: 0 } }}
            >
              <ListItemText
                primary={
                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                    <Typography variant="body2" fontWeight={700}>
                      {humanize(e.exception_type)}
                    </Typography>
                    <SeverityPill severity={e.severity} />
                  </Stack>
                }
                secondary={
                  <>
                    <Typography variant="body2" sx={{ color: lx.text, mt: 0.4 }}>
                      {e.description}
                    </Typography>
                    <Typography variant="caption" sx={{ color: lx.textMuted }}>
                      {e.linked_entity_type}: {e.linked_entity_id} · State: {e.state}
                      {e.escalation_required_flag ? ' · Escalation required' : ''}
                    </Typography>
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
      </PanelCard>
<LogisticsDrawer
        open={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        title={selected ? `${selected.trailer_id} — ${selectedSupplier?.name ?? ''}` : ''}
        subtitle={selected?.truck_schedule_id}
        width={460}
      >
        {selected ? (
          <>
            <DrawerSection title="Truck schedule">
              <DetailList
                items={[
                  {
                    label: 'Status',
                    value: (
                      <Stack direction="row" spacing={0.75} alignItems="center">
                        <StatusPill label={selected.status} tone={truckStatusTone(selected.status)} />
                        {selected.exception_flag ? (
                          <Typography variant="caption" sx={{ color: lx.danger, fontWeight: 700 }}>
                            Exception flagged
                          </Typography>
                        ) : null}
                      </Stack>
                    ),
                  },
                  {
                    label: 'Priority rank',
                    value: `${selected.priority_rank} — ${selected.communicated_priority_note ?? 'No note'}`,
                  },
                  { label: 'Shipment type', value: humanize(selected.shipment_type) },
                  { label: 'Expected arrival', value: fmtTime(selected.expected_arrival_at) },
                  { label: 'Actual arrival', value: fmtTime(selected.actual_arrival_at) },
                  {
                    label: 'Unloading',
                    value: `${fmtTime(selected.unloading_start_at)} → ${fmtTime(selected.unloading_end_at)} (${selected.unload_progress_pct ?? 0}%)`,
                  },
                  {
                    label: 'Dock assignment',
                    value: selectedDock
                      ? `${selectedDock.dock_name} (${selectedDock.dock_id})`
                      : 'Unassigned',
                  },
                  {
                    label: 'Carrier / trailer',
                    value: `${selected.carrier_name ?? '—'} / ${selected.trailer_id}`,
                  },
                  ...(selected.inbound_shipment_id
                    ? [{ label: 'Inbound shipment', value: selected.inbound_shipment_id }]
                    : []),
                ]}
              />
            </DrawerSection>

            <DrawerSection title="Purchase orders">
              <Stack spacing={1.25}>
                {selected.purchase_orders.map((po) => (
                  <Paper
                    key={po.po_number}
                    elevation={0}
                    sx={{ p: 1.5, borderRadius: 1.5, border: `1px solid ${lx.border}`, bgcolor: lx.soft }}
                  >
                    <Typography variant="body2" fontWeight={800} sx={{ color: LOGISTICS_ACCENT }}>
                      PO {po.po_number}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      <strong>{po.material.sku}</strong> — {po.material.description}
                    </Typography>
                    <Typography variant="caption" sx={{ color: lx.textMuted, display: 'block' }}>
                      Qty: {po.expected_qty} {po.uom} · Open: {po.open_qty}
                      <br />
                      {po.batch ? `Batch/Lot: ${po.batch.lot_number}` : null}
                      {po.batch ? <br /> : null}
                      Production priority: {po.production_need_priority_rank ?? '—'}
                    </Typography>
                  </Paper>
                ))}
              </Stack>
            </DrawerSection>

            {selectedLanes.length > 0 ? (
              <DrawerSection title="Staging lanes">
                {selectedLanes.map((l) => (
                  <Typography key={l.lane_id} variant="body2" sx={{ mb: 0.75 }}>
                    {l.lane_display_name}: {humanize(l.lane_status)} ({l.occupation_pct}%) — {l.next_action}
                  </Typography>
                ))}
              </DrawerSection>
            ) : null}

            {selectedInspections.length > 0 ? (
              <DrawerSection title="Inspections">
                {selectedInspections.map((i) => (
                  <Typography key={i.qa_inspection_id} variant="body2" sx={{ mb: 0.75 }}>
                    {i.qa_inspection_id}: {humanize(i.release_decision)} (sample {i.sample_size})
                  </Typography>
                ))}
              </DrawerSection>
            ) : null}

            {selectedExceptions.length > 0 ? (
              <DrawerSection title="Exceptions">
                {selectedExceptions.map((e) => (
                  <Typography
                    key={e.exception_id}
                    variant="body2"
                    sx={{ mb: 0.75, color: e.severity === 'high' || e.severity === 'critical' ? lx.danger : lx.text }}
                  >
                    {e.description}
                  </Typography>
                ))}
              </DrawerSection>
            ) : null}

            <DrawerSection title="Process coverage">
              <Typography variant="caption" sx={{ color: lx.textMuted }}>
                {PROCESS_STEPS.join(' → ')} (IB-01 Raw Material Receiving)
              </Typography>
            </DrawerSection>
          </>
        ) : null}
      </LogisticsDrawer>
    </LogisticsPageShell>
  );
}
