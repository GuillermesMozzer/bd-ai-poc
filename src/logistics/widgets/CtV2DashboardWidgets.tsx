import React, { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  IconButton,
  LinearProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import { ArrowRight } from 'lucide-react';
import { useWorkstationContext } from '../../workstation/contexts/WorkstationContext';
import type { AppScreen } from '../../navigation/navigationConfig';
import type { CtTone } from '../cockpit/cockpitTheme';
import { areaIdFromMacroflowArea, useCtV2Nav } from '../ctV2/CtV2NavContext';
import KpiDrilldownModal from '../cockpit/KpiDrilldownModal';
import {
  aiSiteSummary,
  areaTowers,
  cockpitKpis,
  globalAlert,
  logisticsData,
  macroflows,
  type CockpitKpi,
  type MacroflowId,
} from '../cockpit/macroflowModel';
import { receivingControlTowerData } from '../data/receivingMockData';
import { humanize } from '../utils';
import {
  ctV2Type,
  tokenBrand,
  tokenError,
  tokenText,
  tokenWarning,
  workstationVisuals,
} from '../ctV2Theme';
import {
  CtV2InsetCard,
  CtV2WidgetShell,
  SparklineV2,
  StatusBarV2,
  toneColorV2,
  toneSoftBgV2,
} from '../ctV2/CtV2Visuals';

const k = logisticsData.executive_kpis;

function useGoScreen() {
  const { setCurrentScreen } = useWorkstationContext();
  return (screen: AppScreen) => setCurrentScreen(screen);
}

// ─── Global Alert ───────────────────────────────────────────────────────────

export function CtV2GlobalAlertWidget() {
  return (
    <CtV2WidgetShell title="Site Alert" subtitle="Executive risk banner">
      <Box
        sx={{
          p: 1.5,
          borderRadius: 2,
          bgcolor: toneSoftBgV2(globalAlert.tone),
          border: `1px solid ${toneColorV2(globalAlert.tone)}44`,
        }}
      >
        <Typography sx={{ ...ctV2Type.caption, color: tokenError.main, fontWeight: 800, textTransform: 'uppercase' }}>
          {globalAlert.title}
        </Typography>
        <Typography sx={{ ...ctV2Type.body, color: tokenText.primary, mt: 0.75, lineHeight: 1.45 }}>
          {globalAlert.message}
        </Typography>
      </Box>
    </CtV2WidgetShell>
  );
}

// ─── Executive KPIs ─────────────────────────────────────────────────────────

export function CtV2ExecutiveKpisWidget() {
  const [selected, setSelected] = useState<CockpitKpi | null>(null);

  return (
    <>
      <CtV2WidgetShell title="Executive KPIs" subtitle="Macroflow KPIs · IN01–OB03">
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            gap: 1,
          }}
        >
          {cockpitKpis.slice(0, 6).map((kpi) => (
            <CtV2InsetCard key={kpi.id} onClick={() => setSelected(kpi)}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Typography sx={{ ...ctV2Type.caption, color: tokenText.secondary, textTransform: 'uppercase' }}>
                  {kpi.macroflow} · {kpi.label}
                </Typography>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelected(kpi);
                  }}
                  sx={{ p: 0.25, color: tokenText.secondary }}
                  aria-label={`Drill down ${kpi.label}`}
                >
                  <OpenInFullIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.75 }}>
                <StatusBarV2 tone={kpi.tone} height={36} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Stack direction="row" alignItems="baseline" spacing={0.5}>
                    <Typography sx={{ fontSize: 24, fontWeight: 800, color: tokenText.primary, lineHeight: 1 }}>
                      {kpi.value}
                    </Typography>
                    {kpi.unit ? (
                      <Typography sx={{ ...ctV2Type.caption, color: tokenText.secondary }}>{kpi.unit}</Typography>
                    ) : null}
                  </Stack>
                  <Typography sx={{ ...ctV2Type.caption, color: tokenText.secondary }}>{kpi.target}</Typography>
                  <Typography sx={{ ...ctV2Type.caption, color: toneColorV2(kpi.tone), fontWeight: 700 }}>
                    {kpi.delta}
                  </Typography>
                </Box>
                <Box sx={{ width: 72, flexShrink: 0 }}>
                  <SparklineV2 values={kpi.sparkline} tone={kpi.tone} height={32} />
                </Box>
              </Stack>
            </CtV2InsetCard>
          ))}
        </Box>
      </CtV2WidgetShell>
      <KpiDrilldownModal open={Boolean(selected)} kpi={selected} onClose={() => setSelected(null)} />
    </>
  );
}

