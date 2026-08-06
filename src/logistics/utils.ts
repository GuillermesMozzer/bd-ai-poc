export type SlaRisk = 'on_track' | 'at_risk' | 'late';
export type Severity = 'critical' | 'high' | 'medium' | 'low';
export type KpiTone = 'default' | 'ok' | 'warn' | 'danger';

export function fmtTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export function fmtDuration(minutes: number | null | undefined): string {
  if (minutes == null || Number.isNaN(minutes)) return '—';
  const abs = Math.abs(minutes);
  if (abs < 60) return `${Math.round(abs)}m`;
  const h = Math.floor(abs / 60);
  const m = Math.round(abs % 60);
  if (h < 48) return m ? `${h}h ${m}m` : `${h}h`;
  const d = Math.floor(h / 24);
  const rh = h % 24;
  return rh ? `${d}d ${rh}h` : `${d}d`;
}

export function humanize(value: string): string {
  return value.replace(/_/g, ' ');
}

export function slaTone(status: SlaRisk | string): KpiTone {
  if (status === 'late') return 'danger';
  if (status === 'at_risk') return 'warn';
  if (status === 'on_track') return 'ok';
  return 'default';
}

export function severityTone(severity: Severity | string): KpiTone {
  if (severity === 'critical' || severity === 'high') return 'danger';
  if (severity === 'medium') return 'warn';
  return 'default';
}

export function heatTone(level: string): KpiTone {
  if (level === 'red') return 'danger';
  if (level === 'yellow') return 'warn';
  if (level === 'green') return 'ok';
  return 'default';
}
