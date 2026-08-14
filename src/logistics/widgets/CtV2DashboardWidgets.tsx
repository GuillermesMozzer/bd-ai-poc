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
  areaTowers,
  logisticsData,
  type CockpitKpi,
  type MacroflowId,
} from '../cockpit/macroflowModel';
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
import { CtV2AdaptiveGrid, CT_V2_GRID_PRESETS, useAdaptiveGrid } from '../ctV2/CtV2AdaptiveGrid';
import { useCtV2ScaledCockpit } from '../ctV2/useCtV2ScaledCockpit';
import { simulateDocks, simulateTrucks } from '../ctV2/ctV2SiteSimulation';

function useGoScreen() {
  const { setCurrentScreen } = useWorkstationContext();
  return (screen: AppScreen) => setCurrentScreen(screen);
}

// ─── Global Alert ───────────────────────────────────────────────────────────

export function CtV2GlobalAlertWidget() {
  const { alert, sitesLabel, periodLabel } = useCtV2ScaledCockpit();
  return (
    <CtV2WidgetShell title="Site Alert" subtitle={`${sitesLabel} · ${periodLabel}`}>
      <Box
        sx={{
          p: 1.5,
          borderRadius: 2,
          bgcolor: toneSoftBgV2(alert.tone),
          border: `1px solid ${toneColorV2(alert.tone)}44`,
        }}
      >
        <Typography sx={{ ...ctV2Type.caption, color: tokenError.main, fontWeight: 800, textTransform: 'uppercase' }}>
          {alert.title}
        </Typography>
        <Typography sx={{ ...ctV2Type.body, color: tokenText.primary, mt: 0.75, lineHeight: 1.45 }}>
          {alert.message}
        </Typography>
      </Box>
    </CtV2WidgetShell>
  );
}

// ─── Executive KPIs ─────────────────────────────────────────────────────────

function ExecutiveKpiCard({
  kpi,
  onOpen,
}: {
  kpi: CockpitKpi;
  onOpen: () => void;
}) {
  const { comfortable, compact } = useAdaptiveGrid();
  return (
    <CtV2InsetCard onClick={onOpen}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Typography
          sx={{
            ...ctV2Type.caption,
            color: tokenText.secondary,
            textTransform: 'uppercase',
            fontSize: compact ? 9 : 11,
          }}
        >
          {kpi.macroflow} · {kpi.label}
        </Typography>
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onOpen();
          }}
          sx={{ p: 0.25, color: tokenText.secondary }}
          aria-label={`Drill down ${kpi.label}`}
        >
          <OpenInFullIcon sx={{ fontSize: 14 }} />
        </IconButton>
      </Stack>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.75 }}>
        <StatusBarV2 tone={kpi.tone} height={compact ? 28 : 36} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" alignItems="baseline" spacing={0.5}>
            <Typography sx={{ fontSize: compact ? 20 : 24, fontWeight: 800, color: tokenText.primary, lineHeight: 1 }}>
              {kpi.value}
            </Typography>
            {kpi.unit ? (
              <Typography sx={{ ...ctV2Type.caption, color: tokenText.secondary }}>{kpi.unit}</Typography>
            ) : null}
          </Stack>
          {!compact ? (
            <Typography sx={{ ...ctV2Type.caption, color: tokenText.secondary }}>{kpi.target}</Typography>
          ) : null}
          <Typography sx={{ ...ctV2Type.caption, color: toneColorV2(kpi.tone), fontWeight: 700 }}>
            {kpi.delta}
          </Typography>
        </Box>
        {comfortable ? (
          <Box sx={{ width: 72, flexShrink: 0 }}>
            <SparklineV2 values={kpi.sparkline} tone={kpi.tone} height={32} />
          </Box>
        ) : null}
      </Stack>
    </CtV2InsetCard>
  );
}