// ─── Macroflow Status ───────────────────────────────────────────────────────

export function CtV2MacroflowStatusWidget() {
  const { goToArea } = useCtV2Nav();
  const [selected, setSelected] = useState<CockpitKpi | null>(null);

  const kpiByMacro = useMemo(() => {
    const map = new Map<MacroflowId, CockpitKpi>();
    cockpitKpis.forEach((kpi) => {
      if (!map.has(kpi.macroflow)) map.set(kpi.macroflow, kpi);
    });
    return map;
  }, []);

  const openArea = (areaId: string) => {
    goToArea(areaIdFromMacroflowArea(areaId));
  };

  return (
    <>
      <CtV2WidgetShell title="Macroflow Status" subtitle="IN01 · IN02 · WIP · OB01 · OB02 · OB03">
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            gap: 1,
          }}
        >
          {macroflows.map((m) => (
            <CtV2InsetCard key={m.id}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ ...ctV2Type.sectionTitle, color: tokenText.primary }}>{m.label}</Typography>
                  <Typography sx={{ ...ctV2Type.caption, color: tokenText.secondary }}>
                    {m.processLabel} · {m.steps}
                  </Typography>
                </Box>
                <Button
                  size="small"
                  onClick={() => openArea(m.area)}
                  endIcon={<ArrowRight size={12} />}
                  sx={{
                    flexShrink: 0,
                    fontSize: 10,
                    fontWeight: 800,
                    textTransform: 'none',
                    borderRadius: 999,
                    px: 1.2,
                    color: tokenBrand.main,
                    borderColor: tokenBrand.light,
                  }}
                  variant="outlined"
                >
                  Go to area view
                </Button>
              </Stack>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mt: 1.25 }}>
                <Stack direction="row" spacing={0.75} alignItems="center">
                  <StatusBarV2 tone={m.tone} height={32} />
                  <Box>
                    <Typography sx={{ fontSize: 9, fontWeight: 700, color: tokenText.secondary, textTransform: 'uppercase' }}>
                      Health
                    </Typography>
                    <Typography sx={{ fontSize: 18, fontWeight: 800, color: toneColorV2(m.tone) }}>
                      {Math.round(m.healthscore)}
                    </Typography>
                  </Box>
                </Stack>
                <Stack direction="row" spacing={0.75} alignItems="center">
                  <StatusBarV2
                    tone={m.utilization > 85 ? 'danger' : m.utilization > 70 ? 'warn' : 'ok'}
                    height={32}
                  />
                  <Box>
                    <Typography sx={{ fontSize: 9, fontWeight: 700, color: tokenText.secondary, textTransform: 'uppercase' }}>
                      Capacity %
                    </Typography>
                    <Typography sx={{ fontSize: 18, fontWeight: 800, color: tokenText.primary }}>
                      {Math.round(m.utilization)}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
              <Stack direction="row" alignItems="flex-end" justifyContent="space-between" sx={{ mt: 1 }}>
                <Box>
                  <Typography sx={{ fontSize: 9, fontWeight: 700, color: tokenText.secondary, textTransform: 'uppercase' }}>
                    {m.secondaryLabel}
                  </Typography>
                  <Typography sx={{ fontSize: 16, fontWeight: 800, color: tokenText.primary }}>{m.secondaryValue}</Typography>
                </Box>
                <Box sx={{ width: 88 }}>
                  <SparklineV2 values={m.sparkline} tone={m.tone} height={28} />
                </Box>
                <IconButton
                  size="small"
                  onClick={() => setSelected(kpiByMacro.get(m.id) ?? cockpitKpis[0])}
                  sx={{ color: tokenText.secondary, p: 0.25 }}
                >
                  <OpenInFullIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </Stack>
            </CtV2InsetCard>
          ))}
        </Box>
      </CtV2WidgetShell>
      <KpiDrilldownModal open={Boolean(selected)} kpi={selected} onClose={() => setSelected(null)} />
    </>
  );
}

