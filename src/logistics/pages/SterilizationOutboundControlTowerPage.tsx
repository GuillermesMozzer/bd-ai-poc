import React, { useMemo, useState } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useWorkstationContext } from '../../workstation/contexts/WorkstationContext';
import { CockpitCard, Sparkline, StatusBar } from '../cockpit/Sparkline';
import { BigKpiCard } from '../cockpit/CockpitCards';
import { ct, toneColor, type CtTone } from '../cockpit/cockpitTheme';
import KpiDrilldownModal from '../cockpit/KpiDrilldownModal';
import {
  cockpitKpis,
  logisticsData,
  macroflows,
  type CockpitKpi,
} from '../cockpit/macroflowModel';
import { fmtTime, humanize } from '../utils';

type UnitCard = {
  id: string;
  title: string;
  tone: CtTone;
  health: number;
  util: number;
  secondaryLabel: string;
  secondaryValue: string | number;
  spark: number[];
  screen: 'sterilization_tracker' | 'shipment_readiness' | 'quality_release';
};

export default function SterilizationOutboundControlTowerPage() {
  const { setCurrentScreen } = useWorkstationContext();
  const [kpi, setKpi] = useState<CockpitKpi | null>(null);

  const outboundMacros = macroflows.filter((m) => m.area === 'outbound');
  const outboundKpis = cockpitKpis.filter((x) => ['OB01', 'OB02', 'OB03'].includes(x.macroflow));

  const units = useMemo<UnitCard[]>(() => {
    const steril = logisticsData.sterilization_loads.map((l) => {
      const tone: CtTone =
        l.sla_risk === 'late' ? 'danger' : l.sla_risk === 'at_risk' ? 'warn' : 'ok';
      return {
        id: l.sterilization_load_id,
        title: l.sterilization_load_id,
        tone,
        health: tone === 'danger' ? 42 : tone === 'warn' ? 68 : 88,
        util: Math.min(99, 40 + l.pallets_count * 4),
        secondaryLabel: 'Pallets',
        secondaryValue: l.pallets_count,
        spark: [2, 3, 3, 4, 3, l.pallets_count],
        screen: 'sterilization_tracker' as const,
      };
    });

    const ships = logisticsData.outbound_shipments.slice(0, 4).map((s) => {
      const tone: CtTone = s.readiness_pct < 60 ? 'danger' : s.readiness_pct < 90 ? 'warn' : 'ok';
      return {
        id: s.outbound_shipment_id,
        title: `${s.sales_order_id}`,
        tone,
        health: s.readiness_pct,
        util: s.readiness_pct,
        secondaryLabel: s.priority_tier,
        secondaryValue: `${s.cases_open} cases`,
        spark: [40, 50, 55, 60, 70, s.readiness_pct],
        screen: 'shipment_readiness' as const,
      };
    });

    return [...steril, ...ships];
  }, []);

  const severity = {
    alert: units.filter((u) => u.tone === 'danger' || u.tone === 'warn'),
    normal: units.filter((u) => u.tone === 'ok'),
  };

  return (
    <Box
      sx={{
        flexGrow: 1,
        height: '100%',
        overflow: 'hidden',
        bgcolor: ct.bg,
        color: ct.text,
        fontFamily: ct.font,
        display: 'flex',
        flexDirection: 'column',
        p: { xs: 1, md: 1.5 },
        gap: 1.2,
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
        <Stack direction="row" alignItems="center" spacing={1.2}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => setCurrentScreen('logistics_control_tower')}
            sx={{ color: ct.accent, textTransform: 'none', fontWeight: 700 }}
          >
            Logistics Control Tower
          </Button>
          <Box>
            <Typography sx={{ fontSize: 11, color: ct.textDim, letterSpacing: '0.08em' }}>
              LEVEL 2 · AREA DRILL-DOWN · OB01 · OB02 · OB03
            </Typography>
            <Typography sx={{ fontSize: 20, fontWeight: 800 }}>
              Sterilization / Outbound Control Tower
            </Typography>
          </Box>
        </Stack>
        <Typography sx={{ fontSize: 11, color: ct.textDim }}>
          As of {fmtTime(logisticsData.as_of)} · preserves steril tracker + shipment readiness content
        </Typography>
      </Stack>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
          gap: 1,
          flexShrink: 0,
        }}
      >
        {outboundKpis.map((item) => (
          <BigKpiCard
            key={item.id}
            label={item.label}
            value={item.value}
            unit={item.unit}
            target={item.target}
            delta={item.delta}
            tone={item.tone}
            sparkline={item.sparkline}
            onOpen={() => setKpi(item)}
          />
        ))}
      </Box>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1fr 2fr' },
          gap: 1.2,
        }}
      >
        <Stack spacing={1} sx={{ minHeight: 0, overflow: 'auto' }}>
          <Typography
            sx={{
              fontSize: 12,
              fontWeight: 800,
              color: ct.danger,
              borderBottom: `2px solid ${ct.danger}`,
              pb: 0.4,
              width: 'fit-content',
            }}
          >
            Severity alert
          </Typography>
          {severity.alert.map((u) => (
            <UnitStatusCard key={u.id} unit={u} onGo={() => setCurrentScreen(u.screen)} />
          ))}
          {!severity.alert.length ? (
            <Typography sx={{ fontSize: 12, color: ct.textDim }}>No severity alert units.</Typography>
          ) : null}
        </Stack>

        <Stack spacing={1} sx={{ minHeight: 0, overflow: 'auto' }}>
          <Typography
            sx={{
              fontSize: 12,
              fontWeight: 800,
              color: ct.textMuted,
              borderBottom: `2px solid ${ct.borderStrong}`,
              pb: 0.4,
              width: 'fit-content',
            }}
          >
            Normal
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: 1,
            }}
          >
            {severity.normal.map((u) => (
              <UnitStatusCard key={u.id} unit={u} onGo={() => setCurrentScreen(u.screen)} />
            ))}
          </Box>

          <CockpitCard>
            <Typography sx={{ fontSize: 11, fontWeight: 800, color: ct.accent, mb: 0.6 }}>
              AI AREA INSIGHT
            </Typography>
            <Typography sx={{ fontSize: 12, lineHeight: 1.45 }}>
              {outboundMacros.map((m) => m.insight).join(' ')} Traceability back to Level 1 macroflow
              indicators is preserved via OB01/OB02/OB03 healthscores.
            </Typography>
          </CockpitCard>

          <CockpitCard>
            <Typography sx={{ fontSize: 11, fontWeight: 800, color: ct.textMuted, mb: 0.8 }}>
              OPEN EXCEPTIONS (OUTBOUND)
            </Typography>
            <Stack spacing={0.8}>
              {logisticsData.exceptions
                .filter((e) => /steril|ship|outbound|fg/i.test(`${e.process_area} ${e.exception_type}`))
                .map((e) => (
                  <Typography key={e.exception_id} sx={{ fontSize: 12 }}>
                    <strong style={{ textTransform: 'capitalize' }}>{humanize(e.exception_type)}</strong>
                    {' — '}
                    {e.next_action}
                  </Typography>
                ))}
            </Stack>
          </CockpitCard>
        </Stack>
      </Box>

      <KpiDrilldownModal open={Boolean(kpi)} kpi={kpi} onClose={() => setKpi(null)} />
    </Box>
  );
}

