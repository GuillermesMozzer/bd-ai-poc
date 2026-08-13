import React, { useMemo, useState } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import { ArrowRight } from 'lucide-react';
import type { AppScreen } from '../../navigation/navigationConfig';
import type { CtTone } from '../cockpit/cockpitTheme';
import KpiDrilldownModal from '../cockpit/KpiDrilldownModal';
import {
  cockpitKpis,
  logisticsData,
  macroflows,
  type CockpitKpi,
} from '../cockpit/macroflowModel';
import { humanize } from '../utils';
import { ctV2Type, tokenBrand, tokenError, tokenText } from '../ctV2Theme';
import {
  CtV2InsetCard,
  CtV2WidgetShell,
  SparklineV2,
  StatusBarV2,
  toneColorV2,
} from '../ctV2/CtV2Visuals';
import { useWorkstationContext } from '../../workstation/contexts/WorkstationContext';

type UnitCard = {
  id: string;
  title: string;
  tone: CtTone;
  health: number;
  util: number;
  secondaryLabel: string;
  secondaryValue: string | number;
  spark: number[];
  screen: AppScreen;
};

function useOutboundUnits(): UnitCard[] {
  return useMemo(() => {
    const steril = logisticsData.sterilization_loads.map((l) => {
      const tone: CtTone = l.sla_risk === 'late' ? 'danger' : l.sla_risk === 'at_risk' ? 'warn' : 'ok';
      return {
        id: l.sterilization_load_id,
        title: l.sterilization_load_id,
        tone,
        health: tone === 'danger' ? 42 : tone === 'warn' ? 68 : 88,
        util: Math.min(99, 40 + l.pallets_count * 4),
        secondaryLabel: 'Pallets',
        secondaryValue: l.pallets_count,
        spark: [2, 3, 3, 4, 3, l.pallets_count],
        screen: 'sterilization_tracker' as AppScreen,
      };
    });
    const ships = logisticsData.outbound_shipments.slice(0, 4).map((s) => {
      const tone: CtTone = s.readiness_pct < 60 ? 'danger' : s.readiness_pct < 90 ? 'warn' : 'ok';
      return {
        id: s.outbound_shipment_id,
        title: s.sales_order_id,
        tone,
        health: s.readiness_pct,
        util: s.readiness_pct,
        secondaryLabel: s.priority_tier,
        secondaryValue: `${s.cases_open} cases`,
        spark: [40, 50, 55, 60, 70, s.readiness_pct],
        screen: 'shipment_readiness' as AppScreen,
      };
    });
    return [...steril, ...ships];
  }, []);
}

function UnitCardBody({ unit }: { unit: UnitCard }) {
  const { setCurrentScreen } = useWorkstationContext();
  return (
    <CtV2InsetCard>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
        <Typography sx={{ ...ctV2Type.body, fontWeight: 800 }}>{unit.title}</Typography>
        <Button
          size="small"
          variant="outlined"
          endIcon={<ArrowRight size={12} />}
          onClick={() => setCurrentScreen(unit.screen)}
          sx={{
            fontSize: 10,
            fontWeight: 800,
            textTransform: 'none',
            borderRadius: 999,
            px: 1.1,
            color: tokenBrand.main,
            borderColor: tokenBrand.light,
          }}
        >
          Unit
        </Button>
      </Stack>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mt: 1 }}>
        <Stack direction="row" spacing={0.75} alignItems="center">
          <StatusBarV2 tone={unit.tone} height={28} />
          <Box>
            <Typography sx={{ fontSize: 9, fontWeight: 700, color: tokenText.secondary, textTransform: 'uppercase' }}>
              Health %
            </Typography>
            <Typography sx={{ fontSize: 18, fontWeight: 800, color: toneColorV2(unit.tone) }}>
              {Math.round(unit.health)}
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={0.75} alignItems="center">
          <StatusBarV2 tone={unit.util < 60 ? 'danger' : 'ok'} height={28} />
          <Box>
            <Typography sx={{ fontSize: 9, fontWeight: 700, color: tokenText.secondary, textTransform: 'uppercase' }}>
              Ready / util %
            </Typography>
            <Typography sx={{ fontSize: 18, fontWeight: 800, color: tokenText.primary }}>
              {Math.round(unit.util)}
            </Typography>
          </Box>
        </Stack>
      </Box>
      <Stack direction="row" alignItems="flex-end" justifyContent="space-between" sx={{ mt: 1 }}>
        <Box>
          <Typography sx={{ fontSize: 9, fontWeight: 700, color: tokenText.secondary, textTransform: 'uppercase' }}>
            {unit.secondaryLabel}
          </Typography>
          <Typography sx={{ fontSize: 15, fontWeight: 800 }}>{unit.secondaryValue}</Typography>
        </Box>
        <Box sx={{ width: 88 }}>
          <SparklineV2 values={unit.spark} tone={unit.tone} height={26} />
        </Box>
      </Stack>
    </CtV2InsetCard>
  );
}