// ─── Area Towers ────────────────────────────────────────────────────────────

export function CtV2AreaTowersWidget() {
  const { goToArea } = useCtV2Nav();

  const openArea = (areaId: string) => {
    goToArea(areaIdFromMacroflowArea(areaId));
  };

  return (
    <CtV2WidgetShell title="Area Towers" subtitle="Drill into receiving, WIP, outbound">
      <Stack spacing={1}>
        {areaTowers.map((area) => (
          <CtV2InsetCard key={area.id} onClick={() => openArea(area.id)}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ ...ctV2Type.body, fontWeight: 800 }}>{area.title}</Typography>
                <Typography sx={{ ...ctV2Type.caption, color: tokenText.secondary }}>{area.subtitle}</Typography>
              </Box>
              <Chip
                size="small"
                label={area.macroflows.join(' · ')}
                sx={{
                  fontWeight: 800,
                  fontSize: 10,
                  bgcolor: toneSoftBgV2(area.tone),
                  color: toneColorV2(area.tone),
                  border: `1px solid ${toneColorV2(area.tone)}33`,
                }}
              />
            </Stack>
          </CtV2InsetCard>
        ))}
      </Stack>
    </CtV2WidgetShell>
  );
}

// ─── Exception Pulse ────────────────────────────────────────────────────────

export function CtV2ExceptionPulseWidget() {
  return (
    <CtV2WidgetShell title="Exception Pulse" subtitle="Top open exceptions">
      <Stack spacing={1}>
        {logisticsData.exceptions.slice(0, 5).map((e) => {
          const tone: CtTone = e.severity === 'critical' ? 'danger' : 'warn';
          return (
            <Box
              key={e.exception_id}
              sx={{
                pl: 1.25,
                borderLeft: `3px solid ${toneColorV2(tone)}`,
                py: 0.5,
              }}
            >
              <Typography sx={{ ...ctV2Type.body, fontWeight: 800, textTransform: 'capitalize' }}>
                {humanize(e.exception_type)}
              </Typography>
              <Typography sx={{ ...ctV2Type.caption, color: tokenText.secondary, lineHeight: 1.35 }}>
                {e.process_area} · {e.next_action}
              </Typography>
              <Typography sx={{ ...ctV2Type.caption, color: tokenText.secondary, mt: 0.25 }}>
                {e.age_hours}h · {logisticsData.users[e.owner_user_id] ?? e.owner_user_id}
              </Typography>
            </Box>
          );
        })}
      </Stack>
    </CtV2WidgetShell>
  );
}

// ─── AI Site Summary ────────────────────────────────────────────────────────

export function CtV2AiSiteSummaryWidget() {
  return (
    <CtV2WidgetShell title="ATLAS Site Summary" subtitle="Prescriptive site narrative">
      <Box
        sx={{
          p: 1.5,
          borderRadius: 2,
          bgcolor: tokenBrand.softBg,
          border: `1px solid ${tokenBrand.light}`,
        }}
      >
        <Typography sx={{ ...ctV2Type.body, color: tokenText.primary, lineHeight: 1.55, fontWeight: 600 }}>
          {aiSiteSummary}
        </Typography>
      </Box>
    </CtV2WidgetShell>
  );
}

// ─── Journey Heatmap ────────────────────────────────────────────────────────

export function CtV2JourneyHeatmapWidget() {
  return (
    <CtV2WidgetShell title="Journey Heatmap" subtitle="End-to-end logistics steps">
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
          gap: 1,
        }}
      >
        {logisticsData.journey_heatmap.map((s) => {
          const tone = s.level === 'red' ? 'danger' : s.level === 'yellow' ? 'warn' : ('ok' as CtTone);
          return (
            <CtV2InsetCard key={s.step_id}>
              <Stack direction="row" spacing={1} alignItems="center">
                <StatusBarV2 tone={tone} height={32} />
                <Box>
                  <Typography sx={{ ...ctV2Type.body, fontWeight: 800 }}>{s.label}</Typography>
                  <Typography sx={{ fontSize: 20, fontWeight: 800, color: tokenText.primary }}>{s.open_count}</Typography>
                  <Typography sx={{ ...ctV2Type.caption, color: tokenText.secondary }}>
                    {s.sla_status} · {s.aging_hours}h aging
                  </Typography>
                </Box>
              </Stack>
            </CtV2InsetCard>
          );
        })}
      </Box>
    </CtV2WidgetShell>
  );
}

