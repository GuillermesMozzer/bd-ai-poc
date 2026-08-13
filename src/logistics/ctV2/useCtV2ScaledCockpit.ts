import { useMemo } from 'react';
import {
  aiSiteSummary,
  cockpitKpis,
  globalAlert,
  logisticsData,
  macroflows,
  type CockpitKpi,
  type MacroflowDef,
} from '../cockpit/macroflowModel';
import { useCtV2Filters } from './CtV2FiltersContext';

function scaleKpi(kpi: CockpitKpi, scaleCount: (n: number) => number, scaleSpark: (v: number[]) => number[]): CockpitKpi {
  const numeric = typeof kpi.value === 'number' ? kpi.value : Number(kpi.value);
  const nextValue = Number.isFinite(numeric) ? scaleCount(numeric) : kpi.value;
  return {
    ...kpi,
    value: nextValue,
    sparkline: scaleSpark(kpi.sparkline),
  };
}

function scaleMacro(
  m: MacroflowDef,
  scaleCount: (n: number) => number,
  scaleSpark: (v: number[]) => number[],
): MacroflowDef {
  const kpiNumeric = typeof m.kpiValue === 'number' ? m.kpiValue : Number(m.kpiValue);
  const secNumeric = typeof m.secondaryValue === 'number' ? m.secondaryValue : Number(m.secondaryValue);
  return {
    ...m,
    kpiValue: Number.isFinite(kpiNumeric) ? scaleCount(kpiNumeric) : m.kpiValue,
    secondaryValue: Number.isFinite(secNumeric) ? scaleCount(secNumeric) : m.secondaryValue,
    sparkline: scaleSpark(m.sparkline),
  };
}

/** Scaled CT dashboard metrics driven by site + frequency filters. */
export function useCtV2ScaledCockpit() {
  const { sites, frequency, sitesLabel, periodLabel, scaleCount, scaleSparkline, scaleDecimal } = useCtV2Filters();

  return useMemo(() => {
    const kpis = cockpitKpis.map((kpi) => scaleKpi(kpi, scaleCount, scaleSparkline));
    const macros = macroflows.map((m) => scaleMacro(m, scaleCount, scaleSparkline));
    const exec = logisticsData.executive_kpis;
    const scaledExec = {
      ...exec,
      inbound_today: scaleCount(exec.inbound_today),
      qa_hold_count: scaleCount(exec.qa_hold_count),
      dock_backlog: scaleCount(exec.dock_backlog),
      critical_exceptions: scaleCount(exec.critical_exceptions),
      shipments_not_ready: scaleCount(exec.shipments_not_ready),
      open_backorders: scaleCount(exec.open_backorders),
      loads_at_provider: scaleCount(exec.loads_at_provider),
      pledge_due_today: scaleCount(exec.pledge_due_today),
      quarantine_aging_avg_days: scaleDecimal(exec.quarantine_aging_avg_days, 1),
      qa_release_lead_time_hours: scaleDecimal(exec.qa_release_lead_time_hours, 0),
      receiving_capacity_pct: Math.min(99, scaleCount(exec.receiving_capacity_pct)),
    };

    const journey = logisticsData.journey_heatmap.map((s) => ({
      ...s,
      open_count: scaleCount(s.open_count),
      aging_hours: scaleDecimal(s.aging_hours, 0),
    }));

    const materials = logisticsData.critical_materials.map((m) => ({
      ...m,
      aging_hours: scaleDecimal(m.aging_hours, 0),
    }));

    const exceptions = logisticsData.exceptions.map((e) => ({
      ...e,
      age_hours: scaleDecimal(e.age_hours, 0),
    }));

    const alertMessage =
      `${scaledExec.critical_exceptions} critical exceptions · QA hold ${scaledExec.qa_hold_count} · ${scaledExec.shipments_not_ready} shipments not ready · receiving at ${scaledExec.receiving_capacity_pct}% · ${sitesLabel} · ${periodLabel}`;

    const summary =
      `${aiSiteSummary} Scope: ${sitesLabel}. Horizon: ${periodLabel} (${frequency}).`;

    return {
      sites,
      frequency,
      sitesLabel,
      periodLabel,
      kpis,
      macros,
      exec: scaledExec,
      journey,
      materials,
      exceptions,
      wipLanes: logisticsData.wip_lanes,
      sterilLoads: logisticsData.sterilization_loads,
      shipments: logisticsData.outbound_shipments,
      alert: {
        ...globalAlert,
        title: `${globalAlert.title} · ${sitesLabel}`,
        message: alertMessage,
      },
      summary,
      scaleCount,
      scaleSparkline,
      scaleDecimal,
    };
  }, [sites, frequency, sitesLabel, periodLabel, scaleCount, scaleSparkline, scaleDecimal]);
}
