import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  FormControl,
  IconButton,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { useWorkstationContext } from '../../workstation/contexts/WorkstationContext';
import type { AppScreen } from '../../navigation/navigationConfig';
import { BigKpiCard, MacroflowCard } from '../cockpit/CockpitCards';
import { CockpitCard, Sparkline, StatusBar } from '../cockpit/Sparkline';
import { ct, toneColor } from '../cockpit/cockpitTheme';
import KpiDrilldownModal from '../cockpit/KpiDrilldownModal';
import {
  aiSiteSummary,
  areaTowers,
  cockpitKpis,
  globalAlert,
  logisticsData,
  macroflows,
  SITE_LABEL,
  type CockpitKpi,
  type MacroflowId,
} from '../cockpit/macroflowModel';
import { fmtTime, humanize } from '../utils';
import ReceivingControlTowerPage from './ReceivingControlTowerPage';

const CAROUSEL_MS = 12000;
const k = logisticsData.executive_kpis;

function nowLabel() {
  return new Date().toLocaleString('en-US', {
    weekday: 'short',
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function LogisticsControlTowerPage() {
  const { setCurrentScreen } = useWorkstationContext();
  const [page, setPage] = useState(0);
  const [carouselOn, setCarouselOn] = useState(true);
  const [clock, setClock] = useState(nowLabel);
  const [horizon, setHorizon] = useState('shift');
  const [selectedKpi, setSelectedKpi] = useState<CockpitKpi | null>(null);
  const [layer, setLayer] = useState<'cockpit' | 'receiving'>('cockpit');

  useEffect(() => {
    const t = window.setInterval(() => setClock(nowLabel()), 30000);
    return () => window.clearInterval(t);
  }, []);

  useEffect(() => {
    if (!carouselOn || layer !== 'cockpit') return undefined;
    const t = window.setInterval(() => setPage((p) => (p + 1) % 3), CAROUSEL_MS);
    return () => window.clearInterval(t);
  }, [carouselOn, layer]);

  const go = (screen: AppScreen) => setCurrentScreen(screen);

  const openArea = (areaId: (typeof areaTowers)[number]['id']) => {
    const area = areaTowers.find((a) => a.id === areaId);
    if (!area) return;
    if (area.embedded || areaId === 'receiving') {
      setLayer('receiving');
      return;
    }
    go(area.screen);
  };

  const kpiByMacro = useMemo(() => {
    const map = new Map<MacroflowId, CockpitKpi>();
    cockpitKpis.forEach((kpi) => {
      if (!map.has(kpi.macroflow)) map.set(kpi.macroflow, kpi);
    });
    return map;
  }, []);

  const openMacroKpi = (id: MacroflowId) => {
    const hit = kpiByMacro.get(id) ?? cockpitKpis[0];
    setSelectedKpi(hit);
  };

  if (layer === 'receiving') {
    return <ReceivingControlTowerPage onBackToCockpit={() => setLayer('cockpit')} />;
  }

  return (
    <Box
      sx={{
        flexGrow: 1,
        height: '100%',
        maxHeight: '100%',
        overflow: 'hidden',
        bgcolor: ct.bg,
        color: ct.text,
        fontFamily: ct.font,
        display: 'flex',
        flexDirection: 'column',
        p: { xs: 1, md: 1.5 },
        gap: 1,
      }}
    >
      {/* Header */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        spacing={1.5}
        sx={{ flexShrink: 0, minHeight: 48 }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              fontWeight: 900,
              letterSpacing: '0.12em',
              fontSize: 14,
              color: ct.accent,
              whiteSpace: 'nowrap',
            }}
          >
            BD LOGISTICS CT
          </Typography>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={SITE_LABEL}
              sx={{
                color: ct.text,
                fontSize: 13,
                fontWeight: 700,
                '.MuiOutlinedInput-notchedOutline': { borderColor: ct.borderStrong },
                '.MuiSvgIcon-root': { color: ct.textMuted },
                height: 32,
              }}
            >
              <MenuItem value={SITE_LABEL}>{SITE_LABEL}</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 100 }}>
            <Select
              value={horizon}
              onChange={(e) => setHorizon(e.target.value)}
              sx={{
                color: ct.textMuted,
                fontSize: 12,
                '.MuiOutlinedInput-notchedOutline': { borderColor: ct.border },
                '.MuiSvgIcon-root': { color: ct.textMuted },
                height: 32,
              }}
            >
              <MenuItem value="hourly">Hourly</MenuItem>
              <MenuItem value="shift">Shift</MenuItem>
              <MenuItem value="daily">Daily</MenuItem>
              <MenuItem value="weekly">Weekly</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        <Box
          sx={{
            flex: 1,
            mx: 1,
            px: 1.5,
            py: 0.7,
            borderRadius: 1,
            bgcolor: ct.bannerBg,
            border: `1px solid ${toneColor(globalAlert.tone)}44`,
            display: { xs: 'none', md: 'flex' },
            alignItems: 'center',
            gap: 1,
            minWidth: 0,
          }}
        >
          <Typography sx={{ fontSize: 11, fontWeight: 800, color: ct.danger, whiteSpace: 'nowrap' }}>
            {globalAlert.title.toUpperCase()}
          </Typography>
          <Typography
            sx={{
              fontSize: 12,
              color: ct.text,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {globalAlert.message}
          </Typography>
        </Box>

        <Stack direction="row" alignItems="center" spacing={1} sx={{ flexShrink: 0 }}>
          <Typography sx={{ fontSize: 11, color: ct.textDim, display: { xs: 'none', sm: 'block' } }}>
            As of {fmtTime(logisticsData.as_of)}
          </Typography>
          <Typography sx={{ fontSize: 12, fontWeight: 600, color: ct.textMuted, fontFamily: ct.mono }}>
            {clock}
          </Typography>
        </Stack>
      </Stack>

      {/* Body pages */}
      <Box sx={{ flex: 1, minHeight: 0, position: 'relative' }}>
        {page === 0 ? (
          <Box
            sx={{
              height: '100%',
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: '0.9fr 1.35fr 0.95fr' },
              gridTemplateRows: { xs: 'auto', lg: '1fr' },
              gap: 1.2,
            }}
          >
            {/* Left — flow KPIs */}
            <Stack spacing={1} sx={{ minHeight: 0, overflow: 'hidden' }}>
              <Typography sx={{ fontSize: 11, fontWeight: 800, color: ct.textMuted, letterSpacing: '0.08em' }}>
                EXECUTIVE COCKPIT · MACROFLOW KPIs
              </Typography>
              <Box
                sx={{
                  flex: 1,
                  minHeight: 0,
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gridTemplateRows: 'repeat(3, minmax(0, 1fr))',
                  gap: 1,
                }}
              >
                {cockpitKpis.slice(0, 6).map((kpi) => (
                  <BigKpiCard
                    key={kpi.id}
                    label={`${kpi.macroflow} · ${kpi.label}`}
                    value={kpi.value}
                    unit={kpi.unit}
                    target={kpi.target}
                    delta={kpi.delta}
                    tone={kpi.tone}
                    sparkline={kpi.sparkline}
                    onOpen={() => setSelectedKpi(kpi)}
                  />
                ))}
              </Box>
            </Stack>

            {/* Center — macroflow health / area entry */}
            <Stack spacing={1} sx={{ minHeight: 0, overflow: 'hidden' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography sx={{ fontSize: 11, fontWeight: 800, color: ct.textMuted, letterSpacing: '0.08em' }}>
                  MACROFLOW STATUS · IN01 · IN02 · WIP · OB01 · OB02 · OB03
                </Typography>
              </Stack>
              <Box
                sx={{
                  flex: 1,
                  minHeight: 0,
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gridTemplateRows: 'repeat(3, minmax(0, 1fr))',
                  gap: 1,
                }}
              >
                {macroflows.map((m) => (
                  <MacroflowCard
                    key={m.id}
                    title={m.label}
                    processLabel={`${m.processLabel} · ${m.steps}`}
                    healthscore={m.healthscore}
                    utilization={m.utilization}
                    secondaryLabel={m.secondaryLabel}
                    secondaryValue={m.secondaryValue}
                    tone={m.tone}
                    sparkline={m.sparkline}
                    onGoToArea={() => openArea(m.area)}
                    onMaximize={() => openMacroKpi(m.id)}
                  />
                ))}
              </Box>
            </Stack>

            {/* Right — risk + AI + area launches */}
            <Stack spacing={1} sx={{ minHeight: 0, overflow: 'hidden' }}>
              <Typography sx={{ fontSize: 11, fontWeight: 800, color: ct.textMuted, letterSpacing: '0.08em' }}>
                AREA TOWERS · RISK & AI
              </Typography>
              <Stack spacing={1} sx={{ flex: 1, minHeight: 0 }}>
                {areaTowers.map((area) => (
                  <CockpitCard key={area.id} onClick={() => openArea(area.id)} sx={{ py: 1.2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography sx={{ fontSize: 13, fontWeight: 800 }}>{area.title}</Typography>
                        <Typography sx={{ fontSize: 11, color: ct.textDim }}>{area.subtitle}</Typography>
                      </Box>
                      <Typography sx={{ fontSize: 10, fontWeight: 800, color: toneColor(area.tone) }}>
                        {area.macroflows.join(' · ')}
                      </Typography>
                    </Stack>
                  </CockpitCard>
                ))}

                <CockpitCard sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
                  <Typography sx={{ fontSize: 11, fontWeight: 800, color: ct.textMuted, mb: 0.8 }}>
                    EXCEPTION PULSE
                  </Typography>
                  <Stack spacing={0.8} sx={{ maxHeight: '100%', overflow: 'hidden' }}>
                    {logisticsData.exceptions.slice(0, 3).map((e) => (
                      <Box
                        key={e.exception_id}
                        sx={{ borderLeft: `3px solid ${toneColor(e.severity === 'critical' ? 'danger' : 'warn')}`, pl: 1 }}
                      >
                        <Typography sx={{ fontSize: 12, fontWeight: 700, textTransform: 'capitalize' }}>
                          {humanize(e.exception_type)}
                        </Typography>
                        <Typography sx={{ fontSize: 11, color: ct.textDim, lineHeight: 1.35 }}>
                          {e.process_area} · {e.next_action}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </CockpitCard>

                <CockpitCard>
                  <Typography sx={{ fontSize: 11, fontWeight: 800, color: ct.accent, mb: 0.6 }}>
                    AI SITE SUMMARY
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: ct.text, lineHeight: 1.45 }}>{aiSiteSummary}</Typography>
                </CockpitCard>
              </Stack>
            </Stack>
          </Box>
        ) : null}

        {page === 1 ? (
          <Box
            sx={{
              height: '100%',
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1.2fr 1fr' },
              gap: 1.2,
            }}
          >
            <CockpitCard sx={{ overflow: 'auto' }}>
              <Typography sx={{ fontSize: 11, fontWeight: 800, color: ct.textMuted, mb: 1.2 }}>
                JOURNEY HEATMAP · PRESERVED FROM E2E CT
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                  gap: 1,
                }}
              >
                {logisticsData.journey_heatmap.map((s) => {
                  const tone =
                    s.level === 'red' ? 'danger' : s.level === 'yellow' ? 'warn' : ('ok' as const);
                  return (
                    <Box
                      key={s.step_id}
                      sx={{
                        p: 1.2,
                        borderRadius: 1,
                        border: `1px solid ${ct.border}`,
                        bgcolor: ct.bg,
                      }}
                    >
                      <Stack direction="row" spacing={1} alignItems="center">
                        <StatusBar tone={tone} height={28} />
                        <Box>
                          <Typography sx={{ fontSize: 12, fontWeight: 800 }}>{s.label}</Typography>
                          <Typography sx={{ fontSize: 18, fontFamily: ct.mono, fontWeight: 700 }}>
                            {s.open_count}
                          </Typography>
                          <Typography sx={{ fontSize: 10, color: ct.textDim }}>
                            {s.sla_status} · {s.aging_hours}h aging
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>
                  );
                })}
              </Box>
            </CockpitCard>

            <Stack spacing={1.2} sx={{ minHeight: 0 }}>
              <CockpitCard sx={{ flex: 1, overflow: 'auto' }}>
                <Typography sx={{ fontSize: 11, fontWeight: 800, color: ct.textMuted, mb: 1 }}>
                  CRITICAL MATERIALS
                </Typography>
                <Stack spacing={1}>
                  {logisticsData.critical_materials.map((m) => (
                    <Box key={m.lot} sx={{ p: 1, bgcolor: ct.bg, borderRadius: 1, border: `1px solid ${ct.border}` }}>
                      <Typography sx={{ fontSize: 13, fontWeight: 800 }}>
                        {m.sku} · {m.lot}
                      </Typography>
                      <Typography sx={{ fontSize: 11, color: ct.textDim }}>{m.impact}</Typography>
                    </Box>
                  ))}
                </Stack>
              </CockpitCard>
              <CockpitCard>
                <Typography sx={{ fontSize: 11, fontWeight: 800, color: ct.textMuted, mb: 1 }}>
                  LEADERSHIP KPIs
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1 }}>
                  {[
                    { l: 'Quarantine aging', v: `${k.quarantine_aging_avg_days}d` },
                    { l: 'QA lead time', v: `${k.qa_release_lead_time_hours}h` },
                    { l: 'Loads at provider', v: k.loads_at_provider },
                    { l: 'Pledge today', v: k.pledge_due_today },
                    { l: 'Backorders', v: k.open_backorders },
                    { l: 'Staging cap.', v: `${k.receiving_capacity_pct}%` },
                  ].map((x) => (
                    <Box key={x.l}>
                      <Typography sx={{ fontSize: 10, color: ct.textDim }}>{x.l}</Typography>
                      <Typography sx={{ fontSize: 18, fontWeight: 700, fontFamily: ct.mono }}>{x.v}</Typography>
                    </Box>
                  ))}
                </Box>
              </CockpitCard>
            </Stack>
          </Box>
        ) : null}

        {page === 2 ? (
          <Box
            sx={{
              height: '100%',
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' },
              gap: 1.2,
            }}
          >
            {logisticsData.wip_lanes.map((w) => {
              const tone =
                w.status === 'blocked' ? 'danger' : w.status === 'waiting' ? 'warn' : ('ok' as const);
              return (
                <CockpitCard key={w.machine_id} onClick={() => go('wip_control_tower')}>
                  <Typography sx={{ fontSize: 11, color: toneColor(tone), fontWeight: 800, textTransform: 'uppercase' }}>
                    {w.status}
                  </Typography>
                  <Typography sx={{ fontSize: 16, fontWeight: 800, mt: 0.6 }}>{w.name}</Typography>
                  <Typography sx={{ fontSize: 11, color: ct.textDim, mt: 0.4 }}>
                    {w.job_id} · SKU {w.material}
                  </Typography>
                  <Typography sx={{ fontSize: 12, mt: 1 }}>{w.note}</Typography>
                  <Box sx={{ mt: 1.5 }}>
                    <Sparkline
                      values={tone === 'ok' ? [2, 2, 3, 3, 3, 4] : [4, 3, 4, 5, 4, 5]}
                      tone={tone}
                    />
                  </Box>
                </CockpitCard>
              );
            })}
            <CockpitCard sx={{ gridColumn: { md: 'span 2' } }} onClick={() => go('machine_status')}>
              <Typography sx={{ fontSize: 11, fontWeight: 800, color: ct.textMuted }}>
                RELATED · MACHINE MATERIAL STATUS
              </Typography>
              <Typography sx={{ fontSize: 14, mt: 1 }}>
                Open shop-floor board for clean-line bags, readiness %, and material call-offs (IN02).
              </Typography>
            </CockpitCard>
            <CockpitCard sx={{ gridColumn: { md: 'span 2' } }} onClick={() => go('quality_release')}>
              <Typography sx={{ fontSize: 11, fontWeight: 800, color: ct.textMuted }}>
                RELATED · QUALITY RELEASE
              </Typography>
              <Typography sx={{ fontSize: 14, mt: 1 }}>
                {k.qa_hold_count} lots on hold — visibility only; human QA approval gate preserved.
              </Typography>
            </CockpitCard>
          </Box>
        ) : null}
      </Box>

      {/* Carousel chrome */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="center"
        spacing={1}
        sx={{ flexShrink: 0, py: 0.5 }}
      >
        <IconButton
          size="small"
          onClick={() => setPage((p) => (p + 2) % 3)}
          sx={{ color: ct.textMuted }}
          aria-label="Previous cockpit page"
        >
          <ChevronLeftIcon />
        </IconButton>
        {[0, 1, 2].map((i) => (
          <Box
            key={i}
            onClick={() => setPage(i)}
            sx={{
              width: i === page ? 18 : 8,
              height: 8,
              borderRadius: 4,
              bgcolor: i === page ? ct.accent : ct.borderStrong,
              cursor: 'pointer',
              transition: 'width 0.2s ease',
            }}
          />
        ))}
        <IconButton
          size="small"
          onClick={() => setPage((p) => (p + 1) % 3)}
          sx={{ color: ct.textMuted }}
          aria-label="Next cockpit page"
        >
          <ChevronRightIcon />
        </IconButton>
        <IconButton
          size="small"
          onClick={() => setCarouselOn((v) => !v)}
          sx={{ color: carouselOn ? ct.accent : ct.textMuted, ml: 1 }}
          aria-label={carouselOn ? 'Pause carousel' : 'Resume carousel'}
        >
          {carouselOn ? <PauseIcon fontSize="small" /> : <PlayArrowIcon fontSize="small" />}
        </IconButton>
        <Typography sx={{ fontSize: 10, color: ct.textDim, ml: 0.5 }}>
          {page === 0 ? 'Overall status' : page === 1 ? 'Journey & leadership' : 'WIP lane lens'}
        </Typography>
      </Stack>

      <KpiDrilldownModal open={Boolean(selectedKpi)} kpi={selectedKpi} onClose={() => setSelectedKpi(null)} />
    </Box>
  );
}