// ─── Critical Materials ─────────────────────────────────────────────────────

export function CtV2CriticalMaterialsWidget() {
  return (
    <CtV2WidgetShell title="Critical Materials" subtitle="Lots impacting production">
      <Stack spacing={1}>
        {logisticsData.critical_materials.map((m) => (
          <CtV2InsetCard key={m.lot}>
            <Typography sx={{ ...ctV2Type.body, fontWeight: 800 }}>
              {m.sku} · {m.lot}
            </Typography>
            <Typography sx={{ ...ctV2Type.caption, color: tokenText.secondary, mt: 0.35 }}>
              {m.step} · {m.aging_hours}h · {m.impact}
            </Typography>
          </CtV2InsetCard>
        ))}
      </Stack>
    </CtV2WidgetShell>
  );
}

// ─── Leadership KPIs ────────────────────────────────────────────────────────

export function CtV2LeadershipKpisWidget() {
  const items = [
    { l: 'Quarantine aging', v: `${k.quarantine_aging_avg_days}d` },
    { l: 'QA lead time', v: `${k.qa_release_lead_time_hours}h` },
    { l: 'Loads at provider', v: String(k.loads_at_provider) },
    { l: 'Pledge today', v: String(k.pledge_due_today) },
    { l: 'Backorders', v: String(k.open_backorders) },
    { l: 'Staging cap.', v: `${k.receiving_capacity_pct}%` },
  ];

  return (
    <CtV2WidgetShell title="Leadership KPIs" subtitle="Site-level operational metrics">
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.25 }}>
        {items.map((x) => (
          <Box key={x.l}>
            <Typography sx={{ ...ctV2Type.caption, color: tokenText.secondary }}>{x.l}</Typography>
            <Typography sx={{ fontSize: 22, fontWeight: 800, color: tokenText.primary, fontFamily: workstationVisuals.fontFamily }}>
              {x.v}
            </Typography>
          </Box>
        ))}
      </Box>
    </CtV2WidgetShell>
  );
}

// ─── WIP Lanes ──────────────────────────────────────────────────────────────

export function CtV2WipLanesWidget() {
  const { goToArea } = useCtV2Nav();

  return (
    <CtV2WidgetShell title="WIP Lane Lens" subtitle="Shop-floor line status">
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          gap: 1,
        }}
      >
        {logisticsData.wip_lanes.map((w) => {
          const tone: CtTone =
            w.status === 'blocked' ? 'danger' : w.status === 'waiting' ? 'warn' : 'ok';
          return (
            <CtV2InsetCard key={w.machine_id} onClick={() => goToArea('wip')}>
              <Typography
                sx={{
                  ...ctV2Type.caption,
                  color: toneColorV2(tone),
                  fontWeight: 800,
                  textTransform: 'uppercase',
                }}
              >
                {w.status}
              </Typography>
              <Typography sx={{ ...ctV2Type.sectionTitle, mt: 0.5 }}>{w.name}</Typography>
              <Typography sx={{ ...ctV2Type.caption, color: tokenText.secondary }}>
                {w.job_id} · SKU {w.material}
              </Typography>
              <Typography sx={{ ...ctV2Type.body, mt: 0.75, fontWeight: 600 }}>{w.note}</Typography>
              <Box sx={{ mt: 1 }}>
                <SparklineV2
                  values={tone === 'ok' ? [2, 2, 3, 3, 3, 4] : [4, 3, 4, 5, 4, 5]}
                  tone={tone}
                  height={28}
                />
              </Box>
            </CtV2InsetCard>
          );
        })}
      </Box>
    </CtV2WidgetShell>
  );
}

// ─── Related Shortcuts ──────────────────────────────────────────────────────

