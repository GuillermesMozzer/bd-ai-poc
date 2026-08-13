import React, { useMemo } from 'react';
import { Box, LinearProgress, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import type { CtTone } from '../cockpit/cockpitTheme';
import { wipMockSeed } from '../data/wipMockData';
import { fmtDuration, fmtTime, humanize } from '../utils';
import { ctV2Type, tokenBrand, tokenText, tokenWarning } from '../ctV2Theme';
import {
  CtV2InsetCard,
  CtV2StatusChip,
  CtV2WidgetShell,
  toneColorV2,
} from '../ctV2/CtV2Visuals';

const data = wipMockSeed;

function statusTone(status: string): CtTone {
  if (status === 'Available' || status === 'Received' || status === 'Staged') return 'ok';
  if (status === 'Blocked' || status === 'Quarantined') return 'danger';
  if (status === 'Under Quality Review' || status === 'In Transit' || status === 'Created') return 'warn';
  return 'neutral';
}

function exceptionTone(type: string): CtTone {
  if (type === 'blocked' || type === 'quantity_divergence' || type === 'wrong_location') return 'danger';
  if (type === 'exceeded_dwell' || type === 'stagnant' || type === 'quality_hold') return 'warn';
  return 'neutral';
}

function priorityTone(priority: string): CtTone {
  if (priority === 'critical') return 'danger';
  if (priority === 'high') return 'warn';
  return 'ok';
}

export function CtV2WipKpiStripWidget() {
  const kpis = useMemo(() => {
    const objs = data.objects;
    return {
      total: objs.length,
      blocked: objs.filter((o) => o.status === 'Blocked' || o.status === 'Quarantined').length,
      transit: objs.filter((o) => o.status === 'In Transit').length,
      stagnant: objs.filter((o) => o.aging_location_hours > o.expected_dwell_hours).length,
      openExc: data.exceptions.filter((e) => e.state !== 'resolved').length,
      available: objs.filter((o) => o.available_for_next).length,
    };
  }, []);

  const items: { label: string; value: number; tone: CtTone }[] = [
    { label: 'Total WIP objects', value: kpis.total, tone: 'neutral' },
    { label: 'Blocked / quarantined', value: kpis.blocked, tone: 'danger' },
    { label: 'In transit', value: kpis.transit, tone: 'warn' },
    { label: 'Stagnant (aging > dwell)', value: kpis.stagnant, tone: 'warn' },
    { label: 'Exceptions open', value: kpis.openExc, tone: 'danger' },
    { label: 'Available for next', value: kpis.available, tone: 'ok' },
  ];

  return (
    <CtV2WidgetShell title="WIP KPIs" subtitle="IN02 + floor · objects, holds, aging">
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(6, 1fr)' }, gap: 1 }}>
        {items.map((item) => (
          <CtV2InsetCard key={item.label} sx={{ borderTop: `3px solid ${toneColorV2(item.tone)}` }}>
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

export function CtV2WipAgingWidget() {
  const aging = useMemo(() => {
    const list = data.objects;
    const n = list.length || 1;
    return {
      created: list.reduce((s, o) => s + o.aging_created_hours, 0) / n,
      location: list.reduce((s, o) => s + o.aging_location_hours, 0) / n,
      status: list.reduce((s, o) => s + o.aging_status_hours, 0) / n,
    };
  }, []);

  const cards = [
    { label: 'Avg aging since created', hours: aging.created },
    { label: 'Avg aging in location', hours: aging.location },
    { label: 'Avg aging in status', hours: aging.status },
  ];

  return (
    <CtV2WidgetShell title="Aging Summary" subtitle="Dwell vs expected">
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 1 }}>
        {cards.map((card) => (
          <CtV2InsetCard key={card.label}>
            <Typography sx={{ ...ctV2Type.caption, color: tokenText.secondary }}>{card.label}</Typography>
            <Typography sx={{ fontSize: 22, fontWeight: 800, color: tokenText.primary, mt: 0.4 }}>
              {fmtDuration(card.hours * 60)}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={Math.min(100, (card.hours / 48) * 100)}
              sx={{
                mt: 1.2,
                height: 6,
                borderRadius: 999,
                bgcolor: 'action.hover',
                '& .MuiLinearProgress-bar': { bgcolor: tokenBrand.main, borderRadius: 999 },
              }}
            />
          </CtV2InsetCard>
        ))}
      </Box>
    </CtV2WidgetShell>
  );
}

export function CtV2WipStagnantWidget() {
  const stagnant = useMemo(
    () =>
      [...data.objects]
        .filter((o) => o.aging_location_hours > o.expected_dwell_hours)
        .sort((a, b) => b.aging_location_hours - a.aging_location_hours)
        .slice(0, 8),
    [],
  );

  return (
    <CtV2WidgetShell title="Top Stagnant WIP" subtitle="Aging beyond expected dwell">
      <Stack spacing={1}>
        {stagnant.length === 0 ? (
          <Typography sx={{ ...ctV2Type.caption, color: tokenText.secondary }}>No stagnant WIP.</Typography>
        ) : (
          stagnant.map((o) => (
            <CtV2InsetCard key={o.wip_id}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ ...ctV2Type.body, fontWeight: 800 }}>{o.wip_id}</Typography>
                  <Typography sx={{ ...ctV2Type.caption, color: tokenText.secondary }}>
                    {o.wip_type} · {o.location.display}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={0.75} alignItems="center" flexShrink={0}>
                  <CtV2StatusChip label={o.status} tone={statusTone(o.status)} />
                  <Typography sx={{ ...ctV2Type.caption, color: tokenWarning.main, fontWeight: 800 }}>
                    {fmtDuration(o.aging_location_hours * 60)} / {fmtDuration(o.expected_dwell_hours * 60)}
                  </Typography>
                </Stack>
              </Stack>
            </CtV2InsetCard>
          ))
        )}
      </Stack>
    </CtV2WidgetShell>
  );
}

export function CtV2WipInventoryWidget() {
  return (
    <CtV2WidgetShell title={`Inventory (${data.objects.length})`} subtitle="WIP objects · lot, location, next step">
      <Table size="small" stickyHeader sx={{ '& td, & th': { borderColor: 'divider', py: 0.75, fontSize: 12 } }}>
        <TableHead>
          <TableRow>
            {['ID', 'Type', 'Site', 'Lot', 'Qty', 'Location', 'Status', 'Next', 'Aging'].map((h) => (
              <TableCell key={h} sx={{ ...ctV2Type.caption, fontWeight: 800, color: tokenText.secondary, whiteSpace: 'nowrap' }}>
                {h}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.objects.map((o) => (
            <TableRow key={o.wip_id} hover>
              <TableCell sx={{ fontWeight: 800 }}>{o.wip_id}</TableCell>
              <TableCell>{o.wip_type}</TableCell>
              <TableCell>{o.site}</TableCell>
              <TableCell>{o.lot}</TableCell>
              <TableCell>
                {o.quantity} {o.uom}
              </TableCell>
              <TableCell>{o.location.display}</TableCell>
              <TableCell>
                <CtV2StatusChip label={o.status} tone={statusTone(o.status)} />
              </TableCell>
              <TableCell>{o.next_step || '—'}</TableCell>
              <TableCell sx={{ fontWeight: 800, color: o.aging_location_hours > o.expected_dwell_hours ? tokenWarning.main : tokenText.primary }}>
                {fmtDuration(o.aging_location_hours * 60)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CtV2WidgetShell>
  );
}

export function CtV2WipExceptionsWidget() {
  return (
    <CtV2WidgetShell title={`Exceptions (${data.exceptions.filter((e) => e.state !== 'resolved').length} open)`} subtitle="WIP holds and divergences">
      <Stack spacing={1}>
        {data.exceptions.map((e) => (
          <CtV2InsetCard key={e.exception_id}>
            <Stack direction="row" justifyContent="space-between" spacing={1}>
              <Typography sx={{ ...ctV2Type.body, fontWeight: 800 }}>{e.exception_id}</Typography>
              <Stack direction="row" spacing={0.5}>
                <CtV2StatusChip label={humanize(e.type)} tone={exceptionTone(e.type)} />
                <CtV2StatusChip
                  label={e.state}
                  tone={e.state === 'resolved' ? 'ok' : e.state === 'assigned' ? 'warn' : 'danger'}
                />
              </Stack>
            </Stack>
            <Typography sx={{ ...ctV2Type.caption, color: tokenText.secondary, mt: 0.4 }}>
              {e.wip_id} · age {fmtDuration(e.age_hours * 60)}
            </Typography>
            <Typography sx={{ ...ctV2Type.body, mt: 0.4 }}>{e.reason}</Typography>
          </CtV2InsetCard>
        ))}
      </Stack>
    </CtV2WidgetShell>
  );
}

export function CtV2WipActionQueueWidget() {
  return (
    <CtV2WidgetShell title="Action Queue" subtitle="Owned next steps">
      <Stack spacing={1}>
        {data.actions.map((a) => (
          <CtV2InsetCard key={a.action_id}>
            <Stack direction="row" justifyContent="space-between" spacing={1}>
              <Typography sx={{ ...ctV2Type.body, fontWeight: 800 }}>{a.title}</Typography>
              <CtV2StatusChip label={a.priority} tone={priorityTone(a.priority)} />
            </Stack>
            <Typography sx={{ ...ctV2Type.caption, color: tokenText.secondary, mt: 0.35 }}>
              {a.wip_id} · {humanize(a.action_type)} · due {a.due_hint}
            </Typography>
          </CtV2InsetCard>
        ))}
      </Stack>
    </CtV2WidgetShell>
  );
}

export function CtV2WipLocationMapWidget() {
  return (
    <CtV2WidgetShell title="Location Map" subtitle="Zone occupancy">
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1 }}>
        {data.map_zones.map((z) => (
          <CtV2InsetCard
            key={z.zone_id}
            sx={{ borderLeft: `4px solid ${z.blocked_count ? toneColorV2('danger') : toneColorV2('ok')}` }}
          >
            <Typography sx={{ ...ctV2Type.body, fontWeight: 800 }}>{z.label}</Typography>
            <Typography sx={{ ...ctV2Type.caption, color: tokenText.secondary }}>
              {z.plant} · {z.area}
            </Typography>
            <Stack direction="row" spacing={1} mt={0.75} flexWrap="wrap">
              <CtV2StatusChip label={`${z.wip_count} WIP`} tone="accent" />
              <CtV2StatusChip label={`${z.blocked_count} blocked`} tone={z.blocked_count ? 'danger' : 'ok'} />
              <CtV2StatusChip label={`max ${fmtDuration(z.aging_max_hours * 60)}`} tone="warn" />
            </Stack>
          </CtV2InsetCard>
        ))}
      </Box>
    </CtV2WidgetShell>
  );
}

export function CtV2WipTransfersWidget() {
  return (
    <CtV2WidgetShell title="Inter-site Transfers" subtitle="WIP moving between plants">
      <Table size="small" sx={{ '& td, & th': { borderColor: 'divider', py: 0.75, fontSize: 12 } }}>
        <TableHead>
          <TableRow>
            {['Transfer', 'From', 'To', 'WIP', 'Status', 'ETA'].map((h) => (
              <TableCell key={h} sx={{ ...ctV2Type.caption, fontWeight: 800, color: tokenText.secondary }}>
                {h}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.transfers.map((t) => (
            <TableRow key={t.transfer_id} hover>
              <TableCell sx={{ fontWeight: 800 }}>{t.transfer_id}</TableCell>
              <TableCell>{t.from_site}</TableCell>
              <TableCell>{t.to_site}</TableCell>
              <TableCell>{t.wip_ids.join(', ')}</TableCell>
              <TableCell>
                <CtV2StatusChip label={t.status} tone={t.status === 'In Transit' ? 'warn' : 'ok'} />
              </TableCell>
              <TableCell>{t.eta ? fmtTime(t.eta) : '—'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CtV2WidgetShell>
  );
}

export const CT_V2_WIP_WIDGET_IDS = [
  'wip_kpis',
  'wip_aging',
  'wip_stagnant',
  'wip_inventory',
  'wip_exceptions',
  'wip_actions',
  'wip_map',
  'wip_transfers',
] as const;

export type CtV2WipWidgetId = (typeof CT_V2_WIP_WIDGET_IDS)[number];

export const CT_V2_WIP_WIDGET_TITLES: Record<CtV2WipWidgetId, string> = {
  wip_kpis: 'WIP KPIs',
  wip_aging: 'Aging Summary',
  wip_stagnant: 'Stagnant WIP',
  wip_inventory: 'Inventory',
  wip_exceptions: 'Exceptions',
  wip_actions: 'Action Queue',
  wip_map: 'Location Map',
  wip_transfers: 'Transfers',
};

export function renderCtV2WipWidget(id: CtV2WipWidgetId) {
  switch (id) {
    case 'wip_kpis':
      return <CtV2WipKpiStripWidget />;
    case 'wip_aging':
      return <CtV2WipAgingWidget />;
    case 'wip_stagnant':
      return <CtV2WipStagnantWidget />;
    case 'wip_inventory':
      return <CtV2WipInventoryWidget />;
    case 'wip_exceptions':
      return <CtV2WipExceptionsWidget />;
    case 'wip_actions':
      return <CtV2WipActionQueueWidget />;
    case 'wip_map':
      return <CtV2WipLocationMapWidget />;
    case 'wip_transfers':
      return <CtV2WipTransfersWidget />;
    default:
      return null;
  }
}