export function CtV2OutboundKpiStripWidget() {
  const outboundKpis = cockpitKpis.filter((x) => ['OB01', 'OB02', 'OB03'].includes(x.macroflow));
  const [selected, setSelected] = useState<CockpitKpi | null>(null);

  return (
    <>
      <CtV2WidgetShell title="Outbound KPIs" subtitle="OB01 · OB02 · OB03 · steril network & shipping">
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 1 }}>
          {outboundKpis.map((kpi) => (
            <CtV2InsetCard key={kpi.id} onClick={() => setSelected(kpi)} sx={{ borderTop: `3px solid ${toneColorV2(kpi.tone)}` }}>
              <Typography sx={{ ...ctV2Type.caption, color: tokenText.secondary, textTransform: 'uppercase' }}>
                {kpi.macroflow} · {kpi.label}
              </Typography>
              <Stack direction="row" alignItems="baseline" spacing={0.5} mt={0.5}>
                <Typography sx={{ fontSize: 26, fontWeight: 800, color: tokenText.primary }}>{kpi.value}</Typography>
                <Typography sx={{ ...ctV2Type.caption, color: tokenText.secondary }}>{kpi.unit}</Typography>
              </Stack>
              <Typography sx={{ ...ctV2Type.caption, color: toneColorV2(kpi.tone), fontWeight: 700 }}>{kpi.delta}</Typography>
              <Box sx={{ mt: 0.75 }}>
                <SparklineV2 values={kpi.sparkline} tone={kpi.tone} height={28} />
              </Box>
            </CtV2InsetCard>
          ))}
        </Box>
      </CtV2WidgetShell>
      <KpiDrilldownModal open={Boolean(selected)} kpi={selected} onClose={() => setSelected(null)} />
    </>
  );
}

export function CtV2OutboundAlertUnitsWidget() {
  const units = useOutboundUnits();
  const alert = units.filter((u) => u.tone === 'danger' || u.tone === 'warn');

  return (
    <CtV2WidgetShell title="Severity Alert" subtitle="Loads and shipments at risk">
      <Stack spacing={1}>
        {alert.length === 0 ? (
          <Typography sx={{ ...ctV2Type.caption, color: tokenText.secondary }}>No severity alert units.</Typography>
        ) : (
          alert.map((u) => <UnitCardBody key={u.id} unit={u} />)
        )}
      </Stack>
    </CtV2WidgetShell>
  );
}

export function CtV2OutboundNormalUnitsWidget() {
  const units = useOutboundUnits();
  const normal = units.filter((u) => u.tone === 'ok');

  return (
    <CtV2WidgetShell title="On Track" subtitle="Normal steril loads & shipments">
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 1 }}>
        {normal.map((u) => (
          <UnitCardBody key={u.id} unit={u} />
        ))}
      </Box>
    </CtV2WidgetShell>
  );
}

export function CtV2OutboundAiInsightWidget() {
  const outboundMacros = macroflows.filter((m) => m.area === 'outbound');
  return (
    <CtV2WidgetShell title="ATLAS Area Insight" subtitle="OB01–OB03 narrative">
      <Box
        sx={{
          p: 1.5,
          borderRadius: 2,
          bgcolor: tokenBrand.softBg,
          border: `1px solid ${tokenBrand.light}`,
        }}
      >
        <Typography sx={{ ...ctV2Type.body, color: tokenText.primary, lineHeight: 1.55 }}>
          {outboundMacros.map((m) => m.insight).join(' ')} Traceability back to Level 1 macroflow
          indicators is preserved via OB01/OB02/OB03 healthscores.
        </Typography>
      </Box>
    </CtV2WidgetShell>
  );
}

export function CtV2OutboundExceptionsWidget() {
  const rows = logisticsData.exceptions.filter((e) =>
    /steril|ship|outbound|fg/i.test(`${e.process_area} ${e.exception_type}`),
  );

  return (
    <CtV2WidgetShell title="Outbound Exceptions" subtitle="Steril, shipping, FG">
      <Stack spacing={1}>
        {rows.map((e) => (
          <Box
            key={e.exception_id}
            sx={{
              pl: 1.25,
              py: 0.5,
              borderLeft: `3px solid ${e.severity === 'critical' ? tokenError.main : tokenBrand.main}`,
            }}
          >
            <Typography sx={{ ...ctV2Type.body, fontWeight: 800, textTransform: 'capitalize' }}>
              {humanize(e.exception_type)}
            </Typography>
            <Typography sx={{ ...ctV2Type.caption, color: tokenText.secondary }}>{e.next_action}</Typography>
          </Box>
        ))}
      </Stack>
    </CtV2WidgetShell>
  );
}

export const CT_V2_OUTBOUND_WIDGET_IDS = [
  'ob_kpis',
  'ob_alert',
  'ob_normal',
  'ob_insight',
  'ob_exceptions',
] as const;

export type CtV2OutboundWidgetId = (typeof CT_V2_OUTBOUND_WIDGET_IDS)[number];

export const CT_V2_OUTBOUND_WIDGET_TITLES: Record<CtV2OutboundWidgetId, string> = {
  ob_kpis: 'Outbound KPIs',
  ob_alert: 'Severity Alert',
  ob_normal: 'On Track',
  ob_insight: 'ATLAS Insight',
  ob_exceptions: 'Outbound Exceptions',
};

export function renderCtV2OutboundWidget(id: CtV2OutboundWidgetId) {
  switch (id) {
    case 'ob_kpis':
      return <CtV2OutboundKpiStripWidget />;
    case 'ob_alert':
      return <CtV2OutboundAlertUnitsWidget />;
    case 'ob_normal':
      return <CtV2OutboundNormalUnitsWidget />;
    case 'ob_insight':
      return <CtV2OutboundAiInsightWidget />;
    case 'ob_exceptions':
      return <CtV2OutboundExceptionsWidget />;
    default:
      return null;
  }
}