export function CtV2RelatedShortcutsWidget() {
  const go = useGoScreen();

  return (
    <CtV2WidgetShell title="Related Apps" subtitle="Quick navigation">
      <Stack spacing={1}>
        <CtV2InsetCard onClick={() => go('machine_status')}>
          <Typography sx={{ ...ctV2Type.caption, color: tokenText.secondary, fontWeight: 800 }}>
            MACHINE MATERIAL STATUS
          </Typography>
          <Typography sx={{ ...ctV2Type.body, mt: 0.75 }}>
            Shop-floor board for clean-line bags, readiness %, and material call-offs (IN02).
          </Typography>
        </CtV2InsetCard>
        <CtV2InsetCard onClick={() => go('quality_release')}>
          <Typography sx={{ ...ctV2Type.caption, color: tokenText.secondary, fontWeight: 800 }}>
            QUALITY RELEASE
          </Typography>
          <Typography sx={{ ...ctV2Type.body, mt: 0.75 }}>
            {k.qa_hold_count} lots on hold — human QA approval gate preserved.
          </Typography>
        </CtV2InsetCard>
      </Stack>
    </CtV2WidgetShell>
  );
}

// ─── Receiving KPIs ─────────────────────────────────────────────────────────

function computeReceivingKpis() {
  const data = receivingControlTowerData;
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
    dockTotal: data.docks.length,
    stagingTotal: data.staging_lanes.length,
  };
}

export function CtV2ReceivingKpisWidget() {
  const rk = useMemo(() => computeReceivingKpis(), []);
  const kpis = [
    { label: 'Trucks scheduled', value: rk.scheduledToday, tone: 'ok' as CtTone },
    { label: 'In transit / arrived', value: rk.inTransit, tone: 'warn' as CtTone },
    { label: 'Unloading now', value: rk.unloading, tone: 'ok' as CtTone },
    { label: 'Open exceptions', value: rk.openExceptions, tone: 'danger' as CtTone },
    { label: 'Docks available', value: `${rk.docksAvailable}/${rk.dockTotal}`, tone: 'ok' as CtTone },
    { label: 'Staging lanes open', value: `${rk.stagingOpen}/${rk.stagingTotal}`, tone: 'warn' as CtTone },
  ];

  return (
    <CtV2WidgetShell title="Receiving KPIs" subtitle="IN01 · dock & staging">
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
        {kpis.map((item) => (
          <CtV2InsetCard key={item.label}>
            <Typography sx={{ ...ctV2Type.caption, color: tokenText.secondary }}>{item.label}</Typography>
            <Typography sx={{ fontSize: 22, fontWeight: 800, color: toneColorV2(item.tone) }}>{item.value}</Typography>
          </CtV2InsetCard>
        ))}
      </Box>
    </CtV2WidgetShell>
  );
}

// ─── Truck Schedule ─────────────────────────────────────────────────────────