export function CtV2ExecutiveKpisWidget() {
  const { kpis, sitesLabel, periodLabel } = useCtV2ScaledCockpit();
  const [selected, setSelected] = useState<CockpitKpi | null>(null);
  const items = kpis.slice(0, 6);

  return (
    <>
      <CtV2WidgetShell title="Executive KPIs" subtitle={`${sitesLabel} · ${periodLabel} · IN01–OB03`}>
        <CtV2AdaptiveGrid
          itemCount={items.length}
          minItemWidth={CT_V2_GRID_PRESETS.kpiStrip.minItemWidth}
          maxCols={CT_V2_GRID_PRESETS.kpiStrip.maxCols}
          gap={1}
        >
          {items.map((kpi) => (
            <ExecutiveKpiCard key={kpi.id} kpi={kpi} onOpen={() => setSelected(kpi)} />
          ))}
        </CtV2AdaptiveGrid>
      </CtV2WidgetShell>
      <KpiDrilldownModal open={Boolean(selected)} kpi={selected} onClose={() => setSelected(null)} />
    </>
  );
}

// ─── Macroflow Status ───────────────────────────────────────────────────────

export function CtV2MacroflowStatusWidget() {
  const { goToArea } = useCtV2Nav();
  const { macros, kpis, sitesLabel, periodLabel } = useCtV2ScaledCockpit();
  const [selected, setSelected] = useState<CockpitKpi | null>(null);

  const kpiByMacro = useMemo(() => {
    const map = new Map<MacroflowId, CockpitKpi>();
    kpis.forEach((kpi) => {
      if (!map.has(kpi.macroflow)) map.set(kpi.macroflow, kpi);
    });
    return map;
  }, [kpis]);

  const openArea = (areaId: string) => {
    goToArea(areaIdFromMacroflowArea(areaId));
  };

  return (
    <>
      <CtV2WidgetShell title="Macroflow Status" subtitle={`${sitesLabel} · ${periodLabel}`}>
        <CtV2AdaptiveGrid
          itemCount={macros.length}
          minItemWidth={CT_V2_GRID_PRESETS.cards.minItemWidth}
          maxCols={Math.min(3, macros.length)}
          gap={1}
        >
          {macros.map((m) => (
            <MacroflowCard
              key={m.id}
              m={m}
              onOpenArea={() => openArea(m.area)}
              onMaximize={() => setSelected(kpiByMacro.get(m.id) ?? kpis[0])}
            />
          ))}
        </CtV2AdaptiveGrid>
      </CtV2WidgetShell>
      <KpiDrilldownModal open={Boolean(selected)} kpi={selected} onClose={() => setSelected(null)} />
    </>
  );
}

function MacroflowCard({
  m,
  onOpenArea,
  onMaximize,
}: {
  m: (ReturnType<typeof useCtV2ScaledCockpit>)['macros'][number];
  onOpenArea: () => void;
  onMaximize: () => void;
}) {
  const { comfortable, compact } = useAdaptiveGrid();
  return (
    <CtV2InsetCard>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ ...ctV2Type.sectionTitle, color: tokenText.primary, fontSize: compact ? '0.82rem' : undefined }}>
            {m.label}
          </Typography>
          <Typography sx={{ ...ctV2Type.caption, color: tokenText.secondary }}>
            {m.processLabel} · {m.steps}
          </Typography>
        </Box>
        <Button
          size="small"
          onClick={onOpenArea}
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
          {compact ? 'Area' : 'Go to area view'}
        </Button>
      </Stack>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: comfortable ? '1fr 1fr' : '1fr',
          gap: 1,
          mt: 1.25,
        }}
      >
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
        {comfortable ? (
          <Box sx={{ width: 88 }}>
            <SparklineV2 values={m.sparkline} tone={m.tone} height={28} />
          </Box>
        ) : null}
        <IconButton size="small" onClick={onMaximize} sx={{ color: tokenText.secondary, p: 0.25 }}>
          <OpenInFullIcon sx={{ fontSize: 14 }} />
        </IconButton>
      </Stack>
    </CtV2InsetCard>
  );
}