function UnitStatusCard({ unit, onGo }: { unit: UnitCard; onGo: () => void }) {
  return (
    <CockpitCard>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Typography sx={{ fontSize: 14, fontWeight: 800 }}>{unit.title}</Typography>
        <Box
          component="button"
          onClick={onGo}
          sx={{
            border: `1px solid ${ct.borderStrong}`,
            bgcolor: 'transparent',
            color: ct.accent,
            fontSize: 10,
            fontWeight: 700,
            px: 1,
            py: 0.4,
            borderRadius: 0.8,
            cursor: 'pointer',
          }}
        >
          GO TO UNIT VIEW →
        </Box>
      </Stack>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mt: 1.2 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <StatusBar tone={unit.tone} />
          <Box>
            <Typography sx={{ fontSize: 10, color: ct.textMuted }}>Healthscore %</Typography>
            <Typography sx={{ fontSize: 20, fontWeight: 700, color: toneColor(unit.tone), fontFamily: ct.mono }}>
              {Math.round(unit.health)}
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center">
          <StatusBar tone={unit.util < 60 ? 'danger' : 'ok'} />
          <Box>
            <Typography sx={{ fontSize: 10, color: ct.textMuted }}>Readiness / util %</Typography>
            <Typography sx={{ fontSize: 20, fontWeight: 700, fontFamily: ct.mono }}>
              {Math.round(unit.util)}
            </Typography>
          </Box>
        </Stack>
      </Box>
      <Stack direction="row" alignItems="flex-end" spacing={1} sx={{ mt: 1 }}>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontSize: 10, color: ct.textMuted }}>{unit.secondaryLabel}</Typography>
          <Typography sx={{ fontSize: 16, fontWeight: 700 }}>{unit.secondaryValue}</Typography>
        </Box>
        <Box sx={{ width: 100 }}>
          <Sparkline values={unit.spark} tone={unit.tone} />
        </Box>
      </Stack>
    </CockpitCard>
  );
}