export function CtV2TruckScheduleWidget() {
  const trucks = [...receivingControlTowerData.truck_schedules]
    .sort((a, b) => a.priority_rank - b.priority_rank)
    .slice(0, 6);

  return (
    <CtV2WidgetShell title="Truck Schedule" subtitle="Priority inbound appointments">
      <Table size="small" sx={{ '& td, & th': { borderColor: 'divider', py: 0.75 } }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ ...ctV2Type.caption, fontWeight: 800 }}>#</TableCell>
            <TableCell sx={{ ...ctV2Type.caption, fontWeight: 800 }}>Truck</TableCell>
            <TableCell sx={{ ...ctV2Type.caption, fontWeight: 800 }}>Status</TableCell>
            <TableCell sx={{ ...ctV2Type.caption, fontWeight: 800 }}>Progress</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {trucks.map((t) => (
            <TableRow key={t.truck_schedule_id}>
              <TableCell>
                <Chip
                  size="small"
                  label={t.priority_rank}
                  sx={{
                    height: 22,
                    minWidth: 26,
                    fontWeight: 800,
                    fontSize: 11,
                    bgcolor: t.priority_rank === 1 ? tokenError.softBg : tokenWarning.softBg,
                    color: t.priority_rank === 1 ? tokenError.main : tokenWarning.main,
                  }}
                />
              </TableCell>
              <TableCell sx={{ ...ctV2Type.caption, fontWeight: 700 }}>{t.trailer_id}</TableCell>
              <TableCell sx={{ ...ctV2Type.caption, textTransform: 'capitalize' }}>{t.status.replace(/_/g, ' ')}</TableCell>
              <TableCell sx={{ minWidth: 80 }}>
                <LinearProgress
                  variant="determinate"
                  value={t.unload_progress_pct ?? 0}
                  sx={{ height: 6, borderRadius: 999, bgcolor: 'action.hover' }}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CtV2WidgetShell>
  );
}

// ─── Dock Status ────────────────────────────────────────────────────────────

export function CtV2DockStatusWidget() {
  return (
    <CtV2WidgetShell title="Dock Assignment" subtitle="RM docks & import port">
      <Stack spacing={1}>
        {receivingControlTowerData.docks.map((d) => {
          const tone: CtTone =
            d.current_status === 'blocked' ? 'danger' : d.current_status === 'unloading' ? 'warn' : 'ok';
          return (
            <CtV2InsetCard key={d.dock_id}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography sx={{ ...ctV2Type.body, fontWeight: 800 }}>{d.dock_name}</Typography>
                  <Typography sx={{ ...ctV2Type.caption, color: tokenText.secondary, textTransform: 'capitalize' }}>
                    {d.current_status.replace(/_/g, ' ')} · {d.responsible_team}
                  </Typography>
                </Box>
                <Chip
                  size="small"
                  label={d.availability_status}
                  sx={{
                    fontWeight: 800,
                    fontSize: 10,
                    bgcolor: toneSoftBgV2(tone),
                    color: toneColorV2(tone),
                  }}
                />
              </Stack>
              {d.blocked_reason ? (
                <Typography sx={{ ...ctV2Type.caption, color: tokenError.main, mt: 0.5 }}>{d.blocked_reason}</Typography>
              ) : null}
            </CtV2InsetCard>
          );
        })}
      </Stack>
    </CtV2WidgetShell>
  );
}

// ─── Outbound KPIs ──────────────────────────────────────────────────────────

export function CtV2OutboundKpisWidget() {
  const outboundKpis = cockpitKpis.filter((x) => ['OB01', 'OB02', 'OB03'].includes(x.macroflow));
  const [selected, setSelected] = useState<CockpitKpi | null>(null);

  return (
    <>
      <CtV2WidgetShell title="Outbound KPIs" subtitle="OB01 · OB02 · OB03">
        <Stack spacing={1}>
          {outboundKpis.map((kpi) => (
            <CtV2InsetCard key={kpi.id} onClick={() => setSelected(kpi)}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <StatusBarV2 tone={kpi.tone} height={32} />
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ ...ctV2Type.caption, color: tokenText.secondary }}>
                    {kpi.macroflow} · {kpi.label}
                  </Typography>
                  <Typography sx={{ fontSize: 20, fontWeight: 800, color: tokenText.primary }}>
                    {kpi.value} {kpi.unit}
                  </Typography>
                </Box>
                <SparklineV2 values={kpi.sparkline} tone={kpi.tone} height={28} />
              </Stack>
            </CtV2InsetCard>
          ))}
        </Stack>
      </CtV2WidgetShell>
      <KpiDrilldownModal open={Boolean(selected)} kpi={selected} onClose={() => setSelected(null)} />
    </>
  );
}

// ─── Outbound Units ─────────────────────────────────────────────────────────