// ─── Area Towers ────────────────────────────────────────────────────────────

export function CtV2AreaTowersWidget() {
  const { goToArea } = useCtV2Nav();
  const { sitesLabel, periodLabel } = useCtV2ScaledCockpit();

  const openArea = (areaId: string) => {
    goToArea(areaIdFromMacroflowArea(areaId));
  };

  return (
    <CtV2WidgetShell title="Area Towers" subtitle={`${sitesLabel} · ${periodLabel}`}>
      <CtV2AdaptiveGrid itemCount={areaTowers.length} preset="boards" gap={1}>
        {areaTowers.map((area) => (
          <CtV2InsetCard key={area.id} onClick={() => openArea(area.id)} sx={{ minWidth: 0, height: '100%' }}>
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
                  flexShrink: 0,
                }}
              />
            </Stack>
          </CtV2InsetCard>
        ))}
      </CtV2AdaptiveGrid>
    </CtV2WidgetShell>
  );
}

// ─── Exception Pulse ────────────────────────────────────────────────────────

export function CtV2ExceptionPulseWidget() {
  const { exceptions, sitesLabel, periodLabel } = useCtV2ScaledCockpit();
  const items = exceptions.slice(0, 5);
  return (
    <CtV2WidgetShell title="Exception Pulse" subtitle={`${sitesLabel} · ${periodLabel}`}>
      <CtV2AdaptiveGrid itemCount={items.length} preset="boards" gap={1}>
        {items.map((e) => {
          const tone: CtTone = e.severity === 'critical' ? 'danger' : 'warn';
          return (
            <Box
              key={e.exception_id}
              sx={{
                pl: 1.25,
                borderLeft: `3px solid ${toneColorV2(tone)}`,
                py: 0.5,
                minWidth: 0,
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
      </CtV2AdaptiveGrid>
    </CtV2WidgetShell>
  );
}

// ─── AI Site Summary ────────────────────────────────────────────────────────

export function CtV2AiSiteSummaryWidget() {
  const { summary, sitesLabel, periodLabel } = useCtV2ScaledCockpit();
  return (
    <CtV2WidgetShell title="ATLAS Site Summary" subtitle={`${sitesLabel} · ${periodLabel}`}>
      <Box
        sx={{
          p: 1.5,
          borderRadius: 2,
          bgcolor: tokenBrand.softBg,
          border: `1px solid ${tokenBrand.light}`,
        }}
      >
        <Typography sx={{ ...ctV2Type.body, color: tokenText.primary, lineHeight: 1.55, fontWeight: 600 }}>
          {summary}
        </Typography>
      </Box>
    </CtV2WidgetShell>
  );
}

// ─── Journey Heatmap ────────────────────────────────────────────────────────

export function CtV2JourneyHeatmapWidget() {
  const { journey, sitesLabel, periodLabel } = useCtV2ScaledCockpit();
  return (
    <CtV2WidgetShell title="Journey Heatmap" subtitle={`${sitesLabel} · ${periodLabel}`}>
      <CtV2AdaptiveGrid
        itemCount={journey.length}
        minItemWidth={CT_V2_GRID_PRESETS.cards.minItemWidth}
        maxCols={Math.min(3, journey.length)}
        gap={1}
      >
        {journey.map((s) => {
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
      </CtV2AdaptiveGrid>
    </CtV2WidgetShell>
  );
}

// ─── Critical Materials ─────────────────────────────────────────────────────

export function CtV2CriticalMaterialsWidget() {
  const { materials, sitesLabel } = useCtV2ScaledCockpit();
  return (
    <CtV2WidgetShell title="Critical Materials" subtitle={`Lots impacting ${sitesLabel}`}>
      <CtV2AdaptiveGrid itemCount={materials.length} preset="boards" gap={1}>
        {materials.map((m) => (
          <CtV2InsetCard key={m.lot} sx={{ minWidth: 0, height: '100%' }}>
            <Typography sx={{ ...ctV2Type.body, fontWeight: 800 }}>
              {m.sku} · {m.lot}
            </Typography>
            <Typography sx={{ ...ctV2Type.caption, color: tokenText.secondary, mt: 0.35 }}>
              {m.step} · {m.aging_hours}h · {m.impact}
            </Typography>
          </CtV2InsetCard>
        ))}
      </CtV2AdaptiveGrid>
    </CtV2WidgetShell>
  );
}

// ─── Leadership KPIs ────────────────────────────────────────────────────────

export function CtV2LeadershipKpisWidget() {
  const { exec, sitesLabel, periodLabel } = useCtV2ScaledCockpit();
  const items = [
    { l: 'Quarantine aging', v: `${exec.quarantine_aging_avg_days}d` },
    { l: 'QA lead time', v: `${exec.qa_release_lead_time_hours}h` },
    { l: 'Loads at provider', v: String(exec.loads_at_provider) },
    { l: 'Pledge today', v: String(exec.pledge_due_today) },
    { l: 'Backorders', v: String(exec.open_backorders) },
    { l: 'Staging cap.', v: `${exec.receiving_capacity_pct}%` },
  ];

  return (
    <CtV2WidgetShell title="Leadership KPIs" subtitle={`${sitesLabel} · ${periodLabel}`}>
      <CtV2AdaptiveGrid
        itemCount={items.length}
        minItemWidth={CT_V2_GRID_PRESETS.metrics.minItemWidth}
        maxCols={CT_V2_GRID_PRESETS.metrics.maxCols}
        gap={1.25}
      >
        {items.map((x) => (
          <Box key={x.l}>
            <Typography sx={{ ...ctV2Type.caption, color: tokenText.secondary }}>{x.l}</Typography>
            <Typography sx={{ fontSize: 22, fontWeight: 800, color: tokenText.primary, fontFamily: workstationVisuals.fontFamily }}>
              {x.v}
            </Typography>
          </Box>
        ))}
      </CtV2AdaptiveGrid>
    </CtV2WidgetShell>
  );
}

// ─── WIP Lanes ──────────────────────────────────────────────────────────────

export function CtV2WipLanesWidget() {
  const { goToArea } = useCtV2Nav();
  const { wipLanes, sitesLabel, periodLabel } = useCtV2ScaledCockpit();

  return (
    <CtV2WidgetShell title="WIP Lane Lens" subtitle={`${sitesLabel} · ${periodLabel}`}>
      <CtV2AdaptiveGrid
        itemCount={wipLanes.length}
        minItemWidth={CT_V2_GRID_PRESETS.cards.minItemWidth}
        maxCols={Math.min(4, wipLanes.length)}
        gap={1}
      >
        {wipLanes.map((w) => {
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
      </CtV2AdaptiveGrid>
    </CtV2WidgetShell>
  );
}

// ─── Related Shortcuts ──────────────────────────────────────────────────────

export function CtV2RelatedShortcutsWidget() {
  const go = useGoScreen();
  const { exec } = useCtV2ScaledCockpit();

  return (
    <CtV2WidgetShell title="Related Apps" subtitle="Quick navigation">
      <CtV2AdaptiveGrid itemCount={2} minItemWidth={CT_V2_GRID_PRESETS.pair.minItemWidth} maxCols={2} gap={1}>
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
            {exec.qa_hold_count} lots on hold — human QA approval gate preserved.
          </Typography>
        </CtV2InsetCard>
      </CtV2AdaptiveGrid>
    </CtV2WidgetShell>
  );
}

// ─── Receiving KPIs ─────────────────────────────────────────────────────────

export function CtV2ReceivingKpisWidget() {
  const { scaleCount, sitesLabel, periodLabel, sites } = useCtV2ScaledCockpit();
  const trucks = useMemo(() => simulateTrucks(sites), [sites]);
  const docks = useMemo(() => simulateDocks(sites), [sites]);
  const rk = useMemo(() => ({
    scheduledToday: trucks.length,
    inTransit: trucks.filter((t) => t.status === 'expected' || t.status === 'arrived').length,
    unloading: trucks.filter((t) => t.status === 'unloading').length,
    openExceptions: trucks.filter((t) => t.status === 'arrived').length,
    docksAvailable: docks.filter((d) => d.current_status === 'idle').length,
    dockTotal: docks.length || 1,
    stagingOpen: Math.max(1, Math.round(docks.length * 0.6)),
    stagingTotal: Math.max(2, docks.length),
  }), [trucks, docks]);
  const kpis = [
    { label: 'Trucks scheduled', value: scaleCount(rk.scheduledToday), tone: 'ok' as CtTone },
    { label: 'In transit / arrived', value: scaleCount(rk.inTransit), tone: 'warn' as CtTone },
    { label: 'Unloading now', value: Math.max(1, scaleCount(rk.unloading)), tone: 'ok' as CtTone },
    { label: 'Open exceptions', value: scaleCount(rk.openExceptions), tone: 'danger' as CtTone },
    { label: 'Docks available', value: `${rk.docksAvailable}/${rk.dockTotal}`, tone: 'ok' as CtTone },
    { label: 'Staging lanes open', value: `${rk.stagingOpen}/${rk.stagingTotal}`, tone: 'warn' as CtTone },
  ];

  return (
    <CtV2WidgetShell title="Receiving KPIs" subtitle={`${sitesLabel} · ${periodLabel}`}>
      <CtV2AdaptiveGrid
        itemCount={kpis.length}
        minItemWidth={CT_V2_GRID_PRESETS.kpiStrip.minItemWidth}
        maxCols={CT_V2_GRID_PRESETS.kpiStrip.maxCols}
        gap={1}
      >
        {kpis.map((item) => (
          <CtV2InsetCard key={item.label}>
            <Typography sx={{ ...ctV2Type.caption, color: tokenText.secondary }}>{item.label}</Typography>
            <Typography sx={{ fontSize: 22, fontWeight: 800, color: toneColorV2(item.tone) }}>{item.value}</Typography>
          </CtV2InsetCard>
        ))}
      </CtV2AdaptiveGrid>
    </CtV2WidgetShell>
  );
}

// ─── Truck Schedule ─────────────────────────────────────────────────────────

export function CtV2TruckScheduleWidget() {
  const { sitesLabel, periodLabel, sites } = useCtV2ScaledCockpit();
  const trucks = useMemo(
    () => simulateTrucks(sites).slice(0, 8),
    [sites],
  );

  return (
    <CtV2WidgetShell title="Truck Schedule" subtitle={`${sitesLabel} · ${periodLabel}`}>
      <Table size="small" sx={{ '& td, & th': { borderColor: 'divider', py: 0.75 } }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ ...ctV2Type.caption, fontWeight: 800 }}>#</TableCell>
            <TableCell sx={{ ...ctV2Type.caption, fontWeight: 800 }}>Truck</TableCell>
            <TableCell sx={{ ...ctV2Type.caption, fontWeight: 800 }}>Plant</TableCell>
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
              <TableCell sx={{ ...ctV2Type.caption }}>{t.plantName}</TableCell>
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
  const { sitesLabel, sites } = useCtV2ScaledCockpit();
  const docks = useMemo(() => simulateDocks(sites), [sites]);
  return (
    <CtV2WidgetShell title="Dock Assignment" subtitle={`${sitesLabel} · RM docks & import`}>
      <CtV2AdaptiveGrid itemCount={docks.length} preset="boards" gap={1}>
        {docks.map((d) => {
          const tone: CtTone =
            d.current_status === 'blocked' ? 'danger' : d.current_status === 'unloading' ? 'warn' : 'ok';
          return (
            <CtV2InsetCard key={d.dock_id} sx={{ minWidth: 0, height: '100%' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ ...ctV2Type.body, fontWeight: 800 }}>{d.dock_name}</Typography>
                  <Typography sx={{ ...ctV2Type.caption, color: tokenText.secondary, textTransform: 'capitalize' }}>
                    {d.current_status.replace(/_/g, ' ')} · {d.plantName}
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
                    flexShrink: 0,
                  }}
                />
              </Stack>
              {d.blocked_reason ? (
                <Typography sx={{ ...ctV2Type.caption, color: tokenError.main, mt: 0.5 }}>{d.blocked_reason}</Typography>
              ) : null}
            </CtV2InsetCard>
          );
        })}
      </CtV2AdaptiveGrid>
    </CtV2WidgetShell>
  );
}

// ─── Outbound KPIs ──────────────────────────────────────────────────────────

export function CtV2OutboundKpisWidget() {
  const { kpis, sitesLabel, periodLabel } = useCtV2ScaledCockpit();
  const outboundKpis = kpis.filter((x) => ['OB01', 'OB02', 'OB03'].includes(x.macroflow));
  const [selected, setSelected] = useState<CockpitKpi | null>(null);

  return (
    <>
      <CtV2WidgetShell title="Outbound KPIs" subtitle={`${sitesLabel} · ${periodLabel}`}>
        <CtV2AdaptiveGrid itemCount={outboundKpis.length} preset="kpiStrip" maxCols={3} gap={1}>
          {outboundKpis.map((kpi) => (
            <CtV2InsetCard key={kpi.id} onClick={() => setSelected(kpi)} sx={{ minWidth: 0, height: '100%' }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <StatusBarV2 tone={kpi.tone} height={32} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ ...ctV2Type.caption, color: tokenText.secondary }} noWrap>
                    {kpi.macroflow} · {kpi.label}
                  </Typography>
                  <Typography sx={{ fontSize: 20, fontWeight: 800, color: tokenText.primary }}>
                    {kpi.value} {kpi.unit}
                  </Typography>
                </Box>
                <Box sx={{ width: 72, flexShrink: 0 }}>
                  <SparklineV2 values={kpi.sparkline} tone={kpi.tone} height={28} />
                </Box>
              </Stack>
            </CtV2InsetCard>
          ))}
        </CtV2AdaptiveGrid>
      </CtV2WidgetShell>
      <KpiDrilldownModal open={Boolean(selected)} kpi={selected} onClose={() => setSelected(null)} />
    </>
  );
}

// ─── Outbound Units ─────────────────────────────────────────────────────────

export function CtV2OutboundUnitsWidget() {
  const go = useGoScreen();
  const { sterilLoads, shipments, sitesLabel, periodLabel } = useCtV2ScaledCockpit();

  const units = useMemo(() => {
    const steril = sterilLoads.map((l) => {
      const tone: CtTone = l.sla_risk === 'late' ? 'danger' : l.sla_risk === 'at_risk' ? 'warn' : 'ok';
      return {
        id: l.sterilization_load_id,
        title: l.sterilization_load_id,
        subtitle: `${l.state.replace(/_/g, ' ')} · ${l.pallets_count} pallets`,
        tone,
        screen: 'sterilization_tracker' as AppScreen,
      };
    });
    const ships = shipments.slice(0, 3).map((s) => {
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
  }, [sterilLoads, shipments]);

  return (
    <CtV2WidgetShell title="Outbound Units" subtitle={`${sitesLabel} · ${periodLabel}`}>
      <CtV2AdaptiveGrid itemCount={units.length} preset="cards" gap={1}>
        {units.map((u) => (
          <CtV2InsetCard key={u.id} onClick={() => go(u.screen)} sx={{ minWidth: 0, height: '100%' }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <StatusBarV2 tone={u.tone} height={28} />
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ ...ctV2Type.body, fontWeight: 800 }} noWrap>
                  {u.title}
                </Typography>
                <Typography sx={{ ...ctV2Type.caption, color: tokenText.secondary }}>{u.subtitle}</Typography>
              </Box>
            </Stack>
          </CtV2InsetCard>
        ))}
      </CtV2AdaptiveGrid>
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
