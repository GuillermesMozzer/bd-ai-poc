import React, { useMemo, useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import LogisticsPageShell from '../components/LogisticsPageShell';
import KpiRow from '../components/KpiRow';
import PanelCard from '../components/PanelCard';
import LogisticsDrawer, { DrawerSection } from '../components/LogisticsDrawer';
import { StatusPill, SlaPill } from '../components/StatusPill';
import { logisticsData } from '../data/logisticsMockData';
import { LOGISTICS_ACCENT } from '../constants';
import { fmtDuration, fmtTime, humanize, type KpiTone } from '../utils';
import { lx } from '../themeTokens';

type QaInspection = (typeof logisticsData.qa_inspections)[number] & {
  sterilization_load_id?: string;
  released_at?: string;
  note?: string;
};

const seed = logisticsData;

const TIMELINE = [
  { key: 'received', label: 'Received' },
  { key: 'sampling_collected', label: 'Sampling collected' },
  { key: 'lab_testing', label: 'Lab testing' },
  { key: 'pending_qa_review', label: 'QA review / peer steps' },
  { key: 'released', label: 'Released / Rejected' },
];

const timelineDone = (status: string, step: string) => {
  const order = ['sampling_collected', 'lab_testing', 'pending_qa_review', 'released'];
  if (step === 'received' || status === 'released') return true;
  const idx = order.indexOf(status);
  const stepIdx = order.indexOf(step);
  return idx >= 0 && stepIdx >= 0 && idx >= stepIdx;
};

const progressTone = (ratioPct: number): KpiTone => {
  if (ratioPct > 100) return 'danger';
  if (ratioPct > 80) return 'warn';
  return 'ok';
};

const toneColor: Record<KpiTone, string> = {
  default: lx.textMuted,
  ok: lx.ok,
  warn: lx.warn,
  danger: lx.danger,
};

export default function QualityReleasePage() {
  const [inspections, setInspections] = useState<QaInspection[]>(() =>
    structuredClone(seed.qa_inspections) as QaInspection[],
  );
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState('');
  const [slaFilter, setSlaFilter] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [urgencyMsg, setUrgencyMsg] = useState('');

  const mat = (id: string) => seed.materials[id];
  const user = (id: string) => seed.users[id] ?? id;

  const matchesFilter = (i: QaInspection) => {
    if (slaFilter && i.sla_risk !== slaFilter) return false;
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return [i.lot, i.pallet_id, i.qa_inspection_id, mat(i.material_id)?.sku].some((x) =>
      x?.toLowerCase().includes(q),
    );
  };

  const openQueue = useMemo(
    () => inspections.filter((i) => i.qa_status !== 'released'),
    [inspections],
  );
  const selected = inspections.find((i) => i.qa_inspection_id === selectedId) ?? null;
  const capacity = seed.receiving_capacity;
  const releasingPallets = openQueue.reduce((sum, i) => sum + (i.pallet_qty || 0), 0);
  const released = useMemo(
    () => inspections.filter((i) => i.qa_status === 'released'),
    [inspections],
  );

  const incoming = useMemo(
    () =>
      inspections.filter(
        (i) => i.inspection_type === 'incoming_raw' && i.qa_status !== 'released' && matchesFilter(i),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [inspections, search, slaFilter],
  );
  const postSteril = useMemo(
    () =>
      inspections.filter(
        (i) =>
          i.inspection_type === 'post_sterilization' &&
          i.qa_status !== 'released' &&
          matchesFilter(i),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [inspections, search, slaFilter],
  );

  const openDrawer = (id: string) => {
    setSelectedId(id);
    setUrgencyMsg('');
  };

  const requestUrgency = () => {
    if (!selected || selected.qa_status === 'released') return;
    setInspections((prev) =>
      prev.map((i) =>
        i.qa_inspection_id !== selected.qa_inspection_id
          ? i
          : {
              ...i,
              urgency_requests: [
                ...(i.urgency_requests ?? []),
                {
                  from: 'USR-fg-lead',
                  at: new Date().toISOString(),
                  reason: "We need this for today's pledge / backorder — please help prioritize",
                },
              ],
            },
      ),
    );
    setUrgencyMsg('Urgency signal sent to QA owner. Release decision remains with Quality.');
  };

  const linkedBos = (selected?.linked_backorders ?? [])
    .map((id) => seed.backorders.find((b) => b.backorder_id === id))
    .filter(Boolean);

  const urgencyCell = (i: QaInspection) => {
    const n = i.urgency_requests?.length ?? 0;
    return n ? <StatusPill label={`${n} request${n > 1 ? 's' : ''}`} tone="danger" /> : '—';
  };

  const inspTable = (rows: QaInspection[], mode: 'incoming' | 'post') => (
    <Box sx={{ overflowX: 'auto' }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Material / Lot</TableCell>
            <TableCell>Pallet</TableCell>
            <TableCell>{mode === 'post' ? 'Load ID' : 'Pallet qty'}</TableCell>
            <TableCell>QA status</TableCell>
            <TableCell>{mode === 'post' ? 'Aging / TAT' : 'Aging'}</TableCell>
            <TableCell>SLA</TableCell>
            <TableCell>Impact</TableCell>
            <TableCell>Urgency</TableCell>
            <TableCell>Owner</TableCell>
            <TableCell>Blocker</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((i) => {
            const m = mat(i.material_id);
            return (
              <TableRow
                key={i.qa_inspection_id}
                hover
                sx={{ cursor: 'pointer' }}
                onClick={() => openDrawer(i.qa_inspection_id)}
              >
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 800 }}>
                    {m?.sku ?? i.material_id}
                  </Typography>
                  <Typography variant="caption" sx={{ color: lx.textMuted }}>
                    {i.lot}
                  </Typography>
                </TableCell>
                <TableCell>{i.pallet_id ?? '—'}</TableCell>
                <TableCell>
                  {mode === 'post' ? (i.sterilization_load_id ?? '—') : (i.pallet_qty ?? '—')}
                </TableCell>
                <TableCell>
                  <StatusPill label={i.qa_status} />
                </TableCell>
                <TableCell>
                  {mode === 'post' ? (
                    `${i.aging_days}d / ${i.sla_tat_days ?? 7}d`
                  ) : (
                    <>
                      {i.aging_days}d
                      {i.sla_tat_days ? (
                        <Typography variant="caption" sx={{ color: lx.textMuted, display: 'block' }}>
                          SLA {i.sla_tat_days}d
                        </Typography>
                      ) : null}
                    </>
                  )}
                </TableCell>
                <TableCell>
                  <SlaPill status={i.sla_risk} />
                </TableCell>
                <TableCell sx={{ fontSize: 12 }}>{i.impact}</TableCell>
                <TableCell>{urgencyCell(i)}</TableCell>
                <TableCell sx={{ fontSize: 12 }}>{user(i.owner_user_id)}</TableCell>
                <TableCell sx={{ fontSize: 12 }}>
                  {i.release_blocker ? humanize(i.release_blocker) : '—'}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Box>
  );

  return (
    <LogisticsPageShell
      title="Quality Release Status Board"
      subtitle="Blocked materials, aging, impact, SQE QNs · ST12–ST22, ST78–ST81"
      asOf={seed.as_of}
    >
      <KpiRow
        items={[
          { label: 'In release queue', value: openQueue.length, tone: 'warn' },
          {
            label: 'Late (SLA breach)',
            value: openQueue.filter((i) => i.sla_risk === 'late').length,
            tone: 'danger',
          },
          { label: 'At risk', value: openQueue.filter((i) => i.sla_risk === 'at_risk').length },
          { label: 'Released today', value: released.length, tone: 'ok' },
          { label: 'Open SQE QNs', value: seed.quality_notifications.length },
          {
            label: 'Shipping urgency requests',
            value: openQueue.filter((i) => i.urgency_requests?.length).length,
            tone: 'danger',
          },
        ]}
      />

      <PanelCard
        title="Receiving staging capacity"
        action={
          <Typography variant="caption" sx={{ color: lx.textMuted }}>
            Pallet qty → free space when released
          </Typography>
        }
        sx={{ mb: 2 }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="caption" sx={{ color: lx.textMuted }}>
              Staging / row utilization
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
              {capacity.capacity_pct}% ({capacity.occupied_pallets}/{capacity.total_pallet_slots}{' '}
              pallets)
            </Typography>
            <LinearProgress
              variant="determinate"
              value={Math.min(capacity.capacity_pct, 100)}
              sx={{ mt: 1, height: 8, borderRadius: 1 }}
            />
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: lx.textMuted }}>
              Expected inbound today
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
              +{capacity.inbound_expected_pallets} pallets
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: lx.textMuted }}>
              Queued for QA release
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
              {releasingPallets} pallets (frees space when released)
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: lx.textMuted }}>
              Projected after inbound
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
              {capacity.projected_pct_after_inbound}%
            </Typography>
            <LinearProgress
              variant="determinate"
              value={Math.min(capacity.projected_pct_after_inbound, 100)}
              color="error"
              sx={{ mt: 1, height: 8, borderRadius: 1 }}
            />
            <Typography variant="caption" sx={{ color: lx.warn, display: 'block', mt: 0.6 }}>
              May need to reschedule trucks if space tight
            </Typography>
          </Box>
        </Box>
      </PanelCard>

      <PanelCard title="Release queue">
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            mb: 1.5,
            minHeight: 36,
            '& .MuiTab-root': { textTransform: 'none', fontWeight: 700, minHeight: 36 },
            '& .Mui-selected': { color: LOGISTICS_ACCENT },
            '& .MuiTabs-indicator': { bgcolor: LOGISTICS_ACCENT },
          }}
        >
          <Tab label="Incoming RM" />
          <Tab label="Post-Sterilization" />
          <Tab label="SQE / QNs" />
          <Tab label="Hold / Blocked" />
          <Tab label="Released Today" />
          <Tab label="Aging & SLA" />
        </Tabs>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
          <TextField
            size="small"
            fullWidth
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search material, lot, pallet…"
          />
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>SLA risk</InputLabel>
            <Select label="SLA risk" value={slaFilter} onChange={(e) => setSlaFilter(e.target.value)}>
              <MenuItem value="">All SLA risk</MenuItem>
              <MenuItem value="on_track">On track</MenuItem>
              <MenuItem value="at_risk">At risk</MenuItem>
              <MenuItem value="late">Late</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        {tab === 0 ? inspTable(incoming, 'incoming') : null}

        {tab === 1 ? (
          <Box>
            <Typography variant="caption" sx={{ color: lx.textMuted, display: 'block', mb: 1.5 }}>
              Expected post-sterilization TAT ≈ <strong>7 days</strong>. Within window = on-track
              process. Past 7 days = late pending.
            </Typography>
            {inspTable(postSteril, 'post')}
          </Box>
        ) : null}

        {tab === 2 ? (
          <Box>
            <Typography variant="caption" sx={{ color: lx.textMuted, display: 'block', mb: 1.5 }}>
              Supplier Quality Engineers — <strong>30-day close SLA</strong> · QualityNotification
              R-14.
            </Typography>
            <Box sx={{ overflowX: 'auto' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>QN</TableCell>
                    <TableCell>Material / Lot</TableCell>
                    <TableCell>Defect</TableCell>
                    <TableCell>Disposition</TableCell>
                    <TableCell>Aging</TableCell>
                    <TableCell>Close SLA</TableCell>
                    <TableCell>Owner</TableCell>
                    <TableCell>Next action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {seed.quality_notifications.map((qn) => {
                    const risk =
                      qn.days_to_close < 7 ? 'late' : qn.days_to_close < 14 ? 'at_risk' : 'on_track';
                    return (
                      <TableRow key={qn.qn_id} hover>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 800 }}>
                            {qn.qn_id}
                          </Typography>
                          <Typography variant="caption" sx={{ color: lx.textMuted }}>
                            {qn.sap_qn}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {mat(qn.material_id)?.sku} · {qn.lot}
                        </TableCell>
                        <TableCell sx={{ fontSize: 12 }}>{qn.defect}</TableCell>
                        <TableCell>
                          <StatusPill label={qn.disposition} />
                        </TableCell>
                        <TableCell>{qn.aging_days}d</TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={0.8} alignItems="center">
                            <SlaPill status={risk} />
                            <Typography variant="caption">
                              {qn.days_to_close}d left / {qn.close_sla_days}d
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell sx={{ fontSize: 12 }}>{user(qn.owner_user_id)}</TableCell>
                        <TableCell sx={{ fontSize: 12 }}>{qn.next_action}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Box>
          </Box>
        ) : null}

        {tab === 3 ? (
          <Stack spacing={1.2}>
            {seed.quarantine_holds.map((h) => (
              <Paper
                key={h.hold_id}
                elevation={0}
                sx={{ p: 1.5, border: `1px solid ${lx.border}`, borderRadius: 1.5 }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                    {mat(h.material_id)?.sku} · {h.lot}
                  </Typography>
                  <StatusPill label={h.disposition} tone="warn" />
                </Stack>
                <Typography variant="caption" sx={{ color: lx.textMuted }}>
                  Pallet {h.pallet_id} · {h.location} · Aging {h.aging_days}d
                  {h.qn_id ? ` · QN ${h.qn_id}` : ''}
                </Typography>
              </Paper>
            ))}
          </Stack>
        ) : null}

        {tab === 4 ? (
          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Inspection ID</TableCell>
                  <TableCell>Material / Lot</TableCell>
                  <TableCell>Pallet qty freed</TableCell>
                  <TableCell>Released at</TableCell>
                  <TableCell>Owner</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {released.map((i) => (
                  <TableRow key={i.qa_inspection_id} hover>
                    <TableCell>{i.qa_inspection_id}</TableCell>
                    <TableCell>
                      {mat(i.material_id)?.sku} · {i.lot}
                    </TableCell>
                    <TableCell>{i.pallet_qty ?? '—'}</TableCell>
                    <TableCell>{fmtTime(i.released_at)}</TableCell>
                    <TableCell>{user(i.owner_user_id)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        ) : null}

        {tab === 5 ? (
          <Stack spacing={1.5}>
            {openQueue.map((i) => {
              const ratioPct = (i.tat_actual_min / i.tat_target_min) * 100;
              const tone = progressTone(ratioPct);
              return (
                <Box key={i.qa_inspection_id}>
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.6 }}>
                    <Typography variant="body2">
                      {mat(i.material_id)?.sku} · {i.lot} ({humanize(i.inspection_type)})
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <SlaPill status={i.sla_risk} />
                      <Typography variant="caption">
                        {fmtDuration(i.tat_actual_min)} / {fmtDuration(i.tat_target_min)}
                      </Typography>
                    </Stack>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(ratioPct, 100)}
                    sx={{
                      height: 8,
                      borderRadius: 1,
                      bgcolor: lx.soft,
                      '& .MuiLinearProgress-bar': { bgcolor: toneColor[tone] },
                    }}
                  />
                </Box>
              );
            })}
          </Stack>
        ) : null}
      </PanelCard>

      <LogisticsDrawer
        open={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        title={selected ? `${mat(selected.material_id)?.sku ?? ''} — ${selected.lot}` : ''}
        subtitle={selected ? `${selected.qa_inspection_id} · QAInspection N-15` : undefined}
        width={480}
      >
        {selected ? (
          <>
            <DrawerSection title="QA Status Timeline (visible to Logistics)">
              <Stack spacing={1}>
                {TIMELINE.map((step) => {
                  const done = timelineDone(selected.qa_status, step.key);
                  return (
                    <Box
                      key={step.key}
                      sx={{
                        pl: 1.5,
                        borderLeft: `3px solid ${done ? LOGISTICS_ACCENT : lx.border}`,
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: done ? 700 : 500, color: done ? lx.text : lx.textDisabled }}
                      >
                        {step.label}
                      </Typography>
                    </Box>
                  );
                })}
              </Stack>
              <Typography variant="caption" sx={{ color: lx.textMuted, display: 'block', mt: 1 }}>
                Logistics sees this queue process so they know where Quality is — without owning the
                decision.
              </Typography>
            </DrawerSection>

            <DrawerSection title="Material Impact Panel">
              <Typography variant="body2">{selected.impact}</Typography>
              <Typography variant="body2" sx={{ mt: 0.8, fontSize: 12 }}>
                Pallet qty on release: <strong>{selected.pallet_qty ?? '—'}</strong> (frees receiving
                capacity)
              </Typography>
              {selected.note ? (
                <Typography variant="caption" sx={{ color: lx.textMuted, display: 'block', mt: 0.6 }}>
                  {selected.note}
                </Typography>
              ) : null}
            </DrawerSection>

            {linkedBos.length ? (
              <DrawerSection title="Linked backorders">
                <Stack spacing={0.6}>
                  {linkedBos.map((b) => (
                    <Typography key={b!.backorder_id} variant="body2">
                      {b!.backorder_id} · {b!.sales_order_id} · Qty {b!.qty_open} ·{' '}
                      {humanize(b!.ship_mode_if_released)}
                    </Typography>
                  ))}
                </Stack>
              </DrawerSection>
            ) : null}

            <DrawerSection title="Shipping urgency requests">
              {(selected.urgency_requests?.length ?? 0) === 0 ? (
                <Typography variant="caption" sx={{ color: lx.textMuted }}>
                  No urgency requests yet
                </Typography>
              ) : (
                <Stack spacing={1}>
                  {selected.urgency_requests.map((u, idx) => (
                    <Paper
                      key={`${u.at}-${idx}`}
                      elevation={0}
                      sx={{
                        p: 1.2,
                        bgcolor: lx.soft,
                        border: `1px solid ${lx.border}`,
                        borderRadius: 1.5,
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {user(u.from)} · {fmtTime(u.at)}
                      </Typography>
                      <Typography variant="body2">{u.reason}</Typography>
                    </Paper>
                  ))}
                </Stack>
              )}
              <Button
                variant="contained"
                size="small"
                disabled={selected.qa_status === 'released'}
                onClick={requestUrgency}
                sx={{ mt: 1.5, bgcolor: LOGISTICS_ACCENT, textTransform: 'none', fontWeight: 700 }}
              >
                Request priority release (Shipping → QA)
              </Button>
              {urgencyMsg ? (
                <Typography variant="caption" sx={{ color: lx.textMuted, display: 'block', mt: 1 }}>
                  {urgencyMsg}
                </Typography>
              ) : null}
            </DrawerSection>

            <DrawerSection title="Release Evidence Panel">
              <Typography variant="caption" sx={{ color: lx.textMuted, display: 'block' }}>
                Documents, CoA, inspection results (manual attachment placeholder)
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.8 }}>
                Blocker:{' '}
                <strong>
                  {selected.release_blocker ? humanize(selected.release_blocker) : 'None'}
                </strong>
              </Typography>
              <Typography variant="body2">
                Required action: <strong>{selected.required_action}</strong>
              </Typography>
              <Typography variant="body2">Owner: {user(selected.owner_user_id)}</Typography>
            </DrawerSection>

            <DrawerSection title="Actions">
              <Button
                variant="outlined"
                disabled
                title="QA release requires human approval in regulated system"
                sx={{ textTransform: 'none', fontWeight: 700 }}
              >
                Approve release (human gate only — not in this UI)
              </Button>
            </DrawerSection>
          </>
        ) : null}
      </LogisticsDrawer>
    </LogisticsPageShell>
  );
}