export function CtV2OutboundUnitsWidget() {
  const go = useGoScreen();

  const units = useMemo(() => {
    const steril = logisticsData.sterilization_loads.map((l) => {
      const tone: CtTone = l.sla_risk === 'late' ? 'danger' : l.sla_risk === 'at_risk' ? 'warn' : 'ok';
      return {
        id: l.sterilization_load_id,
        title: l.sterilization_load_id,
        subtitle: `${l.state.replace(/_/g, ' ')} · ${l.pallets_count} pallets`,
        tone,
        screen: 'sterilization_tracker' as AppScreen,
      };
    });
    const ships = logisticsData.outbound_shipments.slice(0, 3).map((s) => {
      const tone: CtTone = s.readiness_pct < 60 ? 'danger' : s.readiness_pct < 90 ? 'warn' : 'ok';
      return {
        id: s.outbound_shipment_id,
        title: s.sales_order_id,
        subtitle: `${s.readiness_pct}% ready · ${s.priority_tier}`,
        tone,
        screen: 'shipment_readiness' as AppScreen,
      };
    });
    return [...steril, ...ships];
  }, []);

  return (
    <CtV2WidgetShell title="Outbound Units" subtitle="Steril loads & shipments at risk">
      <Stack spacing={1}>
        {units.map((u) => (
          <CtV2InsetCard key={u.id} onClick={() => go(u.screen)}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <StatusBarV2 tone={u.tone} height={28} />
              <Box>
                <Typography sx={{ ...ctV2Type.body, fontWeight: 800 }}>{u.title}</Typography>
                <Typography sx={{ ...ctV2Type.caption, color: tokenText.secondary }}>{u.subtitle}</Typography>
              </Box>
            </Stack>
          </CtV2InsetCard>
        ))}
      </Stack>
    </CtV2WidgetShell>
  );
}

export const CT_V2_DASHBOARD_WIDGET_IDS = [
  'global_alert',
  'executive_kpis',
  'macroflow_status',
  'area_towers',
  'exception_pulse',
  'ai_site_summary',
  'journey_heatmap',
  'critical_materials',
  'leadership_kpis',
  'wip_lanes',
  'related_shortcuts',
  'receiving_kpis',
  'truck_schedule',
  'dock_status',
  'outbound_kpis',
  'outbound_units',
] as const;

export type CtV2DashboardWidgetId = (typeof CT_V2_DASHBOARD_WIDGET_IDS)[number];

export const CT_V2_DASHBOARD_WIDGET_TITLES: Record<CtV2DashboardWidgetId, string> = {
  global_alert: 'Site Alert',
  executive_kpis: 'Executive KPIs',
  macroflow_status: 'Macroflow Status',
  area_towers: 'Area Towers',
  exception_pulse: 'Exception Pulse',
  ai_site_summary: 'ATLAS Site Summary',
  journey_heatmap: 'Journey Heatmap',
  critical_materials: 'Critical Materials',
  leadership_kpis: 'Leadership KPIs',
  wip_lanes: 'WIP Lanes',
  related_shortcuts: 'Related Apps',
  receiving_kpis: 'Receiving KPIs',
  truck_schedule: 'Truck Schedule',
  dock_status: 'Dock Status',
  outbound_kpis: 'Outbound KPIs',
  outbound_units: 'Outbound Units',
};

export function renderCtV2DashboardWidget(id: CtV2DashboardWidgetId): React.ReactNode {
  switch (id) {
    case 'global_alert':
      return <CtV2GlobalAlertWidget />;
    case 'executive_kpis':
      return <CtV2ExecutiveKpisWidget />;
    case 'macroflow_status':
      return <CtV2MacroflowStatusWidget />;
    case 'area_towers':
      return <CtV2AreaTowersWidget />;
    case 'exception_pulse':
      return <CtV2ExceptionPulseWidget />;
    case 'ai_site_summary':
      return <CtV2AiSiteSummaryWidget />;
    case 'journey_heatmap':
      return <CtV2JourneyHeatmapWidget />;
    case 'critical_materials':
      return <CtV2CriticalMaterialsWidget />;
    case 'leadership_kpis':
      return <CtV2LeadershipKpisWidget />;
    case 'wip_lanes':
      return <CtV2WipLanesWidget />;
    case 'related_shortcuts':
      return <CtV2RelatedShortcutsWidget />;
    case 'receiving_kpis':
      return <CtV2ReceivingKpisWidget />;
    case 'truck_schedule':
      return <CtV2TruckScheduleWidget />;
    case 'dock_status':
      return <CtV2DockStatusWidget />;
    case 'outbound_kpis':
      return <CtV2OutboundKpisWidget />;
    case 'outbound_units':
      return <CtV2OutboundUnitsWidget />;
    default:
      return null;
  }
}
