import React, { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  FormControl,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import ViewInArIcon from '@mui/icons-material/ViewInAr';
import LogisticsPageShell from '../components/LogisticsPageShell';
import KpiRow from '../components/KpiRow';
import PanelCard from '../components/PanelCard';
import LogisticsDrawer, { DrawerSection } from '../components/LogisticsDrawer';
import { StatusPill, SeverityPill } from '../components/StatusPill';
import { logisticsData } from '../data/logisticsMockData';
import { READINESS_GATES, LOGISTICS_ACCENT } from '../constants';
import { fmtTime, humanize } from '../utils';
import { lx } from '../themeTokens';
import { useWorkstationContext } from '../../workstation/contexts/WorkstationContext';

const data = logisticsData;

const PRIORITY_ORDER: Record<string, number> = {
  pledge: 0,
  window_48h: 1,
  backorder: 2,
  standard: 3,
};

const priorityLabel = (tier: string) => {
  const map: Record<string, string> = {
    pledge: 'Pledge today',
    window_48h: '48-hour window',
    standard: 'Standard',
    backorder: 'Backorder',
  };
  return map[tier] ?? tier;
};

const priorityTone = (tier: string) => {
  if (tier === 'pledge' || tier === 'backorder') return 'danger' as const;
  if (tier === 'window_48h') return 'warn' as const;
  return 'default' as const;
};

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

const PRIORITY_CHIPS: { tier: string; label: string }[] = [
  { tier: '', label: 'All' },
  { tier: 'pledge', label: 'Pledge today' },
  { tier: 'window_48h', label: '48-hour' },
  { tier: 'standard', label: 'Standard' },
  { tier: 'backorder', label: 'Backorders' },
];

export default function ShipmentReadinessPage() {
  const { setCurrentScreen } = useWorkstationContext();
  const [priorityTier, setPriorityTier] = useState('');
  const [shipType, setShipType] = useState('');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const ships = data.outbound_shipments;
  const daily = data.shipping_daily;

  const filteredShips = useMemo(() => {
    const q = search.trim().toLowerCase();
    return ships
      .filter((s) => {
        if (priorityTier && s.priority_tier !== priorityTier) return false;
        if (shipType && s.ship_type !== shipType) return false;
        if (!q) return true;
        const cust = data.customers[s.customer_id]?.name ?? '';
        return (
          s.outbound_shipment_id.toLowerCase().includes(q) ||
          s.sales_order_id.toLowerCase().includes(q) ||
          cust.toLowerCase().includes(q)
        );
      })
      .sort(
        (a, b) =>
          (PRIORITY_ORDER[a.priority_tier] ?? 9) - (PRIORITY_ORDER[b.priority_tier] ?? 9),
      );
  }, [ships, priorityTier, shipType, search]);

  const selected =
    ships.find((s) => s.outbound_shipment_id === selectedId) ??
    null;

  const palletShip =
    selected?.pallets?.length
      ? selected
      : ships.find((s) => s.pallets?.length >= 2) || ships.find((s) => s.pallets?.length);

  const shippingExceptions = data.exceptions.filter((e) => e.process_area === 'Shipping');

  const readinessColor = (pct: number) => {
    if (pct >= 100) return lx.ok;
    if (pct >= 70) return lx.warn;
    return lx.danger;
  };

  return (
    <LogisticsPageShell
      title="Shipment Readiness Cockpit"
      subtitle="Pledge · 48h · domestic/intl · hazmat · backorders · ST86–ST108"
      asOf={data.as_of}
    >
      <KpiRow
        items={[
          {
            label: 'Pledge not ready',
            value: ships.filter((s) => s.priority_tier === 'pledge' && s.readiness_pct < 100).length,
            tone: 'danger',
          },
          {
            label: '48h window open',
            value: ships.filter((s) => s.priority_tier === 'window_48h' && s.readiness_pct < 100)
              .length,
            tone: 'warn',
          },
          {
            label: 'Ready (100%)',
            value: ships.filter((s) => s.readiness_pct === 100).length,
            tone: 'ok',
          },
          { label: 'Open cases today', value: daily.open_cases_today },
          { label: 'Cases shipped today', value: daily.cases_shipped_today, tone: 'ok' },
          { label: 'Open backorders', value: data.backorders.length, tone: 'danger' },
        ]}
      />

      <PanelCard
        title="Daily shipping report"
        action={
          <Typography variant="caption" sx={{ color: lx.textMuted }}>
            Open cases · shipped · overtime / Saturday signal
          </Typography>
        }
        sx={{ mb: 2 }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(6, 1fr)' },
            gap: 1.5,
          }}
        >
          {[
            { label: 'Open cases', value: daily.open_cases_today },
            { label: 'Shipped today', value: daily.cases_shipped_today },
            { label: 'Pledge remaining', value: daily.pledge_remaining },
            { label: '48h remaining', value: daily.window_48h_remaining },
            {
              label: 'Overtime risk',
              value: daily.overtime_risk ? 'Yes — review staffing' : 'No',
            },
            { label: 'Saturday candidate', value: daily.saturday_candidate ? 'Yes' : 'No' },
          ].map((item) => (
            <Box key={item.label}>
              <Typography variant="caption" sx={{ color: lx.textMuted }}>
                {item.label}
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                {item.value}
              </Typography>
            </Box>
          ))}
        </Box>
        {daily.eom_volume_flag ? (
          <Typography variant="body2" sx={{ mt: 1.5, color: lx.warn, fontSize: 12 }}>
            <strong>EOM volume flag:</strong> {daily.eom_note}
          </Typography>
        ) : null}
      </PanelCard>

      <PanelCard title="Shipment Readiness List" sx={{ mb: 2 }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={1.5}
          alignItems={{ xs: 'stretch', md: 'center' }}
          sx={{ mb: 2, flexWrap: 'wrap' }}
        >
          <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap>
            {PRIORITY_CHIPS.map((chip) => {
              const selectedChip = priorityTier === chip.tier;
              return (
                <Chip
                  key={chip.label}
                  label={chip.label}
                  clickable
                  onClick={() => setPriorityTier(chip.tier)}
                  sx={{
                    fontWeight: 700,
                    bgcolor: selectedChip ? LOGISTICS_ACCENT : lx.chipBg,
                    color: selectedChip ? '#fff' : lx.text,
                    border: selectedChip ? 'none' : `1px solid ${lx.border}`,
                    '&:hover': {
                      bgcolor: selectedChip ? 'var(--token-brand-dark)' : lx.border,
                    },
                  }}
                />
              );
            })}
          </Stack>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Ship type</InputLabel>
            <Select
              label="Ship type"
              value={shipType}
              onChange={(e) => setShipType(e.target.value)}
            >
              <MenuItem value="">All ship types</MenuItem>
              <MenuItem value="domestic">Domestic</MenuItem>
              <MenuItem value="international">International</MenuItem>
            </Select>
          </FormControl>
          <TextField
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search SO, customer, shipment…"
            sx={{ minWidth: 220, flex: 1 }}
          />
        </Stack>

        <Box sx={{ overflowX: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Priority</TableCell>
                <TableCell>Readiness</TableCell>
                <TableCell>Shipment</TableCell>
                <TableCell>Sales order</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Due</TableCell>
                <TableCell>Cases</TableCell>
                <TableCell>Hazmat</TableCell>
                <TableCell>Blockers</TableCell>
                <TableCell>Owner</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredShips.map((s) => {
                const cust = data.customers[s.customer_id];
                const haz = s.hazmat_required ? (
                  s.hazmat_docs_ready ? (
                    <StatusPill label="Ready" tone="ok" />
                  ) : (
                    <StatusPill label="Gap" tone="danger" />
                  )
                ) : (
                  '—'
                );
                return (
                  <TableRow
                    key={s.outbound_shipment_id}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => setSelectedId(s.outbound_shipment_id)}
                  >
                    <TableCell>
                      <StatusPill label={priorityLabel(s.priority_tier)} tone={priorityTone(s.priority_tier)} />
                    </TableCell>
                    <TableCell sx={{ minWidth: 120 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>
                        {s.readiness_pct}%
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={s.readiness_pct}
                        sx={{
                          mt: 0.4,
                          height: 6,
                          borderRadius: 1,
                          bgcolor: lx.soft,
                          '& .MuiLinearProgress-bar': { bgcolor: readinessColor(s.readiness_pct) },
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 800 }}>
                        {s.outbound_shipment_id}
                      </Typography>
                    </TableCell>
                    <TableCell>{s.sales_order_id}</TableCell>
                    <TableCell>
                      <StatusPill
                        label={s.ship_type === 'international' ? 'International' : 'Domestic'}
                        tone={s.ship_type === 'international' ? 'warn' : 'default'}
                      />
                    </TableCell>
                    <TableCell>{cust?.name ?? s.customer_id}</TableCell>
                    <TableCell>{fmtDate(s.due_date)}</TableCell>
                    <TableCell>
                      {s.cases_open ?? 0} open / {s.cases_shipped ?? 0} out
                    </TableCell>
                    <TableCell>{haz}</TableCell>
                    <TableCell sx={{ fontSize: 12, maxWidth: 160 }}>
                      {s.blockers.map((b) => humanize(b)).join(', ') || '—'}
                    </TableCell>
                    <TableCell sx={{ fontSize: 12 }}>
                      {data.users[s.owner_user_id] ?? s.owner_user_id}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Box>
      </PanelCard>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 2,
          mb: 2,
        }}
      >
        <PanelCard title="Outbound Exception Board">
          <Stack spacing={1.2}>
            {shippingExceptions.map((e) => (
              <Paper
                key={e.exception_id}
                elevation={0}
                sx={{ p: 1.5, border: `1px solid ${lx.border}`, borderRadius: 1.5 }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, textTransform: 'capitalize' }}>
                    {humanize(e.exception_type)}
                  </Typography>
                  <SeverityPill severity={e.severity} />
                </Stack>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  {e.description}
                </Typography>
                <Typography variant="caption" sx={{ color: lx.textMuted }}>
                  {e.linked_entity_id} · {e.next_action}
                </Typography>
              </Paper>
            ))}
          </Stack>
        </PanelCard>

        <PanelCard
          title="Digital Pallet Configuration"
          action={
            <Button
              size="small"
              startIcon={<ViewInArIcon />}
              onClick={() => setCurrentScreen('pallet_verification')}
              sx={{ textTransform: 'none', fontWeight: 700 }}
            >
              Open 3D Load Check
            </Button>
          }
        >
          {palletShip ? (
            <>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {palletShip.outbound_shipment_id} · {palletShip.sales_order_id} ·{' '}
                {palletShip.ship_type === 'international' ? 'International' : 'Domestic'}
              </Typography>
              <Typography variant="caption" sx={{ color: lx.textMuted, display: 'block', mb: 1.5 }}>
                Visual dock layout — replaces paper pallet config sheet. Use 3D Load Check for guided
                verification.
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 1,
                }}
              >
                {Array.from({ length: 6 }, (_, i) => {
                  const p = palletShip.pallets?.[i] ?? null;
                  return (
                    <Paper
                      key={i}
                      elevation={0}
                      sx={{
                        p: 1.2,
                        minHeight: 72,
                        borderRadius: 1.5,
                        border: `1px dashed ${p ? LOGISTICS_ACCENT : lx.border}`,
                        bgcolor: p ? 'rgba(11, 92, 171, 0.06)' : lx.soft,
                        textAlign: 'center',
                      }}
                    >
                      {p ? (
                        <>
                          <Typography variant="caption" sx={{ fontWeight: 800, display: 'block' }}>
                            {p.position ?? `P${i + 1}`}
                          </Typography>
                          <Typography variant="caption" sx={{ display: 'block' }}>
                            {p.pallet_id}
                          </Typography>
                          <Typography variant="caption" sx={{ color: lx.textMuted }}>
                            {p.sku} · {p.qty}
                          </Typography>
                        </>
                      ) : (
                        <Typography variant="caption" sx={{ color: lx.textDisabled }}>
                          Empty
                          <br />
                          slot {i + 1}
                        </Typography>
                      )}
                    </Paper>
                  );
                })}
              </Box>
            </>
          ) : (
            <Typography variant="body2" sx={{ color: lx.textMuted }}>
              No pallet configuration available
            </Typography>
          )}
        </PanelCard>
      </Box>

      <PanelCard title="Backorder & EOM pressure">
        <Box sx={{ overflowX: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Backorder</TableCell>
                <TableCell>Sales order</TableCell>
                <TableCell>Material</TableCell>
                <TableCell>Qty open</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell>If released</TableCell>
                <TableCell>EOM</TableCell>
                <TableCell>Owner</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.backorders.map((b) => {
                const m = data.materials[b.material_id];
                return (
                  <TableRow key={b.backorder_id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 800 }}>
                        {b.backorder_id}
                      </Typography>
                    </TableCell>
                    <TableCell>{b.sales_order_id}</TableCell>
                    <TableCell>{m?.sku ?? b.material_id}</TableCell>
                    <TableCell>{b.qty_open}</TableCell>
                    <TableCell sx={{ fontSize: 12 }}>{b.reason}</TableCell>
                    <TableCell sx={{ fontSize: 12 }}>{humanize(b.ship_mode_if_released)}</TableCell>
                    <TableCell>
                      {b.eom_pressure ? <StatusPill label="EOM" tone="danger" /> : '—'}
                    </TableCell>
                    <TableCell sx={{ fontSize: 12 }}>
                      {data.users[b.owner_user_id] ?? b.owner_user_id}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Box>
      </PanelCard>

      <LogisticsDrawer
        open={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        title={selected?.outbound_shipment_id ?? ''}
        subtitle={selected ? `${selected.sales_order_id} · ShipmentReadiness N-25` : undefined}
        width={460}
      >
        {selected ? (
          <>
            <DrawerSection title={`Readiness ${selected.readiness_pct}%`}>
              <LinearProgress
                variant="determinate"
                value={selected.readiness_pct}
                sx={{
                  height: 10,
                  borderRadius: 1,
                  bgcolor: lx.soft,
                  '& .MuiLinearProgress-bar': { bgcolor: readinessColor(selected.readiness_pct) },
                }}
              />
              <Stack direction="row" spacing={1} sx={{ mt: 1.2 }} flexWrap="wrap" useFlexGap>
                <StatusPill
                  label={priorityLabel(selected.priority_tier)}
                  tone={priorityTone(selected.priority_tier)}
                />
                <StatusPill
                  label={selected.ship_type === 'international' ? 'International' : 'Domestic'}
                />
              </Stack>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Customer: {data.customers[selected.customer_id]?.name}
                <br />
                Due: {fmtDate(selected.due_date)}
              </Typography>
              <Typography variant="caption" sx={{ display: 'block', mt: 0.6 }}>
                Cases: {selected.cases_open ?? 0} open · {selected.cases_shipped ?? 0} shipped
              </Typography>
              {selected.note ? (
                <Typography variant="caption" sx={{ color: lx.textMuted, display: 'block', mt: 0.6 }}>
                  {selected.note}
                </Typography>
              ) : null}
            </DrawerSection>

            <DrawerSection title="Readiness gates">
              <Stack spacing={0.8}>
                {READINESS_GATES.filter(
                  (g) =>
                    g.key !== 'hazmat_docs_ready' ||
                    selected.hazmat_required ||
                    selected.ship_type === 'international',
                ).map((g) => {
                  const ok =
                    g.key === 'hazmat_docs_ready'
                      ? selected.hazmat_docs_ready
                      : Boolean(selected.gates[g.key as keyof typeof selected.gates]);
                  return (
                    <Stack key={g.key} direction="row" spacing={1} alignItems="center">
                      {ok ? (
                        <CheckCircleOutlineIcon sx={{ fontSize: 18, color: lx.ok }} />
                      ) : (
                        <RadioButtonUncheckedIcon sx={{ fontSize: 18, color: lx.textDisabled }} />
                      )}
                      <Typography
                        variant="body2"
                        sx={{ color: ok ? lx.text : lx.textMuted, fontWeight: ok ? 600 : 500 }}
                      >
                        {g.label}
                      </Typography>
                    </Stack>
                  );
                })}
              </Stack>
            </DrawerSection>

            {selected.hazmat_required ? (
              <DrawerSection title="Hazmat documentation">
                {selected.hazmat_docs_ready ? (
                  <Typography variant="body2">Complete</Typography>
                ) : (
                  <Typography variant="body2" sx={{ color: lx.danger, fontWeight: 700 }}>
                    Incomplete — digital form required before carrier pickup
                  </Typography>
                )}
                <Typography variant="caption" sx={{ color: lx.textMuted, display: 'block', mt: 0.6 }}>
                  Replaces manual hazmat forms that caused carrier/port returns
                </Typography>
              </DrawerSection>
            ) : null}

            {(selected.linked_backorder_ids ?? []).length ? (
              <DrawerSection title="Linked backorders">
                <Stack spacing={0.6}>
                  {(selected.linked_backorder_ids ?? [])
                    .map((id) => data.backorders.find((b) => b.backorder_id === id))
                    .filter(Boolean)
                    .map((b) => (
                      <Typography key={b!.backorder_id} variant="body2">
                        {b!.backorder_id} · qty {b!.qty_open} · {b!.reason}
                      </Typography>
                    ))}
                </Stack>
              </DrawerSection>
            ) : null}

            {selected.carrier_pickup_window ? (
              <DrawerSection title="Carrier & dock timeline">
                <Typography variant="body2">
                  Pickup window: {fmtTime(selected.carrier_pickup_window)}
                  <br />
                  Carrier:{' '}
                  {selected.carrier_id
                    ? (data.carriers[selected.carrier_id]?.name ?? '—')
                    : '—'}
                </Typography>
              </DrawerSection>
            ) : null}

            {selected.sap_delivery_id ? (
              <DrawerSection title="SAP">
                <Typography variant="body2">
                  Delivery: {selected.sap_delivery_id}
                  <br />
                  PGI: {selected.sap_pgi_doc}
                </Typography>
              </DrawerSection>
            ) : null}
          </>
        ) : null}
      </LogisticsDrawer>
    </LogisticsPageShell>
  );
}
